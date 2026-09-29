const APP_VERSION = "1.2.1";

/* =========================================================
   MOCK CONTENT — edit everything here (Part 2)
   ========================================================= */
const MOCK = {
  user: { name: "Mary", zip: "06002" },
  brand: { name: "Cigna Healthcare", ai: "Cigna AI" },
  plans: [
    { id:"localplus", label:"Local+" },
    { id:"oap",       label:"OAP" },
    { id:"ppo",       label:"PPO" },
    { id:"hmo",       label:"HMO" },
    { id:"unsure",    label:"Not sure / I don’t know", full:true }
  ],
  facility: {
    index:1, name:"Orthopedic Associates CT",
    addressLines:["460 Farmington,","West Hartford, CT 06002"],
    phone:"(860) 123-4567", specialties:"Primary Care, +2",
    plans:"Open Access Plus, PPO, +2", distance:"1.2 mi"
  },
  providers: [
    { id:1, category:"Primary Care Provider", name:"Dr. Lisa Sanchez, MD",
      address:"460 Farmington, West Hartford, CT 06002", distance:"1.2 mi",
      specialties:"Primary Care, +2", initials:"LS", map:{x:42,y:52} },
    { id:2, category:"Primary Care Provider", name:"Dr. James Okafor, MD",
      address:"88 Main St, Bloomfield, CT 06002", distance:"2.1 mi",
      specialties:"Primary Care, Internal Medicine", initials:"JO", map:{x:15,y:70} },
    { id:3, category:"Primary Care Provider", name:"Dr. Priya Raman, DO",
      address:"1290 Blue Hills Ave, Hartford, CT 06112", distance:"3.4 mi",
      specialties:"Family Medicine, +1", initials:"PR", map:{x:66,y:24} },
    { id:4, category:"Primary Care Provider", name:"Dr. Ellen Cho, MD",
      address:"55 Park Rd, West Hartford, CT 06119", distance:"3.9 mi",
      specialties:"Primary Care", initials:"EC", map:{x:20,y:18} },
    { id:5, category:"Primary Care Provider", name:"Dr. Marcus Bell, MD",
      address:"705 North Main, Windsor, CT 06095", distance:"4.6 mi",
      specialties:"Primary Care, Geriatrics", initials:"MB", map:{x:93,y:45} }
  ]
};

/* The scripted scenario (Part 2). Each step = one insertion into the chat. */
const FLOW = [
  { id:"greet", type:"ai",
    text:`Hi ${MOCK.user.name}, I’m your healthcare assistant. I can help you with finding the right provider within your health insurance plan.\n\nLet’s start with your zipcode.`,
    anno:{ title:"Greeting + scoping", body:"The assistant frames its capability (provider search within the member’s plan) and asks for the first slot: location." } },
  { id:"zip", type:"input",
    placeholder:"Enter a ZIP code (e.g. 06002)",
    validate: v => /^\d{5}$/.test(v.trim()),
    errorText:"Hmm, that doesn’t look like a ZIP — try 5 digits (e.g. 06002).",
    autoValue:()=>`My zipcode is ${MOCK.user.zip}`,
    capture:(v)=>{ state.zip = v.trim(); },
    anno:{ title:"User provides location", body:"Live input: the composer is active and the flow waits. A 5-digit ZIP advances; anything else triggers the re-ask error path. Auto-play types the mock ZIP instead." } },
  { id:"plan-select", type:"component", component:"selectTile",
    anno:{ title:"Plan disambiguation", body:"The assistant can’t resolve network status without a plan. Instead of asking an open question, it renders a Select Tile group — constrained input, single tap.", comp:"Select Tile" } },
  { id:"plan-confirm", type:"ai", waitFor:"plan",
    text:()=>`You picked ${state.planLabel}. I’ll use the plan information, your location and look for the PCP speciality to find in-network providers.\n\nHere are a few in-network options to start:`,
    anno:{ title:"Confirmation + handoff", body:"The assistant echoes the selection (plan), states the retrieval strategy (plan + location + specialty), then hands off to the results component." } },
  { id:"results", type:"component", component:"results",
    anno:{ title:"In-network results", body:"Provider cards rendered from the mock provider objects. The List/Map segmented toggle switches presentation without re-fetching — same data, two views.", comp:"Results container" } },
  { id:"care-check", type:"component", component:"careCheck",
    anno:{ title:"Outcome check", body:"A lightweight satisfaction probe closes the loop: 'Were you able to find the care you are looking for?' Yes/No feeds the Takeaways tab and analytics." } }
];

