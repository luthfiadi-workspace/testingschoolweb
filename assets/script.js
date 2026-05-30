/* Al Munawar — interactions: mobile nav, news carousel, scroll reveal */
(function () {
  "use strict";

  /* ---- Sticky header shadow ---- */
  var header = document.querySelector(".header");
  var onScroll = function () {
    if (window.scrollY > 8) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  var toggle = document.querySelector(".menu-toggle");
  var drawer = document.querySelector(".mobile-menu");
  if (toggle && drawer) {
    toggle.addEventListener("click", function () {
      var open = drawer.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    drawer.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        drawer.classList.remove("open");
        toggle.classList.remove("open");
      });
    });
  }

  /* ---- News carousel ---- */
  var carousel = document.querySelector("[data-carousel]");
  if (carousel) {
    var track = carousel.querySelector(".carousel-track");
    var cards = Array.prototype.slice.call(track.children);
    var prev = carousel.querySelector("[data-prev]");
    var next = carousel.querySelector("[data-next]");
    var dotsWrap = carousel.querySelector(".carousel-dots");
    var index = 0;
    var autoTimer = null;

    var perView = function () {
      var w = window.innerWidth;
      if (w <= 720) return 1;
      if (w <= 920) return 2;
      return 3;
    };

    var maxIndex = function () {
      return Math.max(0, cards.length - perView());
    };

    var buildDots = function () {
      dotsWrap.innerHTML = "";
      var pages = maxIndex() + 1;
      for (var i = 0; i < pages; i++) {
        var b = document.createElement("button");
        b.className = "dot" + (i === index ? " active" : "");
        b.setAttribute("aria-label", "Slide " + (i + 1));
        (function (i) {
          b.addEventListener("click", function () { go(i); });
        })(i);
        dotsWrap.appendChild(b);
      }
    };

    var update = function () {
      if (index > maxIndex()) index = maxIndex();
      var card = cards[0];
      var gap = parseFloat(getComputedStyle(track).gap) || 26;
      var step = card.getBoundingClientRect().width + gap;
      track.style.transform = "translateX(" + (-index * step) + "px)";
      if (prev) prev.disabled = index <= 0;
      if (next) next.disabled = index >= maxIndex();
      Array.prototype.slice.call(dotsWrap.children).forEach(function (d, i) {
        d.classList.toggle("active", i === index);
      });
    };

    var go = function (i) {
      index = Math.max(0, Math.min(i, maxIndex()));
      update();
    };

    if (next) next.addEventListener("click", function () { go(index + 1); restartAuto(); });
    if (prev) prev.addEventListener("click", function () { go(index - 1); restartAuto(); });

    var startAuto = function () {
      autoTimer = setInterval(function () {
        if (index >= maxIndex()) go(0);
        else go(index + 1);
      }, 5500);
    };
    var restartAuto = function () { clearInterval(autoTimer); startAuto(); };

    carousel.addEventListener("mouseenter", function () { clearInterval(autoTimer); });
    carousel.addEventListener("mouseleave", startAuto);

    var resizeT;
    window.addEventListener("resize", function () {
      clearTimeout(resizeT);
      resizeT = setTimeout(function () { buildDots(); update(); }, 150);
    });

    buildDots();
    update();
    startAuto();
  }

  /* ---- Scroll reveal (with failsafe) ---- */
  var reveals = document.querySelectorAll(".reveal");
  var revealAll = function () {
    reveals.forEach(function (el) { el.classList.add("in"); });
  };
  if ("IntersectionObserver" in window) {
    var firedOnce = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { firedOnce = true; e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
    /* Some embedded/preview environments never fire IO — reveal everything
       if nothing has appeared shortly after load. */
    setTimeout(function () { if (!firedOnce) revealAll(); }, 700);
  } else {
    revealAll();
  }

  /* ---- Active nav link on scroll ---- */
  var sections = document.querySelectorAll("section[id]");
  var navLinks = document.querySelectorAll(".menu a");
  if (sections.length && "IntersectionObserver" in window) {
    var navIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var id = e.target.getAttribute("id");
          navLinks.forEach(function (l) {
            l.classList.toggle("active", l.getAttribute("href") === "#" + id);
          });
        }
      });
    }, { threshold: 0.4 });
    sections.forEach(function (s) { navIo.observe(s); });
  }
})();
