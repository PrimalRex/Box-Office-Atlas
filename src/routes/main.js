// Packages
const bcrypt = require("bcrypt");
// APIs & Other Modules
const BOM_API = require("../apimodules/BOM");
const COUNTRY_MODULE = require("../jsmodules/countries");
const WORLD_GEO_JSON_MODULE = require("../jsmodules/worldjson/worldgeojson");
const LOTRQUOTES_API = require("../apimodules/LOTRquotes");

module.exports = function (app, boaData) {
  // Handle our routes
  app.get("/", async (req, res) => {
    // Check to see if we are logged in and if so we redirect back to the root which will redirect to home
    if (req.session && req.session.loggedIn) {
      res.redirect("/home");
    } else {
      res.redirect("/login");
    }
  });

  // Account page
  app.get("/account", async (req, res) => {
    if (!(req.session && req.session.loggedIn)) {
      res.redirect("/login");
    } else {
      //res.redirect("/login");
      res.render("account.ejs", { user: req.session.user });
    }
  });

  // Get the user's favourite movies
  app.get("/get-user-favourites", async (req, res) => {
    if (!(req.session && req.session.loggedIn)) {
      res.redirect("/login");
    } else {
      db.query(
        "CALL getUserIdByUsername(?)",
        [req.session.user],
        async function (err, result) {
          if (err) {
            console.log(err);
            return res.status(500).json({ error: "Error fetching user ID" });
          }
          if (result[0].length > 0) {
            // Call the stored procedure to get the saved state of the movie
            db.query(
              "CALL getUserFavouritesByUserId(?)",
              [result[0][0].userId],
              function (err, result) {
                if (err) {
                  console.log(err);
                }
                console.log("User Favourites result:", result);
                // We can get an undefined result so if thats the case we will just pass an empty array
                return res.json({
                  success: true,
                  favouriteTitles: result !== undefined ? result[0] : [],
                });
              }
            );
          } else {
            console.log("This is awkward... How do you not have a UserID?");
            res.redirect("/login");
          }
        }
      );
    }
  });

  // Get the most saved titles by all users from the database
  app.get("/get-trending-titles", async (req, res) => {
    if (!(req.session && req.session.loggedIn)) {
      res.redirect("/login");
    } else {
      db.query("CALL getMostSavedTitles()", async function (err, result) {
        if (err) {
          console.log(err);
          return res
            .status(500)
            .json({ error: "Error fetching trending titles" });
        }
        console.log("Trending Titles result:", result[0]);
        res.json({
          success: true,
          message: "DB query was complete! GOOD TO GO!",
          foundTitles: result[0],
        });
      });
    }
  });

  app.post("/get-matching-titles", async (req, res) => {
    if (!(req.session && req.session.loggedIn)) {
      res.redirect("/login");
    } else {
      console.log("Received request with keyword:", req.body.keyword);
      const keyword = req.sanitize(req.body.keyword);
      db.query(
        "CALL findMatchingTitles(?)",
        [keyword],
        async function (err, result) {
          if (err) {
            console.log(err);
            return res
              .status(500)
              .json({ error: "Error fetching matching titles" });
          }
          console.log("Matching Titles result:", result[0]);
          res.json({
            success: true,
            message: "DB query was complete! GOOD TO GO!",
            foundTitles: result[0],
          });
        }
      );
    }
  });

  // Handles the destruction of the session and redirects to the login page
  app.get("/logout", async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      }
      res.redirect("/login");
    });
  });

  // App about page
  app.get("/about", async (req, res) => {
    res.render("about.ejs");
  });

  // User registration
  app.get("/register", async (req, res) => {
    if (!(req.session && req.session.loggedIn)) {
      const message = req.query.message || "";
      const error = req.query.error || "";
      res.render("register.ejs", { message, error });
    } else {
      res.redirect("/home");
    }
  });

  app.post("/post-register", async (req, res) => {
    // Sanitize the inputs
    const user = req.sanitize(req.body.username);
    const pass = req.sanitize(req.body.password);
    const passSalt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(pass, passSalt);
    db.query(
      "CALL addUser(?, ?, ?)",
      [user, hashedPass, passSalt],
      async function (err, result) {
        if (err) {
          console.log(err);
          res.redirect("/register?error=Username is already in use!");
        } else {
          console.log(result);
          res.redirect("/login?message=Account created successfully!");
        }
      }
    );
  });

  // User login
  app.get("/login", async (req, res) => {
    if (!(req.session && req.session.loggedIn)) {
      const message = req.query.message || "";
      const error = req.query.error || "";
      res.render("login.ejs", { message, error });
    } else {
      res.redirect("/home");
    }
  });

  app.post("/post-login", async (req, res) => {
    // Sanitize the inputs
    const user = req.sanitize(req.body.username);
    const rawpass = req.sanitize(req.body.password);
    //console.log(user + pass);

    // Call the stored procedure to get the salt by username
    db.query(
      "CALL getpasswordSaltByUsername(?)",
      [user],
      async function (err, salt) {
        if (err || salt[0].length == 0) {
          // If we can't find a salt, meaning there is no user, then we redirect back to the login page
          console.log(err);
          res.redirect("/login?error=Invalid username or password!");
        } else {
          // Hash the user's entered password with the salt we found from the user
          const pass = await bcrypt.hash(rawpass, salt[0][0].passwordSalt);
          // Call the stored procedure to verify the user credentials
          db.query(
            "CALL verifyUserCredentials(?, ?)",
            [user, pass],
            async function (err, result) {
              if (err) {
                console.log(err);
                res.redirect("/login?error=Invalid username or password!");
              }
              //console.log(result);
              // If the result is not empty then we have a successful login
              if (result[0].length > 0) {
                // Set the session variables
                req.session.loggedIn = true;
                req.session.user = result[0][0].username;
                res.redirect("/home");
              } else {
                console.log("Failed Credentials");
                res.redirect("/login?error=Invalid username or password!");
              }
            }
          );
        }
      }
    );
  });

  // Home page / landing page
  app.get("/home", async (req, res) => {
    // Ensure we are logged in before we can access the home page
    if (!req.session || !req.session.loggedIn) {
      res.redirect("/login");
    } else {
      //If we have a ttID parameter, sanitise it first
      const ttID = req.sanitize(req.query.ttID)
        ? req.sanitize(req.query.ttID)
        : "home";

      // Queue up a quote from the LOTR API to show on the loading screen
      const quote = await LOTRQUOTES_API.getQuote();
      //console.log(quote);

      // Random loading messages
      const loadingMessages = [
        "WARMING UP THE JETS",
        "ENTERING THE DANGERZONE",
        "BOARDING THE DARKSTAR",
        "REACHING MACH 10",
        "HITTING ESCAPE VELOCITY",
        "ABSORBING ARCANE MYSTERIES",
        "BINDING THE POWER OF DOOM",
        "READING THE LATVERIAN CODEX",
        "INVOKING THE WILL OF DOOM",
      ];

      const selectedLoadingMessage =
        loadingMessages[Math.floor(Math.random() * loadingMessages.length)];

      res.render("landingpage.ejs", {
        boaData,
        quote,
        loadingMessage: selectedLoadingMessage,
        loadingMessages,
        ttID,
      });
    }
  });

  // When the user loads a film we need to know whether theyve saved it or not
  // Since this 'getting' request is independent from the 'toggling' one it can behave separately
  app.post("/get-save-movie-state", async (req, res) => {
    // Ensure we are logged in before we can access the home page
    if (!(req.session && req.session.loggedIn)) {
      return res.redirect("/login");
    } else {
      // Get the user ID from the session
      db.query(
        "CALL getUserIdByUsername(?)",
        [req.session.user],
        async function (err, result) {
          if (err) {
            console.log(err);
            return res.status(500).json({ error: "Error fetching user ID" });
          }
          if (result[0].length > 0) {
            // Call the stored procedure to get the saved state of the movie
            db.query(
              "CALL hasUserFavouritedTitle(?, ?)",
              [result[0][0].userId, req.sanitize(req.body.ttID)],
              function (err, result) {
                if (err) {
                  console.log(err);
                }
                console.log("Saved state result:", result);
                // Depending on whether we found it we assign the state
                return res.json({
                  success: true,
                  state: result[0].length,
                });
              }
            );
          } else {
            console.log("This is awkward... How do you not have a UserID?");
            res.redirect("/login");
          }
        }
      );
    }
  });

  // When the user clicks the save button on the movie page we will save the movie to the user's account
  app.post("/toggle-save-movie-state", async (req, res) => {
    // Ensure we are logged in before we can access the home page
    if (!(req.session && req.session.loggedIn)) {
      res.redirect("/login");
    } else {
      // Get the user ID from the session
      db.query(
        "CALL getUserIdByUsername(?)",
        [req.session.user],
        async function (err, result) {
          if (err) {
            console.log(err);
          }
          if (result[0].length > 0) {
            const userID = result[0][0].userId;
            try {
              // Create a server authorative object for the movie instead of passing an unreliable
              // set of data from the front end
              var movieBreakdown =
                await BOM_API.createBoxOfficeBreakdownForTitle(
                  req.sanitize(req.body.ttID)
                );
              const movieReleaseYear = movieBreakdown.getReleaseYear();
              const ImgSrc = await BOM_API.getTitlePosterImageSrc(
                movieBreakdown.getTtID()
              );

              // Call the stored procedure to toggle the user's favourite movie
              db.query(
                "CALL toggleUserFavourite(?, ?, ?, ?, ?)",
                [
                  userID,
                  movieBreakdown.getTtID(),
                  movieBreakdown.title.toUpperCase(),
                  ImgSrc,
                  movieReleaseYear,
                ],
                async function (err, result) {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log("Updated saved state:", result);
                    return res.json({
                      success: true,
                      state: result[0][0].state,
                      message: "Movie save state updated!",
                    });
                  }
                }
              );
            } catch (error) {
              console.error("Error updating saved state:", error);
              res.status(500).json({ error: "An error occurred" });
            }
          } else {
            console.log("This is awkward... How do you not have a UserID?");
            res.redirect("/login");
          }
        }
      );
    }
  });

  // When the page is loaded this request is sent alongside the ttID to get the movie data
  // Optionally we could pass the data found from the search query to save on repeat API calls
  app.post("/submit-ttID", async (req, res) => {
    if (!(req.session && req.session.loggedIn)) {
      res.status(500).json({ error: "An error occurred" });
    } else {
      try {
        var movieBreakdown = await BOM_API.createBoxOfficeBreakdownForTitle(
          req.sanitize(req.body.ttID)
        );
        // Get the poster image for the movie
        movieBreakdown.setMovieImgSrc(
          await BOM_API.getTitlePosterImageSrc(movieBreakdown.getTtID())
        );

        // Get the average color of the poster image
        await movieBreakdown.setAveragePixelColorFromPoster();
        var geo = {};
        if (movieBreakdown.getCountryGrossesAsAlpha().length != 0) {
          geo = await WORLD_GEO_JSON_MODULE.createGeoDataInfoFromAlpha(
            movieBreakdown.getCountryGrossesAsAlpha()
          );
        }
        console.log(geo);
        // Return the data to the front end
        res.json({
          success: true,
          message: "Search is clean & all API calls complete! GOOD TO GO!",
          boaData,
          movie: movieBreakdown,
          geoData: geo,
        });
      } catch (error) {
        console.error("Error processing ttID query:", error);
        res.status(500).json({ error: "An error occurred" });
      }
    }
  });

  // When the user enters a title search query we process the BOM API Search call
  app.post("/submit-title-search", async (req, res) => {
    if (!(req.session && req.session.loggedIn)) {
      res.status(500).json({ error: "An error occurred" });
    } else {
      try {
        // Use express sanitizer to clean up the search query for anything malicious
        const searchQuery = req.sanitize(req.body.searchText);
        console.log("Received search query:", searchQuery);

        // Server-side validation to ensure the search query is not empty
        if (!searchQuery || searchQuery.length < 1) {
          console.error("Invalid search query! Could be malicious?");
          return res
            .status(400)
            .json({ error: "Invalid search query! Could be malicious?" });
        }

        // Perform the API calls to grab movies, choose a movie, source the images, get a color average, and find the country grosses
        console.time("BOM_API.searchForTitles");
        const searchResult = await BOM_API.searchForTitles(searchQuery);
        console.timeEnd("BOM_API.searchForTitles");

        if (!searchResult || searchResult.length === 0) {
          return res.json({
            success: true,
            message:
              "Search is clean & all API calls complete! No titles found :( but...  GOOD TO GO!",
            foundTitles: [],
          });
        }

        console.time("Composing searchResults");

        // Since we are doing an async loop we need to promise a return of all the data
        const foundTitles = await Promise.all(
          searchResult.map(async (title) => {
            const movieData = await BOM_API.createBoxOfficeBreakdownForTitle(
              title.movieId
            );
            const imageUrl = await BOM_API.getTitlePosterImageSrc(
              movieData.getTtID()
            );

            return {
              imageUrl,
              releaseYear: movieData.getReleaseYear(),
              title: movieData.title.toUpperCase(),
              ttID: movieData.getTtID(),
            };
          })
        );

        console.timeEnd("Composing searchResults");

        // Return the data to the front end
        console.log(foundTitles);
        res.json({
          success: true,
          message: "Search is clean & all API calls complete! GOOD TO GO!",
          foundTitles,
        });
      } catch (error) {
        console.error("Error processing search query:", error);
        res.status(500).json({ error: "An error occurred" });
      }
    }
  });

  // When the Landing Page DOM is loaded we can fetch some data if needed (most likely like a random movie from the year as a suggestion)
  app.get("/fetch-landing-data", async (req, res) => {
    try {
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

  //////////////////////////////

  // BOA API PROVISION

  // This is the main route, it will tell users all the available endpoints and parameters
  app.get("/api/BOA", async (req, res) => {
    res.json({
      success: true,
      message: "Welcome to the BOA API, below are some available endpoints",
      endpoints: {
        "/api/BOA/findTitleIDs": {
          description: "Search for movie title IDs",
          parameters: {
            searchQuery:
              "Some text (with spaces) to find matching titles and their TTIDs",
          },
        },
        "/api/BOA/getTrendingTitles": {
          description: "Returns the most saved titles by all users",
          parameters: {
            count: "The number of trending titles to return",
          },
        },
        "/api/BOA/getMovieDetails": {
          description:
            "Returns a breakdown of financials, details, and metadata of a given ttID",
          parameters: {
            ttID: "Unique ID for a movie title, based on the IMDb ttID format",
          },
        },
        "/api/BOA/getMovieFinancials": {
          description: "Returns the box office financials of a given ttID",
          parameters: {
            ttID: "Unique ID for a movie title, based on the IMDb ttID format",
          },
        },
      },
    });
  });

  // Route to get the ttIDs of movies that might match the search query
  // EXAMPLE: /api/BOA/findTitleIDs?searchQuery="the dark knight"
  // -------------------------------------------------
  app.get("/api/BOA/findTitleIDs", async (req, res) => {
    // Use express sanitizer to clean up the search query for anything malicious
    const searchQuery = req.sanitize(req.query.searchQuery);
    console.log("BOA API - received request with query:", searchQuery);

    const searchResult = await BOM_API.searchForTitles(searchQuery);
    // Server-side validation to ensure the search query is not empty
    if (searchResult.length == 0) {
      res.json({
        success: true,
        message: "No search results found :(",
        titleIDs: [],
      });
    }

    // Get the movie IDs from the search results
    var movieList = [];
    for (var i = 0; i < searchResult.length; i++) {
      var movie = searchResult[i].movieId;
      movieList.push(movie);
    }

    res.json({
      success: true,
      message: "Search is clean & all API calls complete! GOOD TO GO!",
      titleIDs: movieList,
    });
  });

  // Route to get the ttIDs of trending titles
  // EXAMPLE: /api/BOA/getTrendingTitles?count=5
  // -------------------------------------------------
  app.get("/api/BOA/getTrendingTitles", async (req, res) => {
    // Sanitize and ensure the search query is an integer otherwise it will return the default of 5
    const searchQuery = Number.isInteger(parseInt(req.query.count))
      ? parseInt(req.query.count)
      : 5;
    console.log("BOA API - received request with query:", searchQuery);

    db.query("CALL getMostSavedTitles()", async function (err, result) {
      if (err) {
        console.log(err);
        res.json({
          success: false,
          message: "DB query was not complete!",
          foundTitles: [],
        });
      }
      console.log("Trending Titles result:", result[0]);
      var foundTitles = [];
      result[0].slice(0, searchQuery).forEach((title) => {
        foundTitles.push({ ttID: title.ttID, title: title.title });
      });
      // Return the data to the front end
      res.json({
        success: true,
        message: "DB query was complete! GOOD TO GO!",
        foundTitles,
      });
    });
  });

  // Route to get the movie details of a specific movie
  // EXAMPLE: /api/BOA/getMovieDetails?ttID=tt8864596
  app.get("/api/BOA/getMovieDetails", async (req, res) => {
    // Sanitize and ensure the search query is not empty as we need it to find the movie
    const ttID = req.sanitize(req.query.ttID);
    if (!ttID) {
      return res.json({
        success: false,
        message: "No valid ttID provided!",
        movie: [],
      });
    }
    try {
      const movieDetails = await BOM_API.createBoxOfficeBreakdownForTitle(ttID);
      const poster = await BOM_API.getTitlePosterImageSrc(ttID);
      movieDetails.setMovieImgSrc(poster);
      res.json({
        success: true,
        message: "Query was complete! GOOD TO GO!",
        movie: movieDetails,
      });
    } catch (error) {
      res.json({
        success: false,
        message: "DB query was not complete, failed to create breakdown!",
        movie: [],
      });
    }
  });

  // Route to get the financials of a specific movie
  // EXAMPLE: /api/BOA/getMovieFinancials?ttID=tt8864596
  app.get("/api/BOA/getMovieFinancials", async (req, res) => {
    // Sanitize and ensure the search query is not empty as we need it to find the movie
    const ttID = req.sanitize(req.query.ttID);
    if (!ttID) {
      return res.json({
        success: false,
        message: "No valid ttID provided!",
        movie: [],
      });
    }
    try {
      const movieDetails = await BOM_API.createBoxOfficeBreakdownForTitle(ttID);
      res.json({
        success: true,
        message: "Query was complete! GOOD TO GO!",
        countryGrosses: movieDetails.getMovieFinancials(),
      });
    } catch (error) {
      res.json({
        success: false,
        message: "DB query was not complete, failed to create breakdown!",
        countryGrosses: [],
      });
    }
  });
};
