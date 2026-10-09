(function () {
  document.documentElement.classList.add("js");
  // En una carga directa de /#contacto guardamos la intención antes de que
  // el CMS complete la altura de la Home. main.js la resuelve al final.
  if (document.documentElement.dataset.page === "home" && window.location.hash === "#contacto") {
    document.documentElement.classList.add("contact-anchor-pending");
  }
  try {
    if (localStorage.getItem("camila-language") === "en") {
      document.documentElement.lang = "en";
    }
  } catch (error) {}
})();
