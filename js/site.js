/* ============================================================
   SITE.JS — comportamiento compartido entre páginas
   - navegación móvil (abrir/cerrar animado, Escape, resize)
   - header: estado "scrolleado"
   - entrada del hero al cargar (clase html.hero-ready)
   - revelado de secciones al hacer scroll (.reveal)
   - CamilaMedia: utilidades reutilizables para renderizar grillas
     de video y activar su patrón "click-to-load", usadas tanto por
     Home (js/main.js) como por Medios (js/media.js)

   Este archivo no depende de ninguna página en particular: cada
   página lo incluye después de js/i18n.js y antes de su propio
   script (js/main.js o js/media.js).
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
    // El label del botón depende de dos cosas a la vez — el idioma
    // activo y si el menú está abierto o cerrado — por eso no alcanza
    // con un data-i18n estático: se resuelve acá con CamilaI18n.t().
    var updateToggleLabel = function () {
      var isOpen = nav.classList.contains("is-open");
      var key = isOpen ? "nav.close" : "nav.menu";
      toggle.querySelector(".nav-toggle-text").textContent =
        window.CamilaI18n ? window.CamilaI18n.t(key) : isOpen ? "Cerrar" : "Menú";
    };

    var openMenu = function () {
      nav.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      updateToggleLabel();
    };

    var closeMenu = function () {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      updateToggleLabel();
    };

    if (window.CamilaI18n) {
      window.CamilaI18n.onChange(updateToggleLabel);
    }

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

    /* ---------- Alto real del header, para el hero de Home ----------
       --header-h (variables.css) es una aproximación pensada para
       scroll-margin-top; el hero de Home necesita el valor exacto para
       poder valer "100svh - header" sin dejar un resto de un puñado de
       píxeles que insinúe la sección siguiente. Se mide en vivo acá y
       se expone como --header-h-actual (home.css cae a --header-h si
       por lo que sea esto no llegó a correr todavía). Se recalcula en
       cada resize por si el header cambia de alto en algún ancho. */
    var setHeaderHeightVar = function () {
      document.documentElement.style.setProperty(
        "--header-h-actual",
        header.offsetHeight + "px"
      );
    };

    setHeaderHeightVar();
    window.addEventListener("resize", setHeaderHeightVar);

    if (document.fonts && document.fonts.ready) {
      // La tipografía cargada puede correr el alto del header un par
      // de píxeles respecto de la fuente de reserva del primer render.
      document.fonts.ready.then(setHeaderHeightVar);
    }
  }

  /* ---------- Entrada del hero (una vez, al cargar) ----------
     La clase "hero-ready" en <html> dispara la transición definida
     en el CSS de cada página (home.css, media.css). Con movimiento
     reducido se aplica igual pero sin efecto visible, porque ese
     CSS vive dentro de un @media (prefers-reduced-motion: no-preference).
     Un doble requestAnimationFrame asegura que el estado inicial
     oculto ya se haya pintado antes de animar hacia el estado visible. */
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

  /* ---------- CamilaMedia — utilidades compartidas de video ----------
     renderMediaItems(grid, items): arma la lista de <li class="media-item">
     dentro de "grid" (un <ul>/<ol> vacío) a partir de un array de objetos
     { title, youtubeId, date, program }. Mismo formato que ya usaba
     MEDIA_ITEMS en Home; ahora también lo usa la grilla de Odisea
     Argentina en /medios/.

     attachLazyEmbed(root): activa el patrón "click-to-load" en todos
     los .media-trigger dentro de "root" (por defecto, todo el documento).
     Ningún iframe de YouTube se crea hasta que la persona hace clic. */
  function t(key) {
    return window.CamilaI18n ? window.CamilaI18n.t(key) : key;
  }

  function renderMediaItems(grid, items) {
    if (!grid || !items) return;

    items.forEach(function (item) {
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
        thumb.setAttribute("data-i18n-aria-label", "media.thumbUnavailable");
        thumb.setAttribute("aria-label", t("media.thumbUnavailable"));
      }

      var playMark = document.createElement("span");
      playMark.className = "play-mark";
      playMark.setAttribute("aria-hidden", "true");
      thumb.appendChild(playMark);

      var info = document.createElement("span");
      info.className = "media-info";

      var program = document.createElement("span");
      program.className = "media-program";
      program.textContent = item.program || "";

      var title = document.createElement("span");
      title.className = "media-title";
      title.textContent = item.title;

      var date = document.createElement("span");
      date.className = "media-date";
      if (item.date) {
        date.textContent = item.date;
      } else {
        date.setAttribute("data-i18n", "media.dateTbc");
        date.textContent = t("media.dateTbc");
      }

      info.appendChild(program);
      info.appendChild(title);
      info.appendChild(date);

      button.appendChild(thumb);
      button.appendChild(info);
      li.appendChild(button);
      grid.appendChild(li);
    });
  }

  function attachLazyEmbed(root) {
    var scope = root || document;
    var triggers = scope.querySelectorAll(".media-trigger");

    triggers.forEach(function (trigger) {
      // Evita volver a atar el listener si ya se llamó antes sobre
      // el mismo scope (por ejemplo, si una página futura re-renderiza).
      if (trigger.hasAttribute("data-embed-bound")) return;
      trigger.setAttribute("data-embed-bound", "true");

      trigger.addEventListener("click", function () {
        var videoId = trigger.getAttribute("data-video-id");
        var item = trigger.closest(".media-item");

        if (!videoId) {
          // Todavía no hay un ID de video real: se indica de forma sobria.
          if (!item.querySelector(".media-pending-note")) {
            var note = document.createElement("p");
            note.className = "media-pending-note";
            note.setAttribute("data-i18n", "media.videoSoon");
            note.textContent = t("media.videoSoon");
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
  }

  window.CamilaMedia = {
    renderMediaItems: renderMediaItems,
    attachLazyEmbed: attachLazyEmbed
  };

})();
