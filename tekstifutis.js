/* ═══ APU ═══ */
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const rand=(arr,r)=>arr[Math.floor(r()*arr.length)];
let _id=1; const uid=()=>_id++;
const $=s=>document.querySelector(s);

const ETUNIMET=['Aatu','Eetu','Onni','Väinö','Leevi','Niilo','Elias','Joel','Aaro','Veeti','Lenni','Eemil','Otso','Daniel','Sisu','Roni','Kasper','Miro','Akseli','Topias','Niko','Eino','Luka','Anton','Hugo'];
const SUKUNIMET=['Virtanen','Korhonen','Mäkinen','Nieminen','Hämäläinen','Laine','Heikkilä','Koskinen','Järvinen','Lehtonen','Saarinen','Salminen','Heinonen','Niemi','Mattila','Aaltonen','Rantanen','Hakala','Mäki','Toivonen'];
const VASTUSTAJAT=['FC Myrsky','Vuoren Veikot','Salon Salama','Tähtikuviot','Pohjan Pojat','Rannikon Raju','Kettujen KP','Susilauma','Lakeuden LP','Riihen Riento'];

const PAIKAT={MV:'Maalivahti',P:'Puolustaja',K:'Keskikenttä',H:'Hyökkääjä'};
const ROOLI_LYHYT={MV:'MV',P:'PUOL',K:'KESK',H:'HYÖK'};
const RAR={
  tavallinen:{paino:50,vali:[40,60],vari:'#9ca3af',tahdet:1,hinta:15,lyhyt:'TAV'},
  merkillinen:{paino:25,vali:[48,66],vari:'#2ecc71',tahdet:2,hinta:22,lyhyt:'MRK'},
  harvinainen:{paino:16,vali:[55,72],vari:'#3b82f6',tahdet:3,hinta:30,lyhyt:'HAR'},
  eeppinen:{paino:7,vali:[68,84],vari:'#a855f7',tahdet:4,hinta:65,lyhyt:'EEP'},
  legenda:{paino:2,vali:[80,95],vari:'#fbbf24',tahdet:5,hinta:130,lyhyt:'LEG'},
  myyttinen:{paino:0,vali:[100,100],vari:'#ff3cac',tahdet:5,hinta:0,lyhyt:'MYY'},
};
const RAR_ORDER=['tavallinen','merkillinen','harvinainen','eeppinen','legenda'];
const ATTRS=['nopeus','laukaus','syotto','kuljetus','puolustus','fyysisyys'];
const ATTR_LYHYT={nopeus:'NOP',laukaus:'LAU',syotto:'SYÖ',kuljetus:'KUL',puolustus:'PUO',fyysisyys:'FYY'};
const ATTR_NIMI={nopeus:'Nopeus',laukaus:'Laukaus',syotto:'Syöttö',kuljetus:'Kuljetus',puolustus:'Puolustus',fyysisyys:'Fyysisyys'};
const KEY_ATTRS={MV:['puolustus','fyysisyys'],P:['puolustus','fyysisyys'],K:['syotto','kuljetus'],H:['laukaus','nopeus']};

const FORMATIONS={
 '1-3-3-1':{slots:[{role:'MV',x:50,y:90},{role:'P',x:24,y:70},{role:'P',x:50,y:73},{role:'P',x:76,y:70},{role:'K',x:24,y:45},{role:'K',x:50,y:43},{role:'K',x:76,y:45},{role:'H',x:50,y:19}]},
 '1-2-4-1':{slots:[{role:'MV',x:50,y:90},{role:'P',x:33,y:71},{role:'P',x:67,y:71},{role:'K',x:12,y:47},{role:'K',x:37,y:48},{role:'K',x:63,y:48},{role:'K',x:88,y:47},{role:'H',x:50,y:19}]},
 '1-2-3-2':{slots:[{role:'MV',x:50,y:90},{role:'P',x:35,y:72},{role:'P',x:65,y:72},{role:'K',x:22,y:47},{role:'K',x:50,y:45},{role:'K',x:78,y:47},{role:'H',x:36,y:20},{role:'H',x:64,y:20}]},
 '1-3-2-2':{slots:[{role:'MV',x:50,y:90},{role:'P',x:24,y:72},{role:'P',x:50,y:74},{role:'P',x:76,y:72},{role:'K',x:36,y:47},{role:'K',x:64,y:47},{role:'H',x:36,y:20},{role:'H',x:64,y:20}]},
};

/* ═══ TILA ═══ */
const PAKETTI_HINTA=50, ROOLI_HINTA=75, SUB_SLOTS=3, MAX_COLLECTION=30;
const MYYTTINEN_TN=0.005; // ultraharvinainen myyttinen veto (0.5%), kun joukkueella on myyttisiä
let availableMythics=[];  // valmentajan lisäämät nimet: [{id,name,paikka}]
const state={ footballs:0, lastReal:null, pity:0, collection:[], mythics:[], formation:'1-3-3-1', placements:new Array(8).fill(null), subs:new Array(SUB_SLOTS).fill(null), teamName:'Oma joukkue', history:[] };
const getPlayer=id=>state.collection.find(p=>p.id===id)||null;
const sur=p=>p.nimi.split(' ')[1]||p.nimi;

/* ═══ PELAAJAT ═══ */
function arvoNimi(r){return rand(ETUNIMET,r)+' '+rand(SUKUNIMET,r);}
function arvoHarvinaisuus(r){
  if(state.pity>=9) return r()<0.5?'eeppinen':'harvinainen';
  const summa=Object.values(RAR).reduce((s,t)=>s+t.paino,0); let x=r()*summa;
  for(const[nimi,t] of Object.entries(RAR)){ if((x-=t.paino)<0) return nimi; } return 'tavallinen';
}
function arvoPelaaja(r,forcedRole){
  const harv=arvoHarvinaisuus(r); const[lo,hi]=RAR[harv].vali; const attr=()=>lo+Math.floor(r()*(hi-lo+1));
  const paikka=forcedRole||['MV','P','K','H'][Math.floor(r()*4)]; const p={id:uid(),nimi:arvoNimi(r),paikka,harvinaisuus:harv};
  ATTRS.forEach(a=>p[a]=attr());
  if(paikka==='MV'){p.puolustus=clamp(p.puolustus+8,1,99);p.fyysisyys=clamp(p.fyysisyys+5,1,99);}
  if(paikka==='P'){p.puolustus=clamp(p.puolustus+8,1,99);}
  if(paikka==='K'){p.syotto=clamp(p.syotto+8,1,99);}
  if(paikka==='H'){p.laukaus=clamp(p.laukaus+8,1,99);p.nopeus=clamp(p.nopeus+5,1,99);}
  return p;
}
const ovr=p=>Math.round(ATTRS.reduce((s,a)=>s+p[a],0)/ATTRS.length);

/* ═══ SIJAINTI ═══ */
function locOf(pid){let i=state.placements.indexOf(pid);if(i>=0)return{z:'field',i};let j=state.subs.indexOf(pid);if(j>=0)return{z:'sub',i:j};return{z:'pool'};}
function moveTo(pid,dest){
  const from=locOf(pid);
  const occ = dest.z==='field'?state.placements[dest.i] : dest.z==='sub'?state.subs[dest.i] : null;
  if(from.z==='field')state.placements[from.i]=null; else if(from.z==='sub')state.subs[from.i]=null;
  if(dest.z==='field')state.placements[dest.i]=pid; else if(dest.z==='sub')state.subs[dest.i]=pid;
  if(occ&&occ!==pid){ if(from.z==='field')state.placements[from.i]=occ; else if(from.z==='sub')state.subs[from.i]=occ; }
  renderJoukkue();
}
function emptyField(){return state.placements.findIndex(x=>x===null);}
function emptySub(){return state.subs.findIndex(x=>x===null);}

