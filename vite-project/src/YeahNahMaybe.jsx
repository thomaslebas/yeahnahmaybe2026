import { useState, useRef, useEffect } from "react";

const QUESTIONS = [
  { id: 1, statement: "The government should tax people's wealth and assets, not just their income." },
  { id: 2, statement: "The government should directly invest in creating jobs for young New Zealanders." },
  { id: 3, statement: "The tax system unfairly favours people who own rental properties over people trying to buy their first home." },
  { id: 4, statement: "Councils should be required to allow higher density housing in established neighbourhoods." },
  { id: 5, statement: "New Zealand should stop approving new oil and gas projects even if it means some people lose their jobs." },
  { id: 6, statement: "Development should not come at the cost of weakening environmental protections." },
  { id: 7, statement: "New Zealand's laws should be required to reflect the principles of the Treaty of Waitangi." },
  { id: 8, statement: "Māori electorates should be kept." },
  { id: 9, statement: "New Zealand's public health system is critically underfunded." },
  { id: 10, statement: "Private companies should not be brought in to run hospitals or public infrastructure." },
  { id: 11, statement: "Immigration levels in New Zealand should not be significantly reduced." },
  { id: 12, statement: "Social media companies should be legally responsible for harm they cause to young New Zealanders." },
];

const ANSWER_OPTIONS = [
  { label: "Yeah",        score: 5 },
  { label: "Mostly yeah", score: 4 },
  { label: "Dunno",       score: 3 },
  { label: "Mostly nah",  score: 2 },
  { label: "Nah",         score: 1 },
];

const PARTY_DATA = [
  { id: "greens",   name: "Greens",        emoji: "🟢", color: "#1db954", scores: [5,5,5,3,5,5,5,5,5,5,4,4] },
  { id: "tpm",      name: "Te Pāti Māori", emoji: "🟤", color: "#9B6B3C", scores: [5,5,5,3,4,5,5,5,5,5,4,4] },
  { id: "labour",   name: "Labour",        emoji: "🔴", color: "#E21820", scores: [3,4,4,4,3,4,4,5,4,4,3,4] },
  { id: "national", name: "National",      emoji: "🔵", color: "#00529F", scores: [2,2,3,4,1,2,2,3,2,2,3,3] },
  { id: "nzfirst",  name: "NZ First",      emoji: "⚫", color: "#000000", scores: [2,3,3,2,1,2,1,2,3,3,1,3] },
  { id: "act",      name: "ACT",           emoji: "🟡", color: "#d4a800", scores: [1,1,1,5,1,1,1,1,2,1,4,2] },
];


const SYSTEM_PROMPT = `You are Tua, the assistant for Yeah Nah Maybe, a voter advice tool for New Zealand's 2026 general election. You help users understand their quiz results and the political positions of NZ parties.

PARTY POSITIONS ON KEY STATEMENTS (score 1-5, where 5 = strongly agree):
1. Wealth/asset tax: ACT:1, National:2, NZ First:2, Labour:3, Greens:5, Te Pāti Māori:5
2. Government jobs investment: ACT:1, National:2, NZ First:3, Labour:4, Greens:5, Te Pāti Māori:5
3. Tax system favours landlords: ACT:1, National:3, NZ First:3, Labour:4, Greens:5, Te Pāti Māori:5
4. Higher density housing: ACT:5, National:4, Labour:4, Greens:3, NZ First:2, Te Pāti Māori:3
5. Stop oil and gas: ACT:1, National:1, NZ First:1, Labour:3, Greens:5, Te Pāti Māori:4
6. Environment over development: ACT:1, National:2, NZ First:2, Labour:4, Greens:5, Te Pāti Māori:5
7. Treaty principles in law: ACT:1, National:2, NZ First:1, Labour:4, Greens:5, Te Pāti Māori:5
8. Keep Māori electorates: ACT:1, National:3, NZ First:2, Labour:5, Greens:5, Te Pāti Māori:5
9. Health underfunded: ACT:2, National:2, NZ First:3, Labour:4, Greens:5, Te Pāti Māori:5
10. No private hospitals: ACT:1, National:2, NZ First:3, Labour:4, Greens:5, Te Pāti Māori:5
11. Keep immigration levels: ACT:4, National:3, NZ First:1, Labour:3, Greens:4, Te Pāti Māori:4
12. Social media liability: ACT:2, National:3, NZ First:3, Labour:4, Greens:4, Te Pāti Māori:4

YOUR RULES:
- Never tell the user who to vote for
- Never express a preference for any party
- Be direct and conversational — write like a knowledgeable friend, not a textbook
- Keep responses short — 2 to 3 sentences by default. Only go longer if the person explicitly asks for more detail.
- No bullet points or lists. Write in prose.
- Keep sentences short. No exclamation marks. No filler phrases.
- Do not end responses with follow-up questions or invitations to keep talking. Let the person lead.
- If asked about corruption, scandals, or party leaders' character, say that's not something you can assess
- You can answer simple factual questions about NZ elections (how MMP works, enrolment, election day)`;