/* Text-only scripted scenarios (3 · Content). Edit freely. */
const SCENARIOS = {
  "scenario-a": {
    title: "Name Search — Scenario A · Is my doctor in network",
    intro: "I’m comparing different plans my employer offers and I want to know if my doctor is in network with Cigna.",
    steps: [
      { label:"Entry / Intent recognition", speaker:"user",
        text:"I’m comparing different plans my employer offers and I want to know if my doctor is in network with Cigna." },
      { label:"Entry / Intent recognition", speaker:"ai",
        text:"Got it — I can help you check whether your doctor is in-network for a specific Cigna plan.\n\nTo get the most accurate results, I’ll ask a few quick questions about your location, plan type, and your doctor’s name." },
      { label:"Step A — Collect location (Input #1)", speaker:"ai",
        text:"First, where would you like to search?\n\nYou can enter a ZIP code or City + State." },
      { label:"Step A — Collect location (Input #1)", speaker:"user", text:"06002" },
      { label:"Step A — Collect location (Input #1)", speaker:"ai", text:"Thanks — searching near 06002." },
      { label:"Step B — Where is the plan from? (Input #3)", speaker:"ai",
        text:"Is this plan through:\n\n1. Employer/School coverage, or\n2. Healthcare.gov (Marketplace)?" },
      { label:"Step B — Where is the plan from? (Input #3)", speaker:"user", text:"Employer/School" },
      { label:"Step C — Plan type & sub-plan options (Inputs #2 + #3)", speaker:"ai",
        text:"Great. Employer plans can vary by region. Based on 06002, which plan network are you comparing?\n\n• Local+\n• OAP\n• PPO\n• HMO\n• Not sure / I don’t know" },
      { label:"Step C — Plan type & sub-plan options (Inputs #2 + #3)", speaker:"user", text:"PPO" },
      { label:"Step C — Plan type & sub-plan options (Inputs #2 + #3)", speaker:"ai", text:"Perfect — PPO selected." },
      { label:"Step D — Collect provider name (Input #4)", speaker:"ai",
        text:"What’s your doctor’s name?\n\nYou can type First + Last, or Last name if you’re not sure." },
      { label:"Step D — Collect provider name (Input #4)", speaker:"user", text:"Dr. Maria Sanchez" },
      { label:"Step E — Collect specialty (Input #5)", speaker:"ai",
        text:"Thanks. What specialty is Dr. Maria Sanchez? This helps me find the right match if there are multiple providers with similar names.\n\n• Primary Care\n• Cardiology\n• Dermatology\n• OB-GYN\n• Orthopedics\n• Behavioral Health\n• Other (type it)" },
      { label:"Step E — Collect specialty (Input #5)", speaker:"user", text:"Primary Care" },
      { label:"Step F — Results + in-network status", speaker:"ai",
        text:"Thanks — I’m checking Dr. Maria Sanchez (Primary Care) near 06002 for your Employer PPO plan." },
      { label:"Step F — Results + in-network status", speaker:"ai",
        text:"I found a match:\n\nDr. Maria Sanchez — Primary Care\n📍 3.2 miles away — West Hartford, CT\n✅ In-network for Employer PPO\n\nWould you like to:\n• View details (address, phone, accepting new patients)\n• Compare against a different plan (Local+, OAP, HMO)\n• Search a different provider" }
    ]
  },
  "scenario-b": {
    title: "Specialty Search — Scenario B · Specialist near my PCP",
    intro: "I have a chronic condition and need to find a specialist provider that is close to my PCP.",
    steps: [
      { label:"Step 0 — Entry / Intent recognition", speaker:"user",
        text:"I have a chronic condition and need to find a specialist provider that is close to my PCP." },
      { label:"Step 0 — Entry / Intent recognition", speaker:"ai",
        text:"I can help with that. I’ll help you identify the right specialty for your condition and then find in-network specialists located near your primary care provider.\n\nI’ll ask a few quick questions about your plan and location to get accurate results." },
      { label:"Step 1 — Location (Input: Location)", speaker:"ai",
        text:"First, where should I search?\n\nYou can enter a ZIP code or City + State for your primary care provider." },
      { label:"Step 1 — Location (Input: Location)", speaker:"user", text:"06002" },
      { label:"Step 1 — Location (Input: Location)", speaker:"ai", text:"Thanks — using 06002 as the search area." },
      { label:"Step 2 — Plan source (Input: Employer/School vs Healthcare.gov)", speaker:"ai",
        text:"Is your health plan through:\n\n• Employer or School, or\n• Healthcare.gov (Marketplace)?" },
      { label:"Step 2 — Plan source (Input: Employer/School vs Healthcare.gov)", speaker:"user", text:"Employer/School" },
      { label:"Step 2 — Plan source (Input: Employer/School vs Healthcare.gov)", speaker:"ai", text:"Got it." },
      { label:"Step 3 — Plan network / sub-plan (Inputs: plan type + sub-plan options by location)", speaker:"ai",
        text:"Plans use different provider networks depending on location.\nFor 06002, which Cigna network do you want to check?\n\n• Local+\n• OAP\n• PPO\n• HMO\n• Not sure (help me choose)" },
      { label:"Step 3 — Plan network / sub-plan (Inputs: plan type + sub-plan options by location)", speaker:"user", text:"Local+" },
      { label:"Step 3 — Plan network / sub-plan (Inputs: plan type + sub-plan options by location)", speaker:"ai", text:"Thanks — Local+ selected." },
      { label:"Step 4 — Identify condition → specialty (Input: specialty derived from condition)", speaker:"ai",
        text:"To help identify the right kind of specialist, what chronic condition are you managing?\nYou can be general — no medical details needed.\n\nExamples:\n• Diabetes\n• Asthma\n• Arthritis\n• Heart condition\n• Digestive condition\n• Autoimmune condition\n• Other (type it)" },
      { label:"Step 4 — Identify condition → specialty (Input: specialty derived from condition)", speaker:"user", text:"Diabetes" },
      { label:"Step 4b — Specialty mapping (bot logic, explained to user)", speaker:"ai",
        text:"Thanks. For diabetes, patients commonly see:\n\n• Endocrinologists (most common)\n• Sometimes nephrologists or cardiologists, depending on care needs\n\nWhich type of specialist would you like to search for?\n\n• Endocrinologist\n• Show me recommended options\n• I already know the specialty" },
      { label:"Step 4b — Specialty mapping (bot logic, explained to user)", speaker:"user", text:"Endocrinologist" },
      { label:"Step 5 — Confirm “near my PCP” constraint", speaker:"ai",
        text:"Got it. I’ll look for in-network endocrinologists who are located near your primary care provider in 06002.\n\nIf you want, I can prioritize:\n• Closest distance to your PCP\n• Providers in the same health system\n• Providers accepting new patients\n\nWould you like to apply any of these?" },
      { label:"Step 5 — Confirm “near my PCP” constraint", speaker:"user", text:"No, just closest to my PCP." },
      { label:"Step 6 — Results hand-off (draft lead-in + List/Map component)", speaker:"ai",
        text:"Here are in-network endocrinologists closest to your PCP in 06002:" },
      { label:"Step 6 — Results hand-off (draft lead-in + List/Map component)", speaker:"ai",
        type:"component", component:"results",
        text:"[List / Map results component — providers rendered as Endocrinology]" }
    ]
  },
  "scenario-c": {
    title: "Radius Search — Scenario C · Physical Therapist within 2 miles",
    intro: "I need to find a physical therapist within 2 miles of me.",
    steps: [
      { label:"Step 0 — Entry / Intent recognition", speaker:"user",
        text:"I need to find a physical therapist within 2 miles of me." },
      { label:"Step 0 — Entry / Intent recognition", speaker:"ai",
        text:"I can help you find an in-network physical therapist nearby. First, what’s your ZIP code?" },
      { label:"Step 1 — Collect location", speaker:"user", text:"06002" },
      { label:"Step 1 — Collect location", speaker:"ai",
        text:"Thanks — searching near 06002. Which Cigna plan network should I check?" },
      { label:"Step 2 — Plan choice (Select Tile component)", speaker:"ai",
        type:"component", component:"selectTile",
        text:"[Select Tile component — Medical Plans: Local+, OAP, PPO, HMO, Not sure]" },
      { label:"Step 2 — Plan confirmation", speaker:"ai",
        text:()=>`Got it — ${state.planLabel || "your plan"} selected. I’ll look for in-network physical therapists within 2 miles of 06002.` },
      { label:"Step 3 — Results (List/Map component)", speaker:"ai",
        type:"component", component:"results",
        resultsAs:{ category:"Physical Therapist", specialties:"Physical Therapy, Rehabilitation" },
        text:"[List / Map results component — providers rendered as Physical Therapy]" },
      { label:"Step 4 — Outcome check", speaker:"ai",
        type:"component", component:"careCheck",
        text:"[Feedback component — Were you able to find the care you are looking for?]" }
    ]
  }
};

