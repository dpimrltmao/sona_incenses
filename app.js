const CHECKOUT_ENDPOINT="https://checkout.sonaincenses.com/create-checkout-session";
const PRODUCTS=[
{id:"sona-signature",name:{en:"Sona Signature",ar:"سونا سيغنتشر"},notes:{en:"Oud · Amber · Soft Musk",ar:"عود · عنبر · مسك ناعم"},price:16500,badge:{en:"Signature",ar:"مميز"}},
{id:"majlis-amber",name:{en:"Majlis Amber",ar:"عنبر المجلس"},notes:{en:"Amber · Sandalwood · Vanilla",ar:"عنبر · صندل · فانيلا"},price:14500,badge:{en:"Warm",ar:"دافئ"}},
{id:"velvet-oud",name:{en:"Velvet Oud",ar:"عود مخملي"},notes:{en:"Oud · Rose · Saffron",ar:"عود · ورد · زعفران"},price:18500,badge:{en:"Rich",ar:"غني"}},
{id:"white-musk",name:{en:"White Musk",ar:"المسك الأبيض"},notes:{en:"Musk · Cotton · Light Woods",ar:"مسك · قطن · أخشاب خفيفة"},price:13500,badge:{en:"Soft",ar:"ناعم"}}
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
  grid.innerHTML=PRODUCTS.map((p,i)=>'<article class="product-card"><div class="product-visual" style="filter:hue-rotate('+(i*6)+'deg)"><span class="product-badge">'+p.badge[state.locale]+'</span><div class="product-jar"></div></div><div class="product-info"><div class="product-topline"><span class="product-title">'+p.name[state.locale]+'</span><span class="product-price">'+money(p.price)+'</span></div><p class="product-notes">'+p.notes[state.locale]+'</p><button class="add-button" data-add="'+p.id+'">'+(get(state.messages,"product.add")||"Add to bag")+'</button></div></article>').join("");
}
function save(){localStorage.setItem("sona_cart",JSON.stringify(state.cart));renderCart()}
function add(id){state.cart[id]=Math.min((state.cart[id]||0)+1,10);save();openCart()}
function change(id,d){const q=(state.cart[id]||0)+d;if(q<=0)delete state.cart[id];else state.cart[id]=Math.min(q,10);save()}
function renderCart(){
  const entries=Object.entries(state.cart).filter(([id,q])=>PRODUCTS.some(p=>p.id===id)&&q>0);
  countEl.textContent=entries.reduce((s,[,q])=>s+q,0);
  subtotalEl.textContent=money(entries.reduce((s,[id,q])=>s+PRODUCTS.find(p=>p.id===id).price*q,0));
  emptyEl.classList.toggle("show",entries.length===0);checkoutBtn.disabled=entries.length===0;
  itemsEl.innerHTML=entries.map(([id,q])=>{const p=PRODUCTS.find(x=>x.id===id);return '<div class="cart-item"><div class="cart-thumb"></div><div><h3>'+p.name[state.locale]+'</h3><p>'+p.notes[state.locale]+'</p><div class="qty"><button data-dec="'+id+'">−</button><span>'+q+'</span><button data-inc="'+id+'">+</button></div><button class="remove" data-remove="'+id+'">'+(get(state.messages,"cart.remove")||"Remove")+'</button></div><span class="cart-item-price">'+money(p.price*q)+'</span></div>'}).join("");
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