function calcResults(answers) {
  const parties = PARTY_DATA.map((party) => {
    let totalWeight = 0, totalDist = 0;
    answers.forEach((a, i) => {
      const w = a.important ? 2 : 1;
      totalDist += Math.abs(a.score - party.scores[i]) * w;
      totalWeight += 4 * w;
    });
    return { ...party, pct: Math.round((1 - totalDist / totalWeight) * 100) };
  });
  parties.sort((a, b) => b.pct - a.pct);
  return { parties };
}

function copyToClipboard(text) {
  try {
    const el = document.createElement("textarea");
    el.value = text; el.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(el); el.focus(); el.select();
    document.execCommand("copy"); document.body.removeChild(el);
  } catch(e) {}
}

const F = "'Nunito', sans-serif";
const ACCENT = "#808061";

// Dark mode hook
function useDark() {
  const [dark, setDark] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return dark;
}

function useTheme(dark) {
  return {
    BG:     dark ? "#141410" : "#f4f3ec",
    BUBBLE: dark ? "#1e1e17" : "#ffffff",
    DARK:   dark ? "#eeeee0" : "#252518",
    MID:    dark ? "#b8b88a" : "#5c5c3d",
    PALE:   dark ? "#7a7a58" : "#a8a882",
    BORDER: dark ? "#38382a" : "#ddddc8",
    BAR:    dark ? "#141410" : "#f4f3ec",
    CHIP:   dark ? "#c8c896" : "#808061",
  };
}

function TypingBubble({ theme }) {
  return (
    <div style={{ display:"flex", justifyContent:"flex-start", marginBottom:8, animation:"fadeUp 0.2s ease-out" }}>
      <div style={{ background: theme.BUBBLE, borderRadius:"5px 20px 20px 20px", boxShadow:"0 2px 8px rgba(0,0,0,0.08)", padding:"9px 14px", display:"flex", gap:5, alignItems:"center", minHeight: "37px" }}>
        {[0,1,2].map((i) => (
          <div key={i} style={{ width:6, height:6, borderRadius:"50%", background: theme.PALE, animation:"bounce 1.2s ease-in-out infinite", animationDelay:`${i*0.2}s` }} />
        ))}
      </div>
    </div>
  );
}

function AppBubble({ content, theme }) {
  return (
    <div style={{ display:"flex", justifyContent:"flex-start", marginBottom:8, animation:"fadeUp 0.3s ease-out" }}>
      <div style={{ maxWidth:"82%", background: theme.BUBBLE, color: theme.DARK, borderRadius:"5px 20px 20px 20px", padding:"9px 14px", fontSize:15, lineHeight:1.6, fontFamily:F, fontWeight:400, boxShadow:"0 2px 8px rgba(0,0,0,0.08)", whiteSpace:"pre-line" }}>
        {content}
      </div>
    </div>
  );
}

function UserBubble({ content }) {
  return (
    <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:8, animation:"fadeUp 0.3s ease-out" }}>
      <div style={{ maxWidth:"82%", background: ACCENT, color:"#fff", borderRadius:"20px 20px 5px 20px", padding:"9px 14px", fontSize:15, lineHeight:1.6, fontFamily:F, fontWeight:400 }}>
        {content}
      </div>
    </div>
  );
}

