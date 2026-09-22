
const CANONICAL_SYLLABUS = {
  physics:[
    
    {id:101,name:'Units and Measurements',theory:false,practice:false,class:'11',unit:'Mechanics 1'},
    {id:102,name:'Mathematical Tools',theory:false,practice:false,class:'11',unit:'Mechanics 1'},
    {id:103,name:'Motion in 1 Dimension',theory:false,practice:false,class:'11',unit:'Mechanics 1'},
    {id:104,name:'Motion in 2 Dimension',theory:false,practice:false,class:'11',unit:'Mechanics 1'},
    {id:105,name:'Laws of Motion',theory:false,practice:false,class:'11',unit:'Mechanics 1'},
    {id:106,name:'Work Power Energy',theory:false,practice:false,class:'11',unit:'Mechanics 1'},
    {id:107,name:'Center of Mass & Collision',theory:false,practice:false,class:'11',unit:'Mechanics 1'},
    {id:108,name:'Rotational Motion',theory:false,practice:false,class:'11',unit:'Mechanics 1'},
    {id:109,name:'Gravitation',theory:false,practice:false,class:'11',unit:'Mechanics 1'},
    
    {id:110,name:'Mechanical Properties of Solids',theory:false,practice:false,class:'11',unit:'Mechanics 2'},
    {id:111,name:'Mechanical Properties of Fluids',theory:false,practice:false,class:'11',unit:'Mechanics 2'},
    {id:112,name:'Oscillations',theory:false,practice:false,class:'11',unit:'Mechanics 2'},
    {id:113,name:'Waves and Sound',theory:false,practice:false,class:'11',unit:'Mechanics 2'},
    
    {id:114,name:'Thermal Properties of Matter',theory:false,practice:false,class:'11',unit:'Thermodynamics'},
    {id:115,name:'Thermodynamics',theory:false,practice:false,class:'11',unit:'Thermodynamics'},
    {id:116,name:'Kinetic Theory of Gases',theory:false,practice:false,class:'11',unit:'Thermodynamics'},
    
    {id:117,name:'Electric Charges and Fields',theory:false,practice:false,class:'12',unit:'Electromagnetism'},
    {id:118,name:'Electrostatic Potential and Capacitance',theory:false,practice:false,class:'12',unit:'Electromagnetism'},
    {id:119,name:'Current Electricity',theory:false,practice:false,class:'12',unit:'Electromagnetism'},
    {id:120,name:'Moving Charges and Magnetism',theory:false,practice:false,class:'12',unit:'Electromagnetism'},
    {id:121,name:'Magnetism and Matter',theory:false,practice:false,class:'12',unit:'Electromagnetism'},
    {id:122,name:'Electromagnetic Induction',theory:false,practice:false,class:'12',unit:'Electromagnetism'},
    {id:123,name:'Alternating Current',theory:false,practice:false,class:'12',unit:'Electromagnetism'},
    
    {id:124,name:'Ray Optics',theory:false,practice:false,class:'12',unit:'Optics'},
    {id:125,name:'Wave Optics',theory:false,practice:false,class:'12',unit:'Optics'},
    
    {id:126,name:'Dual Nature of Matter',theory:false,practice:false,class:'12',unit:'Modern Physics'},
    {id:127,name:'Atomic Physics',theory:false,practice:false,class:'12',unit:'Modern Physics'},
    {id:128,name:'Nuclear Physics',theory:false,practice:false,class:'12',unit:'Modern Physics'},
    
    {id:129,name:'Electromagnetic Waves',theory:false,practice:false,class:'12',unit:'Miscellaneous Physics'},
    {id:130,name:'Semiconductor',theory:false,practice:false,class:'12',unit:'Miscellaneous Physics'}
  ],
  chemistry:[
    
    {id:201,name:'Some Basic Concepts of Chemistry',theory:false,practice:false,section:'physical',class:'11',unit:'Physical Chemistry'},
    {id:202,name:'Structure of Atom',theory:false,practice:false,section:'physical',class:'11',unit:'Physical Chemistry'},
    {id:203,name:'Thermodynamics',theory:false,practice:false,section:'physical',class:'11',unit:'Physical Chemistry'},
    {id:204,name:'Chemical Equilibrium',theory:false,practice:false,section:'physical',class:'11',unit:'Physical Chemistry'},
    {id:205,name:'Ionic Equilibrium',theory:false,practice:false,section:'physical',class:'11',unit:'Physical Chemistry'},
    {id:206,name:'Redox Reactions',theory:false,practice:false,section:'physical',class:'11',unit:'Physical Chemistry'},
    
    {id:207,name:'Classification of Elements',theory:false,practice:false,section:'inorganic',class:'11',unit:'Inorganic Chemistry'},
    {id:208,name:'Chemical Bonding and Molecular Structure',theory:false,practice:false,section:'inorganic',class:'11',unit:'Inorganic Chemistry'},
    {id:209,name:'p Block Elements',theory:false,practice:false,section:'inorganic',class:'11',unit:'Inorganic Chemistry'},
    {id:210,name:'Hydrogen',theory:false,practice:false,section:'inorganic',class:'11',unit:'Inorganic Chemistry',adv:true},
    {id:211,name:'s Block Elements',theory:false,practice:false,section:'inorganic',class:'11',unit:'Inorganic Chemistry',adv:true},
    
    {id:212,name:'General Organic Chemistry',theory:false,practice:false,section:'organic',class:'11',unit:'Organic Chemistry'},
    {id:213,name:'Hydrocarbons',theory:false,practice:false,section:'organic',class:'11',unit:'Organic Chemistry'},
    
    {id:214,name:'Solutions',theory:false,practice:false,section:'physical',class:'12',unit:'Physical Chemistry'},
    {id:215,name:'Electrochemistry',theory:false,practice:false,section:'physical',class:'12',unit:'Physical Chemistry'},
    {id:216,name:'Chemical Kinetics',theory:false,practice:false,section:'physical',class:'12',unit:'Physical Chemistry'},
    {id:217,name:'Surface Chemistry',theory:false,practice:false,section:'physical',class:'12',unit:'Physical Chemistry',adv:true},
    {id:218,name:'Solid State',theory:false,practice:false,section:'physical',class:'12',unit:'Physical Chemistry',adv:true},
    
    {id:219,name:'d and f Block Elements',theory:false,practice:false,section:'inorganic',class:'12',unit:'Inorganic Chemistry'},
    {id:220,name:'Coordination Compounds',theory:false,practice:false,section:'inorganic',class:'12',unit:'Inorganic Chemistry'},
    {id:221,name:'p Block Elements (12th)',theory:false,practice:false,section:'inorganic',class:'12',unit:'Inorganic Chemistry'},
    {id:222,name:'Practical Chemistry',theory:false,practice:false,section:'inorganic',class:'12',unit:'Inorganic Chemistry'},
    {id:223,name:'General Principles & Isolation of Metals',theory:false,practice:false,section:'inorganic',class:'12',unit:'Inorganic Chemistry',adv:true},
    
    {id:224,name:'Haloalkanes and Haloarenes',theory:false,practice:false,section:'organic',class:'12',unit:'Organic Chemistry'},
    {id:225,name:'Alcohols Phenols and Ethers',theory:false,practice:false,section:'organic',class:'12',unit:'Organic Chemistry'},
    {id:226,name:'Aldehydes Ketones',theory:false,practice:false,section:'organic',class:'12',unit:'Organic Chemistry'},
    {id:227,name:'Carboxylic Acids Derivatives',theory:false,practice:false,section:'organic',class:'12',unit:'Organic Chemistry'},
    {id:228,name:'Amines',theory:false,practice:false,section:'organic',class:'12',unit:'Organic Chemistry'},
    {id:229,name:'Biomolecules',theory:false,practice:false,section:'organic',class:'12',unit:'Organic Chemistry'},
    {id:230,name:'Polymers',theory:false,practice:false,section:'organic',class:'12',unit:'Organic Chemistry',adv:true},
    {id:231,name:'Chemistry in Everyday Life',theory:false,practice:false,section:'organic',class:'12',unit:'Organic Chemistry',adv:true}
  ],
  maths:[
    
    {id:301,name:'Quadratic Equation',theory:false,practice:false,class:'11',unit:'Algebra'},
    {id:302,name:'Complex Numbers',theory:false,practice:false,class:'11',unit:'Algebra'},
    {id:303,name:'Permutations and Combinations',theory:false,practice:false,class:'11',unit:'Algebra'},
    {id:304,name:'Binomial Theorem',theory:false,practice:false,class:'11',unit:'Algebra'},
    {id:305,name:'Sequences and Series',theory:false,practice:false,class:'11',unit:'Algebra'},
    {id:306,name:'Statistics',theory:false,practice:false,class:'11',unit:'Algebra'},
    
    {id:307,name:'Trigonometric Functions',theory:false,practice:false,class:'11',unit:'Trigonometry'},
    {id:308,name:'Triangle',theory:false,practice:false,class:'11',unit:'Trigonometry',adv:true},

    
    {id:309,name:'Straight Lines',theory:false,practice:false,class:'11',unit:'Coordinate Geometry'},
    {id:310,name:'Circle',theory:false,practice:false,class:'11',unit:'Coordinate Geometry'},
    {id:311,name:'Parabola',theory:false,practice:false,class:'11',unit:'Coordinate Geometry'},
    {id:312,name:'Ellipse',theory:false,practice:false,class:'11',unit:'Coordinate Geometry'},
    {id:313,name:'Hyperbola',theory:false,practice:false,class:'11',unit:'Coordinate Geometry'},
    
    {id:314,name:'Limits and Derivatives',theory:false,practice:false,class:'11',unit:'Calculus'},
    
    {id:315,name:'Matrices',theory:false,practice:false,class:'12',unit:'Algebra'},
    {id:316,name:'Determinants',theory:false,practice:false,class:'12',unit:'Algebra'},
    {id:317,name:'Probability',theory:false,practice:false,class:'12',unit:'Algebra'},
    
    {id:318,name:'Inverse Trigonometric Functions',theory:false,practice:false,class:'12',unit:'Trigonometry'},
    
    {id:319,name:'Sets Relations & Functions',theory:false,practice:false,class:'12',unit:'Calculus'},
    {id:320,name:'Continuity and Differentiability',theory:false,practice:false,class:'12',unit:'Calculus'},
    {id:321,name:'Method of Differentiation',theory:false,practice:false,class:'12',unit:'Calculus'},
    {id:322,name:'Applications of Derivatives',theory:false,practice:false,class:'12',unit:'Calculus'},
    {id:323,name:'Indefinite Integration',theory:false,practice:false,class:'12',unit:'Calculus'},
    {id:324,name:'Definite Integration',theory:false,practice:false,class:'12',unit:'Calculus'},
    {id:325,name:'Application of Integrals',theory:false,practice:false,class:'12',unit:'Calculus'},
    {id:326,name:'Differential Equations',theory:false,practice:false,class:'12',unit:'Calculus'},
    
    {id:327,name:'Vector Algebra',theory:false,practice:false,class:'12',unit:'Vectors & 3D'},
    {id:328,name:'Three Dimensional Geometry',theory:false,practice:false,class:'12',unit:'Vectors & 3D'}
  ]
};

// Canonical chapters use small hand-assigned ids (100s/200s/300s ranges).
// User-added custom chapters use Date.now() as their id, which is always
// far larger — this lets us tell the two apart without a separate flag.
const CUSTOM_CHAPTER_ID_THRESHOLD = 100000;
function isCustomChapter(c){ return !!c && c.id > CUSTOM_CHAPTER_ID_THRESHOLD; }

(function(){
  try{
    const raw = localStorage.getItem('jt3');
    if(raw){
      const p = JSON.parse(raw);
      if(p && p.syllabus){
        const merged = {};
        ['physics','chemistry','maths'].forEach(subj=>{
          const canon = CANONICAL_SYLLABUS[subj] || [];
          const existing = Array.isArray(p.syllabus[subj]) ? p.syllabus[subj] : [];
          const existingById = {};
          existing.forEach(ch => { existingById[ch.id] = ch; });
          
          const mergedList = canon.map(c => {
            const prior = existingById[c.id];
            return prior ? { ...c, theory: !!prior.theory, practice: !!prior.practice } : { ...c };
          });
          
          existing.forEach(ch => { if(isCustomChapter(ch)) mergedList.push(ch); });
          merged[subj] = mergedList;
        });
        p.syllabus = merged;
        localStorage.setItem('jt3', JSON.stringify(p));
      }
    }
  }catch(e){}
})();

let S = JSON.parse(localStorage.getItem('jt3')||'null') || {
  tests:[],hours:[],backlogs:[],todos:[],upcoming:[],
  syllabus:JSON.parse(JSON.stringify(CANONICAL_SYLLABUS)),
  backlogStreak:0,backlogBestStreak:0,lastBLClear:null,
  subjStreaks:{physics:0,chemistry:0,maths:0},
  subjBestStreaks:{physics:0,chemistry:0,maths:0},
  notifiedHWT:[]
};
const F={mains:{session:'all',type:'all',subj:'all'},advanced:{paper:'all',type:'all',subj:'all'},hours:{period:'week',subj:'all',from:null,to:null},backlog:{subj:'all',status:'pending'},todo:{subj:'all',status:'pending'},syl:'physics',sylIncludeAdv:false,sylClass:'all',practice:{period:'week',subj:'all',chapter:'all',from:null,to:null,feedShown:20}};
const M={ov:'pct',mn:'pct',adv:'pct',cmp:'pct'};
let CIs={};
let undoStack=null;
let undoTimer=null;
let currentQLType='lecture';
let dismissedNotifs=new Set();




function getDefaultJeeYear(){
  const now=new Date();
  const y=now.getFullYear();
  const juneFirst=new Date(y,5,1); 
  return now>=juneFirst ? y+1 : y;
}
function getTargetYear(){ return parseInt(userProfile?.target_year || localStorage.getItem('jt_target_year') || String(getDefaultJeeYear()), 10); }
function getJeeMainsDate(){ return new Date(getTargetYear()+'-01-20'); }
function getJeeAdvDate()  { return new Date(getTargetYear()+'-05-17'); }

function dismissNotif(id){dismissedNotifs.add(id);renderOvNotifs();}
function renderOvNotifs(){
  const tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1);const tmrStr=tomorrow.toISOString().split('T')[0];
  const notifs=[];
  
  S.upcoming.filter(t=>t.date===tmrStr).forEach(t=>notifs.push({id:'tmr-'+t.id,c:'am',msg:`⏰ Test TOMORROW: ${cap(t.exam)} ${t.session||''} ${t.venue?'@ '+t.venue:''}`,fn:`nav('${t.exam==='mains'?'mains':'advanced'}');setTimeout(()=>{ const btn=document.querySelector('[data-group="${t.exam==='mains'?'mn-view':'adv-view'}"][onclick*="upcoming"]'); if(btn){btn.click();} },200);`}));
  S.upcoming.filter(t=>t.date===td()).forEach(t=>notifs.push({id:'tdy-'+t.id,c:'rd',msg:`🔴 Test TODAY: ${cap(t.exam)} ${t.session||''} ${t.venue?'@ '+t.venue:''}`,fn:`openLogFromUpcoming(${t.id})`,cta:'+ Add Score'}));
  const visible=notifs.filter(n=>!dismissedNotifs.has(n.id));
  document.getElementById('ov-notifs').innerHTML=visible.map(n=>`<div id="notif-${n.id}" class="nb ${n.c}" style="cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:10px" onclick="${n.fn}"><span>${n.msg}</span><span style="display:flex;align-items:center;gap:6px;flex-shrink:0">${n.cta?`<span style="font-size:11px;font-weight:700;color:inherit;background:rgba(255,255,255,.14);padding:4px 10px;border-radius:99px;white-space:nowrap">${n.cta}</span>`:''}<button class="nb-x" onclick="event.stopPropagation();dismissNotif('${n.id}')" title="Dismiss">✕</button></span></div>`).join('');
}

// save() removed — was stale/dead code (superseded by app-05-sync-engagement.js's
// real implementation, which already handles the debounced server sync this
// old version never did; harmless before only because module-scope exposure
// silently overwrote this classic-script version at runtime — see the
// duplicate-declaration note in dashboard-controller.js's own header).
function td(){return new Date().toISOString().split('T')[0]}
function dc(id){if(CIs[id]){try{CIs[id].destroy();}catch(e){}delete CIs[id]}}

function uC(id, newData, newOptions){
  const chart = CIs[id];
  if(chart){
    try{
      chart.data = newData;
      if(newOptions) chart.options = newOptions;
      chart.update('none'); 
      return chart;
    }catch(e){ dc(id); }
  }
  return null; 
}
function cap(s){return s?s.charAt(0).toUpperCase()+s.slice(1):''}
function pct(s,m){return m?(s/m*100).toFixed(1):0}
function sbg(p){if(p>=80)return'bg';if(p>=60)return'bb';if(p>=40)return'ba';return'br'}
function sbgGoal(score, max, exam){
  const goal = exam==='advanced' ? getGoalAdv() : getGoalMains();
  const goalPct = (goal / max) * 100;
  const scorePct = (score / max) * 100;
  if(scorePct >= goalPct) return 'bg';           
  if(scorePct >= goalPct * 0.85) return 'ba';   
  return 'br';                                   
}
function sc(s){return s==='physics'?'#60a5fa':s==='chemistry'?'#34d399':'#fbbf24'}
function l7(){return Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);return d.toISOString().split('T')[0]})}
function dLeft(dt){const n=new Date();n.setHours(0,0,0,0);return Math.max(0,Math.ceil((dt-n)/86400000))}
function sO(){return{x:{grid:{color:'rgba(255,255,255,0.05)'},ticks:{color:'#7a7990',font:{size:9,family:"'DM Mono',monospace"}}},y:{grid:{color:'rgba(255,255,255,0.05)'},ticks:{color:'#7a7990',font:{size:9,family:"'DM Mono',monospace"}}}}}

function pushUndo(type, data, label, isDelete){
  undoStack={type,data};
  clearTimeout(undoTimer);
  const bar=document.getElementById('undobar');
  document.getElementById('undo-msg').textContent=label;
  
  const iconEl=document.getElementById('undo-icon');
  const prog=document.getElementById('undo-bar-progress');
  if(isDelete){
    bar.classList.remove('green');
    if(iconEl){iconEl.style.background='rgba(248,113,113,.15)';iconEl.style.color='#f87171';iconEl.innerHTML='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>';}
    if(prog)prog.style.background='linear-gradient(90deg,#f87171,#fca5a5)';
  }else{
    bar.classList.add('green');
    if(iconEl){iconEl.style.background='rgba(52,211,153,.15)';iconEl.style.color='#34d399';iconEl.innerHTML='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';}
    if(prog)prog.style.background='linear-gradient(90deg,#34d399,#6ee7b7)';
  }
  
  if(prog){prog.style.animation='none';void prog.offsetWidth;prog.style.animation='toastBarShrink 5s linear forwards';}
  bar.classList.add('show');
  undoTimer=setTimeout(()=>{bar.classList.remove('show','green');undoStack=null;},5000);
}
function doUndo(){
  if(!undoStack)return;
  const {type,data}=undoStack;
  if(type==='test'){S.tests=S.tests.filter(x=>x.id!==data.id);S.tests.push(data);S.tests.sort((a,b)=>a.date.localeCompare(b.date));}
  else if(type==='hours'){S.hours=S.hours.filter(x=>x.id!==data.id);S.hours.push(data);}
  else if(type==='todo'){S.todos=S.todos.filter(x=>x.id!==data.id);S.todos.push(data);}
  else if(type==='backlog'){S.backlogs=S.backlogs.filter(x=>x.id!==data.id);S.backlogs.push(data);}
  else if(type==='upcoming'){S.upcoming=S.upcoming.filter(x=>x.id!==data.id);S.upcoming.push(data);}
  else if(type==='chapter'){
    if(!S.syllabus[data.subj])S.syllabus[data.subj]=[];
    S.syllabus[data.subj].push(data.ch);
  }
  else if(type==='practiceLog'){S.practiceLogs=(S.practiceLogs||[]).filter(x=>x.id!==data.id);S.practiceLogs.push(data);}
  save();undoStack=null;document.getElementById('undobar').classList.remove('show');
  toast('Undone ↩', 'success');navMarkDirty(null);renderAll();
}

let confAnim=null;
let miniConfAnim=null;
let celParticles=[];
let miniParticles=[];
let miniCelTimer=null;

const MINI_EMOJIS=['🎊','✨','🌟','💫','⭐','🎈','🎀'];
const GRAND_EMOJIS=['🎆','🎇','🏆','⭐','💥','✨','🎊','🌟','💫','🎉'];

function celebrate(emoji,title,sub,grand=false){
  if(grand){
    const o=document.getElementById('cel-overlay');
    const $=id=>{const el=document.getElementById(id);return el||{textContent:'',style:{},innerHTML:'',classList:{add:()=>{},remove:()=>{}}};};

    
    const scoreMatch=sub.match(/(\d+)\/(\d+)/);
    const scored=scoreMatch?parseInt(scoreMatch[1]):null;
    const maxScore=scoreMatch?parseInt(scoreMatch[2]):null;
    const pct=scored&&maxScore?Math.round(scored/maxScore*100):null;
    const isMains=title.toLowerCase().includes('mains')||emoji==='🏆';

    
    document.getElementById('cel-svg-trophy').style.display=isMains?'block':'none';
    document.getElementById('cel-svg-star').style.display=isMains?'none':'block';

    
    const pill=$('cel-pill');
    pill.querySelector('span').textContent=isMains?'MAINS GOAL CRUSHED':'ADVANCED GOAL CRUSHED';

    
    const titleParts=title.split('!');
    $('cel-title').textContent=titleParts[0]+(titleParts.length>1?'!':'');

    
    if(scored&&maxScore){
      $('cel-score-wrap').style.display='block';
      $('cel-score-num').textContent=scored;
      $('cel-score-max').textContent=maxScore;
      const bar=document.getElementById('cel-score-bar');
      if(bar){bar.style.setProperty('--cel-bar-w',pct+'%');}
    } else {
      $('cel-score-wrap').style.display='none';
    }

    
    const subClean=sub.replace(/\d+\/\d+\s*—\s*/,'').replace(/\d+\/\d+/,'');
    $('cel-sub').textContent=subClean.trim()||'Incredible performance!';

    
    if(pct) $('cel-stat-pct').textContent=pct+'%';
    $('cel-stat-exam').textContent=isMains?'Mains':'Advanced';

    
    o.classList.add('show');
    startConfetti(true);
    playSound(true);
    if(navigator.vibrate)navigator.vibrate([100,50,100,50,200,50,300]);
  } else {
    const el=document.getElementById('mini-cel');
    const inner=document.getElementById('mini-cel-inner');
    const icon=document.getElementById('mini-cel-icon');
    const titleEl=document.getElementById('mini-cel-title');
    const subEl=document.getElementById('mini-cel-sub');
    if(!el||!inner||!icon||!titleEl||!subEl) return;
    icon.textContent=emoji;
    titleEl.textContent=title;
    subEl.textContent=sub;
    
    const palettes=[
      ['rgba(52,211,153,.18)','1px solid rgba(52,211,153,.4)','#34d399'],
      ['rgba(124,106,247,.18)','1px solid rgba(166,149,255,.4)','#a695ff'],
      ['rgba(251,191,36,.15)','1px solid rgba(251,191,36,.35)','#fbbf24'],
      ['rgba(96,165,250,.15)','1px solid rgba(96,165,250,.35)','#60a5fa'],
      ['rgba(244,114,182,.15)','1px solid rgba(244,114,182,.35)','#f472b6'],
    ];
    const [bg,border,accent]=palettes[Math.floor(Math.random()*palettes.length)];
    inner.style.background=`linear-gradient(135deg,var(--sf3),${bg})`;
    inner.style.border=border;
    icon.style.background=bg;
    icon.style.boxShadow=`0 0 0 2px ${accent}50, 0 0 16px ${accent}40`;
    
    launchMiniConfetti(accent);
    
    launchMiniFloaters(el);
    el.style.display='block';
    el.style.animation='miniSlideIn .4s cubic-bezier(.34,1.56,.64,1) forwards';
    clearTimeout(miniCelTimer);
    playSound(false);
    
    if(navigator.vibrate)navigator.vibrate([50,30,80]);
    if(navigator.vibrate)navigator.vibrate([80,40,80]);
    miniCelTimer=setTimeout(()=>{
      el.style.animation='miniSlideOut .35s ease-in forwards';
      setTimeout(()=>{el.style.display='none';el.style.animation='';},360);
    },2600);
  }
}

function launchMiniConfetti(accent){
  const canvas=document.getElementById('mini-confetti');
  if(!canvas)return;
  canvas.width=360;canvas.height=220;
  const ctx=canvas.getContext('2d');
  const cols=[accent,'#fff','#fbbf24',accent+'cc'];
  const particles=Array.from({length:32},()=>({
    x:canvas.width/2+Math.random()*80-40,y:canvas.height/2+20,
    vx:(Math.random()-0.5)*6,vy:-(Math.random()*5+2),
    r:Math.random()*Math.PI*2,vr:(Math.random()-.5)*.2,
    w:Math.random()*6+3,h:Math.random()*9+4,
    c:cols[Math.floor(Math.random()*cols.length)],alpha:1
  }));
  let _af;
  function frame(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    let alive=false;
    particles.forEach(p=>{
      p.x+=p.vx;p.y+=p.vy;p.vy+=.15;p.r+=p.vr;p.alpha=Math.max(0,p.alpha-.025);
      if(p.alpha>0)alive=true;
      ctx.save();ctx.globalAlpha=p.alpha;ctx.translate(p.x,p.y);ctx.rotate(p.r);
      ctx.fillStyle=p.c;ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
      ctx.restore();
    });
    if(alive)_af=requestAnimationFrame(frame);
  }
  frame();
}

function launchMiniFloaters(container){
  
  container.querySelectorAll('.mini-float').forEach(e=>e.remove());
  const EMOJIS=['🎉','✨','🌟','🎊','💫','⭐','🔥','🎈'];
  for(let i=0;i<7;i++){
    const d=document.createElement('div');
    d.className='mini-float';
    d.textContent=EMOJIS[Math.floor(Math.random()*EMOJIS.length)];
    const x=Math.random()*240;
    const sz=10+Math.random()*10;
    const dur=0.7+Math.random()*0.8;
    const delay=i*0.05;
    d.style.cssText=`position:absolute;bottom:8px;left:${x}px;font-size:${sz}px;pointer-events:none;z-index:2;animation:floatEmoji ${dur}s ease-out ${delay}s forwards;line-height:1`;
    container.appendChild(d);
    setTimeout(()=>d.remove(),(dur+delay)*1000+200);
  }
}

function burstGrandEmojis(){
  
  for(let i=0;i<18;i++){
    setTimeout(()=>{
      const d=document.createElement('div');
      d.textContent=GRAND_EMOJIS[Math.floor(Math.random()*GRAND_EMOJIS.length)];
      const x=10+Math.random()*80;
      const dur=1.2+Math.random()*1.4;
      const sz=18+Math.random()*22;
      d.style.cssText=`position:fixed;font-size:${sz}px;left:${x}vw;bottom:-40px;z-index:903;pointer-events:none;animation:floatUp ${dur}s ease-out forwards`;
      document.body.appendChild(d);
      setTimeout(()=>d.remove(),dur*1000+100);
    },i*90);
  }
}

function closeCel(){
  document.getElementById('cel-overlay').classList.remove('show');
  cancelAnimationFrame(confAnim);
  celParticles=[];
  const c=document.getElementById('confetti-canvas');
  if(c) c.getContext('2d').clearRect(0,0,c.width,c.height);
}

async function shareScore(){
  const scoreNum=document.getElementById('cel-score-num')?.textContent||'';
  const examPill=document.getElementById('cel-pill')?.querySelector('span')?.textContent||'';
  const isMains=examPill.toLowerCase().includes('mains');
  const examLabel=isMains?'JEE Mains':'JEE Advanced';
  const examMax=isMains?'300':'360';
  const goal=isMains?getGoalMains():getGoalAdv();
  const shareUrl='https://www.jeetrack.in';
  const shareText=
`🏆 I scored ${scoreNum}/${examMax} in ${examLabel}!

JEETrack helped me set a clear goal (${goal}/${examMax}), track every mock test, and stay consistent. I hit it — and you can too.

Start tracking your JEE prep for free 👇
${shareUrl}

#JEE${getTargetYear()} #JEEMains #JEEPreparation #JEETrack`;

  if(navigator.share){
    try{
      await navigator.share({title:`JEETrack — ${examLabel} Goal Crushed! 🏆`, text:shareText, url:shareUrl});
    }catch(e){if(e.name!=='AbortError')fallbackShare(shareText,shareUrl);}
  } else {
    fallbackShare(shareText,shareUrl);
  }
}
function fallbackShare(text,url){
  const full=text+'\n'+url;
  if(navigator.clipboard){
    navigator.clipboard.writeText(full).then(()=>toast('Copied to clipboard! 🎯', 'success'));
  } else {
    const ta=document.createElement('textarea');ta.value=full;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();toast('Copied! 🎯', 'success');
  }
}

function startConfetti(grand){
  const canvas=document.getElementById('confetti-canvas');
  const dpr=Math.min(window.devicePixelRatio||1,2);
  const W=window.innerWidth,H=window.innerHeight;
  canvas.width=W*dpr;canvas.height=H*dpr;
  canvas.style.width=W+'px';canvas.style.height=H+'px';
  const ctx=canvas.getContext('2d');
  ctx.scale(dpr,dpr);
  const cols=['#a695ff','#f472b6','#fbbf24','#34d399','#60a5fa','#fff'];
  
  const isMobile=W<600;
  const count=isMobile?60:100;
  celParticles=Array.from({length:count},()=>({
    x:Math.random()*W,
    y:-(Math.random()*H*0.6+40),
    w:5+Math.random()*5,
    h:8+Math.random()*8,
    c:cols[Math.floor(Math.random()*cols.length)],
    r:Math.random()*Math.PI*2,
    vx:(Math.random()-0.5)*3,
    vy:1.8+Math.random()*3,
    vr:(Math.random()-.5)*.12
  }));
  let last=0;
  function frame(ts){
    
    if(ts-last<18){confAnim=requestAnimationFrame(frame);return;}
    last=ts;
    ctx.clearRect(0,0,W,H);
    let alive=false;
    for(let i=0;i<celParticles.length;i++){
      const p=celParticles[i];
      p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;p.vy+=0.06;
      if(p.y<H+20)alive=true;
      else continue;
      const alpha=Math.max(0,1-(p.y/H)*1.1);
      ctx.save();
      ctx.globalAlpha=alpha;
      ctx.translate(p.x,p.y);
      ctx.rotate(p.r);
      ctx.fillStyle=p.c;
      ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
      ctx.restore();
    }
    if(alive)confAnim=requestAnimationFrame(frame);
  }
  confAnim=requestAnimationFrame(frame);
}

function playSound(grand){
  try{
    const ac=new (window.AudioContext||window.webkitAudioContext)();
    if(grand){
      
      const melody=[523,659,784,1047,1319,1568];
      melody.forEach((f,i)=>{
        const o=ac.createOscillator(),g=ac.createGain();
        o.connect(g);g.connect(ac.destination);
        o.frequency.value=f;o.type='sine';
        const t=ac.currentTime+i*.11;
        g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.45,t+.04);
        g.gain.exponentialRampToValueAtTime(.001,t+.6);
        o.start(t);o.stop(t+.65);
      });
      
      [523,659,784,1047].forEach(f=>{
        const o=ac.createOscillator(),g=ac.createGain();
        o.connect(g);g.connect(ac.destination);
        o.frequency.value=f;o.type='triangle';
        g.gain.setValueAtTime(.12,ac.currentTime+.55);
        g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+1.6);
        o.start(ac.currentTime+.55);o.stop(ac.currentTime+1.7);
      });
      
      const buf=ac.createBuffer(1,ac.sampleRate*.3,ac.sampleRate);
      const d=buf.getChannelData(0);
      for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3)*.6;
      const src=ac.createBufferSource(),g2=ac.createGain();
      src.buffer=buf;src.connect(g2);g2.connect(ac.destination);
      g2.gain.value=.7;src.start(ac.currentTime);
    } else {
      
      [523,659,784].forEach((f,i)=>{
        const o=ac.createOscillator(),g=ac.createGain();
        o.connect(g);g.connect(ac.destination);
        o.frequency.value=f;o.type='triangle';
        const t=ac.currentTime+i*.09;
        g.gain.setValueAtTime(.22,t);
        g.gain.exponentialRampToValueAtTime(.001,t+.25);
        o.start(t);o.stop(t+.28);
      });
      
      const o2=ac.createOscillator(),g2=ac.createGain();
      o2.connect(g2);g2.connect(ac.destination);
      o2.frequency.value=1568;o2.type='sine';
      g2.gain.setValueAtTime(.15,ac.currentTime+.28);
      g2.gain.exponentialRampToValueAtTime(.001,ac.currentTime+.55);
      o2.start(ac.currentTime+.28);o2.stop(ac.currentTime+.58);
    }
  }catch(e){}
}

function animateNumber(el, target, durationOrSuffix=600, suffix=''){
  if(!el) return;
  let duration = 600;
  if(typeof durationOrSuffix === 'string'){ suffix = durationOrSuffix; }
  else { duration = durationOrSuffix; }
  const start = parseFloat(el.textContent) || 0;
  const isFloat = String(target).includes('.');
  const startTime = performance.now();
  const update = (now) => {
    const elapsed = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - elapsed, 3);
    const val = start + (target - start) * ease;
    el.textContent = (isFloat ? val.toFixed(1) : Math.round(val)) + suffix;
    if(elapsed < 1) requestAnimationFrame(update);
    else {
      el.textContent = (isFloat ? target.toFixed(1) : target) + suffix;
      el.classList.add('updated');
      setTimeout(()=>el.classList.remove('updated'), 400);
    }
  };
  requestAnimationFrame(update);
}

function staggerItems(selector, parent){
  const els = parent ? parent.querySelectorAll(selector) : document.querySelectorAll(selector);
  els.forEach((el, i) => { el.style.animationDelay = `${i * 50}ms`; });
}

const _navCache={pages:null,niItems:null,mobItems:null,dirty:{overview:true,mains:true,advanced:true,compare:true,hours:true,todo:true,backlog:true,syllabus:true,practice:true,settings:true}};
function _navPages(){return _navCache.pages||(_navCache.pages=[...document.querySelectorAll('.page')])}
function _navNi(){return _navCache.niItems||(_navCache.niItems=[...document.querySelectorAll('.ni')])}
function _mobNavItems(){return _navCache.mobItems||(_navCache.mobItems=[...document.querySelectorAll('.mob-nav-item')])}
function _setMobActive(el){_mobNavItems().forEach(b=>b.classList.remove('active'));if(el)el.classList.add('active');}
function navMarkDirty(page){if(page){_navCache.dirty[page]=true;}else{Object.keys(_navCache.dirty).forEach(k=>_navCache.dirty[k]=true);}}


