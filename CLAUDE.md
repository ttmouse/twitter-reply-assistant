Project Overview

Project Name: Twitter Reply Assistant
Type: Browser Extension (Chrome/Edge)
Tech Stack: React + TypeScript + Vite + CRXJS + Tailwind CSS
Purpose: AI-powered Twitter reply generator with customizable styles and models

This extension helps users generate contextual Twitter replies using AI models. Users can configure their own API endpoints (SiliconFlow, DeepSeek, GLM, or custom), select from 6 reply styles, and automatically fill the generated reply into Twitter's reply box.

Project Structure

twitter-reply-assistant/
├── manifest.json                 # Extension manifest (V3)
├── src/
│   ├── background/
│   │   └── index.ts             # Background service worker
│   ├── content/
│   │   ├── index.tsx            # Content script entry
│   │   ├── twitter-injector.ts  # Twitter DOM injection logic
│   │   └── styles.css           # Content script styles
│   ├── popup/
│   │   ├── App.tsx              # Settings UI
│   │   ├── index.html           # Popup HTML
│   │   └── index.tsx            # Popup entry
│   ├── components/
│   │   ├── StyleSelector.tsx    # Style selection dropdown
│   │   └── ReplyButton.tsx      # AI reply button component
│   ├── services/
│   │   ├── ai-service.ts        # AI API integration
│   │   └── storage-service.ts   # Chrome storage wrapper
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   └── utils/
│       └── prompt-builder.ts    # Prompt template builder
├── public/
│   └── icons/                   # Extension icons
├── package.json
├── tsconfig.json
├── vite.config.ts               # Vite + CRXJS config
├── tailwind.config.js
└── postcss.config.js

Core Features

1. AI Model Configuration

Location: src/popup/App.tsx

Storage: chrome.storage.sync

Preset Providers:

SiliconFlow: <https://api.siliconflow.cn/v1/chat/completions>

DeepSeek: <https://api.deepseek.com/v1/chat/completions>

GLM: <https://open.bigmodel.cn/api/paas/v4/chat/completions>

Custom: User-defined URL

Config Interface:

interface AIConfig {
  provider: 'siliconflow' | 'deepseek' | 'glm' | 'custom';
  apiUrl: string;
  apiToken: string;
  model: string;
}

2. Reply Style System

Six predefined styles with specific prompts:

Style ID

Name (CN)

Icon

Use Case

professional

专业严谨

💼

Industry discussions, professional topics

humorous

幽默风趣

😄

Entertainment, casual topics

concise

简洁明了

✨

Quick responses, brief interactions

supportive

友好支持

👍

Encouragement, agreement

critical

批判性思考

🤔

Debates, analytical discussions

questioning

提问引导

❓

Sparking discussions, exploration

Implementation: src/services/ai-service.ts - stylePrompts object

3. Twitter Integration

Target: twitter.com and x.com

Injection Point: Next to native reply button on each tweet

Selectors (use data-testid attributes):

Tweet container: [data-testid="tweet"]

Tweet text: [data-testid="tweetText"]

Reply button: [data-testid="reply"]

Reply textarea: [data-testid="tweetTextarea_0"]

Key Challenge: Twitter uses dynamic rendering. Use MutationObserver to detect new tweets.

4. Reply Generation Flow

User clicks AI button (🤖) on a tweet

Style selector dropdown appears

User selects a style

Extract tweet text content

Click native reply button programmatically

Wait for reply box to appear

Call AI API with tweet text + style prompt

Fill generated reply (max 120 chars) into textarea

Trigger React's input event for Twitter to recognize the change

Technical Requirements

Dependencies

{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@crxjs/vite-plugin": "^2.0.0-beta.21",
    "@types/chrome": "^0.0.254",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.2.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}

Vite Configuration

// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest })
  ],
  build: {
    rollupOptions: {
      input: {
        popup: 'src/popup/index.html'
      }
    }
  }
});

Manifest V3 Configuration

{
  "manifest_version": 3,
  "name": "Twitter Reply Assistant",
  "version": "1.0.0",
  "permissions": ["storage", "activeTab"],
  "host_permissions": [
    "https://twitter.com/*",
    "https://x.com/*"
  ],
  "background": {
    "service_worker": "src/background/index.ts",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": ["https://twitter.com/*", "https://x.com/*"],
      "js": ["src/content/index.tsx"],
      "css": ["src/content/styles.css"]
    }
  ],
  "action": {
    "default_popup": "src/popup/index.html"
  }
}

Implementation Guidelines

For AI Service (src/services/ai-service.ts)

Use OpenAI-compatible API format

Set timeout to 30 seconds

Implement retry logic (max 2 retries)

Truncate responses to 120 characters

Handle common errors:

Invalid API token

Network timeout

Rate limiting

Invalid response format

API Request Format:

{
  model: config.model,
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ],
  max_tokens: 200,
  temperature: 0.7
}

