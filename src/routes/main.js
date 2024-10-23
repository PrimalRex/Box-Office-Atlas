const BOM_API = require("../apimodules/BOM");

module.exports = function (app, boaData) {
    // Handle our routes
    app.get("/", async (req, res) => {
        // Saving UserID to Session
      if (req.session && req.session.userId) {
        //forumData.forumUsername = req.session.forumUsername;
      }

      // Test out the BOM API
      const test1 = await BOM_API.searchForTitles("Dune part two");
      console.log(test1);
      console.log(await BOM_API.getBoxOfficeBreakdown(test1[0].movieId));
      res.render("landingpage.ejs", boaData);
    });

};