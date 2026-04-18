/* =========================================
   Śatamāna RāSa - Main JavaScript
   ========================================= */

document.addEventListener('DOMContentLoaded', function () {

  // --- Mobile Navigation Toggle ---
  var hamburger = document.getElementById('hamburger');
  var navLinks = document.getElementById('navLinks');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
    });

    hamburger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        hamburger.click();
      }
    });

    // Close menu when a link is clicked
    var links = navLinks.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function () {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
      });
    }
  }

  // --- Scroll Reveal Animation ---
  var revealElements = document.querySelectorAll('.reveal');

  function checkReveal() {
    var windowHeight = window.innerHeight;
    for (var i = 0; i < revealElements.length; i++) {
      var el = revealElements[i];
      var rect = el.getBoundingClientRect();
      if (rect.top < windowHeight - 80) {
        el.classList.add('visible');
      }
    }
  }

  // Check on load
  checkReveal();

  // Check on scroll (throttled)
  var scrollTimeout;
  window.addEventListener('scroll', function () {
    if (scrollTimeout) return;
    scrollTimeout = setTimeout(function () {
      checkReveal();
      scrollTimeout = null;
    }, 50);
  });

  // --- Sticky Nav Shadow ---
  var nav = document.querySelector('nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 10) {
        nav.style.boxShadow = '0 3px 20px rgba(42, 24, 16, 0.4)';
      } else {
        nav.style.boxShadow = '0 3px 15px rgba(42, 24, 16, 0.3)';
      }
    });
  }

});
