// common.js — small helpers (mobile menu toggle)
document.addEventListener('DOMContentLoaded', function(){
  const btns = document.querySelectorAll('.menu-toggle');
  btns.forEach(btn=>{
    btn.addEventListener('click', function(){
      const nav = document.querySelector('.nav');
      if(!nav) return;
      nav.classList.toggle('show');
    });
  });
  // close mobile nav on link click (for single-page feel)
  document.querySelectorAll('.nav a').forEach(a=>{
    a.addEventListener('click', ()=> {
      const nav = document.querySelector('.nav');
      if(nav && nav.classList.contains('show')) nav.classList.remove('show');
    });
  });
});
