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
      cover.className = "podcast-cover";
      cover.setAttribute("aria-hidden", "true");

      if (item.cover) {
        // Portada real: la decoración de placeholder (fondo + marco
        // interior) es solo para cuando todavía no hay una.
        var coverImg = document.createElement("img");
        coverImg.className = "podcast-cover-img";
        coverImg.src = item.cover;
        coverImg.alt = "";
        coverImg.loading = "lazy";
        cover.appendChild(coverImg);
      } else {
        cover.classList.add("media-placeholder");
      }

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

  /* ---------- Prensa y columnas ----------
     Igual lógica que los artículos de Publicaciones (js/publications.js):
     las fechas se arman con nombres de mes localizados, así que la
     lista se reconstruye por completo cada vez que cambia el idioma
     en vez de depender solo de data-i18n. */
  var MONTHS = {
    es: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  };

  var PRESS_TYPE_KEYS = {
    column: "mediaPage.press.typeColumn",
    article: "mediaPage.press.typeArticle",
    interview: "mediaPage.press.typeInterview"
  };

  function lang() {
    return window.CamilaI18n ? window.CamilaI18n.getLanguage() : "es";
  }

  function monthYear(month, year) {
    var names = MONTHS[lang()] || MONTHS.es;
    if (!month) return String(year);
    return names[month - 1] + " " + year;
  }

  var pressList = document.getElementById("pressList");

  function renderPress() {
    if (!pressList || !window.CamilaMediaData || !window.CamilaMediaData.press) return;
    pressList.innerHTML = "";

    var items = window.CamilaMediaData.press.slice().sort(function (a, b) {
      return b.sortValue - a.sortValue;
    });

    items.forEach(function (item) {
      var li = document.createElement("li");
      li.className = "press-item";

      var type = document.createElement("span");
      type.className = "press-type";
      type.textContent = t(PRESS_TYPE_KEYS[item.type] || "");
      li.appendChild(type);

      var body = document.createElement("div");
      body.className = "press-body";

      // Nombre del medio: link real solo si hay un url verificado
      // (mismo criterio que en publicaciones, nunca un href inventado).
      var outlet = document.createElement(item.url ? "a" : "span");
      outlet.className = "press-outlet";
      outlet.textContent = item.outlet;
      if (item.url) {
        outlet.setAttribute("href", item.url);
        outlet.setAttribute("target", "_blank");
        outlet.setAttribute("rel", "noopener");
      }
      body.appendChild(outlet);

      if (item.title) {
        // Título real ya publicado: no se traduce.
        var title = document.createElement("p");
        title.className = "press-title";
        title.textContent = "“" + item.title + "”";
        body.appendChild(title);
      } else if (item.topicKey) {
        // Tema recurrente de una columna (no un título publicado):
        // sí se traduce, ver js/i18n.js mediaPage.press.laNacionTopic.
        var topic = document.createElement("p");
        topic.className = "press-topic";
        topic.textContent = t(item.topicKey);
        body.appendChild(topic);
      }

      var date = document.createElement("p");
      date.className = "press-date";
      date.textContent = item.startYear
        ? monthYear(item.startMonth, item.startYear) + " - " + monthYear(item.endMonth, item.endYear)
        : monthYear(item.month, item.year);
      body.appendChild(date);

      li.appendChild(body);
      pressList.appendChild(li);
    });
  }

  renderPress();
  if (window.CamilaI18n) window.CamilaI18n.onChange(renderPress);

})();
