const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/pdf-CDt1r41-.js","assets/index-BfoXjodX.js","assets/createLucideIcon-CCWgZ3HE.js","assets/react-dom-CaMV9Noo.js","assets/queryClient-Cs-tqtdS.js","assets/tslib.es6-RDtbomIe.js","assets/dist-BGHpO508.js","assets/dist-CArAw4f8.js","assets/utils-DolZwP--.js","assets/index-CmGw1ciH.css"])))=>i.map(i=>d[i]);
import{l as e,n as t,r as n,t as r}from"./createLucideIcon-CCWgZ3HE.js";import{t as i}from"./arrow-left-BbsjRhDO.js";import{n as a,t as o}from"./library-CDk_NMlm.js";import{t as s}from"./book-open-CrzhHGC3.js";import{t as c}from"./brain-Cb_83i9u.js";import{t as l}from"./check-CT3bd5zp.js";import{t as ee}from"./chevron-right-DpGAUsgC.js";import{t as te}from"./clock-cnywqKQ3.js";import{t as u}from"./eye-BB-6QWuN.js";import{n as ne,r as d,t as f}from"./upload-D_T1lYUg.js";import{t as p}from"./heart-BhmFdtYL.js";import{t as m}from"./moon-WNiUgwJ5.js";import{t as re}from"./refresh-cw-Cayz2PVr.js";import{t as h}from"./shield-ChZn4q_J.js";import{t as g}from"./sparkles-CjVQATNF.js";import{I as ie,R as ae,c as oe,d as _,t as v,y}from"./index-BfoXjodX.js";import{t as b}from"./button-D3yz7iFv.js";import{t as se}from"./textarea-ClgajJ_V.js";import{t as x}from"./input-Cn28ANUx.js";import{t as S}from"./reading-modes-CHsDlC1j.js";var C=r(`Bed`,[[`path`,{d:`M2 4v16`,key:`vw9hq8`}],[`path`,{d:`M2 8h18a2 2 0 0 1 2 2v10`,key:`1dgv2r`}],[`path`,{d:`M2 17h20`,key:`18nfp3`}],[`path`,{d:`M6 8v9`,key:`1yriud`}]]),w=e(n(),1);function ce(e,t=1400){let[n,r]=(0,w.useState)(null),[i,a]=(0,w.useState)(!1),[o,s]=(0,w.useState)(null),c=(0,w.useRef)(null),l=(0,w.useRef)(null);return(0,w.useEffect)(()=>{let n=e.trim();if(n.split(/\s+/).length<20){r(null),s(null);return}return c.current&&clearTimeout(c.current),c.current=setTimeout(async()=>{l.current&&l.current.abort(),l.current=new AbortController,a(!0),s(null);try{let e=n.split(/\s+/).slice(0,800).join(` `),t=await fetch(`/api/v1/reads/analyze-mood`,{method:`POST`,headers:{"Content-Type":`application/json`},credentials:`include`,body:JSON.stringify({textSample:e}),signal:l.current.signal});if(!t.ok)throw Error(`Analysis failed`);let i=await t.json();r(i)}catch(e){e.name!==`AbortError`&&s(`Could not analyse mood`)}finally{a(!1)}},t),()=>{c.current&&clearTimeout(c.current)}},[e,t]),{result:n,isAnalyzing:i,error:o}}var T=null;async function E(){if(T)return T;T=await v(()=>import(`./pdf-CDt1r41-.js`),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9]));let e=new URL(`/assets/pdf.worker.min-iDqQPrd3.mjs`,``+import.meta.url).href;return T.GlobalWorkerOptions.workerSrc=e,T}async function le(e,t){let n=await E(),r=await e.arrayBuffer(),i=await n.getDocument({data:r}).promise,a=i.numPages,o=[];for(let e=1;e<=a;e++){let n=(await(await i.getPage(e)).getTextContent()).items.map(e=>`str`in e?e.str:``).join(` `);o.push(n),t&&t(Math.round(e/a*100))}let s=o.join(`

`).replace(/\s+/g,` `).trim(),c=s.split(/\s+/).filter(Boolean).length;return{text:s,pageCount:a,wordCount:c,estimatedReadMinutes:Math.max(1,Math.ceil(c/200)),preview:s.slice(0,320)+(s.length>320?`…`:``)}}var D=t(),O=[{id:`intention`,label:`Intention`,sublabel:`Why tonight?`,icon:s},{id:`content`,label:`Content`,sublabel:`What to read`,icon:d},{id:`begin`,label:`Begin`,sublabel:`Enter the room`,icon:u}],k={learn:{icon:c,gradient:`from-sky-500 to-blue-600`,glow:`shadow-sky-500/30`,ring:`ring-sky-500/50`,border:`border-sky-500/30`,bg:`bg-sky-500/10`,accent:`#38bdf8`,tagline:`Clarity · Speed · Retention`,sample:`"A decision tree is a flowchart-like structure in which each internal node represents a feature..."`},feel:{icon:p,gradient:`from-rose-500 to-orange-500`,glow:`shadow-rose-500/30`,ring:`ring-rose-500/50`,border:`border-rose-500/30`,bg:`bg-rose-500/10`,accent:`#fb7185`,tagline:`Emotion · Warmth · Immersion`,sample:`"The rain came quietly, like an apology no one had asked for..."`},think:{icon:m,gradient:`from-violet-500 to-indigo-600`,glow:`shadow-violet-500/30`,ring:`ring-violet-500/50`,border:`border-violet-500/30`,bg:`bg-violet-500/10`,accent:`#a78bfa`,tagline:`Reflection · Depth · Stillness`,sample:`"What does it mean to truly know something? Is certainty even possible?"`},sleep:{icon:C,gradient:`from-slate-500 to-gray-700`,glow:`shadow-slate-500/20`,ring:`ring-slate-500/40`,border:`border-slate-600/30`,bg:`bg-slate-600/10`,accent:`#94a3b8`,tagline:`Calm · Slow · Release`,sample:`"Breathe. The house is quiet now. Let the words come slowly..."`}};function A(){let[,e]=_(),{user:t}=oe(),n=ae(),[r,c]=(0,w.useState)(`intention`),[p,m]=(0,w.useState)(null),[v,C]=(0,w.useState)(!1),[T,E]=(0,w.useState)(`text`),[A,M]=(0,w.useState)(``),[N,ue]=(0,w.useState)(``),[P,de]=(0,w.useState)(``),[F,I]=(0,w.useState)(null),[fe,L]=(0,w.useState)(!1),[R,pe]=(0,w.useState)(!1),[z,B]=(0,w.useState)(!1),[V,H]=(0,w.useState)(0),[U,W]=(0,w.useState)(null),[G,K]=(0,w.useState)(null),[q,me]=(0,w.useState)(!1),J=(0,w.useRef)(null),{result:Y,isAnalyzing:X}=ce(T===`text`?P:U?.text??``);(0,w.useEffect)(()=>{if(!F){W(null),K(null),H(0);return}if(F.type===`application/pdf`)B(!0),K(null),H(0),le(F,H).then(e=>{W(e),A||M(F.name.replace(/\.pdf$/i,``))}).catch(()=>K(`Could not extract text from this PDF.`)).finally(()=>B(!1));else{let e=new FileReader;e.onload=e=>{let t=e.target?.result;W({text:t,pageCount:1,wordCount:t.split(/\s+/).filter(Boolean).length,estimatedReadMinutes:Math.max(1,Math.ceil(t.split(/\s+/).length/200)),preview:t.slice(0,320)+(t.length>320?`…`:``)}),A||M(F.name.replace(/\.txt$/i,``))},e.readAsText(F)}},[F]);let he=(0,w.useCallback)(e=>{e.preventDefault(),L(!0)},[]),ge=(0,w.useCallback)(e=>{e.preventDefault(),L(!1)},[]),_e=(0,w.useCallback)(e=>{e.preventDefault(),L(!1);let t=e.dataTransfer.files[0];t&&(t.type===`application/pdf`||t.name.endsWith(`.txt`))&&I(t)},[]),ve=e=>{let t=e.target.files?.[0];t&&I(t)},Z=!!p,Q=T===`text`?P.trim().length>0&&!!A:!!U&&!!A,$=ie({mutationFn:async e=>{let t=await fetch(`/api/v1/reads`,{method:`POST`,credentials:`include`,body:e});if(!t.ok){let e=await t.json();throw Error(e.error||`Failed to create read`)}return t.json()},onSuccess:t=>{n.invalidateQueries({queryKey:[`/api/v1/reads/mine`]}),e(`/reader/${t.id}`)}}),ye=()=>{if(!p||!R)return;let e=new FormData;e.append(`title`,A||`Untitled`),N&&e.append(`author`,N),e.append(`intention`,p),e.append(`isEphemeral`,String(v)),T===`file`&&U?e.append(`content`,U.text):e.append(`content`,P),$.mutate(e)};if(!t)return(0,D.jsxs)(`div`,{className:`rc-shell`,children:[(0,D.jsxs)(`div`,{className:`rc-gate`,children:[(0,D.jsx)(s,{className:`rc-gate-icon`}),(0,D.jsx)(`p`,{className:`rc-gate-text`,children:`Sign in to enter the reading room`}),(0,D.jsx)(b,{onClick:()=>e(`/auth`),children:`Sign In`})]}),(0,D.jsx)(`style`,{children:j})]});let be=O.findIndex(e=>e.id===r);return(0,D.jsxs)(`div`,{className:`rc-shell`,children:[(0,D.jsx)(`style`,{children:j}),(0,D.jsx)(`div`,{className:`rc-orb rc-orb-1`}),(0,D.jsx)(`div`,{className:`rc-orb rc-orb-2`}),(0,D.jsxs)(`div`,{className:`rc-frame`,children:[(0,D.jsxs)(`aside`,{className:`rc-rail`,children:[(0,D.jsxs)(`div`,{className:`rc-rail-brand`,children:[(0,D.jsx)(s,{className:`rc-rail-logo`}),(0,D.jsx)(`span`,{className:`rc-rail-title`,children:`Read Card`})]}),(0,D.jsx)(`nav`,{className:`rc-rail-nav`,children:O.map((e,t)=>{let n=e.icon,i=t===0&&!!p||t===1&&Q||!1,a=t===0||t===1&&Z||t===2&&Q,o=r===e.id;return(0,D.jsxs)(`button`,{className:`rc-rail-tab ${o?`is-active`:``} ${i?`is-done`:``} ${a?``:`is-locked`}`,onClick:()=>a&&c(e.id),disabled:!a,"aria-current":o?`step`:void 0,children:[t>0&&(0,D.jsx)(`span`,{className:`rc-connector ${be>=t?`is-lit`:``}`}),(0,D.jsxs)(`span`,{className:`rc-rail-dot`,children:[i?(0,D.jsx)(l,{className:`w-3.5 h-3.5`}):(0,D.jsx)(n,{className:`w-3.5 h-3.5`}),o&&(0,D.jsx)(`span`,{className:`rc-dot-pulse`})]}),(0,D.jsxs)(`span`,{className:`rc-rail-labels`,children:[(0,D.jsx)(`span`,{className:`rc-rail-label`,children:e.label}),(0,D.jsx)(`span`,{className:`rc-rail-sub`,children:e.sublabel})]}),o&&(0,D.jsx)(ee,{className:`rc-rail-arrow`})]},e.id)})}),(0,D.jsxs)(`button`,{className:`rc-rail-shelf`,onClick:()=>e(`/read-alone`),children:[(0,D.jsx)(o,{className:`w-4 h-4`}),(0,D.jsx)(`span`,{children:`My Bookshelf`})]})]}),(0,D.jsxs)(`main`,{className:`rc-main`,children:[r===`intention`&&(0,D.jsxs)(`div`,{className:`rc-panel rc-anim`,children:[(0,D.jsxs)(`header`,{className:`rc-panel-head`,children:[(0,D.jsx)(`h1`,{className:`rc-panel-title`,children:`Why are you reading tonight?`}),(0,D.jsx)(`p`,{className:`rc-panel-sub`,children:`Your intention shapes everything — pace, feel, even the silence between words.`})]}),(0,D.jsx)(`div`,{className:`rc-modes`,children:Object.keys(k).map(e=>{let t=k[e],n=S[e],r=t.icon,i=p===e;return(0,D.jsxs)(`button`,{className:`rc-mode-card ${i?`is-selected`:``}`,style:{"--mode-accent":t.accent},onClick:()=>{m(e),setTimeout(()=>c(`content`),320)},children:[(0,D.jsx)(`div`,{className:`rc-mode-icon-wrap bg-gradient-to-br ${t.gradient}`,children:(0,D.jsx)(r,{className:`w-5 h-5 text-white`})}),(0,D.jsxs)(`div`,{className:`rc-mode-body`,children:[(0,D.jsxs)(`div`,{className:`rc-mode-top`,children:[(0,D.jsx)(`h3`,{className:`rc-mode-name`,children:n.label}),i&&(0,D.jsx)(l,{className:`w-4 h-4 rc-mode-check`})]}),(0,D.jsx)(`p`,{className:`rc-mode-desc`,children:n.description}),(0,D.jsx)(`p`,{className:`rc-mode-tagline`,children:t.tagline}),(0,D.jsx)(`blockquote`,{className:`rc-mode-sample`,children:t.sample})]}),i&&(0,D.jsx)(`span`,{className:`rc-mode-glow`})]},e)})}),(0,D.jsxs)(`div`,{className:`rc-panel-footer`,children:[(0,D.jsxs)(b,{variant:`ghost`,onClick:()=>e(`/`),className:`text-gray-500`,children:[(0,D.jsx)(i,{className:`w-4 h-4 mr-2`}),` Home`]}),(0,D.jsxs)(b,{disabled:!Z,onClick:()=>c(`content`),className:`rc-btn-next`,children:[`Continue `,(0,D.jsx)(a,{className:`w-4 h-4 ml-2`})]})]})]}),r===`content`&&p&&(0,D.jsxs)(`div`,{className:`rc-panel rc-anim`,children:[(0,D.jsxs)(`header`,{className:`rc-panel-head`,children:[(0,D.jsx)(`h1`,{className:`rc-panel-title`,children:`What are you reading?`}),(0,D.jsx)(`p`,{className:`rc-panel-sub`,children:`Paste text or upload a PDF — we'll read the mood so you don't have to guess.`})]}),(0,D.jsxs)(`div`,{className:`rc-input-tabs`,children:[(0,D.jsxs)(`button`,{className:`rc-input-tab ${T===`text`?`is-active`:``}`,onClick:()=>E(`text`),children:[(0,D.jsx)(ne,{className:`w-4 h-4`}),` Paste Text`]}),(0,D.jsxs)(`button`,{className:`rc-input-tab ${T===`file`?`is-active`:``}`,onClick:()=>E(`file`),children:[(0,D.jsx)(f,{className:`w-4 h-4`}),` Upload File`]})]}),T===`text`&&(0,D.jsxs)(`div`,{className:`rc-content-zone`,children:[(0,D.jsx)(se,{value:P,onChange:e=>de(e.target.value),placeholder:`Paste your text here… chapters, essays, stories, anything.`,className:`rc-textarea`}),P.trim().length>0&&(0,D.jsxs)(`p`,{className:`rc-word-count`,children:[P.split(/\s+/).filter(Boolean).length.toLocaleString(),` words \xA0·\xA0 ~`,Math.max(1,Math.ceil(P.split(/\s+/).filter(Boolean).length/200)),` min read`]})]}),T===`file`&&(0,D.jsx)(`div`,{className:`rc-content-zone`,children:(0,D.jsxs)(`div`,{className:`rc-dropzone ${fe?`is-dragging`:``} ${F?`has-file`:``}`,onDragOver:he,onDragLeave:ge,onDrop:_e,onClick:()=>!F&&J.current?.click(),children:[z?(0,D.jsxs)(`div`,{className:`rc-extract-progress`,children:[(0,D.jsx)(y,{className:`w-8 h-8 text-indigo-400 animate-spin`}),(0,D.jsxs)(`p`,{className:`text-sm text-gray-300 mt-3`,children:[`Extracting text… `,V,`%`]}),(0,D.jsx)(`div`,{className:`rc-progress-bar`,children:(0,D.jsx)(`div`,{className:`rc-progress-fill`,style:{width:`${V}%`}})})]}):F&&U?(0,D.jsxs)(`div`,{className:`rc-file-card`,children:[(0,D.jsx)(d,{className:`w-8 h-8 text-indigo-400 mb-2`}),(0,D.jsx)(`p`,{className:`font-medium text-sm`,children:F.name}),(0,D.jsxs)(`p`,{className:`text-xs text-gray-500 mt-1`,children:[U.pageCount,` pages · `,U.wordCount.toLocaleString(),` words · ~`,U.estimatedReadMinutes,` min`]}),(0,D.jsxs)(`div`,{className:`rc-file-actions`,children:[(0,D.jsxs)(b,{variant:`ghost`,size:`sm`,onClick:e=>{e.stopPropagation(),me(!q)},className:`text-xs text-indigo-400`,children:[(0,D.jsx)(u,{className:`w-3 h-3 mr-1`}),q?`Hide`:`Preview`,` text`]}),(0,D.jsxs)(b,{variant:`ghost`,size:`sm`,onClick:e=>{e.stopPropagation(),I(null),W(null)},className:`text-xs text-gray-500`,children:[(0,D.jsx)(re,{className:`w-3 h-3 mr-1`}),` Replace`]})]}),q&&(0,D.jsx)(`div`,{className:`rc-preview-text`,children:U.preview})]}):G?(0,D.jsxs)(`div`,{className:`rc-drop-empty`,children:[(0,D.jsx)(d,{className:`w-8 h-8 text-red-400 mb-2`}),(0,D.jsx)(`p`,{className:`text-sm text-red-400`,children:G}),(0,D.jsx)(b,{variant:`ghost`,size:`sm`,onClick:()=>{I(null),K(null)},children:`Try again`})]}):(0,D.jsxs)(`div`,{className:`rc-drop-empty`,children:[(0,D.jsx)(f,{className:`w-8 h-8 text-gray-500 mb-3`}),(0,D.jsx)(`p`,{className:`text-sm text-gray-400 font-medium`,children:`Drop PDF or TXT here`}),(0,D.jsx)(`p`,{className:`text-xs text-gray-600 mt-1`,children:`or click to browse · Max 10 MB`})]}),(0,D.jsx)(`input`,{ref:J,type:`file`,accept:`.pdf,.txt`,onChange:ve,className:`hidden`})]})}),(X||Y)&&(0,D.jsx)(`div`,{className:`rc-mood-banner ${X?`is-loading`:``}`,children:X?(0,D.jsxs)(D.Fragment,{children:[(0,D.jsx)(y,{className:`w-4 h-4 animate-spin text-indigo-400 shrink-0`}),(0,D.jsx)(`span`,{className:`text-sm text-gray-400`,children:`Reading the mood of your text…`})]}):Y?(0,D.jsxs)(D.Fragment,{children:[(0,D.jsx)(g,{className:`w-4 h-4 text-amber-400 shrink-0`}),(0,D.jsxs)(`div`,{className:`rc-mood-body`,children:[(0,D.jsxs)(`p`,{className:`rc-mood-text`,children:[(0,D.jsx)(`span`,{className:`rc-mood-mode`,children:S[Y.suggestedMode].label}),` `,`mode suggested`,(0,D.jsxs)(`span`,{className:`rc-mood-conf`,children:[` · `,Y.confidence,`% match`]})]}),(0,D.jsx)(`p`,{className:`rc-mood-reason`,children:Y.reasoning})]}),Y.suggestedMode!==p&&(0,D.jsx)(`button`,{className:`rc-mood-use`,onClick:()=>m(Y.suggestedMode),children:`Use this`}),Y.suggestedMode===p&&(0,D.jsxs)(`span`,{className:`rc-mood-match`,children:[(0,D.jsx)(l,{className:`w-3 h-3 mr-1 inline`}),`Matches your choice`]})]}):null}),(0,D.jsxs)(`div`,{className:`rc-meta-grid`,children:[(0,D.jsxs)(`div`,{children:[(0,D.jsx)(`label`,{className:`rc-label`,children:`Title *`}),(0,D.jsx)(x,{value:A,onChange:e=>M(e.target.value),placeholder:`Give it a name…`,className:`rc-input`})]}),(0,D.jsxs)(`div`,{children:[(0,D.jsxs)(`label`,{className:`rc-label`,children:[`Author `,(0,D.jsx)(`span`,{className:`text-gray-600`,children:`(optional)`})]}),(0,D.jsx)(x,{value:N,onChange:e=>ue(e.target.value),placeholder:`Who wrote this?`,className:`rc-input`})]})]}),(0,D.jsxs)(`div`,{className:`rc-storage`,children:[(0,D.jsxs)(`div`,{className:`rc-storage-header`,children:[(0,D.jsx)(h,{className:`w-4 h-4 text-indigo-400`}),(0,D.jsx)(`span`,{className:`text-sm font-medium`,children:`Storage Mode`})]}),(0,D.jsxs)(`div`,{className:`rc-storage-opts`,children:[(0,D.jsxs)(`button`,{className:`rc-storage-opt ${v?``:`is-active`}`,onClick:()=>C(!1),children:[(0,D.jsx)(`span`,{className:`rc-storage-name`,children:`Private`}),(0,D.jsx)(`span`,{className:`rc-storage-desc`,children:`Saved securely in your account`})]}),(0,D.jsxs)(`button`,{className:`rc-storage-opt rc-storage-eph ${v?`is-active`:``}`,onClick:()=>C(!0),children:[(0,D.jsxs)(`span`,{className:`rc-storage-name`,children:[(0,D.jsx)(te,{className:`w-3 h-3 inline mr-1 text-amber-400`}),`Ephemeral`]}),(0,D.jsx)(`span`,{className:`rc-storage-desc`,children:`Auto-deleted after 24 h`})]})]})]}),(0,D.jsxs)(`div`,{className:`rc-panel-footer`,children:[(0,D.jsxs)(b,{variant:`ghost`,onClick:()=>c(`intention`),className:`text-gray-500`,children:[(0,D.jsx)(i,{className:`w-4 h-4 mr-2`}),` Back`]}),(0,D.jsxs)(b,{disabled:!Q,onClick:()=>c(`begin`),className:`rc-btn-next`,children:[`Continue `,(0,D.jsx)(a,{className:`w-4 h-4 ml-2`})]})]})]}),r===`begin`&&p&&(0,D.jsxs)(`div`,{className:`rc-panel rc-anim`,children:[(0,D.jsxs)(`header`,{className:`rc-panel-head`,children:[(0,D.jsx)(`h1`,{className:`rc-panel-title`,children:`Ready to enter the room?`}),(0,D.jsx)(`p`,{className:`rc-panel-sub`,children:`Review your session, then step inside.`})]}),(0,D.jsxs)(`div`,{className:`rc-summary`,children:[(()=>{let e=k[p],t=e.icon;return(0,D.jsxs)(`div`,{className:`rc-summary-mode`,style:{"--mode-accent":e.accent},children:[(0,D.jsx)(`div`,{className:`rc-summary-icon bg-gradient-to-br ${e.gradient}`,children:(0,D.jsx)(t,{className:`w-5 h-5 text-white`})}),(0,D.jsxs)(`div`,{children:[(0,D.jsx)(`p`,{className:`text-xs text-gray-500 uppercase tracking-wider mb-0.5`,children:`Reading Mode`}),(0,D.jsx)(`p`,{className:`font-semibold text-lg`,style:{color:e.accent},children:S[p].label})]})]})})(),(0,D.jsxs)(`div`,{className:`rc-summary-rows`,children:[(0,D.jsxs)(`div`,{className:`rc-summary-row`,children:[(0,D.jsx)(`span`,{className:`rc-summary-key`,children:`Title`}),(0,D.jsx)(`span`,{className:`rc-summary-val`,children:A||`Untitled`})]}),N&&(0,D.jsxs)(`div`,{className:`rc-summary-row`,children:[(0,D.jsx)(`span`,{className:`rc-summary-key`,children:`Author`}),(0,D.jsx)(`span`,{className:`rc-summary-val`,children:N})]}),(0,D.jsxs)(`div`,{className:`rc-summary-row`,children:[(0,D.jsx)(`span`,{className:`rc-summary-key`,children:`Content`}),(0,D.jsx)(`span`,{className:`rc-summary-val`,children:T===`file`&&U?`${U.wordCount.toLocaleString()} words · ${U.pageCount}p`:`${P.split(/\s+/).filter(Boolean).length.toLocaleString()} words`})]}),(0,D.jsxs)(`div`,{className:`rc-summary-row`,children:[(0,D.jsx)(`span`,{className:`rc-summary-key`,children:`Storage`}),(0,D.jsx)(`span`,{className:`rc-summary-val ${v?`text-amber-400`:`text-indigo-400`}`,children:v?`Ephemeral (24 h)`:`Private`})]}),Y&&(0,D.jsxs)(`div`,{className:`rc-summary-row`,children:[(0,D.jsx)(`span`,{className:`rc-summary-key`,children:`AI Mood`}),(0,D.jsxs)(`span`,{className:`rc-summary-val text-amber-400`,children:[(0,D.jsx)(g,{className:`w-3 h-3 inline mr-1`}),S[Y.suggestedMode].label,` · `,Y.confidence,`%`]})]})]})]}),(0,D.jsxs)(`button`,{className:`rc-confirm ${R?`is-confirmed`:``}`,onClick:()=>pe(!R),children:[(0,D.jsx)(`span`,{className:`rc-confirm-box ${R?`is-checked`:``}`,children:R&&(0,D.jsx)(l,{className:`w-3 h-3 text-white`})}),(0,D.jsx)(`span`,{className:`rc-confirm-text`,children:`I have the right to use this text. This content is private and will not be shared.`})]}),$.isError&&(0,D.jsx)(`p`,{className:`text-sm text-red-400 text-center`,children:`Something went wrong. Please try again.`}),(0,D.jsxs)(`div`,{className:`rc-panel-footer`,children:[(0,D.jsxs)(b,{variant:`ghost`,onClick:()=>c(`content`),className:`text-gray-500`,children:[(0,D.jsx)(i,{className:`w-4 h-4 mr-2`}),` Back`]}),(0,D.jsx)(b,{disabled:!R||$.isPending,onClick:ye,size:`lg`,className:`rc-btn-enter`,children:$.isPending?(0,D.jsxs)(D.Fragment,{children:[(0,D.jsx)(y,{className:`w-4 h-4 mr-2 animate-spin`}),`Preparing…`]}):(0,D.jsxs)(D.Fragment,{children:[`Enter Reading Room `,(0,D.jsx)(a,{className:`w-4 h-4 ml-2`})]})})]})]})]})]})]})}var j=`
/* ── Shell ──────────────────────────────── */
.rc-shell {
  min-height: 100vh;
  background: #060608;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', system-ui, sans-serif;
  color: #e5e7eb;
}

.rc-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.18;
  pointer-events: none;
}
.rc-orb-1 {
  width: 520px; height: 520px;
  background: radial-gradient(circle, #6366f1, transparent 70%);
  top: -120px; left: -80px;
}
.rc-orb-2 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, #8b5cf6, transparent 70%);
  bottom: -80px; right: -60px;
}

/* ── Gate (unauthenticated) ─────────────── */
.rc-gate {
  display: flex; flex-direction: column; align-items: center; gap: 16px;
  position: relative;
}
.rc-gate-icon { width: 48px; height: 48px; color: #6b7280; }
.rc-gate-text { color: #9ca3af; }

/* ── Frame ──────────────────────────────── */
.rc-frame {
  display: flex;
  width: 100%;
  max-width: 980px;
  min-height: 580px;
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 24px;
  backdrop-filter: blur(24px);
  overflow: hidden;
  position: relative;
  box-shadow: 0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06);
}

/* ══ LEFT RAIL ══════════════════════════════ */
.rc-rail {
  width: 220px;
  flex-shrink: 0;
  background: rgba(0,0,0,0.35);
  border-right: 1px solid rgba(255,255,255,0.06);
  display: flex;
  flex-direction: column;
  padding: 28px 0 20px;
}

.rc-rail-brand {
  display: flex; align-items: center; gap: 10px;
  padding: 0 22px 28px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  margin-bottom: 24px;
}
.rc-rail-logo { width: 20px; height: 20px; color: #818cf8; }
.rc-rail-title { font-size: 14px; font-weight: 600; color: #e5e7eb; letter-spacing: 0.02em; }

.rc-rail-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0 12px;
  position: relative;
}

.rc-rail-tab {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  padding: 10px 10px;
  border-radius: 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: background 0.2s;
  text-align: left;
  color: #6b7280;
}
.rc-rail-tab:hover:not(.is-locked) { background: rgba(255,255,255,0.04); color: #9ca3af; }
.rc-rail-tab.is-active { background: rgba(99,102,241,0.12); color: #e5e7eb; }
.rc-rail-tab.is-locked { opacity: 0.3; cursor: not-allowed; }
.rc-rail-tab.is-done { color: #a3e635; }

.rc-connector {
  position: absolute;
  left: 22px;
  top: -14px;
  width: 2px;
  height: 14px;
  background: rgba(255,255,255,0.08);
  border-radius: 2px;
  transition: background 0.3s;
}
.rc-connector.is-lit { background: rgba(99,102,241,0.5); }

.rc-rail-dot {
  width: 30px; height: 30px;
  border-radius: 50%;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  position: relative;
  transition: all 0.3s;
}
.rc-rail-tab.is-active .rc-rail-dot {
  background: rgba(99,102,241,0.25);
  border-color: rgba(99,102,241,0.6);
  box-shadow: 0 0 12px rgba(99,102,241,0.3);
}
.rc-rail-tab.is-done .rc-rail-dot {
  background: rgba(163,230,53,0.15);
  border-color: rgba(163,230,53,0.5);
}

.rc-dot-pulse {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid rgba(99,102,241,0.4);
  animation: dot-pulse 2s ease-in-out infinite;
}
@keyframes dot-pulse {
  0%,100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 0; transform: scale(1.5); }
}

.rc-rail-labels { flex: 1; }
.rc-rail-label { display: block; font-size: 13px; font-weight: 500; line-height: 1.2; }
.rc-rail-sub { display: block; font-size: 11px; color: #4b5563; margin-top: 1px; }
.rc-rail-tab.is-active .rc-rail-sub { color: #6b7280; }

.rc-rail-arrow { width: 14px; height: 14px; color: #6366f1; flex-shrink: 0; }

.rc-rail-shelf {
  display: flex; align-items: center; gap: 8px;
  margin: 0 12px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.06);
  background: transparent;
  color: #4b5563;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}
.rc-rail-shelf:hover { color: #9ca3af; background: rgba(255,255,255,0.04); }

/* ══ MAIN PANEL ════════════════════════════ */
.rc-main {
  flex: 1;
  overflow-y: auto;
  padding: 36px 40px;
}

.rc-panel { display: flex; flex-direction: column; gap: 24px; }
.rc-anim { animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards; }
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}

.rc-panel-head {}
.rc-panel-title { font-size: 22px; font-weight: 700; color: #f1f5f9; margin-bottom: 6px; }
.rc-panel-sub   { font-size: 14px; color: #6b7280; line-height: 1.6; }

/* ── Mode cards ────────────────────────── */
.rc-modes { display: flex; flex-direction: column; gap: 12px; }

.rc-mode-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 18px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02);
  cursor: pointer;
  text-align: left;
  transition: all 0.25s;
  position: relative;
  overflow: hidden;
}
.rc-mode-card:hover {
  background: rgba(255,255,255,0.04);
  border-color: rgba(255,255,255,0.12);
  transform: translateX(3px);
}
.rc-mode-card.is-selected {
  border-color: var(--mode-accent, #6366f1);
  background: rgba(255,255,255,0.04);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.04), 0 0 24px -8px var(--mode-accent, #6366f1);
}

.rc-mode-icon-wrap {
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: transform 0.2s;
}
.rc-mode-card:hover .rc-mode-icon-wrap { transform: scale(1.08); }

.rc-mode-body { flex: 1; min-width: 0; }
.rc-mode-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.rc-mode-name { font-size: 15px; font-weight: 600; color: #e5e7eb; }
.rc-mode-check { color: var(--mode-accent, #6366f1); }
.rc-mode-desc { font-size: 12px; color: #6b7280; margin-bottom: 3px; }
.rc-mode-tagline { font-size: 11px; color: #4b5563; margin-bottom: 8px; letter-spacing: 0.02em; }
.rc-mode-sample { font-size: 11.5px; color: #374151; font-style: italic; border-left: 2px solid rgba(255,255,255,0.08); padding-left: 10px; margin: 0; line-height: 1.6; }
.rc-mode-card.is-selected .rc-mode-sample { color: #4b5563; border-color: var(--mode-accent, #6366f1); opacity: 0.6; }

.rc-mode-glow {
  position: absolute; inset: 0; border-radius: 16px;
  background: radial-gradient(ellipse at 0% 50%, var(--mode-accent, #6366f1) 0%, transparent 70%);
  opacity: 0.07; pointer-events: none;
}

/* ── Input tabs ────────────────────────── */
.rc-input-tabs {
  display: flex; gap: 8px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 5px;
}
.rc-input-tab {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px;
  padding: 9px 16px;
  border-radius: 9px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.rc-input-tab:hover { color: #9ca3af; }
.rc-input-tab.is-active {
  background: rgba(99,102,241,0.18);
  color: #c7d2fe;
  box-shadow: 0 2px 8px rgba(99,102,241,0.15);
}

/* ── Content Zone ──────────────────────── */
.rc-content-zone { display: flex; flex-direction: column; gap: 8px; }

.rc-textarea {
  background: rgba(255,255,255,0.03) !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
  border-radius: 14px !important;
  min-height: 200px;
  font-size: 14px;
  line-height: 1.7;
  color: #d1d5db !important;
  resize: vertical;
  transition: border-color 0.2s;
}
.rc-textarea:focus { border-color: rgba(99,102,241,0.4) !important; outline: none !important; }

.rc-word-count { font-size: 11px; color: #4b5563; text-align: right; }

/* ── Dropzone ──────────────────────────── */
.rc-dropzone {
  border: 2px dashed rgba(255,255,255,0.09);
  border-radius: 16px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(255,255,255,0.015);
  min-height: 180px;
  display: flex; align-items: center; justify-content: center;
}
.rc-dropzone:hover { border-color: rgba(255,255,255,0.18); background: rgba(255,255,255,0.03); }
.rc-dropzone.is-dragging { border-color: #6366f1; background: rgba(99,102,241,0.08); }
.rc-dropzone.has-file { cursor: default; }

.rc-drop-empty { display: flex; flex-direction: column; align-items: center; }
.rc-extract-progress { display: flex; flex-direction: column; align-items: center; }

.rc-progress-bar {
  height: 3px; width: 140px; background: rgba(255,255,255,0.06);
  border-radius: 99px; overflow: hidden; margin-top: 10px;
}
.rc-progress-fill {
  height: 100%; background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border-radius: 99px; transition: width 0.3s;
}

.rc-file-card { display: flex; flex-direction: column; align-items: center; }
.rc-file-actions { display: flex; gap: 8px; margin-top: 10px; }
.rc-preview-text {
  margin-top: 14px;
  font-size: 12px; color: #6b7280; line-height: 1.7;
  text-align: left;
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 10px;
  padding: 12px 14px;
  max-height: 120px; overflow-y: auto;
  background: rgba(0,0,0,0.2);
  font-style: italic;
}

/* ── Mood Banner ───────────────────────── */
.rc-mood-banner {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid rgba(251,191,36,0.2);
  background: rgba(251,191,36,0.05);
  transition: all 0.3s;
  animation: fadeUp 0.4s ease;
}
.rc-mood-banner.is-loading {
  border-color: rgba(99,102,241,0.2);
  background: rgba(99,102,241,0.04);
}

.rc-mood-body { flex: 1; min-width: 0; }
.rc-mood-text { font-size: 13px; color: #e5e7eb; margin-bottom: 3px; }
.rc-mood-mode { font-weight: 700; color: #fbbf24; }
.rc-mood-conf { color: #9ca3af; font-size: 12px; }
.rc-mood-reason { font-size: 12px; color: #6b7280; }

.rc-mood-use {
  padding: 6px 14px; border-radius: 8px;
  background: rgba(251,191,36,0.15);
  border: 1px solid rgba(251,191,36,0.3);
  color: #fbbf24; font-size: 12px; font-weight: 600;
  cursor: pointer; white-space: nowrap;
  transition: all 0.2s;
}
.rc-mood-use:hover { background: rgba(251,191,36,0.25); }

.rc-mood-match { font-size: 12px; color: #86efac; white-space: nowrap; }

/* ── Meta grid ─────────────────────────── */
.rc-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
@media (max-width: 560px) { .rc-meta-grid { grid-template-columns: 1fr; } }

.rc-label { display: block; font-size: 12px; color: #6b7280; margin-bottom: 6px; }
.rc-input {
  background: rgba(255,255,255,0.03) !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
  color: #d1d5db !important;
  border-radius: 10px !important;
}

/* ── Storage ───────────────────────────── */
.rc-storage {
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 16px;
  background: rgba(255,255,255,0.02);
}
.rc-storage-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.rc-storage-opts { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.rc-storage-opt {
  padding: 12px 14px; border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.07);
  background: transparent; text-align: left; cursor: pointer;
  transition: all 0.2s;
}
.rc-storage-opt.is-active { border-color: #6366f1; background: rgba(99,102,241,0.1); }
.rc-storage-eph.is-active { border-color: #f59e0b; background: rgba(245,158,11,0.1); }
.rc-storage-name { display: block; font-size: 13px; font-weight: 500; color: #d1d5db; margin-bottom: 2px; }
.rc-storage-desc { display: block; font-size: 11px; color: #6b7280; }

/* ── Summary ───────────────────────────── */
.rc-summary {
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 18px;
  padding: 22px;
  background: rgba(255,255,255,0.02);
  display: flex; flex-direction: column; gap: 16px;
}
.rc-summary-mode {
  display: flex; align-items: center; gap: 14px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.rc-summary-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.rc-summary-rows { display: flex; flex-direction: column; gap: 10px; }
.rc-summary-row { display: flex; justify-content: space-between; align-items: baseline; font-size: 13px; }
.rc-summary-key { color: #6b7280; }
.rc-summary-val { color: #d1d5db; font-weight: 500; text-align: right; max-width: 60%; overflow: hidden; text-overflow: ellipsis; }

/* ── Confirm ───────────────────────────── */
.rc-confirm {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.07);
  background: transparent;
  cursor: pointer; text-align: left;
  transition: all 0.2s;
}
.rc-confirm:hover { border-color: rgba(255,255,255,0.14); }
.rc-confirm.is-confirmed { border-color: rgba(134,239,172,0.3); background: rgba(134,239,172,0.05); }

.rc-confirm-box {
  width: 20px; height: 20px; border-radius: 6px;
  border: 1.5px solid #4b5563;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; margin-top: 1px;
  transition: all 0.2s;
}
.rc-confirm-box.is-checked { background: #22c55e; border-color: #22c55e; }
.rc-confirm-text { font-size: 13px; color: #9ca3af; line-height: 1.6; }

/* ── Footer ────────────────────────────── */
.rc-panel-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 8px;
  border-top: 1px solid rgba(255,255,255,0.05);
  margin-top: auto;
}

.rc-btn-next {
  background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
  border: none !important;
  color: white !important;
  border-radius: 10px !important;
  padding: 0 20px !important;
}
.rc-btn-enter {
  background: linear-gradient(135deg, #4f46e5, #7c3aed, #6366f1) !important;
  border: none !important;
  color: white !important;
  border-radius: 12px !important;
  font-weight: 600 !important;
  letter-spacing: 0.01em !important;
  padding: 0 24px !important;
  box-shadow: 0 4px 20px rgba(99,102,241,0.35) !important;
}
.rc-btn-enter:hover:not(:disabled) {
  box-shadow: 0 6px 28px rgba(99,102,241,0.5) !important;
  transform: translateY(-1px);
}

/* ── Responsive ────────────────────────── */
@media (max-width: 680px) {
  .rc-frame { flex-direction: column; min-height: unset; }
  .rc-rail { width: 100%; min-height: unset; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06); padding: 16px 16px 0; }
  .rc-rail-brand { padding-bottom: 16px; margin-bottom: 0; }
  .rc-rail-nav { flex-direction: row; padding-bottom: 12px; gap: 4px; overflow-x: auto; }
  .rc-rail-sub, .rc-rail-arrow { display: none; }
  .rc-connector { display: none; }
  .rc-rail-shelf { display: none; }
  .rc-main { padding: 24px 20px; }
}
`;export{A as default};