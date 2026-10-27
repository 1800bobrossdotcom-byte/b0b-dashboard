/* One card from the record.
 *
 * Mounts into any element carrying data-b0b-card. The cards come from
 * /data/cards.json, which scripts/build-cards.py writes only after checking that
 * every card's line still appears, word for word, in the subsection it links to.
 * Nothing here writes a card: this file only picks and shows one.
 *
 *   data-b0b-card                  the mount
 *   data-link-base="/report"       where the subsection links point ("" on the report itself)
 *   data-url-sync                  keep ?c=<id> in the address bar (the /card page)
 *
 * The day's card is the same for every reader: the UTC day number times a prime,
 * modulo the pool, which walks the whole pool before any card comes round again.
 * Nothing is sent anywhere and nothing about the reader is stored.
 */
(function () {
  'use strict';
  var mounts = document.querySelectorAll('[data-b0b-card]');
  if (!mounts.length || !window.fetch) return;

  var KIND = { fact: 'Documented', method: 'Method', question: 'Open question', connection: 'Connection' };
  var FILTERS = [['', 'All'], ['fact', 'Facts'], ['method', 'Methods'], ['question', 'Questions'], ['connection', 'Connections']];
  var STEP = 7919;
  var HOST = 'https://www.b0b.dev';

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function dayNumber(d) { return Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 864e5); }
  function dayLabel(d) {
    var m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    return d.getUTCDate() + ' ' + m[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
  }

  fetch('/data/cards.json', { cache: 'no-cache' }).then(function (r) {
    if (!r.ok) throw new Error(r.status);
    return r.json();
  }).then(function (data) {
    var cards = (data && data.cards) || [];
    if (!cards.length) return;
    for (var i = 0; i < mounts.length; i++) mount(mounts[i], cards);
  }).catch(function () { /* no card is better than a broken one */ });

  function mount(root, cards) {
    var base = root.getAttribute('data-link-base');
    if (base == null) base = '/report';
    var sync = root.hasAttribute('data-url-sync');
    var today = new Date();
    var daily = cards[(dayNumber(today) * STEP) % cards.length];
    var byId = {};
    cards.forEach(function (c, n) { c._n = n + 1; byId[c.id] = c; });

    var asked = null;
    if (sync) {
      var m = /[?&]c=([a-z0-9-]+)/.exec(location.search);
      if (m && byId[m[1]]) asked = byId[m[1]];
    }

    var filter = '';
    var seen = [];
    var current = null;

    var box = el('section', 'b0b-card');
    box.setAttribute('aria-label', 'One card from the record');
    var head = el('div', 'bc-head');
    var kicker = el('span', 'bc-kind');
    var stamp = el('span', 'bc-stamp');
    head.appendChild(kicker); head.appendChild(stamp);
    var prompt = el('p', 'bc-prompt');
    var between = el('p', 'bc-between');
    var answer = el('div', 'bc-answer');
    answer.id = 'bc-answer-' + Math.random().toString(36).slice(2, 8);
    answer.setAttribute('aria-live', 'polite');
    var quote = el('blockquote', 'bc-quote');
    var meta = el('div', 'bc-meta');
    var tier = el('span', 'bc-tier');
    var src = el('a', 'bc-src');
    meta.appendChild(tier); meta.appendChild(src);
    answer.appendChild(quote); answer.appendChild(meta);

    var actions = el('div', 'bc-actions');
    var reveal = el('button', 'bc-reveal', 'Show the line');
    reveal.type = 'button';
    reveal.setAttribute('aria-controls', answer.id);
    var another = el('button', 'bc-next', 'Another card');
    another.type = 'button';
    var copy = el('button', 'bc-copy', 'Copy link');
    copy.type = 'button';
    var kinds = el('div', 'bc-kinds');
    kinds.setAttribute('role', 'group');
    kinds.setAttribute('aria-label', 'Kind of card');
    FILTERS.forEach(function (f) {
      var b = el('button', '', f[1]);
      b.type = 'button';
      b.setAttribute('data-kind', f[0]);
      b.setAttribute('aria-pressed', f[0] === filter ? 'true' : 'false');
      b.addEventListener('click', function () {
        filter = f[0];
        Array.prototype.forEach.call(kinds.children, function (k) {
          k.setAttribute('aria-pressed', k.getAttribute('data-kind') === filter ? 'true' : 'false');
        });
        next();
      });
      kinds.appendChild(b);
    });
    actions.appendChild(reveal); actions.appendChild(another); actions.appendChild(copy); actions.appendChild(kinds);

    var note = el('p', 'bc-note');
    note.appendChild(document.createTextNode('Every line is quoted from the report and checked against it at each build. '));
    var all = el('a', '', 'All ' + cards.length + ' cards');
    all.href = '/card#all';
    note.appendChild(all);

    box.appendChild(head); box.appendChild(prompt); box.appendChild(between);
    box.appendChild(answer); box.appendChild(actions); box.appendChild(note);
    root.appendChild(box);

    function show(c, label) {
      current = c;
      if (seen.indexOf(c.id) < 0) seen.push(c.id);
      kicker.textContent = KIND[c.type] || c.type;
      stamp.textContent = label || ('Card ' + c._n + ' of ' + cards.length);
      prompt.textContent = c.prompt;
      if (c.between && c.between.length) { between.textContent = c.between.join('  ↔  '); between.hidden = false; }
      else { between.textContent = ''; between.hidden = true; }
      quote.textContent = '“' + c.quote + '”';
      tier.textContent = c.tier;
      tier.className = 'bc-tier t-' + c.tier.replace(/\s+/g, '-');
      src.textContent = 'Section ' + c.section + (c.subsection ? ' · ' + c.subsection : '') + ' →';
      src.href = base + '#' + c.anchor;
      answer.hidden = true;
      reveal.hidden = false;
      reveal.setAttribute('aria-expanded', 'false');
      if (sync && history.replaceState) {
        try { history.replaceState(null, '', location.pathname + '?c=' + c.id + location.hash); } catch (e) {}
      }
    }

    function next() {
      var pool = cards.filter(function (c) { return !filter || c.type === filter; });
      if (!pool.length) return;
      var fresh = pool.filter(function (c) { return seen.indexOf(c.id) < 0; });
      if (!fresh.length) {
        seen = current ? [current.id] : [];
        fresh = pool.filter(function (c) { return !current || c.id !== current.id; });
        if (!fresh.length) fresh = pool;
      }
      show(fresh[Math.floor(Math.random() * fresh.length)]);
    }

    reveal.addEventListener('click', function () {
      answer.hidden = false;
      reveal.hidden = true;
      reveal.setAttribute('aria-expanded', 'true');
      src.focus({ preventScroll: true });
    });
    another.addEventListener('click', next);
    copy.addEventListener('click', function () {
      if (!current) return;
      var url = HOST + '/card?c=' + current.id;
      var done = function () { copy.textContent = 'Copied'; setTimeout(function () { copy.textContent = 'Copy link'; }, 1600); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function () { window.prompt('Link to this card:', url); });
      else window.prompt('Link to this card:', url);
    });

    if (asked) show(asked);
    else show(daily, "Today's card · " + dayLabel(today));
  }
})();
