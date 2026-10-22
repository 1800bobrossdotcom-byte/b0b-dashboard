// b0b.dev OSINT map - the GL engine. MapLibre GL JS 6.13.0 (BSD-3-Clause),
// served from /vendor. Previewed at /map?engine=gl beside the classic map.
//
// The data are the classic map's own arrays (locations, connectionLines,
// tunnelPaths, animalNetPaths, colorMap, worldTerritories), copied into
// map-gl.html by scripts/build-map-gl.py. Edit them in map.html, never here.
//
// Rules carried over from the classic map, and kept:
//   - a line is drawn by the tier of the record behind it: dotted 0-1,
//     dashed 2, solid 3+; untiered counts as 0;
//   - the first view shows tier 3 and up;
//   - search takes several words, all of which must match.
// New here:
//   - a line belongs to the site nearest each end, within 0.02 degrees (about
//     2 km). The classic map matched every marker within 0.05 degrees, which
//     tied 381 line ends to more than one site;
//   - context layers (infrastructure) are drawn under the evidence and never
//     as lines between sites.

import * as mlgl from '/vendor/maplibre-gl-6.13.0/maplibre-gl.js';

mlgl.setWorkerUrl('/vendor/maplibre-gl-6.13.0/maplibre-gl-worker.js');

const W = window;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (n) => Number(n).toLocaleString('en-US');
const isPhone = () => W.matchMedia('(max-width: 768px)').matches;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ------------------------------------------------------------------ data
const TYPE_COLOR = W.colorMap || {};
const SECTION_LABELS = W.B0B_SECTION_LABELS || {};
const TYPE_LABELS = W.B0B_TYPE_LABELS || {};
const TIERS = W.B0B_EDGE_TIERS || [];
const TIER_NAME = (t) => (TIERS[t] ? TIERS[t].name : '');

const SITES = (W.locations || []).map((d, i) => Object.assign({}, d, { i, color: TYPE_COLOR[d.type] || '#888888' }));
const TOTAL = SITES.length;

// Sections the report has an anchor for. ANIMAL and MS live inside XIV and X;
// SPORTS has no section in the report, so its sites carry no report link.
const ANCHOR_OF = { ANIMAL: 'XIV', MS: 'X', SPORTS: null };
const REPORT_ANCHOR = (sec) => (sec in ANCHOR_OF ? ANCHOR_OF[sec] : sec);
const NUMERAL = /^[IVXL]+$/;

function sectionName(sec) {
  const l = SECTION_LABELS[sec];
  return l ? l.replace(/^[IVXL]+ - /, '') : sec;
}
function sectionText(sec) { return NUMERAL.test(sec) ? 'Section ' + sec + ' · ' + sectionName(sec) : sectionName(sec); }
function typeName(type) { return TYPE_LABELS[type] || type; }
function dateText(d) {
  if (!d.date) return '';
  const p = d.date.split('-');
  if (d.dprec === 'day' && p.length === 3) return +p[2] + ' ' + MONTHS[+p[1] - 1] + ' ' + p[0];
  if (d.dprec === 'month' && p.length >= 2) return MONTHS[+p[1] - 1] + ' ' + p[0];
  return p[0];
}

// Lines. Connections and the animal-research network are one layer, as on the
// classic map; tunnels are their own toggle.
const LINES = [];
(W.connectionLines || []).forEach((c) => LINES.push({ kind: 'connection', path: [c[0], c[1]], color: c[2], label: c[3], tier: c.length > 4 ? c[4] : null }));
(W.animalNetPaths || []).forEach((a) => LINES.push({ kind: 'animal-network', path: a.path, color: a.color || '#d500f9', label: a.label, tier: a.tier == null ? null : a.tier }));
const NCONN = LINES.length;
(W.tunnelPaths || []).forEach((t) => LINES.push({ kind: 'tunnel', path: t.path, color: t.color || '#ff6600', label: t.label, tier: t.tier == null ? null : t.tier }));
LINES.forEach((l, i) => { l.i = i; l.t = l.tier == null ? 0 : l.tier; });

// Which site(s) each line end belongs to: the nearest within 0.02 degrees;
// sites at the same point share it.
function endSites(p) {
  let best = Infinity, hits = [];
  for (const s of SITES) {
    const d = Math.max(Math.abs(s.lat - p[0]), Math.abs(s.lng - p[1]));
    if (d < best - 1e-9) { best = d; hits = [s.i]; } else if (Math.abs(d - best) <= 1e-9) hits.push(s.i);
  }
  return best <= 0.02 ? hits : [];
}
const SITE_LINES = SITES.map(() => []);
LINES.forEach((l) => {
  l.a = endSites(l.path[0]);
  l.b = endSites(l.path[l.path.length - 1]);
  new Set(l.a.concat(l.b)).forEach((si) => SITE_LINES[si].push(l.i));
});

// GeoJSON. Longitudes are unwrapped so a line takes the short way across the
// antimeridian (a relationship has no route; the shorter arc reads truer).
function lngLatPath(path) {
  const out = [];
  let prev = null;
  for (const p of path) {
    let lng = p[1];
    if (prev !== null) { while (lng - prev > 180) lng -= 360; while (lng - prev < -180) lng += 360; }
    out.push([lng, p[0]]);
    prev = lng;
  }
  return out;
}
const LINE_STYLE = (l) => {
  if (l.kind === 'tunnel') return l.t <= 1 ? { w: 2.2, o: 0.45 } : { w: 2.6, o: 0.7 };
  if (l.tier == null) return { w: 1.1, o: 0.5 };
  return [{ w: 1.1, o: 0.45 }, { w: 1.1, o: 0.45 }, { w: 1.3, o: 0.6 }, { w: 1.7, o: 0.8 }, { w: 2.2, o: 0.9 }, { w: 2.6, o: 0.95 }][l.t];
};
function lineFeature(l) {
  const st = LINE_STYLE(l);
  return { type: 'Feature', id: l.i, properties: { i: l.i, c: l.color, t: l.t, w: st.w, o: st.o }, geometry: { type: 'LineString', coordinates: lngLatPath(l.path) } };
}
const FC = (features) => ({ type: 'FeatureCollection', features });
const SITES_FC = FC(SITES.map((s) => ({ type: 'Feature', id: s.i, properties: { i: s.i, c: s.color }, geometry: { type: 'Point', coordinates: [s.lng, s.lat] } })));
const CONN_FC = FC(LINES.filter((l) => l.kind !== 'tunnel').map(lineFeature));
const TUN_FC = FC(LINES.filter((l) => l.kind === 'tunnel').map(lineFeature));

// ------------------------------------------------------------------ state
const SECTIONS = [];
Object.keys(SECTION_LABELS).forEach((s) => { if (SITES.some((x) => x.section === s)) SECTIONS.push(s); });
SITES.forEach((s) => { if (SECTIONS.indexOf(s.section) === -1) SECTIONS.push(s.section); });
const TYPES = [];
Object.keys(TYPE_LABELS).forEach((t) => { if (SITES.some((x) => x.type === t)) TYPES.push(t); });
SITES.forEach((s) => { if (TYPES.indexOf(s.type) === -1) TYPES.push(s.type); });

const S = {
  sections: new Set(SECTIONS), types: new Set(TYPES), query: [],
  mode: null,                         // { label, set:Set } from pattern / proximity / links
  tierMin: 3, conn: true, tunnels: false,
  proj: 'globe', relief: false, base: 'earth',
  sel: null,                          // { kind:'site'|'line'|'feature', ... }
  visible: SITES.map(() => true), shown: TOTAL,
};

// ------------------------------------------------------------------ search
// Same rules as the classic map: every term must match; "phrase"; -exclude.
function parseQuery(raw) {
  const s = (raw || '').toLowerCase();
  const terms = [];
  let i = 0;
  while (i < s.length) {
    while (i < s.length && /\s/.test(s[i])) i++;
    if (i >= s.length) break;
    let neg = false;
    if (s[i] === '-' && i + 1 < s.length && !/\s/.test(s[i + 1])) { neg = true; i++; }
    let text;
    if (s[i] === '"') {
      const end = s.indexOf('"', i + 1);
      if (end === -1) { text = s.slice(i + 1); i = s.length; } else { text = s.slice(i + 1, end); i = end + 1; }
    } else {
      let j = i;
      while (j < s.length && !/\s/.test(s[j])) j++;
      text = s.slice(i, j).replace(/^[,;]+|[,;]+$/g, '');
      i = j;
    }
    text = text.trim();
    if (text) terms.push({ text, neg });
  }
  return terms;
}
function hay(d) {
  if (d._hay === undefined) d._hay = (d.name + ' ' + d.ctx + ' ' + d.section + ' ' + d.type + ' ' + (d.date || '')).toLowerCase();
  return d._hay;
}
function matches(terms, d) {
  const h = hay(d);
  for (const t of terms) { const hit = h.indexOf(t.text) !== -1; if (t.neg ? hit : !hit) return false; }
  return true;
}

// ------------------------------------------------------------------ map
const BASES = {
  earth:        { layers: ['base-imagery'] },
  satellite:    { layers: ['base-imagery', 'base-labels'] },
  dark:         { layers: ['base-dark', 'base-darkref'] },
  terrain:      { layers: ['base-topo'] },
  street:       { layers: ['base-osm'] },
  firstpeoples: { layers: ['base-dark'] },
};
// Esri Dark Gray Canvas. CARTO's keyless tiles turned into an "API KEY REQUIRED"
// watermark served with HTTP 200 (Sept 2026), so CARTO is not used.
const CANVAS = (name) => ['https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/' + name + '/MapServer/tile/{z}/{y}/{x}'];
const CANVAS_ATTR = '&copy; Esri, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const OSM_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const DEM_TILES = ['https://elevation-tiles-prod.s3.amazonaws.com/terrarium/{z}/{x}/{y}.png'];
const DEM_ATTR = 'Elevation: <a href="https://github.com/tilezen/joerd/blob/master/docs/attribution.md">Mapzen / AWS Terrain Tiles</a>';

function raster(tiles, attribution, maxzoom) { return { type: 'raster', tiles, tileSize: 256, maxzoom: maxzoom || 19, attribution }; }

const LINE_LAYERS = ['ln-dot', 'ln-dash', 'ln-solid'];
const TUN_LAYERS = ['tn-dot', 'tn-dash'];

