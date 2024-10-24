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

      // Test out the BOM API
      //const test1 = await BOM_API.searchForTitles("dune part two");
      //console.log(test1);
      //var dune2 = await BOM_API.createBoxOfficeBreakdownForTitle(test1[0].movieId);
      //dune2.setMovieImgSrc(await BOM_API.getTitlePosterImageSrc(dune2.getTtID()));
      //console.log(dune2);
      //console.log(dune2.getLowestGrossingCountry());
      //console.log(dune2.getHighestGrossingCountry());

      //const test2= await BOM_API.searchForTitles("jurassic");
      //console.log(test2);
      //console.log(await BOM_API.createBoxOfficeBreakdownForTitle(test2[0].movieId));
      //console.log(await BOM_API.createBoxOfficeBreakdownForTitle(test2[1].movieId));
      //console.log(await BOM_API.getTitlePosterImageSrc(test2[1].movieId));
      //console.log("-------------------");
      //console.log(await LOTRQUOTES_API.getQuote());
      //console.log(COUNTRY_MODULE.getCountryCoords("Australia"));

      const quote = await LOTRQUOTES_API.getQuote();
      //console.log(quote);
      if (quote.quote == undefined) {
        quote.quote = "The API is rate limited, please try again later";
        quote.quoteAuthor = "- Unknown";
      }
      res.render("landingpage.ejs", {boaData, quote});

    });

    app.get("/api/fetch-data", async (req, res) => {
      try {
        // Perform the API calls
        const test1 = await BOM_API.searchForTitles("dune part two");
        var dune2 = await BOM_API.createBoxOfficeBreakdownForTitle(test1[0].movieId);
        dune2.setMovieImgSrc(await BOM_API.getTitlePosterImageSrc(dune2.getTtID()));
  
        console.log(dune2);
        console.log("-------------------");
        console.log(COUNTRY_MODULE.getCountryCoords("Australia"));
  
        res.json({ success: true, message: "API calls complete" });
      } catch (error) {
          console.error("Error in API calls:", error);
          res.status(500).json({ success: false, message: "API call failed" });
      }
    });

};