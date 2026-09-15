function updateFbBtn() {
  const subj = document.getElementById('fb-subject')?.value.trim() || '';
  const msg  = document.getElementById('fb-message')?.value.trim() || '';
  const btn  = document.getElementById('fb-send-btn');
  if (btn) btn.disabled = !(subj && msg);
}

async function sendFeedback() {
  const subj = document.getElementById('fb-subject')?.value.trim();
  const msg  = document.getElementById('fb-message')?.value.trim();
  if (!subj || !msg) { toast('Please fill in both subject and message', 'warning'); return; }

  const btn = document.getElementById('fb-send-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

  try {
    
    let saved = false;
    if (sb && currentUser) {
      try {
        const { error } = await sb.from('feedback').insert({
          user_id: currentUser.id,
          email: currentUser.email,
          subject: subj,
          message: msg,
          created_at: new Date().toISOString()
        });
        if (!error) saved = true;
      } catch(e) {}
    }

    
    if (!saved) {
      const mailtoUrl = `mailto:support@jeetrack.com?subject=${encodeURIComponent('[JEETrack Feedback] ' + subj)}&body=${encodeURIComponent(msg + '\n\n— Sent from JEETrack\nUser: ' + (currentUser?.email || 'anonymous'))}`;
      window.open(mailtoUrl, '_blank');
    }

    toast('Feedback sent! Thank you 🙏', 'success');
    if (document.getElementById('fb-subject')) document.getElementById('fb-subject').value = '';
    if (document.getElementById('fb-message')) document.getElementById('fb-message').value = '';
    if (btn) { btn.textContent = 'Sent ✓'; setTimeout(() => { if(btn){ btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send Feedback'; btn.disabled = false; } }, 2500); }
  } catch(e) {
    toast('Could not send — please email support@jeetrack.in directly', 'error');
    if (btn) { btn.disabled = false; btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send Feedback'; }
  }
}



const REVIEW_CONFIGS = {
  test: {
    key: 'jt_rev_test',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="url(#rg1)" stroke-width="1.8" stroke-linecap="round"><defs><linearGradient id="rg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#a695ff"/><stop offset="100%" stop-color="#f472b6"/></linearGradient></defs><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
    title: "You\'re logging like a pro!",
    sub: '3 tests logged — how useful is the Test Tracker?',
    subject: 'Test Tracker Review',
    placeholder: 'Is the score breakdown helpful? Anything missing?'
  },
  hours: {
    key: 'jt_rev_hours',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="url(#rg2)" stroke-width="1.8" stroke-linecap="round"><defs><linearGradient id="rg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#34d399"/><stop offset="100%" stop-color="#a695ff"/></linearGradient></defs><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    title: 'Great consistency!',
    sub: '10 study sessions logged — how is the Hours Tracker?',
    subject: 'Hours Tracker Review',
    placeholder: 'Is logging study hours useful? What would make it better?'
  },
  syllabus: {
    key: 'jt_rev_syllabus',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="url(#rg3)" stroke-width="1.8" stroke-linecap="round"><defs><linearGradient id="rg3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#f472b6"/></linearGradient></defs><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
    title: 'Halfway there!',
    sub: '50% syllabus complete — how is the Syllabus Tracker?',
    subject: 'Syllabus Tracker Review',
    placeholder: 'Is chapter tracking helping your prep? Any suggestions?'
  },
  ai: {
    key: 'jt_rev_ai',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="url(#rg4)" stroke-width="1.8" stroke-linecap="round"><defs><linearGradient id="rg4" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#a695ff"/><stop offset="100%" stop-color="#f472b6"/></linearGradient></defs><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    title: 'How were your AI Insights?',
    sub: 'Were the insights useful for your preparation?',
    subject: 'AI Insights Review',
    placeholder: 'Were the insights accurate? What would you improve?'
  }
};

let _reviewRating = 0;
let _reviewContext = null; 

function _openReviewModal(type) {
  const cfg = REVIEW_CONFIGS[type];
  if (!cfg) return;

  const stored = localStorage.getItem(cfg.key);
  const isRecurring = type === 'test' || type === 'hours';

  if (stored) {
    
    if (!isRecurring) {
      
      try {
        const p = JSON.parse(stored);
        if (p.permanent) return;
      } catch(e) { return; } 
      return;
    }

    
    try {
      const parsed = JSON.parse(stored);
      const ts = parsed.snoozedAt || parsed.submittedAt || 0;
      const daysSince = (Date.now() - ts) / (1000 * 60 * 60 * 24);
      if (daysSince < 3) return; 
    } catch(e) {
      
    }
  }

  _reviewRating = 0;
  _reviewContext = type;

  
  document.getElementById('rev-icon').innerHTML = cfg.icon;
  document.getElementById('rev-title').textContent = cfg.title;
  document.getElementById('rev-sub').textContent = cfg.sub;
  const ta = document.getElementById('review-text');
  ta.value = '';
  ta.placeholder = cfg.placeholder;

  _renderReviewStars(0);
  const btn = document.getElementById('review-submit-btn');
  if (btn) { btn.disabled = true; btn.style.opacity = '.4'; btn.style.cursor = 'not-allowed'; }

  document.getElementById('modal-reviewPrompt').classList.add('open');
}


function maybeShowReviewPrompt() {
  if (!S || !S.tests || S.tests.length < 3) return;
  
  const n = S.tests.length;
  if (n !== 3 && (n - 3) % 5 !== 0) return;
  setTimeout(() => _openReviewModal('test'), 500);
}


function maybeShowHoursReview() {
  if (!S || !S.hours) return;
  const manualCount = S.hours.filter(h => h.source !== 'auto').length;
  if (manualCount < 10) return;
  
  const n = manualCount;
  if (n !== 10 && (n - 10) % 5 !== 0) return;
  setTimeout(() => _openReviewModal('hours'), 500);
}


function maybeShowSyllabusReview() {
  const all = ['physics','chemistry','maths'].flatMap(s => S.syllabus[s] || []);
  if (!all.length) return;
  const done = all.filter(c => c.theory && c.practice).length;
  const pct = Math.round(done / all.length * 100);
  if (pct < 50) return;
  setTimeout(() => _openReviewModal('syllabus'), 500);
}


function maybeShowAiReview() {
  
  setTimeout(() => _openReviewModal('ai'), 1500); 
}


function setReviewStar(val) {
  _reviewRating = val;
  _renderReviewStars(val);
  const btn = document.getElementById('review-submit-btn');
  if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.style.cursor = 'pointer'; }
}

function _renderReviewStars(val) {
  document.querySelectorAll('.rev-star').forEach(s => {
    const sv = +s.dataset.v;
    s.classList.remove('active', 'active-last');
    if (sv < val) s.classList.add('active');
    else if (sv === val) s.classList.add('active', 'active-last');
  });
}


function closeReviewModal() {
  document.getElementById('modal-reviewPrompt').classList.remove('open');
  if (_reviewContext) {
    
    localStorage.setItem(REVIEW_CONFIGS[_reviewContext].key, JSON.stringify({ snoozedAt: Date.now() }));
    _reviewContext = null;
  }
}


async function submitReview() {
  if (!_reviewRating || !_reviewContext) return;
  const cfg = REVIEW_CONFIGS[_reviewContext];
  const btn = document.getElementById('review-submit-btn');
  if (btn) { btn.disabled = true; btn.style.opacity = '.6'; }

  const text = (document.getElementById('review-text').value || '').trim();
  const uid = currentUser?.id || null;

  try {
    await sb.from('feedback').insert({
      user_id: uid,
      subject: `${_reviewRating}/5 — ${cfg.subject}`,
      message: text || '(no comment)',
      rating: _reviewRating,
      created_at: new Date().toISOString()
    });
  } catch(e) {
    console.warn('Review insert failed:', e);
  }

  
  const isRecurringType = _reviewContext === 'test' || _reviewContext === 'hours';
  localStorage.setItem(cfg.key, isRecurringType
    ? JSON.stringify({ submittedAt: Date.now() })
    : JSON.stringify({ submittedAt: Date.now(), permanent: true }));
  const rating = _reviewRating;
  document.getElementById('modal-reviewPrompt').classList.remove('open');
  _reviewContext = null;
  setTimeout(() => toast(`Thanks for the ${rating}★ review! 🙏`, 'success'), 300);
}


/* -- Landing page: pull real, curated testimonials from the feedback system -- */
function _escTesti(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
// Headline trust numbers shown on the landing page. Update these as your real numbers grow —
// intentionally decoupled from the small sample of cards actually rendered below.
const TESTI_TRUST_RATING = '4.8';
function _testiCardHTML(t,i){
  const rating = Math.max(1, Math.min(5, t.rating||5));
  const stars = '★'.repeat(rating) + '☆'.repeat(5-rating);
  const name = _escTesti((t.display_name||'').trim() || 'JEETrack User');
  const initial = name.charAt(0).toUpperCase() || 'J';
  const colors=['linear-gradient(135deg,#7c6af7,#a695ff)','linear-gradient(135deg,#34d399,#2dd4bf)','linear-gradient(135deg,#f472b6,#fb7185)','linear-gradient(135deg,#fbbf24,#f97316)','linear-gradient(135deg,#60a5fa,#3b82f6)'];
  const bg = colors[i % colors.length];
  return `<div class="ls-testi-card">
    <span class="ls-testi-quotemark">&rdquo;</span>
    <div class="ls-testi-stars">${stars}</div>
    <div class="ls-testi-quote">"${_escTesti(t.message)}"</div>
    <div class="ls-testi-foot">
      <div class="ls-testi-avatar" style="background:${bg}">${initial}</div>
      <div>
        <div class="ls-testi-name-row">
          <span class="ls-testi-name">${name}</span>
        </div>
        <div class="ls-testi-tag"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="8.5 12.5 11 15 16 9.5"/></svg>Verified JEETrack User</div>
      </div>
    </div>
  </div>`;
}
async function loadLandingTestimonials(){
  const section = document.getElementById('testimonials-section');
  const track = document.getElementById('ls-testi-track');
  if(!section || !track || !sb) return;
  try{
    const { data, error } = await sb.from('public_testimonials').select('*').order('created_at',{ascending:false}).limit(24);
    if(error || !data || !data.length) return;

    
    const MIN_CARDS = 10;
    let cards = data.map((t,i)=>_testiCardHTML(t,i));
    let i = 0;
    while(cards.length < MIN_CARDS){ cards.push(_testiCardHTML(data[i % data.length], cards.length)); i++; }

    
    track.innerHTML = cards.concat(cards).join('');

    
    requestAnimationFrame(() => {
      const halfWidth = track.scrollWidth / 2;
      const PX_PER_SEC = 38; // comfortable reading pace
      const dur = Math.max(24, Math.round(halfWidth / PX_PER_SEC));
      track.style.animationDuration = dur + 's';
    });

    const trustRow = document.getElementById('ls-testi-trustrow');
    if(trustRow){
      const cfg = _siteConfigCache || await loadPublicSiteConfig().catch(()=>null) || {};
      const reviewsCount = (cfg.reviews_count !== null && cfg.reviews_count !== undefined) ? cfg.reviews_count : 1000;
      const avgRating = (cfg.avg_rating !== null && cfg.avg_rating !== undefined) ? cfg.avg_rating : TESTI_TRUST_RATING;
      trustRow.innerHTML = `<span class="ls-testi-trust-rating"><span class="ls-testi-trust-stars">★★★★★</span><span class="ls-testi-trust-ratingnum">${avgRating}/5</span></span><span class="ls-testi-trust-div"></span><span class="ls-testi-trust-text">Based on <span class="odo-num" data-count-to="${Math.round(reviewsCount)}" data-count-display="${_fmtStatPlain(reviewsCount)}">0</span> JEETrack verified reviews</span>`;
      if(typeof _initCountUp === 'function') _initCountUp(trustRow);
    }
    section.style.display = '';
  }catch(e){ 
  }
}


const AI_LIMIT_KEY = 'jt_ai_weekly';
const AI_WEEKLY_MAX = 3;

function _getAiWeekKey() {
  
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(week).padStart(2,'0')}`;
}

function _getAiUsage() {
  try {
    const raw = localStorage.getItem(AI_LIMIT_KEY);
    if (!raw) return { week: _getAiWeekKey(), count: 0 };
    const parsed = JSON.parse(raw);
    
    if (parsed.week !== _getAiWeekKey()) return { week: _getAiWeekKey(), count: 0 };
    return parsed;
  } catch(e) { return { week: _getAiWeekKey(), count: 0 }; }
}

function _aiCanGenerate() {
  return _getAiUsage().count < AI_WEEKLY_MAX;
}

function _aiIncrementUsage() {
  const usage = _getAiUsage();
  usage.count = (usage.count || 0) + 1;
  usage.week = _getAiWeekKey();
  localStorage.setItem(AI_LIMIT_KEY, JSON.stringify(usage));
}

function _aiDaysUntilReset() {
  
  const now = new Date();
  const daysUntilSun = (7 - now.getDay()) % 7 || 7;
  return daysUntilSun;
}