function style() {
  const vis = (on) => ({ visibility: on ? 'visible' : 'none' });
  const lineWidth = ['interpolate', ['linear'], ['zoom'], 0, ['*', ['get', 'w'], 0.75], 5, ['get', 'w'], 10, ['*', ['get', 'w'], 1.6]];
  const lineLayer = (id, source, filter, dash, cap) => ({
    id, type: 'line', source, filter,
    layout: { 'line-cap': cap, 'line-join': 'round' },
    paint: { 'line-color': ['get', 'c'], 'line-width': lineWidth, 'line-opacity': ['get', 'o'], 'line-dasharray': dash },
  });
  return {
    version: 8,
    projection: { type: 'globe' },
    sky: { 'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 0.6, 4, 0.4, 7, 0] },
    sources: {
      'base-imagery': raster(['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], 'Imagery &copy; Esri, Maxar, Earthstar Geographics'),
      'base-labels': raster(['https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'], 'Labels &copy; Esri'),
      'base-dark': raster(CANVAS('World_Dark_Gray_Base'), CANVAS_ATTR, 16),
      'base-darkref': raster(CANVAS('World_Dark_Gray_Reference'), 'Labels &copy; Esri', 16),
      'base-topo': raster(['a', 'b', 'c'].map((s) => 'https://' + s + '.tile.opentopomap.org/{z}/{x}/{y}.png'), '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC BY-SA) ' + OSM_ATTR, 17),
      'base-osm': raster(['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], OSM_ATTR),
      'dem-shade': { type: 'raster-dem', tiles: DEM_TILES, tileSize: 256, maxzoom: 15, encoding: 'terrarium', attribution: DEM_ATTR },
      'dem-terrain': { type: 'raster-dem', tiles: DEM_TILES, tileSize: 256, maxzoom: 15, encoding: 'terrarium' },
      sites: { type: 'geojson', data: SITES_FC },
      conn: { type: 'geojson', data: CONN_FC },
      tun: { type: 'geojson', data: TUN_FC },
    },
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': '#05070a' } },
      { id: 'base-imagery', type: 'raster', source: 'base-imagery', layout: vis(true) },
      { id: 'base-dark', type: 'raster', source: 'base-dark', layout: vis(false) },
      { id: 'base-topo', type: 'raster', source: 'base-topo', layout: vis(false) },
      { id: 'base-osm', type: 'raster', source: 'base-osm', layout: vis(false) },
      { id: 'hillshade', type: 'hillshade', source: 'dem-shade', layout: vis(false), paint: { 'hillshade-exaggeration': 0.45, 'hillshade-shadow-color': '#000000', 'hillshade-highlight-color': '#ffffff', 'hillshade-accent-color': '#000000' } },
      { id: 'base-labels', type: 'raster', source: 'base-labels', layout: vis(false), paint: { 'raster-opacity': 0.85 } },
      { id: 'base-darkref', type: 'raster', source: 'base-darkref', layout: vis(false) },
      // context layers are inserted here, under the evidence (before 'ctx-top')
      { id: 'ctx-top', type: 'background', layout: vis(false), paint: { 'background-opacity': 0 } },
      lineLayer('tn-dot', 'tun', ['all', ['<=', ['get', 't'], 1], ['>=', ['get', 't'], 3]], [0.1, 3], 'round'),
      lineLayer('tn-dash', 'tun', ['all', ['>=', ['get', 't'], 2], ['>=', ['get', 't'], 3]], [3, 2], 'butt'),
      lineLayer('ln-dot', 'conn', ['all', ['<=', ['get', 't'], 1], ['>=', ['get', 't'], 3]], [0.1, 2.6], 'round'),
      lineLayer('ln-dash', 'conn', ['all', ['==', ['get', 't'], 2], ['>=', ['get', 't'], 3]], [3, 2.2], 'butt'),
      lineLayer('ln-solid', 'conn', ['>=', ['get', 't'], 3], [1, 0], 'butt'),
      {
        id: 'sites', type: 'circle', source: 'sites',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 0, 2.3, 3, 3.6, 6, 5, 10, 7, 14, 9],
          'circle-color': ['get', 'c'],
          'circle-stroke-color': 'rgba(5,7,10,0.9)',
          'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 0, 0.5, 6, 1],
          'circle-pitch-alignment': 'map',
        },
      },
      {
        id: 'sites-hi', type: 'circle', source: 'sites', filter: ['in', ['get', 'i'], ['literal', []]],
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 0, 3.6, 3, 5, 6, 6.5, 10, 8.5, 14, 10.5],
          'circle-color': ['get', 'c'], 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1.4, 'circle-pitch-alignment': 'map',
        },
      },
      {
        id: 'sites-sel', type: 'circle', source: 'sites', filter: ['==', ['get', 'i'], -1],
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 0, 6, 6, 10, 14, 14],
          'circle-color': 'rgba(0,0,0,0)', 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 2, 'circle-pitch-alignment': 'map',
        },
      },
      // live layers are inserted above here (before 'live-top')
      { id: 'live-top', type: 'background', layout: vis(false), paint: { 'background-opacity': 0 } },
    ],
  };
}

const params = new URLSearchParams(location.search);
let map, READY = false;
try {
  map = new mlgl.Map({
    container: 'map',
    style: style(),
    center: [15, 25],
    zoom: isPhone() ? 0.8 : 2.05,
    maxPitch: 75,
    attributionControl: false,
    dragRotate: true,
    touchPitch: true,
  });
} catch (e) {
  console.error('[map-gl] could not start', e);
  $('#glFail').hidden = false;
}
W.__b0bGL = map;   // for inspection from the console and tests

if (map) {
  map.addControl(new mlgl.NavigationControl({ visualizePitch: true }), 'bottom-right');
  // On phones the layer sheet covers the bottom of the map, so the credits go top right.
  map.addControl(new mlgl.AttributionControl({ compact: true }), isPhone() ? 'top-right' : 'bottom-right');
  map.on('error', (e) => { if (e && e.error) console.warn('[map-gl]', e.error.message || e.error); });
  // On desktop the panel covers the left of the map; the camera centres on the rest.
  const pad = () => map.setPadding({ left: isPhone() ? 0 : 340, top: 0, right: 0, bottom: 0 });
  pad();
  W.addEventListener('resize', pad);
  map.on('load', onLoad);
}

// ------------------------------------------------------------------ filters
function recompute() {
  const terms = S.query;
  let shown = 0;
  for (const s of SITES) {
    const v = S.sections.has(s.section) && S.types.has(s.type) && (!terms.length || matches(terms, s)) && (!S.mode || S.mode.set.has(s.i));
    S.visible[s.i] = v;
    if (v) shown++;
  }
  S.shown = shown;
  if (!READY) return renderStats();
  const ids = [];
  if (shown !== TOTAL) SITES.forEach((s) => { if (S.visible[s.i]) ids.push(s.i); });
  const f = shown === TOTAL ? null : ['in', ['get', 'i'], ['literal', ids]];
  map.setFilter('sites', f);
  renderStats();
}

function tierFilters() {
  if (!READY) { renderTierUI(); renderStats(); return; }
  const min = ['>=', ['get', 't'], S.tierMin];
  map.setFilter('ln-dot', ['all', ['<=', ['get', 't'], 1], min]);
  map.setFilter('ln-dash', ['all', ['==', ['get', 't'], 2], min]);
  map.setFilter('ln-solid', ['all', ['>=', ['get', 't'], 3], min]);
  map.setFilter('tn-dot', ['all', ['<=', ['get', 't'], 1], min]);
  map.setFilter('tn-dash', ['all', ['>=', ['get', 't'], 2], min]);
  LINE_LAYERS.forEach((id) => map.setLayoutProperty(id, 'visibility', S.conn ? 'visible' : 'none'));
  TUN_LAYERS.forEach((id) => map.setLayoutProperty(id, 'visibility', S.tunnels ? 'visible' : 'none'));
  renderTierUI();
  renderStats();
}

function linesShown() {
  let n = 0;
  for (const l of LINES) {
    if (l.t < S.tierMin) continue;
    if (l.kind === 'tunnel' ? S.tunnels : S.conn) n++;
  }
  return n;
}

function renderStats() {
  const ln = linesShown();
  const txt = 'SITES ' + fmt(S.shown) + '/' + fmt(TOTAL) + ' · LINES ' + fmt(ln) + ' · ' + (S.tierMin > 0 ? 'TIER ' + S.tierMin + '+' : 'ALL TIERS');
  $('#mgStats').textContent = txt;
  $('#gEvidenceN').textContent = fmt(S.shown) + ' / ' + fmt(TOTAL);
  $('#gLinesN').textContent = fmt(ln) + ' shown';
  const chip = $('#modeChip');
  if (S.mode) { chip.hidden = false; $('#modeText').textContent = S.mode.label; } else chip.hidden = true;
}

// ------------------------------------------------------------------ panel UI
function buildLists() {
  const secCount = {}, typeCount = {};
  SITES.forEach((s) => { secCount[s.section] = (secCount[s.section] || 0) + 1; typeCount[s.type] = (typeCount[s.type] || 0) + 1; });
  $('#sectionList').innerHTML = SECTIONS.map((s) =>
    '<label class="mg-item"><input type="checkbox" data-section="' + esc(s) + '" checked autocomplete="off"><span></span><span>' + esc(SECTION_LABELS[s] || s) + '</span><span class="mg-n">' + fmt(secCount[s] || 0) + '</span></label>').join('');
  $('#typeList').innerHTML = TYPES.map((t) =>
    '<label class="mg-item"><input type="checkbox" data-type="' + esc(t) + '" checked autocomplete="off"><i class="mg-dot" style="background:' + esc(TYPE_COLOR[t] || '#888') + '"></i><span>' + esc(typeName(t)) + '</span><span class="mg-n">' + fmt(typeCount[t] || 0) + '</span></label>').join('');
  $('#proximityType').innerHTML = '<option value="">- type -</option>' + TYPES.map((t) => '<option value="' + esc(t) + '">' + esc(typeName(t)) + '</option>').join('');

  // Tier selector: weakest tier shown.
  const seg = $('#tierSeg');
  seg.innerHTML = [0, 1, 2, 3, 4, 5].map((t) => '<button type="button" role="radio" data-tier="' + t + '" title="' + esc(t === 0 ? 'every line' : 'tier ' + t + ' and up') + '">' + (t === 0 ? 'ALL' : t === 5 ? '5' : t + '+') + '</button>').join('');
  const perTier = [0, 0, 0, 0, 0, 0];
  LINES.forEach((l) => { if (l.kind !== 'tunnel') perTier[l.t]++; });
  const sample = (t) => {
    const dash = t <= 1 ? '1 4' : t === 2 ? '6 4' : '';
    return '<svg width="34" height="8" aria-hidden="true"><line x1="1" y1="4" x2="33" y2="4" stroke="currentColor" stroke-width="' + (t >= 3 ? 2 : 1.4) + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + ' stroke-linecap="round"/></svg>';
  };
  $('#tierKey').innerHTML = TIERS.map((t) => '<span data-row="' + t.tier + '">' + sample(t.tier) + '</span><span data-row="' + t.tier + '">' + t.tier + ' ' + esc(t.name) + '</span><span class="mg-n" data-row="' + t.tier + '">' + fmt(perTier[t.tier]) + '</span>').join('');
}

function renderTierUI() {
  $$('#tierSeg button').forEach((b) => b.setAttribute('aria-checked', String(+b.dataset.tier === S.tierMin)));
  $$('#tierKey [data-row]').forEach((el) => el.classList.toggle('off', +el.dataset.row < S.tierMin));
  $('#toggleConnections').checked = S.conn;
  $('#toggleTunnels').checked = S.tunnels;
}

