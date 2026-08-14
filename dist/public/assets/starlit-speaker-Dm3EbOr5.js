import{l as e,n as t,r as n,t as r}from"./createLucideIcon-CCWgZ3HE.js";import{t as i}from"./queryClient-Cs-tqtdS.js";import{t as a}from"./chevron-left-DNYC6ym9.js";import{t as o}from"./circle-alert-DgiAsKS9.js";import{t as s}from"./clock-cnywqKQ3.js";import{t as c}from"./mic-BIGzjW-0.js";import{t as l}from"./users-D7cMdoKU.js";import{I as u,L as d,R as f,d as p,g as m}from"./index-B4QSyPTD.js";var h=r(`Square`,[[`rect`,{width:`18`,height:`18`,x:`3`,y:`3`,rx:`2`,key:`afitv7`}]]),g=e(n(),1),_=t(),v=[{value:`impromptu`,label:`🎯 Impromptu`,color:`#f87171`,rgb:`248,113,113`},{value:`storytelling`,label:`📚 Storytelling`,color:`#c084fc`,rgb:`192,132,252`},{value:`debate`,label:`⚖️ Devil's Advocate`,color:`#fb923c`,rgb:`251,146,60`},{value:`presentation`,label:`💼 Pitch`,color:`#60a5fa`,rgb:`96,165,250`},{value:`motivational`,label:`🔥 Motivation`,color:`#fbbf24`,rgb:`251,191,36`},{value:`philosophical`,label:`🤔 Deep Thoughts`,color:`#34d399`,rgb:`52,211,153`}],y=[`Convince an alien why pizza is humanity's greatest invention.`,`Explain the internet to someone from the 1800s.`,`Pitch a reality show about introverts.`,`Argue why midnight snacks are a fundamental human right.`,`Describe your ideal world in 2050.`,`What would you do if you had one hour left on Earth?`];function b(e){return v.find(t=>t.value===e)?.color??`#c084fc`}function x(e){return v.find(t=>t.value===e)?.label??e}function S(e){return`${Math.floor(e/60)}:${String(e%60).padStart(2,`0`)}`}function C({analyser:e,active:t}){let n=(0,g.useRef)(null),r=(0,g.useRef)(0);return(0,g.useEffect)(()=>{let i=n.current;if(!i||!e||!t)return;let a=i.getContext(`2d`),o=new Uint8Array(e.frequencyBinCount),s=()=>{r.current=requestAnimationFrame(s),e.getByteTimeDomainData(o),a.clearRect(0,0,i.width,i.height),a.lineWidth=2,a.strokeStyle=`#c084fc`,a.shadowColor=`#c084fc`,a.shadowBlur=8,a.beginPath();let t=i.width/o.length,n=0;for(let e=0;e<o.length;e++){let r=o[e]/128*(i.height/2);e===0?a.moveTo(n,r):a.lineTo(n,r),n+=t}a.lineTo(i.width,i.height/2),a.stroke()};return s(),()=>cancelAnimationFrame(r.current)},[e,t]),(0,g.useEffect)(()=>{if(t)return;let e=n.current;if(!e)return;let r=e.getContext(`2d`);r.clearRect(0,0,e.width,e.height),r.lineWidth=1,r.strokeStyle=`rgba(192,132,252,0.2)`,r.beginPath(),r.moveTo(0,e.height/2),r.lineTo(e.width,e.height/2),r.stroke()},[t]),(0,_.jsx)(`canvas`,{ref:n,width:600,height:80,style:{width:`100%`,height:80,borderRadius:12}})}function w(){let[,e]=p(),t=f(),[n,r]=(0,g.useState)(``),[w,E]=(0,g.useState)(``),[D,O]=(0,g.useState)(!1),[k,A]=(0,g.useState)(0),[j,M]=(0,g.useState)(null),[N,P]=(0,g.useState)(null),[F,I]=(0,g.useState)(null),[L]=(0,g.useState)(()=>y[Math.floor(Math.random()*y.length)]),R=(0,g.useRef)(null),z=(0,g.useRef)(null),B=(0,g.useRef)(null),[V,H]=(0,g.useState)(null),U=(0,g.useRef)([]),{data:W=[]}=d({queryKey:[`/api/v1/speaker`],refetchInterval:3e4}),{data:G}=d({queryKey:[`/api/v1/speaker/stats`],refetchInterval:6e4}),K=u({mutationFn:e=>i(`POST`,`/api/v1/speaker`,e),onSuccess:()=>t.invalidateQueries({queryKey:[`/api/v1/speaker`]})});(0,g.useEffect)(()=>{if(!D){A(0);return}let e=setInterval(()=>A(e=>e+1),1e3);return()=>clearInterval(e)},[D]);let q=(0,g.useCallback)(async()=>{if(n){M(null),P(null);try{let e=await navigator.mediaDevices.getUserMedia({audio:!0,video:!1});R.current=e;let t=new AudioContext;B.current=t;let r=t.createAnalyser();r.fftSize=2048,t.createMediaStreamSource(e).connect(r),H(r);let i=new MediaRecorder(e);z.current=i,U.current=[],i.ondataavailable=e=>{e.data.size>0&&U.current.push(e.data)},i.onstop=()=>{let e=new Blob(U.current,{type:`audio/webm`});P(URL.createObjectURL(e))},i.start(200),O(!0);let a=await K.mutateAsync({roomName:`${x(n)} – ${new Date().toLocaleTimeString([],{hour:`2-digit`,minute:`2-digit`})}`,topic:n,description:w.trim()||`A live speaking session`,maxParticipants:10}),o=a?.data?.id??a?.id??null;I(o)}catch(e){M(e?.name===`NotAllowedError`?`Microphone access was denied. Please allow it in your browser settings.`:`Could not access your microphone. Try again.`)}}},[n,w,K]),J=(0,g.useCallback)(()=>{z.current?.stop(),R.current?.getTracks().forEach(e=>e.stop()),B.current?.close(),H(null),O(!1),F&&(i(`PATCH`,`/api/v1/speaker/${F}/end`,{}),t.invalidateQueries({queryKey:[`/api/v1/speaker`]}),t.invalidateQueries({queryKey:[`/api/v1/speaker/stats`]}),I(null))},[F,t]);(0,g.useEffect)(()=>()=>{D&&J()},[]);let Y=!!n&&!!navigator.mediaDevices?.getUserMedia;return(0,_.jsxs)(`div`,{style:{minHeight:`100vh`,background:`#05050a`,color:`#e2e8f0`,fontFamily:`Inter, system-ui, sans-serif`},children:[(0,_.jsx)(`style`,{children:T}),(0,_.jsxs)(`button`,{className:`ss-back`,onClick:()=>e(`/`),children:[(0,_.jsx)(a,{className:`ss-back-icon`}),` Back`]}),(0,_.jsxs)(`div`,{className:`ss-shell`,children:[(0,_.jsxs)(`header`,{className:`ss-header`,children:[(0,_.jsxs)(`div`,{className:`ss-header-icon`,children:[(0,_.jsx)(c,{className:`ss-header-mic`}),D&&(0,_.jsx)(`span`,{className:`ss-live-dot`})]}),(0,_.jsxs)(`div`,{children:[(0,_.jsx)(`h1`,{className:`ss-title`,children:`Starlit Speaker`}),(0,_.jsx)(`p`,{className:`ss-subtitle`,children:`Voice rooms for people who think better out loud.`})]})]}),(0,_.jsx)(`div`,{className:`ss-stats`,children:[{icon:(0,_.jsx)(l,{className:`ss-stat-icon`}),value:G?.activeRooms??`—`,label:`Live rooms`},{icon:(0,_.jsx)(c,{className:`ss-stat-icon`}),value:G?.totalSessions??`—`,label:`Total sessions`},{icon:(0,_.jsx)(s,{className:`ss-stat-icon`}),value:S(k),label:D?`Recording`:`Duration`}].map((e,t)=>(0,_.jsxs)(`div`,{className:`ss-stat`,children:[e.icon,(0,_.jsx)(`span`,{className:`ss-stat-value`,children:String(e.value)}),(0,_.jsx)(`span`,{className:`ss-stat-label`,children:e.label})]},t))}),(0,_.jsxs)(`div`,{className:`ss-card`,children:[(0,_.jsxs)(`div`,{className:`ss-card-header`,children:[(0,_.jsx)(`span`,{className:`ss-card-title`,children:`Practice Studio`}),(0,_.jsx)(`span`,{className:`ss-prompt`,children:L})]}),(0,_.jsxs)(`div`,{className:`ss-section`,children:[(0,_.jsx)(`label`,{className:`ss-label`,children:`Choose a format`}),(0,_.jsx)(`div`,{className:`ss-topics`,children:v.map(e=>(0,_.jsx)(`button`,{className:`ss-topic-btn ${n===e.value?`is-on`:``}`,style:{"--tc":e.color,"--tr":e.rgb},onClick:()=>!D&&r(e.value),disabled:D,children:e.label},e.value))})]}),(0,_.jsxs)(`div`,{className:`ss-section`,children:[(0,_.jsxs)(`label`,{className:`ss-label`,children:[`Key points / outline `,(0,_.jsx)(`span`,{className:`ss-optional`,children:`(optional)`})]}),(0,_.jsx)(`textarea`,{className:`ss-textarea`,value:w,onChange:e=>E(e.target.value),disabled:D,placeholder:`Bullet points, opening line, structure... or just wing it.`,rows:3})]}),(0,_.jsx)(`div`,{className:`ss-waveform`,children:(0,_.jsx)(C,{analyser:V,active:D})}),j&&(0,_.jsxs)(`div`,{className:`ss-error`,children:[(0,_.jsx)(o,{className:`ss-error-icon`}),j]}),(0,_.jsxs)(`div`,{className:`ss-controls`,children:[(0,_.jsx)(`button`,{className:`ss-record-btn ${D?`is-recording`:``}`,onClick:D?J:q,disabled:!Y,children:D?(0,_.jsxs)(_.Fragment,{children:[(0,_.jsx)(h,{className:`ss-btn-icon`}),` Stop — `,S(k)]}):(0,_.jsxs)(_.Fragment,{children:[(0,_.jsx)(c,{className:`ss-btn-icon`}),` Start Speaking`]})}),!Y&&!D&&(0,_.jsx)(`p`,{className:`ss-hint`,children:`Select a format above to enable recording.`})]}),N&&!D&&(0,_.jsxs)(`div`,{className:`ss-playback`,children:[(0,_.jsxs)(`div`,{className:`ss-playback-header`,children:[(0,_.jsx)(m,{className:`ss-play-icon`}),(0,_.jsx)(`span`,{children:`Your recording`})]}),(0,_.jsx)(`audio`,{controls:!0,src:N,className:`ss-audio`}),(0,_.jsx)(`p`,{className:`ss-playback-hint`,children:`This recording lives only in your browser and is never uploaded.`})]})]}),(0,_.jsxs)(`div`,{className:`ss-card`,children:[(0,_.jsxs)(`div`,{className:`ss-card-header`,children:[(0,_.jsx)(`span`,{className:`ss-card-title`,children:`Active Sessions`}),(0,_.jsxs)(`span`,{className:`ss-rooms-count`,children:[W.length,` live`]})]}),W.length===0?(0,_.jsxs)(`div`,{className:`ss-empty`,children:[(0,_.jsx)(c,{className:`ss-empty-icon`}),(0,_.jsx)(`p`,{children:`No active sessions right now.`}),(0,_.jsx)(`p`,{className:`ss-empty-sub`,children:`Be the first to start speaking tonight.`})]}):(0,_.jsx)(`div`,{className:`ss-rooms`,children:W.map(e=>(0,_.jsxs)(`div`,{className:`ss-room`,style:{"--rc":b(e.topic)},children:[(0,_.jsx)(`div`,{className:`ss-room-dot`}),(0,_.jsxs)(`div`,{className:`ss-room-info`,children:[(0,_.jsx)(`span`,{className:`ss-room-name`,children:e.roomName}),(0,_.jsx)(`span`,{className:`ss-room-topic`,style:{color:b(e.topic)},children:x(e.topic)})]}),(0,_.jsxs)(`span`,{className:`ss-room-count`,children:[(0,_.jsx)(l,{style:{width:13,height:13}}),e.currentParticipants]})]},e.id))})]})]})]})}var T=`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.ss-back {
  position: fixed; top: 16px; left: 20px; z-index: 50;
  display: flex; align-items: center; gap: 4px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 100px; padding: 7px 14px 7px 10px;
  color: #9ca3af; font-size: 13px; cursor: pointer; font-family: inherit;
  transition: all 0.2s;
}
.ss-back:hover { background: rgba(255,255,255,0.08); color: #e2e8f0; }
.ss-back-icon { width: 15px; height: 15px; }

.ss-shell {
  max-width: 700px; margin: 0 auto;
  padding: 80px 16px 60px;
  display: flex; flex-direction: column; gap: 24px;
}

/* Header */
.ss-header {
  display: flex; align-items: center; gap: 18px;
}
.ss-header-icon {
  position: relative;
  width: 60px; height: 60px; border-radius: 20px; flex-shrink: 0;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 24px rgba(139,92,246,0.4);
}
.ss-header-mic { width: 26px; height: 26px; color: white; }
.ss-live-dot {
  position: absolute; top: -4px; right: -4px;
  width: 14px; height: 14px; border-radius: 50%;
  background: #ef4444;
  box-shadow: 0 0 8px #ef4444;
  animation: livePulse 1.2s ease-in-out infinite;
}
@keyframes livePulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: 0.7; } }
.ss-title { font-size: 28px; font-weight: 800; letter-spacing: -0.03em; color: #f1f5f9; }
.ss-subtitle { font-size: 14px; color: rgba(148,163,184,0.7); margin-top: 4px; }

/* Stats */
.ss-stats {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
}
.ss-stat {
  background: rgba(255,255,255,0.035);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px; padding: 16px 12px;
  display: flex; flex-direction: column; align-items: center; gap: 4px;
}
.ss-stat-icon { width: 16px; height: 16px; color: #c084fc; }
.ss-stat-value { font-size: 18px; font-weight: 700; color: #f1f5f9; }
.ss-stat-label { font-size: 11px; color: rgba(148,163,184,0.6); text-align: center; }

/* Card */
.ss-card {
  background: linear-gradient(155deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 22px;
  padding: 22px;
  display: flex; flex-direction: column; gap: 20px;
}
.ss-card-header {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 8px;
}
.ss-card-title { font-size: 15px; font-weight: 650; color: #f1f5f9; }
.ss-prompt {
  font-size: 11.5px; color: #a78bfa;
  background: rgba(167,139,250,0.1);
  border: 1px solid rgba(167,139,250,0.2);
  border-radius: 100px; padding: 3px 10px;
  max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* Topic picker */
.ss-section { display: flex; flex-direction: column; gap: 8px; }
.ss-label { font-size: 12px; font-weight: 500; color: rgba(148,163,184,0.7); }
.ss-optional { font-weight: 400; color: rgba(148,163,184,0.45); }
.ss-topics { display: flex; flex-wrap: wrap; gap: 8px; }
.ss-topic-btn {
  padding: 7px 14px;
  border-radius: 100px;
  border: 1px solid rgba(255,255,255,0.07);
  background: rgba(255,255,255,0.04);
  color: #9ca3af; font-size: 13px; cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.ss-topic-btn:hover:not(:disabled) { background: rgba(255,255,255,0.07); color: #e2e8f0; }
.ss-topic-btn.is-on {
  color: var(--tc, #c084fc);
  background: rgba(var(--tr, 192,132,252), 0.13);
  border-color: rgba(var(--tr, 192,132,252), 0.3);
}
.ss-topic-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Notes */
.ss-textarea {
  width: 100%; background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px; padding: 12px 14px;
  color: #e2e8f0; font-size: 13px; font-family: inherit;
  line-height: 1.6; resize: none;
  transition: border-color 0.2s;
}
.ss-textarea::placeholder { color: rgba(148,163,184,0.4); }
.ss-textarea:focus { outline: none; border-color: rgba(192,132,252,0.35); }

/* Waveform */
.ss-waveform {
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px; padding: 8px;
}

/* Error */
.ss-error {
  display: flex; align-items: center; gap: 8px;
  color: #f87171; font-size: 13px;
  background: rgba(248,113,113,0.08);
  border: 1px solid rgba(248,113,113,0.2);
  border-radius: 12px; padding: 10px 14px;
}
.ss-error-icon { width: 16px; height: 16px; flex-shrink: 0; }

/* Record button */
.ss-controls { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.ss-record-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 14px 32px; border-radius: 100px; border: none;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white; font-size: 15px; font-weight: 600; font-family: inherit;
  cursor: pointer;
  box-shadow: 0 6px 24px rgba(139,92,246,0.4);
  transition: all 0.25s;
}
.ss-record-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(139,92,246,0.55); }
.ss-record-btn:active:not(:disabled) { transform: scale(0.98); }
.ss-record-btn.is-recording {
  background: linear-gradient(135deg, #b91c1c, #ef4444);
  box-shadow: 0 6px 24px rgba(239,68,68,0.4);
  animation: recordPulse 1.5s ease-in-out infinite;
}
@keyframes recordPulse { 0%,100% { box-shadow: 0 6px 24px rgba(239,68,68,0.4); } 50% { box-shadow: 0 6px 36px rgba(239,68,68,0.7); } }
.ss-record-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }
.ss-btn-icon { width: 18px; height: 18px; }
.ss-hint { font-size: 12px; color: rgba(148,163,184,0.5); }

/* Playback */
.ss-playback {
  background: rgba(192,132,252,0.07);
  border: 1px solid rgba(192,132,252,0.18);
  border-radius: 14px; padding: 14px 16px;
  display: flex; flex-direction: column; gap: 8px;
}
.ss-playback-header { display: flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 600; color: #c084fc; }
.ss-play-icon { width: 14px; height: 14px; }
.ss-audio { width: 100%; height: 36px; }
.ss-playback-hint { font-size: 11px; color: rgba(148,163,184,0.45); }

/* Active rooms */
.ss-rooms-count {
  font-size: 12px; color: #34d399;
  background: rgba(52,211,153,0.1);
  border: 1px solid rgba(52,211,153,0.2);
  border-radius: 100px; padding: 2px 9px;
}
.ss-rooms { display: flex; flex-direction: column; gap: 8px; }
.ss-room {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  transition: border-color 0.2s;
}
.ss-room:hover { border-color: rgba(var(--rc), 0.2); }
.ss-room-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
  background: #34d399; box-shadow: 0 0 6px #34d399;
  animation: livePulse 2s ease-in-out infinite;
}
.ss-room-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.ss-room-name { font-size: 13.5px; font-weight: 600; color: #f1f5f9; }
.ss-room-topic { font-size: 11.5px; font-weight: 500; }
.ss-room-count { display: flex; align-items: center; gap: 4px; font-size: 12px; color: rgba(148,163,184,0.6); flex-shrink: 0; }

.ss-empty { text-align: center; padding: 24px 0; color: rgba(148,163,184,0.5); font-size: 14px; display: flex; flex-direction: column; gap: 6px; align-items: center; }
.ss-empty-icon { width: 32px; height: 32px; opacity: 0.3; }
.ss-empty-sub { font-size: 12px; }
`;export{w as default};