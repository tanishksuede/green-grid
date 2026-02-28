import { useState, useEffect } from "react";

/* ══════════════════════════════════════════
   DATABASE SCHEMA (mirrors your SQL tables)
   Users / Energy_Listings / Transactions
══════════════════════════════════════════ */

const DB = {
  users: [
    { id: 1, name: "IIT Delhi Solar Rooftop", email: "solar@iitd.ac.in", password: "demo", role: "producer", producer_type: "solar_rooftop", location: "Delhi", greenScore: 920, joined: "2024-08-01" },
    { id: 2, name: "Rajasthan Wind Energy Ltd", email: "wind@rajasthan.in", password: "demo", role: "producer", producer_type: "wind_energy", location: "Jaipur", greenScore: 840, joined: "2024-09-15" },
    { id: 3, name: "Punjab BioGas Plant", email: "biogas@punjab.in", password: "demo", role: "producer", producer_type: "biogas_plant", location: "Amritsar", greenScore: 710, joined: "2024-10-20" },
    { id: 4, name: "Green Hostel — Mumbai", email: "hostel@mumbai.in", password: "demo", role: "buyer", buyer_type: "hostel", location: "Mumbai", greenScore: 560, joined: "2024-11-01" },
    { id: 5, name: "TechCorp Solutions", email: "tech@pune.in", password: "demo", role: "buyer", buyer_type: "small_business", location: "Pune", greenScore: 430, joined: "2024-11-15" },
    { id: 6, name: "Symbiosis University", email: "energy@symbiosis.edu.in", password: "demo", role: "buyer", buyer_type: "institution", location: "Pune", greenScore: 680, joined: "2024-12-01" },
    { id: 7, name: "BITS Pilani Campus", email: "campus@bits.ac.in", password: "demo", role: "producer", producer_type: "solar_rooftop", location: "Pilani", greenScore: 780, joined: "2025-01-10", isCampus: true },
  ],
  energy_listings: [
    { id: 1, producer_id: 1, energy_type: "solar", units_available: 500, price_per_unit: 4.2, location: "Delhi", status: "active", validity: "2025-03-30", solar_capacity_kw: 20, panel_count: 80 },
    { id: 2, producer_id: 2, energy_type: "wind", units_available: 800, price_per_unit: 3.8, location: "Jaipur", status: "active", validity: "2025-04-15", turbine_count: 3, wind_speed_avg: 7.2 },
    { id: 3, producer_id: 3, energy_type: "biogas", units_available: 300, price_per_unit: 5.1, location: "Amritsar", status: "active", validity: "2025-03-20", feedstock_type: "Agricultural waste", plant_capacity_m3: 50 },
    { id: 4, producer_id: 1, energy_type: "solar", units_available: 200, price_per_unit: 4.5, location: "Delhi", status: "active", validity: "2025-05-01", solar_capacity_kw: 8, panel_count: 32 },
    { id: 5, producer_id: 2, energy_type: "wind", units_available: 1200, price_per_unit: 3.5, location: "Jodhpur", status: "active", validity: "2025-04-30", turbine_count: 5, wind_speed_avg: 8.1 },
    { id: 6, producer_id: 7, energy_type: "solar", units_available: 650, price_per_unit: 3.9, location: "Pilani", status: "active", validity: "2025-06-01", solar_capacity_kw: 30, panel_count: 120, campus: true },
    { id: 7, producer_id: 3, energy_type: "biogas", units_available: 180, price_per_unit: 4.8, location: "Ludhiana", status: "active", validity: "2025-04-10", feedstock_type: "Crop residue", plant_capacity_m3: 30 },
  ],
  transactions: [
    { id: 1, listing_id: 1, buyer_id: 4, units_bought: 150, total_price: 630, carbon_saved: 123.0, date: "2025-02-10", status: "completed" },
    { id: 2, listing_id: 2, buyer_id: 5, units_bought: 300, total_price: 1140, carbon_saved: 246.0, date: "2025-02-14", status: "completed" },
    { id: 3, listing_id: 3, buyer_id: 4, units_bought: 80, total_price: 408, carbon_saved: 65.6, date: "2025-02-18", status: "completed" },
    { id: 4, listing_id: 5, buyer_id: 6, units_bought: 400, total_price: 1400, carbon_saved: 328.0, date: "2025-02-20", status: "completed" },
    { id: 5, listing_id: 6, buyer_id: 5, units_bought: 200, total_price: 780, carbon_saved: 164.0, date: "2025-02-22", status: "completed" },
    { id: 6, listing_id: 1, buyer_id: 6, units_bought: 100, total_price: 420, carbon_saved: 82.0, date: "2025-02-24", status: "completed" },
  ],
};

const FOSSIL_FACTOR = 0.82;
const calcCO2 = (units) => +(units * FOSSIL_FACTOR).toFixed(2);

const T = {
  bg: "#06100a", surface: "#0c1a10", card: "#101f14", cardH: "#142618",
  border: "#1a3020", borderL: "#254535",
  accent: "#00e676", accentD: "#00c853", accentDp: "#00952e",
  accentG: "rgba(0,230,118,0.12)", accentGS: "rgba(0,230,118,0.25)",
  text: "#e8f5e9", textD: "#a5d6a7", muted: "#4a7a5a",
  solar: "#ffd600", wind: "#29b6f6", biogas: "#66bb6a",
  danger: "#ef5350", warn: "#ffa726", purple: "#ce93d8",
};

const PRODUCER_META = {
  solar_rooftop: { label: "Solar Rooftop Owner", icon: "☀️", color: T.solar },
  wind_energy:   { label: "Wind Energy Provider", icon: "🌬️", color: T.wind },
  biogas_plant:  { label: "Biogas Plant", icon: "🌿", color: T.biogas },
};
const BUYER_META = {
  hostel:        { label: "Hostel / Building", icon: "🏠", color: T.accent },
  small_business:{ label: "Small Business", icon: "🏢", color: T.wind },
  institution:   { label: "Institution / University", icon: "🎓", color: T.purple },
};
const ENERGY_META = {
  solar:  { icon: "☀️", color: T.solar,  label: "Solar" },
  wind:   { icon: "🌬️", color: T.wind,   label: "Wind" },
  biogas: { icon: "🌿", color: T.biogas, label: "Biogas" },
};

function getUserById(id) { return DB.users.find(u => u.id === id); }
function getListingById(id, listings) { return listings.find(l => l.id === id); }
function scoreLabel(s) {
  if (s >= 900) return { label: "🌟 Sustainability Legend", tier: "Platinum" };
  if (s >= 700) return { label: "🏆 Eco Champion", tier: "Gold" };
  if (s >= 500) return { label: "🌿 Green Warrior", tier: "Silver" };
  return { label: "🌱 Green Starter", tier: "Bronze" };
}

// ── UI Atoms ──────────────────────────────────────
function Card({ children, style = {}, glow, onClick }) {
  const [h, setH] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: h && onClick ? T.cardH : T.card,
        border: `1px solid ${h && (onClick || glow) ? T.accent : T.border}`,
        borderRadius: 16, padding: 24, transition: "all 0.2s",
        cursor: onClick ? "pointer" : "default",
        boxShadow: h && (onClick || glow) ? `0 0 28px ${T.accentG}` : "none",
        ...style,
      }}>{children}</div>
  );
}

function Chip({ type, size = "md" }) {
  const m = ENERGY_META[type] || {};
  return (
    <span style={{
      background: `${m.color}18`, color: m.color, border: `1px solid ${m.color}44`,
      borderRadius: 20, padding: size === "sm" ? "2px 9px" : "4px 13px",
      fontSize: size === "sm" ? 10 : 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8,
      display: "inline-flex", alignItems: "center", gap: 4,
    }}>{m.icon} {m.label}</span>
  );
}

function StatusBadge({ status }) {
  const c = { active: [T.accent,"● Active"], pending: [T.warn,"⏳ Pending"], accepted: [T.accent,"✓ Accepted"], rejected: [T.danger,"✕ Rejected"], completed: [T.wind,"✔ Done"] }[status] || [T.muted, status];
  return <span style={{ background: `${c[0]}15`, color: c[0], border: `1px solid ${c[0]}44`, borderRadius: 20, padding: "2px 10px", fontSize: 10, fontWeight: 700 }}>{c[1]}</span>;
}

