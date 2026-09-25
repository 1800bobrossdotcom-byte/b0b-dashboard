/* listen-plan.js - the editor for listen mode.
 *
 * Takes one line the narrator is about to speak and returns a cut list: shots
 * anchored to character positions in that line, so a picture lands on the word
 * that names it and nothing holds the screen for long. It is a pure function of
 * the line, its place in the report and a little memory of what was shown
 * recently; report-listen.js plays the cut list, and the same file runs under
 * Node for the offline storyboard audit (scripts/listen-storyboard.js), which is
 * how every trigger is checked against the whole report before it ships.
 *
 * THE RULES IT EDITS BY
 *  - A picture appears only when the line names its subject (the curated
 *    triggers in scripts/listen-media-keys.json). No line borrows a picture
 *    from elsewhere. A line with nothing to picture gets a graphic built from
 *    its own words: the clause being spoken, set as type; a figure counted up;
 *    a date; a quotation with the words that introduce it; a map pin for a
 *    place the report plots; the report's own arrow chains; a list lit item by
 *    item; a tier stamp carrying the line's own qualifier ("NOT ESTABLISHED").
 *  - Nothing on screen is a fragment that changes the meaning of the line. Type
 *    is the line's own words, and a clause cut short keeps its negation.
 *  - Cuts land roughly every 1.5 to 3 seconds of speech; no shot runs much past 4.
 */
