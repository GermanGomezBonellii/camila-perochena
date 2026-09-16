/* ============================================================
   I18N.JS — sistema de traducción client-side, reutilizable
   ============================================================

   Cómo funciona:
   - Cada texto traducible en el HTML lleva un atributo data-i18n
     (contenido de texto), data-i18n-aria-label (atributo aria-label)
     o data-i18n-alt (atributo alt), con una "clave" de punto
     (ej: "nav.about") que apunta a una entrada del objeto
     `translations` de abajo.
   - CamilaI18n.init() lee la preferencia guardada en localStorage
     (o usa español por default) y aplica esa traducción a todo el
     documento.
   - CamilaI18n.setLanguage("en" | "es") cambia el idioma activo,
     lo persiste y vuelve a aplicar las traducciones — sin recargar
     la página ni tocar el resto del layout/animaciones.
   - CamilaI18n.t("clave") devuelve el string traducido actual; lo
     usa este archivo y también js/main.js para los fragmentos que
     se arman dinámicamente (grilla de "En medios").
   - CamilaI18n.onChange(fn) registra un callback que se ejecuta
     cada vez que cambia el idioma, para lógica que data-i18n no
     puede resolver por sí sola (por ejemplo, el label del botón de
     menú móvil, que depende también de si está abierto o cerrado).

   Para agregar una página nueva (Sobre mí, Publicaciones, Medios,
   Contacto) alcanza con:
   1. sumar sus claves dentro de `translations.es` / `translations.en`
      (podés anidarlas bajo un nombre de página, ej. "about.bio");
   2. marcar sus textos en el HTML con data-i18n="about.bio";
   3. incluir este mismo archivo antes que el script de esa página.
   No hace falta duplicar HTML ni crear una carpeta /en/.
   ============================================================ */

