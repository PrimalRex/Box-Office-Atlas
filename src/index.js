// Import the modules we need
var express = require("express");
var mysql = require("mysql");
var session = require("express-session");
var ejs = require("ejs");
var expressSanitizer = require('express-sanitizer');
// Hide away all API keys in here
require("dotenv").config();

// Ensure you have  '.env' file in the root directory with valid tokens for the following:
const MAPBOX_API_KEY = process.env.MAPBOX_API_KEY;

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

// Define the database connection
const db = mysql.createConnection ({
  host: 'localhost',
  user: 'boaAdmin',
  password: 'boagenericpass',
  database: 'boaDB'
});
// Connect to the database
db.connect((err) => {
  if (err) {
      console.log('Error connecting to BOA database');
      throw err;
  }
  console.log('Connected to BOA database successfully!');
});
global.db = db;

// Set up css
app.use(express.static(__dirname + "/public"));

// Set up body parser
app.use(express.json());

// Santise inputs
app.use(expressSanitizer());

// Set the directory where Express will pick up HTML files
// __dirname will get the current directory
app.set("views", __dirname + "/views");

// Tell Express that we want to use EJS as the templating engine
app.set("view engine", "ejs");

// Tells Express how we should process html files
// We want to use EJS's rendering engine
app.engine("html", ejs.renderFile);

// Define our data - passing mapbox api key for now
var boaData = [MAPBOX_API_KEY];

// Requires the main.js file inside the routes folder passing in the Express app and data as arguments.  All the routes will go in this file
require("./routes/main")(app, boaData);

// Start the web app listening
app.listen(port, () => console.log(`BOA is listening on port ${port}!`));
