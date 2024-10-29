// APIs & Modules
const BOM_API = require("../apimodules/BOM");
const COUNTRY_MODULE = require("../jsmodules/countries");
const WORLD_GEO_JSON_MODULE = require("../jsmodules/worldjson/worldgeojson");
const LOTRQUOTES_API = require("../apimodules/LOTRquotes");

module.exports = function (app, boaData) {
  // Handle our routes
  app.get("/", async (req, res) => {
    // Saving UserID to Session
    if (req.session && req.session.userId) {
      //forumData.forumUsername = req.session.forumUsername;
    }

    // Queue up a quote from the LOTR API to show on the loading screen
    const quote = await LOTRQUOTES_API.getQuote();
    //console.log(quote);

    // Random loading messages
    const loadingMessages = [
      "WARMING UP THE JETS",
      "ENTERING THE DANGERZONE",
      "BOARDING THE DARKSTAR",
      "REACHING MACH 10",
      "HITTING 9 G'S",
      "ABSORBING ARCANE MYSTERIES",
      "BINDING THE POWER OF DOOM",
      "READING THE LATVERIAN CODEX",
      "CHANNELING DOOM'S WISDOM",
      "INVOKING THE WILL OF DOOM",
    ];

    const selectedLoadingMessage =
      loadingMessages[Math.floor(Math.random() * loadingMessages.length)];

    res.render("landingpage.ejs", {
      boaData,
      quote,
      loadingMessage: selectedLoadingMessage,
      loadingMessages,
    });
  });

  // When the user enters a title search query we will process it here
  app.post("/api/submit-title-search", async (req, res) => {
    try {
      // Access the query from the request body and ensure it's a valid length and does not contain any special HTML character
      const searchQuery = req.body.searchText;
      console.log("Received search query:", searchQuery);

      // Server-side validation to ensure the search query is not empty
      if(searchQuery.length < 1) {
        console.error("Invalid search query! Could be malicious?");
        res.status(500).json({ error: "Invalid search query! Could be malicious?" });
      }

      // Perform the API calls to grab movies, choose a movie, source the images, get a color average and find the country grosses
      console.time("BOM_API.searchForTitles");
      const searchResult = await BOM_API.searchForTitles(searchQuery);
      console.timeEnd("BOM_API.searchForTitles");
      // TODO HANDLE WHEN THERE ARE NO SEARCH RESULTS - CURRENTLY CRASHES THE SERVER AND LEAVES CLIENT IN LOADING SCREEN
      console.time("BOM_API.createBoxOfficeBreakdownForTitle");
      var firstMovieFromResult = await BOM_API.createBoxOfficeBreakdownForTitle(
        searchResult[0].movieId
      );
      console.timeEnd("BOM_API.createBoxOfficeBreakdownForTitle");
      // Get the poster image for the movie
      console.time("BOM_API.getTitlePosterImageSrc");
      firstMovieFromResult.setMovieImgSrc(
        await BOM_API.getTitlePosterImageSrc(firstMovieFromResult.getTtID())
      );
      console.timeEnd("BOM_API.getTitlePosterImageSrc");
      // Get the average color of the poster image
      await firstMovieFromResult.setAveragePixelColorFromPoster();
      var geo = {};
      if (firstMovieFromResult.getCountryGrossesAsAlpha().length != 0) {
        geo = await WORLD_GEO_JSON_MODULE.createGeoDataInfoFromAlpha(
          firstMovieFromResult.getCountryGrossesAsAlpha()
        );
      }
      
      // Return the data to the front end
      //console.log(firstMovieFromResult);
      res.json({
        success: true,
        message: "Search is clean & all API calls complete! GOOD TO GO!",
        boaData,
        movie: firstMovieFromResult,
        geoData: geo,
      });
    } catch (error) {
      console.error("Error processing search query:", error);
      res.status(500).json({ error: "An error occurred" });
    }
  });

  app.get("/api/fetch-data", async (req, res) => {
    try {
      // Perform the API calls to grab movies, choose a movie, source the images, get a color average and find the country grosses before
      // submitting to the front end

      res.json({
        success: true,
        message: "All API calls complete! GOOD TO GO!",
        boaData,
      });
    } catch (error) {
      console.error("Error in API calls:", error);
      res.status(500).json({ success: false, message: "API call failed" });
    }
  });
};
