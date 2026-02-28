import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lhhhqzpcemcgdebxnhyq.supabase.co'
const supabaseAnonKey = 'sb_publishable_hzKDR9xBEfIfgPczBkQEsw_eupsPleA'
const supabase = createClient(supabaseUrl, supabaseAnonKey)
const P = {
  obsidian:   "#050505",
  surface:    "#0a0a0f",
  card:       "rgba(12,12,18,0.85)",
  cardH:      "rgba(18,18,28,0.95)",
  glass:      "rgba(255,179,0,0.03)",
  glassH:     "rgba(255,179,0,0.07)",
  border:     "rgba(255,179,0,0.1)",
  borderA:    "rgba(255,179,0,0.4)",
  amber:      "#FFB300",
  amberD:     "#E65100",
  amberGlow:  "rgba(255,179,0,0.3)",
  amberSoft:  "rgba(255,179,0,0.06)",
  cyan:       "#00E5FF",
  cyanGlow:   "rgba(0,229,255,0.3)",
  copper:     "#D84315",
  copperGlow: "rgba(216,67,21,0.3)",
  indigo:     "#7C4DFF",
  indigoGlow: "rgba(124,77,255,0.3)",
  text:       "#F5F0E8",
  textD:      "#B0A090",
  muted:      "#5a5040",
  solar:      "#FFB300",
  wind:       "#00E5FF",
  biogas:     "#D84315",
  danger:     "#FF1744",
  warn:       "#FF6D00",
  success:    "#00E676",
  purple:     "#E040FB",
  gridFloor:  "#FF6D00",
};

// ── CONSTANTS ────────────────────────────────────────────────────────
const FOSSIL_FACTOR  = 0.82;
const GRID_FLOOR     = 3.0;
const LOCAL_DISC     = 0.05;
const BIOGAS_KWH_TON = 300;
const GRIDCOIN_RATE  = 0.01; // 1 GridCoin per 100kWh

const calcCO2   = u => +(u * FOSSIL_FACTOR).toFixed(2);
const biogasKwh = t => +(t * BIOGAS_KWH_TON);
const genHash   = () => Array.from({length:64}, () => "0123456789abcdef"[Math.floor(Math.random()*16)]).join("");
const isNight   = () => { const h = new Date().getHours(); return h < 6 || h >= 20; };
const getUserById = id => DB.users.find(u => u.id === id);
const calcGridCoins = kwh => Math.floor(kwh / 100);

// ── DATA ─────────────────────────────────────────────────────────────
const DB = {
  users: [
    { id:1, name:"IIT Delhi Solar Rooftop",   email:"solar@iitd.ac.in",        password:"demo", role:"producer", producer_type:"solar_rooftop", location:"Delhi",    greenScore:920, joined:"2024-08-01", trustScore:4.8, reviews:34, gridCoins:1840 },
    { id:2, name:"Rajasthan Wind Energy Ltd",  email:"wind@rajasthan.in",       password:"demo", role:"producer", producer_type:"wind_energy",   location:"Jaipur",   greenScore:840, joined:"2024-09-15", trustScore:4.6, reviews:22, gridCoins:1210 },
    { id:3, name:"Punjab BioGas Plant",        email:"biogas@punjab.in",        password:"demo", role:"producer", producer_type:"biogas_plant",  location:"Amritsar", greenScore:710, joined:"2024-10-20", trustScore:4.3, reviews:17, gridCoins:890  },
    { id:4, name:"Green Hostel — Mumbai",      email:"hostel@mumbai.in",        password:"demo", role:"buyer",    buyer_type:"hostel",           location:"Mumbai",   greenScore:560, joined:"2024-11-01", trustScore:4.5, reviews:12, gridCoins:560  },
    { id:5, name:"TechCorp Solutions",         email:"tech@pune.in",            password:"demo", role:"buyer",    buyer_type:"small_business",   location:"Pune",     greenScore:430, joined:"2024-11-15", trustScore:4.1, reviews:8,  gridCoins:320  },
    { id:6, name:"Symbiosis University",       email:"energy@symbiosis.edu.in", password:"demo", role:"buyer",    buyer_type:"institution",      location:"Pune",     greenScore:680, joined:"2024-12-01", trustScore:4.7, reviews:19, gridCoins:780  },
    { id:7, name:"BITS Pilani Campus",         email:"campus@bits.ac.in",       password:"demo", role:"producer", producer_type:"solar_rooftop", location:"Pilani",   greenScore:780, joined:"2025-01-10", trustScore:4.9, reviews:28, gridCoins:1540, isCampus:true },
  ],
  energy_listings: [
    { id:1, producer_id:1, energy_type:"solar",  units_available:500,  price_per_unit:4.2, location:"Delhi",    status:"active", validity:"2025-03-30", solar_capacity_kw:20,  panel_count:80,  flashSale:null },
    { id:2, producer_id:2, energy_type:"wind",   units_available:800,  price_per_unit:3.8, location:"Jaipur",   status:"active", validity:"2025-04-15", turbine_count:3,  wind_speed_avg:7.2, flashSale:{ discount:0.20, label:"Wind Surge!", endsAt: Date.now()+7200000 } },
    { id:3, producer_id:3, energy_type:"biogas", units_available:300,  price_per_unit:5.1, location:"Amritsar", status:"active", validity:"2025-03-20", feedstock_type:"Agricultural waste", plant_capacity_m3:50, waste_tons:1, flashSale:null },
    { id:4, producer_id:1, energy_type:"solar",  units_available:200,  price_per_unit:4.5, location:"Delhi",    status:"active", validity:"2025-05-01", solar_capacity_kw:8,   panel_count:32,  flashSale:null },
    { id:5, producer_id:2, energy_type:"wind",   units_available:1200, price_per_unit:3.5, location:"Jodhpur",  status:"active", validity:"2025-04-30", turbine_count:5,  wind_speed_avg:8.1, flashSale:null },
    { id:6, producer_id:7, energy_type:"solar",  units_available:650,  price_per_unit:3.9, location:"Pilani",   status:"active", validity:"2025-06-01", solar_capacity_kw:30,  panel_count:120, flashSale:null, campus:true },
    { id:7, producer_id:3, energy_type:"biogas", units_available:180,  price_per_unit:4.8, location:"Ludhiana", status:"active", validity:"2025-04-10", feedstock_type:"Crop residue", plant_capacity_m3:30, waste_tons:0.6, flashSale:null },
  ],
  transactions: [
    { id:1, listing_id:1, buyer_id:4, units_bought:150, total_price:630,  carbon_saved:123.0, date:"2025-02-10", status:"completed", tx_hash:genHash() },
    { id:2, listing_id:2, buyer_id:5, units_bought:300, total_price:1140, carbon_saved:246.0, date:"2025-02-14", status:"completed", tx_hash:genHash() },
    { id:3, listing_id:3, buyer_id:4, units_bought:80,  total_price:408,  carbon_saved:65.6,  date:"2025-02-18", status:"completed", tx_hash:genHash() },
    { id:4, listing_id:5, buyer_id:6, units_bought:400, total_price:1400, carbon_saved:328.0, date:"2025-02-20", status:"completed", tx_hash:genHash() },
    { id:5, listing_id:6, buyer_id:5, units_bought:200, total_price:780,  carbon_saved:164.0, date:"2025-02-22", status:"completed", tx_hash:genHash() },
    { id:6, listing_id:1, buyer_id:6, units_bought:100, total_price:420,  carbon_saved:82.0,  date:"2025-02-24", status:"completed", tx_hash:genHash() },
  ],
  communityPools: [
    { id:1, name:"Delhi Solar Collective",    members:[1,7], totalKwh:1150, status:"active",  attracting:"institutional", city:"Delhi",    targetKwh:2000 },
    { id:2, name:"Rajasthan Wind Alliance",   members:[2],   totalKwh:800,  status:"forming", attracting:"corporate",     city:"Jaipur",   targetKwh:3000 },
    { id:3, name:"Punjab Green Bloc",         members:[3],   totalKwh:300,  status:"forming", attracting:"municipal",     city:"Amritsar", targetKwh:1500 },
  ],
  reviews: [
    { id:1, producer_id:1, buyer_id:4, rating:5, comment:"Excellent quality, on-time delivery!", date:"2025-02-11" },
    { id:2, producer_id:1, buyer_id:5, rating:5, comment:"Best solar provider in Delhi!", date:"2025-02-23" },
    { id:3, producer_id:2, buyer_id:6, rating:4, comment:"Good wind energy, slight price fluctuation.", date:"2025-02-21" },
    { id:4, producer_id:7, buyer_id:5, rating:5, comment:"BITS campus solar is outstanding quality.", date:"2025-02-23" },
    { id:5, producer_id:3, buyer_id:4, rating:4, comment:"Biogas consistent, great circular economy.", date:"2025-02-19" },
  ],
};

