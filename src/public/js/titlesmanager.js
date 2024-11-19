export const titlesManager = {
  updateTitlesContainerWithData: function (data, containerID) {
    const container = document.getElementById(containerID);
    // Clear existing content in the container except the 1st one as that redirects to home
    while (container.children.length > 1) {
      container.removeChild(container.lastChild);
    }
    data.forEach((film) => {
      // Create title form element
      const form = document.createElement("form");
      form.setAttribute("id", "title-form");
      form.setAttribute("action", "/home");
      form.setAttribute("method", "get");

      // Create container
      const titleContainer = document.createElement("div");
      titleContainer.setAttribute("id", "title-container");

      // Create a button element
      const button = document.createElement("button");
      button.setAttribute("type", "submit");
      button.setAttribute("name", "ttID");
      button.setAttribute("value", film.ttID);
      // Truncate the title length because the lengths can vary massively and don't
      // look nice on frontend preview
      if (film.title.length > 20) {
        button.textContent = film.title.slice(0, 20 - 3) + "...";
      } else {
        button.textContent = film.title;
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
};