function _handleRoute(){
  const path = window.location.pathname;
  const tab = new URLSearchParams(window.location.search).get('tab');
  
  
  const _indexablePaths = ['/', '/dashboard', '/faq', '/features', '/about', '/privacy', '/terms'];
  _setRobotsMeta(_indexablePaths.includes(path));
  
  if(path === '/login'){ showAuthScreen(); return; }
  if(path === '/onboarding'){
    
    if(typeof currentUser !== 'undefined' && currentUser && typeof userProfile !== 'undefined' && !userProfile.onboarding_done){
      showOnboarding();
    } else {
      showAuthScreen();
    }
    return;
  }
  if(path === '/tests'){ _navInternal('tests', false); return; }
  if(path === '/settings'){
    _navInternal('settings', false);
    if(tab && _settingsTabs.includes(tab)){
      setTimeout(()=>{ const btn=document.querySelector(`.settings-nav-item[onclick*="'${tab}'"]`); settingsNavTap(tab,btn); }, 80);
    }
    return;
  }
  _navInternal(_routeMap[path] || 'overview', false);
}

window.addEventListener('popstate', function(e) {
  const path = window.location.pathname;
  
  if ((path === '/login' || path === '/onboarding') && typeof currentUser !== 'undefined' && currentUser) {
    history.pushState({page:'overview'}, '', '/dashboard');
    _navInternal('overview', false);
    return;
  }
  
  if (!e.state && path === '/dashboard') {
    history.pushState({page:'overview'}, '', '/dashboard');
    _navInternal('overview', false);
    return;
  }
  _handleRoute();
});

function nav(page, _pushState){
  
  const path = _pageToPath[page] || '/dashboard';
  if(_pushState !== false){
    history.pushState({page}, '', path);
  }
  document.title = 'JEETrack — ' + (_pageTitles[page] || 'Dashboard');

  if(page==='practice' && localStorage.getItem('jt_practice_visited')!=='1'){
    localStorage.setItem('jt_practice_visited','1');
    updatePracticeNewBadge();
  }

  closeMobDrawer();
  syncMobNav(page);
  
  if(page !== 'settings'){
    const subEl = document.getElementById('mob-page-sub');
    if(subEl){ subEl.textContent=''; subEl.style.display='none'; }
  }
  
  if(page === 'tests'){
    document.querySelectorAll('.page').forEach(p=>{ p.classList.remove('active','anim-done'); });
    const choicePage = document.getElementById('mob-tests-choice-page');
    if(choicePage){ choicePage.style.display='block'; choicePage.classList.add('active'); }
    document.title = 'JEETrack — Tests';
    updateMobTopbarTitle('tests-choice');
    
    ['mob-fab-hours','mob-fab-todo','mob-fab-backlog','mob-fab-practice'].forEach(id=>{
      const el = document.getElementById(id);
      if(el) el.style.display = 'none';
    });
    return;
  }
  
  const choicePage = document.getElementById('mob-tests-choice-page');
  if(choicePage){ choicePage.style.display='none'; choicePage.classList.remove('active'); }

  
  const targetId = 'page-'+page;
  _navPages().forEach(p=>{
    if(p.id===targetId){
      p.classList.remove('anim-done');
      p.classList.add('active');
      setTimeout(()=>p.classList.add('anim-done'),220);
    }else{
      p.classList.remove('active','anim-done');
    }
  });
  const map={overview:'dashboard',mains:'jee mains',advanced:'jee advanced',compare:'compare',hours:'study hours',todo:'to-do',backlog:'backlog',syllabus:'syllabus',practice:'practice log',insights:'ai',settings:'settings'};
  _navNi().forEach(n=>{n.classList.toggle('active', n.textContent.toLowerCase().trim().startsWith(map[page]||''));});

  
  const isMob = window.innerWidth <= 768;
  const fabMap = {hours:'mob-fab-hours', todo:'mob-fab-todo', backlog:'mob-fab-backlog', practice:'mob-fab-practice'};
  const activeFabId = fabMap[page] || null;
  ['mob-fab-hours','mob-fab-todo','mob-fab-backlog','mob-fab-practice'].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.style.display = (isMob && activeFabId === id) ? 'flex' : 'none';
  });

  
  
  
  
  
  if(_navCache.dirty[page] !== false){
    const _renderFn=({overview:renderOverview,mains:renderMains,advanced:renderAdv,compare:renderCmp,hours:renderHours,todo:renderTodo,backlog:renderBacklog,syllabus:renderSyl,practice:renderPractice,settings:renderSettings})[page];
    if(_renderFn){
      _navCache.dirty[page]=false;
      setTimeout(()=>_renderFn(), 0);
    }
  }

  
  if(page==='settings' && window.innerWidth<=768){
    document.querySelectorAll('.mob-settings-tab').forEach(b=>b.classList.remove('active'));
    document.querySelector('.mob-settings-tab')?.classList.add('active');
  }
}

function _navInternal(page, push){ nav(page, push); }
function renderAll(){const active=document.querySelector('.page.active');if(active)eval('render'+active.id.replace('page-','').charAt(0).toUpperCase()+active.id.replace('page-','').slice(1).replace(/-([a-z])/g,g=>g[1].toUpperCase()))();}

const openM=function(id,preset){
  if(id==='resetConfirm'){try{document.getElementById('reset-confirm-input').value='';}catch(e){}}
  if(id==='addTest'){
    _atEditId = (preset && typeof preset==='object' && preset.editId) ? preset.editId : null;
    const titleEl=document.getElementById('at-modal-title'), subEl=document.getElementById('at-modal-sub'), btnEl=document.getElementById('at-save-btn-txt');
    if(_atEditId){
      if(titleEl) titleEl.textContent='Edit Test Score';
      if(subEl) subEl.textContent='Update this test entry';
      if(btnEl) btnEl.textContent='Update Score';
    } else {
      if(titleEl) titleEl.textContent='Log Test Score';
      if(subEl) subEl.textContent='Record your mock test performance';
      if(btnEl) btnEl.textContent='Save Score';
      document.getElementById('at-date').value=td();
      if(preset)document.getElementById('at-exam').value=preset;
      toggleExam();
    }
  }
  if(id==='scheduleTest'){document.getElementById('sch-date').value='';clearFieldErr('sch-date','sch-date-err');['sch-sess','sch-venue','sch-notes'].forEach(i=>document.getElementById(i).value='');if(preset){document.getElementById('sch-exam').value=preset;document.querySelectorAll('#modal-scheduleTest .pmo-pill').forEach(p=>p.classList.remove('active'));document.querySelector('#modal-scheduleTest .pmo-pill[onclick*="'+preset+'"]')?.classList.add('active');}}
  if(id==='addChapter'){
    document.getElementById('ch-name').value='';
    clearFieldErr('ch-name','ch-name-err');
    const initSubj=(preset&&typeof preset==='string')?preset:(F.syl||'physics');
    document.getElementById('ch-subj-i').value=initSubj;
    document.querySelectorAll('#modal-addChapter .pmo-subj-pill').forEach(p=>p.classList.remove('active'));
    document.querySelector(`#modal-addChapter .pmo-subj-pill[onclick*="'${initSubj}'"]`)?.classList.add('active');
    document.getElementById('ch-class-i').value='11';
    document.querySelectorAll('#modal-addChapter .pmo-class-pill').forEach((p,i)=>p.classList.toggle('active',i===0));
    document.getElementById('ch-section-i').value='physical';
    document.querySelectorAll('#modal-addChapter .pmo-pill-row .pmo-pill:not(.pmo-class-pill)').forEach((p,i)=>p.classList.toggle('active',i===0));
    toggleChemSection_modal();
  }
  if(id==='logHours'){
    _lhEditId = (preset && preset.editId) ? preset.editId : null;
    const timerTab=document.getElementById('lh-tab-timer');
    if(_lhEditId){
      
      if(timerTab) timerTab.style.display='none';
      const titleEl=document.getElementById('lh-modal-title'), subEl=document.getElementById('lh-modal-sub'), btnEl=document.getElementById('lh-save-btn-txt');
      if(titleEl) titleEl.textContent='Edit Study Hours';
      if(subEl) subEl.textContent='Fix a mistake — update this entry';
      if(btnEl) btnEl.textContent='Update Entry';
      _lhClearHrsErr();
      lhSwitchTab('direct');
    } else {
      if(timerTab) timerTab.style.display='';
      const titleEl=document.getElementById('lh-modal-title'), subEl=document.getElementById('lh-modal-sub'), btnEl=document.getElementById('lh-save-btn-txt');
      if(titleEl) titleEl.textContent='Log Study Hours';
      if(subEl) subEl.textContent="Track today's grind — every hour counts";
      if(btnEl) btnEl.textContent='Log Hours';
      document.getElementById('lh-date').value=td();
      ['lh-l-h','lh-l-m','lh-p-h','lh-p-m','lh-r-h','lh-r-m'].forEach(i=>document.getElementById(i).value='');
      document.getElementById('lh-tot').textContent='0m';
      _lhClearHrsErr();
      _lhTimerReset(); 
      if (_lhTimer.running || _lhLoggable()>0) {
        
        document.querySelectorAll('#modal-logHours .pmo-subj-pill').forEach(p=>{
          p.classList.toggle('active', p.getAttribute('onclick')?.includes("'"+_lhTimer.subject+"'"));
        });
        document.getElementById('lh-subj').value = _lhTimer.subject;
        lhSwitchTab('timer');
      } else {
        lhSwitchTab('direct');
      }
      _lhSyncModalFromState();
    }
  }
  if(id==='addTodo'){['td-title','td-det','td-due'].forEach(i=>{try{document.getElementById(i).value=''}catch(e){}});clearFieldErr('td-title','td-title-err');}
  if(id==='addBacklog'){['bl-title-i','bl-det','bl-due-i'].forEach(i=>{try{document.getElementById(i).value=''}catch(e){}});clearFieldErr('bl-title-i','bl-title-err');}
  if(id==='addChapter'){
    try{document.getElementById('ch-name').value='';}catch(e){}
    const subj=F.syl||'physics';
    try{document.getElementById('ch-subj-i').value=subj;}catch(e){}
    const sg=document.getElementById('ch-section-g');
    if(sg)sg.style.display=subj==='chemistry'?'':'none';
    if(subj==='chemistry'&&F.sylChemSub&&F.sylChemSub!=='all'){
      try{document.getElementById('ch-section-i').value=F.sylChemSub;}catch(e){}
    }
  }
  const el=document.getElementById('modal-'+id);
  if(!el)return;
  el.classList.add('open');
  
  if(id==='addTest'){
    setTimeout(()=>{
      if(_atEditId){
        const t=S.tests.find(x=>x.id===_atEditId);
        if(t){
          document.querySelectorAll('#modal-addTest .pmo-pill').forEach(p=>p.classList.remove('active'));
          document.getElementById('at-exam').value=t.exam;
          document.getElementById(t.exam==='advanced'?'at-exam-adv':'at-exam-mains')?.classList.add('active');
          toggleExam();
          if(t.exam==='advanced') document.getElementById('at-paper').value=t.paper||'p1';
          document.querySelectorAll('.at-type-pill').forEach(p=>p.classList.remove('active'));
          document.querySelector(`.at-type-pill[onclick*="'${t.type}'"]`)?.classList.add('active');
          document.getElementById('at-type').value=t.type;
          document.getElementById('at-date').value=t.date;
          document.getElementById('at-phy').value=t.physics||'';
          document.getElementById('at-chem').value=t.chemistry||'';
          document.getElementById('at-math').value=t.maths||'';
          document.getElementById('at-total').value=t.total;
          document.getElementById('at-max').value=t.max;
          document.getElementById('at-notes').value=t.notes||'';
          const _linkedHrs=S.hours.find(h=>h.source==='auto'&&h.mockId===t.id);
          if(_linkedHrs&&_linkedHrs.mockAnalysis>0){
            _matToggle(true);
            document.getElementById('at-an-h').value=Math.floor(_linkedHrs.mockAnalysis);
            document.getElementById('at-an-m').value=Math.round((_linkedHrs.mockAnalysis%1)*60);
          } else {
            _matToggle(false);
          }
          _atUpdateBar();
        }
      } else {
        document.getElementById('at-score-bar').style.width='0%';
        document.getElementById('at-live-pct').textContent='—%';
        document.querySelectorAll('#modal-addTest .pmo-pill').forEach(p=>p.classList.remove('active'));
        document.getElementById('at-type').value='';
        document.getElementById('at-phy').value='';
        document.getElementById('at-chem').value='';
        document.getElementById('at-math').value='';
        document.getElementById('at-total').value='';
        document.getElementById('at-notes').value='';
        _matToggle(false);
        const _examPreset = preset || 'mains';
        document.getElementById('at-exam').value=_examPreset;
        document.getElementById(_examPreset==='advanced'?'at-exam-adv':'at-exam-mains')?.classList.add('active');
        toggleExam();
      }
    },50);
  }
  if(id==='howWasTest'){
    setTimeout(()=>{
      document.getElementById('hwt-score-bar').style.width='0%';
      document.getElementById('hwt-live-pct').textContent='—%';
      _hwtAnToggle(false);
    },50);
  }
  
  if(id!=='resetConfirm' && id!=='newPassword'){
    el.onclick=function(e){if(e.target===el)closeM(id);};
  }
}
function closeM(id){document.getElementById('modal-'+id).classList.remove('open');}
function toggleExam(){
  const v=document.getElementById('at-exam').value;
  document.getElementById('at-paper-g').style.display=v==='advanced'?'':'none';
  document.getElementById('at-max').value=v==='advanced'?360:300;
  _atUpdateBar();
}


let _lhTimer = { running:false, mode:'stopwatch', elapsed:0, goal:0, interval:null, snapshot:0, startTs:null, subject:'physics', session:'lecture' };
let _lhAwayCtx = null;
const LH_TIMER_KEY='jt_lhTimerState';
function _lhPersistTimer(){
  try{
    localStorage.setItem(LH_TIMER_KEY, JSON.stringify({
      mode:_lhTimer.mode, goal:_lhTimer.goal, snapshot:_lhTimer.snapshot,
      startTs:_lhTimer.startTs, running:_lhTimer.running,
      subject:_lhTimer.subject, session:_lhTimer.session,
      lastSeen: Date.now()
    }));
  }catch(e){}
}
// Capture the moment the app actually goes to the background (not just any
// state change) so on return we can tell "quick app switch" apart from
// "closed for a while" — that's what decides whether we show the Welcome
// Back confirmation or just silently keep ticking.
function _lhHandleBackground(){ if(_lhTimer.running) _lhPersistTimer(); }
document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState==='hidden') _lhHandleBackground(); });
window.addEventListener('pagehide', _lhHandleBackground);
function _lhClearPersistedTimer(){
  try{ localStorage.removeItem(LH_TIMER_KEY); }catch(e){}
}
function _lhRestoreTimer(){
  let raw;
  try{ raw=localStorage.getItem(LH_TIMER_KEY); }catch(e){ return; }
  if(!raw) return;
  let saved;
  try{ saved=JSON.parse(raw); }catch(e){ return; }
  if(!saved) return;
  _lhTimer.mode=saved.mode||'stopwatch';
  _lhTimer.goal=saved.goal||0;
  _lhTimer.subject=saved.subject||'physics';
  _lhTimer.session=saved.session||'lecture';
  _lhTimer.snapshot=saved.snapshot||0;
  if(saved.running && saved.startTs){
    _lhTimer.startTs=saved.startTs;
    const delta=Math.floor((Date.now()-saved.startTs)/1000);
    if(_lhTimer.mode==='stopwatch'){
      _lhTimer.running=true;
      _lhTimer.elapsed=_lhTimer.snapshot+delta;
      clearInterval(_lhTimer.interval);
      _lhTimer.interval=setInterval(_lhTick,500);
    } else {
      const remaining=Math.max(0,_lhTimer.goal-(_lhTimer.snapshot+delta));
      if(remaining===0){
        _lhTimer.running=false;
        _lhTimer.elapsed=_lhTimer.goal;
        _lhTimer.snapshot=_lhTimer.goal;
        _lhClearPersistedTimer();
        toast('Countdown finished while you were away — save it to log the session ✓','success');
      } else {
        _lhTimer.running=true;
        _lhTimer.elapsed=remaining;
        clearInterval(_lhTimer.interval);
        _lhTimer.interval=setInterval(_lhTick,500);
      }
    }
  } else {
    _lhTimer.running=false;
    _lhTimer.elapsed=_lhTimer.snapshot;
  }
  if(typeof _lhRenderAll==='function') _lhRenderAll();
  if(typeof _lhStickyUpdate==='function') _lhStickyUpdate();
  if(typeof _lhUpdateLiveDot==='function') _lhUpdateLiveDot();
  const pi=document.getElementById('lh-play-icon'); if(pi) pi.style.display=_lhTimer.running?'none':'';
  const pau=document.getElementById('lh-pause-icon'); if(pau) pau.style.display=_lhTimer.running?'':'none';
  const bt=document.getElementById('lh-timer-btn-txt'); if(bt) bt.textContent=_lhTimer.running?'Pause':(_lhTimer.elapsed>0?'Resume':'Start');

  // Timer kept ticking correctly either way (computed above) — but if the
  // gap since we last saw the app was substantial, don't just assume they
  // were studying the whole time. Ask.
  const AWAY_THRESHOLD_MS = 3*60*1000;
  if(saved.running && saved.lastSeen){
    const awayMs = Math.max(0, Date.now()-saved.lastSeen);
    if(awayMs > AWAY_THRESHOLD_MS){
      _lhAwayCtx = { lastSeen:saved.lastSeen, startTs:saved.startTs, snapshot:saved.snapshot, mode:saved.mode, goal:saved.goal };
      setTimeout(()=>_lhShowWelcomeBackModal(awayMs), 400);
    }
  }
}

function _lhFormatHM(ms){
  const totalMin = Math.max(1, Math.round(ms/60000));
  const h = Math.floor(totalMin/60), m = totalMin%60;
  return h>0 ? `${h}h ${m}m` : `${m}m`;
}
const LH_SESSION_LABELS = {lecture:'Lecture',practice:'Practice',revision:'Revision',mockAnalysis:'Mock Analysis'};
function _lhShowWelcomeBackModal(awayMs){
  const el=document.getElementById('modal-welcomeBack');
  if(!el) return;
  const vEl=document.getElementById('wb-elapsed-val'); if(vEl) vEl.textContent=_lhFormatHM(awayMs);
  const sEl=document.getElementById('wb-elapsed-sub');
  if(sEl){
    const subjLabel=(_lhTimer.subject||'').charAt(0).toUpperCase()+(_lhTimer.subject||'').slice(1);
    sEl.textContent=`${subjLabel} · ${LH_SESSION_LABELS[_lhTimer.session]||_lhTimer.session}`;
  }
  el.classList.add('open');
}
function _lhWelcomeBackKeep(){
  closeM('welcomeBack');
  _lhAwayCtx=null;
  toast('Timer kept — still running','success');
}
function _lhWelcomeBackEndSave(){
  closeM('welcomeBack');
  if(_lhAwayCtx){
    const deltaAtClose=Math.floor((_lhAwayCtx.lastSeen-_lhAwayCtx.startTs)/1000);
    _lhTimer.elapsed = _lhAwayCtx.mode==='stopwatch'
      ? _lhAwayCtx.snapshot+deltaAtClose
      : Math.max(0, _lhAwayCtx.goal-(_lhAwayCtx.snapshot+deltaAtClose));
  }
  _lhAwayCtx=null;
  if(_lhTimer.running) lhTimerStop(false);
  lhSaveTimerSession();
}
function _lhWelcomeBackDiscard(){
  closeM('welcomeBack');
  _lhAwayCtx=null;
  lhTimerReset();
  toast('Session discarded','info');
}
let _atEditId = null;
let _lhEditId = null;
let _emhEditId = null;
function editMockHours(id){
  const h=S.hours.find(x=>x.id===id);
  if(!h)return;
  _emhEditId=id;
  _emhClearErr();
  document.getElementById('emh-label').value=h.label||'Mock Test';
  document.getElementById('emh-date').value=h.date;
  const mins=Math.round((h.mockAnalysis||0)*60);
  document.getElementById('emh-h').value=Math.floor(mins/60)||'';
  document.getElementById('emh-m').value=(mins%60)||'';
  openM('editMockHours');
}
function _emhClearErr(){
  const err=document.getElementById('emh-err');
  if(err){err.style.display='none';err.textContent='';}
  ['emh-h','emh-m'].forEach(id=>document.getElementById(id)?.classList.remove('fi-error'));
}
function saveMockHoursEdit(){
  if(!_emhEditId)return;
  const h=S.hours.find(x=>x.id===_emhEditId);
  if(!h){_emhEditId=null;closeM('editMockHours');return;}
  const hrs=_lhDur('emh-h','emh-m');
  if(!hrs){
    ['emh-h','emh-m'].forEach(id=>document.getElementById(id)?.classList.add('fi-error'));
    const err=document.getElementById('emh-err');
    if(err){err.textContent='Enter an analysis time';err.style.display='';}
    return;
  }
  const before={...h};
  h.label=document.getElementById('emh-label').value.trim()||'Mock Test';
  h.date=document.getElementById('emh-date').value||h.date;
  h.mockAnalysis=+hrs.toFixed(2);
  h.total=+hrs.toFixed(2);
  save();closeM('editMockHours');
  pushUndo('hours',before,'Hours entry updated ✓',false);
  navMarkDirty('hours');navMarkDirty('overview');
  renderHours();renderOverview();
  _emhEditId=null;
}
function deleteMockHoursFromModal(){
  if(!_emhEditId)return;
  const id=_emhEditId;
  _emhEditId=null;
  closeM('editMockHours');
  deleteHours(id);
}
function editHours(id){
  const h=S.hours.find(x=>x.id===id);
  if(!h)return;
  openM('logHours',{editId:id});
  document.getElementById('lh-date').value=h.date;
  document.querySelectorAll('#modal-logHours .pmo-subj-pill').forEach(p=>{
    p.classList.toggle('active', p.getAttribute('onclick')?.includes("'"+h.subject+"'"));
  });
  document.getElementById('lh-subj').value=h.subject;
  const setDur=(hId,mId,val)=>{
    const totalMin=Math.round((val||0)*60);
    const hh=Math.floor(totalMin/60), mm=totalMin%60;
    document.getElementById(hId).value=hh||'';
    document.getElementById(mId).value=mm||'';
  };
  setDur('lh-l-h','lh-l-m',h.lecture);
  setDur('lh-p-h','lh-p-m',h.practice);
  setDur('lh-r-h','lh-r-m',h.revision);
  calcTotal();
}
let _lhPipWindow = null;
let _lhPipInterval = null;
let _lhActiveTab = 'direct';

function _lhFmt(secs) {
  const h=Math.floor(secs/3600), m=Math.floor((secs%3600)/60), s=secs%60;
  return [h,m,s].map(v=>String(v).padStart(2,'0')).join(':');
}

function _lhCap(s){ return s ? s[0].toUpperCase()+s.slice(1) : ''; }



function _lhLoggable(){ return _lhTimer.mode==='countdown' ? Math.max(0,_lhTimer.goal-_lhTimer.elapsed) : _lhTimer.elapsed; }

const LH_RING_C = 571.77; 




function _lhUpdateRingVisual() {
  const ring = document.getElementById('lh-timer-ring-progress');
  if (!ring) return;
  const t = _lhTimer;
  ring.classList.remove('lh-ring-pulse');
  if (t.mode === 'countdown' && t.goal) {
    const pct = Math.max(0, Math.min(100, ((t.goal - t.elapsed) / t.goal) * 100));
    ring.style.strokeDashoffset = LH_RING_C - (pct / 100) * LH_RING_C;
  } else if (t.mode === 'stopwatch' && (t.running || t.elapsed > 0)) {
    ring.style.strokeDashoffset = 0;
    if (t.running) ring.classList.add('lh-ring-pulse');
  } else {
    ring.style.strokeDashoffset = LH_RING_C;
  }
}

function _lhRenderAll() {
  const t = _lhTimer;
  const disp = _lhFmt(t.elapsed);
  const md = document.getElementById('lh-timer-display');
  if (md) md.textContent = disp;
  if (t.mode === 'countdown' && t.goal) {
    const pct = Math.min(100, ((t.goal - t.elapsed) / t.goal) * 100);
    const bar = document.getElementById('lh-timer-bar'); if(bar) bar.style.width = pct + '%';
  }
  _lhUpdateRingVisual();
  const loggable = _lhLoggable();
  const at = document.getElementById('lh-apply-time'); if(at) at.textContent = _lhFmt(loggable);
  _lhUpdateSaveBar();
  _lhStickyUpdate();
  if (_lhPipWindow && !_lhPipWindow.closed) {
    const pd = _lhPipWindow.document.getElementById('pip-display'); if(pd) pd.textContent = disp;
    if (t.mode==='countdown' && t.goal) {
      const pb = _lhPipWindow.document.getElementById('pip-bar');
      if(pb) pb.style.width = Math.min(100,((t.goal-t.elapsed)/t.goal)*100)+'%';
    }
    const ps = _lhPipWindow.document.getElementById('pip-subj');
    if(ps) ps.textContent = _lhCap(t.subject) + ' · ' + _lhCap(t.session);
  }
}

function _lhTick() {
  const now = Date.now();
  const delta = Math.floor((now - _lhTimer.startTs) / 1000);
  if (_lhTimer.mode === 'stopwatch') {
    _lhTimer.elapsed = _lhTimer.snapshot + delta;
  } else {
    _lhTimer.elapsed = Math.max(0, _lhTimer.goal - (_lhTimer.snapshot + delta));
    if (_lhTimer.elapsed === 0) { lhTimerStop(true); return; }
  }
  _lhRenderAll();
}

function _lhStickyUpdate() {
  const sw = document.getElementById('lh-sticky');
  if (!sw) return;
  const t = _lhTimer;
  const loggable = _lhLoggable();
  if (!t.running && loggable === 0) { sw.style.display='none'; return; }
  sw.style.display = 'flex';
  const sd = sw.querySelector('.lhs-time'); if(sd) sd.textContent = _lhFmt(t.elapsed);
  const sBar = sw.querySelector('.lhs-bar');
  if (sBar) sBar.style.display = (t.mode==='countdown'&&t.goal) ? 'block' : 'none';
  if (t.mode==='countdown'&&t.goal) {
    const sb = sw.querySelector('.lhs-bar-fill');
    if(sb) sb.style.width = Math.min(100,((t.goal-t.elapsed)/t.goal)*100)+'%';
  }
  const playIcon = document.getElementById('lhs-play-icon');
  const pauseIcon = document.getElementById('lhs-pause-icon');
  if (playIcon && pauseIcon) {
    playIcon.style.display = t.running ? 'none' : '';
    pauseIcon.style.display = t.running ? '' : 'none';
  }
  const saveBtn = document.getElementById('lhs-save-btn');
  if (saveBtn) saveBtn.style.display = loggable>0 ? 'flex' : 'none';
  const sl = sw.querySelector('.lhs-subj'); if(sl) sl.textContent = _lhCap(t.subject)||'Study';
}

async function lhOpenPip() {
  if (!('documentPictureInPicture' in window)) {
    
    if (_lhPipWindow && !_lhPipWindow.closed) { _lhPipWindow.focus(); return; }
    _lhPipWindow = window.open('','_blank','width=240,height=230,top=100,left=100,toolbar=no,menubar=no,scrollbars=no,resizable=yes,status=no');
    if (!_lhPipWindow) { toast('Allow popups for this site to use the floating timer.', 'error'); return; }
    _lhBuildPipContent();
    return;
  }
  if (_lhPipWindow && !_lhPipWindow.closed) { _lhPipWindow.focus(); return; }
  try {
    _lhPipWindow = await window.documentPictureInPicture.requestWindow({ width:230, height:230 });
    _lhBuildPipContent();
    _lhPipWindow.addEventListener('pagehide', () => { _lhPipWindow=null; clearInterval(_lhPipInterval); });
  } catch(e) { console.warn('PiP failed:',e); toast('Could not open Picture-in-Picture. Try Chrome 116+ on desktop.', 'error'); }
}

function _lhBuildPipContent() {
  if (!_lhPipWindow) return;
  const subjLabel = _lhCap(_lhTimer.subject) + ' · ' + _lhCap(_lhTimer.session);
  _lhPipWindow.document.head.innerHTML = `<meta charset="utf-8"><style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#0e0e16;color:#f0eff5;font-family:system-ui,sans-serif;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      height:100vh;gap:7px;user-select:none;overflow:hidden}
    .pip-subj{font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:rgba(166,149,255,.7);text-align:center;padding:0 8px}
    .pip-time{font-size:42px;font-weight:800;letter-spacing:.04em;color:#f0eff5;line-height:1;font-variant-numeric:tabular-nums}
    .pip-bar-wrap{width:82%;height:4px;background:rgba(255,255,255,.08);border-radius:99px;overflow:hidden;display:none;margin:2px 0}
    .pip-bar-fill{height:100%;width:0%;background:linear-gradient(90deg,#7c6af7,#a78bfa);border-radius:99px;transition:width .5s linear}
    .pip-controls{display:flex;gap:6px;margin-top:2px}
    .pip-btn{width:34px;height:34px;border-radius:9px;border:1px solid rgba(255,255,255,.12);
      background:rgba(255,255,255,.07);color:#f0eff5;cursor:pointer;transition:background .15s;
      display:flex;align-items:center;justify-content:center}
    .pip-btn:hover{background:rgba(255,255,255,.14)}
    .pip-btn.primary{background:rgba(124,106,247,.35);border-color:rgba(124,106,247,.55)}
    .pip-btn.primary:hover{background:rgba(124,106,247,.5)}
    .pip-btn.save{background:rgba(52,211,153,.22);border-color:rgba(52,211,153,.4);color:#6ee7b7}
    .pip-btn.save:hover{background:rgba(52,211,153,.35)}
    .pip-btn svg{flex-shrink:0}
  </style>`;
  _lhPipWindow.document.body.innerHTML = `
    <div class="pip-subj" id="pip-subj">${subjLabel}</div>
    <div class="pip-time" id="pip-display">${_lhFmt(_lhTimer.elapsed)}</div>
    <div class="pip-bar-wrap" id="pip-bar-wrap" style="${_lhTimer.mode==='countdown'?'display:block':''}">
      <div class="pip-bar-fill" id="pip-bar"></div>
    </div>
    <div class="pip-controls">
      <button class="pip-btn primary" id="pip-toggle" title="Pause/Resume">
        <svg id="pip-play-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="${_lhTimer.running?'display:none':''}"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        <svg id="pip-pause-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="${_lhTimer.running?'':'display:none'}"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
      </button>
      <button class="pip-btn" id="pip-reset" title="Reset">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
      </button>
      <button class="pip-btn save" id="pip-save" title="Save session">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
      </button>
    </div>`;
  
  _lhPipWindow.document.getElementById('pip-toggle').onclick = () => { window.lhTimerToggle?.(); };
  _lhPipWindow.document.getElementById('pip-reset').onclick  = () => { window.lhTimerReset?.(); };
  _lhPipWindow.document.getElementById('pip-save').onclick   = () => { window.lhSaveTimerSession?.(); };
  
  clearInterval(_lhPipInterval);
  _lhPipInterval = setInterval(() => {
    if (!_lhPipWindow||_lhPipWindow.closed) { clearInterval(_lhPipInterval); return; }
    const pi = _lhPipWindow.document.getElementById('pip-play-icon');
    const pa = _lhPipWindow.document.getElementById('pip-pause-icon');
    if(pi&&pa){ pi.style.display = _lhTimer.running?'none':''; pa.style.display = _lhTimer.running?'':'none'; }
  }, 500);
}

function lhTimerToggle() {
  if (_lhTimer.running) { lhTimerStop(false); } else { lhTimerStart(); }
}

function lhTimerStart() {
  if (_lhTimer.mode === 'countdown') {
    if (_lhTimer.elapsed === 0) {
      const h = +document.getElementById('lh-cd-h')?.value||0;
      const m = +document.getElementById('lh-cd-m')?.value||0;
      _lhTimer.goal = h*3600 + m*60;
      if (!_lhTimer.goal) { toast('Set a countdown goal first', 'error'); return; }
    }
    const bw = document.getElementById('lh-timer-bar-wrap'); if(bw) bw.style.display='block';
  }
  _lhTimer.running = true;
  _lhTimer.startTs = Date.now();
  clearInterval(_lhTimer.interval);
  _lhTimer.interval = setInterval(_lhTick, 500);
  const pi=document.getElementById('lh-play-icon'); if(pi) pi.style.display='none';
  const pau=document.getElementById('lh-pause-icon'); if(pau) pau.style.display='';
  const bt=document.getElementById('lh-timer-btn-txt'); if(bt) bt.textContent='Pause';
  const cr=document.getElementById('lh-countdown-row'); if(cr) cr.style.display='none';
  const mb=document.getElementById('lh-timer-mode-btn'); if(mb) mb.style.display='none';
  document.querySelectorAll('.lh-session-pill').forEach(p=>p.disabled=true);
  document.querySelectorAll('#modal-logHours .pmo-subj-pill').forEach(p=>p.disabled=true);
  _lhUpdateLiveDot();
  _lhStickyUpdate();
  _lhRenderAll();
  _lhPersistTimer();
  
  
  closeM('logHours');
}

function lhTimerStop(finished) {
  clearInterval(_lhTimer.interval); _lhTimer.interval=null;
  _lhTimer.snapshot = _lhTimer.elapsed;
  _lhTimer.running = false;
  const pi=document.getElementById('lh-play-icon'); if(pi) pi.style.display='';
  const pau=document.getElementById('lh-pause-icon'); if(pau) pau.style.display='none';
  const bt=document.getElementById('lh-timer-btn-txt'); if(bt) bt.textContent=_lhTimer.elapsed>0?'Resume':'Start';
  const mb=document.getElementById('lh-timer-mode-btn'); if(mb) mb.style.display='';
  document.querySelectorAll('.lh-session-pill').forEach(p=>p.disabled=false);
  document.querySelectorAll('#modal-logHours .pmo-subj-pill').forEach(p=>p.disabled=false);
  if (_lhTimer.mode==='countdown'&&!finished) { const cr=document.getElementById('lh-countdown-row'); if(cr) cr.style.display='flex'; }
  if (finished) {
    const md=document.getElementById('lh-timer-display'); if(md) md.textContent=_lhFmt(_lhTimer.snapshot);
    toast('Timer finished — save it to log the session ✓', 'success');
  }
  _lhUpdateSaveBar();
  _lhUpdateLiveDot();
  _lhStickyUpdate();
  _lhRenderAll();
  _lhPersistTimer();
}

function _lhUpdateSaveBar() {
  const sb = document.getElementById('lh-save-bar');
  if (!sb) return;
  sb.style.display = _lhLoggable()>0 ? 'flex' : 'none';
}

function _lhUpdateLiveDot() {
  const dot = document.getElementById('lh-tab-live-dot');
  if (dot) dot.style.display = (_lhTimer.running||_lhTimer.elapsed>0) ? 'inline-block' : 'none';
}

