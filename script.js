"use strict";
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
}
else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
}
// Mark the page as scrolling (until ~150ms after the last scroll event), so CSS
// can skip the nav underline animation mid-scroll.
const rootEl = document.documentElement;
let scrollIdleTimer = null;
window.addEventListener('scroll', () => {
    if (scrollIdleTimer === null)
        rootEl.classList.add('is-scrolling');
    else
        clearTimeout(scrollIdleTimer);
    scrollIdleTimer = setTimeout(() => {
        rootEl.classList.remove('is-scrolling');
        scrollIdleTimer = null;
    }, 150);
}, { passive: true });
// Space the page-wide currents evenly from the end of the hero down to the
// footer, about one every CURRENT_SPACING px, adding or removing currents to
// fit the page height. A current that lands near a seam between sections
// (where the section padding leaves empty space) snaps onto it.
// Re-placed whenever the page height changes.
const currentsLayer = document.querySelector('.currents');
const heroEl = document.querySelector('.hero');
const footerEl = document.querySelector('.site-footer');
const seams = [...document.querySelectorAll('body > section:not(.hero), body > footer')];
const CURRENT_SPACING = 800;
const SEAM_SNAP = 220;
// Only called once currentsLayer, heroEl and footerEl are known to exist (see below).
function placeCurrents() {
    const start = heroEl.offsetTop + heroEl.offsetHeight;
    const end = footerEl.offsetTop;
    const count = Math.max(2, Math.round((end - start) / CURRENT_SPACING) + 1);
    const step = (end - start) / (count - 1);
    while (currentsLayer.children.length < count) {
        const span = document.createElement('span');
        span.className = 'current';
        currentsLayer.appendChild(span);
        if (driftObserver)
            driftObserver.observe(span);
    }
    while (currentsLayer.children.length > count) {
        const last = currentsLayer.lastElementChild;
        if (driftObserver)
            driftObserver.unobserve(last);
        last.remove();
    }
    [...currentsLayer.children].forEach((el, i) => {
        let y = start + i * step;
        const near = seams.reduce((best, s) => (Math.abs(s.offsetTop - y) < Math.abs(best - y) ? s.offsetTop : best), Infinity);
        if (Math.abs(near - y) <= SEAM_SNAP)
            y = near;
        el.style.top = `${Math.round(y)}px`;
    });
}
// Pause each drifting background current while it is off screen
// (CSS only runs the drift on elements marked .in-view)
const driftObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => entry.target.classList.toggle('in-view', entry.isIntersecting));
    }, { rootMargin: '100px 0px' })
    : null;
document.querySelectorAll('.hero, .current').forEach((el) => {
    if (driftObserver)
        driftObserver.observe(el);
    else
        el.classList.add('in-view');
});
if (currentsLayer && heroEl && footerEl) {
    placeCurrents();
    // The "in" check narrows window to never in the else branch; the cast undoes that.
    if ('ResizeObserver' in window)
        new ResizeObserver(placeCurrents).observe(document.body);
    else
        window.addEventListener('resize', placeCurrents);
}
// Expandable entries in the About info panel
document.querySelectorAll('.panel-toggle').forEach((toggle) => {
    const desc = document.getElementById(toggle.getAttribute('aria-controls'));
    if (!desc)
        return;
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
        }
        else {
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
        if (event.target === lightbox)
            close();
    });
    lightbox.addEventListener('keydown', (event) => {
        if (event.target.tagName === 'VIDEO')
            return; // let the video use arrow keys for seeking
        if (event.key === 'ArrowLeft')
            show(current - 1);
        if (event.key === 'ArrowRight')
            show(current + 1);
    });
    // Esc closes natively; on any close, stop playback and return focus to the thumbnail
    lightbox.addEventListener('close', () => {
        mediaBox.replaceChildren();
        if (opener)
            opener.focus();
    });
}
// Mobile navigation menu
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.getElementById('site-nav');
if (navToggle && siteNav) {
    const setMenu = (open, instant = false) => {
        if (instant)
            siteNav.classList.add('no-anim');
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
            if (siteNav.classList.contains('is-open'))
                setMenu(false, true);
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
        if (event.matches)
            setMenu(false, true);
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
        if (!homeMapped) {
            section = document.querySelector('.hero');
            homeMapped = true;
        }
    }
    else if (href && href.startsWith('#') && href.length > 1) {
        // Only same-page anchors; links like "../#about" on sub-pages are skipped
        section = document.querySelector(href);
    }
    return section ? { link, section } : null;
})
    .filter(Boolean);
if (trackedSections.length) {
    let ticking = false;
    let activeLink = null;
    const updateActive = () => {
        ticking = false;
        const marker = window.innerHeight * 0.35;
        const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
        let current = trackedSections[0];
        if (atBottom) {
            current = trackedSections[trackedSections.length - 1];
        }
        else {
            trackedSections.forEach((item) => {
                if (item.section.getBoundingClientRect().top <= marker)
                    current = item;
            });
        }
        // Only touch the DOM when the active section actually changes
        if (current.link === activeLink)
            return;
        activeLink = current.link;
        trackedSections.forEach(({ link }) => {
            const active = link === current.link;
            link.classList.toggle('is-active', active);
            if (active)
                link.setAttribute('aria-current', 'location');
            else
                link.removeAttribute('aria-current');
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
