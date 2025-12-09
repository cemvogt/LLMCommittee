# LLM Council

A collaborative AI system where multiple Large Language Models work together to provide the best possible answers. Instead of relying on a single AI model, LLM Council gathers opinions from multiple state-of-the-art models, has them review and rank each other's work, and synthesizes a final comprehensive response.

## How It Works

### Stage 1: First Opinions
When you submit a query, it's sent to all council members simultaneously. Each LLM provides its independent response without seeing others' answers. This ensures diverse perspectives and approaches to your question.

### Stage 2: Peer Review
Each council member reviews all responses (including their own, anonymized to prevent bias). They rank the responses based on:
- Accuracy of information
- Depth of insight
- Clarity and organization
- Completeness

The anonymization ensures fair and objective evaluation.

### Stage 3: Final Response
The designated Chairman (default: Claude 3.5 Sonnet) synthesizes all responses and peer reviews into a single, comprehensive answer. The Chairman considers:
- All council members' responses
- Peer review rankings and reasoning
- Areas of agreement and disagreement
- The most accurate and insightful points

## Features

- **Multi-Model Collaboration**: Leverages the strengths of multiple leading AI models
- **Objective Peer Review**: Anonymized review process prevents bias
- **Comprehensive Answers**: Final response synthesizes the best insights from all models
- **Transparent Process**: View individual responses and peer reviews
- **ChatGPT-like Interface**: Familiar and easy-to-use chat interface
- **Powered by OpenRouter**: Access to multiple LLM providers through a single API

## Default Council Members

- **GPT-4 Turbo** (OpenAI)
- **Claude 3.5 Sonnet** (Anthropic) - *Chairman*
- **Gemini Pro** (Google)
- **Mixtral 8x7B** (Mistral AI)

You can customize the council members by modifying `src/lib/config.ts`.

## Prerequisites

- Node.js 18+
- npm or yarn
- OpenRouter API key ([Get one here](https://openrouter.ai/keys))

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LLMCouncil
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your OpenRouter API key:
   ```env
   OPENROUTER_API_KEY=your_api_key_here
   OPENROUTER_SITE_URL=http://localhost:3000
   OPENROUTER_SITE_NAME=LLM Council
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. Type your question in the input field at the bottom
2. Click "Submit" or press Enter
3. Wait as the council processes your query through three stages:
   - Stage 1: Collecting first opinions
   - Stage 2: Peer review and ranking
   - Stage 3: Chairman's final response
4. View the final synthesized answer
5. Explore individual responses in the tabs below
6. Read peer reviews for each response

## Customization

### Changing Council Members

Edit `src/lib/config.ts` to customize your council:

```typescript
export const DEFAULT_COUNCIL: LLMConfig[] = [
  {
    id: 'custom-model',
    name: 'My Custom Model',
    model: 'provider/model-name', // OpenRouter model ID
    isChairman: false,
  },
  // Add more models...
];
```

Find available models at [OpenRouter Models](https://openrouter.ai/models).

### Changing the Chairman

Set `isChairman: true` for your preferred model. Only one model should be designated as chairman.

### Adjusting Response Parameters

Modify the OpenRouter request parameters in `src/lib/openrouter.ts`:

```typescript
const request: OpenRouterRequest = {
  model,
  messages,
  temperature: 0.7,  // Adjust for creativity (0.0-1.0)
  max_tokens: 2000,  // Adjust response length
};
```

## Project Structure

```
LLMCouncil/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── council/
│   │   │       └── route.ts        # Main API endpoint
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home page
│   │   └── globals.css             # Global styles
│   ├── components/
│   │   ├── ChatInterface.tsx       # Main chat UI
│   │   ├── ResponseTabs.tsx        # Individual responses viewer
│   │   ├── StageIndicator.tsx      # Progress indicator
│   │   └── FinalResponse.tsx       # Final answer display
│   └── lib/
│       ├── types.ts                # TypeScript types
│       ├── config.ts               # Council configuration
│       ├── openrouter.ts           # OpenRouter API client
│       └── council.ts              # Core council logic
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## API Reference

### POST /api/council

Submit a query to the LLM Council.

**Request Body:**
```json
{
  "query": "Your question here",
  "council": [...]  // Optional: custom council configuration
}
```

**Response:**
```json
{
  "success": true,
  "query": "Your question",
  "stage1": {
    "status": "completed",
    "responses": [...]
  },
  "stage2": {
    "status": "completed",
    "reviews": [...]
  },
  "stage3": {
    "status": "completed",
    "finalResponse": "...",
    "chairmanId": "...",
    "chairmanName": "..."
  },
  "timestamp": 1234567890
}
```

### GET /api/council

Get the default council configuration.

**Response:**
```json
{
  "defaultCouncil": [...]
}
```

## Development

### Build for Production

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

## Cost Considerations

This application makes multiple API calls to OpenRouter for each query:
- Stage 1: N calls (where N = number of council members)
- Stage 2: N calls (one review from each member)
- Stage 3: 1 call (chairman's final response)

**Total: 2N + 1 API calls per query**

With the default 4-member council, each query makes 9 API calls. Monitor your OpenRouter usage and set appropriate rate limits if needed.

## Troubleshooting

### "OpenRouter API key is required" error

Make sure you've created a `.env` file with your API key:
```env
OPENROUTER_API_KEY=your_actual_key_here
```

### Models not responding

- Check that your OpenRouter API key is valid and has sufficient credits
- Verify the model IDs in `src/lib/config.ts` match available models on OpenRouter
- Some models may have usage limits or require special access

### Slow responses

- The council process involves multiple API calls and can take 30-60 seconds
- Consider reducing the number of council members
- Use faster models (smaller parameter counts)

## Future Enhancements

- [ ] Stream responses in real-time as they're generated
- [ ] Save and export council sessions
- [ ] Custom system prompts for council members
- [ ] Weighted voting based on model performance
- [ ] Support for different council configurations per topic
- [ ] Conversation history and follow-up questions
- [ ] Cost tracking and estimation
- [ ] Model performance analytics

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for any purpose.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [OpenRouter](https://openrouter.ai/)
- Inspired by the concept of ensemble methods in machine learning

---

**Note**: This is a local web application. All data is processed through OpenRouter's API. No data is stored on any server.
