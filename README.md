# DeepMind – ChatGPT-like UI (React + Vite + Netlify)
- Multi-chat sidebar, model picker, markdown + code highlight, regenerate/stop.
- Backend: Netlify Function proxies OpenAI (key in `OPENAI_API_KEY`).

## Dev
npm i
npm run dev

## Deploy (Netlify)
Build: npm run build
Publish: dist
Functions: netlify/functions
Env: OPENAI_API_KEY