function bindPanel() {
  $('#panel').addEventListener('change', (e) => {
    const el = e.target;
    if (el.dataset.section) { el.checked ? S.sections.add(el.dataset.section) : S.sections.delete(el.dataset.section); recompute(); }
    else if (el.dataset.type) { el.checked ? S.types.add(el.dataset.type) : S.types.delete(el.dataset.type); recompute(); }
    else if (el.id === 'toggleConnections') { S.conn = el.checked; tierFilters(); }
    else if (el.id === 'toggleTunnels') { S.tunnels = el.checked; tierFilters(); }
  });
  $('#panel').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.tier !== undefined) { S.tierMin = +b.dataset.tier; tierFilters(); applyFocus(); }
    else if (b.dataset.all || b.dataset.none) {
      const kind = b.dataset.all || b.dataset.none, on = !!b.dataset.all;
      const set = kind === 'section' ? S.sections : S.types, all = kind === 'section' ? SECTIONS : TYPES;
      set.clear(); if (on) all.forEach((x) => set.add(x));
      $$('[data-' + kind + ']', $('#panel')).forEach((c) => { if (c.tagName === 'INPUT') c.checked = on; });
      recompute();
    }
  });
  // The sheet handle: on phones it opens and closes the sheet; on desktop it folds the panel.
  $('#sheetHandle').addEventListener('click', () => {
    const p = $('#panel');
    const open = isPhone() ? p.classList.toggle('open') : !p.classList.toggle('shut');
    $('#sheetHandle').setAttribute('aria-expanded', String(open));
  });
  const si = $('#searchInput');
  si.addEventListener('input', () => { S.query = parseQuery(si.value); $('#searchClear').hidden = !si.value; recompute(); });
  $('#searchClear').addEventListener('click', () => { si.value = ''; S.query = []; $('#searchClear').hidden = true; recompute(); si.focus(); });
  $('#modeClear').addEventListener('click', () => { S.mode = null; recompute(); });
  $('#patternBtn').addEventListener('click', patternSearch);
  $('#patternInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); patternSearch(); } });
  $('#proximityBtn').addEventListener('click', proximitySearch);
  $('#shareBtn').addEventListener('click', (e) => copyLink(e.target));
  $$('.mg-seg button[data-proj]').forEach((b) => b.addEventListener('click', () => setProjection(b.dataset.proj)));
  $('#reliefBtn').addEventListener('click', () => setRelief(!S.relief));
  $('#baseSelect').addEventListener('change', (e) => setBase(e.target.value));
  $('#cardClose').addEventListener('click', clearSelection);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') clearSelection();
    if (e.key === '/' && document.activeElement && !/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); si.focus(); }
  });
}

// ------------------------------------------------------------------ view
function setProjection(p) {
  S.proj = p;
  $$('.mg-seg button[data-proj]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.proj === p)));
  if (READY) map.setProjection({ type: p });
}
function setRelief(on) {
  S.relief = on;
  $('#reliefBtn').setAttribute('aria-pressed', String(on));
  if (!READY) return;
  map.setLayoutProperty('hillshade', 'visibility', on ? 'visible' : 'none');
  map.setTerrain(on ? { source: 'dem-terrain', exaggeration: 1.4 } : null);
  map.easeTo({ pitch: on ? 50 : 0, duration: 900 });
}
function setBase(b) {
  if (!BASES[b]) b = 'earth';
  S.base = b;
  $('#baseSelect').value = b;
  if (!READY) return;
  const on = new Set(BASES[b].layers);
  ['base-imagery', 'base-labels', 'base-dark', 'base-darkref', 'base-topo', 'base-osm'].forEach((id) => map.setLayoutProperty(id, 'visibility', on.has(id) ? 'visible' : 'none'));
  // First Peoples: the territories come on with the base, as on the classic map.
  const ind = FEEDS.find((f) => f.id === 'indigenous');
  if (ind) setFeed(ind, b === 'firstpeoples');
}

// ------------------------------------------------------------------ selection and the card
let hiLines = [];
function applyFocus() {
  if (!READY) return;
  const has = hiLines.length > 0;
  const ids = ['literal', hiLines];
  const op = has ? ['case', ['in', ['get', 'i'], ids], 1, ['*', ['get', 'o'], 0.22]] : ['get', 'o'];
  const lw = ['interpolate', ['linear'], ['zoom'], 0, ['*', ['get', 'w'], 0.75], 5, ['get', 'w'], 10, ['*', ['get', 'w'], 1.6]];
  const wd = has ? ['case', ['in', ['get', 'i'], ids], ['*', lw, 1.9], lw] : lw;
  LINE_LAYERS.concat(TUN_LAYERS).forEach((id) => { map.setPaintProperty(id, 'line-opacity', op); map.setPaintProperty(id, 'line-width', wd); });
}

function siteLinesSorted(i) {
  return SITE_LINES[i].map((li) => LINES[li]).sort((x, y) => (y.t - x.t) || x.label.localeCompare(y.label));
}

function otherEnd(l, i) {
  const a = l.a.indexOf(i) !== -1, b = l.b.indexOf(i) !== -1;
  const far = a && !b ? l.b : b && !a ? l.a : [];
  const pt = a && !b ? l.path[l.path.length - 1] : l.path[0];
  return { sites: far, pt };
}

function siteLink(si) { return '<button type="button" class="mg-to" data-site="' + si + '">' + esc(SITES[si].name) + '</button>'; }
function ptText(pt) { return pt[0].toFixed(3) + ', ' + pt[1].toFixed(3); }
function tierBadge(l) { return '<span class="mg-tb t' + l.t + '">' + (l.tier == null ? 'T-' : 'T' + l.tier) + '</span>'; }

function openCard(html) {
  $('#cardBody').innerHTML = html;
  const c = $('#card');
  c.hidden = false;
  c.scrollTop = 0;
  if (isPhone()) { $('#panel').classList.remove('open'); $('#sheetHandle').setAttribute('aria-expanded', 'false'); }
}

function selectSite(i, fly) {
  const s = SITES[i];
  S.sel = { kind: 'site', i };
  const ls = siteLinesSorted(i);
  hiLines = ls.map((l) => l.i);
  const ends = new Set();
  ls.forEach((l) => otherEnd(l, i).sites.forEach((x) => ends.add(x)));
  if (READY) {
    map.setFilter('sites-sel', ['==', ['get', 'i'], i]);
    map.setFilter('sites-hi', ['in', ['get', 'i'], ['literal', Array.from(ends)]]);
    applyFocus();
    if (fly) map.flyTo({ center: [s.lng, s.lat], zoom: Math.max(map.getZoom(), 5), duration: 1200 });
  }
  const anchor = REPORT_ANCHOR(s.section);
  const here = SITES.filter((x) => x.i !== i && Math.abs(x.lat - s.lat) < 0.0005 && Math.abs(x.lng - s.lng) < 0.0005);
  const items = ls.map((l) => {
    const o = otherEnd(l, i);
    const to = o.sites.length ? o.sites.map(siteLink).join(' / ') : '<span class="mg-small">' + ptText(o.pt) + '</span>';
    const hidden = l.t < S.tierMin || (l.kind === 'tunnel' ? !S.tunnels : !S.conn);
    return '<li' + (hidden ? ' class="below" title="Not drawn with the current line settings"' : '') + '>' + tierBadge(l) + esc(TIER_NAME(l.t)) + (l.kind === 'tunnel' ? ' · tunnel path' : '') + '<br>' + esc(l.label) + '<br>&rarr; ' + to + '</li>';
  }).join('');
  openCard(
    '<h2>' + esc(s.name) + '</h2>' +
    '<div class="mg-meta"><span><i class="mg-dot" style="background:' + esc(s.color) + '"></i>' + esc(typeName(s.type)) + '</span><span>' + esc(sectionText(s.section)) + '</span>' + (s.date ? '<span>' + esc(dateText(s)) + '</span>' : '') + '</div>' +
    '<div class="mg-acts">' +
      (anchor ? '<a class="primary" href="/report#' + esc(anchor) + '" target="_blank" rel="noopener">VIEW IN REPORT</a>' : '') +
      '<button type="button" data-act="type">ONLY THIS TYPE</button>' +
      '<button type="button" data-act="section">ONLY ' + esc(NUMERAL.test(s.section) ? 'SECTION ' + s.section : sectionName(s.section).toUpperCase()) + '</button>' +
      (ls.length ? '<button type="button" data-act="links">ONLY ITS LINKS</button>' : '') +
      '<button type="button" data-act="copy">COPY LINK</button>' +
    '</div>' +
    '<p class="mg-ctx">' + esc(s.ctx) + '</p>' +
    (here.length ? '<p class="mg-small">Also at this point: ' + here.map((x) => siteLink(x.i)).join(' / ') + '</p>' : '') +
    (ls.length ? '<h3>LINES (' + ls.length + ')</h3><ul class="mg-edges">' + items + '</ul>' : '<p class="mg-small">No line joins this site.</p>')
  );
}

function selectLine(li) {
  const l = LINES[li];
  S.sel = { kind: 'line', i: li };
  hiLines = [li];
  if (READY) {
    map.setFilter('sites-sel', ['==', ['get', 'i'], -1]);
    map.setFilter('sites-hi', ['in', ['get', 'i'], ['literal', l.a.concat(l.b)]]);
    applyFocus();
  }
  const end = (hits, pt) => hits.length ? hits.map(siteLink).join(' / ') : '<span class="mg-small">' + ptText(pt) + ' (no site here)</span>';
  const t = TIERS[l.t];
  openCard(
    '<div class="mg-meta">' + tierBadge(l) + '<span>' + (l.tier == null ? 'untiered (counted as 0)' : esc(t ? t.name : '')) + '</span><span>' + esc(l.kind === 'animal-network' ? 'animal-research network' : l.kind) + '</span></div>' +
    '<h2>' + esc(l.label) + '</h2>' +
    '<dl class="mg-kv"><dt>From</dt><dd>' + end(l.a, l.path[0]) + '</dd><dt>To</dt><dd>' + end(l.b, l.path[l.path.length - 1]) + '</dd>' +
    (t ? '<dt>Tier ' + l.t + '</dt><dd>' + esc(t.meaning) + '</dd>' : '') + '</dl>' +
    '<p class="mg-small">' + (l.kind === 'tunnel' ? 'The path is the one claimed; its tier is the record behind the claim.' : 'The line joins two sites; its course across the map carries no meaning.') + ' <a href="/map/list#tiers">How the tiers work</a></p>'
  );
}

function clearSelection() {
  S.sel = null;
  hiLines = [];
  $('#card').hidden = true;
  if (READY) {
    map.setFilter('sites-sel', ['==', ['get', 'i'], -1]);
    map.setFilter('sites-hi', ['in', ['get', 'i'], ['literal', []]]);
    applyFocus();
  }
}

$('#cardBody').addEventListener('click', (e) => {
  const to = e.target.closest('[data-site]');
  if (to) { selectSite(+to.dataset.site, true); return; }
  const act = e.target.closest('[data-act]');
  if (!act || !S.sel || S.sel.kind !== 'site') return;
  const s = SITES[S.sel.i];
  if (act.dataset.act === 'type') isolate('type', s.type);
  else if (act.dataset.act === 'section') isolate('section', s.section);
  else if (act.dataset.act === 'links') showLinks(s.i);
  else if (act.dataset.act === 'copy') copyLink(act, s.name);
});

function isolate(kind, val) {
  const set = kind === 'section' ? S.sections : S.types;
  const other = kind === 'section' ? S.types : S.sections, otherAll = kind === 'section' ? TYPES : SECTIONS;
  set.clear(); set.add(val);
  other.clear(); otherAll.forEach((x) => other.add(x));
  $$('#panel input[data-section]').forEach((c) => { c.checked = S.sections.has(c.dataset.section); });
  $$('#panel input[data-type]').forEach((c) => { c.checked = S.types.has(c.dataset.type); });
  $('#searchInput').value = ''; S.query = []; $('#searchClear').hidden = true;
  S.mode = null;
  recompute();
}

function setMode(label, set) {
  S.mode = { label, set };
  recompute();
  fitTo(Array.from(set));
}

function showLinks(i) {
  const set = new Set([i]);
  SITE_LINES[i].forEach((li) => { const l = LINES[li]; l.a.concat(l.b).forEach((x) => set.add(x)); });
  setMode('LINKS OF ' + SITES[i].name.toUpperCase(), set);
}

function patternSearch() {
  const raw = $('#patternInput').value;
  const terms = parseQuery(raw);
  if (!terms.length) return;
  const set = new Set();
  SITES.forEach((s) => { if (matches(terms, s)) set.add(s.i); });
  Array.from(set).forEach((i) => SITE_LINES[i].forEach((li) => { const l = LINES[li]; if (l.kind !== 'tunnel') l.a.concat(l.b).forEach((x) => set.add(x)); }));
  if (!set.size) { $('#patternInput').setCustomValidity('No site matches every word. Drop a word, or quote a phrase.'); $('#patternInput').reportValidity(); setTimeout(() => $('#patternInput').setCustomValidity(''), 2500); return; }
  setMode('PATTERN "' + raw.trim().toUpperCase() + '" + LINKED', set);
}

function haversine(a, b) {
  const R = 6371, dLat = (b.lat - a.lat) * Math.PI / 180, dLng = (b.lng - a.lng) * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
function proximitySearch() {
  const type = $('#proximityType').value;
  if (!type) { $('#proximityType').focus(); return; }
  const km = Math.min(Math.max(parseFloat($('#proximityKm').value) || 50, 1), 2000);
  const anchors = SITES.filter((s) => s.type === type);
  const set = new Set();
  SITES.forEach((s) => { if (anchors.some((a) => haversine(a, s) <= km)) set.add(s.i); });
  setMode('WITHIN ' + km + ' KM OF ' + typeName(type).toUpperCase(), set);
}

function fitTo(idx) {
  if (!READY || idx.length < 1) return;
  if (idx.length === 1) { const s = SITES[idx[0]]; map.flyTo({ center: [s.lng, s.lat], zoom: 6 }); return; }
  const b = new mlgl.LngLatBounds();
  idx.forEach((i) => b.extend([SITES[i].lng, SITES[i].lat]));
  map.fitBounds(b, { padding: isPhone() ? 40 : { top: 60, bottom: 120, left: 20, right: 60 }, maxZoom: 9, duration: 1000 });
}

// ------------------------------------------------------------------ hover and click
const HIT_SITES = ['sites'];
const HIT_LINES = TUN_LAYERS.concat(LINE_LAYERS);
let liveHit = [];      // live-feed layer ids, filled as feeds are added
let ctxHit = [];       // context layer ids

// Under the pointer there are often several features; the nearest one wins,
// measured on screen. (queryRenderedFeatures returns them in draw order.)
const d2 = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
function segDist2(p, a, b) {
  const vx = b.x - a.x, vy = b.y - a.y, L = vx * vx + vy * vy;
  const t = L ? Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.y - a.y) * vy) / L)) : 0;
  return d2(p, { x: a.x + t * vx, y: a.y + t * vy });
}
function lineDist2(l, p) {
  if (!l.ll) l.ll = lngLatPath(l.path);
  let best = Infinity;
  for (let k = 1; k < l.ll.length; k++) {
    const a = l.ll[k - 1], b = l.ll[k];
    let prev = map.project(a);
    for (let j = 1; j <= 24; j++) {
      const q = map.project([a[0] + (b[0] - a[0]) * j / 24, a[1] + (b[1] - a[1]) * j / 24]);
      best = Math.min(best, segDist2(p, prev, q));
      prev = q;
    }
  }
  return best;
}
function featDist2(f, p) {
  const g = f.geometry;
  return g && g.type === 'Point' ? d2(p, map.project(g.coordinates)) : 0;
}
function nearest(list, dist) {
  let best = null, bd = Infinity;
  for (const x of list) { const d = dist(x); if (d < bd) { bd = d; best = x; } }
  return best;
}
function hit(point, pad) {
  const box = [[point.x - pad, point.y - pad], [point.x + pad, point.y + pad]];
  const q = (layers) => { const ls = layers.filter((id) => map.getLayer(id) && map.getLayoutProperty(id, 'visibility') !== 'none'); return ls.length ? map.queryRenderedFeatures(box, { layers: ls }) : []; };
  let f = q(liveHit);
  if (f.length) return { kind: 'live', f: nearest(f, (x) => featDist2(x, point)) };
  f = q(HIT_SITES);
  if (f.length) {
    const ids = Array.from(new Set(f.map((x) => x.properties.i)));
    return { kind: 'site', i: nearest(ids, (i) => d2(point, map.project([SITES[i].lng, SITES[i].lat]))) };
  }
  f = q(HIT_LINES);
  if (f.length) {
    const ids = Array.from(new Set(f.map((x) => x.properties.i)));
    return { kind: 'line', i: nearest(ids, (i) => lineDist2(LINES[i], point)) };
  }
  f = q(ctxHit);
  if (f.length) return { kind: 'ctx', f: nearest(f, (x) => featDist2(x, point)) };
  return null;
}

