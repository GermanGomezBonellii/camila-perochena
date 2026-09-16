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
     date: fecha de emisión si se confirma (formato libre, ej.
       "Marzo 2026"). Dejar "" si todavía no está confirmada —
       en ese caso se muestra "Fecha a confirmar" en vez de
       inventar un dato.

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

})();