function lhTimerReset() {
  clearInterval(_lhTimer.interval); _lhTimer.interval=null;
  _lhTimer.running=false; _lhTimer.elapsed=0; _lhTimer.snapshot=0;
  const md=document.getElementById('lh-timer-display'); if(md) md.textContent='00:00:00';
  const pi=document.getElementById('lh-play-icon'); if(pi) pi.style.display='';
  const pau=document.getElementById('lh-pause-icon'); if(pau) pau.style.display='none';
  const bt=document.getElementById('lh-timer-btn-txt'); if(bt) bt.textContent='Start';
  const bar=document.getElementById('lh-timer-bar'); if(bar) bar.style.width='0%';
  const mb=document.getElementById('lh-timer-mode-btn'); if(mb) mb.style.display='';
  document.querySelectorAll('.lh-session-pill').forEach(p=>p.disabled=false);
  document.querySelectorAll('#modal-logHours .pmo-subj-pill').forEach(p=>p.disabled=false);
  const cr=document.getElementById('lh-countdown-row');
  if(cr) cr.style.display=_lhTimer.mode==='countdown'?'flex':'none';
  _lhUpdateRingVisual();
  if (_lhPipWindow&&!_lhPipWindow.closed) {
    const pd=_lhPipWindow.document.getElementById('pip-display'); if(pd) pd.textContent='00:00:00';
    const pb=_lhPipWindow.document.getElementById('pip-bar'); if(pb) pb.style.width='0%';
  }
  _lhUpdateSaveBar();
  _lhUpdateLiveDot();
  const sw=document.getElementById('lh-sticky'); if(sw) sw.style.display='none';
  _lhClearPersistedTimer();
}

function lhTimerToggleMode() {
  if (_lhTimer.running) return;
  _lhTimer.elapsed=0; _lhTimer.snapshot=0;
  if (_lhTimer.mode==='stopwatch') {
    _lhTimer.mode='countdown';
    const mb=document.getElementById('lh-timer-mode-btn'); if(mb) mb.textContent='⏱ Stopwatch';
    const mt=document.getElementById('lh-timer-mode-tag'); if(mt) mt.textContent='Countdown';
    const cr=document.getElementById('lh-countdown-row'); if(cr) cr.style.display='flex';
  } else {
    _lhTimer.mode='stopwatch';
    const mb=document.getElementById('lh-timer-mode-btn'); if(mb) mb.textContent='⏱ Countdown';
    const mt=document.getElementById('lh-timer-mode-tag'); if(mt) mt.textContent='Stopwatch';
    const cr=document.getElementById('lh-countdown-row'); if(cr) cr.style.display='none';
    const bw=document.getElementById('lh-timer-bar-wrap'); if(bw) bw.style.display='none';
  }
  const md=document.getElementById('lh-timer-display'); if(md) md.textContent='00:00:00';
  const bar=document.getElementById('lh-timer-bar'); if(bar) bar.style.width='0%';
  const bt=document.getElementById('lh-timer-btn-txt'); if(bt) bt.textContent='Start';
  _lhUpdateRingVisual();
  _lhUpdateSaveBar();
  _lhClearPersistedTimer();
}


function lhSaveTimerSession() {
  const finalSecs = _lhLoggable();
  if (!finalSecs || finalSecs < 30) { toast('Run the timer a bit before saving', 'info'); return; }

  
  if (_lhTimer.running) lhTimerStop(false);

  const hrs = +(finalSecs/3600).toFixed(2);
  const rounded = Math.round(hrs*4)/4; 
  const loggedHrs = rounded || +hrs.toFixed(2);
  const field = _lhTimer.session || 'lecture';
  const dateInput = document.getElementById('lh-date');
  const date = dateInput && dateInput.value ? dateInput.value : td();

  const ex = S.hours.find(h=>h.date===date && h.subject===_lhTimer.subject);
  if (ex) {
    const before = JSON.parse(JSON.stringify(ex));
    ex[field] = +((ex[field]||0) + loggedHrs).toFixed(2);
    ex.total = +((ex.lecture||0)+(ex.practice||0)+(ex.revision||0)).toFixed(2);
    save();
    pushUndo('hours', before, `Saved ${loggedHrs}h ${field} ✓`, false);
  } else {
    const e = { id:Date.now(), date, subject:_lhTimer.subject, lecture:0, practice:0, revision:0, total:loggedHrs };
    e[field] = loggedHrs;
    S.hours.push(e);
    save();
  }
  navMarkDirty('hours'); navMarkDirty('overview');
  renderHours(); renderOverview();
  toast(`Saved ${loggedHrs}h ${field} ✓`, 'success');

  
  lhTimerReset();
}

function _lhTimerReset() {
  if (_lhTimer.running) return; 
  if (_lhLoggable() > 0) return; 
  _lhTimer.mode = _lhTimer.mode || 'stopwatch';
  _lhTimer.elapsed = 0; _lhTimer.snapshot = 0; _lhTimer.goal = 0;
  const md=document.getElementById('lh-timer-display'); if(md) md.textContent='00:00:00';
  const bar=document.getElementById('lh-timer-bar'); if(bar) bar.style.width='0%';
  const bw=document.getElementById('lh-timer-bar-wrap'); if(bw) bw.style.display='none';
  const pi=document.getElementById('lh-play-icon'); if(pi) pi.style.display='';
  const pau=document.getElementById('lh-pause-icon'); if(pau) pau.style.display='none';
  const bt=document.getElementById('lh-timer-btn-txt'); if(bt) bt.textContent='Start';
  _lhUpdateRingVisual();
  _lhUpdateSaveBar();
}



function _lhSyncModalFromState() {
  const md=document.getElementById('lh-timer-display'); if(md) md.textContent=_lhFmt(_lhTimer.elapsed);
  const at=document.getElementById('lh-apply-time'); if(at) at.textContent=_lhFmt(_lhLoggable());
  const mt=document.getElementById('lh-timer-mode-tag'); if(mt) mt.textContent=_lhCap(_lhTimer.mode);
  const mb=document.getElementById('lh-timer-mode-btn');
  if(mb){ mb.textContent = _lhTimer.mode==='stopwatch' ? '⏱ Countdown' : '⏱ Stopwatch'; mb.style.display=_lhTimer.running?'none':''; }
  const cr=document.getElementById('lh-countdown-row');
  if(cr) cr.style.display = (_lhTimer.mode==='countdown' && !_lhTimer.running) ? 'flex' : 'none';
  const bw=document.getElementById('lh-timer-bar-wrap');
  if(bw) bw.style.display = (_lhTimer.mode==='countdown' && _lhTimer.goal) ? 'block' : 'none';
  if (_lhTimer.mode==='countdown' && _lhTimer.goal) {
    const bar=document.getElementById('lh-timer-bar');
    if(bar) bar.style.width = Math.min(100,((_lhTimer.goal-_lhTimer.elapsed)/_lhTimer.goal)*100)+'%';
  }
  const pi=document.getElementById('lh-play-icon'); if(pi) pi.style.display=_lhTimer.running?'none':'';
  const pau=document.getElementById('lh-pause-icon'); if(pau) pau.style.display=_lhTimer.running?'':'none';
  const bt=document.getElementById('lh-timer-btn-txt'); if(bt) bt.textContent=_lhTimer.running?'Pause':(_lhTimer.elapsed>0?'Resume':'Start');
  document.querySelectorAll('.lh-session-pill').forEach(p=>{
    p.classList.toggle('active', p.id==='lh-sess-'+_lhTimer.session);
    p.disabled = _lhTimer.running;
  });
  document.querySelectorAll('#modal-logHours .pmo-subj-pill').forEach(p=>p.disabled=_lhTimer.running);
  _lhUpdateRingVisual();
  _lhUpdateSaveBar();
  _lhUpdateLiveDot();
}

function lhSetSession(session, btn) {
  if (_lhTimer.running) return;
  _lhTimer.session = session;
  document.querySelectorAll('.lh-session-pill').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
}

function lhSwitchTab(tab) {
  _lhActiveTab = tab;
  document.getElementById('lh-tab-direct')?.classList.toggle('active', tab==='direct');
  document.getElementById('lh-tab-timer')?.classList.toggle('active', tab==='timer');
  document.getElementById('lh-panel-direct')?.classList.toggle('active', tab==='direct');
  document.getElementById('lh-panel-timer')?.classList.toggle('active', tab==='timer');
  const directSaveBtn = document.querySelector('.lh-direct-save');
  if (directSaveBtn) directSaveBtn.style.display = tab==='direct' ? 'flex' : 'none';
}


function _matToggle(analyzed){
  document.querySelectorAll('.at-an-pill').forEach(p=>p.classList.remove('active'));
  document.getElementById(analyzed?'at-an-yes':'at-an-no').classList.add('active');
  document.getElementById('at-an-row').style.display=analyzed?'':'none';
  if(!analyzed){document.getElementById('at-an-h').value='';document.getElementById('at-an-m').value='';}
}
function _lhDur(hId, mId){
  return (+document.getElementById(hId).value||0) + (+document.getElementById(mId).value||0)/60;
}

function _lhFmtHM(decHours){
  const totalMin = Math.round(decHours*60);
  const h = Math.floor(totalMin/60), m = totalMin%60;
  if (h && m) return h+'h '+m+'m';
  if (h) return h+'h';
  return m+'m';
}
function _lhClampH(el){ let v=+el.value; if(isNaN(v)||v<0) v=0; if(v>24) v=24; el.value=v||''; }
function _lhClampM(el){ let v=+el.value; if(isNaN(v)||v<0) v=0; if(v>59) v=59; el.value=v||''; }
function _lhClearHrsErr(){ ['lh-l-h','lh-l-m','lh-p-h','lh-p-m','lh-r-h','lh-r-m'].forEach(id=>clearFieldErr(id,'lh-hrs-err')); }

function _lhStepH(hId, delta){
  const el=document.getElementById(hId); if(!el) return;
  let v=(+el.value||0)+delta;
  if(v<0) v=0; if(v>24) v=24;
  el.value=v||'';
  calcTotal(); _lhClearHrsErr();
}


function _lhStepM(hId, mId, delta){
  const hEl=document.getElementById(hId), mEl=document.getElementById(mId);
  if(!hEl||!mEl) return;
  let h=+hEl.value||0, m=(+mEl.value||0)+delta;
  if(m>=60){ h=Math.min(24,h+Math.floor(m/60)); m=m%60; }
  else if(m<0){ if(h>0){ h-=1; m+=60; } else m=0; }
  hEl.value=h||''; mEl.value=m||'';
  calcTotal(); _lhClearHrsErr();
}
function calcTotal(){
  const l=_lhDur('lh-l-h','lh-l-m'), p=_lhDur('lh-p-h','lh-p-m'), r=_lhDur('lh-r-h','lh-r-m');
  const el=document.getElementById('lh-tot'); if(el) el.textContent=_lhFmtHM(l+p+r);
}
function quickLog(type){currentQLType=type;document.getElementById('ql-title').textContent='Quick Log — '+cap(type);document.getElementById('ql-hrs').value='';openM('quickLog')}

function _atAutoSum(){
  const p=+document.getElementById('at-phy').value||0,c=+document.getElementById('at-chem').value||0,m=+document.getElementById('at-math').value||0;
  const s=p+c+m;if(s>0){document.getElementById('at-total').value=s;_atUpdateBar();}
}
function _atUpdateBar(){
  const t=+document.getElementById('at-total').value||0,mx=+document.getElementById('at-max').value||300;
  const pct=mx?Math.min(100,Math.round(t/mx*100)):0;
  document.getElementById('at-score-bar').style.width=pct+'%';
  document.getElementById('at-live-pct').textContent=mx?pct+'%':'—%';
}
function _hwtAutoSum(){
  const p=+document.getElementById('hwt-phy').value||0,c=+document.getElementById('hwt-chem').value||0,m=+document.getElementById('hwt-math').value||0;
  const s=p+c+m;if(s>0){document.getElementById('hwt-total').value=s;_hwtUpdateBar();}
}
function _hwtUpdateBar(){
  const t=+document.getElementById('hwt-total').value||0,mx=+document.getElementById('hwt-max').value||300;
  const pct=mx?Math.min(100,Math.round(t/mx*100)):0;
  document.getElementById('hwt-score-bar').style.width=pct+'%';
  document.getElementById('hwt-live-pct').textContent=mx?pct+'%':'—%';
}