function bindMap() {
  const tip = $('#tip');
  map.on('mousemove', (e) => {
    if (isPhone()) return;
    const h = hit(e.point, 5);
    map.getCanvas().style.cursor = h ? 'pointer' : '';
    if (!h) { tip.hidden = true; return; }
    let text = '';
    if (h.kind === 'site') text = SITES[h.i].name;
    else if (h.kind === 'line') { const l = LINES[h.i]; text = (l.tier == null ? 'T- ' : 'T' + l.tier + ' ') + TIER_NAME(l.t) + ' · ' + l.label; }
    else if (h.kind === 'live') text = liveTip(h.f);
    else if (h.kind === 'ctx') text = ctxTip(h.f);
    tip.textContent = text;
    tip.hidden = !text;
    const r = map.getContainer().getBoundingClientRect();
    tip.style.left = Math.min(e.point.x + 14, r.width - 330) + 'px';
    tip.style.top = (e.point.y + 14) + 'px';
  });
  map.on('mouseout', () => { tip.hidden = true; });
  map.on('click', (e) => {
    const h = hit(e.point, isPhone() ? 12 : 5);
    tip.hidden = true;
    if (!h) { clearSelection(); return; }
    if (h.kind === 'site') selectSite(h.i, false);
    else if (h.kind === 'line') selectLine(h.i);
    else if (h.kind === 'live') liveCard(h.f);
    else if (h.kind === 'ctx') ctxCard(h.f);
  });
}

// ------------------------------------------------------------------ live feeds
// Each feed is fetched by the reader's browser from its publisher, as on the
// classic map. A failure is reported and retried; it never switches itself off.
const ADSB = 'https://api.adsb.lol/v2';
const AIS = 'https://meri.digitraffic.fi/api/ais/v1';
const pt = (lng, lat, props) => ({ type: 'Feature', properties: props, geometry: { type: 'Point', coordinates: [lng, lat] } });
const timeNow = () => new Date().toLocaleTimeString();

function viewBBox() {
  const b = map.getBounds();
  let w = b.getWest(), e = b.getEast(), s = Math.max(-90, b.getSouth()), n = Math.min(90, b.getNorth());
  if (e - w >= 360 || S.proj === 'globe' && map.getZoom() < 2.5) { w = -180; e = 180; }
  w = Math.max(-180, w); e = Math.min(180, e);
  return { w, s, e, n };
}
function viewRadiusNm() {
  const c = map.getCenter(), b = map.getBounds();
  const d = haversine({ lat: c.lat, lng: c.lng }, { lat: b.getNorth(), lng: b.getEast() }) * 1000;
  return Math.max(5, Math.min(250, Math.round(d / 1852)));
}
// DO-260B NACp: estimated position uncertainty (95%) the aircraft reports for itself.
const NACP_EPU = ['10 NM or more, or not known', 'under 10 NM', 'under 4 NM', 'under 2 NM', 'under 1 NM', 'under 0.5 NM', 'under 0.3 NM', 'under 0.1 NM (185 m)', 'under 93 m', 'under 30 m', 'under 10 m', 'under 3 m'];
function isMil(a) { return !!(a.dbFlags & 1) || /^(RCH|DUKE|EVAC|NAVY|RRR|TOPG|VIPER|COBRA|SENTRY|JAKE|BART)/.test((a.flight || '').trim()); }
function aircraftFC(list) {
  return FC(list.filter((a) => a.lat != null && a.lon != null).map((a) => {
    const mil = isMil(a), ground = a.alt_baro === 'ground';
    return pt(a.lon, a.lat, { k: 'aircraft', mil: mil ? 1 : 0, track: a.track || 0, col: mil ? '#ff4444' : ground ? '#777777' : (a.alt_baro > 10000 ? '#00ccff' : '#44ff44'),
      call: ((a.flight || '').trim() || a.r || a.hex || 'NO CALLSIGN'), type: a.t || '', reg: a.r || '', alt: ground ? 'on ground' : (a.alt_baro != null ? a.alt_baro + ' ft' : 'unknown'),
      gs: a.gs != null ? Math.round(a.gs) : '', sq: a.squawk || '', hex: a.hex || '' });
  }));
}
const planeLayer = (id, source) => ({ id, type: 'symbol', source, layout: { 'icon-image': 'b0b-plane', 'icon-size': ['case', ['==', ['get', 'mil'], 1], 0.85, 0.65], 'icon-rotate': ['get', 'track'], 'icon-rotation-alignment': 'map', 'icon-allow-overlap': true, 'icon-ignore-placement': true }, paint: { 'icon-color': ['get', 'col'] } });

