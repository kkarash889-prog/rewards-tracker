(()=>{
const KEY='rewards-tracker-v1';
const D={balance:1191,target:55000,dailyTarget:203,goalEnabled:true,history:[],dayKey:day()};
function day(){const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
let s;try{s={...D,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{s={...D}}
if(!Array.isArray(s.history))s.history=[];
/* Remove obsolete puzzle-only data while retaining all points transactions. */
s.history=s.history.filter(x=>x&&x.type!=='piece');
delete s.pieces;delete s.weeklyPieces;
const $=id=>document.getElementById(id);
const fmt=n=>Math.round(n).toLocaleString();
function save(){localStorage.setItem(KEY,JSON.stringify(s))}
function roll(){if(s.dayKey!==day()){s.dayKey=day();save()}}
function earned(){return s.history.filter(x=>x.day===day()&&x.type==='earned').reduce((a,x)=>a+x.amount,0)}
function toast(t){const e=$('toast');e.textContent=t;e.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>e.style.display='none',2100)}
function esc(t){return String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function estimateDays(rem){if(rem<=0)return 0;if(!s.goalEnabled||s.dailyTarget<1)return null;return Math.ceil(rem/s.dailyTarget)}
function render(){
 roll();
 const rem=Math.max(0,s.target-s.balance),pct=s.target>0?Math.min(100,s.balance/s.target*100):0,today=earned(),eta=estimateDays(rem);
 $('balance').textContent=fmt(s.balance);$('target').textContent=fmt(s.target);$('remaining').textContent=fmt(rem);
 $('percent').textContent=pct.toFixed(1)+'%';$('progress').style.width=pct+'%';
 $('today').innerHTML=fmt(today)+' <em>pts</em>';
 $('dailyProgress').textContent=fmt(today)+' / '+fmt(s.dailyTarget)+' pts';
 $('dailyBar').style.width=Math.min(100,today/s.dailyTarget*100)+'%';
 $('dailyStatus').textContent=today>=s.dailyTarget?'Daily target reached':fmt(Math.max(0,s.dailyTarget-today))+' pts to daily target';
 $('enabled').checked=!!s.goalEnabled;$('dailyTarget').value=s.dailyTarget;$('targetInput').value=s.target;
 $('days').innerHTML=s.goalEnabled&&eta!==null?fmt(eta)+' <em>days</em>':'—';
 $('estimateCard').style.display=s.goalEnabled?'':'none';document.querySelector('.stats').classList.toggle('single',!s.goalEnabled);
 $('goalHint').textContent=s.goalEnabled?'Your daily target helps estimate when you’ll reach your gift card.':'Daily goal is off. Balance and earnings tracking continue.';
 $('history').innerHTML=s.history.length?s.history.slice(0,60).map(x=>`<div class="history-item"><span>${x.type==='earned'?'↗':x.type==='redeem'?'🎁':'✎'}</span><div class="desc"><b>${esc(x.note)}</b><small>${new Date(x.time).toLocaleString()}</small></div><b class="amount ${x.type==='adjustment'?'negative':''}">${x.type==='earned'?'+':x.type==='redeem'?'+':''}${fmt(x.amount)} pts</b></div>`).join(''):'<p class="empty">Your activity will appear here.</p>';
}
$('addOpen').onclick=()=>{$('amount').value='';$('note').value='';$('addDialog').showModal()};
$('setOpen').onclick=()=>{$('newBalance').value=s.balance;$('setDialog').showModal()};
$('addForm').onsubmit=e=>{e.preventDefault();const n=Number($('amount').value);if(!Number.isSafeInteger(n)||n<1)return toast('Enter a valid amount');s.balance+=n;s.history.unshift({type:'earned',amount:n,note:$('note').value.trim()||'Points earned',time:Date.now(),day:day()});save();render();$('addDialog').close();toast('Points added')};
$('setForm').onsubmit=e=>{e.preventDefault();const n=Number($('newBalance').value);if(!Number.isSafeInteger(n)||n<0)return toast('Enter a valid balance');s.history.unshift({type:'adjustment',amount:Math.abs(n-s.balance),note:'Balance set to '+fmt(n),time:Date.now(),day:day()});s.balance=n;save();render();$('setDialog').close();toast('Balance updated')};
$('enabled').onchange=e=>{s.goalEnabled=e.target.checked;save();render()};
$('saveDaily').onclick=()=>{const n=Number($('dailyTarget').value);if(!Number.isSafeInteger(n)||n<1)return toast('Daily target must be at least 1');s.dailyTarget=n;save();render();toast('Daily target saved')};
$('saveTarget').onclick=()=>{const n=Number($('targetInput').value);if(!Number.isSafeInteger(n)||n<1)return toast('Target must be at least 1');s.target=n;save();render();toast('Target saved')};
$('clear').onclick=()=>{if(s.history.length&&confirm('Clear history? Your balance will remain unchanged.')){s.history=[];save();render()}};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());
if('serviceWorker'in navigator&&location.protocol!=='file:')addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});
setInterval(render,60000);
save();render();
})();