function _lhSetSubj(v,btn){
  document.getElementById('lh-subj').value=v;
  document.querySelectorAll('#modal-logHours .pmo-subj-pill').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  if (!_lhTimer.running) { _lhTimer.subject=v; _lhRenderAll(); }
}
function _tdSetSubj(v,btn){document.getElementById('td-subj-i').value=v;document.querySelectorAll('#modal-addTodo .pmo-subj-pill').forEach(p=>p.classList.remove('active'));btn.classList.add('active');}
function _blSetSubj(v,btn){document.getElementById('bl-subj-i').value=v;document.querySelectorAll('#modal-addBacklog .pmo-subj-pill').forEach(p=>p.classList.remove('active'));btn.classList.add('active');}
function _qlSetSubj(v,btn){document.getElementById('ql-subj').value=v;document.querySelectorAll('#modal-quickLog .pmo-subj-pill').forEach(p=>p.classList.remove('active'));btn.classList.add('active');}
function _chSetSubj(v,btn){document.getElementById('ch-subj-i').value=v;document.querySelectorAll('#modal-addChapter .pmo-subj-pill').forEach(p=>p.classList.remove('active'));btn.classList.add('active');toggleChemSection_modal();}
function _setPri(selId,val,btn,col){
  document.getElementById(selId).value=val;
  const row=btn.closest('.pmo-pri-row');
  if(row)row.querySelectorAll('.pmo-pri-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
}

function setMode(page,m,el){
  M[page]=m;
  const tog=document.getElementById(page+'-mtog')||document.getElementById('cmp-mtog');
  if(tog)tog.querySelectorAll('.mb,.prem-mode-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  ({ov:renderOvTrend,mn:renderMains,adv:renderAdv,cmp:renderCmp})[page]?.();
}

function flt(exam,key,val,el){
  F[exam][key]=val;
  if(el&&el.dataset&&el.dataset.group){
    const g=el.dataset.group;
    document.querySelectorAll(`[data-group="${g}"]`).forEach(e=>e.classList.remove('active'));
    el.classList.add('active');
  }
  exam==='mains'?renderMains():renderAdv();
}
function fltH(val,el){
  F.hours.period=val;
  document.querySelectorAll('[data-group="hr-period"]').forEach(e=>e.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('hr-custom-range').style.display=val==='custom'?'flex':'none';
  _saveHoursFilter();
  renderHours();
}
function fltHCustom(){
  F.hours.from=document.getElementById('hr-from').value||null;
  F.hours.to=document.getElementById('hr-to').value||null;
  _saveHoursFilter();
  renderHours();
}
// The hours filter (period/subject/custom date range) previously lived only
// in the in-memory F object, so it silently reset to the defaults ('This
// Week', 'All Subjects') every time the app was closed and reopened — even
// though the buttons/inputs made it look like a saved preference. These two
// functions persist it to localStorage and restore + re-sync the filter bar
// UI (active button, custom-range inputs, subject dropdown) on load.
const HOURS_FILTER_KEY='jt_hours_filter';
function _saveHoursFilter(){
  try{
    localStorage.setItem(HOURS_FILTER_KEY, JSON.stringify({period:F.hours.period, subj:F.hours.subj, from:F.hours.from, to:F.hours.to}));
  }catch(e){}
}
function _restoreHoursFilter(){
  let saved=null;
  try{ saved=JSON.parse(localStorage.getItem(HOURS_FILTER_KEY)||'null'); }catch(e){ saved=null; }
  if(!saved || typeof saved!=='object') return;

  const validPeriods=['week','month','all','custom'];
  F.hours.period = validPeriods.includes(saved.period) ? saved.period : 'week';
  F.hours.subj = saved.subj || 'all';
  F.hours.from = saved.from || null;
  F.hours.to = saved.to || null;

  document.querySelectorAll('[data-group="hr-period"]').forEach(e=>{
    e.classList.toggle('active', e.getAttribute('onclick')===`fltH('${F.hours.period}',this)`);
  });
  const rangeEl=document.getElementById('hr-custom-range');
  if(rangeEl) rangeEl.style.display = F.hours.period==='custom' ? 'flex' : 'none';
  const fromEl=document.getElementById('hr-from'); if(fromEl) fromEl.value=F.hours.from||'';
  const toEl=document.getElementById('hr-to'); if(toEl) toEl.value=F.hours.to||'';
  const subjEl=document.getElementById('hr-subj'); if(subjEl) subjEl.value=F.hours.subj;
}
function fltBl(k,v,el){F.backlog[k]=v;document.querySelectorAll(`[data-group="bl-${k}"]`).forEach(e=>e.classList.remove('active'));el.classList.add('active');renderBacklog();}
function fltTd(k,v,el){F.todo[k]=v;document.querySelectorAll(`[data-group="td-${k}"]`).forEach(e=>e.classList.remove('active'));el.classList.add('active');renderTodo();}

function getTests(exam){
  let t=S.tests.filter(x=>x.exam===exam);
  if(exam==='mains'){if(F.mains.session!=='all')t=t.filter(x=>x.session===F.mains.session);if(F.mains.type!=='all')t=t.filter(x=>x.type===F.mains.type);}
  if(exam==='advanced'){if(F.advanced.paper!=='all')t=t.filter(x=>x.paper===F.advanced.paper);if(F.advanced.type!=='all')t=t.filter(x=>x.type===F.advanced.type);}
  return t.sort((a,b)=>a.date.localeCompare(b.date));
}
function getHrs(){
  let h=[...S.hours];
  if(F.hours.subj!=='all')h=h.filter(x=>x.subject===F.hours.subj);
  if(F.hours.period==='week'){const c=new Date();c.setDate(c.getDate()-7);h=h.filter(x=>x.date>=c.toISOString().split('T')[0]);}
  else if(F.hours.period==='month'){const c=new Date();c.setDate(c.getDate()-30);h=h.filter(x=>x.date>=c.toISOString().split('T')[0]);}
  else if(F.hours.period==='custom'){ if(F.hours.from)h=h.filter(x=>x.date>=F.hours.from); if(F.hours.to)h=h.filter(x=>x.date<=F.hours.to); }
  return h;
}

/* ---- Study Hours activity types ----
   Config-driven so a future 5th/6th activity type (e.g. Doubt Solving) only
   needs an entry here — every chart/legend/stat below reads from this list
   instead of hardcoding category names. `manual:true` types are the ones
   users can log themselves via the Log Hours modal; `manual:false` types
   are written automatically by other modules (see logMockAnalysisHours). */
const HOUR_CATS=[
  {key:'lecture',    label:'Lecture',       color:'#60a5fa', manual:true},
  {key:'practice',   label:'Practice',      color:'#34d399', manual:true},
  {key:'revision',   label:'Revision',      color:'#a695ff', manual:true},
  {key:'mockAnalysis',label:'Mock Analysis',color:'#2dd4bf', manual:false}
];

/* Called whenever a mock's analysis time is known — currently wired to the
   "Log Test Score" flow (see saveTest) since that's the real place a mock
   gets entered in this app today. If mockId already has an auto entry it's
   updated in place instead of duplicated, so editing a test score is safe. */
function logMockAnalysisHours(hoursSpent,meta){
  meta=meta||{};
  const hrs=Math.round((+hoursSpent||0)*100)/100;
  const mockId=meta.mockId||null;
  let e=mockId?S.hours.find(h=>h.source==='auto'&&h.mockId===mockId):null;
  if(hrs<=0){
    if(e){S.hours=S.hours.filter(x=>x!==e);save();navMarkDirty('hours');navMarkDirty('overview');renderHours();renderOverview();}
    return;
  }
  if(e){
    e.mockAnalysis=hrs;e.total=hrs;e.date=meta.date||e.date;e.label=meta.examLabel||e.label;
  } else {
    e={id:Date.now(),date:meta.date||td(),subject:'mixed',lecture:0,practice:0,revision:0,mockAnalysis:hrs,total:hrs,source:'auto',label:meta.examLabel||'Mock Test',mockId};
    S.hours.push(e);
  }
  save();
  navMarkDirty('hours');navMarkDirty('overview');
  renderHours();renderOverview();
}
function scoreVal(t,mode,subj){
  if(subj){return mode==='pct'?+pct(t[subj],t.max/3):t[subj];}
  return mode==='pct'?+pct(t.total,t.max):t.total;
}
function pBadge(p){return p==='high'?'br':p==='medium'?'ba':'bb'}
function daysPending(dateStr){const d=Math.ceil((new Date(td()+'T00:00:00')-new Date(dateStr+'T00:00:00'))/86400000);return d>0?d:0;}
function updateBadges(){
  const tdP=S.todos.filter(t=>!t.done).length;
  const blP=S.backlogs.filter(b=>!b.done).length;
  const nb1=document.getElementById('nb-todo'),nb2=document.getElementById('nb-backlog');
  nb1.textContent=tdP;nb1.style.display=tdP?'':'none';
  nb2.textContent=blP;nb2.style.display=blP?'':'none';
}

function _getHwtCacheKey(){return 'jt_hwt_dismissed_'+(currentUser?.id||'guest');}

function _hwtIsDismissed(id){
  
  try{
    const arr=JSON.parse(localStorage.getItem(_getHwtCacheKey())||'[]');
    if(arr.includes(id))return true;
  }catch(e){}
  
  return Array.isArray(S.hwtDismissed)&&S.hwtDismissed.includes(id);
}

async function _hwtMarkDismissed(id){
  
  if(!Array.isArray(S.hwtDismissed))S.hwtDismissed=[];
  if(!S.hwtDismissed.includes(id))S.hwtDismissed.push(id);
  
  try{
    const key=_getHwtCacheKey();
    const arr=JSON.parse(localStorage.getItem(key)||'[]');
    if(!arr.includes(id)){arr.push(id);localStorage.setItem(key,JSON.stringify(arr));}
  }catch(e){}
  
  if(sb&&currentUser){
    try{
      await sb.from('streaks').upsert({
        user_id:currentUser.id,
        hwt_dismissed:S.hwtDismissed
      },{onConflict:'user_id'});
    }catch(e){console.warn('HWT dismiss sync failed:',e);}
  }
}

function checkHWTNotifs(){
  const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);
  const yd=yesterday.toISOString().split('T')[0];
  
  const pending=S.upcoming.filter(t=>{
    if(t.date!==yd)return false;
    
    if(_hwtIsDismissed(t.id))return false;
    
    if(S.tests.some(x=>x.date===t.date&&x.exam===t.exam))return false;
    return true;
  });
  if(!pending.length)return;
  const t=pending[0];
  
  _hwtMarkDismissed(t.id);
  if(!S.notifiedHWT.includes(t.id)){S.notifiedHWT.push(t.id);}
  document.getElementById('hwt-desc').textContent=`Yesterday you had: ${cap(t.exam)} ${t.session||''} ${t.venue?'@ '+t.venue:''} — How did it go?`;
  document.getElementById('hwt-max').value=t.exam==='advanced'?360:300;
  document.querySelector('#modal-howWasTest').dataset.upid=t.id;
  openM('howWasTest');
}

function clearFieldErr(fieldId, msgId){
  const f=document.getElementById(fieldId);
  if(f){f.classList.remove('fi-error','pmo-inp-error');}
  const m=document.getElementById(msgId);if(m){m.textContent='';m.classList.remove('show');}
}
function clearPmoErr(fieldId, msgId){
  const f=document.getElementById(fieldId);
  if(f){f.classList.remove('pmo-inp-error');}
  const m=document.getElementById(msgId);if(m){m.textContent='';m.classList.remove('show');}
}
function _shakeField(fieldId){
  const f=document.getElementById(fieldId);
  if(!f)return;
  f.classList.remove('pmo-inp-shake');
  void f.offsetWidth; 
  f.classList.add('pmo-inp-shake');
  f.addEventListener('animationend',()=>f.classList.remove('pmo-inp-shake'),{once:true});
}
function _shakeGroup(ids){
  ids.forEach(id=>_shakeField(id));
}
function showFieldErr(fieldId, msgId, msg, shake=true){
  const f=document.getElementById(fieldId);
  if(f){
    f.classList.add(f.classList.contains('pmo-input')||f.classList.contains('pmo-score-inp')||f.classList.contains('pmo-input-total')?'pmo-inp-error':'fi-error');
    f.focus();
    if(shake)_shakeField(fieldId);
  }
  const m=document.getElementById(msgId);
  if(m){m.textContent=msg;m.classList.add('show');}
}
function _showGroupErr(ids, msgId, msg){
  ids.forEach(id=>{
    const f=document.getElementById(id);
    if(f) f.classList.add(f.classList.contains('pmo-input')||f.classList.contains('pmo-score-inp')?'pmo-inp-error':'fi-error');
  });
  _shakeGroup(ids);
  const m=document.getElementById(msgId);if(m){m.textContent=msg;m.classList.add('show');}
}
function _clearGroupErr(ids, msgId){
  ids.forEach(id=>clearFieldErr(id, msgId));
  clearFieldErr(ids[0], msgId);
}

function saveTest(){
  const exam=document.getElementById('at-exam').value;
  const phy=+document.getElementById('at-phy').value||0;
  const chem=+document.getElementById('at-chem').value||0;
  const math=+document.getElementById('at-math').value||0;
  const totalRaw=document.getElementById('at-total').value;
  const total=+totalRaw||0;
  const maxRaw=document.getElementById('at-max').value;
  const max=+maxRaw||(exam==='advanced'?360:300);
  const date=document.getElementById('at-date').value;

  
  ['at-phy','at-chem','at-math'].forEach(id=>clearFieldErr(id,'at-sum-err'));
  clearFieldErr('at-total','at-total-err');
  clearPmoErr('at-date','at-date-err');
  const errMsgEl=document.getElementById('at-sum-err');
  if(errMsgEl){errMsgEl.textContent='';errMsgEl.classList.remove('show');}

  
  if(!date){
    showFieldErr('at-date','at-date-err','Test date is required');
    return;
  }
  
  if(!document.getElementById('at-type').value){
    showFieldErr('at-type','at-type-err','Please select Partial or Full Syllabus');
    document.querySelector('.at-type-pill')?.closest('.pmo-pill-row')?.classList.add('field-error');
    return;
  }
  
  if(date>td()){
    showFieldErr('at-date','at-date-err','Date cannot be in the future');
    return;
  }
  
  if(!totalRaw && totalRaw!=='0'){
    showFieldErr('at-total','at-total-err','Total score is required');
    return;
  }
  
  if(total<0){
    showFieldErr('at-total','at-total-err','Score cannot be negative');
    return;
  }
  
  if(total>max){
    showFieldErr('at-total','at-total-err',`Score (${total}) cannot exceed max (${max})`);
    _shakeField('at-total');
    return;
  }
  
  if(max<=0){
    showFieldErr('at-total','at-total-err','Max score must be greater than 0');
    return;
  }

  
  const anySubj=phy||chem||math;
  if(!anySubj){
    _showGroupErr(['at-phy','at-chem','at-math'],'at-sum-err','Enter at least one subject score');
    return;
  }
  
  if(phy<0||chem<0||math<0){
    _showGroupErr(['at-phy','at-chem','at-math'],'at-sum-err','Subject scores cannot be negative');
    return;
  }
  
  if(phy>total||chem>total||math>total){
    const culprits=[];
    if(phy>total)culprits.push('at-phy');
    if(chem>total)culprits.push('at-chem');
    if(math>total)culprits.push('at-math');
    _showGroupErr(culprits,'at-sum-err',`A subject score can't exceed total (${total})`);
    return;
  }
  
  const perSubjMax=Math.ceil(max/3);
  if(phy>perSubjMax||chem>perSubjMax||math>perSubjMax){
    const culprits=[];
    if(phy>perSubjMax)culprits.push('at-phy');
    if(chem>perSubjMax)culprits.push('at-chem');
    if(math>perSubjMax)culprits.push('at-math');
    _showGroupErr(culprits,'at-sum-err',`Subject score exceeds section max (~${perSubjMax})`);
    return;
  }
  
  const subSum=phy+chem+math;
  if(subSum!==total){
    _showGroupErr(['at-phy','at-chem','at-math'],'at-sum-err',
      subSum>total?`Subjects add up to ${subSum} — more than total (${total})`
                 :`Subjects add up to ${subSum} — less than total (${total})`);
    return;
  }

  const isEdit = !!_atEditId;
  const e=isEdit
    ? S.tests.find(x=>x.id===_atEditId)
    : {id:Date.now(),exam,session:null,paper:exam==='advanced'?document.getElementById('at-paper').value:null,type:document.getElementById('at-type').value,date,total,max,physics:phy,chemistry:chem,maths:math,notes:document.getElementById('at-notes').value};
  if(isEdit && !e){ _atEditId=null; closeM('addTest'); return; }
  if(isEdit){
    e.exam=exam;
    e.paper=exam==='advanced'?document.getElementById('at-paper').value:null;
    e.type=document.getElementById('at-type').value;
    e.date=date;e.total=total;e.max=max;
    e.physics=phy;e.chemistry=chem;e.maths=math;
    e.notes=document.getElementById('at-notes').value;
  } else {
    S.tests.push(e);
  }
  save();closeM('addTest');
  const _examLabel=`${e.exam==='advanced'?'JEE Advanced':'JEE Mains'} ${e.type==='full'?'Full':'Partial'} — ${fmt(e.date)}`;
  const _analyzed=document.getElementById('at-an-yes').classList.contains('active');
  const _anHrs=_analyzed?_lhDur('at-an-h','at-an-m'):0;
  logMockAnalysisHours(_anHrs,{mockId:e.id,date:e.date,examLabel:_examLabel});
  if(isEdit){
    _atEditId=null;
    navMarkDirty('mains');navMarkDirty('advanced');navMarkDirty('overview');
    renderMains();renderAdv();renderOverview();
    toast('Test score updated ✓','success');
    nav(exam==='mains'?'mains':'advanced');
    return;
  }
  maybeShowReviewPrompt();
  pushUndo('test',e,'Test score added',false);
  navMarkDirty('mains');navMarkDirty('advanced');navMarkDirty('overview');navMarkDirty('compare');
  renderMains();renderAdv();renderOverview();
  const gm=getGoalMains(),ga=getGoalAdv();
  if(e.exam==='mains'&&e.total>=gm) setTimeout(()=>celebrate('🏆',`LEGENDARY! ${gm}+ in Mains!`,`You scored ${e.total}/${e.max} — you're on fire!`,true),300);
  else if(e.exam==='advanced'&&e.total>=ga) setTimeout(()=>celebrate('🌟',`OUTSTANDING! ${ga}+ in Advanced!`,`You scored ${e.total}/${e.max} — incredible work!`,true),300);
  else celebrate('✅','Score Logged!',`${e.total}/${e.max} — ${pct(e.total,e.max)}%`);
  nav(exam==='mains'?'mains':'advanced');
}
function _hwtAnToggle(analyzed){
  document.querySelectorAll('.hwt-an-pill').forEach(p=>p.classList.remove('active'));
  document.getElementById(analyzed?'hwt-an-yes':'hwt-an-no').classList.add('active');
  document.getElementById('hwt-an-row').style.display=analyzed?'':'none';
  if(!analyzed){document.getElementById('hwt-an-h').value='';document.getElementById('hwt-an-m').value='';}
}
function saveHWT(){
  const upid=+document.querySelector('#modal-howWasTest').dataset.upid;
  const up=S.upcoming.find(t=>t.id===upid);
  if(!up)return;
  const exam=up.exam;
  const phy=+document.getElementById('hwt-phy').value||0;
  const chem=+document.getElementById('hwt-chem').value||0;
  const math=+document.getElementById('hwt-math').value||0;
  const totalRaw=document.getElementById('hwt-total').value;
  const total=+totalRaw||0;
  const max=+document.getElementById('hwt-max').value||(exam==='advanced'?360:300);

  
  ['hwt-phy','hwt-chem','hwt-math'].forEach(id=>clearFieldErr(id,'hwt-sum-err'));
  clearFieldErr('hwt-total','hwt-total-err');
  const sumEl=document.getElementById('hwt-sum-err');
  if(sumEl){sumEl.textContent='';sumEl.classList.remove('show');}

  
  if(!totalRaw && totalRaw!=='0'){
    showFieldErr('hwt-total','hwt-total-err','Total score is required');
    return;
  }
  if(total<0){
    showFieldErr('hwt-total','hwt-total-err','Score cannot be negative');
    return;
  }
  if(total>max){
    showFieldErr('hwt-total','hwt-total-err',`Score (${total}) cannot exceed max (${max})`);
    return;
  }
  
  const anySubj=phy||chem||math;
  if(!anySubj){
    _showGroupErr(['hwt-phy','hwt-chem','hwt-math'],'hwt-sum-err','Enter at least one subject score');
    return;
  }
  const perSubjMax=Math.ceil(max/3);
  if(phy>total||chem>total||math>total){
    const culprits=[];
    if(phy>total)culprits.push('hwt-phy');
    if(chem>total)culprits.push('hwt-chem');
    if(math>total)culprits.push('hwt-math');
    _showGroupErr(culprits,'hwt-sum-err',`A subject score can't exceed total (${total})`);
    return;
  }
  if(phy>perSubjMax||chem>perSubjMax||math>perSubjMax){
    const culprits=[];
    if(phy>perSubjMax)culprits.push('hwt-phy');
    if(chem>perSubjMax)culprits.push('hwt-chem');
    if(math>perSubjMax)culprits.push('hwt-math');
    _showGroupErr(culprits,'hwt-sum-err',`Subject score exceeds section max (~${perSubjMax})`);
    return;
  }
  const subSum=phy+chem+math;
  if(subSum!==total){
    _showGroupErr(['hwt-phy','hwt-chem','hwt-math'],'hwt-sum-err',
      subSum>total?`Subjects add up to ${subSum} — more than total (${total})`
                 :`Subjects add up to ${subSum} — less than total (${total})`);
    return;
  }

  const e={id:Date.now(),exam,session:up.session,paper:up.session,type:up.type,date:up.date,total,max,physics:phy,chemistry:chem,maths:math,notes:document.getElementById('hwt-notes').value||'From scheduled test'};
  S.tests.push(e);
  S.upcoming=S.upcoming.filter(t=>t.id!==upid);
  dbDelete('upcoming',upid);
  save();closeM('howWasTest');
  const _hwtAnalyzed=document.getElementById('hwt-an-yes').classList.contains('active');
  const _hwtAnHrs=_hwtAnalyzed?_lhDur('hwt-an-h','hwt-an-m'):0;
  logMockAnalysisHours(_hwtAnHrs,{mockId:e.id,date:e.date,examLabel:`${e.exam==='advanced'?'JEE Advanced':'JEE Mains'} ${e.type==='full'?'Full':'Partial'} — ${fmt(e.date)}`});
  _hwtMarkDismissed(upid);
  pushUndo('test',e,'Score logged from scheduled test',false);
  const gm2=getGoalMains(),ga2=getGoalAdv();
  if(e.exam==='mains'&&e.total>=gm2) setTimeout(()=>celebrate('🏆',`LEGENDARY! ${gm2}+ in Mains!`,`You scored ${e.total}/${e.max}!`,true),300);
  else if(e.exam==='advanced'&&e.total>=ga2) setTimeout(()=>celebrate('🌟',`OUTSTANDING! ${ga2}+ in Advanced!`,`You scored ${e.total}/${e.max}!`,true),300);
  else celebrate('📊','Score Logged!',`${e.total}/${e.max} from scheduled test`);
  navMarkDirty('mains');navMarkDirty('advanced');navMarkDirty('overview');
  renderMains();renderAdv();renderOverview();
}
function saveSchedule(){
  const date=document.getElementById('sch-date').value;
  if(!date){showFieldErr('sch-date','sch-date-err','Test date required');return;}
  clearFieldErr('sch-date','sch-date-err');
  const e={id:Date.now(),exam:document.getElementById('sch-exam').value,session:document.getElementById('sch-sess').value,type:document.getElementById('sch-type').value,date,venue:document.getElementById('sch-venue').value,notes:document.getElementById('sch-notes').value};
  S.upcoming.push(e);save();closeM('scheduleTest');
  pushUndo('upcoming',e,'Test scheduled 📅',false);
  navMarkDirty('mains');navMarkDirty('advanced');navMarkDirty('overview');
  renderMains();renderAdv();renderOverview();
}
function saveHours(){
  const l=_lhDur('lh-l-h','lh-l-m'), p=_lhDur('lh-p-h','lh-p-m'), r=_lhDur('lh-r-h','lh-r-m');
  if(!l&&!p&&!r){
    ['lh-l-h','lh-l-m','lh-p-h','lh-p-m','lh-r-h','lh-r-m'].forEach(id=>document.getElementById(id)?.classList.add('fi-error'));
    showFieldErr('lh-l-h','lh-hrs-err','Enter at least one value');
    return;
  }
  _lhClearHrsErr();
  if(_lhEditId){
    const h=S.hours.find(x=>x.id===_lhEditId);
    if(!h){_lhEditId=null;closeM('logHours');return;}
    const before={...h};
    h.date=document.getElementById('lh-date').value;
    h.subject=document.getElementById('lh-subj').value;
    h.lecture=+l.toFixed(2);h.practice=+p.toFixed(2);h.revision=+r.toFixed(2);h.total=+(l+p+r+(h.mockAnalysis||0)).toFixed(2);
    save();closeM('logHours');
    pushUndo('hours',before,'Hours entry updated ✓',false);
    navMarkDirty('hours');navMarkDirty('overview');
    renderHours();renderOverview();
    _lhEditId=null;
    return;
  }
  const e={id:Date.now(),date:document.getElementById('lh-date').value,subject:document.getElementById('lh-subj').value,lecture:+l.toFixed(2),practice:+p.toFixed(2),revision:+r.toFixed(2),mockAnalysis:0,total:+(l+p+r).toFixed(2),source:'manual'};
  S.hours.push(e);save();closeM('logHours');maybeShowHoursReview();
  pushUndo('hours',e,'Hours logged ✓',false);
  navMarkDirty('hours');navMarkDirty('overview');
  renderHours();renderOverview();
}
function doQuickLog(){
  const hrs=+document.getElementById('ql-hrs').value;
  if(!hrs){showFieldErr('ql-hrs','ql-hrs-err','Enter hours');return;}
  clearFieldErr('ql-hrs','ql-hrs-err');
  const subj=document.getElementById('ql-subj').value;
  const ex=S.hours.find(h=>h.date===td()&&h.subject===subj);
  const _before=ex?JSON.parse(JSON.stringify(ex)):null; // computed but never passed to pushUndo in this branch — the sibling else-branch below does support undo, this one doesn't. Pre-existing, not touched here.
  if(ex){ex[currentQLType]=+(ex[currentQLType]+hrs).toFixed(1);ex.total=+(ex.lecture+ex.practice+ex.revision+(ex.mockAnalysis||0)).toFixed(1);}
  else{const e={id:Date.now(),date:td(),subject:subj,lecture:0,practice:0,revision:0,mockAnalysis:0,total:hrs,source:'manual',[currentQLType]:hrs};S.hours.push(e);pushUndo('hours',e,`+${hrs}h ${currentQLType} ✓`,false);}
  save();closeM('quickLog');navMarkDirty('overview');renderOverview();
}
function saveTodo(){
  const title=document.getElementById('td-title').value.trim();
  if(!title){showFieldErr('td-title','td-title-err','Task name required');return;}
  clearFieldErr('td-title','td-title-err');
  const e={id:Date.now(),title,subject:document.getElementById('td-subj-i').value,priority:document.getElementById('td-pri').value,due:document.getElementById('td-due').value,details:document.getElementById('td-det').value,done:false,addedDate:td(),doneDate:null};
  S.todos.push(e);save();closeM('addTodo');toast('Task added ✓', 'success');navMarkDirty('todo');navMarkDirty('overview');renderTodo();updateBadges();
}
function saveBacklog(){
  const title=document.getElementById('bl-title-i').value.trim();
  if(!title){showFieldErr('bl-title-i','bl-title-err','Task name required');return;}
  clearFieldErr('bl-title-i','bl-title-err');
  const e={id:Date.now(),title,subject:document.getElementById('bl-subj-i').value,priority:document.getElementById('bl-pri').value,due:document.getElementById('bl-due-i').value,details:document.getElementById('bl-det').value,done:false,addedDate:td(),doneDate:null};
  S.backlogs.push(e);save();closeM('addBacklog');toast('Backlog added ✓', 'success');navMarkDirty('backlog');navMarkDirty('overview');renderBacklog();updateBadges();
}
function toggleChemSection_modal(){
  const isC=document.getElementById('ch-subj-i').value==='chemistry';
  document.getElementById('ch-section-g').style.display=isC?'':'none';
}
function saveChapter(){
  const name=document.getElementById('ch-name').value.trim();
  if(!name){showFieldErr('ch-name','ch-name-err','Chapter name required');return;}
  clearFieldErr('ch-name','ch-name-err');
  const subj=document.getElementById('ch-subj-i').value;
  const section=subj==='chemistry'?(document.getElementById('ch-section-i').value||'physical'):undefined;
  const cls=document.getElementById('ch-class-i')?.value||'11';
  const ch={id:Date.now(),name,theory:false,practice:false,unit:'Custom Chapters',class:cls};
  if(section)ch.section=section;
  if(!S.syllabus[subj])S.syllabus[subj]=[];
  S.syllabus[subj].push(ch);
  save();closeM('addChapter');
  pushUndo('chapter',{subj,ch},'Chapter added',false);
  toast('Chapter added ✓', 'success');F.syl=subj;F.sylClass='all';navMarkDirty('syllabus');renderSyl();
}
let _delId=null,_delType=null;
function confirmDelete(type,id,msg){
  _delId=id;_delType=type;
  document.getElementById('del-confirm-msg').textContent=msg||'Are you sure you want to delete this?';
  document.getElementById('del-confirm-btn').onclick=function(){execDelete();};
  openM('delConfirm');
}
function execDelete(){
  closeM('delConfirm');closeM('testDetail');
  if(_delType==='test'){
    const t=S.tests.find(x=>x.id===_delId);if(!t)return;
    S.tests=S.tests.filter(x=>x.id!==_delId);save();dbDelete('tests',_delId);pushUndo('test',t,'Test deleted',true);navMarkDirty('mains');navMarkDirty('advanced');navMarkDirty('overview');renderMains();renderAdv();renderOverview();
  } else if(_delType==='chapter'){
    const subjs=['physics','chemistry','maths'];
    let found=null,foundSubj=null;
    subjs.forEach(s=>{const c=S.syllabus[s]?.find(x=>x.id===_delId);if(c){found=c;foundSubj=s;}});
    if(!found)return;
    S.syllabus[foundSubj]=S.syllabus[foundSubj].filter(x=>x.id!==_delId);
    save();dbDelete('syllabus',_delId);pushUndo('chapter',{subj:foundSubj,ch:found},'Chapter deleted',true);navMarkDirty('syllabus');renderSyl();
  } else if(_delType==='todo'){
    _execDeleteTodo(_delId);
  } else if(_delType==='backlog'){
    _execDeleteBacklog(_delId);
  } else if(_delType==='practiceLog'){
    deletePracticeLog(_delId);
  }
  _delId=null;_delType=null;
}
function deleteTest(id){confirmDelete('test',id,'This test score will be permanently deleted.');}
function editTest(id){
  const t=S.tests.find(x=>x.id===id);
  if(!t)return;
  closeM('testDetail');
  openM('addTest',{editId:id});
}
function confirmDelTest(){
  const titleEl=document.getElementById('td-modal-title');
  const title=titleEl?titleEl.textContent:'this test';
  if(_delId)confirmDelete('test',_delId,`Delete "${title}"? This cannot be undone.`);
}
function deleteChapter(id){confirmDelete('chapter',id,'This chapter will be permanently removed from your syllabus.');}
function viewTest(id){
  _delId=id;_delType='test';
  const t=S.tests.find(x=>x.id===id);if(!t)return;
  const pct2=(v,mx)=>mx?Math.round(v/mx*100):0;
  const subMax=t.max/3;
  const bar=(v,mx,c)=>`<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px"><span style="font-weight:500;color:${c}">${v}</span><span style="color:var(--mu);font-family:'DM Mono',monospace">${pct2(v,mx)}%</span></div><div style="height:5px;background:var(--sf3);border-radius:99px;overflow:hidden"><div style="height:100%;width:${pct2(v,mx)}%;background:${c};border-radius:99px;transition:width .8s ease"></div></div></div>`;
  const _linked=S.hours.find(h=>h.source==='auto'&&h.mockId===t.id);
  const _lh=_linked?Math.floor(_linked.mockAnalysis):'';
  const _lm=_linked?Math.round((_linked.mockAnalysis%1)*60):'';
  document.getElementById('td-modal-title').textContent=`${t.exam==='mains'?'JEE Mains':'JEE Advanced'} — ${fmt(t.date)}`;
  document.getElementById('td-modal-body').innerHTML=`
    <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">
      <span class="chip bac" style="font-size:11px">${t.type==='full'?'Full Syllabus':'Partial'}</span>
      ${t.session?`<span class="chip bb" style="font-size:11px">${cap(t.session)}</span>`:''}
      ${t.paper?`<span class="chip ba" style="font-size:11px">${cap(t.paper)}</span>`:''}
    </div>
    <div style="text-align:center;margin-bottom:16px;padding:12px;background:var(--sf2);border-radius:var(--rs);border:1px solid var(--bd)">
      <div style="font-size:10px;color:var(--mu);margin-bottom:4px;text-transform:uppercase;letter-spacing:.06em">Total Score</div>
      <div style="font-family:'Syne',sans-serif;font-size:2.2rem;font-weight:800;color:var(--ac2);line-height:1">${t.total}</div>
      <div style="font-size:12px;color:var(--mu);margin-top:2px">out of ${t.max} · ${pct2(t.total,t.max)}%</div>
    </div>
    <div style="margin-bottom:4px;font-size:10px;color:var(--mu);text-transform:uppercase;letter-spacing:.06em;font-weight:600">Subject Breakdown</div>
    ${bar(t.physics,subMax,'var(--bl)')}
    <div style="font-size:10px;color:var(--mu);margin-top:-6px;margin-bottom:8px">Physics</div>
    ${bar(t.chemistry,subMax,'var(--gn)')}
    <div style="font-size:10px;color:var(--mu);margin-top:-6px;margin-bottom:8px">Chemistry</div>
    ${bar(t.maths,subMax,'var(--am)')}
    <div style="font-size:10px;color:var(--mu);margin-top:-6px;margin-bottom:12px">Maths</div>
    ${t.notes?`<div style="background:var(--sf2);border:1px solid var(--bd);border-radius:var(--rs);padding:.6rem .8rem;font-size:12px;color:var(--mu);margin-bottom:12px"><span style="color:var(--tx);font-weight:500">Notes:</span> ${t.notes}</div>`:''}
    <div class="pmo-field">
      <label class="pmo-label">Analyzed this mock?</label>
      <div class="pmo-pill-row" style="margin-top:6px">
        <button type="button" class="pmo-pill pmo-pill-sm td-an-pill${_linked?'':' active'}" id="td-an-no" onclick="_matToggleDetail(${t.id},false)">Not yet</button>
        <button type="button" class="pmo-pill pmo-pill-sm td-an-pill${_linked?' active':''}" id="td-an-yes" onclick="_matToggleDetail(${t.id},true)">Yes</button>
      </div>
      <div class="pmo-hrs-row" id="td-an-row" style="display:${_linked?'':'none'};margin-top:10px">
        <div class="pmo-hrs-row-label">Time spent</div>
        <div class="pmo-hrs-row-controls">
          <div class="pmo-hrs-stepper">
            <button type="button" class="pmo-hrs-stepbtn" tabindex="-1" onclick="_lhStepH('td-an-h',-1)" aria-label="Decrease hours">−</button>
            <div class="pmo-hrs-inp-wrap">
              <input type="number" inputmode="numeric" min="0" max="24" class="pmo-hrs-inp" id="td-an-h" placeholder="0" value="${_lh}" aria-label="Analysis hours" oninput="_lhClampH(this)"/>
              <span class="pmo-hrs-suf">hr</span>
            </div>
            <button type="button" class="pmo-hrs-stepbtn" tabindex="-1" onclick="_lhStepH('td-an-h',1)" aria-label="Increase hours">+</button>
          </div>
          <div class="pmo-hrs-stepper">
            <button type="button" class="pmo-hrs-stepbtn" tabindex="-1" onclick="_lhStepM('td-an-h','td-an-m',-5)" aria-label="Decrease minutes">−</button>
            <div class="pmo-hrs-inp-wrap">
              <input type="number" inputmode="numeric" min="0" max="59" step="5" class="pmo-hrs-inp" id="td-an-m" placeholder="0" value="${_lm}" aria-label="Analysis minutes" oninput="_lhClampM(this)"/>
              <span class="pmo-hrs-suf">min</span>
            </div>
            <button type="button" class="pmo-hrs-stepbtn" tabindex="-1" onclick="_lhStepM('td-an-h','td-an-m',5)" aria-label="Increase minutes">+</button>
          </div>
        </div>
        <button type="button" class="mock-an-save-btn" onclick="_saveMockAnalysisDetail(${t.id})">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          Save
        </button>
      </div>
    </div>`;
  openM('testDetail');
}
function _matToggleDetail(id,analyzed){
  document.querySelectorAll('.td-an-pill').forEach(p=>p.classList.remove('active'));
  document.getElementById(analyzed?'td-an-yes':'td-an-no').classList.add('active');
  document.getElementById('td-an-row').style.display=analyzed?'':'none';
  if(!analyzed){document.getElementById('td-an-h').value='';document.getElementById('td-an-m').value='';_saveMockAnalysisDetail(id);}
}
function _saveMockAnalysisDetail(id){
  const t=S.tests.find(x=>x.id===id);if(!t)return;
  const analyzed=document.getElementById('td-an-yes').classList.contains('active');
  const hrs=analyzed?_lhDur('td-an-h','td-an-m'):0;
  const examLabel=`${t.exam==='advanced'?'JEE Advanced':'JEE Mains'} ${t.type==='full'?'Full':'Partial'} — ${fmt(t.date)}`;
  logMockAnalysisHours(hrs,{mockId:t.id,date:t.date,examLabel});
  toast(hrs>0?'Mock analysis logged':'Mock analysis removed');
}
function deleteUpcoming(id){const t=S.upcoming.find(x=>x.id===id);if(!t)return;S.upcoming=S.upcoming.filter(x=>x.id!==id);save();dbDelete('upcoming',id);pushUndo('upcoming',t,'Scheduled test deleted',true);navMarkDirty('mains');navMarkDirty('advanced');navMarkDirty('overview');renderMains();renderAdv();renderOverview();}
function deleteHours(id){const h=S.hours.find(x=>x.id===id);if(!h)return;S.hours=S.hours.filter(x=>x.id!==id);save();dbDelete('hours',id);pushUndo('hours',h,'Hours entry deleted',true);navMarkDirty('hours');renderHours();}

function toggleTodoDone(id){
  const item=S.todos.find(t=>t.id===id);if(!item)return;
  item.done=!item.done;item.doneDate=item.done?td():null;
  save();
  if(item.done)celebrate('✅','Task Done!',item.title);
  navMarkDirty('todo');navMarkDirty('overview');
  renderTodo();renderOverview();updateBadges();
}
function deleteTodo(id){confirmDelete('todo',id,'This task will be permanently deleted.');}
function _execDeleteTodo(id){const t=S.todos.find(x=>x.id===id);if(!t)return;S.todos=S.todos.filter(x=>x.id!==id);save();dbDelete('todos',id);pushUndo('todo',t,'To-do deleted',true);navMarkDirty('todo');navMarkDirty('overview');renderTodo();updateBadges();}
function toggleBacklogDone(id){
  const item=S.backlogs.find(b=>b.id===id);if(!item)return;
  item.done=!item.done;item.doneDate=item.done?td():null;
  updateBLStreaks();save();
  if(item.done)celebrate('📌','Backlog Cleared!',item.title);
  navMarkDirty('backlog');navMarkDirty('overview');
  renderBacklog();renderOverview();updateBadges();
}
function deleteBacklog(id){confirmDelete('backlog',id,'This backlog item will be permanently deleted.');}
function _execDeleteBacklog(id){const b=S.backlogs.find(x=>x.id===id);if(!b)return;S.backlogs=S.backlogs.filter(x=>x.id!==id);save();dbDelete('backlogs',id);pushUndo('backlog',b,'Backlog deleted',true);navMarkDirty('backlog');navMarkDirty('overview');renderBacklog();updateBadges();}
function toggleChapter(id,field){
  const subjs=['physics','chemistry','maths'];
  let ch=null;
  for(const s of subjs){ch=S.syllabus[s]?.find(c=>c.id===id);if(ch)break;}
  if(!ch)return;
  ch[field]=!ch[field];save();
  if(ch.theory&&ch.practice)celebrate('📚','Chapter Complete!',`${ch.name} — theory & practice done!`);
  navMarkDirty('syllabus');navMarkDirty('overview');
  renderSyl();maybeShowSyllabusReview();
}

/* ══════════════════════ Practice Log feature ══════════════════════ */

const PL_CHIPS=[10,20,30,50,75,100,150,200];
let _plmChapterId=null, _plmSubj=null, _plmSelected=null, _plmPresetMode=false, _plmEditId=null;

function _plmFindChapter(id){
  const subjs=['physics','chemistry','maths'];
  for(const s of subjs){ const c=(S.syllabus[s]||[]).find(x=>x.id===id); if(c) return {ch:c,subj:s}; }
  return null;
}

function openPracticeLog(chapterId,prefill){
  _plmSelected=null;
  _plmEditId=(prefill&&prefill.editId)||null;
  document.getElementById('plm-date').value=(prefill&&prefill.date)||td();
  document.getElementById('plm-err').textContent='';
  document.querySelectorAll('#plm-chip-grid .plm-chip').forEach(b=>b.classList.remove('active'));
  document.getElementById('plm-custom-inp').value='';
  plmCloseCustom(true);

  const titleEl=document.getElementById('plm-title'), saveBtnTxt=document.getElementById('plm-save-btn-txt');

  if(chapterId){
    const found=_plmFindChapter(chapterId);
    if(!found){return;}
    _plmChapterId=chapterId; _plmSubj=found.subj; _plmPresetMode=true;
    document.getElementById('plm-picker-wrap').style.display='none';
    const ctx=document.getElementById('plm-context-chip');
    ctx.style.display='flex';
    ctx.innerHTML=`<span class="plm-context-dot" style="background:${sc(found.subj)}"></span>${found.ch.name}<span class="plm-context-subj">${cap(found.subj)}</span>`;
    document.getElementById('plm-sub').textContent=`${found.ch.name} — ${cap(found.subj)}`;
  } else {
    _plmChapterId=null; _plmPresetMode=false;
    document.getElementById('plm-picker-wrap').style.display='';
    document.getElementById('plm-context-chip').style.display='none';
    document.getElementById('plm-sub').textContent='Track the questions you just worked through';
    document.querySelectorAll('#plm-subj-pills .pmo-subj-pill').forEach((p,i)=>p.classList.toggle('active',i===0));
    plmPopulateChapterSelect('physics');
    _plmSubj='physics';
  }

  if(_plmEditId){
    titleEl.textContent='Edit Practice Entry';
    saveBtnTxt.textContent='Update Entry';
  } else {
    titleEl.textContent='Log Practice';
    saveBtnTxt.textContent='Log Practice';
  }

  _plmRenderRecent();

  if(prefill&&prefill.questions){
    if(PL_CHIPS.includes(prefill.questions)){
      const btn=document.querySelector(`#plm-chip-grid .plm-chip[data-val="${prefill.questions}"]`);
      if(btn) plmSelectChip(prefill.questions,btn);
    } else {
      plmOpenCustom();
      document.getElementById('plm-custom-inp').value=prefill.questions;
      _plmUpdateSelectedDisplay();
    }
  } else {
    const lastVal=+localStorage.getItem('jt_last_practice_val')||null;
    if(lastVal && PL_CHIPS.includes(lastVal)){
      const btn=document.querySelector(`#plm-chip-grid .plm-chip[data-val="${lastVal}"]`);
      if(btn) plmSelectChip(lastVal,btn);
    }
  }

  document.getElementById('modal-logPractice').classList.add('open');
}

function editPracticeLog(id){
  const p=(S.practiceLogs||[]).find(x=>x.id===id);
  if(!p)return;
  openPracticeLog(p.chapterId,{questions:p.questions,date:p.date,editId:id});
}

function plmSetSubj(subj,btn){
  document.querySelectorAll('#plm-subj-pills .pmo-subj-pill').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  _plmSubj=subj;
  plmPopulateChapterSelect(subj);
}

function plmPopulateChapterSelect(subj){
  const sel=document.getElementById('plm-chapter-sel');
  const chs=(S.syllabus[subj]||[]).filter(c=>!c.adv);
  sel.innerHTML=chs.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
}

function plmSelectChip(val,btn){
  document.querySelectorAll('#plm-chip-grid .plm-chip').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  _plmSelected=val;
  _plmClearErr();
}

function plmOpenCustom(){
  document.querySelectorAll('#plm-chip-grid .plm-chip').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.plm-recent-chip').forEach(b=>b.classList.remove('active'));
  document.getElementById('plm-chip-grid').style.display='none';
  document.getElementById('plm-custom-trigger').style.display='none';
  document.getElementById('plm-custom-wrap').style.display='block';
  _plmSelected=null;
  _plmClearErr();
  const inp=document.getElementById('plm-custom-inp');
  setTimeout(()=>{ inp.focus(); },50);
}

function plmCloseCustom(silent){
  document.getElementById('plm-chip-grid').style.display='';
  document.getElementById('plm-custom-trigger').style.display='';
  document.getElementById('plm-custom-wrap').style.display='none';
  document.getElementById('plm-custom-inp').value='';
  if(!silent) _plmClearErr();
}

function plmStepCustom(delta){
  const inp=document.getElementById('plm-custom-inp');
  const v=Math.max(0,(+inp.value||0)+delta);
  inp.value=v;
  _plmClearErr();
  _plmUpdateSelectedDisplay();
}
function _plmCurrentVal(){
  if(document.getElementById('plm-custom-wrap').style.display==='block'){
    return +document.getElementById('plm-custom-inp').value||0;
  }
  return _plmSelected||0;
}
function _plmUpdateSelectedDisplay(){
  const v=_plmCurrentVal();
  document.getElementById('plm-selected-display').textContent=v>0?`${v} question${v===1?'':'s'}`:'—';
}
function _plmClearErr(){
  document.getElementById('plm-err').textContent='';
  _plmUpdateSelectedDisplay();
}
function _plmRenderRecent(){
  const wrap=document.getElementById('plm-recent-wrap');
  const logs=S.practiceLogs||[];
  if(!logs.length){wrap.style.display='none';return;}
  const recentVals=[...new Set([...logs].sort((a,b)=>b.loggedAt.localeCompare(a.loggedAt)).map(l=>l.questions))]
    .filter(v=>!PL_CHIPS.includes(v)).slice(0,4);
  if(!recentVals.length){wrap.style.display='none';return;}
  wrap.style.display='flex';
  document.getElementById('plm-recent-chips').innerHTML=recentVals.map(v=>
    `<button class="plm-recent-chip" onclick="plmSelectRecentVal(${v},this)">${v}</button>`).join('');
}
function plmSelectRecentVal(v,btn){
  document.querySelectorAll('#plm-chip-grid .plm-chip').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.plm-recent-chip').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  plmCloseCustom(true);
  _plmSelected=v;
  _plmClearErr();
}

function savePracticeLog(){
  const questions=_plmCurrentVal();
  if(!questions || questions<1){
    document.getElementById('plm-err').textContent='Pick or enter a number of questions';
    return;
  }
  const date=document.getElementById('plm-date').value||td();

  if(_plmEditId){
    const p=(S.practiceLogs||[]).find(x=>x.id===_plmEditId);
    if(!p){_plmEditId=null;closeM('logPractice');return;}
    const before={...p};
    p.questions=questions; p.date=date;
    save();
    try{localStorage.setItem('jt_last_practice_val',questions);}catch(e){}
    closeM('logPractice');
    toast('Practice entry updated ✓','success');
    pushUndo('practiceLog',before,'Practice entry updated',false);
    navMarkDirty('practice');navMarkDirty('overview');navMarkDirty('syllabus');
    renderSyl();renderOverview();
    if(document.getElementById('page-practice')?.classList.contains('active')) renderPractice();
    _plmEditId=null;
    return;
  }

  let chapterId=_plmChapterId, subj=_plmSubj, chapterName=null;
  if(_plmPresetMode){
    const found=_plmFindChapter(chapterId);
    chapterName=found?found.ch.name:'Chapter';
  } else {
    chapterId=+document.getElementById('plm-chapter-sel').value;
    const found=_plmFindChapter(chapterId);
    if(!found){document.getElementById('plm-err').textContent='Pick a chapter';return;}
    subj=found.subj; chapterName=found.ch.name;
  }
  const entry={id:Date.now(),subject:subj,chapterId,chapterName,questions,date,loggedAt:new Date().toISOString()};
  S.practiceLogs=S.practiceLogs||[];
  S.practiceLogs.push(entry);
  save();
  try{localStorage.setItem('jt_last_practice_val',questions);}catch(e){}
  closeM('logPractice');
  toast(`${questions} questions logged ✓`,'success');
  pushUndo('practiceLog',entry,'Practice logged',false);
  navMarkDirty('practice');navMarkDirty('overview');navMarkDirty('syllabus');
  renderSyl();renderOverview();
  if(document.getElementById('page-practice')?.classList.contains('active')) renderPractice();
}

function deletePracticeLog(id){
  const p=(S.practiceLogs||[]).find(x=>x.id===id);
  if(!p)return;
  S.practiceLogs=S.practiceLogs.filter(x=>x.id!==id);
  save();dbDelete('practiceLogs',id);
  pushUndo('practiceLog',p,'Practice entry deleted',true);
  navMarkDirty('practice');navMarkDirty('overview');navMarkDirty('syllabus');
  renderPractice();renderSyl();
}

/* ---- Practice Log page filters ---- */
function fltPl(key,val,btn){
  F.practice[key]=val;
  document.querySelectorAll('#pl-period-bar .syl-ftab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('pl-custom-range').style.display=val==='custom'?'flex':'none';
  renderPractice();
}
function fltPlCustom(){
  F.practice.from=document.getElementById('pl-from').value||null;
  F.practice.to=document.getElementById('pl-to').value||null;
  renderPractice();
}
function fltPlSubj(v){
  F.practice.subj=v;
  const chSel=document.getElementById('pl-chapter-sel');
  if(v==='all'){ chSel.innerHTML='<option value="all">All Chapters</option>'; }
  else{
    const chs=(S.syllabus[v]||[]).filter(c=>!c.adv);
    chSel.innerHTML='<option value="all">All Chapters</option>'+chs.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
  }
  F.practice.chapter='all';
  renderPractice();
}
function fltPlChapter(v){ F.practice.chapter=v; renderPractice(); }

function _plFilteredLogs(){
  let logs=[...(S.practiceLogs||[])];
  const f=F.practice;
  if(f.subj!=='all') logs=logs.filter(l=>l.subject===f.subj);
  if(f.chapter!=='all') logs=logs.filter(l=>l.chapterId===+f.chapter);
  if(f.period==='today') logs=logs.filter(l=>l.date===td());
  else if(f.period==='week'){const c=new Date();c.setDate(c.getDate()-6);const cs=c.toISOString().split('T')[0];logs=logs.filter(l=>l.date>=cs);}
  else if(f.period==='month'){const c=new Date();c.setDate(c.getDate()-29);const cs=c.toISOString().split('T')[0];logs=logs.filter(l=>l.date>=cs);}
  else if(f.period==='custom'){ if(f.from)logs=logs.filter(l=>l.date>=f.from); if(f.to)logs=logs.filter(l=>l.date<=f.to); }
  return logs;
}

function plShowMoreFeed(){ F.practice.feedShown+=20; renderPractice(); }

function getPracticeGoal(){ const v=+localStorage.getItem('jt_practice_daily_goal'); return v>0?v:50; }
function savePracticeGoal(v){
  const val=Math.max(1,Math.round(+v)||50);
  try{localStorage.setItem('jt_practice_daily_goal',val);}catch(e){}
  renderOvPracticeCard();
}
function editPracticeGoal(){
  const wrap=document.getElementById('ov-prac-goal-wrap');
  if(!wrap)return;
  const cur=getPracticeGoal();
  wrap.outerHTML=`<input type="number" id="ov-prac-goal-inp" class="ov-prac-goal-inp" value="${cur}" min="1" onkeydown="if(event.key==='Enter')this.blur()" onblur="savePracticeGoal(this.value)"/>`;
  const inp=document.getElementById('ov-prac-goal-inp');
  if(inp){inp.focus();inp.select();}
}
function renderOvPracticeCard(){
  const el=document.getElementById('ov-practice-card');
  if(!el)return;
  const all=S.practiceLogs||[];
  if(!all.length){
    el.innerHTML=`<div style="text-align:center;padding:10px 4px 2px">
      <div style="font-size:11.5px;color:var(--mu);margin-bottom:10px">No questions logged yet</div>
      <button class="btn bg bsm" onclick="openPracticeLog()">Log Practice</button>
    </div>`;
    return;
  }
  const today=td();
  const qToday=all.filter(l=>l.date===today).reduce((a,b)=>a+b.questions,0);
  const wStart=new Date();wStart.setDate(wStart.getDate()-6);const wStartS=wStart.toISOString().split('T')[0];
  const qWeek=all.filter(l=>l.date>=wStartS).reduce((a,b)=>a+b.questions,0);
  const qAll=all.reduce((a,b)=>a+b.questions,0);
  let streak=0;{let d=new Date();
    while(true){const ds=d.toISOString().split('T')[0]; if(all.some(l=>l.date===ds)){streak++;d.setDate(d.getDate()-1);} else if(ds===today){d.setDate(d.getDate()-1);} else break;}
  }
  const goal=getPracticeGoal();
  const goalPct=Math.min(100,Math.round(qToday/goal*100));
  const sorted=[...all].sort((a,b)=>b.loggedAt.localeCompare(a.loggedAt));
  const last=sorted[0];
  const dayStr=last.date===today?'Today':fmt(last.date);
  const timeStr=new Date(last.loggedAt).toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'});

  el.innerHTML=`
    <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:10px">
      <div>
        <div style="font-family:'Syne',sans-serif;font-size:1.7rem;font-weight:800;color:#34d399;line-height:1">${qToday}</div>
        <div style="font-size:10.5px;color:var(--mu);margin-top:2px">questions today</div>
      </div>
      <div style="display:flex;align-items:center;gap:4px;padding:4px 9px;border-radius:99px;background:rgba(96,165,250,.1);border:1px solid rgba(96,165,250,.2)">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        <span style="font-size:11px;font-weight:700;color:#60a5fa">${streak}d streak</span>
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
      <span style="font-size:10px;color:var(--mu)">Daily goal</span>
      <span id="ov-prac-goal-wrap" class="ov-prac-goal-txt" onclick="editPracticeGoal()">${qToday}/${goal}<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></span>
    </div>
    <div style="height:5px;border-radius:99px;background:rgba(255,255,255,.06);overflow:hidden;margin-bottom:12px">
      <div style="height:100%;width:${goalPct}%;background:linear-gradient(90deg,#34d399,#6ee7b7);border-radius:99px;transition:width .5s cubic-bezier(.4,0,.2,1)"></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
      <div style="text-align:center;padding:7px 4px;border-radius:8px;background:var(--sf2)">
        <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:15px">${qWeek}</div>
        <div style="font-size:9.5px;color:var(--mu)">this week</div>
      </div>
      <div style="text-align:center;padding:7px 4px;border-radius:8px;background:var(--sf2)">
        <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:15px">${qAll}</div>
        <div style="font-size:9.5px;color:var(--mu)">all time</div>
      </div>
    </div>
    <div style="font-size:10.5px;color:var(--mu);line-height:1.4;padding-top:8px;border-top:1px solid var(--bd);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
      <span style="color:var(--mu2)">Last:</span> ${last.chapterName} — ${dayStr} • ${timeStr}
    </div>`;
}

function renderPractice(){ensureChartJs().then(function(){_renderPractice();}, function(){console.warn('[renderPractice] Chart.js failed to load — rendering without it'); _renderPractice();});}
function _renderPractice(){
  const all=S.practiceLogs||[];
  const emptyEl=document.getElementById('pl-empty'), contentEl=document.getElementById('pl-content');
  if(!all.length){emptyEl.style.display='';contentEl.style.display='none';return;}
  emptyEl.style.display='none';contentEl.style.display='';

  const today=td();
  const qToday=all.filter(l=>l.date===today).reduce((a,b)=>a+b.questions,0);
  const wStart=new Date();wStart.setDate(wStart.getDate()-6);const wStartS=wStart.toISOString().split('T')[0];
  const qWeek=all.filter(l=>l.date>=wStartS).reduce((a,b)=>a+b.questions,0);
  const now=new Date();
  const qMonth=all.filter(l=>{const d=new Date(l.date+'T00:00:00');return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();}).reduce((a,b)=>a+b.questions,0);
  const qAll=all.reduce((a,b)=>a+b.questions,0);
  const activeDays=[...new Set(all.map(l=>l.date))];
  const dailyAvg=activeDays.length?(qAll/activeDays.length).toFixed(1):0;
  
  let streak=0;{let d=new Date();
    while(true){const ds=d.toISOString().split('T')[0]; if(all.some(l=>l.date===ds)){streak++;d.setDate(d.getDate()-1);} else if(ds===today){d.setDate(d.getDate()-1);} else break;}
  }
  const dayTotals={}; all.forEach(l=>{dayTotals[l.date]=(dayTotals[l.date]||0)+l.questions;});
  const bestDayEntry=Object.entries(dayTotals).sort((a,b)=>b[1]-a[1])[0];

  document.getElementById('pl-stats').innerHTML=`
    <div class="prem-stat-card" style="border-color:rgba(52,211,153,.16)">
      <div class="prem-stat-icon-row"><div class="prem-stat-ico" style="background:rgba(52,211,153,.12)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div></div>
      <div class="prem-stat-lbl">Today</div>
      <div class="prem-stat-val" style="color:#34d399">${qToday}</div>
      <div class="prem-stat-sub">questions solved</div>
    </div>
    <div class="prem-stat-card" style="border-color:rgba(124,106,247,.16)">
      <div class="prem-stat-icon-row"><div class="prem-stat-ico" style="background:rgba(124,106,247,.12)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a695ff" stroke-width="2" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div></div>
      <div class="prem-stat-lbl">This Week</div>
      <div class="prem-stat-val" style="color:#a695ff">${qWeek}</div>
      <div class="prem-stat-sub">last 7 days</div>
    </div>
    <div class="prem-stat-card" style="border-color:rgba(244,114,182,.16)">
      <div class="prem-stat-icon-row"><div class="prem-stat-ico" style="background:rgba(244,114,182,.12)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f472b6" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div></div>
      <div class="prem-stat-lbl">This Month</div>
      <div class="prem-stat-val" style="color:#f472b6">${qMonth}</div>
      <div class="prem-stat-sub">${now.toLocaleDateString('en',{month:'long'})}</div>
    </div>
    <div class="prem-stat-card" style="border-color:rgba(251,191,36,.16)">
      <div class="prem-stat-icon-row"><div class="prem-stat-ico" style="background:rgba(251,191,36,.12)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div></div>
      <div class="prem-stat-lbl">All Time</div>
      <div class="prem-stat-val" style="color:#fbbf24">${qAll}</div>
      <div class="prem-stat-sub">${activeDays.length} active days</div>
    </div>
    <div class="prem-stat-card" style="border-color:rgba(45,212,191,.16)">
      <div class="prem-stat-icon-row"><div class="prem-stat-ico" style="background:rgba(45,212,191,.12)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" stroke-width="2" stroke-linecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div></div>
      <div class="prem-stat-lbl">Daily Average</div>
      <div class="prem-stat-val" style="color:#2dd4bf">${dailyAvg}</div>
      <div class="prem-stat-sub">questions/active day</div>
    </div>
    <div class="prem-stat-card" style="border-color:rgba(96,165,250,.16)">
      <div class="prem-stat-icon-row"><div class="prem-stat-ico" style="background:rgba(96,165,250,.12)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2" stroke-linecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div></div>
      <div class="prem-stat-lbl">Current Streak</div>
      <div class="prem-stat-val" style="color:#60a5fa">${streak}<span style="font-size:.9rem;opacity:.7">d</span></div>
      <div class="prem-stat-sub">${bestDayEntry?`Best day: ${bestDayEntry[1]} on ${fmt(bestDayEntry[0])}`:'keep it going'}</div>
    </div>`;

  
  const chSel=document.getElementById('pl-chapter-sel');
  const curSubj=F.practice.subj;
  if(curSubj==='all'){ if(chSel.children.length<=1)chSel.innerHTML='<option value="all">All Chapters</option>'; }

  const logs=_plFilteredLogs();

  
  const last14=Array.from({length:14},(_,i)=>{const d=new Date();d.setDate(d.getDate()-13+i);return d.toISOString().split('T')[0];});
  const plDCData={labels:last14.map(d=>new Date(d+'T00:00:00').toLocaleDateString('en',{month:'short',day:'numeric'})),
    datasets:[{label:'Questions',data:last14.map(d=>all.filter(l=>l.date===d).reduce((a,b)=>a+b.questions,0)),backgroundColor:'#34d399',borderRadius:4}]};
  const plDCOpts={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{...sO(),x:{...sO().x,ticks:{...sO().x.ticks,maxRotation:45}}}};
  if(!uC('plDC',plDCData,plDCOpts)){dc('plDC');CIs['plDC']=new Chart(document.getElementById('plDC').getContext('2d'),{type:'bar',data:plDCData,options:plDCOpts});}

  
  const weeks=[];{ for(let i=7;i>=0;i--){const end=new Date();end.setDate(end.getDate()-i*7);const start=new Date(end);start.setDate(start.getDate()-6);weeks.push({start:start.toISOString().split('T')[0],end:end.toISOString().split('T')[0],label:end.toLocaleDateString('en',{month:'short',day:'numeric'})});} }
  const plWCData={labels:weeks.map(w=>w.label),datasets:[{label:'Questions',data:weeks.map(w=>all.filter(l=>l.date>=w.start&&l.date<=w.end).reduce((a,b)=>a+b.questions,0)),borderColor:'#a695ff',backgroundColor:'rgba(124,106,247,.08)',borderWidth:2,tension:.4,fill:true,pointRadius:3,pointBackgroundColor:'#a695ff'}]};
  const plWCOpts={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:sO()};
  if(!uC('plWC',plWCData,plWCOpts)){dc('plWC');CIs['plWC']=new Chart(document.getElementById('plWC').getContext('2d'),{type:'line',data:plWCData,options:plWCOpts});}

  
  const subjTotals=['physics','chemistry','maths'].map(s=>logs.filter(l=>l.subject===s).reduce((a,b)=>a+b.questions,0));
  const subjSum=subjTotals.reduce((a,b)=>a+b,0)||0.001;
  const subjPct=subjTotals.map(v=>Math.round(v/subjSum*100));
  const plSDCData={labels:['Physics','Chemistry','Maths'].map((n,i)=>`${n} ${subjPct[i]}%`),datasets:[{data:subjTotals,backgroundColor:['#60a5fa','#34d399','#fbbf24'],borderWidth:0,hoverOffset:4}]};
  const plSDCOpts={responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{color:'#7a7990',font:{size:10},boxWidth:9,padding:9}}}};
  if(!uC('plSDC',plSDCData,plSDCOpts)){dc('plSDC');CIs['plSDC']=new Chart(document.getElementById('plSDC').getContext('2d'),{type:'doughnut',data:plSDCData,options:plSDCOpts});}

  
  const chapterTotals={};
  logs.forEach(l=>{chapterTotals[l.chapterId]=chapterTotals[l.chapterId]||{name:l.chapterName,subject:l.subject,total:0};chapterTotals[l.chapterId].total+=l.questions;});
  const topChapters=Object.values(chapterTotals).sort((a,b)=>b.total-a.total).slice(0,7);
  const plCDCData={labels:topChapters.map(c=>c.name.length>16?c.name.slice(0,15)+'…':c.name),datasets:[{label:'Questions',data:topChapters.map(c=>c.total),backgroundColor:topChapters.map(c=>sc(c.subject)),borderRadius:4}]};
  const plCDCOpts={indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{...sO(),y:{...sO().y,ticks:{...sO().y.ticks,font:{size:9}}}}};
  if(!uC('plCDC',plCDCData,plCDCOpts)){dc('plCDC');CIs['plCDC']=new Chart(document.getElementById('plCDC').getContext('2d'),{type:'bar',data:plCDCData,options:plCDCOpts});}

  _renderPlSubjAnalytics(all);
  _renderPlChapterAnalytics(all);
  _renderPlFeed(logs);
}

function _renderPlSubjAnalytics(all){
  const totalAll=all.reduce((a,b)=>a+b.questions,0)||0.001;
  const wStart=new Date();wStart.setDate(wStart.getDate()-13);const wStartS=wStart.toISOString().split('T')[0];
  const prevStart=new Date();prevStart.setDate(prevStart.getDate()-27);const prevStartS=prevStart.toISOString().split('T')[0];
  const prevEnd=new Date();prevEnd.setDate(prevEnd.getDate()-14);const prevEndS=prevEnd.toISOString().split('T')[0];
  const cards=['physics','chemistry','maths'].map(s=>{
    const logs=all.filter(l=>l.subject===s);
    const total=logs.reduce((a,b)=>a+b.questions,0);
    const sharePct=Math.round(total/totalAll*100);
    const recent=logs.filter(l=>l.date>=wStartS).reduce((a,b)=>a+b.questions,0);
    const prev=logs.filter(l=>l.date>=prevStartS&&l.date<=prevEndS).reduce((a,b)=>a+b.questions,0);
    const trendUp=recent>=prev;
    const chapterTotals={};
    logs.forEach(l=>{chapterTotals[l.chapterId]=(chapterTotals[l.chapterId]||{name:l.chapterName,total:0});chapterTotals[l.chapterId].total+=l.questions;});
    const topCh=Object.values(chapterTotals).sort((a,b)=>b.total-a.total)[0];
    return `<div class="pl-subj-card" style="border-color:${sc(s)}30">
      <div class="pl-subj-card-hd">
        <span class="pl-subj-card-name" style="color:${sc(s)}">${cap(s)}</span>
        <span class="pl-subj-trend ${trendUp?'up':'down'}">${trendUp?'▲':'▼'}</span>
      </div>
      <div class="pl-subj-card-total" style="color:${sc(s)}">${total}<span style="font-size:.75rem;opacity:.7">qs</span></div>
      <div class="pl-subj-card-pct">${sharePct}% of overall practice</div>
      <div class="pl-subj-card-bar"><div style="width:${sharePct}%;background:${sc(s)}"></div></div>
      <div class="pl-subj-card-top">${topCh?`Most practiced: <strong>${topCh.name}</strong>`:'No chapters practiced yet'}</div>
    </div>`;
  }).join('');
  document.getElementById('pl-subj-analytics').innerHTML=cards;
}

function _renderPlChapterAnalytics(all){
  const chapterTotals={};
  all.forEach(l=>{
    chapterTotals[l.chapterId]=chapterTotals[l.chapterId]||{name:l.chapterName,subject:l.subject,total:0,lastDate:l.date};
    chapterTotals[l.chapterId].total+=l.questions;
    if(l.date>chapterTotals[l.chapterId].lastDate)chapterTotals[l.chapterId].lastDate=l.date;
  });
  const practicedIds=new Set(Object.keys(chapterTotals).map(Number));
  const allChapters=[];
  ['physics','chemistry','maths'].forEach(s=>(S.syllabus[s]||[]).filter(c=>!c.adv).forEach(c=>allChapters.push({id:c.id,name:c.name,subject:s})));
  const neverPracticed=allChapters.filter(c=>!practicedIds.has(c.id));
  const practicedList=Object.entries(chapterTotals).map(([id,v])=>({id:+id,...v}));
  const mostPracticed=[...practicedList].sort((a,b)=>b.total-a.total).slice(0,5);
  const leastPracticed=[...practicedList].sort((a,b)=>a.total-b.total).slice(0,5);
  const recentlyPracticed=[...practicedList].sort((a,b)=>b.lastDate.localeCompare(a.lastDate)).slice(0,5);

  const listHtml=(items,emptyMsg,showTotal)=>items.length?items.map(c=>
    `<div class="pl-ch-row"><span class="pl-ch-dot" style="background:${sc(c.subject)}"></span><span class="pl-ch-name">${c.name}</span>${showTotal?`<span class="pl-ch-total">${c.total} qs</span>`:''}</div>`
  ).join(''):`<div class="pl-ch-empty">${emptyMsg}</div>`;

  document.getElementById('pl-chapter-analytics').innerHTML=`
    <div class="pl-ch-analytics-card">
      <div class="pl-ch-analytics-hdr"><span style="color:#34d399">●</span> Most Practiced</div>
      ${listHtml(mostPracticed,'Nothing logged yet',true)}
    </div>
    <div class="pl-ch-analytics-card">
      <div class="pl-ch-analytics-hdr"><span style="color:#fbbf24">●</span> Least Practiced</div>
      ${listHtml(leastPracticed,'Nothing logged yet',true)}
    </div>
    <div class="pl-ch-analytics-card">
      <div class="pl-ch-analytics-hdr"><span style="color:#f87171">●</span> Never Practiced</div>
      ${neverPracticed.length?`<div class="pl-ch-chip-wrap">${neverPracticed.slice(0,12).map(c=>`<span class="pl-ch-chip" style="border-color:${sc(c.subject)}40;color:${sc(c.subject)}">${c.name}</span>`).join('')}${neverPracticed.length>12?`<span class="pl-ch-chip" style="opacity:.6">+${neverPracticed.length-12} more</span>`:''}</div>`:'<div class="pl-ch-empty">Every chapter has been touched 🎉</div>'}
    </div>
    <div class="pl-ch-analytics-card">
      <div class="pl-ch-analytics-hdr"><span style="color:#60a5fa">●</span> Recently Practiced</div>
      ${listHtml(recentlyPracticed,'Nothing logged yet',false)}
    </div>`;
}

function _renderPlFeed(logs){
  const sorted=[...logs].sort((a,b)=>b.loggedAt.localeCompare(a.loggedAt));
  const shown=sorted.slice(0,F.practice.feedShown);
  const wrap=document.getElementById('pl-feed');
  if(!sorted.length){
    wrap.innerHTML=`<div class="pl-ch-empty" style="padding:20px 0;text-align:center">No entries match these filters</div>`;
    document.getElementById('pl-feed-more-wrap').style.display='none';
    return;
  }
  wrap.innerHTML=shown.map(l=>{
    const dt=new Date(l.loggedAt);
    const timeStr=dt.toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'});
    const dayStr=l.date===td()?'Today':fmt(l.date);
    return `<div class="pl-feed-item">
      <div class="pl-feed-check" style="background:${sc(l.subject)}20;color:${sc(l.subject)}">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div class="pl-feed-body">
        <div class="pl-feed-line"><strong>${l.questions} questions</strong> — ${l.chapterName}</div>
        <div class="pl-feed-meta"><span style="color:${sc(l.subject)}">${cap(l.subject)}</span> · ${dayStr} • ${timeStr}</div>
      </div>
      <div class="pl-feed-actions">
        <button class="pl-feed-edit" onclick="editPracticeLog(${l.id})" title="Edit entry">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </button>
        <button class="pl-feed-del" onclick="confirmDelete('practiceLog',${l.id},'Delete this practice entry?')" title="Delete">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
        </button>
      </div>
    </div>`;
  }).join('');
  document.getElementById('pl-feed-more-wrap').style.display=sorted.length>shown.length?'':'none';
}

function updateBLStreaks(){
  const pending=S.backlogs.filter(b=>!b.done).length;
  if(pending===0&&S.backlogs.length>0){if(S.lastBLClear!==td()){S.backlogStreak=(S.backlogStreak||0)+1;S.lastBLClear=td();if(S.backlogStreak>(S.backlogBestStreak||0))S.backlogBestStreak=S.backlogStreak;}}
  else if(pending>0)S.backlogStreak=0;
}

function confirmReset(){openM('resetConfirm');}
// doReset() removed — was stale/dead code (superseded by app-09-settings.js's
// real implementation, which actually deletes server-side data via Supabase;
// this old version only cleared localStorage — same silent-overwrite history
// as save() above).
function exportData(){
  const blob=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download='jeetrack-backup-'+td()+'.json';a.click();
  toast('Exported successfully ✓', 'success');
}
function triggerImport(){
  document.getElementById('import-json-input')?.click();
}
function importData(input){
  const file=input.files[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=async function(e){
    try{
      const parsed=JSON.parse(e.target.result);
      
      if(typeof parsed!=='object'||Array.isArray(parsed)){throw new Error('Invalid format');}
      if(!parsed.tests&&!parsed.hours&&!parsed.syllabus){throw new Error('This doesn\'t look like a JEETrack backup.');}
      
      S={...S,...parsed};
      
      if(S.backlogStreak>365)S.backlogStreak=0;
      if(S.backlogBestStreak>365)S.backlogBestStreak=0;
      await save(); await flushSave();
      toast('Data imported ✓', 'success');
      navMarkDirty(null);
      renderOverview();updateBadges();
    }catch(err){
      toast('Import failed: '+(err.message||'Invalid JSON file'), 'error');
    }
    input.value='';
  };
  reader.readAsText(file);
}

let mnView='scores';
let advView='scores';
let mnScoresPage=0;
let advScoresPage=0;
const TEST_PAGE_SIZE=10;
function mnScoresNav(dir){
  mnScoresPage=Math.max(0,mnScoresPage+dir);
  renderMnUnified();
}
function advScoresNav(dir){
  advScoresPage=Math.max(0,advScoresPage+dir);
  renderAdvUnified();
}
function setMnView(v,el){
  mnView=v;
  mnScoresPage=0;
  document.querySelectorAll('[data-group="mn-view"]').forEach(e=>e.classList.remove('active'));
  el.classList.add('active');
  renderMnUnified();
}
function setAdvView(v,el){
  advView=v;
  advScoresPage=0;
  document.querySelectorAll('[data-group="adv-view"]').forEach(e=>e.classList.remove('active'));
  el.classList.add('active');
  renderAdvUnified();
}
function fltSubjDd(exam,val){
  F[exam].subj=val;
  if(exam==='mains')renderMains();
  else renderAdv();
}

function renderOverview(){ensureChartJs().then(function(){_renderOverview();}, function(){console.warn('[renderOverview] Chart.js failed to load — rendering without it'); _renderOverview();});}
function _renderOverview(){
  const mains=S.tests.filter(t=>t.exam==='mains').sort((a,b)=>b.date.localeCompare(a.date));
  const adv=S.tests.filter(t=>t.exam==='advanced').sort((a,b)=>b.date.localeCompare(a.date));
  const ml=mains[0];
  const mlEl=document.getElementById('ov-ml');
  if(ml){animateNumber(mlEl,ml.total);}else mlEl.textContent='—';
  document.getElementById('ov-mb').innerHTML=ml?`<span class="sbadge ${sbgGoal(ml.total,ml.max,'mains')}">${pct(ml.total,ml.max)}%</span>`:'';
  const al=adv[0];
  const alEl=document.getElementById('ov-al');
  if(al){animateNumber(alEl,al.total);}else alEl.textContent='—';
  document.getElementById('ov-ab').innerHTML=al?`<span class="sbadge ${sbgGoal(al.total,al.max,'advanced')}">${pct(al.total,al.max)}%</span>`:'';
  animateNumber(document.getElementById('ov-st'),S.backlogStreak||0,600,'d');
  document.getElementById('ov-stb').textContent=S.backlogStreak?`Best: ${S.backlogBestStreak}d`:'start today';
  const tdP=S.todos.filter(t=>!t.done).length;
  animateNumber(document.getElementById('ov-td'),tdP);
  drawJeeDonut();
  renderOvNotifs();
  
  renderOvPracticeCard();
  
  const th=S.hours.filter(h=>h.date===td());
  const tL=th.reduce((a,b)=>a+b.lecture,0),tP=th.reduce((a,b)=>a+b.practice,0),tR=th.reduce((a,b)=>a+b.revision,0);
  const tTotal=tL+tP+tR;
  const lPct=tTotal?Math.round(tL/tTotal*100):0;
  const pPct=tTotal?Math.round(tP/tTotal*100):0;
  const rPct=tTotal?Math.round(tR/tTotal*100):0;
  const svgLec=`<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`;
  const svgPrac=`<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
  const svgRev=`<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`;
  document.getElementById('today-study').innerHTML=`<div style="font-family:'Syne',sans-serif;font-size:1.5rem;font-weight:700;margin-bottom:8px">${+tTotal.toFixed(1)}h today</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px"><span class="chip bb" style="display:inline-flex;align-items:center;gap:4px">${svgLec} Lec ${lPct}%</span><span class="chip bg" style="display:inline-flex;align-items:center;gap:4px">${svgPrac} Prac ${pPct}%</span><span class="chip bac" style="display:inline-flex;align-items:center;gap:4px">${svgRev} Rev ${rPct}%</span></div>${tTotal>0?`<div style="height:5px;border-radius:99px;overflow:hidden;display:flex;gap:1px"><div style="width:${lPct}%;background:#60a5fa;border-radius:99px 0 0 99px"></div><div style="width:${pPct}%;background:#34d399"></div><div style="width:${rPct}%;background:#a695ff;border-radius:0 99px 99px 0"></div></div>`:'<div style="font-size:11px;color:var(--mu)">Nothing logged yet today</div>'}`;

  
  const nextT=S.upcoming.filter(t=>t.date>=td()).sort((a,b)=>a.date.localeCompare(b.date))[0];
  const blSub=['physics','chemistry','maths'].map(s=>`<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--bd);font-size:12px"><span>${cap(s)}</span><span class="chip ${S.backlogs.filter(b=>b.subject===s&&!b.done).length>0?'br':'bg'}">${S.backlogs.filter(b=>b.subject===s&&!b.done).length} backlog</span></div>`).join('');
  document.getElementById('ov-qs').innerHTML=`${blSub}${nextT?`<div style="margin-top:7px;padding:5px 7px;background:rgba(96,165,250,.08);border-radius:5px;font-size:11px"><span style="color:var(--bl);font-weight:600">Next test</span><br>${cap(nextT.exam)} · ${fmt(nextT.date)}${nextT.venue?' @ '+nextT.venue:''}</div>`:'<div style="margin-top:7px;font-size:11px;color:var(--mu)">No tests scheduled</div>'}`;
  renderOvTrend();renderOvWeek();
  
  const subjs=['physics','chemistry','maths'];
  const sylHtml=subjs.map(s=>{
    const chs=S.syllabus[s]||[];
    const done=chs.filter(c=>c.theory&&c.practice).length;
    const p=chs.length?Math.round(done/chs.length*100):0;
    return`<div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px"><span style="font-weight:500;color:${sc(s)}">${cap(s)}</span><span style="font-family:'DM Mono',monospace;color:var(--mu)">${done}/${chs.length} · ${p}%</span></div><div class="bbt"><div class="bbf" style="width:${p}%;background:${sc(s)}"></div></div></div>`;
  }).join('');
  const allDone2=[...subjs.flatMap(s=>S.syllabus[s]||[])].filter(c=>c.theory&&c.practice).length;
  const allTotal2=subjs.flatMap(s=>S.syllabus[s]||[]).length;
  const ovPct=allTotal2?Math.round(allDone2/allTotal2*100):0;
  document.getElementById('ov-syl').innerHTML=`<div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px"><span style="font-weight:600">Overall</span><span class="chip ${ovPct===100?'bg':'bac'}">${ovPct}% · ${allDone2}/${allTotal2}</span></div><div class="bbt" style="height:7px"><div class="bbf" style="width:${ovPct}%;background:linear-gradient(90deg,#7c6af7,#f472b6)"></div></div></div>${sylHtml}`;
  
  const ups=S.upcoming.filter(t=>t.date>=td()).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,3);
  const tmrr=new Date();tmrr.setDate(tmrr.getDate()+1);const tmrrStr=tmrr.toISOString().split('T')[0];
  document.getElementById('ov-upcoming-mini').innerHTML=ups.length?ups.map(t=>{
    const isT=t.date===td(),isTmr=t.date===tmrrStr;
    const dl3=Math.ceil((new Date(t.date+'T00:00:00')-new Date(td()+'T00:00:00'))/86400000);
    const rightSide=isT
      ?`<button onclick="event.stopPropagation();openLogFromUpcoming(${t.id})" title="Add your score" style="cursor:pointer;border:none;font-size:10.5px;font-weight:700;color:#0a0a0f;background:linear-gradient(135deg,#f87171,#fb923c);padding:4px 10px;border-radius:99px;white-space:nowrap;display:flex;align-items:center;gap:4px"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add Score</button>`
      :`<span style="color:${isTmr?'var(--am)':'var(--mu)'}; font-size:11px">${isTmr?'Tomorrow':dl3+'d away'}</span>`;
    return`<div style="padding:5px 0;border-bottom:1px solid var(--bd);font-size:12px;display:flex;justify-content:space-between;align-items:center;gap:8px"><span>${cap(t.exam)} <span class="tt ${t.type==='full'?'tf':'tp'}">${t.type==='full'?'Full':'P'}</span></span>${rightSide}</div>`;
  }).join(''):`<div style="font-size:12px;color:var(--mu);padding:.4rem 0">No upcoming tests</div>`;
}
function drawJeeDonut(){
  const canvas=document.getElementById('jeeDonut');
  const ctx=canvas.getContext('2d');
  const dm=dLeft(getJeeMainsDate()),da=dLeft(getJeeAdvDate());
  document.getElementById('jtt-m').textContent=dm;
  document.getElementById('jtt-a').textContent=da;
  const W=canvas.offsetWidth||canvas.width;
  canvas.width=W; canvas.height=W;
  const cx=W/2,cy=W/2,r=W/2-10,total=730;
  const mFrac=Math.min(1,dm/total),aFrac=Math.min(1,da/total);
  const dlEl=document.getElementById('jee-dl');
  
  let prog=0;
  const duration=900,startT=performance.now();
  function animate(now){
    prog=Math.min(1,(now-startT)/duration);
    const ease=1-Math.pow(1-prog,3);
    ctx.clearRect(0,0,W,W);
    
    ctx.lineWidth=10;ctx.lineCap='butt';
    ctx.strokeStyle='rgba(255,255,255,0.06)';
    ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();
    
    ctx.strokeStyle='#7c6af7';ctx.lineCap='round';ctx.lineWidth=10;
    ctx.beginPath();ctx.arc(cx,cy,r,-Math.PI/2,-Math.PI/2+mFrac*Math.PI*ease);ctx.stroke();
    
    ctx.strokeStyle='#f472b6';ctx.lineCap='round';
    ctx.beginPath();ctx.arc(cx,cy,r,Math.PI/2,Math.PI/2+aFrac*Math.PI*ease);ctx.stroke();
    
    dlEl.textContent=Math.round(dm*ease);
    if(prog<1)requestAnimationFrame(animate);
    else{dlEl.textContent=dm;}
  }
  requestAnimationFrame(animate);
  const tip=document.getElementById('jee-tooltip');
  canvas.onmousemove=function(e){
    const rect=canvas.getBoundingClientRect();
    const left=e.clientX-rect.left<rect.width/2;
    dlEl.textContent=left?dm:da;
    document.getElementById('jee-dl-label').textContent=left?'Mains':'Adv';
    tip.style.display='block';
    tip.style.left=(e.clientX+14)+'px';
    tip.style.top=(e.clientY-10)+'px';
  };
  canvas.onmouseleave=function(){
    tip.style.display='none';
    dlEl.textContent=dm;
    document.getElementById('jee-dl-label').textContent='days';
  };
}
function renderOvTrend(){
  const f=document.getElementById('ov-tf').value,m=M.ov;
  let tests=[...S.tests].sort((a,b)=>a.date.localeCompare(b.date));
  if(f!=='all')tests=tests.filter(t=>t.exam===f);
  tests=tests.slice(-5); // last 5 by default, keeps the dashboard trend chart light
  const newData={labels:tests.map(t=>fmt(t.date)),datasets:[{label:m==='pct'?'Score%':'Score',data:tests.map(t=>scoreVal(t,m,null)),borderColor:'#7c6af7',backgroundColor:'rgba(124,106,247,.08)',borderWidth:2,tension:.4,fill:true,pointRadius:3,pointBackgroundColor:'#7c6af7'}]};
  const newOpts={responsive:true,maintainAspectRatio:false,animation:false,plugins:{legend:{display:false}},scales:{...sO(),y:{...sO().y,min:0,ticks:{...sO().y.ticks,callback:m==='pct'?v=>v+'%':v=>v}}}};
  if(!uC('ovTC',newData,newOpts)){
    const ctx=document.getElementById('ovTC').getContext('2d');
    chartInstances_ov=new Chart(ctx,{type:'line',data:newData,options:newOpts});
    CIs['ovTC']=chartInstances_ov;
  }
}
function renderOvWeek(){
  const days=l7();
  const ovHasMock=S.hours.some(h=>(h.mockAnalysis||0)>0);
  const ovCats=HOUR_CATS.filter(c=>c.manual||ovHasMock);
  const newData={labels:days.map(d=>new Date(d+'T00:00:00').toLocaleDateString('en',{weekday:'short'})),datasets:ovCats.map(c=>({label:c.label.slice(0,4),data:days.map(d=>S.hours.filter(h=>h.date===d).reduce((a,b)=>a+(b[c.key]||0),0)),backgroundColor:c.color,stack:'s',borderRadius:2}))};
  const newOpts={responsive:true,maintainAspectRatio:false,animation:false,plugins:{legend:{position:'bottom',labels:{color:'#7a7990',font:{size:9},boxWidth:7,padding:7}}},scales:{...sO(),x:{...sO().x,stacked:true},y:{...sO().y,stacked:true}}};
  if(!uC('ovWC',newData,newOpts)){
    const ctx=document.getElementById('ovWC').getContext('2d');
    CIs['ovWC']=new Chart(ctx,{type:'bar',data:newData,options:newOpts});
  }
}

function renderMains(){ensureChartJs().then(function(){_renderMains();}, function(){console.warn('[renderMains] Chart.js failed to load — rendering without it'); _renderMains();});}
function _renderMains(){
  const tests=getTests('mains');const m=M.mn;
  const sf=F.mains.subj;
  const scoreList=sf==='all'?tests.map(t=>scoreVal(t,m,null)):tests.map(t=>scoreVal(t,m,sf));
  const best=scoreList.length?Math.max(...scoreList):0;
  const avg=scoreList.length?(scoreList.reduce((a,b)=>a+b,0)/scoreList.length).toFixed(1):0;
  const latest=tests.length?tests[tests.length-1]:null;
  const latestVal=latest?(sf==='all'?scoreVal(latest,m,null):scoreVal(latest,m,sf)):null;
  const latestPrev=tests.length>1?(sf==='all'?scoreVal(tests[tests.length-2],m,null):scoreVal(tests[tests.length-2],m,sf)):null;
  const trendDelta=latestVal!==null&&latestPrev!==null?+(latestVal-latestPrev).toFixed(1):null;
  const trendClass=trendDelta===null?'nt':trendDelta>0?'up':'dn';
  const trendIcon=trendDelta===null?'—':trendDelta>0?`<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>+${trendDelta}`:`<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>${trendDelta}`;
  document.getElementById('mn-stats').innerHTML=`
    <div class="prem-stat-card violet">
      <div class="prem-stat-icon-row">
        <div class="prem-stat-ico" style="background:rgba(124,106,247,.12)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ac2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M4 7h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"/></svg></div>
        <span class="prem-stat-trend nt">tests</span>
      </div>
      <div class="prem-stat-lbl">Tests Taken</div>
      <div class="prem-stat-val" style="color:var(--ac2)">${tests.length}</div>
      <div class="prem-stat-sub">${tests.length===0?'Add your first test':tests.length===1?'1 session logged':'across all sessions'}</div>
      <div class="prem-stat-bar"><div class="prem-stat-bar-fill" style="background:linear-gradient(90deg,var(--ac),var(--ac2));width:${Math.min(100,tests.length*10)}%"></div></div>
    </div>
    <div class="prem-stat-card blue">
      <div class="prem-stat-icon-row">
        <div class="prem-stat-ico" style="background:rgba(96,165,250,.12)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--bl)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
        <span class="prem-stat-trend ${trendClass}">${trendIcon}</span>
      </div>
      <div class="prem-stat-lbl">Latest ${sf==='all'?'Score':cap(sf)}</div>
      <div class="prem-stat-val" style="color:var(--bl)">${latestVal!==null?latestVal:'—'}</div>
      <div class="prem-stat-sub">${latestVal!==null?(m==='pct'?'percentage score':'marks scored'):'no tests yet'}</div>
      <div class="prem-stat-bar"><div class="prem-stat-bar-fill" style="background:linear-gradient(90deg,#60a5fa,#93c5fd);width:${latestVal!==null?Math.min(100,+latestVal):0}%"></div></div>
    </div>
    <div class="prem-stat-card green">
      <div class="prem-stat-icon-row">
        <div class="prem-stat-ico" style="background:rgba(52,211,153,.12)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gn)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>
        <span class="prem-stat-trend up">best</span>
      </div>
      <div class="prem-stat-lbl">Best Score</div>
      <div class="prem-stat-val" style="color:var(--gn)">${best}${m==='pct'?'%':''}</div>
      <div class="prem-stat-sub">personal record</div>
      <div class="prem-stat-bar"><div class="prem-stat-bar-fill" style="background:linear-gradient(90deg,var(--gn),#6ee7b7);width:${Math.min(100,+best)}%"></div></div>
    </div>
    <div class="prem-stat-card amber">
      <div class="prem-stat-icon-row">
        <div class="prem-stat-ico" style="background:rgba(251,191,36,.1)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--am)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div>
        <span class="prem-stat-trend nt">avg</span>
      </div>
      <div class="prem-stat-lbl">Average</div>
      <div class="prem-stat-val" style="color:var(--am)">${avg}${m==='pct'?'%':''}</div>
      <div class="prem-stat-sub">across ${tests.length} test${tests.length!==1?'s':''}</div>
      <div class="prem-stat-bar"><div class="prem-stat-bar-fill" style="background:linear-gradient(90deg,var(--am),#fde68a);width:${Math.min(100,+avg)}%"></div></div>
    </div>`;
  
  // Chart shows only the last 5 tests by default — stats above (best/avg/latest)
  // still reflect the FULL history, only the trend-line rendering is capped.
  const chartTests = tests.slice(-5);
  const mnTCData={labels:chartTests.map(t=>fmt(t.date)),datasets:sf==='all'?[
    {label:'Total',data:chartTests.map(t=>scoreVal(t,m,null)),borderColor:'#a695ff',backgroundColor:'rgba(166,149,255,.08)',borderWidth:2,tension:.4,fill:true,pointRadius:3,pointBackgroundColor:'#a695ff'},
    {label:'Physics',data:chartTests.map(t=>scoreVal(t,m,'physics')),borderColor:'#60a5fa',borderWidth:1.5,tension:.4,pointRadius:0,borderDash:[3,3]},
    {label:'Chemistry',data:chartTests.map(t=>scoreVal(t,m,'chemistry')),borderColor:'#34d399',borderWidth:1.5,tension:.4,pointRadius:0,borderDash:[3,3]},
    {label:'Maths',data:chartTests.map(t=>scoreVal(t,m,'maths')),borderColor:'#fbbf24',borderWidth:1.5,tension:.4,pointRadius:0,borderDash:[3,3]}
  ]:[{label:cap(sf),data:chartTests.map(t=>scoreVal(t,m,sf)),borderColor:sc(sf),backgroundColor:sc(sf)+'20',borderWidth:2,tension:.4,fill:true,pointRadius:3,pointBackgroundColor:sc(sf)}]};
  const mnTCOpts={responsive:true,maintainAspectRatio:false,animation:false,plugins:{legend:{position:'bottom',labels:{color:'#7a7990',font:{size:9},boxWidth:7,padding:7}}},scales:{...sO(),y:{...sO().y,min:0,ticks:{...sO().y.ticks,callback:m==='pct'?v=>v+'%':v=>v}}}};
  if(!uC('mnTC',mnTCData,mnTCOpts)){const c1=document.getElementById('mnTC').getContext('2d');CIs['mnTC']=new Chart(c1,{type:'line',data:mnTCData,options:mnTCOpts});}
  
  const sAv=s=>{const v=tests.map(t=>scoreVal(t,m,s)).filter(v=>v>0);return v.length?+(v.reduce((a,b)=>a+b,0)/v.length).toFixed(1):0;};
  const subjs=['physics','chemistry','maths'];
  const isFiltered=sf!=='all';
  const mnSCData={labels:isFiltered?[cap(sf)]:['Physics','Chemistry','Maths'],datasets:[{label:'Avg',data:isFiltered?[sAv(sf)]:subjs.map(s=>sAv(s)),backgroundColor:isFiltered?[sc(sf)]:['#60a5fa','#34d399','#fbbf24'],borderRadius:5,barThickness:28}]};
  const mnSCOpts={responsive:true,maintainAspectRatio:false,animation:false,plugins:{legend:{display:false}},scales:{...sO(),y:{...sO().y,min:0,ticks:{...sO().y.ticks,callback:m==='pct'?v=>v+'%':v=>v}}}};
  if(!uC('mnSC',mnSCData,mnSCOpts)){const c2=document.getElementById('mnSC').getContext('2d');CIs['mnSC']=new Chart(c2,{type:'bar',data:mnSCData,options:mnSCOpts});}
  
  const tmr=new Date();tmr.setDate(tmr.getDate()+1);const tmrStr=tmr.toISOString().split('T')[0];
  const notif=[];
  S.upcoming.filter(t=>t.exam==='mains'&&t.date===tmrStr).forEach(t=>notif.push({c:'am',msg:`<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Mains test tomorrow: ${t.session||''} ${t.venue?'@ '+t.venue:''}`}));
  S.upcoming.filter(t=>t.exam==='mains'&&t.date===td()).forEach(t=>notif.push({c:'rd',msg:`<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Mains test TODAY: ${t.session||''} ${t.venue?'@ '+t.venue:''}`}));
  document.getElementById('mn-notifs').innerHTML=notif.map(n=>`<div class="prem-notif ${n.c==='am'?'warn':'danger'}"><div class="prem-notif-icon">${n.c==='am'?'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>':'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'}</div>${n.msg}</div>`).join('');
  renderMnUnified();
}
function openLogFromUpcoming(upid){
  const t=S.upcoming.find(x=>x.id===upid);if(!t)return;
  document.getElementById('hwt-desc').textContent=`Log score for: ${cap(t.exam)} ${t.session||''} ${t.venue?'@ '+t.venue:''} on ${fmt(t.date)}`;
  document.getElementById('hwt-max').value=t.exam==='advanced'?360:300;
  document.querySelector('#modal-howWasTest').dataset.upid=t.id;
  openM('howWasTest');
}
function renderMnUnified(){
  const tmr=new Date();tmr.setDate(tmr.getDate()+1);const tmrStr=tmr.toISOString().split('T')[0];
  const tests=getTests('mains');const _m=M.mn;
  const el=document.getElementById('mn-unified');
  if(mnView==='upcoming'){
    
    const up=S.upcoming.filter(t=>t.exam==='mains'&&t.date>=td()).sort((a,b)=>a.date.localeCompare(b.date));
    const logSVG=`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`;
    el.innerHTML=up.length?up.map(t=>{
      const isT=t.date===td(),isTmr=t.date===tmrStr;
      const dl2=Math.ceil((new Date(t.date+'T00:00:00')-new Date(td()+'T00:00:00'))/86400000);
      return`<div style="background:var(--sf2);border:1px solid var(--bd);border-left:3px solid ${isT?'var(--rd)':isTmr?'var(--am)':'var(--bl)'};border-radius:var(--rs);padding:.6rem .8rem;margin-bottom:5px;display:flex;align-items:center;gap:8px">
        <div style="flex:1"><span style="font-weight:500;font-size:13px">${t.session||'Mains Mock'}</span> <span class="tt ${t.type==='full'?'tf':'tp'}">${t.type==='full'?'Full':'Partial'}</span> ${isT?'<span class="chip br" style="margin-left:4px">TODAY</span>':isTmr?'<span class="chip ba" style="margin-left:4px">TOMORROW</span>':'<span class="chip bb" style="margin-left:4px">in '+dl2+'d</span>'}
        <div style="font-size:11px;color:var(--mu);margin-top:2px"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:2px"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> ${fmt(t.date)} ${t.venue?''+t.venue:''} ${t.notes?'· '+t.notes:''}</div></div>
        <div style="display:flex;gap:5px;align-items:center">
          ${isT?`<button class="btn bp bsm" onclick="openLogFromUpcoming(${t.id})" title="Log score for this test" style="display:inline-flex;align-items:center;justify-content:center;padding:4px 7px;font-size:11px">${logSVG}</button>`:''}
          <button class="btn brd bsm" onclick="deleteUpcoming(${t.id})" title="Remove">✕</button>
        </div>
      </div>`;
    }).join(''):`<div class="empty"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:5px"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> No upcoming tests scheduled.</div>`;
  } else {
    const allSorted=tests.slice().reverse();
    const totalPages=Math.max(1,Math.ceil(allSorted.length/TEST_PAGE_SIZE));
    if(mnScoresPage>totalPages-1)mnScoresPage=totalPages-1;
    if(mnScoresPage<0)mnScoresPage=0;
    const start=mnScoresPage*TEST_PAGE_SIZE;
    const pageTests=allSorted.slice(start,start+TEST_PAGE_SIZE);
    const prevDis=mnScoresPage<=0, nextDis=mnScoresPage>=totalPages-1;
    const pagerHTML=allSorted.length>TEST_PAGE_SIZE?`<div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px;padding:0 2px;flex-wrap:wrap;gap:8px">
        <span style="font-size:11px;color:var(--mu)">Showing ${start+1}–${Math.min(start+TEST_PAGE_SIZE,allSorted.length)} of ${allSorted.length}</span>
        <div style="display:flex;gap:6px;align-items:center">
          <button class="btn bg2 bsm" onclick="mnScoresNav(-1)" ${prevDis?'disabled':''} style="padding:4px 8px${prevDis?';opacity:.35;cursor:not-allowed':''}"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
          <span style="font-size:11px;color:var(--tx);min-width:50px;text-align:center">Page ${mnScoresPage+1} / ${totalPages}</span>
          <button class="btn bg2 bsm" onclick="mnScoresNav(1)" ${nextDis?'disabled':''} style="padding:4px 8px${nextDis?';opacity:.35;cursor:not-allowed':''}"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>
        </div>
      </div>`:'';
    el.innerHTML=`<div class="tw"><table><thead><tr><th>Date</th><th>Type</th><th>Total</th><th>%</th><th>Phy</th><th>Chem</th><th>Math</th><th>Notes</th><th></th></tr></thead><tbody>${pageTests.length?pageTests.map(t=>`<tr><td style="font-family:'DM Mono',monospace">${fmt(t.date)}</td><td><span class="tt ${t.type==='full'?'tf':'tp'}">${t.type==='full'?'Full':'Partial'}</span></td><td><b>${t.total}</b>/${t.max}</td><td><span class="sp ${sbgGoal(t.total,t.max,'mains')}">${pct(t.total,t.max)}%</span></td><td style="color:var(--bl)">${t.physics}</td><td style="color:var(--gn)">${t.chemistry}</td><td style="color:var(--am)">${t.maths}</td><td style="color:var(--mu);max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${t.notes||'—'}</td><td style="display:flex;gap:4px"><button class="btn bg2 bsm" onclick="viewTest(${t.id})" title="Details" style="padding:3px 6px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button></td></tr>`).join(''):`<tr><td colspan="9"><div class="empty"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:5px"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> No mains tests yet.</div></td></tr>`}</tbody></table></div>${pagerHTML}`;
  }
}

function renderAdv(){ensureChartJs().then(function(){_renderAdv();}, function(){console.warn('[renderAdv] Chart.js failed to load — rendering without it'); _renderAdv();});}
function _renderAdv(){
  const tests=getTests('advanced');const m=M.adv;
  const sf=F.advanced.subj;
  const scoreList=sf==='all'?tests.map(t=>scoreVal(t,m,null)):tests.map(t=>scoreVal(t,m,sf));
  const best=scoreList.length?Math.max(...scoreList):0;
  const avg=scoreList.length?(scoreList.reduce((a,b)=>a+b,0)/scoreList.length).toFixed(1):0;
  const latest=tests.length?tests[tests.length-1]:null;
  const latestVal=latest?(sf==='all'?scoreVal(latest,m,null):scoreVal(latest,m,sf)):null;
  const advLatestPrev=tests.length>1?(sf==='all'?scoreVal(tests[tests.length-2],m,null):scoreVal(tests[tests.length-2],m,sf)):null;
  const advTrendDelta=latestVal!==null&&advLatestPrev!==null?+(latestVal-advLatestPrev).toFixed(1):null;
  const advTrendClass=advTrendDelta===null?'nt':advTrendDelta>0?'up':'dn';
  const advTrendIcon=advTrendDelta===null?'—':advTrendDelta>0?`<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>+${advTrendDelta}`:`<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>${advTrendDelta}`;
  document.getElementById('adv-stats').innerHTML=`
    <div class="prem-stat-card pink">
      <div class="prem-stat-icon-row">
        <div class="prem-stat-ico" style="background:rgba(244,114,182,.12)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--pk)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg></div>
        <span class="prem-stat-trend nt">tests</span>
      </div>
      <div class="prem-stat-lbl">Tests Taken</div>
      <div class="prem-stat-val" style="color:var(--pk)">${tests.length}</div>
      <div class="prem-stat-sub">${tests.length===0?'Add your first test':tests.length===1?'1 session logged':'across all sessions'}</div>
      <div class="prem-stat-bar"><div class="prem-stat-bar-fill" style="background:linear-gradient(90deg,#f472b6,#fb7185);width:${Math.min(100,tests.length*10)}%"></div></div>
    </div>
    <div class="prem-stat-card blue">
      <div class="prem-stat-icon-row">
        <div class="prem-stat-ico" style="background:rgba(96,165,250,.12)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--bl)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
        <span class="prem-stat-trend ${advTrendClass}">${advTrendIcon}</span>
      </div>
      <div class="prem-stat-lbl">Latest ${sf==='all'?'Score':cap(sf)}</div>
      <div class="prem-stat-val" style="color:var(--bl)">${latestVal!==null?latestVal:'—'}</div>
      <div class="prem-stat-sub">${latestVal!==null?(m==='pct'?'percentage score':'marks scored'):'no tests yet'}</div>
      <div class="prem-stat-bar"><div class="prem-stat-bar-fill" style="background:linear-gradient(90deg,#60a5fa,#93c5fd);width:${latestVal!==null?Math.min(100,+latestVal):0}%"></div></div>
    </div>
    <div class="prem-stat-card green">
      <div class="prem-stat-icon-row">
        <div class="prem-stat-ico" style="background:rgba(52,211,153,.12)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gn)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>
        <span class="prem-stat-trend up">best</span>
      </div>
      <div class="prem-stat-lbl">Best Score</div>
      <div class="prem-stat-val" style="color:var(--gn)">${best}${m==='pct'?'%':''}</div>
      <div class="prem-stat-sub">personal record</div>
      <div class="prem-stat-bar"><div class="prem-stat-bar-fill" style="background:linear-gradient(90deg,var(--gn),#6ee7b7);width:${Math.min(100,+best)}%"></div></div>
    </div>
    <div class="prem-stat-card amber">
      <div class="prem-stat-icon-row">
        <div class="prem-stat-ico" style="background:rgba(251,191,36,.1)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--am)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div>
        <span class="prem-stat-trend nt">avg</span>
      </div>
      <div class="prem-stat-lbl">Average</div>
      <div class="prem-stat-val" style="color:var(--am)">${avg}${m==='pct'?'%':''}</div>
      <div class="prem-stat-sub">across ${tests.length} test${tests.length!==1?'s':''}</div>
      <div class="prem-stat-bar"><div class="prem-stat-bar-fill" style="background:linear-gradient(90deg,var(--am),#fde68a);width:${Math.min(100,+avg)}%"></div></div>
    </div>`;
  const chartTests = tests.slice(-5);
  const advTCData={labels:chartTests.map(t=>fmt(t.date)),datasets:sf==='all'?[
    {label:'Total',data:chartTests.map(t=>scoreVal(t,m,null)),borderColor:'#f472b6',backgroundColor:'rgba(244,114,182,.08)',borderWidth:2,tension:.4,fill:true,pointRadius:3,pointBackgroundColor:'#f472b6'},
    {label:'Physics',data:chartTests.map(t=>scoreVal(t,m,'physics')),borderColor:'#60a5fa',borderWidth:1.5,tension:.4,pointRadius:0,borderDash:[3,3]},
    {label:'Chemistry',data:chartTests.map(t=>scoreVal(t,m,'chemistry')),borderColor:'#34d399',borderWidth:1.5,tension:.4,pointRadius:0,borderDash:[3,3]},
    {label:'Maths',data:chartTests.map(t=>scoreVal(t,m,'maths')),borderColor:'#fbbf24',borderWidth:1.5,tension:.4,pointRadius:0,borderDash:[3,3]}
  ]:[{label:cap(sf),data:chartTests.map(t=>scoreVal(t,m,sf)),borderColor:sc(sf),backgroundColor:sc(sf)+'20',borderWidth:2,tension:.4,fill:true,pointRadius:3,pointBackgroundColor:sc(sf)}]};
  const advTCOpts={responsive:true,maintainAspectRatio:false,animation:false,plugins:{legend:{position:'bottom',labels:{color:'#7a7990',font:{size:9},boxWidth:7,padding:7}}},scales:{...sO(),y:{...sO().y,min:0,ticks:{...sO().y.ticks,callback:m==='pct'?v=>v+'%':v=>v}}}};
  if(!uC('advTC',advTCData,advTCOpts)){const c1=document.getElementById('advTC').getContext('2d');CIs['advTC']=new Chart(c1,{type:'line',data:advTCData,options:advTCOpts});}
  const p1=tests.filter(t=>t.paper==='p1'),p2=tests.filter(t=>t.paper==='p2');
  const pAv=(arr,s)=>{const v=arr.map(t=>scoreVal(t,m,s));return v.length?+(v.reduce((a,b)=>a+b,0)/v.length).toFixed(1):0;};
  const advPCData={labels:['Physics','Chemistry','Maths'],datasets:[{label:'Paper 1',data:['physics','chemistry','maths'].map(s=>pAv(p1,s)),backgroundColor:'#7c6af7',borderRadius:4,barThickness:18},{label:'Paper 2',data:['physics','chemistry','maths'].map(s=>pAv(p2,s)),backgroundColor:'#f472b6',borderRadius:4,barThickness:18}]};
  const advPCOpts={responsive:true,maintainAspectRatio:false,animation:false,plugins:{legend:{position:'bottom',labels:{color:'#7a7990',font:{size:9},boxWidth:7,padding:7}}},scales:{...sO(),y:{...sO().y,min:0,ticks:{...sO().y.ticks,callback:m==='pct'?v=>v+'%':v=>v}}}};
  if(!uC('advPC',advPCData,advPCOpts)){const c2=document.getElementById('advPC').getContext('2d');CIs['advPC']=new Chart(c2,{type:'bar',data:advPCData,options:advPCOpts});}
  const tmr=new Date();tmr.setDate(tmr.getDate()+1);const tmrStr=tmr.toISOString().split('T')[0];
  const notif=[];
  S.upcoming.filter(t=>t.exam==='advanced'&&t.date===tmrStr).forEach(t=>notif.push({c:'am',msg:`<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Advanced test tomorrow: ${t.session||''} ${t.venue?'@ '+t.venue:''}`}));
  S.upcoming.filter(t=>t.exam==='advanced'&&t.date===td()).forEach(t=>notif.push({c:'rd',msg:`<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Advanced test TODAY: ${t.session||''} ${t.venue?'@ '+t.venue:''}`}));
  document.getElementById('adv-notifs').innerHTML=notif.map(n=>`<div class="prem-notif ${n.c==='am'?'warn':'danger'}"><div class="prem-notif-icon">${n.c==='am'?'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>':'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'}</div>${n.msg}</div>`).join('');
  renderAdvUnified();
}
function renderAdvUnified(){
  const tmr=new Date();tmr.setDate(tmr.getDate()+1);const tmrStr=tmr.toISOString().split('T')[0];
  const tests=getTests('advanced');
  const el=document.getElementById('adv-unified');
  if(advView==='upcoming'){
    
    const up=S.upcoming.filter(t=>t.exam==='advanced'&&t.date>=td()).sort((a,b)=>a.date.localeCompare(b.date));
    const logSVG=`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`;
    el.innerHTML=up.length?up.map(t=>{
      const isT=t.date===td(),isTmr=t.date===tmrStr;
      const dl2=Math.ceil((new Date(t.date+'T00:00:00')-new Date(td()+'T00:00:00'))/86400000);
      return`<div style="background:var(--sf2);border:1px solid var(--bd);border-left:3px solid ${isT?'var(--rd)':isTmr?'var(--am)':'var(--bl)'};border-radius:var(--rs);padding:.6rem .8rem;margin-bottom:5px;display:flex;align-items:center;gap:8px">
        <div style="flex:1"><span style="font-weight:500;font-size:13px">${t.session||'Advanced Mock'}</span> <span class="tt ${t.type==='full'?'tf':'tp'}">${t.type==='full'?'Full':'Partial'}</span> ${isT?'<span class="chip br" style="margin-left:4px">TODAY</span>':isTmr?'<span class="chip ba" style="margin-left:4px">TOMORROW</span>':'<span class="chip bac" style="margin-left:4px">in '+dl2+'d</span>'}
        <div style="font-size:11px;color:var(--mu);margin-top:2px"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:2px"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> ${fmt(t.date)} ${t.venue?''+t.venue:''} ${t.notes?'· '+t.notes:''}</div></div>
        <div style="display:flex;gap:5px;align-items:center">
          ${isT?`<button class="btn bp bsm" onclick="openLogFromUpcoming(${t.id})" title="Log score for this test" style="display:inline-flex;align-items:center;justify-content:center;padding:4px 7px;font-size:11px">${logSVG}</button>`:''}
          <button class="btn brd bsm" onclick="deleteUpcoming(${t.id})" title="Remove">✕</button>
        </div>
      </div>`;
    }).join(''):`<div class="empty"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:5px"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> No upcoming tests scheduled.</div>`;
  } else {
    const allSorted=tests.slice().reverse();
    const totalPages=Math.max(1,Math.ceil(allSorted.length/TEST_PAGE_SIZE));
    if(advScoresPage>totalPages-1)advScoresPage=totalPages-1;
    if(advScoresPage<0)advScoresPage=0;
    const start=advScoresPage*TEST_PAGE_SIZE;
    const pageTests=allSorted.slice(start,start+TEST_PAGE_SIZE);
    const prevDis=advScoresPage<=0, nextDis=advScoresPage>=totalPages-1;
    const pagerHTML=allSorted.length>TEST_PAGE_SIZE?`<div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px;padding:0 2px;flex-wrap:wrap;gap:8px">
        <span style="font-size:11px;color:var(--mu)">Showing ${start+1}–${Math.min(start+TEST_PAGE_SIZE,allSorted.length)} of ${allSorted.length}</span>
        <div style="display:flex;gap:6px;align-items:center">
          <button class="btn bg2 bsm" onclick="advScoresNav(-1)" ${prevDis?'disabled':''} style="padding:4px 8px${prevDis?';opacity:.35;cursor:not-allowed':''}"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
          <span style="font-size:11px;color:var(--tx);min-width:50px;text-align:center">Page ${advScoresPage+1} / ${totalPages}</span>
          <button class="btn bg2 bsm" onclick="advScoresNav(1)" ${nextDis?'disabled':''} style="padding:4px 8px${nextDis?';opacity:.35;cursor:not-allowed':''}"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>
        </div>
      </div>`:'';
    el.innerHTML=`<div class="tw"><table><thead><tr><th>Date</th><th>Paper</th><th>Type</th><th>Total</th><th>%</th><th>Phy</th><th>Chem</th><th>Math</th><th>Notes</th><th></th></tr></thead><tbody>${pageTests.length?pageTests.map(t=>`<tr><td style="font-family:'DM Mono',monospace">${fmt(t.date)}</td><td><span class="chip bac">${t.paper?cap(t.paper):'—'}</span></td><td><span class="tt ${t.type==='full'?'tf':'tp'}">${t.type==='full'?'Full':'Partial'}</span></td><td><b>${t.total}</b>/${t.max}</td><td><span class="sp ${sbgGoal(t.total,t.max,'advanced')}">${pct(t.total,t.max)}%</span></td><td style="color:var(--bl)">${t.physics}</td><td style="color:var(--gn)">${t.chemistry}</td><td style="color:var(--am)">${t.maths}</td><td style="color:var(--mu);max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${t.notes||'—'}</td><td style="display:flex;gap:4px"><button class="btn bg2 bsm" onclick="viewTest(${t.id})" title="Details" style="padding:3px 6px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button></td></tr>`).join(''):`<tr><td colspan="10"><div class="empty"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:5px;opacity:.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>No advanced tests yet.</div></td></tr>`}</tbody></table></div>${pagerHTML}`;
  }
}

function renderCmp(){ensureChartJs().then(function(){_renderCmp();}, function(){console.warn('[renderCmp] Chart.js failed to load — rendering without it'); _renderCmp();});}
function _renderCmp(){
  const m=M.cmp;
  const mains=S.tests.filter(t=>t.exam==='mains').sort((a,b)=>a.date.localeCompare(b.date));
  const adv=S.tests.filter(t=>t.exam==='advanced').sort((a,b)=>a.date.localeCompare(b.date));
  const allD=[...new Set([...mains.map(t=>t.date),...adv.map(t=>t.date)])].sort();
  const cmpMACData={labels:allD.map(d=>fmt(d)),datasets:[{label:'Mains',data:allD.map(d=>{const t=mains.find(x=>x.date===d);return t?scoreVal(t,m,null):null;}),borderColor:'#a695ff',pointBackgroundColor:'#a695ff',spanGaps:false,borderWidth:2,tension:.4,pointRadius:3},{label:'Advanced',data:allD.map(d=>{const t=adv.find(x=>x.date===d);return t?scoreVal(t,m,null):null;}),borderColor:'#f472b6',pointBackgroundColor:'#f472b6',spanGaps:false,borderWidth:2,tension:.4,pointRadius:3}]};
  const cmpMACOpts={responsive:true,maintainAspectRatio:false,animation:false,plugins:{legend:{position:'bottom',labels:{color:'#7a7990',font:{size:9},boxWidth:7,padding:7}}},scales:{...sO(),y:{...sO().y,min:0,ticks:{...sO().y.ticks,callback:m==='pct'?v=>v+'%':v=>v}}}};
  if(!uC('cmpMAC',cmpMACData,cmpMACOpts)){CIs['cmpMAC']=new Chart(document.getElementById('cmpMAC').getContext('2d'),{type:'line',data:cmpMACData,options:cmpMACOpts});}
  const partial=S.tests.filter(t=>t.type==='partial'),full=S.tests.filter(t=>t.type==='full');
  const gA=(arr,s)=>{const v=arr.map(t=>scoreVal(t,m,s));return v.length?+(v.reduce((a,b)=>a+b,0)/v.length).toFixed(1):0;};
  const totA=arr=>arr.length?+(arr.reduce((a,b)=>a+scoreVal(b,m,null),0)/arr.length).toFixed(1):0;
  const cmpTCData={labels:['Physics','Chemistry','Maths','Overall'],datasets:[{label:'Partial',data:['physics','chemistry','maths'].map(s=>gA(partial,s)).concat([totA(partial)]),backgroundColor:'#fbbf24',borderRadius:4,barThickness:16},{label:'Full',data:['physics','chemistry','maths'].map(s=>gA(full,s)).concat([totA(full)]),backgroundColor:'#2dd4bf',borderRadius:4,barThickness:16}]};
  const cmpTCOpts={responsive:true,maintainAspectRatio:false,animation:false,plugins:{legend:{position:'bottom',labels:{color:'#7a7990',font:{size:9},boxWidth:7,padding:7}}},scales:{...sO(),y:{...sO().y,min:0,ticks:{...sO().y.ticks,callback:m==='pct'?v=>v+'%':v=>v}}}};
  if(!uC('cmpTC',cmpTCData,cmpTCOpts)){CIs['cmpTC']=new Chart(document.getElementById('cmpTC').getContext('2d'),{type:'bar',data:cmpTCData,options:cmpTCOpts});}
  const sAE=(exam,s)=>{const v=S.tests.filter(t=>t.exam===exam).map(t=>+pct(t[s],t.max/3));return v.length?+(v.reduce((a,b)=>a+b,0)/v.length).toFixed(1):0;};
  const cmpRCData={labels:['Physics','Chemistry','Maths'],datasets:[{label:'Mains',data:['physics','chemistry','maths'].map(s=>sAE('mains',s)),borderColor:'#a695ff',backgroundColor:'rgba(166,149,255,.12)',borderWidth:2,pointBackgroundColor:'#a695ff',pointRadius:4},{label:'Advanced',data:['physics','chemistry','maths'].map(s=>sAE('advanced',s)),borderColor:'#f472b6',backgroundColor:'rgba(244,114,182,.1)',borderWidth:2,pointBackgroundColor:'#f472b6',pointRadius:4}]};
  const cmpRCOpts={responsive:true,maintainAspectRatio:false,animation:false,plugins:{legend:{position:'bottom',labels:{color:'#7a7990',font:{size:9},boxWidth:7,padding:7}}},scales:{r:{grid:{color:'rgba(255,255,255,.07)'},angleLines:{color:'rgba(255,255,255,.07)'},pointLabels:{color:'#7a7990',font:{size:10}},ticks:{color:'#4a4960',backdropColor:'transparent',stepSize:25}}}};
  if(!uC('cmpRC',cmpRCData,cmpRCOpts)){CIs['cmpRC']=new Chart(document.getElementById('cmpRC').getContext('2d'),{type:'radar',data:cmpRCData,options:cmpRCOpts});}
  const allS=S.tests.map(t=>Math.floor(+pct(t.total,t.max)/10)*10);
  const bkts=[0,10,20,30,40,50,60,70,80,90];
  const cmpHCData={labels:bkts.map(b=>b+'-'+(b+10)+'%'),datasets:[{label:'Tests',data:bkts.map(b=>allS.filter(s=>s===b).length),backgroundColor:'rgba(124,106,247,.5)',borderColor:'#7c6af7',borderWidth:1,borderRadius:4,barThickness:20}]};
  const cmpHCOpts={responsive:true,maintainAspectRatio:false,animation:false,plugins:{legend:{display:false}},scales:{...sO(),y:{...sO().y,ticks:{...sO().y.ticks,stepSize:1}}}};
  if(!uC('cmpHC',cmpHCData,cmpHCOpts)){CIs['cmpHC']=new Chart(document.getElementById('cmpHC').getContext('2d'),{type:'bar',data:cmpHCData,options:cmpHCOpts});}
}

function renderHours(){ensureChartJs().then(function(){_renderHours();}, function(){console.warn('[renderHours] Chart.js failed to load — rendering without it'); _renderHours();});}
function _renderHours(){
  F.hours.subj=document.getElementById('hr-subj').value;
  _saveHoursFilter();
  const hrs=getHrs();
  const _dateIndex={};
  S.hours.forEach(h=>{(_dateIndex[h.date]=_dateIndex[h.date]||[]).push(h);});
  const hasMockEver=S.hours.some(h=>(h.mockAnalysis||0)>0);
  const heroMock=document.getElementById('hr-hero-mock');
  if(heroMock)heroMock.style.display=hasMockEver?'':'none';
  const total=hrs.reduce((a,b)=>a+b.total,0);
  const days=[...new Set(hrs.map(h=>h.date))].length;
  const avg=days?(total/days).toFixed(1):0;
  const allD=[...new Set(S.hours.map(h=>h.date))];
  const dT=allD.map(d=>(_dateIndex[d]||[]).reduce((a,b)=>a+b.total,0));
  const maxDay=dT.length?Math.max(...dT).toFixed(1):0;
  const maxDayDate=dT.length?allD[dT.indexOf(Math.max(...dT))]:'—';
  const now=new Date();
  const thisMD=[...new Set(S.hours.filter(h=>{const d=new Date(h.date+'T00:00:00');return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();}).map(h=>h.date))];
  const mAvg=thisMD.length?(thisMD.reduce((s,d)=>s+(_dateIndex[d]||[]).reduce((a,b)=>a+b.total,0),0)/thisMD.length).toFixed(1):0;
  const mockAll=hrs.reduce((a,b)=>a+(b.mockAnalysis||0),0);
  const totalSub=mockAll>0?`incl. ${mockAll.toFixed(1)}h mock analysis`:'in selected period';
  document.getElementById('hr-stats').innerHTML=`
    <div class="prem-stat-card" style="border-color:rgba(124,106,247,.16)">
      <div class="prem-stat-icon-row">
        <div class="prem-stat-ico" style="background:rgba(124,106,247,.12)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a695ff" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M9 3h6"/></svg></div>
      </div>
      <div class="prem-stat-lbl">Total Hours</div>
      <div class="prem-stat-val" style="color:#a695ff">${total.toFixed(1)}<span style="font-size:.9rem;opacity:.7">h</span></div>
      <div class="prem-stat-sub">${totalSub}</div>
      <div class="prem-stat-bar"><div class="prem-stat-bar-fill" style="background:linear-gradient(90deg,#7c6af7,#a695ff);width:100%"></div></div>
    </div>
    <div class="prem-stat-card" style="border-color:rgba(244,114,182,.16)">
      <div class="prem-stat-icon-row">
        <div class="prem-stat-ico" style="background:rgba(244,114,182,.12)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f472b6" stroke-width="2" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div>
      </div>
      <div class="prem-stat-lbl">Avg / Day</div>
      <div class="prem-stat-val" style="color:#f472b6">${avg}<span style="font-size:.9rem;opacity:.7">h</span></div>
      <div class="prem-stat-sub">this month: ${mAvg}h/day</div>
      <div class="prem-stat-bar"><div class="prem-stat-bar-fill" style="background:linear-gradient(90deg,#f472b6,#fb7185);width:100%"></div></div>
    </div>
    <div class="prem-stat-card" style="border-color:rgba(52,211,153,.16)">
      <div class="prem-stat-icon-row">
        <div class="prem-stat-ico" style="background:rgba(52,211,153,.12)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2" stroke-linecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
      </div>
      <div class="prem-stat-lbl">Best Day</div>
      <div class="prem-stat-val" style="color:#34d399">${maxDay}<span style="font-size:.9rem;opacity:.7">h</span></div>
      <div class="prem-stat-sub">${fmt(maxDayDate)}</div>
      <div class="prem-stat-bar"><div class="prem-stat-bar-fill" style="background:linear-gradient(90deg,#34d399,#6ee7b7);width:100%"></div></div>
    </div>
    <div class="prem-stat-card" style="border-color:rgba(251,191,36,.16)">
      <div class="prem-stat-icon-row">
        <div class="prem-stat-ico" style="background:rgba(251,191,36,.12)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
      </div>
      <div class="prem-stat-lbl">Active Days</div>
      <div class="prem-stat-val" style="color:#fbbf24">${days}</div>
      <div class="prem-stat-sub">days logged</div>
      <div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:8px">${Array.from({length:14},(_,i)=>{const d=new Date();d.setDate(d.getDate()-13+i);const dk=d.toISOString().split('T')[0];const active=!!_dateIndex[dk];return`<div title="${dk}" style="width:8px;height:8px;border-radius:2px;background:${active?'#a695ff':'rgba(255,255,255,.06)'}"></div>`;}).join('')}</div>
      <div class="prem-stat-bar"><div class="prem-stat-bar-fill" style="background:linear-gradient(90deg,#fbbf24,#fde68a);width:${Math.min(100,days/30*100)}%"></div></div>
    </div>`;
  const last14=Array.from({length:14},(_,i)=>{const d=new Date();d.setDate(d.getDate()-13+i);return d.toISOString().split('T')[0];});
  const sf=F.hours.subj;const hF=h=>sf==='all'||h.subject===sf;
  const activeCats=HOUR_CATS.filter(c=>c.manual||hasMockEver);
  const hrBCData={labels:last14.map(d=>new Date(d+'T00:00:00').toLocaleDateString('en',{month:'short',day:'numeric'})),datasets:activeCats.map(c=>({label:c.label,data:last14.map(d=>(_dateIndex[d]||[]).filter(hF).reduce((a,b)=>a+(b[c.key]||0),0)),backgroundColor:c.color,stack:'s',borderRadius:2}))};
  const hrBCOpts={responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{color:'#7a7990',font:{size:9},boxWidth:7,padding:7}},tooltip:{callbacks:{title:ctx=>{const idx=ctx[0].dataIndex;const d=last14[idx];const tot=(_dateIndex[d]||[]).filter(hF).reduce((a,b)=>a+b.total,0);return `${new Date(d+'T00:00:00').toLocaleDateString('en',{weekday:'short',month:'short',day:'numeric'})} — ${tot.toFixed(1)}h total`;},label:ctx=>`${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}h`}}},scales:{...sO(),x:{...sO().x,stacked:true,ticks:{...sO().x.ticks,maxRotation:45}},y:{...sO().y,stacked:true,ticks:{...sO().y.ticks,callback:v=>v+'h'}}}};
  if(!uC('hrBC',hrBCData,hrBCOpts)){dc('hrBC');CIs['hrBC']=new Chart(document.getElementById('hrBC').getContext('2d'),{type:'bar',data:hrBCData,options:hrBCOpts});}
  const catTotals=activeCats.map(c=>hrs.reduce((a,b)=>a+(b[c.key]||0),0));
  const catSum=catTotals.reduce((a,b)=>a+b,0)||0.001;
  const catPct=catTotals.map(v=>Math.round(v/catSum*100));
  const hrDCData={labels:activeCats.map((c,i)=>`${c.label} ${catPct[i]}%`),datasets:[{data:catTotals,backgroundColor:activeCats.map(c=>c.color),borderWidth:0,hoverOffset:4}]};
  const hrDCOpts={responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{color:'#7a7990',font:{size:10},boxWidth:9,padding:9}},tooltip:{callbacks:{label:ctx=>`${activeCats[ctx.dataIndex].label}: ${ctx.parsed.toFixed(1)}h (${catPct[ctx.dataIndex]}%)`}}}};
  if(!uC('hrDC',hrDCData,hrDCOpts)){dc('hrDC');CIs['hrDC']=new Chart(document.getElementById('hrDC').getContext('2d'),{type:'doughnut',data:hrDCData,options:hrDCOpts});}
  const dcTitle=document.getElementById('hr-dc-title'),dcSub=document.getElementById('hr-dc-sub'),scSub=document.getElementById('hr-sc-sub');
  if(dcTitle)dcTitle.textContent=hasMockEver?'Study Breakdown':'Lecture / Practice / Revision';
  if(dcSub)dcSub.textContent=hasMockEver?'% of total, incl. mock analysis':'split breakdown';
  if(scSub)scSub.textContent=hasMockEver?'manual study only':'total per subject';
  const hrSCData={labels:['Physics','Chemistry','Maths'],datasets:[{label:'Hours',data:['physics','chemistry','maths'].map(s=>+hrs.filter(h=>h.subject===s).reduce((a,b)=>a+b.total,0).toFixed(1)),backgroundColor:['#60a5fa','#34d399','#fbbf24'],borderRadius:5,barThickness:28}]};
  const hrSCOpts={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{...sO(),y:{...sO().y,ticks:{...sO().y.ticks,callback:v=>v+'h'}}}};
  if(!uC('hrSC',hrSCData,hrSCOpts)){dc('hrSC');CIs['hrSC']=new Chart(document.getElementById('hrSC').getContext('2d'),{type:'bar',data:hrSCData,options:hrSCOpts});}
  
  const months={};
  S.hours.forEach(h=>{if(!hF(h))return;const k=h.date.substring(0,7);if(!months[k]){months[k]={total:0,days:new Set(),max:0};}months[k].total+=h.total;months[k].days.add(h.date);const dayTot=(_dateIndex[h.date]||[]).filter(hF).reduce((a,b)=>a+b.total,0);months[k].max=Math.max(months[k].max,dayTot);});
  const mKeys=Object.keys(months).sort().slice(-6);
  const hrMCData={labels:mKeys.map(k=>{const[y,m2]=k.split('-');return new Date(y,m2-1).toLocaleDateString('en',{month:'short',year:'2-digit'});}),datasets:[{label:'Avg hrs/day',data:mKeys.map(k=>parseFloat((months[k].total/months[k].days.size).toFixed(1))),borderColor:'#a695ff',backgroundColor:'rgba(124,106,247,.08)',borderWidth:2,tension:.4,fill:true,pointRadius:3,pointBackgroundColor:'#a695ff'}]};
  const hrMCOpts={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>parseFloat(ctx.parsed.y.toFixed(1))+'h'}}},scales:{...sO(),y:{...sO().y,ticks:{...sO().y.ticks,callback:v=>parseFloat(v.toFixed(1))+'h'}}}};
  if(!uC('hrMC',hrMCData,hrMCOpts)){dc('hrMC');CIs['hrMC']=new Chart(document.getElementById('hrMC').getContext('2d'),{type:'line',data:hrMCData,options:hrMCOpts});}
  
  const hm=document.getElementById('hr-hm');hm.innerHTML='';
  const colors5=['#141a14','#1a3d2b','#1f6b41','#22a05a','#34d399'];
  Array.from({length:91},(_,i)=>{const d=new Date();d.setDate(d.getDate()-90+i);return d.toISOString().split('T')[0];}).forEach(d=>{
    const tot=(_dateIndex[d]||[]).filter(hF).reduce((a,b)=>a+b.total,0);
    const lvl=tot===0?0:tot<2?1:tot<4?2:tot<6?3:4;
    const cell=document.createElement('div');cell.className='hmc';cell.style.background=colors5[lvl];cell.title=`${fmt(d)}: ${tot.toFixed(1)}h`;hm.appendChild(cell);
  });

  _renderHoursList(S.hours);
  _renderMockBanner(hrs);
}
function _renderMockBanner(hrs){
  const el=document.getElementById('hr-mock-banner');
  if(!el)return;
  const mockEntries=hrs.filter(h=>h.source==='auto');
  if(!mockEntries.length){el.style.display='none';el.innerHTML='';return;}
  const mockHrs=mockEntries.reduce((a,b)=>a+(b.mockAnalysis||0),0);
  const latest=[...mockEntries].sort((a,b)=>b.date.localeCompare(a.date))[0];
  const targetIco=`<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>`;
  el.style.display='';
  el.innerHTML=`
    <div class="prem-mock-banner-ico">${targetIco}</div>
    <div class="prem-mock-banner-body">
      <div class="prem-mock-banner-title">Mock Analysis</div>
      <div class="prem-mock-banner-sub">${mockEntries.length} mock${mockEntries.length===1?'':'s'} analyzed this period · most recent: ${latest.label||'Mock Test'}</div>
    </div>
    <div class="prem-mock-banner-val">${mockHrs.toFixed(1)}<span>h</span></div>`;
}
function _hoursRowHTML(h,i){
  if(h.source==='auto'){
    return `<div class="prem-task source-auto" style="animation-delay:${i*.03}s">
      <div style="flex:1;min-width:0">
        <div class="prem-task-title">Mock Analysis <span style="color:var(--tl);font-weight:700;margin-left:6px">${h.total.toFixed(2)}h</span></div>
        <div class="prem-task-meta">
          <span class="subj-chip" style="background:rgba(45,212,191,.12);color:var(--tl)">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="5" fill="#2dd4bf"/></svg>
            ${h.label||'Mock Test'}
          </span>
          <span class="task-date">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            ${fmt(h.date)}
          </span>
        </div>
      </div>
      <div style="display:flex;gap:2px;margin-left:auto;flex-shrink:0">
        <button class="prem-edit" style="margin-left:0" onclick="editMockHours(${h.id})" title="Edit entry">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg>
        </button>
      </div>
    </div>`;
  }
  const subjColor={physics:'#60a5fa',chemistry:'#34d399',maths:'#fbbf24'};
  const subjChipClass={physics:'subj-phy',chemistry:'subj-che',maths:'subj-mat'};
  const parts=[];
  if(h.lecture)parts.push(`${_lhFmtHM(h.lecture)} Lec`);
  if(h.practice)parts.push(`${_lhFmtHM(h.practice)} Prac`);
  if(h.revision)parts.push(`${_lhFmtHM(h.revision)} Rev`);
  return `<div class="prem-task sub-${h.subject}" style="animation-delay:${i*.03}s">
    <div style="flex:1;min-width:0">
      <div class="prem-task-title">${cap(h.subject)} <span style="color:var(--ac2);font-weight:700;margin-left:4px">${h.total.toFixed(2)}h</span></div>
      <div class="prem-task-meta">
        <span class="subj-chip ${subjChipClass[h.subject]}">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="5" fill="${subjColor[h.subject]}"/></svg>
          ${parts.join(' · ')||'No breakdown'}
        </span>
        <span class="task-date">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          ${fmt(h.date)}
        </span>
      </div>
    </div>
    <div style="display:flex;gap:2px;margin-left:auto;flex-shrink:0">
      <button class="prem-edit" style="margin-left:0" onclick="editHours(${h.id})" title="Edit entry">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg>
      </button>
      <button class="prem-del" style="margin-left:0" onclick="deleteHours(${h.id})" title="Delete entry">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  </div>`;
}
function _hoursEmptyHTML(){
  return `<div class="prem-empty" style="padding:2rem 1rem">
    <div class="prem-empty-orb">
      <div class="prem-empty-ring"></div>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--mu)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M9 3h6"/></svg>
    </div>
    <div class="prem-empty-title">No entries yet</div>
    <div class="prem-empty-sub">Log your study hours to see them here — you can edit or delete any entry later.</div>
  </div>`;
}
function _renderHoursList(hrs){
  const list=document.getElementById('hr-list');
  if(!list)return;
  const PREVIEW_LIMIT=5;
  const MODAL_LIMIT=30;
  // hrs is now always S.hours (full history) so "Recent" never misses old
  // entries — but that means this sort would otherwise re-run over your
  // *entire* logging history on every render, forever growing. We only ever
  // display the top MODAL_LIMIT anyway, so pre-filter to a recent window
  // first (generous enough that any reasonably active user has way more
  // than MODAL_LIMIT entries in it) and sort just that — falls back to a
  // full sort only in the rare case someone's had a long gap with no logs.
  const RECENT_WINDOW_DAYS=120;
  const cutoff=(()=>{const d=new Date();d.setDate(d.getDate()-RECENT_WINDOW_DAYS);return d.toISOString().split('T')[0];})();
  let candidates=hrs.filter(h=>h.date>=cutoff);
  if(candidates.length<MODAL_LIMIT && hrs.length>candidates.length) candidates=hrs;
  const sorted=candidates.sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id);

  if(!sorted.length){
    list.innerHTML=_hoursEmptyHTML();
  } else {
    const previewRows=sorted.slice(0,PREVIEW_LIMIT).map((h,i)=>_hoursRowHTML(h,i)).join('');
    const viewMoreBtn=sorted.length>PREVIEW_LIMIT
      ? `<button class="prem-view-more-btn" onclick="openM('allHours')">
          View More
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>`
      : '';
    list.innerHTML=previewRows+viewMoreBtn;
  }

  const listAll=document.getElementById('hr-list-all');
  if(listAll){
    if(!sorted.length){
      listAll.innerHTML=_hoursEmptyHTML();
    } else {
      const allRows=sorted.slice(0,MODAL_LIMIT).map((h,i)=>_hoursRowHTML(h,i)).join('');
      const footer=sorted.length>MODAL_LIMIT
        ? `<div style="text-align:center;padding:.7rem 0 .1rem;font-size:11px;color:var(--mu2)">Showing latest ${MODAL_LIMIT} of ${sorted.length} entries in this period</div>`
        : '';
      listAll.innerHTML=allRows+footer;
    }
  }
}

