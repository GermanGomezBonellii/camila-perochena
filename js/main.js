/* ============================================================
   MAIN.JS — comportamiento específico de Home
   La navegación móvil, el header, la entrada del hero y el
   revelado al scroll son comunes a todo el sitio y viven en
   js/site.js (incluido antes que este archivo). Acá solo queda
   lo propio de esta página: los datos y el render de "En medios".
   ============================================================ */

(function () {
  "use strict";

  /* ---------- "En medios" — datos ----------
     Fuente: columnas de Camila Perochena ("El espejo de la
     historia") en Odisea Argentina. Para agregar una columna nueva
     alcanza con sumar un objeto a este array, con el mismo formato
     — no hace falta tocar el HTML. El archivo completo de columnas
     vive en /medios/ (ver js/media-data.js), que puede tener más
     videos que esta selección de tres para la Home.

     youtubeId: el ID de 11 caracteres del video en YouTube.
     date: fecha editorial legacy (formato libre, ej. "Marzo 2026").
       El CMS usa publishedAt con la fecha oficial de YouTube.

     Nota: los 3 videos cargados hoy son columnas reales de
     Camila Perochena en Odisea Argentina, verificadas de forma
     individual. No pudimos confirmar su posición exacta ni sus
     fechas dentro de la playlist de YouTube — reemplazar por otros
     apenas se confirmen esos datos. */
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

  var grid = document.getElementById("mediaGrid");

  if (grid && window.CamilaMedia) {
    window.CamilaMedia.renderMediaItems(grid, MEDIA_ITEMS);
    window.CamilaMedia.attachLazyEmbed(document);
  }

  /* ---------- Artículos destacados ----------
     Usa los mismos datos que /publicaciones/ (js/publications-data.js,
     incluido antes que este archivo): los 3 artículos marcados con
     homeFeatured, en ese orden. Títulos y revistas son citas reales,
     no se traducen — por eso alcanza con armar el DOM una sola vez,
     sin volver a renderizar al cambiar de idioma. */
  var homeArticlesList = document.getElementById("homeArticles");

  if (homeArticlesList && window.CamilaPublicationsData) {
    var featuredArticles = window.CamilaPublicationsData.journalArticles
      .filter(function (item) {
        return !!item.homeFeatured;
      })
      .sort(function (a, b) {
        return a.homeFeatured - b.homeFeatured;
      });

    featuredArticles.forEach(function (item) {
      var li = document.createElement("li");

      var time = document.createElement("time");
      time.setAttribute("datetime", String(item.year));
      time.textContent = String(item.year);

      var pub = document.createElement("span");
      pub.className = "article-pub";
      pub.textContent = item.publication;

      var title = document.createElement("h3");
      title.textContent = item.title;

      li.appendChild(time);
      li.appendChild(pub);
      li.appendChild(title);
      homeArticlesList.appendChild(li);
    });
  }

  /* ---------- CMS público ----------
     El diseño y los componentes siguen siendo los del sitio. Solo se
     reemplazan los datos administrables cuando la API responde bien.
     Si está temporalmente caída, permanece el contenido editorial ya
     incluido en esta versión del sitio, sin exponer el error al público. */
  var featuredBookSection = document.querySelector("[data-cms-featured-book]");
  var newsSection = document.getElementById("newsSection");
  var newsStage = document.getElementById("newsStage");
  var newsControls = document.getElementById("newsControls");
  var newsIndicators = document.getElementById("newsIndicators");
  var newsPrevious = document.getElementById("newsPrevious");
  var newsNext = document.getElementById("newsNext");
  var newsItems = [];
  var newsIndex = 0;
  var newsTimer = null;
  var newsControlsBound = false;
  var cmsContent;

  function isEnglish() {
    return window.CamilaI18n && window.CamilaI18n.getLanguage() === "en";
  }

  function renderFeaturedBook(book) {
    if (!featuredBookSection) return;
    if (!book) {
      featuredBookSection.hidden = true;
      return;
    }
    var image = featuredBookSection.querySelector(".book-cover");
    var title = featuredBookSection.querySelector("#book-heading");
    var subtitle = featuredBookSection.querySelector(".book-subtitle");
    var meta = featuredBookSection.querySelector(".book-meta");
    var description = featuredBookSection.querySelector(".book-desc");
    var link = featuredBookSection.querySelector(".text-link");
    if (image && book.coverPath) image.src = book.coverPath;
    if (image) image.alt = book.title || "";
    if (title) title.textContent = book.title || "";
    if (subtitle) {
      subtitle.textContent = book.subtitle || "";
      subtitle.hidden = !book.subtitle;
    }
    if (meta) meta.textContent = [book.publisher, book.year].filter(Boolean).join(", ");
    if (description) description.textContent = (isEnglish() ? book.descriptionEn : book.descriptionEs) || "";
    if (link) {
      link.href = book.externalUrl || "/publicaciones";
      if (book.externalUrl) {
        link.target = "_blank";
        link.rel = "noopener";
      } else {
        link.removeAttribute("target");
        link.removeAttribute("rel");
      }
    }
    featuredBookSection.hidden = false;
  }

  function newsLabel(type) {
    var labels = isEnglish() ? {
      book: "Book", conference: "Conference", award: "Award", media: "Media", other: "Announcement"
    } : {
      book: "Libro", conference: "Conferencia", award: "Premio", media: "Medio", other: "Novedad"
    };
    return labels[type] || labels.other;
  }

  function formatNewsDate(value) {
    if (!value) return "";
    var date = new Date(value + "T12:00:00Z");
    if (isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(isEnglish() ? "en-US" : "es-AR", {
      year: "numeric", month: "long", day: "numeric"
    }).format(date);
  }

  function stopNewsAutoplay() {
    if (newsTimer) window.clearInterval(newsTimer);
    newsTimer = null;
  }

  function reducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function showNews(index, shouldAnimate) {
    if (!newsItems.length || !newsStage) return;
    newsIndex = (index + newsItems.length) % newsItems.length;
    var item = newsItems[newsIndex];
    var article = document.createElement("article");
    article.className = "news-slide" + (shouldAnimate && !reducedMotion() ? " news-slide--enter" : "");
    article.setAttribute("role", "group");
    article.setAttribute("aria-roledescription", "diapositiva");
    article.setAttribute("aria-label", (newsIndex + 1) + " de " + newsItems.length);

    var visual = document.createElement("figure");
    visual.className = "news-visual";
    if (item.imagePath) {
      var image = document.createElement("img");
      image.className = "news-image";
      image.src = item.imagePath;
      image.alt = "";
      image.loading = "eager";
      visual.appendChild(image);
    } else {
      var placeholder = document.createElement("div");
      placeholder.className = "news-image-placeholder";
      placeholder.textContent = isEnglish() ? "Image pending" : "Imagen pendiente";
      visual.appendChild(placeholder);
    }

    var copy = document.createElement("div");
    copy.className = "news-copy";
    var type = document.createElement("span");
    type.className = "news-type";
    type.textContent = newsLabel(item.type);
    var date = document.createElement("time");
    date.className = "news-date";
    date.dateTime = item.eventDate || "";
    date.textContent = formatNewsDate(item.eventDate);
    var title = document.createElement("h3");
    title.className = "news-title";
    title.textContent = (isEnglish() ? item.titleEn : item.titleEs) || item.titleEs || "";
    var description = document.createElement("p");
    description.className = "news-description";
    description.textContent = (isEnglish() ? item.descriptionEn : item.descriptionEs) || item.descriptionEs || "";
    copy.appendChild(type);
    if (date.textContent) copy.appendChild(date);
    copy.appendChild(title);
    if (description.textContent) copy.appendChild(description);
    if (item.externalUrl) {
      var link = document.createElement("a");
      link.className = "text-link news-cta";
      link.href = item.externalUrl;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = isEnglish() ? "Read more →" : "Ver más →";
      copy.appendChild(link);
    }
    article.appendChild(visual);
    article.appendChild(copy);
    newsStage.replaceChildren(article);

    if (newsIndicators) {
      Array.prototype.forEach.call(newsIndicators.children, function (indicator, position) {
        indicator.setAttribute("aria-current", String(position === newsIndex));
      });
    }
  }

  function startNewsAutoplay() {
    stopNewsAutoplay();
    if (newsItems.length < 2 || reducedMotion()) return;
    newsTimer = window.setInterval(function () {
      showNews(newsIndex + 1, true);
    }, 6000);
  }

  function bindNewsControls() {
    if (newsControlsBound || !newsSection) return;
    newsControlsBound = true;
    newsPrevious.addEventListener("click", function () {
      stopNewsAutoplay();
      showNews(newsIndex - 1, true);
    });
    newsNext.addEventListener("click", function () {
      stopNewsAutoplay();
      showNews(newsIndex + 1, true);
    });
    newsSection.addEventListener("pointerenter", stopNewsAutoplay);
    newsSection.addEventListener("focusin", stopNewsAutoplay);
  }

  function renderNews(items) {
    if (!newsSection || !newsStage) return;
    newsItems = Array.isArray(items) ? items : [];
    if (!newsItems.length) {
      stopNewsAutoplay();
      newsStage.replaceChildren();
      newsSection.hidden = true;
      return;
    }
    if (newsIndex >= newsItems.length) newsIndex = 0;
    newsSection.hidden = false;
    if (newsControls) newsControls.hidden = newsItems.length < 2;
    if (newsIndicators) {
      newsIndicators.replaceChildren();
      newsItems.forEach(function (item, position) {
        var indicator = document.createElement("button");
        indicator.type = "button";
        indicator.className = "news-indicator";
        indicator.setAttribute("aria-label", (isEnglish() ? "Show item " : "Ver novedad ") + (position + 1));
        indicator.addEventListener("click", function () {
          stopNewsAutoplay();
          showNews(position, true);
        });
        newsIndicators.appendChild(indicator);
      });
    }
    bindNewsControls();
    showNews(newsIndex, false);
    startNewsAutoplay();
  }

  function renderCms() {
    if (!cmsContent) return;
    if (grid && window.CamilaMedia) {
      grid.innerHTML = "";
      window.CamilaMedia.renderMediaItems(grid, (cmsContent.odisea || []).slice(0, 3));
      window.CamilaMedia.attachLazyEmbed(grid);
    }
    renderFeaturedBook((cmsContent.featured && cmsContent.featured.books || [])[0]);
    renderNews(cmsContent.featured && cmsContent.featured.news);
  }

  if (window.CamilaCms) {
    window.CamilaCms.getContent().then(function (content) {
      cmsContent = content;
      renderCms();
      if (window.CamilaI18n) window.CamilaI18n.onChange(renderCms);
    }).catch(function (error) {
      console.error("CMS content could not be loaded.", error);
      // El fallback editorial no revela detalles técnicos y mantiene el layout usable.
      if (featuredBookSection) featuredBookSection.hidden = false;
    });
  }

})();
