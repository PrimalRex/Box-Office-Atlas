// Function to update the opacity of each marker based on distance from the center of the map
function updateMarkerOpacity() {
  // Really unlikely but if we're trying to execute this twice in the same frame we should stop the frame
  let animationFrameId;
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  animationFrameId = requestAnimationFrame(() => {
    const center = map.getCenter();
    // Scale the threshold by the zoom level - if we don't do this then at close levels the markers will be too close together and
    // too close to the borders of the screen which is not ideal for visibility
    const visibilityThreshold = 5000000 / (map.getZoom() + 0);
    //console.log((visibilityThreshold));

    for (let i = 0; i < markers.length; i++) {
      const markerLngLat = markers[i].getLngLat();
      const distance = markerLngLat.distanceTo(center);

      if (distance < visibilityThreshold) {
        markers[i].getElement().classList.add("visible");
      } else {
        markers[i].getElement().classList.remove("visible");
      }
    }
  });
}

// Takes a data object and updates the landing page with the movie data
function updateLandingPageWithMovieData(data) {
  // Movie Specific color to be used with the map & any other CSS
  var color = data.movie.movieImgColor;

  // Update title and release info
  document.getElementById("movie-title").innerText =
    data.movie.title.toUpperCase();
  document.querySelector("#movie-subbox").innerText = `${
    data.movie.movieDetails.earliestReleaseDate || "TBC"
  } // ${data.movie.movieDetails.runningTime || "TBC"} // ${
    data.movie.movieDetails.mpaa || "NOT RATED YET"
  }`;

  // Update movie poster image
  document.getElementById("movie-poster").src = data.movie.movieImgSrc;

  // Update movie summary
  document.getElementById("movie-summary").innerText = data.movie.movieSummary;

  // Update distributor and genre
  document.getElementById("movie-distributor").innerText =
    data.movie.movieDetails.distributor || "UNKNOWN";
  document.getElementById("movie-genre").innerText =
    data.movie.movieDetails.genre || "UNKNOWN";

  // Gray out the :: elements on the movie info table
  document.querySelector("#movie-info-table td:nth-child(2)").style.color =
    "hsl(240, 4%, 20%)";
  document.querySelector(
    "#movie-info-table tr:nth-child(2) td:nth-child(2)"
  ).style.color = "hsl(240, 4%, 20%)";

  // Update the distr and genres with the movie color - currently not used because I dont think it works
  //document.querySelector('#movie-info-table td:nth-child(3)').style.color = color;
  //document.querySelector('#movie-info-table tr:nth-child(2) td:nth-child(3)').style.color = color;

  // Update the gross figures with the movie color
  document.querySelector("#grosses-table tr:nth-child(2)").style.color = color;
  document.querySelector("#grosses-table tr:nth-child(4)").style.color = color;

  // Update grosses table
  document.querySelector(
    "#grosses-table th:nth-child(1)"
  ).innerText = `DOMESTIC GROSS ${
    data.movie.movieFinancials.category == 2 ? "*" : ""
  }`;
  document.querySelector(
    "#grosses-table th:nth-child(2)"
  ).innerText = `INTERNATIONAL GROSS ${
    data.movie.movieFinancials.category == 2 ? "*" : ""
  }`;
  document.querySelector("#grosses-table td:nth-child(1) strong").innerText =
    data.movie.movieFinancials.domesticGross;
  document.querySelector("#grosses-table td:nth-child(2) strong").innerText =
    data.movie.movieFinancials.internationalGross;
  document.querySelector(
    '#grosses-table th[colspan="2"]'
  ).innerText = `WORLDWIDE TOTAL ${
    data.movie.movieFinancials.category == 2 ? " *(ALL RELEASES)" : ""
  }`;
  document.querySelector('#grosses-table td[colspan="2"] strong').innerText =
    data.movie.movieFinancials.worldwideGross;

  // Cache the geodata for later use ?
  const geoData = data.geoData;

  // Whether or not to use a heatmap color scheme (Greener = higher gross, Redder = lower gross)
  const heatmap = false;

  // Iterate through the geoData and add a source and layer for each country
  for (let i = 0; i < geoData.length; i++) {
    const data = geoData[i].geoData;
    const alpha = parseFloat(geoData[i].countryGrossAlpha);
    const sourceId = "country" + i.toString();
    const fillLayerId = sourceId + "_fill";

    // If we're using a heatmap, we'll use a gradient from green to red and adjust the alpha value based on gross
    if (heatmap) {
      const r = Math.round(255 + (0 - 255) * alpha);
      const g = Math.round(0 + (255 - 0) * alpha);
      const b = 0;
      color = `rgb(${r}, ${g}, ${b})`;
    }

    map.addSource(sourceId, {
      type: "geojson",
      data: data,
      tolerance: 0.5,
      buffer: 0,
    });

    // Add a fill layer for the country outline
    map.addLayer({
      id: fillLayerId,
      type: "fill",
      source: sourceId,
      layout: {},
      paint: {
        "fill-color": color,
        "fill-emissive-strength": alpha,
        "fill-opacity": alpha,
      },
    });

    const marker = new mapboxgl.Marker({
      color: "hsl(240, 20%, 4%)",
      clickTolerance: 50,
    });

    // Set the marker's position and add it to the map
    marker.setLngLat(geoData[i].coords);
    marker.addTo(map);
    marker.getElement().classList.add("fade-marker");

    // Add country name and gross info to the marker
    const countryFinancial = document.createElement("div");
    countryFinancial.innerText =
      geoData[i].countryGross +
      " // " +
      geoData[i].countryGrossPercentage +
      "%";
    countryFinancial.id = "marker-country-financial";
    marker.getElement().appendChild(countryFinancial);

    const countryName = document.createElement("div");
    countryName.innerText = geoData[i].country;
    countryName.id = "marker-country";
    marker.getElement().appendChild(countryName);

    // Add event listener to fly to the country when the marker is clicked
    marker.getElement().addEventListener("click", () => {
      map.flyTo({
        center: geoData[i].coords,
        zoom: 4,
        speed: 1.2,
        curve: 1,
      });
    });

    // Add event listeners to show/hide country name & gross info on hover
    marker.getElement().addEventListener("mouseenter", () => {
      marker
        .getElement()
        .querySelector("#marker-country-financial")
        .classList.add("visible");
      marker
        .getElement()
        .querySelector("#marker-country")
        .classList.add("visible");

      // Only feasible solution to overlapping - making the hovered element a hugely higher z-index
      // Other solutions can include items being reorderd in the DOM but will not be nice for performance
      marker.getElement().style.zIndex = 9998;
    });
    marker.getElement().addEventListener("mouseleave", () => {
      marker
        .getElement()
        .querySelector("#marker-country-financial")
        .classList.remove("visible");
      marker
        .getElement()
        .querySelector("#marker-country")
        .classList.remove("visible");
      marker.getElement().style.zIndex = 1;
    });

    markers.push(marker);
  }
}