/* ═══ VAHVUUDET ═══ */
function mismatchFactor(pr,sr){ if(pr===sr) return 1.0; return (pr==='MV'||sr==='MV')?0.6:0.8; }
function slotBase(p,role){
  if(role==='MV') return (p.puolustus+p.fyysisyys+p.nopeus)/3;
  if(role==='P')  return p.puolustus*0.6+p.fyysisyys*0.4;
  if(role==='K')  return p.syotto*0.6+p.kuljetus*0.4;
  return p.laukaus*0.6+p.nopeus*0.4;
}
function teamForces(){
  const slots=FORMATIONS[state.formation].slots; const acc={MV:[],P:[],K:[],H:[]};
  slots.forEach((s,i)=>{const p=getPlayer(state.placements[i]); acc[s.role].push(p?slotBase(p,s.role)*mismatchFactor(p.paikka,s.role):30);});
  const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:30;
  return {maalivahti:avg(acc.MV),puolustus:avg(acc.P),keskikentta:avg(acc.K),hyokkays:avg(acc.H)};
}
function placedPlayers(){return state.placements.filter(Boolean).map(getPlayer).filter(Boolean);}
function subPlayers(){return state.subs.filter(Boolean).map(getPlayer).filter(Boolean);}
function placedAvg(){const ps=placedPlayers();if(!ps.length)return 50;const all=ps.flatMap(p=>ATTRS.map(a=>p[a]));return all.reduce((a,b)=>a+b,0)/all.length;}

/* ═══ OTTELUSIMULAATIO ═══ */
function contest(a,b,r){const SCALE=8;return r()<1/(1+Math.exp(-(a-b)/SCALE));}
function pickNimi(team,roles,r){const c=team.players.filter(p=>roles.includes(p.paikka));const pool=c.length?c:team.players;if(!pool.length)return team.nimi;const n=rand(pool,r).nimi;return n.split(' ')[1]||n;}
function fatigue(team,min){if(min<=58)return 0;return Math.max(0,5-team._subDone*3);}
function getF(team,key,min){return Math.max(10,team.forces[key]-fatigue(team,min));}

const T={
  turnover:["%D katkaisee syötön keskikentällä.","%D riistää pallon kovalla taklauksella.","Pallo karkaa %A:lta, %D ehtii väliin.","%D lukee pelin ja nappaa pallon.","Keskikentän kamppailu kääntyy %PT:n eduksi.","%A menettää pallon, %D vie sen pois."],
  buildup:["%A kuljettaa pallon ylös kentällä.","%A syöttää eteenpäin, hyökkäys etenee.","%HT käynnistää nopean hyökkäyksen.","%A avaa laidalle, peli laajenee.","Kärsivällistä rakentelua %HT:lta."],
  defense:["%D torjuu hyökkäyksen taklauksella.","%D puhdistaa pallon vaaravyöhykkeeltä.","%A:n keskitys karkaa suoraan maalivahdille.","%D ehtii väliin viime hetkellä!","Puolustus pakottaa %A:n kääntymään takaisin."],
  corner:["Puolustus torjuu — kulmapotku %HT:lle.","Pallo kimpoaa puolustajasta yli päätyrajan, kulmapotku %HT:lle."],
  cornerShot:["%A nousee ilmaan kulmapotkusta ja puskee!","Kulma sisään, %A iskee ensimmäisestä!"],
  freekickWon:["%A ansaitsee vapaapotkun hyvältä paikalta.","%D rikkoo, vapaapotku vaaralliselta alueelta."],
  freekickShot:["%A asettuu vapaapotkun taakse ja laukoo!","%A kaartaa vapaapotkun kohti yläkulmaa!"],
  offside:["%A ehättää syötön taakse — paitsio!","Lippu nousee, %A oli paitsiossa."],
  chance:["%A pääsee läpi — maalipaikka!","%A laukoo rangaistusalueen reunalta!","Loistava avaus, %A yksin maalivahdin kanssa!","%A kääntää puolustajan ja vetäisee!"],
  goal:["MAALI! %A viimeistelee tyylikkäästi verkkoon!","MAALI! %A laukoo alanurkkaan, %G ei yllä!","MAALI! %A:n veto menee maalivahdin käsien välistä!","MAALI! %A puskee pallon maaliin!","MAALI! %A pyöräyttää puolustajan ja viimeistelee!"],
  rebound:["Torjunta jää eteen — %A iskee rajusti uudelleen!","Irtopallo %A:lle, hän laukoo saman tien!"],
  save:["%G torjuu loistavasti! %A ei usko silmiään.","Upea torjunta %G:lta — käsi vain ja vain väliin!","%G venyy ja ohjaa pallon kulmalle."],
  wide:["%A laukoo aivan maalin ohi!","%A vetäisee — vähän ohi maalin.","Niukasti ohi! %A pitelee päätään."],
  over:["%A ampuu reilusti yli maalin.","Liian korkealle %A:lta — yli riman."],
  blocked:["%D heittäytyy laukauksen eteen ja torjuu!","%D blokkaa vedon urheasti!"],
  woodwork:["TOLPPAA! %A:n veto kilahtaa tolpasta ulos!","RIMA! %A laukoo riman taakse — millilleen!"],
  foul:["%D rikkoo %A:ta — vapaapotku.","Tuomari viheltää: %D myöhästyi taklauksessa."],
  card:["Keltainen kortti %D:lle kovasta taklauksesta.","%D saa varoituksen — turha rike."],
  penaltyAward:["Rangaistuspotku %HT:lle! %D kaatoi %A:n alueella."],
  penaltyGoal:["MAALI! %A viimeistelee rangaistuspotkun varmasti.","MAALI! %A puskee pilkulta — %G väärään nurkkaan."],
  penaltyMiss:["%G torjuu rangaistuspotkun! Uskomatonta!","%A ampuu pilkulta ohi! Tilaisuus haaskattu."],
  flavor:["%HT pitää pallon hallinnassaan rauhallisesti.","Vauhdikasta menoa molempiin suuntiin.","Yleisö hurraa kannustaen.","%G jakaa pallon pitkällä potkulla.","Peli tasaista, kumpikaan ei pääse otteeseen."],
};
function fillT(tpl,r,hyok,puol){
  const A=`<span class="nm ${hyok.side}">${pickNimi(hyok,['H','K'],r)}</span>`;
  const D=`<span class="nm ${puol.side}">${pickNimi(puol,['P','K'],r)}</span>`;
  const G=`<span class="nm ${puol.side}">${pickNimi(puol,['MV'],r)}</span>`;
  const HT=`<span class="tm ${hyok.side}">${hyok.nimi}</span>`;
  const PT=`<span class="tm ${puol.side}">${puol.nimi}</span>`;
  return tpl.replace(/%A/g,A).replace(/%D/g,D).replace(/%G/g,G).replace(/%HT/g,HT).replace(/%PT/g,PT);
}