// ── GLOBAL STYLES ────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background: ${P.obsidian}; color: ${P.text}; font-family: 'DM Sans', sans-serif; overflow-x: hidden; cursor: none; }
    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-track { background: ${P.obsidian}; }
    ::-webkit-scrollbar-thumb { background: ${P.border}; border-radius: 2px; }
    input, select, textarea, button { font-family: 'DM Sans', sans-serif; }
    input[type=range] { -webkit-appearance: none; height: 2px; cursor: pointer; background: ${P.border}; border-radius: 1px; }
    input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: ${P.amber}; box-shadow: 0 0 12px ${P.amberGlow}; cursor: pointer; border: 2px solid ${P.obsidian}; }
    select option { background: #0d0d14; color: ${P.text}; }

    @keyframes prism-pulse { 0%,100% { opacity:0.6; transform:scale(1); } 50% { opacity:1; transform:scale(1.08); } }
    @keyframes orbit { to { transform: rotate(360deg); } }
    @keyframes orbit-rev { to { transform: rotate(-360deg); } }
    @keyframes float { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-12px); } }
    @keyframes energy-stream { 0% { stroke-dashoffset:600; opacity:0; } 15% { opacity:1; } 100% { stroke-dashoffset:0; opacity:0; } }
    @keyframes slide-up { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
    @keyframes scale-in { from { opacity:0; transform:scale(0.88); } to { opacity:1; transform:scale(1); } }
    @keyframes ticker-scroll { from { transform:translateX(0); } to { transform:translateX(-50%); } }
    @keyframes earth-heal { 0% { filter:saturate(0) brightness(0.2) hue-rotate(0deg); } 60% { filter:saturate(0.6) brightness(0.7) hue-rotate(30deg); } 100% { filter:saturate(1.4) brightness(1.1) hue-rotate(60deg); } }
    @keyframes prism-glow { 0%,100% { box-shadow:0 0 20px ${P.amberGlow}; } 50% { box-shadow:0 0 50px ${P.amberGlow}, 0 0 100px ${P.amberSoft}, inset 0 0 30px rgba(255,179,0,0.05); } }
    @keyframes line-ignite { from { stroke-dashoffset:800; opacity:0; } to { stroke-dashoffset:0; opacity:0.7; } }
    @keyframes count-up { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
    @keyframes flash-badge { 0%,100% { background:rgba(216,67,21,0.15); border-color:rgba(216,67,21,0.4); } 50% { background:rgba(216,67,21,0.3); border-color:rgba(216,67,21,0.8); } }
    @keyframes scanline { 0% { transform:translateY(-100%); } 100% { transform:translateY(100vh); } }
    @keyframes coin-spin { 0% { transform:rotateY(0deg); } 100% { transform:rotateY(360deg); } }
    @keyframes particle-drift { 0% { transform:translate(0,0) scale(1); opacity:0.8; } 100% { transform:translate(var(--dx),var(--dy)) scale(0); opacity:0; } }

    .prism-btn { position:relative; overflow:hidden; transition:all 0.3s cubic-bezier(0.4,0,0.2,1); }
    .prism-btn::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg, rgba(255,255,255,0.1), transparent); opacity:0; transition:opacity 0.3s; }
    .prism-btn:hover::after { opacity:1; }
    .glass-obsidian { background:${P.card}; backdrop-filter:blur(24px) saturate(1.6); -webkit-backdrop-filter:blur(24px) saturate(1.6); border:1px solid ${P.border}; border-radius:16px; }
    .glass-obsidian:hover { background:${P.cardH}; border-color:${P.borderA}; }
    .cinema-text { font-family:'Bebas Neue', sans-serif; letter-spacing:0.05em; }
    @keyframes preloader-reveal { from { clip-path:inset(0 100% 0 0); } to { clip-path:inset(0 0% 0 0); } }
  `}</style>
);

// ── CUSTOM CURSOR ────────────────────────────────────────────────────
function PrismCursor() {
  const [pos, setPos] = useState({ x:-100, y:-100 });
  const [hovering, setHovering] = useState(false);
  useEffect(() => {
    const onMove = e => {
      setPos({ x: e.clientX, y: e.clientY });
      const el = document.elementFromPoint(e.clientX, e.clientY);
      setHovering(el?.matches?.('button, a, [role="button"], input, select') ?? false);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);
  return (
    <>
      <div style={{ position:'fixed', left: pos.x-4, top: pos.y-4, width:8, height:8, borderRadius:'50%', background:P.amber, pointerEvents:'none', zIndex:99999, transition:'transform 0.05s', transform: hovering?'scale(0.5)':'scale(1)', mixBlendMode:'difference' }}/>
      <div style={{ position:'fixed', left: pos.x-20, top: pos.y-20, width:40, height:40, borderRadius:'50%', border:`1px solid ${P.amber}40`, pointerEvents:'none', zIndex:99998, transition:'all 0.15s', transform: hovering?'scale(1.8)':'scale(1)', opacity: hovering?0.8:0.3 }}/>
    </>
  );
}

// ── EARTH SVG (3D Healing Animation) ────────────────────────────────
function EarthSVG({ healing, style }) {
  const lines = [
    "M60,80  Q120,50  180,90  Q240,130 300,80",
    "M40,140 Q110,100 170,150 Q230,200 290,140",
    "M50,200 Q130,170 190,210 Q260,250 310,200",
    "M80,50  Q150,20  200,60  Q260,100 310,50",
    "M30,260 Q100,230 160,260 Q220,290 290,260",
  ];
  return (
    <svg viewBox="0 0 360 360" style={{ ...style, animation: healing ? "earth-heal 2.2s ease forwards" : "none" }}>
      <defs>
        <radialGradient id="earthCore" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#1a0d2e"/>
          <stop offset="35%" stopColor="#0d0818"/>
          <stop offset="100%" stopColor="#03020a"/>
        </radialGradient>
        <radialGradient id="atmosphereGlow" cx="50%" cy="50%">
          <stop offset="60%" stopColor="transparent"/>
          <stop offset="85%" stopColor={healing?"rgba(124,77,255,0.15)":"rgba(0,0,0,0)"}/>
          <stop offset="100%" stopColor={healing?"rgba(255,179,0,0.1)":"rgba(0,0,0,0)"}/>
        </radialGradient>
        <filter id="earthGlow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="bigGlow"><feGaussianBlur stdDeviation="12" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {/* Outer atmosphere */}
      <circle cx="180" cy="180" r="175" fill="url(#atmosphereGlow)" opacity="0.6"/>
      {/* Earth body */}
      <circle cx="180" cy="180" r="155" fill="url(#earthCore)" stroke={healing?"rgba(124,77,255,0.3)":"rgba(255,179,0,0.08)"} strokeWidth="1.5"/>
      {/* Continents */}
      <ellipse cx="140" cy="140" rx="35" ry="28" fill="#0d1a0d" opacity="0.9"/>
      <ellipse cx="215" cy="165" rx="28" ry="22" fill="#0d1a0d" opacity="0.9"/>
      <ellipse cx="165" cy="210" rx="40" ry="20" fill="#0d1a0d" opacity="0.9"/>
      <ellipse cx="115" cy="200" rx="22" ry="30" fill="#0d1a0d" opacity="0.9"/>
      <ellipse cx="245" cy="115" rx="20" ry="14" fill="#0d1a0d" opacity="0.9"/>
      {/* Energy grid lines — appear on healing */}
      {healing && lines.map((d, i) => (
        <path key={i} d={d}
          stroke={[P.amber,P.cyan,P.indigo,P.amber,P.cyan][i]}
          strokeWidth="1.5" fill="none" filter="url(#earthGlow)"
          strokeDasharray="800" strokeDashoffset="800"
          style={{ animation: `line-ignite 1.6s ${i*0.28}s cubic-bezier(0.4,0,0.2,1) forwards` }}/>
      ))}
      {/* City glow nodes */}
      {healing && [[140,140],[215,165],[165,210],[115,200]].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r={4} fill={[P.amber,P.cyan,P.indigo,P.amber][i]} filter="url(#earthGlow)" opacity="0">
          <animate attributeName="opacity" values="0;1;0.7" dur={`0.5s`} begin={`${0.8+i*0.2}s`} fill="freeze"/>
        </circle>
      ))}
      {/* Latitude/longitude */}
      {[0,45,90,135].map((a,i) => <line key={i} x1="180" y1="25" x2="180" y2="335" stroke="rgba(255,179,0,0.04)" strokeWidth="0.8" style={{transformOrigin:"180px 180px", transform:`rotate(${a}deg)`}}/>)}
      {[40,80,120].map(r => <circle key={r} cx="180" cy="180" r={r} fill="none" stroke="rgba(255,179,0,0.04)" strokeWidth="0.8"/>)}
    </svg>
  );
}

// ── PRELOADER (Cinematic) ────────────────────────────────────────────
function Preloader({ onComplete }) {
  const [step, setStep]       = useState(0);
  const [role, setRole]       = useState(null);
  const [healing, setHealing] = useState(false);
  const [earthSize, setEarthSize] = useState(480);
  const [earthPos, setEarthPos]   = useState({ top:"50%", left:"50%", transform:"translate(-50%,-50%)" });
  const [fadeOut, setFadeOut]     = useState(false);

  const PARTICLES = useMemo(() => Array.from({length:30}).map((_,i) => ({
    left: `${Math.random()*100}%`, top: `${Math.random()*100}%`,
    size: Math.random()*2+0.5,
    delay: Math.random()*4, dur: 3+Math.random()*4,
    col: [P.amber,P.cyan,P.indigo][Math.floor(Math.random()*3)],
  })), []);

  const handleScale = s => {
    setStep(2);
    setHealing(true);
    setTimeout(() => {
      setEarthSize(120);
      setEarthPos({ top:"16px", right:"20px", left:"auto", transform:"none" });
    }, 1600);
    setTimeout(() => { setFadeOut(true); setTimeout(() => onComplete({ role, scale: s }), 500); }, 2800);
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, background:"#020206", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", opacity:fadeOut?0:1, transition:"opacity 0.5s ease" }}>
      {/* Scanline */}
      <div style={{ position:"absolute", inset:0, background:"repeating-linear-gradient(0deg, rgba(255,179,0,0.012) 0px, rgba(255,179,0,0.012) 1px, transparent 1px, transparent 4px)", pointerEvents:"none", zIndex:1 }}/>
      {/* Particles */}
      {PARTICLES.map((p,i) => (
        <div key={i} style={{ position:"absolute", left:p.left, top:p.top, width:p.size, height:p.size, borderRadius:"50%", background:p.col, opacity:0.4, animation:`float ${p.dur}s ${p.delay}s ease-in-out infinite` }}/>
      ))}

      {/* Earth */}
      <EarthSVG healing={healing} style={{
        position:"absolute",
        width: earthSize, height: earthSize,
        top: earthPos.top, left: earthPos.left, right: earthPos.right||"auto",
        transform: earthPos.transform || "none",
        transition:"all 1.1s cubic-bezier(0.77,0,0.175,1)",
        filter:`drop-shadow(0 0 60px ${healing?"rgba(124,77,255,0.5)":"rgba(255,179,0,0.2)"})`,
        zIndex:2,
      }}/>

      {/* Step 0 — Role */}
      {step === 0 && (
        <div style={{ position:"relative", zIndex:3, textAlign:"center", animation:"slide-up 0.8s ease" }}>
          <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:"clamp(52px,7vw,96px)", letterSpacing:"0.12em", color:P.amber, lineHeight:1, filter:`drop-shadow(0 0 30px ${P.amberGlow})` }}>SYNGRID</div>
          <div style={{ fontSize:11, letterSpacing:8, color:P.muted, textTransform:"uppercase", marginTop:8, marginBottom:56 }}>Decentralized Energy Marketplace</div>
          <div style={{ fontSize:14, color:P.textD, marginBottom:40, fontWeight:300 }}>You are here to <em style={{color:P.amber, fontStyle:"normal", fontWeight:600}}>power</em> or <em style={{color:P.cyan, fontStyle:"normal", fontWeight:600}}>consume</em>?</div>
          <div style={{ display:"flex", gap:24, justifyContent:"center" }}>
            {[
              { v:"producer", icon:"⚡", label:"Power the Grid", sub:"Sell your clean energy", col:P.amber },
              { v:"buyer",    icon:"🌿", label:"Consume Green",   sub:"Buy renewable energy",  col:P.cyan  },
            ].map(opt => (
              <div key={opt.v} onClick={() => { setRole(opt.v); setStep(1); }}
                style={{ cursor:"pointer", padding:"36px 44px", border:`1px solid ${opt.col}20`, borderRadius:20, textAlign:"center", background:`${opt.col}05`, backdropFilter:"blur(12px)", transition:"all 0.3s cubic-bezier(0.4,0,0.2,1)", minWidth:220 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=`${opt.col}60`; e.currentTarget.style.background=`${opt.col}10`; e.currentTarget.style.transform="translateY(-6px)"; e.currentTarget.style.boxShadow=`0 30px 80px ${opt.col}20`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=`${opt.col}20`; e.currentTarget.style.background=`${opt.col}05`; e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}>
                <div style={{ fontSize:44, marginBottom:16 }}>{opt.icon}</div>
                <div style={{ fontSize:18, fontWeight:600, color:opt.col, fontFamily:"'Bebas Neue', sans-serif", letterSpacing:2 }}>{opt.label}</div>
                <div style={{ fontSize:12, color:P.muted, marginTop:8 }}>{opt.sub}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 1 — Scale */}
      {step === 1 && (
        <div style={{ position:"relative", zIndex:3, textAlign:"center", animation:"slide-up 0.5s ease" }}>
          <div style={{ fontSize:16, color:P.textD, fontWeight:300, marginBottom:48 }}>Identify your <span style={{color:P.amber, fontWeight:600}}>operational scale</span></div>
          <div style={{ display:"flex", gap:24, justifyContent:"center" }}>
            {[
              { v:"organization",   icon:"🏢", label:"Organization",   sub:"Corporate / Institution / Campus", col:P.cyan   },
              { v:"private_player", icon:"🏠", label:"Private Player",  sub:"Individual / SME / Startup",      col:P.indigo },
            ].map(opt => (
              <div key={opt.v} onClick={() => handleScale(opt.v)}
                style={{ cursor:"pointer", padding:"36px 44px", border:`1px solid ${opt.col}20`, borderRadius:20, textAlign:"center", background:`${opt.col}05`, backdropFilter:"blur(12px)", transition:"all 0.3s", minWidth:240 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=`${opt.col}50`; e.currentTarget.style.background=`${opt.col}10`; e.currentTarget.style.transform="translateY(-6px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=`${opt.col}20`; e.currentTarget.style.background=`${opt.col}05`; e.currentTarget.style.transform="none"; }}>
                <div style={{ fontSize:44, marginBottom:16 }}>{opt.icon}</div>
                <div style={{ fontSize:18, fontWeight:600, color:opt.col, fontFamily:"'Bebas Neue', sans-serif", letterSpacing:2 }}>{opt.label}</div>
                <div style={{ fontSize:12, color:P.muted, marginTop:8 }}>{opt.sub}</div>
              </div>
            ))}
          </div>
          <button onClick={() => setStep(0)} style={{ marginTop:40, background:"none", border:"none", color:P.muted, fontSize:12, cursor:"pointer", letterSpacing:3, textTransform:"uppercase" }}>← BACK</button>
        </div>
      )}

      {/* Step 2 — Earth healing */}
      {step === 2 && (
        <div style={{ position:"absolute", bottom:60, left:"50%", transform:"translateX(-50%)", zIndex:3, textAlign:"center", animation:"slide-up 0.5s 0.3s ease both" }}>
          <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:18, letterSpacing:6, color:P.amber, textTransform:"uppercase" }}>Healing the Grid…</div>
          <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:16 }}>
            {[0,1,2].map(i => <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:P.amber, animation:`prism-pulse 1.2s ${i*0.2}s ease infinite` }}/>)}
          </div>
        </div>
      )}
    </div>
  );
}

// ── ATOMS ─────────────────────────────────────────────────────────────
function ObsidianCard({ children, style={}, onClick, glow }) {
  const [h,setH]=useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{
        background: h ? P.cardH : P.card,
        backdropFilter:"blur(24px) saturate(1.8)",
        WebkitBackdropFilter:"blur(24px) saturate(1.8)",
        border:`1px solid ${h&&(onClick||glow)?P.borderA:P.border}`,
        borderRadius:16, padding:24,
        transition:"all 0.3s cubic-bezier(0.4,0,0.2,1)",
        cursor:onClick?"pointer":"default",
        boxShadow: h&&(onClick||glow)?`0 12px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,179,0,0.08)`:"0 4px 24px rgba(0,0,0,0.5)",
        ...style,
      }}>{children}</div>
  );
}

function PrismBtn({ children, onClick, variant="primary", size="md", full }) {
  const [h,setH]=useState(false);
  const v = {
    primary: { background:`linear-gradient(135deg, ${P.amber}, ${P.amberD})`,   color:"#000", border:"none", boxShadow:h?`0 8px 32px ${P.amberGlow}`:`0 4px 16px ${P.amberGlow}40` },
    ghost:   { background:"transparent", color:h?P.amber:P.muted, border:`1px solid ${h?P.amber:P.border}` },
    cyan:    { background:`linear-gradient(135deg, ${P.cyan}, #006080)`,          color:"#000", border:"none", boxShadow:h?`0 8px 32px ${P.cyanGlow}`:"none" },
    copper:  { background:`linear-gradient(135deg, ${P.copper}, #7b1d0a)`,        color:"#fff", border:"none", boxShadow:h?`0 8px 32px ${P.copperGlow}`:"none" },
    indigo:  { background:`linear-gradient(135deg, ${P.indigo}, #4527a0)`,        color:"#fff", border:"none", boxShadow:h?`0 8px 32px ${P.indigoGlow}`:"none" },
    danger:  { background:"transparent", color:P.danger, border:`1px solid ${P.danger}55` },
  };
  const s = v[variant]||v.primary;
  return (
    <button onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} className="prism-btn"
      style={{ ...s, padding:size==="sm"?"6px 16px":size==="lg"?"16px 40px":"10px 24px", borderRadius:10, fontWeight:600, fontSize:size==="sm"?11:size==="lg"?15:13, cursor:"pointer", transition:"all 0.25s cubic-bezier(0.4,0,0.2,1)", width:full?"100%":"auto", fontFamily:"inherit", letterSpacing:0.5, transform:h?"translateY(-1px)":"translateY(0)" }}>
      {children}
    </button>
  );
}

function EnergyTag({ type, size="md" }) {
  const meta = { solar:{icon:"☀️",label:"Solar",color:P.solar}, wind:{icon:"💨",label:"Wind",color:P.wind}, biogas:{icon:"♻️",label:"Biogas",color:P.biogas} };
  const m = meta[type]||{icon:"⚡",label:type,color:P.amber};
  return <span style={{ background:`${m.color}18`, color:m.color, border:`1px solid ${m.color}35`, borderRadius:30, padding:size==="sm"?"2px 10px":"5px 16px", fontSize:size==="sm"?9:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1, display:"inline-flex", alignItems:"center", gap:4 }}>{m.icon} {m.label}</span>;
}

function StatusPill({ status }) {
  const cfg = { active:[P.amber,"● Live"], pending:[P.warn,"⏳ Pending"], accepted:[P.success,"✓ Accepted"], rejected:[P.danger,"✕ Rejected"], completed:[P.cyan,"✔ Done"], grid_sold:[P.copper,"🏛 Grid Sold"] };
  const [col,lbl] = cfg[status]||[P.muted,status];
  return <span style={{ background:`${col}18`, color:col, border:`1px solid ${col}40`, borderRadius:30, padding:"3px 12px", fontSize:9, fontWeight:700, letterSpacing:0.5 }}>{lbl}</span>;
}

function PrismInput({ label, value, onChange, type="text", placeholder, options, hint }) {
  const base = { display:"block", width:"100%", marginTop:6, padding:"11px 14px", background:"rgba(255,255,255,0.04)", border:`1px solid ${P.border}`, borderRadius:10, color:P.text, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit", transition:"border-color 0.2s, background 0.2s" };
  return (
    <div style={{ marginBottom:16 }}>
      {label && <label style={{ color:P.muted, fontSize:9, textTransform:"uppercase", letterSpacing:1.5, fontWeight:600 }}>{label}</label>}
      {hint && <div style={{ color:P.amber, fontSize:9, marginTop:2 }}>{hint}</div>}
      {options
        ? <select value={value} onChange={e=>onChange(e.target.value)} style={base}>{options.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}</select>
        : <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={base}
            onFocus={e=>{e.target.style.borderColor=P.amber;e.target.style.background="rgba(255,179,0,0.04)";}}
            onBlur={e=>{e.target.style.borderColor=P.border;e.target.style.background="rgba(255,255,255,0.04)";}}/>}
    </div>
  );
}

function StarRating({ score, count }) {
  const stars = Math.round(score);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:4 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize:12, color:i<=stars?P.amber:P.muted }}>★</span>
      ))}
      <span style={{ fontSize:10, color:P.textD, marginLeft:4 }}>{score.toFixed(1)}</span>
      <span style={{ fontSize:9, color:P.muted }}>({count})</span>
    </div>
  );
}

function TrustBadge({ score }) {
  if (score >= 4.8) return <span style={{ background:"rgba(255,179,0,0.15)", color:P.amber, border:`1px solid ${P.amber}40`, borderRadius:20, padding:"2px 10px", fontSize:9, fontWeight:700 }}>🏅 TOP RATED</span>;
  if (score >= 4.5) return <span style={{ background:"rgba(0,229,255,0.12)", color:P.cyan, border:`1px solid ${P.cyan}40`, borderRadius:20, padding:"2px 10px", fontSize:9, fontWeight:700 }}>✦ VERIFIED</span>;
  return null;
}

function FlashSaleTimer({ endsAt, discount }) {
  const [remaining, setRemaining] = useState("");
  useEffect(() => {
    const update = () => {
      const diff = endsAt - Date.now();
      if (diff <= 0) { setRemaining("Expired"); return; }
      const h = Math.floor(diff/3600000);
      const m = Math.floor((diff%3600000)/60000);
      const s = Math.floor((diff%60000)/1000);
      setRemaining(`${h}h ${m.toString().padStart(2,'0')}m ${s.toString().padStart(2,'0')}s`);
    };
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, [endsAt]);
  return (
    <div style={{ padding:"8px 14px", background:"rgba(216,67,21,0.12)", border:`1px solid rgba(216,67,21,0.4)`, borderRadius:10, animation:"flash-badge 2s ease infinite", display:"flex", alignItems:"center", gap:10 }}>
      <span style={{ fontSize:14 }}>⚡</span>
      <div>
        <div style={{ color:P.copper, fontWeight:700, fontSize:11 }}>FLASH SALE · {Math.round(discount*100)}% OFF</div>
        <div style={{ fontFamily:"'JetBrains Mono', monospace", color:P.warn, fontSize:12, fontWeight:700 }}>{remaining}</div>
      </div>
    </div>
  );
}

function GridCoinBadge({ coins }) {
  return (
    <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"6px 14px", borderRadius:30, background:`linear-gradient(135deg, rgba(255,179,0,0.12), rgba(216,67,21,0.08))`, border:`1px solid ${P.amber}30` }}>
      <span style={{ fontSize:16, animation:"coin-spin 3s linear infinite", display:"inline-block" }}>🪙</span>
      <div>
        <span style={{ fontFamily:"'JetBrains Mono', monospace", color:P.amber, fontWeight:700, fontSize:14 }}>{coins.toLocaleString()}</span>
        <span style={{ color:P.muted, fontSize:10, marginLeft:4 }}>GridCoins</span>
      </div>
    </div>
  );
}

function Toast({ msg, onClose }) {
  useEffect(()=>{ const t=setTimeout(onClose,5000); return()=>clearTimeout(t); },[]);
  return (
    <div style={{ position:"fixed", bottom:44, right:24, zIndex:9999, background:P.card, backdropFilter:"blur(24px)", border:`1px solid ${P.amber}`, borderRadius:14, padding:"16px 24px", color:P.text, fontSize:13, fontWeight:500, boxShadow:`0 20px 80px ${P.amberGlow}30, 0 4px 16px rgba(0,0,0,0.6)`, maxWidth:420, animation:"slide-up 0.3s ease" }}>
      {msg}
      <div style={{ marginTop:8, height:2, borderRadius:1, background:P.border, overflow:"hidden" }}>
        <div style={{ height:"100%", background:`linear-gradient(90deg, ${P.amber}, ${P.cyan})`, borderRadius:1, animation:"ticker-scroll 5s linear forwards" }}/>
      </div>
    </div>
  );
}

