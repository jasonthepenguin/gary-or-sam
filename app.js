// Basic game state
const STATE = {
  quotes: [],
  order: [],
  index: 0,
  score: 0,
  locked: false,
};

// Mapping author ids to display
const AUTHORS = {
  sam: {
    name: 'Sam Altman',
    handle: '@sama',
    avatar: 'sam.jpg',
  },
  gary: {
    name: 'Gary Marcus',
    handle: '@GaryMarcus',
    avatar: 'gary.jpg',
  },
};

// DOM refs
const el = {
  post: document.getElementById('post'),
  avatar: document.getElementById('avatar'),
  name: document.getElementById('name'),
  handle: document.getElementById('handle'),
  meta: document.getElementById('meta'),
  verified: document.getElementById('verified'),
  quote: document.getElementById('quote'),
  guessGary: document.getElementById('guess-gary'),
  guessSam: document.getElementById('guess-sam'),
  feedback: document.getElementById('feedback'),
  feedbackText: document.getElementById('feedback-text'),
  nextWrap: document.getElementById('nav-next'),
  next: document.getElementById('next'),
  results: document.getElementById('results'),
  finalScore: document.getElementById('final-score'),
  finalRemark: document.getElementById('final-remark'),
  playAgain: document.getElementById('play-again'),
  progress: document.getElementById('progress'),
  score: document.getElementById('score'),
  vote: document.getElementById('vote'),
};

// Utilities
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function unknownAvatarDataUrl() {
  const svg = encodeURIComponent(`<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'>
    <defs>
      <radialGradient id='g' cx='50%' cy='40%' r='70%'>
        <stop offset='0%' stop-color='#1b2735'/>
        <stop offset='100%' stop-color='#0a0f15'/>
      </radialGradient>
      <filter id='blur' x='-5%' y='-5%' width='110%' height='110%'>
        <feGaussianBlur stdDeviation='1.4' />
      </filter>
    </defs>
    <rect width='96' height='96' rx='48' fill='url(#g)' />
    <g filter='url(#blur)'>
      <text x='50%' y='58%' text-anchor='middle' font-family='Inter, Arial, Helvetica, sans-serif' font-weight='800' font-size='56' fill='#9aa4af'>?</text>
    </g>
  </svg>`);
  return `data:image/svg+xml;charset=utf-8,${svg}`;
}

function setProgress() {
  const total = STATE.quotes.length || 0;
  const current = total === 0 ? 0 : (Math.min(STATE.index + 1, total));
  el.progress.textContent = `${current}/${total}`;
  el.score.textContent = `Score: ${STATE.score}`;
}

function preload(url) {
  const img = new Image();
  img.src = url;
}

function timeLikeString() { return ''; }

function renderCurrent() {
  const current = STATE.quotes[STATE.order[STATE.index]];
  if (!current) return;

  // Reset card state
  STATE.locked = false;
  el.post.classList.remove('correct', 'wrong', 'revealed');
  el.feedback.hidden = true;
  el.feedback.classList.remove('feedback--correct', 'feedback--wrong', 'anim');
  el.feedbackText.textContent = '';
  if (el.nextWrap) el.nextWrap.hidden = true;

  // Unknown avatar
  el.avatar.src = unknownAvatarDataUrl();
  el.avatar.alt = 'Hidden profile';
  el.avatar.style.filter = 'blur(2px) saturate(0.85)';

  // Mask author until reveal
  el.name.textContent = 'Unknown';
  el.handle.textContent = '@????????';
  el.meta.textContent = timeLikeString();
  el.meta.style.display = 'none';
  if (el.verified) el.verified.hidden = true;

  // Quote text
  el.quote.textContent = current.text;

  setProgress();
}

