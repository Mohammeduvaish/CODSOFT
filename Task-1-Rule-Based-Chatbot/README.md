# Nova — Rule-Based AI Chatbot

Nova is a professional browser-based chatbot created for CodSoft Artificial Intelligence Internship Task 1. Its response engine uses predefined regular-expression patterns and conditional logic; it does not call a generative AI API.

## Features

- Rule-based answers for greetings, AI, programming, study help, calculations, date/time, and more
- Explicit fallback response when no rule matches
- Persistent local memory for name, location, preferences, and user-supplied facts
- Multiple conversations, searchable history, delete and clear controls
- Copy, edit, share, timestamps, typing indicator, and JSON export
- Dark, light, and midnight themes
- Responsive desktop and mobile layout
- No API key, account, or server database required

## Run locally

1. Install Node.js 22 or newer.
2. Open this folder in a terminal.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open the local address shown in the terminal.

## How the AI works

The `reply` function in `app/page.tsx` normalizes each user message, checks memory and utility commands, then compares the text against a list of regular-expression rules. The first matching rule returns a predefined response. If no rule matches, Nova honestly explains that it does not understand yet.

## Privacy

Conversations and remembered details remain in the browser's local storage. Settings can export or clear this data.