function renderTodo(){
  
  const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);const yd=yesterday.toISOString().split('T')[0];
  S.todos=S.todos.filter(t=>!(t.done&&t.doneDate&&t.doneDate<=yd));
  save();
  let todos=[...S.todos];
  const total=todos.length,done=todos.filter(t=>t.done).length,pending=todos.filter(t=>!t.done).length;
  const todayDue=todos.filter(t=>!t.done&&t.due===td()).length;
  const pct=total?Math.round(done/total*100):0;
  const circumference=2*Math.PI*18;
  const offset=circumference-(pct/100)*circumference;
  
  document.getElementById('td-stats').innerHTML=`
    <div class="prem-stat">
      <div class="prem-stat-glow" style="background:rgba(248,113,113,.7)"></div>
      <div class="prem-stat-label">Pending</div>
      <div class="prem-stat-val" style="color:var(--rd)">${pending}</div>
      <div class="prem-stat-sub">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--rd)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        tasks remaining
      </div>
      <div class="prem-stat-icon"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--rd)" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
    </div>
    <div class="prem-stat">
      <div class="prem-stat-glow" style="background:rgba(251,191,36,.7)"></div>
      <div class="prem-stat-label">Due Today</div>
      <div class="prem-stat-val" style="color:var(--am)">${todayDue}</div>
      <div class="prem-stat-sub">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--am)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        need attention
      </div>
      <div class="prem-stat-icon"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--am)" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
    </div>
    <div class="prem-stat">
      <div class="prem-stat-glow" style="background:rgba(52,211,153,.7)"></div>
      <div class="prem-stat-label">Completed</div>
      <div class="prem-stat-val" style="color:var(--gn)">${done}</div>
      <div class="prem-stat-sub">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--gn)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        done today
      </div>
      <div class="prem-stat-icon"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--gn)" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
    </div>
    <div class="prem-stat" style="display:flex;align-items:center;gap:12px">
      <div class="prem-stat-glow" style="background:rgba(124,106,247,.7)"></div>
      <div style="flex-shrink:0">
        <svg class="stat-ring" width="44" height="44" viewBox="0 0 44 44">
          <circle class="stat-ring-bg" cx="22" cy="22" r="18"/>
          <circle class="stat-ring-fill" cx="22" cy="22" r="18"
            stroke="var(--ac2)"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${offset}"/>
        </svg>
      </div>
      <div>
        <div class="prem-stat-label">Completion</div>
        <div class="prem-stat-val" style="color:var(--ac2);font-size:1.6rem">${total?pct+'%':'—'}</div>
        <div class="prem-stat-sub" style="margin-top:3px">${done}/${total} tasks</div>
      </div>
    </div>`;
  if(F.todo.subj!=='all')todos=todos.filter(t=>t.subject===F.todo.subj);
  if(F.todo.status==='pending')todos=todos.filter(t=>!t.done);
  else if(F.todo.status==='done')todos=todos.filter(t=>t.done);
  todos.sort((a,b)=>{if(a.done!==b.done)return a.done?1:-1;const p={high:0,medium:1,low:2};return(p[a.priority]||1)-(p[b.priority]||1);});

  
  const listCount=todos.length;
  const headerHtml=listCount>0?`<div class="prem-section-head" style="margin-bottom:8px">
    <div class="prem-section-title">${F.todo.status==='done'?'Completed':'Active Tasks'}</div>
    <span class="prem-count-badge">${listCount}</span>
  </div>`:'';

  document.getElementById('td-list').innerHTML=listCount?headerHtml+todos.map((t,i)=>{
    const dp=daysPending(t.addedDate);
    const subjClass=t.subject==='physics'?'sub-physics':t.subject==='chemistry'?'sub-chemistry':'sub-maths';
    const subjChipClass=t.subject==='physics'?'subj-phy':t.subject==='chemistry'?'subj-che':'subj-mat';
    const subjSvgColor=t.subject==='physics'?'#60a5fa':t.subject==='chemistry'?'#34d399':'#fbbf24';
    const prioClass=t.priority==='high'?'prio-high':t.priority==='medium'?'prio-medium':'prio-low';
    const prioColor=t.priority==='high'?'#f87171':t.priority==='medium'?'#fbbf24':'#60a5fa';
    const prioDot=`<svg width="6" height="6" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="${prioColor}"/></svg>`;
    const calIcon=`<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
    const clockIcon=`<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--rd)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
    const noteIcon=`<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
    const doneIcon=`<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--gn)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    return`<div class="prem-task ${subjClass}${t.done?' done-task':''}" style="animation-delay:${i*.05}s">
      <div class="prem-check ${t.done?'checked':''}" onclick="toggleTodoDone(${t.id})">
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <div style="flex:1;min-width:0">
        <div class="prem-task-title">${t.title}</div>
        <div class="prem-task-meta">
          <span class="subj-chip ${subjChipClass}">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="5" fill="${subjSvgColor}"/></svg>
            ${cap(t.subject)}
          </span>
          <span class="prio-badge ${prioClass}">${prioDot}${cap(t.priority)}</span>
          ${t.due?`<span class="task-date ${t.due===td()&&!t.done?'overdue':''}">${calIcon}${fmt(t.due)}</span>`:''}
          ${!t.done&&dp>0?`<span class="task-pending-age">${clockIcon}${dp}d old</span>`:''}
          ${t.details?`<span class="task-note">${noteIcon}${t.details}</span>`:''}
          ${t.done?`<span class="task-date done-date">${doneIcon}done</span>`:''}
        </div>
      </div>
      <button class="prem-del" onclick="deleteTodo(${t.id})" title="Delete task">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>`;
  }).join(''):`<div class="prem-empty">
    <div class="prem-empty-orb">
      <div class="prem-empty-ring"></div>
      ${F.todo.status==='pending'?
        `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gn)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`:
        `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--mu)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`
      }
    </div>
    <div class="prem-empty-title">${F.todo.status==='pending'?'All caught up!':'No completed tasks'}</div>
    <div class="prem-empty-sub">${F.todo.status==='pending'?'All tasks are done for today. Great work!':'Complete some tasks to see them here.'}</div>
  </div>`;
  updateBadges();
}