/* =========================================================
   COMPONENT LIBRARY (Part 1) — each returns a DOM node from a data object
   ========================================================= */
const Components = {

  /* 1 — Select Tile */
  selectTile({prompt, category, options, onSelect}) {
    const el = div("c-select");
    el.innerHTML = `<div class="prompt">${prompt}</div>
      <div class="body"><div class="cat">${category}</div>
      <div class="tile-grid" role="radiogroup" aria-label="${category}"></div></div>`;
    const grid = el.querySelector(".tile-grid");
    options.forEach(opt=>{
      const b = document.createElement("button");
      b.className = "tile" + (opt.full ? " full" : "");
      b.setAttribute("role","radio");
      b.setAttribute("aria-checked","false");
      b.innerHTML = `<span class="radio"></span><span>${opt.label}</span>`;
      b.onclick = ()=>{
        if (el.dataset.done) return;
        el.dataset.done = "1";
        grid.querySelectorAll(".tile").forEach(t=>{t.setAttribute("aria-checked","false");t.setAttribute("disabled","")});
        b.removeAttribute("disabled");
        b.setAttribute("aria-checked","true");
        onSelect(opt);
      };
      grid.appendChild(b);
    });
    return el;
  },

  /* 2 — Provider Card */
  providerCard(p, {showCategory=true}={}) {
    const el = div("p-card");
    el.innerHTML = `
      ${showCategory?`<div class="cat">${p.category}</div>`:""}
      <div class="row">
        <div class="avatar">${p.initials}</div>
        <div>
          <div class="name">${p.name}</div>
          <div class="addr">${p.address}</div>
        </div>
      </div>
      <div class="meta"><span class="dist">${p.distance}</span><span>Specialties: ${p.specialties}</span></div>
      <div class="cta-wrap"><button class="cta">View provider details</button></div>`;
    el.querySelector(".cta").onclick = ()=>alert(`(Prototype) Provider detail page for ${p.name}`);
    return el;
  },

  /* 2b — Facility Card (variant) */
  facilityCard(f) {
    const el = div("p-card facility");
    el.innerHTML = `
      <div class="cat numbered"><span>${f.index}. Facility Name</span><span class="kebab">⋯</span></div>
      <div class="row">
        <div class="ficon"><i class="ph ph-hospital"></i></div>
        <div>
          <div class="name"><a href="#" onclick="return false">${f.name}</a></div>
          <div class="lines">${f.addressLines.join("<br>")}<br>
            Phone: ${f.phone}<br>
            Specialties: ${f.specialties}<br>
            Plan: ${f.plans}
          </div>
        </div>
      </div>
      <div class="meta"><span class="dist">${f.distance}</span><span class="view-plans" role="button">View plans</span></div>
      <div class="cta-wrap"><button class="cta">Log in to myCigna</button></div>`;
    el.querySelector(".cta").onclick = ()=>alert(`(Prototype) myCigna login for ${f.name}`);
    return el;
  },

  /* 3 — Results container: List view + Map view */
  results({providers}) {
    const el = div("results");
    el.innerHTML = `
      <div class="seg" role="tablist" aria-label="Results view">
        <button role="tab" aria-selected="true" data-v="list">List view</button>
        <button role="tab" aria-selected="false" data-v="map">Map view</button>
      </div>
      <div class="view"></div>`;
    const view = el.querySelector(".view");
    const tabs = el.querySelectorAll(".seg button");
    let active = 0;

    function renderList(){
      view.innerHTML = "";
      const wrap = div("list-wrap");
      providers.forEach(p=>wrap.appendChild(Components.providerCard(p)));
      view.appendChild(wrap);
    }
    function renderMap(){
      view.innerHTML = "";
      const wrap = div("map-wrap");
      wrap.innerHTML = `
        <svg class="map-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <rect width="100" height="100" fill="#ecebe8"/>
          <path d="M62 0 Q70 20 78 28 T 84 60 Q88 80 82 100 L100 100 L100 0 Z" fill="#cfe0ee"/>
          <path d="M30 62 q6 -4 10 2 t 12 4 q4 4 -2 8 t -14 0 q-8 -6 -6 -14" fill="#d8e6d4"/>
          <g stroke="#ffffff" stroke-width="1.6" fill="none">
            <path d="M0 30 H70"/><path d="M0 55 H62"/><path d="M0 80 H70"/>
            <path d="M22 0 V100"/><path d="M48 0 V100"/>
            <path d="M0 10 Q40 14 70 40 T 100 78"/>
          </g>
          <g stroke="#ffffff" stroke-width="0.8" fill="none" opacity=".8">
            <path d="M10 0 V100"/><path d="M34 0 V100"/><path d="M0 42 H60"/><path d="M0 68 H55"/>
          </g>
        </svg>
        <div class="zoom"><button aria-label="Zoom in">+</button><button aria-label="Zoom out">−</button></div>
        <div class="pin you" style="left:50%;top:56%" title="You are here"></div>
        <div class="map-card"></div>
        <span class="map-attr">Map data © prototype</span>`;
      const cardHolder = wrap.querySelector(".map-card");
      let pins = [];
      function selectPin(p){
        pins.forEach(x=>x.el.classList.toggle("active", x.p.id===p.id));
        cardHolder.innerHTML = "";
        const c = Components.providerCard(p);
        c.querySelector(".cat").textContent = `${p.id}. ${p.category}`;
        cardHolder.appendChild(c);
      }
      providers.forEach(p=>{
        const pin = div("pin");
        pin.textContent = p.id;
        pin.style.left = p.map.x+"%"; pin.style.top = p.map.y+"%";
        pin.setAttribute("role","button");
        pin.setAttribute("aria-label",`Show ${p.name}`);
        pin.onclick = ()=>selectPin(p);
        wrap.appendChild(pin);
        pins.push({p, el:pin});
      });
      view.appendChild(wrap);
      selectPin(providers[0]);
    }
    tabs.forEach((t,i)=>t.onclick=()=>{
      active=i;
      tabs.forEach((x,j)=>x.setAttribute("aria-selected", j===i ? "true":"false"));
      tabs.forEach((x,j)=>x.classList.toggle("active", j===i));
      i===0?renderList():renderMap();
      setCompAnno(i===0?"Provider Card":"Results container");
    });
    tabs[0].classList.add("active");
    renderList();
    return el;
  },

  /* Inline outcome check */
  careCheck() {
    const el = div("care-check");
    el.innerHTML = `<span>Were you able to find the care you are looking for?</span>
      <span class="yn"><button><i class="ph ph-thumbs-up"></i> Yes</button><button><i class="ph ph-thumbs-down"></i> No</button></span>`;
    el.querySelectorAll("button").forEach(b=>b.onclick=()=>{
      el.querySelector(".yn").innerHTML = `<em style="font-size:13px;color:#777">Thanks — noted.</em>`;
    });
    return el;
  }
};

