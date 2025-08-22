let controller = null

export function abortCurrent() {
  if (controller) controller.abort()
}

export async function callChat({ system, messages, model, temperature }) {
  controller = new AbortController()
  const res = await fetch('/.netlify/functions/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system, messages, model, temperature }),
    signal: controller.signal
  })
  controller = null
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`HTTP ${res.status}: ${t}`)
  }
  return res.json()
}
