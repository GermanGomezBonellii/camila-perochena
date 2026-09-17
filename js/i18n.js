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
      // Título/descripción por página. La clave activa la decide
      // data-page en <html> (por defecto "home" si no está presente).
      pages: {
        home: {
          title: "Camila Perochena / Home",
          description:
            "Camila Perochena, historiadora. Investigación, docencia, publicaciones y participaciones en medios sobre historia argentina reciente."
        },
        media: {
          title: "Camila Perochena / Medios",
          description:
            "Columnas, entrevistas, podcasts y participaciones audiovisuales de la historiadora Camila Perochena, incluyendo su columna en Odisea Argentina."
        },
        publications: {
          title: "Camila Perochena / Publicaciones",
          description:
            "Libros, artículos académicos y capítulos de libro de la historiadora Camila Perochena sobre historia, memoria y los usos políticos del pasado."
        },
        about: {
          title: "Camila Perochena / Sobre mí",
          description:
            "Historiadora argentina. Investigación, docencia y comunicación pública sobre los usos políticos del pasado, la memoria y la historia reciente."
        },
        contact: {
          title: "Camila Perochena / Contacto",
          description:
            "Contacto profesional de la historiadora Camila Perochena: conferencias, notas periodísticas, actividades académicas y otras consultas."
        }
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
        imageAlt: "Retrato de Camila Perochena"
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
        viewAllCta: "Ver todas las publicaciones →",
        noscript: "Activá JavaScript para ver los artículos destacados."
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
      },

      // Página /medios/. Nombres propios (Odisea Argentina, El espejo
      // de la historia, OLGA, HistoriAr, Primavera Cero, Hay que pasar
      // el invierno, La banda presidencial) van directo en el HTML,
      // sin clave: no se traducen.
      mediaPage: {
        heroTitle: "Medios",
        heroDesc: "Columnas, entrevistas, podcasts y participaciones audiovisuales.",
        odisea: {
          description:
            "Camila participa regularmente en Odisea Argentina con una columna donde analiza temas políticos, sociales y económicos contemporáneos desde una perspectiva histórica.",
          watchOnYoutube: "Ver en YouTube"
        },
        olga: {
          heading: "OLGA",
          description: "Desde 2024, Camila participa con columnas históricas periódicas en OLGA.",
          comingSoon: "Selección de columnas en preparación."
        },
        podcasts: {
          heading: "Podcasts",
          listenCta: "Escuchar →",
          historiar: {
            role: "Copresentadora y coproductora",
            description: "Bienvenidos al podcast de la ASAIH, la Asociación Argentina de Investigadores en Historia.\nUn podcast de entrevistas a historiadores sobre historia argentina, latinoamericana y mundial.\nUn recorrido por el pasado para pensarnos en el presente."
          },
          primaveraCero: {
            role: "Productora y conductora",
            description: "Primavera Cero recorre, año por año, la vuelta de la democracia en la Argentina, desde 1982 hasta 1989, a través de las voces de sus protagonistas.\nCon la conducción de los historiadores Camila Perochena y Martín Marimón, cada episodio aborda un año específico de este período."
          },
          hayQuePasarElInvierno: {
            description: "A lo largo de una quincena de episodios vamos a conocer cómo el país se fue insertando en el mercado internacional, primero de la mano de las ovejas; cómo en el camino al presente pasamos por crisis bancarias, cesaciones de pago (nuestros amigos los defaults), tipos de cambio fijos, variables, industrializaciones parciales, crecimiento interrumpido, 1 a 1, corralitos y corralones."
          },
          laBandaPresidencial: {
            description: "La banda presidencial es un podcast conducido por Camila Perochena, historiadora y docente de la Universidad Torcuato Di Tella, y Santiago Rodríguez Rey, politólogo y especialista en comunicación política, que hará un repaso semanal por todos los presidentes argentinos, desde Bernardino Rivadavia hasta Mauricio Macri, al estilo de lo que hicieron los podcasts Presidential, de Lillian Cunningham para el Washington Post, y Presidente da Semana, de Rodrigo Vizeu para Folha de São Paulo."
          }
        },
        press: {
          heading: "Prensa y columnas",
          description: "Columnas de opinión, artículos y entrevistas en medios gráficos y digitales.",
          typeColumn: "Columna",
          typeArticle: "Artículo",
          typeInterview: "Entrevista",
          laNacionTopic: "Historia y política"
        },
        other: {
          heading: "Otras participaciones",
          description: "Entrevistas, documentales y otras participaciones audiovisuales.",
          comingSoon: "Sección en preparación."
        }
      },

      // Página /publicaciones/. Títulos de libros, artículos y
      // capítulos van directo en js/publications-data.js (no se
      // traducen): acá solo viven encabezados, etiquetas y la
      // descripción del libro.
      publicationsPage: {
        heroTitle: "Publicaciones",
        heroDesc: "Libros, artículos e investigaciones sobre historia, memoria y los usos políticos del pasado.",
        books: {
          heading: "Libros",
          eyebrow: "Libro",
          cristina: {
            description: "Basado en su tesis doctoral, el libro estudia cómo Cristina Fernández de Kirchner utilizó distintas interpretaciones del pasado para construir identidad política, legitimar su gobierno y estructurar sus conflictos con la oposición."
          }
        },
        journalArticles: {
          heading: "Artículos académicos"
        },
        bookChapters: {
          heading: "Capítulos de libro",
          tag: "Capítulo",
          inLabel: "En",
          coAuthorLabel: "Coautora",
          editorLabel: "Editor",
          compilersLabel: "Compiladores"
        },
        readCta: "Leer artículo →",
        noscript: "Activá JavaScript para ver el archivo completo de publicaciones."
      },

      // Página /sobre-mi/. Única página del sitio en primera persona
      // — el resto mantiene presentación institucional. Nombres de
      // instituciones, departamentos y el título de la tesis no se
      // traducen (misma política que role-org en el resto del sitio).
      aboutPage: {
        heroTitle: "Sobre mí",
        heroLead: "Soy historiadora. Mi trabajo se desarrolla entre la investigación, la docencia y la comunicación pública.",
        heroImageAlt: "Retrato de Camila Perochena",
        bio: {
          p1: "Mi trabajo gira en torno a una pregunta que atraviesa tanto mi investigación como mi participación en la esfera pública: ¿qué significa usar la historia para entender el presente?",
          p2: "Investigo los usos políticos del pasado, la memoria y las formas en que distintos actores construyen, disputan y movilizan relatos históricos. Mi trabajo se ha concentrado especialmente en América Latina, desde las conmemoraciones y los liderazgos políticos hasta los modos en que las nuevas derechas recurren a la historia.",
          p3: "Al mismo tiempo, siempre entendí que el conocimiento histórico no debía quedar limitado al ámbito académico. Por eso mi trayectoria combina investigación y docencia con proyectos de comunicación pública en televisión, streaming, podcasts y prensa. En todos esos espacios busco acercar las herramientas del pensamiento histórico a públicos más amplios sin renunciar a la complejidad."
        },
        principle: {
          line1: "Comprender sin simplificar,",
          line2: "explicar sin moralizar,",
          line3: "comunicar sin trivializar."
        },
        dimensions: {
          research: {
            heading: "Investigación",
            body: "Mi investigación se inscribe en la historia política e intelectual contemporánea, con especial interés en los usos públicos del pasado en América Latina. Estudio cómo gobiernos y actores políticos recurren a la historia para construir legitimidades, identidades y sentidos colectivos, y cómo esas operaciones transforman la manera en que el pasado es narrado en el presente."
          },
          teaching: {
            heading: "Docencia",
            body: "La docencia es otra parte central de mi práctica como historiadora. En la Universidad Torcuato Di Tella enseño historia y participo en la formación de estudiantes de grado y posgrado. Me interesa que la universidad sea un espacio para adquirir herramientas que permitan pensar históricamente el presente, antes que buscar en el pasado respuestas inmediatas."
          },
          publicComm: {
            heading: "Comunicación pública",
            body: "Para mí, la divulgación no es una etapa posterior a la investigación, sino parte del trabajo historiográfico. Trabajar con públicos y formatos diversos obliga a encontrar nuevas formas de argumentar, formular preguntas y hacer circular el conocimiento sin reducirlo a analogías fáciles o lecciones morales.",
            mediaCta: "Ver trabajo en medios →"
          }
        },
        practice: {
          heading: "Una práctica de comprensión",
          p1: "No entiendo la historia como un repertorio de ejemplos del que extraer respuestas inmediatas para el presente. Comprender el pasado exige reconstruir contextos, atender a la diversidad de actores, trabajar críticamente con las fuentes y reconocer la contingencia.",
          p2: "La historia no ofrece lecciones simples ni respuestas unívocas. Su potencia está justamente en ayudarnos a pensar la complejidad y también a reconocer qué hay de nuevo en nuestro propio presente."
        },
        education: {
          heading: "Formación",
          thesisLabel: "Tesis:",
          phd: {
            degree: "Doctorado en Historia"
          },
          masters: {
            degree: "Maestría en Ciencia Política"
          },
          teachingDegree: {
            degree: "Profesorado de Historia"
          }
        },
        current: {
          heading: "Actualmente",
          role1: "Profesora investigadora",
          role2: "Directora de la Maestría y el Doctorado en Historia"
        },
        recognitions: {
          items: {
            scientistsCount: "Científicas que cuentan / CONICET + Embajada de Francia",
            canaveseAward: "Premio Alfredo Canavese a la excelencia docente / Universidad Torcuato Di Tella",
            bestAverage: "Mejor promedio académico de la carrera de Historia / Universidad Nacional de Rosario + Academia Nacional de la Historia"
          }
        },
        cv: {
          heading: "Trayectoria completa",
          body: "Para consultar publicaciones, becas, conferencias y experiencia profesional en detalle:",
          label: "Descargar CV",
          es: "CV / Español",
          en: "CV / English",
          pending: "Se habilita al incorporar el archivo."
        }
      },
      contactPage: {
        heroTitle: "Contacto",
        social: {
          heading: "Redes"
        }
      }
    },

    en: {
      pages: {
        home: {
          title: "Camila Perochena / Home",
          description:
            "Camila Perochena, historian. Research, teaching, publications and media appearances on recent Argentine history."
        },
        media: {
          title: "Camila Perochena / Media",
          description:
            "Columns, interviews, podcasts and audiovisual appearances by historian Camila Perochena, including her column on Odisea Argentina."
        },
        publications: {
          title: "Camila Perochena / Publications",
          description:
            "Books, academic articles and book chapters by historian Camila Perochena on history, memory and the political uses of the past."
        },
        about: {
          title: "Camila Perochena / About",
          description:
            "Argentine historian. Research, teaching and public communication on the political uses of the past, memory and recent history."
        },
        contact: {
          title: "Camila Perochena / Contact",
          description:
            "Professional contact for historian Camila Perochena: conferences, press pieces, academic activities and other inquiries."
        }
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
        imageAlt: "Portrait of Camila Perochena"
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
        viewAllCta: "View all publications →",
        noscript: "Enable JavaScript to see the featured articles."
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
      },

      mediaPage: {
        heroTitle: "Media",
        heroDesc: "Columns, interviews, podcasts and audiovisual appearances.",
        odisea: {
          description:
            "Camila appears regularly on Odisea Argentina with a column that examines contemporary political, social and economic issues from a historical perspective.",
          watchOnYoutube: "Watch on YouTube"
        },
        olga: {
          heading: "OLGA",
          description: "Since 2024, Camila has contributed periodic history columns to OLGA.",
          comingSoon: "A selection of columns is being prepared."
        },
        podcasts: {
          heading: "Podcasts",
          listenCta: "Listen →",
          historiar: {
            role: "Co-host and co-producer",
            description: "Welcome to the podcast of ASAIH, the Asociación Argentina de Investigadores en Historia.\nA podcast of interviews with historians on Argentine, Latin American and world history.\nA journey through the past to think about the present."
          },
          primaveraCero: {
            role: "Producer and host",
            description: "Primavera Cero traces, year by year, Argentina's return to democracy between 1982 and 1989, through the voices of the people who lived it.\nHosted by historians Camila Perochena and Martín Marimón, each episode focuses on one specific year of that period."
          },
          hayQuePasarElInvierno: {
            description: "Over a fortnight of episodes, we trace how the country became part of the international market, starting with wool, and follow the road to the present through banking crises, defaults, fixed and floating exchange rates, partial industrialization drives, growth cut short, the 1-to-1 peg, and the corralito and corralón."
          },
          laBandaPresidencial: {
            description: "La banda presidencial is a podcast hosted by Camila Perochena, historian and professor at Universidad Torcuato Di Tella, and Santiago Rodríguez Rey, political scientist and political communication specialist, taking a weekly look back at every Argentine president, from Bernardino Rivadavia to Mauricio Macri, in the spirit of Presidential, by Lillian Cunningham for The Washington Post, and Presidente da Semana, by Rodrigo Vizeu for Folha de São Paulo."
          }
        },
        press: {
          heading: "Press and columns",
          description: "Opinion columns, articles and interviews in print and digital media.",
          typeColumn: "Column",
          typeArticle: "Article",
          typeInterview: "Interview",
          laNacionTopic: "History and politics"
        },
        other: {
          heading: "Other appearances",
          description: "Interviews, documentaries and other audiovisual appearances.",
          comingSoon: "Section in preparation."
        }
      },

      publicationsPage: {
        heroTitle: "Publications",
        heroDesc: "Books, articles and research on history, memory and the political uses of the past.",
        books: {
          heading: "Books",
          eyebrow: "Book",
          cristina: {
            description: "Drawing on her doctoral dissertation, the book examines how Cristina Fernández de Kirchner used different interpretations of the past to build political identity, legitimize her government and frame her conflicts with the opposition."
          }
        },
        journalArticles: {
          heading: "Academic articles"
        },
        bookChapters: {
          heading: "Book chapters",
          tag: "Chapter",
          inLabel: "In",
          coAuthorLabel: "Co-author",
          editorLabel: "Editor",
          compilersLabel: "Edited by"
        },
        readCta: "Read article →",
        noscript: "Enable JavaScript to see the full archive of publications."
      },

      aboutPage: {
        heroTitle: "About",
        heroLead: "I am a historian. My work spans research, teaching and public communication.",
        heroImageAlt: "Portrait of Camila Perochena",
        bio: {
          p1: "My work revolves around a question that runs through both my academic research and my engagement in the public sphere: what does it mean to use history to understand the present?",
          p2: "I study the political uses of the past, memory, and the ways in which different actors construct, dispute and mobilize historical narratives. My work has focused particularly on Latin America, from commemorations and political leadership to the ways in which contemporary right-wing movements make use of history.",
          p3: "At the same time, I have always believed that historical knowledge should not remain confined to academia. My career therefore combines research and teaching with public history projects across television, streaming, podcasts and the press. Across these formats, I aim to make the tools of historical thinking available to broader audiences without sacrificing complexity."
        },
        principle: {
          line1: "Understand without oversimplifying,",
          line2: "explain without moralizing,",
          line3: "communicate without trivializing."
        },
        dimensions: {
          research: {
            heading: "Research",
            body: "My research is situated within contemporary political and intellectual history, with a particular interest in the public uses of the past in Latin America. I study how governments and political actors turn to history to construct legitimacy, identities and collective meanings, and how these operations reshape the ways the past is narrated in the present."
          },
          teaching: {
            heading: "Teaching",
            body: "Teaching is another central part of my work as a historian. At Universidad Torcuato Di Tella, I teach history and work with undergraduate and graduate students. I see the university as a space for developing the tools to think historically about the present, rather than searching the past for immediate answers."
          },
          publicComm: {
            heading: "Public communication",
            body: "For me, public communication is not something that comes after research; it is part of historical practice itself. Working across different audiences and formats requires finding new ways to argue, formulate questions and circulate knowledge without reducing history to easy analogies or moral lessons.",
            mediaCta: "View media work →"
          }
        },
        practice: {
          heading: "A practice of understanding",
          p1: "I do not understand history as a repertoire of examples from which to extract immediate answers for the present. Understanding the past requires reconstructing contexts, attending to a diversity of actors, working critically with sources and recognizing contingency.",
          p2: "History does not offer simple lessons or unequivocal answers. Its power lies precisely in helping us think through complexity, and in allowing us to recognize what is genuinely new about our own present."
        },
        education: {
          heading: "Education",
          thesisLabel: "Thesis:",
          phd: {
            degree: "PhD in History"
          },
          masters: {
            degree: "Master's in Political Science"
          },
          teachingDegree: {
            degree: "Teaching Degree in History"
          }
        },
        current: {
          heading: "Currently",
          role1: "Research Professor",
          role2: "Director of the Master's and PhD Programs in History"
        },
        recognitions: {
          items: {
            scientistsCount: "Científicas que cuentan / CONICET + Embajada de Francia",
            canaveseAward: "Premio Alfredo Canavese a la excelencia docente / Universidad Torcuato Di Tella",
            bestAverage: "Best academic average, History program / Universidad Nacional de Rosario + Academia Nacional de la Historia"
          }
        },
        cv: {
          heading: "Full CV",
          body: "For publications, fellowships, conferences and professional experience in detail:",
          label: "Download CV",
          es: "CV / Español",
          en: "CV / English",
          pending: "Enabled once the file is added."
        }
      },
      contactPage: {
        heroTitle: "Contact",
        social: {
          heading: "Social"
        }
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

    // Cada página declara su identidad con data-page="home" | "media"
    // en <html> (home es el default para no romper páginas viejas
    // que todavía no tengan el atributo).
    var page = document.documentElement.getAttribute("data-page") || "home";
    document.title = t("pages." + page + ".title");
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", t("pages." + page + ".description"));

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