/* =========================================================
   FLOW ENGINE
   ========================================================= */
const chat = document.getElementById("chat");
const state = { step:0, planLabel:null, auto:false, scenario:"components", scenStep:-1 };
function div(c){const d=document.createElement("div");d.className=c;return d;}
function scrollDown(){chat.scrollTop = chat.scrollHeight;}

function brandHeader(){
  const h = div("brand-row");
  h.innerHTML = `<span class="brand-chip">cigna</span><span class="brand-name">${MOCK.brand.name}</span>
    <span class="fb"><button aria-label="Helpful"><i class="ph ph-thumbs-up"></i></button><button aria-label="Not helpful"><i class="ph ph-thumbs-down"></i></button></span>`;
  return h;
}

function addAI(text){
  const m = div("msg ai");
  m.innerHTML = `<div class="who"><span class="spark">✦</span>${MOCK.brand.ai}</div><div class="bubble"></div>`;
  m.querySelector(".bubble").textContent = text;
  chat.appendChild(m); scrollDown();
}
function addUser(text){
  const m = div("msg user");
  const b = div("bubble"); b.textContent = text;
  m.appendChild(b); chat.appendChild(m); scrollDown();
}
function addComponent(node, {branded=true}={}){
  const m = div("msg ai");
  if (branded) m.appendChild(brandHeader());
  m.appendChild(node);
  chat.appendChild(m); scrollDown();
}
function showTyping(cb){
  const t = div("typing");
  t.innerHTML = `<span class="spark">✦</span><span class="dot"></span><span class="dot"></span><span class="dot"></span>`;
  chat.appendChild(t); scrollDown();
  setTimeout(()=>{ t.remove(); cb(); }, 700);
}

