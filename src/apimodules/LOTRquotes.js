// LOTR QUOTES API
// Function boilerplate for de-scrambling the movie title ids 
// sourced @ https://github.com/dempsbx/LOTRQuoteRandomizer

require('dotenv').config();
const THE_ONE_API_KEY = process.env.THE_ONE_API_BEARER_TOKEN;

const headers = {
    Accept: "application/json",
    Authorization: 'Bearer ' + THE_ONE_API_KEY
};

const baseURL = "https://the-one-api.dev/v2";

const LOTRQUOTES_API = {
    
    // Get formatted quote ("Hello, world!" - Gandalf, The Fellowship of the Ring)
    getQuote : async function() {
        try {
            // Character liit specified to keep the quotes nice and sweet
            const quoteURL = baseURL + `/quote?limit=12`;
            const response = await fetch(quoteURL, { headers: headers });
            const data = await response.json();

            // If the API is rate limited, return a default quote
            if(data.success == false) {
                return {quote : "Don't Tempt Me Frodo.",
                        quoteAuthor : "- Gandalf, The Fellowship of the Ring"};
            }

            // Get the data about the quote at random (other data is not relevant)
            const quoteData = data.docs[Math.floor(Math.random() * data.docs.length)];
        
            // The actual 'quote'
            const dialog = quoteData.dialog;
            //console.log(dialog);
        
            // The character who said the quote
            const character = await LOTRQUOTES_API.getCharacter(quoteData.character);
            //console.log(character);
        
            // The movie the quote was said in
            const movie = LOTRQUOTES_API.getMovieName(quoteData.movie);
            //console.log(movie);

            return {quote : dialog ,
                    quoteAuthor :"- " + character + ", " + movie};

        } catch (error) {
            console.error("Error fetching quotes:", error);
        }
    },
    
    // Get the character associated with the quote
    getCharacter : async function (characterId) {
        try {
            const characterURL = baseURL + `/character/${characterId}`;
            const response = await fetch(characterURL, { headers: headers });
            const data = await response.json();
        
            const characterData = data.docs[0];
            const characterName = characterData.name;
            return characterName;
        } catch (error) {
            console.error("Error fetching character:", error);
        }
    },
    
    // Get the movie associated with the quote
    getMovieName : function (movieId) {
        var movieName;
        if (movieId == "5cd95395de30eff6ebccde5c") {
            movieName = "The Fellowship of the Ring";
        } else if (movieId == "5cd95395de30eff6ebccde5b") {
            movieName = "The Two Towers";
        } else if (movieId == "5cd95395de30eff6ebccde5d") {
            movieName = "The Return of the King";
        } else if (movieId == "5cd95395de30eff6ebccde58") {
            movieName = "The Unexpected Journey";
        } else if (movieId == "5cd95395de30eff6ebccde59") {
            movieName = "The Desolation of Smaug";
        } else if (movieId == "5cd95395de30eff6ebccde5a") {
            movieName = "The Battle of the Five Armies";
        } else if (movieId == "5cd95395de30eff6ebccde56") {
            movieName = "The Lord of the Rings Series";
        } else if (movieId == "5cd95395de30eff6ebccde57") {
            movieName = "The Hobbit Series";
        } else {
            movieName = "Failed to get movie name - Rate Limited ?";
        }
        return movieName;
    }
};

module.exports = LOTRQUOTES_API;