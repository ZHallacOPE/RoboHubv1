"use client";

import { useMemo, useState } from "react";
import ShopModal from "./ShopModal";

type TileKey = "shop" | "support" | "res" | "com" | "winter";

const LINKS = {
  contact: "https://www.opebuffalo.com/contactus",
  service: "https://www.opebuffalo.com/servicereq",
  bookDemo:
    "https://www.opebuffalo.com/contactus?subject=Robotic%20Mower%20Demo%20Request",
  requestInstall:
    "https://www.opebuffalo.com/contactus?subject=Robotic%20Mower%20Install%20Quote%20Request",
  winterStorage:
    "https://www.opebuffalo.com/contactus?subject=Winter%20Storage%20Request",
};

const DESIRED_COLLECTION_TITLES = [
  "Residential Robotic Mowers",
  "Commercial Robotic Mowers",
  "Parts & Blades",
  "Installation / Services",
  "Winter Storage",
];

type Tile = {
  key: TileKey;
  title: string;
  badge: string;
  desc: string;
  keywords: string;
  accent: "purple" | "cyan" | "green" | "amber";
};

const tiles: Tile[] = [
  {
    key: "shop",
    title: "Shop",
    badge: "Buy • Parts • Deposits",
    desc: "Shop mowers, parts & blades, installation deposits, and winter storage deposits (powered by OPEShield).",
    keywords:
      "shop buy purchase opeshield store parts blades winter storage deposit installation services",
    accent: "purple",
  },
  {
    key: "support",
    title: "Service & Support",
    badge: "Help • Repairs • Install",
    desc: "Troubleshooting, repairs, installations, blade swaps, firmware updates, and seasonal tune-ups.",
    keywords:
      "service support repair install blades firmware rtk troubleshooting warranty",
    accent: "cyan",
  },
  {
    key: "res",
    title: "Residential Sales",
    badge: "Homeowner • Setup • Financing",
    desc: "Find the right mower for your yard, schedule a demo, and get a clean install with ongoing care options.",
    keywords: "residential homeowner demo install quote navimow rtk yard",
    accent: "purple",
  },
  {
    key: "com",
    title: "Commercial Sales",
    badge: "HOA • Facilities • Fleet",
    desc: "Fleet planning, site assessment, multi-zone layouts, and uptime-focused support for properties in WNY.",
    keywords:
      "commercial hoa facilities fleet multi zone uptime contracts assessment",
    accent: "green",
  },
  {
    key: "winter",
    title: "Winter Storage",
    badge: "Storage • Service • Ready for Spring",
    desc: "Indoor storage, inspection, firmware updates, blade replacement, and spring-ready scheduling.",
    keywords:
      "winter storage indoor spring reactivation service cleaning blades pickup delivery",
    accent: "amber",
  },
];