/* ===== Live composer (component flow, input steps) ===== */
const composerInput = document.getElementById("composerInput");
let composerHandler = null;
function armComposer(step, stepIndex){
  composerInput.disabled = false;
  composerInput.placeholder = step.placeholder || "Type your reply...";
  composerInput.focus();
  composerHandler = (e)=>{
    if (e.key !== "Enter") return;
    const v = composerInput.value;
    if (!v.trim()) return;
    composerInput.value = "";
    addUser(v);
    if (step.validate && !step.validate(v)){
      showTyping(()=>addAI(step.errorText));
      return; // stay armed, keep waiting
    }
    disarmComposer();
    step.capture?.(v);
    advance(stepIndex);
  };
  composerInput.addEventListener("keydown", composerHandler);
}
function disarmComposer(){
  if (composerHandler) composerInput.removeEventListener("keydown", composerHandler);
  composerHandler = null;
  const isMobile = document.getElementById("device").classList.contains("mobile");
  composerInput.placeholder = isMobile ? "This is a single line of text" : "Ask anything...";
}

function runStep(i){
  if (i >= FLOW.length) return;
  state.step = i;
  highlightAnnoStep(i);
  const s = FLOW[i];

  const proceed = ()=>{ if(state.auto || FLOW[i+1] && FLOW[i+1].type!=="user") advance(i); };

  if (s.type === "ai"){
    showTyping(()=>{
      addAI(typeof s.text === "function" ? s.text() : s.text);
      advance(i);
    });
  } else if (s.type === "input"){
    if (state.auto){
      setTimeout(()=>{
        const v = s.autoValue ? s.autoValue() : "";
        addUser(v);
        s.capture?.(MOCK.user.zip);
        advance(i);
      }, 900);
    } else {
      armComposer(s, i);
    }
  } else if (s.type === "user"){
    setTimeout(()=>{ addUser(s.text); advance(i); }, state.auto ? 900 : 500);
  } else if (s.type === "component"){
    if (s.component === "selectTile"){
      showTyping(()=>{
        addComponent(Components.selectTile({
          prompt:`Please select a plan in ${state.zip || MOCK.user.zip}`,
          category:"Medical Plans",
          options:MOCK.plans,
          onSelect:(opt)=>{ state.planLabel = opt.label; setCompAnno("Select Tile"); advance(i); }
        }));
        setCompAnno("Select Tile");
        // waits for user selection — advance happens in onSelect
      });
    } else if (s.component === "results"){
      showTyping(()=>{
        addComponent(Components.results({providers:MOCK.providers}));
        setCompAnno("Provider Card");
        advance(i);
      });
    } else if (s.component === "careCheck"){
      setTimeout(()=>{ addComponent(Components.careCheck(), {branded:false}); }, 400);
    }
  }
}
function advance(i){ setTimeout(()=>runStep(i+1), state.auto ? 1100 : 800); }