function simuloiOttelu(koti,vieras,seed){
  const r=mulberry32(seed); const ev=[]; let min=0,gk=0,gv=0;
  let curLbl='0', halfGoals=0, halfCards=0;
  koti.side='home'; vieras.side='away';
  [koti,vieras].forEach(t=>{t._subDone=0; t._subPlan=[56,70,82].slice(0,t.subs.length);});
  const push=(kind,tpl,h,p)=>ev.push({lbl:curLbl,kind,text:fillT(rand(tpl,r),r,h,p)});
  const goalFor=t=>{ if(t===koti)gk++; else gv++; halfGoals++; };
  const cardEvent=(h,p)=>{ halfCards++; push('kortti',T.card,h,p); };

  function finish(hyok,puol,bonus,buildTpl,depth){
    push('chance',buildTpl,hyok,puol);
    if(contest(getF(hyok,'hyokkays',min)+bonus, getF(puol,'maalivahti',min), r)){
      goalFor(hyok); ev.push({lbl:curLbl,kind:'maali',side:hyok.side,text:fillT(rand(T.goal,r),r,hyok,puol),gk,gv}); return;
    }
    const roll=r();
    if(roll<0.06){ push('chance',T.woodwork,hyok,puol); }
    else if(roll<0.42){ push('save',T.save,hyok,puol); rebound(hyok,puol,depth); }
    else if(roll<0.60){ push('defense',T.blocked,hyok,puol); rebound(hyok,puol,depth); }
    else if(roll<0.82){ push('chance',T.wide,hyok,puol); }
    else { push('chance',T.over,hyok,puol); }
  }
  function rebound(hyok,puol,depth){
    if(depth>=1) return;
    if(r()<0.28){ push('chance',T.corner,hyok,puol); if(r()<0.6) finish(hyok,puol,-4,T.rebound,depth+1); }
  }
  function subsCheck(){
    [koti,vieras].forEach(t=>{ while(t._subDone<t.subs.length && min>=t._subPlan[t._subDone]){ const sn=t.subs[t._subDone].nimi; const sName=sn.split(' ')[1]||sn; t._subDone++; ev.push({lbl:curLbl,kind:'sub',text:`Vaihto <span class="tm ${t.side}">${t.nimi}</span>: <span class="nm ${t.side}">${sName}</span> tulee kentälle tuoreena.`}); } });
  }
  function possession(){
    if(r()<0.12){const t=r()<0.5?koti:vieras; push('info',T.flavor,t,t===koti?vieras:koti); return;}
    const pKoti=getF(koti,'keskikentta',min)/(getF(koti,'keskikentta',min)+getF(vieras,'keskikentta',min));
    const hyok=r()<pKoti?koti:vieras, puol=hyok===koti?vieras:koti;
    if(r()<0.06) cardEvent(hyok,puol);
    if(!contest(getF(hyok,'keskikentta',min),getF(puol,'keskikentta',min),r)){ push('turnover',T.turnover,hyok,puol); return; }
    if(r()<0.3) push('info',T.buildup,hyok,puol);
    if(!contest(getF(hyok,'hyokkays',min),getF(puol,'puolustus',min),r)){
      const roll=r();
      if(roll<0.12) push('chance',T.offside,hyok,puol);
      else if(roll<0.30){ push('chance',T.corner,hyok,puol); if(r()<0.5) finish(hyok,puol,-3,T.cornerShot,0); }
      else if(roll<0.42){ push('rike',T.freekickWon,hyok,puol); if(r()<0.45) finish(hyok,puol,-2,T.freekickShot,0); }
      else push('defense',T.defense,hyok,puol);
      return;
    }
    if(r()<0.04){
      push('rike',T.penaltyAward,hyok,puol);
      if(contest(getF(hyok,'hyokkays',min)+6,getF(puol,'maalivahti',min),r)){ goalFor(hyok); ev.push({lbl:curLbl,kind:'maali',side:hyok.side,text:fillT(rand(T.penaltyGoal,r),r,hyok,puol),gk,gv}); }
      else push('save',T.penaltyMiss,hyok,puol);
      return;
    }
    finish(hyok,puol,0,T.chance,0);
  }
  function playHalf(startMin,endMin){
    min=startMin; halfGoals=0; halfCards=0;
    while(min<endMin){
      min+=2+Math.floor(r()*4);
      if(min>=endMin){ min=endMin; break; }
      curLbl=`${min}`; subsCheck(); possession();
    }
    // Lisäaika kasvaa puoliajan maalien ja keltaisten korttien mukaan
    const lisa=clamp(1+halfGoals+halfCards+(r()<0.5?0:1),1,7);
    curLbl=`${endMin}`;
    ev.push({lbl:`${endMin}`,kind:'lisa',text:`Neljäs tuomari ilmoittaa: lisäaikaa ${lisa} minuuttia.`});
    for(let k=1;k<=lisa;k++){ curLbl=`${endMin}+${k}`; subsCheck(); possession(); }
    return curLbl; // esim. "90+6"
  }

  ev.push({lbl:'0',kind:'info',text:'Tuomari viheltää ottelun käyntiin!'});
  const htLbl=playHalf(0,45);
  ev.push({lbl:htLbl,kind:'info',text:'⏱ Puoliaika.'});
  const ftLbl=playHalf(45,90);
  ev.push({lbl:ftLbl,kind:'info',text:'Tuomari viheltää ottelun päättyneeksi!'});
  return {ev,gk,gv};
}
function arvoVastustaja(taso){
  const r=Math.random; const nimi=rand(VASTUSTAJAT,r);
  const paikat=['MV','P','P','P','K','K','K','H'];
  const players=paikat.map(paikka=>{const p={paikka,nimi:arvoNimi(r)};ATTRS.forEach(a=>p[a]=clamp(Math.round(taso+(r()-0.5)*26),30,95));return p;});
  const subs=[{paikka:'K',nimi:arvoNimi(r)},{paikka:'H',nimi:arvoNimi(r)}];
  const acc={MV:[],P:[],K:[],H:[]}; players.forEach(p=>acc[p.paikka].push(slotBase(p,p.paikka)));
  const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:30;
  return {nimi,players,subs,forces:{maalivahti:avg(acc.MV),puolustus:avg(acc.P),keskikentta:avg(acc.K),hyokkays:avg(acc.H)}};
}

/* ═══ YLEINEN RENDER ═══ */
function renderWallet(){$('#w-balls').textContent=state.footballs; save();}
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(t._tm);t._tm=setTimeout(()=>t.classList.remove('show'),2400);}
function rarTag(h){const t=RAR[h];return `<span class="rar-tag" style="background:${t.vari}22;color:${t.vari};">${t.lyhyt}</span>`;}

/* ═══ TALLENNUS (palvelin emon kautta + paikallinen välimuisti) + SALDON SYNKRONOINTI ═══ */
let STORE_KEY='tekstifutis:anon';
let _saveTimer=null;
function snapshot(){ return {
  footballs:state.footballs, lastReal:state.lastReal, pity:state.pity,
  collection:state.collection, mythics:state.mythics, formation:state.formation, placements:state.placements,
  subs:state.subs, teamName:state.teamName, history:state.history, _id:_id
}; }
function save(){
  const snap=snapshot();
  try{ localStorage.setItem(STORE_KEY, JSON.stringify(snap)); }catch(e){}   // nopea välimuisti + offline
  if(_saveTimer)clearTimeout(_saveTimer);
  _saveTimer=setTimeout(()=>{ try{ window.parent.postMessage({type:'futis-save', state:snapshot()},'*'); }catch(e){} }, 800);
}
function load(){ try{ const s=localStorage.getItem(STORE_KEY); return s?JSON.parse(s):null; }catch(e){ return null; } }
// Tuo main-appissa ansaitut uudet jalkapallot peliin (vain kasvu lisätään lompakkoon)
function applyBalance(bal){
  if(typeof bal!=='number'||isNaN(bal))return;
  if(state.lastReal==null){ state.lastReal=bal; }
  else if(bal>state.lastReal){ state.footballs+=(bal-state.lastReal); state.lastReal=bal; }
  else { state.lastReal=bal; }
}


