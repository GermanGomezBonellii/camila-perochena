/* ============================================================
   PUBLICATIONS-DATA.JS — archivo de datos de /publicaciones/

   Publicaciones = libros + producción académica (libros, artículos,
   capítulos de libro). Prensa, columnas y entrevistas NO viven acá:
   ver js/media-data.js (CamilaMediaData.press), sección "Prensa y
   columnas" dentro de Medios.

   Separado de js/publications.js a propósito: para sumar un libro,
   artículo o capítulo nuevo, alcanza con agregar un objeto al array
   correspondiente. No hace falta tocar el HTML ni la lógica de
   render (js/publications.js), y Home reutiliza este mismo archivo
   para sus 3 artículos destacados (ver js/main.js).

   Fuente de todos los datos: CV de Camila Perochena. No se agregó
   ningún dato que no estuviera ahí — ver notas puntuales en cada
   bloque para los campos que todavía quedan pendientes de
   confirmar o completar (url, portada del segundo libro, etc.).

   ---- Formato común ----
   title / subtitle / inBook: títulos reales tal como fueron
     publicados. No se traducen (ver js/publications.js: se usan
     tal cual en ambos idiomas).
   month: 1-12, o null si el dato no está disponible. Se usa para
     formatear la fecha en el idioma activo (js/publications.js).
   sortValue: year + month/100 (o solo year si no hay mes). Permite
     ordenar de más reciente a más antiguo sin volver a escribir la
     lista a mano cada vez que se agrega algo.
   url: link público verificado. Dejar "" si todavía no hay uno
     confirmado — en ese caso js/publications.js no muestra ningún
     CTA (no se inventan links).

   ---- books ----
   { title, subtitle, year, publisher, cover, descKey, url }
     publisher: "Crítica" (Crítica, 2022) — confirmado contra el CV
       español ("Crítica Editorial") y una carta profesional de
       Camila que lo referencia como "Crítica, 2022"; se usa la
       forma corta "Crítica" en el sitio. El CV en inglés dice
       "Crística Editorial", que se trata como errata del documento
       y no se reproduce.
     cover: dejar sin "cover" si todavía no hay portada real — en
       ese caso js/publications.js muestra el placeholder sobrio de
       siempre (misma lógica que portadas de podcast en /medios/).

   ---- journalArticles ----
   { year, month, sortValue, title, publication, url, homeFeatured }
     homeFeatured: 1 | 2 | 3 en los tres artículos que Home muestra
       como destacados (ver js/main.js). No usar este campo para
       ningún otro artículo.

   ---- bookChapters ----
   { year, sortValue, title, coAuthor, inBook, editorRole,
     editorNames, editorNamesEn, publisher, url }
     editorRole: "editor" (una persona editora) o "compilers"
       (compiladores/as) — decide qué etiqueta se muestra
       (js/i18n.js: publicationsPage.bookChapters.editorLabel /
       compilersLabel).
     editorNames / editorNamesEn: mismo dato, solo cambia el
       conector entre nombres ("y" / "and") — los nombres en sí no
       se traducen.
   ============================================================ */