(function (root) {
  'use strict';

  var MIN_GAP = 20;      // chars between cuts (about 1.4 s of speech)
  var TARGET = 42;       // start filling a gap longer than this (about 2.9 s)
  var FILL_STEP = 34;    // spacing of filler cuts inside a long gap
  var COOLDOWN = 45;     // seconds before the same picture may return
  var MONTHS = 'Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sept?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?';
  var RE_DATE = new RegExp('\\b(\\d{1,2} (?:' + MONTHS + ')\\.? (?:1[5-9]\\d\\d|20[0-2]\\d)|(?:' + MONTHS + ')\\.? \\d{1,2},? (?:1[5-9]\\d\\d|20[0-2]\\d)|(?:' + MONTHS + ')\\.? (?:1[5-9]\\d\\d|20[0-2]\\d))\\b', 'g');
  var RE_YEAR = /(^|[^\d$£€.,\/-])(1[5-9]\d\d|20[0-2]\d)(?![\d%,.]\d|%|s\b|\s?(?:bn|billion|million|m\b))/g;
  var RE_MONEY = /(US)?([$£€])\s?(\d[\d,]*(?:\.\d+)?)\s?(trillion|billion|million|bn|m|k)?\b/gi;
  var RE_COUNT = /\b(\d{1,3}(?:,\d{3})+|\d{2,}(?:\.\d+)?)(%|\s(?:per ?cent|percent))?\s+([a-z][a-z\-]{2,})/g;
  var RE_PCT = /\b(\d{1,3}(?:\.\d+)?)%/g;
  // a tier stamp only for a verdict: "is documented", "not established", "(attributed)", "at the labeled tier",
  // "unsupported at any tier" - never for the adjective in "the documented links"
  var TW = '(documented|attributed|established|corroborated|supported|reached|contested|labell?ed|unsupported|undocumented|unverified|verified)';
  var RE_TIER = new RegExp('\\b(?:is|are|was|were|remains?|stays?|stood|stands|held|carried|graded|reads?|left|kept)\\s+(?:only\\s+)?((?:not|never)\\s+(?:yet\\s+)?)?' + TW + '\\b(?!\\s+(?:by|in|as|that|with|from|to)\\b)' +
    '|\\(\\s*((?:not|never)\\s+)?' + TW + '\\b' +
    '|\\b(?:at|to)\\s+(?:the\\s+)?' + TW + '\\s+tier' +
    '|\\b((?:not|never)\\s+(?:yet\\s+)?)' + TW + '\\b' +
    '|\\b' + TW + '\\s+at\\s+any\\s+tier' +
    '|\\bTier\\s*[:\\-–]\\s*' + TW, 'gi');
  var RE_NEG = /\b(no|not|never|nothing|none|neither|nor|without|zero|null|unsupported|killed|false|denied|denies|refused)\b|n't\b/i;
  var TIER_COL = { documented: '#00ff41', verified: '#00ff41', attributed: '#00ccff', labeled: '#ffcc00', labelled: '#ffcc00',
    contested: '#ff9a3c', established: '#00ff41', corroborated: '#00ff41', supported: '#00ff41', reached: '#00ff41',
    unsupported: '#ff5555', undocumented: '#ff5555', unverified: '#ff9a3c' };
  var COUNT_NOUNS = /^(people|persons|pages|markers|documents|records|files|emails|messages|counts|felonies|years|days|months|hours|countries|companies|agencies|officers|agents|children|victims|survivors|dead|killed|deaths|attacks|strikes|drones|satellites|cameras|sites|bases|miles|km|acres|tonnes|tons|shares|employees|members|subsections|paragraphs|sections|times|flights|trips|visits|meetings|calls|entries|names|accounts|transactions|payments|contracts|awards|clips|events|detainees|prisoners|facilities|bunkers|tunnels|servers|terabytes|gigabytes|GB|TB)$/i;

  // ---- small helpers ------------------------------------------------------------
  function isWordChar(c) { return /[A-Za-z0-9]/.test(c || ''); }
  function findWord(text, w, from) {
    var i = text.indexOf(w, from || 0);
    while (i >= 0) {
      if (!isWordChar(text.charAt(i - 1)) && !isWordChar(text.charAt(i + w.length))) return i;
      i = text.indexOf(w, i + 1);
    }
    return -1;
  }
  function pattern(p) {
    if (p.charAt(0) === '^') return { re: new RegExp(p.slice(1)) };
    return { w: p };
  }
  function findPat(text, p) {
    if (p.re) { var m = p.re.exec(text); return m ? m.index : -1; }
    return findWord(text, p.w);
  }
  // A bare surname names the subject only when nothing else claims it: "Mark
  // Epstein" is not Jeffrey Epstein, "Herbert Hoover" is not J. Edgar Hoover, and
  // "Hoover Institution" is not a person. Given names allowed in front come from
  // the subject's own full names.
  function findSurname(text, sur, fulls) {
    var ok = {};
    fulls.forEach(function (f) {
      var t = f.split(/\s+/), k = t.indexOf(sur);
      if (k > 0) t.slice(0, k).forEach(function (w) { ok[w] = 1; });
    });
    var i = findWord(text, sur);
    while (i >= 0) {
      var before = text.slice(0, i).match(/([A-Z][A-Za-z.'"]*)\s$/);
      var after = text.slice(i + sur.length).match(/^\s([A-Z][a-z]+)/);
      var beforeOk = !before || ok[before[1]] || /^(The|A|An|Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Senator|Sen\.|President|Director|Judge|Justice|General|Gen\.|Admiral|Secretary|Chairman|Governor|Captain|Colonel|Agent|Prosecutor|Attorney|Lord|Lady|Sir|Queen|King|And|But|When|Then|That|As|If|While|After|Before|Under|From|With|For|In|On|At|By|To|Of|So|Both|Neither|Nor|Or|Yet|Since|Until|Although|Because|Where|Whether|Which|Who|Whose|Once|Only|Even|Not|No|Every|Each|This|These|Those|Its|His|Her|Their|Our|My|Your)$/.test(before[1]);
      var afterOk = !after || /^(And|But|Or|Nor|The|A|In|On|At|To|Of|For|With|By|From|Was|Is|Had|Has|Did|Does|Said|Says|Wrote|Told|Asked)$/.test(after[1]);
      if (beforeOk && afterOk) return i;
      i = findWord(text, sur, i + 1);
    }
    return -1;
  }
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }

  // ---- compiled media and places (once per data set) ------------------------------
  var compiled = null, compiledFrom = null;
  function compile(media) {
    if (compiledFrom === media) return compiled;
    compiledFrom = media;
    compiled = (media || []).filter(function (e) { return !e.erc; }).map(function (e) {
      var names = e.names || [], fulls = names.filter(function (n) { return /\s/.test(n); });
      return {
        e: e,
        names: names.map(function (n) { return { n: n, single: !/\s/.test(n) }; }),
        fulls: fulls,
        match: (e.match || []).map(pattern),
        not: (e.not || []).map(pattern),
        group: (e.match || []).concat(e.names || []).join('|')
      };
    });
    return compiled;
  }
  function placeHit(text, P) {
    for (var i = 0; i < P.length; i++) {
      var k = P[i][0], at = findWord(text, k);
      while (at >= 0) {
        var before = text.slice(0, at).match(/([A-Z][a-z]+)\s$/);
        var after = text.slice(at + k.length).match(/^\s([A-Z][a-z]+)/);
        // "Christopher Columbus" is not Columbus, Ohio; "Burbank Studios" is still Burbank
        if ((!before || /^(The|In|At|To|From|Near|Outside|Inside|Of|And|Via|Over|Under|Across|Into|Onto|Toward|Towards|Between|Beyond|North|South|East|West|Central|Downtown|Greater|Suburban|Rural)$/.test(before[1])) &&
            (!after || /^(And|In|On|At|To|Of|For|With|By|From|Was|Is|Had|Has|Where|Which|That|The|A)$/.test(after[1]))) {
          return { at: at, len: k.length, p: P[i] };
        }
        at = findWord(text, k, at + 1);
      }
    }
    return null;
  }

  // ---- clause and phrase extraction ------------------------------------------------
  function clauseAt(text, at) {
    var s = at, e = at;
    while (s > 0 && !/[.;:!?—–]/.test(text.charAt(s - 1)) && !(text.charAt(s - 1) === ',' && at - s > 50)) s--;
    while (e < text.length && !/[.;:!?—–]/.test(text.charAt(e)) && !(text.charAt(e) === ',' && e - at > 40)) e++;
    var c = text.slice(s, e).trim().replace(/^[,)\]"”’\s]+/, '');
    var words = c.split(/\s+/);
    if (words.length > 13) {
      // keep a window of about twelve words around the anchor, and keep any
      // negation that governs it, so a cut never turns "no evidence that X" into "X"
      var rel = text.slice(s, at).split(/\s+/).length - 1, a = Math.max(0, rel - 4), b = Math.min(words.length, a + 12);
      for (var j = 0; j < a; j++) if (RE_NEG.test(words[j])) { a = j; b = Math.min(words.length, Math.max(b, a + 12)); break; }
      c = (a > 0 ? '… ' : '') + words.slice(a, b).join(' ') + (b < words.length ? ' …' : '');
    }
    return c;
  }
  function keyTerms(text) {
    var out = [], re = /\b(?:[A-Z][A-Za-z0-9&.'\-]*[A-Za-z0-9]|[A-Z]{2,}[0-9\-]*)(?:\s+(?:of|the|de|for|and|al|bin|von|van|du|la|le)?\s*(?:[A-Z][A-Za-z0-9&.'\-]*[A-Za-z0-9]|[A-Z]{2,}))*/g, m;
    while ((m = re.exec(text))) {
      var t = m[0];
      if (m.index === 0 || /[.!?]\s*$/.test(text.slice(0, m.index))) {
        if (!/\s/.test(t) && !/^[A-Z]{2,}/.test(t)) continue;       // a capitalised first word is not a name
      }
      if (/^(The|This|That|These|Those|It|In|On|For|And|But|If|When|What|Where|Who|How|A|An|As|At|By|No|Not|Its|Their|His|Her|Our|Each|Both|Every|One|Two|Three|I)$/.test(t)) continue;
      out.push({ at: m.index, t: t });
    }
    return out;
  }
  // the line cut into spoken phrases: at punctuation, and at about eight words
  function segments(text) {
    // cut points: after , ; : and around a spaced dash
    var cuts = [0], re = /[,;:](?=\s)|\s[-–—]\s|[—–](?!\s)/g, m;
    while ((m = re.exec(text))) cuts.push(m.index + m[0].length);
    cuts.push(text.length);
    var out = [];
    for (var c = 0; c + 1 < cuts.length; c++) {
      var base = cuts[c], piece = text.slice(base, cuts[c + 1]);
      var lead = piece.length - piece.replace(/^\s+/, '').length;
      base += lead; piece = piece.slice(lead);
      var words = piece.match(/\S+\s*/g) || [];
      for (var i = 0; i < words.length;) {
        var n = words.length - i <= 11 ? words.length - i : 8;
        var part = words.slice(i, i + n).join(''), at = base + words.slice(0, i).join('').length;
        var sTxt = part.trim().replace(/\s*(?:[,;:]|\s[-–—])$/, '').replace(/^[-–—]\s*/, '');
        if (sTxt.replace(/[^A-Za-z0-9]/g, '').length) out.push({ at: at, end: at + part.length, s: sTxt });
        i += n;
      }
    }
    for (var j = out.length - 1; j > 0; j--) {
      if (out[j].s.split(/\s+/).length <= 2) { out[j - 1].s += (/[(]$/.test(out[j - 1].s) ? '' : ' ') + out[j].s; out[j - 1].end = out[j].end; out.splice(j, 1); }
    }
    return out.length ? out : [{ at: 0, end: text.length, s: text }];
  }
  // the words a date belongs to: its own clause, bounded by the line's punctuation and arrows,
  // with the date itself taken out - "Yom Kippur War (1973) → Camp David Accords (1978)" gives
  // 1973 "Yom Kippur War" and 1978 "Camp David Accords", never the next event's name
  function ownClause(text, at, end, lo, hi) {
    // lo/hi: the neighbouring dates' edges, which a label never crosses
    lo = lo || 0; hi = hi == null ? text.length : hi;
    var s = at, e = end;
    while (s > lo && !/[;→.:!?]/.test(text.charAt(s - 1)) && !(text.charAt(s - 1) === ',' && text.charAt(s) === ' ' && (at - s > 30 || /[)\d]\s*$/.test(text.slice(0, s - 1))))) s--;
    while (e < hi && !/[;→.:!?]/.test(text.charAt(e)) && !(text.charAt(e) === ',' && (e - end > 30 || hi < text.length || /\)\s*$/.test(text.slice(end, e))))) e++;
    // a parenthetical date is taken out; a date that is part of the sentence stays in it
    var paren = /\(\s*$/.test(text.slice(s, at)) || /^[\s–-]*(\d{0,4}|present|today)\s*\)/.test(text.slice(end, e));
    // a date in brackets belongs to the words just before it: "Warner Music Group (2006–2010)"
    var c = (paren ? text.slice(s, at) : text.slice(s, e)).replace(/^[\s)]+/, '').replace(/\(\s*[–-]?\s*\d{0,4}\s*\)/g, '').replace(/\(\s*\)/g, '').replace(/\s+([,.;])/g, '$1').replace(/\s+/g, ' ').replace(/^[\s,\-–—]+|[\s,(\-–—]+$/g, '').trim();
    var w = c.split(' ');
    if (w.length > 12) c = w.slice(0, 12).join(' ') + ' …';
    return c;
  }
  function ledgerRows(text, ds) {
    var rows = [];
    ds.forEach(function (d, k) {
      var lab = ownClause(text, d.at, d.end, k ? ds[k - 1].end : 0, k + 1 < ds.length ? ds[k + 1].at : null);
      if (!lab.replace(/[^A-Za-z]/g, '')) {
        // "(1972, 1974)": a year listed with the one before it shares its words; otherwise the row is dropped
        if (rows.length && d.at - ds[k - 1].end < 4) lab = rows[rows.length - 1][1]; else return;
      }
      rows.push([d.s, lab, d.at]);
    });
    return rows;
  }
  function after(text, idx, n) {
    var rest = text.slice(idx).replace(/^[\s,.;:)\]-]+/, '');
    var stop = rest.search(/[;:.!?—–(]\s|[;:!?—–(]/);
    if (stop > 0) rest = rest.slice(0, stop);
    return rest.split(/\s+/).slice(0, n).join(' ').replace(/[,;:.]+$/, '');
  }

  // ---- the planner --------------------------------------------------------------------
  // ctx: { tag, sec:{num,title}, secCount, parts, sub, first, fig, media, places, mem, now }
  // mem: { used: {key: seconds}, n: counter } - carried between calls
  function plan(text, ctx) {
    var L = text.length, ev = [], mem = ctx.mem || { used: {}, n: 0 }, now = ctx.now || 0;
    if (ctx.tag === 'H2') return [{ at: 0, kind: 'chapter' }];
    if (ctx.tag === 'H3' || ctx.tag === 'H4') return [{ at: 0, kind: 'head' }];

    // pictures named in the line
    var media = compile(ctx.media);
    var byGroup = {};
    media.forEach(function (c) {
      for (var j = 0; j < c.not.length; j++) if (findPat(text, c.not[j]) >= 0) return;
      var at = -1, pri = 0, why = '';
      c.names.forEach(function (n) {
        var i = n.single ? findSurname(text, n.n, c.fulls) : findWord(text, n.n);
        if (i >= 0 && (at < 0 || i < at)) { at = i; pri = 9; why = n.n; }
      });
      if (at < 0) c.match.forEach(function (p) {
        var i = findPat(text, p);
        if (i >= 0 && (at < 0 || i < at)) { at = i; pri = 8; why = p.w || String(p.re); }
      });
      if (at < 0) return;
      var last = mem.used[c.e.k];
      var cool = last != null && now - last < (c.e.cool || COOLDOWN);
      var g = byGroup[c.group] || (byGroup[c.group] = []);
      g.push({ c: c, at: at, pri: pri, why: why, cool: cool, last: last == null ? -1e9 : last });
    });
    Object.keys(byGroup).forEach(function (g) {
      // several pictures share a trigger (three CCTV stills): take the one shown least recently
      var list = byGroup[g].filter(function (x) { return !x.cool; }).sort(function (a, b) { return a.last - b.last; });
      if (!list.length) return;
      var x = list[0], e = x.c.e;
      var video = e.clips && e.clips.length;
      ev.push({ at: x.at, pri: x.pri, kind: video ? 'clip' : 'photo', key: e.k, m: e, why: x.why,
        clip: video ? e.clips[(mem.n + hash(text)) % e.clips.length] : null });
    });
    // only the strongest picture per trigger position
    ev.sort(function (a, b) { return a.at - b.at || b.pri - a.pri; });

    // the page's own figure beside this paragraph
    if (ctx.first && ctx.fig) ev.push({ at: 0, pri: 7, kind: 'figure', src: ctx.fig.src, cap: ctx.fig.cap, key: 'f' + ctx.fig.src });

    // a quotation, with the words that introduce it
    var qre = /[“"]([^”"]{25,240})[”"]/g, qm;
    while ((qm = qre.exec(text))) {
      var lead = text.slice(0, qm.index).replace(/[\s,:–—-]+$/, '');
      var cut = Math.max(lead.lastIndexOf('. '), lead.lastIndexOf('; '));
      lead = lead.slice(cut + 1).trim();
      if (lead.split(/\s+/).length > 16) lead = '… ' + lead.split(/\s+/).slice(-14).join(' ');
      ev.push({ at: qm.index, end: qm.index + qm[0].length, pri: 7, kind: 'quote', q: qm[1], who: lead });
    }
    // a place the report plots
    var ph = placeHit(text, ctx.places || []);
    if (ph && !(mem.used['p' + ph.p[0]] != null && now - mem.used['p' + ph.p[0]] < COOLDOWN)) {
      ev.push({ at: ph.at, pri: 6, kind: 'map', pin: ph.p, word: text.substr(ph.at, ph.len), key: 'p' + ph.p[0] });
    }
    // money
    var mm;
    RE_MONEY.lastIndex = 0;
    while ((mm = RE_MONEY.exec(text))) {
      var num = parseFloat(mm[3].replace(/,/g, ''));
      if (!(num > 0)) continue;
      var unit = (mm[4] || '').toLowerCase();
      var post = unit === 'bn' || unit === 'billion' ? ' billion' : unit === 'm' || unit === 'million' ? ' million' : unit === 'trillion' ? ' trillion' : unit === 'k' ? 'k' : '';
      ev.push({ at: mm.index, pri: 6, kind: 'num', value: num, pre: mm[2], post: post,
        dec: Math.min((mm[3].split('.')[1] || '').length, 2), label: clauseAt(text, mm.index) });
    }
    // counts and percentages that name what they count
    RE_COUNT.lastIndex = 0;
    while ((mm = RE_COUNT.exec(text))) {
      var raw = mm[1], v = parseFloat(raw.replace(/,/g, ''));
      if (/^(1[5-9]\d\d|20[0-2]\d)$/.test(raw) && !mm[2]) continue;           // a year, not a count
      if (text.charAt(mm.index - 1) === '$' || /[£€]$/.test(text.slice(0, mm.index))) continue;
      if (!mm[2] && !COUNT_NOUNS.test(mm[3])) continue;
      ev.push({ at: mm.index, pri: 5, kind: 'num', value: v, pre: '', post: mm[2] ? '%' : '',
        dec: Math.min((raw.split('.')[1] || '').length, 1), label: clauseAt(text, mm.index) });
    }
    // dates
    var dates = [], dm;
    RE_DATE.lastIndex = 0;
    while ((dm = RE_DATE.exec(text))) dates.push({ at: dm.index, s: dm[1], end: dm.index + dm[0].length });
    // a span of years is one entry: "(2006–2010)", "1916-1918", "2021–present"
    var RE_SPAN = /\b(1[5-9]\d\ds?|20[0-2]\ds?)\s*[–-]\s*(1[5-9]\d\d|20[0-2]\d|present|today|now)\b/g, sm;
    while ((sm = RE_SPAN.exec(text))) {
      if (dates.some(function (d) { return sm.index >= d.at && sm.index < d.end; })) continue;
      dates.push({ at: sm.index, s: sm[1] + '–' + sm[2], end: sm.index + sm[0].length });
    }
    var RE_DEC = /\b(1[5-9]\d0|20[0-2]0)s\b/g;                       // a decade: "the 1990s"
    while ((sm = RE_DEC.exec(text))) {
      if (dates.some(function (d) { return sm.index >= d.at && sm.index < d.end; })) continue;
      dates.push({ at: sm.index, s: sm[0], end: sm.index + sm[0].length });
    }
    var years = [], ym;
    RE_YEAR.lastIndex = 0;
    while ((ym = RE_YEAR.exec(text))) {
      var yat = ym.index + ym[1].length;
      if (dates.some(function (d) { return yat >= d.at && yat < d.end; })) continue;
      years.push({ at: yat, s: ym[2], end: yat + 4 });
    }
    var alld = dates.concat(years).sort(function (a, b) { return a.at - b.at; });
    var distinct = {};
    alld.forEach(function (d) { distinct[d.s.replace(/.*(\d{4})$/, '$1')] = 1; });
    if (Object.keys(distinct).length >= 2 && ledgerRows(text, alld.slice(0, 5)).length >= 2) {
      ev.push({ at: alld[0].at, pri: 5, kind: 'ledger', rows: ledgerRows(text, alld.slice(0, 5)) });
    } else if (alld.length) {
      ev.push({ at: alld[0].at, pri: dates.length ? 5 : 3, kind: 'date', s: alld[0].s,
        label: ownClause(text, alld[0].at, alld[0].end) || clauseAt(text, alld[0].at) });
    }
    // the report's own arrow chains
    if ((text.match(/→/g) || []).length >= 2) {
      var nodes = [], pos = 0;
      text.split('→').forEach(function (part) {
        var t = part.trim();
        nodes.push({ t: t.length > 60 ? t.slice(0, 58) + '…' : t, at: pos + (part.length - part.replace(/^\s+/, '').length) });
        pos += part.length + 1;
      });
      ev.push({ at: 0, pri: 6, kind: 'chain', nodes: nodes });
    }
    // an enumeration: three or more items separated by semicolons
    var semi = text.split(';');
    if (semi.length >= 3 && semi.every(function (s) { return s.trim().split(/\s+/).length <= 12; })) {
      var p2 = 0, items = semi.map(function (s) { var r = { t: s.trim().replace(/[.]$/, ''), at: p2 + (s.length - s.replace(/^\s+/, '').length) }; p2 += s.length + 1; return r; });
      ev.push({ at: items[0].at, pri: 5, kind: 'list', items: items });
    }
    // the line's own tier words, with their qualifier
    var tm;
    RE_TIER.lastIndex = 0;
    while ((tm = RE_TIER.exec(text))) {
      var word = (tm[2] || tm[4] || tm[5] || tm[7] || tm[8] || tm[9]).toLowerCase();
      var neg = !!(tm[1] || tm[3] || tm[6]) || /^un/.test(word);
      var stamp = ((tm[1] || tm[3] || tm[6] || '').trim() + ' ' + word).trim().replace(/\s+/g, ' ').toUpperCase();
      ev.push({ at: tm.index, pri: 4, kind: 'tier', s: stamp,
        col: neg ? '#ff5555' : (TIER_COL[word] || '#ffcc00'), label: clauseAt(text, tm.index) });
      break;                                                   // one stamp per line is plenty
    }

    // a line that flies to a specific site does not cut away to a generic institution's building
    // ("the largest NSA station outside the United States" is Menwith Hill, not Fort Meade)
    if (ev.some(function (e) { return e.kind === 'map'; })) {
      ev = ev.filter(function (e) { return !((e.kind === 'photo' || e.kind === 'clip') && e.pri === 8); });
    }
    // ---- choose: keep the stronger of two cuts that would land too close ---------------
    ev.sort(function (a, b) { return a.at - b.at || b.pri - a.pri; });
    var shots = [];
    var HOLD = { map: 38, clip: 34, ledger: 30, chain: 30, list: 30, num: 26 };
    ev.forEach(function (e) {
      var last = shots[shots.length - 1];
      if (last && last.kind === 'quote' && e.at < last.end && e.pri < 9) return;   // a quotation is not cut into
      if (last && HOLD[last.kind] && e.at - last.at < HOLD[last.kind] && e.pri < 9) return;
      if (last && e.at - last.at < MIN_GAP) {
        if (e.pri > last.pri) shots[shots.length - 1] = e;
        return;
      }
      shots.push(e);
    });

    // ---- fill: type the clause being spoken, or reframe the picture on screen -----------
    var terms = keyTerms(text), segs = segments(text);
    function segAt(at) {
      for (var i = segs.length - 1; i >= 0; i--) if (segs[i].at <= at) return i;
      return 0;
    }
    function filler(at, prev) {
      if (prev && (prev.kind === 'photo' || prev.kind === 'clip') && !prev.reframed) {
        prev.reframed = true;
        return { at: at, pri: 1, kind: 'reframe', of: prev };
      }
      // the phrase being spoken at this point, with the one before it kept small for context
      var k = segAt(at);
      if (prev && prev.kind === 'words' && prev.seg >= k) {
        if (prev.seg + 1 >= segs.length) return null;          // nothing new to say: let the last phrase hold
        k = prev.seg + 1;
      }
      var sg = segs[k], hot = terms.filter(function (t) { return t.at >= sg.at && t.at < sg.end; }).map(function (t) { return t.t; });
      return { at: Math.max(at, sg.at), pri: 1, kind: 'words', seg: k, segAt: sg.at, s: sg.s, ctx: k > 0 ? segs[k - 1].s : '', hot: hot };
    }
    var out = [];
    var starts = shots.length && shots[0].at <= 12 ? [] : [0];
    if (starts.length) { var f0 = filler(0, null); f0.at = 0; f0.soft = true; out.push(f0); }
    shots.forEach(function (s, idx) {
      var prev = out[out.length - 1];
      var gapStart = prev ? prev.at : 0;
      while (s.at - gapStart > TARGET + 8) {
        var at = gapStart + FILL_STEP;
        if (s.at - at < MIN_GAP) break;
        var f = filler(at, out[out.length - 1]);
        if (!f) break;
        if (f.at - gapStart < MIN_GAP || s.at - f.at < MIN_GAP) f.at = at;
        out.push(f); gapStart = f.at;
      }
      out.push(s);
    });
    var tail = out.length ? out[out.length - 1].at : 0;
    while (L - tail > TARGET + 10) {
      var fa = tail + FILL_STEP;
      if (L - fa < 14) break;
      var ft = filler(fa, out[out.length - 1]);
      if (!ft) break;
      if (ft.at - tail < MIN_GAP) ft.at = fa;
      out.push(ft); tail = ft.at;
    }
    // stable variety for the typographic shots
    out.forEach(function (s) { s.v = hash(text + s.at) % 4; });
    return out;
  }

  // record a shot as shown (for cooldowns)
  function mark(mem, shot, now) {
    if (shot.key) mem.used[shot.key] = now;
    mem.n++;
  }

  var api = { plan: plan, mark: mark, clauseAt: clauseAt };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.B0BListenPlan = api;
})(typeof window !== 'undefined' ? window : this);