// ── IMPACT TICKER ─────────────────────────────────────────────────────
function ImpactTicker({ transactions, listings }) {
  const totalCO2 = transactions.reduce((s,t)=>s+t.carbon_saved,0);
  const totalKwh = transactions.reduce((s,t)=>s+t.units_bought,0);
  const items = [
    `⚡ Total Clean Energy Traded: ${totalKwh.toLocaleString()} kWh`,
    `🌍 Community CO₂ Saved: ${totalCO2.toFixed(0)} kg`,
    `🌳 Tree Equivalent: ${Math.round(totalCO2/21).toLocaleString()} trees`,
    `🔗 Blockchain Verified Trades: ${transactions.length}`,
    `♻️ Biogas Conversion: ${BIOGAS_KWH_TON} kWh per Ton`,
    `🏛 Govt Grid Buy-Back Floor: ₹${GRID_FLOOR}/kWh`,
    `🪙 GridCoins in Circulation: ${DB.users.reduce((s,u)=>s+u.gridCoins,0).toLocaleString()}`,
    `📡 SDG 7 — Affordable Clean Energy for All`,
    `🏘 ${DB.communityPools.length} Active Community Pools`,
  ];
  return (
    <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:400, height:34, background:P.surface, borderTop:`1px solid ${P.border}`, display:"flex", alignItems:"center", overflow:"hidden" }}>
      <div style={{ flexShrink:0, paddingLeft:16, paddingRight:16, borderRight:`1px solid ${P.border}`, display:"flex", alignItems:"center", gap:6 }}>
        <div style={{ width:5, height:5, borderRadius:"50%", background:P.amber, animation:"prism-pulse 2s infinite" }}/>
        <span style={{ fontFamily:"'Bebas Neue', sans-serif", color:P.amber, fontSize:10, letterSpacing:2 }}>LIVE GRID</span>
      </div>
      <div style={{ flex:1, overflow:"hidden" }}>
        <div style={{ display:"flex", gap:60, whiteSpace:"nowrap", animation:"ticker-scroll 32s linear infinite" }}>
          {[...items,...items].map((item,i)=><span key={i} style={{ color:P.textD, fontSize:11 }}>{item}</span>)}
        </div>
      </div>
    </div>
  );
}

// ── NETWORK MAP ──────────────────────────────────────────────────────
function NetworkPage() {
  const nodes = [
    { x:200, y:100, label:"Delhi",    type:"solar",  kwh:700,  id:1 },
    { x:165, y:225, label:"Jaipur",   type:"wind",   kwh:2000, id:2 },
    { x:130, y:315, label:"Jodhpur",  type:"wind",   kwh:1200, id:3 },
    { x:120, y:170, label:"Amritsar", type:"biogas", kwh:480,  id:4 },
    { x:315, y:290, label:"Mumbai",   type:"solar",  kwh:560,  id:5 },
    { x:305, y:355, label:"Pune",     type:"biogas", kwh:300,  id:6 },
    { x:218, y:175, label:"Pilani",   type:"solar",  kwh:650,  id:7 },
  ];
  const edges = [[1,7],[7,2],[2,3],[1,4],[5,6],[2,5],[7,6]];
  const typeColor = { solar:P.amber, wind:P.cyan, biogas:P.copper };

  return (
    <div style={{ animation:"slide-up 0.5s ease" }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:"clamp(36px,4vw,56px)", letterSpacing:"0.06em", color:P.text, lineHeight:1 }}>DECENTRALIZED GRID <span style={{ color:P.amber }}>NETWORK</span></div>
        <div style={{ color:P.muted, fontSize:13, marginTop:6 }}>Real-time peer-to-peer energy flow across India</div>
      </div>
      <ObsidianCard style={{ padding:0, overflow:"hidden" }}>
        <div style={{ position:"relative", background:"radial-gradient(ellipse at 50% 50%, rgba(255,179,0,0.03) 0%, transparent 70%)" }}>
          <svg viewBox="0 0 440 460" style={{ width:"100%", maxWidth:640, display:"block", margin:"0 auto" }}>
            {Array.from({length:9}).map((_,i)=><line key={`v${i}`} x1={i*55} y1={0} x2={i*55} y2={460} stroke="rgba(255,179,0,0.04)" strokeWidth="1"/>)}
            {Array.from({length:9}).map((_,i)=><line key={`h${i}`} x1={0} y1={i*55} x2={440} y2={i*55} stroke="rgba(255,179,0,0.04)" strokeWidth="1"/>)}
            {edges.map(([a,b],i)=>{
              const na=nodes.find(n=>n.id===a), nb=nodes.find(n=>n.id===b);
              return <g key={i}>
                <line x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke={`rgba(255,179,0,0.1)`} strokeWidth="1.5"/>
                <path id={`path-${i}`} d={`M${na.x},${na.y} L${nb.x},${nb.y}`} fill="none" style={{display:"none"}}/>
                <circle r={5} fill={P.amber} opacity={0.9} filter={`drop-shadow(0 0 4px ${P.amberGlow})`}>
                  <animateMotion dur={`${2.2+i*0.4}s`} repeatCount="indefinite"><mpath xlinkHref={`#path-${i}`}/></animateMotion>
                </circle>
              </g>;
            })}
            {nodes.map(n=>(
              <g key={n.id}>
                <circle cx={n.x} cy={n.y} r={24} fill={`${typeColor[n.type]}10`} stroke={`${typeColor[n.type]}45`} strokeWidth="1.5"/>
                <circle cx={n.x} cy={n.y} r={11} fill={typeColor[n.type]} opacity={0.95} filter={`drop-shadow(0 0 8px ${typeColor[n.type]})`}/>
                <circle cx={n.x} cy={n.y} r={24}>
                  <animate attributeName="r" values="24;38;24" dur="3s" repeatCount="indefinite" begin={`${n.id*0.35}s`}/>
                  <animate attributeName="opacity" values="0.25;0;0.25" dur="3s" repeatCount="indefinite" begin={`${n.id*0.35}s`}/>
                  <animate attributeName="fill" values={typeColor[n.type]} dur="3s" repeatCount="indefinite"/>
                </circle>
                <text x={n.x} y={n.y+40} textAnchor="middle" fontSize={10} fill={P.textD} fontFamily="'DM Sans', sans-serif" fontWeight="600">{n.label}</text>
                <text x={n.x} y={n.y+52} textAnchor="middle" fontSize={9} fill={P.muted} fontFamily="'JetBrains Mono', monospace">{n.kwh} kWh</text>
              </g>
            ))}
          </svg>
        </div>
        <div style={{ display:"flex", gap:24, padding:"18px 32px", borderTop:`1px solid ${P.border}`, justifyContent:"center" }}>
          {[{c:P.amber,l:"☀️ Solar"},{c:P.cyan,l:"💨 Wind"},{c:P.copper,l:"♻️ Biogas"}].map((x,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:x.c, boxShadow:`0 0 8px ${x.c}` }}/>
              <span style={{ color:P.textD, fontSize:12, fontWeight:500 }}>{x.l}</span>
            </div>
          ))}
        </div>
      </ObsidianCard>
    </div>
  );
}

// ── NAVBAR ───────────────────────────────────────────────────────────
function Navbar({ user, page, setPage, onLogout, theme, setTheme }) {
  const [dropdown, setDropdown] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const userCoins = user ? (DB.users.find(u=>u.id===user.id)?.gridCoins || user.gridCoins || 0) : 0;

  const megaMenu = [
    { id:"about",    label:"About Us",       items:["ESG Goals 2030","Carbon Neutrality","SDG Compliance","Impact Reports"] },
    { id:"business", label:"Group Business", items:["☀️ Solar Tech","💨 Wind Logistics","♻️ Biogas Labs","🔗 Grid Infrastructure"] },
    { id:"pools",    label:"Community Pools",items:["Delhi Solar Collective","Rajasthan Wind Alliance","Punjab Green Bloc","Join a Pool →"] },
  ];

  return (
    <nav style={{
      position:"sticky", top:0, zIndex:500,
      background: scrolled ? "rgba(5,5,5,0.92)" : "transparent",
      backdropFilter: scrolled ? "blur(24px) saturate(2)" : "none",
      borderBottom: `1px solid ${scrolled ? P.border : "transparent"}`,
      padding:"0 32px", height:60,
      display:"flex", alignItems:"center",
      transition:"all 0.4s cubic-bezier(0.4,0,0.2,1)",
    }}>
      {/* Logo */}
      <div onClick={() => setPage("home")} style={{ cursor:"pointer", display:"flex", alignItems:"center", gap:10, marginRight:44, userSelect:"none" }}>
        <div style={{ width:30, height:30, borderRadius:8, background:`linear-gradient(135deg, ${P.amber}, ${P.amberD})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, boxShadow:`0 0 20px ${P.amberGlow}`, animation:"prism-glow 3s ease-in-out infinite" }}>⚡</div>
        <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:26, letterSpacing:"0.1em", color:P.text }}>SYN<span style={{ color:P.amber }}>GRID</span></span>
      </div>

      {/* Mega Menu */}
      {megaMenu.map(nav => (
        <div key={nav.id} style={{ position:"relative" }}
          onMouseEnter={() => setDropdown(nav.id)}
          onMouseLeave={() => setDropdown(null)}>
          <button style={{ padding:"0 16px", height:60, background:"none", border:"none", color:dropdown===nav.id?P.amber:P.textD, fontWeight:500, fontSize:13, cursor:"pointer", fontFamily:"inherit", letterSpacing:0.3, display:"flex", alignItems:"center", gap:5, transition:"color 0.2s" }}>
            {nav.label} <span style={{ fontSize:8, opacity:0.5, marginLeft:2 }}>▾</span>
          </button>
          {dropdown===nav.id && (
            <div style={{ position:"absolute", top:"100%", left:0, background:"rgba(8,8,14,0.96)", border:`1px solid ${P.border}`, borderRadius:14, padding:8, minWidth:210, backdropFilter:"blur(24px)", animation:"scale-in 0.18s ease", boxShadow:`0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px ${P.border}` }}>
              {nav.items.map((item, i) => (
                <div key={i} style={{ padding:"10px 16px", borderRadius:9, color:P.textD, fontSize:13, cursor:"pointer", transition:"all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.background=P.amberSoft; e.currentTarget.style.color=P.amber; }}
                  onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color=P.textD; }}>
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <button onClick={() => setPage("network")} style={{ padding:"0 16px", height:60, background:"none", border:"none", color:page==="network"?P.amber:P.textD, fontWeight:500, fontSize:13, cursor:"pointer", fontFamily:"inherit", letterSpacing:0.3, display:"flex", alignItems:"center", gap:6, transition:"color 0.2s" }}>
        🗺 Network Map
      </button>

      <div style={{ flex:1 }}/>

      {/* GridCoins */}
      {user && <GridCoinBadge coins={userCoins} />}

      {/* Theme */}
      <button onClick={() => setTheme(theme==="dark"?"light":"dark")} style={{ margin:"0 12px", padding:"6px 14px", borderRadius:30, border:`1px solid ${P.border}`, background:"transparent", color:P.muted, fontSize:11, cursor:"pointer", fontFamily:"inherit", fontWeight:600, transition:"all 0.2s", display:"flex", alignItems:"center", gap:5 }}
        onMouseEnter={e => { e.currentTarget.style.borderColor=P.amber; e.currentTarget.style.color=P.amber; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor=P.border; e.currentTarget.style.color=P.muted; }}>
        {theme==="dark" ? "☀️" : "🌑"} {theme==="dark" ? "Solar" : "Obsidian"}
      </button>

      {user && (
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={() => setPage(user.role==="producer"?"my_listings":"marketplace")} className="prism-btn"
            style={{ padding:"8px 18px", borderRadius:10, background:`${P.amber}15`, border:`1px solid ${P.amber}40`, color:P.amber, fontWeight:600, fontSize:12, cursor:"pointer", fontFamily:"inherit", transition:"all 0.25s" }}
            onMouseEnter={e => { e.currentTarget.style.background=`${P.amber}25`; }}
            onMouseLeave={e => { e.currentTarget.style.background=`${P.amber}15`; }}>
            {user.role==="producer"?"⚡ Sell":"🛒 Buy"}
          </button>
          <div style={{ width:32, height:32, borderRadius:"50%", background:`linear-gradient(135deg, ${P.amber}, ${P.amberD})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#000", fontWeight:800, fontSize:13, boxShadow:`0 0 16px ${P.amberGlow}` }}>{user.name[0]}</div>
          <button onClick={onLogout} style={{ padding:"5px 12px", borderRadius:8, border:`1px solid ${P.border}`, background:"none", color:P.muted, fontSize:11, cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s" }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=P.danger;e.currentTarget.style.color=P.danger;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=P.border;e.currentTarget.style.color=P.muted;}}>
            Exit
          </button>
        </div>
      )}
    </nav>
  );
}

// ── AUTH PAGE ────────────────────────────────────────────────────────
function AuthPage({ onLogin, preloaderData }) {
  const [email, setEmail] = useState("");
  const [mode, setMode]   = useState("login");
  const [name, setName]   = useState("");
  const [loc, setLoc]     = useState("");
  const role = preloaderData?.role || "buyer";

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24, background:`radial-gradient(ellipse 120% 80% at 60% -10%, rgba(255,179,0,0.05) 0%, ${P.obsidian} 60%)` }}>
      {/* Background grid */}
      <div style={{ position:"fixed", inset:0, backgroundImage:`linear-gradient(rgba(255,179,0,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,179,0,0.025) 1px, transparent 1px)`, backgroundSize:"60px 60px", pointerEvents:"none" }}/>

      <div style={{ width:"100%", maxWidth:460, position:"relative", zIndex:1 }}>
        <div style={{ textAlign:"center", marginBottom:44 }}>
          <div style={{ fontSize:60, filter:`drop-shadow(0 0 24px ${P.amberGlow})`, animation:"float 3s ease-in-out infinite" }}>⚡</div>
          <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:48, letterSpacing:"0.1em", color:P.amber, margin:"10px 0 4px" }}>SYNGRID</div>
          <div style={{ fontSize:10, letterSpacing:5, color:P.muted, textTransform:"uppercase" }}>Renewable Energy Marketplace</div>
          {preloaderData && (
            <div style={{ marginTop:14, display:"inline-flex", gap:8 }}>
              <span style={{ padding:"4px 12px", borderRadius:20, background:P.amberSoft, border:`1px solid ${P.border}`, color:P.amber, fontSize:10, fontWeight:600 }}>{role==="producer"?"⚡ Seller":"🛒 Buyer"}</span>
              <span style={{ padding:"4px 12px", borderRadius:20, background:"rgba(255,255,255,0.04)", border:`1px solid ${P.border}`, color:P.textD, fontSize:10 }}>{preloaderData.scale==="organization"?"🏢 Org":"🏠 Private"}</span>
            </div>
          )}
        </div>

        <ObsidianCard style={{ padding:32 }}>
          <div style={{ display:"flex", gap:3, marginBottom:24, background:"rgba(255,255,255,0.03)", borderRadius:12, padding:3 }}>
            {["login","signup"].map(m=>(
              <button key={m} onClick={()=>setMode(m)} style={{ flex:1, padding:10, borderRadius:9, border:"none", cursor:"pointer", background:mode===m?`linear-gradient(135deg, ${P.amber}, ${P.amberD})`:"transparent", color:mode===m?"#000":P.muted, fontWeight:700, fontSize:13, transition:"all 0.25s", fontFamily:"inherit" }}>
                {m==="login"?"Sign In":"Create Account"}
              </button>
            ))}
          </div>

          {mode==="signup" && <>
            <PrismInput label="Name / Organization" value={name} onChange={setName} placeholder="Your name"/>
            <PrismInput label="City / Location"     value={loc}  onChange={setLoc}  placeholder="e.g. Delhi, Mumbai"/>
          </>}
          <PrismInput label="Email"    value={email} onChange={setEmail} placeholder="you@example.com"/>
          <PrismInput label="Password" type="password" value="" onChange={()=>{}} placeholder="••••••••"/>

          <PrismBtn full size="lg" onClick={()=>{
            if (mode==="login") { onLogin(DB.users.find(u=>u.email===email)||DB.users[3]); }
            else { onLogin({ id:99, name:name||"User", email, role, location:loc, greenScore:0, gridCoins:0 }); }
          }}>{mode==="login"?"Sign In →":"Create Account →"}</PrismBtn>

          <div style={{ marginTop:24, padding:16, background:"rgba(255,255,255,0.02)", borderRadius:12, border:`1px solid ${P.border}` }}>
            <div style={{ color:P.muted, fontSize:9, letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Quick Demo Accounts</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5 }}>
              {DB.users.map(u=>(
                <button key={u.id} onClick={()=>onLogin(u)}
                  style={{ padding:"8px 12px", borderRadius:8, border:`1px solid ${P.border}`, background:"rgba(255,255,255,0.02)", color:P.muted, fontSize:11, cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:6, fontFamily:"inherit", transition:"all 0.2s", overflow:"hidden" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=P.amber;e.currentTarget.style.color=P.text;e.currentTarget.style.background=P.amberSoft;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=P.border;e.currentTarget.style.color=P.muted;e.currentTarget.style.background="rgba(255,255,255,0.02)";}}>
                  <span>{u.role==="producer"?"⚡":"🏢"}</span>
                  <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.name.split(" ").slice(0,2).join(" ")}</span>
                </button>
              ))}
            </div>
          </div>
        </ObsidianCard>
      </div>
    </div>
  );
}

