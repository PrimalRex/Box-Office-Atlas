const BOM_API = require("../apimodules/BOM");

module.exports = function (app, boaData) {
    // Handle our routes
    app.get("/", async (req, res) => {
        // Saving UserID to Session
      if (req.session && req.session.userId) {
        //forumData.forumUsername = req.session.forumUsername;
      }

      // Test out the BOM API
      const test1 = await BOM_API.searchForTitles("dune part two");
      console.log(test1);
      console.log(await BOM_API.getBoxOfficeBreakdown(test1[0].movieId));
      const test2= await BOM_API.searchForTitles("jurassic");
      console.log(test2);
      console.log(await BOM_API.getBoxOfficeBreakdown(test2[0].movieId));
      console.log(await BOM_API.getBoxOfficeBreakdown(test2[1].movieId));
      res.render("landingpage.ejs", boaData);
    });

};