function revealAndScore(guess) {
  if (STATE.locked) return;
  STATE.locked = true;

  const current = STATE.quotes[STATE.order[STATE.index]];
  const actualId = (current.author || '').toLowerCase();
  const actual = AUTHORS[actualId];

  // Reveal avatar and author
  if (actual) {
    el.avatar.src = actual.avatar;
    el.avatar.alt = `${actual.name} avatar`;
  }
  el.avatar.style.filter = 'none';
  el.name.textContent = actual?.name || 'Unknown';
  el.handle.textContent = actual?.handle || '@??????';
  if (el.verified) el.verified.hidden = false;
  el.post.classList.add('revealed');

  const correct = guess === actualId;
  if (correct) STATE.score += 1;

  el.post.classList.toggle('correct', !!correct);
  el.post.classList.toggle('wrong', !correct);

  const feedbackMsg = correct
    ? 'Correct :)'
    : `Oops it was ${actual?.name || 'Unknown'} :(`;
  el.feedbackText.textContent = feedbackMsg;
  el.feedback.hidden = false;
  el.feedback.classList.remove('feedback--correct', 'feedback--wrong', 'anim');
  // toggle classes and retrigger animation
  void el.feedback.offsetWidth;
  el.feedback.classList.add(correct ? 'feedback--correct' : 'feedback--wrong', 'anim');
  // Show link to the original post if available
  if (current.url) {
    el.meta.innerHTML = `<a href="${current.url}" target="_blank" rel="noopener noreferrer">View post on X</a>`;
    el.meta.style.display = '';
  }

  if (el.nextWrap) el.nextWrap.hidden = false;
  setProgress();
}

function nextRound() {
  STATE.index += 1;
  if (el.nextWrap) el.nextWrap.hidden = true;
  el.feedback.hidden = true;
  el.feedback.classList.remove('feedback--correct', 'feedback--wrong', 'anim');
  el.feedbackText.textContent = '';
  if (STATE.index >= STATE.quotes.length) {
    showResults();
  } else {
    renderCurrent();
  }
}

function showResults() {
  el.post.style.display = 'none';
  el.feedback.hidden = true;
  if (el.vote) el.vote.style.display = 'none';
  if (el.nextWrap) el.nextWrap.hidden = true;
  el.results.hidden = false;
  el.finalScore.textContent = `${STATE.score}/${STATE.quotes.length}`;

  // Simple remark based on performance
  const pct = STATE.quotes.length ? (STATE.score / STATE.quotes.length) : 0;
  let remark = 'Nice try!';
  if (pct === 1) remark = 'Perfect memory. Touch grass?';
  else if (pct >= 0.8) remark = 'Elite vibes. You know your posters.';
  else if (pct >= 0.5) remark = 'Not bad! You’ve got the gist.';
  else remark = 'Tough crowd. Try again!';
  el.finalRemark.textContent = remark;
}

function resetGame() {
  STATE.index = 0;
  STATE.score = 0;
  STATE.locked = false;
  el.post.style.display = '';
  el.results.hidden = true;
  if (el.vote) el.vote.style.display = '';
  if (el.nextWrap) el.nextWrap.hidden = true;

  STATE.order = shuffle([...STATE.quotes.keys()]);
  renderCurrent();
}

// Wire events
el.guessGary.addEventListener('click', () => revealAndScore('gary'));
el.guessSam.addEventListener('click', () => revealAndScore('sam'));
el.next.addEventListener('click', () => nextRound());
el.playAgain.addEventListener('click', () => resetGame());

// Keyboard shortcuts: Left = Gary, Right = Sam, Enter/Space = Next when revealed
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    revealAndScore('gary');
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    revealAndScore('sam');
  } else if ((e.key === 'Enter' || e.key === ' ') && el.nextWrap && !el.nextWrap.hidden) {
    e.preventDefault();
    nextRound();
  }
});

async function loadQuotes() {
  try {
    const res = await fetch('quotes.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('No quotes found.');
    }
    // Normalize
    STATE.quotes = data.map(q => ({
      text: String(q.text || '').trim(),
      author: String(q.author || '').toLowerCase(),
      url: String(q.url || '').trim(),
    })).filter(q => q.text && (q.author === 'sam' || q.author === 'gary'));

    if (STATE.quotes.length === 0) throw new Error('No valid quotes.');

    // Preload avatars
    preload(AUTHORS.sam.avatar);
    preload(AUTHORS.gary.avatar);

    resetGame();
  } catch (err) {
    console.error(err);
    el.quote.textContent = 'Could not load quotes. Ensure quotes.json is present.';
    el.guessGary.disabled = true;
    el.guessSam.disabled = true;
  }
}

// Initialize unknown avatar immediately to avoid flash
document.addEventListener('DOMContentLoaded', () => {
  el.avatar.src = unknownAvatarDataUrl();
  el.avatar.alt = 'Hidden profile';
  el.meta.textContent = '';
  el.meta.style.display = 'none';
  setProgress();
  loadQuotes();
});
