import { useState, useRef, useEffect, useCallback } from "react";

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   DESIGN SYSTEM â€” Luxury Editorial
   Palette : ivoire profond Â· bronze Â· charbon doux Â· or ancien
   Typo    : Cormorant Garamond (display) + DM Mono (data) + Outfit (UI)
   Ambiance: magazine de dÃ©coration haut-de-gamme, lumiÃ¨re tamisÃ©e
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const T = {
  bg:          "#f4f6f9",
  bgWarm:      "#eef2f6",
  panel:       "#ffffff",
  panelRaised: "#f8fafc",
  glass:       "rgba(44,62,80,0.03)",
  glassHover:  "rgba(44,62,80,0.05)",
  border:      "rgba(28,41,58,0.10)",
  borderWarm:  "rgba(37,185,215,0.32)",
  borderBright:"rgba(37,185,215,0.55)",
  bronze:      "#25b9d7",
  bronzeLight: "#5bd0e6",
  bronzeDark:  "#1e95ac",
  gold:        "#2e7cf6",
  goldLight:   "#5a98f8",
  ivory:       "#1f2d3d",
  ivoryDim:    "#5b6f85",
  ivoryMuted:  "#6f8093",
  ivoryDeep:   "#9aa9b7",
  green:       "#21b573",
  greenLight:  "#2dc987",
  red:         "#eb5757",
  redLight:    "#f07a7a",
  blue:        "#2e7cf6",
  blueLight:   "#5a98f8",
  orange:      "#f2994a",
  orangeLight: "#f6ad67",
  ink:         "#1f2d3d",
  inkDim:      "#4c6278",
  inkMuted:    "#7b8c9f",
};

