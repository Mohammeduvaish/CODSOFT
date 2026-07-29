"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";

type Role = "user" | "bot";
type Message = { id: string; role: Role; text: string; time: string; edited?: boolean };
type Chat = { id: string; title: string; createdAt: number; messages: Message[] };
type Memory = { name?: string; location?: string; likes: string[]; facts: string[] };
type Theme = "dark" | "light" | "midnight";

const id = () => crypto.randomUUID();
const clock = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const starterMessage = (): Message => ({ id: id(), role: "bot", text: "Hello! I'm Nova, your rule-based assistant. I can chat, calculate, remember details, explain common topics, and help with everyday questions. What would you like to explore?", time: clock() });
const newChat = (): Chat => ({ id: id(), title: "New conversation", createdAt: Date.now(), messages: [starterMessage()] });

const rules: { patterns: RegExp[]; answer: string | ((q: string, m: Memory) => string) }[] = [
  { patterns: [/^(hi|hello|hey|hiya|howdy)\b/i], answer: (_, m) => `Hello${m.name ? `, ${m.name}` : ""}! How can I help you today?` },
  { patterns: [/how are you/i], answer: "I'm working perfectly and ready to help. How are you doing?" },
  { patterns: [/who are you|your name/i], answer: "I'm Nova, a rule-based assistant built for the CodSoft AI internship. I use pattern matching and predefined response logic rather than a generative AI model." },
  { patterns: [/what can you do|help me|capabilities/i], answer: "I can answer common questions, explain programming and AI concepts, calculate expressions, remember personal details, tell the date and time, give study tips, and maintain separate searchable conversations. Try: “My name is Asha”, “What is machine learning?”, or “calculate 18 * 7”." },
  { patterns: [/what is (artificial intelligence|ai)\b/i], answer: "Artificial intelligence is the field of creating computer systems that perform tasks normally requiring human intelligence, such as learning, reasoning, language understanding, perception, and decision-making." },
  { patterns: [/machine learning/i], answer: "Machine learning is a branch of AI where systems learn patterns from data to make predictions or decisions without being explicitly programmed for every case." },
  { patterns: [/deep learning/i], answer: "Deep learning is a type of machine learning that uses multi-layered neural networks to learn complex patterns, especially from images, audio, and text." },
  { patterns: [/natural language processing|\bnlp\b/i], answer: "Natural language processing (NLP) helps computers understand, interpret, and generate human language. Chatbots, translation, sentiment analysis, and text summarization are common NLP applications." },
  { patterns: [/rule[- ]?based (chatbot|system)/i], answer: "A rule-based chatbot maps recognized words or patterns to predefined responses. It is predictable, explainable, fast, and works offline, but its knowledge is limited to the rules its developer provides." },
  { patterns: [/python/i], answer: "Python is a readable, versatile programming language widely used for AI, data science, automation, web development, and scripting. Its large library ecosystem makes it especially popular for beginners and professionals." },
  { patterns: [/javascript/i], answer: "JavaScript is the primary programming language of the web. It adds interaction to websites and can also run on servers through environments such as Node.js." },
  { patterns: [/what is (an )?algorithm/i], answer: "An algorithm is a finite, ordered set of instructions used to solve a problem or complete a task. Good algorithms are correct, clear, and efficient." },
  { patterns: [/data structure/i], answer: "A data structure organizes data so it can be stored and used efficiently. Common examples include arrays, linked lists, stacks, queues, trees, graphs, and hash tables." },
  { patterns: [/tic[- ]?tac[- ]?toe|minimax/i], answer: "Minimax is a search algorithm for two-player games. It explores possible moves, assumes both players choose optimally, and selects the move with the best guaranteed outcome. Alpha-beta pruning skips branches that cannot affect the result." },
  { patterns: [/recommendation system/i], answer: "A recommendation system suggests relevant items. Content-based systems compare item features with user preferences, while collaborative filtering learns from patterns across many users' interactions." },
  { patterns: [/study tip|how (can|do) i study/i], answer: "Use focused 25–45 minute sessions, practice active recall, revisit material with spaced repetition, solve problems without notes, and end each session by writing a short summary in your own words." },
  { patterns: [/motivate|motivation/i], answer: "Progress rarely feels dramatic while you're making it. Choose the smallest useful next action, finish it, and let that win create momentum." },
  { patterns: [/thank(s| you)/i], answer: "You're very welcome! Is there anything else you'd like help with?" },
  { patterns: [/good ?bye|bye|see you/i], answer: "Goodbye! Your conversations are saved on this device, so you can continue whenever you return." },
  { patterns: [/joke/i], answer: "Why did the developer go broke? Because they used up all their cache. 🙂" },
];

