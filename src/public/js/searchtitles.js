import { titlesManager } from "./titlesmanager.js";

document.addEventListener("DOMContentLoaded", () => {
  // Grab the searchbar, searchmenubutton and the searchmenu itself
  const searchInput = document.getElementById("search-input");
  const searchMenuButton = document.getElementById("search-button");
  const searchMenuOverlay = document.getElementById("generic-overlay");

  // Add event listener to the search button
  if (searchMenuButton) {
    searchMenuButton.addEventListener("click", async () => {
      // If we're closing the menu, we can just fade it out, the next time it's called it will be cleaned up
      searchMenuOverlay.classList.add("fade-out");
      setTimeout(() => {
        searchMenuOverlay.addEventListener("transitionend", () => {
          if (searchMenuOverlay.classList.contains("fade-out")) {
            searchMenuOverlay.style.display = "none";
          }
        });
      }, 200);
    });
  }

  // Add event listener to the search bar input
  if (searchInput) {
    searchInput.addEventListener("keydown", async (event) => {
      // Check if the Enter key is pressed
      if (event.key === "Enter") {
        // Sanitize the text
        const searchText = searchInput.value.trim();
        searchInput.value = "";

        // Ensure it's not an empty string
        if (searchText.length > 0) {
          // Update the loading message
          document.getElementById("loading-message").innerText =
            "SEARCHING FOR TITLES";

          // Grab the loading overlay and make it visible
          const overlay = document.getElementById("loading-overlay");
          overlay.classList.remove("fade-out");
          overlay.style.display = "flex";

          try {
            const response = await fetch("/submit-title-search", {
              method: "POST",
              body: JSON.stringify({ searchText }),
              headers: new Headers({ "Content-Type": "application/json" }),
            });

            const data = await response.json();

            if (data.success) {
              // Show the search results overlay
              const container = document.getElementById("generic-overlay");
              container.style.display = "flex";

              // Update the titles container with the data that we just fetched
              titlesManager.updateTitlesContainerWithData(
                false,
                true,
                data.foundTitles,
                "titles-container"
              );

              // Update the title of the menu with the number of results and the query
              document.querySelector("#generic-overlay h1").textContent =
                `FOUND (${data.foundTitles.length}) RESULT` +
                (data.foundTitles.length > 1 ? `S` : ``) +
                ` FOR "${searchText}"`;

              // Update the search info text with a suggestion
              document.getElementById("search-info").textContent =
                data.foundTitles.length > 0
                  ? "DIDN'T FIND WHAT YOU WANTED? TRY A MORE PRECISE SPELLING"
                  : ":[ TRY A SHORTER SPELLING OR DIFFERENT NAME";

              // Commence fade-out after 200ms
              setTimeout(() => {
                // Fade out the loading overlay
                overlay.classList.add("fade-out");
                overlay.addEventListener("transitionend", () => {
                  // Once the loading overlay has faded we can fade in the search results menu
                  overlay.style.display = "none";
                  searchMenuOverlay.style.display = "flex";
                  searchMenuOverlay.classList.remove("fade-out");
                });
              }, 200);
            } else {
              console.error("Error fetching API data:", data);
            }
          } catch (error) {
            console.error("Error during fetch:", error);
          }
        }
      }
    });
  } else {
    console.error("Search input element not found!");
  }
});