function renderBacklog(){
  const pending=S.backlogs.filter(b=>!b.done).length;
  document.getElementById('bl-total').textContent=pending;
  document.getElementById('bl-streak').textContent=S.backlogStreak||0;
  document.getElementById('bl-best').textContent=S.backlogBestStreak||0;
  document.getElementById('bl-today').textContent=S.backlogs.filter(b=>b.done&&b.doneDate===td()).length;
  const total=S.backlogs.length,done=S.backlogs.filter(b=>b.done).length;
  document.getElementById('bl-rate').textContent=total?Math.round(done/total*100)+'%':'—';

  
  const subjs=['physics','chemistry','maths'];
  const subjColors={'physics':'#60a5fa','chemistry':'#34d399','maths':'#fbbf24'};
  const subjBgColors={'physics':'rgba(96,165,250,.12)','chemistry':'rgba(52,211,153,.12)','maths':'rgba(251,191,36,.1)'};
  const subjIcons={
    physics:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>`,
    chemistry:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6v11l3.5 6H5.5L9 14V3z"/><line x1="6" y1="7" x2="9" y2="7"/></svg>`,
    maths:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`
  };
  const fireIcon=`<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`;
  document.getElementById('bl-subj-streaks').innerHTML=subjs.map(s=>{
    const cnt=S.backlogs.filter(b=>b.subject===s&&!b.done).length;
    const streak=S.subjStreaks?.[s]||0,best=S.subjBestStreaks?.[s]||0;
    const color=subjColors[s],bg=subjBgColors[s];
    return`<div class="bl-subj-card">
      <div class="bl-subj-orb" style="background:${bg};color:${color}">
        ${subjIcons[s]}
      </div>
      <div style="font-size:11.5px;font-weight:700;color:${color};margin-bottom:4px">${cap(s)}</div>
      <div class="bl-subj-count" style="color:${cnt>0?'var(--rd)':'var(--gn)'}">${cnt}</div>
      <div class="bl-subj-label">pending</div>
      <div class="bl-subj-streak" style="color:var(--mu)">
        <span style="color:${color}">${fireIcon}</span>
        ${streak}d &nbsp;&bull;&nbsp; Best ${best}d
      </div>
    </div>`;
  }).join('');

  
  const celebEl=document.getElementById('bl-celebrate');
  if(pending===0&&S.backlogs.length>0){
    celebEl.style.display='';
    celebEl.innerHTML=`<div class="prem-celebrate" style="position:relative;overflow:hidden">
      <div class="celebrate-ring">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gn)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </div>
      <div class="celebrate-title">Zero Backlogs!</div>
      <div class="celebrate-sub">All caught up. Keep the streak alive!</div>
    </div>`;
  } else {
    celebEl.style.display='none';
    celebEl.innerHTML='';
  }

  let list=[...S.backlogs];
  if(F.backlog.subj!=='all')list=list.filter(b=>b.subject===F.backlog.subj);
  if(F.backlog.status==='pending')list=list.filter(b=>!b.done);
  else if(F.backlog.status==='done')list=list.filter(b=>b.done);
  list.sort((a,b)=>{if(a.done!==b.done)return a.done?1:-1;const p={high:0,medium:1,low:2};return(p[a.priority]||1)-(p[b.priority]||1);});

  const listCount=list.length;
  const headerHtml=listCount>0?`<div class="prem-section-head" style="margin-bottom:8px">
    <div class="prem-section-title">${F.backlog.status==='done'?'Cleared Items':'Backlog Queue'}</div>
    <span class="prem-count-badge">${listCount}</span>
  </div>`:'';

  document.getElementById('bl-list').innerHTML=listCount?headerHtml+list.map((b,i)=>{
    const subjClass=b.subject==='physics'?'sub-physics':b.subject==='chemistry'?'sub-chemistry':'sub-maths';
    const subjChipClass=b.subject==='physics'?'subj-phy':b.subject==='chemistry'?'subj-che':'subj-mat';
    const subjSvgColor=b.subject==='physics'?'#60a5fa':b.subject==='chemistry'?'#34d399':'#fbbf24';
    const prioClass=b.priority==='high'?'prio-high':b.priority==='medium'?'prio-medium':'prio-low';
    const prioColor=b.priority==='high'?'#f87171':b.priority==='medium'?'#fbbf24':'#60a5fa';
    const prioDot=`<svg width="6" height="6" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="${prioColor}"/></svg>`;
    const calIcon=`<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
    const noteIcon=`<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
    const doneIcon=`<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--gn)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    return`<div class="prem-task ${subjClass}${b.done?' done-task':''}" style="animation-delay:${i*.05}s">
      <div class="prem-check ${b.done?'checked':''}" onclick="toggleBacklogDone(${b.id})">
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <div style="flex:1;min-width:0">
        <div class="prem-task-title">${b.title}</div>
        <div class="prem-task-meta">
          <span class="subj-chip ${subjChipClass}">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="5" fill="${subjSvgColor}"/></svg>
            ${cap(b.subject)}
          </span>
          <span class="prio-badge ${prioClass}">${prioDot}${cap(b.priority)}</span>
          ${b.due?`<span class="task-date">${calIcon}${fmt(b.due)}</span>`:''}
          ${b.details?`<span class="task-note">${noteIcon}${b.details}</span>`:''}
          ${b.done&&b.doneDate?`<span class="task-date done-date">${doneIcon}${fmt(b.doneDate)}</span>`:''}
        </div>
      </div>
      <button class="prem-del" onclick="deleteBacklog(${b.id})" title="Delete">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>`;
  }).join(''):`<div class="prem-empty">
    <div class="prem-empty-orb">
      <div class="prem-empty-ring"></div>
      ${F.backlog.status==='pending'?
        `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gn)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`:
        `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--mu)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`
      }
    </div>
    <div class="prem-empty-title">${F.backlog.status==='pending'?'Backlog clear!':'Nothing here yet'}</div>
    <div class="prem-empty-sub">${F.backlog.status==='pending'?'No pending items. Streak intact!':'Clear some backlogs to see them here.'}</div>
  </div>`;
  updateBadges();
}