function Btn({ children, onClick, variant = "primary", size = "md", full }) {
  const [h, setH] = useState(false);
  const s = {
    primary: { background: `linear-gradient(135deg, ${T.accent}, ${T.accentD})`, color: "#000", border: "none", boxShadow: h ? `0 4px 20px ${T.accentGS}` : `0 2px 10px ${T.accentG}` },
    ghost:   { background: "transparent", color: h ? T.accent : T.muted, border: `1px solid ${h ? T.accent : T.border}` },
    danger:  { background: "transparent", color: T.danger, border: `1px solid ${T.danger}66` },
  }[variant];
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ ...s, padding: size === "sm" ? "6px 14px" : size === "lg" ? "13px 30px" : "9px 20px", borderRadius: 10, fontWeight: 700, fontSize: size === "sm" ? 12 : 13, cursor: "pointer", transition: "all 0.18s", width: full ? "100%" : "auto", fontFamily: "inherit" }}>
      {children}
    </button>
  );
}

function Inp({ label, value, onChange, type = "text", placeholder, options }) {
  const base = { display: "block", width: "100%", marginTop: 6, padding: "9px 13px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 9, color: T.text, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ color: T.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>{label}</label>}
      {options
        ? <select value={value} onChange={e => onChange(e.target.value)} style={base}>{options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}</select>
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={base} />}
    </div>
  );
}

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return <div style={{ position: "fixed", bottom: 26, right: 26, zIndex: 9999, background: T.card, border: `1px solid ${T.accent}`, borderRadius: 14, padding: "15px 22px", color: T.text, fontSize: 13, fontWeight: 600, boxShadow: `0 8px 40px ${T.accentGS}`, maxWidth: 360, animation: "slideUp 0.3s ease" }}>{msg}</div>;
}