// ── HERO SECTION ─────────────────────────────────────────────────────
function HeroSection({ user, transactions, setPage }) {
  const [counter, setCounter] = useState({ kwh:0, co2:0, traders:0, coins:0 });
  const [mouseXY, setMouseXY] = useState({ x:0, y:0 });
  const heroRef = useRef();
  const night = isNight();

  const totalKwh   = transactions.reduce((s,t)=>s+t.units_bought,0);
  const totalCO2   = transactions.reduce((s,t)=>s+t.carbon_saved,0);
  const totalCoins = DB.users.reduce((s,u)=>s+u.gridCoins,0);

  useEffect(() => {
    const dur=2000, steps=70;
    let step=0;
    const timer = setInterval(() => {
      step++;
      const p=step/steps;
      setCounter({ kwh:Math.round(totalKwh*p), co2:+(totalCO2*p).toFixed(1), traders:Math.round(DB.users.length*p), coins:Math.round(totalCoins*p) });
      if (step>=steps) clearInterval(timer);
    }, dur/steps);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fn = e => {
      const rect = heroRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMouseXY({ x:(e.clientX-rect.left)/rect.width-0.5, y:(e.clientY-rect.top)/rect.height-0.5 });
    };
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, []);

  const FlowLines = () => (
    <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", opacity:0.4 }} viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
      {[
        { d:"M0,180 Q300,80 600,220 Q900,360 1200,180",  c:P.amber, delay:"0s"   },
        { d:"M0,320 Q400,180 700,350 Q1000,480 1200,320", c:P.cyan,  delay:"0.7s" },
        { d:"M0,440 Q250,290 550,410 Q850,520 1200,440",  c:P.copper,delay:"1.4s" },
      ].map((l,i) => (
        <path key={i} d={l.d} stroke={l.c} strokeWidth="1.5" fill="none"
          strokeDasharray="400" strokeDashoffset="400"
          style={{ animation:`energy-stream 5s ${l.delay} ease-in-out infinite` }}
          filter={`drop-shadow(0 0 5px ${l.c})`}/>
      ))}
    </svg>
  );

  return (
    <div ref={heroRef} style={{ position:"relative", minHeight:"90vh", overflow:"hidden", display:"flex", flexDirection:"column", justifyContent:"center", background:`radial-gradient(ellipse 100% 70% at 70% -10%, rgba(255,179,0,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 10% 60%, rgba(0,229,255,0.04) 0%, transparent 50%), ${P.obsidian}` }}>
      {/* Grid lines */}
      <div style={{ position:"absolute", inset:0, backgroundImage:`linear-gradient(rgba(255,179,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,179,0,0.02) 1px, transparent 1px)`, backgroundSize:"64px 64px", pointerEvents:"none" }}/>
      <FlowLines/>

      {/* Prism rings */}
      <div style={{ position:"absolute", right:"5%", top:"50%", transform:`translateY(-50%) translate(${mouseXY.x*-15}px, ${mouseXY.y*-10}px)`, zIndex:1, opacity:0.07, animation:"orbit 60s linear infinite", width:560, height:560, pointerEvents:"none" }}>
        {[0,60,120,180,240,300].map((a,i) => <div key={i} style={{ position:"absolute", inset:i*26, borderRadius:"50%", border:`1px solid ${P.amber}` }}/>)}
      </div>

      <div style={{ position:"relative", zIndex:2, padding:"0 7%", transform:`translate(${mouseXY.x*8}px, ${mouseXY.y*5}px)`, transition:"transform 0.12s ease-out" }}>
        {/* Live pill */}
        <div style={{ animation:"slide-up 0.7s 0.1s ease both", display:"inline-flex", alignItems:"center", gap:8, padding:"5px 16px", borderRadius:30, border:`1px solid ${P.border}`, background:P.glass, marginBottom:28 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:P.amber, animation:"prism-pulse 2s infinite" }}/>
          <span style={{ fontSize:10, letterSpacing:3, color:P.amber, textTransform:"uppercase", fontWeight:600 }}>Live · {DB.energy_listings.filter(l=>l.status==="active").length} Active Listings</span>
          {night && <span style={{ marginLeft:4, color:P.cyan, fontSize:10, fontWeight:700 }}>🌙 Wind Surge Active</span>}
        </div>

        <h1 style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:"clamp(56px,8vw,116px)", letterSpacing:"0.04em", lineHeight:0.92, marginBottom:28, animation:"slide-up 0.7s 0.2s ease both" }}>
          <span style={{ color:P.text }}>INDIA'S</span><br/>
          <span style={{ background:`linear-gradient(135deg, ${P.amber}, ${P.copper})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>DECENTRALIZED</span><br/>
          <span style={{ color:P.text }}>ENERGY GRID</span>
        </h1>

        <p style={{ fontSize:17, color:P.textD, maxWidth:520, lineHeight:1.7, marginBottom:44, fontWeight:300, animation:"slide-up 0.7s 0.35s ease both" }}>
          Peer-to-peer renewable energy trading with blockchain verification, Community Pools, AI matchmaking, and GridCoin rewards.
        </p>

        <div style={{ display:"flex", gap:14, flexWrap:"wrap", animation:"slide-up 0.7s 0.5s ease both" }}>
          <PrismBtn size="lg" onClick={() => setPage(user?.role==="producer"?"my_listings":"marketplace")}>
            {user?.role==="producer" ? "⚡ Start Selling →" : "🛒 Buy Clean Energy →"}
          </PrismBtn>
          <button onClick={() => setPage("community_pools")}
            style={{ padding:"16px 32px", borderRadius:10, background:"transparent", color:P.cyan, fontWeight:600, fontSize:15, cursor:"pointer", border:`1px solid ${P.cyan}40`, fontFamily:"inherit", letterSpacing:0.5, transition:"all 0.25s" }}
            onMouseEnter={e=>{e.currentTarget.style.background=`${P.cyan}10`;}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}>
            🏘 Join Community Pool
          </button>
        </div>

        {/* Live stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:24, marginTop:64, animation:"slide-up 0.7s 0.7s ease both", maxWidth:700 }}>
          {[
            { val:`${counter.kwh.toLocaleString()}`, unit:"kWh", label:"Energy Traded", color:P.amber },
            { val:`${counter.co2}`,                  unit:"kg",  label:"CO₂ Saved",     color:P.success },
            { val:`${counter.traders}`,               unit:"",   label:"Active Traders", color:P.cyan },
            { val:`${counter.coins.toLocaleString()}`,unit:"🪙", label:"GridCoins Earned",color:P.copper },
          ].map((s,i) => (
            <div key={i}>
              <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:"clamp(22px,2.8vw,36px)", fontWeight:700, color:s.color, animation:"count-up 0.3s ease" }}>{s.val}<span style={{ fontSize:"0.4em", opacity:0.7, marginLeft:2 }}>{s.unit}</span></div>
              <div style={{ fontSize:10, color:P.muted, letterSpacing:1.2, textTransform:"uppercase", marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── GRIDCOIN WALLET ──────────────────────────────────────────────────
function GridCoinWallet({ user }) {
  const u = DB.users.find(x=>x.id===user.id) || user;
  const coins = u.gridCoins || 0;
  const [swapping, setSwapping] = useState(false);
  const [swapResult, setSwapResult] = useState(null);

  const rewards = [
    { name:"Free EV Charging", cost:500,  icon:"🔋", desc:"1 full charge session" },
    { name:"Carbon Certificate", cost:1000, icon:"🌿", desc:"1 tonne offset cert" },
    { name:"Green Badge NFT",  cost:250,  icon:"🏅", desc:"Platform badge + discount" },
    { name:"Priority Listing", cost:300,  icon:"⚡", desc:"Top placement 7 days" },
  ];

  return (
    <div style={{ animation:"slide-up 0.5s ease" }}>
      <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:"clamp(36px,4vw,56px)", letterSpacing:"0.06em", color:P.text, marginBottom:8 }}>
        GRID<span style={{ color:P.amber }}>COIN</span> WALLET
      </div>
      <div style={{ color:P.muted, fontSize:13, marginBottom:32 }}>Earn 1 GridCoin per 100 kWh traded. Swap for green rewards.</div>

      {/* Balance card */}
      <ObsidianCard style={{ marginBottom:20, background:`linear-gradient(135deg, rgba(255,179,0,0.08), rgba(216,67,21,0.04))`, borderColor:`${P.amber}30`, textAlign:"center", padding:40 }}>
        <div style={{ fontSize:18, marginBottom:8, animation:"coin-spin 4s linear infinite", display:"inline-block" }}>🪙</div>
        <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:80, letterSpacing:"0.05em", color:P.amber, lineHeight:1 }}>{coins.toLocaleString()}</div>
        <div style={{ color:P.muted, fontSize:13, letterSpacing:2, textTransform:"uppercase", marginTop:4 }}>GridCoins Balance</div>
        <div style={{ marginTop:16, padding:"8px 20px", borderRadius:30, background:"rgba(255,255,255,0.04)", display:"inline-block", fontSize:12, color:P.textD }}>
          ≈ ₹{(coins*2).toLocaleString()} equivalent value
        </div>
      </ObsidianCard>

      {/* How to earn */}
      <ObsidianCard style={{ marginBottom:20 }}>
        <div style={{ color:P.amber, fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", marginBottom:16 }}>HOW TO EARN</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
          {[
            { icon:"⚡", label:"Trade Energy", desc:"1 coin / 100 kWh" },
            { icon:"🤝", label:"Refer Traders", desc:"50 coins per referral" },
            { icon:"🏘", label:"Join Pool", desc:"2x coins for pool trades" },
          ].map((item,i) => (
            <div key={i} style={{ padding:"16px", background:"rgba(255,255,255,0.02)", borderRadius:12, border:`1px solid ${P.border}`, textAlign:"center" }}>
              <div style={{ fontSize:28, marginBottom:8 }}>{item.icon}</div>
              <div style={{ color:P.text, fontWeight:600, fontSize:13 }}>{item.label}</div>
              <div style={{ color:P.amber, fontSize:11, marginTop:4 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </ObsidianCard>

      {/* Swap section */}
      <ObsidianCard>
        <div style={{ color:P.amber, fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", marginBottom:16 }}>SWAP GRIDCOINS FOR REWARDS</div>
        {swapResult && <div style={{ padding:"12px 16px", background:"rgba(0,230,118,0.08)", border:`1px solid ${P.success}40`, borderRadius:10, color:P.success, fontSize:13, marginBottom:16, animation:"slide-up 0.3s ease" }}>{swapResult}</div>}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12 }}>
          {rewards.map((r,i) => (
            <div key={i} style={{ padding:"16px 20px", background:"rgba(255,255,255,0.03)", borderRadius:12, border:`1px solid ${P.border}`, transition:"all 0.2s" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=P.borderA;e.currentTarget.style.background=P.amberSoft;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=P.border;e.currentTarget.style.background="rgba(255,255,255,0.03)";}}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                <span style={{ fontSize:28 }}>{r.icon}</span>
                <span style={{ fontFamily:"'JetBrains Mono', monospace", color:P.amber, fontWeight:700, fontSize:14 }}>🪙 {r.cost}</span>
              </div>
              <div style={{ color:P.text, fontWeight:600, fontSize:13, marginBottom:4 }}>{r.name}</div>
              <div style={{ color:P.muted, fontSize:11, marginBottom:12 }}>{r.desc}</div>
              <PrismBtn size="sm" variant={coins>=r.cost?"primary":"ghost"} onClick={() => {
                if (coins >= r.cost) setSwapResult(`✅ Swapped ${r.cost} GridCoins for "${r.name}"! Check your rewards.`);
                else setSwapResult(`❌ Need ${r.cost-coins} more GridCoins.`);
              }}>
                {coins>=r.cost?"Swap Now →":"Not enough coins"}
              </PrismBtn>
            </div>
          ))}
        </div>
      </ObsidianCard>
    </div>
  );
}

// ── COMMUNITY POOLS ──────────────────────────────────────────────────
function CommunityPoolsPage({ user, setToast }) {
  const [pools, setPools] = useState(DB.communityPools);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name:"", city:"", targetKwh:"" });

  const handleJoin = pool => {
    if (pool.members.includes(user.id)) { setToast("You're already in this pool!"); return; }
    setPools(p => p.map(x => x.id===pool.id ? {...x, members:[...x.members, user.id], totalKwh:x.totalKwh+(user.role==="producer"?200:0)} : x));
    setToast(`🏘 Joined "${pool.name}"! Your energy will now be pooled with neighbors for better institutional pricing.`);
  };

  const handleCreate = () => {
    if (!form.name || !form.city || !form.targetKwh) return;
    const newPool = { id:pools.length+1, name:form.name, members:[user.id], totalKwh:0, status:"forming", attracting:"institutional", city:form.city, targetKwh:+form.targetKwh };
    setPools(p=>[...p, newPool]);
    setForm({ name:"", city:"", targetKwh:"" });
    setShowCreate(false);
    setToast("🌐 Community Pool created! Invite neighbors to join.");
  };

  return (
    <div style={{ animation:"slide-up 0.5s ease" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:28, flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:"clamp(36px,4vw,56px)", letterSpacing:"0.06em", color:P.text }}>COMMUNITY <span style={{ color:P.cyan }}>POOLS</span></div>
          <div style={{ color:P.muted, fontSize:13, marginTop:6 }}>Aggregate small producers into powerful community energy blocks for institutional buyers</div>
        </div>
        <PrismBtn variant="cyan" onClick={() => setShowCreate(!showCreate)}>
          {showCreate?"✕ Cancel":"🏘 Create New Pool"}
        </PrismBtn>
      </div>

      {/* How it works */}
      <ObsidianCard style={{ marginBottom:20, background:`linear-gradient(135deg, rgba(0,229,255,0.05), rgba(124,77,255,0.03))`, borderColor:`${P.cyan}30` }}>
        <div style={{ color:P.cyan, fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", marginBottom:14 }}>HOW COMMUNITY POOLS WORK</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
          {[
            { n:"1", icon:"👥", label:"5+ Neighbors Join", desc:"Small solar/wind producers combine" },
            { n:"2", icon:"⚡", label:"Aggregate Energy",  desc:"Form one large Community Block" },
            { n:"3", icon:"🏢", label:"Attract Big Buyers",desc:"Institutions & corporates bid" },
            { n:"4", icon:"🪙", label:"Earn 2× GridCoins", desc:"Pool trades double your rewards" },
          ].map((step,i) => (
            <div key={i} style={{ textAlign:"center" }}>
              <div style={{ width:32, height:32, borderRadius:"50%", background:`${P.cyan}20`, border:`1px solid ${P.cyan}40`, color:P.cyan, fontWeight:700, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px" }}>{step.n}</div>
              <div style={{ fontSize:22, marginBottom:6 }}>{step.icon}</div>
              <div style={{ color:P.text, fontWeight:600, fontSize:12 }}>{step.label}</div>
              <div style={{ color:P.muted, fontSize:11, marginTop:4 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </ObsidianCard>

      {showCreate && (
        <ObsidianCard style={{ marginBottom:20, borderColor:`${P.cyan}40` }}>
          <div style={{ color:P.cyan, fontWeight:600, fontSize:15, marginBottom:18 }}>Create Community Pool</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
            <PrismInput label="Pool Name" value={form.name} onChange={v=>setForm({...form,name:v})} placeholder="e.g. South Delhi Solar Bloc"/>
            <PrismInput label="City" value={form.city} onChange={v=>setForm({...form,city:v})} placeholder="City name"/>
            <PrismInput label="Target kWh" type="number" value={form.targetKwh} onChange={v=>setForm({...form,targetKwh:v})} placeholder="e.g. 5000"/>
          </div>
          <PrismBtn variant="cyan" size="lg" onClick={handleCreate}>Create Pool →</PrismBtn>
        </ObsidianCard>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(320px,1fr))", gap:16 }}>
        {pools.map(pool => {
          const isMember = pool.members.includes(user.id);
          const pct = Math.min(100, (pool.totalKwh/pool.targetKwh)*100);
          const producerNames = pool.members.map(id => DB.users.find(u=>u.id===id)?.name?.split(" ").slice(0,2).join(" ")||"Member");
          return (
            <ObsidianCard key={pool.id} glow={isMember}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
                <div>
                  <div style={{ color:P.text, fontWeight:700, fontSize:15 }}>{pool.name}</div>
                  <div style={{ color:P.muted, fontSize:11, marginTop:3 }}>📍 {pool.city}</div>
                </div>
                <span style={{ padding:"4px 12px", borderRadius:20, fontSize:10, fontWeight:700, background:pool.status==="active"?`${P.success}18`:`${P.warn}18`, color:pool.status==="active"?P.success:P.warn, border:`1px solid ${pool.status==="active"?P.success:P.warn}40` }}>
                  {pool.status==="active"?"● Active":"⏳ Forming"}
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:P.muted, marginBottom:6 }}>
                  <span>Pool Capacity</span>
                  <span style={{ color:P.cyan, fontWeight:700 }}>{pool.totalKwh.toLocaleString()} / {pool.targetKwh.toLocaleString()} kWh</span>
                </div>
                <div style={{ height:4, background:"rgba(255,255,255,0.06)", borderRadius:2, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg, ${P.cyan}, ${P.indigo})`, borderRadius:2, transition:"width 0.8s ease", boxShadow:`0 0 8px ${P.cyanGlow}` }}/>
                </div>
                <div style={{ fontSize:10, color:P.muted, marginTop:4 }}>{pct.toFixed(0)}% capacity filled</div>
              </div>

              <div style={{ fontSize:11, color:P.muted, marginBottom:4 }}>Members ({pool.members.length})</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:16 }}>
                {producerNames.map((n,i) => (
                  <span key={i} style={{ padding:"2px 10px", background:"rgba(255,255,255,0.04)", borderRadius:20, fontSize:10, color:P.textD, border:`1px solid ${P.border}` }}>{n}</span>
                ))}
              </div>

              <div style={{ padding:"10px 14px", background:"rgba(255,255,255,0.02)", borderRadius:10, marginBottom:14, fontSize:11, color:P.textD }}>
                🎯 Attracting: <span style={{ color:P.amber, fontWeight:600, textTransform:"capitalize" }}>{pool.attracting} buyers</span>
              </div>

              {isMember ? (
                <div style={{ padding:"10px 16px", background:`${P.cyan}10`, borderRadius:10, color:P.cyan, fontSize:12, fontWeight:600, textAlign:"center", border:`1px solid ${P.cyan}30` }}>✓ You're in this pool · 2× GridCoins active</div>
              ) : (
                <PrismBtn variant="cyan" full onClick={() => handleJoin(pool)}>🏘 Join Pool →</PrismBtn>
              )}
            </ObsidianCard>
          );
        })}
      </div>
    </div>
  );
}

