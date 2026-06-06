import { useState, useRef, useEffect } from "react";

// ── DATA ─────────────────────────────────────────────────────────────────────
const USER = { name: "Sébastien", email: "sebastien@livvia.fr" };

const DEFAULT_NETWORK = [
  { id: "1", category: "Dentiste", name: "Dr. Valentina ORMAZABAL", cabinet: "Cabinet Drs. Soares et Ormazabal", address: "24 rue du Docteur Grange", city: "73300 Saint-Jean-de-Maurienne", favorite: true, avatar: null },
  { id: "2", category: "Médecin", name: "Dr. Bertrand MOULIN", cabinet: "Maison de Santé des Lilas", address: "14 rue des Lilas", city: "73300 Saint-Jean-de-Maurienne", favorite: true, avatar: null },
  { id: "3", category: "Coiffeur", name: "Isabelle JOYEUX", cabinet: "L'art des Ciseaux", address: "7 avenue du Général de Gaulle", city: "73300 Saint-Jean-de-Maurienne", favorite: false, avatar: null },
];

const ADD_CATEGORIES = ["Esthéticienne", "Banquier", "Notaire", "Opticien", "Kinésithérapeute", "Ostéopathe", "Podologue", "Autre"];

const SEARCH_RESULTS = [
  { id: "s1", category: "Chirurgien dentiste", name: "Dr. Valentina ORMAZABAL", address: "24 rue du Docteur Grange", city: "73300 Saint-Jean-de-Maurienne" },
  { id: "s2", category: "Chirurgien dentiste", name: "Dr. Valentin CHOKOEV", address: "223 Quai de l'Arvan", city: "73300 Saint-Jean-de-Maurienne" },
  { id: "s3", category: "Chirurgien dentiste", name: "Dr. Remy DEMARS", address: "223 Quai de l'Arvan", city: "73300 Saint-Jean-de-Maurienne" },
  { id: "s4", category: "Chirurgien dentiste", name: "Dr. Vildan CHAUSHEVA", address: "223 Quai de l'Arvan", city: "73300 Saint-Jean-de-Maurienne" },
  { id: "s5", category: "Chirurgien dentiste", name: "Dr. Andre SOARES", address: "24 rue du Docteur Grange", city: "73300 Saint-Jean-de-Maurienne" },
  { id: "s6", category: "Chirurgien dentiste", name: "Dr. Imen BELAAZI", address: "24 rue du Docteur Grange", city: "73300 Saint-Jean-de-Maurienne" },
];

const SEARCH_FILTERS = ["Chirurgien dentiste", "Médecin", "Coiffeur", "Esthéticienne", "Kiné", "Notaire"];

const SUGGESTIONS = ["Prendre un rendez-vous", "Je cherche mon ordonnance", "Je cherche un spécialiste", "Mes prochains RDV"];

const buildSystemPrompt = (user, network) => `
Tu es Livvia, l'assistante IA personnelle de ${user.name}.
Tu gères ses rendez-vous santé, bien-être et services du quotidien.

Réseau de ${user.name} :
${network.map(p => `- ${p.category} : ${p.name}${p.cabinet ? ` (${p.cabinet})` : ""}, ${p.address}, ${p.city}`).join("\n")}

Tes capacités : identifier le bon professionnel, proposer des créneaux, confirmer des RDV, répondre aux questions sur les pros.
Style : chaleureux, concis, naturel, toujours en français. Tu es Livvia, pas une IA.
`.trim();

// ── COLORS ───────────────────────────────────────────────────────────────────
const C = {
  teal: "#4ABFBF",
  tealLight: "#E8F5F5",
  tealMid: "#B2DEDE",
  navy: "#2D3561",
  navyLight: "#4A5080",
  white: "#FFFFFF",
  bg: "#F7FAFA",
  text: "#2D3561",
  textMuted: "#8A93B8",
  border: "#D8EEEE",
};

