/**
 * Reveal cards on scroll with stagger animation
 * Call once after cards render. Re-run if the list changes.
 */
export function revealOnScroll(selector = '.card') {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).style.setProperty('--i', String(i % 8)); // cap stagger
          e.target.classList.add('animate-in');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll(selector).forEach((el) => io.observe(el));
}
