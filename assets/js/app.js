/* ============================================================
   Ficha de Mercado · Jurel y Caballa — app.js
   SPA liviana con hash-routing, sin dependencias externas.
   ============================================================ */

(function(){
  "use strict";

  const IMG_BASE = "assets/img/";
  let DATA = null;

  const $main = document.getElementById('main');
  const $nav = document.getElementById('mainNav');

  // ---------- Utilities ----------
  function esc(s){
    if (s === null || s === undefined) return "";
    return String(s)
      .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }
  function val(v, fallback){
    if (v === null || v === undefined || v === "" ) return fallback ?? "—";
    return esc(v);
  }
  function isMissing(v){
    return v === null || v === undefined || v === "" || /^(S\/D|N\/D)$/i.test(String(v).trim());
  }
  function valClass(v){
    return isMissing(v) ? "val" : "val";
  }
  function img(file){ return IMG_BASE + file; }

  function continentLabel(c){
    const map = { Africa: "África", America: "América", Asia: "Asia", Europa: "Europa", Oceania: "Oceanía" };
    return map[c] || c;
  }
  function continentSlug(c){ return c.toLowerCase(); }

  // ---------- Router ----------
  const routes = [];
  function route(pattern, handler){ routes.push({pattern, handler}); }

  function parseHash(){
    let h = location.hash || "#/inicio";
    h = h.replace(/^#/, "");
    if (!h.startsWith("/")) h = "/" + h;
    return h;
  }

  function matchRoute(path){
    for (const r of routes){
      const m = r.pattern.exec(path);
      if (m) return { handler: r.handler, params: m.slice(1).map(decodeURIComponent) };
    }
    return null;
  }

  function render(){
    const path = parseHash();
    const m = matchRoute(path);
    updateNavActive(path);
    window.scrollTo(0,0);
    if (m){
      m.handler(...m.params);
    } else {
      $main.innerHTML = `<div class="wrap empty-state">Vista no encontrada.</div>`;
    }
  }

  function updateNavActive(path){
    const buttons = $nav.querySelectorAll('button');
    let activeKey = "#/inicio";
    if (path.startsWith("/panorama")) activeKey = "#/panorama";
    else if (path.startsWith("/continentes") || path.startsWith("/continente")) activeKey = "#/continentes";
    else if (path.startsWith("/paises") || path.startsWith("/pais")) activeKey = "#/paises";
    else if (path.startsWith("/competencia")) activeKey = "#/competencia";
    buttons.forEach(b => b.classList.toggle('active', b.dataset.route === activeKey));
  }

  $nav.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-route]');
    if (btn) location.hash = btn.dataset.route;
  });
  document.getElementById('brandHome').addEventListener('click', () => location.hash = "#/inicio");
  document.getElementById('brandHome').addEventListener('keypress', (e) => { if (e.key === 'Enter') location.hash = "#/inicio"; });

  // ---------- Lightbox ----------
  const $lightbox = document.getElementById('lightbox');
  const $lightboxImg = document.getElementById('lightboxImg');
  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  $lightbox.addEventListener('click', (e) => { if (e.target === $lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
  function openLightbox(src, alt){
    $lightboxImg.src = src;
    $lightboxImg.alt = alt || "Ficha ampliada";
    $lightbox.classList.add('open');
  }
  function closeLightbox(){
    $lightbox.classList.remove('open');
    $lightboxImg.src = "";
  }
  function wireZoom(container){
    container.querySelectorAll('img[data-zoom]').forEach(im => {
      im.addEventListener('click', () => openLightbox(im.src, im.alt));
    });
  }

  // ---------- Breadcrumb ----------
  function breadcrumb(parts){
    // parts: [[label, href|null], ...]
    const items = parts.map((p, i) => {
      const isLast = i === parts.length - 1;
      const label = esc(p[0]);
      if (isLast || !p[1]) return `<span>${label}</span>`;
      return `<a href="${p[1]}">${label}</a>`;
    });
    return `<div class="breadcrumb wrap">${items.join('<span class="sep">/</span>')}</div>`;
  }

  // =====================================================================
  // VIEW: INICIO
  // =====================================================================
  function viewInicio(){
    const meta = DATA.meta;
    const nPaises = meta.n_paises;
    $main.innerHTML = `
      <section class="hero">
        <div class="wrap">
          <p class="hero-eyebrow">Inteligencia de mercado · Periodo ${esc(meta.periodo)}</p>
          <h1>Jurel y caballa congelados: <em>el mapa comercial</em> de Chile</h1>
          <p class="lede">Panorama mundial, desempeño por continente y ${nPaises} fichas país con
          precios, calibres, acceso a mercado y relación comercial con Chile — construido a partir
          del informe del ${esc(meta.proyecto)}.</p>
          <div class="hero-stats">
            <div class="hero-stat"><div class="num">${nPaises}</div><div class="lbl">Países con ficha de mercado</div></div>
            <div class="hero-stat"><div class="num">5</div><div class="lbl">Continentes analizados</div></div>
            <div class="hero-stat"><div class="num">2</div><div class="lbl">Productos · HS 030355 / 030354</div></div>
            <div class="hero-stat"><div class="num">#1</div><div class="lbl">Ranking mundial de Chile en jurel</div></div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="wrap">
          <div class="section-head">
            <h2>Puertos de entrada · por continente</h2>
            <span class="meta">Clic para ver el resumen agregado y sus países</span>
          </div>
          <div class="ports-grid" id="portsGrid"></div>
        </div>
      </section>

      <section class="section" style="padding-top:0">
        <div class="wrap">
          <div class="section-head">
            <h2>Documentos del informe</h2>
            <span class="meta">Estructura general</span>
          </div>
          <div class="data-panels" style="grid-template-columns:repeat(4,1fr)">
            ${docCard("01 · Resumen ejecutivo", "Principales hallazgos por producto", "#/doc/resumen")}
            ${docCard("02 · Recomendaciones", "Implicancias de política comercial", "#/doc/recomendaciones")}
            ${docCard("03 · Panorama mundial", "Mercado global jurel y caballa", "#/panorama")}
            ${docCard("05 · Análisis de competencia", "Comparación entre exportadores", "#/competencia")}
          </div>
        </div>
      </section>
    `;

    const grid = document.getElementById('portsGrid');
    const order = ["Africa","America","Asia","Europa","Oceania"];
    grid.innerHTML = order.map(c => portCard(c)).join('');
    grid.querySelectorAll('[data-cont]').forEach(card => {
      card.addEventListener('click', () => location.hash = `#/continente/${continentSlug(card.dataset.cont)}`);
    });
  }

  function docCard(title, desc, href){
    return `<a href="${href}" class="panel" style="display:block;padding:16px;text-decoration:none;color:inherit;border-top:3px solid var(--gold)">
      <div class="mono" style="font-size:11px;color:var(--ink-soft);letter-spacing:.05em;text-transform:uppercase">${esc(title)}</div>
      <div style="font-family:var(--font-display);font-size:16px;margin-top:6px">${esc(desc)}</div>
    </a>`;
  }

  function portCard(contKey){
    const c = DATA.continentes[contKey];
    const countries = Object.values(DATA.paises).filter(p => p.continente === contKey);
    return `<div class="port-card" data-cont="${contKey}">
      <span class="n">${countries.length}</span>
      <div class="tag">${continentLabel(contKey)}</div>
      <h3>${continentLabel(contKey)}</h3>
      <div class="figs">
        <div><span>Compraron a Chile</span><span class="v">${val(c.compraron_a_chile)}</span></div>
        <div><span>Exp. Chile</span><span class="v">${val(c.exp_chile_continente)}</span></div>
        <div><span>Part. exp. Chile</span><span class="v">${val(c.part_en_exp_chile)}</span></div>
      </div>
    </div>`;
  }

  // =====================================================================
  // VIEW: PANORAMA MUNDIAL
  // =====================================================================
  function viewPanorama(){
    const pm = DATA.panorama_mundial;
    $main.innerHTML = `
      ${breadcrumb([["Inicio","#/inicio"],["Panorama mundial", null]])}
      <section class="section">
        <div class="wrap">
          <div class="section-head">
            <h2>Panorama mundial</h2>
            <span class="meta">Mercado global · Periodo ${esc(DATA.meta.periodo)}</span>
          </div>
          ${panoramaProduct("Jurel congelado", "HS 030355", pm.jurel)}
          ${panoramaProduct("Caballa congelada", "HS 030354", pm.caballa)}
        </div>
      </section>
    `;
    wireZoom($main);
  }

  function panoramaProduct(name, hs, p){
    return `
      <div style="margin-bottom:46px">
        <h3 style="font-family:var(--font-display);font-size:22px;border-bottom:2px solid var(--gold);display:inline-block;padding-bottom:4px;margin-bottom:18px">
          ${esc(name)} <span class="mono" style="font-size:12px;color:var(--ink-soft)">(${esc(hs)})</span>
        </h3>
        <div class="data-panels" style="grid-template-columns:repeat(3,1fr)">
          <div class="panel">
            <h5>Mercado mundial 2024</h5>
            <div class="rows">
              ${row("Exportaciones mundo (FOB)", p.exp_mundo_fob)}
              ${row("Volumen mundo", p.volumen_mundo)}
              ${row("Chile: FOB", p.chile_fob)}
              ${row("Chile: volumen", p.chile_volumen)}
              ${row("Chile: % valor", p.chile_pct_valor, "gold")}
              ${row("Chile: % volumen", p.chile_pct_volumen, "gold")}
              ${row("N° exportadores", p.n_exportadores)}
              ${row("Ranking de Chile", p.ranking_chile, "gold")}
              ${row("Var. mercado 2016–2024", p.var_mercado_2016_2024)}
            </div>
          </div>
          <div class="panel">
            <h5>Top 6 exportadores mundiales</h5>
            <div class="rows">
              ${p.top6_exportadores.map(([n,pct]) => row(n, pct)).join('')}
            </div>
          </div>
          <div class="panel">
            <h5>Top 5 destinos de Chile (2025)</h5>
            <div class="rows">
              ${p.top5_destinos_chile_2025.map(([n,usd,pct]) => row(n, `${usd} (${pct})`)).join('')}
            </div>
          </div>
        </div>
        <div class="figure-block">
          <div class="cap"><span>Ficha completa · Panorama mundial · ${esc(name)}</span><span>Página del informe original</span></div>
          <img src="${img(p.img)}" alt="Panorama mundial ${esc(name)}" data-zoom loading="lazy">
        </div>
      </div>
    `;
  }

  function row(label, value, cls){
    return `<div class="row"><span class="lbl">${esc(label)}</span><span class="val ${cls||''}">${val(value)}</span></div>`;
  }

  // =====================================================================
  // VIEW: CONTINENTES (listado)
  // =====================================================================
  function viewContinentes(){
    const order = ["Africa","America","Asia","Europa","Oceania"];
    $main.innerHTML = `
      ${breadcrumb([["Inicio","#/inicio"],["Continentes", null]])}
      <section class="section">
        <div class="wrap">
          <div class="section-head">
            <h2>Resumen por continente</h2>
            <span class="meta">${order.length} continentes · ${DATA.meta.n_paises} países</span>
          </div>
          <div class="ports-grid" id="cGrid"></div>
        </div>
      </section>
    `;
    const grid = document.getElementById('cGrid');
    grid.innerHTML = order.map(c => portCard(c)).join('');
    grid.querySelectorAll('[data-cont]').forEach(card => {
      card.addEventListener('click', () => location.hash = `#/continente/${continentSlug(card.dataset.cont)}`);
    });
  }

  // =====================================================================
  // VIEW: CONTINENTE DETAIL
  // =====================================================================
  const CONT_BY_SLUG = { africa: "Africa", america: "America", asia: "Asia", europa: "Europa", oceania: "Oceania" };

  function viewContinenteDetail(slug){
    const key = CONT_BY_SLUG[slug];
    if (!key){ $main.innerHTML = `<div class="wrap empty-state">Continente no encontrado.</div>`; return; }
    const c = DATA.continentes[key];
    const countries = Object.values(DATA.paises).filter(p => p.continente === key)
      .sort((a,b) => a.pais.localeCompare(b.pais, 'es'));

    $main.innerHTML = `
      ${breadcrumb([["Inicio","#/inicio"],["Continentes","#/continentes"],[continentLabel(key), null]])}
      <section class="country-hero">
        <div class="wrap">
          <div class="region-line">Resumen del continente</div>
          <h1>${continentLabel(key)}</h1>
          <div class="country-kpis">
            <div class="k"><div class="num">${val(c.paises_panel)}</div><div class="lbl">Países en el panel</div></div>
            <div class="k"><div class="num">${val(c.compraron_a_chile)}</div><div class="lbl">Compraron a Chile</div></div>
            <div class="k"><div class="num">${val(c.principal_comprador)}</div><div class="lbl">Principal comprador</div></div>
            <div class="k"><div class="num">${val(c.precio_prom_ponderado)}</div><div class="lbl">Precio prom. ponderado</div></div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="wrap">
          <div class="data-panels" style="grid-template-columns:repeat(3,1fr)">
            <div class="panel">
              <h5>Mercado mundial</h5>
              <div class="rows">
                ${row("Imp. total mundo (CIF)", c.imp_total_mundo_cif)}
                ${row("Exp. Chile al continente", c.exp_chile_continente)}
                ${row("Part. en exp. Chile", c.part_en_exp_chile, "gold")}
                ${row("Producto más exportado", c.producto_mas_exportado)}
              </div>
            </div>
            <div class="panel">
              <h5>Contexto socioeconómico (prom.)</h5>
              <div class="rows">
                ${row("PBI per cápita prom.", c.pbi_per_capita_prom)}
                ${row("Cons. pescado p.c. prom.", c.cons_pescado_pc_prom)}
                ${row("Cons. pelágicos p.c. prom.", c.cons_pelagicos_pc_prom)}
              </div>
            </div>
            <div class="panel">
              <h5>Países en el panel</h5>
              <div class="rows">
                ${row("Total analizados", c.paises_panel)}
                ${row("Compraron a Chile", c.compraron_a_chile)}
                ${row("Sin compras a Chile", (Number(c.paises_panel)||0) - (Number(c.compraron_a_chile)||0))}
              </div>
            </div>
          </div>

          <div class="figure-block">
            <div class="cap"><span>Ficha completa · Resumen ${continentLabel(key)}</span><span>Página del informe original</span></div>
            <img src="${img(c.imgs[0])}" alt="Resumen ${continentLabel(key)}" data-zoom loading="lazy">
          </div>
          ${c.imgs[1] ? `<div class="figure-block">
            <div class="cap"><span>Desagregado por producto · Jurel vs. Caballa</span><span>Página del informe original</span></div>
            <img src="${img(c.imgs[1])}" alt="Desagregado por producto ${continentLabel(key)}" data-zoom loading="lazy">
          </div>` : ''}

          <div class="section-head" style="margin-top:10px">
            <h2>Países de ${continentLabel(key)}</h2>
            <span class="meta">${countries.length} fichas</span>
          </div>
          <div class="country-grid" id="countryGrid"></div>
        </div>
      </section>
    `;
    const grid = document.getElementById('countryGrid');
    grid.innerHTML = countries.map(countryCard).join('');
    grid.querySelectorAll('[data-slug]').forEach(card => {
      card.addEventListener('click', () => location.hash = `#/pais/${card.dataset.slug}`);
    });
    wireZoom($main);
  }

  function countryCard(p){
    const prods = Object.keys(p.productos);
    return `<div class="country-card" data-slug="${p.slug}">
      <div class="region">${esc(p.region || continentLabel(p.continente))}</div>
      <h4>${esc(p.pais)}</h4>
      <div class="badges">
        ${prods.includes('JUREL') ? '<span class="badge jurel">JUREL</span>' : ''}
        ${prods.includes('CABALLA') ? '<span class="badge caballa">CABALLA</span>' : ''}
      </div>
    </div>`;
  }

  // =====================================================================
  // VIEW: PAÍSES (listado completo con filtros)
  // =====================================================================
  function viewPaises(){
    const all = Object.values(DATA.paises).sort((a,b) => a.pais.localeCompare(b.pais, 'es'));
    $main.innerHTML = `
      ${breadcrumb([["Inicio","#/inicio"],["Países", null]])}
      <section class="section">
        <div class="wrap">
          <div class="section-head">
            <h2>Todos los países</h2>
            <span class="meta">${all.length} fichas de mercado</span>
          </div>
          <div class="filters">
            <input type="text" id="searchBox" placeholder="Buscar país…" aria-label="Buscar país">
            <button class="chip active" data-f="all">Todos</button>
            <button class="chip" data-f="Africa">África</button>
            <button class="chip" data-f="America">América</button>
            <button class="chip" data-f="Asia">Asia</button>
            <button class="chip" data-f="Europa">Europa</button>
            <button class="chip" data-f="Oceania">Oceanía</button>
          </div>
          <div class="country-grid" id="allGrid"></div>
        </div>
      </section>
    `;
    const grid = document.getElementById('allGrid');
    let currentFilter = 'all';
    let currentSearch = '';

    function draw(){
      const filtered = all.filter(p => {
        const passF = currentFilter === 'all' || p.continente === currentFilter;
        const passS = !currentSearch || p.pais.toLowerCase().includes(currentSearch);
        return passF && passS;
      });
      grid.innerHTML = filtered.length
        ? filtered.map(countryCard).join('')
        : `<div class="empty-state">Sin resultados.</div>`;
      grid.querySelectorAll('[data-slug]').forEach(card => {
        card.addEventListener('click', () => location.hash = `#/pais/${card.dataset.slug}`);
      });
    }

    document.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentFilter = chip.dataset.f;
        draw();
      });
    });
    document.getElementById('searchBox').addEventListener('input', (e) => {
      currentSearch = e.target.value.trim().toLowerCase();
      draw();
    });
    draw();
  }

  // =====================================================================
  // VIEW: PAÍS DETAIL
  // =====================================================================
  function findCountryBySlug(slug){
    return Object.values(DATA.paises).find(p => p.slug === slug);
  }

  function viewPaisDetail(slug){
    const p = findCountryBySlug(slug);
    if (!p){ $main.innerHTML = `<div class="wrap empty-state">País no encontrado.</div>`; return; }
    const prods = Object.keys(p.productos);
    const initialProduct = prods.includes('JUREL') ? 'JUREL' : prods[0];

    $main.innerHTML = `
      ${breadcrumb([["Inicio","#/inicio"],["Continentes","#/continentes"],[continentLabel(p.continente), `#/continente/${continentSlug(p.continente)}`],[p.pais, null]])}
      <section class="country-hero">
        <div class="wrap">
          <div class="region-line">${esc(p.region || continentLabel(p.continente))} · ${continentLabel(p.continente)}</div>
          <h1>${esc(p.pais)}</h1>
          <div class="country-kpis">
            <div class="k"><div class="num">${val(p.poblacion)}</div><div class="lbl">Población</div></div>
            <div class="k"><div class="num">${val(p.pbi)}</div><div class="lbl">PBI</div></div>
            <div class="k"><div class="num">${val(p.pbi_per_capita)}</div><div class="lbl">PBI per cápita</div></div>
            <div class="k"><div class="num">${val(p.cons_pescado_pc)}</div><div class="lbl">Consumo pescado p.c.</div></div>
          </div>
          <div class="product-tabs" id="productTabs">
            ${prods.map(pr => `<button data-prod="${pr}" class="${pr===initialProduct?'active':''}">${pr === 'JUREL' ? 'Jurel congelado · HS 030355' : 'Caballa congelada · HS 030354'}</button>`).join('')}
          </div>
        </div>
      </section>
      <section class="section">
        <div class="wrap" id="productContent"></div>
      </section>
    `;

    const $content = document.getElementById('productContent');
    function drawProduct(prod){
      $content.innerHTML = renderProductPanels(p, prod);
      wireZoom($content);
    }
    document.getElementById('productTabs').addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-prod]');
      if (!btn) return;
      document.querySelectorAll('#productTabs button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      drawProduct(btn.dataset.prod);
    });
    drawProduct(initialProduct);
  }

  function renderProductPanels(p, prodKey){
    const d = p.productos[prodKey];
    if (!d) return `<div class="empty-state">Sin datos para este producto.</div>`;
    const calibreRows = Object.entries(d.precios_calibre || {});
    const distRows = Object.entries(d.dist_volumen_calibre || {});

    return `
      <div class="data-panels">
        <div class="panel">
          <h5>Mercado mundial</h5>
          <div class="rows">
            ${row("Imp. total mundo (CIF)", d.imp_total_mundo_cif)}
            ${row("Volumen importado", d.volumen_importado)}
            ${row("Precio prom. importación", d.precio_prom_importacion)}
            ${row("Precio a Chile (rango)", d.precio_a_chile_rango, "gold")}
          </div>
        </div>
        <div class="panel">
          <h5>Relación con Chile</h5>
          <div class="rows">
            ${row("Exp. Chile → país (FOB)", d.exp_chile_pais_fob, "gold")}
            ${row("Volumen exportado", d.volumen_exportado)}
            ${row("Precio pagado a Chile", d.precio_pagado_a_chile)}
            ${row("Part. en exp. chilenas", d.part_en_exp_chilenas, "gold")}
            ${row("CAGR 5 años (exp.)", d.cagr_5anios_exp)}
          </div>
        </div>
        <div class="panel">
          <h5>Acceso al mercado (MacMap)</h5>
          <div class="rows">
            ${row("Arancel MFN", d.arancel_mfn)}
            ${row("Efectivo Chile", d.efectivo_chile, "gold")}
            ${row("Trato", d.trato)}
            ${row(`NTM registradas${d.ntm_anio ? ' ('+d.ntm_anio+')' : ''}`, d.ntm_registradas, isNtmHigh(d.ntm_registradas) ? "coral" : "")}
          </div>
        </div>
        <div class="panel">
          <h5>Logística</h5>
          <div class="rows">
            ${row("Puerto embarque ppal. 2025", d.puerto_embarque)}
          </div>
        </div>
      </div>

      ${calibreRows.length ? `
      <div class="panel" style="margin-bottom:24px">
        <h5>Precios por calibre · 2025 (USD/kg FOB, fuente Aduana Chile)</h5>
        <div class="rows" style="padding:14px 16px">
          <table class="calibre-table">
            <thead><tr><th>Calibre</th><th>Prom.</th><th>Mín.</th><th>Máx.</th></tr></thead>
            <tbody>
              ${calibreRows.map(([cal, v]) => `<tr><td>${esc(cal)}</td><td>${val(v.prom)}</td><td>${val(v.min)}</td><td>${val(v.max)}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>` : ''}

      ${distRows.length ? `
      <div class="panel" style="margin-bottom:24px">
        <h5>Distribución de volumen exportado por calibre</h5>
        <div class="rows">
          ${distRows.map(([cal, pct]) => row(cal + ' g', pct)).join('')}
        </div>
      </div>` : ''}

      <div class="figure-block">
        <div class="cap"><span>Ficha completa · ${esc(p.pais)} · ${prodKey === 'JUREL' ? 'Jurel congelado' : 'Caballa congelada'}</span><span>Click para ampliar</span></div>
        <img src="${img(d.img)}" alt="Ficha de mercado ${esc(p.pais)} ${prodKey}" data-zoom loading="lazy">
      </div>
    `;
  }

  function isNtmHigh(v){
    const n = parseInt(v, 10);
    return !isNaN(n) && n >= 30;
  }

  // =====================================================================
  // VIEW: DOC pages (resumen ejecutivo / recomendaciones)
  // =====================================================================
  function viewDoc(which){
    const map = {
      resumen: { title: "Resumen ejecutivo", img: DATA.meta.img_resumen_ejecutivo, desc: "Principales hallazgos del informe, por producto." },
      recomendaciones: { title: "Recomendaciones de política comercial", img: DATA.meta.img_recomendaciones, desc: "Implicancias estratégicas 2024–2025." },
    };
    const d = map[which];
    if (!d){ $main.innerHTML = `<div class="wrap empty-state">Documento no encontrado.</div>`; return; }
    $main.innerHTML = `
      ${breadcrumb([["Inicio","#/inicio"],[d.title, null]])}
      <section class="section">
        <div class="wrap">
          <div class="section-head"><h2>${esc(d.title)}</h2><span class="meta">${esc(d.desc)}</span></div>
          <div class="figure-block">
            <div class="cap"><span>${esc(d.title)}</span><span>Click para ampliar</span></div>
            <img src="${img(d.img)}" alt="${esc(d.title)}" data-zoom loading="lazy">
          </div>
        </div>
      </section>
    `;
    wireZoom($main);
  }

  // =====================================================================
  // VIEW: COMPETENCIA
  // =====================================================================
  function viewCompetencia(){
    const imgs = DATA.meta.img_analisis_competencia;
    $main.innerHTML = `
      ${breadcrumb([["Inicio","#/inicio"],["Análisis de competencia", null]])}
      <section class="section">
        <div class="wrap">
          <div class="section-head"><h2>Análisis de competencia</h2><span class="meta">Comparación entre exportadores mundiales</span></div>
          ${imgs.map((f,i) => `
            <div class="figure-block">
              <div class="cap"><span>Análisis de competencia · página ${i+1}</span><span>Click para ampliar</span></div>
              <img src="${img(f)}" alt="Análisis de competencia ${i+1}" data-zoom loading="lazy">
            </div>
          `).join('')}
        </div>
      </section>
    `;
    wireZoom($main);
  }

  // ---------- Register routes ----------
  route(/^\/inicio\/?$/, viewInicio);
  route(/^\/panorama\/?$/, viewPanorama);
  route(/^\/continentes\/?$/, viewContinentes);
  route(/^\/continente\/([^/]+)\/?$/, viewContinenteDetail);
  route(/^\/paises\/?$/, viewPaises);
  route(/^\/pais\/([^/]+)\/?$/, viewPaisDetail);
  route(/^\/doc\/([^/]+)\/?$/, viewDoc);
  route(/^\/competencia\/?$/, viewCompetencia);

  window.addEventListener('hashchange', render);

  // ---------- Boot ----------
  fetch('assets/data/master_data.json')
    .then(r => r.json())
    .then(data => {
      DATA = data;
      render();
    })
    .catch(err => {
      $main.innerHTML = `<div class="wrap empty-state">No se pudieron cargar los datos. (${esc(err.message)})</div>`;
      console.error(err);
    });

})();
