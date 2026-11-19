// The "js" class is set in <head> so .reveal elements are hidden before first paint.
const revealItems = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

// Expandable entries in the About info panel
document.querySelectorAll('.panel-toggle').forEach((toggle) => {
  const desc = document.getElementById(toggle.getAttribute('aria-controls'));
  if (!desc) return;

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    desc.classList.toggle('is-open', !isOpen);
  });
});

// Project media gallery + lightbox.
// Gallery items are plain links to the files, so without JS they still open the image/video directly.
const lightbox = document.getElementById('lightbox');
const mediaItems = Array.from(document.querySelectorAll('.media-item'));

if (lightbox && typeof lightbox.showModal === 'function' && mediaItems.length) {
  const mediaBox = lightbox.querySelector('.lightbox-media');
  const caption = lightbox.querySelector('.lightbox-caption');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');
  let current = 0;
  let opener = null;

  const show = (index) => {
    current = (index + mediaItems.length) % mediaItems.length;
    const item = mediaItems[current];
    const src = item.getAttribute('href');
    mediaBox.replaceChildren();

    if (item.dataset.type === 'video') {
      const video = document.createElement('video');
      video.src = src;
      video.controls = true;
      video.playsInline = true;
      video.preload = 'metadata';
      mediaBox.append(video);
    } else {
      const thumbImg = item.querySelector('img');
      const img = document.createElement('img');
      img.src = src;
      img.alt = thumbImg ? thumbImg.alt : '';
      mediaBox.append(img);
    }

    caption.textContent = item.dataset.caption || '';
  };

  const close = () => lightbox.close();

  mediaItems.forEach((item, index) => {
    item.addEventListener('click', (event) => {
      event.preventDefault();
      opener = item;
      show(index);
      lightbox.showModal();
    });
  });

  prevBtn.addEventListener('click', () => show(current - 1));
  nextBtn.addEventListener('click', () => show(current + 1));
  lightbox.querySelector('.lightbox-close').addEventListener('click', close);

  // Clicking the dark backdrop (outside the content box) closes it
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) close();
  });

  lightbox.addEventListener('keydown', (event) => {
    if (event.target.tagName === 'VIDEO') return; // let the video use arrow keys for seeking
    if (event.key === 'ArrowLeft') show(current - 1);
    if (event.key === 'ArrowRight') show(current + 1);
  });

  // Esc closes natively; on any close, stop playback and return focus to the thumbnail
  lightbox.addEventListener('close', () => {
    mediaBox.replaceChildren();
    if (opener) opener.focus();
  });
}

// Mobile navigation menu
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.getElementById('site-nav');

if (navToggle && siteNav) {
  const setMenu = (open, instant = false) => {
    if (instant) siteNav.classList.add('no-anim');
    siteNav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (instant) {
      void siteNav.offsetHeight; // apply the closed layout before the browser scrolls to the link target
      siteNav.classList.remove('no-anim');
    }
  };

  navToggle.addEventListener('click', () => {
    setMenu(navToggle.getAttribute('aria-expanded') !== 'true');
  });

  // Close after choosing a section
  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (siteNav.classList.contains('is-open')) setMenu(false, true);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && siteNav.classList.contains('is-open')) {
      setMenu(false);
      navToggle.focus();
    }
  });

  // Reset when the window is widened back to the desktop layout
  window.matchMedia('(min-width: 821px)').addEventListener('change', (event) => {
    if (event.matches) setMenu(false, true);
  });
}

// Highlight the nav link for the section currently in view
const navLinks = Array.from(document.querySelectorAll('#site-nav a'));
// The first "#" link (Home) maps to the hero; any other bare "#" links are skipped.
let homeMapped = false;
const trackedSections = navLinks
  .map((link) => {
    const href = link.getAttribute('href');
    let section = null;
    if (href === '#') {
      if (!homeMapped) { section = document.querySelector('.hero'); homeMapped = true; }
    } else if (href && href.startsWith('#') && href.length > 1) {
      // Only same-page anchors; links like "../#about" on sub-pages are skipped
      section = document.querySelector(href);
    }
    return section ? { link, section } : null;
  })
  .filter(Boolean);

if (trackedSections.length) {
  let ticking = false;

  const updateActive = () => {
    ticking = false;
    const marker = window.innerHeight * 0.35;
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    let current = trackedSections[0];

    if (atBottom) {
      current = trackedSections[trackedSections.length - 1];
    } else {
      trackedSections.forEach((item) => {
        if (item.section.getBoundingClientRect().top <= marker) current = item;
      });
    }

    trackedSections.forEach(({ link }) => {
      const active = link === current.link;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateActive);
    }
  }, { passive: true });
  window.addEventListener('resize', updateActive);
  updateActive();
}