function Chips({ options, onSelect, theme }) {
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginBottom:10, justifyContent:"flex-end", animation:"fadeUp 0.3s ease-out 0.1s both" }}>
      {options.map((opt) => (
        <button key={opt.label} onClick={() => onSelect(opt)}
          style={{ background:"transparent", border:`1px solid ${theme.CHIP}`, borderRadius:"20px 20px 5px 20px", padding:"8px 13px", fontSize:15, fontWeight:400, color:theme.CHIP, cursor:"pointer", fontFamily:F, transition:"background 0.15s" }}
          onMouseEnter={(e) => { if (canHover) e.currentTarget.style.background = "rgba(128,128,97,0.15)"; }}
          onMouseLeave={(e) => { if (canHover) e.currentTarget.style.background = "transparent"; }}
        >{opt.label}</button>
      ))}
    </div>
  );
}

function ActionRow({ copied, onCopy, onShare, theme }) {
  const canShare = typeof navigator !== "undefined" && !!navigator.share;
  const base = { borderRadius:99, padding:"5px 14px", fontSize:15, fontWeight:400, cursor:"pointer", fontFamily:F, transition:"all 0.2s", background:"none", border:`1px solid ${theme.BORDER}`, color: theme.MID };
  return (
    <div style={{ marginTop:12, paddingTop:10, borderTop:`1px solid ${theme.BORDER}`, display:"flex", gap:8 }}>
      <button onClick={onCopy} style={{ ...base, background: copied ? ACCENT : "none", border:`1px solid ${copied ? ACCENT : theme.BORDER}`, color: copied ? "#fff" : theme.MID }}>
        {copied ? "Copied ✓" : "Copy"}
      </button>
      {canShare && <button onClick={onShare} style={base}>Share</button>}
    </div>
  );
}

function ResultBubbles({ results, theme, dark, onCopy }) {
  const [mc, setMc] = useState(false);
  const [showM, setShowM] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowM(true), 100);
    return () => { clearTimeout(t1); };
  }, []);

  const mt = "My political party matches for 2026:\n\n" + results.parties.map((p) => `${p.emoji} ${p.name} — ${p.pct}%`).join("\n") + "\n\nFind out yours → www.yeahnahmaybe.nz";

  const bs = { maxWidth:"82%", background: theme.BUBBLE, color: theme.DARK, borderRadius:"5px 20px 20px 20px", padding:"9px 14px", fontSize:15, lineHeight:1.6, fontFamily:F, fontWeight:400, boxShadow:"0 2px 8px rgba(0,0,0,0.08)" };

  return (
    <>
      {showM && (
        <div style={{ display:"flex", justifyContent:"flex-start", marginBottom:8, animation:"fadeUp 0.4s ease-out" }}>
          <div style={bs}>
            <div style={{ marginBottom:10 }}>Your matches:</div>
            {results.parties.map((p) => (
              <div key={p.name} style={{ display:"flex", alignItems:"center", marginBottom:8, gap:9 }}>
                <span style={{ fontSize:15, lineHeight:1 }}>{p.emoji}</span>
                <span style={{ flex:1, color: theme.DARK, fontFamily:F }}>{p.name}</span>
                <div style={{ width:72, height:5, background: theme.BORDER, borderRadius:99, overflow:"hidden" }}>
                  <div style={{ width:`${p.pct}%`, height:"100%", background: p.id === "nzfirst" ? (dark ? "#999999" : "#000000") : p.color, borderRadius:99, transition:"width 0.9s cubic-bezier(0.16,1,0.3,1)" }} />
                </div>
                <span style={{ minWidth:32, textAlign:"right", color: theme.DARK, fontFamily:F }}>{p.pct}%</span>
              </div>
            ))}
            <ActionRow copied={mc} onCopy={() => { copyToClipboard(mt); setMc(true); setTimeout(() => setMc(false), 2000); if (onCopy) onCopy(); }} onShare={() => navigator.share({text:mt}).catch(()=>{})} theme={theme} />
          </div>
        </div>
      )}
    </>
  );
}

const STAGE = { WELCOME:"welcome", LANDING:"landing", ENROLMENT:"enrolment", LIKELIHOOD_PRE:"likelihood_pre", QUESTION:"question", IMPORTANCE:"importance", CALCULATING:"calculating", RESULTS:"results", AGE:"age", CHAT:"chat", LIKELIHOOD_POST:"likelihood_post" };

const INTRO = [
  { pause: 600,  text: "Kia ora, I'm Tua! 👋" },
  { pause: 2000, text: "Kiwis come to me to take the Yeah Nah Maybe quiz — to figure out which political parties they actually align with, based on 12 issues." },
  { pause: 1200, text: "It takes about 3 minutes if you're keen." },
];

