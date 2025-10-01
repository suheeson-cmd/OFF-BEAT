// assets/js/works.js
import { $, $$, fetchJSON, matches } from "./utils.js";

const y = $("#y"); if(y) y.textContent = new Date().getFullYear();
const grid = $("#grid") || ( ()=>{ const d=document.createElement("div"); d.id="grid"; d.className="columns"; $("main .section")?.appendChild(d); return d; })();
const params  = new URLSearchParams(location.search);
const idParam = params.get("id");

let data = [];
try{ data = await fetchJSON("../data/works.json"); }
catch(e){ grid.innerHTML = `<p style="color:#900">작업 데이터를 불러오지 못했습니다.</p>`; throw e; }

// 연도 드롭다운 채우기
const years = [...new Set(data.map(x=>x.year).filter(Boolean))].sort((a,b)=>b-a);
const yearSel = $("#year");
if(yearSel){ years.forEach(y=>{ const o=document.createElement("option"); o.value=o.textContent=y; yearSel.appendChild(o); }); }

function card(w){
  return `
    <a class="item" href="#" data-id="${w.id}">
      <div class="thumb ${w.type==='video'?'thumb-video':''}">
        <img src="/${w.cover}" alt="${w.title}">
      </div>
      <div class="meta">
        <h3 class="title">${w.title}</h3>
        <p class="dek">${w.desc||""} · ${w.year||""}</p>
      </div>
    </a>`;
}
function render(){
  const q = $("#q")?.value || "";
  const t = $("#type")?.value || "";
  const y = $("#year")?.value || "";

  const filtered = data.filter(w =>
    matches(q, w.title, w.desc, (w.tags||[]).join(" "), (w.roles||[]).join(" ")) &&
    (!t || w.type===t) && (!y || String(w.year)===y)
  );
  grid.innerHTML = filtered.map(card).join("");

  $$("#grid .item").forEach(el=>{
    el.addEventListener("click", e=>{
      e.preventDefault();
      const w = data.find(x=>x.id===el.dataset.id); if(!w) return;

      $("#modalTitle").textContent = w.title;
      $("#modalDesc").textContent  = w.desc || "";

      const v = $("#modalVideo"); const i = $("#modalImg");
      v.hidden = i.hidden = true; v.pause();

      const first = (w.media||[])[0];
      if(first?.type==="video"){ v.src = `/${first.src}`; v.hidden=false; v.currentTime=0; v.play().catch(()=>{}); }
      else { i.src = first?.src?`/${first.src}`:""; i.alt = w.title; i.hidden=false; }

      $("#modal").classList.add("open");
      history.replaceState(null, "", `?id=${encodeURIComponent(w.id)}`); // 딥링크 유지
    });
  });
}
render();

// 필터 이벤트
$("#q")?.addEventListener("input", render);
$("#type")?.addEventListener("change", render);
$("#year")?.addEventListener("change", render);
$("#clear")?.addEventListener("click", ()=>{ if($("#q")) $("#q").value=""; if($("#type")) $("#type").value=""; if($("#year")) $("#year").value=""; render(); });

// 모달 닫기
$("#modalClose")?.addEventListener("click", ()=>$("#modal").classList.remove("open"));
$("#modal")?.addEventListener("click", e=>{ if(e.target.id==="modal") $("#modal").classList.remove("open"); });
document.addEventListener("keydown", e=>{ if(e.key==="Escape") $("#modal")?.classList.remove("open"); });

// URL로 직접 진입 (?id=...)
if(idParam){
  const w = data.find(x=>x.id===idParam);
  if(w){
    // 첫 렌더 후 자동 오픈
    setTimeout(()=>{
      const el = $(`#grid .item[data-id="${CSS.escape(w.id)}"]`);
      el?.dispatchEvent(new Event("click"));
    }, 0);
  }
}