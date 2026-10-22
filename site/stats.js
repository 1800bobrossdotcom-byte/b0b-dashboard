/* /stats - the counts dashboard. Reads only this site's own public data:
   /api/stats (daily aggregate page loads), /data/build.json, /data/retractions.json
   and /data/sources-ledger.json. Charts are drawn here as SVG; no library. */
(function () {
  'use strict';

  var NAMES = {
    '/': 'The report (front door)', '/report': 'The report', '/map': 'The map',
    '/map?engine=classic': 'The map (classic)', '/lab': 'Map lab', '/map/list': 'The map as text',
    '/home': 'Films', '/start': 'Briefing', '/retractions': 'Corrections', '/intro': 'Intro film',
    '/continuity': 'Continuity (film)', '/epstein-maxwell': 'The Epstein-Maxwell Record (film)',
    '/endgame': 'Endgame (film)', '/stickers': 'Stickers', '/announcement': 'Announcement',
    '/countermeasures': 'Countermeasures', '/artifact': 'Artifact', '/spectra': 'Spectra',
    '/tones/shield': 'ARC Shield', '/tones/shield/guide': 'ARC Shield guide',
    '/tones/healing': 'Tones: healing', '/tones/protective': 'Tones: protective',
    '/tones/instrument': 'Tones: instrument', '/tones/multipack': 'Tones: multipack',
    '/ai-attack-vector-analysis': 'AI attack-vector analysis', '/darpa-cia-lockheed': 'DARPA, CIA, Lockheed'
  };
  var TIER_NAMES = ['analogy', 'correlation', 'contact', 'material', 'coordination', 'causation'];
  var SERIES = [
    { key: 'browser', label: 'Browsers', color: 'var(--s-browser)' },
    { key: 'crawler', label: 'Known crawlers', color: 'var(--s-crawler)' },
    { key: 'other', label: 'Other clients', color: 'var(--s-other)' }
  ];
  var REFUSED = { http_403: 1, http_401: 1, http_429: 1, robots_disallow: 1, decoy_200: 1 };
  var SVGNS = 'http://www.w3.org/2000/svg';

  function $(id) { return document.getElementById(id); }
  function fmt(n) { return Number(n || 0).toLocaleString('en-GB'); }
  function el(tag, attrs, text) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }
  function svg(tag, attrs) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function getJSON(url) {
    return fetch(url, { credentials: 'same-origin', cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error(url + ' ' + r.status); return r.json(); });
  }
  function dayLabel(iso, withYear) {
    var d = new Date(iso + 'T00:00:00Z');
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: withYear ? 'numeric' : undefined, timeZone: 'UTC' });
  }
  function niceMax(v) {
    if (v <= 4) return 4;
    var p = Math.pow(10, Math.floor(Math.log10(v))), m = v / p;
    var steps = [1, 2, 3, 4, 5, 6, 8, 10];
    for (var i = 0; i < steps.length; i++) if (m <= steps[i]) return steps[i] * p;
    return 10 * p;
  }
  // a bar whose top corners are rounded and whose base sits square on the axis
  function barPath(x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h));
    return 'M' + x + ',' + (y + h) + 'V' + (y + r) + 'Q' + x + ',' + y + ' ' + (x + r) + ',' + y +
      'H' + (x + w - r) + 'Q' + (x + w) + ',' + y + ' ' + (x + w) + ',' + (y + r) + 'V' + (y + h) + 'Z';
  }

  /* ---------- a stacked (or single-series) daily bar chart with hover ---------- */
  function barChart(host, rows, series, opts) {
    host.textContent = '';
    var W = Math.max(300, host.clientWidth || 600), H = opts.height || 220;
    var padL = 44, padR = 8, padT = 10, padB = 26;
    var iw = W - padL - padR, ih = H - padT - padB;
    var max = 0;
    rows.forEach(function (r) {
      var t = 0; series.forEach(function (s) { t += r[s.key] || 0; }); if (t > max) max = t;
    });
    var top = niceMax(max), n = rows.length;
    var slot = iw / n, gap = Math.min(2, slot * 0.25), bw = Math.max(1, slot - gap);
    var root = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': opts.aria });
    var y = function (v) { return padT + ih - (v / top) * ih; };

    for (var g = 0; g <= 4; g++) {
      var v = top * g / 4, gy = Math.round(y(v)) + 0.5;
      root.appendChild(svg('line', { x1: padL, x2: W - padR, y1: gy, y2: gy, stroke: g ? 'var(--grid)' : 'var(--border)', 'stroke-width': 1 }));
      var t = svg('text', { x: padL - 8, y: gy + 4, 'text-anchor': 'end' }); t.textContent = fmt(v); root.appendChild(t);
    }

    if (opts.before != null && opts.before > 0) {      // days before the counting began
      var bx = padL, bwid = opts.before * slot;
      root.appendChild(svg('rect', { x: bx, y: padT, width: bwid, height: ih, fill: 'var(--surface-2)' }));
      if (bwid > 110) {
        var nt = svg('text', { x: bx + bwid / 2, y: padT + ih / 2, 'text-anchor': 'middle' });
        nt.textContent = 'not recorded'; root.appendChild(nt);
      }
    }

    rows.forEach(function (r, i) {
      var x = padL + i * slot + gap / 2, base = y(0), stack = series.filter(function (s) { return r[s.key] > 0; });
      stack.forEach(function (s, j) {
        var h = (r[s.key] / top) * ih, last = j === stack.length - 1;
        var segGap = j > 0 ? Math.min(2, h / 2) : 0;          // 2px surface gap between stacked fills
        var top_ = base - h, hh = h - segGap;
        if (hh > 0) root.appendChild(svg('path', { d: barPath(x, top_, bw, hh, last ? 3 : 0), fill: s.color }));
        base = top_;
      });
    });

    var every = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(iw / 64))));
    rows.forEach(function (r, i) {
      if ((n - 1 - i) % every) return;
      var lt = svg('text', { x: padL + i * slot + slot / 2, y: H - 8, 'text-anchor': 'middle' });
      lt.textContent = opts.xLabel(r); root.appendChild(lt);
    });

    var tip = el('div', { class: 'tip', hidden: '' }), hover = svg('rect', { y: padT, height: ih, width: slot, fill: 'var(--grid)', visibility: 'hidden' });
    root.insertBefore(hover, root.firstChild);
    var hit = svg('rect', { x: padL, y: padT, width: iw, height: ih, fill: 'transparent' });
    function show(evt) {
      var bb = root.getBoundingClientRect(), sx = (evt.clientX - bb.left) * (W / bb.width);
      var i = Math.floor((sx - padL) / slot);
      if (i < 0 || i >= n) return hide();
      var r = rows[i];
      hover.setAttribute('x', padL + i * slot); hover.setAttribute('visibility', 'visible');
      tip.innerHTML = '';
      tip.appendChild(el('b', null, opts.tipTitle(r)));
      opts.tipRows(r).forEach(function (row) {
        var d = el('div', { class: row[3] ? 'row in' : 'row' }), a = el('span'), b = el('span', { class: 'num' }, row[1]);
        if (row[2]) a.appendChild(el('span', { class: 'key', style: 'background:' + row[2] }));
        a.appendChild(document.createTextNode(row[0])); d.appendChild(a); d.appendChild(b); tip.appendChild(d);
      });
      tip.hidden = false;
      var px = (padL + i * slot + slot / 2) * (bb.width / W), tw = tip.offsetWidth;
      tip.style.left = Math.max(0, Math.min(bb.width - tw, px - tw / 2)) + 'px';
      tip.style.top = '-8px'; tip.style.transform = 'translateY(-100%)';
    }
    function hide() { tip.hidden = true; hover.setAttribute('visibility', 'hidden'); }
    hit.addEventListener('pointermove', show);
    hit.addEventListener('pointerdown', show);
    hit.addEventListener('pointerleave', hide);
    root.appendChild(hit);
    host.appendChild(root);
    host.appendChild(tip);
  }

  function redrawOnResize(host, draw) {
    var w = host.clientWidth;
    if (!('ResizeObserver' in window)) return;
    new ResizeObserver(function () {
      if (Math.abs(host.clientWidth - w) < 8) return;
      w = host.clientWidth; draw();
    }).observe(host);
  }

  /* ---------- readers ---------- */
  var current = 30, statsReq = 0;

  function sum(rows, k) { return rows.reduce(function (a, r) { return a + (r[k] || 0); }, 0); }

  function renderReaders(d) {
    var rows = d.days, since = d.daily_since;
    var before = since ? rows.filter(function (r) { return r.date < since; }).length : rows.length;
    $('r-asof').textContent = 'last ' + rows.length + ' days, UTC' + (since ? ' · counting since ' + dayLabel(since, true) : '');
    $('k-browser').textContent = fmt(sum(rows, 'browser'));
    var today = rows[rows.length - 1];
    $('k-browser-sub').textContent = fmt(today.browser) + ' so far today (UTC)';
    $('k-arrivals').textContent = fmt(sum(rows, 'arrivals'));
    $('k-crawler').textContent = fmt(sum(rows, 'crawler'));
    $('k-other').textContent = fmt(sum(rows, 'other'));

    var host = $('c-daily');
    var draw = function () {
      if (!since) { host.innerHTML = ''; host.appendChild(el('div', { class: 'empty' }, 'Nothing counted yet. Daily counts begin with the first page served after this deploy.')); return; }
      barChart(host, rows, SERIES, {
        height: 230, before: before,
        aria: 'Page loads per day by kind of client, last ' + rows.length + ' days',
        xLabel: function (r) { return dayLabel(r.date); },
        tipTitle: function (r) { return dayLabel(r.date, true) + (r.date < since ? ' · not recorded' : ''); },
        tipRows: function (r) {
          return [['Browsers', fmt(r.browser), 'var(--s-browser)'], ['of which arrivals', fmt(r.arrivals), null, true],
            ['Known crawlers', fmt(r.crawler), 'var(--s-crawler)'], ['Other clients', fmt(r.other), 'var(--s-other)']];
        }
      });
    };
    draw(); redrawOnResize(host, draw);

    var tb = $('t-daily').tBodies[0]; tb.textContent = '';
    rows.slice().reverse().forEach(function (r) {
      if (since && r.date < since) return;
      var tr = el('tr');
      tr.appendChild(el('td', null, dayLabel(r.date, true)));
      ['browser', 'arrivals', 'crawler', 'other'].forEach(function (k) { tr.appendChild(el('td', { class: 'r' }, fmt(r[k]))); });
      tb.appendChild(tr);
    });

    var pages = {};
    rows.forEach(function (r) { for (var p in r.pages) pages[p] = (pages[p] || 0) + r.pages[p]; });
    var list = Object.keys(pages).map(function (p) { return [p, pages[p]]; }).sort(function (a, b) { return b[1] - a[1]; });
    var pb = $('t-pages').tBodies[0]; pb.textContent = '';
    if (!list.length) {
      var tr0 = el('tr'), td0 = el('td', { colspan: 3, class: 'path' }, 'No browser page loads in this window yet.');
      tr0.appendChild(td0); pb.appendChild(tr0);
    }
    var top = list.length ? list[0][1] : 1;
    list.slice(0, 15).forEach(function (p) {
      var tr = el('tr'), name = el('td');
      name.appendChild(el('a', { href: p[0] }, NAMES[p[0]] || p[0]));
      name.appendChild(document.createTextNode(' '));
      name.appendChild(el('span', { class: 'path' }, p[0]));
      tr.appendChild(name);
      tr.appendChild(el('td', { class: 'r' }, fmt(p[1])));
      var bc = el('td', { class: 'barcell' }), b = el('div', { class: 'bar' });
      b.style.width = (100 * p[1] / top).toFixed(1) + '%'; bc.appendChild(b); tr.appendChild(bc);
      pb.appendChild(tr);
    });
    if (list.length > 15) {
      var rest = list.slice(15).reduce(function (a, p) { return a + p[1]; }, 0);
      var trr = el('tr'); trr.appendChild(el('td', { class: 'path' }, (list.length - 15) + ' other pages'));
      trr.appendChild(el('td', { class: 'r' }, fmt(rest))); trr.appendChild(el('td')); pb.appendChild(trr);
    }

    $('r-alltime').textContent = fmt(d.totals.views) + ' pages have been served in all, by every kind of client, since the counter began. ' +
      'The separate "visits" figure (' + fmt(d.totals.gate_entries) + ') counted entries through the click-gate; the gate has been off since 19 September 2026, so it no longer moves. ' +
      d.method;
  }

  function loadReaders(days) {
    current = days;
    ['w7', 'w30', 'w90'].forEach(function (id) { $(id).setAttribute('aria-pressed', String($(id).dataset.days == days)); });
    var mine = ++statsReq;
    getJSON('/api/stats?days=' + days).then(function (d) { if (mine === statsReq) renderReaders(d); })
      .catch(function () {
        $('r-asof').textContent = 'the count store did not answer';
        $('c-daily').innerHTML = '';
        $('c-daily').appendChild(el('div', { class: 'empty' }, 'The counts could not be read just now. Reload to try again.'));
      });
  }

  /* ---------- the record ---------- */
  function renderBuild(b) {
    $('b-asof').textContent = 'build ' + new Date(b.build).toUTCString().replace(' GMT', ' UTC');
    var f = $('b-facts');
    [['Report subsections', b.report_subsections], ['Paragraphs', b.report_paragraphs],
     ['Sourcing blocks', b.report_sourcing_blocks], ['Map sites', b.marker_count],
     ['Map lines', b.edge_count], ['Corrections listed', b.corrections_listed]].forEach(function (p) {
      f.appendChild(el('dt', null, p[0])); f.appendChild(el('dd', null, fmt(p[1])));
    });
    var t = $('b-tiers'), max = 0, i;
    for (i = 0; i <= 5; i++) max = Math.max(max, b.edges_by_tier[i] || 0);
    for (i = 5; i >= 0; i--) {
      var v = b.edges_by_tier[i] || 0, li = el('li'), lab = el('span', { class: 't' });
      lab.appendChild(el('b', null, 'T' + i)); lab.appendChild(document.createTextNode(' ' + TIER_NAMES[i]));
      var tr = el('span', { class: 'track' }), fill = el('span', { class: 'fill' });
      fill.style.display = 'block'; fill.style.width = (max ? 100 * v / max : 0).toFixed(1) + '%';
      fill.style.background = 'var(--t' + i + ')'; tr.appendChild(fill);
      li.appendChild(lab); li.appendChild(tr); li.appendChild(el('span', { class: 'v' }, fmt(v)));
      t.appendChild(li);
    }
  }

  function renderCorrections(r) {
    var ul = $('b-corr'), list = (r.entries || []).slice(-3).reverse();
    list.forEach(function (c) {
      var li = el('li');
      li.appendChild(el('span', { class: 'when' }, dayLabel(c.date, true) + ' · ' + (/^[IVXL]+$/.test(c.where) ? 'Section ' + c.where : c.where) + ' · ' + c.id));
      li.appendChild(el('span', { class: 'what' }, c.replaced_by));
      ul.appendChild(li);
    });
  }

  /* ---------- sources ---------- */
  function weekStart(iso) {
    var d = new Date(iso.slice(0, 10) + 'T00:00:00Z'), wd = (d.getUTCDay() + 6) % 7;
    d.setUTCDate(d.getUTCDate() - wd); return d.toISOString().slice(0, 10);
  }

  function renderLedger(L) {
    var rows = L.rows || [], ok = 0, refused = 0, missing = 0, other = 0, weeks = {}, hosts = {}, last = '', first = '9';
    rows.forEach(function (r) {
      var cls = r.ok ? 'ok' : REFUSED[r.reason] ? 'refused' : (r.reason === 'http_404' || r.reason === 'http_410') ? 'missing' : 'other';
      if (cls === 'ok') ok++; else if (cls === 'refused') refused++; else if (cls === 'missing') missing++; else other++;
      var wk = weekStart(r.fetched_at), w = weeks[wk] || (weeks[wk] = { ok: 0, refused: 0, missing: 0 });
      w[cls === 'other' ? 'missing' : cls]++;
      var h; try { h = new URL(r.url).hostname.replace(/^www\./, ''); } catch (e) { h = '?'; }
      var hh = hosts[h] || (hosts[h] = { refused: 0, ok: 0 });
      if (cls === 'refused') hh.refused++; if (cls === 'ok') hh.ok++;
      if (r.fetched_at > last) last = r.fetched_at;
      if (r.fetched_at < first) first = r.fetched_at;
    });
    $('s-asof').textContent = 'the spider’s ledger, ' + dayLabel(first.slice(0, 10), true) + ' to ' + dayLabel(last.slice(0, 10), true);
    $('s-total').textContent = fmt(rows.length);
    $('s-withheld').textContent = L.withheld_rows ? '+ ' + L.withheld_rows + ' withheld under the stop rules' : ' ';
    $('s-ok').textContent = fmt(ok);
    $('s-refused').textContent = fmt(refused);
    $('s-missing').textContent = fmt(missing + other);
    $('s-missing-sub').textContent = fmt(missing) + ' not found (404), ' + fmt(other) + ' other failures';

    var wk = Object.keys(weeks).sort().map(function (k) { return { date: k, ok: weeks[k].ok, refused: weeks[k].refused, missing: weeks[k].missing }; });
    var host = $('c-weekly');
    var WS = [{ key: 'ok', label: 'Read', color: 'var(--s-browser)' },
      { key: 'missing', label: 'Not found or failed', color: 'var(--s-crawler)' }, { key: 'refused', label: 'Refused', color: 'var(--s-other)' }];
    var draw = function () {
      barChart(host, wk, WS, {
        height: 190, aria: 'Source fetches per week: read, refused, not found',
        xLabel: function (r) { return dayLabel(r.date); },
        tipTitle: function (r) { return 'Week of ' + dayLabel(r.date, true); },
        tipRows: function (r) { return WS.map(function (s) { return [s.label, fmt(r[s.key]), s.color]; }); }
      });
    };
    var lg = el('ul', { class: 'legend', 'aria-label': 'Legend' });
    WS.forEach(function (s) { var li = el('li'); li.appendChild(el('span', { class: 'key', style: 'background:' + s.color })); li.appendChild(document.createTextNode(s.label)); lg.appendChild(li); });
    host.parentNode.insertBefore(lg, host);
    draw(); redrawOnResize(host, draw);

    var tb = $('t-hosts').tBodies[0];
    Object.keys(hosts).filter(function (h) { return hosts[h].refused; })
      .sort(function (a, b) { return hosts[b].refused - hosts[a].refused || a.localeCompare(b); })
      .slice(0, 10).forEach(function (h) {
        var tr = el('tr'); tr.appendChild(el('td', null, h));
        tr.appendChild(el('td', { class: 'r' }, fmt(hosts[h].refused))); tr.appendChild(el('td', { class: 'r' }, fmt(hosts[h].ok)));
        tb.appendChild(tr);
      });
  }

  function start() {
    ['w7', 'w30', 'w90'].forEach(function (id) {
      $(id).addEventListener('click', function () { loadReaders(Number(this.dataset.days)); });
    });
    loadReaders(current);
    getJSON('/data/build.json').then(renderBuild).catch(function () { $('b-asof').textContent = 'build data unavailable'; });
    getJSON('/data/retractions.json').then(renderCorrections).catch(function () {});
    getJSON('/data/sources-ledger.json').then(renderLedger).catch(function () { $('s-asof').textContent = 'ledger unavailable'; });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
