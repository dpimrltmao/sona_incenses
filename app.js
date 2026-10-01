const CHECKOUT_ENDPOINT="https://checkout.sonaincenses.com/create-checkout-session";
const PRODUCTS=[
{id:"mammal-sanda-khoumra",image:"assets/products/mammal-sanda-khoumra.webp",name:{en:"Mammal Sanda & Khoumra — Versace Inspired",ar:"مَمَل صندل وخُمرة — مستوحى من فيرساتشي"},notes:{en:"Sandalwood · Khoumra · Perfumed woods",ar:"صندل · خُمرة · أخشاب معطرة"},price:19500,badge:{en:"Opulent",ar:"فاخر"}},
{id:"khoumra-inspired",image:"assets/products/khoumra-inspired.webp",name:{en:"Khoumra — Versace Inspired",ar:"خُمرة — مستوحى من فيرساتشي"},notes:{en:"Amber · Spice · Perfumed resin",ar:"عنبر · توابل · راتنج عطري"},price:22000,badge:{en:"Intense",ar:"مكثف"}},
{id:"sandal-bukhor-oud",image:"assets/products/sandal-bukhor-oud.webp",name:{en:"Sandal Bukhor with Oud",ar:"بخور صندل مع عود"},notes:{en:"Sandalwood · Oud · Deep woods",ar:"صندل · عود · أخشاب عميقة"},price:22000,badge:{en:"Oud",ar:"عود"}},
{id:"royal-sandal-anfar",image:"assets/products/royal-sandal-anfar.webp",name:{en:"Royal Sandal & Anfar",ar:"رويال صندل وأنفار"},notes:{en:"Sandalwood · Resin · Royal woods",ar:"صندل · راتنج · أخشاب فاخرة"},price:16500,badge:{en:"Royal",ar:"ملكي"}},
{id:"liban-sandal",image:"assets/products/liban-sandal.webp",name:{en:"Liban with Sandal",ar:"لبان مع صندل"},notes:{en:"Liban · Sandalwood · Soft smoke",ar:"لبان · صندل · دخان ناعم"},price:6500,badge:{en:"Classic",ar:"كلاسيكي"}},
{id:"mahlab-delka",image:"assets/products/mahlab-delka.webp",name:{en:"Mahlab Delka",ar:"محلب دلكة"},notes:{en:"Mahlab · Aromatic woods · Resin",ar:"محلب · أخشاب عطرية · راتنج"},price:6500,badge:{en:"Heritage",ar:"تراثي"}},
{id:"normal-delka",image:"assets/products/normal-delka.webp",name:{en:"Normal Delka",ar:"دلكة عادية"},notes:{en:"Warm resin · Woods · Traditional blend",ar:"راتنج دافئ · أخشاب · خلطة تقليدية"},price:6000,badge:{en:"Traditional",ar:"تقليدي"}},
{id:"musk-khomra",image:"assets/products/musk-khomra.webp",name:{en:"Musk Khomra",ar:"مسك خُمرة"},notes:{en:"Musk · Amber · Soft woods",ar:"مسك · عنبر · أخشاب ناعمة"},price:13500,badge:{en:"Musk",ar:"مسك"}},
{id:"french-cloth-perfume",image:"assets/products/french-cloth-perfume.webp",name:{en:"French Cloth Perfume — 200ml",ar:"عطر أقمشة فرنسي — 200 مل"},notes:{en:"Fabric perfume · Fresh musk · Elegant florals",ar:"عطر أقمشة · مسك منعش · زهور أنيقة"},price:10500,badge:{en:"200ml",ar:"200 مل"}}
];
const state={cart:JSON.parse(localStorage.getItem("sona_cart")||"{}"),locale:localStorage.getItem("sona_locale")||"en",messages:{}};
const el=id=>document.getElementById(id);
const grid=el("productGrid"),drawer=el("cartDrawer"),itemsEl=el("cartItems"),emptyEl=el("cartEmpty"),countEl=el("cartCount"),subtotalEl=el("cartSubtotal"),checkoutBtn=el("checkoutButton"),checkoutMsg=el("checkoutMessage");
el("year").textContent=new Date().getFullYear();
const get=(obj,path)=>path.split(".").reduce((a,k)=>a&&a[k],obj);
const money=fils=>new Intl.NumberFormat(state.locale==="ar"?"ar-AE":"en-AE",{style:"currency",currency:"AED",maximumFractionDigits:0}).format(fils/100);
async function loadLocale(locale){
  try{
    const res=await fetch("locales/"+locale+".json");
    state.messages=await res.json();
    state.locale=locale;localStorage.setItem("sona_locale",locale);
    document.documentElement.lang=locale;document.documentElement.dir=locale==="ar"?"rtl":"ltr";
    document.querySelectorAll("[data-i18n]").forEach(n=>{const v=get(state.messages,n.dataset.i18n);if(v)n.textContent=v});
    document.querySelectorAll("[data-i18n-placeholder]").forEach(n=>{const v=get(state.messages,n.dataset.i18nPlaceholder);if(v)n.placeholder=v});
    el("languageButton").textContent=locale==="en"?"العربية":"English";
    renderProducts();renderCart();
  }catch(e){console.error("Locale load failed",e)}
}
function renderProducts(){
  grid.innerHTML=PRODUCTS.map((p)=>`
    <article class="product-card">
      <div class="product-photo">
        <img class="product-image" src="${p.image}" alt="${p.name[state.locale]}" loading="lazy" decoding="async">
        <span class="product-badge">${p.badge[state.locale]}</span>
      </div>
      <div class="product-info">
        <div class="product-topline">
          <span class="product-title">${p.name[state.locale]}</span>
          <span class="product-price">${money(p.price)}</span>
        </div>
        <p class="product-notes">${p.notes[state.locale]}</p>
        <button class="add-button" data-add="${p.id}">${get(state.messages,"product.add")||"Add to bag"}</button>
      </div>
    </article>`).join("");
}
function save(){localStorage.setItem("sona_cart",JSON.stringify(state.cart));renderCart()}
function add(id){state.cart[id]=Math.min((state.cart[id]||0)+1,10);save();openCart()}
function change(id,d){const q=(state.cart[id]||0)+d;if(q<=0)delete state.cart[id];else state.cart[id]=Math.min(q,10);save()}
function renderCart(){
  const entries=Object.entries(state.cart).filter(([id,q])=>PRODUCTS.some(p=>p.id===id)&&q>0);
  countEl.textContent=entries.reduce((s,[,q])=>s+q,0);
  subtotalEl.textContent=money(entries.reduce((s,[id,q])=>s+PRODUCTS.find(p=>p.id===id).price*q,0));
  emptyEl.classList.toggle("show",entries.length===0);
  checkoutBtn.disabled=entries.length===0;
  itemsEl.innerHTML=entries.map(([id,q])=>{
    const p=PRODUCTS.find(x=>x.id===id);
    return `
      <div class="cart-item">
        <div class="cart-thumb"><img src="${p.image}" alt=""></div>
        <div>
          <h3>${p.name[state.locale]}</h3>
          <p>${p.notes[state.locale]}</p>
          <div class="qty">
            <button data-dec="${id}">−</button>
            <span>${q}</span>
            <button data-inc="${id}">+</button>
          </div>
          <button class="remove" data-remove="${id}">${get(state.messages,"cart.remove")||"Remove"}</button>
        </div>
        <span class="cart-item-price">${money(p.price*q)}</span>
      </div>`;
  }).join("");
}
function openCart(){drawer.classList.add("open");drawer.setAttribute("aria-hidden","false");el("cartButton").setAttribute("aria-expanded","true");document.body.style.overflow="hidden"}
function closeCart(){drawer.classList.remove("open");drawer.setAttribute("aria-hidden","true");el("cartButton").setAttribute("aria-expanded","false");document.body.style.overflow=""}
async function checkout(){
  checkoutMsg.textContent="";const lineItems=Object.entries(state.cart).map(([id,quantity])=>({id,quantity}));if(!lineItems.length)return;
  checkoutBtn.disabled=true;checkoutBtn.textContent=get(state.messages,"cart.opening")||"Opening secure checkout…";
  try{const r=await fetch(CHECKOUT_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({items:lineItems,locale:state.locale})});const d=await r.json();if(!r.ok||!d.url)throw new Error(d.error||"Checkout is not configured yet.");location.href=d.url}
  catch(e){checkoutMsg.textContent=e.message;checkoutBtn.disabled=false;checkoutBtn.textContent=get(state.messages,"cart.checkout")||"Secure checkout"}
}
grid.addEventListener("click",e=>{if(e.target.dataset.add)add(e.target.dataset.add)});
itemsEl.addEventListener("click",e=>{if(e.target.dataset.inc)change(e.target.dataset.inc,1);if(e.target.dataset.dec)change(e.target.dataset.dec,-1);if(e.target.dataset.remove){delete state.cart[e.target.dataset.remove];save()}});
el("cartButton").onclick=openCart;el("cartClose").onclick=closeCart;el("cartBackdrop").onclick=closeCart;checkoutBtn.onclick=checkout;
el("languageButton").onclick=()=>loadLocale(state.locale==="en"?"ar":"en");
el("newsletterForm").onsubmit=e=>{e.preventDefault();el("newsletterMessage").textContent=get(state.messages,"newsletter.message")||"Thank you — newsletter integration will be connected before launch."};
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeCart()});
loadLocale(state.locale);

