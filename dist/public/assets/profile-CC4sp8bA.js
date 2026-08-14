import{l as e,n as t,r as n}from"./createLucideIcon-CCWgZ3HE.js";import{t as r}from"./chevron-left-DNYC6ym9.js";import{t as i}from"./clock-cnywqKQ3.js";import{t as a}from"./coffee-DNAEpzP6.js";import{t as o}from"./flame-BYlD3puw.js";import{t as s}from"./heart-BhmFdtYL.js";import{t as c}from"./message-square-BoXjzbH-.js";import{t as l}from"./moon-WNiUgwJ5.js";import{t as ee}from"./shield-ChZn4q_J.js";import{t as u}from"./star-Ol5566WF.js";import{t as te}from"./zap-DNBXFTVV.js";import{L as d,c as ne,d as re,u as f,v as p}from"./index-BfoXjodX.js";import{a as m,c as h,i as g,n as _,o as v,r as y,s as b,t as x}from"./formatDistanceToNow-CywC37xD.js";function S(e,t){let n=g(),r=t?.weekStartsOn??t?.locale?.options?.weekStartsOn??n.weekStartsOn??n.locale?.options?.weekStartsOn??0,i=h(e),a=i.getDay(),o=(a<r?7:0)+a-r;return i.setDate(i.getDate()-o),i.setHours(0,0,0,0),i}function C(e){return S(e,{weekStartsOn:1})}function w(e){let t=h(e),n=t.getFullYear(),r=b(e,0);r.setFullYear(n+1,0,4),r.setHours(0,0,0,0);let i=C(r),a=b(e,0);a.setFullYear(n,0,4),a.setHours(0,0,0,0);let o=C(a);return t.getTime()>=i.getTime()?n+1:t.getTime()>=o.getTime()?n:n-1}function T(e){let t=h(e);return t.setHours(0,0,0,0),t}function E(e,t){let n=T(e),r=T(t),i=+n-y(n),a=+r-y(r);return Math.round((i-a)/m)}function D(e){let t=w(e),n=b(e,0);return n.setFullYear(t,0,4),n.setHours(0,0,0,0),C(n)}function O(e){return e instanceof Date||typeof e==`object`&&Object.prototype.toString.call(e)===`[object Date]`}function ie(e){if(!O(e)&&typeof e!=`number`)return!1;let t=h(e);return!isNaN(Number(t))}function k(e,t){let n=h(e),r=h(t),i=A(n,r),a=Math.abs(E(n,r));n.setDate(n.getDate()-i*a);let o=i*(a-Number(A(n,r)===-i));return o===0?0:o}function A(e,t){let n=e.getFullYear()-t.getFullYear()||e.getMonth()-t.getMonth()||e.getDate()-t.getDate()||e.getHours()-t.getHours()||e.getMinutes()-t.getMinutes()||e.getSeconds()-t.getSeconds()||e.getMilliseconds()-t.getMilliseconds();return n<0?-1:n>0?1:n}function j(e){let t=h(e),n=b(e,0);return n.setFullYear(t.getFullYear(),0,1),n.setHours(0,0,0,0),n}function M(e){let t=h(e);return E(t,j(t))+1}function N(e){let t=h(e),n=C(t)-+D(t);return Math.round(n/v)+1}function P(e,t){let n=h(e),r=n.getFullYear(),i=g(),a=t?.firstWeekContainsDate??t?.locale?.options?.firstWeekContainsDate??i.firstWeekContainsDate??i.locale?.options?.firstWeekContainsDate??1,o=b(e,0);o.setFullYear(r+1,0,a),o.setHours(0,0,0,0);let s=S(o,t),c=b(e,0);c.setFullYear(r,0,a),c.setHours(0,0,0,0);let l=S(c,t);return n.getTime()>=s.getTime()?r+1:n.getTime()>=l.getTime()?r:r-1}function F(e,t){let n=g(),r=t?.firstWeekContainsDate??t?.locale?.options?.firstWeekContainsDate??n.firstWeekContainsDate??n.locale?.options?.firstWeekContainsDate??1,i=P(e,t),a=b(e,0);return a.setFullYear(i,0,r),a.setHours(0,0,0,0),S(a,t)}function I(e,t){let n=h(e),r=S(n,t)-+F(n,t);return Math.round(r/v)+1}function L(e,t){return(e<0?`-`:``)+Math.abs(e).toString().padStart(t,`0`)}var R={y(e,t){let n=e.getFullYear(),r=n>0?n:1-n;return L(t===`yy`?r%100:r,t.length)},M(e,t){let n=e.getMonth();return t===`M`?String(n+1):L(n+1,2)},d(e,t){return L(e.getDate(),t.length)},a(e,t){let n=e.getHours()/12>=1?`pm`:`am`;switch(t){case`a`:case`aa`:return n.toUpperCase();case`aaa`:return n;case`aaaaa`:return n[0];default:return n===`am`?`a.m.`:`p.m.`}},h(e,t){return L(e.getHours()%12||12,t.length)},H(e,t){return L(e.getHours(),t.length)},m(e,t){return L(e.getMinutes(),t.length)},s(e,t){return L(e.getSeconds(),t.length)},S(e,t){let n=t.length,r=e.getMilliseconds();return L(Math.trunc(r*10**(n-3)),t.length)}},z={am:`am`,pm:`pm`,midnight:`midnight`,noon:`noon`,morning:`morning`,afternoon:`afternoon`,evening:`evening`,night:`night`},B={G:function(e,t,n){let r=+(e.getFullYear()>0);switch(t){case`G`:case`GG`:case`GGG`:return n.era(r,{width:`abbreviated`});case`GGGGG`:return n.era(r,{width:`narrow`});default:return n.era(r,{width:`wide`})}},y:function(e,t,n){if(t===`yo`){let t=e.getFullYear(),r=t>0?t:1-t;return n.ordinalNumber(r,{unit:`year`})}return R.y(e,t)},Y:function(e,t,n,r){let i=P(e,r),a=i>0?i:1-i;return t===`YY`?L(a%100,2):t===`Yo`?n.ordinalNumber(a,{unit:`year`}):L(a,t.length)},R:function(e,t){return L(w(e),t.length)},u:function(e,t){return L(e.getFullYear(),t.length)},Q:function(e,t,n){let r=Math.ceil((e.getMonth()+1)/3);switch(t){case`Q`:return String(r);case`QQ`:return L(r,2);case`Qo`:return n.ordinalNumber(r,{unit:`quarter`});case`QQQ`:return n.quarter(r,{width:`abbreviated`,context:`formatting`});case`QQQQQ`:return n.quarter(r,{width:`narrow`,context:`formatting`});default:return n.quarter(r,{width:`wide`,context:`formatting`})}},q:function(e,t,n){let r=Math.ceil((e.getMonth()+1)/3);switch(t){case`q`:return String(r);case`qq`:return L(r,2);case`qo`:return n.ordinalNumber(r,{unit:`quarter`});case`qqq`:return n.quarter(r,{width:`abbreviated`,context:`standalone`});case`qqqqq`:return n.quarter(r,{width:`narrow`,context:`standalone`});default:return n.quarter(r,{width:`wide`,context:`standalone`})}},M:function(e,t,n){let r=e.getMonth();switch(t){case`M`:case`MM`:return R.M(e,t);case`Mo`:return n.ordinalNumber(r+1,{unit:`month`});case`MMM`:return n.month(r,{width:`abbreviated`,context:`formatting`});case`MMMMM`:return n.month(r,{width:`narrow`,context:`formatting`});default:return n.month(r,{width:`wide`,context:`formatting`})}},L:function(e,t,n){let r=e.getMonth();switch(t){case`L`:return String(r+1);case`LL`:return L(r+1,2);case`Lo`:return n.ordinalNumber(r+1,{unit:`month`});case`LLL`:return n.month(r,{width:`abbreviated`,context:`standalone`});case`LLLLL`:return n.month(r,{width:`narrow`,context:`standalone`});default:return n.month(r,{width:`wide`,context:`standalone`})}},w:function(e,t,n,r){let i=I(e,r);return t===`wo`?n.ordinalNumber(i,{unit:`week`}):L(i,t.length)},I:function(e,t,n){let r=N(e);return t===`Io`?n.ordinalNumber(r,{unit:`week`}):L(r,t.length)},d:function(e,t,n){return t===`do`?n.ordinalNumber(e.getDate(),{unit:`date`}):R.d(e,t)},D:function(e,t,n){let r=M(e);return t===`Do`?n.ordinalNumber(r,{unit:`dayOfYear`}):L(r,t.length)},E:function(e,t,n){let r=e.getDay();switch(t){case`E`:case`EE`:case`EEE`:return n.day(r,{width:`abbreviated`,context:`formatting`});case`EEEEE`:return n.day(r,{width:`narrow`,context:`formatting`});case`EEEEEE`:return n.day(r,{width:`short`,context:`formatting`});default:return n.day(r,{width:`wide`,context:`formatting`})}},e:function(e,t,n,r){let i=e.getDay(),a=(i-r.weekStartsOn+8)%7||7;switch(t){case`e`:return String(a);case`ee`:return L(a,2);case`eo`:return n.ordinalNumber(a,{unit:`day`});case`eee`:return n.day(i,{width:`abbreviated`,context:`formatting`});case`eeeee`:return n.day(i,{width:`narrow`,context:`formatting`});case`eeeeee`:return n.day(i,{width:`short`,context:`formatting`});default:return n.day(i,{width:`wide`,context:`formatting`})}},c:function(e,t,n,r){let i=e.getDay(),a=(i-r.weekStartsOn+8)%7||7;switch(t){case`c`:return String(a);case`cc`:return L(a,t.length);case`co`:return n.ordinalNumber(a,{unit:`day`});case`ccc`:return n.day(i,{width:`abbreviated`,context:`standalone`});case`ccccc`:return n.day(i,{width:`narrow`,context:`standalone`});case`cccccc`:return n.day(i,{width:`short`,context:`standalone`});default:return n.day(i,{width:`wide`,context:`standalone`})}},i:function(e,t,n){let r=e.getDay(),i=r===0?7:r;switch(t){case`i`:return String(i);case`ii`:return L(i,t.length);case`io`:return n.ordinalNumber(i,{unit:`day`});case`iii`:return n.day(r,{width:`abbreviated`,context:`formatting`});case`iiiii`:return n.day(r,{width:`narrow`,context:`formatting`});case`iiiiii`:return n.day(r,{width:`short`,context:`formatting`});default:return n.day(r,{width:`wide`,context:`formatting`})}},a:function(e,t,n){let r=e.getHours()/12>=1?`pm`:`am`;switch(t){case`a`:case`aa`:return n.dayPeriod(r,{width:`abbreviated`,context:`formatting`});case`aaa`:return n.dayPeriod(r,{width:`abbreviated`,context:`formatting`}).toLowerCase();case`aaaaa`:return n.dayPeriod(r,{width:`narrow`,context:`formatting`});default:return n.dayPeriod(r,{width:`wide`,context:`formatting`})}},b:function(e,t,n){let r=e.getHours(),i;switch(i=r===12?z.noon:r===0?z.midnight:r/12>=1?`pm`:`am`,t){case`b`:case`bb`:return n.dayPeriod(i,{width:`abbreviated`,context:`formatting`});case`bbb`:return n.dayPeriod(i,{width:`abbreviated`,context:`formatting`}).toLowerCase();case`bbbbb`:return n.dayPeriod(i,{width:`narrow`,context:`formatting`});default:return n.dayPeriod(i,{width:`wide`,context:`formatting`})}},B:function(e,t,n){let r=e.getHours(),i;switch(i=r>=17?z.evening:r>=12?z.afternoon:r>=4?z.morning:z.night,t){case`B`:case`BB`:case`BBB`:return n.dayPeriod(i,{width:`abbreviated`,context:`formatting`});case`BBBBB`:return n.dayPeriod(i,{width:`narrow`,context:`formatting`});default:return n.dayPeriod(i,{width:`wide`,context:`formatting`})}},h:function(e,t,n){if(t===`ho`){let t=e.getHours()%12;return t===0&&(t=12),n.ordinalNumber(t,{unit:`hour`})}return R.h(e,t)},H:function(e,t,n){return t===`Ho`?n.ordinalNumber(e.getHours(),{unit:`hour`}):R.H(e,t)},K:function(e,t,n){let r=e.getHours()%12;return t===`Ko`?n.ordinalNumber(r,{unit:`hour`}):L(r,t.length)},k:function(e,t,n){let r=e.getHours();return r===0&&(r=24),t===`ko`?n.ordinalNumber(r,{unit:`hour`}):L(r,t.length)},m:function(e,t,n){return t===`mo`?n.ordinalNumber(e.getMinutes(),{unit:`minute`}):R.m(e,t)},s:function(e,t,n){return t===`so`?n.ordinalNumber(e.getSeconds(),{unit:`second`}):R.s(e,t)},S:function(e,t){return R.S(e,t)},X:function(e,t,n){let r=e.getTimezoneOffset();if(r===0)return`Z`;switch(t){case`X`:return H(r);case`XXXX`:case`XX`:return U(r);default:return U(r,`:`)}},x:function(e,t,n){let r=e.getTimezoneOffset();switch(t){case`x`:return H(r);case`xxxx`:case`xx`:return U(r);default:return U(r,`:`)}},O:function(e,t,n){let r=e.getTimezoneOffset();switch(t){case`O`:case`OO`:case`OOO`:return`GMT`+V(r,`:`);default:return`GMT`+U(r,`:`)}},z:function(e,t,n){let r=e.getTimezoneOffset();switch(t){case`z`:case`zz`:case`zzz`:return`GMT`+V(r,`:`);default:return`GMT`+U(r,`:`)}},t:function(e,t,n){return L(Math.trunc(e.getTime()/1e3),t.length)},T:function(e,t,n){return L(e.getTime(),t.length)}};function V(e,t=``){let n=e>0?`-`:`+`,r=Math.abs(e),i=Math.trunc(r/60),a=r%60;return a===0?n+String(i):n+String(i)+t+L(a,2)}function H(e,t){return e%60==0?(e>0?`-`:`+`)+L(Math.abs(e)/60,2):U(e,t)}function U(e,t=``){let n=e>0?`-`:`+`,r=Math.abs(e),i=L(Math.trunc(r/60),2),a=L(r%60,2);return n+i+t+a}var W=(e,t)=>{switch(e){case`P`:return t.date({width:`short`});case`PP`:return t.date({width:`medium`});case`PPP`:return t.date({width:`long`});default:return t.date({width:`full`})}},G=(e,t)=>{switch(e){case`p`:return t.time({width:`short`});case`pp`:return t.time({width:`medium`});case`ppp`:return t.time({width:`long`});default:return t.time({width:`full`})}},K={p:G,P:(e,t)=>{let n=e.match(/(P+)(p+)?/)||[],r=n[1],i=n[2];if(!i)return W(e,t);let a;switch(r){case`P`:a=t.dateTime({width:`short`});break;case`PP`:a=t.dateTime({width:`medium`});break;case`PPP`:a=t.dateTime({width:`long`});break;default:a=t.dateTime({width:`full`});break}return a.replace(`{{date}}`,W(r,t)).replace(`{{time}}`,G(i,t))}},q=/^D+$/,J=/^Y+$/,ae=[`D`,`DD`,`YY`,`YYYY`];function oe(e){return q.test(e)}function se(e){return J.test(e)}function ce(e,t,n){let r=le(e,t,n);if(console.warn(r),ae.includes(e))throw RangeError(r)}function le(e,t,n){let r=e[0]===`Y`?`years`:`days of the month`;return`Use \`${e.toLowerCase()}\` instead of \`${e}\` (in \`${t}\`) for formatting ${r} to the input \`${n}\`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md`}var ue=/[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g,de=/P+p+|P+|p+|''|'(''|[^'])+('|$)|./g,fe=/^'([^]*?)'?$/,pe=/''/g,me=/[a-zA-Z]/;function he(e,t,n){let r=g(),i=n?.locale??r.locale??_,a=n?.firstWeekContainsDate??n?.locale?.options?.firstWeekContainsDate??r.firstWeekContainsDate??r.locale?.options?.firstWeekContainsDate??1,o=n?.weekStartsOn??n?.locale?.options?.weekStartsOn??r.weekStartsOn??r.locale?.options?.weekStartsOn??0,s=h(e);if(!ie(s))throw RangeError(`Invalid time value`);let c=t.match(de).map(e=>{let t=e[0];if(t===`p`||t===`P`){let n=K[t];return n(e,i.formatLong)}return e}).join(``).match(ue).map(e=>{if(e===`''`)return{isToken:!1,value:`'`};let t=e[0];if(t===`'`)return{isToken:!1,value:ge(e)};if(B[t])return{isToken:!0,value:e};if(t.match(me))throw RangeError("Format string contains an unescaped latin alphabet character `"+t+"`");return{isToken:!1,value:e}});i.localize.preprocessor&&(c=i.localize.preprocessor(s,c));let l={firstWeekContainsDate:a,weekStartsOn:o,locale:i};return c.map(r=>{if(!r.isToken)return r.value;let a=r.value;(!n?.useAdditionalWeekYearTokens&&se(a)||!n?.useAdditionalDayOfYearTokens&&oe(a))&&ce(a,t,String(e));let o=B[a[0]];return o(s,a,i.localize,l)}).join(``)}function ge(e){let t=e.match(fe);return t?t[1].replace(pe,`'`):e}var Y=e(n(),1),X=t(),Z=e=>(e.displayName||e.username).charAt(0).toUpperCase(),_e=e=>{if(!e)return`—`;try{return he(new Date(e),`MMM d, yyyy`)}catch{return`—`}},Q=e=>{if(!e)return`—`;try{return x(new Date(e),{addSuffix:!0})}catch{return`—`}},ve={joy:`#fbbf24`,happy:`#fbbf24`,excited:`#f97316`,nostalgia:`#a78bfa`,reflective:`#818cf8`,calm:`#60a5fa`,longing:`#c084fc`,sad:`#6b7280`,anxious:`#f87171`,lonely:`#94a3b8`,ambition:`#34d399`,curious:`#2dd4bf`},$=e=>ve[e.toLowerCase()]??`#c084fc`;function ye(){let[,e]=re(),{user:t,isLoading:n}=ne(),[m,h]=(0,Y.useState)(`overview`),{data:g}=d({queryKey:[`/api/v1/users/me/whispers`],enabled:!!t,staleTime:300*1e3}),{data:_}=d({queryKey:[`/api/v1/users/me/cafe`],enabled:!!t,staleTime:300*1e3}),{data:v}=d({queryKey:[`/api/v1/users/me/favorites`],enabled:!!t,staleTime:300*1e3}),y=g??[],b=_??[],x=v??[],S=(0,Y.useMemo)(()=>t?.createdAt?k(new Date,new Date(t.createdAt)):0,[t?.createdAt]),C=(0,Y.useMemo)(()=>{let e={};return y.forEach(t=>{t.detectedEmotion&&(e[t.detectedEmotion]=(e[t.detectedEmotion]||0)+1)}),Object.entries(e).map(([e,t])=>({emotion:e,count:t})).sort((e,t)=>t.count-e.count).slice(0,6)},[y]),w=C[0]?.emotion??null,T=C[0]?.count??1,E=(0,Y.useMemo)(()=>{let e=[];return((t?.nightStreak??0)>0||(t?.currentStreak??0)>0)&&e.push({icon:`🦉`,title:`Night Owl`,desc:`Active after midnight`,color:`#a78bfa`}),y.length>0&&e.push({icon:`💭`,title:`Whisperer`,desc:`${y.length} whisper${y.length>1?`s`:``} shared`,color:`#818cf8`}),(t?.currentStreak??0)>=3&&e.push({icon:`🔥`,title:`Streak Keeper`,desc:`${t?.currentStreak}-day streak`,color:`#f97316`}),(t?.trustScore??0)>=80&&e.push({icon:`🛡️`,title:`Trusted Voice`,desc:`Trust score ${t?.trustScore}`,color:`#34d399`}),b.length>0&&e.push({icon:`☕`,title:`Conversationalist`,desc:`${b.length} post${b.length>1?`s`:``} in the café`,color:`#fbbf24`}),x.length>0&&e.push({icon:`🎵`,title:`Music Soul`,desc:`${x.length} station${x.length>1?`s`:``} saved`,color:`#60a5fa`}),S>=30&&e.push({icon:`🌙`,title:`Night Veteran`,desc:`${S} nights on Nocturne`,color:`#c084fc`}),e},[t,y,b,x,S]),D=(0,Y.useMemo)(()=>[...y.slice(0,5).map(e=>({type:`whisper`,date:e.createdAt?new Date(e.createdAt):null,label:e.content.length>80?e.content.slice(0,80)+`…`:e.content,sub:e.detectedEmotion?`Emotion: ${e.detectedEmotion}`:`${e.hearts??0} hearts`})),...b.slice(0,5).map(e=>({type:`cafe`,date:e.createdAt?new Date(e.createdAt):null,label:e.topic,sub:e.category??`Discussion`}))].sort((e,t)=>(t.date?.getTime()??0)-(e.date?.getTime()??0)).slice(0,6),[y,b]);if(n)return(0,X.jsx)(`div`,{style:{minHeight:`100vh`,background:`#05050a`,display:`flex`,alignItems:`center`,justifyContent:`center`},children:(0,X.jsx)(`div`,{className:`pf-spinner`})});if(!t)return(0,X.jsx)(f,{to:`/auth`});let O=[{id:`overview`,label:`Overview`},{id:`whispers`,label:`Whispers${y.length?` (${y.length})`:``}`},{id:`cafe`,label:`Café${b.length?` (${b.length})`:``}`},{id:`music`,label:`Music${x.length?` (${x.length})`:``}`}];return(0,X.jsxs)(`div`,{style:{minHeight:`100vh`,background:`#05050a`,color:`#e2e8f0`,fontFamily:`Inter, system-ui, sans-serif`},children:[(0,X.jsx)(`style`,{children:be}),(0,X.jsxs)(`button`,{className:`pf-back`,onClick:()=>e(`/`),children:[(0,X.jsx)(r,{style:{width:15,height:15}}),` Back`]}),(0,X.jsxs)(`div`,{className:`pf-shell`,children:[(0,X.jsxs)(`div`,{className:`pf-hero`,children:[(0,X.jsx)(`div`,{className:`pf-hero-glow`}),(0,X.jsxs)(`div`,{className:`pf-hero-content`,children:[(0,X.jsxs)(`div`,{className:`pf-avatar-wrap`,children:[t.profileImageUrl?(0,X.jsx)(`img`,{src:t.profileImageUrl,className:`pf-avatar-img`,alt:`avatar`}):(0,X.jsx)(`div`,{className:`pf-avatar-init`,children:Z(t)}),(0,X.jsx)(`div`,{className:`pf-avatar-ring`})]}),(0,X.jsxs)(`div`,{className:`pf-hero-info`,children:[(0,X.jsxs)(`div`,{className:`pf-name-row`,children:[(0,X.jsx)(`h1`,{className:`pf-name`,children:t.displayName||t.username}),(0,X.jsxs)(`span`,{className:`pf-handle`,children:[`@`,t.username]})]}),(0,X.jsxs)(`div`,{className:`pf-meta-row`,children:[(0,X.jsxs)(`span`,{className:`pf-meta-pill`,children:[(0,X.jsx)(i,{style:{width:12,height:12}}),`Joined `,_e(t.createdAt)]}),t.lastActiveTime&&(0,X.jsxs)(`span`,{className:`pf-meta-pill`,children:[(0,X.jsx)(l,{style:{width:12,height:12}}),`Active `,Q(t.lastActiveTime)]})]}),(0,X.jsx)(`div`,{className:`pf-stats-row`,children:[{icon:(0,X.jsx)(c,{style:{width:15,height:15}}),value:y.length,label:`Whispers`,color:`#c084fc`},{icon:(0,X.jsx)(a,{style:{width:15,height:15}}),value:b.length,label:`Café posts`,color:`#fbbf24`},{icon:(0,X.jsx)(p,{style:{width:15,height:15}}),value:x.length,label:`Stations`,color:`#60a5fa`},{icon:(0,X.jsx)(o,{style:{width:15,height:15}}),value:t.currentStreak??0,label:`Streak`,color:`#f97316`},{icon:(0,X.jsx)(ee,{style:{width:15,height:15}}),value:t.trustScore??100,label:`Trust`,color:`#34d399`}].map((e,t)=>(0,X.jsxs)(`div`,{className:`pf-stat`,style:{"--sc":e.color},children:[(0,X.jsx)(`span`,{className:`pf-stat-icon`,style:{color:e.color},children:e.icon}),(0,X.jsx)(`span`,{className:`pf-stat-val`,children:e.value}),(0,X.jsx)(`span`,{className:`pf-stat-lbl`,children:e.label})]},t))})]})]})]}),(0,X.jsx)(`div`,{className:`pf-tabs`,children:O.map(e=>(0,X.jsx)(`button`,{className:`pf-tab ${m===e.id?`is-active`:``}`,onClick:()=>h(e.id),children:e.label},e.id))}),m===`overview`&&(0,X.jsxs)(`div`,{className:`pf-section`,children:[(0,X.jsxs)(`div`,{className:`pf-card`,children:[(0,X.jsx)(`p`,{className:`pf-card-title`,children:`Achievements`}),E.length===0?(0,X.jsxs)(`div`,{className:`pf-empty`,children:[(0,X.jsx)(u,{style:{width:28,height:28,opacity:.25}}),(0,X.jsx)(`span`,{children:`Keep exploring Nocturne — your achievements will appear here.`})]}):(0,X.jsx)(`div`,{className:`pf-achievements`,children:E.map((e,t)=>(0,X.jsxs)(`div`,{className:`pf-badge`,style:{"--bc":e.color},children:[(0,X.jsx)(`span`,{className:`pf-badge-icon`,children:e.icon}),(0,X.jsx)(`span`,{className:`pf-badge-title`,children:e.title}),(0,X.jsx)(`span`,{className:`pf-badge-desc`,children:e.desc})]},t))})]}),C.length>0&&(0,X.jsxs)(`div`,{className:`pf-card`,children:[(0,X.jsxs)(`div`,{className:`pf-card-header-row`,children:[(0,X.jsx)(`p`,{className:`pf-card-title`,children:`Emotional Fingerprint`}),w&&(0,X.jsx)(`span`,{className:`pf-mood-dominant`,style:{color:$(w)},children:w})]}),(0,X.jsx)(`div`,{className:`pf-mood-bars`,children:C.map((e,t)=>(0,X.jsxs)(`div`,{className:`pf-mood-row`,children:[(0,X.jsx)(`span`,{className:`pf-mood-label`,children:e.emotion}),(0,X.jsx)(`div`,{className:`pf-mood-track`,children:(0,X.jsx)(`div`,{className:`pf-mood-fill`,style:{width:`${e.count/T*100}%`,background:$(e.emotion),boxShadow:`0 0 8px ${$(e.emotion)}60`}})}),(0,X.jsx)(`span`,{className:`pf-mood-count`,children:e.count})]},t))})]}),(0,X.jsxs)(`div`,{className:`pf-card`,children:[(0,X.jsx)(`p`,{className:`pf-card-title`,children:`Recent Activity`}),D.length===0?(0,X.jsxs)(`div`,{className:`pf-empty`,children:[(0,X.jsx)(te,{style:{width:28,height:28,opacity:.25}}),(0,X.jsx)(`span`,{children:`Nothing yet. Start writing, whispering, or listening.`})]}):(0,X.jsx)(`div`,{className:`pf-activity`,children:D.map((e,t)=>(0,X.jsxs)(`div`,{className:`pf-activity-item`,children:[(0,X.jsx)(`div`,{className:`pf-activity-icon-wrap`,children:e.type===`whisper`?(0,X.jsx)(c,{style:{width:14,height:14,color:`#c084fc`}}):(0,X.jsx)(a,{style:{width:14,height:14,color:`#fbbf24`}})}),(0,X.jsxs)(`div`,{className:`pf-activity-body`,children:[(0,X.jsx)(`span`,{className:`pf-activity-label`,children:e.label}),(0,X.jsxs)(`span`,{className:`pf-activity-sub`,children:[e.sub,` · `,Q(e.date)]})]})]},t))})]})]}),m===`whispers`&&(0,X.jsx)(`div`,{className:`pf-section`,children:y.length===0?(0,X.jsxs)(`div`,{className:`pf-card pf-empty-lg`,children:[(0,X.jsx)(c,{style:{width:36,height:36,opacity:.2}}),(0,X.jsx)(`p`,{children:`You haven't whispered anything into the night yet.`}),(0,X.jsx)(`button`,{className:`pf-cta-link`,onClick:()=>e(`/whispers`),children:`Go whisper something →`})]}):y.map(e=>(0,X.jsxs)(`div`,{className:`pf-card pf-whisper-card`,children:[(0,X.jsxs)(`p`,{className:`pf-whisper-text`,children:[`"`,e.content,`"`]}),(0,X.jsxs)(`div`,{className:`pf-whisper-meta`,children:[(0,X.jsx)(`div`,{className:`pf-whisper-meta-left`,children:e.detectedEmotion&&(0,X.jsx)(`span`,{className:`pf-emotion-tag`,style:{background:`${$(e.detectedEmotion)}18`,color:$(e.detectedEmotion),borderColor:`${$(e.detectedEmotion)}35`},children:e.detectedEmotion})}),(0,X.jsxs)(`div`,{className:`pf-whisper-meta-right`,children:[(0,X.jsxs)(`span`,{className:`pf-whisper-hearts`,children:[(0,X.jsx)(s,{style:{width:12,height:12,color:`#f472b6`}}),e.hearts??0]}),(0,X.jsx)(`span`,{className:`pf-whisper-date`,children:Q(e.createdAt)})]})]})]},e.id))}),m===`cafe`&&(0,X.jsx)(`div`,{className:`pf-section`,children:b.length===0?(0,X.jsxs)(`div`,{className:`pf-card pf-empty-lg`,children:[(0,X.jsx)(a,{style:{width:36,height:36,opacity:.2}}),(0,X.jsx)(`p`,{children:`The café is quiet on your end. Start a conversation.`}),(0,X.jsx)(`button`,{className:`pf-cta-link`,onClick:()=>e(`/midnight-cafe`),children:`Enter the Café →`})]}):b.map(e=>(0,X.jsxs)(`div`,{className:`pf-card`,children:[(0,X.jsxs)(`div`,{className:`pf-cafe-header`,children:[(0,X.jsx)(`span`,{className:`pf-cafe-topic`,children:e.topic}),e.category&&(0,X.jsx)(`span`,{className:`pf-cafe-cat`,children:e.category})]}),(0,X.jsx)(`p`,{className:`pf-cafe-content`,children:e.content}),(0,X.jsxs)(`div`,{className:`pf-cafe-meta`,children:[(0,X.jsxs)(`span`,{className:`pf-cafe-replies`,children:[(0,X.jsx)(c,{style:{width:12,height:12}}),e.replies??0,` `,e.replies===1?`reply`:`replies`]}),(0,X.jsx)(`span`,{className:`pf-whisper-date`,children:Q(e.createdAt)})]})]},e.id))}),m===`music`&&(0,X.jsx)(`div`,{className:`pf-section`,children:x.length===0?(0,X.jsxs)(`div`,{className:`pf-card pf-empty-lg`,children:[(0,X.jsx)(p,{style:{width:36,height:36,opacity:.2}}),(0,X.jsx)(`p`,{children:`No saved stations. Discover music for your mood.`}),(0,X.jsx)(`button`,{className:`pf-cta-link`,onClick:()=>e(`/music-mood`),children:`Explore Music →`})]}):(0,X.jsx)(`div`,{className:`pf-stations`,children:x.map(e=>(0,X.jsxs)(`div`,{className:`pf-station`,children:[(0,X.jsx)(p,{style:{width:16,height:16,color:`#60a5fa`}}),(0,X.jsx)(`span`,{children:e.replace(/-/g,` `)})]},e))})})]})]})}var be=`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.pf-spinner {
  width: 36px; height: 36px; border-radius: 50%;
  border: 3px solid rgba(167,139,250,0.15);
  border-top-color: #a855f7;
  animation: pf-spin 0.8s linear infinite;
}
@keyframes pf-spin { to { transform: rotate(360deg); } }

