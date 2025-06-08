# Voice2Issue

Voice2Issue is an AI-powered application that transforms voice input into structured GitHub Issues using speech recognition and AI analysis.

## Features

- **Voice Recognition**: Web Speech API for Japanese voice input with auto-recovery
- **AI Analysis**: Mastra Framework with Anthropic Claude for content processing
- **GitHub Integration**: Direct Octokit API integration for issue creation

## Technology Stack

- Frontend
    - Next.js 15.3.3
    - TypeScript 5
    - Tailwind CSS 4
    - Headless UI 2.2.4
- Agent Workflow
    - Mastra 0.10.3
    - Anthropic Claude SDK 0.53.0
- API
    - Octokit REST 22.0.0
    - Web Speech API
- Deployment
    - Vercel
- Coding Agent
    - [Claude Code Actions](https://github.com/anthropics/claude-code-action)
    - Used Cursor (Claude Sonnet 4) for implementation



## Architecture

```
Voice Input → Mastra Agent (Claude) → GitHub API → Issue Creation
```

The application uses Mastra workflows to process voice input through AI analysis and automatically create structured GitHub issues with implementation comments.

## Usage

1. **Configure Settings**: Set GitHub repository and credentials
2. **Voice Input**: Click microphone to record feature requirements
3. **AI Processing**: Mastra agent analyzes and structures content
4. **Issue Creation**: Automatic GitHub issue creation with Claude Code comments

## Project Structure

```
voice2issue/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # React components
│   ├── types/           # TypeScript definitions
│   └── utils/           # Utility functions
├── mastra/
│   ├── agents/          # AI agents
│   ├── tools/           # GitHub tools
│   └── workflows/       # Processing workflows
└── package.json
```


## License

MIT