For Twitter Injector (src/content/twitter-injector.ts)

Use MutationObserver to watch for new tweets

Debounce injection to avoid excessive DOM operations

Check if button already exists before injecting

Clean up observers on extension unload

Handle Twitter's React-based input system:

const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
  window.HTMLTextAreaElement.prototype,
  'value'
)?.set;
nativeInputValueSetter?.call(textarea, text);
textarea.dispatchEvent(new Event('input', { bubbles: true }));

For Style Selector (src/components/StyleSelector.tsx)

Position dropdown absolutely to avoid layout shift

Close dropdown when clicking outside (use useEffect + event listener)

Show loading state (⏳) during generation

Disable button during generation to prevent double-clicks

Use Tailwind for styling to match Twitter's aesthetic

For Storage Service (src/services/storage-service.ts)

Wrap chrome.storage.sync API in Promises

Provide type-safe getters/setters

Handle storage quota exceeded errors

Implement default values for first-time users

Development Workflow

Setup

npm create vite@latest twitter-reply-assistant -- --template react-ts
cd twitter-reply-assistant
npm install
npm install @crxjs/vite-plugin @types/chrome axios
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

Development

npm run dev

# Load unpacked extension from dist/ folder in Chrome

Build

npm run build

# Output in dist/ folder, ready for Chrome Web Store

Testing Checklist

 Config saves and persists across browser restarts

 All 6 styles generate different tones

 Works on both twitter.com and x.com

 Handles dynamically loaded tweets (infinite scroll)

 Reply fills correctly in Twitter's textarea

 Error messages display for API failures

 No console errors in normal operation

 Extension icon shows in toolbar

Common Pitfalls & Solutions

Issue: Reply doesn't fill in textarea

Cause: Twitter uses React, simple textarea.value = text doesn't work
Solution: Use native setter + dispatch input event (see code above)

Issue: Button doesn't appear on new tweets

Cause: MutationObserver not catching dynamic content
Solution: Observe with { childList: true, subtree: true } and debounce

Issue: API calls fail with CORS error

Cause: Content scripts have same CORS restrictions as web pages
Solution: Make API calls from background script, use message passing

Issue: Config doesn't save

Cause: Using chrome.storage.local instead of sync
Solution: Use chrome.storage.sync for cross-device sync

Issue: Extension breaks Twitter functionality

Cause: Event listener conflicts or CSS interference
Solution: Use unique class names, namespace CSS, avoid global listeners

Code Style Guidelines

Use TypeScript strict mode

Prefer functional components with hooks

Use async/await over Promise chains

Add JSDoc comments for complex functions

Keep components under 200 lines

Extract reusable logic into custom hooks

Use meaningful variable names (avoid data, result, temp)

Security Considerations

Never log API tokens to console

Store tokens only in chrome.storage.sync (encrypted by Chrome)

Don't send tweet content to any server except user's configured API

Validate all user inputs before using in API calls

Sanitize generated replies before inserting into DOM

Use Content Security Policy in manifest

Performance Optimization

Debounce MutationObserver callbacks (100ms)

Cache DOM queries where possible

Lazy load components with React.lazy

Minimize bundle size (code splitting)

Use React.memo for expensive components

Avoid re-rendering entire tweet list

Future Enhancements (Not in MVP)

Custom prompt templates

Reply history

Multi-language support

Image recognition for context

Sentiment analysis

A/B testing different replies

Analytics dashboard

Debugging Tips

Enable verbose logging

const DEBUG = true;
const log = (...args: any[]) => DEBUG && console.log('[TRA]', ...args);

Inspect content script context

// In DevTools console on Twitter page
chrome.runtime.sendMessage({ action: 'ping' }, console.log);

Check storage

chrome.storage.sync.get(null, console.log);

Monitor API calls

Use Network tab in DevTools, filter by your API domain

Support & Resources

Chrome Extension Docs: <https://developer.chrome.com/docs/extensions/>

CRXJS Documentation: <https://crxjs.dev/vite-plugin/>

React DevTools: Essential for debugging React components

Twitter DOM: Use DevTools to inspect data-testid attributes

Contact & Contribution

Project Owner: Bruce Yang
Development Start: 2025-10-31

When contributing:

Follow the code style guidelines

Add tests for new features

Update this CLAUDE.md if architecture changes

Keep PRD in sync with implementation

Last Updated: 2025-10-31
Version: 1.0
Status: Ready for Development

Quick Start for Claude Code

To start developing:

Initialize project: Follow Setup section

Start with: src/popup/App.tsx (config UI)

Then build: src/services/ai-service.ts (API integration)

Next: src/content/twitter-injector.ts (DOM injection)

Finally: src/components/StyleSelector.tsx (UI component)

Test each component independently before integration. Use the Testing Checklist to verify functionality.

Good luck! 🚀