var CamilaPublicationsData = {

  books: [
    {
      title: "Cristina y la Historia",
      subtitle: "El kirchnerismo y sus batallas por el pasado",
      year: 2022,
      publisher: "Crítica",
      cover: "../img/cristina_y_la_historia.jpg",
      descKey: "publicationsPage.books.cristina.description",
      url: ""
    }
  ],

  journalArticles: [
    {
      year: 2026,
      month: 2,
      sortValue: 2026.02,
      title: "From Washington to Madrid: The Latin American New Right's Spin on History",
      publication: "Current History",
      url: "",
      homeFeatured: 1
    },
    {
      year: 2025,
      month: 6,
      sortValue: 2025.06,
      title: "La “historia audible”: podcasts históricos en la divulgación del conocimiento académico",
      publication: "Boletín del Instituto de Historia Argentina y Americana Dr. Emilio Ravignani",
      url: "",
      homeFeatured: 2
    },
    {
      year: 2024,
      month: 12,
      sortValue: 2024.12,
      title: "Memoria y usos del pasado en México durante la presidencia de Felipe Calderón",
      publication: "Secuencia",
      url: "",
      homeFeatured: 3
    },
    {
      year: 2024,
      month: 12,
      // Mismo mes que el artículo anterior (Secuencia): sortValue apenas
      // menor para conservar el orden en que figuran en el CV.
      sortValue: 2024.119,
      title: "La “fiesta” como instrumento pedagógico: la escenificación del pasado en las celebraciones Bicentenarias de 2010 en Argentina y México",
      publication: "Nuevo Mundo Mundos Nuevos",
      url: ""
    },
    {
      year: 2024,
      month: 9,
      sortValue: 2024.09,
      title: "Los usos políticos del siglo XIX en la reconstrucción de la democracia argentina (1983-2015)",
      publication: "Claves",
      url: ""
    },
    {
      year: 2020,
      month: 6,
      sortValue: 2020.06,
      title: "La historia en la política y las políticas de la historia. Batalla cultural y revisionismo histórico en las presidencias de Cristina Fernández de Kirchner (2007-2015)",
      publication: "Prohistoria",
      url: ""
    },
    {
      year: 2019,
      month: 12,
      sortValue: 2019.12,
      title: "Entre el «deber de memoria» y el uso político del olvido: México y Argentina frente al pasado reciente",
      publication: "Historia y Memoria",
      url: ""
    },
    {
      year: 2018,
      month: 7,
      sortValue: 2018.07,
      title: "Tiempo, historia y política. Una reflexión sobre las conmemoraciones bicentenarias en clave comparada",
      publication: "História da historiografía",
      url: ""
    },
    {
      year: 2016,
      month: 5,
      sortValue: 2016.05,
      title: "Una memoria incómoda. La guerra de Malvinas en los gobiernos kirchneristas (2003-2015)",
      publication: "Anuario de Historia Regional y de las Fronteras",
      url: ""
    },
    {
      year: 2015,
      month: 3,
      sortValue: 2015.03,
      title: "¿Qué recordar de 1910? Los centenarios en las celebraciones bicentenarias en Argentina y México",
      publication: "Cuadernos del sur",
      url: ""
    }
  ],

  bookChapters: [
    {
      year: 2024,
      sortValue: 2024,
      title: "Historias populistas: sus combates en Argentina y México",
      coAuthor: "Rebecca Villalobos",
      inBook: "Pasado Presente: Historia, memoria y política en América Latina (siglo XXI)",
      editorRole: "editor",
      editorNames: "Fabio Wasserman",
      editorNamesEn: "Fabio Wasserman",
      publisher: "Silex Ediciones",
      url: ""
    },
    {
      year: 2021,
      sortValue: 2021.2,
      title: "La crisis de 2001 como lugar de memoria",
      inBook: "Después del terremoto. El sistema político argentino a 20 años del 2001",
      editorRole: "compilers",
      editorNames: "Facundo Cruz y Gastón Alfaro",
      editorNamesEn: "Facundo Cruz and Gastón Alfaro",
      publisher: "China Editora",
      url: ""
    },
    {
      year: 2021,
      sortValue: 2021.1,
      title: "Menem y la historia: olvido y perdón",
      inBook: "¿Qué hacemos con Menem? Los noventa 20 años después",
      editorRole: "compilers",
      editorNames: "Pablo Touzon y Martín Rodríguez",
      editorNamesEn: "Pablo Touzon and Martín Rodríguez",
      publisher: "Siglo Veintiuno",
      url: ""
    }
  ],

};

window.CamilaPublicationsData = CamilaPublicationsData;

/* Prensa, columnas y entrevistas: ver js/media-data.js (CamilaMediaData.press),
   renderizadas en la sección "Prensa y columnas" de /medios/. */
