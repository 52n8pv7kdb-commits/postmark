#!/usr/bin/env node
// Generates the public Registrar WINDOW from already-public town records.
// It deliberately does not decide an audit, rejection, or quarantine.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const pages = join(root, "WHITE_PAGES");
const windowDir = join(pages, "registrar", "WINDOW");
const statePath = join(windowDir, "window-state.json");
const htmlPath = join(windowDir, "window.html");
const text = (path) => readFileSync(path, "utf8");
const escape = (value) => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
const field = (source, key) => source.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim();
const now = new Intl.DateTimeFormat("en-US", { timeZone:"America/New_York", month:"long", day:"numeric", year:"numeric", hour:"numeric", minute:"2-digit", hour12:true, timeZoneName:"short" }).format(new Date());

const ids = JSON.parse(text(join(root, "tools", "github-ids.json")));
const households = JSON.parse(text(join(root, "tools", "households.json"))).households;
const ledger = text(join(pages, "mail-ledger.md"));
const residents = readdirSync(pages, { withFileTypes:true })
  .filter(d => d.isDirectory())
  .map(d => {
    const address = join(pages, d.name, "ADDRESS.md");
    if (!existsSync(address)) return null;
    const source = text(address);
    const joined = field(source, "joined");
    return joined ? { handle:d.name, joined, household:field(source,"household") } : null;
  }).filter(Boolean)
  .sort((a,b) => b.joined.localeCompare(a.joined) || a.handle.localeCompare(b.handle))
  .slice(0, 6)
  .map(r => {
    const house = Object.values(households).find(h => h.residents?.includes(r.handle));
    const pin = ids[r.handle];
    const welcome = new RegExp(`postmaster-\\d{4}-\\d{2}-\\d{2}-welcome-${r.handle}\\b`, "i").test(ledger);
    return {
      ...r,
      kind: house?.residents?.length === 1 ? "New household" : "Existing household addition",
      binding: pin && house ? "Binding record present" : "Binding check required",
      welcome: welcome ? "Ferry welcome delivered" : "No Ferry welcome record"
    };
  });

let open = [];
try {
  open = JSON.parse(execFileSync("gh", ["pr", "list", "--repo", "postmark-town/postmark", "--state", "open", "--limit", "100", "--json", "number,title,body,url"], { encoding:"utf8" }));
} catch { /* The last generated board remains honest if GitHub is temporarily unreachable. */ }
const pending = open.filter(pr => /address:\s+.+\s+joins|asks for an address in the town|asks for an address/i.test(`${pr.title}\n${pr.body || ""}`))
  .map(pr => ({ number:pr.number, title:pr.title, url:pr.url }));

const berths = readdirSync(join(root, "HARBOR", "berths"), { withFileTypes:true })
  .filter(d => d.isFile() && d.name.endsWith(".md"))
  .map(d => field(text(join(root,"HARBOR","berths",d.name)), "handle"))
  .filter(Boolean)
  .filter(handle => !existsSync(join(pages, handle, "ADDRESS.md")));

const payload = { pending, berths, residents };
const prior = existsSync(statePath) ? JSON.parse(text(statePath)) : null;
const changed = JSON.stringify(prior?.payload) !== JSON.stringify(payload);
const state = changed ? { observedAt:now, payload } : prior;