// ── AVATAR PLACEHOLDER ────────────────────────────────────────────────────────
function ProAvatar({ name, size = 52 }) {
  const initials = name.split(" ").filter(w => w.match(/[A-Z]/)).slice(0, 2).map(w => w[0]).join("");
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg, ${C.teal}, #2D8F8F)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: size * 0.3, flexShrink: 0, fontFamily: "inherit" }}>
      {initials || "?"}
    </div>
  );
}

// ── LIVVIA LOGO SVG ───────────────────────────────────────────────────────────
function LivviaLogo({ height = 40 }) {
  return (
    <img src="/Logo_Livvia_CMJN_Seul.png" height={height} alt="Livvia" style={{ objectFit: "contain" }} />
  );
}

// ── WAVE SHAPE ────────────────────────────────────────────────────────────────
function TopWave() {
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 0 }}>
      <div style={{ width: "100%", height: 130, background: C.teal, borderRadius: "0 0 50% 50%" }} />
    </div>
  );
}
function BottomWave() {
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 90, overflow: "hidden", zIndex: 0, pointerEvents: "none" }}>
      <div style={{ width: "140%", height: 130, background: C.teal, borderRadius: "60% 60% 0 0", marginLeft: "-20%", opacity: 0.9 }} />
    </div>
  );
}

