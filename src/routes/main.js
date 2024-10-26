// APIs & Modules
const BOM_API = require("../apimodules/BOM");
const COUNTRY_MODULE = require("../jsmodules/countries");
const WORLD_GEO_JSON_MODULE = require("../jsmodules/worldjson/worldgeojson")
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
      const loadingMessage = ["WARMING UP THE JETS", "ENTERING THE DANGERZONE", "BOARDING THE DARKSTAR", "REACHING MACH 10", "HITTING 9 G'S"]

      res.render("landingpage.ejs", {boaData, quote, loadingMessage : loadingMessage[Math.floor(Math.random() * loadingMessage.length)]});

    });

    app.get("/api/fetch-data", async (req, res) => {
      try {

        // Perform the API calls to grab movies, choose a movie, source the images, get a color average and find the country grosses before
        // submitting to the front end
        const test1 = await BOM_API.searchForTitles("pirates of the caribbean");
        var testMovie = await BOM_API.createBoxOfficeBreakdownForTitle(test1[Math.floor(Math.random() * Math.min(test1.length, 3))].movieId);
        testMovie.setMovieImgSrc(await BOM_API.getTitlePosterImageSrc(testMovie.getTtID()));
        await testMovie.setAveragePixelColorFromPoster();
        var geo = {};
        if(testMovie.getCountryGrossesAsAlpha().length != 0){
          geo = WORLD_GEO_JSON_MODULE.setGeoDataToGrossesAlpha(testMovie.getCountryGrossesAsAlpha());
          console.log(geo);
        }
        console.log(testMovie);

        res.json({ success: true, message: "All API calls complete! GOOD TO GO!", boaData, movie : testMovie, geoData : geo });
      } catch (error) {
          console.error("Error in API calls:", error);
          res.status(500).json({ success: false, message: "API call failed" });
      }
    });

};