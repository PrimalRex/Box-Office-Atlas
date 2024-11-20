export const titlesManager = {
  // Function that takes an array of films from the DB and updates a compatible container list with them
  // in a nicer format, also takes 2 additional params to accomodate different types of containers
  updateTitlesContainerWithData: function (keepFirstElement, hideContainerOnEmpty, data, containerID) {
    const container = document.getElementById(containerID);
    // Clear existing content in the container except the 1st one as that redirects to home
    while (container.children.length > (keepFirstElement ? 1 : 0)) {
      container.removeChild(container.lastChild);
    }

    // Set container visibility based on whether we have any elements or not
    if (hideContainerOnEmpty && data.length === 0) {
      container.style.display = "none";
      return;
    }
    container.style.display = "flex";

    data.forEach((film) => {
      // Create title form element
      const form = document.createElement("form");
      form.setAttribute("id", "title-form");
      form.setAttribute("action", "/home");
      form.setAttribute("method", "get");

      // Create container
      const titleContainer = document.createElement("div");
      titleContainer.setAttribute("id", "title-container");

      // Create a button element to submit the form
      const button = document.createElement("button");
      button.setAttribute("type", "submit");
      button.setAttribute("name", "ttID");
      button.setAttribute("value", film.ttID);

      // Truncate the title length because the lengths can vary massively and don't
      // look nice on frontend preview
      // Also adding the release year to the title as padding for short title films
      const fullTitle = film.title + " (" + film.releaseYear + ")";
      const limit = 25;
      if (fullTitle.length > limit) {
        button.textContent = fullTitle.slice(0, limit - 3) + "...";
      } else {
        button.textContent = fullTitle;
      }

      // Assign the imageUrl
      const img = document.createElement("img");
      img.setAttribute("id", "movie-small-poster");
      img.setAttribute("src", film.imageUrl);
      img.setAttribute("alt", "Promo Poster");

      // Append button and img to container, container to form, form to container
      titleContainer.appendChild(button);
      titleContainer.appendChild(img);
      form.appendChild(titleContainer);
      container.appendChild(form);
    });
  },

  // Function to toggle visibility of the titles container
  toggleTitlesContainerVisibility: function (enable, containerID) {
    const container = document.getElementById(containerID);
    container.style.display = enable ? "block" : "none";
  },
};