// ── AUTH ──────────────────────────────────────────
function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("buyer");
  const [pt, setPt] = useState("solar_rooftop");
  const [bt, setBt] = useState("hostel");
  const [loc, setLoc] = useState("");
  const [campus, setCampus] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {[500,700,900,1100].map((r, i) => <div key={i} style={{ position: "absolute", width: r, height: r, borderRadius: "50%", border: `1px solid ${T.border}`, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />)}
        <div style={{ position: "absolute", top: "25%", left: "8%", width: 450, height: 450, borderRadius: "50%", background: `radial-gradient(circle, ${T.accentG} 0%, transparent 70%)` }} />
        <div style={{ position: "absolute", bottom: "15%", right: "8%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(41,182,246,0.06) 0%, transparent 70%)" }} />
      </div>
      <div style={{ position: "relative", zIndex: 1, width: 480, padding: 20 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 50, filter: `drop-shadow(0 0 18px ${T.accentGS})` }}>⚡</div>
          <h1 style={{ color: T.accent, fontSize: 36, fontWeight: 900, margin: "10px 0 0", letterSpacing: -2 }}>GreenGrid</h1>
          <p style={{ color: T.muted, margin: "6px 0 0", fontSize: 12, letterSpacing: 2, textTransform: "uppercase" }}>Renewable Energy Marketplace</p>
        </div>
        <Card>
          <div style={{ display: "flex", gap: 5, marginBottom: 22, background: T.surface, borderRadius: 10, padding: 4 }}>
            {["login","signup"].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: 9, borderRadius: 8, border: "none", cursor: "pointer", background: mode === m ? T.accent : "transparent", color: mode === m ? "#000" : T.muted, fontWeight: 700, fontSize: 13, transition: "all 0.2s", fontFamily: "inherit" }}>
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {mode === "signup" && <>
            <Inp label="Full Name" value={name} onChange={setName} placeholder="Your name or organization" />
            <Inp label="City / Location" value={loc} onChange={setLoc} placeholder="e.g. Delhi, Mumbai" />

            <div style={{ marginBottom: 14 }}>
              <label style={{ color: T.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>I am an…</label>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                {[{v:"producer",icon:"⚡",l:"Energy Producer"},{v:"buyer",icon:"🏢",l:"Energy Buyer"}].map(r => (
                  <div key={r.v} onClick={() => setRole(r.v)} style={{ flex: 1, padding: "12px 8px", borderRadius: 10, border: `2px solid ${role === r.v ? T.accent : T.border}`, background: role === r.v ? T.accentG : "transparent", cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}>
                    <div style={{ fontSize: 22 }}>{r.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: role === r.v ? T.accent : T.textD, marginTop: 4 }}>{r.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {role === "producer" && <>
              <div style={{ marginBottom: 14 }}>
                <label style={{ color: T.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>Producer Type</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                  {Object.entries(PRODUCER_META).map(([v, m]) => (
                    <div key={v} onClick={() => setPt(v)} style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${pt === v ? m.color : T.border}`, background: pt === v ? `${m.color}10` : "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, transition: "all 0.2s" }}>
                      <span style={{ fontSize: 20 }}>{m.icon}</span>
                      <span style={{ color: pt === v ? m.color : T.text, fontWeight: 600, fontSize: 13 }}>{m.label}</span>
                      {pt === v && <span style={{ marginLeft: "auto", color: m.color }}>✓</span>}
                    </div>
                  ))}
                </div>
              </div>
              <div onClick={() => setCampus(!campus)} style={{ padding: "12px 16px", borderRadius: 10, marginBottom: 14, border: `1px solid ${campus ? T.purple : T.border}`, background: campus ? "rgba(206,147,216,0.1)" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s" }}>
                <span style={{ fontSize: 22 }}>🎓</span>
                <div>
                  <div style={{ color: campus ? T.purple : T.text, fontWeight: 700, fontSize: 13 }}>Campus Energy Seller</div>
                  <div style={{ color: T.muted, fontSize: 11 }}>University/College as renewable energy producer</div>
                </div>
                <div style={{ marginLeft: "auto", width: 18, height: 18, borderRadius: "50%", border: `2px solid ${campus ? T.purple : T.border}`, background: campus ? T.purple : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {campus && <span style={{ color: "#000", fontSize: 10, fontWeight: 900 }}>✓</span>}
                </div>
              </div>
            </>}

            {role === "buyer" && <div style={{ marginBottom: 14 }}>
              <label style={{ color: T.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>Buyer Type</label>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                {Object.entries(BUYER_META).map(([v, m]) => (
                  <div key={v} onClick={() => setBt(v)} style={{ flex: 1, padding: "10px 6px", borderRadius: 10, textAlign: "center", border: `1px solid ${bt === v ? m.color : T.border}`, background: bt === v ? `${m.color}10` : "transparent", cursor: "pointer", transition: "all 0.2s" }}>
                    <div style={{ fontSize: 20 }}>{m.icon}</div>
                    <div style={{ color: bt === v ? m.color : T.muted, fontSize: 10, marginTop: 4, fontWeight: 600 }}>{m.label.split("/")[0].trim()}</div>
                  </div>
                ))}
              </div>
            </div>}
          </>}

          <Inp label="Email" value={email} onChange={setEmail} placeholder="you@example.com" />
          <Inp label="Password" value="" onChange={() => {}} type="password" placeholder="••••••••" />

          <div style={{ marginBottom: 18 }}>
            <Btn onClick={() => {
              if (mode === "login") { onLogin(DB.users.find(u => u.email === email) || DB.users[3]); }
              else { onLogin({ id: 99, name: name || "User", email, role, producer_type: pt, buyer_type: bt, location: loc, greenScore: 0, isCampus: role === "producer" && campus }); }
            }} full size="lg">{mode === "login" ? "Sign In →" : "Create Account →"}</Btn>
          </div>

          <div style={{ background: T.surface, borderRadius: 12, padding: "13px 15px" }}>
            <div style={{ color: T.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 9 }}>Quick Demo Access</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
              {DB.users.map(u => {
                const m = u.role === "producer" ? PRODUCER_META[u.producer_type] : BUYER_META[u.buyer_type];
                return (
                  <button key={u.id} onClick={() => onLogin(u)} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${T.border}`, background: "transparent", color: T.muted, fontSize: 11, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 5, fontFamily: "inherit" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = T.accent}
                    onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
                    <span>{m?.icon}</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name.split(" ").slice(0, 2).join(" ")}</span>
                    {u.isCampus && <span style={{ color: T.purple, fontSize: 8, fontWeight: 700, marginLeft: "auto" }}>CAM</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── NAVBAR ────────────────────────────────────────
function Navbar({ user, page, setPage, onLogout }) {
  const um = user.role === "producer" ? PRODUCER_META[user.producer_type] : BUYER_META[user.buyer_type];
  const navP = [["dashboard","📊","Dashboard"],["my_listings","⚡","My Listings"],["deal_requests","🤝","Deal Requests"],["analytics","📈","Analytics"],["roi","💰","ROI Estimator"]];
  const navB = [["dashboard","📊","Dashboard"],["marketplace","🔍","Marketplace"],["my_deals","🤝","My Deals"],["my_impact","🌱","My Impact"],["analytics","📈","Analytics"]];
  const nav = user.role === "producer" ? navP : navB;

  return (
    <nav style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "0 26px", display: "flex", alignItems: "center", height: 56, position: "sticky", top: 0, zIndex: 200 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginRight: 24 }}>
        <span style={{ fontSize: 20, filter: `drop-shadow(0 0 8px ${T.accentGS})` }}>⚡</span>
        <span style={{ color: T.accent, fontWeight: 900, fontSize: 19, letterSpacing: -1 }}>GreenGrid</span>
      </div>
      {nav.map(([id, ic, lb]) => (
        <button key={id} onClick={() => setPage(id)} style={{ padding: "0 14px", height: "100%", border: "none", borderBottom: `2px solid ${page === id ? T.accent : "transparent"}`, cursor: "pointer", background: "transparent", color: page === id ? T.accent : T.muted, fontWeight: page === id ? 700 : 400, fontSize: 13, transition: "all 0.18s", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 13 }}>{ic}</span>{lb}
        </button>
      ))}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
        {user.isCampus && <span style={{ background: "rgba(206,147,216,0.15)", color: T.purple, border: "1px solid rgba(206,147,216,0.3)", borderRadius: 20, padding: "3px 10px", fontSize: 10, fontWeight: 700 }}>🎓 CAMPUS SELLER</span>}
        <div style={{ textAlign: "right" }}>
          <div style={{ color: T.text, fontSize: 12, fontWeight: 600 }}>{user.name.split("—")[0].trim()}</div>
          <div style={{ color: T.muted, fontSize: 10 }}>{um?.icon} {um?.label}</div>
        </div>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${um?.color || T.accent}, ${T.accentDp})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontWeight: 900, fontSize: 13 }}>{user.name[0]}</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: T.accent, fontWeight: 800, fontSize: 15 }}>{user.greenScore}</div>
          <div style={{ color: T.muted, fontSize: 9, textTransform: "uppercase" }}>Green Score</div>
        </div>
        <Btn onClick={onLogout} variant="ghost" size="sm">Logout</Btn>
      </div>
    </nav>
  );
}

// ── DASHBOARD ─────────────────────────────────────
function DashboardPage({ user, transactions, listings, deals, setPage }) {
  const isP = user.role === "producer";
  const myL = listings.filter(l => l.producer_id === user.id);
  const myT = isP ? transactions.filter(t => myL.some(l => l.id === t.listing_id)) : transactions.filter(t => t.buyer_id === user.id);
  const myD = isP ? deals.filter(d => myL.some(l => l.id === d.listingId)) : deals.filter(d => d.buyerId === user.id);
  const pending = myD.filter(d => d.status === "pending");

  const totKwh = myT.reduce((s,t) => s + t.units_bought, 0);
  const totCO2 = myT.reduce((s,t) => s + t.carbon_saved, 0);
  const totRev = myT.reduce((s,t) => s + t.total_price, 0);
  const sl = scoreLabel(user.greenScore);

  const platKwh = transactions.reduce((s,t) => s + t.units_bought, 0);
  const platCO2 = transactions.reduce((s,t) => s + t.carbon_saved, 0);
  const avgPrice = (listings.reduce((s,l) => s + l.price_per_unit, 0) / listings.length).toFixed(2);
  const commScore = DB.users.reduce((s,u) => s + u.greenScore, 0);

  const kpis = isP
    ? [{icon:"⚡",l:"Energy Sold",v:totKwh,u:"kWh",c:T.accent},{icon:"💰",l:"Revenue",v:`₹${totRev.toLocaleString()}`,u:"INR",c:T.solar},{icon:"🌱",l:"CO₂ Saved",v:totCO2.toFixed(0),u:"kg CO₂",c:"#4ade80"},{icon:"📋",l:"Active Listings",v:myL.filter(l=>l.status==="active").length,u:"listings",c:T.wind}]
    : [{icon:"⚡",l:"Energy Purchased",v:totKwh,u:"kWh",c:T.accent},{icon:"🌍",l:"CO₂ Avoided",v:totCO2.toFixed(0),u:"kg CO₂",c:"#4ade80"},{icon:"💳",l:"Total Spent",v:`₹${totRev.toLocaleString()}`,u:"INR",c:T.solar},{icon:"🏆",l:"Green Score",v:user.greenScore,u:"pts",c:T.warn}];

  const scoreP = Math.min(user.greenScore / 1000, 1);
  const r = 44;
  const circ = 2 * Math.PI * r;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ color: T.text, fontSize: 24, fontWeight: 800, margin: "0 0 6px" }}>Welcome, {user.name.split(" ")[0]} 👋</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ color: T.muted, fontSize: 12 }}>{(isP ? PRODUCER_META[user.producer_type] : BUYER_META[user.buyer_type])?.icon} {(isP ? PRODUCER_META[user.producer_type] : BUYER_META[user.buyer_type])?.label}</span>
          {user.isCampus && <span style={{ background: "rgba(206,147,216,0.15)", color: T.purple, borderRadius: 20, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>🎓 Campus Seller</span>}
          <span style={{ color: T.muted }}>•</span>
          <span style={{ color: T.accent, fontSize: 12 }}>📍 {user.location}</span>
          <span style={{ color: T.muted }}>•</span>
          <span style={{ color: T.textD, fontSize: 12 }}>{sl.label}</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
        {kpis.map((k,i) => (
          <Card key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{k.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: k.c, fontFamily: "monospace" }}>{k.v}</div>
            <div style={{ color: T.muted, fontSize: 9, textTransform: "uppercase", letterSpacing: 1, margin: "4px 0" }}>{k.u}</div>
            <div style={{ color: T.textD, fontSize: 11 }}>{k.l}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        {/* Green Score Ring */}
        <Card glow>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ position: "relative", width: 100, height: 100, flexShrink: 0 }}>
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={r} fill="none" stroke={T.border} strokeWidth="9" />
                <circle cx="50" cy="50" r={r} fill="none" stroke={T.accent} strokeWidth="9"
                  strokeDasharray={circ} strokeDashoffset={circ * (1 - scoreP)} strokeLinecap="round"
                  style={{ transform: "rotate(-90deg)", transformOrigin: "50px 50px", filter: `drop-shadow(0 0 6px ${T.accentGS})` }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ color: T.accent, fontWeight: 900, fontSize: 20 }}>{user.greenScore}</div>
                <div style={{ color: T.muted, fontSize: 8, textTransform: "uppercase" }}>pts</div>
              </div>
            </div>
            <div>
              <div style={{ color: T.accent, fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{sl.label}</div>
              <span style={{ background: "#ce93d811", color: T.purple, border: "1px solid #ce93d833", borderRadius: 20, padding: "2px 9px", fontSize: 10, fontWeight: 700 }}>{sl.tier} Tier</span>
              <div style={{ color: T.muted, fontSize: 11, marginTop: 8 }}>{Math.max(0, 1000 - user.greenScore)} pts to Platinum</div>
              <div style={{ color: T.textD, fontSize: 11, marginTop: 4 }}>Every kWh traded = +1 Green Score 🏆</div>
            </div>
          </div>
        </Card>

        {/* Pending deals */}
        <Card>
          <div style={{ color: T.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
            {isP ? "⏳ Incoming Requests" : "📦 Active Deals"}
          </div>
          {pending.length > 0 ? pending.slice(0,3).map(d => (
            <div key={d.id} style={{ padding: "9px 12px", background: T.surface, borderRadius: 9, marginBottom: 7, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ color: T.text, fontSize: 12, fontWeight: 600 }}>{isP ? d.buyerName : d.producerName}</div>
                <div style={{ color: T.muted, fontSize: 10 }}>{ENERGY_META[d.energyType]?.icon} {d.units} kWh</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: T.solar, fontWeight: 700, fontSize: 12 }}>₹{d.totalPrice}</div>
                <StatusBadge status={d.status} />
              </div>
            </div>
          )) : (
            <div style={{ textAlign: "center", padding: "18px 0", color: T.muted }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>✓</div>
              <div style={{ fontSize: 12 }}>All caught up!</div>
            </div>
          )}
          {pending.length > 0 && <Btn onClick={() => setPage(isP ? "deal_requests" : "my_deals")} full variant="ghost" size="sm">View All →</Btn>}
        </Card>
      </div>

      {/* Platform KPIs — Judge's Report Card */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <div style={{ color: T.accent, fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>🌏 Platform Sustainability KPIs</div>
            <div style={{ color: T.muted, fontSize: 11, marginTop: 2 }}>Live impact report card for GreenGrid</div>
          </div>
          <span style={{ background: `${T.accent}18`, color: T.accent, border: `1px solid ${T.accent}44`, borderRadius: 20, padding: "3px 11px", fontSize: 10, fontWeight: 700 }}>LIVE</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, textAlign: "center" }}>
          {[
            {icon:"⚡",l:"Total Renewable Energy Traded",v:`${platKwh.toLocaleString()} kWh`,c:T.accent},
            {icon:"🌿",l:"CO₂ Emission Reduced",v:`${platCO2.toFixed(0)} kg`,c:"#4ade80"},
            {icon:"👨‍🌾",l:"Active Producers",v:DB.users.filter(u=>u.role==="producer").length,c:T.wind},
            {icon:"📊",l:"Avg Price / kWh",v:`₹${avgPrice}`,c:T.solar},
            {icon:"🏆",l:"Community Green Score",v:commScore.toLocaleString(),c:T.warn},
          ].map((m,i) => (
            <div key={i} style={{ padding: "12px 6px", background: T.surface, borderRadius: 11 }}>
              <div style={{ fontSize: 22, marginBottom: 5 }}>{m.icon}</div>
              <div style={{ color: m.c, fontWeight: 900, fontSize: 18, fontFamily: "monospace" }}>{m.v}</div>
              <div style={{ color: T.muted, fontSize: 9, marginTop: 5, lineHeight: 1.3 }}>{m.l}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, padding: "10px 14px", background: "#0a1a0e", borderRadius: 9, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: T.muted, fontSize: 11 }}>🧮 Carbon Formula: <code style={{ color: T.accent, background: "#0a2010", padding: "1px 7px", borderRadius: 4 }}>carbon_saved = units × {FOSSIL_FACTOR} kg/kWh</code></span>
          <span style={{ color: T.textD, fontSize: 11 }}>Renewable = 0 emissions • Fossil = {FOSSIL_FACTOR} kg CO₂/kWh</span>
        </div>
      </Card>
    </div>
  );
}

// ── MARKETPLACE (Buyer) ───────────────────────────
function MarketplacePage({ user, listings, onRequestPurchase }) {
  const [ft, setFt] = useState("all");
  const [fl, setFl] = useState("");
  const [mp, setMp] = useState(8);
  const [sort, setSort] = useState("location");
  const [modal, setModal] = useState(null);
  const [units, setUnits] = useState(50);

  const filtered = listings
    .filter(l => l.status === "active"
      && (ft === "all" || l.energy_type === ft)
      && (fl === "" || l.location.toLowerCase().includes(fl.toLowerCase()))
      && l.price_per_unit <= mp)
    .sort((a, b) => {
      if (sort === "location") { const aL = a.location.toLowerCase() === (user.location||"").toLowerCase() ? -1 : 1; const bL = b.location.toLowerCase() === (user.location||"").toLowerCase() ? -1 : 1; return aL - bL; }
      if (sort === "price") return a.price_per_unit - b.price_per_unit;
      return b.units_available - a.units_available;
    });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <h2 style={{ color: T.text, fontSize: 24, fontWeight: 800, margin: 0 }}>🔍 Energy Marketplace</h2>
          <p style={{ color: T.muted, fontSize: 12, margin: "5px 0 0" }}>📍 Listings near <strong style={{ color: T.accent }}>{user.location}</strong> shown first — location-based matching</p>
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {[["location","📍 Nearby"],["price","💰 Cheapest"],["units","⚡ Most kWh"]].map(([v,l]) => (
            <button key={v} onClick={() => setSort(v)} style={{ padding: "5px 11px", borderRadius: 8, border: `1px solid ${sort===v?T.accent:T.border}`, background: sort===v?T.accentG:"transparent", color: sort===v?T.accent:T.muted, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>{l}</button>
          ))}
        </div>
      </div>

      <Card style={{ marginBottom: 18, padding: 16 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div>
            <label style={{ color: T.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>Source Type</label>
            <div style={{ display: "flex", gap: 5, marginTop: 6 }}>
              {["all","solar","wind","biogas"].map(t => {
                const em = ENERGY_META[t];
                return <button key={t} onClick={() => setFt(t)} style={{ padding: "5px 12px", borderRadius: 8, border: `1px solid ${ft===t?(em?.color||T.accent):T.border}`, background: ft===t?`${em?.color||T.accent}14`:"transparent", color: ft===t?(em?.color||T.accent):T.muted, fontSize: 11, cursor: "pointer", fontWeight: ft===t?700:400, fontFamily: "inherit" }}>
                  {t === "all" ? "All" : `${em.icon} ${em.label}`}
                </button>;
              })}
            </div>
          </div>
          <div>
            <label style={{ color: T.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>City</label>
            <input value={fl} onChange={e => setFl(e.target.value)} placeholder="Filter city…"
              style={{ display: "block", marginTop: 6, padding: "6px 11px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 12, outline: "none", fontFamily: "inherit" }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ color: T.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>Max Price: ₹{mp}/kWh</label>
            <input type="range" min={3} max={8} step={0.1} value={mp} onChange={e => setMp(+e.target.value)}
              style={{ display: "block", marginTop: 9, width: "100%", accentColor: T.accent }} />
          </div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 13 }}>
        {filtered.map(l => {
          const prod = getUserById(l.producer_id);
          const isLocal = l.location.toLowerCase() === (user.location||"").toLowerCase();
          return (
            <Card key={l.id} onClick={() => { setModal(l); setUnits(Math.min(50, l.units_available)); }}>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
                <Chip type={l.energy_type} />
                {isLocal && <span style={{ background: `${T.accent}18`, color: T.accent, border: `1px solid ${T.accent}33`, borderRadius: 20, padding: "2px 8px", fontSize: 9, fontWeight: 700 }}>📍 Near You</span>}
                {prod?.isCampus && <span style={{ background: "rgba(206,147,216,0.12)", color: T.purple, border: "1px solid rgba(206,147,216,0.3)", borderRadius: 20, padding: "2px 8px", fontSize: 9, fontWeight: 700 }}>🎓 Campus</span>}
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: T.text, marginBottom: 2 }}>{prod?.name}</div>
              <div style={{ color: T.muted, fontSize: 11, marginBottom: 12 }}>
                {PRODUCER_META[prod?.producer_type]?.icon} {PRODUCER_META[prod?.producer_type]?.label} • 📍 {l.location}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <div><div style={{ color: T.muted, fontSize: 9, textTransform: "uppercase" }}>Available</div><div style={{ color: T.accent, fontWeight: 900, fontSize: 22, fontFamily: "monospace" }}>{l.units_available}<span style={{ fontSize: 11, color: T.muted }}> kWh</span></div></div>
                <div style={{ textAlign: "right" }}><div style={{ color: T.muted, fontSize: 9, textTransform: "uppercase" }}>Price</div><div style={{ color: T.solar, fontWeight: 900, fontSize: 22, fontFamily: "monospace" }}>₹{l.price_per_unit}<span style={{ fontSize: 11, color: T.muted }}>/kWh</span></div></div>
              </div>
              <div style={{ padding: "8px 11px", background: T.surface, borderRadius: 9, marginBottom: 10, fontSize: 11, color: T.muted }}>
                {l.energy_type === "solar" && `☀️ ${l.solar_capacity_kw} kW system • ${l.panel_count} panels`}
                {l.energy_type === "wind" && `🌬️ ${l.turbine_count} turbines • avg ${l.wind_speed_avg} m/s`}
                {l.energy_type === "biogas" && `🌿 ${l.feedstock_type} • ${l.plant_capacity_m3} m³ capacity`}
              </div>
              <div style={{ padding: "7px 11px", background: "#0a1a0e", borderRadius: 8, display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ color: T.muted, fontSize: 11 }}>🌱 Full CO₂ saving</span>
                <span style={{ color: "#4ade80", fontWeight: 700, fontSize: 11 }}>{calcCO2(l.units_available)} kg</span>
              </div>
              <Btn full>Request Purchase →</Btn>
              <div style={{ color: T.muted, fontSize: 9, textAlign: "center", marginTop: 7 }}>Valid until {l.validity}</div>
            </Card>
          );
        })}
      </div>

      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: T.card, border: `1px solid ${T.accent}`, borderRadius: 20, padding: 30, width: 470, boxShadow: `0 0 80px ${T.accentGS}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
              <div><h3 style={{ color: T.accent, margin: "0 0 3px", fontSize: 19 }}>⚡ Purchase Request</h3><div style={{ color: T.muted, fontSize: 12 }}>{getUserById(modal.producer_id)?.name}</div></div>
              <Chip type={modal.energy_type} />
            </div>
            <div style={{ marginBottom: 18, padding: "12px 14px", background: T.surface, borderRadius: 11 }}>
              <label style={{ color: T.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>Units: <strong style={{ color: T.accent }}>{units} kWh</strong></label>
              <input type="range" min={10} max={modal.units_available} step={10} value={units} onChange={e => setUnits(+e.target.value)} style={{ display: "block", marginTop: 8, width: "100%", accentColor: T.accent }} />
              <div style={{ display: "flex", justifyContent: "space-between", color: T.muted, fontSize: 9, marginTop: 3 }}><span>10 kWh</span><span>{modal.units_available} kWh</span></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9, marginBottom: 18 }}>
              {[{l:"Total Cost",v:`₹${(units*modal.price_per_unit).toFixed(0)}`,c:T.solar,i:"💰"},{l:"Energy",v:`${units} kWh`,c:T.accent,i:"⚡"},{l:"CO₂ Saved",v:`${calcCO2(units)} kg`,c:"#4ade80",i:"🌱"}].map((s,i) => (
                <div key={i} style={{ background: T.surface, borderRadius: 9, padding: "11px 7px", textAlign: "center" }}>
                  <div>{s.i}</div>
                  <div style={{ color: s.c, fontWeight: 900, fontSize: 16, fontFamily: "monospace", marginTop: 3 }}>{s.v}</div>
                  <div style={{ color: T.muted, fontSize: 9, marginTop: 3 }}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: "11px 14px", background: "#0a1a0e", borderRadius: 10, marginBottom: 16 }}>
              <div style={{ color: "#4ade80", fontSize: 12, fontWeight: 600, marginBottom: 5 }}>🌍 Environmental Impact</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 11, color: T.textD }}>
                <div>🌳 ≈ {Math.round(calcCO2(units)/21)} trees planted</div>
                <div>⛽ ≈ {(calcCO2(units)/2.3).toFixed(1)} kg petrol saved</div>
                <div>🏭 Fossil avoided: {calcCO2(units)} kg CO₂</div>
                <div>♻️ Green energy: 100%</div>
              </div>
            </div>
            <div style={{ padding: "7px 12px", background: T.surface, borderRadius: 7, marginBottom: 16, fontFamily: "monospace", fontSize: 10, color: T.muted }}>
              carbon_saved = {units} × {FOSSIL_FACTOR} = <strong style={{ color: T.accent }}>{calcCO2(units)} kg CO₂</strong>
            </div>
            <div style={{ display: "flex", gap: 9 }}>
              <Btn onClick={() => setModal(null)} variant="ghost" full>Cancel</Btn>
              <Btn onClick={() => { onRequestPurchase(modal, units); setModal(null); }} full size="lg">Confirm Request ✓</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MY LISTINGS (Producer) ────────────────────────
function MyListingsPage({ user, listings, setListings }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ energy_type: "solar", units_available: "", price_per_unit: "", location: user.location||"", validity: "", solar_capacity_kw: "", panel_count: "", turbine_count: "", wind_speed_avg: "", feedstock_type: "", plant_capacity_m3: "" });
  const myL = listings.filter(l => l.producer_id === user.id);
  const pm = PRODUCER_META[user.producer_type] || {};

  const add = () => {
    if (!form.units_available || !form.price_per_unit || !form.location || !form.validity) return;
    setListings([...listings, { id: listings.length+1, producer_id: user.id, status: "active", ...form, units_available: +form.units_available, price_per_unit: +form.price_per_unit, solar_capacity_kw: +form.solar_capacity_kw, panel_count: +form.panel_count, turbine_count: +form.turbine_count, wind_speed_avg: +form.wind_speed_avg, plant_capacity_m3: +form.plant_capacity_m3 }]);
    setShowForm(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <h2 style={{ color: T.text, fontSize: 24, fontWeight: 800, margin: 0 }}>⚡ My Energy Listings</h2>
          <p style={{ color: T.muted, fontSize: 12, margin: "5px 0 0" }}>{pm.icon} {pm.label}</p>
        </div>
        <Btn onClick={() => setShowForm(!showForm)}>{showForm ? "✕ Cancel" : "+ New Listing"}</Btn>
      </div>

      {showForm && (
        <Card style={{ marginBottom: 18, borderColor: T.accent, boxShadow: `0 0 28px ${T.accentG}` }}>
          <div style={{ color: T.accent, fontWeight: 700, fontSize: 14, marginBottom: 16 }}>📋 New Energy Listing</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <Inp label="Energy Source" value={form.energy_type} onChange={v => setForm({...form,energy_type:v})} options={[{v:"solar",l:"☀️ Solar"},{v:"wind",l:"🌬️ Wind"},{v:"biogas",l:"🌿 Biogas"}]} />
            <Inp label="Available Units (kWh)" type="number" value={form.units_available} onChange={v => setForm({...form,units_available:v})} placeholder="e.g. 500" />
            <Inp label="Price per kWh (₹)" type="number" value={form.price_per_unit} onChange={v => setForm({...form,price_per_unit:v})} placeholder="e.g. 4.5" />
            <Inp label="Location / City" value={form.location} onChange={v => setForm({...form,location:v})} placeholder="City name" />
            <Inp label="Valid Until" type="date" value={form.validity} onChange={v => setForm({...form,validity:v})} />
          </div>
          <div style={{ marginTop: 4, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
            <div style={{ color: T.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>{ENERGY_META[form.energy_type]?.icon} {form.energy_type.toUpperCase()} Specific Details</div>
            {form.energy_type === "solar" && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Inp label="Solar Capacity (kW)" type="number" value={form.solar_capacity_kw} onChange={v => setForm({...form,solar_capacity_kw:v})} placeholder="e.g. 20" />
              <Inp label="Number of Panels" type="number" value={form.panel_count} onChange={v => setForm({...form,panel_count:v})} placeholder="e.g. 80" />
            </div>}
            {form.energy_type === "wind" && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Inp label="Turbine Count" type="number" value={form.turbine_count} onChange={v => setForm({...form,turbine_count:v})} placeholder="e.g. 3" />
              <Inp label="Avg Wind Speed (m/s)" type="number" value={form.wind_speed_avg} onChange={v => setForm({...form,wind_speed_avg:v})} placeholder="e.g. 7.2" />
            </div>}
            {form.energy_type === "biogas" && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Inp label="Feedstock Type" value={form.feedstock_type} onChange={v => setForm({...form,feedstock_type:v})} placeholder="e.g. Agricultural waste" />
              <Inp label="Plant Capacity (m³)" type="number" value={form.plant_capacity_m3} onChange={v => setForm({...form,plant_capacity_m3:v})} placeholder="e.g. 50" />
            </div>}
          </div>
          <div style={{ marginTop: 16 }}><Btn onClick={add} size="lg">Publish Listing →</Btn></div>
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: 13 }}>
        {myL.map(l => (
          <Card key={l.id}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 11 }}><Chip type={l.energy_type} /><StatusBadge status={l.status} /></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div><div style={{ color: T.muted, fontSize: 9, textTransform: "uppercase" }}>Units</div><div style={{ color: T.accent, fontWeight: 900, fontSize: 24, fontFamily: "monospace" }}>{l.units_available}<span style={{ fontSize: 11 }}> kWh</span></div></div>
              <div style={{ textAlign: "right" }}><div style={{ color: T.muted, fontSize: 9, textTransform: "uppercase" }}>Price</div><div style={{ color: T.solar, fontWeight: 900, fontSize: 24, fontFamily: "monospace" }}>₹{l.price_per_unit}<span style={{ fontSize: 11 }}>/kWh</span></div></div>
            </div>
            <div style={{ fontSize: 11, color: T.muted, marginBottom: 9 }}>
              {l.energy_type === "solar" && `☀️ ${l.solar_capacity_kw}kW • ${l.panel_count} panels`}
              {l.energy_type === "wind" && `🌬️ ${l.turbine_count} turbines • ${l.wind_speed_avg} m/s`}
              {l.energy_type === "biogas" && `🌿 ${l.feedstock_type} • ${l.plant_capacity_m3}m³`}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.muted, marginBottom: 10 }}><span>📍 {l.location}</span><span>📅 {l.validity}</span></div>
            <div style={{ padding: "7px 11px", background: "#0a1a0e", borderRadius: 8, display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: T.muted, fontSize: 11 }}>🌱 Max CO₂ impact</span>
              <span style={{ color: "#4ade80", fontWeight: 700, fontSize: 11 }}>{calcCO2(l.units_available)} kg</span>
            </div>
          </Card>
        ))}
        {myL.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60, color: T.muted }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>⚡</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>No listings yet</div>
            <div style={{ fontSize: 12, marginTop: 5 }}>Click "+ New Listing" to start selling energy</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── DEALS (both roles) ────────────────────────────
function DealsPage({ user, deals, onUpdateDeal, listings }) {
  const isP = user.role === "producer";
  const myLIds = listings.filter(l => l.producer_id === user.id).map(l => l.id);
  const myDeals = isP ? deals.filter(d => myLIds.includes(d.listingId)) : deals.filter(d => d.buyerId === user.id);
  const [flt, setFlt] = useState("all");
  const shown = flt === "all" ? myDeals : myDeals.filter(d => d.status === flt);

  return (
    <div>
      <h2 style={{ color: T.text, fontSize: 24, fontWeight: 800, margin: "0 0 5px" }}>🤝 {isP ? "Incoming Deal Requests" : "My Deal Requests"}</h2>
      <p style={{ color: T.muted, fontSize: 12, margin: "0 0 18px" }}>{isP ? "Accept or reject buyer purchase requests" : "Track your energy purchase status"}</p>
      <div style={{ display: "flex", gap: 5, marginBottom: 16 }}>
        {["all","pending","accepted","rejected"].map(f => (
          <button key={f} onClick={() => setFlt(f)} style={{ padding: "5px 13px", borderRadius: 8, border: `1px solid ${flt===f?T.accent:T.border}`, background: flt===f?T.accentG:"transparent", color: flt===f?T.accent:T.muted, fontSize: 11, cursor: "pointer", textTransform: "capitalize", fontFamily: "inherit" }}>
            {f === "all" ? "All" : f} ({(f==="all"?myDeals:myDeals.filter(d=>d.status===f)).length})
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {shown.map(d => {
          const listing = getListingById(d.listingId, listings);
          const counterparty = isP ? getUserById(d.buyerId) : getUserById(d.producerId);
          return (
            <Card key={d.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 13, flexShrink: 0, background: d.status==="pending"?`${T.warn}18`:d.status==="accepted"?T.accentG:`${T.danger}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                  {d.status==="pending"?"⏳":d.status==="accepted"?"✅":"❌"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                    <span style={{ color: T.text, fontWeight: 700, fontSize: 14 }}>{isP ? `From: ${d.buyerName}` : d.producerName}</span>
                    {counterparty && <span style={{ color: T.muted, fontSize: 10 }}>• {isP ? BUYER_META[counterparty.buyer_type]?.icon : PRODUCER_META[counterparty.producer_type]?.icon} {isP ? BUYER_META[counterparty.buyer_type]?.label : PRODUCER_META[counterparty.producer_type]?.label}</span>}
                  </div>
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                    {listing && <Chip type={listing.energy_type} size="sm" />}
                    <span style={{ color: T.muted, fontSize: 11 }}>⚡ {d.units} kWh</span>
                    <span style={{ color: T.solar, fontSize: 11, fontWeight: 700 }}>₹{d.totalPrice}</span>
                    <span style={{ color: "#4ade80", fontSize: 11 }}>🌱 {calcCO2(d.units)} kg CO₂</span>
                    {d.location && <span style={{ color: T.muted, fontSize: 11 }}>📍 {d.location}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 7, flexShrink: 0, alignItems: "center" }}>
                  <StatusBadge status={d.status} />
                  {isP && d.status === "pending" && <>
                    <Btn onClick={() => onUpdateDeal(d.id,"accepted")} size="sm">Accept ✓</Btn>
                    <Btn onClick={() => onUpdateDeal(d.id,"rejected")} variant="danger" size="sm">Reject</Btn>
                  </>}
                </div>
              </div>
            </Card>
          );
        })}
        {shown.length === 0 && <div style={{ textAlign: "center", padding: 60, color: T.muted }}><div style={{ fontSize: 36, marginBottom: 10 }}>🤝</div><div style={{ fontSize: 15 }}>No {flt === "all" ? "" : flt} deals</div></div>}
      </div>
    </div>
  );
}

// ── MY IMPACT (Buyer) ─────────────────────────────
function ImpactPage({ user, transactions }) {
  const myT = transactions.filter(t => t.buyer_id === user.id);
  const totCO2 = myT.reduce((s,t) => s + t.carbon_saved, 0);
  const totKwh = myT.reduce((s,t) => s + t.units_bought, 0);
  const sl = scoreLabel(user.greenScore);
  const scoreP = Math.min(user.greenScore/1000, 1);
  const r = 50, circ = 2 * Math.PI * r;

  return (
    <div>
      <h2 style={{ color: T.text, fontSize: 24, fontWeight: 800, margin: "0 0 5px" }}>🌍 My Environmental Impact</h2>
      <p style={{ color: T.muted, fontSize: 12, margin: "0 0 22px" }}>Your personal sustainability footprint tracker</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
        {[{icon:"🌿",l:"CO₂ Avoided",v:`${totCO2.toFixed(1)} kg`,c:"#4ade80"},{icon:"⚡",l:"Clean Energy Used",v:`${totKwh} kWh`,c:T.accent},{icon:"🌳",l:"Trees Equivalent",v:`${Math.round(totCO2/21)}`,c:T.biogas},{icon:"⛽",l:"Petrol Saved",v:`${(totCO2/2.3).toFixed(1)} kg`,c:T.warn}].map((m,i) => (
          <Card key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{m.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: m.c, fontFamily: "monospace" }}>{m.v}</div>
            <div style={{ color: T.textD, fontSize: 12, marginTop: 6 }}>{m.l}</div>
          </Card>
        ))}
      </div>

      <Card style={{ marginBottom: 14, borderColor: T.accent, boxShadow: `0 0 28px ${T.accentG}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r={r} fill="none" stroke={T.border} strokeWidth="10" />
              <circle cx="60" cy="60" r={r} fill="none" stroke={T.accent} strokeWidth="10"
                strokeDasharray={circ} strokeDashoffset={circ*(1-scoreP)} strokeLinecap="round"
                style={{ transform: "rotate(-90deg)", transformOrigin: "60px 60px", filter: `drop-shadow(0 0 8px ${T.accentGS})` }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ color: T.accent, fontWeight: 900, fontSize: 22 }}>{user.greenScore}</div>
              <div style={{ color: T.muted, fontSize: 8, textTransform: "uppercase" }}>pts</div>
            </div>
          </div>
          <div>
            <div style={{ color: T.text, fontWeight: 800, fontSize: 20, marginBottom: 5 }}>{sl.label}</div>
            <span style={{ background: "#ce93d811", color: T.purple, border: "1px solid #ce93d833", borderRadius: 20, padding: "2px 9px", fontSize: 10, fontWeight: 700 }}>{sl.tier} Tier</span>
            <div style={{ background: T.surface, borderRadius: 8, height: 7, overflow: "hidden", marginTop: 12, marginBottom: 6 }}>
              <div style={{ width: `${scoreP*100}%`, height: "100%", background: `linear-gradient(90deg, ${T.accentDp}, ${T.accent})`, borderRadius: 8 }} />
            </div>
            <div style={{ color: T.muted, fontSize: 11 }}>{user.greenScore} / 1000 pts • {Math.max(0,1000-user.greenScore)} to Platinum</div>
            <div style={{ color: T.textD, fontSize: 11, marginTop: 6 }}>🏆 Gamification: +1 Green Score per kWh purchased</div>
          </div>
        </div>
      </Card>

      <Card>
        <div style={{ color: T.accent, fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>🧮 Carbon Reduction Formula</div>
        <div style={{ background: "#050e07", borderRadius: 11, padding: 18, fontFamily: "monospace", marginBottom: 14 }}>
          <div style={{ color: T.muted, fontSize: 10, marginBottom: 6 }}># GreenGrid Carbon Calculation Logic</div>
          <div style={{ color: T.textD, fontSize: 12 }}>FOSSIL_FACTOR = <span style={{ color: T.solar }}>{FOSSIL_FACTOR}</span> kg CO₂/kWh</div>
          <div style={{ color: T.textD, fontSize: 12 }}>RENEWABLE_EMISSION = <span style={{ color: T.accent }}>0</span> kg CO₂/kWh</div>
          <div style={{ color: "#4ade80", fontSize: 13, fontWeight: 700, marginTop: 10 }}>
            carbon_saved = {totKwh} × {FOSSIL_FACTOR} = <strong>{totCO2.toFixed(2)} kg CO₂ avoided</strong>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          <div style={{ flex: 1, padding: "11px", background: `${T.danger}10`, border: `1px solid ${T.danger}30`, borderRadius: 9, textAlign: "center" }}>
            <div style={{ color: T.danger, fontWeight: 700, fontSize: 15 }}>{(totKwh*FOSSIL_FACTOR).toFixed(1)} kg</div>
            <div style={{ color: T.muted, fontSize: 10, marginTop: 3 }}>🏭 Fossil CO₂ (avoided)</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", color: T.accent, fontSize: 18 }}>→</div>
          <div style={{ flex: 1, padding: "11px", background: T.accentG, border: `1px solid ${T.accent}44`, borderRadius: 9, textAlign: "center" }}>
            <div style={{ color: T.accent, fontWeight: 700, fontSize: 15 }}>0 kg</div>
            <div style={{ color: T.muted, fontSize: 10, marginTop: 3 }}>🌿 Renewable CO₂ (actual)</div>
          </div>
        </div>
        <div style={{ color: T.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Transaction History (ID → Listing → CO₂)</div>
        {myT.map(t => {
          const listing = getListingById(t.listing_id, DB.energy_listings);
          return (
            <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 12px", background: T.surface, borderRadius: 9, marginBottom: 7 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <span style={{ color: T.muted, fontSize: 10, fontFamily: "monospace" }}>TXN#{t.id}</span>
                {listing && <Chip type={listing.energy_type} size="sm" />}
                <span style={{ color: T.muted, fontSize: 11 }}>{t.date}</span>
              </div>
              <div style={{ display: "flex", gap: 13, fontSize: 11 }}>
                <span style={{ color: T.accent }}>{t.units_bought} kWh</span>
                <span style={{ color: "#4ade80" }}>🌱 {t.carbon_saved} kg</span>
                <span style={{ color: T.solar }}>₹{t.total_price}</span>
                <StatusBadge status={t.status} />
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

// ── ANALYTICS ─────────────────────────────────────
function AnalyticsPage({ transactions, listings }) {
  const totKwh = transactions.reduce((s,t) => s + t.units_bought, 0);
  const totCO2 = transactions.reduce((s,t) => s + t.carbon_saved, 0);
  const totRev = transactions.reduce((s,t) => s + t.total_price, 0);

  const topProducers = DB.users.filter(u => u.role === "producer").map(u => {
    const uL = listings.filter(l => l.producer_id === u.id);
    const uT = transactions.filter(t => uL.some(l => l.id === t.listing_id));
    return { ...u, sold: uT.reduce((s,t) => s+t.units_bought,0), co2: uT.reduce((s,t) => s+t.carbon_saved,0), rev: uT.reduce((s,t) => s+t.total_price,0) };
  }).sort((a,b) => b.sold - a.sold);

  const byType = { solar:0, wind:0, biogas:0 };
  transactions.forEach(t => { const l = listings.find(l => l.id === t.listing_id); if(l) byType[l.energy_type] = (byType[l.energy_type]||0) + t.units_bought; });
  const totByType = Object.values(byType).reduce((s,v) => s+v, 0);

  const months = ["Oct'24","Nov'24","Dec'24","Jan'25","Feb'25"];
  const priceTrend = [3.6,3.9,4.0,4.2,4.22];
  const maxPT = Math.max(...priceTrend);

  return (
    <div>
      <h2 style={{ color: T.text, fontSize: 24, fontWeight: 800, margin: "0 0 5px" }}>📊 Analytics Dashboard</h2>
      <p style={{ color: T.muted, fontSize: 12, margin: "0 0 22px" }}>Platform-wide energy trading insights</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
        {[{icon:"⚡",l:"Total Energy Traded",v:`${totKwh.toLocaleString()} kWh`,c:T.accent},{icon:"🌱",l:"Total CO₂ Reduction",v:`${totCO2.toFixed(0)} kg`,c:"#4ade80"},{icon:"💰",l:"Total Revenue",v:`₹${totRev.toLocaleString()}`,c:T.solar},{icon:"📋",l:"Active Listings",v:listings.filter(l=>l.status==="active").length,c:T.wind}].map((m,i) => (
          <Card key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{m.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: m.c, fontFamily: "monospace" }}>{m.v}</div>
            <div style={{ color: T.textD, fontSize: 11, marginTop: 6 }}>{m.l}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        {/* Top Producers */}
        <Card>
          <div style={{ color: T.accent, fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>🏆 Top Producers</div>
          {topProducers.map((p, i) => {
            const pm = PRODUCER_META[p.producer_type];
            const bw = topProducers[0].sold > 0 ? (p.sold / topProducers[0].sold) * 100 : 0;
            return (
              <div key={p.id} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontWeight: 900, fontSize: 14 }}>{i===0?"🥇":i===1?"🥈":"🥉"}</span>
                    <div>
                      <div style={{ color: T.text, fontSize: 12, fontWeight: 600 }}>{p.name}</div>
                      <div style={{ color: T.muted, fontSize: 10 }}>{pm?.icon} {pm?.label}{p.isCampus?" 🎓":""}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: T.accent, fontWeight: 700, fontSize: 12 }}>{p.sold} kWh</div>
                    <div style={{ color: T.muted, fontSize: 10 }}>🌱 {p.co2.toFixed(0)} kg CO₂</div>
                  </div>
                </div>
                <div style={{ background: T.border, borderRadius: 4, height: 5, overflow: "hidden" }}>
                  <div style={{ width: `${bw}%`, height: "100%", background: `linear-gradient(90deg, ${T.accentDp}, ${T.accent})`, borderRadius: 4 }} />
                </div>
              </div>
            );
          })}
        </Card>

        {/* Energy Mix */}
        <Card>
          <div style={{ color: T.accent, fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>🌿 Energy Source Mix</div>
          {Object.entries(byType).map(([type, units]) => {
            const pct = totByType > 0 ? ((units/totByType)*100).toFixed(1) : 0;
            const em = ENERGY_META[type];
            return (
              <div key={type} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ color: T.text, fontSize: 12, fontWeight: 600 }}>{em.icon} {em.label}</span>
                  <div><span style={{ color: em.color, fontWeight: 700, fontSize: 12 }}>{pct}%</span><span style={{ color: T.muted, fontSize: 10, marginLeft: 5 }}>{units} kWh</span></div>
                </div>
                <div style={{ background: T.border, borderRadius: 4, height: 7, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: em.color, borderRadius: 4 }} />
                </div>
              </div>
            );
          })}
          {/* Renewable vs Non-Renewable */}
          <div style={{ marginTop: 16, padding: "13px", background: T.surface, borderRadius: 11 }}>
            <div style={{ color: T.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 9 }}>Renewable vs Non-Renewable (City Avg)</div>
            <div style={{ display: "flex", borderRadius: 7, overflow: "hidden", height: 22 }}>
              <div style={{ width: "78%", background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#000" }}>78% 🌿</div>
              <div style={{ flex: 1, background: T.danger, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>22% 🏭</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, fontSize: 10, color: T.muted }}><span>Renewable</span><span>Fossil</span></div>
          </div>
        </Card>
      </div>

      {/* Price Trend */}
      <Card>
        <div style={{ color: T.accent, fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 1, marginBottom: 18 }}>📈 Average Price Trend (₹/kWh)</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 110 }}>
          {months.map((m, i) => {
            const h = (priceTrend[i] / maxPT) * 100;
            const isLast = i === months.length - 1;
            return (
              <div key={m} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ color: isLast ? T.accent : T.solar, fontSize: 10, fontWeight: 700, marginBottom: 3 }}>₹{priceTrend[i]}</div>
                <div style={{ height: `${h}%`, minHeight: 8, borderRadius: "5px 5px 0 0", background: isLast ? `linear-gradient(to top, ${T.accentDp}, ${T.accent})` : `linear-gradient(to top, ${T.solar}50, ${T.solar}99)`, boxShadow: isLast ? `0 0 10px ${T.accentG}` : "none" }} />
                <div style={{ color: T.muted, fontSize: 10, marginTop: 5 }}>{m}</div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 10, color: T.muted, fontSize: 11, textAlign: "center" }}>📊 Price risen 17.2% over 5 months — renewable demand growing</div>
      </Card>
    </div>
  );
}

// ── ROI ESTIMATOR ─────────────────────────────────
function ROIPage() {
  const [cap, setCap] = useState(10);
  const [cost, setCost] = useState(500000);
  const [price, setPrice] = useState(4.5);
  const [sun, setSun] = useState(5);

  const daily = cap * sun;
  const monthly = daily * 30;
  const yearly = monthly * 12;
  const yearlyRev = yearly * price;
  const payback = (cost / yearlyRev).toFixed(1);
  const roi5 = (((yearlyRev * 5 - cost) / cost) * 100).toFixed(0);
  const co25yr = calcCO2(yearly * 5);

  return (
    <div>
      <h2 style={{ color: T.text, fontSize: 24, fontWeight: 800, margin: "0 0 5px" }}>💰 ROI Estimator</h2>
      <p style={{ color: T.muted, fontSize: 12, margin: "0 0 22px" }}>Business tool for solar energy producers — enter your setup, get projections</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div>
          <Card style={{ marginBottom: 13 }}>
            <div style={{ color: T.accent, fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>⚙️ Producer Inputs</div>
            {[
              { l: `Solar Capacity: ${cap} kW`, min: 1, max: 100, v: cap, onChange: setCap },
              { l: `Installation Cost: ₹${cost.toLocaleString()}`, min: 50000, max: 5000000, step: 25000, v: cost, onChange: setCost },
              { l: `Selling Price: ₹${price}/kWh`, min: 2, max: 8, step: 0.1, v: price, onChange: setPrice },
              { l: `Peak Sun Hours/Day: ${sun} hrs`, min: 3, max: 8, step: 0.5, v: sun, onChange: setSun },
            ].map((r, i) => (
              <div key={i} style={{ marginBottom: 18 }}>
                <label style={{ color: T.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>{r.l}</label>
                <input type="range" min={r.min} max={r.max} step={r.step||1} value={r.v} onChange={e => r.onChange(+e.target.value)} style={{ display: "block", marginTop: 9, width: "100%", accentColor: T.accent }} />
              </div>
            ))}
          </Card>
          <Card style={{ background: T.accentG, borderColor: T.accent }}>
            <div style={{ color: T.accent, fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>🌱 5-Year CO₂ Benefit</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#4ade80", fontWeight: 900, fontSize: 30, fontFamily: "monospace" }}>{co25yr.toLocaleString()} kg</div>
              <div style={{ color: T.muted, fontSize: 12, marginTop: 3 }}>CO₂ Avoided in 5 Years</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14, fontSize: 11, color: T.textD }}>
                <div style={{ background: "#0a1a0e", borderRadius: 8, padding: 9 }}>🌳 {Math.round(+co25yr/21).toLocaleString()} trees</div>
                <div style={{ background: "#0a1a0e", borderRadius: 8, padding: 9 }}>⛽ {(+co25yr/2.3).toFixed(0)} kg petrol</div>
              </div>
            </div>
          </Card>
        </div>
        <div>
          <Card style={{ marginBottom: 13, borderColor: T.accent, boxShadow: `0 0 28px ${T.accentG}` }}>
            <div style={{ color: T.accent, fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 1, marginBottom: 18 }}>📊 System Output</div>
            {[
              {l:"Daily Generation",v:`${daily.toFixed(0)} kWh`,c:T.textD},
              {l:"Monthly Generation",v:`${monthly.toFixed(0)} kWh`,c:T.textD},
              {l:"Yearly Generation",v:`${yearly.toFixed(0)} kWh`,c:T.accent},
              {l:"Monthly Revenue",v:`₹${(yearlyRev/12).toFixed(0)}`,c:T.solar},
              {l:"Yearly Revenue",v:`₹${yearlyRev.toFixed(0)}`,c:T.solar},
              {l:"⏱ Payback Period",v:`${payback} yrs`,c:+payback<=5?"#4ade80":T.warn,big:true},
              {l:"📈 5-Year ROI",v:`${roi5}%`,c:+roi5>=0?"#4ade80":T.danger,big:true},
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 6 ? `1px solid ${T.border}` : "none" }}>
                <span style={{ color: T.muted, fontSize: 12 }}>{r.l}</span>
                <span style={{ color: r.c, fontWeight: 900, fontSize: r.big ? 22 : 17, fontFamily: "monospace" }}>{r.v}</span>
              </div>
            ))}
          </Card>
          <Card>
            <div style={{ color: T.accent, fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>📈 5-Year Revenue vs Investment</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 95 }}>
              {[1,2,3,4,5].map(yr => {
                const cum = yearlyRev * yr;
                const profit = cum - cost;
                const h = (cum / (yearlyRev * 5)) * 100;
                const isP = profit >= 0;
                return (
                  <div key={yr} style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ color: isP ? "#4ade80" : T.warn, fontSize: 9, fontWeight: 700, marginBottom: 2 }}>{profit>=0?"+":""}₹{(profit/1000).toFixed(0)}k</div>
                    <div style={{ height: `${h}%`, minHeight: 8, borderRadius: "4px 4px 0 0", background: isP ? `linear-gradient(to top, ${T.accentDp}, ${T.accent})` : `linear-gradient(to top, #b45309, ${T.warn})` }} />
                    <div style={{ color: T.muted, fontSize: 9, marginTop: 4 }}>Yr {yr}</div>
                  </div>
                );
              })}
            </div>
            {+payback <= 5 && <div style={{ marginTop: 12, padding: "9px 13px", background: T.accentG, borderRadius: 8, color: T.accent, fontSize: 11, fontWeight: 600 }}>✅ Investment recovered in Year {Math.ceil(+payback)} — Great opportunity!</div>}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── APP ROOT ──────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [listings, setListings] = useState(DB.energy_listings);
  const [transactions, setTransactions] = useState(DB.transactions);
  const [toast, setToast] = useState(null);
  const [deals, setDeals] = useState([
    { id:1, listingId:1, producerId:1, producerName:"IIT Delhi Solar Rooftop", buyerId:4, buyerName:"Green Hostel — Mumbai", units:100, totalPrice:420, energyType:"solar", location:"Delhi", status:"pending" },
    { id:2, listingId:2, producerId:2, producerName:"Rajasthan Wind Energy Ltd", buyerId:5, buyerName:"TechCorp Solutions", units:200, totalPrice:760, energyType:"wind", location:"Jaipur", status:"accepted" },
    { id:3, listingId:6, producerId:7, producerName:"BITS Pilani Campus", buyerId:6, buyerName:"Symbiosis University", units:300, totalPrice:1170, energyType:"solar", location:"Pilani", status:"pending" },
  ]);

  const onRequestPurchase = (listing, units) => {
    const prod = getUserById(listing.producer_id);
    setDeals(d => [...d, { id:d.length+1, listingId:listing.id, producerId:listing.producer_id, producerName:prod?.name||"Producer", buyerId:user.id, buyerName:user.name, units, totalPrice:+(units*listing.price_per_unit).toFixed(0), energyType:listing.energy_type, location:listing.location, status:"pending" }]);
    setToast(`✅ Request sent! 🌱 ${calcCO2(units)} kg CO₂ will be saved if accepted.`);
  };

  const onUpdateDeal = (dealId, status) => {
    setDeals(d => d.map(x => x.id === dealId ? { ...x, status } : x));
    if (status === "accepted") {
      const deal = deals.find(d => d.id === dealId);
      if (deal) {
        setTransactions(t => [...t, { id:t.length+1, listing_id:deal.listingId, buyer_id:deal.buyerId, units_bought:deal.units, total_price:deal.totalPrice, carbon_saved:calcCO2(deal.units), date:new Date().toISOString().slice(0,10), status:"completed" }]);
        setToast(`✅ Deal accepted! 🌱 ${calcCO2(deal.units)} kg CO₂ saved!`);
      }
    } else setToast("Deal rejected.");
  };

  if (!user) return <AuthPage onLogin={u => { setUser(u); setPage("dashboard"); }} />;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Segoe UI', system-ui, sans-serif", color: T.text }}>
      <style>{`* { box-sizing: border-box; } input[type="range"] { height:4px; cursor:pointer; } select option { background:${T.surface}; } @keyframes slideUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } } ::-webkit-scrollbar{width:5px;} ::-webkit-scrollbar-track{background:${T.bg};} ::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px;}`}</style>
      <Navbar user={user} page={page} setPage={setPage} onLogout={() => { setUser(null); setPage("dashboard"); }} />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "26px 22px" }}>
        {page === "dashboard" && <DashboardPage user={user} transactions={transactions} listings={listings} deals={deals} setPage={setPage} />}
        {page === "marketplace" && user.role === "buyer" && <MarketplacePage user={user} listings={listings} onRequestPurchase={onRequestPurchase} />}
        {page === "my_listings" && user.role === "producer" && <MyListingsPage user={user} listings={listings} setListings={setListings} />}
        {page === "deal_requests" && user.role === "producer" && <DealsPage user={user} deals={deals} onUpdateDeal={onUpdateDeal} listings={listings} />}
        {page === "my_deals" && user.role === "buyer" && <DealsPage user={user} deals={deals} onUpdateDeal={onUpdateDeal} listings={listings} />}
        {page === "my_impact" && user.role === "buyer" && <ImpactPage user={user} transactions={transactions} />}
        {page === "analytics" && <AnalyticsPage transactions={transactions} listings={listings} />}
        {page === "roi" && user.role === "producer" && <ROIPage />}
      </div>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
