// assets/js/collections.js
import { $, $$, fetchJSON, matches } from "./utils.js";

const y = $("#y"); if(y) y.textContent = new Date().getFullYear();
const grid = $("#grid") || ( ()=>{ const d=document.createElement("div"); d.id="grid"; d.className="columns"; $("main .section")?.appendChild(d); return d; })();

let data = [];
try{ data = await fetchJSON("../data/collections.json"); }
catch(e){ grid.innerHTML = `<p style="color:#900">컬렉션 데이터를 불러오지 못했습니다.</p>`; throw e; }

function card(c){
  return `
    <a class="item" href="#" data-id="${c.id}">
      <div class="thumb"><img src="/${c.cover}" alt="${c.title}"></div>
      <div class="meta">
        <h3 class="title">${c.title}</h3>
        <p class="dek">${c.summary||""}</p>
      </div>
    </a>`;
}
function render(q=""){
  grid.innerHTML = data
    .filter(c => matches(q, c.title, c.summary, (c.tags||[]).join(" ")))
    .map(card).join("");

  $$("#grid .item").forEach(el=>{
    el.addEventListener("click", e=>{
      e.preventDefault();
      const c = data.find(x=>x.id===el.dataset.id); if(!c) return;
      const first = (c.images||[])[0];

      // 간단 라이트박스(페이지에 모달 마크업가 있음을 가정)
      $("#lbTitle").textContent = c.title;
      $("#lbImg").src = first?.src ? `/${first.src}` : "";
      $("#lbImg").alt = first?.alt || c.title;
      $("#lbCap").textContent = c.summary || "";
      $("#lb").classList.add("open");
    });
  });
}
render();

$("#q")?.addEventListener("input", e=>render(e.target.value));
$("#clear")?.addEventListener("click", ()=>{ const q=$("#q"); if(q) q.value=""; render(""); });

$("#lbClose")?.addEventListener("click", ()=>$("#lb").classList.remove("open"));
$("#lb")?.addEventListener("click", e=>{ if(e.target.id==="lb") $("#lb").classList.remove("open"); });
document.addEventListener("keydown", e=>{ if(e.key==="Escape") $("#lb")?.classList.remove("open"); });