const clamp=(n)=>Math.max(0,Math.min(1,n));const p=document.getElementById("progress"),hero=document.getElementById("heroScene"),intro=document.querySelector(".art-intro-scene"),collector=document.querySelector(".collector-scene");document.getElementById("year").textContent=new Date().getFullYear();function prog(el){const r=el.getBoundingClientRect(),t=Math.max(1,r.height-innerHeight);return clamp(-r.top/t)}function tick(){const d=document.documentElement,max=Math.max(1,d.scrollHeight-innerHeight);p.style.width=clamp(scrollY/max)*100+"%";if(hero)hero.style.setProperty("--hp",prog(hero));if(intro)intro.style.setProperty("--ip",prog(intro));if(collector)collector.style.setProperty("--collector-p",prog(collector))}addEventListener("scroll",()=>requestAnimationFrame(tick),{passive:true});addEventListener("resize",tick);tick();

const artLightbox=document.getElementById("artLightbox");
const lightboxImage=document.getElementById("lightboxImage");
const lightboxTitle=document.getElementById("lightboxTitle");
const lightboxClose=document.getElementById("lightboxClose");
document.querySelectorAll(".art-lightbox-trigger").forEach((button)=>{
  button.addEventListener("click",()=>{
    lightboxImage.src=button.dataset.art;
    lightboxImage.alt=button.dataset.title;
    lightboxTitle.textContent=button.dataset.title;
    artLightbox.classList.add("open");
    artLightbox.setAttribute("aria-hidden","false");
    document.body.style.overflow="hidden";
  });
});
function closeArtLightbox(){
  artLightbox.classList.remove("open");
  artLightbox.setAttribute("aria-hidden","true");
  document.body.style.overflow="";
  setTimeout(()=>{lightboxImage.src="";},250);
}
lightboxClose?.addEventListener("click",closeArtLightbox);
artLightbox?.addEventListener("click",(event)=>{if(event.target===artLightbox)closeArtLightbox();});
document.addEventListener("keydown",(event)=>{if(event.key==="Escape"&&artLightbox?.classList.contains("open"))closeArtLightbox();});
