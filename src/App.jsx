import React, { useEffect, useMemo, useState } from 'react'
import Chat from './components/Chat.jsx'

const DEFAULT_SYSTEM = 'You are a helpful, concise AI assistant.'

export default function App() {
  const [chats, setChats] = useState(() => JSON.parse(localStorage.getItem('dm:chats') || '[]'))
  const [activeId, setActiveId] = useState(() => localStorage.getItem('dm:active') || '')
  useEffect(()=>localStorage.setItem('dm:chats', JSON.stringify(chats)),[chats])
  useEffect(()=>localStorage.setItem('dm:active', activeId),[activeId])

  const active = useMemo(()=>chats.find(c=>c.id===activeId)||null,[chats,activeId])

  function newChat() {
    const id = crypto.randomUUID()
    const chat = { id, title:'New Chat', system: DEFAULT_SYSTEM, model:'gpt-4o-mini', temp:0.7, messages:[] }
    setChats([chat, ...chats]); setActiveId(id)
  }
  function updateChat(id, patch){ setChats(cs => cs.map(c => c.id===id?{...c,...patch}:c)) }
  function delChat(id){ const nx=chats.filter(c=>c.id!==id); setChats(nx); if(activeId===id) setActiveId(nx[0]?.id||'') }

  useEffect(()=>{ if(!activeId && chats.length===0) newChat() },[])

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="row" style={{justifyContent:'space-between', marginBottom:12}}>
          <div className="title">DeepMind</div>
          <button className="btn" onClick={newChat}>+ New chat</button>
        </div>
        <div>
          {chats.map(c=>(
            <div key={c.id} className="history-item" onClick={()=>setActiveId(c.id)} style={{borderColor: activeId===c.id?'#374151':undefined}}>
              <span title={c.title} style={{whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:170}}>{c.title}</span>
              <button className="btn" onClick={(e)=>{e.stopPropagation(); delChat(c.id)}}>🗑️</button>
            </div>
          ))}
        </div>
        <div style={{marginTop:14}}>
          <small>Set <b>OPENAI_API_KEY</b> in Netlify Environment. Never put keys in the browser.</small>
        </div>
      </aside>

      <main className="chat">
        {active && (
          <Chat
            key={active.id}
            chat={active}
            onChange={(patch)=>updateChat(active.id, patch)}
          />
        )}
      </main>
    </div>
  )
}