const unitExpanded={physics:{},chemistry:{},maths:{}};

const SUBJ_UNITS={
  physics:['Mechanics 1','Mechanics 2','Thermodynamics','Electromagnetism','Optics','Modern Physics','Miscellaneous Physics'],
  chemistry:['Physical Chemistry','Inorganic Chemistry','Organic Chemistry'],
  maths:['Algebra','Trigonometry','Coordinate Geometry','Calculus','Vectors & 3D']
};

const UNIT_COLORS={
  physics:{'Mechanics 1':'#60a5fa','Mechanics 2':'#818cf8','Thermodynamics':'#f97316','Electromagnetism':'#a695ff','Optics':'#34d399','Modern Physics':'#f472b6','Miscellaneous Physics':'#94a3b8'},
  chemistry:{'Physical Chemistry':'#60a5fa','Inorganic Chemistry':'#fbbf24','Organic Chemistry':'#34d399'},
  maths:{'Algebra':'#a695ff','Trigonometry':'#f472b6','Coordinate Geometry':'#34d399','Calculus':'#60a5fa','Vectors & 3D':'#fbbf24'}
};

function toggleAdvInclude(checked){
  F.sylIncludeAdv=checked;
  renderSyl(); 
}

function fltSylClass(v,el){
  F.sylClass=v;
  document.querySelectorAll('[data-group="syl-class"]').forEach(e=>e.classList.remove('active'));
  el.classList.add('active');
  renderSylList();
}

function fltSyl(v,el){
  F.syl=v; F.sylClass='all';
  document.querySelectorAll('[data-group="syl-subj"]').forEach(e=>e.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('[data-group="syl-class"]').forEach((e,i)=>e.classList.toggle('active',i===0));
  renderSylList();
}

function toggleSylUnit(subj,unit){
  if(!unitExpanded[subj])unitExpanded[subj]={};
  
  unitExpanded[subj][unit]=!unitExpanded[subj][unit];
  renderSylList();
}

function renderSyl(){
  const includeAdv = !!F.sylIncludeAdv; 
  const subjs=['physics','chemistry','maths'];

  
  const allChs=subjs.flatMap(s=>(S.syllabus[s]||[]).filter(c=>includeAdv||!c.adv));
  const totalChs=allChs.length;
  const completeChs=allChs.filter(c=>c.theory&&c.practice).length;
  const theoryOnly=allChs.filter(c=>c.theory&&!c.practice).length;
  const practiceOnly=allChs.filter(c=>!c.theory&&c.practice).length;
  const notStarted=allChs.filter(c=>!c.theory&&!c.practice).length;
  const overallPct=totalChs?Math.round(completeChs/totalChs*100):0;
  const C=2*Math.PI*38;
  const off=C-(overallPct/100)*C;

  const subjData=subjs.map(s=>{
    const chs=(S.syllabus[s]||[]).filter(c=>includeAdv||!c.adv);
    const done=chs.filter(c=>c.theory&&c.practice).length;
    const pct=chs.length?Math.round(done/chs.length*100):0;
    return{s,done,total:chs.length,pct};
  });
  const sc2=(s)=>s==='physics'?'#60a5fa':s==='chemistry'?'#34d399':'#fbbf24';

  document.getElementById('syl-overall-card').innerHTML=`
    <div class="syl-hero">
      <div class="syl-hero-top">
        <div class="syl-hero-ring">
          <svg width="96" height="96" viewBox="0 0 96 96">
            <defs>
              <linearGradient id="sylRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#7c6af7"/>
                <stop offset="100%" stop-color="#f472b6"/>
              </linearGradient>
            </defs>
            <circle cx="48" cy="48" r="38" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="7"/>
            <circle cx="48" cy="48" r="38" fill="none" stroke="url(#sylRingGrad)" stroke-width="7"
              stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${off}"
              transform="rotate(-90 48 48)" style="transition:stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)"/>
          </svg>
          <div class="syl-hero-pct">${overallPct}%<span>done</span></div>
        </div>
        <div class="syl-hero-stats">
          <div class="syl-hero-stat"><div class="syl-hero-stat-num" style="color:var(--gn)">${completeChs}</div><div class="syl-hero-stat-lbl">Complete</div></div>
          <div class="syl-hero-stat"><div class="syl-hero-stat-num" style="color:var(--am)">${theoryOnly+practiceOnly}</div><div class="syl-hero-stat-lbl">Partial</div></div>
          <div class="syl-hero-stat"><div class="syl-hero-stat-num" style="color:var(--mu)">${notStarted}</div><div class="syl-hero-stat-lbl">Pending</div></div>
          <div class="syl-hero-stat"><div class="syl-hero-stat-num" style="color:var(--ac2)">${totalChs}</div><div class="syl-hero-stat-lbl">Total</div></div>
        </div>
      </div>
      <div class="syl-hero-bar-wrap">
        <div class="syl-hero-bar-label"><span>Overall completion${includeAdv?'':' <span style="font-size:9px;color:var(--mu);font-weight:400">(Mains only)</span>'}</span><span style="font-weight:600;color:var(--ac2)">${completeChs}/${totalChs}</span></div>
        <div class="syl-hero-bar"><div class="syl-hero-bar-fill" style="width:${overallPct}%"></div></div>
      </div>
      <div class="syl-subj-bars">
        ${subjData.map(d=>`<div class="syl-subj-bar-item">
          <div class="syl-subj-bar-hd">
            <span class="syl-subj-bar-name" style="color:${sc2(d.s)}">${cap(d.s)}</span>
            <span class="syl-subj-bar-pct" style="color:${sc2(d.s)}">${d.pct}%</span>
          </div>
          <div class="syl-subj-bar-track"><div class="syl-subj-bar-fill" style="width:${d.pct}%;background:${sc2(d.s)}"></div></div>
          <div style="font-size:9.5px;color:var(--mu);margin-top:3px">${d.done}/${d.total} chapters</div>
        </div>`).join('')}
      </div>
    </div>`;

  renderSylList();
}

function chapterItemHTML(c,subjClass){
  const complete=c.theory&&c.practice;
  const theoryIcon=`<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`;
  const practiceIcon=`<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`;
  const doneIcon=`<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--gn)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
  const starIcon=`<svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  const idx=c.id%100||c.id;
  const qCount=(S.practiceLogs||[]).filter(p=>p.chapterId===c.id).reduce((a,b)=>a+b.questions,0);
  const isCustom=isCustomChapter(c);
  return`<div class="syl-chapter ${subjClass}${complete?' ch-complete':''}${c.adv?' ch-adv-only':''}">
    <div class="ch-num">${isCustom?'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>':(idx<=9?'0'+idx:idx)}</div>
    <div class="ch-info">
      <div class="ch-name">${c.name}</div>
      <div class="ch-meta">
        <span class="ch-class-badge ch-class-${c.class||'11'}">Class ${c.class||'11'}</span>
        ${c.adv?`<span class="ch-adv-badge">${starIcon}ADV</span>`:''}
        ${isCustom?`<span class="ch-adv-badge" style="background:rgba(244,114,182,.12);color:#f472b6;border-color:rgba(244,114,182,.25)">Custom</span>`:''}
        ${complete?`<span class="ch-done-badge">${doneIcon}Complete</span>`:''}
        ${qCount>0?`<span class="ch-qcount-badge">${qCount} Qs practiced</span>`:''}
      </div>
    </div>
    <div class="ch-toggles">
      <button class="ch-toggle tog-theory${c.theory?' tog-on':''}" onclick="toggleChapter(${c.id},'theory')">
        <div class="ch-toggle-dot"></div>${theoryIcon}Theory
      </button>
      <div class="ch-practice-wrap">
        <button class="ch-toggle tog-practice${c.practice?' tog-on':''}" onclick="toggleChapter(${c.id},'practice')">
          <div class="ch-toggle-dot"></div>${practiceIcon}Practice
        </button>
        <button class="ch-quick-log" onclick="event.stopPropagation();openPracticeLog(${c.id})" title="Log practice questions">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
        ${isCustom?`<button class="ch-quick-log" onclick="event.stopPropagation();deleteChapter(${c.id})" title="Remove this custom chapter" style="color:var(--rd)">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
        </button>`:''}
      </div>
    </div>
  </div>`;
}

function renderSylList(){
  const s=F.syl||'physics';
  const includeAdv=!!F.sylIncludeAdv;
  const knownUnits=SUBJ_UNITS[s]||[];
  const CUSTOM_UNIT='Custom Chapters';
  const units=[...knownUnits,CUSTOM_UNIT];
  const unitColors={...(UNIT_COLORS[s]||{}),[CUSTOM_UNIT]:'#f472b6'};
  const subjChClass=s==='physics'?'phy-ch':s==='chemistry'?'che-ch':'mat-ch';

  let allChs=S.syllabus[s]||[];
  
  allChs.forEach(c=>{if(!c.class)c.class=isCustomChapter(c)?'11':(c.id<300?c.id<=216:c.id<=314)?'11':'12';});
  
  const advFiltered=includeAdv?allChs:allChs.filter(c=>!c.adv);
  
  const visibleChs=(!F.sylClass||F.sylClass==='all')?advFiltered:advFiltered.filter(c=>c.class===F.sylClass);

  let html='';
  units.forEach(unit=>{
    const chs=unit===CUSTOM_UNIT
      ? visibleChs.filter(c=>!knownUnits.includes(c.unit))
      : visibleChs.filter(c=>c.unit===unit);
    if(!chs.length)return;
    const done=chs.filter(c=>c.theory&&c.practice).length;
    const pct=chs.length?Math.round(done/chs.length*100):0;
    const col=unitColors[unit]||'#a695ff';
    const isOpen=!!unitExpanded[s][unit]; 
    html+=`<div class="syl-unit">
      <div class="syl-unit-hd${isOpen?' open':''}" onclick="toggleSylUnit('${s}','${unit.replace(/'/g,"\\'")}')">
        <div class="syl-unit-hd-left">
          <div class="syl-unit-dot" style="background:${col}"></div>
          <div>
            <div class="syl-unit-title" style="color:${col}">${unit}</div>
            <div class="syl-unit-meta">${chs.length} chapters · ${done}/${chs.length} done</div>
          </div>
        </div>
        <div class="syl-unit-hd-right">
          <div class="syl-unit-prog-wrap">
            <div class="syl-unit-prog-bar"><div class="syl-unit-prog-fill" style="width:${pct}%;background:${col}"></div></div>
            <span class="syl-unit-pct" style="color:${col}">${pct}%</span>
          </div>
          <svg class="syl-unit-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>
      <div class="syl-unit-body${isOpen?'':' collapsed'}">
        <div class="syl-unit-body-inner" style="border-color:${col}20">
          ${chs.map(c=>chapterItemHTML(c,subjChClass)).join('')}
        </div>
      </div>
    </div>`;
  });

  document.getElementById('syl-list').innerHTML=html||`<div class="prem-empty"><div class="prem-empty-orb"><div class="prem-empty-ring"></div>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--mu)" stroke-width="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></div>
    <div class="prem-empty-title">No chapters</div><div class="prem-empty-sub">Try enabling Include ADV above.</div></div>`;
}

function toggleChemSplit(e){
  e.stopPropagation();
  const rows=document.getElementById('chem-split-rows');
  const chevron=document.getElementById('chem-split-chevron');
  if(!rows)return;
  const open=rows.style.display==='none';
  rows.style.display=open?'block':'none';
  if(chevron)chevron.style.transform=open?'rotate(180deg)':'rotate(0deg)';
}

function toggleSidebar(){
  if(window.innerWidth>768){
    const sb=document.getElementById('sidebar');
    const ov=document.getElementById('sb-overlay');
    const open=sb.classList.toggle('open');
    ov.classList.toggle('open',open);
  }
}
function closeSidebar(){
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sb-overlay')?.classList.remove('open');
  document.body.classList.remove('sb-open');
}

function openAvMenu(){
  const overlay=document.getElementById('avMenuOverlay');
  const menu=document.getElementById('avMenu');
  const btn=document.getElementById('mob-profile-btn');
  if(!overlay||!menu)return;
  const name=document.getElementById('sb-username')?.textContent||'JEETrack';
  const email=document.getElementById('sb-email')?.textContent||'';
  const initials=document.getElementById('mob-avatar')?.textContent||'A';
  const elName=document.getElementById('avMenuName');
  const elEmail=document.getElementById('avMenuEmail');
  const elInit=document.getElementById('avMenuInitials');
  if(elName)elName.textContent=name;
  if(elEmail)elEmail.textContent=email;
  if(elInit)elInit.textContent=initials;
  const srcImg=document.getElementById('mob-avatar-img');
  const menuImg=document.getElementById('avMenuImg');
  if(srcImg&&menuImg){
    if(srcImg.style.display!=='none'&&srcImg.src){
      menuImg.src=srcImg.src;menuImg.style.display='block';
      if(elInit)elInit.style.display='none';
    } else {
      menuImg.style.display='none';
      if(elInit)elInit.style.display='';
    }
  }
  const tag=document.getElementById('avMenuTag');
  if(tag){const plan=localStorage.getItem('jt_plan')||'Free';tag.textContent=plan;}
  
  try {
    
    const now = new Date();
    const monthHrs = (S.hours||[])
      .filter(h=>{ const d=new Date(h.date); return d.getFullYear()===now.getFullYear()&&d.getMonth()===now.getMonth(); })
      .reduce((acc,h)=>acc+(+h.lecture||0)+(+h.practice||0)+(+h.revision||0)+(+h.mockAnalysis||0),0);
    const hrsEl = document.getElementById('avStatHrs');
    if(hrsEl) hrsEl.textContent = monthHrs>0 ? (Number.isInteger(monthHrs)?monthHrs:monthHrs.toFixed(1))+'h' : '—';
    
    const mainTests = (S.tests||[]).filter(t=>t.exam==='mains').sort((a,b)=>b.date.localeCompare(a.date));
    const scoreEl = document.getElementById('avStatScore');
    if(scoreEl){
      if(mainTests.length){ const lt=mainTests[0]; scoreEl.textContent=lt.total+(lt.max?'/'+lt.max:''); }
      else scoreEl.textContent='—';
    }
    
    const stEl = document.getElementById('avStatStreak');
    if(stEl){ const streak=S.backlogStreak||0; stEl.textContent = streak>0 ? streak+'d' : '—'; }
  } catch(e){}
  overlay.classList.add('open');
  menu.classList.add('open');
  if(btn)btn.classList.add('av-open');
}
function closeAvMenu(){
  document.getElementById('avMenuOverlay')?.classList.remove('open');
  document.getElementById('avMenu')?.classList.remove('open');
  document.getElementById('mob-profile-btn')?.classList.remove('av-open');
}

const MOB_PAGE_TITLES = {
  overview:'Dashboard', mains:'JEE Mains', advanced:'JEE Advanced',
  compare:'Compare', hours:'Study Hours', todo:'To-Do',
  backlog:'Backlog', syllabus:'Syllabus', practice:'Practice Log', insights:'AI Insights', settings:'Settings',
  'tests-choice':'Tests'
};
function updateMobTopbarTitle(page, sub){
  const el = document.getElementById('mob-page-title');
  const subEl = document.getElementById('mob-page-sub');
  if(!el) return;
  
  const PAGE_ICONS = {
    todo: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ac2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
    backlog: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--am)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17z"/></svg>`,
    syllabus: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ac2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
    practice: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gn)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M9 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3"/><path d="m9 14 2 2 4-4"/></svg>`,
    hours: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a695ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M9 3h6"/></svg>`,
    insights: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ac2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.14z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.14z"/></svg>`,
    mains: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ac2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M4 7h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>`,
    advanced: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ac2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
    compare: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ac2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    settings: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ac2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    'tests-choice': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ac2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M4 7h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"/></svg>`,
  };
  let icon = '';
  if(page==='overview'){
    el.innerHTML = 'JEE<span>Track</span>';
    el.style.cssText = '';
  } else {
    const title = MOB_PAGE_TITLES[page] || page;
    icon = PAGE_ICONS[page] || '';
    const words = title.trim().split(' ');
    let coloredTitle;
    if(words.length === 1){
      coloredTitle = `<span class="tt-plain">${words[0]}</span>`;
    } else {
      coloredTitle = `<span class="tt-plain">${words[0]}</span> <span>${words.slice(1).join(' ')}</span>`;
    }
    el.innerHTML = icon
      ? `<span style="display:inline-flex;align-items:center;gap:7px">${icon}${coloredTitle}</span>`
      : coloredTitle;
    el.style.cssText = 'background:none;-webkit-text-fill-color:unset';
  }
  if(subEl){
    if(sub){
      subEl.textContent = sub;
      subEl.style.display = '';
      
      subEl.style.paddingLeft = icon ? '23px' : '0';
    } else {
      subEl.textContent = '';
      subEl.style.display = 'none';
      subEl.style.paddingLeft = '0';
    }
  }
}
function mobNavTo(page, el){
  
  const subEl = document.getElementById('mob-page-sub');
  if(subEl && page !== 'settings'){ subEl.textContent=''; subEl.style.display='none'; }
  
  if(page === 'mains' && window.innerWidth <= 768){
    _setMobActive(el);
    closeMobDrawer();
    showMobTestsChoice();
    return;
  }
  nav(page);
  _setMobActive(el);
  closeMobDrawer();
  updateMobTopbarTitle(page);
}
function syncMobNav(page){
  
  const navMap={overview:'overview',mains:'mains',advanced:'mains',compare:'mains',hours:'hours',insights:'insights',todo:'todo-tab',backlog:'todo-tab',syllabus:'todo-tab',practice:'todo-tab',settings:'todo-tab'};
  _mobNavItems().forEach(b=>b.classList.remove('active'));
  const tab = navMap[page];
  if(tab && tab !== 'todo-tab'){
    const btn = _mobNavItems().find(b=>b.dataset.page===tab);
    if(btn) btn.classList.add('active');
  } else if(!tab || tab === 'todo-tab') {
    document.getElementById('mob-more-btn')?.classList.add('active');
  }
  
  const testPages = ['mains','advanced','compare'];
  if(testPages.includes(page)){
    updateMobTopbarTitle('tests-choice');
  } else {
    updateMobTopbarTitle(page);
  }
}

