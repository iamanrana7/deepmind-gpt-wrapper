import React, { useEffect, useMemo, useRef, useState } from 'react'
import { callChat, abortCurrent } from '../lib/api.js'
import { marked } from 'marked'
import hljs from 'highlight.js'

marked.setOptions({
  highlight(code, lang) {
    const v = lang && hljs.getLanguage(lang) ? hljs.highlight(code, {language: lang}).value : hljs.highlightAuto(code).value
    return v
  }
})

// copy button in code blocks
function withCopyButtons(html) {
  const doc = document.createElement('div')
  doc.innerHTML = html
  doc.querySelectorAll('pre code').forEach(code => {
    const btn = document.createElement('button')
    btn.className = 'copy-btn'
    btn.textContent = 'Copy'
    btn.onclick = () => navigator.clipboard.writeText(code.textContent || '')
    code.parentElement?.prepend(btn)
  })
  return doc.innerHTML
}

export default function Chat({ chat, onChange }) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:'smooth'}) }, [chat.messages, loading])

  const settings = useMemo(()=>(
    <div className="toolbar">
      <div className="row">
        <label>Model&nbsp;</label>
        <select className="input" value={chat.model} onChange={e=>onChange({model:e.target.value})}>
          <option value="gpt-4o">gpt-4o</option>
          <option value="gpt-4o-mini">gpt-4o-mini</option>
        </select>
        <label style={{marginLeft:10}}>Temp</label>
        <input className="input" type="range" min="0" max="2" step="0.1" value={chat.temp} onChange={e=>onChange({temp:parseFloat(e.target.value)})} />
      </div>
      <small style={{opacity:.8}}>Ctrl/Cmd + Enter to send</small>
    </div>
  ),[chat.model,chat.temp])

  function rename(msg){
    if(chat.title==='New Chat' && msg.trim()){
      onChange({title: (msg.split('\n')[0] || '').slice(0,40)})
    }
  }

  async function send() {
    const content = input.trim()
    if(!content || loading) return
    const next = [...chat.messages, { role:'user', content }]
    onChange({ messages: next })
    setInput('')
    rename(content)
    setLoading(true)
    try {
      const res = await callChat({
        system: chat.system,
        messages: next,
        model: chat.model,
        temperature: chat.temp
      })
      const reply = res?.choices?.[0]?.message?.content || '(No response)'
      onChange({ messages: [...next, { role:'assistant', content: reply }] })
    } catch (e) {
      onChange({ messages: [...next, { role:'assistant', content: '⚠️ ' + e.message }] })
    } finally {
      setLoading(false)
    }
  }

  function onKeyDown(e){
    if((e.metaKey || e.ctrlKey) && e.key==='Enter'){ e.preventDefault(); send() }
  }

  return (
    <>
      {settings}
      <div className="messages">
        {chat.messages.length===0 && (
          <div className="msg" style={{opacity:.85}}>
            <b>Welcome!</b> Ask anything. Use <kbd>Ctrl/Cmd</kbd>+<kbd>Enter</kbd> to send.
          </div>
        )}
        {chat.messages.map((m,i)=>(
          <div key={i} className={'msg ' + (m.role==='user'?'user':'')}>
            {m.role==='assistant'
              ? <div dangerouslySetInnerHTML={{__html: withCopyButtons(marked.parse(m.content || ''))}} />
              : <div>{m.content}</div>}
          </div>
        ))}
        {loading && (
          <div className="row" style={{justifyContent:'center', opacity:.9}}>
            <button className="btn" onClick={()=>{ abortCurrent(); setLoading(false) }}>⏹ Stop</button>
            <span style={{opacity:.8, marginLeft:8}}>Thinking…</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="inputbar">
        <textarea
          rows={3}
          className="input"
          placeholder="Type your message…"
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <div className="row">
          <button className="btn" onClick={send} disabled={loading}>Send ▶</button>
          {!loading && chat.messages.length>0 && (
            <button className="btn" onClick={()=>onChange({messages: chat.messages.slice(0,-1)})}>↻ Regenerate</button>
          )}
        </div>
      </div>
    </>
  )
}