function clearMarkersAndLayers(markers, map) {
  markers.forEach((marker) => marker.remove());
  markers = [];
  // Remove all layers
  const mapStyle = map.getStyle();
  if (mapStyle && mapStyle.layers) {
    mapStyle.layers.forEach((layer) => {
      if (map.getLayer(layer.id)) {
        map.removeLayer(layer.id);
      }
    });
  }
  // Remove all sources
  if (mapStyle && mapStyle.sources) {
    Object.keys(mapStyle.sources).forEach((sourceId) => {
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
    });
  }
}

// Function to update the text of the save button based on the current state
function updateTitleSavedText(state) {
  const savedMovie = document.getElementById("save-movie-state");
  savedMovie.textContent = state ? "UNFAVOURITE" : "SAVE TO FAVOURITES";
}

// Function to update the frontend with the saved-state of the selected title
async function getTitleSavedState(ttID) {
  const response = await fetch("/get-save-movie-state", {
    method: "POST",
    body: JSON.stringify({ ttID }),
    headers: new Headers({ "Content-Type": "application/json" }),
  });
  const data = await response.json();
  if (data.success) {
    //console.log(data);
    updateTitleSavedText(data.state);
  } else {
    console.error("Error fetching saved state:", data);
  }
}

// Function to update the backend with the flipped current state of the title
async function toggleTitleSavedState(ttID) {
  //console.log(ttID);
  const response = await fetch("/toggle-save-movie-state", {
    method: "POST",
    body: JSON.stringify({ ttID }),
    headers: new Headers({ "Content-Type": "application/json" }),
  });
  const data = await response.json();
  if (data.success) {
    //console.log(data);
    updateTitleSavedText(data.state);
  } else {
    console.error("Error updating saved state:", data);
  }
}