// ── NAV BAR ───────────────────────────────────────────────────────────────────
function NavBar({ tab, setTab }) {
  const items = [
    { id: "chat", label: "Livvia", icon: <StarIcon /> },
    { id: "network", label: "Mon réseau", icon: <NetworkIcon /> },
    { id: "rdv", label: "Mes rendez-vous", icon: <CalIcon /> },
    { id: "profile", label: "Profil", icon: <UserIcon /> },
  ];
  return (
    <div style={{ position: "relative", zIndex: 10, background: "transparent" }}>
      <BottomWave />
      <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "space-around", padding: "10px 0 28px" }}>
        {items.map(it => (
          <button key={it.id} onClick={() => setTab(it.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: tab === it.id ? C.navy : "rgba(255,255,255,0.75)", fontFamily: "inherit" }}>
            <div style={{ opacity: tab === it.id ? 1 : 0.8 }}>{it.icon}</div>
            <span style={{ fontSize: 9.5, fontWeight: tab === it.id ? 800 : 500, letterSpacing: "0.2px" }}>{it.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function LivviaApp() {
  const [screen, setScreen] = useState("login");
  const [tab, setTab] = useState("chat");
  const [network, setNetwork] = useState(DEFAULT_NETWORK);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("Saint-Jean-de-Maurienne");
  const [searchFilter, setSearchFilter] = useState("Chirurgien dentiste");
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const login = () => {
    setScreen("app");
    setTimeout(() => setMessages([{ role: "assistant", content: `Bonjour ${USER.name} 👋\nComment puis-je vous aider ?` }]), 200);
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: buildSystemPrompt(USER, network),
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.content?.[0]?.text || "Je n'ai pas pu répondre." }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Une erreur s'est produite. Réessayez." }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const toggleFav = (id) => setNetwork(prev => prev.map(p => p.id === id ? { ...p, favorite: !p.favorite } : p));
  const addToNetwork = (pro) => {
    if (network.find(p => p.name === pro.name)) return;
    setNetwork(prev => [...prev, { ...pro, id: Date.now().toString(), cabinet: "", favorite: false }]);
    setTab("network");
  };

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  if (screen === "login") return (
    <div style={{ minHeight: "100vh", background: C.white, fontFamily: "'Nunito', 'Helvetica Neue', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", maxWidth: 390, margin: "0 auto", position: "relative", overflow: "hidden" }}>
      <TopWave />
      <div style={{ position: "relative", zIndex: 1, width: "100%", padding: "100px 32px 40px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <LivviaLogo height={52} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.navy, margin: "0 0 28px", textAlign: "center" }}>Se connecter</h2>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={fStyle.fieldWrap}>
            <span style={fStyle.fieldLabel}>Adresse E-mail</span>
            <div style={fStyle.field}>
              <span style={{ fontSize: 16, marginRight: 10 }}>✉️</span>
              <input style={fStyle.input} type="email" placeholder="adresse@mail.com" defaultValue="sebastien@livvia.fr" />
            </div>
          </div>
          <div style={fStyle.fieldWrap}>
            <span style={fStyle.fieldLabel}>Mot de passe</span>
            <div style={fStyle.field}>
              <span style={{ fontSize: 16, marginRight: 10 }}>🔒</span>
              <input style={fStyle.input} type="password" placeholder="••••••••" defaultValue="12345678" />
            </div>
          </div>
          <p style={{ textAlign: "right", color: C.textMuted, fontSize: 13, margin: "0 0 8px", cursor: "pointer" }}>Mot de passe oublié</p>
          <button style={fStyle.btn} onClick={login}>Se connecter</button>
        </div>
        <p style={{ color: C.textMuted, fontSize: 13, marginTop: 20 }}>
          Je n'ai pas de compte ? <span style={{ color: C.navy, fontWeight: 700, textDecoration: "underline", cursor: "pointer" }}>Je m'inscris</span>
        </p>
      </div>
    </div>
  );

  // ── APP ────────────────────────────────────────────────────────────────────
  return (
    <div style={{ height: "100vh", background: C.bg, fontFamily: "'Nunito', 'Helvetica Neue', sans-serif", display: "flex", flexDirection: "column", maxWidth: 390, margin: "0 auto", position: "relative", overflow: "hidden" }}>

      {/* ── CHAT TAB ── */}
      {tab === "chat" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
          <TopWave />
          {/* Livvia avatar header */}
          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 88, paddingBottom: 16 }}>
            <div style={{ width: 14, height: 14, background: C.teal, borderRadius: "50%", alignSelf: "flex-start", marginLeft: 60, marginBottom: -8, opacity: 0.7 }} />
            <div style={{ width: 90, height: 90, borderRadius: "50%", background: `linear-gradient(135deg, ${C.tealMid}, ${C.teal})`, border: `3px solid ${C.white}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "0 4px 20px rgba(74,191,191,0.3)" }}>
              <span style={{ fontSize: 44 }}>👩‍⚕️</span>
            </div>
            <h2 style={{ margin: "10px 0 2px", fontSize: 20, fontWeight: 800, color: C.navy }}>Bonjour {USER.name}</h2>
            <p style={{ margin: 0, fontSize: 14, color: C.textMuted }}>Comment puis-je vous aider ?</p>
          </div>

          {/* Chat area */}
          <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ background: C.tealLight, borderRadius: 16, padding: "14px 16px", minHeight: 140, display: "flex", flexDirection: "column", gap: 8 }}>
              {messages.slice(1).map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "82%", padding: "9px 13px", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: m.role === "user" ? C.teal : C.white, color: m.role === "user" ? C.white : C.navy, fontSize: 13.5, lineHeight: 1.55, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", whiteSpace: "pre-wrap" }}>
                    {m.content}
                  </div>
                </div>
              ))}
              {messages.length <= 1 && (
                <div style={{ color: C.textMuted, fontSize: 13, textAlign: "center", margin: "auto" }}>Posez votre question à Livvia…</div>
              )}
              {loading && (
                <div style={{ display: "flex" }}>
                  <div style={{ padding: "9px 14px", background: C.white, borderRadius: "14px 14px 14px 4px", display: "flex", gap: 5, alignItems: "center" }}>
                    {[0, 0.2, 0.4].map((d, i) => <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: C.teal, display: "inline-block", animation: `bounce 1.2s ${d}s infinite` }} />)}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Suggestions */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => sendMessage(s)} style={{ padding: "7px 14px", background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 20, color: C.navy, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{s}</button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div style={{ padding: "10px 16px 12px", background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 16, margin: "0 16px 12px", display: "flex", alignItems: "center", gap: 10 }}>
            <input ref={inputRef} style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: C.navy, fontFamily: "inherit", background: "transparent" }} placeholder="Posez votre question à Livvia" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} />
            <button style={{ width: 32, height: 32, borderRadius: "50%", background: C.tealLight, border: `1.5px solid ${C.teal}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.teal, fontSize: 16, flexShrink: 0 }} onClick={() => sendMessage()}>+</button>
          </div>

          <NavBar tab={tab} setTab={setTab} />
        </div>
      )}

      {/* ── NETWORK TAB ── */}
      {tab === "network" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
          <TopWave />
          <div style={{ position: "relative", zIndex: 1, paddingTop: 90, flex: 1, overflowY: "auto", paddingBottom: 8 }}>
            <h2 style={{ margin: "0 0 16px", fontSize: 22, fontWeight: 800, color: C.navy, textAlign: "center" }}>Mon réseaux</h2>
            <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Connected pros */}
              {network.map(pro => (
                <div key={pro.id} style={{ background: C.white, borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 2px 10px rgba(74,191,191,0.08)", border: `1px solid ${C.border}` }}>
                  <ProAvatar name={pro.name} size={54} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "inline-block", background: C.teal, color: C.white, borderRadius: 20, fontSize: 10, fontWeight: 700, padding: "2px 10px", marginBottom: 4 }}>{pro.category}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: C.navy, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pro.name}</div>
                    {pro.cabinet && <div style={{ fontSize: 11.5, color: C.textMuted }}>{pro.cabinet}</div>}
                    <div style={{ fontSize: 11.5, color: C.textMuted }}>{pro.address}</div>
                    <div style={{ fontSize: 11.5, color: C.textMuted }}>{pro.city}</div>
                  </div>
                  <button onClick={() => toggleFav(pro.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: pro.favorite ? "#F5C518" : C.border, flexShrink: 0 }}>★</button>
                </div>
              ))}
              {/* Add category buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                {ADD_CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => { setSearchFilter(cat); setTab("search"); }} style={{ background: C.tealLight, border: `1.5px solid ${C.tealMid}`, borderRadius: 12, padding: "14px", color: C.navy, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>{cat}</button>
                ))}
              </div>
            </div>
          </div>
          <NavBar tab={tab} setTab={setTab} />
        </div>
      )}

      {/* ── SEARCH TAB ── */}
      {tab === "search" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
          <TopWave />
          <div style={{ position: "relative", zIndex: 1, paddingTop: 90, flex: 1, overflowY: "auto", paddingBottom: 8 }}>
            <h2 style={{ margin: "0 16px 14px", fontSize: 20, fontWeight: 800, color: C.navy, textAlign: "center" }}>Recherchez votre spécialiste</h2>
            {/* Search bar */}
            <div style={{ margin: "0 16px 12px", display: "flex", gap: 8 }}>
              <div style={{ flex: 1, background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 24, padding: "10px 16px", display: "flex", alignItems: "center" }}>
                <input style={{ border: "none", outline: "none", flex: 1, fontSize: 13.5, color: C.navy, fontFamily: "inherit" }} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Ville ou code postal" />
              </div>
              <button style={{ width: 40, height: 40, borderRadius: "50%", background: C.tealLight, border: `1.5px solid ${C.teal}`, color: C.teal, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>+</button>
            </div>
            {/* Filter chips */}
            <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "0 16px 12px" }}>
              {SEARCH_FILTERS.map(f => (
                <button key={f} onClick={() => setSearchFilter(f)} style={{ padding: "6px 14px", borderRadius: 20, border: "none", background: searchFilter === f ? C.teal : C.tealLight, color: searchFilter === f ? C.white : C.navy, fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}>{f}</button>
              ))}
            </div>
            {/* Results */}
            <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
              {SEARCH_RESULTS.map(pro => {
                const inNetwork = network.find(p => p.name === pro.name);
                return (
                  <div key={pro.id} style={{ background: C.white, borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 2px 10px rgba(74,191,191,0.08)", border: `1px solid ${C.border}` }}>
                    <ProAvatar name={pro.name} size={52} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: C.navy }}>{pro.name}</div>
                      <div style={{ fontSize: 11.5, color: C.textMuted }}>{pro.address}</div>
                      <div style={{ fontSize: 11.5, color: C.textMuted }}>{pro.city}</div>
                    </div>
                    <button onClick={() => !inNetwork && addToNetwork(pro)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: inNetwork ? "#F5C518" : C.border, flexShrink: 0 }}>★</button>
                  </div>
                );
              })}
            </div>
          </div>
          <NavBar tab={tab} setTab={setTab} />
        </div>
      )}

      {/* ── RDV TAB ── */}
      {tab === "rdv" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
          <TopWave />
          <div style={{ position: "relative", zIndex: 1, paddingTop: 90, flex: 1, overflowY: "auto", padding: "90px 16px 16px" }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 800, color: C.navy, textAlign: "center" }}>Mes rendez-vous</h2>
            <div style={{ background: C.white, borderRadius: 16, padding: 20, textAlign: "center", color: C.textMuted, fontSize: 14, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📅</div>
              Aucun rendez-vous prévu.<br />
              <span style={{ color: C.teal, fontWeight: 700, cursor: "pointer" }} onClick={() => setTab("chat")}>Demander à Livvia →</span>
            </div>
          </div>
          <NavBar tab={tab} setTab={setTab} />
        </div>
      )}

      {/* ── PROFILE TAB ── */}
      {tab === "profile" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
          <TopWave />
          <div style={{ position: "relative", zIndex: 1, paddingTop: 90, flex: 1, overflowY: "auto", padding: "90px 16px 16px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 28 }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg, ${C.teal}, #2D8F8F)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: "#fff", fontWeight: 800 }}>{USER.name[0]}</div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: C.navy }}>{USER.name}</div>
                <div style={{ fontSize: 13, color: C.textMuted }}>{USER.email}</div>
              </div>
            </div>
            {[["👥", "Mon réseau", "network"], ["📅", "Mes rendez-vous", "rdv"], ["🔔", "Notifications", null], ["🔒", "Sécurité & confidentialité", null], ["❓", "Aide", null]].map(([icon, label, target]) => (
              <div key={label} onClick={() => target && setTab(target)} style={{ background: C.white, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, marginBottom: 8, cursor: target ? "pointer" : "default", border: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 18 }}>{icon}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.navy, flex: 1 }}>{label}</span>
                <span style={{ color: C.textMuted }}>›</span>
              </div>
            ))}
          </div>
          <NavBar tab={tab} setTab={setTab} />
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');
        @keyframes bounce{0%,80%,100%{transform:translateY(0);opacity:0.4}40%{transform:translateY(-5px);opacity:1}}
        *{box-sizing:border-box;} ::-webkit-scrollbar{width:0;}
        input::placeholder{color:#8A93B8;}
      `}</style>
    </div>
  );
}

// ── FORM STYLES ───────────────────────────────────────────────────────────────
const fStyle = {
  fieldWrap: { display: "flex", flexDirection: "column", gap: 4, width: "100%" },
  fieldLabel: { fontSize: 12, fontWeight: 700, color: "#4ABFBF", marginLeft: 4 },
  field: { display: "flex", alignItems: "center", background: "#fff", border: "1.5px solid #D8EEEE", borderRadius: 28, padding: "11px 18px" },
  input: { flex: 1, border: "none", outline: "none", fontSize: 14, color: "#2D3561", fontFamily: "inherit", background: "transparent" },
  btn: { padding: "15px", background: "linear-gradient(135deg, #4ABFBF, #2D9B9B)", color: "#fff", border: "none", borderRadius: 28, fontSize: 15, fontWeight: 800, cursor: "pointer", letterSpacing: "0.3px" },
};

// ── ICONS ─────────────────────────────────────────────────────────────────────
function StarIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>;
}
function NetworkIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function CalIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function UserIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