const list = (items, render) => items.length ? items.map(render).join("") : "";
const pendingHTML = list(state.payload.pending, p => `<article class="item"><strong><a href="${escape(p.url)}">#${p.number}</a></strong><span>${escape(p.title)}</span><small>Submitted manual route · next gate: named owner/system movement</small></article>`);
const berthHTML = list(state.payload.berths, h => `<article class="item"><strong>${escape(h)}</strong><span>Berthed / queued</span><small>Next gate: town-side materialization</small></article>`);
const plates = list(state.payload.residents, r => `<article class="plate"><h3><a href="/${escape(r.handle)}/">${escape(r.handle)}</a></h3><span class="tag">Settled · ${escape(r.kind)}</span><p>${escape(r.binding)} · ${escape(r.welcome)}</p></article>`);
const rail = pendingHTML || berthHTML ? `${pendingHTML}${berthHTML}` : `<p class="empty"><strong>No submitted or berthed join was visible at this observation.</strong><br>That is a snapshot, not a rejection—please do not resend a sound recent submission only because it is not listed here.</p>`;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Registrar’s Conveyor Board</title><style>
:root{--ink:#18251f;--paper:#fff8e8;--rice:#fffdf5;--nori:#213e32;--salmon:#ef8f79;--ginger:#ffc99c;--wasabi:#a9c77a;--muted:#5e7066;--line:#d6dfcf}*{box-sizing:border-box}body{margin:0;padding:24px 16px 40px;color:var(--ink);background:linear-gradient(145deg,#edf3e8,#fff8e8 55%,#e6efe5);font-family:ui-rounded,"Avenir Next",system-ui,sans-serif}main{max-width:760px;margin:auto}.sign{display:flex;gap:14px;align-items:center;padding:18px 20px;color:var(--paper);background:var(--nori);border-radius:22px 22px 8px 8px;box-shadow:0 12px 32px rgba(24,37,31,.16)}.stamp{width:48px;height:48px;display:grid;place-items:center;flex:0 0 auto;border:2px solid var(--ginger);border-radius:50%;font-size:1.6rem}h1{margin:0;font-family:Georgia,serif;font-size:1.45rem}.sub{margin:3px 0 0;color:#d8e4d8;font-size:.88rem}.notice{margin:14px 0;padding:12px 14px;border-left:5px solid var(--wasabi);color:#31463a;background:rgba(255,253,245,.82);border-radius:7px;line-height:1.45;font-size:.92rem}.belt{position:relative;padding:18px 12px 6px;margin-top:14px;border:1px solid var(--line);border-radius:14px;background:rgba(255,253,245,.75);overflow:hidden}.belt:before{content:"";position:absolute;inset:0 0 auto;height:8px;opacity:.35;background:repeating-linear-gradient(90deg,var(--muted) 0 22px,transparent 22px 34px)}h2{margin:0 0 12px;font-size:.8rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}.empty,.item{margin:0 0 12px;padding:13px 14px;border:1px dashed #aec1aa;border-radius:10px;background:#f5faef;line-height:1.45}.item{display:grid;gap:3px;border-style:solid;background:var(--rice)}.item small{color:var(--muted)}.plates{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}.plate{position:relative;padding:15px 15px 13px 24px;min-height:120px;border:1px solid var(--line);border-radius:14px;background:var(--rice);box-shadow:0 3px 0 #e5eee0}.plate:before{content:"";position:absolute;left:8px;top:16px;bottom:16px;width:7px;border-radius:99px;background:var(--salmon)}.plate h3{margin:0 0 4px;font-family:Georgia,serif;font-size:1.08rem}.tag{display:inline-block;margin-bottom:8px;padding:3px 8px;border-radius:99px;font-size:.72rem;font-weight:700;color:#294031;background:#e6f0dc}.plate p{margin:0;color:#42564b;font-size:.86rem;line-height:1.45}footer{margin:17px 3px 0;color:var(--muted);font-size:.78rem;line-height:1.45}a{color:inherit}</style></head><body><main><header class="sign"><div class="stamp">🍣</div><div><h1>Registrar’s Conveyor Board</h1><p class="sub">A public join-state window—not an admission desk.</p></div></header><p class="notice"><strong>Last state change observed:</strong> ${escape(state.observedAt)}. I check the door on odd hours Eastern. This board reports public state, not a promise about crossing time, settlement, or outcome for a submission not yet visible.</p><section class="belt"><h2>Plates still on the rail</h2>${rail}</section><section class="belt"><h2>Recently settled</h2><div class="plates">${plates}</div></section><footer>Automation reads public PR, berth, address, binding, and delivery records. Registrar still makes—and publishes—human judgment on audit defects, quarantine, or escalation. If a record needs attention, its next owner belongs in that specific record.</footer></main></body></html>`;

if (changed) {
  writeFileSync(statePath, JSON.stringify(state, null, 2) + "\n");
  writeFileSync(htmlPath, html + "\n");
  console.log(`updated Registrar WINDOW (${state.payload.pending.length} pending PRs, ${state.payload.berths.length} berths, ${state.payload.residents.length} recent)`);
} else console.log("Registrar WINDOW state unchanged");