function restartFlow(){
  chat.innerHTML = ""; state.planLabel = null; state.step = 0; state.scenStep = -1; state.zip = null;
  removeNextChip(); disarmComposer();
  composerInput.disabled = state.scenario !== "components" ? false : false;
  if (state.scenario === "components") runStep(0);
  else runScenarioStep(0);
}

/* ===== Text-only scenario engine (3 · Content) ===== */
function setScenario(id){
  state.scenario = id;
  document.getElementById("scenarioSel").value = id;
  const isDefault = id === "components";
  document.getElementById("tabFlow").hidden = !isDefault;
  if (!isDefault && annoTab === "flow") setAnnoTab("content");
  if (isDefault && annoTab === "content") setAnnoTab("flow");
  restartFlow();
}
function removeNextChip(){
  const c = document.getElementById("nextChip");
  if (c) c.remove();
}
function showNextChip(onNext){
  removeNextChip();
  const c = document.createElement("button");
  c.id = "nextChip"; c.className = "next-chip";
  c.textContent = "▸ Next turn";
  c.onclick = ()=>{ c.remove(); onNext(); };
  chat.appendChild(c); scrollDown();
}
function runScenarioStep(i){
  const sc = SCENARIOS[state.scenario];
  if (!sc || i >= sc.steps.length){ removeNextChip(); return; }
  state.scenStep = i;
  if (annoTab === "content") renderAnno();
  const s = sc.steps[i];
  const emit = ()=>{
    if (s.type === "component" && s.component === "results"){
      showTyping(()=>{
        const as = s.resultsAs || { category:"Endocrinologist", specialties:"Endocrinology, Diabetes Care" };
        const specialists = MOCK.providers.map(p=>({ ...p, ...as }));
        addComponent(Components.results({providers:specialists}));
        setCompAnno("Provider Card");
        queueNext(i);
      });
    }
    else if (s.type === "component" && s.component === "selectTile"){
      showTyping(()=>{
        addComponent(Components.selectTile({
          prompt:"Please select a plan in 06002",
          category:"Medical Plans",
          options:MOCK.plans,
          onSelect:(opt)=>{ state.planLabel = opt.label; setCompAnno("Select Tile"); queueNext(i); }
        }));
        setCompAnno("Select Tile");
        // waits for user selection — advance happens in onSelect
      });
    }
    else if (s.type === "component" && s.component === "careCheck"){
      setTimeout(()=>{ addComponent(Components.careCheck(), {branded:false}); queueNext(i); }, 400);
    }
    else if (s.speaker === "ai") showTyping(()=>{ addAI(typeof s.text==="function" ? s.text() : s.text); queueNext(i); });
    else { addUser(s.text); queueNext(i); }
  };
  emit();
}
function queueNext(i){
  const sc = SCENARIOS[state.scenario];
  if (i + 1 >= sc.steps.length){ state.scenStep = i; return; }
  if (state.auto) setTimeout(()=>runScenarioStep(i+1), 1200);
  else showNextChip(()=>runScenarioStep(i+1));
}
function toggleAuto(){
  state.auto = !state.auto;
  document.getElementById("autoBtn").classList.toggle("active", state.auto);
  document.getElementById("autoBtn").textContent = state.auto ? "⏸ Auto-play on" : "▶ Auto-play";
  const chip = document.getElementById("nextChip");
  if (state.auto && chip && state.scenario !== "components"){ chip.remove(); runScenarioStep(state.scenStep + 1); }
  if (state.auto && composerHandler && state.scenario === "components"){
    const i = state.step;
    disarmComposer();
    runStep(i); // re-enter the input step; auto branch simulates the typed zip
  }
}

/* =========================================================
   DEVICE + ANNOTATION SIDEBAR (Bonus)
   ========================================================= */
function setDevice(kind){
  const d = document.getElementById("device");
  d.className = "device " + kind;
  document.getElementById("deviceSel").value = kind;
  document.getElementById("composerInput").placeholder = kind==="mobile" ? "This is a single line of text" : "Ask anything...";
  restartFlow();
}
function toggleAnno(){
  document.getElementById("anno").classList.toggle("hidden");
  document.getElementById("annoBtn").classList.toggle("active");
}