/* â”€â”€â”€ DATA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const PRODUCTS = [
  { id:1,  ref:"CAP-001", name:"CanapÃ© Velours Anthracite",         stock:4,  stockMin:2, price:890,  priceShop:1090, image:"ðŸ›‹ï¸", category:"CanapÃ©s",    sage:true,  presta:true,  sales:38, daysInStock:42,  isNew:false, weight:"85kg",   dimensions:"240Ã—95Ã—85cm",  supplier:"Manufacture Sud",     description:"CanapÃ© 3 places en velours cÃ´telÃ© anthracite, pieds en chÃªne massif, assise haute densitÃ© 35kg/mÂ³.", createdAt:"2024-09-10" },
  { id:2,  ref:"TAB-012", name:"Table Basse Marbre & Laiton",       stock:7,  stockMin:3, price:420,  priceShop:529,  image:"ðŸª¨", category:"Tables",     sage:true,  presta:true,  sales:61, daysInStock:28,  isNew:true,  weight:"32kg",   dimensions:"120Ã—60Ã—42cm",  supplier:"Atelier Pietra",      description:"Table basse plateau marbre de Carrare, structure laiton brossÃ©. PiÃ¨ce signature de la collection.", createdAt:"2025-01-15" },
  { id:3,  ref:"LIT-008", name:"Lit Plateforme Noyer 160Ã—200",      stock:2,  stockMin:2, price:1150, priceShop:1399, image:"ðŸ›ï¸", category:"Literie",    sage:true,  presta:true,  sales:19, daysInStock:160, isNew:false, weight:"120kg",  dimensions:"170Ã—210Ã—35cm", supplier:"Ã‰bÃ©nisterie du Nord", description:"Lit plateforme en noyer massif, tÃªte de lit rembourrÃ©e en lin beige, lattes flexibles incluses.", createdAt:"2024-05-20" },
  { id:4,  ref:"ARM-003", name:"Armoire Haussmannienne 3 portes",   stock:0,  stockMin:1, price:1680, priceShop:1990, image:"ðŸšª", category:"Rangement",  sage:true,  presta:false, sales:12, daysInStock:210, isNew:false, weight:"145kg",  dimensions:"180Ã—60Ã—220cm", supplier:"Menuiserie Haussmann", description:"Armoire 3 portes battantes style haussmannien, miroir intÃ©rieur, 6 Ã©tagÃ¨res, 2 penderies.", createdAt:"2024-03-01" },
  { id:5,  ref:"FTL-005", name:"Fauteuil Bouclette Ã‰cru",           stock:9,  stockMin:4, price:380,  priceShop:469,  image:"ðŸ’º", category:"Fauteuils",  sage:true,  presta:true,  sales:74, daysInStock:22,  isNew:true,  weight:"28kg",   dimensions:"75Ã—80Ã—90cm",  supplier:"Manufacture Sud",     description:"Fauteuil lounge en tissu bouclette Ã©cru, structure en hÃªtre naturel, coussin plume synthÃ©tique.", createdAt:"2025-01-22" },
  { id:6,  ref:"TAB-018", name:"Table Ã  Manger ChÃªne Massif",       stock:3,  stockMin:2, price:1290, priceShop:1590, image:"ðŸ½ï¸", category:"Tables",     sage:true,  presta:true,  sales:27, daysInStock:55,  isNew:false, weight:"78kg",   dimensions:"180Ã—90Ã—76cm",  supplier:"Ã‰bÃ©nisterie du Nord", description:"Table Ã  manger en chÃªne massif huilÃ©, bords naturels conservÃ©s, pieds en acier brut.", createdAt:"2024-10-12" },
  { id:7,  ref:"ETG-002", name:"BibliothÃ¨que MÃ©tal & Pin",          stock:11, stockMin:5, price:345,  priceShop:429,  image:"ðŸ“š", category:"Rangement",  sage:true,  presta:true,  sales:9,  daysInStock:190, isNew:false, weight:"35kg",   dimensions:"100Ã—35Ã—200cm", supplier:"IndusDesign",         description:"BibliothÃ¨que style industriel, structure mÃ©tal noir mat, tablettes en pin massif, 5 niveaux.", createdAt:"2024-04-05" },
  { id:8,  ref:"CHR-007", name:"Chaise Velours Vert Sauge",         stock:16, stockMin:8, price:185,  priceShop:229,  image:"ðŸª‘", category:"Chaises",    sage:true,  presta:true,  sales:112,daysInStock:35,  isNew:false, weight:"7kg",    dimensions:"45Ã—52Ã—92cm",  supplier:"Manufacture Sud",     description:"Chaise Ã  dossier arrondi, assise velours vert sauge, pieds dorÃ©s, empilable.", createdAt:"2024-09-01" },
  { id:9,  ref:"COM-004", name:"Commode 6 Tiroirs Rotin",           stock:5,  stockMin:3, price:490,  priceShop:599,  image:"ðŸ—„ï¸", category:"Rangement",  sage:false, presta:true,  sales:33, daysInStock:80,  isNew:false, weight:"42kg",   dimensions:"120Ã—45Ã—85cm",  supplier:"Rotin & Co",          description:"Commode 6 tiroirs en bois de manguier et rotin naturel tressÃ©, poignÃ©es en laiton.", createdAt:"2024-08-18" },
  { id:10, ref:"LUM-011", name:"Lampadaire Arc Laiton BrossÃ©",      stock:6,  stockMin:3, price:260,  priceShop:319,  image:"ðŸ’¡", category:"Luminaires", sage:true,  presta:true,  sales:48, daysInStock:65,  isNew:false, weight:"8kg",    dimensions:"Ã˜35Ã—190cm",   supplier:"LumiÃ¨reAtelier",      description:"Lampadaire arc Ã  3 tÃªtes orientables, structure laiton brossÃ©, abat-jour lin beige.", createdAt:"2024-10-30" },
  { id:11, ref:"MIR-006", name:"Miroir Arche Rotin 70Ã—180",         stock:8,  stockMin:4, price:220,  priceShop:275,  image:"ðŸªž", category:"DÃ©coration", sage:true,  presta:true,  sales:55, daysInStock:48,  isNew:false, weight:"12kg",   dimensions:"70Ã—180cm",    supplier:"Rotin & Co",          description:"Grand miroir arche en rotin naturel, forme arquÃ©e, idÃ©al couloir et chambre.", createdAt:"2024-11-05" },
  { id:12, ref:"TAP-009", name:"Tapis BerbÃ¨re Laine Naturelle",     stock:3,  stockMin:2, price:380,  priceShop:475,  image:"ðŸ§¶", category:"DÃ©coration", sage:true,  presta:true,  sales:6,  daysInStock:220, isNew:false, weight:"18kg",   dimensions:"200Ã—300cm",   supplier:"Artisans Maroc",      description:"Tapis berbÃ¨re en laine naturelle non traitÃ©e, motifs gÃ©omÃ©triques traditionnels, piÃ¨ce unique.", createdAt:"2024-02-14" },
];
const SALES = [
  { month:"AoÃ»t",  sage:24800, presta:18400, orders:34 },
  { month:"Sep",   sage:28100, presta:21200, orders:41 },
  { month:"Oct",   sage:22800, presta:19600, orders:38 },
  { month:"Nov",   sage:31200, presta:26800, orders:52 },
  { month:"DÃ©c",   sage:48600, presta:39200, orders:78 },
  { month:"Jan",   sage:29800, presta:24100, orders:47 },
];
const CATS = ["Canapés","Tables","Literie","Rangement","Fauteuils","Chaises","Luminaires","Décoration"];
const CAT_ICONS = {
  "Canapés":"🛋️",
  "Tables":"🍽️",
  "Literie":"🛏️",
  "Rangement":"🗄️",
  "Fauteuils":"💺",
  "Chaises":"🪑",
  "Luminaires":"💡",
  "Décoration":"🪞",
};
const API_BASE = "http://127.0.0.1:4000/api";
const SUPERVISOR_BASE = "http://127.0.0.1:4010/api/supervisor";
const STORE_BASE = "https://www.house-store.com";
const CURRENCY = "XPF";

const toNum = v => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const mojibakeFix = val => {
  const s = String(val ?? "");
  if (!/[ÃÂâð]/.test(s)) return s;
  try {
    return decodeURIComponent(escape(s));
  } catch {
    return s;
  }
};
const money = n => `${Number(n || 0).toLocaleString("fr-FR")} ${CURRENCY}`;
const stripHtml = s => String(s || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const daysSince = dateStr => {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return 90;
  return Math.max(1, Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24)));
};
const catFromPresta = id => CATS[Math.abs(toNum(id)) % CATS.length] || CATS[0];
const pickFirstNum = (obj, keys = []) => {
  for (const k of keys) {
    const v = toNum(obj?.[k]);
    if (v > 0) return v;
  }
  return 0;
};

const readLocalized = value => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const first = value.find(v => typeof v === "string") || value.find(v => v?.value) || value[0];
    if (typeof first === "string") return first;
    if (first?.value) return String(first.value);
  }
  if (typeof value === "object") {
    if (value.value) return String(value.value);
    const vals = Object.values(value);
    const first = vals.find(v => typeof v === "string" && v.trim()) || vals.find(v => v?.value);
    if (typeof first === "string") return first;
    if (first?.value) return String(first.value);
  }
  return String(value || "");
};

function mapPrestaProducts(
  psProducts = [],
  psCombinations = [],
  sageProducts = [],
  sageStock = [],
  taxRateMap = {},
  categoryMap = {},
  supplierMap = {}
) {
  const comboRefsByProduct = new Map();
  psCombinations.forEach(c => {
    const pid = toNum(c.id_product);
    if (!pid) return;
    const ref = String(c.reference || "").trim();
    if (!ref) return;
    const arr = comboRefsByProduct.get(pid) || [];
    if (!arr.includes(ref)) arr.push(ref);
    comboRefsByProduct.set(pid, arr);
  });

  const sageByRef = new Map();
  sageProducts.forEach(r => {
    const ref = String(r.AR_Ref || r.Reference || r.reference || "").trim().toUpperCase();
    if (ref) sageByRef.set(ref, r);
  });
  const stockByRef = new Map();
  sageStock.forEach(r => {
    const ref = String(r.AR_Ref || r.Reference || r.reference || "").trim().toUpperCase();
    if (ref) stockByRef.set(ref, r);
  });

  return psProducts.slice(0, 3000).map((p, idx) => {
    const id = toNum(p.id) || idx + 1;
    const name = stripHtml(p.name || `Produit ${id}`);
    const category = categoryMap[String(p.id_category_default || "")] || catFromPresta(p.id_category_default);
    const imgs = p.associations?.images;
    const imageId = (Array.isArray(imgs) ? imgs[0]?.id : imgs?.id) || p.id_default_image;
    const imagePath = imageId ? String(imageId).split("").join("/") : "";
    const imageUrl = imageId ? `${STORE_BASE}/img/p/${imagePath}/${imageId}.jpg` : null;
    const imageProxyUrl = imageId ? `${API_BASE}/prestashop/image/${id}/${imageId}` : null;

    const priceHt = Math.max(0, toNum(p.price || 0));
    const taxRate =
      pickFirstNum(p, ["tax_rate", "rate", "taux_taxe"]) ||
      toNum(taxRateMap[String(p.id_tax_rules_group || "")]) ||
      0;
    const priceTtc = Math.max(0, Math.round(priceHt * (1 + taxRate / 100)));

    const stock = Math.max(0, toNum(p.quantity || 0));
    const createdAt = String(p.date_add || new Date().toISOString()).slice(0, 10);
    const refs = [String(p.reference || "").trim(), ...(comboRefsByProduct.get(id) || [])]
      .filter(Boolean)
      .map(r => r.toUpperCase());
    const sageRow = refs.map(r => sageByRef.get(r)).find(Boolean) || null;
    const stockRow = refs.map(r => stockByRef.get(r)).find(Boolean) || null;

    const cmup = pickFirstNum(sageRow, ["CMUP", "cmup", "PMP", "pmp", "AR_PrixAch", "AR_PrixAchat", "PrixAchat", "PA"])
      || pickFirstNum(stockRow, ["CMUP", "cmup", "PMP", "pmp", "STK_CMP", "PRMP"]);
    const priceHtSage = pickFirstNum(sageRow, ["AR_PrixVen", "AR_PrixVente", "PV_HT", "PrixHT"]);
    const finalPriceHt = priceHtSage > 0 ? priceHtSage : priceHt;

    return {
      id,
      ref: String(p.reference || "").trim() || `REF-${id}`,
      variantRefs: (comboRefsByProduct.get(id) || []).join(" "),
      name,
      stock,
      stockMin: Math.max(1, Math.min(8, Math.ceil(Math.max(1, stock * 0.2)))),
      price: Math.round(finalPriceHt),
      priceShop: priceTtc,
      priceTTC: priceTtc,
      taxRate,
      cmup: cmup || null,
      image: CAT_ICONS[category] || "ðŸ“¦",
      imageUrl,
      imageProxyUrl,
      category,
      sage: true,
      presta: true,
      sales: 0,
      daysInStock: daysSince(createdAt),
      isNew: daysSince(createdAt) <= 45,
      weight: `${toNum(p.weight || 0)}kg`,
      dimensions: `${toNum(p.width || 0)}x${toNum(p.depth || 0)}x${toNum(p.height || 0)}cm`,
      supplier: supplierMap[String(p.id_supplier || "")] || (p.id_supplier ? `Supplier #${p.id_supplier}` : "N/A"),
      productUrl: `${STORE_BASE}/index.php?id_product=${id}&controller=product`,
      productSlug: readLocalized(p.link_rewrite),
      description: stripHtml(p.description_short || p.description || "Fiche synchronisÃ©e depuis PrestaShop."),
      createdAt,
    };
  });
}

const stockStatus = p => p.stock === 0 ? {label:"Rupture", c:T.red} : p.stock <= p.stockMin ? {label:"Critique", c:T.orange} : {label:"OK", c:T.green};
const promoType = p => {
  if (p.isNew) return {type:"new",  label:"Nouveauté",      c:T.blue,   desc:"Mise en avant homepage + réseaux sociaux"};
  if (p.daysInStock > 180) return {type:"slow", label:"Rotation lente", c:T.orange, desc:"Remise de 20-30% recommandée"};
  if (p.daysInStock > 90)  return {type:"med",  label:"À dynamiser",    c:T.gold,   desc:"Newsletter + offre groupée"};
  if (p.stock === 0)       return {type:"rupt", label:"Rupture",        c:T.red,    desc:"Relancer commande fournisseur"};
  return null;
};

/* â”€â”€â”€ SHARED UI ATOMS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const Pill = ({children, color=T.bronze, active=false, onClick, small=false}) => (
  <button onClick={onClick} style={{
    padding: small ? "3px 10px" : "5px 14px",
    borderRadius: 999,
    border: `1px solid ${active ? color : T.border}`,
    background: active ? color+"22" : "transparent",
    color: active ? color : T.inkMuted,
    fontSize: small ? 10 : 11,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: 0.3,
    transition: "all 0.18s",
    whiteSpace: "nowrap",
  }}>{children}</button>
);

const KpiCard = ({icon, label, value, sub, color}) => (
  <div style={{
    background: T.panel,
    border: `1px solid ${T.border}`,
    borderRadius: 16,
    padding: "20px 22px",
    position: "relative",
    overflow: "hidden",
    transition: "border-color 0.2s, transform 0.2s",
  }}
    onMouseEnter={e=>{e.currentTarget.style.borderColor=color+"55"; e.currentTarget.style.transform="translateY(-2px)"}}
    onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border; e.currentTarget.style.transform="translateY(0)"}}
  >
    <div style={{position:"absolute",top:0,right:0,width:80,height:80,background:`radial-gradient(circle at 80% 20%, ${color}18, transparent 70%)`,borderRadius:"0 16px 0 0"}}/>
    <div style={{fontSize:22,marginBottom:10}}>{icon}</div>
    <div style={{fontFamily:"'DM Mono', monospace",fontSize:26,fontWeight:500,color,letterSpacing:-1,lineHeight:1}}>{value}</div>
    <div style={{fontSize:11,color:T.ivoryMuted,marginTop:7,textTransform:"uppercase",letterSpacing:1}}>{label}</div>
    {sub && <div style={{fontSize:10,color:color+"99",marginTop:3}}>{sub}</div>}
  </div>
);

const SectionTitle = ({children, sub}) => (
  <div style={{marginBottom:20}}>
    <h2 style={{fontFamily:"'Montserrat','Open Sans',sans-serif",fontSize:22,fontWeight:600,color:T.ivory,letterSpacing:0.5,margin:0}}>{children}</h2>
    {sub && <p style={{margin:"4px 0 0",fontSize:11,color:T.ivoryMuted,letterSpacing:0.5}}>{sub}</p>}
  </div>
);

const ProductThumb = ({product, size=40}) => {
  const [srcIndex, setSrcIndex] = useState(0);
  const imageSources = [product?.imageUrl, product?.imageProxyUrl].filter(Boolean);
  const src = imageSources[srcIndex];
  const showImage = !!src;
  return (
    <div style={{width:size,height:size,borderRadius:10,background:T.panelRaised,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:Math.max(18, Math.floor(size*0.48)),flexShrink:0,overflow:"hidden"}}>
      {showImage ? (
        <img
          src={src}
          alt={mojibakeFix(product.name || "Produit")}
          style={{width:"100%",height:"100%",objectFit:"cover"}}
          loading="lazy"
          onError={()=>setSrcIndex(i => i + 1)}
        />
      ) : (
        product.image || "📦"
      )}
    </div>
  );
};

/* â”€â”€â”€ PRODUCT MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function ProductModal({product, onClose}) {
  const promo = promoType(product);
  const ss    = stockStatus(product);
  const margin = (((product.priceShop - product.price) / product.price)*100).toFixed(0);
  const vm = product.sales / Math.max(1, Math.floor(product.daysInStock/30));

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(10,9,8,0.85)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:24,backdropFilter:"blur(12px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.bgWarm,border:`1px solid ${T.borderWarm}`,borderRadius:24,width:"100%",maxWidth:780,maxHeight:"92vh",overflow:"auto",animation:"modalIn .25s cubic-bezier(.4,0,.2,1)",boxShadow:"0 40px 120px rgba(0,0,0,.8)"}}>

        {/* Ribbon top */}
        <div style={{height:3,background:`linear-gradient(90deg,${T.bronze},${T.gold},${T.bronze})`,borderRadius:"24px 24px 0 0"}}/>

        {/* Header */}
        <div style={{padding:"28px 32px 22px",borderBottom:`1px solid ${T.border}`,display:"flex",gap:20,alignItems:"flex-start"}}>
          <div style={{width:96,height:96,flexShrink:0}}>
            <ProductThumb product={product} size={96}/>
          </div>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:6}}>
              <h2 style={{fontFamily:"'Montserrat','Open Sans',sans-serif",fontSize:24,fontWeight:600,color:T.ivory,margin:0,letterSpacing:0.3}}>{mojibakeFix(product.name)}</h2>
              {product.isNew && <span style={{background:T.blue+"22",color:T.blueLight,fontSize:9,fontWeight:700,padding:"3px 10px",borderRadius:20,border:`1px solid ${T.blue}44`,letterSpacing:1,textTransform:"uppercase"}}>Nouveau</span>}
            </div>
            <div style={{fontSize:12,color:T.ivoryMuted,marginBottom:12,display:"flex",gap:10,flexWrap:"wrap"}}>
              <span style={{fontFamily:"'DM Mono',monospace",color:T.bronze,fontSize:11}}>{mojibakeFix(product.ref)}</span>
              <span style={{color:T.ivoryDeep}}>·</span>
              <span>{CAT_ICONS[mojibakeFix(product.category)] || "📦"} {mojibakeFix(product.category)}</span>
              <span style={{color:T.ivoryDeep}}>·</span>
              <span>{mojibakeFix(product.supplier)}</span>
            </div>
            <p style={{fontSize:13,color:T.inkDim,lineHeight:1.65,margin:0}}>{mojibakeFix(product.description)}</p>
          </div>
          <button onClick={onClose} style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:10,width:36,height:36,cursor:"pointer",color:T.ivoryMuted,fontSize:16,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>

        <div style={{padding:"24px 32px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
          {/* LEFT */}
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {/* KPIs */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[
                {l:"Prix Sage HT",    v:money(product.price), c:T.ink},
                {l:"Prix Boutique",   v:money(product.priceShop), c:T.bronze},
                {l:"Marge brute",     v:"+"+margin+"%",    c:T.green},
                {l:"Ventes totales",  v:product.sales+" u.", c:T.gold},
              ].map(k=>(
                <div key={k.l} style={{background:T.panel,borderRadius:12,padding:"14px 16px",border:`1px solid ${T.border}`}}>
                  <div style={{fontSize:9,color:T.ivoryMuted,marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>{k.l}</div>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:20,fontWeight:500,color:k.c,letterSpacing:-0.5}}>{k.v}</div>
                </div>
              ))}
            </div>

            {/* Specs */}
            <div style={{background:T.panel,borderRadius:14,padding:18,border:`1px solid ${T.border}`}}>
              <div style={{fontSize:9,color:T.ivoryMuted,fontWeight:700,marginBottom:14,textTransform:"uppercase",letterSpacing:1.5}}>Caractéristiques</div>
              {[["Dimensions",product.dimensions],["Poids",product.weight],["Fournisseur",product.supplier],["En stock depuis",product.createdAt]].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.border}`,fontSize:12}}>
                  <span style={{color:T.ivoryMuted}}>{k}</span>
                  <span style={{color:T.ink,fontWeight:500}}>{v}</span>
                </div>
              ))}
            </div>

            {/* Atoo-Sync */}
            <div style={{background:T.panel,borderRadius:14,padding:18,border:`1px solid ${T.border}`}}>
              <div style={{fontSize:9,color:T.ivoryMuted,fontWeight:700,marginBottom:14,textTransform:"uppercase",letterSpacing:1.5}}>Synchronisation</div>
              <div style={{display:"flex",gap:10}}>
                {[{l:"Sage",ok:product.sage},{l:"PrestaShop",ok:product.presta}].map(s=>(
                  <div key={s.l} style={{flex:1,textAlign:"center",background:s.ok?T.green+"12":T.red+"12",border:`1px solid ${s.ok?T.green:T.red}30`,borderRadius:12,padding:"14px 0"}}>
                    <div style={{fontSize:24,marginBottom:6}}>{s.ok?"✅":"❌"}</div>
                    <div style={{fontSize:11,color:s.ok?T.greenLight:T.redLight,fontWeight:700}}>{s.l}</div>
                    <div style={{fontSize:10,color:T.ivoryMuted,marginTop:2}}>{s.ok?"Synchronisé":"Non sync"}</div>
                  </div>
                ))}
              </div>
              {(!product.sage||!product.presta)&&(
                <button style={{marginTop:12,width:"100%",padding:"10px",borderRadius:10,border:`1px solid ${T.bronze}55`,background:T.bronze+"15",color:T.bronzeLight,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                  Forcer la synchronisation
                </button>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {/* Stock */}
            <div style={{background:T.panel,borderRadius:14,padding:20,border:`1px solid ${T.border}`}}>
              <div style={{fontSize:9,color:T.ivoryMuted,fontWeight:700,marginBottom:16,textTransform:"uppercase",letterSpacing:1.5}}>État du Stock</div>
              <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:16}}>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:52,fontWeight:500,color:ss.c,lineHeight:1}}>{product.stock}</div>
                <div>
                  <div style={{background:ss.c+"20",color:ss.c,fontSize:11,fontWeight:700,padding:"4px 12px",borderRadius:20,marginBottom:6,border:`1px solid ${ss.c}33`}}>{ss.label}</div>
                  <div style={{fontSize:11,color:T.ivoryMuted}}>Seuil min : {product.stockMin} u.</div>
                  <div style={{fontSize:11,color:T.ivoryMuted}}>En stock : {product.daysInStock} jours</div>
                </div>
              </div>
              <div style={{height:6,background:T.panelRaised,borderRadius:3,overflow:"hidden",marginBottom:6}}>
                <div style={{height:"100%",width:Math.min(100,(product.stock/(product.stockMin*4))*100)+"%",background:`linear-gradient(90deg,${ss.c}88,${ss.c})`,borderRadius:3,transition:"width .6s"}}/>
              </div>
              <div style={{fontSize:10,color:T.ivoryMuted}}>Valeur en stock : {money(product.priceShop*product.stock)}</div>
            </div>

            {/* Rotation */}
            <div style={{background:T.panel,borderRadius:14,padding:18,border:`1px solid ${T.border}`}}>
              <div style={{fontSize:9,color:T.ivoryMuted,fontWeight:700,marginBottom:14,textTransform:"uppercase",letterSpacing:1.5}}>Analyse Rotation</div>
              <div style={{display:"flex",gap:0}}>
                {[
                  {l:"Jours stock",v:product.daysInStock+"j",c:T.ink},
                  {l:"Ventes",v:product.sales,c:T.gold},
                  {l:"Ventes/mois",v:vm.toFixed(1),c:T.bronze},
                ].map((m,i)=>(
                  <div key={m.l} style={{flex:1,textAlign:"center",borderRight:i<2?`1px solid ${T.border}`:"none",padding:"0 12px"}}>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:22,fontWeight:500,color:m.c,lineHeight:1}}>{m.v}</div>
                    <div style={{fontSize:10,color:T.ivoryMuted,marginTop:4}}>{m.l}</div>
                  </div>
                ))}
              </div>
              <div style={{marginTop:14,height:4,background:T.panelRaised,borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",width:Math.max(5,100-product.daysInStock/3)+"%",background:product.daysInStock>150?T.orange:product.daysInStock>90?T.gold:T.green,borderRadius:2}}/>
              </div>
              <div style={{fontSize:10,color:T.ivoryMuted,marginTop:6}}>
                Score rotation : {product.daysInStock>150?"⚠ Faible — action recommandée":product.daysInStock>90?"◉ Moyen — à surveiller":"✓ Bon"}
              </div>
            </div>

            {/* Promo alert */}
            {promo && (
              <div style={{background:promo.c+"10",border:`1px solid ${promo.c}30`,borderRadius:14,padding:18}}>
                <div style={{fontFamily:"'Montserrat','Open Sans',sans-serif",fontSize:16,fontWeight:600,color:promo.c,marginBottom:6}}>{promo.label}</div>
                <div style={{fontSize:12,color:T.inkDim,lineHeight:1.55,marginBottom:14}}>{promo.desc}</div>
                <div style={{display:"flex",gap:8}}>
                  <button style={{flex:1,padding:"9px",borderRadius:10,border:"none",cursor:"pointer",background:promo.c,color:"#fff",fontSize:12,fontWeight:700,fontFamily:"inherit"}}>Créer une campagne</button>
                  <button style={{padding:"9px 14px",borderRadius:10,border:`1px solid ${promo.c}44`,cursor:"pointer",background:"transparent",color:promo.c,fontSize:12,fontFamily:"inherit"}}>Studio →</button>
                </div>
              </div>
            )}

            <div style={{display:"flex",gap:8}}>
              <button style={{flex:1,padding:"12px",borderRadius:12,border:`1px solid ${T.borderWarm}`,cursor:"pointer",background:`linear-gradient(135deg,${T.bronze},${T.bronzeDark})`,color:"#fff",fontSize:13,fontWeight:700,fontFamily:"inherit"}}>
                Modifier le produit
              </button>
              <button
                onClick={()=>product.productUrl && window.open(product.productUrl, "_blank", "noopener,noreferrer")}
                style={{padding:"12px 16px",borderRadius:12,border:`1px solid ${T.border}`,cursor:"pointer",background:"transparent",color:T.ivoryMuted,fontSize:13,fontFamily:"inherit"}}
              >↗</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* â”€â”€â”€ PRODUCTS MODULE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function ProductsModule() {
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("all");
  const [cat,    setCat]      = useState("all");
  const [sort,   setSort]     = useState("name");
  const [modal,  setModal]    = useState(null);

  const filtered = PRODUCTS.filter(p =>
    (filter==="all" || (filter==="sync"&&p.sage&&p.presta) || (filter==="unsync"&&(!p.sage||!p.presta)) || (filter==="rupture"&&p.stock===0) || (filter==="new"&&p.isNew) || (filter==="slow"&&p.daysInStock>150))
    && (cat==="all" || p.category===cat)
    && [p.name,p.ref,p.category,p.supplier||""].some(s=>s.toLowerCase().includes(search.toLowerCase()))
  ).sort((a,b)=>({name:a.name.localeCompare(b.name),stock:a.stock-b.stock,price:b.priceShop-a.priceShop,sales:b.sales-a.sales,days:b.daysInStock-a.daysInStock}[sort]||0));

  const STATUS = [
    {id:"all",    label:"Tous",          count:PRODUCTS.length},
    {id:"sync",   label:"Synchronisés",  count:PRODUCTS.filter(p=>p.sage&&p.presta).length},
    {id:"unsync", label:"Non sync",      count:PRODUCTS.filter(p=>!p.sage||!p.presta).length},
    {id:"rupture",label:"Rupture",       count:PRODUCTS.filter(p=>p.stock===0).length},
    {id:"new",    label:"Nouveaux",      count:PRODUCTS.filter(p=>p.isNew).length},
    {id:"slow",   label:"Lente rotation",count:PRODUCTS.filter(p=>p.daysInStock>150).length},
  ];

  return (
    <div style={{padding:"28px 32px"}}>
      {modal && <ProductModal product={modal} onClose={()=>setModal(null)}/>}

      <SectionTitle sub={`${PRODUCTS.length} références · ${PRODUCTS.filter(p=>p.sage&&p.presta).length} synchronisées Atoo-Sync`}>Catalogue Produits</SectionTitle>

      {/* Search bar */}
      <div style={{position:"relative",marginBottom:16}}>
        <span style={{position:"absolute",left:18,top:"50%",transform:"translateY(-50%)",color:T.ivoryMuted,fontSize:14,pointerEvents:"none"}}>⌕</span>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher — nom, référence, catégorie, fournisseur…"
          style={{width:"100%",background:T.panel,border:`1px solid ${T.border}`,borderRadius:14,padding:"13px 18px 13px 46px",color:T.ink,fontSize:13,outline:"none",boxSizing:"border-box",
            fontFamily:"inherit",transition:"border-color .2s"}}
          onFocus={e=>e.target.style.borderColor=T.bronze}
          onBlur={e=>e.target.style.borderColor=T.border}
        />
        <div style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",display:"flex",gap:8,alignItems:"center"}}>
          <select value={sort} onChange={e=>setSort(e.target.value)} style={{background:"transparent",border:"none",color:T.ivoryMuted,fontSize:11,cursor:"pointer",outline:"none",fontFamily:"inherit"}}>
            <option value="name">Nom A→Z</option>
            <option value="stock">Stock ↑</option>
            <option value="price">Prix ↓</option>
            <option value="sales">Ventes ↓</option>
            <option value="days">Ancienneté ↓</option>
          </select>
        </div>
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
        {STATUS.map(s=>(
          <Pill key={s.id} active={filter===s.id} color={T.bronze} onClick={()=>setFilter(s.id)}>
            {s.label} <span style={{opacity:.6,fontSize:10}}>({s.count})</span>
          </Pill>
        ))}
      </div>
      <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
        <Pill active={cat==="all"} color={T.gold} onClick={()=>setCat("all")} small>Toutes catégories</Pill>
        {CATS.map(c=>(
          <Pill key={c} active={cat===c} color={T.gold} onClick={()=>setCat(c)} small>{CAT_ICONS[c]} {c}</Pill>
        ))}
      </div>

      {/* Table */}
      <div style={{background:T.panel,borderRadius:18,overflow:"hidden",border:`1px solid ${T.border}`}}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead>
              <tr style={{background:T.bg+"bb"}}>
                {["Produit","Réf.","Catégorie","Stock","HT","TTC","Marge","Ventes","Rotation","Sync",""].map(h=>(
                  <th key={h} style={{padding:"12px 14px",textAlign:"left",color:T.ivoryMuted,fontWeight:500,fontSize:9,textTransform:"uppercase",letterSpacing:1.2,borderBottom:`1px solid ${T.border}`,whiteSpace:"nowrap",fontFamily:"inherit"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p,idx)=>{
                const ss=stockStatus(p); const pt=promoType(p);
                const m=(((p.priceShop-p.price)/p.price)*100).toFixed(0);
                return (
                  <tr key={p.id} onClick={()=>setModal(p)} style={{borderBottom:`1px solid ${T.border}44`,cursor:"pointer",transition:"background .12s"}}
                    onMouseEnter={e=>e.currentTarget.style.background=T.glassHover}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{padding:"13px 14px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <ProductThumb product={p} size={40}/>
                        <div>
                          <div style={{color:T.ink,fontWeight:600,fontSize:12,marginBottom:2}}>{mojibakeFix(p.name)}</div>
                          <div style={{display:"flex",gap:4}}>
                            {p.isNew&&<span style={{background:T.blue+"20",color:T.blueLight,fontSize:8,fontWeight:700,padding:"1px 7px",borderRadius:10,letterSpacing:.5}}>NOUVEAU</span>}
                            {pt?.type==="slow"&&<span style={{background:T.orange+"20",color:T.orangeLight,fontSize:8,fontWeight:700,padding:"1px 7px",borderRadius:10,letterSpacing:.5}}>LENT</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{padding:"13px 14px",fontFamily:"'DM Mono',monospace",fontSize:10,color:T.bronze}}>{mojibakeFix(p.ref)}</td>
                    <td style={{padding:"13px 14px"}}>
                      <span style={{background:T.panelRaised,borderRadius:6,padding:"3px 8px",fontSize:10,color:T.ivoryMuted}}>{CAT_ICONS[mojibakeFix(p.category)] || "📦"} {mojibakeFix(p.category)}</span>
                    </td>
                    <td style={{padding:"13px 14px"}}>
                      <span style={{fontFamily:"'DM Mono',monospace",color:ss.c,fontWeight:500,fontSize:15}}>{p.stock}</span>
                      <span style={{fontSize:9,color:T.ivoryMuted,display:"block"}}>min {p.stockMin}</span>
                    </td>
                    <td style={{padding:"13px 14px",fontFamily:"'DM Mono',monospace",fontSize:11,color:T.inkDim,whiteSpace:"nowrap"}}>{money(p.price)}</td>
                    <td style={{padding:"13px 14px",fontFamily:"'DM Mono',monospace",fontSize:11,color:T.bronze,fontWeight:500,whiteSpace:"nowrap"}}>{money(p.priceShop)}</td>
                    <td style={{padding:"13px 14px",fontFamily:"'DM Mono',monospace",fontSize:11,color:T.green}}>+{m}%</td>
                    <td style={{padding:"13px 14px",fontFamily:"'DM Mono',monospace",fontSize:13,color:T.gold,fontWeight:500}}>{p.sales}</td>
                    <td style={{padding:"13px 14px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:5}}>
                        <div style={{width:38,height:3,background:T.panelRaised,borderRadius:2,overflow:"hidden"}}>
                          <div style={{height:"100%",width:Math.max(4,100-p.daysInStock/2.5)+"%",background:p.daysInStock>150?T.orange:p.daysInStock>90?T.gold:T.green,borderRadius:2}}/>
                        </div>
                        <span style={{fontSize:9,color:T.ivoryMuted,fontFamily:"'DM Mono',monospace"}}>{p.daysInStock}j</span>
                      </div>
                    </td>
                    <td style={{padding:"13px 14px"}}>
                      <div style={{display:"flex",gap:3}}>
                        <span style={{fontSize:12}} title="Sage">{p.sage?"🟢":"🔴"}</span>
                        <span style={{fontSize:12}} title="PrestaShop">{p.presta?"🟢":"🔴"}</span>
                      </div>
                    </td>
                    <td style={{padding:"13px 14px"}}>
                      <div style={{display:"flex",gap:6}}>
                        <button onClick={e=>{e.stopPropagation();setModal(p);}} style={{padding:"5px 12px",borderRadius:8,border:`1px solid ${T.border}`,background:"transparent",color:T.ivoryMuted,fontSize:10,cursor:"pointer",fontFamily:"inherit",letterSpacing:.3,transition:"all .15s"}}
                          onMouseEnter={e=>{e.target.style.borderColor=T.bronze;e.target.style.color=T.bronze}}
                          onMouseLeave={e=>{e.target.style.borderColor=T.border;e.target.style.color=T.ivoryMuted}}>
                          Voir
                        </button>
                        <button
                          onClick={e=>{e.stopPropagation(); if (p.productUrl) window.open(p.productUrl, "_blank", "noopener,noreferrer");}}
                          style={{padding:"5px 9px",borderRadius:8,border:`1px solid ${T.border}`,background:"transparent",color:T.ivoryMuted,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}
                          title="Ouvrir sur PrestaShop"
                        >↗</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length===0&&<div style={{padding:48,textAlign:"center",color:T.ivoryMuted,fontStyle:"italic",fontFamily:"'Montserrat','Open Sans',sans-serif",fontSize:18}}>Aucun produit trouvé</div>}
      </div>

      <div style={{marginTop:12,display:"flex",justifyContent:"space-between",fontSize:11,color:T.ivoryMuted}}>
        <span>{filtered.length} produit(s) affiché(s)</span>
        <span>Valeur stock visible : {money(filtered.reduce((s,p)=>s+p.priceShop*p.stock,0))}</span>
      </div>
    </div>
  );
}

/* â”€â”€â”€ REPORTING MODULE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function ReportingModule() {
  const [promoF, setPromoF] = useState("all");
  const [sales,  setSales]  = useState(false);

  const totalS = SALES.reduce((s,d)=>s+d.sage,0);
  const totalP = SALES.reduce((s,d)=>s+d.presta,0);
  const maxVal = Math.max(...SALES.flatMap(d=>[d.sage,d.presta]));

  const newProds    = PRODUCTS.filter(p=>p.isNew);
  const slowProds   = PRODUCTS.filter(p=>p.daysInStock>180);
  const medProds    = PRODUCTS.filter(p=>p.daysInStock>90&&p.daysInStock<=180&&!p.isNew);
  const ruptProds   = PRODUCTS.filter(p=>p.stock===0);
  const saleProds   = PRODUCTS.filter(p=>p.daysInStock>60&&p.stock>0&&!p.isNew);

  const GROUPS = [
    {id:"new",  icon:"ðŸ†•", label:"NouveautÃ©s Ã  promouvoir",  color:T.blue,   data:newProds,  action:"Homepage + RÃ©seaux + Email",       discount:null, urgency:"PRIORITÃ‰ HAUTE", tip:"Les nouveautÃ©s gÃ©nÃ¨rent 3Ã— plus d'engagement les 30 premiers jours."},
    {id:"slow", icon:"ðŸ¢", label:"Rotation lente (>180j)",   color:T.orange, data:slowProds, action:"Remise âˆ’20 Ã  âˆ’30 % recommandÃ©e",    discount:25,   urgency:"ACTION REQUISE",  tip:"Ces articles immobilisent du capital. Une remise amÃ©liore la trÃ©sorerie."},
    {id:"med",  icon:"âš¡", label:"Ã€ dynamiser (90â€“180j)",    color:T.gold,   data:medProds,  action:"Newsletter + Offre groupÃ©e",        discount:10,   urgency:"Ã€ SURVEILLER",    tip:"Proposer en lot avec des best-sellers pour relancer les ventes."},
    {id:"rupt", icon:"ðŸš¨", label:"Ruptures de stock",         color:T.red,    data:ruptProds, action:"Relance fournisseur urgente",       discount:null, urgency:"URGENT",           tip:"Chaque jour de rupture = ventes manquÃ©es. Activer la liste d'attente."},
    ...(sales?[{id:"sale",icon:"ðŸ·ï¸",label:"Candidats soldes",color:"#c060a0",data:saleProds,action:"Solde âˆ’30 Ã  âˆ’50 %",discount:40,urgency:"MODE SOLDES",tip:"SÃ©lection intelligente basÃ©e sur rotation et stock disponible."}]:[]),
  ];
  const ALL_TABS = [{id:"all",label:"Tout voir",icon:"â—Ž"},...GROUPS];
  const displayGroups = promoF==="all" ? GROUPS : GROUPS.filter(g=>g.id===promoF);

  return (
    <div style={{padding:"28px 32px"}}>
      <SectionTitle sub="DonnÃ©es temps rÃ©el Â· Sage + PrestaShop via Atoo-Sync">Reporting & OpÃ©rations Promotionnelles</SectionTitle>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:12,marginBottom:28}}>
        <KpiCard icon="ðŸ’¼" label="CA Sage 6 mois"   value={(totalS/1000).toFixed(0)+"k â‚¬"} color={T.bronze} sub="Ventes directes"/>
        <KpiCard icon="ðŸ›’" label="CA PrestaShop"    value={(totalP/1000).toFixed(0)+"k â‚¬"} color={T.blue}   sub="E-commerce"/>
        <KpiCard icon="ðŸ“¦" label="Valeur du stock"  value={(PRODUCTS.reduce((s,p)=>s+p.priceShop*p.stock,0)/1000).toFixed(0)+"k â‚¬"} color={T.gold} sub="Prix public TTC"/>
        <KpiCard icon="ðŸš¨" label="Ruptures"         value={ruptProds.length}  color={T.red}    sub="Ã€ commander"/>
        <KpiCard icon="ðŸ¢" label="Rotation lente"   value={slowProds.length}  color={T.orange} sub="DÃ©stocker"/>
        <KpiCard icon="ðŸ†•" label="NouveautÃ©s"       value={newProds.length}   color={T.green}  sub="Ã€ promouvoir"/>
      </div>

      {/* Chart */}
      <div style={{background:T.panel,borderRadius:18,padding:28,marginBottom:24,border:`1px solid ${T.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
          <div>
            <h3 style={{fontFamily:"'Montserrat','Open Sans',sans-serif",fontSize:18,fontWeight:600,color:T.ivory,margin:"0 0 4px"}}>Ã‰volution du chiffre d'affaires</h3>
            <p style={{margin:0,fontSize:11,color:T.ivoryMuted}}>6 derniers mois Â· Sage vs PrestaShop</p>
          </div>
          <div style={{display:"flex",gap:20}}>
            {[{c:T.bronze,l:"Sage",v:totalS},{c:T.blue,l:"PrestaShop",v:totalP}].map(({c,l,v})=>(
              <div key={l} style={{textAlign:"right"}}>
                <div style={{display:"flex",alignItems:"center",gap:6,justifyContent:"flex-end",marginBottom:3}}>
                  <div style={{width:8,height:8,borderRadius:2,background:c}}/>
                  <span style={{fontSize:10,color:T.ivoryMuted,textTransform:"uppercase",letterSpacing:.8}}>{l}</span>
                </div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:18,fontWeight:500,color:c}}>{(v/1000).toFixed(0)}k â‚¬</div>
              </div>
            ))}
          </div>
        </div>
        {/* Bars */}
        <div style={{display:"flex",alignItems:"flex-end",gap:8,height:140}}>
          {SALES.map(d=>(
            <div key={d.month} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
              <div style={{display:"flex",gap:3,alignItems:"flex-end",width:"100%",justifyContent:"center"}}>
                <div style={{width:"44%",height:(d.sage/maxVal*120)+"px",minHeight:4,background:`linear-gradient(to top,${T.bronze},${T.bronze}66)`,borderRadius:"4px 4px 0 0",transition:"height .5s ease"}}/>
                <div style={{width:"44%",height:(d.presta/maxVal*120)+"px",minHeight:4,background:`linear-gradient(to top,${T.blue},${T.blue}66)`,borderRadius:"4px 4px 0 0",transition:"height .5s ease"}}/>
              </div>
              <div style={{fontSize:10,color:T.ivoryMuted,fontFamily:"'DM Mono',monospace"}}>{d.month}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top 2 charts */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24}}>
        {/* Top produits */}
        <div style={{background:T.panel,borderRadius:18,padding:22,border:`1px solid ${T.border}`}}>
          <h3 style={{fontFamily:"'Montserrat','Open Sans',sans-serif",fontSize:16,fontWeight:600,color:T.ivory,margin:"0 0 18px"}}>Classement des ventes</h3>
          {[...PRODUCTS].sort((a,b)=>b.sales-a.sales).slice(0,5).map((p,i)=>(
            <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:[T.gold,T.ivoryMuted,T.bronze,T.ivoryDeep,T.ivoryDeep][i],width:18,flexShrink:0,textAlign:"center",fontWeight:500}}>
                {["â‘ ","â‘¡","â‘¢","â‘£","â‘¤"][i]}
              </div>
              <span style={{fontSize:18}}>{p.image}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:11,color:T.ink,marginBottom:4,fontWeight:500}}>{p.name}</div>
                <div style={{height:3,background:T.panelRaised,borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",width:(p.sales/112*100)+"%",background:`linear-gradient(90deg,${T.bronze},${T.gold})`,borderRadius:2}}/>
                </div>
              </div>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:13,color:T.gold,fontWeight:500,minWidth:28,textAlign:"right"}}>{p.sales}</div>
            </div>
          ))}
        </div>
        {/* CA catÃ©gories */}
        <div style={{background:T.panel,borderRadius:18,padding:22,border:`1px solid ${T.border}`}}>
          <h3 style={{fontFamily:"'Montserrat','Open Sans',sans-serif",fontSize:16,fontWeight:600,color:T.ivory,margin:"0 0 18px"}}>CA par catÃ©gorie</h3>
          {CATS.map(cat=>{
            const prods=PRODUCTS.filter(p=>p.category===cat);
            const ca=prods.reduce((s,p)=>s+p.priceShop*p.sales,0);
            const maxCa=Math.max(...CATS.map(c=>PRODUCTS.filter(p=>p.category===c).reduce((s,p)=>s+p.priceShop*p.sales,0)));
            return (
              <div key={cat} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <span style={{fontSize:14,width:20}}>{CAT_ICONS[cat]}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:10,color:T.ivoryMuted,marginBottom:3}}>{cat}</div>
                  <div style={{height:3,background:T.panelRaised,borderRadius:2,overflow:"hidden"}}>
                    <div style={{height:"100%",width:(ca/maxCa*100)+"%",background:T.bronze,borderRadius:2}}/>
                  </div>
                </div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:T.bronze,minWidth:48,textAlign:"right"}}>{(ca/1000).toFixed(0)}k â‚¬</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* â”€â”€ PROMO SECTION â”€â”€ */}
      <div style={{background:T.panel,borderRadius:18,padding:28,border:`1px solid ${T.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
          <div>
            <h3 style={{fontFamily:"'Montserrat','Open Sans',sans-serif",fontSize:20,fontWeight:600,color:T.ivory,margin:"0 0 4px"}}>OpÃ©rations Promotionnelles</h3>
            <p style={{margin:0,fontSize:11,color:T.ivoryMuted}}>Recommandations intelligentes basÃ©es sur votre catalogue</p>
          </div>
          <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
            <span style={{fontSize:11,color:sales?"#c060a0":T.ivoryMuted,fontWeight:600,letterSpacing:.3}}>ðŸ· PÃ©riode de soldes</span>
            <div onClick={()=>setSales(!sales)} style={{width:42,height:22,borderRadius:11,background:sales?"#c060a0":T.border,position:"relative",cursor:"pointer",transition:"background .2s",flexShrink:0}}>
              <div style={{position:"absolute",top:3,left:sales?23:3,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,.3)"}}/>
            </div>
          </label>
        </div>

        {sales&&(
          <div style={{background:"#c060a018",border:"1px solid #c060a033",borderRadius:12,padding:"12px 18px",marginBottom:16,display:"flex",gap:12,alignItems:"center"}}>
            <span style={{fontSize:26}}>🏷️</span>
            <div>
              <div style={{fontWeight:700,color:"#e090c0",fontSize:13}}>Mode soldes activé — {saleProds.length} produits éligibles</div>
              <div style={{fontSize:11,color:T.ivoryMuted,marginTop:2}}>Sélection basée sur ancienneté stock (&gt;60j) · Remise suggérée −40 %</div>
            </div>
          </div>
        )}

        <div style={{display:"flex",gap:6,marginBottom:22,flexWrap:"wrap"}}>
          {ALL_TABS.map(g=>(
            <Pill key={g.id} active={promoF===g.id} color={g.color||T.bronze} onClick={()=>setPromoF(g.id)}>
              {g.icon} {g.label} {g.data&&<span style={{opacity:.6,fontSize:10}}>({g.data.length})</span>}
            </Pill>
          ))}
        </div>

        {displayGroups.filter(g=>g.data.length>0).map(group=>(
          <div key={group.id} style={{marginBottom:20,borderRadius:16,overflow:"hidden",border:`1px solid ${group.color}28`}}>
            {/* Group header */}
            <div style={{background:`linear-gradient(135deg,${group.color}14,${group.color}08)`,padding:"16px 20px",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,borderBottom:`1px solid ${group.color}22`}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:5}}>
                  <span style={{fontSize:18}}>{group.icon}</span>
                  <h4 style={{fontFamily:"'Montserrat','Open Sans',sans-serif",fontSize:16,fontWeight:600,color:group.color,margin:0}}>{group.label}</h4>
                  <span style={{background:group.color+"22",color:group.color,fontSize:8,fontWeight:700,padding:"2px 9px",borderRadius:20,letterSpacing:.8,border:`1px solid ${group.color}33`}}>{group.urgency}</span>
                </div>
                <p style={{margin:"0 0 4px",fontSize:12,color:T.inkDim}}>â†’ {group.action}</p>
                <p style={{margin:0,fontSize:11,color:group.color+"aa",fontStyle:"italic"}}>ðŸ’¡ {group.tip}</p>
              </div>
              <div style={{display:"flex",gap:8,flexShrink:0}}>
                <button style={{padding:"8px 16px",borderRadius:8,border:"none",cursor:"pointer",background:group.color,color:"#fff",fontSize:11,fontWeight:700,fontFamily:"inherit"}}>CrÃ©er campagne</button>
                <button style={{padding:"8px 12px",borderRadius:8,border:`1px solid ${group.color}44`,cursor:"pointer",background:"transparent",color:group.color,fontSize:11,fontFamily:"inherit"}}>Export</button>
              </div>
            </div>
            {/* Products rows */}
            {group.data.map((p,i)=>{
              const dp=group.discount?Math.round(p.priceShop*(1-group.discount/100)):null;
              return (
                <div key={p.id} style={{display:"flex",alignItems:"center",gap:14,padding:"13px 20px",background:i%2===0?T.bg+"66":"transparent",borderBottom:i<group.data.length-1?`1px solid ${T.border}22`:"none"}}>
                  <div style={{width:36,height:36,borderRadius:9,background:T.panelRaised,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{p.image}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,color:T.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                    <div style={{fontSize:10,color:T.ivoryMuted,marginTop:2,fontFamily:"'DM Mono',monospace"}}>{p.ref} Â· {p.daysInStock}j stock Â· {p.stock}u Â· {p.sales} ventes</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:14,color:dp?T.inkMuted:T.ink,fontWeight:dp?"400":"500",textDecoration:dp?"line-through":"none"}}>{p.priceShop.toLocaleString("fr-FR")} â‚¬</div>
                    {dp&&<div style={{fontFamily:"'DM Mono',monospace",fontSize:14,color:group.color,fontWeight:500}}>{dp.toLocaleString("fr-FR")} â‚¬ <span style={{fontSize:10,opacity:.8}}>âˆ’{group.discount}%</span></div>}
                  </div>
                  <div style={{display:"flex",gap:6,flexShrink:0}}>
                    <button style={{padding:"6px 14px",borderRadius:8,border:"none",cursor:"pointer",background:group.color+"22",color:group.color,fontSize:11,fontWeight:700,fontFamily:"inherit"}}>Appliquer</button>
                    <button style={{padding:"6px 10px",borderRadius:8,border:`1px solid ${T.border}`,cursor:"pointer",background:"transparent",color:T.ivoryMuted,fontSize:11,fontFamily:"inherit"}}>ðŸŽ¨</button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* â”€â”€â”€ STUDIO MODULE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const TEMPLATES = [
  {id:"t1",name:"Maison Chaleureuse",bg:"#1a1208",accent:"#c8955a",accent2:"#d4a843",badge:"NouveautÃ©",overlay:"rgba(200,149,90,0.08)"},
  {id:"t2",name:"Promo Ã‰lÃ©gante",   bg:"#160e0e",accent:"#c85a5a",accent2:"#e07a7a",badge:"âˆ’25 %",    overlay:"rgba(200,90,90,0.08)"},
  {id:"t3",name:"Ã‰purÃ© Luxe",       bg:"#f0ece2",accent:"#5a4e3e",accent2:"#9a6e3a",badge:"Collection",overlay:"rgba(90,78,62,0.05)"},
  {id:"t4",name:"Showroom Sombre",  bg:"#0c0b09",accent:"#d4a843",accent2:"#c8955a",badge:"Exclusif", overlay:"rgba(212,168,67,0.06)"},
  {id:"t5",name:"Nature & Bois",    bg:"#0d150a",accent:"#5a9e72",accent2:"#7ac492",badge:"Ã‰co-design",overlay:"rgba(90,158,114,0.08)"},
  {id:"t6",name:"Nuit de Velours",  bg:"#0a0a14",accent:"#8878c8",accent2:"#aaa0e8",badge:"Premium", overlay:"rgba(136,120,200,0.08)"},
];
const FMTS = {
  "Post CarrÃ© (1:1)":  {w:320,h:320},
  "Story (9:16)":       {w:202,h:360},
  "BanniÃ¨re Web":       {w:480,h:192},
  "Portrait (4:5)":     {w:256,h:320},
  "Couverture FB":      {w:480,h:178},
};

function CanvasPreview({layers,fmt,scale=1}) {
  const dim = FMTS[fmt]||FMTS["Post CarrÃ© (1:1)"];
  const bg  = layers.find(l=>l.type==="background");
  const vis = [...layers].reverse().filter(l=>l.visible&&l.type!=="background");
  const s   = scale;
  return (
    <div style={{width:dim.w*s,height:dim.h*s,background:bg?.color||"#1a1208",borderRadius:14*s,overflow:"hidden",position:"relative",flexShrink:0,boxShadow:`0 ${28*s}px ${80*s}px rgba(0,0,0,.7)`,border:`1px solid rgba(255,255,255,.07)`}}>
      {/* Grain texture */}
      <div style={{position:"absolute",inset:0,backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",backgroundSize:"200px",opacity:0.4,zIndex:0}}/>
      {/* Radial glow */}
      <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 50% 110%,${bg?.accent||"#c8955a"}2a 0%,transparent 65%)`,zIndex:0}}/>
      {/* Diagonal overlay */}
      <div style={{position:"absolute",inset:0,background:bg?.overlay||"transparent",zIndex:0}}/>

      {vis.map(layer=>{
        if(layer.type==="shape") return <div key={layer.id} style={{position:"absolute",bottom:0,left:0,right:0,height:"38%",background:layer.color||"rgba(255,255,255,.04)",clipPath:"polygon(0 40%,100% 0,100% 100%,0 100%)",zIndex:1}}/>;
        if(layer.type==="product") return <div key={layer.id} style={{position:"absolute",left:"50%",top:layer.top||"26%",transform:"translateX(-50%)",fontSize:dim.w*.22*s+"px",zIndex:3,filter:`drop-shadow(0 ${10*s}px ${20*s}px rgba(0,0,0,.5))`}}>{layer.emoji}</div>;
        if(layer.type==="badge") return <div key={layer.id} style={{position:"absolute",top:layer.top||"9%",left:"50%",transform:"translateX(-50%)",background:layer.color||"#c8955a",color:layer.tc||"#fff",borderRadius:5*s,padding:`${3.5*s}px ${11*s}px`,fontSize:10*s,fontWeight:900,zIndex:5,letterSpacing:.5,whiteSpace:"nowrap",boxShadow:`0 ${2*s}px ${8*s}px rgba(0,0,0,.3)`}}>{layer.text}</div>;
        if(layer.type==="text") return <div key={layer.id} style={{position:"absolute",left:"50%",top:layer.top||"59%",transform:"translateX(-50%)",color:layer.color||"#f0ece2",fontSize:(layer.size||12)*s,fontWeight:layer.weight||600,zIndex:4,textAlign:"center",width:"88%",lineHeight:1.3,textShadow:`0 ${2*s}px ${8*s}px rgba(0,0,0,.5)`}}>{layer.text}</div>;
        if(layer.type==="price") return <div key={layer.id} style={{position:"absolute",left:"50%",top:layer.top||"71%",transform:"translateX(-50%)",color:layer.color||"#c8955a",fontSize:(layer.size||21)*s,fontWeight:600,zIndex:4,letterSpacing:-0.5,fontFamily:"'DM Mono',monospace",textShadow:`0 ${2*s}px ${8*s}px rgba(0,0,0,.4)`}}>{layer.text}</div>;
        if(layer.type==="logo") return <div key={layer.id} style={{position:"absolute",bottom:10*s,right:12*s,fontSize:8*s,fontWeight:700,color:bg?.accent||"#c8955a",letterSpacing:1,zIndex:6,opacity:.8,textTransform:"uppercase"}}>{layer.visible?"HOUSE-STORE.COM":""}</div>;
        return null;
      })}
      {/* Vignette */}
      <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 50% 50%,transparent 50%,rgba(0,0,0,.35) 100%)`,zIndex:2,pointerEvents:"none"}}/>
      {/* Bottom gradient */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:"45%",background:`linear-gradient(to top,${bg?.color||"#1a1208"}cc,transparent)`,zIndex:2}}/>
      {/* Accent line */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:2.5*s,background:`linear-gradient(90deg,${bg?.accent||"#c8955a"},${bg?.accent2||"#d4a843"},${bg?.accent||"#c8955a"})`,zIndex:10}}/>
    </div>
  );
}

function StudioModule() {
  const [fmt,  setFmt]  = useState("Post CarrÃ© (1:1)");
  const [tpl,  setTpl]  = useState(TEMPLATES[0]);
  const [prod, setProd] = useState(PRODUCTS[0]);
  const [selId,setSelId]= useState(null);
  const [tab,  setTab]  = useState("templates");

  const makeLayers = (t,p) => [
    {id:"bg",   name:"Fond",           type:"background",visible:true, color:t.bg, accent:t.accent, accent2:t.accent2, overlay:t.overlay},
    {id:"logo", name:"Logo",           type:"logo",      visible:true},
    {id:"shape",name:"Forme dÃ©co",     type:"shape",     visible:true, color:t.accent+"10"},
    {id:"badge",name:"Badge",          type:"badge",     visible:true, text:t.badge, color:t.accent, tc:t.bg==="#f0ece2"?"#1a1208":"#fff", top:"9%"},
    {id:"prod", name:"Produit",        type:"product",   visible:true, emoji:p.image, top:"26%"},
    {id:"title",name:"Titre",          type:"text",      visible:true, text:p.name, color:t.bg==="#f0ece2"?"#2a1e10":"#f0ece2", size:12, weight:600, top:"59%"},
    {id:"price",name:"Prix",           type:"price",     visible:true, text:p.priceShop.toLocaleString("fr-FR")+" â‚¬", color:t.accent, size:20, top:"71%"},
  ];
  const [layers,setLayers] = useState(()=>makeLayers(TEMPLATES[0],PRODUCTS[0]));

  const applyTpl  = t => { setTpl(t); setLayers(makeLayers(t,prod)); };
  const applyProd = p => {
    setProd(p);
    setLayers(prev=>prev.map(l=>
      l.type==="product"?{...l,emoji:p.image,name:"Produit â€” "+p.name}
      :l.id==="title"?{...l,text:p.name}
      :l.id==="price"?{...l,text:p.priceShop.toLocaleString("fr-FR")+" â‚¬"}
      :l));
  };
  const upd = (id,up)=>setLayers(prev=>prev.map(l=>l.id===id?{...l,...up}:l));
  const del = id=>setLayers(prev=>prev.filter(l=>l.id!==id));
  const mov = (id,d)=>setLayers(prev=>{const a=[...prev];const i=a.findIndex(l=>l.id===id);const ni=i+d;if(ni<0||ni>=a.length)return a;[a[i],a[ni]]=[a[ni],a[i]];return a;});
  const add = type=>{
    const id="c"+Date.now();
    const defs={text:{id,name:"Texte",type:"text",visible:true,text:"Votre texte",color:"#f0ece2",size:13,weight:600,top:"50%"},badge:{id,name:"Badge",type:"badge",visible:true,text:"Promo",color:T.gold,tc:"#000",top:"18%"},shape:{id,name:"Forme",type:"shape",visible:true,color:"rgba(200,149,90,.08)"}};
    if(defs[type])setLayers(prev=>[...prev,defs[type]]);
  };
  const sel  = layers.find(l=>l.id===selId);
  const dim  = FMTS[fmt]||FMTS["Post CarrÃ© (1:1)"];
  const LICONS = {background:"â—¼",product:"ðŸ“¦",text:"T",badge:"ðŸ·",shape:"â—»",logo:"â­",price:"â‚¬"};

  return (
    <div style={{display:"flex",height:"calc(100vh - 112px)",minHeight:580,overflow:"hidden"}}>

      {/* LEFT */}
      <div style={{width:252,borderRight:`1px solid ${T.border}`,background:T.panel,display:"flex",flexDirection:"column",flexShrink:0,overflow:"hidden"}}>
        {/* Tabs */}
        <div style={{display:"flex",borderBottom:`1px solid ${T.border}`}}>
          {[{id:"templates",icon:"â¬¡",l:"Templates"},{id:"layers",icon:"â‰¡",l:"Calques"},{id:"product",icon:"ðŸ›‹ï¸",l:"Produit"}].map(tb=>(
            <button key={tb.id} onClick={()=>setTab(tb.id)} style={{flex:1,padding:"12px 4px",border:"none",background:"none",cursor:"pointer",color:tab===tb.id?T.bronze:T.inkMuted,fontSize:9,fontWeight:700,borderBottom:`2px solid ${tab===tb.id?T.bronze:"transparent"}`,display:"flex",flexDirection:"column",alignItems:"center",gap:2,textTransform:"uppercase",letterSpacing:.8,fontFamily:"inherit"}}>
              <span style={{fontSize:15}}>{tb.icon}</span>{tb.l}
            </button>
          ))}
        </div>
        <div style={{flex:1,overflowY:"auto",padding:14}}>

          {/* TEMPLATES */}
          {tab==="templates"&&<>
            <div style={{fontSize:9,color:T.ivoryMuted,fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:1.2}}>ModÃ¨les</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
              {TEMPLATES.map(t=>(
                <div key={t.id} onClick={()=>applyTpl(t)} style={{borderRadius:10,overflow:"hidden",cursor:"pointer",border:`2px solid ${tpl?.id===t.id?T.bronze:T.border}`,transition:"border-color .2s"}}>
                  <div style={{height:78,background:t.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,position:"relative"}}>
                    <div style={{fontSize:24}}>{prod.image}</div>
                    <div style={{fontSize:9,color:t.accent,fontWeight:800,letterSpacing:.5}}>{t.badge}</div>
                    <div style={{position:"absolute",bottom:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${t.accent},${t.accent2})`}}/>
                  </div>
                  <div style={{padding:"5px 8px",background:T.panelRaised,fontSize:9,color:T.ivoryMuted,textAlign:"center",fontWeight:600}}>{t.name}</div>
                </div>
              ))}
            </div>
            <div style={{fontSize:9,color:T.ivoryMuted,fontWeight:700,marginBottom:8,textTransform:"uppercase",letterSpacing:1.2}}>Format</div>
            {Object.keys(FMTS).map(f=>(
              <button key={f} onClick={()=>setFmt(f)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"8px 10px",borderRadius:8,border:"none",marginBottom:3,background:fmt===f?T.bronze+"18":"transparent",color:fmt===f?T.bronze:T.inkMuted,cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>
                <span>{f}</span><span style={{fontSize:9,opacity:.6}}>{FMTS[f].w}Ã—{FMTS[f].h}</span>
              </button>
            ))}
          </>}

          {/* LAYERS */}
          {tab==="layers"&&<>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:9,color:T.ivoryMuted,fontWeight:700,textTransform:"uppercase",letterSpacing:1.2}}>Calques</div>
              <div style={{display:"flex",gap:4}}>
                {["text","badge","shape"].map(tp=>(
                  <button key={tp} onClick={()=>add(tp)} style={{padding:"3px 7px",borderRadius:5,border:`1px solid ${T.border}`,background:"transparent",color:T.ivoryMuted,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>+{tp[0].toUpperCase()}</button>
                ))}
              </div>
            </div>
            {[...layers].reverse().map(l=>(
              <div key={l.id} onClick={()=>setSelId(selId===l.id?null:l.id)} style={{display:"flex",alignItems:"center",gap:7,padding:"7px 9px",borderRadius:8,cursor:"pointer",marginBottom:3,background:selId===l.id?T.bronze+"15":"transparent",border:`1px solid ${selId===l.id?T.bronze+"44":"transparent"}`,opacity:l.visible?1:.4,transition:"all .15s"}}>
                <span style={{fontSize:11,color:T.ivoryMuted,width:14}}>{LICONS[l.type]}</span>
                <span style={{flex:1,fontSize:11,color:selId===l.id?T.bronze:T.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.name}</span>
                <div style={{display:"flex",gap:2}} onClick={e=>e.stopPropagation()}>
                  <button onClick={()=>upd(l.id,{visible:!l.visible})} style={{background:"none",border:"none",cursor:"pointer",color:T.ivoryMuted,fontSize:10,padding:2,fontFamily:"inherit"}}>{l.visible?"ðŸ‘":"â—‹"}</button>
                  <button onClick={()=>mov(l.id,-1)} style={{background:"none",border:"none",cursor:"pointer",color:T.ivoryMuted,fontSize:10,padding:2}}>â†‘</button>
                  <button onClick={()=>mov(l.id,1)}  style={{background:"none",border:"none",cursor:"pointer",color:T.ivoryMuted,fontSize:10,padding:2}}>â†“</button>
                  <button onClick={()=>del(l.id)}     style={{background:"none",border:"none",cursor:"pointer",color:T.red,fontSize:10,padding:2}}>âœ•</button>
                </div>
              </div>
            ))}
            {sel&&(
              <div style={{marginTop:14,background:T.panelRaised,borderRadius:12,padding:14,border:`1px solid ${T.border}`}}>
                <div style={{fontSize:9,color:T.ivoryMuted,fontWeight:700,marginBottom:12,textTransform:"uppercase",letterSpacing:1.2}}>PropriÃ©tÃ©s â€” {sel.name}</div>
                {["text","badge","price"].includes(sel.type)&&<>
                  <div style={{fontSize:9,color:T.ivoryMuted,marginBottom:4}}>Texte</div>
                  <input value={sel.text||""} onChange={e=>upd(sel.id,{text:e.target.value})} style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:7,padding:"7px 10px",color:T.ink,fontSize:12,marginBottom:10,boxSizing:"border-box",outline:"none",fontFamily:"inherit"}}/>
                </>}
                {["text","badge","price","product"].includes(sel.type)&&<>
                  <div style={{fontSize:9,color:T.ivoryMuted,marginBottom:4}}>Position verticale</div>
                  <input type="range" min={0} max={85} value={parseInt(sel.top)||50} onChange={e=>upd(sel.id,{top:e.target.value+"%"})} style={{width:"100%",accentColor:T.bronze,marginBottom:10}}/>
                </>}
                {["text","badge","price"].includes(sel.type)&&<>
                  <div style={{fontSize:9,color:T.ivoryMuted,marginBottom:4}}>Couleur texte</div>
                  <input type="color" value={sel.color||"#f0ece2"} onChange={e=>upd(sel.id,{color:e.target.value})} style={{width:"100%",height:28,borderRadius:6,border:"none",cursor:"pointer",marginBottom:10}}/>
                </>}
                {sel.type==="badge"&&<>
                  <div style={{fontSize:9,color:T.ivoryMuted,marginBottom:4}}>Fond badge</div>
                  <input type="color" value={sel.color||T.bronze} onChange={e=>upd(sel.id,{color:e.target.value})} style={{width:"100%",height:28,borderRadius:6,border:"none",cursor:"pointer",marginBottom:10}}/>
                </>}
                {sel.type==="background"&&<>
                  <div style={{fontSize:9,color:T.ivoryMuted,marginBottom:4}}>Couleur de fond</div>
                  <input type="color" value={sel.color||"#1a1208"} onChange={e=>upd(sel.id,{color:e.target.value})} style={{width:"100%",height:28,borderRadius:6,border:"none",cursor:"pointer",marginBottom:10}}/>
                  <div style={{fontSize:9,color:T.ivoryMuted,marginBottom:4}}>Accent</div>
                  <input type="color" value={sel.accent||T.bronze} onChange={e=>upd(sel.id,{accent:e.target.value})} style={{width:"100%",height:28,borderRadius:6,border:"none",cursor:"pointer"}}/>
                </>}
                {sel.type==="text"&&<>
                  <div style={{fontSize:9,color:T.ivoryMuted,marginBottom:4}}>Taille ({sel.size}px)</div>
                  <input type="range" min={9} max={32} value={sel.size||12} onChange={e=>upd(sel.id,{size:+e.target.value})} style={{width:"100%",accentColor:T.bronze}}/>
                </>}
              </div>
            )}
          </>}

          {/* PRODUCT */}
          {tab==="product"&&<>
            <div style={{fontSize:9,color:T.ivoryMuted,fontWeight:700,marginBottom:12,textTransform:"uppercase",letterSpacing:1.2}}>SÃ©lectionner un produit</div>
            {CATS.map(cat=>(
              <div key={cat}>
                <div style={{fontSize:9,color:T.ivoryMuted,padding:"6px 2px 4px",fontWeight:700,letterSpacing:.8,textTransform:"uppercase"}}>{CAT_ICONS[cat]} {cat}</div>
                {PRODUCTS.filter(p=>p.category===cat).map(p=>(
                  <div key={p.id} onClick={()=>applyProd(p)} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 10px",borderRadius:10,cursor:"pointer",marginBottom:3,background:prod.id===p.id?T.bronze+"15":"transparent",border:`1px solid ${prod.id===p.id?T.bronze+"44":"transparent"}`,transition:"all .15s"}}>
                    <span style={{fontSize:18}}>{p.image}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:11,color:T.ink,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                      <div style={{fontSize:9,color:T.ivoryMuted,fontFamily:"'DM Mono',monospace"}}>{p.priceShop.toLocaleString("fr-FR")} â‚¬ Â· {p.stock}u</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </>}
        </div>
      </div>

      {/* CENTER CANVAS */}
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#080706",gap:20,overflow:"auto",padding:32}}>
        <div style={{fontSize:10,color:T.ivoryMuted,background:T.panel,borderRadius:8,padding:"5px 14px",border:`1px solid ${T.border}`,fontFamily:"'DM Mono',monospace",letterSpacing:.5}}>
          {dim.w} Ã— {dim.h} px  Â·  {fmt}
        </div>
        <CanvasPreview layers={layers} fmt={fmt} scale={1}/>
        <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
          <button style={{padding:"11px 28px",borderRadius:12,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${T.bronze},${T.bronzeDark})`,color:"#fff",fontSize:13,fontWeight:700,fontFamily:"inherit",letterSpacing:.3,boxShadow:`0 4px 20px ${T.bronze}44`}}>
            â¬‡ Exporter PNG
          </button>
          {["ðŸ“‹ Dupliquer","ðŸ“¤ Partager","ðŸ’¾ Enregistrer"].map(b=>(
            <button key={b} style={{padding:"11px 16px",borderRadius:12,border:`1px solid ${T.border}`,background:"transparent",color:T.ivoryMuted,fontSize:12,cursor:"pointer",fontFamily:"inherit",transition:"border-color .15s"}}
              onMouseEnter={e=>e.target.style.borderColor=T.borderBright}
              onMouseLeave={e=>e.target.style.borderColor=T.border}>{b}</button>
          ))}
        </div>
      </div>

      {/* RIGHT â€” previews */}
      <div style={{width:150,borderLeft:`1px solid ${T.border}`,background:T.panel,padding:12,overflowY:"auto"}}>
        <div style={{fontSize:9,color:T.ivoryMuted,fontWeight:700,marginBottom:12,textTransform:"uppercase",letterSpacing:1.2}}>AperÃ§u formats</div>
        {Object.keys(FMTS).map(f=>{
          const d=FMTS[f];const mx=Math.max(d.w,d.h);const sc=100/mx;
          return (
            <div key={f} onClick={()=>setFmt(f)} style={{marginBottom:16,cursor:"pointer",opacity:fmt===f?1:.4,transition:"opacity .2s"}}>
              <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:84,marginBottom:5}}>
                <CanvasPreview layers={layers} fmt={f} scale={sc}/>
              </div>
              <div style={{fontSize:8,color:fmt===f?T.bronze:T.ivoryMuted,textAlign:"center",fontWeight:fmt===f?700:400,letterSpacing:.3}}>{f.split(" (")[0]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* â”€â”€â”€ IMAGES MODULE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function ImagesModule() {
  const [sel,setSel] = useState(null);
  return (
    <div style={{padding:"28px 32px"}}>
      <SectionTitle sub={`${PRODUCTS.length} fiches produit Â· MÃ©diathÃ¨que house-store.com`}>MÃ©diathÃ¨que</SectionTitle>
      <div style={{display:"flex",gap:10,marginBottom:24,flexWrap:"wrap"}}>
        {["â†‘ Importer des photos","ðŸ”— Synchroniser PrestaShop","âš™ Optimisation auto","ðŸ“ Tous les formats"].map(b=>(
          <button key={b} style={{padding:"9px 16px",borderRadius:10,border:`1px solid ${T.border}`,background:T.panel,color:T.inkMuted,fontSize:12,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}
            onMouseEnter={e=>{e.target.style.borderColor=T.borderBright;e.target.style.color=T.ink}}
            onMouseLeave={e=>{e.target.style.borderColor=T.border;e.target.style.color=T.inkMuted}}>{b}</button>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:14}}>
        {PRODUCTS.map(p=>{
          const imgs = p.isNew?3:Math.floor(p.id%4)+1;
          const missing = !p.sage||!p.presta;
          return (
            <div key={p.id} onClick={()=>setSel(sel===p.id?null:p.id)} style={{background:T.panel,borderRadius:16,overflow:"hidden",cursor:"pointer",border:`1px solid ${sel===p.id?T.bronze:T.border}`,transition:"all .18s",boxShadow:sel===p.id?`0 0 0 1px ${T.bronze}44,0 12px 32px rgba(0,0,0,.4)`:""}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=sel===p.id?T.bronze:T.borderWarm}
              onMouseLeave={e=>e.currentTarget.style.borderColor=sel===p.id?T.bronze:T.border}>
              <div style={{height:130,background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:52,position:"relative"}}>
                {p.image}
                {missing&&<div style={{position:"absolute",top:10,left:10,background:T.orange,color:"#fff",fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:6,letterSpacing:.5}}>âš  Non sync</div>}
                <div style={{position:"absolute",top:10,right:10,background:T.bg+"cc",borderRadius:7,padding:"2px 8px",fontSize:9,color:T.ivoryMuted,fontFamily:"'DM Mono',monospace"}}>{imgs} photo{imgs>1?"s":""}</div>
              </div>
              <div style={{padding:"12px 14px"}}>
                <div style={{fontSize:12,fontWeight:600,color:T.ink,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                <div style={{fontSize:10,color:T.ivoryMuted,fontFamily:"'DM Mono',monospace"}}>{p.ref}</div>
                {sel===p.id&&(
                  <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:5}}>
                    {["ðŸ‘ Voir & Ã©diter","â†‘ Ajouter des photos","ðŸ”„ Synchroniser"].map(a=>(
                      <button key={a} style={{padding:"7px 10px",borderRadius:8,border:"none",cursor:"pointer",background:T.bronze+"18",color:T.bronze,fontSize:11,fontWeight:600,textAlign:"left",fontFamily:"inherit"}}>{a}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* â”€â”€â”€ ASSISTANT MODULE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function AssistantModule() {
  const [msgs, setMsgs] = useState([{role:"ai",text:"Bonjour. Je suis votre conseiller stratÃ©gique pour house-store.com. J'ai accÃ¨s Ã  l'intÃ©gralitÃ© de votre catalogue, vos niveaux de stock et vos donnÃ©es de ventes. Comment puis-je vous aider aujourd'hui ?"}]);
  const [inp, setInp]   = useState("");
  const [load,setLoad]  = useState(false);
  const endRef = useRef(null);

  const SUGG = ["Quels meubles sont en rupture ?","Rotation lente â€” que faire ?","Plan campagne pour les canapÃ©s","Analyse des marges par catÃ©gorie","Mon produit star du mois","Que promouvoir cette semaine ?"];

  const respond = q=>{
    const lq=q.toLowerCase();
    if(lq.includes("rupture")||lq.includes("stock"))return `Ruptures de stock dÃ©tectÃ©es :\n${PRODUCTS.filter(p=>p.stock===0).map(p=>`â€¢ ${p.image} ${p.name} â€” ${p.ref}`).join("\n")}\n\nRecommandation immÃ©diate : relancer la commande fournisseur et activer la liste d'attente sur PrestaShop pour ces rÃ©fÃ©rences.`;
    if(lq.includes("rotation")||lq.includes("lent")||lq.includes("solder"))return `${PRODUCTS.filter(p=>p.daysInStock>150).length} produits Ã  rotation lente (>150 jours) :\n${PRODUCTS.filter(p=>p.daysInStock>150).sort((a,b)=>b.daysInStock-a.daysInStock).map(p=>`â€¢ ${p.image} ${p.name} â€” ${p.daysInStock}j â€” prix soldÃ© suggÃ©rÃ© : ${Math.round(p.priceShop*.75).toLocaleString("fr-FR")} â‚¬ (âˆ’25%)`).join("\n")}\n\nStratÃ©gie : crÃ©er un lot Â«DÃ©couverte MaisonÂ» combinant ces piÃ¨ces avec des best-sellers pour dÃ©stocker sans casser l'image prix.`;
    if(lq.includes("campagne")||lq.includes("canapÃ©"))return `Plan campagne â€” Collection CanapÃ©s :\n\nâ‘  Instagram Â· mise en scÃ¨ne lifestyle du CanapÃ© Velours Anthracite dans un intÃ©rieur complet\nâ‘¡ Email ciblÃ© Â· segment Â«IntÃ©ressÃ©s salonÂ» Â· offre dÃ©couverte âˆ’10%\nâ‘¢ Google Shopping Â· enchÃ¨res renforcÃ©es sur la gamme canapÃ©s printemps\nâ‘£ Vitrine magasin Â· espace Â«Salon completÂ» CanapÃ© + Table + Fauteuil\n\nBudget suggÃ©rÃ© : 300 â‚¬ Meta Ads Â· ROI estimÃ© : Ã—4\n\nJe peux gÃ©nÃ©rer les visuels directement dans le Studio.`;
    if(lq.includes("marge")||lq.includes("catÃ©gorie"))return `Analyse des marges par catÃ©gorie :\n\nðŸ† Meilleures marges\nâ€¢ Chaises +24% Â· Luminaires +23% Â· DÃ©coration +22%\n\nâš  Ã€ surveiller\nâ€¢ Literie +18% Â· Rangement +19%\n\nRecommandation : privilÃ©gier Chaises, Luminaires et DÃ©coration dans les communications pour maximiser la rentabilitÃ© par â‚¬ investi.`;
    if(lq.includes("star")||lq.includes("meilleur")){const t=[...PRODUCTS].sort((a,b)=>b.sales-a.sales)[0];return `Produit star : ${t.image} ${t.name}\n\nâ†’ ${t.sales} unitÃ©s vendues\nâ†’ Prix boutique : ${t.priceShop.toLocaleString("fr-FR")} â‚¬\nâ†’ Marge : +${(((t.priceShop-t.price)/t.price)*100).toFixed(0)}%\nâ†’ Stock restant : ${t.stock} u.\n\nConseil : l'utiliser comme produit d'appel dans vos publicitÃ©s et proposer des ventes croisÃ©es avec des complÃ©ments de dÃ©coration.`;}
    if(lq.includes("promouvoir")||lq.includes("semaine")||lq.includes("mois"))return `Plan promotionnel house-store.com :\n\nâ‘  NOUVEAUTÃ‰S (prioritÃ© 1)\nFauteuil Bouclette + Table Marbre Â· homepage + Instagram\n\nâ‘¡ DÃ‰STOCKER (prioritÃ© 2)\nTapis BerbÃ¨re + Armoire + BibliothÃ¨que Â· page Â«Ventes FlashÂ» âˆ’20%\n\nâ‘¢ BOOSTER LES STARS\nChaise Velours + Lampadaire Â· offre Â«ComplÃ©ter votre intÃ©rieurÂ»\n\nâ‘£ URGENCE STOCK\nRelancer commande Armoire Haussmannienne (rupture)\n\nSouhaitez-vous le planning Ã©ditorial complet ?`;
    return `Vue d'ensemble de votre catalogue :\n\nâ†’ ${PRODUCTS.length} rÃ©fÃ©rences Â· ${[...new Set(PRODUCTS.map(p=>p.category))].length} catÃ©gories\nâ†’ ${PRODUCTS.filter(p=>p.sage&&p.presta).length}/${PRODUCTS.length} produits synchronisÃ©s Atoo-Sync\nâ†’ ${PRODUCTS.filter(p=>p.isNew).length} nouveautÃ©s Ã  promouvoir\nâ†’ ${PRODUCTS.filter(p=>p.daysInStock>150).length} rÃ©fÃ©rences Ã  dÃ©stocker\nâ†’ Valeur totale du stock : ${PRODUCTS.reduce((s,p)=>s+p.priceShop*p.stock,0).toLocaleString("fr-FR")} â‚¬\n\nComment puis-je affiner cette analyse ?`;
  };

  const send = async msg => {
    if(!msg.trim())return;
    const nm=[...msgs,{role:"user",text:msg}];
    setMsgs(nm);setInp("");setLoad(true);
    await new Promise(r=>setTimeout(r,800));
    setMsgs([...nm,{role:"ai",text:respond(msg)}]);setLoad(false);
  };
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"})},[msgs,load]);

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",minHeight:500}}>
      <div style={{padding:"20px 28px 0",borderBottom:`1px solid ${T.border}`,background:T.panel,flexShrink:0}}>
        <SectionTitle sub="Analyse en temps rÃ©el Â· Recommandations personnalisÃ©es">Assistant StratÃ©gique</SectionTitle>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",paddingBottom:16}}>
          {SUGG.map(s=>(
            <button key={s} onClick={()=>send(s)} style={{padding:"5px 12px",borderRadius:20,border:`1px solid ${T.border}`,background:"transparent",color:T.ivoryMuted,fontSize:11,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}
              onMouseEnter={e=>{e.target.style.borderColor=T.bronze;e.target.style.color=T.bronze}}
              onMouseLeave={e=>{e.target.style.borderColor=T.border;e.target.style.color=T.ivoryMuted}}>{s}</button>
          ))}
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"20px 28px 0"}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",gap:12,marginBottom:16,flexDirection:m.role==="user"?"row-reverse":"row"}}>
            <div style={{width:34,height:34,borderRadius:"50%",flexShrink:0,background:m.role==="ai"?`linear-gradient(135deg,${T.bronze},${T.gold})`:T.panelRaised,border:`1px solid ${T.borderWarm}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>
              {m.role==="ai"?"â—Ž":"â—‡"}
            </div>
            <div style={{maxWidth:"70%",padding:"13px 17px",borderRadius:m.role==="ai"?"4px 16px 16px 16px":"16px 4px 16px 16px",background:m.role==="ai"?T.panel:T.bronze+"20",fontSize:13,color:T.ink,lineHeight:1.65,whiteSpace:"pre-wrap",border:`1px solid ${m.role==="ai"?T.border:T.bronze+"33"}`,boxShadow:"0 2px 12px rgba(0,0,0,.2)"}}>
              {m.text}
            </div>
          </div>
        ))}
        {load&&(
          <div style={{display:"flex",gap:12,marginBottom:16}}>
            <div style={{width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${T.bronze},${T.gold})`,border:`1px solid ${T.borderWarm}`,display:"flex",alignItems:"center",justifyContent:"center"}}>â—Ž</div>
            <div style={{padding:"13px 17px",background:T.panel,borderRadius:"4px 16px 16px 16px",border:`1px solid ${T.border}`,display:"flex",gap:5,alignItems:"center"}}>
              {[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:T.bronze,animation:`bounce 1.2s ease-in-out ${i*.2}s infinite`}}/>)}
            </div>
          </div>
        )}
        <div ref={endRef}/>
      </div>
      <div style={{padding:"16px 28px 24px",display:"flex",gap:10,borderTop:`1px solid ${T.border}`,background:T.panel}}>
        <input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send(inp)}
          placeholder="Posez votre question stratÃ©giqueâ€¦"
          style={{flex:1,background:T.bg,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 18px",color:T.ink,fontSize:13,outline:"none",fontFamily:"inherit",transition:"border-color .2s"}}
          onFocus={e=>e.target.style.borderColor=T.bronze}
          onBlur={e=>e.target.style.borderColor=T.border}
        />
        <button onClick={()=>send(inp)} disabled={!inp.trim()} style={{padding:"12px 20px",borderRadius:12,border:"none",cursor:"pointer",background:inp.trim()?`linear-gradient(135deg,${T.bronze},${T.bronzeDark})`:`${T.bronze}44`,color:"#fff",fontSize:15,fontWeight:700,fontFamily:"inherit",transition:"all .2s",boxShadow:inp.trim()?`0 4px 16px ${T.bronze}44`:"none"}}>â†’</button>
      </div>
    </div>
  );
}

/* â”€â”€â”€ MAIN APP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const MODULES = [
  {id:"products",  icon:"ðŸ“¦",  label:"Catalogue",           color:T.bronze},
  {id:"images",    icon:"ðŸ–¼ï¸",  label:"Images",              color:T.blue},
  {id:"reporting", icon:"ðŸ“Š",  label:"Stats & Promotions",  color:T.green},
  {id:"studio",    icon:"ðŸŽ¨",  label:"Studio",              color:T.gold},
  {id:"assistant", icon:"ðŸ¤–",  label:"Assistant",           color:T.ivoryDim},
];

export default function App() {
  const [active,setActive] = useState("products");
  const [, setVersion] = useState(0);
  const [syncState, setSyncState] = useState({
    loading: false,
    lastSync: null,
    error: "",
    status: { sage: false, presta: false },
  });
  const [backendCtl, setBackendCtl] = useState({
    online: true,
    uptimeSec: 0,
    busy: false,
    msg: "",
  });
  const am = MODULES.find(m=>m.id===active);
  const CONTENT = {products:<ProductsModule/>,images:<ImagesModule/>,reporting:<ReportingModule/>,studio:<StudioModule/>,assistant:<AssistantModule/>};
  const START_BACKEND_CMD = "cd d:\\IT\\Ancien PC\\App\\HubMarketing\\hubmarketing-ui\\server && npm run supervisor";

  const refreshBackendStatus = useCallback(async () => {
    try {
      const r = await fetch(`${SUPERVISOR_BASE}/status`);
      const j = await r.json();
      setBackendCtl(prev => ({ ...prev, online: !!j.backend?.running, uptimeSec: Number(j.backend?.uptimeSec || 0) }));
    } catch {
      setBackendCtl(prev => ({ ...prev, online: false, uptimeSec: 0 }));
    }
  }, []);

  const controlBackend = useCallback(async action => {
    setBackendCtl(prev => ({ ...prev, busy: true, msg: "" }));
    try {
      const r = await fetch(`${SUPERVISOR_BASE}/${action}`, { method: "POST" });
      const j = await r.json().catch(() => ({}));
      setBackendCtl(prev => ({ ...prev, busy: false, msg: j.message || `Action ${action} envoyée.` }));
      setTimeout(() => refreshBackendStatus(), 800);
    } catch (e) {
      try {
        await navigator.clipboard.writeText(START_BACKEND_CMD);
        setBackendCtl(prev => ({ ...prev, busy: false, msg: "Superviseur non lancé. Commande copiée pour démarrer le superviseur." }));
      } catch {
        setBackendCtl(prev => ({ ...prev, busy: false, msg: `Superviseur non lancé. Lance: ${START_BACKEND_CMD}` }));
      }
    }
  }, [START_BACKEND_CMD, refreshBackendStatus]);

  const syncLiveData = useCallback(async () => {
    setSyncState(prev => ({ ...prev, loading: true, error: "" }));
    try {
      const [sageHealth, psHealth, psProductsRes, psCombRes, sageProductsRes, sageStockRes, taxRatesRes, categoriesRes, suppliersRes] = await Promise.all([
        fetch(`${API_BASE}/sage/health`).then(r => r.json()).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/prestashop/health`).then(r => r.json()).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/prestashop/products?limit=2000`).then(r => r.json()).catch(() => ({ rows: [] })),
        fetch(`${API_BASE}/prestashop/combinations?limit=6000`).then(r => r.json()).catch(() => ({ rows: [] })),
        fetch(`${API_BASE}/sage/products?limit=2000`).then(r => r.json()).catch(() => ({ rows: [] })),
        fetch(`${API_BASE}/sage/stock?limit=3000`).then(r => r.json()).catch(() => ({ rows: [] })),
        fetch(`${API_BASE}/prestashop/tax-rates?limit=5000`).then(r => r.json()).catch(() => ({ map: {} })),
        fetch(`${API_BASE}/prestashop/categories?limit=3000`).then(r => r.json()).catch(() => ({ rows: [] })),
        fetch(`${API_BASE}/prestashop/suppliers?limit=2000`).then(r => r.json()).catch(() => ({ rows: [] })),
      ]);

      const categoryMap = {};
      (categoriesRes.rows || []).forEach(c => {
        categoryMap[String(c.id)] = mojibakeFix(readLocalized(c.name)) || `Catégorie #${c.id}`;
      });
      const supplierMap = {};
      (suppliersRes.rows || []).forEach(s => {
        supplierMap[String(s.id)] = mojibakeFix(readLocalized(s.name)) || `Supplier #${s.id}`;
      });

      const liveProducts = mapPrestaProducts(
        psProductsRes.rows || [],
        psCombRes.rows || [],
        sageProductsRes.rows || [],
        sageStockRes.rows || [],
        taxRatesRes.map || {},
        categoryMap,
        supplierMap
      );

      if (liveProducts.length > 0) {
        PRODUCTS.splice(0, PRODUCTS.length, ...liveProducts);
      }

      setVersion(v => v + 1);
      setSyncState({
        loading: false,
        lastSync: new Date(),
        error: "",
        status: { sage: !!sageHealth.ok, presta: !!psHealth.ok },
      });
    } catch (e) {
      setSyncState(prev => ({
        ...prev,
        loading: false,
        error: e.message || "Erreur de synchronisation",
      }));
    }
  }, []);

  useEffect(() => {
    syncLiveData();
  }, [syncLiveData]);

  useEffect(() => {
    refreshBackendStatus();
    const id = setInterval(refreshBackendStatus, 8000);
    return () => clearInterval(id);
  }, [refreshBackendStatus]);

  return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'Open Sans','Segoe UI',sans-serif",color:T.ink,display:"flex",flexDirection:"column"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Montserrat:wght@500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;scrollbar-width:thin;scrollbar-color:${T.border} transparent}
        *::-webkit-scrollbar{width:5px;height:5px}
        *::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px}
        input[type="range"]{accent-color:${T.bronze}}
        button,select,input{font-family:'Open Sans','Segoe UI',sans-serif}
        @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}
        @keyframes modalIn{from{opacity:0;transform:scale(.96) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
      `}</style>

      {/* â”€â”€ HEADER â”€â”€ */}
      <header style={{height:58,padding:"0 24px",borderBottom:`1px solid ${T.border}`,background:T.panel,display:"flex",alignItems:"center",gap:18,position:"sticky",top:0,zIndex:200,flexShrink:0,backdropFilter:"blur(12px)"}}>
        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
          <div style={{width:32,height:32,borderRadius:9,background:`linear-gradient(135deg,${T.bronze},${T.gold})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,boxShadow:`0 2px 12px ${T.bronze}44`}}>PS</div>
          <div>
            <div style={{fontFamily:"'Montserrat','Open Sans',sans-serif",fontWeight:700,fontSize:15,color:T.ivory,letterSpacing:.2,lineHeight:1.1}}>
              HubMarketing <span style={{color:T.bronze}}>PIM</span>
            </div>
            <div style={{fontSize:8,color:T.ivoryMuted,textTransform:"uppercase",letterSpacing:1.5}}>Interface type PrestaShop</div>
          </div>
        </div>

        <div style={{width:1,height:28,background:T.border,margin:"0 4px"}}/>

        {/* Breadcrumb */}
        <div style={{fontFamily:"'Montserrat','Open Sans',sans-serif",fontSize:14,color:T.ivoryMuted,letterSpacing:.3}}>
          {am.label}
        </div>

        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:16}}>
          {/* Connection status */}
          <div style={{display:"flex",gap:14}}>
            {[{l:"Sage",ok:syncState.status.sage},{l:"PrestaShop",ok:syncState.status.presta}].map(s=>(
              <div key={s.l} style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:s.ok?T.green:T.red,boxShadow:`0 0 6px ${s.ok?T.green:T.red}`}}/>
                <span style={{fontSize:10,color:T.ivoryMuted,letterSpacing:.3}}>{s.l}</span>
              </div>
            ))}
          </div>
          {/* Stock badge */}
          <div style={{background:T.bronze+"14",border:`1px solid ${T.bronze}28`,borderRadius:9,padding:"5px 13px",fontSize:11,color:T.bronze,fontWeight:500,fontFamily:"'DM Mono',monospace",letterSpacing:.3}}>
            {PRODUCTS.length} réf. · {PRODUCTS.reduce((s,p)=>s+p.stock,0)} u.
          </div>
        </div>
      </header>

      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        {/* â”€â”€ SIDEBAR â”€â”€ */}
        <nav style={{width:214,borderRight:`1px solid #1b2b3a`,background:"#23374a",padding:"18px 10px 18px",display:"flex",flexDirection:"column",flexShrink:0,position:"sticky",top:58,height:"calc(100vh - 58px)",overflowY:"auto"}}>
          {/* Nav items */}
          <div style={{display:"flex",flexDirection:"column",gap:2}}>
            {MODULES.map(m=>(
              <button key={m.id} onClick={()=>setActive(m.id)} style={{display:"flex",alignItems:"center",gap:11,padding:"10px 13px",borderRadius:11,border:"none",cursor:"pointer",textAlign:"left",background:active===m.id?"rgba(37,185,215,0.14)":"transparent",color:active===m.id?"#75def1":"#b8c8d8",fontSize:12,fontWeight:active===m.id?700:500,borderLeft:`2px solid ${active===m.id?"#25b9d7":"transparent"}`,transition:"all .15s",fontFamily:"inherit",letterSpacing:.2}}>
                <span style={{fontSize:16,opacity:active===m.id?1:.7}}>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div style={{height:1,background:"rgba(255,255,255,0.10)",margin:"16px 0"}}/>

          {/* Quick stats */}
          <div style={{padding:"0 4px"}}>
            <div style={{fontSize:9,color:"#98afc4",fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:1.2}}>Alertes</div>
            {[
              {l:"Ruptures",n:PRODUCTS.filter(p=>p.stock===0).length,    c:T.red},
              {l:"À promouvoir",n:PRODUCTS.filter(p=>p.isNew||p.daysInStock>150).length,c:T.orange},
              {l:"Non synchronisés",n:PRODUCTS.filter(p=>!p.sage||!p.presta).length,c:T.gold},
            ].map(s=>(
              <div key={s.l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${T.border}44`}}>
                <span style={{fontSize:10,color:"#b8c8d8"}}>{s.l}</span>
                <span style={{background:s.c+"18",color:s.c,fontWeight:700,borderRadius:9,padding:"1px 8px",fontSize:10,fontFamily:"'DM Mono',monospace"}}>{s.n}</span>
              </div>
            ))}
          </div>

          <div style={{marginTop:"auto",paddingTop:14,borderTop:"1px solid rgba(255,255,255,0.12)"}}>
            <div style={{fontSize:9,color:"#98afc4",marginBottom:6,letterSpacing:.5}}>
              {syncState.lastSync ? `Dernière sync · ${syncState.lastSync.toLocaleTimeString("fr-FR", {hour:"2-digit", minute:"2-digit"})}` : "Dernière sync · --:--"}
            </div>
            {syncState.error && <div style={{fontSize:9,color:"#f3a0a0",marginBottom:8}}>{syncState.error}</div>}
            <button onClick={syncLiveData} disabled={syncState.loading} style={{width:"100%",padding:"8px",borderRadius:9,background:"transparent",border:"1px solid rgba(255,255,255,0.18)",color:"#d2e1ee",fontSize:11,cursor:syncState.loading?"wait":"pointer",fontFamily:"inherit",transition:"all .15s",opacity:syncState.loading?0.7:1}}
              onMouseEnter={e=>{e.target.style.borderColor="#25b9d7";e.target.style.color="#ffffff"}}
              onMouseLeave={e=>{e.target.style.borderColor="rgba(255,255,255,0.18)";e.target.style.color="#d2e1ee"}}>
              ↻ Forcer la synchro
            </button>

            <div style={{marginTop:12,paddingTop:10,borderTop:"1px solid rgba(255,255,255,0.10)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontSize:9,color:"#98afc4",letterSpacing:.5}}>Backend</span>
                <span style={{fontSize:9,color:backendCtl.online?"#60d394":"#f3a0a0"}}>{backendCtl.online?"En ligne":"Arrêté"}</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                <button onClick={()=>controlBackend("start")} style={{padding:"6px 4px",borderRadius:8,border:"1px solid rgba(96,211,148,0.35)",background:"rgba(96,211,148,0.12)",color:"#8de5b3",fontSize:10,cursor:"pointer"}}>Démarrer</button>
                <button onClick={()=>controlBackend("stop")} disabled={backendCtl.busy || !backendCtl.online} style={{padding:"6px 4px",borderRadius:8,border:"1px solid rgba(243,160,160,0.35)",background:"rgba(243,160,160,0.12)",color:"#f3a0a0",fontSize:10,cursor:backendCtl.busy || !backendCtl.online?"not-allowed":"pointer",opacity:backendCtl.busy || !backendCtl.online?0.55:1}}>Arrêter</button>
                <button onClick={()=>controlBackend("restart")} disabled={backendCtl.busy || !backendCtl.online} style={{padding:"6px 4px",borderRadius:8,border:"1px solid rgba(120,196,255,0.35)",background:"rgba(120,196,255,0.12)",color:"#9ed2ff",fontSize:10,cursor:backendCtl.busy || !backendCtl.online?"not-allowed":"pointer",opacity:backendCtl.busy || !backendCtl.online?0.55:1}}>Redém.</button>
              </div>
              <div style={{fontSize:9,color:"#98afc4",marginTop:6}}>
                Uptime: {Math.floor((backendCtl.uptimeSec || 0) / 60)} min
              </div>
              {backendCtl.msg && <div style={{fontSize:9,color:"#cfe2f3",marginTop:4,lineHeight:1.35}}>{backendCtl.msg}</div>}
            </div>
          </div>
        </nav>

        {/* â”€â”€ CONTENT â”€â”€ */}
        <main style={{flex:1,overflow:active==="studio"?"hidden":"auto",display:"flex",flexDirection:"column"}}>
          <div style={{flex:1,overflow:active==="studio"?"hidden":"auto",animation:"fadeIn .3s ease"}} key={`${active}-${PRODUCTS.length}`}>
            {CONTENT[active]}
          </div>
        </main>
      </div>
    </div>
  );
}

