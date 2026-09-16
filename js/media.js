/* ============================================================
   MEDIA.JS — comportamiento específico de /medios/
   La navegación móvil, el header, la entrada del hero y el
   revelado al scroll viven en js/site.js. Acá solo queda el
   render de esta página: la grilla de Odisea Argentina (vía las
   utilidades compartidas de CamilaMedia) y la lista de podcasts.
   ============================================================ */

(function () {
  "use strict";

  function t(key) {
    return window.CamilaI18n ? window.CamilaI18n.t(key) : key;
  }

  /* ---------- Odisea Argentina ---------- */
  var odiseaGrid = document.getElementById("odiseaGrid");

  if (odiseaGrid && window.CamilaMedia && window.CamilaMediaData) {
    window.CamilaMedia.renderMediaItems(odiseaGrid, window.CamilaMediaData.odisea);
  }

  if (window.CamilaMedia) {
    window.CamilaMedia.attachLazyEmbed(document);
  }

  /* ---------- Podcasts ----------
     Tratamiento distinto al de Odisea: no son videos con miniatura,
     sino proyectos (portada cuadrada + nombre + rol + descripción +
     enlace si existe uno verificado). Por eso no pasan por
     CamilaMedia.renderMediaItems, pensado para el formato de video. */
  var podcastList = document.getElementById("podcastList");

  if (podcastList && window.CamilaMediaData) {
    window.CamilaMediaData.podcasts.forEach(function (item) {
      var li = document.createElement("li");
      li.className = "podcast-item";

      var cover = document.createElement("span");
      cover.className = "podcast-cover media-placeholder";
      cover.setAttribute("aria-hidden", "true");

      var body = document.createElement("div");
      body.className = "podcast-body";

      var name = document.createElement(item.url ? "a" : "span");
      name.className = "podcast-name";
      name.textContent = item.name;
      if (item.url) {
        name.setAttribute("href", item.url);
        name.setAttribute("target", "_blank");
        name.setAttribute("rel", "noopener");
      }
      body.appendChild(name);

      if (item.roleKey) {
        var role = document.createElement("span");
        role.className = "podcast-role";
        role.setAttribute("data-i18n", item.roleKey);
        role.textContent = t(item.roleKey);
        body.appendChild(role);
      }

      if (item.descKey) {
        var desc = document.createElement("p");
        desc.className = "podcast-desc";
        desc.setAttribute("data-i18n", item.descKey);
        desc.textContent = t(item.descKey);
        body.appendChild(desc);
      }

      if (item.url) {
        var link = document.createElement("a");
        link.className = "text-link podcast-link";
        link.setAttribute("href", item.url);
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener");
        link.setAttribute("data-i18n", "mediaPage.podcasts.listenCta");
        link.textContent = t("mediaPage.podcasts.listenCta");
        body.appendChild(link);
      }

      li.appendChild(cover);
      li.appendChild(body);
      podcastList.appendChild(li);
    });
  }

})();