const COMP_DOCS = [
  { name:"Select Tile", what:"Constrained single-select input rendered inside an assistant turn.",
    data:"<code>{prompt, category, options[{id,label,full?}], onSelect}</code>",
    notes:["Radio semantics (role=radiogroup / radio) for accessibility","Locks after selection — the chat transcript stays truthful","Full-width tile variant for escape hatches ('Not sure')"] },
  { name:"Provider Card", what:"Single provider result: identity, proximity, specialties, one CTA.",
    data:"<code>{category, name, address, distance, specialties, initials}</code>",
    notes:["Category header row doubles as the map-pin label in map view","Address truncates with ellipsis at narrow widths","One CTA only — 'View provider details' keeps decision cost low"] },
  { name:"Results container", what:"Wrapper for N provider cards with a List ⇄ Map segmented toggle.",
    data:"<code>{providers:[ProviderCard data + map:{x,y}]}</code>",
    notes:["Same objects power both views — no re-fetch on toggle","Mobile: vertical card stack; desktop: horizontal snap-scroll row","Map pins are numbered; tapping a pin swaps the anchored card"] }
];

let annoTab = "flow";
let contentScenario = null; // which script the Content tab is reading; null = follow toolbar
function contentTarget(){
  if (contentScenario) return contentScenario;
  return state.scenario !== "components" ? state.scenario : Object.keys(SCENARIOS)[0];
}
function setContentScenario(id){ contentScenario = id; renderAnno(); }
function setAnnoTab(t){
  annoTab = t;
  document.getElementById("tabFlow").classList.toggle("active", t==="flow");
  document.getElementById("tabContent").classList.toggle("active", t==="content");
  renderAnno();
}
function renderAnno(){
  const body = document.getElementById("annoBody");
  body.innerHTML = "";
  if (annoTab === "content"){
    const target = contentTarget();
    const chips = div("content-chips");
    Object.keys(SCENARIOS).forEach(id=>{
      const b = document.createElement("button");
      b.className = "content-chip" + (id===target ? " active":"");
      b.textContent = SCENARIOS[id].title.split("·")[0].trim();
      b.onclick = ()=>setContentScenario(id);
      chips.appendChild(b);
    });
    body.appendChild(chips);
    const sc = SCENARIOS[target];
    const head = div("anno-comp");
    head.innerHTML = `<h3>${sc.title}</h3>${sc.intro}`;
    body.appendChild(head);
    sc.steps.forEach((s,i)=>{
      const isCurrent = state.scenario===target && i===state.scenStep;
      const el = div("anno-step" + (isCurrent ? " current":""));
      el.innerHTML = `<div class="t"><span class="n">${String(i+1).padStart(2,"0")}</span>${s.label}</div>
        <span class="speaker ${s.speaker}">${s.speaker==="ai"?"Bot":"User"}</span> ${(typeof s.text==="function"?s.text():s.text).replace(/\n/g,"<br>")}
        ${s.type==="component"?`<span class="comp-tag">Component: ${s.component==="selectTile"?"Select Tile":s.component==="careCheck"?"Feedback":"Results (List/Map)"}</span>`:""}`;
      body.appendChild(el);
    });
    if (state.scenario !== target){
      const note = div("anno-comp");
      note.innerHTML = `Select <strong>${sc.title.split("·")[0].trim()}</strong> in the toolbar’s Flow picker to run this script in the chat.`;
      body.appendChild(note);
    }
    return;
  }
  if (annoTab === "flow"){
    FLOW.forEach((s,i)=>{
      const el = div("anno-step" + (i===state.step ? " current":""));
      el.id = "anno-step-"+i;
      el.innerHTML = `<div class="t"><span class="n">${String(i+1).padStart(2,"0")}</span>${s.anno.title}</div>
        ${s.anno.body}${s.anno.comp?`<span class="comp-tag">Component: ${s.anno.comp}</span>`:""}`;
      body.appendChild(el);
    });
  }
}
function highlightAnnoStep(i){ if(annoTab==="flow") renderAnno(); }
function setCompAnno(name){ state.activeComp = name; }

/* boot */
function refreshPicker(){
  const sel = document.getElementById("scenarioSel");
  // keep the built-in component flow option, rebuild the rest from the registry
  [...sel.querySelectorAll("option")].forEach(o=>{ if (o.value !== "components") o.remove(); });
  Object.keys(SCENARIOS).forEach(id=>{
    const o = document.createElement("option");
    o.value = id;
    o.textContent = SCENARIOS[id].title.split("·")[0].trim();
    sel.appendChild(o);
  });
}
refreshPicker();
renderAnno();
runStep(0);


/* =========================================================
   EDIT MODE — turn-based builder (session registry)
   ========================================================= */
function openEditMode(){
  document.getElementById("editModal").hidden = false;
  document.getElementById("editError").hidden = true;
  if (!document.querySelectorAll("#turnList .turn-row").length) addTurnRow("user");
}
function closeEditMode(){
  document.getElementById("editModal").hidden = true;
}
document.addEventListener("keydown", e=>{
  if (e.key === "Escape" && !document.getElementById("editModal").hidden) closeEditMode();
});
document.getElementById("editModal").addEventListener("click", e=>{
  if (e.target.id === "editModal") closeEditMode();
});

