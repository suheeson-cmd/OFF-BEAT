// assets/js/utils.js
export const $  = (sel, root=document) => root.querySelector(sel);
export const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

export async function fetchJSON(url){
  const res = await fetch(url, { cache: "no-store" });
  if(!res.ok) throw new Error(`Fetch failed: ${url} (${res.status})`);
  return res.json();
}

// Date → "2025.03.15 (토) 19:30"
export function formatDateK(iso){
  const d = new Date(iso);
  const date = d.toLocaleDateString("ko-KR", { year:"numeric", month:"2-digit", day:"2-digit", weekday:"short" })
                .replaceAll(". ", ".").replace(".", ".");
  const time = d.toLocaleTimeString("ko-KR", { hour:"2-digit", minute:"2-digit", hour12:false });
  return `${date} ${time}`;
}

// ---- ICS ----
function toUTCBasic(dt){
  const d = new Date(dt);
  return new Date(d.getTime() - d.getTimezoneOffset()*60000)
    .toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z");
}
export function buildICS({ title="", desc="", location="", start, end }){
  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//OFF-BEAT//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
UID:${Date.now()}@off-beat
DTSTAMP:${toUTCBasic(new Date().toISOString())}
DTSTART:${toUTCBasic(start)}
DTEND:${toUTCBasic(end || start)}
SUMMARY:${title}
DESCRIPTION:${desc.replace(/\n/g,"\\n")}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`.replace(/\n/g, "\r\n");
  return new Blob([ics], { type: "text/calendar;charset=utf-8" });
}
export function downloadBlob(blob, filename){
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click();
  URL.revokeObjectURL(url); a.remove();
}

// ---- Tiny markdown (bold/italic/link/list/linebreak) ----
export function renderMarkdown(md=""){
  let html = md.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
             .replace(/\*(.+?)\*/g, "<em>$1</em>")
             .replace(/\[(.+?)\]\((https?:\/\/.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
             .replace(/^- (.+)$/gm, "<li>$1</li>")
             .replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>")
             .replace(/\n{2,}/g, "</p><p>")
             .replace(/\n/g, "<br>");
  return `<p>${html}</p>`;
}

// ---- search helpers ----
export function norm(s=""){ return s.toLowerCase().normalize("NFC").replace(/\s+/g," ").trim(); }
export function matches(q, ...fields){
  const n = norm(q); if(!n) return true;
  return fields.some(f => norm(String(f ?? "")).includes(n));
}