/* ═══ VETO ═══ */
function renderPity(){const j=10-state.pity;$('#pity-note').textContent=`Takuu: ${j} veto${j===1?'':'a'} seuraavaan vähintään harvinaiseen.`;}
function renderCapNote(){const n=state.collection.length;const cn=$('#cap-note');if(cn)cn.innerHTML=`Kokoelma <b style="color:${n>=MAX_COLLECTION?'var(--warn)':'var(--text)'}">${n}/${MAX_COLLECTION}</b>${n>=MAX_COLLECTION?' — täynnä, myy pelaajia ostaaksesi lisää.':''}`;}
function buyBtnHTML(role,label,cost,badgeClass,badgeText){return `<button class="buy-btn" data-role="${role||''}" data-cost="${cost}"><span class="bb-badge ${badgeClass}">${badgeText}</span><span class="bb-label">${label}</span><span class="bb-cost">${cost} ⚽</span></button>`;}
function renderBuyButtons(){
  $('#buy-random').innerHTML=buyBtnHTML('','Satunnainen pelaaja',PAKETTI_HINTA,'rnd','?');
  $('#buy-roles').innerHTML=['MV','P','K','H'].map(role=>buyBtnHTML(role,PAIKAT[role],ROOLI_HINTA,'pos-'+role,role)).join('');
  document.querySelectorAll('.buy-btn').forEach(b=>b.onclick=()=>ostoVahvistus(b.dataset.role||null,+b.dataset.cost));
}
function ostoVahvistus(role,cost){
  const after=state.footballs-cost; const eiVaraa=after<0; const tayna=state.collection.length>=MAX_COLLECTION;
  const otsikko=role?`${PAIKAT[role]} (taattu rooli)`:'Satunnainen pelaaja';
  const badge=role?`<div class="dt-pos pos-${role}">${role}</div>`:`<div class="dt-pos bb-badge rnd" style="width:46px;height:46px;border-radius:11px;font-size:18px;">?</div>`;
  let est=''; if(tayna)est=`<div class="dt-warn">Kokoelma on täynnä (${MAX_COLLECTION}). Myy pelaajia ennen ostoa.</div>`;
  else if(eiVaraa)est=`<div class="dt-warn">Sinulla ei ole tarpeeksi jalkapalloja.</div>`;
  const disabled=(eiVaraa||tayna)?'disabled':'';
  sheet.innerHTML=`<div class="sheet-grab"></div>
    <div class="dt-head" style="margin-bottom:6px;">${badge}<div><div class="dt-name" style="font-size:20px;">Vahvista osto</div><div class="dt-meta">${otsikko}</div></div></div>
    ${est}
    <div style="margin:14px 0 18px;">
      <div class="confirm-line"><span style="color:var(--muted)">Hinta</span><span class="cl-v" style="color:var(--gold)">${cost} ⚽</span></div>
      <div class="confirm-line"><span style="color:var(--muted)">Saldo nyt</span><span class="cl-v">${state.footballs} ⚽</span></div>
      <div class="confirm-line"><span style="color:var(--muted)">Saldo oston jälkeen</span><span class="cl-v ${eiVaraa?'bad':'good'}">${after} ⚽</span></div>
    </div>
    <div class="sheet-actions">
      <button class="btn btn-gold" data-go ${disabled}>Vahvista osto</button>
      <button class="btn btn-ghost" data-cancel>Peruuta</button>
    </div>`;
  const go=sheet.querySelector('[data-go]'); if(go&&!disabled) go.onclick=()=>{ closeSheet(); vedaPaketti(role,cost); };
  sheet.querySelector('[data-cancel]').onclick=closeSheet;
  overlay.classList.add('show');
}
function uncollectedMythics(){
  const owned=new Set((state.mythics||[]).map(m=>m.nimi));
  return (availableMythics||[]).filter(m=>m&&m.name&&!owned.has(m.name));
}
function rarProsentit(){
  const mythAvail=uncollectedMythics().length>0;
  const pMyth=mythAvail?MYYTTINEN_TN:0;
  const total=Object.values(RAR).reduce((s,t)=>s+(t.paino||0),0);
  const scale=1-pMyth; const rows=[];
  if(mythAvail) rows.push({nimi:'myyttinen',vari:RAR.myyttinen.vari,p:pMyth*100});
  ['legenda','eeppinen','harvinainen','merkillinen','tavallinen'].forEach(k=>{
    rows.push({nimi:k,vari:RAR[k].vari,p:scale*(RAR[k].paino/total)*100});
  });
  return rows;
}
function vedaPaketti(forcedRole,cost){
  cost=cost||PAKETTI_HINTA;
  if(state.collection.length>=MAX_COLLECTION){toast('Kokoelma täynnä — myy pelaajia.');return;}
  if(state.footballs<cost){toast(`Tarvitset ${cost-state.footballs} ⚽ lisää.`);return;}
  state.footballs-=cost;
  // Myyttinen ultraharvinainen osuma
  const avail=uncollectedMythics();
  if(avail.length && Math.random()<MYYTTINEN_TN){
    const pick=avail[Math.floor(Math.random()*avail.length)];
    const card={id:uid(),nimi:pick.name,paikka:pick.paikka||'H',harvinaisuus:'myyttinen',mythic:true};
    ATTRS.forEach(a=>card[a]=100);
    (state.mythics=state.mythics||[]).push(card);
    state.pity=0; renderWallet(); renderPity(); renderCapNote(); renderProbs(); naytaMyyttinenReveal(card);
    return;
  }
  const p=arvoPelaaja(Math.random,forcedRole);
  if(p.harvinaisuus==='tavallinen')state.pity++;else state.pity=0;
  state.collection.push(p); renderWallet(); renderPity(); renderCapNote(); renderProbs(); naytaReveal(p);
  if(p.harvinaisuus==='legenda')toast('🌟 LEGENDA! Uskomaton veto!');
  else if(p.harvinaisuus==='eeppinen')toast('💜 Eeppinen pelaaja!');
}
function spawnSparkles(stage,color,count){
  for(let i=0;i<count;i++){
    const s=document.createElement('div'); s.className='sparkle';
    const ang=Math.random()*Math.PI*2, dist=70+Math.random()*90;
    s.style.setProperty('--dx',(Math.cos(ang)*dist).toFixed(0)+'px');
    s.style.setProperty('--dy',(Math.sin(ang)*dist).toFixed(0)+'px');
    s.style.background=color; s.style.boxShadow=`0 0 7px ${color}`; s.style.animationDelay=(Math.random()*0.35).toFixed(2)+'s';
    stage.appendChild(s); setTimeout(()=>s.remove(),1400);
  }
}
function naytaReveal(p){
  const r=RAR[p.harvinaisuus]; const tier=RAR_ORDER.indexOf(p.harvinaisuus);
  const stats=ATTRS.map(a=>`<div><span>${ATTR_LYHYT[a]}</span><b>${p[a]}</b></div>`).join('');
  let cardCls='reveal-card'; if(tier>=1)cardCls+=' fx-shine'; if(tier>=3)cardCls+=' fx-pulse';
  const rays=tier>=3?`<div class="fx-rays" style="--rc:${r.vari}"></div>`:'';
  const flash=tier>=4?`<div class="fx-flash" style="--rc:${r.vari}"></div>`:'';
  const stage=$('#pack-stage');
  stage.innerHTML=`${flash}<div class="reveal-wrap">${rays}<div class="${cardCls}" style="--rc:${r.vari}">
    <div class="rar">${p.harvinaisuus}</div><div class="stars">${'★'.repeat(r.tahdet)}${'☆'.repeat(5-r.tahdet)}</div>
    <div class="pname">${p.nimi}</div><div class="ppos">${PAIKAT[p.paikka]} · OVR ${ovr(p)}</div>
    <div class="reveal-stats">${stats}</div></div></div>
    <div style="font-size:12px;color:var(--muted);position:relative;z-index:3">Lisätty kokoelmaasi. Aseta hänet kentälle Joukkue-välilehdellä.</div>`;
  const sparkCount=[0,5,9,18,30][tier]; if(sparkCount)spawnSparkles(stage.querySelector('.reveal-wrap'),r.vari,sparkCount);
}
function naytaMyyttinenReveal(card){
  const stage=$('#pack-stage');
  const stats=ATTRS.map(a=>`<div><span>${ATTR_LYHYT[a]}</span><b>100</b></div>`).join('');
  stage.innerHTML=`<div class="fx-flash myth-flash"></div><div class="reveal-wrap"><div class="fx-rays myth-rays"></div>
    <div class="reveal-card myth-card fx-shine fx-pulse">
      <div class="myth-crown">🌈</div>
      <div class="rar myth-rar">MYYTTINEN</div><div class="stars myth-stars">★★★★★</div>
      <div class="pname">${card.nimi}</div><div class="ppos">${PAIKAT[card.paikka]||''} · OVR 100</div>
      <div class="reveal-stats">${stats}</div></div></div>
    <div style="font-size:12px;color:var(--muted);position:relative;z-index:3">🌈 Myyttinen keräilykortti lisätty! Katso se <b>Myyttiset</b>-välilehdeltä.</div>`;
  const wrap=stage.querySelector('.reveal-wrap');
  spawnSparkles(wrap,'#ff3cac',46); spawnSparkles(wrap,'#7c4dff',34); spawnSparkles(wrap,'#22d3ee',26);
  const l=fxLayer();
  const boom=document.createElement('div'); boom.className='myth-boom'; l.appendChild(boom); setTimeout(()=>boom.remove(),1300);
  burstConfetti(80); rainConfetti(110);
  const banner=document.createElement('div'); banner.className='myth-banner'; banner.textContent='🌈 MYYTTINEN! 🌈'; l.appendChild(banner); setTimeout(()=>banner.remove(),2800);
  setTimeout(()=>burstConfetti(60),380); setTimeout(()=>rainConfetti(70),820); setTimeout(()=>burstConfetti(50),1250);
  toast('🌈 MYYTTINEN PELAAJA! Uskomatonta tuuria!');
}
function renderProbs(){
  const el=$('#prob-list'); if(!el)return;
  el.innerHTML=rarProsentit().map(r=>{
    const pct=r.p<1?r.p.toFixed(2):(r.p<10?r.p.toFixed(1):Math.round(r.p).toString());
    const cls=r.nimi==='myyttinen'?' prob-myth':'';
    return `<div class="prob-row${cls}"><span class="prob-dot" style="background:${r.vari}"></span><span class="prob-name">${r.nimi}</span><span class="prob-pct">${pct} %</span></div>`;
  }).join('');
}
function renderMyyttiset(){
  const el=$('#myth-area'); if(!el)return;
  const list=state.mythics||[]; const total=(availableMythics||[]).length; const owned=list.length;
  if(!total){ el.innerHTML=`<div class="myth-empty">Joukkueellesi ei ole vielä lisätty myyttisiä pelaajia.<br>Valmentaja voi lisätä niitä sovelluksen valmentaja-asetuksissa.</div>`; return; }
  const cards=list.length?list.map(m=>`
    <div class="myth-collect-card">
      <div class="mcc-crown">🌈</div>
      <div class="mcc-name">${m.nimi}</div>
      <div class="mcc-pos">${PAIKAT[m.paikka]||''} · OVR 100</div>
      <div class="mcc-attrs">${ATTRS.map(a=>`<span><b>${ATTR_LYHYT[a]}</b> 100</span>`).join('')}</div>
      <div class="mcc-tag">MYYTTINEN</div>
    </div>`).join('')
    :`<div class="myth-empty">Et ole vielä saanut yhtään myyttistä. Ne ovat <b>erittäin</b> harvinaisia — jatka pakettien avaamista Veto-välilehdellä!</div>`;
  el.innerHTML=`<div class="myth-progress">Kerätty <b>${owned}/${total}</b> myyttistä</div><div class="myth-grid">${cards}</div>`;
}

