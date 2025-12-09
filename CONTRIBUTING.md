# Contributing to LLM Council

Thank you for your interest in contributing to LLM Council! This document provides guidelines for contributing to the project.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- A clear, descriptive title
- Steps to reproduce the bug
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Your environment (OS, Node version, browser)

### Suggesting Enhancements

Enhancement suggestions are welcome! Please create an issue with:
- A clear, descriptive title
- Detailed description of the proposed feature
- Why this enhancement would be useful
- Possible implementation approach (optional)

### Pull Requests

1. **Fork the repository** and create your branch from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clear, concise commit messages
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed

3. **Test your changes**
   - Ensure the app runs without errors
   - Test all affected functionality
   - Verify the build succeeds: `npm run build`

4. **Update documentation**
   - Update README.md if you change functionality
   - Add JSDoc comments for new functions
   - Update type definitions if needed

5. **Submit the pull request**
   - Provide a clear description of the changes
   - Reference any related issues
   - Include screenshots for UI changes

## Development Setup

1. Clone your fork:
   ```bash
   git clone https://github.com/your-username/LLMCouncil.git
   cd LLMCouncil
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment:
   ```bash
   cp .env.example .env
   # Add your OpenRouter API key
   ```

4. Run development server:
   ```bash
   npm run dev
   ```

## Code Style

- Use TypeScript for all new code
- Follow the existing code formatting
- Use meaningful variable and function names
- Keep functions small and focused
- Add types for all function parameters and returns

## Project Structure

- `src/app/` - Next.js app router pages and API routes
- `src/components/` - React components
- `src/lib/` - Core logic and utilities
  - `types.ts` - TypeScript type definitions
  - `config.ts` - Configuration
  - `openrouter.ts` - OpenRouter API client
  - `council.ts` - Council orchestration logic

## Adding New Features

### Adding a New LLM Provider

1. Update `src/lib/config.ts` with the new model
2. Ensure the model ID is valid on OpenRouter
3. Test with various queries

### Modifying the Council Process

If you want to change how the council operates:
1. Core logic is in `src/lib/council.ts`
2. Each stage has its own function
3. Update types in `src/lib/types.ts` if needed
4. Update UI components to reflect changes

### Adding New UI Components

1. Create component in `src/components/`
2. Use TypeScript and proper typing
3. Follow the existing styling approach (Tailwind CSS)
4. Make components reusable when possible

## Testing

Currently, the project doesn't have automated tests. We welcome contributions to add:
- Unit tests for core logic
- Integration tests for API routes
- E2E tests for the UI

## Questions?

Feel free to open an issue with your question or reach out to the maintainers.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