const FEEDS = [
  { id: 'quakes', label: 'USGS earthquakes (24 h)', src: 'U.S. Geological Survey', every: 300000,
    layers: [{ type: 'circle', paint: { 'circle-radius': ['interpolate', ['linear'], ['get', 'mag'], 0, 2.5, 3, 4.5, 5, 8, 7, 15], 'circle-color': ['step', ['get', 'mag'], '#ffaa44', 3, '#ff6644', 5, '#ff2200'], 'circle-opacity': 0.7, 'circle-stroke-color': '#ff8866', 'circle-stroke-width': 1, 'circle-pitch-alignment': 'map' } }],
    async load() {
      const d = await (await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson')).json();
      const fc = FC(d.features.map((f) => pt(f.geometry.coordinates[0], f.geometry.coordinates[1], { k: 'quake', mag: f.properties.mag || 0, place: f.properties.place || '', time: f.properties.time, depth: f.geometry.coordinates[2] || 0, url: f.properties.url || '' })));
      return { fc, status: fc.features.length + ' earthquakes in 24 h · ' + timeNow() };
    } },
  { id: 'eonet', label: 'NASA natural events', src: 'NASA EONET', every: 600000,
    layers: [{ type: 'circle', paint: { 'circle-radius': 6, 'circle-color': ['get', 'col'], 'circle-opacity': 0.75, 'circle-stroke-color': '#000', 'circle-stroke-width': 1, 'circle-pitch-alignment': 'map' } }],
    async load() {
      const d = await (await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=200')).json();
      const C = { wildfires: ['#ff4400', 'WILDFIRE'], volcanoes: ['#ff0000', 'VOLCANO'], severeStorms: ['#00ccff', 'SEVERE STORM'], floods: ['#0066ff', 'FLOOD'], landslides: ['#996633', 'LANDSLIDE'], seaLakeIce: ['#aaddff', 'SEA/LAKE ICE'], earthquakes: ['#ff6644', 'EARTHQUAKE'], dustHaze: ['#ccaa66', 'DUST/HAZE'], tempExtremes: ['#ff8800', 'TEMP EXTREME'] };
      const feats = [];
      (d.events || []).forEach((ev) => {
        const cat = ev.categories && ev.categories[0] ? ev.categories[0].id : 'other';
        const info = C[cat] || ['#cccccc', String(cat).toUpperCase()];
        (ev.geometry || []).forEach((g) => { if (g.type === 'Point' && g.coordinates) feats.push(pt(g.coordinates[0], g.coordinates[1], { k: 'eonet', col: info[0], cat: info[1], title: ev.title || '', date: g.date || '', url: ev.sources && ev.sources[0] ? ev.sources[0].url : '' })); });
      });
      return { fc: FC(feats), status: feats.length + ' open events · ' + timeNow() };
    } },
  { id: 'firms', label: 'NASA FIRMS heat hotspots (24 h)', src: 'NASA FIRMS, NOAA-20 VIIRS 375 m, read through this site. Heat, not cause: fires, gas flares, plants and volcanoes all register.', every: 600000, viewport: true,
    layers: [{ type: 'circle', paint: { 'circle-radius': ['step', ['get', 'frp'], 2.5, 10, 3.5, 50, 5, 200, 7], 'circle-color': ['step', ['get', 'bright'], '#ffaa00', 350, '#ff6600', 400, '#ff2200'], 'circle-opacity': 0.75, 'circle-pitch-alignment': 'map' } }],
    async load() {
      const b = viewBBox();
      const res = await fetch('/api/firms?max=4000&bbox=' + [b.w, b.s, b.e, b.n].map((x) => x.toFixed(2)).join(','));
      if (!res.ok) throw new Error(res.status);
      const d = await res.json();
      const feats = (d.features || []).map((f) => { const p = f.properties || {}; return pt(f.geometry.coordinates[0], f.geometry.coordinates[1], { k: 'firms', frp: parseFloat(p.frp) || 0, bright: parseFloat(p.bright_ti4 || p.brightness) || 300, conf: p.confidence || '', date: p.acq_date || '', time: p.acq_time || '' }); }).filter((f) => !isNaN(f.geometry.coordinates[0]));
      const n = d.in_view || feats.length;
      return { fc: FC(feats), status: fmt(n) + ' hotspots in view' + (n > feats.length ? ' (the strongest ' + fmt(feats.length) + ' drawn)' : '') + ' · ' + timeNow() };
    } },
  { id: 'aircraft', label: 'Aircraft near the map centre (ADS-B)', src: 'adsb.lol, community ADS-B (ODbL); OpenSky if it is down', every: 15000, viewport: true, plane: true,
    layers: [planeLayer],
    async load() {
      const c = map.getCenter(), r = viewRadiusNm();
      try {
        const res = await fetch(ADSB + '/lat/' + c.lat.toFixed(3) + '/lon/' + c.lng.toFixed(3) + '/dist/' + r);
        if (!res.ok) throw new Error(res.status);
        const fc = aircraftFC((await res.json()).ac || []);
        const mil = fc.features.filter((f) => f.properties.mil).length;
        return { fc, status: fc.features.length + ' within ' + r + ' nm (' + mil + ' flagged military) · adsb.lol ' + timeNow() };
      } catch (e) {
        const b = viewBBox();
        const res = await fetch('https://opensky-network.org/api/states/all?lamin=' + b.s.toFixed(2) + '&lomin=' + b.w.toFixed(2) + '&lamax=' + b.n.toFixed(2) + '&lomax=' + b.e.toFixed(2));
        if (!res.ok) throw new Error('both ADS-B sources unavailable');
        const list = ((await res.json()).states || []).slice(0, 500).map((st) => ({ hex: st[0], flight: st[1], lat: st[6], lon: st[5], alt_baro: st[7] ? Math.round(st[7] * 3.28084) : (st[8] ? 'ground' : null), gs: st[9] ? st[9] * 1.94384 : null, track: st[10] }));
        const fc = aircraftFC(list);
        return { fc, status: fc.features.length + ' in view · OpenSky fallback ' + timeNow() };
      }
    } },
  { id: 'navacc', label: 'Low reported position accuracy (ADS-B)', src: 'adsb.lol (ODbL). Aircraft near the map centre whose own accuracy report (NACp) is below 8. Where, not who: interference is one cause among several, and one aircraft is not a measurement.', every: 30000, viewport: true,
    layers: [{ type: 'circle', paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 4, 8, 9], 'circle-color': 'rgba(0,0,0,0)', 'circle-stroke-color': ['step', ['get', 'nacp'], '#ff5a3c', 4, '#ffb000'], 'circle-stroke-width': 1.6, 'circle-stroke-opacity': 0.9, 'circle-pitch-alignment': 'map' } }],
    async load() {
      const c = map.getCenter(), r = viewRadiusNm();
      const res = await fetch(ADSB + '/lat/' + c.lat.toFixed(3) + '/lon/' + c.lng.toFixed(3) + '/dist/' + r);
      if (!res.ok) throw new Error(res.status);
      const ac = ((await res.json()).ac || []).filter((a) => a.lat != null && a.lon != null && a.nac_p != null && a.alt_baro !== 'ground');
      const low = ac.filter((a) => a.nac_p < 8);
      const fc = FC(low.map((a) => pt(a.lon, a.lat, { k: 'navacc', nacp: a.nac_p, call: ((a.flight || '').trim() || a.r || a.hex || 'NO CALLSIGN'), alt: a.alt_baro != null ? a.alt_baro + ' ft' : 'unknown', hex: a.hex || '' })));
      if (!ac.length) return { fc, status: 'No aircraft reporting within ' + r + ' nm. That is a gap in the receiver network, not an empty sky. · ' + timeNow() };
      return { fc, status: low.length + ' of ' + ac.length + ' airborne aircraft reporting accuracy within ' + r + ' nm are below NACp 8 · ' + timeNow() };
    } },
  { id: 'milair', label: 'Military aircraft, worldwide (ADS-B)', src: 'adsb.lol; "military" is the source\'s flag', every: 30000, plane: true,
    layers: [planeLayer],
    async load() {
      const res = await fetch(ADSB + '/mil');
      if (!res.ok) throw new Error(res.status);
      const fc = aircraftFC((await res.json()).ac || []);
      fc.features.forEach((f) => { f.properties.mil = 1; f.properties.col = '#ff4444'; });
      return { fc, status: fc.features.length + ' airborne and transmitting · ' + timeNow() };
    } },
  { id: 'vessels', label: 'Vessels, Finnish waters (AIS)', src: 'Finnish Transport Infrastructure Agency (digitraffic), CC BY 4.0. Open AIS covers Finnish waters only.', every: 30000, viewport: true,
    layers: [{ type: 'circle', paint: { 'circle-radius': 3.5, 'circle-color': ['case', ['>', ['get', 'sog'], 0.5], '#00e5ff', '#44aa88'], 'circle-opacity': 0.85, 'circle-pitch-alignment': 'map' } }],
    names: null,
    async load() {
      if (!this.names) {
        try { const list = await (await fetch(AIS + '/vessels')).json(); this.names = {}; (list || []).forEach((v) => { if (v.mmsi) this.names[v.mmsi] = v; }); } catch (e) { this.names = {}; }
      }
      const c = map.getCenter();
      const res = await fetch(AIS + '/locations?radius=100&latitude=' + c.lat.toFixed(3) + '&longitude=' + c.lng.toFixed(3));
      if (!res.ok) throw new Error(res.status);
      const d = await res.json();
      const feats = (d.features || []).filter((f) => f.geometry && f.geometry.coordinates).map((f) => { const p = f.properties || {}, m = this.names[f.mmsi] || {}; return pt(f.geometry.coordinates[0], f.geometry.coordinates[1], { k: 'vessel', mmsi: f.mmsi, name: m.name || '', dest: m.destination || '', sog: p.sog == null ? 0 : p.sog, heading: p.heading, nav: p.navStat }); });
      return { fc: FC(feats), status: feats.length ? feats.length + ' within 100 km of the centre · ' + timeNow() : 'None here. Open AIS covers Finnish waters only (about 60.1 N, 24.9 E).' };
    } },
  { id: 'iss', label: 'International Space Station', src: 'wheretheiss.at', every: 5000,
    layers: [
      { type: 'fill', filter: ['==', ['get', 'k'], 'issfoot'], paint: { 'fill-color': '#00ff41', 'fill-opacity': 0.04 } },
      { type: 'line', filter: ['==', ['get', 'k'], 'issfoot'], paint: { 'line-color': '#00ff41', 'line-opacity': 0.35, 'line-dasharray': [2, 3] } },
      { type: 'circle', filter: ['==', ['get', 'k'], 'iss'], paint: { 'circle-radius': 6, 'circle-color': '#00ff41', 'circle-stroke-color': '#000', 'circle-stroke-width': 1.5 } },
    ],
    async load() {
      const d = await (await fetch('https://api.wheretheiss.at/v1/satellites/25544')).json();
      const ring = [];
      for (let a = 0; a <= 360; a += 6) {
        const R = 6371, dist = 2200 / R, br = a * Math.PI / 180, la = d.latitude * Math.PI / 180, lo = d.longitude * Math.PI / 180;
        const la2 = Math.asin(Math.sin(la) * Math.cos(dist) + Math.cos(la) * Math.sin(dist) * Math.cos(br));
        const lo2 = lo + Math.atan2(Math.sin(br) * Math.sin(dist) * Math.cos(la), Math.cos(dist) - Math.sin(la) * Math.sin(la2));
        ring.push([lo2 * 180 / Math.PI, la2 * 180 / Math.PI]);
      }
      const fc = FC([{ type: 'Feature', properties: { k: 'issfoot' }, geometry: { type: 'Polygon', coordinates: [ring] } }, pt(d.longitude, d.latitude, { k: 'iss', alt: d.altitude, vel: d.velocity, vis: d.visibility })]);
      return { fc, status: d.latitude.toFixed(2) + ', ' + d.longitude.toFixed(2) + ' at ' + Math.round(d.altitude) + ' km · ' + timeNow() };
    } },
  { id: 'gdacs', label: 'GDACS disaster alerts', src: 'Global Disaster Alert and Coordination System (UN / EU)', every: 600000,
    layers: [{ type: 'circle', paint: { 'circle-radius': ['match', ['get', 'alert'], 'Red', 9, 'Orange', 7, 5], 'circle-color': ['get', 'col'], 'circle-opacity': 0.6, 'circle-stroke-color': ['match', ['get', 'alert'], 'Red', '#ff2200', 'Orange', '#ffaa00', '#22cc44'], 'circle-stroke-width': 2, 'circle-pitch-alignment': 'map' } }],
    async load() {
      const d = await (await fetch('https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?eventlist=EQ,TC,FL,VO,DR,WF&alertlevel=Green;Orange;Red&limit=100')).json();
      const T = { EQ: ['#ff6644', 'EARTHQUAKE'], TC: ['#00ccff', 'TROPICAL CYCLONE'], FL: ['#0066ff', 'FLOOD'], VO: ['#ff0000', 'VOLCANO'], DR: ['#cc8800', 'DROUGHT'], WF: ['#ff4400', 'WILDFIRE'] };
      const feats = (d.features || []).filter((f) => f.geometry && f.geometry.coordinates).map((f) => { const p = f.properties || {}, t = T[p.eventtype] || ['#cccccc', p.eventtype || '']; return pt(f.geometry.coordinates[0], f.geometry.coordinates[1], { k: 'gdacs', col: t[0], typ: t[1], alert: p.alertlevel || '', name: p.name || p.eventname || '', sev: p.severity ? p.severity.severity_text || '' : '', url: p.url && p.url.report ? p.url.report : (typeof p.url === 'string' ? p.url : '') }); });
      return { fc: FC(feats), status: feats.length + ' alerts · ' + timeNow() };
    } },
  { id: 'alpr', label: 'ALPR / Flock cameras (US)', src: 'OpenStreetMap and the DeFlock survey (ODbL). Crowdsourced and incomplete: a blank area is unsurveyed, not camera-free.', once: true,
    layers: [
      { type: 'heatmap', maxzoom: 9, paint: { 'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 2, 4, 8, 14], 'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 2, 0.6, 8, 1.4], 'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0.75, 9, 0], 'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'], 0, 'rgba(0,0,0,0)', 0.2, 'rgba(255,145,0,0.35)', 0.6, 'rgba(255,90,40,0.7)', 1, 'rgba(255,23,68,0.95)'] } },
      { type: 'circle', minzoom: 7, paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 7, 1.6, 12, 4], 'circle-color': ['case', ['==', ['get', 'flock'], 1], '#ff1744', '#ff9100'], 'circle-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0, 8, 0.85], 'circle-pitch-alignment': 'map' } },
    ],
    async load() {
      const d = await (await fetch('/data/alpr-us.json')).json();
      const vendors = d.vendors || [];
      const feats = d.cams.map((c, n) => ({ type: 'Feature', properties: { k: 'alpr', flock: /flock/i.test(vendors[c[2]] || '') ? 1 : 0, v: c[2] }, geometry: { type: 'Point', coordinates: [c[1], c[0]] } }));
      this.vendors = vendors;
      return { fc: FC(feats), status: fmt(feats.length) + ' cameras, as surveyed ' + String(d.generated || '').slice(0, 10) + '. Density below zoom 8, points above.' };
    } },
  { id: 'indigenous', label: 'First Peoples territories', src: 'Native Land Digital where it answers; otherwise approximate outlines carried here', once: true, under: true,
    layers: [
      { type: 'fill', paint: { 'fill-color': ['get', 'col'], 'fill-opacity': 0.22 } },
      { type: 'line', paint: { 'line-color': ['get', 'col'], 'line-opacity': 0.75, 'line-width': 1.2, 'line-dasharray': [3, 2] } },
    ],
    async load() {
      const COLS = ['#ff6b6b', '#4ecdc4', '#ffc300', '#88b04b', '#c780e8', '#ff9a48', '#00ced1', '#ff6347', '#90ee90', '#daa520', '#ad7fa8', '#729fcf', '#e9b96e', '#8ae234', '#fcaf3e'];
      try {
        const res = await fetch('https://native-land.ca/api/index.php?maps=territories');
        if (!res.ok) throw new Error(res.status);
        const data = await res.json();
        if (!Array.isArray(data) || !data.length) throw new Error('empty');
        const feats = data.filter((t) => t.geometry).map((t, n) => ({ type: 'Feature', properties: { k: 'land', col: COLS[n % COLS.length], name: (t.properties && (t.properties.Name || t.properties.name || t.properties.title)) || 'Territory', desc: (t.properties && t.properties.description) || '', src: 'Native Land Digital' }, geometry: t.geometry }));
        return { fc: FC(feats), status: feats.length + ' territories from Native Land Digital' };
      } catch (e) {
        const feats = (W.worldTerritories || []).map((t, n) => { const ring = t.coords.map((c) => [c[1], c[0]]); ring.push(ring[0]); return { type: 'Feature', properties: { k: 'land', col: COLS[n % COLS.length], name: t.name, region: t.region, desc: t.desc, src: 'approximate outline carried by this site' }, geometry: { type: 'Polygon', coordinates: [ring] } }; });
        return { fc: FC(feats), status: feats.length + ' approximate outlines (Native Land Digital did not answer)' };
      }
    } },
];

function feedLayerIds(f) { return f.layers.map((_, n) => 'live-' + f.id + '-' + n); }

function addFeedLayers(f) {
  if (map.getSource('live-' + f.id)) return;
  map.addSource('live-' + f.id, { type: 'geojson', data: FC([]) });
  f.layers.forEach((L, n) => {
    const spec = typeof L === 'function' ? L('live-' + f.id + '-' + n, 'live-' + f.id) : Object.assign({ id: 'live-' + f.id + '-' + n, source: 'live-' + f.id }, L);
    map.addLayer(spec, f.under ? 'ctx-top' : 'live-top');
  });
  if (!f.under) liveHit = liveHit.concat(feedLayerIds(f));
  else ctxHit = ctxHit.concat(feedLayerIds(f));
}

function feedStatus(f, msg) { const el = $('#fs-' + f.id); if (el) el.textContent = msg; }

async function runFeed(f) {
  if (!f.on) return false;
  try {
    const r = await f.load.call(f);
    if (!f.on) return false;
    map.getSource('live-' + f.id).setData(r.fc);
    feedStatus(f, r.status);
    return true;
  } catch (e) {
    feedStatus(f, 'Unavailable (' + (e && e.message ? e.message : 'error') + ')' + (f.once ? '' : ' - retrying'));
    return false;
  }
}

function setFeed(f, on) {
  if (!READY) { const cb = $('#feed-' + f.id); if (cb) cb.checked = false; return; }
  f.on = on;
  const cb = $('#feed-' + f.id);
  if (cb) cb.checked = on;
  if (on) {
    addFeedLayers(f);
    feedLayerIds(f).forEach((id) => map.setLayoutProperty(id, 'visibility', 'visible'));
    if (!(f.once && f.loaded)) { feedStatus(f, 'Loading...'); runFeed(f).then((ok) => { f.loaded = ok; }); }
    if (f.every) f.timer = setInterval(() => runFeed(f), f.every);
  } else {
    clearInterval(f.timer); f.timer = null;
    if (map.getSource('live-' + f.id)) feedLayerIds(f).forEach((id) => map.setLayoutProperty(id, 'visibility', 'none'));
    if (!f.once) { if (map.getSource('live-' + f.id)) map.getSource('live-' + f.id).setData(FC([])); feedStatus(f, ''); f.loaded = false; }
  }
  $('#gLiveN').textContent = FEEDS.filter((x) => x.on && x.id !== 'indigenous').length ? FEEDS.filter((x) => x.on && x.id !== 'indigenous').length + ' on' : '';
}

function buildFeedsDOM() {
  $('#liveList').innerHTML = FEEDS.map((f) =>
    '<div class="mg-feed"><label class="mg-check"><input type="checkbox" id="feed-' + f.id + '" autocomplete="off"> ' + esc(f.label) + '</label>' +
    '<div class="mg-src">' + esc(f.src) + '</div><div class="mg-fs" id="fs-' + f.id + '" data-dynamic></div></div>').join('');
  FEEDS.forEach((f) => $('#feed-' + f.id).addEventListener('change', (e) => setFeed(f, e.target.checked)));
}
function bindFeeds() {
  // viewport feeds refresh when the view settles
  let t = null;
  map.on('moveend', () => { clearTimeout(t); t = setTimeout(() => FEEDS.forEach((f) => { if (f.on && f.viewport) runFeed(f); }), 600); });
}

function liveTip(f) {
  const p = f.properties;
  switch (p.k) {
    case 'quake': return 'M' + Number(p.mag).toFixed(1) + ' · ' + p.place;
    case 'eonet': return p.cat + ' · ' + p.title;
    case 'firms': return 'Heat hotspot · ' + Number(p.frp).toFixed(1) + ' MW';
    case 'aircraft': return p.call + (p.mil ? ' · military (source flag)' : '') + ' · ' + p.alt;
    case 'navacc': return p.call + ' · reports NACp ' + p.nacp;
    case 'vessel': return (p.name || 'MMSI ' + p.mmsi);
    case 'iss': return 'International Space Station';
    case 'gdacs': return 'GDACS ' + p.typ + ' · ' + p.name;
    case 'alpr': return (p.flock ? 'Flock Safety' : 'ALPR') + ' camera';
    case 'land': return p.name;
    default: return '';
  }
}

function liveCard(f) {
  const p = f.properties;
  const c = f.geometry && f.geometry.type === 'Point' ? f.geometry.coordinates : null;
  const where = c ? '<dt>Position</dt><dd>' + c[1].toFixed(4) + ', ' + c[0].toFixed(4) + '</dd>' : '';
  let h = '', kv = '', note = '';
  switch (p.k) {
    case 'quake': h = 'Earthquake M' + Number(p.mag).toFixed(1); kv = '<dt>Place</dt><dd>' + esc(p.place) + '</dd><dt>Depth</dt><dd>' + Number(p.depth).toFixed(1) + ' km</dd><dt>Time</dt><dd>' + esc(new Date(p.time).toLocaleString()) + '</dd>'; note = 'U.S. Geological Survey' + (p.url ? ' · <a href="' + esc(p.url) + '" target="_blank" rel="noopener">event page</a>' : ''); break;
    case 'eonet': h = p.cat + ': ' + p.title; kv = p.date ? '<dt>Date</dt><dd>' + esc(new Date(p.date).toLocaleDateString()) + '</dd>' : ''; note = 'NASA EONET' + (p.url ? ' · <a href="' + esc(p.url) + '" target="_blank" rel="noopener">source</a>' : ''); break;
    case 'firms': h = 'Heat hotspot'; kv = '<dt>Fire radiative power</dt><dd>' + Number(p.frp).toFixed(1) + ' MW</dd><dt>Brightness</dt><dd>' + Math.round(p.bright) + ' K</dd>' + (p.conf ? '<dt>Confidence</dt><dd>' + esc(p.conf) + '</dd>' : '') + '<dt>Observed</dt><dd>' + esc(p.date + ' ' + p.time) + ' UTC</dd>'; note = 'NASA FIRMS (VIIRS, 375 m). Heat detected by satellite. Wildfires, gas flares, industrial plants and volcanoes all register; the sensor does not say which.'; break;
    case 'aircraft': h = p.call; kv = (p.type ? '<dt>Type</dt><dd>' + esc(p.type) + '</dd>' : '') + (p.reg ? '<dt>Reg</dt><dd>' + esc(p.reg) + '</dd>' : '') + '<dt>Altitude</dt><dd>' + esc(p.alt) + '</dd>' + (p.gs !== '' ? '<dt>Speed</dt><dd>' + p.gs + ' kt</dd>' : '') + '<dt>Track</dt><dd>' + Math.round(p.track) + '&deg;</dd>' + (p.sq ? '<dt>Squawk</dt><dd>' + esc(p.sq) + '</dd>' : ''); note = 'ADS-B via adsb.lol · hex ' + esc(p.hex) + (p.mil ? '. "Military" is the source\'s registration flag or a callsign pattern, not a finding here.' : ''); break;
    case 'navacc': h = p.call + ': low reported position accuracy'; kv = '<dt>NACp</dt><dd>' + p.nacp + '</dd><dt>Its stated uncertainty</dt><dd>' + esc(NACP_EPU[p.nacp] || 'unknown') + '</dd><dt>Altitude</dt><dd>' + esc(p.alt) + '</dd>'; note = 'The aircraft\'s own ADS-B accuracy report (NACp), via adsb.lol (ODbL) · hex ' + esc(p.hex) + '. Aircraft with working GNSS usually report 8 to 11. A low value can come from interference, from old or faulty equipment, or from a receiver fault, and 0 also means "not known". This layer shows where; it does not say why or who.'; break;
    case 'vessel': h = p.name || 'MMSI ' + p.mmsi; kv = '<dt>MMSI</dt><dd>' + esc(p.mmsi) + '</dd>' + (p.dest ? '<dt>Destination</dt><dd>' + esc(p.dest) + '</dd>' : '') + '<dt>Speed</dt><dd>' + esc(p.sog) + ' kt</dd>'; note = 'AIS via digitraffic (Finnish Transport Infrastructure Agency), CC BY 4.0. Finnish waters only.'; break;
    case 'iss': h = 'International Space Station'; kv = '<dt>Altitude</dt><dd>' + Number(p.alt).toFixed(1) + ' km</dd><dt>Velocity</dt><dd>' + Math.round(p.vel) + ' km/h</dd><dt>Visibility</dt><dd>' + esc(p.vis) + '</dd>'; note = 'wheretheiss.at. The dashed ring is a 2,200 km footprint.'; break;
    case 'gdacs': h = 'GDACS ' + p.typ + ': ' + p.name; kv = '<dt>Alert</dt><dd>' + esc(p.alert) + '</dd>' + (p.sev ? '<dt>Severity</dt><dd>' + esc(p.sev) + '</dd>' : ''); note = 'Global Disaster Alert and Coordination System' + (p.url ? ' · <a href="' + esc(p.url) + '" target="_blank" rel="noopener">report</a>' : ''); break;
    case 'alpr': { const v = (FEEDS.find((x) => x.id === 'alpr').vendors || [])[p.v] || 'unspecified'; h = 'ALPR camera'; kv = '<dt>Vendor</dt><dd>' + esc(v) + '</dd>'; note = 'Reads every passing plate and writes a timestamped, geolocated record. OpenStreetMap / DeFlock survey (ODbL), crowdsourced and incomplete. <a href="/report#X" target="_blank" rel="noopener">Section X: what this network is</a>'; break; }
    case 'land': h = p.name; kv = p.region ? '<dt>Region</dt><dd>' + esc(p.region) + '</dd>' : ''; note = esc(p.desc) + '<br><br>Source: ' + esc(p.src) + '. The land had names before the colonizers arrived.'; openCard('<h2>' + esc(h) + '</h2><dl class="mg-kv">' + kv + '</dl><p class="mg-small">' + note + '</p>'); return;
    default: return;
  }
  S.sel = { kind: 'feature' };
  openCard('<h2>' + esc(h) + '</h2><dl class="mg-kv">' + kv + where + '</dl><p class="mg-small">' + note + '</p>');
}

// The plane icon: a signed-distance arrow, tinted per feature.
function addPlaneIcon() {
  const n = 32, cv = document.createElement('canvas');
  cv.width = cv.height = n;
  const g = cv.getContext('2d');
  g.fillStyle = '#fff';
  g.beginPath(); g.moveTo(n / 2, 2); g.lineTo(n - 7, n - 5); g.lineTo(n / 2, n - 11); g.lineTo(7, n - 5); g.closePath(); g.fill();
  map.addImage('b0b-plane', g.getImageData(0, 0, n, n), { sdf: true });
}

// ------------------------------------------------------------------ context layers (step 3)
// Each entry: { id, label, file, geom: 'line'|'point', color, src, licence, attribution,
// fields (property -> card label), radius (optional circle-radius expression) }.
// Files are built by scripts/build-context-layers.py into /data-context/ (Vercel
// static output). Drawn under the evidence, in one muted colour, never as edges.
const CONTEXT = W.B0B_CONTEXT_LAYERS || [
  {
    id: 'power', label: 'Power plants (2021)', file: '/data-context/power-plants.json?v=1', geom: 'point', color: '#a8a08a',
    src: 'WRI Global Power Plant Database v1.3.0: plants of 1 MW and over, as of June 2021; WRI stopped maintaining it in 2022',
    licence: 'CC BY 4.0, simplified by b0b.dev',
    attribution: 'Power plants: <a href="https://datasets.wri.org/datasets/global-power-plant-database">WRI Global Power Plant Database v1.3.0</a> (CC BY 4.0)',
    fields: { name: 'Plant', fuel: 'Fuel', mw: 'Capacity (MW)', country: 'Country', year: 'Commissioned', src: 'Source', id: 'Database id' },
    radius: ['interpolate', ['linear'], ['zoom'], 0, ['interpolate', ['linear'], ['sqrt', ['get', 'mw']], 1, 0.8, 70, 3.2], 8, ['interpolate', ['linear'], ['sqrt', ['get', 'mw']], 1, 2.2, 70, 9]],
  },
];

function buildContextDOM() {
  const box = $('#contextList');
  if (!CONTEXT.length) { box.innerHTML = '<p class="mg-note">No context layers yet.</p>'; return; }
  box.innerHTML = CONTEXT.map((c) =>
    '<div class="mg-feed"><label class="mg-check"><input type="checkbox" id="ctx-' + c.id + '" autocomplete="off"> <i class="mg-dot" style="background:' + esc(c.color) + '"></i> ' + esc(c.label) + '</label>' +
    '<div class="mg-src">' + esc(c.src) + '</div><div class="mg-fs" id="cs-' + c.id + '" data-dynamic></div></div>').join('');
  CONTEXT.forEach((c) => $('#ctx-' + c.id).addEventListener('change', (e) => setContext(c, e.target.checked)));
}

async function setContext(c, on) {
  if (!READY) { $('#ctx-' + c.id).checked = false; return; }
  c.on = on;
  const ids = (c.geom === 'line' ? ['l'] : ['p']).map((s) => 'ctx-' + c.id + '-' + s);
  if (on && !map.getSource('ctx-' + c.id)) {
    $('#cs-' + c.id).textContent = 'Loading...';
    try {
      const d = await (await fetch(c.file)).json();
      map.addSource('ctx-' + c.id, { type: 'geojson', data: d, attribution: c.attribution || '' });
      if (c.geom === 'line') map.addLayer({ id: ids[0], type: 'line', source: 'ctx-' + c.id, layout: { 'line-join': 'round' }, paint: { 'line-color': c.color, 'line-width': ['interpolate', ['linear'], ['zoom'], 0, 0.6, 6, 1.2, 10, 2], 'line-opacity': 0.55 } }, 'ctx-top');
      else map.addLayer({ id: ids[0], type: 'circle', source: 'ctx-' + c.id, paint: { 'circle-radius': c.radius || ['interpolate', ['linear'], ['zoom'], 0, 1.4, 6, 2.6, 10, 4], 'circle-color': c.color, 'circle-opacity': 0.45, 'circle-stroke-width': 0.5, 'circle-stroke-color': 'rgba(0,0,0,0.6)', 'circle-pitch-alignment': 'map' } }, 'ctx-top');
      ctxHit = ctxHit.concat(ids);
      $('#cs-' + c.id).textContent = fmt((d.features || []).length) + ' features';
    } catch (e) {
      $('#cs-' + c.id).textContent = 'Unavailable (' + (e.message || 'error') + ')';
      c.on = false; $('#ctx-' + c.id).checked = false; return;
    }
  }
  ids.forEach((id) => { if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', on ? 'visible' : 'none'); });
  const n = CONTEXT.filter((x) => x.on).length;
  $('#gContextN').textContent = n ? n + ' on' : '';
}

function ctxLayer(f) { return CONTEXT.find((c) => f.layer && f.layer.id.indexOf('ctx-' + c.id + '-') === 0); }
function ctxTip(f) {
  if (f.properties && f.properties.k === 'land') return f.properties.name;
  const c = ctxLayer(f);
  return (f.properties && (f.properties.name || f.properties.n)) ? (f.properties.name || f.properties.n) + (c ? ' · ' + c.label : '') : (c ? c.label : '');
}
function ctxCard(f) {
  if (f.properties && f.properties.k === 'land') return liveCard(f);
  const c = ctxLayer(f);
  if (!c) return;
  const p = f.properties || {};
  const rows = Object.keys(p).filter((k) => p[k] !== '' && p[k] != null && k !== 'k' && k !== 'name').map((k) => '<dt>' + esc((c.fields && c.fields[k]) || k) + '</dt><dd>' + esc(p[k]) + '</dd>').join('');
  S.sel = { kind: 'feature' };
  openCard('<div class="mg-meta"><span><i class="mg-dot" style="background:' + esc(c.color) + '"></i>CONTEXT · ' + esc(c.label) + '</span></div><h2>' + esc(p.name || p.n || c.label) + '</h2><dl class="mg-kv">' + rows + '</dl><p class="mg-small">' + esc(c.src) + '. ' + esc(c.licence) + '. Context, not evidence: nothing on this map is connected to it by being near it.</p>');
}

// ------------------------------------------------------------------ links
function viewParams(markerName) {
  const p = new URLSearchParams();
  p.set('engine', 'gl');
  const q = $('#searchInput').value.trim();
  if (q) p.set('search', q);
  if (S.sections.size !== SECTIONS.length) p.set('section', Array.from(S.sections).join(','));
  if (S.types.size !== TYPES.length) p.set('type', Array.from(S.types).join(','));
  if (S.tierMin !== 3) p.set('tier', String(S.tierMin));
  if (S.proj !== 'globe') p.set('view', 'flat');
  if (S.relief) p.set('relief', '1');
  if (S.base !== 'earth') p.set('base', S.base);
  if (markerName) p.set('marker', markerName);
  else if (map) { const c = map.getCenter(); p.set('lat', c.lat.toFixed(4)); p.set('lng', c.lng.toFixed(4)); p.set('zoom', String(Math.round(map.getZoom() + 1))); }
  return location.origin + '/map?' + p.toString();
}
function copyLink(btn, markerName) {
  const link = viewParams(markerName);
  const done = () => { const t = btn.textContent; btn.textContent = 'COPIED'; setTimeout(() => { btn.textContent = t; }, 1600); };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(link).then(done, () => W.prompt('Copy this link:', link));
  else W.prompt('Copy this link:', link);
}

// Deep links: the classic map's parameters (search, q, section, type, lat,
// lng, zoom, marker - zoom in Leaflet's units, one more than GL's) plus view,
// relief, base and tier.
function readParams() {
  const q = params.get('search') || params.get('q');
  if (q) { $('#searchInput').value = q; S.query = parseQuery(q); $('#searchClear').hidden = false; }
  const sec = params.get('section');
  if (sec) { const want = sec.split(','); S.sections = new Set(SECTIONS.filter((s) => want.indexOf(s) !== -1)); }
  const typ = params.get('type');
  if (typ) { const want = typ.split(','); S.types = new Set(TYPES.filter((t) => want.indexOf(t) !== -1)); }
  $$('#panel input[data-section]').forEach((c) => { c.checked = S.sections.has(c.dataset.section); });
  $$('#panel input[data-type]').forEach((c) => { c.checked = S.types.has(c.dataset.type); });
  const tier = params.get('tier');
  if (tier !== null && /^[0-5]$/.test(tier)) S.tierMin = +tier;
}
function applyViewParams() {
  if (params.get('view') === 'flat') setProjection('mercator');
  if (params.get('base')) setBase(params.get('base'));
  const lat = parseFloat(params.get('lat')), lng = parseFloat(params.get('lng'));
  if (!isNaN(lat) && !isNaN(lng)) map.jumpTo({ center: [lng, lat], zoom: Math.max(0, (parseInt(params.get('zoom'), 10) || 12) - 1) });
  const m = params.get('marker');
  if (m) {
    const needle = m.toLowerCase();
    const s = SITES.find((x) => x.name.toLowerCase().indexOf(needle) !== -1);
    if (s) { map.jumpTo({ center: [s.lng, s.lat], zoom: Math.max(0, (parseInt(params.get('zoom'), 10) || 14) - 1) }); selectSite(s.i, false); }
  }
  if (params.get('relief') === '1') setRelief(true);
}

// ------------------------------------------------------------------ boot
function onLoad() {
  READY = true;
  addPlaneIcon();
  bindFeeds();
  bindMap();
  if (S.proj !== 'globe') map.setProjection({ type: S.proj });
  tierFilters();
  recompute();
  applyFocus();
  applyViewParams();
  W.__b0bGLReady = true;
  document.dispatchEvent(new CustomEvent('b0b-map-ready'));
}

buildLists();
buildFeedsDOM();
buildContextDOM();
bindPanel();
readParams();
renderTierUI();
recompute();
guard();

// ------------------------------------------------------------------ integrity guard
// The classic map's watchdog, content signature, network canary and devtools
// note, pointed at this page's elements. Text marked data-dynamic changes by
// design and is left out of the signature; a language switch (i18n.js
// announces it with b0b-lang) is not tampering.
function guard() {
  const watch = [
    { sel: '.header h1', label: 'HEADER TITLE' },
    { sel: '.header nav', label: 'NAV LINKS' },
    { sel: '#mgStats', label: 'STATS', dynamic: /^SITES /i },
    { sel: '.cm-drawer-bar h3', label: 'CM DRAWER HEADING' },
  ];
  const snaps = {}, log = [];
  let fired = false, langAt = 0;
  W.addEventListener('b0b-lang', () => { langAt = Date.now(); setTimeout(snapSig, 0); });
  const alarm = (label) => {
    if (fired) return; fired = true;
    const a = document.createElement('div');
    a.style.cssText = 'position:fixed;top:60px;left:50%;transform:translateX(-50%);z-index:10000;background:#1a0000;border:1px solid #ff0000;color:#ff0000;padding:10px 20px;font-family:var(--mono);font-size:0.75rem;letter-spacing:1px;pointer-events:none;text-align:center;transition:opacity 2s';
    a.innerHTML = '&#9888; DOM INTEGRITY VIOLATION<br><span style="font-size:0.6rem;color:#ff6666">' + esc(label) + ' - content altered after load</span>';
    document.body.appendChild(a);
    setTimeout(() => { a.style.opacity = '0'; }, 8000); setTimeout(() => a.remove(), 10000);
  };
  setTimeout(() => {
    watch.forEach((t) => { const el = $(t.sel); if (el) snaps[t.sel] = { text: el.textContent, t }; });
    new MutationObserver((ms) => ms.forEach((m) => {
      Object.keys(snaps).forEach((sel) => {
        const el = $(sel);
        if (!el || !(el === m.target || el.contains(m.target))) return;
        const s = snaps[sel], now = el.textContent;
        if (s.t.dynamic && s.t.dynamic.test(now)) { s.text = now; return; }
        if (Date.now() - langAt < 3000) { s.text = now; return; }
        if (now !== s.text) { log.push({ element: s.t.label, expected: s.text.slice(0, 100), found: now.slice(0, 100), time: new Date().toISOString() }); console.warn('[DOM WATCHDOG] unauthorized mutation', s.t.label); alarm(s.t.label); }
      });
    })).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['href', 'src', 'action', 'onclick', 'onchange'] });
    const ok = [location.origin, 'https://www.youtube.com', 'https://www.youtube-nocookie.com'];
    new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => {
      if (n.nodeName !== 'SCRIPT') return;
      const src = n.src || '(inline)', expected = !!n.src && ok.some((o) => src.indexOf(o + '/') === 0);
      log.push({ element: expected ? 'script (expected origin)' : 'INJECTED SCRIPT', found: src.slice(0, 200), time: new Date().toISOString() });
      if (!expected) { console.error('[DOM WATCHDOG] script injection: ' + src); alarm('SCRIPT INJECTION'); }
    }))).observe(document.documentElement, { childList: true, subtree: true });
  }, 2000);
  W.__domWatchdogLog = () => log;

  // Content signature: text of the header and the panel, without data-dynamic parts.
  const sigEls = ['.header', '.mg-panel'];
  const sigText = (el) => { const c = el.cloneNode(true); c.querySelectorAll('[data-dynamic]').forEach((n) => n.remove()); return c.textContent; };
  const sig = {};
  function snapSig() { sigEls.forEach((s) => { const el = $(s); if (el) sig[s] = sigText(el); }); }
  const h1 = $('.header h1');
  const lock = document.createElement('span');
  lock.id = 'integrityLock'; lock.textContent = '🔒'; lock.title = 'Content integrity OK';
  lock.style.cssText = 'margin-left:8px;font-size:0.7rem;cursor:help;color:var(--green)';
  if (h1) h1.after(lock);
  setTimeout(() => {
    snapSig();
    setInterval(() => {
      const bad = sigEls.filter((s) => { const el = $(s); return el && sig[s] !== undefined && sigText(el) !== sig[s]; });
      if (bad.length) { lock.textContent = '🔓'; lock.title = 'Content integrity FAILED - ' + bad.join(', ') + ' modified'; lock.style.color = '#ff0000'; console.warn('[CONTENT SIG] mismatch: ' + bad.join(', ')); }
    }, 30000);
  }, 3000);

  // Network canary: tile hosts probed once; a partial failure is reported.
  const probes = [
    ['OSM', 'https://tile.openstreetmap.org/0/0/0.png'],
    ['Esri', 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/0/0/0'], ['OpenTopo', 'https://a.tile.opentopomap.org/0/0/0.png'],
    ['Terrain', 'https://elevation-tiles-prod.s3.amazonaws.com/terrarium/0/0/0.png'],
  ];
  const res = {};
  let done = 0;
  probes.forEach(([name, url]) => {
    const img = new Image(), t0 = Date.now();
    let fin = false;
    const end = (st) => { if (fin) return; fin = true; res[name] = { status: st, latency: Date.now() - t0 }; if (++done === probes.length) report(); };
    const to = setTimeout(() => end('TIMEOUT'), 5000);
    img.onload = () => { clearTimeout(to); end('OK'); };
    img.onerror = () => { clearTimeout(to); end('BLOCKED'); };
    img.src = url;
  });
  function report() {
    const bad = Object.keys(res).filter((k) => res[k].status !== 'OK');
    console.log('[NETWORK CANARY]', JSON.stringify(res));
    if (bad.length && bad.length < probes.length) {
      const el = document.createElement('div');
      el.style.cssText = 'position:fixed;bottom:calc(var(--mg-bottom) + 8px);left:50%;transform:translateX(-50%);z-index:9;background:#1a0a00;border:1px solid #ff6600;color:#ff6600;padding:4px 10px;font-family:var(--mono);font-size:0.6rem;letter-spacing:1px;cursor:help;opacity:0.85';
      el.textContent = '⚠ ' + bad.length + '/' + probes.length + ' MAP HOSTS UNREACHABLE';
      el.title = 'Unreachable: ' + bad.join(', ') + '. Some hosts answered and some did not, which points to blocking rather than an outage.';
      document.body.appendChild(el);
    }
  }
  W.__networkCanary = () => res;

  setInterval(() => {
    if (W.outerWidth - W.innerWidth > 160 || W.outerHeight - W.innerHeight > 160) console.log('[COUNTERMEASURE] DevTools detected - potential inspection at ' + new Date().toISOString());
  }, 10000);
  if ('serviceWorker' in navigator) navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister())).catch(() => {});
}
