/* ============================================================
   MEDIA-DATA.JS — archivo de datos de la página /medios/
   Separado de js/media.js a propósito: para sumar una columna de
   Odisea Argentina nueva, o un podcast nuevo, alcanza con agregar
   un objeto a uno de estos arrays. No hace falta tocar el HTML ni
   la lógica de render.

   odisea: mismo formato que MEDIA_ITEMS en js/main.js —
     { title, youtubeId, date, program }.
     youtubeId: ID de 11 caracteres del video en YouTube.
     date: fecha de emisión si se confirma. Dejar "" si no está
       confirmada — se muestra "Fecha a confirmar" en vez de
       inventar un dato.
     Los 6 videos de abajo son columnas reales de Camila Perochena
     en Odisea Argentina, verificadas de forma individual (título
     e ID de YouTube). Sus fechas de emisión no están confirmadas.
     Hay más columnas reales disponibles en la playlist de YouTube
     (https://youtube.com/playlist?list=PLWYpDY_TMICI) que todavía
     no se sumaron acá — agregarlas es solo sumar un objeto más.

   podcasts: { name, url, cover, roleKey, descKey }.
     name: nombre real del proyecto (no se traduce).
     url: enlace público oficial verificado (Spotify o Apple
       Podcasts). Dejar sin "url" si no hay un enlace verificado.
     cover: ruta a la portada cuadrada real (relativa a
       /medios/index.html, ej. "../img/podcast-historiar.jpg").
       Dejar sin "cover" si todavía no hay una portada real — en ese
       caso js/media.js muestra el placeholder sobrio de siempre en
       vez de inventar una imagen.
     roleKey / descKey: claves de js/i18n.js (mediaPage.podcasts.*)
       para el rol y la descripción, así se traducen solas al
       cambiar de idioma sin tocar este archivo.

   press: { type, outlet, title, topicKey, year, month, sortValue,
     startYear, startMonth, endYear, endMonth, url }
     Datos verificados en el CV de Camila Perochena. Nombres de
     medios y el título real del artículo no se traducen; el
     "tema" de la columna de La Nación no es un título publicado,
     así que se traduce solo (topicKey, ver js/i18n.js
     mediaPage.press.laNacionTopic).
     type: "column" | "article" | "interview" — decide la etiqueta
       que se muestra (js/i18n.js: mediaPage.press.typeColumn /
       typeArticle / typeInterview) y evita mostrar una entrevista
       como si fuera un texto escrito por Camila.
     title: solo en artículos/columnas con título publicado real.
     topicKey: solo en la columna de La Nación, que no tiene un
       título publicado sino un tema recurrente.
     year/month o startYear/startMonth + endYear/endMonth: fecha
       puntual o rango (columna de La Nación). sortValue ordena de
       más reciente a más antiguo (para el rango, se usa el mes de
       cierre).
     url: link público verificado. Dejar "" si todavía no hay uno
       confirmado — en ese caso js/media.js no muestra ningún link,
       solo el nombre del medio como texto (mismo criterio que en
       publicaciones: nunca un href roto o inventado).
   ============================================================ */

var CamilaMediaData = {
  odisea: [
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
    },
    {
      title: "Una historia de las vacaciones",
      youtubeId: "laJcDeqxzOQ",
      date: "",
      program: "Odisea Argentina"
    },
    {
      title: "Elecciones legislativas y su incidencia en la gobernabilidad",
      youtubeId: "fZtWPkzHKII",
      date: "",
      program: "Odisea Argentina"
    },
    {
      title: "La Argentina y una historia de cepos cambiarios",
      youtubeId: "brvUhyoNTbU",
      date: "",
      program: "Odisea Argentina"
    }
  ],

  podcasts: [
    {
      name: "HistoriAr",
      url: "https://open.spotify.com/show/6ZzcVyIlDzcz3YaXAb7KEg",
      cover: "../img/podcast-historiar.jpg",
      roleKey: "mediaPage.podcasts.historiar.role",
      descKey: "mediaPage.podcasts.historiar.description"
    },
    {
      name: "Primavera Cero",
      url: "https://open.spotify.com/show/6uyHGJfT4kgpcNZAv9wAUv",
      cover: "../img/podcast-primavera-cero.jpg",
      roleKey: "mediaPage.podcasts.primaveraCero.role",
      descKey: "mediaPage.podcasts.primaveraCero.description"
    },
    {
      name: "Hay que pasar el invierno",
      url: "https://open.spotify.com/show/1eXph4FqMC82dFek4zz5cW",
      cover: "../img/podcast-hay-que-pasar-el-invierno.jpg",
      descKey: "mediaPage.podcasts.hayQuePasarElInvierno.description"
    },
    {
      name: "La banda presidencial",
      url: "https://open.spotify.com/show/2Js8jTzuiQP0FkybFbsjcB",
      cover: "../img/podcast-la-banda-presidencial.jpg",
      descKey: "mediaPage.podcasts.laBandaPresidencial.description"
    }
  ],

  press: [
    {
      type: "interview",
      outlet: "Jot Down",
      year: 2024,
      month: 5,
      sortValue: 2024.05,
      url: ""
    },
    {
      type: "interview",
      outlet: "Clarín",
      year: 2024,
      month: 3,
      sortValue: 2024.03,
      url: ""
    },
    {
      type: "article",
      outlet: "Nueva Sociedad",
      title: "Los usos de la historia en la política argentina actual",
      year: 2023,
      month: 12,
      sortValue: 2023.12,
      url: ""
    },
    {
      type: "column",
      outlet: "La Nación",
      topicKey: "mediaPage.press.laNacionTopic",
      startYear: 2019,
      startMonth: 10,
      endYear: 2022,
      endMonth: 11,
      sortValue: 2022.11,
      url: ""
    },
    {
      type: "interview",
      outlet: "Maleva",
      year: 2020,
      month: 3,
      sortValue: 2020.03,
      url: ""
    }
  ]
};

window.CamilaMediaData = CamilaMediaData;