export default function YeahNahMaybe() {
  const dark = useDark();
  const theme = useTheme(dark);

  const [msgs,          setMsgs]          = useState([]);
  const [welcomePhase, setWelcomePhase]  = useState(0); // 0=typing, 1=bubble, 2=cta
  const [ctaPressed,   setCtaPressed]   = useState(false);
  const [typing,        setTyping]        = useState(false);
  const [stage,         setStage]         = useState(STAGE.WELCOME);
  const [locked,        setLocked]        = useState(true);
  const [qIndex,        setQIndex]        = useState(0);
  const [answers,       setAnswers]       = useState([]);
  const [pendingAnswer, setPendingAnswer] = useState(null);
  const [results,       setResults]       = useState(null);
  const [chatHistory,   setChatHistory]   = useState([]);
  const [sessionId,     setSessionId]     = useState(null);
  const [showAbout,     setShowAbout]     = useState(false);
  const [aboutClosing,  setAboutClosing]  = useState(false);
  const [enrolled,      setEnrolled]      = useState(null);
  const [likelihoodPre, setLikelihoodPre] = useState(null);
  const [ageGroup,      setAgeGroup]      = useState(null);
  const [postAsked,     setPostAsked]     = useState(false);
  const [input,         setInput]         = useState("");
  const [aiLoading,     setAiLoading]     = useState(false);
  const bottomRef = useRef(null);
  const canHover = typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches;

  function push(role, content) {
    setMsgs((prev) => [...prev, { role, content }]);
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
    const t = setTimeout(() => bottomRef.current?.scrollIntoView({ behavior:"smooth" }), 950);
    return () => clearTimeout(t);
  }, [msgs, typing, stage, aiLoading]);

  useEffect(() => {
    if (stage !== STAGE.WELCOME) return;
    setWelcomePhase(0);
    setSessionId(Date.now().toString(36) + Math.random().toString(36).slice(2, 6));
    setEnrolled(null); setLikelihoodPre(null); setAgeGroup(null); setPostAsked(false); setSessionId(null);
              setCtaPressed(false);
    const t1 = setTimeout(() => setWelcomePhase(1), 1200);
    const t2 = setTimeout(() => setWelcomePhase(2), 3000);
    const t3 = setTimeout(() => setWelcomePhase(3), 3600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [stage]);

  useEffect(() => {
    if (stage !== STAGE.LANDING) return;
    let cursor = 0;
    const timers = [];
    INTRO.forEach((item, i) => {
      timers.push(setTimeout(() => setTyping(true), cursor));
      cursor += item.pause;
      timers.push(setTimeout(() => {
        setTyping(false);
        push("app", item.text);
        if (i === INTRO.length - 1) setTimeout(() => setLocked(false), 150);
      }, cursor));
      cursor += 100;
    });
    return () => timers.forEach(clearTimeout);
  }, [stage]);

  function typeAndPush(text, delay, cb) {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      push("app", text);
      if (cb) cb();
    }, delay);
  }

  // Two-bubble version: sends a label bubble then a content bubble
  function typeAndPush2(text1, text2, delay1, delay2, cb) {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      push("app", text1);
      setTimeout(() => {
        setTyping(true);
        setTimeout(() => {
          setTyping(false);
          push("app", text2);
          if (cb) cb();
        }, delay2);
      }, 100);
    }, delay1);
  }

  function handleStart() {
    setLocked(true);
    push("user", "Yes, let's go!");
    typeAndPush("Before we start — are you enrolled to vote? 🗳️", 700, () => {
      setStage(STAGE.ENROLMENT);
      setLocked(false);
    });
  }

  function handleEnrolment(label) {
    setLocked(true);
    setEnrolled(label);
    push("user", label);
    saveMeasurement("enrolled", label);
    typeAndPush("And how likely are you to vote in 2026 at the moment?", 700, () => {
      setStage(STAGE.LIKELIHOOD_PRE);
      setLocked(false);
    });
  }

  function handleLikelihoodPre(label) {
    setLocked(true);
    setLikelihoodPre(label);
    push("user", label);
    saveMeasurement("likelihood_pre", label);
    typeAndPush("Great, thanks for sharing! Let's go through the 12 issues now.", 800, () => {
      typeAndPush2(`💬 Statement 1 of 12`, QUESTIONS[0].statement, 600, 1200, () => {
        setStage(STAGE.QUESTION);
        setLocked(false);
      });
    });
  }

  function handleAnswer(opt) {
    setLocked(true);
    push("user", opt.label);
    setPendingAnswer({ score: opt.score });
    typeAndPush("Is this an important topic to you?", 600, () => {
      setStage(STAGE.IMPORTANCE);
      setLocked(false);
    });
  }

  function handleImportance(important) {
    setLocked(true);
    push("user", important ? "Yeah" : "Skip");
    const newAnswer = { score: pendingAnswer.score, important };
    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);
    const next = qIndex + 1;

    if (next < QUESTIONS.length) {
      setQIndex(next);
      typeAndPush2(
        `💬 Statement ${next + 1} of 12`,
        QUESTIONS[next].statement,
        600, 1200,
        () => { setStage(STAGE.QUESTION); setLocked(false); }
      );
    } else {
      setStage(STAGE.CALCULATING);
      setTimeout(() => {
        const res = calcResults(newAnswers);
        setResults(res);
        typeAndPush("Tēnā koe e hoa! Here's where you landed:", 600, () => {
          push("results", res);
          setStage(STAGE.RESULTS);
          setTimeout(() => {
            typeAndPush("Lastly, how old are you?", 1200, () => {
              setStage(STAGE.AGE);
              setLocked(false);
            });
          }, 1800);
        });
      }, 1500);
    }
  }

  function handleAge(label) {
    setLocked(true);
    setAgeGroup(label);
    push("user", label);
    saveMeasurement("age", label);
    typeAndPush("As for your matches, did anything surprise you? Feel free to ask me about your results, the topics, or even the election 🗣️", 800, () => {
      setStage(STAGE.CHAT);
      setLocked(false);
    });
  }

  async function sendChat(text) {
    if (!text.trim() || aiLoading) return;
    setLocked(true);
    push("user", text);
    setInput("");
    const newHistory = [...chatHistory, { role:"user", content:text }];
    setChatHistory(newHistory);
    setAiLoading(true);
    setTyping(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system: SYSTEM_PROMPT + (results ? `\n\nUSER'S RESULTS:\nOverall matches: ${results.parties.map(p=>`${p.name}: ${p.pct}%`).join(", ")}\n\nUser's answer to each statement (1=strongly disagree, 5=strongly agree; * = flagged as important):\n${answers.map((a, i) => `${i+1}. ${QUESTIONS[i].statement} → ${a.score}${a.important ? " *" : ""}`).join("\n")}` : ""),
          messages: newHistory,
        }),
      });
      const data = await res.json();
      const reply = data.content ? data.content.map((b) => b.text||"").join("") : "Something went wrong.";
      setChatHistory([...newHistory, { role:"assistant", content:reply }]);
      setTyping(false);
      push("app", reply);
      if (!postAsked) {
        setPostAsked(true);
        setTimeout(() => {
          typeAndPush("Has any of our conversation so far changed whether you'll vote this election? 👀", 1200, () => {
            setStage(STAGE.LIKELIHOOD_POST);
            setLocked(false);
          });
        }, 800);
      }
    } catch {
      setTyping(false);
      push("app", "Something went wrong. Try again.");
    }
    setAiLoading(false);
    if (postAsked) setLocked(false);
  }

  async function saveMeasurement(key, value) {
    try {
      const existing = await window.storage.get(`session:${sessionId}`).catch(() => null);
      const data = existing ? JSON.parse(existing.value) : { sessionId, timestamp: new Date().toISOString() };
      data[key] = value;
      await window.storage.set(`session:${sessionId}`, JSON.stringify(data), true);
    } catch(e) {}
  }

  function handleLikelihoodPost(label) {
    setLocked(true);
    push("user", label);
    saveMeasurement("likelihood_post", label);
    typeAndPush("Thanks for sharing that. Any other questions?", 700, () => {
      setStage(STAGE.CHAT);
      setLocked(false);
    });
  }

  function trackCopy() {
    saveMeasurement("copy_clicks", Date.now());
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
        @keyframes fadeUp { from { opacity:0; } to { opacity:1; } }
        @keyframes bounce { 0%,80%,100% { transform:translateY(0); } 40% { transform:translateY(-6px); } }
        @keyframes slideUp { from { transform:translateY(100%); } to { transform:translateY(0); } }
        * { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:'Nunito',sans-serif; background:${theme.BG}; }
        textarea:focus { outline:none; }
        textarea::placeholder { color:${theme.PALE}; font-family:'Nunito',sans-serif; font-weight:400; }
      `}</style>

      <div style={{ minHeight:"100vh", background: theme.BG, display:"flex", flexDirection:"column", alignItems:"center" }}>
                  {stage === STAGE.WELCOME && (
          <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 28px", minHeight:"100vh" }}>
            <div style={{ maxWidth:480, width:"100%", display:"flex", flexDirection:"column", alignItems:"flex-start", gap:0 }}>
              <div style={{ fontSize:13, fontWeight:400, color: theme.MID, fontFamily:F, letterSpacing:"0.04em", marginBottom:12 }}>New Zealand General Election 2026</div>
              <h1 style={{ fontSize:56, fontWeight:900, color: theme.DARK, fontFamily:F, lineHeight:1, letterSpacing:"-2px", marginBottom:32 }}>Yeah Nah Maybe…</h1>

              <div style={{ display:"flex", flexDirection:"row", alignItems:"flex-start", gap:8, marginBottom:8 }}>
                <div style={{ width:40, height:40, borderRadius:"50%", background:ACCENT, flexShrink:0 }} />
                <div style={{ position:"relative" }}>
                  {/* Typing dots — absolute so it doesn't affect layout */}
                  <div style={{ position:"absolute", top:0, left:0, background: theme.BUBBLE, borderRadius:"5px 20px 20px 20px", padding:"24px 18px", boxShadow:"0 2px 8px rgba(0,0,0,0.08)", display:"flex", gap:6, alignItems:"center", opacity: welcomePhase === 0 ? 1 : 0, transition:"opacity 0.3s ease-out", pointerEvents:"none" }}>
                    {[0,1,2].map((i) => (
                      <div key={i} style={{ width:7, height:7, borderRadius:"50%", background: theme.PALE, animation:"bounce 1.2s ease-in-out infinite", animationDelay:`${i*0.2}s` }} />
                    ))}
                  </div>
                  {/* Real bubble — always in flow to hold space, fades in */}
                  <div style={{ background: theme.BUBBLE, color: theme.DARK, borderRadius:"5px 20px 20px 20px", padding:"12px 18px", fontSize:19, lineHeight:1.6, fontFamily:F, fontWeight:400, boxShadow:"0 2px 8px rgba(0,0,0,0.08)", opacity: welcomePhase >= 1 ? 1 : 0, transition:"opacity 0.4s ease-out", maxWidth:"82%" }}>Here to help Kiwis get started with political parties</div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (welcomePhase < 2 || ctaPressed) return;
                  setCtaPressed(true);
                  setTimeout(() => setStage(STAGE.LANDING), 500);
                }}
                style={{
                  background: ctaPressed ? ACCENT : "transparent",
                  color: ctaPressed ? "#fff" : theme.CHIP,
                  border: `1px solid ${theme.CHIP}`,
                  borderRadius: "20px 20px 5px 20px",
                  padding: "12px 18px", fontSize: 19, fontWeight: 400, fontFamily: F,
                  cursor: welcomePhase >= 2 ? "pointer" : "default",
                  transition: "opacity 0.4s ease-out, background 0.15s, color 0.15s",
                  alignSelf: "flex-end",
                  opacity: welcomePhase >= 2 ? 1 : 0,
                  pointerEvents: welcomePhase >= 2 ? "auto" : "none",
                }}
                onMouseEnter={(e) => { if (canHover && !ctaPressed) { e.currentTarget.style.background = "rgba(128,128,97,0.15)"; } }}
                onMouseLeave={(e) => { if (canHover && !ctaPressed) { e.currentTarget.style.background = "transparent"; } }}
              >Let's talk</button>


            </div>
          </div>
        )}
                  {stage !== STAGE.WELCOME && (<>
        <div style={{ position:"sticky", top:0, zIndex:10, width:"100%", background: theme.BAR, borderBottom:`1px solid ${theme.BORDER}`, display:"flex", justifyContent:"center" }}>
          <div style={{ width:"100%", maxWidth:520, padding:"10px 20px", display:"flex", alignItems:"center", gap:10 }}>
            <button onClick={() => {
              setStage(STAGE.WELCOME);
              setMsgs([]);
              setTyping(false);
              setLocked(true);
              setQIndex(0);
              setAnswers([]);
              setPendingAnswer(null);
              setResults(null);
              setChatHistory([]);
              setInput("");
            }} style={{ background:"none", border:"none", cursor:"pointer", padding:"4px 8px 4px 0", color: theme.MID, display:"flex", alignItems:"center", flexShrink:0 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 16l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <div style={{ width:36, height:36, borderRadius:"50%", background:ACCENT, flexShrink:0 }} />
            <span style={{ fontFamily:F, fontWeight:700, fontSize:16, color: theme.DARK }}>Tua</span>
            <button onClick={() => { setAboutClosing(false); setShowAbout(true); }} style={{ background:"none", border:"none", cursor:"pointer", padding:"4px", color: theme.MID, display:"flex", alignItems:"center", marginLeft:"auto", flexShrink:0 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5"/><path d="M10 9v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="10" cy="6.5" r="0.75" fill="currentColor"/></svg>
            </button>
          </div>
        </div>
                  <div style={{ flex:1, width:"100%", maxWidth:520, padding:"12px 14px 0", display:"flex", flexDirection:"column" }}>

          {msgs.map((m, i) =>
            m.role === "app"     ? <AppBubble key={i} content={m.content} theme={theme} /> :
            m.role === "results" ? <ResultBubbles key={i} results={m.content} theme={theme} dark={dark} onCopy={trackCopy} /> :
                                   <UserBubble key={i} content={m.content} />
          )}

          {typing && <TypingBubble theme={theme} />}
                  {stage === STAGE.LANDING && !locked && (
            <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:8, animation:"fadeUp 0.3s ease-out 0.1s both" }}>
              <button onClick={handleStart}
                style={{ background:"transparent", border:`1px solid ${theme.CHIP}`, borderRadius:"20px 20px 5px 20px", padding:"8px 16px", fontSize:15, fontWeight:400, color:theme.CHIP, cursor:"pointer", fontFamily:F, transition:"background 0.15s" }}
                onMouseEnter={(e) => { if (canHover) e.currentTarget.style.background = "rgba(128,128,97,0.15)"; }}
                onMouseLeave={(e) => { if (canHover) e.currentTarget.style.background = "transparent"; }}
              >Yes, let's go!</button>
            </div>
          )}
                  {stage === STAGE.QUESTION && !locked && (
            <Chips options={ANSWER_OPTIONS} onSelect={handleAnswer} theme={theme} />
          )}
                  {stage === STAGE.IMPORTANCE && !locked && (
            <Chips options={[{ label:"Yeah" }, { label:"Skip" }]} onSelect={(opt) => handleImportance(opt.label === "Yeah")} theme={theme} />
          )}
                  {stage === STAGE.ENROLMENT && !locked && (
            <Chips options={[{ label:"Yeah" }, { label:"Nah" }, { label:"Not sure" }]} onSelect={(opt) => handleEnrolment(opt.label)} theme={theme} />
          )}

                  {stage === STAGE.LIKELIHOOD_PRE && !locked && (
            <Chips options={[{ label:"Likely" }, { label:"Not likely" }, { label:"Not sure" }]} onSelect={(opt) => handleLikelihoodPre(opt.label)} theme={theme} />
          )}

                  {stage === STAGE.AGE && !locked && (
            <Chips options={["Under 16","16–17","18–19","20–24","25–29","30+"].map(l => ({ label: l }))} onSelect={(opt) => handleAge(opt.label)} theme={theme} />
          )}

                  {stage === STAGE.LIKELIHOOD_POST && !locked && (
            <Chips options={[{ label:"Likely" }, { label:"Not likely" }, { label:"Not sure" }]} onSelect={(opt) => handleLikelihoodPost(opt.label)} theme={theme} />
          )}


          <div ref={bottomRef} style={{ height: stage === STAGE.CHAT ? 100 : 40 }} />
        </div>
                  {stage === STAGE.CHAT && (
          <div style={{ position:"fixed", bottom:0, width:"100%", maxWidth:520, padding:"12px 16px 20px", background:`linear-gradient(transparent, ${theme.BG} 35%)` }}>
            <div style={{ display:"flex", gap:8, background: theme.BUBBLE, border:`1px solid ${theme.BORDER}`, borderRadius:18, padding:"10px 10px 10px 16px", boxShadow:"0 4px 20px rgba(0,0,0,0.1)" }}>
              <textarea value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); sendChat(input); } }}
                placeholder="Ask about your result..." rows={1}
                style={{ flex:1, border:"none", background:"none", resize:"none", fontSize:15, fontWeight:400, color: theme.DARK, fontFamily:F, lineHeight:1.5 }}
              />
              <button onClick={() => sendChat(input)} disabled={!input.trim()||aiLoading}
                style={{ background: input.trim()&&!aiLoading ? ACCENT : theme.BORDER, color: input.trim()&&!aiLoading ? "#fff" : theme.PALE, border:"none", borderRadius:12, width:36, height:36, cursor: input.trim()&&!aiLoading ? "pointer" : "default", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s", flexShrink:0 }}
              >↑</button>
            </div>
          </div>
        )}

      {/* About overlay */}
      {showAbout && (
        <div
          style={{ position:"fixed", inset:0, zIndex:100, display:"flex", alignItems:"flex-end", justifyContent:"center", background: aboutClosing ? "rgba(0,0,0,0)" : "rgba(0,0,0,0.4)", transition:"background 0.3s ease" }}
          onClick={() => { setAboutClosing(true); setTimeout(() => { setShowAbout(false); setAboutClosing(false); }, 300); }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width:"100%", maxWidth:520, background: theme.BUBBLE, borderRadius:"20px 20px 0 0", padding:"28px 24px 40px", fontFamily:F, color: theme.DARK, maxHeight:"80vh", overflowY:"auto", transform: aboutClosing ? "translateY(100%)" : "translateY(0)", transition:"transform 0.3s ease", animation: aboutClosing ? "none" : "slideUp 0.3s ease" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <span style={{ fontSize:17, fontWeight:700 }}>About Yeah Nah Maybe</span>
              <button onClick={() => { setAboutClosing(true); setTimeout(() => { setShowAbout(false); setAboutClosing(false); }, 300); }} style={{ background:"none", border:"none", cursor:"pointer", color: theme.MID, fontSize:22, lineHeight:1, padding:4 }}>×</button>
            </div>
            <p style={{ fontSize:15, lineHeight:1.7, color: theme.MID, marginBottom:16 }}>Yeah Nah Maybe is a voter advice tool for New Zealand's 2026 general election. Tua, an AI tuatara, takes you through 12 issues and shows you which parties most closely match where you stand — based on their publicly stated positions.</p>
            <p style={{ fontSize:15, lineHeight:1.7, color: theme.MID, marginBottom:16 }}>It was made by Thomas Le Bas, a Kiwi designer in London looking to help others get engaged in their future. No funding, no hidden agenda — just a belief that more people should have their say.</p>
            <p style={{ fontSize:15, lineHeight:1.7, color: theme.MID, marginBottom:16 }}>Demographic data and your results are collected to improve the tool. AI conversations may also be used to make Tua better. Your individual answers aren't stored, and nothing is linked to your identity.</p>
            <p style={{ fontSize:15, lineHeight:1.7, color: theme.MID, marginBottom:24 }}>Tua can make mistakes. If you haven't enrolled to vote yet, visit vote.nz — it takes a few minutes.</p>
            <a href="https://vote.nz" target="_blank" rel="noopener noreferrer" style={{ display:"inline-block", background: ACCENT, color:"#fff", borderRadius:"20px", padding:"10px 22px", fontSize:15, fontWeight:600, fontFamily:F, textDecoration:"none" }}>Enrol to vote</a>
            <p style={{ fontSize:15, lineHeight:1.7, color: theme.MID, marginTop:24, marginBottom:12 }}>Check out these other tools to help you out:</p>
            <a href="https://www.policy.nz" target="_blank" rel="noopener noreferrer" style={{ display:"inline-block", background: ACCENT, color:"#fff", borderRadius:"20px", padding:"10px 22px", fontSize:15, fontWeight:600, fontFamily:F, textDecoration:"none" }}>policy.nz</a>
          </div>
        </div>
      )}

      </>)}
      </div>
    </>
  );
}
