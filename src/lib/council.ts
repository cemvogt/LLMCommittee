import { LLMConfig, LLMResponse, ReviewResponse, RankingEntry } from './types';
import { getOpenRouterClient } from './openrouter';

/**
 * Stage 1: Get initial responses from all LLMs in parallel
 */
export async function getFirstOpinions(
  query: string,
  committee: LLMConfig[]
): Promise<LLMResponse[]> {
  const client = getOpenRouterClient();

  // Query all models in parallel
  const promises = committee.map(async (member) => {
    try {
      const response = await client.getModelResponse(member.model, [
        {
          role: 'user',
          content: query,
        },
      ]);

      return {
        modelId: member.id,
        modelName: member.name,
        response,
        timestamp: Date.now(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error getting response from ${member.name}:`, errorMessage);
      return {
        modelId: member.id,
        modelName: member.name,
        response: `Error: Failed to get response from ${member.name}. ${errorMessage}`,
        timestamp: Date.now(),
      };
    }
  });

  return Promise.all(promises);
}

/**
 * Anonymize responses for fair review
 * Returns a mapping of anonymous IDs to model IDs
 */
function anonymizeResponses(responses: LLMResponse[]): {
  anonymizedMap: Map<string, string>;
  anonymizedResponses: Array<{ id: string; content: string }>;
} {
  const anonymizedMap = new Map<string, string>();
  const anonymizedResponses: Array<{ id: string; content: string }> = [];

  // Shuffle responses to avoid position bias
  const shuffled = [...responses].sort(() => Math.random() - 0.5);

  shuffled.forEach((response, index) => {
    const anonymousId = `Response ${String.fromCharCode(65 + index)}`; // A, B, C, etc.
    anonymizedMap.set(anonymousId, response.modelId);
    anonymizedResponses.push({
      id: anonymousId,
      content: response.response,
    });
  });

  return { anonymizedMap, anonymizedResponses };
}

/**
 * Stage 2: Have each LLM review and rank all responses (including their own, anonymized)
 */
export async function getReviews(
  query: string,
  responses: LLMResponse[],
  committee: LLMConfig[]
): Promise<ReviewResponse[]> {
  const client = getOpenRouterClient();
  const { anonymizedMap, anonymizedResponses } = anonymizeResponses(responses);

  // Create the review prompt
  const createReviewPrompt = (originalQuery: string, responses: Array<{ id: string; content: string }>) => {
    const responsesText = responses
      .map(r => `${r.id}:\n${r.content}\n`)
      .join('\n---\n\n');

    return `Original Question: ${originalQuery}

Below are ${responses.length} different responses to this question. Please carefully review each response and rank them from best to worst based on:
1. Accuracy of information
2. Depth of insight
3. Clarity and organization
4. Completeness

${responsesText}

Please provide your ranking in the following JSON format:
{
  "rankings": [
    {
      "anonymousId": "Response A",
      "rank": 1,
      "reasoning": "Brief explanation of why this is ranked first"
    },
    {
      "anonymousId": "Response B",
      "rank": 2,
      "reasoning": "Brief explanation of why this is ranked second"
    }
  ]
}

Be objective and critical. Provide your ranking as valid JSON only.`;
  };

  const reviewPrompt = createReviewPrompt(query, anonymizedResponses);

  // Get reviews from all committee members in parallel
  const promises = committee.map(async (member) => {
    try {
      const response = await client.getModelResponse(member.model, [
        {
          role: 'user',
          content: reviewPrompt,
        },
      ]);

      // Parse the JSON response
      let rankings: RankingEntry[] = [];
      try {
        // Extract JSON from response (handle markdown code blocks)
        let jsonStr = response.trim();
        if (jsonStr.includes('```json')) {
          jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
        } else if (jsonStr.includes('```')) {
          jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
        }

        const parsed = JSON.parse(jsonStr);
        rankings = parsed.rankings || [];
      } catch (parseError) {
        console.error(`Error parsing rankings from ${member.name}:`, parseError);
        // Create default rankings if parsing fails
        rankings = anonymizedResponses.map((r, i) => ({
          anonymousId: r.id,
          rank: i + 1,
          reasoning: 'Unable to parse review',
        }));
      }

      return {
        reviewerId: member.id,
        reviewerName: member.name,
        rankings,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error getting review from ${member.name}:`, errorMessage);
      // Return empty rankings on error
      return {
        reviewerId: member.id,
        reviewerName: member.name,
        rankings: [],
      };
    }
  });

  const reviews = await Promise.all(promises);

  // De-anonymize the rankings (for transparency)
  reviews.forEach(review => {
    review.rankings.forEach(ranking => {
      const originalModelId = anonymizedMap.get(ranking.anonymousId);
      if (originalModelId) {
        const originalModel = responses.find(r => r.modelId === originalModelId);
        if (originalModel) {
          (ranking as any).originalModelName = originalModel.modelName;
        }
      }
    });
  });

  return reviews;
}

/**
 * Stage 3: Chairman compiles final response based on all opinions and reviews
 */
export async function getChairmanResponse(
  query: string,
  responses: LLMResponse[],
  reviews: ReviewResponse[],
  chairman: LLMConfig
): Promise<string> {
  const client = getOpenRouterClient();

  // Build comprehensive context for chairman
  const responsesText = responses
    .map(r => `${r.modelName}:\n${r.response}\n`)
    .join('\n---\n\n');

  const reviewsText = reviews
    .map(review => {
      const rankingsText = review.rankings
        .map(r => `  ${r.rank}. ${(r as any).originalModelName || r.anonymousId}: ${r.reasoning}`)
        .join('\n');
      return `${review.reviewerName}'s Rankings:\n${rankingsText}`;
    })
    .join('\n\n');

  const chairmanPrompt = `You are the Chairman of an AI Committee. Your role is to synthesize multiple AI perspectives into a single, comprehensive, and accurate response.

Original Question: ${query}

COMMITTEE RESPONSES:
${responsesText}

PEER REVIEWS:
${reviewsText}

As Chairman, your task is to:
1. Consider all committee members' responses
2. Take into account the peer review rankings and reasoning
3. Identify the most accurate and insightful points
4. Reconcile any disagreements or contradictions
5. Synthesize everything into a single, comprehensive final answer

Provide a well-structured, authoritative response that represents the best collective wisdom of the committee. Do not mention that you are synthesizing responses - simply provide the final answer as if it were your own expertise.`;

  try {
    const finalResponse = await client.getModelResponse(chairman.model, [
      {
        role: 'user',
        content: chairmanPrompt,
      },
    ]);

    return finalResponse;
  } catch (error) {
    console.error('Error getting chairman response:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to generate chairman response: ${errorMessage}`);
  }
}

/**
 * Run the complete committee process
 */
export async function runCommittee(
  query: string,
  committee: LLMConfig[]
): Promise<{
  responses: LLMResponse[];
  reviews: ReviewResponse[];
  finalResponse: string;
  chairman: LLMConfig;
}> {
  // Stage 1: Get first opinions
  console.log('Stage 1: Getting first opinions...');
  const responses = await getFirstOpinions(query, committee);

  // Stage 2: Get reviews
  console.log('Stage 2: Getting peer reviews...');
  const reviews = await getReviews(query, responses, committee);

  // Stage 3: Get chairman's final response
  console.log('Stage 3: Getting chairman response...');
  const chairman = committee.find(c => c.isChairman)!;
  const finalResponse = await getChairmanResponse(query, responses, reviews, chairman);

  return {
    responses,
    reviews,
    finalResponse,
    chairman,
  };
}
