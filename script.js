const $ = id => document.getElementById(id);
const welcome=$('welcome'), site=$('site'), song=$('song'), playBtn=$('playBtn'), musicToggle=$('musicToggle'),
  musicLabel=$('musicLabel'), songStatus=$('songStatus'), songTime=$('songTime'), seekBar=$('seekBar'),
  eq=$('eq'), vinyl=document.querySelector('.vinyl');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const GOLD=['#f3cf8a','#fff0ce','#c9a4f2','#f29a9a','#9ed9cf','#fff','#ff8fa3'];
const rnd=(a,b)=>a+Math.random()*(b-a);

/* ---------- Canvas setup ---------- */
const fx=$('confetti'), fctx=fx.getContext('2d'), bg=$('bg'), bctx=bg.getContext('2d');
function resize(){
  const d=Math.min(devicePixelRatio||1,2);
  [[fx,fctx],[bg,bctx]].forEach(([c,x])=>{c.width=innerWidth*d;c.height=innerHeight*d;x.setTransform(d,0,0,d,0,0);});
}
addEventListener('resize',resize); resize();

/* ---------- Background: twinkling stars + rising hearts ---------- */
const stars=Array.from({length:70},()=>({x:Math.random(),y:Math.random(),r:rnd(.5,1.8),p:rnd(0,6.3),s:rnd(.01,.03)}));
const hearts=Array.from({length:16},()=>({x:Math.random(),y:Math.random(),size:rnd(10,26),v:rnd(.2,.6),sway:rnd(0,6.3),a:rnd(.08,.22)}));
function drawBg(){
  bctx.clearRect(0,0,innerWidth,innerHeight);
  stars.forEach(s=>{s.p+=s.s;bctx.globalAlpha=.25+.55*Math.abs(Math.sin(s.p));bctx.fillStyle='#fff3d6';
    bctx.beginPath();bctx.arc(s.x*innerWidth,s.y*innerHeight,s.r,0,6.3);bctx.fill();});
  bctx.textAlign='center';
  hearts.forEach(h=>{h.y-=h.v/innerHeight;h.sway+=.015;if(h.y<-.05){h.y=1.05;h.x=Math.random();}
    bctx.globalAlpha=h.a;bctx.fillStyle='#f29aa8';bctx.font=h.size+'px serif';
    bctx.fillText('♥',h.x*innerWidth+Math.sin(h.sway)*18,h.y*innerHeight);});
  bctx.globalAlpha=1;
  if(!reduced) requestAnimationFrame(drawBg);
}
drawBg();

/* ---------- Fireworks, confetti & heart bursts ---------- */
let parts=[], raf=null;
function burst(x,y,n=90){
  const col=[GOLD[Math.floor(Math.random()*GOLD.length)],GOLD[Math.floor(Math.random()*GOLD.length)]];
  for(let i=0;i<n;i++){
    const a=Math.random()*6.283, v=rnd(1.5,7);
    parts.push({k:i%9===0?'heart':'spark',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:.07,size:rnd(2,4.5),c:col[i%2],life:rnd(60,100),max:100});
  }
  start();
}
function confetti(){
  for(let i=0;i<200;i++){
    const a=Math.random()*6.283, v=rnd(2,9);
    parts.push({k:'rect',x:innerWidth/2,y:innerHeight*.3,vx:Math.cos(a)*v,vy:Math.sin(a)*v-3,g:.1,size:rnd(3,8),c:GOLD[i%GOLD.length],life:rnd(100,160),max:40,rot:rnd(0,6),spin:rnd(-.12,.12)});
  }
  start();
}
function start(){ if(!raf) raf=requestAnimationFrame(tick); }
function tick(){
  fctx.clearRect(0,0,innerWidth,innerHeight);
  parts=parts.filter(p=>p.life>0&&p.y<innerHeight+40);
  parts.forEach(p=>{
    p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.vx*=.985;p.life--;
    fctx.save();fctx.globalAlpha=Math.min(1,p.life/(p.k==='rect'?25:40));fctx.fillStyle=p.c;
    if(p.k==='rect'){p.rot+=p.spin;fctx.translate(p.x,p.y);fctx.rotate(p.rot);fctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*1.7);}
    else if(p.k==='heart'){fctx.font=p.size*4+'px serif';fctx.textAlign='center';fctx.fillText('♥',p.x,p.y);}
    else{fctx.shadowColor=p.c;fctx.shadowBlur=8;fctx.beginPath();fctx.arc(p.x,p.y,p.size*.6,0,6.3);fctx.fill();}
    fctx.restore();
  });
  if(parts.length) raf=requestAnimationFrame(tick); else {raf=null;fctx.clearRect(0,0,innerWidth,innerHeight);}
}
function fireworkShow(n=5){
  for(let i=0;i<n;i++) setTimeout(()=>burst(rnd(innerWidth*.15,innerWidth*.85),rnd(innerHeight*.15,innerHeight*.5),rnd(70,110)),i*320);
}

/* ---------- Toast ---------- */
function toast(m){const el=$('toast');el.textContent=m;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),2600);}

