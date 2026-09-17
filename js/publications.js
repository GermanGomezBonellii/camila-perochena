/* ============================================================
   PUBLICATIONS.JS — comportamiento específico de /publicaciones/
   La navegación móvil, el header, la entrada del hero y el
   revelado al scroll viven en js/site.js. Acá solo queda el
   render de esta página a partir de js/publications-data.js.

   Las tres listas (libros, artículos, capítulos) se reconstruyen
   por completo cada vez que cambia el idioma —a diferencia de
   /medios/, donde alcanza con data-i18n— porque las fechas de los
   artículos se arman con nombres de mes localizados (ver MONTHS
   más abajo), algo que el sistema de traducción por atributos no
   resuelve solo.

   Publicaciones = libros + producción académica (libros, artículos,
   capítulos). Prensa, columnas y entrevistas NO van acá: viven en
   la sección "Prensa y columnas" dentro de Medios (ver
   js/media-data.js). */

(function () {
  "use strict";

  function t(key) {
    return window.CamilaI18n ? window.CamilaI18n.t(key) : key;
  }

  function lang() {
    return window.CamilaI18n ? window.CamilaI18n.getLanguage() : "es";
  }

  var MONTHS = {
    es: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  };

  function monthYear(month, year) {
    var names = MONTHS[lang()] || MONTHS.es;
    if (!month) return String(year);
    return names[month - 1] + " " + year;
  }

  if (!window.CamilaPublicationsData) return;
  var data = window.CamilaPublicationsData;

  /* ---------- 01 / Libros ---------- */
  var booksList = document.getElementById("booksList");

  function renderBooks() {
    if (!booksList) return;
    booksList.innerHTML = "";

    data.books.forEach(function (book) {
      var li = document.createElement("li");
      li.className = "pub-book";

      var cover = document.createElement("div");
      cover.className = "pub-book-cover";

      if (book.cover) {
        var img = document.createElement("img");
        img.src = book.cover;
        img.loading = "lazy";
        img.alt = "";
        cover.appendChild(img);
      } else {
        // Sin portada real todavía: mismo placeholder sobrio que el
        // resto del sitio (ver .media-placeholder en components.css),
        // solo que con la proporción aproximada de una tapa de libro.
        cover.classList.add("media-placeholder");
      }

      var info = document.createElement("div");
      info.className = "pub-book-info";

      var eyebrow = document.createElement("p");
      eyebrow.className = "eyebrow";
      eyebrow.textContent = t("publicationsPage.books.eyebrow");
      info.appendChild(eyebrow);

      var title = document.createElement("h3");
      title.className = "pub-book-title";
      title.textContent = book.title;
      info.appendChild(title);

      if (book.subtitle) {
        var subtitle = document.createElement("p");
        subtitle.className = "pub-book-subtitle";
        subtitle.textContent = book.subtitle;
        info.appendChild(subtitle);
      }

      var meta = document.createElement("p");
      meta.className = "pub-book-meta";
      meta.textContent = [book.publisher, book.year].filter(Boolean).join(", ");
      info.appendChild(meta);

      if (book.descKey) {
        var desc = document.createElement("p");
        desc.className = "pub-book-desc";
        desc.textContent = t(book.descKey);
        info.appendChild(desc);
      }

      if (book.url) {
        var link = document.createElement("a");
        link.className = "text-link";
        link.href = book.url;
        link.target = "_blank";
        link.rel = "noopener";
        link.textContent = t("publicationsPage.readCta");
        info.appendChild(link);
      }

      li.appendChild(cover);
      li.appendChild(info);
      booksList.appendChild(li);
    });
  }

  /* ---------- 02 / Artículos académicos ----------
     Índice tipográfico agrupado por año: como la fuente ya viene
     ordenada de más reciente a más antiguo, alcanza con abrir un
     grupo nuevo cada vez que cambia el año en el recorrido. */
  var articlesIndex = document.getElementById("articlesIndex");

  function renderArticles() {
    if (!articlesIndex) return;
    articlesIndex.innerHTML = "";

    var items = data.journalArticles.slice().sort(function (a, b) {
      return b.sortValue - a.sortValue;
    });

    var currentYear = null;
    var entriesEl = null;

    items.forEach(function (item) {
      if (item.year !== currentYear) {
        currentYear = item.year;

        var yearLi = document.createElement("li");
        yearLi.className = "pub-year-block";

        var yearSpan = document.createElement("span");
        yearSpan.className = "pub-year";
        yearSpan.textContent = String(currentYear);

        entriesEl = document.createElement("ul");
        entriesEl.className = "pub-year-entries";

        yearLi.appendChild(yearSpan);
        yearLi.appendChild(entriesEl);
        articlesIndex.appendChild(yearLi);
      }

      var entry = document.createElement("li");
      entry.className = "pub-entry";

      var title = document.createElement("h3");
      title.className = "pub-entry-title";
      title.textContent = item.title;
      entry.appendChild(title);

      var meta = document.createElement("p");
      meta.className = "pub-entry-meta";
      meta.textContent = item.publication + " / " + monthYear(item.month, item.year);
      entry.appendChild(meta);

      if (item.url) {
        var link = document.createElement("a");
        link.className = "pub-entry-link";
        link.href = item.url;
        link.target = "_blank";
        link.rel = "noopener";
        link.setAttribute("aria-label", item.title);
        link.textContent = "→";
        entry.appendChild(link);
      }

      entriesEl.appendChild(entry);
    });
  }

  /* ---------- 03 / Capítulos de libro ---------- */
  var chaptersList = document.getElementById("chaptersList");

  function renderChapters() {
    if (!chaptersList) return;
    chaptersList.innerHTML = "";

    var items = data.bookChapters.slice().sort(function (a, b) {
      return b.sortValue - a.sortValue;
    });

    items.forEach(function (chapter) {
      var li = document.createElement("li");
      li.className = "pub-chapter";

      var tag = document.createElement("p");
      tag.className = "eyebrow";
      tag.textContent = t("publicationsPage.bookChapters.tag");
      li.appendChild(tag);

      var title = document.createElement("h3");
      title.className = "pub-chapter-title";
      title.textContent = chapter.title;
      li.appendChild(title);

      if (chapter.coAuthor) {
        var coAuthor = document.createElement("p");
        coAuthor.className = "pub-chapter-meta";
        coAuthor.textContent = t("publicationsPage.bookChapters.coAuthorLabel") + ": " + chapter.coAuthor;
        li.appendChild(coAuthor);
      }

      var inBook = document.createElement("p");
      inBook.className = "pub-chapter-in";
      var inLabel = document.createElement("span");
      inLabel.className = "pub-chapter-in-label";
      inLabel.textContent = t("publicationsPage.bookChapters.inLabel");
      inBook.appendChild(inLabel);
      inBook.appendChild(document.createTextNode(" " + chapter.inBook));
      li.appendChild(inBook);

      var editorLine = document.createElement("p");
      editorLine.className = "pub-chapter-meta";
      var isCompilers = chapter.editorRole === "compilers";
      var roleLabel = t(isCompilers ? "publicationsPage.bookChapters.compilersLabel" : "publicationsPage.bookChapters.editorLabel");
      var names = (lang() === "en" && chapter.editorNamesEn) ? chapter.editorNamesEn : chapter.editorNames;
      editorLine.textContent = roleLabel + ": " + names;
      li.appendChild(editorLine);

      var pubMeta = document.createElement("p");
      pubMeta.className = "pub-chapter-pub";
      pubMeta.textContent = [chapter.publisher, chapter.year].filter(Boolean).join(" / ");
      li.appendChild(pubMeta);

      chaptersList.appendChild(li);
    });
  }

  // Prensa, columnas y entrevistas NO se renderizan acá: viven en la
  // sección "Prensa y columnas" dentro de Medios (js/media-data.js,
  // js/media.js).

  function renderAll() {
    renderBooks();
    renderArticles();
    renderChapters();
  }

  renderAll();
  if (window.CamilaI18n) window.CamilaI18n.onChange(renderAll);

})();
