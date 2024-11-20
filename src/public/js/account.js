import { titlesManager } from "./titlesmanager.js";

document.addEventListener("DOMContentLoaded", async function () {
  try{
    const response = await fetch("/get-user-favourites");
    if (!response.ok) {
      // Unsure how this can happen as of yet, possible server crash or timeout
      console.log("Issue getting user favourites");
    }

    const data = await response.json();

    if (data.success) {
      // Update the titles container with the data that we just fetched
      // If we did get 0 favourites, the container will be handled within the subfunction
      titlesManager.updateTitlesContainerWithData(true, false, data.favouriteTitles, "account-titles-container");
    } else {
      // Error thats specific to the execution of the fetch query
      console.error("Error SQL-related or userID related for favourites data:", data);
    }
  } catch (error) {
    // Error that is related to the fetch request itself
    console.error('Error fetching user favourites data:', error);
  }
});