/* ═══ JOUKKUE ═══ */
function renderFormrow(){
  $('#formrow').innerHTML=Object.keys(FORMATIONS).map(f=>`<button class="formbtn ${f===state.formation?'active':''}" data-form="${f}">${f}</button>`).join('');
  $('#formrow').querySelectorAll('[data-form]').forEach(b=>b.onclick=()=>vaihdaMuoto(b.dataset.form));
}
function vaihdaMuoto(f){const placed=placedPlayers();state.formation=f;state.placements=autoFit(placed);renderJoukkue();}
function autoFit(pool){
  const slots=FORMATIONS[state.formation].slots; const pl=new Array(slots.length).fill(null);
  const p=[...pool].sort((a,b)=>ovr(b)-ovr(a));
  slots.forEach((s,i)=>{const idx=p.findIndex(x=>x.paikka===s.role);if(idx>=0){pl[i]=p[idx].id;p.splice(idx,1);}});
  slots.forEach((s,i)=>{if(pl[i]===null&&p.length)pl[i]=p.shift().id;});
  return pl;
}
function renderForces(){
  const f=teamForces(); const map=[['MV','maalivahti'],['PUO','puolustus'],['KES','keskikentta'],['HYÖ','hyokkays']];
  $('#forces').innerHTML=map.map(([l,k])=>`<div class="force"><div class="fl">${l}</div><div class="fv">${Math.round(f[k])}</div></div>`).join('');
}
function cardHTML(p,off){
  const c=RAR[p.harvinaisuus].vari;
  const chips=KEY_ATTRS[p.paikka].map(a=>`<div class="sc-chip"><span>${ATTR_LYHYT[a]}</span><span class="v">${p[a]}</span></div>`).join('');
  return `<div class="slot-card" style="--cardc:${c}">${off?'<div class="sc-warn">!</div>':''}
    <div class="sc-name">${sur(p)}</div>
    <div class="sc-body"><div class="sc-ovr">${ovr(p)}</div><div class="sc-attrs"><span class="sc-role pos-${p.paikka}">${ROOLI_LYHYT[p.paikka]}</span>${chips}</div></div></div>`;
}
function renderPitch(){
  const slots=FORMATIONS[state.formation].slots;
  let m=`<div class="m m-half"></div><div class="m m-circle"></div><div class="m m-spot"></div><div class="m m-box top"></div><div class="m m-box bot"></div><div class="m m-goal top"></div><div class="m m-goal bot"></div>`;
  slots.forEach((s,i)=>{
    const p=getPlayer(state.placements[i]);
    if(!p) m+=`<button class="slot" data-slot="${i}" style="left:${s.x}%;top:${s.y}%"><div class="slot-empty"><span class="se-role">${s.role}</span><span class="se-plus">+</span></div></button>`;
    else m+=`<button class="slot" data-slot="${i}" style="left:${s.x}%;top:${s.y}%">${cardHTML(p,p.paikka!==s.role)}</button>`;
  });
  const pitch=$('#pitch'); pitch.innerHTML=m;
  pitch.querySelectorAll('[data-slot]').forEach(b=>{const i=+b.dataset.slot;const pid=state.placements[i];
    makeDraggable(b,{pid,tap:()=> pid?openDetail(pid):openPicker({z:'field',i})});});
}
function renderSubs(){
  $('#sub-label').textContent=`Vaihtopenkki · ${state.subs.filter(Boolean).length}/${SUB_SLOTS}`;
  const row=$('#subrow');
  row.innerHTML=state.subs.map((pid,j)=>{
    const p=getPlayer(pid);
    if(!p) return `<div class="subcell empty" data-sub="${j}"><span class="se-plus">+</span><span class="se-tx">Vaihto</span></div>`;
    const ka=KEY_ATTRS[p.paikka].map(a=>`${ATTR_LYHYT[a]} ${p[a]}`).join(' · ');
    return `<div class="subcell" data-sub="${j}" style="--cardc:${RAR[p.harvinaisuus].vari}">
      <div class="sub-top"><span class="sub-badge pos-${p.paikka}">${p.paikka}</span><span class="sub-name">${sur(p)}</span></div>
      <div class="sub-bot"><span class="sub-ovr">${ovr(p)}</span><span class="sub-attrs">${ka}</span></div></div>`;
  }).join('');
  row.querySelectorAll('[data-sub]').forEach(c=>{const j=+c.dataset.sub;const pid=state.subs[j];
    makeDraggable(c,{pid,tap:()=> pid?openDetail(pid):openPicker({z:'sub',i:j})});});
}
function renderBench(){
  const area=$('#bench-area'); const onField=new Set(state.placements.filter(Boolean)); const onSub=new Set(state.subs.filter(Boolean));
  const bench=state.collection.filter(p=>!onField.has(p.id)&&!onSub.has(p.id));
  if(state.collection.length===0){area.innerHTML=`<div class="empty"><div class="ee">👤</div><b>Ei pelaajia</b><div style="font-size:13px;">Avaa paketti Veto-välilehdeltä.</div></div>`;return;}
  let html=`<div class="section-label">Kokoelma · ${state.collection.length}/${MAX_COLLECTION}</div>`;
  html+= bench.length? `<div class="plist">${bench.map(prowBench).join('')}</div>` : `<div class="empty" style="padding:14px;"><div style="font-size:13px;">Kaikki pelaajasi ovat kentällä tai vaihtopenkillä.</div></div>`;
  area.innerHTML=html;
  area.querySelectorAll('.prow').forEach(row=>{const pid=+row.dataset.pid;
    makeDraggable(row,{pid,tap:()=>openDetail(pid)});});
}
function prowBench(p){
  const r=RAR[p.harvinaisuus]; const ka=KEY_ATTRS[p.paikka].map(a=>`${ATTR_LYHYT[a]} ${p[a]}`).join(' · ');
  return `<div class="prow" data-pid="${p.id}"><div class="pos-badge pos-${p.paikka}">${p.paikka}</div>
    <div class="pinfo"><div class="pn">${p.nimi} ${rarTag(p.harvinaisuus)}</div><div class="pst">${PAIKAT[p.paikka]} · ${ka}</div></div>
    <div class="ovr" style="color:${r.vari}">${ovr(p)}</div><div class="grip" title="Vedä">⠿</div></div>`;
}
function renderJoukkue(){renderFormrow();renderForces();renderPitch();renderSubs();renderBench();$('#teamname').value=state.teamName==='Oma joukkue'?'':state.teamName;save();}
function autofillAll(){const onSub=new Set(state.subs.filter(Boolean));state.placements=autoFit(state.collection.filter(p=>!onSub.has(p.id)));renderJoukkue();toast('Kenttä täytetty parhailla pelaajilla.');}