// ── MATCHMAKER ───────────────────────────────────────────────────────
function matchPackages(budget, listings, userLocation) {
  const active = listings.filter(l=>l.status==="active");
  const night = isNight();
  const sorted = [...active].sort((a,b) => {
    const aL = a.location.toLowerCase()===userLocation.toLowerCase()?-1:1;
    const bL = b.location.toLowerCase()===userLocation.toLowerCase()?-1:1;
    if (aL!==bL) return aL-bL;
    if (night && a.energy_type==="wind" && b.energy_type!=="wind") return -1;
    if (night && b.energy_type==="wind" && a.energy_type!=="wind") return 1;
    return a.price_per_unit - b.price_per_unit;
  });
  const packages = [];
  for (const l of sorted) {
    const isLocal = l.location.toLowerCase()===userLocation.toLowerCase();
    const flashDisc = l.flashSale && l.flashSale.endsAt>Date.now() ? l.flashSale.discount : 0;
    const effPrice = isLocal ? l.price_per_unit*(1-LOCAL_DISC)*(1-flashDisc) : l.price_per_unit*(1-flashDisc);
    const maxUnits = Math.min(l.units_available, Math.floor(budget/effPrice));
    if (maxUnits>=10) {
      const cost = +(maxUnits*effPrice).toFixed(0);
      packages.push({ id:`S${l.id}`, label:`Single — ${l.energy_type.toUpperCase()}`, items:[{listing:l, units:maxUnits, cost, isLocal, effPrice, flashDisc}], totalCost:cost, totalKwh:maxUnits, totalCO2:calcCO2(maxUnits), diversity:1, isLocal, tags:[l.energy_type,...(isLocal?["local"]:[])] });
    }
  }
  for (let i=0;i<sorted.length;i++) for (let j=i+1;j<sorted.length;j++) {
    const la=sorted[i], lb=sorted[j];
    if (la.energy_type===lb.energy_type) continue;
    const aL=la.location.toLowerCase()===userLocation.toLowerCase();
    const bL=lb.location.toLowerCase()===userLocation.toLowerCase();
    const fA=la.flashSale?.endsAt>Date.now()?la.flashSale.discount:0;
    const fB=lb.flashSale?.endsAt>Date.now()?lb.flashSale.discount:0;
    const pa=la.price_per_unit*(aL?1-LOCAL_DISC:1)*(1-fA);
    const pb=lb.price_per_unit*(bL?1-LOCAL_DISC:1)*(1-fB);
    const uA=Math.min(la.units_available, Math.floor(budget*0.6/pa));
    const rem=budget-uA*pa;
    const uB=Math.min(lb.units_available, Math.floor(rem/pb));
    if (uA>=10&&uB>=10) {
      const cA=+(uA*pa).toFixed(0), cB=+(uB*pb).toFixed(0);
      packages.push({ id:`M${la.id}${lb.id}`, label:`Mix — ${la.energy_type.toUpperCase()} + ${lb.energy_type.toUpperCase()}`, items:[{listing:la,units:uA,cost:cA,isLocal:aL,effPrice:pa},{listing:lb,units:uB,cost:cB,isLocal:bL,effPrice:pb}], totalCost:cA+cB, totalKwh:uA+uB, totalCO2:calcCO2(uA+uB), diversity:2, isLocal:aL||bL, tags:[la.energy_type,lb.energy_type,...(aL||bL?["local"]:[])] });
    }
  }
  return packages.sort((a,b)=>(b.totalKwh/b.totalCost)-(a.totalKwh/a.totalCost)).slice(0,5);
}