var CamilaI18n = (function () {
  "use strict";

  var STORAGE_KEY = "camila-language";
  var DEFAULT_LANG = "es";

  var translations = {
    es: {
      meta: {
        title: "Camila Perochena — Historiadora",
        description:
          "Camila Perochena, historiadora. Investigación, docencia, publicaciones y participaciones en medios sobre historia argentina reciente."
      },
      a11y: {
        skipLink: "Saltar al contenido"
      },
      nav: {
        mainLabel: "Navegación principal",
        about: "Sobre mí",
        publications: "Publicaciones",
        media: "Medios",
        contact: "Contacto",
        menu: "Menú",
        close: "Cerrar"
      },
      hero: {
        sectionLabel: "Presentación",
        role: "Historiadora",
        imageAlt: "Camila Perochena en una biblioteca"
      },
      index: {
        heading: "Áreas de trabajo",
        publications: {
          title: "Publicaciones",
          desc: "Libros y artículos sobre historia argentina reciente y los usos políticos del pasado."
        },
        media: {
          title: "Medios",
          desc: "Columnas, entrevistas y participaciones audiovisuales."
        },
        teaching: {
          title: "Docencia e investigación",
          desc: "Actividad académica actual."
        },
        about: {
          title: "Sobre mí",
          desc: "Trayectoria, formación y curriculum."
        }
      },
      book: {
        eyebrow: "Libro",
        coverAlt:
          "Portada del libro Cristina y la Historia. El kirchnerismo y sus batallas por el pasado, de Camila Perochena (Crítica, 2022)",
        description:
          "Un recorrido por los usos del pasado en el discurso kirchnerista y por las batallas culturales en torno a la historia argentina reciente.",
        cta: "Ver publicaciones →"
      },
      media: {
        heading: "En medios",
        noscript: "Activá JavaScript para ver las columnas, o visitá la playlist directamente en YouTube.",
        viewAllCta: "Ver todas las columnas →",
        dateTbc: "Fecha a confirmar",
        thumbUnavailable: "Miniatura no disponible todavía",
        videoSoon: "Video disponible próximamente."
      },
      teaching: {
        heading: "Docencia e investigación",
        role1: { title: "Profesora e investigadora" },
        role2: { title: "Directora" }
      },
      articles: {
        heading: "Artículos",
        viewAllCta: "Ver todas las publicaciones →"
      },
      recognitions: {
        heading: "Reconocimientos"
      },
      contact: {
        heading: "Contacto profesional",
        description: "Para conferencias, notas periodísticas, actividades académicas y otras consultas profesionales.",
        cta: "Ir a contacto →"
      },
      footer: {
        socialLabel: "Redes sociales"
      }
    },

    en: {
      meta: {
        title: "Camila Perochena — Historian",
        description:
          "Camila Perochena, historian. Research, teaching, publications and media appearances on recent Argentine history."
      },
      a11y: {
        skipLink: "Skip to content"
      },
      nav: {
        mainLabel: "Main navigation",
        about: "About",
        publications: "Publications",
        media: "Media",
        contact: "Contact",
        menu: "Menu",
        close: "Close"
      },
      hero: {
        sectionLabel: "Introduction",
        role: "Historian",
        imageAlt: "Camila Perochena in a library"
      },
      index: {
        heading: "Areas of work",
        publications: {
          title: "Publications",
          desc: "Books and articles on recent Argentine history and the political uses of the past."
        },
        media: {
          title: "Media",
          desc: "Columns, interviews and audiovisual appearances."
        },
        teaching: {
          title: "Teaching & Research",
          desc: "Current academic work."
        },
        about: {
          title: "About",
          desc: "Background, education and CV."
        }
      },
      book: {
        eyebrow: "Book",
        // El título real de la obra no tiene traducción oficial al
        // inglés: se mantiene en español dentro del alt, igual que en
        // el texto visible.
        coverAlt:
          "Cover of the book Cristina y la Historia. El kirchnerismo y sus batallas por el pasado, by Camila Perochena (Crítica, 2022)",
        description:
          "A look at how the past has been used in kirchnerista discourse, and at the cultural battles over recent Argentine history.",
        cta: "View publications →"
      },
      media: {
        heading: "Media appearances",
        noscript: "Enable JavaScript to see the columns, or visit the playlist directly on YouTube.",
        viewAllCta: "View all columns →",
        dateTbc: "Date to be confirmed",
        thumbUnavailable: "Thumbnail not available yet",
        videoSoon: "Video available soon."
      },
      teaching: {
        heading: "Teaching & Research",
        role1: { title: "Professor and Researcher" },
        role2: { title: "Director" }
      },
      articles: {
        heading: "Articles",
        viewAllCta: "View all publications →"
      },
      recognitions: {
        heading: "Honors & Awards"
      },
      contact: {
        heading: "Professional contact",
        description: "For conferences, press pieces, academic activities and other professional inquiries.",
        cta: "Go to contact →"
      },
      footer: {
        socialLabel: "Social media"
      }
    }
  };

  var currentLang = DEFAULT_LANG;
  var changeListeners = [];

  function getStoredLanguage() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setStoredLanguage(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      /* localStorage no disponible (modo privado, etc.) — el idioma
         sigue funcionando dentro de la sesión, solo no persiste. */
    }
  }

  // Busca "a.b.c" dentro de un diccionario de idioma. Si falta la
  // clave en el idioma activo, cae a español antes que mostrar un
  // hueco vacío; si tampoco está ahí, devuelve la clave misma para
  // que un faltante se note de inmediato en vez de desaparecer.
  function lookup(dict, path) {
    var parts = path.split(".");
    var node = dict;
    for (var i = 0; i < parts.length; i++) {
      if (node == null || typeof node !== "object") return undefined;
      node = node[parts[i]];
    }
    return typeof node === "string" ? node : undefined;
  }

  function t(path) {
    var value = lookup(translations[currentLang], path);
    if (value === undefined) value = lookup(translations[DEFAULT_LANG], path);
    return value === undefined ? path : value;
  }

  function applyToDom() {
    document.documentElement.lang = currentLang;

    document.title = t("meta.title");
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", t("meta.description"));

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach(function (el) {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria-label")));
    });

    document.querySelectorAll("[data-i18n-alt]").forEach(function (el) {
      el.setAttribute("alt", t(el.getAttribute("data-i18n-alt")));
    });

    document.querySelectorAll("[data-lang-option]").forEach(function (btn) {
      var isActive = btn.getAttribute("data-lang-option") === currentLang;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });

    changeListeners.forEach(function (fn) {
      fn(currentLang);
    });
  }

  function setLanguage(lang) {
    if (!translations[lang] || lang === currentLang) {
      if (translations[lang]) applyToDom(); // por si se llama antes de init
      return;
    }
    currentLang = lang;
    setStoredLanguage(lang);
    applyToDom();
  }

  function onChange(fn) {
    if (typeof fn === "function") changeListeners.push(fn);
  }

  function bindSwitcher() {
    document.querySelectorAll("[data-lang-option]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setLanguage(btn.getAttribute("data-lang-option"));
      });
    });
  }

  function init() {
    var stored = getStoredLanguage();
    currentLang = stored === "en" || stored === "es" ? stored : DEFAULT_LANG;
    bindSwitcher();
    applyToDom();
  }

  return {
    init: init,
    setLanguage: setLanguage,
    getLanguage: function () {
      return currentLang;
    },
    t: t,
    onChange: onChange
  };
})();

CamilaI18n.init();
