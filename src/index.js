// Import the modules we need
var express = require("express");
var ejs = require("ejs");
var mysql = require("mysql");
var session = require("express-session");

// Create the express application object
const app = express();
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);

const port = 8000;

// Set up css
app.use(express.static(__dirname + "/public"));

// Set the directory where Express will pick up HTML files
// __dirname will get the current directory
app.set("views", __dirname + "/views");

// Tell Express that we want to use EJS as the templating engine
app.set("view engine", "ejs");

// Tells Express how we should process html files
// We want to use EJS's rendering engine
app.engine("html", ejs.renderFile);

// Define our data
var boaData = {};

// Requires the main.js file inside the routes folder passing in the Express app and data as arguments.  All the routes will go in this file
require("./routes/main")(app, boaData);

// Start the web app listening
app.listen(port, () => console.log(`BOA is listening on port ${port}!`));