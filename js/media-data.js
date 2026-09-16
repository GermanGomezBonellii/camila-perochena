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
  ]
};

window.CamilaMediaData = CamilaMediaData;
