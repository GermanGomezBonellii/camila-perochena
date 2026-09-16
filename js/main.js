/* ============================================================
   MAIN.JS — comportamiento mínimo e intencional
   - navegación móvil (abrir/cerrar animado, Escape, resize)
   - entrada del hero y revelado de secciones al hacer scroll
   - grilla de "En medios" generada desde un array de datos
   - patrón "click-to-load" para miniaturas de video
     (ningún iframe se carga hasta que el usuario interactúa)
   ============================================================ */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- Navegación móvil ---------- */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("primaryNav");
  var MOBILE_BREAKPOINT = 720;

  if (toggle && nav) {
    var openMenu = function () {
      nav.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.querySelector(".nav-toggle-text").textContent = "Cerrar";
    };

    var closeMenu = function () {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.querySelector(".nav-toggle-text").textContent = "Menú";
    };

    toggle.addEventListener("click", function () {
      if (nav.classList.contains("is-open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Cerrar el menú al navegar (mejora la experiencia en móvil)
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    // Cerrar con Escape y devolver el foco al botón que abrió el menú.
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        closeMenu();
        toggle.focus();
      }
    });

    // Si la ventana pasa a ancho de escritorio con el menú móvil
    // abierto, se resetea el estado para no quedar "abierto" detrás
    // de una navegación que ya se muestra distinto en ese ancho.
    window.addEventListener("resize", function () {
      if (window.innerWidth > MOBILE_BREAKPOINT && nav.classList.contains("is-open")) {
        closeMenu();
      }
    });
  }

  /* ---------- Header: estado "scrolleado" ---------- */
  var header = document.querySelector(".site-header");

  if (header) {
    var SCROLL_THRESHOLD = 24;
    var ticking = false;

    var updateHeaderState = function () {
      header.classList.toggle("is-scrolled", window.scrollY > SCROLL_THRESHOLD);
      ticking = false;
    };

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(updateHeaderState);
          ticking = true;
        }
      },
      { passive: true }
    );

    updateHeaderState();
  }

  /* ---------- Entrada del hero (una vez, al cargar) ----------
     La clase "hero-ready" en <html> dispara la transición definida
     en home.css. Con movimiento reducido se aplica igual pero sin
     efecto visible, porque ese CSS vive dentro de un
     @media (prefers-reduced-motion: no-preference). Un doble
     requestAnimationFrame asegura que el estado inicial oculto ya
     se haya pintado antes de animar hacia el estado visible. */
  if (prefersReducedMotion) {
    document.documentElement.classList.add("hero-ready");
  } else {
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        document.documentElement.classList.add("hero-ready");
      });
    });
  }

  /* ---------- Revelado de secciones al hacer scroll ----------
     Se observa cada .reveal y se marca .is-visible una sola vez,
     la primera vez que entra en viewport. El CSS correspondiente
     (layout.css) ya está condicionado a "no-preference", así que
     acá alcanza con no molestarse en observar si hay movimiento
     reducido o si el navegador no soporta IntersectionObserver:
     el contenido ya es visible por default en esos casos. */
  var revealEls = document.querySelectorAll(".reveal");

  if (revealEls.length) {
    if (!prefersReducedMotion && "IntersectionObserver" in window) {
      var revealObserver = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );

      revealEls.forEach(function (el) {
        revealObserver.observe(el);
      });
    } else {
      revealEls.forEach(function (el) {
        el.classList.add("is-visible");
      });
    }
  }

  /* ---------- "En medios" — datos ----------
     Fuente: columnas de Camila Perochena ("El espejo de la
     historia") en Odisea Argentina (LN+ / OLGA). Para agregar
     una columna nueva alcanza con sumar un objeto a este array,
     con el mismo formato — no hace falta tocar el HTML.

     youtubeId: el ID de 11 caracteres del video en YouTube.
     date: fecha de emisión si se confirma (formato libre, ej.
       "Marzo 2026"). Dejar "" si todavía no está confirmada —
       en ese caso se muestra "Fecha a confirmar" en vez de
       inventar un dato.

     Nota: los 3 videos cargados hoy son columnas reales de
     Camila Perochena en Odisea Argentina, verificadas de forma
     individual. No pudimos confirmar su posición exacta ni sus
     fechas dentro de la playlist de YouTube provista (ver aviso
     en la conversación) — reemplazar por los 3 primeros videos
     reales de la playlist, o por otros que prefieras, apenas
     se confirmen esos datos. */
  var MEDIA_ITEMS = [
    {
      title: "¿Fue Argentina alguna vez una potencia mundial?",
      youtubeId: "JNojE_R6ULk",
      date: "",
      program: "Odisea Argentina"
    },
    {
      title: "El mito de la Argentina blanca (segunda parte)",
      youtubeId: "Ld1j95u4Hkw",
      date: "",
      program: "Odisea Argentina"
    },
    {
      title: "Las nuevas derechas y el debate sobre el fascismo",
      youtubeId: "ryzW38Xp9ok",
      date: "",
      program: "Odisea Argentina"
    }
  ];

  /* ---------- "En medios" — render ---------- */
  function renderMediaGrid() {
    var grid = document.getElementById("mediaGrid");
    if (!grid) return;

    MEDIA_ITEMS.forEach(function (item) {
      var li = document.createElement("li");
      li.className = "media-item";

      var button = document.createElement("button");
      button.type = "button";
      button.className = "media-trigger";
      button.setAttribute("data-video-id", item.youtubeId || "");

      var thumb = document.createElement("span");
      thumb.className = "media-thumb";

      if (item.youtubeId) {
        var img = document.createElement("img");
        img.className = "media-thumb-img";
        img.src = "https://i.ytimg.com/vi/" + item.youtubeId + "/hqdefault.jpg";
        img.alt = "";
        img.loading = "lazy";
        thumb.appendChild(img);
      } else {
        thumb.classList.add("media-placeholder");
        thumb.setAttribute("role", "img");
        thumb.setAttribute("aria-label", "Miniatura no disponible todavía");
      }

      var playMark = document.createElement("span");
      playMark.className = "play-mark";
      playMark.setAttribute("aria-hidden", "true");
      thumb.appendChild(playMark);

      var info = document.createElement("span");
      info.className = "media-info";

      var program = document.createElement("span");
      program.className = "media-program";
      program.textContent = item.program || "Odisea Argentina";

      var title = document.createElement("span");
      title.className = "media-title";
      title.textContent = item.title;

      var date = document.createElement("span");
      date.className = "media-date";
      date.textContent = item.date || "Fecha a confirmar";

      info.appendChild(program);
      info.appendChild(title);
      info.appendChild(date);

      button.appendChild(thumb);
      button.appendChild(info);
      li.appendChild(button);
      grid.appendChild(li);
    });
  }

  renderMediaGrid();

  /* ---------- Miniaturas de video: cargar solo al interactuar ---------- */
  var triggers = document.querySelectorAll(".media-trigger");

  triggers.forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      var videoId = trigger.getAttribute("data-video-id");
      var item = trigger.closest(".media-item");

      if (!videoId) {
        // Todavía no hay un ID de video real: se indica de forma sobria.
        if (!item.querySelector(".media-pending-note")) {
          var note = document.createElement("p");
          note.className = "media-pending-note";
          note.textContent = "Video disponible próximamente.";
          item.appendChild(note);
        }
        return;
      }

      // Reemplaza la miniatura por el iframe únicamente en el momento del clic.
      var wrapper = document.createElement("div");
      wrapper.className = "media-embed";

      var iframe = document.createElement("iframe");
      iframe.src = "https://www.youtube.com/embed/" + videoId + "?autoplay=1";
      iframe.title = trigger.querySelector(".media-title").textContent;
      iframe.allow = "accelerated-compression; autoplay; encrypted-media; picture-in-picture";
      iframe.allowFullscreen = true;
      iframe.loading = "lazy";

      wrapper.appendChild(iframe);
      trigger.replaceWith(wrapper);
    });
  });

})();
