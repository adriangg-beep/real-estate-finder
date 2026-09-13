(function(){
  let mapMode=false, map=null, layer=null, leafletLoading=null;

  const style=document.createElement('style');
  style.textContent='.unified-map{height:calc(100vh - 150px);min-height:500px;border:1px solid var(--line);border-radius:12px;overflow:hidden;background:#e9edf1}@media(max-width:720px){.unified-map{height:calc(100vh - 145px);min-height:420px}}';
  document.head.appendChild(style);

  function loadLeaflet(){
    if(window.L) return Promise.resolve();
    if(leafletLoading) return leafletLoading;
    leafletLoading=new Promise((resolve,reject)=>{
      const css=document.createElement('link');
      css.rel='stylesheet';
      css.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);
      const sc=document.createElement('script');
      sc.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      sc.onload=resolve;
      sc.onerror=reject;
      document.head.appendChild(sc);
    });
    return leafletLoading;
  }

  function rows(){
    const ps=(typeof properties!=='undefined'&&Array.isArray(properties))?properties:[];
    const out=[];
    ps.forEach(p=>{
      const lat=Number(p.latitude),lon=Number(p.longitude);
      if(!Number.isFinite(lat)||!Number.isFinite(lon)||lat<35||lat>44||lon<-10||lon>5)return;
      const ls=(typeof activeListings==='function'?activeListings(p):[]).filter(l=>l.status==='active');
      if(!ls.length)return;
      const l=ls.slice().sort((a,b)=>(Number(a.price)||Infinity)-(Number(b.price)||Infinity))[0];
      if(typeof pass==='function'&&!pass(p,l))return;
      out.push({p,l});
    });
    return out;
  }

  function safe(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

  function popup(r){
    const p=r.p,l=r.l;
    const price=l.price==null?'—':new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(Number(l.price));
    const area=p.surface_useful||p.surface_built;
    const legal=typeof legalStatuses==='function'?legalStatuses(p):[];
    return '<div style="min-width:210px"><div style="font-size:18px;font-weight:800">'+price+(operation==='rent'?'/mes':'')+'</div><div style="font-size:12px;color:#667085;margin:5px 0">'+(area?Math.round(Number(area))+' m² · ':'')+(p.bedrooms??'—')+' hab. · '+safe(p.population||p.municipality||'')+'</div>'+(legal.length?'<div style="font-size:11px;color:#b42318;font-weight:700;margin-bottom:5px">'+safe(legal.join(' · '))+'</div>':'')+'<a href="?property='+encodeURIComponent(p.id)+'" style="color:#1769aa;font-weight:700;text-decoration:none">Ver ficha</a></div>';
  }

  async function renderMap(){
    try{
      await loadLeaflet();
      const el=document.getElementById('unifiedMap');
      if(!el)return;
      if(!map){
        map=L.map(el).setView([41.3874,2.1686],12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map);
        layer=L.layerGroup().addTo(map);
      }
      layer.clearLayers();
      const rs=rows();
      rs.forEach(r=>L.marker([Number(r.p.latitude),Number(r.p.longitude)]).bindPopup(popup(r)).addTo(layer));
      if(rs.length)map.fitBounds(L.latLngBounds(rs.map(r=>[Number(r.p.latitude),Number(r.p.longitude)])),{padding:[30,30],maxZoom:15});
      setTimeout(()=>map.invalidateSize(),100);
    }catch(e){console.error('Unified map error',e)}
  }

  function setMode(toMap){
    mapMode=toMap;
    const list=document.getElementById('list'),el=document.getElementById('unifiedMap');
    if(list)list.style.display=toMap?'none':'';
    if(el)el.style.display=toMap?'block':'none';
    document.getElementById('viewList')?.classList.toggle('active',!toMap);
    document.getElementById('viewMap')?.classList.toggle('active',toMap);
    if(toMap)setTimeout(renderMap,50);
  }

  function refresh(){if(mapMode)setTimeout(renderMap,100)}

  window.addEventListener('load',()=>{
    document.getElementById('viewList')?.addEventListener('click',()=>setMode(false));
    document.getElementById('viewMap')?.addEventListener('click',()=>setMode(true));
    ['apply','reset','saleMode','rentMode','clearMobile','sort'].forEach(id=>document.getElementById(id)?.addEventListener('click',refresh));
    ['municipality','population','neighborhood'].forEach(id=>document.getElementById(id)?.addEventListener('change',refresh));
    document.querySelectorAll('aside input').forEach(el=>el.addEventListener('change',refresh));
  });
})();