// ── MARKETPLACE ──────────────────────────────────────────────────────
function MarketplacePage({ user, listings, onRequestPurchase }) {
  const [ft, setFt]             = useState("all");
  const [fl, setFl]             = useState("");
  const [mp, setMp]             = useState(8);
  const [sort, setSort]         = useState("location");
  const [modal, setModal]       = useState(null);
  const [units, setUnits]       = useState(50);
  const [budget, setBudget]     = useState(2000);
  const [packages, setPackages] = useState([]);
  const [showMatcher, setShowMatcher] = useState(false);
  const [showReviews, setShowReviews] = useState(null);
  const night = isNight();

  const effective = listings.map(l => {
    const isLocal = l.location.toLowerCase()===(user.location||"").toLowerCase();
    const flashDisc = l.flashSale && l.flashSale.endsAt>Date.now() ? l.flashSale.discount : 0;
    const effPrice = isLocal ? +(l.price_per_unit*(1-LOCAL_DISC)*(1-flashDisc)).toFixed(2) : +(l.price_per_unit*(1-flashDisc)).toFixed(2);
    return { ...l, effPrice, isLocal, originalPrice:l.price_per_unit, flashDisc };
  });

  const filtered = effective
    .filter(l=>l.status==="active"&&(ft==="all"||l.energy_type===ft)&&(fl===""||l.location.toLowerCase().includes(fl.toLowerCase()))&&l.effPrice<=mp)
    .sort((a,b)=>{
      if (sort==="location") return (a.isLocal?-1:1)-(b.isLocal?-1:1);
      if (sort==="price") return a.effPrice-b.effPrice;
      if (sort==="wind_night"&&night) return (a.energy_type==="wind"?-1:1)-(b.energy_type==="wind"?-1:1);
      return b.units_available-a.units_available;
    });

  const runMatcher = () => { setPackages(matchPackages(budget,listings,user.location)); setShowMatcher(true); };

  return (
    <div style={{ animation:"slide-up 0.5s ease" }}>
      <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:"clamp(36px,4vw,56px)", letterSpacing:"0.06em", color:P.text, marginBottom:4 }}>
        ENERGY <span style={{ color:P.amber }}>MARKETPLACE</span>
      </div>
      <p style={{ color:P.muted, fontSize:13, marginBottom:28 }}>
        📍 <span style={{ color:P.amber, fontWeight:600 }}>{user.location}</span> listings get 5% Prism Neighbour discount
        {night && <span style={{ color:P.cyan, marginLeft:12, fontWeight:600 }}>🌙 Night Mode — Wind prioritized</span>}
      </p>

      {/* Flash Sales Banner */}
      {listings.filter(l=>l.flashSale&&l.flashSale.endsAt>Date.now()).length>0 && (
        <div style={{ marginBottom:20, padding:"16px 20px", background:"rgba(216,67,21,0.07)", border:`1px solid rgba(216,67,21,0.3)`, borderRadius:14, display:"flex", alignItems:"center", gap:16, flexWrap:"wrap", animation:"flash-badge 3s ease infinite" }}>
          <span style={{ fontSize:28 }}>⚡</span>
          <div style={{ flex:1 }}>
            <div style={{ color:P.copper, fontWeight:700, fontSize:15 }}>FLASH SALES ACTIVE</div>
            <div style={{ color:P.muted, fontSize:12, marginTop:2 }}>Unexpected surplus energy at discounted rates — limited time!</div>
          </div>
          {listings.filter(l=>l.flashSale&&l.flashSale.endsAt>Date.now()).map(l=>(
            <FlashSaleTimer key={l.id} endsAt={l.flashSale.endsAt} discount={l.flashSale.discount}/>
          ))}
        </div>
      )}

      {/* AI Matchmaker */}
      <ObsidianCard style={{ marginBottom:20, background:`linear-gradient(135deg, rgba(0,229,255,0.06), rgba(124,77,255,0.04))`, borderColor:`${P.cyan}40` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:10 }}>
          <div>
            <div style={{ color:P.cyan, fontWeight:700, fontSize:16, letterSpacing:0.5 }}>⚡ AI Budget Matchmaker</div>
            <div style={{ color:P.muted, fontSize:12, marginTop:3 }}>Enter your budget — get optimized energy bundles instantly</div>
          </div>
          <PrismBtn variant="cyan" onClick={runMatcher}>🤖 Find Best Packages →</PrismBtn>
        </div>
        <div style={{ display:"flex", gap:20, alignItems:"center", flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:240 }}>
            <label style={{ color:P.muted, fontSize:9, textTransform:"uppercase", letterSpacing:1.5, fontWeight:600 }}>Budget: <span style={{ color:P.cyan }}>₹{budget.toLocaleString()}</span></label>
            <input type="range" min={500} max={20000} step={250} value={budget} onChange={e=>setBudget(+e.target.value)} style={{ display:"block", marginTop:10, width:"100%", accentColor:P.cyan }}/>
            <div style={{ display:"flex", justifyContent:"space-between", color:P.muted, fontSize:9, marginTop:4 }}><span>₹500</span><span>₹20,000</span></div>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {[1000,2000,5000,10000].map(v=>(
              <button key={v} onClick={()=>setBudget(v)} style={{ padding:"6px 14px", borderRadius:8, border:`1px solid ${budget===v?P.cyan:P.border}`, background:budget===v?`${P.cyan}18`:"transparent", color:budget===v?P.cyan:P.muted, fontSize:11, cursor:"pointer", fontFamily:"inherit", fontWeight:600, transition:"all 0.2s" }}>₹{v.toLocaleString()}</button>
            ))}
          </div>
        </div>

        {showMatcher && packages.length>0 && (
          <div style={{ marginTop:20, animation:"slide-up 0.4s ease" }}>
            <div style={{ color:P.amber, fontSize:10, fontWeight:700, marginBottom:14, textTransform:"uppercase", letterSpacing:2 }}>🎯 Top {packages.length} Bundles for ₹{budget.toLocaleString()}</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {packages.map((pkg,pi)=>(
                <div key={pkg.id} style={{ padding:"16px 20px", background:"rgba(255,255,255,0.03)", borderRadius:14, border:`1px solid ${pi===0?P.amber:P.border}`, display:"flex", gap:16, alignItems:"center", flexWrap:"wrap", position:"relative" }}>
                  {pi===0 && <span style={{ position:"absolute", top:-11, left:20, background:`linear-gradient(135deg,${P.amber},${P.amberD})`, color:"#000", fontSize:9, fontWeight:900, padding:"2px 10px", borderRadius:20, letterSpacing:1.5 }}>BEST VALUE</span>}
                  <div style={{ flex:1 }}>
                    <div style={{ color:P.text, fontWeight:600, fontSize:14, marginBottom:6 }}>{pkg.label}</div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:8 }}>
                      {pkg.tags.map((t,i)=>(
                        <span key={i} style={{ padding:"2px 10px", borderRadius:20, fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:0.5,
                          background:t==="solar"?`${P.amber}15`:t==="wind"?`${P.cyan}15`:t==="biogas"?`${P.copper}15`:`${P.indigo}15`,
                          color:t==="solar"?P.amber:t==="wind"?P.cyan:t==="biogas"?P.copper:P.indigo,
                          border:`1px solid ${t==="solar"?P.amber:t==="wind"?P.cyan:t==="biogas"?P.copper:P.indigo}30`,
                        }}>
                          {t==="local"?"📍 Prism Badge":t==="solar"?"☀️ Solar":t==="wind"?"💨 Wind":"♻️ Biogas"}
                        </span>
                      ))}
                    </div>
                    {pkg.items.map((it,ii)=>{
                      const prod = getUserById(it.listing.producer_id);
                      return (
                        <div key={ii} style={{ fontSize:11, color:P.textD, marginBottom:2 }}>
                          <span style={{ color:P.muted }}>{prod?.name}: </span>
                          <span style={{ fontWeight:700, fontFamily:"'JetBrains Mono', monospace" }}>{it.units} kWh</span>
                          <span style={{ color:P.muted }}> @ ₹{it.effPrice.toFixed(2)}/kWh</span>
                          {it.isLocal && <span style={{ color:P.success, marginLeft:4 }}>−5% Prism</span>}
                          {it.flashDisc>0 && <span style={{ color:P.copper, marginLeft:4 }}>⚡ −{(it.flashDisc*100).toFixed(0)}% Flash</span>}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display:"flex", gap:14, alignItems:"center", flexWrap:"wrap" }}>
                    {[{v:pkg.totalKwh,u:"kWh",c:P.amber},{v:`₹${pkg.totalCost}`,u:"Total",c:P.copper},{v:pkg.totalCO2,u:"kg CO₂",c:P.success},{v:`🪙${calcGridCoins(pkg.totalKwh)}`,u:"GridCoins",c:P.indigo}].map((m,i)=>(
                      <div key={i} style={{ textAlign:"center" }}>
                        <div style={{ fontFamily:"'JetBrains Mono', monospace", color:m.c, fontWeight:700, fontSize:18 }}>{m.v}</div>
                        <div style={{ color:P.muted, fontSize:9, textTransform:"uppercase" }}>{m.u}</div>
                      </div>
                    ))}
                    <PrismBtn size="sm" onClick={()=>{ pkg.items.forEach(it=>onRequestPurchase(it.listing, it.units)); }}>Buy Bundle →</PrismBtn>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {showMatcher&&packages.length===0&&<div style={{ marginTop:12, padding:"14px", background:`${P.danger}0d`, borderRadius:10, border:`1px solid ${P.danger}30`, color:P.danger, fontSize:13 }}>No bundles found. Try increasing your budget.</div>}
      </ObsidianCard>

      {/* Filters */}
      <ObsidianCard style={{ marginBottom:16, padding:16 }}>
        <div style={{ display:"flex", gap:14, alignItems:"flex-end", flexWrap:"wrap" }}>
          <div>
            <label style={{ color:P.muted, fontSize:9, textTransform:"uppercase", letterSpacing:1.5 }}>Source</label>
            <div style={{ display:"flex", gap:5, marginTop:6 }}>
              {["all","solar","wind","biogas"].map(t=>{
                const colors={solar:P.amber,wind:P.cyan,biogas:P.copper};
                const c=colors[t]||P.amber;
                return <button key={t} onClick={()=>setFt(t)} style={{ padding:"5px 14px", borderRadius:8, border:`1px solid ${ft===t?c:P.border}`, background:ft===t?`${c}16`:"transparent", color:ft===t?c:P.muted, fontSize:11, cursor:"pointer", fontWeight:ft===t?700:400, fontFamily:"inherit", transition:"all 0.2s" }}>
                  {t==="all"?"All":t==="solar"?"☀️":t==="wind"?"💨":"♻️"} {t.charAt(0).toUpperCase()+t.slice(1)}
                </button>;
              })}
            </div>
          </div>
          <div style={{ flex:1, minWidth:150 }}>
            <label style={{ color:P.muted, fontSize:9, textTransform:"uppercase", letterSpacing:1.5 }}>City Filter</label>
            <input value={fl} onChange={e=>setFl(e.target.value)} placeholder="Search city…" style={{ display:"block", marginTop:6, padding:"7px 12px", background:"rgba(255,255,255,0.04)", border:`1px solid ${P.border}`, borderRadius:8, color:P.text, fontSize:12, outline:"none", fontFamily:"inherit", width:"100%" }}/>
          </div>
          <div>
            <label style={{ color:P.muted, fontSize:9, textTransform:"uppercase", letterSpacing:1.5 }}>Max ₹/kWh: <span style={{ color:P.amber }}>{mp}</span></label>
            <input type="range" min={2} max={10} step={0.1} value={mp} onChange={e=>setMp(+e.target.value)} style={{ display:"block", marginTop:10, width:160 }}/>
          </div>
          <div>
            <label style={{ color:P.muted, fontSize:9, textTransform:"uppercase", letterSpacing:1.5 }}>Sort</label>
            <select value={sort} onChange={e=>setSort(e.target.value)} style={{ display:"block", marginTop:6, padding:"7px 12px", background:"rgba(255,255,255,0.04)", border:`1px solid ${P.border}`, borderRadius:8, color:P.text, fontSize:12, fontFamily:"inherit", outline:"none" }}>
              <option value="location">📍 Proximity</option>
              <option value="price">💸 Price</option>
              <option value="units">⚡ Volume</option>
              {night && <option value="wind_night">🌙 Wind Night</option>}
            </select>
          </div>
        </div>
      </ObsidianCard>

      {/* Listings grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:14 }}>
        {filtered.map(l=>{
          const prod = getUserById(l.producer_id);
          const listingReviews = DB.reviews.filter(r=>r.producer_id===l.producer_id);
          const trust = prod ? (DB.users.find(u=>u.id===prod.id)?.trustScore || 4.0) : 4.0;
          const reviewCount = prod ? (DB.users.find(u=>u.id===prod.id)?.reviews || 0) : 0;
          const flashActive = l.flashSale && l.flashSale.endsAt > Date.now();
          const prismBadge = l.isLocal;

          return (
            <ObsidianCard key={l.id} onClick={() => setModal(l)} glow={l.isLocal}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  <EnergyTag type={l.energy_type}/>
                  <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                    {prismBadge && <span style={{ padding:"2px 8px", borderRadius:20, background:`${P.amber}15`, color:P.amber, border:`1px solid ${P.amber}40`, fontSize:9, fontWeight:700 }}>✦ PRISM BADGE</span>}
                    {flashActive && <span style={{ padding:"2px 8px", borderRadius:20, background:`${P.copper}18`, color:P.copper, border:`1px solid ${P.copper}40`, fontSize:9, fontWeight:700, animation:"flash-badge 2s ease infinite" }}>⚡ FLASH {Math.round(l.flashSale.discount*100)}% OFF</span>}
                  </div>
                </div>
                <StatusPill status={l.status}/>
              </div>

              {/* Producer */}
              <div style={{ marginBottom:14 }}>
                <div style={{ color:P.text, fontWeight:600, fontSize:13 }}>{prod?.name}</div>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:4 }}>
                  <StarRating score={trust} count={reviewCount}/>
                  <TrustBadge score={trust}/>
                </div>
              </div>

              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
                <div>
                  <div style={{ color:P.muted, fontSize:9, textTransform:"uppercase", letterSpacing:1 }}>Available</div>
                  <div style={{ fontFamily:"'JetBrains Mono', monospace", color:P.amber, fontWeight:700, fontSize:26 }}>{l.units_available}<span style={{ fontSize:12, opacity:0.7 }}> kWh</span></div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ color:P.muted, fontSize:9, textTransform:"uppercase", letterSpacing:1 }}>Price</div>
                  {l.isLocal&&l.originalPrice!==l.effPrice && <div style={{ textDecoration:"line-through", color:P.muted, fontSize:11 }}>₹{l.originalPrice.toFixed(2)}</div>}
                  <div style={{ fontFamily:"'JetBrains Mono', monospace", color:P.success, fontWeight:700, fontSize:22 }}>₹{l.effPrice.toFixed(2)}<span style={{ fontSize:11, opacity:0.7 }}>/kWh</span></div>
                </div>
              </div>

              <div style={{ display:"flex", gap:8, fontSize:11, color:P.muted, marginBottom:14, flexWrap:"wrap" }}>
                <span>📍 {l.location}</span>
                <span>·</span>
                <span>📅 {l.validity}</span>
                <span>·</span>
                <span>🌿 {calcCO2(l.units_available)} kg CO₂</span>
              </div>

              <div style={{ display:"flex", gap:8 }}>
                <PrismBtn full size="sm" onClick={e=>{e.stopPropagation();setModal(l);}}>Buy Energy →</PrismBtn>
                <button onClick={e=>{e.stopPropagation();setShowReviews(l.producer_id);}} style={{ padding:"6px 12px", borderRadius:8, border:`1px solid ${P.border}`, background:"transparent", color:P.muted, fontSize:11, cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s" }}
                  onMouseEnter={e2=>{e2.currentTarget.style.borderColor=P.amber;e2.currentTarget.style.color=P.amber;}}
                  onMouseLeave={e2=>{e2.currentTarget.style.borderColor=P.border;e2.currentTarget.style.color=P.muted;}}>
                  ★ Reviews
                </button>
              </div>
            </ObsidianCard>
          );
        })}
        {filtered.length===0 && (
          <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"60px 0", color:P.muted }}>
            <div style={{ fontSize:48, marginBottom:16 }}>⚡</div>
            <div style={{ fontSize:15 }}>No listings match your filters.</div>
          </div>
        )}
      </div>

      {/* Reviews Modal */}
      {showReviews && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:600, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(8px)" }}
          onClick={()=>setShowReviews(null)}>
          <div onClick={e=>e.stopPropagation()} style={{ background:"#0a0a0f", border:`1px solid ${P.border}`, borderRadius:20, padding:32, maxWidth:480, width:"90%", animation:"scale-in 0.25s ease", maxHeight:"80vh", overflowY:"auto" }}>
            <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:28, letterSpacing:"0.06em", color:P.text, marginBottom:6 }}>REVIEWS</div>
            <div style={{ color:P.muted, fontSize:12, marginBottom:20 }}>{DB.users.find(u=>u.id===showReviews)?.name}</div>
            {DB.reviews.filter(r=>r.producer_id===showReviews).length===0
              ? <div style={{ color:P.muted, textAlign:"center", padding:"32px 0" }}>No reviews yet.</div>
              : DB.reviews.filter(r=>r.producer_id===showReviews).map((rev,i) => {
                const buyer = DB.users.find(u=>u.id===rev.buyer_id);
                return (
                  <div key={i} style={{ padding:"14px 16px", background:"rgba(255,255,255,0.03)", borderRadius:12, border:`1px solid ${P.border}`, marginBottom:10 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                      <span style={{ color:P.text, fontSize:13, fontWeight:600 }}>{buyer?.name}</span>
                      <StarRating score={rev.rating} count={0}/>
                    </div>
                    <div style={{ color:P.textD, fontSize:13, fontStyle:"italic" }}>"{rev.comment}"</div>
                    <div style={{ color:P.muted, fontSize:10, marginTop:6 }}>{rev.date}</div>
                  </div>
                );
              })}
            <PrismBtn variant="ghost" full onClick={()=>setShowReviews(null)} style={{ marginTop:16 }}>Close</PrismBtn>
          </div>
        </div>
      )}

      {/* Purchase Modal */}
      {modal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:600, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(8px)" }}
          onClick={()=>setModal(null)}>
          <div onClick={e=>e.stopPropagation()} style={{ background:"#0a0a0f", border:`1px solid ${P.border}`, borderRadius:20, padding:32, maxWidth:480, width:"90%", animation:"scale-in 0.25s ease" }}>
            <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:32, letterSpacing:"0.06em", color:P.text, marginBottom:4 }}>PURCHASE</div>
            <div style={{ color:P.muted, fontSize:12, marginBottom:20 }}>{getUserById(modal.producer_id)?.name}</div>
            <EnergyTag type={modal.energy_type}/>
            <div style={{ margin:"20px 0" }}>
              <label style={{ color:P.muted, fontSize:9, textTransform:"uppercase", letterSpacing:1.5 }}>Units: <span style={{ color:P.amber }}>{units} kWh</span></label>
              <input type="range" min={10} max={modal.units_available} step={10} value={units} onChange={e=>setUnits(+e.target.value)} style={{ display:"block", marginTop:10, width:"100%" }}/>
              <div style={{ display:"flex", justifyContent:"space-between", color:P.muted, fontSize:10, marginTop:4 }}><span>10</span><span>{modal.units_available} kWh</span></div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:20 }}>
              {[
                { l:"Total Cost", v:`₹${(units*modal.effPrice).toFixed(0)}`, c:P.amber },
                { l:"CO₂ Saved",  v:`${calcCO2(units)} kg`, c:P.success },
                { l:"GridCoins",  v:`🪙 ${calcGridCoins(units)}`, c:P.indigo },
              ].map((m,i)=>(
                <div key={i} style={{ background:"rgba(255,255,255,0.03)", borderRadius:10, padding:"12px 14px", textAlign:"center" }}>
                  <div style={{ fontFamily:"'JetBrains Mono', monospace", color:m.c, fontWeight:700, fontSize:16 }}>{m.v}</div>
                  <div style={{ color:P.muted, fontSize:9, textTransform:"uppercase", marginTop:4 }}>{m.l}</div>
                </div>
              ))}
            </div>
            {modal.isLocal && (
              <div style={{ padding:"10px 14px", background:`${P.amber}10`, border:`1px solid ${P.amber}30`, borderRadius:10, color:P.amber, fontSize:12, marginBottom:16 }}>
                ✦ Prism Badge applied — 5% Neighbour Discount
              </div>
            )}
            <div style={{ display:"flex", gap:10 }}>
              <PrismBtn full size="lg" onClick={()=>{ onRequestPurchase(modal, units); setModal(null); }}>Confirm Purchase →</PrismBtn>
              <PrismBtn variant="ghost" onClick={()=>setModal(null)}>Cancel</PrismBtn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MY LISTINGS ──────────────────────────────────────────────────────
function MyListingsPage({ user, listings, setListings, setToast }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ energy_type:"solar", units_available:"", price_per_unit:"", location:user.location||"", validity:"", solar_capacity_kw:"", panel_count:"", turbine_count:"", wind_speed_avg:"", feedstock_type:"", plant_capacity_m3:"", waste_tons:"", flashSaleDiscount:"", flashSaleHours:"" });
  const myL = listings.filter(l=>l.producer_id===user.id);
  const biogasKwhCalc = form.energy_type==="biogas"&&form.waste_tons ? biogasKwh(+form.waste_tons) : null;

  const add = () => {
    if (!form.price_per_unit||!form.location||!form.validity) return;
    let units = +form.units_available;
    if (form.energy_type==="biogas"&&form.waste_tons&&+form.waste_tons>0) units = biogasKwh(+form.waste_tons);
    if (!units||units<=0) return;
    const flashSale = form.flashSaleDiscount&&form.flashSaleHours ? { discount:+form.flashSaleDiscount/100, label:`Flash Sale ${form.flashSaleDiscount}% off`, endsAt:Date.now()+(+form.flashSaleHours*3600000) } : null;
    setListings([...listings, { id:listings.length+1, producer_id:user.id, status:"active", ...form, units_available:units, price_per_unit:+form.price_per_unit, solar_capacity_kw:+form.solar_capacity_kw, panel_count:+form.panel_count, turbine_count:+form.turbine_count, wind_speed_avg:+form.wind_speed_avg, plant_capacity_m3:+form.plant_capacity_m3, waste_tons:+form.waste_tons, flashSale }]);
    setShowForm(false);
    setToast(`✅ Listing published! ${biogasKwhCalc?`♻️ ${biogasKwhCalc} kWh from ${form.waste_tons}t waste`:""}${flashSale?` ⚡ Flash sale active for ${form.flashSaleHours}h!`:""}`);
  };

  const doGridSell = l => {
    setListings(listings.map(x=>x.id===l.id?{...x,status:"grid_sold"}:x));
    setToast(`🏛 ${l.units_available} kWh sold to National Grid @ ₹${GRID_FLOOR}/kWh = ₹${(l.units_available*GRID_FLOOR).toFixed(0)}`);
  };

  return (
    <div style={{ animation:"slide-up 0.5s ease" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:24, flexWrap:"wrap", gap:10 }}>
        <div>
          <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:"clamp(36px,4vw,56px)", letterSpacing:"0.06em", color:P.text }}>MY <span style={{ color:P.amber }}>LISTINGS</span></div>
          <div style={{ color:P.muted, fontSize:13 }}>Manage your renewable energy supply</div>
        </div>
        <PrismBtn onClick={()=>setShowForm(!showForm)}>{showForm?"✕ Cancel":"+ New Listing"}</PrismBtn>
      </div>

      {/* Grid Safety Net Banner */}
      <div style={{ marginBottom:20, padding:"14px 20px", background:"rgba(216,67,21,0.06)", border:`1px solid rgba(216,67,21,0.25)`, borderRadius:14, display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
        <span style={{ fontSize:28 }}>🏛</span>
        <div style={{ flex:1 }}>
          <div style={{ color:P.copper, fontWeight:700, fontSize:14 }}>Government Grid Buy-Back Safety Net</div>
          <div style={{ color:P.muted, fontSize:12, marginTop:2 }}>Auto-Sell unsold P2P energy to National Grid at guaranteed floor: <strong style={{color:P.copper}}>₹{GRID_FLOOR}/kWh</strong></div>
        </div>
        <span style={{ background:"rgba(216,67,21,0.12)", color:P.copper, border:`1px solid rgba(216,67,21,0.3)`, borderRadius:20, padding:"4px 14px", fontSize:11, fontWeight:800 }}>FLOOR ₹{GRID_FLOOR}</span>
      </div>

      {showForm && (
        <ObsidianCard style={{ marginBottom:20, borderColor:`${P.amber}40`, boxShadow:`0 0 60px ${P.amberGlow}10` }}>
          <div style={{ color:P.amber, fontWeight:700, fontSize:16, marginBottom:18, fontFamily:"'Bebas Neue', sans-serif", letterSpacing:"0.06em" }}>NEW ENERGY LISTING</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
            <PrismInput label="Energy Source" value={form.energy_type} onChange={v=>setForm({...form,energy_type:v})} options={[{v:"solar",l:"☀️ Solar"},{v:"wind",l:"💨 Wind"},{v:"biogas",l:"♻️ Biogas"}]}/>
            <PrismInput label="Price/kWh (₹)" type="number" value={form.price_per_unit} onChange={v=>setForm({...form,price_per_unit:v})} placeholder="e.g. 4.5"/>
            <PrismInput label="Location / City" value={form.location} onChange={v=>setForm({...form,location:v})} placeholder="City name"/>
            <PrismInput label="Valid Until" type="date" value={form.validity} onChange={v=>setForm({...form,validity:v})}/>
            {form.energy_type!=="biogas" && <PrismInput label="Units (kWh)" type="number" value={form.units_available} onChange={v=>setForm({...form,units_available:v})} placeholder="e.g. 500"/>}
          </div>
          {form.energy_type==="solar" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <PrismInput label="Solar Capacity (kW)" type="number" value={form.solar_capacity_kw} onChange={v=>setForm({...form,solar_capacity_kw:v})} placeholder="e.g. 20"/>
              <PrismInput label="Panel Count" type="number" value={form.panel_count} onChange={v=>setForm({...form,panel_count:v})} placeholder="e.g. 80"/>
            </div>
          )}
          {form.energy_type==="wind" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <PrismInput label="Turbine Count" type="number" value={form.turbine_count} onChange={v=>setForm({...form,turbine_count:v})} placeholder="e.g. 3"/>
              <PrismInput label="Avg Wind Speed (m/s)" type="number" value={form.wind_speed_avg} onChange={v=>setForm({...form,wind_speed_avg:v})} placeholder="e.g. 7.2"/>
            </div>
          )}
          {form.energy_type==="biogas" && (
            <div>
              <div style={{ padding:"12px 16px", background:`${P.copper}10`, border:`1px solid ${P.copper}30`, borderRadius:12, marginBottom:14 }}>
                <div style={{ color:P.copper, fontWeight:700, fontSize:13, marginBottom:4 }}>♻️ Circular Economy Engine</div>
                <div style={{ color:P.muted, fontSize:12 }}>Enter waste input → <code style={{color:P.copper}}>kWh = Tons × {BIOGAS_KWH_TON}</code></div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
                <PrismInput label="Organic Waste (Tons)" type="number" value={form.waste_tons} onChange={v=>setForm({...form,waste_tons:v})} placeholder="e.g. 1.5" hint="♻️ Auto-calculates kWh"/>
                <PrismInput label="Feedstock Type" value={form.feedstock_type} onChange={v=>setForm({...form,feedstock_type:v})} placeholder="Agricultural waste"/>
                <PrismInput label="Plant Capacity (m³)" type="number" value={form.plant_capacity_m3} onChange={v=>setForm({...form,plant_capacity_m3:v})} placeholder="e.g. 50"/>
              </div>
              {biogasKwhCalc && (
                <div style={{ padding:"14px 20px", background:P.amberSoft, border:`1px solid ${P.border}`, borderRadius:12, marginBottom:14, display:"flex", gap:24, flexWrap:"wrap" }}>
                  <div><div style={{color:P.muted,fontSize:9,textTransform:"uppercase",letterSpacing:1}}>ENERGY OUTPUT</div><div style={{fontFamily:"'JetBrains Mono', monospace", color:P.amber,fontWeight:700,fontSize:32}}>{biogasKwhCalc} <span style={{fontSize:14}}>kWh</span></div></div>
                  <div><div style={{color:P.muted,fontSize:9,textTransform:"uppercase",letterSpacing:1}}>FORMULA</div><div style={{color:P.textD,fontSize:14,fontFamily:"'JetBrains Mono', monospace",marginTop:6}}>{form.waste_tons} × {BIOGAS_KWH_TON}</div></div>
                  <div><div style={{color:P.muted,fontSize:9,textTransform:"uppercase",letterSpacing:1}}>CO₂ SAVED</div><div style={{fontFamily:"'JetBrains Mono', monospace", color:P.success,fontWeight:700,fontSize:32}}>{calcCO2(biogasKwhCalc)} <span style={{fontSize:14}}>kg</span></div></div>
                </div>
              )}
            </div>
          )}
          {/* Flash Sale option */}
          <div style={{ marginTop:8, padding:"16px", background:"rgba(216,67,21,0.06)", border:`1px solid rgba(216,67,21,0.2)`, borderRadius:12 }}>
            <div style={{ color:P.copper, fontWeight:700, fontSize:13, marginBottom:12 }}>⚡ Add Flash Sale (Optional)</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <PrismInput label="Discount %" type="number" value={form.flashSaleDiscount} onChange={v=>setForm({...form,flashSaleDiscount:v})} placeholder="e.g. 20"/>
              <PrismInput label="Duration (hours)" type="number" value={form.flashSaleHours} onChange={v=>setForm({...form,flashSaleHours:v})} placeholder="e.g. 2"/>
            </div>
          </div>
          <div style={{ marginTop:16 }}><PrismBtn size="lg" onClick={add}>Publish Listing →</PrismBtn></div>
        </ObsidianCard>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))", gap:14 }}>
        {myL.map(l=>(
          <ObsidianCard key={l.id}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
              <EnergyTag type={l.energy_type}/>
              <StatusPill status={l.status}/>
            </div>
            {l.flashSale && l.flashSale.endsAt>Date.now() && <div style={{ marginBottom:12 }}><FlashSaleTimer endsAt={l.flashSale.endsAt} discount={l.flashSale.discount}/></div>}
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
              <div>
                <div style={{color:P.muted,fontSize:9,textTransform:"uppercase",letterSpacing:1}}>Units</div>
                <div style={{fontFamily:"'JetBrains Mono', monospace", color:P.amber,fontWeight:700,fontSize:28}}>{l.units_available}<span style={{fontSize:12}}> kWh</span></div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{color:P.muted,fontSize:9,textTransform:"uppercase",letterSpacing:1}}>Price</div>
                <div style={{fontFamily:"'JetBrains Mono', monospace", color:P.success,fontWeight:700,fontSize:20}}>₹{l.price_per_unit}/kWh</div>
              </div>
            </div>
            <div style={{ fontSize:11, color:P.muted, marginBottom:12 }}>📍 {l.location} · 📅 {l.validity}</div>
            <div style={{ display:"flex", gap:8 }}>
              {l.status==="active" && (
                <PrismBtn variant="copper" size="sm" full onClick={()=>doGridSell(l)}>
                  🏛 Sell to Grid ₹{(l.units_available*GRID_FLOOR).toFixed(0)}
                </PrismBtn>
              )}
            </div>
          </ObsidianCard>
        ))}
        {myL.length===0 && (
          <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"60px 0", color:P.muted }}>
            <div style={{ fontSize:48, marginBottom:16 }}>⚡</div>
            <div>No listings yet. Add your first one!</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── DEALS PAGE ───────────────────────────────────────────────────────