/* ---------- Music ---------- */
const fmt=s=>Number.isFinite(s)?`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`:'0:00';
function updatePlayer(){
  const on=!song.paused;
  playBtn.textContent=on?'Ⅱ':'▶';
  musicLabel.textContent=on?'Pause song':'Play song';
  songStatus.textContent=on?'Now playing':'Ready to play';
  vinyl.classList.toggle('playing',on);eq.classList.toggle('on',on);musicToggle.classList.toggle('on',on);
}
async function toggleSong(){
  try{ if(song.paused) await song.play(); else song.pause(); updatePlayer(); }
  catch{ toast('Add congratulations.mp3 beside index.html to play the song.'); }
}
playBtn.addEventListener('click',toggleSong);
musicToggle.addEventListener('click',toggleSong);
song.addEventListener('play',updatePlayer);song.addEventListener('pause',updatePlayer);
song.addEventListener('ended',updatePlayer);
song.addEventListener('timeupdate',()=>{songTime.textContent=fmt(song.currentTime);if(song.duration)seekBar.value=song.currentTime/song.duration*100;});
song.addEventListener('loadedmetadata',()=>{songTime.textContent=fmt(song.duration);});
seekBar.addEventListener('input',()=>{if(song.duration)song.currentTime=seekBar.value/100*song.duration;});
song.addEventListener('error',()=>{songStatus.textContent='Song file not found';});

/* ---------- Opening sequence ---------- */
let needsTap=false;
async function startMusic(){
  try{await song.play();needsTap=false;updatePlayer();}
  catch{needsTap=true;songStatus.textContent='Tap to start the song';}
}
$('openBtn').addEventListener('click',()=>{
  welcome.classList.add('leave');
  startMusic(); // inside the click gesture so browsers allow it
  setTimeout(()=>{welcome.classList.add('hidden');site.classList.remove('hidden');confetti();fireworkShow(4);},750);
});
document.addEventListener('pointerdown',function retry(){
  if(!needsTap)return; needsTap=false; document.removeEventListener('pointerdown',retry); toggleSong();
});

/* ---------- Magic button ---------- */
$('fireworksBtn').addEventListener('click',()=>{
  confetti();fireworkShow(6);
  toast(['A little extra magic, just for you! ✨','You are loved more than words can say 💖','Mom, you are the best! 🌟'][Math.floor(Math.random()*3)]);
});

/* ---------- Pages ---------- */
const order=['home','message','memories','film','song'];
let current='home';
function typeMessage(){
  const el=$('msg');
  if(!el.dataset.text) el.dataset.text=el.textContent.trim();
  el.innerHTML=el.dataset.text.split(' ').map((w,i)=>`<span class="w" style="animation-delay:${reduced?0:.4+i*.06}s">${w}</span>`).join(' ');
}
function showPage(name){
  current=name;
  document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.dataset.page===name));
  document.querySelectorAll('.menu-link').forEach(l=>l.classList.toggle('active',l.dataset.pageLink===name));
  if(name!=='film'){const v=$('memoryVideo');if(v&&!v.paused)v.pause();}
  if(name==='message') typeMessage();
}
document.querySelectorAll('[data-page-link]').forEach(l=>l.addEventListener('click',e=>{e.preventDefault();showPage(l.dataset.pageLink);}));
document.querySelectorAll('[data-go-page]').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.goPage)));
const step=d=>showPage(order[(order.indexOf(current)+d+order.length)%order.length]);

/* Swipe between pages on touch screens */
let sx=0,sy=0;
const stage=document.querySelector('.page-stage');
stage.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;},{passive:true});
stage.addEventListener('touchend',e=>{
  if(e.target.closest('video,input'))return;
  const dx=e.changedTouches[0].clientX-sx, dy=e.changedTouches[0].clientY-sy;
  if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.5) step(dx<0?1:-1);
},{passive:true});

/* 3D tilt on the hero photo (desktop) */
const tilt=$('tilt');
if(!reduced&&matchMedia('(hover:hover)').matches){
  tilt.addEventListener('mousemove',e=>{const r=tilt.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    tilt.style.transform=`perspective(800px) rotateY(${x*10}deg) rotateX(${-y*10}deg)`;});
  tilt.addEventListener('mouseleave',()=>tilt.style.transform='');
}

/* ---------- Lightbox with next/prev ---------- */
const items=[...document.querySelectorAll('.gallery-item')];
let li=0;
const lb=$('lightbox');
function openPhoto(i){
  li=(i+items.length)%items.length;
  $('lightboxImage').src=items[li].dataset.full;
  lb.classList.add('open');lb.setAttribute('aria-hidden','false');
}
function closeLightbox(){lb.classList.remove('open');lb.setAttribute('aria-hidden','true');}
items.forEach((it,i)=>it.addEventListener('click',()=>openPhoto(i)));
$('lbPrev').addEventListener('click',e=>{e.stopPropagation();openPhoto(li-1);});
$('lbNext').addEventListener('click',e=>{e.stopPropagation();openPhoto(li+1);});
$('closeLightbox').addEventListener('click',closeLightbox);
lb.addEventListener('click',e=>{if(e.target===lb)closeLightbox();});
document.addEventListener('keydown',e=>{
  if(lb.classList.contains('open')){
    if(e.key==='Escape')closeLightbox();
    if(e.key==='ArrowLeft')openPhoto(li-1);
    if(e.key==='ArrowRight')openPhoto(li+1);
  }else if(!site.classList.contains('hidden')){
    if(e.key==='ArrowRight')step(1);
    if(e.key==='ArrowLeft')step(-1);
  }
});
