const facts = [
  {
    text: 'Virat Kohli scored 973 runs in the 2016 IPL season, the most by any player in one edition.',
    source: 'https://www.iplt20.com/news/article/preview-m12-rcb-vs-mi'
  },
  {
    text: 'Kohli struck four centuries during the 2016 IPL season.',
    source: 'https://www.iplt20.com/news/article/match-report-m50-rcb-vs-kxip'
  },
  {
    text: 'In 2016, Kohli became the first player to score three centuries in a single IPL season.',
    source: 'https://www.iplt20.com/news/article/match-report-m44-rcb-vs-gl'
  },
  {
    text: 'Kohli earned four Player of the Match awards in the 2016 IPL, joint-most that season.',
    source: 'https://www.iplt20.com/news/article/quick-stats-m50-rcb-vs-kxip'
  },
  {
    text: 'Kohli reached 500 runs in the 2016 season in just eight innings.',
    source: 'https://www.iplt20.com/news/article/match-report-m35-rcb-vs-rps'
  },
  {
    text: 'Virat Kohli scored 113 in RCB’s 2016 win over Kings XI Punjab.',
    source: 'https://www.iplt20.com/news/article/match-report-m50-rcb-vs-kxip'
  },
  {
    text: 'RCB won their first IPL title in 2025, ending an 18-year wait.',
    source: 'https://www.iplt20.com/news/article/tata-ipl-2025-final-rcb-vs-pbks-match-report'
  },
  {
    text: 'Chris Gayle hit an unbeaten 175 for RCB against Pune Warriors India in 2013.',
    source: 'https://www.iplt20.com/news/article/report-match-31-rcb-vs-pwi'
  },
];

export function initializeDeveloperCrashEasterEgg() {
  const dialog = document.querySelector('#developer-crash');
  if (!dialog) return;
  const crash = dialog.querySelector('[data-crash-phase]');
  const reveal = dialog.querySelector('[data-reveal-phase]');
  const factText = dialog.querySelector('[data-fact-text]');
  const factSource = dialog.querySelector('[data-fact-source]');
  let active = false;
  let phaseTimer = 0;
  let keySequence = [];
  let lastSequenceKeyAt = 0;
  let lastFact = -1;
  let returnFocus = null;
  let inertState = [];

  function showFact() {
    const choices = facts.map((_, index) => index).filter(index => index !== lastFact);
    lastFact = choices[Math.floor(Math.random() * choices.length)];
    const fact = facts[lastFact];
    factText.textContent = fact.text;
    factSource.href = fact.source;
  }

  function finishCrash() {
    if (!active) return;
    crash.hidden = true;
    reveal.hidden = false;
    showFact();
    reveal.querySelector('h1').focus();
  }

  function open() {
    if (active || document.querySelector('#os')?.dataset.mode !== 'desktop') return;
    active = true;
    returnFocus = document.activeElement;
    inertState = ['#desktop', '#lock-screen', '#shutdown-screen'].map(selector => {
      const element = document.querySelector(selector);
      const wasInert = element.inert;
      element.inert = true;
      return [element, wasInert];
    });
    dialog.hidden = false;
    crash.hidden = false;
    reveal.hidden = true;
    crash.querySelector('h1').focus();
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    phaseTimer = window.setTimeout(finishCrash, reducedMotion ? 250 : 1750);
  }

  function close() {
    if (!active) return;
    active = false;
    window.clearTimeout(phaseTimer);
    dialog.hidden = true;
    for (const [element, wasInert] of inertState) element.inert = wasInert;
    inertState = [];
    if (returnFocus?.isConnected && !returnFocus.closest('[hidden]')) returnFocus.focus?.();
    returnFocus = null;
  }

  function handleKeydown(event) {
    if (active) {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        close();
        return;
      }
      if (event.key === 'Tab') {
        const controls = [...dialog.querySelectorAll('button:not([disabled]),a[href]')]
          .filter(element => !element.closest('[hidden]'));
        if (!controls.length) { event.preventDefault(); crash.querySelector('h1').focus(); return; }
        const first = controls[0], last = controls.at(-1);
        const heading = reveal.hidden ? crash.querySelector('h1') : reveal.querySelector('h1');
        if (event.shiftKey && document.activeElement === heading) { event.preventDefault(); last.focus(); }
        else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first.focus();
        }
      }
      return;
    }
    if (event.repeat || event.metaKey || event.ctrlKey || event.altKey ||
        event.target.matches?.('input,textarea,select,[contenteditable="true"]')) {
      keySequence = [];
      return;
    }
    if (event.key === 'Shift') return;
    const key = event.key.toLowerCase();
    if (!/^[a-z]$/.test(key)) {
      keySequence = [];
      return;
    }
    const now = Date.now();
    if (now - lastSequenceKeyAt > 2200) keySequence = [];
    lastSequenceKeyAt = now;
    const expected = ['r', 'c', 'b'][keySequence.length];
    keySequence = key === expected ? [...keySequence, key] : key === 'r' ? ['r'] : [];
    if (keySequence.length === 3) {
      event.preventDefault();
      event.stopImmediatePropagation();
      keySequence = [];
      open();
    }
  }

  document.addEventListener('keydown', handleKeydown, true);
  dialog.addEventListener('click', event => {
    if (event.target.closest('[data-crash-dismiss]')) close();
    else if (event.target.closest('[data-another-fact]')) showFact();
  });

  let tapCount = 0;
  let lastTapAt = 0;
  document.addEventListener('pointerup', event => {
    if (active || event.pointerType !== 'touch' || !event.target.closest('.avatar-large,.profile-chip img')) return;
    const now = Date.now();
    tapCount = now - lastTapAt < 900 ? tapCount + 1 : 1;
    lastTapAt = now;
    if (tapCount >= 3) {
      tapCount = 0;
      open();
    }
  });
}