/* ═══ DRAG & DROP ═══ */
const DRAG_THRESH=6; let drag=null;
function makeDraggable(el,info){ el.addEventListener('pointerdown',e=>onDragDown(e,el,info)); }
function onDragDown(e,el,info){
  if(e.pointerType==='mouse'&&e.button!==0) return;
  e.preventDefault();
  drag={...info,el,pointerId:e.pointerId,startX:e.clientX,startY:e.clientY,dragging:false,canceled:false,ghost:null,target:null};
  try{el.setPointerCapture(e.pointerId);}catch(_){}
  el.addEventListener('pointermove',onDragMove); el.addEventListener('pointerup',onDragUp); el.addEventListener('pointercancel',onDragUp);
}
function onDragMove(e){
  if(!drag) return;
  if(!drag.dragging){
    if(Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)<DRAG_THRESH) return;
    if(!drag.pid){drag.canceled=true;return;}
    drag.dragging=true; document.body.classList.add('dragging');
    const sel=window.getSelection&&window.getSelection(); if(sel)try{sel.removeAllRanges();}catch(_){}
    createGhost();
  }
  e.preventDefault();
  drag.ghost.style.left=e.clientX+'px'; drag.ghost.style.top=e.clientY+'px'; updateTarget(e.clientX,e.clientY);
}
function onDragUp(){
  if(!drag) return; const el=drag.el;
  el.removeEventListener('pointermove',onDragMove); el.removeEventListener('pointerup',onDragUp); el.removeEventListener('pointercancel',onDragUp);
  try{el.releasePointerCapture(drag.pointerId);}catch(_){}
  document.body.classList.remove('dragging');
  if(drag.dragging){ performDrop(); if(drag.ghost)drag.ghost.remove(); clearDropHi(); }
  else if(!drag.canceled && typeof drag.tap==='function'){ drag.tap(); }
  drag=null;
}
function createGhost(){
  const p=getPlayer(drag.pid); const g=document.createElement('div'); g.className='drag-ghost';
  g.innerHTML=`<div class="ghost-card" style="--cardc:${RAR[p.harvinaisuus].vari}"><div class="gc-ovr">${ovr(p)}</div><div class="gc-name">${sur(p)}</div></div>`;
  document.body.appendChild(g); drag.ghost=g; g.style.left=drag.startX+'px'; g.style.top=drag.startY+'px';
}
function clearDropHi(){document.querySelectorAll('.drop-hi').forEach(x=>x.classList.remove('drop-hi'));const b=$('#bench-area');if(b)b.classList.remove('drop-hi-zone');}
function updateTarget(x,y){
  drag.ghost.style.display='none'; const el=document.elementFromPoint(x,y); drag.ghost.style.display=''; clearDropHi(); drag.target=null;
  const slot=el&&el.closest('.slot'); const sub=el&&el.closest('.subcell'); const bench=el&&el.closest('#bench-area');
  if(slot){slot.classList.add('drop-hi');drag.target={z:'field',i:+slot.dataset.slot};}
  else if(sub){sub.classList.add('drop-hi');drag.target={z:'sub',i:+sub.dataset.sub};}
  else if(bench&&locOf(drag.pid).z!=='pool'){bench.classList.add('drop-hi-zone');drag.target={z:'pool'};}
}
function performDrop(){const t=drag.target; if(!t){renderJoukkue();return;} moveTo(drag.pid,t);}

