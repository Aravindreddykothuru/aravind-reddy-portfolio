document.documentElement.classList.add('js');

// Welcome intro: the CSS plays the falling letters and lifts the screen.
// This script frees the page once the lift starts and lets visitors skip.
const intro = document.getElementById('intro');
const root = document.documentElement;
const releasePage = () => root.classList.remove('intro-playing');
if (intro && root.classList.contains('intro-playing')) {
  const EXIT_DELAY = 2700; // must match the introExit delay in style.css
  const EXIT_DURATION = 950; // must match the introExit duration in style.css
  let exiting = false;
  let done = false;
  const cleanup = () => {
    if (done) return;
    done = true;
    releasePage();
    intro.remove();
  };
  const findAnim = (name) =>
    intro.getAnimations ? intro.getAnimations().find((a) => a.animationName === name) : undefined;
  // Time the hand-off from the curtain animation itself, with timers as a backup.
  const scheduleExit = (anim, wait, duration) => {
    setTimeout(() => { exiting = true; }, wait);
    setTimeout(releasePage, wait + 250); // hero name starts flipping in as the curtain rises
    setTimeout(cleanup, wait + duration + 150);
    if (anim) anim.finished.then(cleanup).catch(() => {});
  };
  const exitAnim = findAnim('introExit');
  scheduleExit(exitAnim, Math.max(0, EXIT_DELAY - ((exitAnim && exitAnim.currentTime) || 0)), EXIT_DURATION);

  const skip = () => {
    if (exiting || done) return;
    exiting = true;
    intro.classList.add('skip');
    void getComputedStyle(intro).animationName; // apply the class so the skip animation exists
    scheduleExit(findAnim('introExitSkip'), 0, 750);
  };
  intro.addEventListener('click', skip);
  window.addEventListener('keydown', skip, { once: true });
  window.addEventListener('wheel', skip, { once: true, passive: true });
  window.addEventListener('touchmove', skip, { once: true, passive: true });
} else if (intro) {
  intro.remove();
}

// Nav background on scroll
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Hero scroll parallax, matching the reference: the name drifts down and fades,
// the portrait moves more slowly, and the orbit rings rotate and grow.
const hero = document.getElementById('home');
const heroHeading = document.getElementById('heroHeading');
const heroPortrait = document.getElementById('heroPortrait');
const heroOrbit = document.getElementById('heroOrbit');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let heroTicking = false;
const updateHero = () => {
  heroTicking = false;
  const p = Math.min(Math.max(window.scrollY / hero.offsetHeight, 0), 1);
  heroHeading.style.transform = `translate3d(0, ${150 * p}px, 0)`;
  heroHeading.style.opacity = String(1 - 0.75 * Math.min(p / 0.75, 1));
  heroPortrait.style.transform = `translate3d(0, ${65 * p}px, 0)`;
  heroOrbit.style.setProperty('--orbit-rot', `${-24 + 84 * p}deg`);
  heroOrbit.style.setProperty('--orbit-scale', String(1 + 0.35 * p));
};
if (!reduceMotion) {
  window.addEventListener('scroll', () => {
    if (!heroTicking) { heroTicking = true; requestAnimationFrame(updateHero); }
  }, { passive: true });
  updateHero();
}

// Mobile menu
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');
menuBtn.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
});
navLinks.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
  })
);

// Reveal on scroll
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }),
  { threshold: 0.12 }
);
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// Contact form opens the visitor's email app
document.getElementById('contactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const subject = encodeURIComponent(`Portfolio enquiry from ${f.get('name')}`);
  const body = encodeURIComponent(`${f.get('message')}\n\n${f.get('name')}\n${f.get('email')}`);
  window.location.href = `mailto:aravindreddy8189@gmail.com?subject=${subject}&body=${body}`;
});

document.getElementById('year').textContent = new Date().getFullYear();