function DealsPage({ user, deals, onUpdateDeal, listings }) {
  const isP = user.role==="producer";
  const myL = listings.filter(l=>l.producer_id===user.id);
  const myDeals = isP ? deals.filter(d=>myL.some(l=>l.id===d.listingId)) : deals.filter(d=>d.buyerId===user.id);

  return (
    <div style={{ animation:"slide-up 0.5s ease" }}>
      <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:"clamp(36px,4vw,56px)", letterSpacing:"0.06em", color:P.text, marginBottom:24 }}>
        {isP?"DEAL ":"MY "}<span style={{ color:P.amber }}>{isP?"REQUESTS":"DEALS"}</span>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {myDeals.map(d=>(
          <ObsidianCard key={d.id}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8, flexWrap:"wrap" }}>
                  <EnergyTag type={d.energyType}/>
                  <StatusPill status={d.status}/>
                </div>
                <div style={{ fontWeight:600, fontSize:14, color:P.text, marginBottom:4 }}>{isP?d.buyerName:d.producerName}</div>
                <div style={{ fontSize:12, color:P.muted }}>⚡ {d.units} kWh · ₹{d.totalPrice.toLocaleString()} · 📍 {d.location}</div>
                {d.tx_hash && (
                  <div style={{ marginTop:8, padding:"8px 12px", background:"rgba(255,255,255,0.03)", borderRadius:8, fontFamily:"'JetBrains Mono', monospace", fontSize:10, color:P.cyan, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    🔗 TX: {d.tx_hash}
                  </div>
                )}
              </div>
              <div style={{ display:"flex", flex:"0 0 auto", gap:10, alignItems:"center" }}>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontFamily:"'JetBrains Mono', monospace", color:P.success, fontWeight:700, fontSize:16 }}>{calcCO2(d.units)} kg</div>
                  <div style={{ color:P.muted, fontSize:9 }}>CO₂ Saved</div>
                </div>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontFamily:"'JetBrains Mono', monospace", color:P.indigo, fontWeight:700, fontSize:16 }}>🪙 {calcGridCoins(d.units)}</div>
                  <div style={{ color:P.muted, fontSize:9 }}>GridCoins</div>
                </div>
                {isP && d.status==="pending" && (
                  <>
                    <PrismBtn size="sm" onClick={()=>onUpdateDeal(d.id,"accepted")}>✓ Accept</PrismBtn>
                    <PrismBtn size="sm" variant="danger" onClick={()=>onUpdateDeal(d.id,"rejected")}>✕ Reject</PrismBtn>
                  </>
                )}
              </div>
            </div>
          </ObsidianCard>
        ))}
        {myDeals.length===0 && (
          <div style={{ textAlign:"center", padding:"80px 0", color:P.muted }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🤝</div>
            <div>No deals yet.</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── ANALYTICS ────────────────────────────────────────────────────────
function AnalyticsPage({ transactions, listings }) {
  const totalKwh  = transactions.reduce((s,t)=>s+t.units_bought,0);
  const totalCO2  = transactions.reduce((s,t)=>s+t.carbon_saved,0);
  const totalRev  = transactions.reduce((s,t)=>s+t.total_price,0);
  const avgPrice  = (listings.reduce((s,l)=>s+l.price_per_unit,0)/listings.length).toFixed(2);
  const byType    = { solar:0, wind:0, biogas:0 };
  transactions.forEach(t=>{const l=listings.find(x=>x.id===t.listing_id); if(l) byType[l.energy_type]=(byType[l.energy_type]||0)+t.units_bought;});
  const total = Object.values(byType).reduce((a,b)=>a+b,0)||1;

  return (
    <div style={{ animation:"slide-up 0.5s ease" }}>
      <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:"clamp(36px,4vw,56px)", letterSpacing:"0.06em", color:P.text, marginBottom:24 }}>
        ANALYTICS <span style={{ color:P.amber }}>DASHBOARD</span>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
        {[
          { icon:"⚡", l:"Total Traded", v:`${totalKwh.toLocaleString()} kWh`, c:P.amber },
          { icon:"🌿", l:"CO₂ Saved",   v:`${totalCO2.toFixed(0)} kg`,         c:P.success },
          { icon:"💰", l:"Revenue",      v:`₹${totalRev.toLocaleString()}`,      c:P.copper },
          { icon:"📊", l:"Avg Price",    v:`₹${avgPrice}/kWh`,                  c:P.cyan },
        ].map((k,i)=>(
          <ObsidianCard key={i} style={{ textAlign:"center", padding:20 }}>
            <div style={{ fontSize:32, marginBottom:10 }}>{k.icon}</div>
            <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:22, fontWeight:700, color:k.c }}>{k.v}</div>
            <div style={{ color:P.muted, fontSize:10, textTransform:"uppercase", letterSpacing:1, marginTop:6 }}>{k.l}</div>
          </ObsidianCard>
        ))}
      </div>

      {/* Energy Mix */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        <ObsidianCard>
          <div style={{ color:P.amber, fontSize:10, textTransform:"uppercase", letterSpacing:2, fontWeight:700, marginBottom:16 }}>ENERGY MIX DISTRIBUTION</div>
          {[{type:"solar",c:P.amber,icon:"☀️"},{type:"wind",c:P.cyan,icon:"💨"},{type:"biogas",c:P.copper,icon:"♻️"}].map(({type,c,icon})=>{
            const pct = ((byType[type]||0)/total*100).toFixed(1);
            return (
              <div key={type} style={{ marginBottom:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ color:P.textD, fontSize:12 }}>{icon} {type.charAt(0).toUpperCase()+type.slice(1)}</span>
                  <span style={{ fontFamily:"'JetBrains Mono', monospace", color:c, fontWeight:700, fontSize:12 }}>{pct}%</span>
                </div>
                <div style={{ height:4, background:"rgba(255,255,255,0.06)", borderRadius:2 }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:c, borderRadius:2, boxShadow:`0 0 8px ${c}80`, transition:"width 1s ease" }}/>
                </div>
              </div>
            );
          })}
        </ObsidianCard>

        <ObsidianCard>
          <div style={{ color:P.amber, fontSize:10, textTransform:"uppercase", letterSpacing:2, fontWeight:700, marginBottom:16 }}>RECENT TRANSACTIONS</div>
          {transactions.slice(-5).reverse().map((t,i)=>{
            const l = listings.find(x=>x.id===t.listing_id);
            const buyer = DB.users.find(u=>u.id===t.buyer_id);
            return (
              <div key={i} style={{ padding:"10px 12px", background:"rgba(255,255,255,0.02)", borderRadius:10, border:`1px solid ${P.border}`, marginBottom:8 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ color:P.text, fontSize:12, fontWeight:600 }}>{buyer?.name?.split(" ").slice(0,2).join(" ")}</span>
                  <span style={{ fontFamily:"'JetBrains Mono', monospace", color:P.amber, fontSize:12, fontWeight:700 }}>₹{t.total_price}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:P.muted }}>
                  <span>⚡ {t.units_bought} kWh · {l?.energy_type}</span>
                  <span>🔗 {t.tx_hash?.slice(0,8)}…</span>
                </div>
              </div>
            );
          })}
        </ObsidianCard>
      </div>

      {/* Platform stats */}
      <ObsidianCard>
        <div style={{ color:P.amber, fontSize:10, textTransform:"uppercase", letterSpacing:2, fontWeight:700, marginBottom:16 }}>PLATFORM SUSTAINABILITY KPIs</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12, textAlign:"center" }}>
          {[
            {icon:"⚡",l:"RE Traded",      v:`${totalKwh.toLocaleString()} kWh`, c:P.amber},
            {icon:"🌿",l:"CO₂ Avoided",    v:`${totalCO2.toFixed(0)} kg`,         c:P.success},
            {icon:"👥",l:"Producers",       v:DB.users.filter(u=>u.role==="producer").length, c:P.cyan},
            {icon:"🏘",l:"Community Pools", v:DB.communityPools.length,             c:P.indigo},
            {icon:"🪙",l:"GridCoins Out",   v:DB.users.reduce((s,u)=>s+u.gridCoins,0).toLocaleString(), c:P.copper},
          ].map((m,i)=>(
            <div key={i} style={{ padding:"16px 8px", background:"rgba(255,255,255,0.02)", borderRadius:12, border:`1px solid ${P.border}` }}>
              <div style={{ fontSize:24, marginBottom:8 }}>{m.icon}</div>
              <div style={{ fontFamily:"'JetBrains Mono', monospace", color:m.c, fontWeight:700, fontSize:18 }}>{m.v}</div>
              <div style={{ color:P.muted, fontSize:9, marginTop:4, textTransform:"uppercase", letterSpacing:0.5 }}>{m.l}</div>
            </div>
          ))}
        </div>
      </ObsidianCard>
    </div>
  );
}