/* ═══ MODAALIT ═══ */
const overlay=$('#overlay'), sheet=$('#sheet');
function closeSheet(){overlay.classList.remove('show');}
overlay.onclick=e=>{if(e.target===overlay)closeSheet();};
function myyPelaaja(pid){const p=getPlayer(pid);if(!p)return;const h=RAR[p.harvinaisuus].hinta;state.footballs+=h;const l=locOf(pid);if(l.z==='field')state.placements[l.i]=null;else if(l.z==='sub')state.subs[l.i]=null;state.collection=state.collection.filter(x=>x.id!==pid);renderWallet();renderJoukkue();renderCapNote();toast(`Myit pelaajan: +${h} ⚽`);}
function openDetail(pid){
  const p=getPlayer(pid); if(!p)return; const r=RAR[p.harvinaisuus]; const loc=locOf(pid);
  let slotRole=null,off=false; if(loc.z==='field'){slotRole=FORMATIONS[state.formation].slots[loc.i].role;off=slotRole!==p.paikka;}
  const keys=KEY_ATTRS[p.paikka];
  const attrsHtml=ATTRS.map(a=>{const k=keys.includes(a);return `<div class="attr ${k?'key':''}"><div class="al">${k?'<span class="star">★</span>':''}${ATTR_NIMI[a]}</div><div class="bar"><div class="fill" style="width:${p[a]}%"></div></div><div class="av">${p[a]}</div></div>`;}).join('');
  let warn=''; if(off){const f=Math.round(mismatchFactor(p.paikka,slotRole)*100);warn=`<div class="dt-warn">⚠ Pelaa paikalla ${PAIKAT[slotRole]} vaikka on ${PAIKAT[p.paikka].toLowerCase()}. Teho tällä paikalla noin ${f} %.</div>`;}
  let actions='';
  if(loc.z==='field') actions=`<button class="btn btn-ghost" data-act="swap">Vaihda pelaaja</button><button class="btn btn-ghost" data-act="tosub">Siirrä vaihtopenkille</button><button class="btn btn-ghost" data-act="remove">Poista kokoelmaan</button>`;
  else if(loc.z==='sub') actions=`<button class="btn btn-primary" data-act="tofield">Siirrä kentälle</button><button class="btn btn-ghost" data-act="remove">Poista kokoelmaan</button>`;
  else actions=`<button class="btn btn-primary" data-act="tofield">Aseta kentälle</button><button class="btn btn-ghost" data-act="tosub">Vaihtopenkille</button>`;
  actions+=`<button class="btn btn-danger" data-act="sell">Myy ${r.hinta} ⚽</button>`;
  sheet.innerHTML=`<div class="sheet-grab"></div><div class="dt-head"><div class="dt-pos pos-${p.paikka}">${ROOLI_LYHYT[p.paikka]}</div><div><div class="dt-name">${p.nimi}</div><div class="dt-meta">${PAIKAT[p.paikka]} ${rarTag(p.harvinaisuus)}</div></div><div class="dt-ovr" style="color:${r.vari}">${ovr(p)}</div></div>${warn}<div class="attrs">${attrsHtml}</div><div class="sheet-actions">${actions}</div>`;
  sheet.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>{const a=b.dataset.act;
    if(a==='sell'){myyPelaaja(pid);closeSheet();}
    else if(a==='remove'){moveTo(pid,{z:'pool'});closeSheet();}
    else if(a==='tofield'){const i=emptyField();if(i<0){toast('Kenttä on täynnä.');return;}moveTo(pid,{z:'field',i});closeSheet();}
    else if(a==='tosub'){const j=emptySub();if(j<0){toast('Vaihtopenkki on täynnä.');return;}moveTo(pid,{z:'sub',i:j});closeSheet();}
    else if(a==='swap'){openPicker({z:'field',i:loc.i});}});
  overlay.classList.add('show');
}
function openPicker(dest){
  const role=dest.z==='field'?FORMATIONS[state.formation].slots[dest.i].role:null;
  const occ=dest.z==='field'?state.placements[dest.i]:state.subs[dest.i];
  const avail=state.collection.filter(p=>locOf(p.id).z==='pool'||p.id===occ);
  avail.sort((a,b)=>{if(role){const am=a.paikka===role?0:1,bm=b.paikka===role?0:1;if(am!==bm)return am-bm;}return ovr(b)-ovr(a);});
  const title=dest.z==='field'?`Valitse pelaaja · ${PAIKAT[role]}`:'Valitse vaihtopelaaja';
  const rows=avail.length? avail.map(p=>{const match=role&&p.paikka===role;const ka=KEY_ATTRS[p.paikka].map(a=>`${ATTR_LYHYT[a]} ${p[a]}`).join(' · ');
    const tag=role?`<span class="pick-tag ${match?'ok':'off'}">${match?'Oikea paikka':'Eri rooli'}</span>`:'';
    return `<button class="pick-row ${match?'match':''}" data-pick="${p.id}"><div class="pos-badge pos-${p.paikka}">${p.paikka}</div><div class="pinfo"><div class="pn">${p.nimi}</div><div class="pst">${PAIKAT[p.paikka]} · ${ka}</div></div><div class="ovr" style="color:${RAR[p.harvinaisuus].vari}">${ovr(p)}</div>${tag}</button>`;}).join('')
    : `<div class="empty" style="padding:24px;"><div style="font-size:13px;">Ei vapaita pelaajia. Avaa paketti tai vapauta joku.</div></div>`;
  sheet.innerHTML=`<div class="sheet-grab"></div><div class="dt-head" style="margin-bottom:14px;"><div class="dt-pos pos-${role||'K'}">${role?role:'⇄'}</div><div><div class="dt-name" style="font-size:18px;">${title}</div></div></div><div class="pick-list">${rows}</div>`;
  sheet.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{moveTo(+b.dataset.pick,dest);closeSheet();});
  overlay.classList.add('show');
}

/* ═══ JUHLINTA & HISTORIA ═══ */
function fxLayer(){let l=$('#fx-layer');if(!l){l=document.createElement('div');l.id='fx-layer';document.body.appendChild(l);}return l;}
const CONF_VARIT=['#2ee06a','#fbbf24','#3b82f6','#a855f7','#ffffff','#2ecc71'];
function goalFlash(side){const l=fxLayer();const f=document.createElement('div');f.className='goal-flash'+(side==='away'?' away':'');l.appendChild(f);setTimeout(()=>f.remove(),900);}
function burstConfetti(n){const l=fxLayer();for(let i=0;i<n;i++){const c=document.createElement('div');c.className='confetti';const ang=Math.random()*Math.PI*2,dist=120+Math.random()*240;c.style.left='50%';c.style.top='36%';c.style.background=CONF_VARIT[i%CONF_VARIT.length];c.style.setProperty('--bx',(Math.cos(ang)*dist).toFixed(0)+'px');c.style.setProperty('--by',(Math.sin(ang)*dist-50).toFixed(0)+'px');c.style.animation=`confBurst ${(0.9+Math.random()*0.6).toFixed(2)}s ease forwards`;l.appendChild(c);setTimeout(()=>c.remove(),1700);}}
function rainConfetti(n){const l=fxLayer();for(let i=0;i<n;i++){const c=document.createElement('div');c.className='confetti';c.style.left=(Math.random()*100)+'vw';c.style.top='-30px';c.style.background=CONF_VARIT[i%CONF_VARIT.length];c.style.animation=`confFall ${(2.2+Math.random()*1.8).toFixed(2)}s linear ${(Math.random()*0.9).toFixed(2)}s forwards`;l.appendChild(c);setTimeout(()=>c.remove(),4600);}}
function celebrateGoal(){const l=fxLayer();const b=document.createElement('div');b.className='goal-banner';b.textContent='⚽ MAALI!';l.appendChild(b);setTimeout(()=>b.remove(),1600);burstConfetti(46);}
function celebrateWin(){const l=fxLayer();rainConfetti(75);const o=document.createElement('div');o.className='win-overlay';o.innerHTML=`<div class="win-card"><div class="win-trophy">🏆</div><div class="win-title">VOITTO!</div></div>`;l.appendChild(o);setTimeout(()=>o.remove(),2700);}

function renderHistoria(){
  const area=$('#hist-area');
  if(!state.history.length){area.innerHTML=`<div class="empty"><div class="ee">📋</div><b>Ei vielä otteluita</b><div style="font-size:13px;">Pelaa ottelu Ottelu-välilehdellä, niin tulos tallentuu tänne.</div></div>`;return;}
  const merkki={win:'V',draw:'T',loss:'H'};
  const v=state.history.filter(h=>h.tulos==='win').length, t=state.history.filter(h=>h.tulos==='draw').length, h=state.history.filter(h=>h.tulos==='loss').length;
  let html=`<div class="forces" style="grid-template-columns:repeat(3,1fr)"><div class="force"><div class="fl">Voitot</div><div class="fv" style="color:var(--grass)">${v}</div></div><div class="force"><div class="fl">Tasapelit</div><div class="fv">${t}</div></div><div class="force"><div class="fl">Tappiot</div><div class="fv" style="color:#f1948a">${h}</div></div></div>`;
  html+=`<div class="hist-list">`+state.history.map(m=>`<div class="hist-row ${m.tulos}">
    <div class="hist-res ${m.tulos}">${merkki[m.tulos]}</div>
    <div class="hist-teams">${m.koti}<span class="ht-vs"> vs </span>${m.vieras}</div>
    <div class="hist-score"><span class="hs-h">${m.gk}</span>–<span class="hs-a">${m.gv}</span></div></div>`).join('')+`</div>`;
  area.innerHTML=html;
}

