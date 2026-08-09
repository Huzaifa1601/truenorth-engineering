export function initAnimations(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const elements = document.querySelectorAll('.section-head,.split > *, .service-card,.project-card,.industry-card,.why-item,.testimonials article,.faq-list details,.contact-info,.quote');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.animate(
          [{opacity:0, transform:'translateY(16px)'},{opacity:1, transform:'translateY(0)'}],
          {duration:460, easing:'cubic-bezier(.2,.8,.2,1)', fill:'both'}
        );
        observer.unobserve(entry.target);
      }
    });
  }, {threshold:.12});
  elements.forEach(element => observer.observe(element));
}
