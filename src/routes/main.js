const BOM_API = require("../apimodules/BOM")
const COUNTRY_MODULE = require("../jsmodules/countries");
const LOTRQUOTES_API = require("../apimodules/LOTRquotes");

module.exports = function (app, boaData) {
    // Handle our routes
    app.get("/", async (req, res) => {
        // Saving UserID to Session
      if (req.session && req.session.userId) {
        //forumData.forumUsername = req.session.forumUsername;
      }

      const quote = await LOTRQUOTES_API.getQuote();
      //console.log(quote);

      const test1 = await BOM_API.searchForTitles("jurassic park");
      var testMovie = await BOM_API.createBoxOfficeBreakdownForTitle(test1[Math.floor(Math.random() * test1.length)].movieId);
      testMovie.setMovieImgSrc(await BOM_API.getTitlePosterImageSrc(testMovie.getTtID()));

      console.log(testMovie);
      res.render("landingpage.ejs", {boaData, quote, movie : testMovie});

    });

    app.get("/api/fetch-data", async (req, res) => {
      try {
        // Perform the API calls
        //console.log(COUNTRY_MODULE.getCountryCoords("Australia"));
  
        res.json({ success: true, message: "API calls complete" });
      } catch (error) {
          console.error("Error in API calls:", error);
          res.status(500).json({ success: false, message: "API call failed" });
      }
    });

};