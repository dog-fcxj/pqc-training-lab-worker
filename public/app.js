import { initDataStreams } from './visuals.js';
import { renderHero } from './components/hero.js';
import { renderPrinciples } from './components/principles.js';
import { renderAlgorithms } from './components/algorithms.js';
import { renderHandshake } from './components/handshake.js';
import { renderAdoption } from './components/adoption.js';

const sectionModules = {
  hero: renderHero,
  principles: renderPrinciples,
  algorithms: renderAlgorithms,
  protocols: renderHandshake,
  adoption: renderAdoption,
};

// IntersectionObserver: 懒加载渲染 + 导航高亮
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const id = entry.target.id;
    if (entry.isIntersecting && !entry.target.dataset.rendered && sectionModules[id]) {
      sectionModules[id](entry.target);
      entry.target.dataset.rendered = "true";
    }
    if (entry.isIntersecting) {
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('is-active', link.dataset.section === id);
      });
    }
  });
}, { threshold: 0.3, rootMargin: '-80px 0px 0px 0px' });

document.addEventListener('DOMContentLoaded', () => {
  initDataStreams();

  // Hero 首屏直接渲染，不等 Observer
  const heroEl = document.getElementById('hero');
  if (heroEl && !heroEl.dataset.rendered) {
    renderHero(heroEl);
    heroEl.dataset.rendered = "true";
  }

  document.querySelectorAll('.section').forEach(sec => observer.observe(sec));
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(link.dataset.section);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
  window.addEventListener('scroll', () => {
    document.getElementById('top-nav').classList.toggle('scrolled', window.scrollY > 50);
  });
});
