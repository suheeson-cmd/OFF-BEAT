// assets/js/announcement.js
import { $, $$, fetchJSON, formatDateK, buildICS, downloadBlob, renderMarkdown, matches } from "./utils.js";

// Footer year
const y = $("#y"); if(y) y.textContent = new Date().getFullYear();

const params  = new URLSearchParams(location.search);
const idParam = params.get("id");

const listEl   = $("#list")   || ( ()=>{ const d=document.createElement("div"); d.id="list";   $("main .section")?.appendChild(d); return d; })();
const detailEl = $("#detail") || ( ()=>{ const d=document.createElement("article"); d.id="detail"; d.hidden=true; $("main .section")?.appendChild(d); return d; })();

let data = [];
try{
  data = await fetchJSON("../data/events.json");
  data.sort((a,b)=> new Date(a.datetime) - new Date(b.datetime));
}catch(e){
  listEl.innerHTML = `<p style="color:#900">이벤트 데이터를 불러오지 못했습니다.</p>`;
  throw e;
}

function evCard(ev){
  const price = ev.price ? `₩${ev.price.toLocaleString()}` : "Free";
  return `
    <div class="ann-card staff-bg" style="margin-bottom:14px">
      <div>
        <h3 class="ann-title">${ev.title}</h3>
        <div class="ann-meta" style="margin-top:6px">
          <span class="badge">${formatDateK(ev.datetime)}</span>
          <span class="badge">${ev.venue||""}</span>
          <span class="pill">${price}</span>
        </div>
        <p style="margin:12px 0 0;color:#333;max-width:60ch">${(ev.desc_md||"").split("\n")[0]||""}</p>
        <div class="ann-actions">
          ${ev.tickets_url?`<a class="ann-btn" href="${ev.tickets_url}" target="_blank" rel="noopener">예매하기</a>`:""}
          ${ev.more_url?`<a class="ann-btn ghost" href="${ev.more_url}" target="_blank" rel="noopener">자세히 보기</a>`:""}
          <button class="ann-btn ghost" data-ics="${ev.id}">캘린더(.ics)</button>
          <a class="ann-btn ghost" href="?id=${encodeURIComponent(ev.id)}">상세보기</a>
        </div>
      </div>
      <div>
        <ul class="ann-list" aria-label="라인업">
          ${(ev.lineup||[]).map(x=>`<li><span>${x.label}</span><span>${x.time}</span></li>`).join("")}
        </ul>
      </div>
    </div>`;
}

function renderList(q=""){
  const upcoming = data.filter(x=>x.status==="upcoming");
  const past     = data.filter(x=>x.status!=="upcoming").reverse();

  function block(title, arr){
    const filtered = arr.filter(x=>matches(q, x.title, x.venue, (x.tags||[]).join(" "), x.desc_md));
    if(!filtered.length) return "";
    return `<h3 class="label" style="margin-top:18px">${title}</h3>` + filtered.map(evCard).join("");
  }
  listEl.hidden = false; detailEl.hidden = true;
  listEl.innerHTML = block("UPCOMING", upcoming) + block("PAST", past);

  listEl.querySelectorAll("[data-ics]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const ev = data.find(x=>x.id===btn.dataset.ics); if(!ev) return;
      const blob = buildICS({ title: ev.title, desc: ev.desc_md, location: ev.venue, start: ev.datetime, end: ev.end });
      downloadBlob(blob, `${ev.title.replace(/\s+/g,"_")}.ics`);
    });
  });
}

function renderDetail(ev){
  listEl.hidden = true; detailEl.hidden = false;
  detailEl.innerHTML = `
    <div class="ann-card staff-bg">
      <div>
        <h1 class="ann-title" style="font-size:28px;line-height:1.2">${ev.title}</h1>
        <div class="ann-meta" style="margin-top:8px">
          <span class="badge">${formatDateK(ev.datetime)}</span>
          <span class="badge">${ev.venue||""}</span>
          <span class="pill">${ev.price?`₩${ev.price.toLocaleString()}`:"Free"}</span>
        </div>
        <div class="ann-actions">
          ${ev.tickets_url?`<a class="ann-btn" href="${ev.tickets_url}" target="_blank" rel="noopener">예매하기</a>`:""}
          <button class="ann-btn ghost" id="icsDl">캘린더(.ics)</button>
          <a class="ann-btn ghost" href="/announcement/">목록으로</a>
        </div>
        <div style="margin-top:14px">${renderMarkdown(ev.desc_md||"")}</div>
      </div>
      <div>
      ${ev.trailer?`
          <video class="modal-media" controls playsinline preload="metadata" style="width:100%;max-height:50vh">
            <source src="../${ev.trailer}" type="video/mp4">
          </video>`:
          ev.poster?`<img src="../${ev.poster}" alt="${ev.title}" style="width:100%">`:''
        }
        // 목록으로 버튼
        <a class="ann-btn ghost" href="./">목록으로</a>
        <ul class="ann-list" style="margin-top:10px">
          ${(ev.lineup||[]).map(x=>`<li><span>${x.label}</span><span>${x.time}</span></li>`).join("")}
        </ul>
      </div>
    </div>`;
  $("#icsDl")?.addEventListener("click", ()=>{
    const blob = buildICS({ title: ev.title, desc: ev.desc_md, location: ev.venue, start: ev.datetime, end: ev.end });
    downloadBlob(blob, `${ev.title.replace(/\s+/g,"_")}.ics`);
  });
}

// 검색 UI(있으면 연결)
$("#q")?.addEventListener("input", e=>renderList(e.target.value));
$("#clear")?.addEventListener("click", ()=>{ const q=$("#q"); if(q) q.value=""; renderList(""); });

// 최초 진입
if(idParam){
  const ev = data.find(x=>x.id===idParam);
  if(ev) renderDetail(ev); else renderList("");
}else{
  renderList("");
}