function showMobTestsChoice(){
  history.pushState({page:'tests'}, '', '/tests');
  document.title = 'JEETrack — Tests';
  
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  
  const choice = document.getElementById('mob-tests-choice-page');
  if(choice){
    choice.style.display = 'block';
    choice.classList.add('active');
  }
  updateMobTopbarTitle('tests-choice');
}
function mobGoTest(page){
  const choice = document.getElementById('mob-tests-choice-page');
  if(choice){ choice.style.display='none'; choice.classList.remove('active'); }
  nav(page);
  
  _mobNavItems().forEach(b=>b.classList.remove('active'));
  const mainsBtn = _mobNavItems().find(b=>b.dataset.page==='mains');
  if(mainsBtn) mainsBtn.classList.add('active');
  
  updateMobTopbarTitle('tests-choice');
}

function mobSettingsTab(id, btn){
  
  const sidebarBtn = document.querySelector(`.settings-nav-item[onclick*="'${id}'"]`);
  showSettingsPanel(id, sidebarBtn);
  
  document.querySelectorAll('.mob-settings-tab').forEach(b=>b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  
  const el = document.getElementById('mob-page-title');
  if(el && window.innerWidth<=768){
    const settingsIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ac2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;
    const names={profile:'Profile',study:'Study Info',goals:'Goals',appearance:'Appearance',alerts:'Alerts',data:'Data',account:'Account',feedback:'Feedback',contact:'Contact'};
    const sectionName = names[id] || 'Settings';
    const words = sectionName.trim().split(' ');
    let coloredTitle;
    if(words.length === 1){
      coloredTitle = `<span class="tt-plain">${words[0]}</span>`;
    } else {
      coloredTitle = `<span class="tt-plain">${words[0]}</span> <span>${words.slice(1).join(' ')}</span>`;
    }
    el.innerHTML = `<span style="display:inline-flex;align-items:center;gap:7px">${settingsIcon}${coloredTitle}</span>`;
    el.style.cssText = 'background:none;-webkit-text-fill-color:unset';
  }
}

function openMobDrawer(){
  
  const todoBadge = document.getElementById('nb-todo');
  const drawerTodo = document.getElementById('drawer-badge-todo');
  if(todoBadge && drawerTodo){
    const show = todoBadge.style.display !== 'none';
    drawerTodo.style.display = show ? '' : 'none';
    drawerTodo.textContent = todoBadge.textContent;
  }
  const backlogBadge = document.getElementById('nb-backlog');
  const drawerBacklog = document.getElementById('drawer-badge-backlog');
  if(backlogBadge && drawerBacklog){
    const show = backlogBadge.style.display !== 'none';
    drawerBacklog.style.display = show ? '' : 'none';
    drawerBacklog.textContent = backlogBadge.textContent;
  }
  const ov = document.getElementById('mob-drawer-overlay');
  const dr = document.getElementById('mob-drawer');
  if(ov){ ov.style.display='block'; requestAnimationFrame(()=>ov.classList.add('open')); }
  if(dr){ dr.classList.add('open'); }
  document.body.style.overflow='hidden';
}
function closeMobDrawer(){
  const ov = document.getElementById('mob-drawer-overlay');
  const dr = document.getElementById('mob-drawer');
  if(ov){ ov.classList.remove('open'); setTimeout(()=>{ if(!ov.classList.contains('open')) ov.style.display='none'; },300); }
  if(dr) dr.classList.remove('open');
  document.body.style.overflow='';
}
function drawerNav(page){
  nav(page);
  closeMobDrawer();
  _setMobActive(null);
  document.getElementById('mob-more-btn')?.classList.add('active');
  updateMobTopbarTitle(page);
}

(function(){
  let startY=0,dragging=false;
  document.addEventListener('touchstart',e=>{
    const dr=document.getElementById('mob-drawer');
    if(dr&&dr.classList.contains('open')){ startY=e.touches[0].clientY; dragging=true; }
  },{passive:true});
  document.addEventListener('touchend',e=>{
    if(!dragging)return; dragging=false;
    const dy=e.changedTouches[0].clientY-startY;
    if(dy>80) closeMobDrawer();
  },{passive:true});
})();

function setMobActive(el){ _setMobActive(el); closeMobDrawer(); }
function toggleMobMore(){ openMobDrawer(); }
function closeMobMore(){ closeMobDrawer(); }

const _navOrig=nav;
window._navOrig=_navOrig;
nav=function(page, _pushState){
  if(page==='insights'){
    
    if(_pushState !== false){
      history.pushState({page:'insights'}, '', '/insights');
    }
    document.title = 'JEETrack — AI Insights';
    closeMobDrawer();
    syncMobNav('insights');
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    document.querySelectorAll('.ni').forEach(n=>n.classList.remove('active'));
    document.getElementById('page-insights').classList.add('active');
    document.querySelectorAll('.ni').forEach(n=>{if(n.textContent.toLowerCase().includes('ai insight'))n.classList.add('active');});
    
    ['mob-fab-hours','mob-fab-todo','mob-fab-backlog','mob-fab-practice'].forEach(id=>{ const el=document.getElementById(id); if(el) el.style.display='none'; });
    
    const content=document.getElementById('insights-content');
    const empty=document.getElementById('insights-empty');
    if(content && empty && content.innerHTML.trim()===''){
      try{
        const cached=localStorage.getItem('jt_ai_insights_'+(typeof currentUser!=='undefined'&&currentUser?.id||'guest'));
        if(cached){
          const {data,ts}=JSON.parse(cached);
          if(data){
            renderInsights(data);
            content.style.display='block';
            empty.style.display='none';
            
            const tsEl=content.querySelector('[data-insight-ts]');
            if(!tsEl){
              const note=content.querySelector('div[style*="text-align:center;font-size:10px"]');
              if(note) note.textContent='Last generated '+new Date(ts).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})+' · Refresh to update';
            }
          }
        }
      }catch(e){}
    }
  } else {
    _navOrig(page, _pushState);
  }
};

async function generateInsights(){
  
  if(!sb){toast('Sign in to use AI Insights', 'info');return;}
  const{data:{session}}=await sb.auth.getSession();
  if(!session){toast('Sign in to use AI Insights', 'info');return;}

  
  if(!_aiCanGenerate()){
    const days=_aiDaysUntilReset();
    toast(`Weekly limit reached (3/3) — resets in ${days} day${days===1?'':'s'} 🔄`, 'info');
    return;
  }

  const btn=document.getElementById('insights-btn');
  const loading=document.getElementById('insights-loading');
  const empty=document.getElementById('insights-empty');
  const content=document.getElementById('insights-content');
  const loadingText=document.getElementById('insights-loading-text');
  const progressBar=document.getElementById('insights-progress-bar');

  btn.disabled=true;btn.innerHTML='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="animation:aiSpin .8s linear infinite"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> Analyzing...';
  const btn2=document.getElementById('insights-btn-2');
  if(btn2){btn2.disabled=true;btn2.innerHTML='Analyzing...';}
  loading.style.display='flex';
  empty.style.display='none';
  content.style.display='none';
  content.innerHTML='';

  const msgs=['Scanning your mock scores...','Analyzing study patterns...','Checking syllabus progress...','Detecting weak areas...','Comparing trends...','Building your action plan...','Finalizing insights...'];
  
  const stepSchedule=[[1,0],[2,2],[3,4],[4,6]];
  
  for(let s=1;s<=4;s++){const el=document.getElementById('ai-step-'+s);if(el){el.classList.remove('active','done');}}
  let mi=0;
  const msgInt=setInterval(()=>{
    if(loadingText)loadingText.textContent=msgs[Math.min(mi,msgs.length-1)];
    if(progressBar)progressBar.style.width=Math.min(90,(mi+1)*13)+'%';
    
    stepSchedule.forEach(([sid,tick])=>{
      const el=document.getElementById('ai-step-'+sid);
      if(!el)return;
      if(mi===tick){el.classList.add('active');el.classList.remove('done');}
      else if(mi>tick){el.classList.remove('active');el.classList.add('done');}
    });
    mi++;
  },900);

  
  const mains=S.tests.filter(t=>t.exam==='mains').sort((a,b)=>a.date.localeCompare(b.date));
  const adv=S.tests.filter(t=>t.exam==='advanced').sort((a,b)=>a.date.localeCompare(b.date));
  const _allTests=[...S.tests].sort((a,b)=>a.date.localeCompare(b.date));
  const subjs=['physics','chemistry','maths'];
  const _avg=arr=>arr.length?(arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1):'0';

  
  const scoreTrend=arr=>{
    if(arr.length<2)return'insufficient';
    const pcts=arr.map(t=>t.total/t.max*100);
    const first=pcts[0],last=pcts[pcts.length-1];
    const diff=last-first;
    const mid=pcts.slice(1,-1);
    const maxMid=mid.length?Math.max(...mid):last;
    const minMid=mid.length?Math.min(...mid):last;
    if(maxMid-minMid>15&&pcts.length>=3)return'fluctuating';
    if(diff>5)return'increasing';
    if(diff<-5)return'decreasing';
    return'plateau';
  };
  const mainsTrend=scoreTrend(mains);
  const advTrend=scoreTrend(adv);
  const _mainsScores=mains.map(t=>+(t.total/t.max*100).toFixed(1));
  const _advScores=adv.map(t=>+(t.total/t.max*100).toFixed(1));

  
  const sAvg=(arr,s)=>{const v=arr.filter(t=>t.max).map(t=>(t[s]/(t.max/3))*100);return v.length?+(v.reduce((a,b)=>a+b,0)/v.length).toFixed(1):0;};

  
  const _totalH=S.hours.reduce((a,b)=>a+b.total,0)||0.001;
  const totalLec=S.hours.reduce((a,b)=>a+b.lecture,0);
  const totalPrac=S.hours.reduce((a,b)=>a+b.practice,0);
  const totalRev=S.hours.reduce((a,b)=>a+b.revision,0);
  const totalMock=S.hours.reduce((a,b)=>a+(b.mockAnalysis||0),0);
  const manualH=(totalLec+totalPrac+totalRev)||0.001;
  const lecP=+(totalLec/manualH*100).toFixed(0);
  const pracP=+(totalPrac/manualH*100).toFixed(0);
  const revP=+(totalRev/manualH*100).toFixed(0);

  
  const subjH=subjs.map(s=>{
    const sh=S.hours.filter(h=>h.subject===s);
    const ht=+sh.reduce((a,b)=>a+b.total,0).toFixed(1);
    const hp=+sh.reduce((a,b)=>a+b.practice,0).toFixed(1);
    const hr=+sh.reduce((a,b)=>a+b.revision,0).toFixed(1);
    return{s,total:ht,prac:hp,rev:hr,pracPct:ht?+(hp/ht*100).toFixed(0):0,revPct:ht?+(hr/ht*100).toFixed(0):0};
  });
  const maxH=Math.max(...subjH.map(x=>x.total));
  const minH=Math.min(...subjH.map(x=>x.total));
  const _neglectedSubj=subjH.find(x=>x.total===minH)?.s||'';
  const _mostStudied=subjH.find(x=>x.total===maxH)?.s||'';

  
  const effic=subjs.map(s=>{
    const score=sAvg(mains,s)||sAvg(adv,s);
    const hrs=subjH.find(x=>x.s===s)?.total||0.001;
    return{s,score,hrs,roi:hrs>0?+(score/hrs).toFixed(1):0};
  });
  const _bestROI=effic.sort((a,b)=>b.roi-a.roi)[0]?.s||'';
  const _worstROI=[...effic].sort((a,b)=>a.roi-b.roi)[0]?.s||'';
  effic.sort((a,b)=>a.s.localeCompare(b.s)); 

  
  const daysAgo=n=>{const d=new Date();d.setDate(d.getDate()-n);return d.toISOString().split('T')[0];};
  const studiedInLast=n=>S.hours.filter(h=>h.date>=daysAgo(n)).map(h=>h.date);
  const days3=new Set(studiedInLast(3)).size;
  const days7=new Set(studiedInLast(7)).size;
  const days14=new Set(studiedInLast(14)).size;
  const hrs7=S.hours.filter(h=>h.date>=daysAgo(7)).reduce((a,b)=>a+b.total,0).toFixed(1);
  const hrs3=S.hours.filter(h=>h.date>=daysAgo(3)).reduce((a,b)=>a+b.total,0).toFixed(1);
  const hrs30=S.hours.filter(h=>h.date>=daysAgo(30)).reduce((a,b)=>a+b.total,0).toFixed(1);
  const _consistencyType=days14>=11?'consistent':days14>=7?'moderate':days3===0?'breaking':'irregular';

  
  const sylDetail=subjs.map(s=>{
    const chs=S.syllabus[s]||[];
    const done=chs.filter(c=>c.theory&&c.practice).length;
    const theoryOnly=chs.filter(c=>c.theory&&!c.practice).length;
    const notStarted=chs.filter(c=>!c.theory&&!c.practice).length;
    return{s,total:chs.length,done,theoryOnly,notStarted,pct:chs.length?Math.round(done/chs.length*100):0};
  });
  const overallSylPct=Math.round(sylDetail.reduce((a,b)=>a+b.done,0)/Math.max(sylDetail.reduce((a,b)=>a+b.total,0),1)*100);

  
  const blPend=S.backlogs.filter(b=>!b.done);
  const blHigh=blPend.filter(b=>b.priority==='high').length;
  const blBySubj=subjs.map(s=>({s,n:blPend.filter(b=>b.subject===s).length}));
  const blCompRate=S.backlogs.length?Math.round(S.backlogs.filter(b=>b.done).length/S.backlogs.length*100):0;

  
  const todoDone=S.todos.filter(t=>t.done).length;
  const todoPend=S.todos.filter(t=>!t.done).length;
  const todoRate=S.todos.length?Math.round(todoDone/S.todos.length*100):0;

  const aiUserName = document.getElementById('sb-username')?.textContent?.trim() || 'there';

  
  const targetYear = getTargetYear();
  const mainsDate = getJeeMainsDate();
  const todayD = new Date();
  const daysToMains = Math.ceil((mainsDate - todayD)/86400000);
  const monthsToMains = Math.round((daysToMains/30.44)*10)/10;
  
  const prepStart = new Date((targetYear-2)+'-06-01');
  const totalPrepDays = Math.max(1,(mainsDate - prepStart)/86400000);
  const elapsedPrepDays = Math.max(0,(todayD - prepStart)/86400000);
  const expectedSylPct = Math.max(0, Math.min(100, Math.round(elapsedPrepDays/totalPrepDays*100)));

  const prompt=`You are ${aiUserName}'s personal JEE ${targetYear} coach. Analyze their data and generate smart, data-driven insights. Follow the INCLUSION RULES strictly.

IMPORTANT: When referring to test scores, always say "X marks" or "scored X/300" — NEVER say "X%" for a raw test score. Percentages are only for study split (lecture/practice/revision) and syllabus completion. Example: say "scored 201/300" not "67%".

TONE: Talk like a real coach who knows this student — honest, direct, specific with numbers, genuinely invested in them. Not a motivational-poster bot, not a harsh drill sergeant. Call out real problems plainly. Celebrate real wins plainly. Don't pad things with forced positivity, and don't manufacture negativity either — just tell them the truth about their data like a good coach would.

SYLLABUS PACING — judge this relative to the exam timeline, not a fixed cutoff:
- ${daysToMains>0?`JEE Mains ${targetYear} is ${daysToMains} days away (~${monthsToMains} months).`:`JEE Mains ${targetYear} has passed.`} Assuming a typical ~2-year syllabus runway, a student at this point in time would realistically have covered roughly ${expectedSylPct}% of syllabus so far.
- Compare the student's actual ${overallSylPct}% against that ${expectedSylPct}% expected-by-now figure — that's the real signal, not the raw percentage on its own. A student at 10% with 20 months left and an expected pace of ~15% is basically on track, not "behind." A student at 40% with 3 months left and an expected pace of ~90% is genuinely behind, even though 40% sounds decent in isolation.
- If actual is at or above expected pace: this is good news, say so plainly, no hedging.
- If actual is meaningfully below expected pace (10+ points behind): this is a real gap — name it clearly and give a concrete plan to close it, same as you would for any other weak area.
- If the student just started and the exam is still far away, don't call low syllabus % a "problem" — it's just where they are on a long timeline.

INCLUSION RULES — only include an insight if the condition is met:
- PATTERN (study split): ALWAYS include. This is critical. If practice < 40% → bad. If revision < 15% → warn. If lecture > 50% → warn. If 35-50% practice and 15-25% revision → good.
- NEGLECT (subject hours): Include if the gap between most-studied and least-studied subject is > 10h. Otherwise skip.
- TREND (scores): ALWAYS include if there are any test scores. Show the trajectory clearly.
- EFFICIENCY: Include if one subject has noticeably worse score-per-hour ratio than others (ROI difference > 2). Otherwise skip.
- CONSISTENCY: Include if studying < 8/14 days (bad) or 0/3 recent days (breaking). If 10+/14 → just a brief positive, or skip entirely.
- SYLLABUS: Include if actual completion is meaningfully below the expected-by-now pace (see SYLLABUS PACING above), or any single subject < 50%. If on/ahead of pace and no subject is critically low → skip or brief positive.
- BACKLOG: Include if pending > 3, or high priority > 1, or streak < 2 days. If backlog is clean → skip.
- BEHAVIOR: Include only if there's a clear pattern like one subject getting 2x more hours than a weaker-scoring subject.
- TASKS: Include only if completion rate < 60% or pending > 3. Otherwise skip.

TEXT LENGTH RULES:
- bad/warn insight with serious issue: 2-3 sentences with exact numbers
- good insight: 1 short sentence max, or skip entirely
- Never mention chapter names — only say "Physics has X theory-only chapters needing practice sessions"

DATA:
SCORES:
Mains (${mains.length} tests): ${mains.map(t=>`${t.total}/${t.max}`).join(' → ')||'none'} | Trend: ${mainsTrend}
  Phy avg:${sAvg(mains,'physics')} marks (out of ${mains.length?Math.round(mains[0].max/3):100}) | Chem avg:${sAvg(mains,'chemistry')} | Math avg:${sAvg(mains,'maths')}
Advanced (${adv.length} tests): ${adv.map(t=>`${t.total}/${t.max}`).join(' → ')||'none'} | Trend: ${advTrend}
  Phy avg:${sAvg(adv,'physics')} marks | Chem avg:${sAvg(adv,'chemistry')} | Math avg:${sAvg(adv,'maths')}

STUDY HOURS:
Last 3d: ${hrs3}h (${days3}/3 days) | Last 7d: ${hrs7}h (${days7}/7 days) | Last 14d: ${days14}/14 days active | Last 30d: ${hrs30}h
OVERALL SPLIT — Lecture:${lecP}% | Practice:${pracP}% | Revision:${revP}% ← compare against ideal 30/50/20${totalMock>0?` (plus ${totalMock.toFixed(1)}h spent on mock analysis, tracked separately)`:''}
Subject hours: ${subjH.map(x=>`${x.s}:${x.total}h(prac:${x.pracPct}%,rev:${x.revPct}%)`).join(' | ')}
Hour gap between most/least studied: ${(Math.max(...subjH.map(x=>x.total))-Math.min(...subjH.map(x=>x.total))).toFixed(1)}h (>${10}h = neglect problem)

EFFICIENCY:
${subjs.map(s=>{const e=effic.find(x=>x.s===s);return`${s}: score ${e?.score||0}%, hours ${e?.hrs||0}h, ROI ${e?.roi||0}`;}).join(' | ')}

SYLLABUS: ${overallSylPct}% overall (expected-by-now pace for this timeline: ~${expectedSylPct}% | ${daysToMains>0?daysToMains+' days to JEE Mains '+targetYear:'JEE Mains date passed'})
${sylDetail.map(x=>`${x.s}: ${x.pct}% (${x.done}/${x.total} done, ${x.theoryOnly} theory-only needs practice, ${x.notStarted} not started)`).join(' | ')}

BACKLOGS: ${blPend.length} pending | High priority: ${blHigh} | Completion rate: ${blCompRate}% | Streak: ${S.backlogStreak}d
${blBySubj.map(x=>`${x.s}:${x.n}`).join(', ')}

TASKS: ${todoDone}/${S.todos.length} done = ${todoRate}% | Pending: ${todoPend}

Today: ${new Date().toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})}

Return ONLY valid JSON. No markdown. insights array: 3-7 items following the inclusion rules above.

{
  "overallScore": <0-100>,
  "momentum": "rising|stable|declining",
  "overallVerdict": "2 honest sentences summarizing current state with actual numbers — real coach tone, per TONE above",
  "insights": [
    {
      "icon": "emoji",
      "title": "title",
      "type": "good|warn|bad",
      "tag": "TREND|EFFICIENCY|NEGLECT|CONSISTENCY|PATTERN|SYLLABUS|BACKLOG|BEHAVIOR|TASKS",
      "body": "follow text length rules — serious issue: 2-3 sentences with numbers. good: 1 short line.",
      "metric": "key data point e.g. Practice 28% vs ideal 50%"
    }
  ],
  "subjectReport": {
    "physics": {"grade":"A|B|C|D","score":<0-100>,"comment":"1-2 sentences on score + hours + syllabus. No chapter names.","action":"one specific next step"},
    "chemistry": {"grade":"A|B|C|D","score":<0-100>,"comment":"...","action":"..."},
    "maths": {"grade":"A|B|C|D","score":<0-100>,"comment":"...","action":"..."}
  },
  "todayAction": ["task 1","task 2","task 3"],
  "weeklyPlan": "3-4 sentences: realistic plan based on what actually needs fixing this week",
  "redFlag": "1-2 sentences on the single most critical issue, or null if nothing critical",
  "greenFlag": "1-2 sentences on the biggest genuine strength"
}`;

  try {
    
    const response=await fetch(`${SUPABASE_URL}/functions/v1/ai-insights`,{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Authorization':'Bearer '+session.access_token
      },
      body:JSON.stringify({prompt})
    });
    if(!response.ok){
      const err=await response.json().catch(()=>({}));
      throw new Error(err.error?.message||`HTTP ${response.status}`);
    }
    const data=await response.json();
    clearInterval(msgInt);
    if(progressBar)progressBar.style.width='100%';
    await new Promise(r=>setTimeout(r,400));
    loading.style.display='none';
    const raw=data.choices?.[0]?.message?.content||'';
    let insight;
    try{
      const cleaned=raw.replace(/```json|```/g,'').trim();
      insight=JSON.parse(cleaned);
    }catch(e){throw new Error('Could not parse AI response. Try again.');}
    renderInsights(insight);
    
    (function(){
      const hasTests = S.tests.length;
      const hasHours = S.hours.length;
      const hasSyl   = ['physics','chemistry','maths'].some(s=>(S.syllabus[s]||[]).length>0);
      const missing = [];
      if (!hasTests)        missing.push('mock test scores');
      else if (hasTests<3)  missing.push('more mock tests (only '+hasTests+' logged)');
      if (!hasHours)        missing.push('study hours');
      else if (hasHours<5)  missing.push('more study hour entries (only '+hasHours+')');
      if (!hasSyl)          missing.push('syllabus progress');
      if (missing.length) {
        const tip = missing.length===1
          ? 'Insights may be limited — add '+missing[0]+' for better analysis.'
          : 'Insights may be limited — add '+missing.slice(0,-1).join(', ')+' and '+missing[missing.length-1]+' for best results.';
        setTimeout(()=>toastTopWarn('⚠️ Low data: '+tip, 7000), 600);
      }
    })();
    
    try{ localStorage.setItem('jt_ai_insights_'+(typeof currentUser!=='undefined'&&currentUser?.id||'guest'), JSON.stringify({data:insight, ts:Date.now()})); }catch(e){}
    content.style.display='block';
    empty.style.display='none';
    _aiIncrementUsage();toast('Insights ready 🧠', 'success');maybeShowAiReview();
  }catch(err){
    clearInterval(msgInt);
    loading.style.display='none';
    empty.style.display='none';
    content.style.display='block';
    content.innerHTML=`<div class="ai-refresh-bar"><div><span style="font-family:'Syne',sans-serif;font-weight:700;color:var(--tx)">AI Analysis</span></div><button class="ai-refresh-btn" onclick="generateInsights()" id="insights-btn-2"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> Retry</button></div>
      <div style="background:rgba(248,113,113,.07);border:1px solid rgba(248,113,113,.22);border-radius:16px;padding:1.2rem 1.4rem">
        <div style="color:var(--rd);font-weight:700;font-family:'Syne',sans-serif;margin-bottom:8px;font-size:14px;display:flex;align-items:center;gap:6px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Couldn't generate insights</div>
        <div style="font-size:13px;color:var(--mu);line-height:1.7">
          ${err.message.includes('401')||err.message.includes('key')||err.message.includes('auth')
            ?'AI service error. Please try again in a moment.'
            :err.message.includes('429')||err.message.includes('rate')
            ?'Rate limit hit. Try again in a few minutes.'
            :'Error: '+err.message}
        </div>
      </div>`;
  }
  btn.disabled=false;btn.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Generate Insights';
  const b2=document.getElementById('insights-btn-2');
  if(b2){b2.disabled=false;b2.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> Refresh';}
}

function renderInsights(d){
  const content=document.getElementById('insights-content');
  const barColor=v=>v>=75?'#34d399':v>=55?'#60a5fa':v>=40?'#fbbf24':'#f87171';
  const gradeColor=g=>g==='A'?'#34d399':g==='B'?'#60a5fa':g==='C'?'#fbbf24':'#f87171';
  const gradeBg=g=>g==='A'?'rgba(52,211,153,.12)':g==='B'?'rgba(96,165,250,.12)':g==='C'?'rgba(251,191,36,.1)':'rgba(248,113,113,.1)';
  const typeAccent=t=>t==='good'?'#34d399':t==='bad'?'#f87171':t==='warn'?'#fbbf24':'#60a5fa';
  const typeBgClass=t=>`ai-ins-type-${t}`;
  const momColor=d.momentum==='rising'?'#34d399':d.momentum==='declining'?'#f87171':'#fbbf24';
  const momBg=d.momentum==='rising'?'rgba(52,211,153,.12)':d.momentum==='declining'?'rgba(248,113,113,.1)':'rgba(251,191,36,.1)';
  const momIcon=d.momentum==='rising'?'↑':d.momentum==='declining'?'↓':'→';
  const score=d.overallScore||0;
  const insights=d.insights||[];
  const circumference=2*Math.PI*45;
  const dashOffset=circumference*(1-(score/100));
  const ts=new Date().toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});

  const subjIcon={
    physics:`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    chemistry:`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6m-3 0v6m-6 9h12l-3-8H9l-3 8z"/></svg>`,
    maths:`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="19" x2="20" y2="19"/><polyline points="4 15 8 9 12 11 16 6 20 15"/></svg>`
  };
  const subjColor={physics:'#60a5fa',chemistry:'#34d399',maths:'#fbbf24'};
  const subjBg={physics:'rgba(96,165,250,.12)',chemistry:'rgba(52,211,153,.12)',maths:'rgba(251,191,36,.1)'};

  content.innerHTML=`
  <div class="ai-refresh-bar">
    <div>
      <span style="font-family:'Syne',sans-serif;font-weight:700;font-size:1rem;color:var(--tx)">AI Analysis</span>
      <span class="ai-ts" style="margin-left:8px">${ts}</span>
    </div>
    <button class="ai-refresh-btn" onclick="generateInsights()" id="insights-btn-2">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
      Refresh
    </button>
  </div>

  
  <div class="ai-verdict-card">
    <div class="ai-verdict-main">
      <div class="ai-verdict-label">Overall Assessment</div>
      <div class="ai-verdict-text">${d.overallVerdict||'Analysis complete'}</div>
      <div class="ai-mom-badge" style="background:${momBg};color:${momColor}">
        <span style="font-size:13px;font-weight:700">${momIcon}</span>
        <span>${(d.momentum||'STABLE').toUpperCase()}</span>
      </div>
    </div>
    <div class="ai-score-ring-wrap">
      <svg class="ai-score-ring-svg" width="108" height="108" viewBox="0 0 108 108">
        <circle cx="54" cy="54" r="45" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="7"/>
        <circle cx="54" cy="54" r="45" fill="none" stroke="url(#ringGrad)" stroke-width="7"
          stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}"
          style="transition:stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)"/>
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#a695ff"/>
            <stop offset="100%" stop-color="#f472b6"/>
          </linearGradient>
        </defs>
      </svg>
      <div class="ai-score-ring-inner">
        <div class="ai-score-ring-num">${score}</div>
        <div class="ai-score-ring-label">/ 100</div>
      </div>
    </div>
  </div>

  
  <div class="ai-section-label">Detailed Analysis</div>
  <div class="ai-ins-grid">
    ${insights.map(ins=>`
      <div class="ai-ins-card ${typeBgClass(ins.type)}">
        <div class="ai-ins-accent" style="background:${typeAccent(ins.type)}"></div>
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;padding-left:8px">
          <div class="ai-ins-title">${ins.title||''}</div>
          <span class="ai-ins-tag" style="background:${typeAccent(ins.type)}18;color:${typeAccent(ins.type)}">${ins.tag||''}</span>
        </div>
        <div class="ai-ins-body" style="padding-left:8px">${ins.body||''}</div>
        ${ins.metric?`<div class="ai-ins-metric" style="background:${typeAccent(ins.type)}14;color:${typeAccent(ins.type)};margin-left:8px">${ins.metric}</div>`:''}
      </div>
    `).join('')}
  </div>

  
  <div class="ai-section-label">Subject Report Card</div>
  <div class="ai-subj-card">
    ${['physics','chemistry','maths'].map(s=>{
      const r=d.subjectReport?.[s]||{grade:'C',score:50,comment:'',action:''};
      return`<div class="ai-subj-row">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
          <div style="display:flex;align-items:center;gap:10px">
            <div class="ai-subj-icon" style="background:${subjBg[s]};color:${subjColor[s]}">${subjIcon[s]}</div>
            <div>
              <span style="font-weight:700;font-size:13.5px;color:var(--tx)">${s.charAt(0).toUpperCase()+s.slice(1)}</span>
            </div>
            <span class="ai-grade-badge" style="background:${gradeBg(r.grade)};color:${gradeColor(r.grade)}">Grade ${r.grade}</span>
          </div>
          <span class="ai-subj-pct" style="color:${barColor(r.score)}">${r.score}%</span>
        </div>
        <div class="ai-subj-bar-bg">
          <div class="ai-subj-bar-fill" style="width:${r.score}%;background:${barColor(r.score)}"></div>
        </div>
        <div style="font-size:12.5px;color:var(--mu);line-height:1.65;margin-bottom:${r.action?'7px':'0'}">${r.comment||''}</div>
        ${r.action?`<div style="font-size:12px;color:var(--ac2);display:flex;align-items:flex-start;gap:5px;line-height:1.5"><span style="flex-shrink:0;font-weight:700">→</span><span>${r.action}</span></div>`:''}
      </div>`;
    }).join('')}
  </div>

  
  ${(d.redFlag||d.greenFlag)?`
  <div class="ai-section-label">Flags</div>
  <div class="ai-flag-grid">
    ${d.redFlag?`<div class="ai-flag-card" style="background:rgba(248,113,113,.07);border:1px solid rgba(248,113,113,.2)">
      <div class="ai-flag-label" style="color:var(--rd)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        Critical Fix
      </div>
      <div class="ai-flag-text">${d.redFlag}</div>
    </div>`:''}
    ${d.greenFlag?`<div class="ai-flag-card" style="background:rgba(52,211,153,.07);border:1px solid rgba(52,211,153,.2)">
      <div class="ai-flag-label" style="color:var(--gn)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        Your Strength
      </div>
      <div class="ai-flag-text">${d.greenFlag}</div>
    </div>`:''}
  </div>`:''}

  
  ${d.todayAction?.length?`
  <div class="ai-section-label">Today's Action Plan</div>
  <div class="ai-action-card">
    ${d.todayAction.map((t,i)=>`
      <div class="ai-action-item">
        <div class="ai-action-num">${i+1}</div>
        <div class="ai-action-text">${t}</div>
      </div>`).join('')}
  </div>`:''}

  
  ${d.weeklyPlan?`
  <div class="ai-section-label">Weekly Strategy</div>
  <div class="ai-weekly-card">
    <div class="ai-weekly-label">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      This Week
    </div>
    <div class="ai-weekly-text">${d.weeklyPlan}</div>
  </div>`:''}
  `;

  
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    content.querySelectorAll('.ai-subj-bar-fill').forEach(el=>{
      const targetWidth = el.style.width;
      el.style.width = '0%';
      el.style.transition = 'width 0.7s cubic-bezier(.4,0,.2,1)';
      requestAnimationFrame(()=>{ el.style.width = targetWidth; });
    });
  }));
}

// Formerly a separate inline <script> in index.html, right after this
// file's own static <script src>. Moved here (instead of just appended
// after this file loads, wherever that ends up in index.html) since it
// depends on window.nav existing — guaranteed true at this exact point
// since nav() is defined earlier in this same file, but not guaranteed
// at any fixed *document position* now that this whole file loads
// dynamically, on demand, rather than at a fixed spot in the page.
(function(){
  var _origNav = window.nav;
  if (typeof _origNav === 'function') {
    window.nav = function(page, push){
      _origNav(page, push);
      if (page === 'settings' && window.innerWidth <= 768 && typeof settingsMobileReset === 'function') {
        settingsMobileReset();
      }
    };
  }
  window.addEventListener('popstate', function(){
    if (window.innerWidth <= 768) {
      var layout = document.getElementById('settings-layout');
      var settingsPage = document.getElementById('page-settings');
      if (layout && layout.classList.contains('mob-detail') && settingsPage && settingsPage.classList.contains('active')) {
        layout.classList.remove('mob-detail');
      }
    }
  });
})();
