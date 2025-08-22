import fetch from 'node-fetch'

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return { statusCode: 500, body: 'Missing OPENAI_API_KEY' }

  const { system = 'You are a helpful, concise AI assistant.',
          messages = [],
          model = 'gpt-4o-mini',
          temperature = 0.7 } = JSON.parse(event.body || '{}')

  const payload = {
    model,
    temperature,
    messages: [{ role: 'system', content: system }, ...messages.map(m => ({ role: m.role, content: m.content }))],
  }

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await r.json()
    return { statusCode: r.status, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }
  } catch (e) {
    return { statusCode: 500, body: 'Server error: ' + e.message }
  }
}