/* ----- Turn rows ----- */
function addTurnRow(speaker, text=""){
  const list = document.getElementById("turnList");
  if (!speaker){
    const rows = list.querySelectorAll(".turn-row");
    const last = rows[rows.length-1];
    speaker = last && last.dataset.speaker === "user" ? "ai" : "user";
  }
  const row = div("turn-row");
  row.dataset.speaker = speaker;
  row.innerHTML = `
    <div class="turn-toggle" role="radiogroup" aria-label="Speaker">
      <button type="button" data-sp="user">User</button>
      <button type="button" data-sp="ai">Bot</button>
    </div>
    <textarea class="turn-text" rows="2" placeholder="Message…">${text}</textarea>
    <button type="button" class="turn-del" aria-label="Remove turn">✕</button>`;
  const paint = ()=>row.querySelectorAll(".turn-toggle button").forEach(b=>
    b.classList.toggle("active", b.dataset.sp === row.dataset.speaker));
  row.querySelectorAll(".turn-toggle button").forEach(b=>
    b.onclick = ()=>{ row.dataset.speaker = b.dataset.sp; paint(); });
  row.querySelector(".turn-del").onclick = ()=>row.remove();
  paint();
  list.appendChild(row);
  row.querySelector(".turn-text").focus();
}

/* ----- Paste import: parser prefills the builder for review ----- */
function togglePastePanel(){
  const p = document.getElementById("pastePanel");
  p.hidden = !p.hidden;
  if (!p.hidden) document.getElementById("pasteContent").focus();
}
function importPastedText(){
  const raw = document.getElementById("pasteContent").value;
  const steps = parseScenarioText(raw);
  const err = document.getElementById("editError");
  if (!steps.length){
    err.textContent = "Nothing to import — add some text first.";
    err.hidden = false;
    return;
  }
  err.hidden = true;
  // replace empty starter row if untouched
  const list = document.getElementById("turnList");
  [...list.querySelectorAll(".turn-row")].forEach(r=>{
    if (!r.querySelector(".turn-text").value.trim()) r.remove();
  });
  steps.forEach(s=>addTurnRow(s.speaker, s.text));
  document.getElementById("pasteContent").value = "";
  document.getElementById("pastePanel").hidden = true;
}

/* Parse pasted text into {speaker, text} steps.
   "User:" / "AI:" / "Bot:" / "Assistant:" prefixes set the speaker.
   Unprefixed paragraphs alternate turns; a blank line ends a turn. */
function parseScenarioText(raw){
  const steps = [];
  let current = null;
  let nextAlt = "user";
  const prefix = /^(user|ai|bot|assistant)\s*[:\-–]\s*/i;
  raw.split(/\n/).forEach(line=>{
    const m = line.match(prefix);
    if (m){
      if (current) steps.push(current);
      const sp = m[1].toLowerCase() === "user" ? "user" : "ai";
      current = { speaker: sp, text: line.replace(prefix, "").trim() };
      nextAlt = sp === "user" ? "ai" : "user";
    } else if (line.trim() === ""){
      if (current && current.text){ steps.push(current); current = null; }
    } else {
      if (current){ current.text += (current.text ? "\n" : "") + line.trim(); }
      else {
        current = { speaker: nextAlt, text: line.trim() };
        nextAlt = nextAlt === "user" ? "ai" : "user";
      }
    }
  });
  if (current && current.text) steps.push(current);
  return steps;
}

/* ----- Register + play ----- */
function nextScenarioLetter(){
  return String.fromCharCode(65 + Object.keys(SCENARIOS).length); // a,b built-in → customs start at C
}
function testContent(){
  const err = document.getElementById("editError");
  const rows = [...document.querySelectorAll("#turnList .turn-row")];
  const steps = rows
    .map(r=>({ speaker: r.dataset.speaker, text: r.querySelector(".turn-text").value.trim() }))
    .filter(s=>s.text);
  if (!steps.length){
    err.textContent = "Add at least one turn with content to test.";
    err.hidden = false;
    return;
  }
  err.hidden = true;
  const letter = nextScenarioLetter();
  const id = "scenario-" + letter.toLowerCase();
  const customTitle = document.getElementById("editTitleInput").value.trim();
  const title = (customTitle ? customTitle + " — " : "") + "Scenario " + letter + " · User-authored";
  steps.forEach((s,i)=> s.label = "Turn " + String(i+1).padStart(2,"0") + " — " + (s.speaker==="ai" ? "Bot" : "User"));
  SCENARIOS[id] = { title, intro: "User-authored scenario added via Edit Mode.", steps, source: "custom" };
  refreshPicker();
  document.getElementById("editTitleInput").value = "";
  document.getElementById("turnList").innerHTML = "";
  closeEditMode();
  setScenario(id);
}

/* version badge */
(function(){
  const h1 = document.querySelector(".toolbar h1");
  if (h1){
    const b = document.createElement("span");
    b.className = "ver-badge";
    b.textContent = "v" + APP_VERSION;
    h1.appendChild(b);
  }
})();