// Cinematic scroll system
const clamp=(n,min=0,max=1)=>Math.min(max,Math.max(min,n));
const heroScene=document.getElementById("heroScene");
const experienceScene=document.getElementById("experienceScene");
const storyScene=document.getElementById("storyScene");
const ritualScene=document.getElementById("ritualScene");
const quoteScene=document.getElementById("quoteScene");
const contactScene=document.getElementById("contactScene");
const scrollProgress=document.getElementById("scrollProgress");
const ambientLight=document.getElementById("ambientLight");
const header=document.querySelector(".site-header");
let ticking=false;

function sceneProgress(node){
  if(!node) return 0;
  const r=node.getBoundingClientRect();
  const travel=Math.max(1,r.height-window.innerHeight);
  return clamp((-r.top)/travel);
}
function updateMotion(){
  ticking=false;
  const doc=document.documentElement;
  const maxScroll=Math.max(1,doc.scrollHeight-window.innerHeight);
  const pageP=clamp(window.scrollY/maxScroll);
  document.body.style.setProperty("--scroll-p",pageP);
  if(scrollProgress) scrollProgress.style.width=(pageP*100)+"%";
  if(header) header.classList.toggle("scrolled",window.scrollY>36);
  if(heroScene) heroScene.style.setProperty("--hero-p",sceneProgress(heroScene));
  if(experienceScene) experienceScene.style.setProperty("--experience-p",sceneProgress(experienceScene));
  if(storyScene) storyScene.style.setProperty("--story-p",sceneProgress(storyScene));
  if(ritualScene) ritualScene.style.setProperty("--ritual-p",sceneProgress(ritualScene));
  if(quoteScene) quoteScene.style.setProperty("--quote-p",sceneProgress(quoteScene));
  if(contactScene) contactScene.style.setProperty("--contact-p",sceneProgress(contactScene));
}
function requestMotion(){
  if(!ticking){ticking=true;requestAnimationFrame(updateMotion)}
}
window.addEventListener("scroll",requestMotion,{passive:true});
window.addEventListener("resize",requestMotion);
document.addEventListener("pointermove",e=>{
  if(!ambientLight) return;
  document.body.style.setProperty("--mx",e.clientX+"px");
  document.body.style.setProperty("--my",e.clientY+"px");
},{passive:true});

const revealObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting) entry.target.classList.add("in-view","revealed");
  });
},{threshold:.14,rootMargin:"0px 0px -7% 0px"});
document.querySelectorAll(".manifesto,.ritual-section,.quote-section,.newsletter").forEach(el=>revealObserver.observe(el));

const productObserver=new MutationObserver(()=>{
  document.querySelectorAll(".product-card:not([data-observed])").forEach((card,i)=>{
    card.dataset.observed="1";
    card.style.transitionDelay=(Math.min(i,3)*70)+"ms";
    revealObserver.observe(card);
  });
});
productObserver.observe(grid,{childList:true});
document.querySelectorAll(".product-card").forEach(card=>revealObserver.observe(card));

if(window.matchMedia("(hover:hover) and (pointer:fine)").matches){
  document.addEventListener("pointermove",e=>{
    const card=e.target.closest(".product-card");
    if(!card) return;
    const r=card.getBoundingClientRect();
    const rx=((e.clientY-r.top)/r.height-.5)*-3.5;
    const ry=((e.clientX-r.left)/r.width-.5)*4.5;
    card.style.transform="perspective(1100px) rotateX("+rx+"deg) rotateY("+ry+"deg) translateY(-3px)";
  });
  document.addEventListener("pointerout",e=>{
    const card=e.target.closest && e.target.closest(".product-card");
    if(card) card.style.transform="";
  });
}
requestAnimationFrame(updateMotion);
