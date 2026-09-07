const demo = [
 {id:1,price:625000,area:108,beds:3,baths:2,floor:4,score:92,neighborhood:"Vila Olímpica",title:"Piso exterior con terraza y parking",source:["Servihabitat","Fotocasa"],elevator:true,parking:true,terrace:true,exterior:true,habitable:true,available:true,occupied:false,rented:false,image:"https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=700&q=80",description:"Vivienda luminosa y exterior, bien conservada, con terraza y plaza de parking."},
 {id:2,price:598000,area:102,beds:3,baths:2,floor:3,score:89,neighborhood:"Poblenou",title:"Piso reformado cerca del mar",source:["Solvia"],elevator:true,parking:true,terrace:true,exterior:true,habitable:true,available:true,occupied:false,rented:false,image:"https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=700&q=80",description:"Piso reformado con buena distribución y excelentes comunicaciones."},
 {id:3,price:640000,area:116,beds:4,baths:2,floor:2,score:87,neighborhood:"Diagonal Mar",title:"Vivienda amplia con vistas abiertas",source:["Hipoges","Yaencontre"],elevator:true,parking:true,terrace:false,exterior:true,habitable:true,available:true,occupied:false,rented:false,image:"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=700&q=80",description:"Amplia vivienda exterior con cuatro habitaciones y plaza de garaje."},
 {id:4,price:615000,area:105,beds:3,baths:2,floor:5,score:84,neighborhood:"Poblenou",title:"Ático luminoso con terraza",source:["Altamira","Pisos.com"],elevator:true,parking:false,terrace:true,exterior:true,habitable:true,available:true,occupied:false,rented:false,image:"https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=700&q=80",description:"Ático con terraza privada y mucha luz natural."},
 {id:5,price:560000,area:101,beds:3,baths:2,floor:1,score:78,neighborhood:"Vila Olímpica",title:"Piso para actualizar",source:["Aliseda"],elevator:true,parking:true,terrace:false,exterior:true,habitable:false,available:true,occupied:false,rented:false,image:"https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=700&q=80",description:"Vivienda con potencial, requiere actualización antes de entrar a vivir."}
];

const euro = n => new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
let selectedId = 1;

function criteria(){
 return {
   maxPrice:+document.querySelector('#maxPrice').value||Infinity,
   minArea:+document.querySelector('#minArea').value||0,
   minBeds:+document.querySelector('#minBeds').value||0,
   minBaths:+document.querySelector('#minBaths').value||0,
   elevator:document.querySelector('#elevator').checked,
   parking:document.querySelector('#parking').checked,
   habitable:document.querySelector('#habitable').checked,
   available:document.querySelector('#available').checked,
   excludeOccupied:document.querySelector('#excludeOccupied').checked,
   excludeRented:document.querySelector('#excludeRented').checked,
   neighborhoods:document.querySelector('#neighborhoods').value.toLowerCase().split(',').map(x=>x.trim()).filter(Boolean)
 };
}
function filtered(){
 const c=criteria();
 return demo.filter(p =>
   p.price<=c.maxPrice && p.area>=c.minArea && p.beds>=c.minBeds && p.baths>=c.minBaths &&
   (!c.elevator || p.elevator) && (!c.parking || p.parking) && (!c.habitable || p.habitable) &&
   (!c.available || p.available) && (!c.excludeOccupied || !p.occupied) && (!c.excludeRented || !p.rented) &&
   (!c.neighborhoods.length || c.neighborhoods.some(n=>p.neighborhood.toLowerCase().includes(n)))
 );
}
function renderCards(){
 let items=filtered(), sort=document.querySelector('#sort').value;
 items.sort((a,b)=>sort==='price'?a.price-b.price:sort==='area'?b.area-a.area:sort==='price_m2'?(a.price/a.area)-(b.price/b.area):b.score-a.score);
 document.querySelector('#resultSummary').textContent=`${items.length} inmuebles coinciden con tus criterios`;
 document.querySelector('#cards').innerHTML=items.map(p=>`
  <article class="card ${p.id===selectedId?'selected':''}" onclick="showDetail(${p.id})">
   <img class="card-img" src="${p.image}" alt="">
   <div class="card-body">
    <div class="card-top"><div class="price">${euro(p.price)}</div><div class="score">${p.score}/100</div></div>
    <div class="card-title">${p.title}</div>
    <div class="muted">${p.neighborhood} · ${p.area} m² · ${p.price/p.area|0} €/m²</div>
    <div class="specs"><span>${p.beds} hab.</span><span>${p.baths} baños</span><span>${p.floor}ª planta</span></div>
    <div class="chips">${p.elevator?'<span class="chip">✓ Ascensor</span>':''}${p.parking?'<span class="chip">✓ Parking</span>':''}${p.terrace?'<span class="chip">✓ Terraza</span>':''}${p.exterior?'<span class="chip">✓ Exterior</span>':''}</div>
   </div>
  </article>`).join('') || '<div class="detail-placeholder"><h2>Sin resultados</h2><p>Prueba a relajar algún criterio.</p></div>';
 if(items.length) showDetail(items.some(x=>x.id===selectedId)?selectedId:items[0].id);
}
function showDetail(id){
 selectedId=id; const p=demo.find(x=>x.id===id); if(!p)return;
 document.querySelector('#detail').innerHTML=`<div class="detail-content">
  <img class="detail-hero" src="${p.image}" alt="">
  <div class="detail-inner">
   <div class="detail-price">${euro(p.price)}</div>
   <div class="detail-address">${p.title}</div>
   <div class="muted">${p.neighborhood} · ${p.area} m² · ${Math.round(p.price/p.area)} €/m²</div>
   <div class="detail-grid">
    <div class="metric"><strong>${p.beds}</strong><span>Habitaciones</span></div>
    <div class="metric"><strong>${p.baths}</strong><span>Baños</span></div>
    <div class="metric"><strong>${p.floor}ª</strong><span>Planta</span></div>
    <div class="metric"><strong>${p.score}/100</strong><span>Coincidencia</span></div>
   </div>
   <div class="detail-section"><strong>Características</strong><div class="chips" style="margin-top:10px">${p.elevator?'<span class="chip">✓ Ascensor</span>':''}${p.parking?'<span class="chip">✓ Parking</span>':''}${p.terrace?'<span class="chip">✓ Terraza</span>':''}${p.exterior?'<span class="chip">✓ Exterior</span>':''}${p.habitable?'<span class="chip">✓ Habitable</span>':''}${p.available?'<span class="chip">✓ Disponible</span>':''}</div></div>
   <div class="detail-section"><strong>Descripción</strong><p class="muted" style="line-height:1.6">${p.description}</p></div>
   <div class="detail-section"><strong>Fuentes</strong>${p.source.map(s=>`<div class="source-row"><span><i class="source-dot"></i>${s}</span><span class="muted">Activo</span></div>`).join('')}</div>
   <div class="detail-section"><strong>Ubicación</strong><div class="map" style="margin-top:10px">Mapa de ubicación</div></div>
  </div></div>`;
 document.querySelectorAll('.card').forEach(c=>c.classList.remove('selected'));
}
document.querySelector('#searchBtn').onclick=renderCards;
document.querySelector('#sort').onchange=renderCards;
document.querySelector('#resetBtn').onclick=()=>{location.reload()};
renderCards();