function reply(input: string, memory: Memory): { text: string; memory: Memory } {
  const q = input.trim();
  const next = { ...memory, likes: [...memory.likes], facts: [...memory.facts] };
  let match = q.match(/(?:my name is|call me)\s+([a-z][a-z .'-]{0,30})/i);
  if (match) { next.name = match[1].trim().replace(/\b\w/g, c => c.toUpperCase()); return { text: `Nice to meet you, ${next.name}! I'll remember your name on this device.`, memory: next }; }
  match = q.match(/(?:i live in|i am from|i'm from)\s+([a-z][a-z ,.'-]{1,40})/i);
  if (match) { next.location = match[1].trim(); return { text: `Got it — I'll remember that you're from ${next.location}.`, memory: next }; }
  match = q.match(/i (?:like|love|enjoy)\s+(.+)/i);
  if (match) { const item = match[1].replace(/[.!?]+$/, ""); if (!next.likes.includes(item)) next.likes.push(item); return { text: `I'll remember that you like ${item}.`, memory: next }; }
  match = q.match(/remember (?:that )?(.+)/i);
  if (match) { next.facts.push(match[1]); return { text: `Remembered: “${match[1]}”`, memory: next }; }
  if (/what do you (know|remember) about me/i.test(q)) {
    const items = [next.name && `Your name is ${next.name}`, next.location && `you are from ${next.location}`, next.likes.length && `you like ${next.likes.join(", ")}`, ...next.facts].filter(Boolean);
    return { text: items.length ? `Here's what I remember: ${items.join("; ")}.` : "I don't know anything personal about you yet. Tell me your name, what you like, or say “remember that…”", memory: next };
  }
  if (/forget (everything|what you know|my data)/i.test(q)) return { text: "I've cleared the personal details I remembered.", memory: { likes: [], facts: [] } };
  if (/\b(date|today)\b/i.test(q)) return { text: `Today is ${new Date().toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.`, memory: next };
  if (/\btime\b/i.test(q)) return { text: `The current local time is ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}.`, memory: next };
  match = q.match(/(?:calculate|solve|what is)\s+([0-9+\-*/().%\s]+)$/i);
  if (match) {
    try { const exp = match[1]; if (!/^[0-9+\-*/().%\s]+$/.test(exp)) throw new Error(); const result = Function(`"use strict";return (${exp})`)(); if (!Number.isFinite(result)) throw new Error(); return { text: `${exp.trim()} = ${result}`, memory: next }; } catch { return { text: "I couldn't calculate that. Please use numbers and +, −, *, /, %, or parentheses.", memory: next }; }
  }
  for (const rule of rules) if (rule.patterns.some(p => p.test(q))) return { text: typeof rule.answer === "function" ? rule.answer(q, next) : rule.answer, memory: next };
  return { text: "I don't understand that yet. I'm still developing and learning new predefined rules. Try rephrasing your question, or ask what I can do.", memory: next };
}

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeId, setActiveId] = useState("");
  const [memory, setMemory] = useState<Memory>({ likes: [], facts: [] });
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState<Theme>("dark");
  const [typing, setTyping] = useState(false);
  const [sidebar, setSidebar] = useState(false);
  const [settings, setSettings] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [ready, setReady] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("nova-state") || "null");
      if (saved?.chats?.length) { setChats(saved.chats); setActiveId(saved.activeId || saved.chats[0].id); setMemory(saved.memory || { likes: [], facts: [] }); setTheme(saved.theme || "dark"); }
      else { const first = newChat(); setChats([first]); setActiveId(first.id); }
    } catch { const first = newChat(); setChats([first]); setActiveId(first.id); }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem("nova-state", JSON.stringify({ chats, activeId, memory, theme })); }, [chats, activeId, memory, theme, ready]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chats, typing]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 1800); return () => clearTimeout(t); }, [toast]);

  const active = chats.find(c => c.id === activeId) || chats[0];
  const visibleChats = useMemo(() => chats.filter(c => `${c.title} ${c.messages.map(m => m.text).join(" ")}`.toLowerCase().includes(search.toLowerCase())).sort((a,b) => b.createdAt-a.createdAt), [chats, search]);
  const updateActive = (fn: (c: Chat) => Chat) => setChats(cs => cs.map(c => c.id === activeId ? fn(c) : c));
  const createChat = () => { const c = newChat(); setChats(cs => [c, ...cs]); setActiveId(c.id); setInput(""); setSidebar(false); };
  const notify = (text: string) => setToast(text);

  const send = (e?: FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || typing || !active) return;
    const text = input.trim();
    const user: Message = { id: id(), role: "user", text, time: clock(), edited: Boolean(editing) };
    if (editing) { updateActive(c => ({ ...c, messages: c.messages.map(m => m.id === editing ? user : m) })); setEditing(null); }
    else updateActive(c => ({ ...c, title: c.title === "New conversation" ? text.slice(0, 34) : c.title, messages: [...c.messages, user] }));
    setInput(""); setTyping(true);
    const result = reply(text, memory); setMemory(result.memory);
    setTimeout(() => { updateActive(c => ({ ...c, messages: [...c.messages, { id: id(), role: "bot", text: result.text, time: clock() }] })); setTyping(false); }, Math.min(1300, 450 + result.text.length * 5));
  };

  const removeChat = (chatId: string) => {
    if (chats.length === 1) return createChat();
    const left = chats.filter(c => c.id !== chatId); setChats(left); if (activeId === chatId) setActiveId(left[0].id); notify("Conversation deleted");
  };
  const clearAll = () => { const c = newChat(); setChats([c]); setActiveId(c.id); setMemory({ likes: [], facts: [] }); setSettings(false); notify("All local data cleared"); };
  const share = async (m: Message) => { try { if (navigator.share) await navigator.share({ title: "Nova response", text: m.text }); else { await navigator.clipboard.writeText(m.text); notify("Copied for sharing"); } } catch {} };
  const exportData = () => { const blob = new Blob([JSON.stringify({ chats, memory }, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "nova-chat-export.json"; a.click(); URL.revokeObjectURL(a.href); notify("Chat export downloaded"); };
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  if (!ready || !active) return <main className="loading">Preparing Nova…</main>;
  return <main className={`app theme-${theme}`}>
    <aside className={`sidebar ${sidebar ? "open" : ""}`}>
      <div className="brand"><div className="logo">N</div><div><strong>NOVA</strong><span>RULE-BASED AI</span></div><button className="icon mobile-close" onClick={() => setSidebar(false)} aria-label="Close sidebar">×</button></div>
      <button className="new-chat" onClick={createChat}><span>＋</span> New conversation <kbd>Ctrl K</kbd></button>
      <label className="search"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search conversations" aria-label="Search conversations" /></label>
      <div className="history-label"><span>Conversations</span><span>{chats.length}</span></div>
      <div className="chat-list">{visibleChats.map(c => <div className={`chat-row ${c.id === activeId ? "active" : ""}`} key={c.id} onClick={()=>{setActiveId(c.id);setSidebar(false)}} role="button" tabIndex={0}><span className="bubble-icon">◌</span><div><strong>{c.title}</strong><span>{c.messages.at(-1)?.text}</span></div><button className="row-delete" onClick={e=>{e.stopPropagation();removeChat(c.id)}} aria-label="Delete conversation">×</button></div>)}</div>
      <div className="side-footer"><button onClick={()=>setSettings(true)}><span>⚙</span><div><strong>Settings</strong><small>Theme & data</small></div></button><div className="profile"><div className="avatar">{memory.name?.[0] || "Y"}</div><div><strong>{memory.name || "Your profile"}</strong><small>Local memory active</small></div><span className="status"></span></div></div>
    </aside>
    {sidebar && <button className="scrim" onClick={()=>setSidebar(false)} aria-label="Close navigation" />}
    <section className="workspace">
      <header><button className="icon menu" onClick={()=>setSidebar(true)} aria-label="Open menu">☰</button><div><h1>{active.title}</h1><p><span className="online"></span> Rule engine online</p></div><div className="header-actions"><button className="icon" onClick={exportData} aria-label="Export chat" title="Export">⇩</button><button className="icon" onClick={()=>setSettings(true)} aria-label="Settings">⚙</button></div></header>
      <div className="messages">
        <div className="date-rule"><span>Today</span></div>
        {active.messages.map(m => <article className={`message ${m.role}`} key={m.id}>
          {m.role === "bot" && <div className="bot-avatar">N</div>}
          <div className="message-wrap"><div className="message-head"><strong>{m.role === "bot" ? "Nova" : "You"}</strong>{m.edited && <span>edited</span>}</div><div className="bubble"><p>{m.text}</p><time>{m.time}</time></div><div className="message-tools"><button onClick={()=>{navigator.clipboard.writeText(m.text);notify("Copied to clipboard")}}>▣ <span>Copy</span></button>{m.role === "user" && <button onClick={()=>{setInput(m.text);setEditing(m.id)}}>✎ <span>Edit</span></button>}<button onClick={()=>share(m)}>↗ <span>Share</span></button></div></div>
        </article>)}
        {typing && <article className="message bot"><div className="bot-avatar">N</div><div className="message-wrap"><div className="message-head"><strong>Nova</strong><span>thinking</span></div><div className="bubble typing"><i></i><i></i><i></i></div></div></article>}
        <div ref={endRef}/>
      </div>
      <div className="composer-area">{editing && <div className="editing"><span>Editing your message</span><button onClick={()=>{setEditing(null);setInput("")}}>Cancel</button></div>}<form className="composer" onSubmit={send}><textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={onKey} placeholder="Message Nova…" rows={1} aria-label="Message Nova"/><button type="submit" disabled={!input.trim() || typing} aria-label="Send message">↑</button><div className="hint">Enter to send · Shift + Enter for new line</div></form><p className="disclaimer">Nova uses predefined rules and may not understand every request. Your data stays in this browser.</p></div>
    </section>
    {settings && <div className="modal-layer" onMouseDown={e=>{if(e.target===e.currentTarget)setSettings(false)}}><section className="modal"><div className="modal-head"><div><span>Preferences</span><h2>Settings</h2></div><button className="icon" onClick={()=>setSettings(false)}>×</button></div><div className="setting"><div><strong>Appearance</strong><p>Choose how Nova looks on this device.</p></div><div className="themes">{(["dark","light","midnight"] as Theme[]).map(t=><button key={t} className={theme===t?"selected":""} onClick={()=>setTheme(t)}><i className={`swatch ${t}`}></i>{t}</button>)}</div></div><div className="setting"><div><strong>Conversation data</strong><p>{chats.length} conversation{chats.length!==1?"s":""} stored locally.</p></div><button className="secondary" onClick={exportData}>Export data</button></div><div className="setting danger-zone"><div><strong>Clear all data</strong><p>Remove chats and remembered details permanently.</p></div><button className="danger" onClick={clearAll}>Clear data</button></div><div className="about"><div className="logo">N</div><div><strong>Nova 1.0</strong><p>Explainable, private, rule-based assistance.</p></div></div></section></div>}
    {toast && <div className="toast">✓ {toast}</div>}
  </main>;
}