// ── DASHBOARD ────────────────────────────────────────────────────────
function DashboardPage({ user, transactions, listings, deals, setPage }) {
  const isP = user.role==="producer";
  const myL = listings.filter(l=>l.producer_id===user.id);
  const myT = isP ? transactions.filter(t=>myL.some(l=>l.id===t.listing_id)) : transactions.filter(t=>t.buyer_id===user.id);
  const myD = isP ? deals.filter(d=>myL.some(l=>l.id===d.listingId)) : deals.filter(d=>d.buyerId===user.id);
  const pending = myD.filter(d=>d.status==="pending");
  const totKwh  = myT.reduce((s,t)=>s+t.units_bought,0);
  const totCO2  = myT.reduce((s,t)=>s+t.carbon_saved,0);
  const totRev  = myT.reduce((s,t)=>s+t.total_price,0);
  const userCoins = DB.users.find(u=>u.id===user.id)?.gridCoins || 0;
  const sl = user.greenScore>=900?{label:"🌟 Sustainability Legend",tier:"Platinum"}:user.greenScore>=700?{label:"🏆 Eco Champion",tier:"Gold"}:user.greenScore>=500?{label:"🌿 Green Warrior",tier:"Silver"}:{label:"🌱 Green Starter",tier:"Bronze"};
  const night = isNight();

  const kpis = isP
    ? [{icon:"⚡",l:"Energy Sold",   v:`${totKwh} kWh`,            c:P.amber},{icon:"💰",l:"Revenue",  v:`₹${totRev.toLocaleString()}`, c:P.copper},{icon:"🌿",l:"CO₂ Saved",    v:`${totCO2.toFixed(0)} kg`, c:P.success},{icon:"📋",l:"Active Listings",v:myL.filter(l=>l.status==="active").length,c:P.cyan}]
    : [{icon:"⚡",l:"Energy Bought", v:`${totKwh} kWh`,            c:P.amber},{icon:"🌍",l:"CO₂ Avoided",v:`${totCO2.toFixed(0)} kg`, c:P.success},{icon:"💳",l:"Total Spent", v:`₹${totRev.toLocaleString()}`,c:P.copper},{icon:"🏆",l:"Green Score",    v:user.greenScore,c:P.warn}];

  return (
    <div style={{ animation:"slide-up 0.5s ease" }}>
      <div style={{ marginBottom:32 }}>
        <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:"clamp(32px,4vw,52px)", letterSpacing:"0.06em", color:P.text }}>
          WELCOME BACK, <span style={{ color:P.amber }}>{user.name.split(" ")[0].toUpperCase()}</span>
        </div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center", marginTop:8 }}>
          <span style={{ color:P.amber, fontSize:13 }}>📍 {user.location}</span>
          <span style={{ color:P.muted }}>·</span>
          <span style={{ color:P.textD, fontSize:13 }}>{sl.label}</span>
          {night && <span style={{ padding:"3px 10px", borderRadius:20, background:`${P.cyan}15`, border:`1px solid ${P.cyan}40`, color:P.cyan, fontSize:10, fontWeight:700 }}>🌙 Night Mode</span>}
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
        {kpis.map((k,i)=>(
          <ObsidianCard key={i} style={{ textAlign:"center", padding:20 }}>
            <div style={{ fontSize:32, marginBottom:10 }}>{k.icon}</div>
            <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:24, fontWeight:700, color:k.c }}>{k.v}</div>
            <div style={{ color:P.muted, fontSize:9, textTransform:"uppercase", letterSpacing:1.2, marginTop:6 }}>{k.l}</div>
          </ObsidianCard>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:16 }}>
        {/* Green Score */}
        <ObsidianCard glow>
          <div style={{ color:P.muted, fontSize:9, textTransform:"uppercase", letterSpacing:2, marginBottom:16 }}>SUSTAINABILITY SCORE</div>
          <div style={{ display:"flex", alignItems:"center", gap:20 }}>
            <div style={{ position:"relative", width:90, height:90, flexShrink:0 }}>
              <svg width="90" height="90" viewBox="0 0 90 90" style={{ position:"absolute", inset:0 }}>
                <circle cx="45" cy="45" r="38" fill="none" stroke={P.border} strokeWidth="5"/>
                <circle cx="45" cy="45" r="38" fill="none" stroke={P.amber} strokeWidth="5"
                  strokeDasharray={2*Math.PI*38} strokeDashoffset={2*Math.PI*38*(1-Math.min(user.greenScore/1000,1))}
                  strokeLinecap="round" style={{ transform:"rotate(-90deg)", transformOrigin:"45px 45px", filter:`drop-shadow(0 0 8px ${P.amberGlow})` }}/>
              </svg>
              <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                <div style={{ fontFamily:"'JetBrains Mono', monospace", color:P.amber, fontWeight:700, fontSize:18 }}>{user.greenScore}</div>
                <div style={{ color:P.muted, fontSize:8 }}>pts</div>
              </div>
            </div>
            <div>
              <div style={{ color:P.amber, fontWeight:600, fontSize:14, marginBottom:6 }}>{sl.label}</div>
              <div style={{ color:P.muted, fontSize:11 }}>{Math.max(0,1000-user.greenScore)} pts to Platinum</div>
            </div>
          </div>
        </ObsidianCard>

        {/* GridCoin summary */}
        <ObsidianCard style={{ background:`linear-gradient(135deg, rgba(255,179,0,0.05), rgba(216,67,21,0.03))`, borderColor:`${P.amber}30` }}>
          <div style={{ color:P.muted, fontSize:9, textTransform:"uppercase", letterSpacing:2, marginBottom:16 }}>GRIDCOIN BALANCE</div>
          <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:56, letterSpacing:"0.06em", color:P.amber, lineHeight:1 }}>{userCoins.toLocaleString()}</div>
          <div style={{ color:P.muted, fontSize:11, marginTop:6 }}>🪙 GridCoins · ≈ ₹{(userCoins*2).toLocaleString()} value</div>
          <PrismBtn size="sm" variant="ghost" onClick={()=>setPage("gridcoins")} style={{ marginTop:12 }}>Swap Coins →</PrismBtn>
        </ObsidianCard>

        {/* Pending Deals */}
        <ObsidianCard>
          <div style={{ color:P.muted, fontSize:9, textTransform:"uppercase", letterSpacing:2, marginBottom:14 }}>{isP?"INCOMING REQUESTS":"ACTIVE DEALS"}</div>
          {pending.length>0 ? pending.slice(0,3).map(d=>(
            <div key={d.id} style={{ padding:"10px 12px", background:"rgba(255,255,255,0.03)", borderRadius:10, marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center", border:`1px solid ${P.border}` }}>
              <div>
                <div style={{ color:P.text, fontSize:12, fontWeight:600 }}>{isP?d.buyerName:d.producerName}</div>
                <div style={{ color:P.muted, fontSize:10, marginTop:2 }}>⚡ {d.units} kWh · ₹{d.totalPrice}</div>
              </div>
              <StatusPill status={d.status}/>
            </div>
          )) : (
            <div style={{ textAlign:"center", padding:"24px 0", color:P.muted }}>
              <div style={{ fontSize:28, marginBottom:8 }}>✓</div>
              <div style={{ fontSize:12 }}>All clear!</div>
            </div>
          )}
          {pending.length>0 && <PrismBtn full variant="ghost" size="sm" onClick={()=>setPage(isP?"deal_requests":"my_deals")}>View All →</PrismBtn>}
        </ObsidianCard>
      </div>

      {/* Quick actions */}
      <ObsidianCard>
        <div style={{ color:P.amber, fontSize:10, textTransform:"uppercase", letterSpacing:2, fontWeight:700, marginBottom:16 }}>QUICK ACTIONS</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:10 }}>
          {(isP ? [
            { icon:"⚡", label:"New Listing",   page:"my_listings",    variant:"primary" },
            { icon:"🤝", label:"View Deals",    page:"deal_requests",  variant:"ghost" },
            { icon:"📊", label:"Analytics",     page:"analytics",      variant:"ghost" },
            { icon:"🏘", label:"Community Pool",page:"community_pools",variant:"ghost" },
            { icon:"🪙", label:"GridCoins",     page:"gridcoins",      variant:"ghost" },
          ] : [
            { icon:"🛒", label:"Buy Energy",    page:"marketplace",    variant:"primary" },
            { icon:"🤝", label:"My Deals",      page:"my_deals",       variant:"ghost" },
            { icon:"📊", label:"Analytics",     page:"analytics",      variant:"ghost" },
            { icon:"🏘", label:"Join Pool",     page:"community_pools",variant:"ghost" },
            { icon:"🪙", label:"GridCoins",     page:"gridcoins",      variant:"ghost" },
          ]).map((a,i)=>(
            <PrismBtn key={i} variant={a.variant} onClick={()=>setPage(a.page)}>
              {a.icon} {a.label}
            </PrismBtn>
          ))}
        </div>
      </ObsidianCard>
    </div>
  );
}

// ── ROI CALCULATOR ───────────────────────────────────────────────────
function ROIPage() {
  const [type, setType]         = useState("solar");
  const [capacity, setCapacity] = useState(20);
  const [price, setPrice]       = useState(4.2);
  const [capex, setCapex]       = useState(150000);

  const daily   = type==="solar" ? capacity*4.5 : type==="wind" ? capacity*6 : capacity*8;
  const monthly = daily*30;
  const yearly  = daily*365;
  const yearlyRev = +(yearly*price).toFixed(0);
  const payback = (capex/yearlyRev).toFixed(1);
  const roi5    = (((yearlyRev*5-capex)/capex)*100).toFixed(0);
  const co25yr  = (calcCO2(yearly)*5).toFixed(0);

  return (
    <div style={{ animation:"slide-up 0.5s ease" }}>
      <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:"clamp(36px,4vw,56px)", letterSpacing:"0.06em", color:P.text, marginBottom:24 }}>
        ROI <span style={{ color:P.amber }}>CALCULATOR</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        <ObsidianCard>
          <div style={{ color:P.amber, fontSize:10, textTransform:"uppercase", letterSpacing:2, fontWeight:700, marginBottom:16 }}>SYSTEM PARAMETERS</div>
          <PrismInput label="Energy Source" value={type} onChange={setType} options={[{v:"solar",l:"☀️ Solar"},{v:"wind",l:"💨 Wind"},{v:"biogas",l:"♻️ Biogas"}]}/>
          <div style={{ marginBottom:16 }}>
            <label style={{ color:P.muted, fontSize:9, textTransform:"uppercase", letterSpacing:1.5 }}>Capacity: <span style={{ color:P.amber }}>{capacity} kW</span></label>
            <input type="range" min={1} max={200} value={capacity} onChange={e=>setCapacity(+e.target.value)} style={{ display:"block", marginTop:10, width:"100%" }}/>
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={{ color:P.muted, fontSize:9, textTransform:"uppercase", letterSpacing:1.5 }}>Price/kWh: <span style={{ color:P.amber }}>₹{price}</span></label>
            <input type="range" min={2} max={8} step={0.1} value={price} onChange={e=>setPrice(+e.target.value)} style={{ display:"block", marginTop:10, width:"100%" }}/>
          </div>
          <div>
            <label style={{ color:P.muted, fontSize:9, textTransform:"uppercase", letterSpacing:1.5 }}>CAPEX: <span style={{ color:P.amber }}>₹{capex.toLocaleString()}</span></label>
            <input type="range" min={10000} max={5000000} step={10000} value={capex} onChange={e=>setCapex(+e.target.value)} style={{ display:"block", marginTop:10, width:"100%" }}/>
          </div>
        </ObsidianCard>
        <ObsidianCard>
          <div style={{ color:P.amber, fontSize:10, textTransform:"uppercase", letterSpacing:2, fontWeight:700, marginBottom:16 }}>PROJECTIONS</div>
          {[
            {l:"Daily Output",     v:`${daily.toFixed(0)} kWh`,  c:P.textD},
            {l:"Monthly Output",   v:`${monthly.toFixed(0)} kWh`,c:P.textD},
            {l:"Yearly Output",    v:`${yearly.toFixed(0)} kWh`, c:P.amber},
            {l:"Monthly Revenue",  v:`₹${(yearlyRev/12).toFixed(0)}`,c:P.copper},
            {l:"Yearly Revenue",   v:`₹${yearlyRev.toFixed(0)}`, c:P.copper},
            {l:"⏱ Payback Period", v:`${payback} yrs`,           c:+payback<=5?P.success:P.warn, big:true},
            {l:"📈 5-Year ROI",     v:`${roi5}%`,                 c:+roi5>=0?P.success:P.danger, big:true},
          ].map((r,i)=>(
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:i<6?`1px solid ${P.border}`:"none" }}>
              <span style={{ color:P.muted, fontSize:12 }}>{r.l}</span>
              <span style={{ fontFamily:"'JetBrains Mono', monospace", color:r.c, fontWeight:700, fontSize:r.big?26:16 }}>{r.v}</span>
            </div>
          ))}
        </ObsidianCard>
      </div>
    </div>
  );
}

// ── APP ROOT ─────────────────────────────────────────────────────────
export default function App() {
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [preloaderData, setPreloaderData] = useState(null);
  const [user, setUser]         = useState(null);
  const [page, setPage]         = useState("home");
  const [listings, setListings] = useState(DB.energy_listings);
  const [transactions, setTransactions] = useState(DB.transactions);
  const [toast, setToast]       = useState(null);
  const [theme, setTheme]       = useState("dark");
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    // 1. Fetch existing deals from the cloud on load
    const fetchDeals = async () => {
      const { data } = await supabase.from('deals').select('*');
      if (data) setDeals(data);
    };
    fetchDeals();

    // 2. Listen for NEW deals in real-time (Seller will see them instantly)
    const subscription = supabase
      .channel('deals-live')
      .on('postgres_changes', { event: 'INSERT', table: 'deals' }, (payload) => {
        setDeals((current) => [...current, payload.new]);
      })
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);
 const onRequestPurchase = async (listing, units) => {
    const isLocal = listing.location.toLowerCase() === (user.location || "").toLowerCase();
    const effPrice = isLocal ? listing.price_per_unit * 0.95 : listing.price_per_unit;

    const { error } = await supabase.from('deals').insert([{ 
      listingId: listing.id, 
      producerId: listing.producer_id,
      producerName: getUserById(listing.producer_id)?.name || "Producer",
      buyerId: user.id, 
      buyerName: user.name,
      units: units, 
      totalPrice: +(units * effPrice).toFixed(0),
      energyType: listing.energy_type,
      location: listing.location,
      status: 'pending'
    }]);

    if (!error) setToast("🚀 Request sent to Global Cloud!");
    else setToast("Error: " + error.message);
};
  const onUpdateDeal = (dealId, status) => {
    const deal = deals.find(d=>d.id===dealId);
    const hash = status==="accepted" ? genHash() : null;
    setDeals(d=>d.map(x=>x.id===dealId?{...x,status,...(hash?{tx_hash:hash}:{})}:x));
    if (status==="accepted"&&deal) {
      setTransactions(t=>[...t, { id:t.length+1, listing_id:deal.listingId, buyer_id:deal.buyerId, units_bought:deal.units, total_price:deal.totalPrice, carbon_saved:calcCO2(deal.units), date:new Date().toISOString().slice(0,10), status:"completed", tx_hash:hash }]);
      setToast(`✅ Deal accepted! 🔗 ${hash?.slice(0,16)}… · 🌱 ${calcCO2(deal.units)} kg CO₂ · 🪙 +${calcGridCoins(deal.units)} GridCoins`);
    } else if (status==="rejected") setToast("Deal rejected.");
  };

  if (!preloaderDone) return (
    <><GlobalStyles/><PrismCursor/><Preloader onComplete={d=>{setPreloaderData(d);setPreloaderDone(true);}}/></>
  );

  if (!user) return (
    <><GlobalStyles/><PrismCursor/><AuthPage onLogin={u=>{setUser(u);setPage("home");}} preloaderData={preloaderData}/></>
  );

  const isP = user.role==="producer";
  const navItems = isP
    ? [["home","Home"],["dashboard","Dashboard"],["my_listings","My Listings"],["deal_requests","Deals"],["analytics","Analytics"],["roi","ROI Calc"],["community_pools","Community Pools"],["gridcoins","GridCoins"],["network","Network"]]
    : [["home","Home"],["dashboard","Dashboard"],["marketplace","Marketplace"],["my_deals","My Deals"],["analytics","Analytics"],["community_pools","Community Pools"],["gridcoins","GridCoins"],["network","Network"]];

  return (
    <div style={{ minHeight:"100vh", background:P.obsidian, color:P.text, paddingBottom:44 }}>
      <GlobalStyles/>
      <PrismCursor/>
      <Navbar user={user} page={page} setPage={setPage} onLogout={()=>{setUser(null);setPage("home");}} theme={theme} setTheme={setTheme}/>

      {/* Sub-nav */}
      <div style={{ borderBottom:`1px solid ${P.border}`, background:"rgba(5,5,5,0.9)", backdropFilter:"blur(24px)", padding:"0 32px", display:"flex", gap:0, overflowX:"auto" }}>
        {navItems.map(([id,lb])=>(
          <button key={id} onClick={()=>setPage(id)} style={{ padding:"11px 16px", border:"none", borderBottom:`2px solid ${page===id?P.amber:"transparent"}`, cursor:"pointer", background:"transparent", color:page===id?P.amber:P.muted, fontWeight:page===id?600:400, fontSize:12, transition:"all 0.2s", fontFamily:"inherit", display:"flex", alignItems:"center", whiteSpace:"nowrap", letterSpacing:0.5 }}>
            {lb}
          </button>
        ))}
      </div>

      <div style={{ maxWidth:1260, margin:"0 auto", padding:"32px 28px" }}>
        {page==="home"          && <HeroSection user={user} transactions={transactions} setPage={setPage}/>}
        {page==="dashboard"     && <DashboardPage user={user} transactions={transactions} listings={listings} deals={deals} setPage={setPage}/>}
        {page==="marketplace"   && !isP && <MarketplacePage user={user} listings={listings} onRequestPurchase={onRequestPurchase}/>}
        {page==="my_listings"   && isP  && <MyListingsPage  user={user} listings={listings} setListings={setListings} setToast={setToast}/>}
        {page==="deal_requests" && isP  && <DealsPage user={user} deals={deals} onUpdateDeal={onUpdateDeal} listings={listings}/>}
        {page==="my_deals"      && !isP && <DealsPage user={user} deals={deals} onUpdateDeal={onUpdateDeal} listings={listings}/>}
        {page==="analytics"     && <AnalyticsPage transactions={transactions} listings={listings}/>}
        {page==="roi"           && isP  && <ROIPage/>}
        {page==="network"       && <NetworkPage/>}
        {page==="community_pools" && <CommunityPoolsPage user={user} setToast={setToast}/>}
        {page==="gridcoins"     && <GridCoinWallet user={user}/>}
      </div>

      <ImpactTicker transactions={transactions} listings={listings}/>
      {toast && <Toast msg={toast} onClose={()=>setToast(null)}/>}
    </div>
  );
}
