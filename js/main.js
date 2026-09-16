/* ============================================================
   MAIN.JS — comportamiento mínimo e intencional
   - navegación móvil
   - patrón "click-to-load" para miniaturas de video
     (ningún iframe se carga hasta que el usuario interactúa)
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Navegación móvil ---------- */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("primaryNav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.querySelector(".nav-toggle-text").textContent = isOpen ? "Cerrar" : "Menú";
    });

    // Cerrar el menú al navegar (mejora la experiencia en móvil)
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.querySelector(".nav-toggle-text").textContent = "Menú";
      });
    });
  }

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
