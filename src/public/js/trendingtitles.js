import { titlesManager } from "./titlesmanager.js";

document.addEventListener("DOMContentLoaded", () => {
  const trendingPageButton = document.getElementById("trending");
  const searchInput = document.getElementById("trending-search-input");
  const trendingCloseButton = document.getElementById("trending-close-button");
  const trendingMenuOverlay = document.getElementById("trending-overlay");

  if (trendingPageButton) {
    trendingPageButton.addEventListener("click", async () => {
      // Fetch the trending titles and wait for the response
      const response = await fetch("/get-trending-titles");
      const data = await response.json();

      if (data.success) {
        // Update the loading message
        document.getElementById("loading-message").innerText =
          "PROBING THE DATABASE";

        // Grab the loading overlay and make it visible
        const overlay = document.getElementById("loading-overlay");
        overlay.classList.remove("fade-out");
        overlay.style.display = "flex";

        // Update the trending titles container with the data that we just fetched
        titlesManager.updateTitlesContainerWithData(
          false,
          true,
          data.foundTitles,
          "user-trending-titles-container"
        );
        setTimeout(() => {
          // Fade out the loading overlay and fade in the search results menu
          overlay.classList.add("fade-out");
          trendingMenuOverlay.style.display = "flex";
          setTimeout(() => {
            // Fade in the search results menu
            overlay.style.display = "none";
            trendingMenuOverlay.classList.remove("fade-out");
          }, 200);
        }, 200);
      } else {
        console.error("Error fetching search results:", data);
      }
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
            "PROBING FOR MATCHING TITLES";

          // Grab the loading overlay and make it visible
          const overlay = document.getElementById("loading-overlay");
          overlay.classList.remove("fade-out");
          overlay.style.display = "flex";

          try {
            const response = await fetch("/get-matching-titles", {
              method: "POST",
              body: JSON.stringify({ keyword: searchText }),
              headers: new Headers({ "Content-Type": "application/json" }),
            });

            const data = await response.json();

            if (data.success) {
              // Update the titles container with the data that we just fetched
              titlesManager.updateTitlesContainerWithData(
                false,
                true,
                data.foundTitles,
                "search-trending-titles-container"
              );

              // Commence fade-out after 200ms
              setTimeout(() => {
                // Fade out the loading overlay and ready the searchMenuOverlay
                overlay.classList.add("fade-out");
                setTimeout(() => {
                  // Fade in the search results menu and remove the loading overlay
                  overlay.style.display = "none";
                }, 200);
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

  if (trendingCloseButton) {
    trendingCloseButton.addEventListener("click", async () => {
      trendingMenuOverlay.classList.add("fade-out");
      setTimeout(() => {
        trendingMenuOverlay.addEventListener("transitionend", () => {
          if (trendingMenuOverlay.classList.contains("fade-out")) {
            trendingMenuOverlay.style.display = "none";
          }
        });
      }, 200);
    });
  }
});
