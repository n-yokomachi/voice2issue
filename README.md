# Voice2Issue

Voice2Issue is an AI-powered application that transforms voice input into structured GitHub Issues using speech recognition and AI analysis.

## Features

- **Voice Recognition**: Web Speech API for Japanese voice input with auto-recovery
- **AI Analysis**: Mastra Framework with Anthropic Claude for content processing
- **GitHub Integration**: Direct Octokit API integration for issue creation
- **Secure Storage**: AES-GCM encryption for credential management

## Technology Stack

- **Framework**: Next.js 15 with TypeScript
- **AI Processing**: Mastra Framework + Anthropic Claude
- **GitHub API**: Octokit REST API
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Security**: Web Crypto API with AES-GCM encryption

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

## Security

- **Credential Encryption**: AES-GCM 256-bit encryption
- **Secure Cookies**: HTTPOnly with SameSite protection
- **Auto-expiration**: 2-hour credential timeout

## License

MIT
