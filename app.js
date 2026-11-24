(() => {
  const KEY = "rewards-tracker-v1";
  const defaults = { balance:1191, target:55000, dailyTarget:203, goalEnabled:true, history:[], dayKey:localDayKey() };
  let state = load();
  let deferredPrompt = null;
  const $ = id => document.getElementById(id);
  function localDayKey(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
  }
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "null");
      return saved ? {...defaults, ...saved, history:Array.isArray(saved.history)?saved.history:[]} : {...defaults};
    } catch { return {...defaults}; }
  }
  function save() { localStorage.setItem(KEY, JSON.stringify(state)); }
  function fmt(n) { return Math.round(Number(n)||0).toLocaleString(); }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function rollover() {
    const today = localDayKey();
    if (state.dayKey !== today) { state.dayKey = today; save(); }
  }
  function todayEarned() {
    const today = localDayKey();
    return state.history.filter(x => x.day === today && x.type === "earned").reduce((sum,x)=>sum+x.amount,0);
  }
  function render() {
    rollover();
    const remaining = Math.max(0, state.target-state.balance);
    const pct = state.target > 0 ? Math.min(100, state.balance/state.target*100) : 100;
    const earned = todayEarned();
    $("balance").textContent=fmt(state.balance);
    $("target").textContent=fmt(state.target);
    $("remaining").textContent=fmt(remaining);
    $("percent").textContent=`${pct.toFixed(1)}%`;
    $("progressFill").style.width=`${pct}%`;
    $("progressBar").setAttribute("aria-valuenow",pct.toFixed(1));
    $("todayEarned").textContent=fmt(earned);
    $("dailyProgressText").textContent=`${fmt(earned)} / ${fmt(state.dailyTarget)} pts`;
    $("dailyProgressFill").style.width=`${Math.min(100,earned/state.dailyTarget*100)}%`;
    $("dailyStatus").textContent=earned>=state.dailyTarget?"Daily target reached":`${fmt(Math.max(0,state.dailyTarget-earned))} pts to daily target`;
    $("goalToggle").checked=state.goalEnabled;
    $("dailyTargetInput").value=state.dailyTarget;
    $("targetInput").value=state.target;
    $("daysEstimate").innerHTML=state.goalEnabled?`${fmt(Math.ceil(remaining/state.dailyTarget))}<small> days</small>`:"—";
    $("estimateFoot").textContent=state.goalEnabled?"At your daily target":"Enable daily goal for an estimate";
    $("daysEstimate").closest(".stat-card").style.opacity=state.goalEnabled?"1":".55";
    $("daysEstimate").closest(".stat-card").style.visibility=state.goalEnabled?"visible":"hidden";
    $("goalNote").textContent=state.goalEnabled?"Your daily target helps estimate when you'll reach your gift card.":"Daily goal is off. Your balance and daily earnings will still be tracked.";
    renderHistory();
  }
  function renderHistory() {
    const host=$("historyList");
    if(!state.history.length){host.innerHTML='<div class="empty-state">Your point activity will appear here.</div>';return;}
    host.innerHTML=state.history.slice(0,40).map(item=>{
      const earned=item.type==="earned";
      const date=new Date(item.timestamp);
      const dateLabel = date.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"})+" · "+date.toLocaleTimeString(undefined,{hour:"numeric",minute:"2-digit"});
      return `<div class="history-item"><div class="history-icon">${earned?"↗":"✎"}</div><div class="history-main"><div class="history-title">${escapeHtml(item.note || (earned?"Points earned":"Balance adjustment"))}</div><div class="history-date">${dateLabel}</div></div><div class="history-amount ${earned?"":"negative"}">${earned?"+":""}${fmt(item.amount)} pts</div></div>`;
    }).join("");
  }
  function toast(message) {
    const el=$("toast");el.textContent=message;el.classList.add("show");
    clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove("show"),2200);
  }
  function addPoints(amount,note) {
    state.balance += amount;
    state.history.unshift({id:crypto.randomUUID?.()||String(Date.now()),type:"earned",amount,note:note||"Points earned",timestamp:Date.now(),day:localDayKey()});
    save();render();toast(`${fmt(amount)} points added`);
  }
  $("addOpen").addEventListener("click",()=>{$("addAmount").value="";$("addDescription").value="";$("addDialog").showModal();$("addAmount").focus();});
  $("setOpen").addEventListener("click",()=>{$("setAmount").value=state.balance;$("setDialog").showModal();$("setAmount").focus();});
  $("addForm").addEventListener("submit",e=>{
    e.preventDefault();const amount=Number($("addAmount").value);
    if(!Number.isSafeInteger(amount)||amount<=0){toast("Enter a valid points amount");return;}
    addPoints(amount,$("addDescription").value.trim());$("addDialog").close();
  });
  $("setForm").addEventListener("submit",e=>{
    e.preventDefault();const next=Number($("setAmount").value);
    if(!Number.isSafeInteger(next)||next<0){toast("Enter a valid balance");return;}
    const delta=next-state.balance;state.balance=next;
    state.history.unshift({id:crypto.randomUUID?.()||String(Date.now()),type:"adjustment",amount:Math.abs(delta),note:`Balance set to ${fmt(next)}${delta===0?" (no change)":delta>0?" (+"+fmt(delta)+")":" (-"+fmt(-delta)+")"}`,timestamp:Date.now(),day:localDayKey()});
    save();render();$("setDialog").close();toast("Balance updated");
  });
  $("goalToggle").addEventListener("change",e=>{state.goalEnabled=e.target.checked;save();render();toast(state.goalEnabled?"Daily goal enabled":"Daily goal disabled");});
  $("saveDailyTarget").addEventListener("click",()=>{
    const v=Number($("dailyTargetInput").value);if(!Number.isSafeInteger(v)||v<1){toast("Daily target must be at least 1");return;}
    state.dailyTarget=v;save();render();toast("Daily target updated");
  });
  $("saveTarget").addEventListener("click",()=>{
    const v=Number($("targetInput").value);if(!Number.isSafeInteger(v)||v<1){toast("Target must be at least 1");return;}
    state.target=v;save();render();toast("Gift card target updated");
  });
  $("clearHistory").addEventListener("click",()=>{
    if(!state.history.length){toast("History is already empty");return;}
    if(confirm("Clear all transaction history? Your current balance will stay unchanged.")){state.history=[];save();render();toast("History cleared");}
  });
  window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("installBtn").hidden=false;});
  $("installBtn").addEventListener("click",async()=>{
    if(!deferredPrompt){toast("Use Chrome menu → Install app");return;}
    deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$("installBtn").hidden=true;
  });
  window.addEventListener("appinstalled",()=>{$("installBtn").hidden=true;toast("App installed");});
  if("serviceWorker" in navigator && location.protocol!=="file:") window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
  document.addEventListener("visibilitychange",()=>{if(!document.hidden){rollover();render();}});
  setInterval(()=>{const before=state.dayKey;rollover();if(before!==state.dayKey)render();},30000);
  render();
})();