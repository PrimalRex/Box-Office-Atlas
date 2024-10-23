// This is the scraper for the Box Office Mojo website
// https://www.boxofficemojo.com

const cheerio = require('cheerio');

// The scraper also sanitizes all data recieved so this gives the app a focused and tailored API
const BOM_API = {

    // Scrapes the search engine from the website for the titles we want to search for
    searchForTitles: async function(keywords) {
        // Replace spaces with '+' to match the URL format using a regex
        const sanitizedKeywords = keywords.replace(/\s/g, '+');
    
        try {
            const searchUrl = `https://www.boxofficemojo.com/search/?q=${sanitizedKeywords}`;
    
            // Fetch and wait
            const response = await fetch(searchUrl);
            const html = await response.text();
    
            // Cherrio to parse the HTML
            const $ = cheerio.load(html);
    
            // Select the movie elements from the DOM
            var movieElements = $('.a-size-medium.a-link-normal.a-text-bold');
    
            var movies = [];
            // Iterate over the results and extract title and ID
            for (let i = 0; i < movieElements.length; i++) {
                var title = $(movieElements[i]).text();
                var movieUrl = $(movieElements[i]).attr('href');
    
                // Extract the movie ID using a regex
                var match = movieUrl.match(/\/title\/(tt\d+)\//);
                if (match) {
                    // Should be a valid id that looks something like ttxxxxxxxx
                    let movieId = match[1]; 
                    movies.push({ title, movieId });
                } else {
                    console.error("No match found for search");
                }
            }
    
            // Return the list of movies if we found any
            return movies;

        } catch (err) {
            console.error('Error fetching search results: ', err);
            throw err;
        }
    },

    getBoxOfficeBreakdown: async function (ttID) {

        try {
            const boxOfficeUrl = `https://www.boxofficemojo.com/title/${ttID}/`;

            // Fetch and wait
            const response = await fetch(boxOfficeUrl);
            const html = await response.text();
    
            // Cherrio to parse the HTML
            const $ = cheerio.load(html);

            // Create a movieData object to store the extracted data
            var movieData = {};

            // Extract the movie title (we don't really need to do this but since we've requested it we might as well use it)
            const title = $('.a-size-extra-large').first().text().trim();

            // Extract the description of the movie
            const summary = $('span.a-size-medium').first().text().trim();

            // Revenue Summaries
            const domesticGross = $('span.money').eq(0).text().trim();
            const internationalGross = $('span.money').eq(1).text().trim();
            const worldwideGross = $('span.money').eq(2).text().trim();

            // Find how many gross boxes there are
            const grossBoxes = $('.a-bordered.a-horizontal-stripes.a-size-base-plus').length;
            
            // Gross Breakdown
            var globalGrossDataByRegion = [];
            // Iterate over the gross boxes and extract the data
            for (let i = 0; i < grossBoxes; i++) {
                // Grab the title first, if its domestic we don't want to process it as we already got the values from summary
                const grossTitle = $('.a-bordered.a-horizontal-stripes.a-size-base-plus').eq(i).prev().text().trim();
                if(grossTitle != "Domestic")
                {
                    const gross = $('.a-bordered.a-horizontal-stripes.a-size-base-plus').eq(i);
                    // Conveniently, the data is in a table that indexed every 4th element
                    var grossData = gross.find('td').map((i, el) => $(el).text()).get();
                    // Santize the data in this array before we store it
                    var sanitizedGrossData = [];

                    // Go through the list of data and take only the gross and name of the country
                    for (let i = 0; i < grossData.length; i++) {
                        // We only want to take the country and the gross so we check if the index is a country name
                        if(i % 4 == 0)
                        {
                            const country = grossData[i].trim();
                            // Total gross is always the 3rd element after the name
                            const countryGross = grossData[i + 3].trim();
                            sanitizedGrossData.push( { country, countryGross } );

                        }
                    }
                    globalGrossDataByRegion.push( { grossTitle, grossData: sanitizedGrossData } );
                }
            };
            

            // Assign extracted data to the movieData object
            movieData.title = title || 'Title not found';
            movieData.summary = summary || 'Summary not found';
            // Going to assign any missing data as -1 for now - might be better to assign as null in the future
            movieData.domesticGross = domesticGross || "-1";
            movieData.internationalGross = internationalGross || "-1";
            movieData.worldwideGross = worldwideGross || "-1";
            movieData.globalGrossDataByRegion = globalGrossDataByRegion;

            return movieData;

        } catch (err) {
            console.error('Error fetching box office breakdown: ', err);
            throw err;
        }
    }
};


module.exports = BOM_API;