export default function Hub() {
  const [q, setQ] = useState("");
  const [shopOpen, setShopOpen] = useState(false);
  const [shopDefaultCollectionTitle, setShopDefaultCollectionTitle] =
    useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return tiles;
    return tiles.filter((t) => {
      const hay = `${t.title} ${t.desc} ${t.keywords}`.toLowerCase();
      return hay.includes(query);
    });
  }, [q]);

  const openShop = (collectionTitle?: string) => {
    setShopDefaultCollectionTitle(collectionTitle ?? null);
    setShopOpen(true);
  };

  return (
    <div className="rmh">
      <style>{css}</style>

      <div className="top">
        <div className="brand">
          <div className="logoMark" aria-hidden="true" />
          <div>
            <h1>Robotic Mower Hub</h1>
            <div className="sub">
              A modern hub for new &amp; existing customers to buy, service,
              store, and support robotic mowers.
            </div>
          </div>
        </div>

        <div className="actions">
          <a className="pill" href="tel:716-383-3680">
            <span>Call</span>
            <small>716-383-3680</small>
          </a>
          <a className="pill" href={LINKS.contact}>
            <span>Contact</span>
            <small>Send a message</small>
          </a>
          <a className="pill" href={LINKS.service}>
            <span>Service</span>
            <small>Request / Schedule</small>
          </a>
        </div>
      </div>

      <div className="bar">
        <div className="searchWrap" role="search">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
              stroke="white"
              strokeWidth="2"
            />
            <path
              d="M16.5 16.5 21 21"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="search"
            placeholder="Search the Hub: shop, install, demo, RTK, blades, winter storage, fleet…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search the Hub"
          />
        </div>

        <div className="quick">
          <button className="chip purple" onClick={() => openShop()}>
            <span className="dot" aria-hidden="true" /> Shop
          </button>
          <a className="chip" href={LINKS.bookDemo}>
            <span className="dot" aria-hidden="true" /> Book a Demo
          </a>
          <a className="chip green" href={LINKS.requestInstall}>
            <span className="dot" aria-hidden="true" /> Request Install Quote
          </a>
          <a className="chip amber" href={LINKS.winterStorage}>
            <span className="dot" aria-hidden="true" /> Winter Storage
          </a>
          <a className="chip red" href={LINKS.service}>
            <span className="dot" aria-hidden="true" /> Need Service Now
          </a>
        </div>
      </div>

      <div className="hint">
        {q.trim()
          ? `Showing ${filtered.length} section(s) for “${q}”.`
          : "Tip: Start typing to filter tiles (example: “shop”, “winter”, “service”, “commercial”, “rtk”, “demo”)."}
      </div>

      <div className="grid" role="navigation" aria-label="Hub tiles">
        {filtered.map((t) => (
          <button
            key={t.key}
            className={`card ${t.accent}`}
            type="button"
            onClick={() => {
              if (t.key === "shop") return openShop();
              if (t.key === "res") return openShop("Residential Robotic Mowers");
              if (t.key === "com") return openShop("Commercial Robotic Mowers");
              if (t.key === "winter") return openShop("Winter Storage");
              window.location.href = LINKS.service;
            }}
            aria-label={t.title}
          >
            <div className="row">
              <span className="badge">{t.badge}</span>
              <div className="icon" aria-hidden="true">
                <span />
              </div>
            </div>
            <div className="title">{t.title}</div>
            <p className="desc">{t.desc}</p>
          </button>
        ))}
      </div>

      <ShopModal
        open={shopOpen}
        onClose={() => setShopOpen(false)}
        desiredCollectionTitles={DESIRED_COLLECTION_TITLES}
        defaultCollectionTitle={shopDefaultCollectionTitle}
      />
    </div>
  );
}