/* ═══ OTTELU ═══ */
let pelaaKaynnissa=false;
function renderOttelu(){
  const area=$('#match-area'); const n=state.placements.filter(Boolean).length;
  if(n<5){area.innerHTML=`<div class="empty"><div class="ee">🧤</div><b>Kokoonpano kesken</b><div style="font-size:13px;">Aseta vähintään 5 pelaajaa kentälle (nyt ${n}/8). Käy Joukkue-välilehdellä.</div></div>`;return;}
  if(!area.querySelector('#feed')){
    area.innerHTML=`<div class="scoreboard"><div class="sb-teams"><div class="sb-name home" id="sb-home">${state.teamName}</div><div class="sb-score" id="sb-score">0–0</div><div class="sb-name away" id="sb-away">Vastustaja</div></div><div class="sb-min" id="sb-min">Valmiina otteluun</div></div><button class="btn btn-primary" id="btn-play">Pelaa ottelu</button><div class="feed" id="feed"></div>`;
    $('#btn-play').onclick=pelaaOttelu;
  } else $('#sb-home').textContent=state.teamName;
}
function pelaaOttelu(){
  if(pelaaKaynnissa)return; pelaaKaynnissa=true;
  const btn=$('#btn-play'); btn.disabled=true; btn.textContent='Ottelu käynnissä…';
  const feed=$('#feed'); feed.innerHTML=''; const old=document.querySelector('.result-banner'); if(old)old.remove();
  const koti={nimi:state.teamName,players:placedPlayers().map(p=>({nimi:p.nimi,paikka:p.paikka})),subs:subPlayers().map(p=>({nimi:p.nimi,paikka:p.paikka})),forces:teamForces()};
  const vieras=arvoVastustaja(placedAvg());
  $('#sb-home').textContent=state.teamName; $('#sb-away').textContent=vieras.nimi; $('#sb-score').textContent='0–0';
  const seed=(Date.now()^(Math.random()*1e9))>>>0; const {ev,gk,gv}=simuloiOttelu(koti,vieras,seed);
  let i=0;
  (function step(){
    if(i>=ev.length){paataOttelu(vieras,gk,gv,btn);return;}
    const e=ev[i++]; const lbl=e.lbl||'0';
    $('#sb-min').textContent= lbl==='0'?'Alkupotku':(lbl.includes('+')?`Lisäaika ${lbl}`:`${lbl}. minuutti`);
    let cls='ev';
    if(e.kind==='maali'){ cls+=' goal '+(e.side==='home'?'goal-home':'goal-away'); }
    else if(e.kind){ cls+=' '+e.kind; }
    if(e.kind==='maali'){
      const sc=$('#sb-score'); sc.textContent=`${e.gk}–${e.gv}`;
      sc.classList.remove('flash-home','flash-away'); void sc.offsetWidth;
      sc.classList.add(e.side==='home'?'flash-home':'flash-away');
      goalFlash(e.side); if(e.side==='home') celebrateGoal();
    }
    const icon = e.kind==='maali'?'⚽ ' : e.kind==='kortti'?'🟨 ' : e.kind==='lisa'?'⏱ ' : '';
    const d=document.createElement('div'); d.className=cls; d.innerHTML=`<span class="emin">${lbl}'</span><span class="etxt">${icon}${e.text}</span>`; feed.prepend(d);
    const delay=e.kind==='maali'?1300:(e.kind==='chance'||e.kind==='save')?900:(e.kind==='info'||e.kind==='sub'||e.kind==='lisa')?640:740;
    setTimeout(step,delay);
  })();
}
function paataOttelu(vieras,gk,gv,btn){
  pelaaKaynnissa=false; btn.disabled=false; btn.textContent='Pelaa uusi ottelu'; $('#sb-min').textContent='Päättynyt';
  let palkkio,luokka,otsikko;
  if(gk>gv){luokka='win';otsikko='Voitto!';palkkio=25;} else if(gk<gv){luokka='loss';otsikko='Tappio';palkkio=5;} else {luokka='draw';otsikko='Tasapeli';palkkio=12;}
  state.footballs+=palkkio; renderWallet();
  state.history.unshift({koti:state.teamName, vieras:vieras.nimi, gk, gv, tulos:luokka, aika:Date.now()});
  const b=document.createElement('div'); b.className='result-banner '+luokka; b.innerHTML=`<div class="rt">${otsikko}</div><div class="rr">${state.teamName} ${gk}–${gv} ${vieras.nimi} · +${palkkio} ⚽</div>`;
  $('#match-area').appendChild(b); toast(`Ottelu päättyi — +${palkkio} ⚽`);
  if(luokka==='win') celebrateWin();
}

/* ═══ VÄLILEHDET ═══ */
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));
  t.classList.add('active'); $('#view-'+t.dataset.tab).classList.add('active');
  if(t.dataset.tab==='joukkue')renderJoukkue(); if(t.dataset.tab==='ottelu')renderOttelu(); if(t.dataset.tab==='veto'){renderPity();renderProbs();} if(t.dataset.tab==='historia')renderHistoria(); if(t.dataset.tab==='myyttiset')renderMyyttiset();
});
$('#btn-autofill').onclick=autofillAll;
$('#teamname').addEventListener('input',e=>{state.teamName=e.target.value.trim()||'Oma joukkue';save();});

/* ═══ ALOITUS ═══ */
function annaAloitus(){
  const r=Math.random; ['MV','P','P','P','K','K','K','H','H'].forEach(paikka=>{
    const harv='tavallinen'; const[lo,hi]=RAR[harv].vali;
    const p={id:uid(),nimi:arvoNimi(r),paikka,harvinaisuus:harv}; ATTRS.forEach(a=>p[a]=lo+Math.floor(r()*(hi-lo+1)));
    if(paikka==='MV'){p.puolustus=clamp(p.puolustus+8,1,99);p.fyysisyys=clamp(p.fyysisyys+5,1,99);}
    if(paikka==='P')p.puolustus=clamp(p.puolustus+8,1,99);
    if(paikka==='K')p.syotto=clamp(p.syotto+8,1,99);
    if(paikka==='H')p.laukaus=clamp(p.laukaus+8,1,99);
    state.collection.push(p);
  });
  state.placements=autoFit([...state.collection]);
}
/* ═══ ALOITUS ═══ */
/* ═══ ALOITUS (lataa palvelimelta emon kautta; välimuisti heti) ═══ */
let futisLoaded=false, initBal=null;
function applyState(obj){ if(!obj||typeof obj!=='object')return false; Object.assign(state,obj); if(typeof obj._id==='number')_id=obj._id; return true; }
function renderEverything(){
  renderWallet(); renderPity(); renderBuyButtons(); renderCapNote(); renderProbs();
  const active=document.querySelector('.tab.active'); const tabn=active?active.dataset.tab:'veto';
  if(tabn==='joukkue')renderJoukkue(); else if(tabn==='ottelu')renderOttelu(); else if(tabn==='historia')renderHistoria(); else if(tabn==='myyttiset')renderMyyttiset();
}
function finishInit(){
  if(futisLoaded)return; futisLoaded=true;
  if(!state.collection||!state.collection.length){
    if(initBal!=null){ state.footballs=initBal; state.lastReal=initBal; }
    annaAloitus();
  }
  if(initBal!=null) applyBalance(initBal);
  save();
  renderEverything();
}
window.addEventListener('message', e=>{
  const d=e.data||{};
  if(d.type==='futis-state'){
    if(typeof d.bal==='number') initBal=d.bal;
    if(Array.isArray(d.mythics)) availableMythics=d.mythics;
    if(d.state) applyState(d.state);          // palvelin on totuus
    finishInit();
  } else if(d.type==='futis-balance'){
    const b=(typeof d.bal==='number')?d.bal:parseInt(d.bal,10);
    applyBalance(b); save(); renderWallet();
  } else if(d.type==='futis-theme'){
    const r=document.documentElement;
    if(d.theme==='dark') r.setAttribute('data-theme','dark'); else r.removeAttribute('data-theme');
  }
});
function init(){
  const params=new URLSearchParams(location.search);
  const uid_=params.get('uid')||'anon'; STORE_KEY='tekstifutis:'+uid_;
  const bal=parseInt(params.get('bal')||'',10); initBal=isNaN(bal)?null:bal;
  if(params.get('theme')==='dark') document.documentElement.setAttribute('data-theme','dark');
  const cached=load(); if(cached) applyState(cached);     // näytä heti välimuistista
  try{ window.parent.postMessage({type:'futis-load'},'*'); }catch(e){}  // pyydä palvelintila emolta
  setTimeout(finishInit, 1500);   // varmistus jos emo ei vastaa (esim. avattu erikseen)
}
init();
