/* Adds the optional book subtitle to the existing Admin editor without
   changing its visual system. The main editor serializes FormData, so the
   field is handled by the ordinary book create/update flow. */
(() => {
  "use strict";

  const fields = document.getElementById("fields");
  const form = document.getElementById("entry-form");
  if (!fields || !form) return;

  function addSubtitleField() {
    const title = fields.querySelector('input[name="title"]');
    const year = fields.querySelector('input[name="year"]');
    if (!title || !year || fields.querySelector('input[name="subtitle"]')) return;

    const label = document.createElement("label");
    label.className = "wide";
    label.textContent = "Subtítulo";

    const input = document.createElement("input");
    input.name = "subtitle";
    input.type = "text";
    input.autocomplete = "off";
    label.appendChild(input);
    title.closest("label").insertAdjacentElement("afterend", label);

    const id = form.elements.id?.value;
    if (!id) return;

    // Keep the field out of FormData until its existing value is available;
    // saving another edit before that point therefore cannot erase a subtitle.
    input.disabled = true;
    fetch(`/api/admin/books/${encodeURIComponent(id)}`, { credentials: "same-origin" })
      .then(response => response.ok ? response.json() : null)
      .then(book => {
        if (book) input.value = book.subtitle || "";
      })
      .finally(() => { input.disabled = false; });
  }

  new MutationObserver(() => queueMicrotask(addSubtitleField))
    .observe(fields, { childList: true });
})();
