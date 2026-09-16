/* ============================================================
   MAIN.JS — comportamiento mínimo e intencional
   - navegación móvil
   - grilla de "En medios" generada desde un array de datos
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
