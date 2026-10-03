(function () {
  document.documentElement.classList.add("js");
  try {
    if (localStorage.getItem("camila-language") === "en") {
      document.documentElement.lang = "en";
    }
  } catch (error) {}
})();
