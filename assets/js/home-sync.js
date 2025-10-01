// assets/js/home-sync.js
import { $, fetchJSON, formatDateK, buildICS, downloadBlob } from "./utils.js";

// ANNOUNCEMENT
(async ()=>{
  try{
    const ann = await fetchJSON("data/events.json");
    const upcoming = ann.filter(x=>x.status==="upcoming")
                        .sort((a,b)=> new Date(a.datetime) - new Date(b.datetime));
    const pick = upcoming[0] || ann.find(x=>x.featured) || ann[0];
    if(!pick) return;

    const el = document.getElementById("announcement"); if(!el) return;

    el.querySelector(".ann-title").textContent = pick.title;
    el.querySelector(".ann-meta").innerHTML = `
      <span class="badge">${formatDateK(pick.datetime)}</span>
      <span class="badge">${pick.venue ?? ""}</span>
      <span class="pill">${pick.price ? `₩${pick.price.toLocaleString()}` : "Free"}</span>`;
    el.querySelector(".ann-card p").textContent = (pick.desc_md||"").split("\n")[0] || "";
    el.style.setProperty("--ann-bg", pick.hero ? `url('${pick.hero}')` : "none");

    const ul = el.querySelector(".ann-list");
    ul.innerHTML = (pick.lineup||[]).map(x=>`<li><span>${x.label}</span><span>${x.time}</span></li>`).join("");

    const [reserve, more] = el.querySelectorAll(".ann-actions a.ann-btn");
    if(reserve) reserve.href = pick.tickets_url || "#";
    if(more)    more.href    = `announcement/?id=${encodeURIComponent(pick.id)}`;

    const icsBtn = document.getElementById("icsBtn");
    if(icsBtn){
      icsBtn.onclick = ()=>{
        const blob = buildICS({ title: pick.title, desc: pick.desc_md, location: pick.venue, start: pick.datetime, end: pick.end });
        downloadBlob(blob, `${pick.title.replace(/\s+/g,"_")}.ics`);
      };
    }
  }catch(e){ console.warn("[home-sync] announcement:", e); }
})();

// COLLECTIONS (featured 상위 4)
(async ()=>{
  try{
    const cols = (await fetchJSON("data/collections.json")).filter(x=>x.featured);
    const rail = document.getElementById("rail"); if(!rail) return;
    rail.innerHTML = cols.slice(0,4).map(c=>`
      <article class="tile" onclick="location.href='collections/?id=${encodeURIComponent(c.id)}'">
        <img src="${c.cover}" alt="${c.title}"><h3>${c.title}</h3>
      </article>`).join("");
  }catch(e){ console.warn("[home-sync] collections:", e); }
})();

// WORKS (홈은 퀵룩 + 모달)
(async ()=>{
  try{
    const works = (await fetchJSON("data/works.json")).filter(w=>w.featured).slice(0,12);
    const arch = document.getElementById("archive"); if(!arch) return;
    arch.innerHTML = works.map(w=>{
      const first = (w.media||[])[0] || {};
      const typ = first.type || "image";
      const media = first.src || w.cover;
      return `
        <a class="item quicklook" href="works/?id=${encodeURIComponent(w.id)}"
           data-type="${typ}" data-media="${media}"
           data-title="${w.title}" data-desc="${w.desc||""}">
          <div class="thumb"><img src="${w.cover}" alt="${w.title}"></div>
          <div class="meta"><h3 class="title">${w.title}</h3><p class="dek">${w.desc||""} · ${w.year||""}</p></div>
        </a>`;
    }).join("");
  }catch(e){ console.warn("[home-sync] works:", e); }
})();