const css = `
.rmh{
  --bg:#0b1020;
  --panel:rgba(255,255,255,.06);
  --stroke:rgba(255,255,255,.12);
  --text:rgba(255,255,255,.92);
  --muted:rgba(255,255,255,.70);
  --muted2:rgba(255,255,255,.55);
  --shadow:0 18px 55px rgba(0,0,0,.45);
  --shadow2:0 10px 30px rgba(0,0,0,.35);
  --radius:24px;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
  color: var(--text);
  background:
    radial-gradient(900px 450px at 18% 10%, rgba(124,58,237,.26), transparent 55%),
    radial-gradient(800px 420px at 80% 18%, rgba(6,182,212,.22), transparent 55%),
    radial-gradient(700px 380px at 55% 90%, rgba(34,197,94,.14), transparent 60%),
    linear-gradient(180deg, #070a14, var(--bg));
  border: 1px solid rgba(255,255,255,.06);
  border-radius: var(--radius);
  padding: 22px;
  box-shadow: var(--shadow);
  max-width: 1100px;
  margin: 18px auto;
}
.top{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:10px 8px 14px;flex-wrap:wrap}
.brand{display:flex;gap:12px;align-items:center;min-width:280px}
.logoMark{
  width:46px;height:46px;border-radius:14px;
  background: linear-gradient(135deg, rgba(124,58,237,.9), rgba(6,182,212,.85));
  box-shadow: 0 14px 40px rgba(124,58,237,.18);
  position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.14)
}
.logoMark:after{
  content:"";position:absolute;inset:-60%;
  background: radial-gradient(circle at 30% 30%, rgba(255,255,255,.35), transparent 55%);
  transform: rotate(25deg);
}
h1{margin:0;font-size:20px;letter-spacing:.2px;line-height:1.2}
.sub{margin-top:4px;color:var(--muted);font-size:13px;line-height:1.3}
.actions{display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end}
.pill{
  display:flex;gap:10px;align-items:center;
  padding:10px 12px;border-radius:999px;
  background: rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12);
  color: var(--text); text-decoration:none; font-size:13px;
  box-shadow: var(--shadow2); transition: transform .18s ease, background .18s ease, border-color .18s ease;
  user-select:none
}
.pill:hover{transform:translateY(-1px);background:rgba(255,255,255,.085);border-color:rgba(255,255,255,.18)}
.pill small{color:var(--muted2);font-size:12px;display:block;margin-top:1px}

.bar{display:flex;gap:12px;align-items:center;justify-content:space-between;margin:6px 8px 14px;flex-wrap:wrap}
.searchWrap{
  flex:1 1 360px; display:flex; gap:10px; align-items:center;
  padding:10px 12px;border-radius:999px;
  background: rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12);
  box-shadow: var(--shadow2)
}
.searchWrap svg{width:18px;height:18px;opacity:.85}
.searchWrap input{
  width:100%;border:none;outline:none;background:transparent;color:var(--text);font-size:13px
}
.searchWrap input::placeholder{color:rgba(255,255,255,.55)}
.quick{flex:1 1 420px;display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end}
.chip{
  display:inline-flex;align-items:center;gap:8px;
  padding:9px 12px;border-radius:999px;
  border:1px solid rgba(255,255,255,.12);
  background: rgba(0,0,0,.14);
  text-decoration:none;font-size:12.5px;color:var(--text);
  transition: transform .18s ease, background .18s ease, border-color .18s ease;
  user-select:none;white-space:nowrap;cursor:pointer
}
.chip:hover{transform:translateY(-1px);background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.20)}
.dot{width:9px;height:9px;border-radius:99px;background:rgba(6,182,212,.95);box-shadow:0 0 0 3px rgba(6,182,212,.15)}
.chip.green .dot{background:rgba(34,197,94,.95);box-shadow:0 0 0 3px rgba(34,197,94,.15)}
.chip.amber .dot{background:rgba(245,158,11,.95);box-shadow:0 0 0 3px rgba(245,158,11,.15)}
.chip.purple .dot{background:rgba(124,58,237,.95);box-shadow:0 0 0 3px rgba(124,58,237,.15)}
.chip.red .dot{background:rgba(239,68,68,.95);box-shadow:0 0 0 3px rgba(239,68,68,.15)}

.hint{margin:12px 8px 0;color:rgba(255,255,255,.55);font-size:12px}

.grid{display:grid;grid-template-columns:repeat(12,1fr);gap:16px;margin-top:14px}
.card{
  grid-column: span 6;
  background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.05));
  border:1px solid rgba(255,255,255,.12);
  border-radius:24px;
  padding:16px;
  box-shadow: var(--shadow2);
  cursor:pointer;
  text-align:left;
  transition: transform .22s ease, border-color .22s ease, background .22s ease;
  color: var(--text);
}
.card:hover{transform:translateY(-2px);border-color:rgba(255,255,255,.20);background: linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.06))}
.row{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}
.badge{
  display:inline-flex;gap:8px;align-items:center;
  padding:6px 10px;border-radius:999px;
  background: rgba(0,0,0,.18);
  border:1px solid rgba(255,255,255,.12);
  font-size:12px;color:rgba(255,255,255,.72)
}
.icon{
  width:44px;height:44px;border-radius:16px;
  display:grid;place-items:center;
  border:1px solid rgba(255,255,255,.14);
  box-shadow:0 16px 40px rgba(0,0,0,.28);
  overflow:hidden;
  position:relative;
}
.icon span{
  width:28px;height:28px;border-radius:14px;
  background: radial-gradient(circle at 30% 30%, rgba(255,255,255,.25), transparent 60%);
  border:1px solid rgba(255,255,255,.12);
}
.card.purple .icon{background:linear-gradient(135deg, rgba(124,58,237,.85), rgba(6,182,212,.45))}
.card.cyan .icon{background:linear-gradient(135deg, rgba(6,182,212,.85), rgba(124,58,237,.45))}
.card.green .icon{background:linear-gradient(135deg, rgba(34,197,94,.85), rgba(6,182,212,.40))}
.card.amber .icon{background:linear-gradient(135deg, rgba(245,158,11,.88), rgba(124,58,237,.38))}
.title{margin:12px 0 6px;font-size:16px;letter-spacing:.2px}
.desc{margin:0;color:rgba(255,255,255,.72);font-size:13px;line-height:1.45;max-width:520px}
@media(max-width:980px){
  .card{grid-column:span 12}
  .quick{justify-content:flex-start}
  .actions{justify-content:flex-start}
}
`;