.pf-back {
  position: fixed; top: 16px; left: 20px; z-index: 50;
  display: flex; align-items: center; gap: 4px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 100px; padding: 7px 14px 7px 10px;
  color: #9ca3af; font-size: 13px; cursor: pointer; font-family: inherit;
  transition: all 0.2s;
}
.pf-back:hover { background: rgba(255,255,255,0.09); color: #f1f5f9; }

.pf-shell {
  max-width: 720px; margin: 0 auto;
  padding: 70px 16px 60px;
  display: flex; flex-direction: column; gap: 16px;
}

/* ── Hero ── */
.pf-hero {
  position: relative;
  background: linear-gradient(145deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02));
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 24px; padding: 28px; overflow: hidden;
}
.pf-hero-glow {
  position: absolute; top: -60px; right: -60px;
  width: 260px; height: 260px; border-radius: 50%;
  background: radial-gradient(circle, rgba(168,85,247,0.18), transparent 70%);
  pointer-events: none;
}
.pf-hero-content { display: flex; gap: 22px; align-items: flex-start; flex-wrap: wrap; }

/* Avatar */
.pf-avatar-wrap { position: relative; flex-shrink: 0; }
.pf-avatar-img, .pf-avatar-init {
  width: 88px; height: 88px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.pf-avatar-img { object-fit: cover; }
.pf-avatar-init {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  font-size: 34px; font-weight: 800; color: white;
}
.pf-avatar-ring {
  position: absolute; inset: -3px; border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed, #a855f7, #60a5fa);
  z-index: -1;
}

/* Info */
.pf-hero-info { flex: 1; min-width: 200px; display: flex; flex-direction: column; gap: 12px; }
.pf-name-row { display: flex; flex-direction: column; gap: 2px; }
.pf-name { font-size: 24px; font-weight: 800; letter-spacing: -0.03em; color: #f1f5f9; }
.pf-handle { font-size: 14px; color: rgba(148,163,184,0.6); }

.pf-meta-row { display: flex; flex-wrap: wrap; gap: 8px; }
.pf-meta-pill {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11.5px; color: rgba(148,163,184,0.65);
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 100px; padding: 3px 10px;
}

.pf-stats-row { display: flex; flex-wrap: wrap; gap: 10px; }
.pf-stat {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px; padding: 10px 14px; min-width: 64px;
  transition: border-color 0.2s;
}
.pf-stat:hover { border-color: rgba(var(--sc, 192,132,252), 0.3); }
.pf-stat-icon { display: flex; align-items: center; }
.pf-stat-val { font-size: 16px; font-weight: 700; color: #f1f5f9; }
.pf-stat-lbl { font-size: 10px; color: rgba(148,163,184,0.5); }

/* ── Tabs ── */
.pf-tabs {
  display: flex; gap: 4px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px; padding: 4px;
}
.pf-tab {
  flex: 1; padding: 8px 6px;
  border-radius: 10px; border: none; background: transparent;
  color: rgba(148,163,184,0.6); font-size: 13px; font-weight: 500;
  font-family: inherit; cursor: pointer;
  transition: all 0.2s; white-space: nowrap;
}
.pf-tab:hover { color: #e2e8f0; }
.pf-tab.is-active {
  background: rgba(168,85,247,0.15);
  color: #c084fc;
  border: 1px solid rgba(168,85,247,0.25);
}

/* ── Content sections ── */
.pf-section { display: flex; flex-direction: column; gap: 12px; }
.pf-card {
  background: linear-gradient(155deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
  border: 1px solid rgba(255,255,255,0.065);
  border-radius: 18px; padding: 20px;
  display: flex; flex-direction: column; gap: 14px;
}
.pf-card-title { font-size: 13px; font-weight: 600; color: rgba(148,163,184,0.6); text-transform: uppercase; letter-spacing: 0.06em; }
.pf-card-header-row { display: flex; align-items: center; justify-content: space-between; }
.pf-mood-dominant { font-size: 14px; font-weight: 600; text-transform: capitalize; }

/* Achievements */
.pf-achievements { display: flex; flex-wrap: wrap; gap: 10px; }
.pf-badge {
  display: flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px; padding: 8px 12px;
  transition: border-color 0.2s, background 0.2s;
}
.pf-badge:hover {
  background: rgba(255,255,255,0.06);
  border-color: rgba(var(--bc), 0.3);
}
.pf-badge-icon { font-size: 18px; }
.pf-badge-title { font-size: 13px; font-weight: 600; color: #f1f5f9; }
.pf-badge-desc { font-size: 11px; color: rgba(148,163,184,0.5); }

/* Mood bars */
.pf-mood-bars { display: flex; flex-direction: column; gap: 10px; }
.pf-mood-row { display: flex; align-items: center; gap: 10px; }
.pf-mood-label { font-size: 12px; color: rgba(148,163,184,0.6); width: 80px; text-transform: capitalize; flex-shrink: 0; }
.pf-mood-track { flex: 1; height: 6px; background: rgba(255,255,255,0.06); border-radius: 100px; overflow: hidden; }
.pf-mood-fill { height: 100%; border-radius: 100px; transition: width 0.6s ease; }
.pf-mood-count { font-size: 12px; color: rgba(148,163,184,0.45); width: 20px; text-align: right; flex-shrink: 0; }

/* Activity feed */
.pf-activity { display: flex; flex-direction: column; gap: 1px; }
.pf-activity-item {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.pf-activity-item:last-child { border-bottom: none; }
.pf-activity-icon-wrap {
  width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
  background: rgba(255,255,255,0.05);
  display: flex; align-items: center; justify-content: center;
}
.pf-activity-body { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.pf-activity-label { font-size: 13.5px; color: #e2e8f0; line-height: 1.4; }
.pf-activity-sub { font-size: 11.5px; color: rgba(148,163,184,0.5); }

/* Empty states */
.pf-empty {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 16px 0; color: rgba(148,163,184,0.45); font-size: 13px; text-align: center;
}
.pf-empty-lg {
  align-items: center; padding: 36px 20px; gap: 10px; text-align: center;
  color: rgba(148,163,184,0.45);
}
.pf-cta-link {
  background: none; border: none; color: #a78bfa; font-size: 13px;
  cursor: pointer; font-family: inherit; padding: 0; margin-top: 4px;
}
.pf-cta-link:hover { color: #c084fc; text-decoration: underline; }

/* Whispers */
.pf-whisper-card { gap: 10px; }
.pf-whisper-text {
  font-size: 14px; color: #cbd5e1; line-height: 1.65;
  font-style: italic;
}
.pf-whisper-meta { display: flex; align-items: center; justify-content: space-between; }
.pf-whisper-meta-left { display: flex; gap: 8px; }
.pf-whisper-meta-right { display: flex; align-items: center; gap: 12px; }
.pf-emotion-tag {
  font-size: 11px; font-weight: 500; text-transform: capitalize;
  border: 1px solid; border-radius: 100px; padding: 2px 8px;
}
.pf-whisper-hearts { display: flex; align-items: center; gap: 4px; font-size: 12px; color: rgba(148,163,184,0.5); }
.pf-whisper-date { font-size: 11.5px; color: rgba(148,163,184,0.4); }

/* Café */
.pf-cafe-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.pf-cafe-topic { font-size: 14px; font-weight: 600; color: #fde68a; }
.pf-cafe-cat {
  font-size: 11px; color: #fbbf24;
  background: rgba(251,191,36,0.1); border: 1px solid rgba(251,191,36,0.2);
  border-radius: 100px; padding: 2px 8px; white-space: nowrap;
}
.pf-cafe-content { font-size: 13.5px; color: #cbd5e1; line-height: 1.6; }
.pf-cafe-meta { display: flex; align-items: center; justify-content: space-between; }
.pf-cafe-replies { display: flex; align-items: center; gap: 5px; font-size: 12px; color: rgba(148,163,184,0.5); }

/* Music */
.pf-stations { display: flex; flex-wrap: wrap; gap: 10px; }
.pf-station {
  display: flex; align-items: center; gap: 8px;
  background: rgba(96,165,250,0.08);
  border: 1px solid rgba(96,165,250,0.2);
  border-radius: 12px; padding: 10px 16px;
  font-size: 13px; font-weight: 500; color: #bfdbfe;
  text-transform: capitalize;
  transition: background 0.2s;
}
.pf-station:hover { background: rgba(96,165,250,0.13); }
`;export{ye as default};