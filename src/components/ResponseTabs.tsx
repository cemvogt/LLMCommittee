'use client';

import { useState } from 'react';
import { LLMResponse, ReviewResponse } from '@/lib/types';

interface ResponseTabsProps {
  responses: LLMResponse[];
  reviews: ReviewResponse[];
}

export default function ResponseTabs({ responses, reviews }: ResponseTabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  const getAverageRank = (modelId: string): number => {
    const ranks: number[] = [];

    reviews.forEach(review => {
      review.rankings.forEach(ranking => {
        const originalModelName = (ranking as any).originalModelName;
        const targetResponse = responses.find(r => r.modelName === originalModelName);
        if (targetResponse && targetResponse.modelId === modelId) {
          ranks.push(ranking.rank);
        }
      });
    });

    if (ranks.length === 0) return 0;
    return ranks.reduce((a, b) => a + b, 0) / ranks.length;
  };

  // Sort responses by average rank
  const sortedResponses = [...responses].sort((a, b) => {
    const avgRankA = getAverageRank(a.modelId);
    const avgRankB = getAverageRank(b.modelId);
    if (avgRankA === 0) return 1;
    if (avgRankB === 0) return -1;
    return avgRankA - avgRankB;
  });

  const activeResponse = sortedResponses[activeTab];

  // Get reviews for active response
  const getReviewsForResponse = (modelId: string) => {
    const reviewList: Array<{ reviewer: string; rank: number; reasoning: string }> = [];

    reviews.forEach(review => {
      review.rankings.forEach(ranking => {
        const originalModelName = (ranking as any).originalModelName;
        const targetResponse = responses.find(r => r.modelName === originalModelName);
        if (targetResponse && targetResponse.modelId === modelId) {
          reviewList.push({
            reviewer: review.reviewerName,
            rank: ranking.rank,
            reasoning: ranking.reasoning,
          });
        }
      });
    });

    return reviewList;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b border-gray-200">
        <div className="px-6 py-3">
          <h3 className="text-sm font-semibold text-gray-500">INDIVIDUAL COUNCIL RESPONSES</h3>
        </div>
        <div className="flex overflow-x-auto">
          {sortedResponses.map((response, index) => {
            const avgRank = getAverageRank(response.modelId);
            return (
              <button
                key={response.modelId}
                onClick={() => setActiveTab(index)}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === index
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {response.modelName}
                {avgRank > 0 && (
                  <span className="ml-2 text-xs text-gray-500">
                    (Avg rank: {avgRank.toFixed(1)})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        {/* Response Content */}
        <div className="prose max-w-none mb-6">
          <div className="whitespace-pre-wrap text-gray-900">{activeResponse.response}</div>
        </div>

        {/* Peer Reviews */}
        {reviews.length > 0 && (
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Peer Reviews</h4>
            <div className="space-y-3">
              {getReviewsForResponse(activeResponse.modelId).map((review, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{review.reviewer}</span>
                    <span className="text-sm font-semibold text-primary-600">
                      Rank #{review.rank}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{review.reasoning}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
