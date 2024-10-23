// This is the scraper for the Box Office Mojo website
// https://www.boxofficemojo.com

const cheerio = require('cheerio');

// Some Enums and Constants to reference

// Some performance charts are differentr on the website so we need to identify and handle them differently
const performanceChartCategories = Object.freeze({
    // Cat 1 refers to movies that have only 1 round of box office performance and therefore a simple DOM to read from
    Cat1: 1,
    // Cat 2 refers to movies that have multiple rounds of box office performance and therefore a more complex DOM to read from
    // they share similar table structures but need their own extraction process
    // NOTE: Cat 2 movies take ALL-TIME gross data and not their 1st round of performance
    Cat2: 2
});

// "Domestic" refers to gross box-office revenue from North America (U.S., Canada, and Puerto Rico)" - IMDb
const domesticCountryDefault = "U.S., Canada, and Puerto Rico";

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

            // Create a movieData object to store all the extracted data
            var movieData = {};

            // Extract the movie title (we don't really need to do this but since we've requested it we might as well use it)
            const title = $('.a-size-extra-large').first().text().trim();

            // Extract the description of the movie
            const summary = $('span.a-size-medium').first().text().trim();

            // Extract other details about the release
            var movieDetails = $('.a-section.a-spacing-none.mojo-summary-values span');
            var sanitizedDetails = {};

            // Iterate over the details and extract the label and value
            for (let i = 0; i < movieDetails.length; i++) {
                // Got through all the details and labels, replace every new line with an empty character
                let label = $(movieDetails[i]).text().trim().replace(/\n/g, '');
                let value = $(movieDetails[i]).next().text().trim().replace(/\n/g, '');
            
                if(label.includes('Domestic Distributor')) {
                    value = value.split('See full company information')[0];
                }

                // Clean the 'Earliest Release Date' to only get the date
                if (label.includes('Earliest Release Date')) {
                    var date = value.split(' ');
                    // Returns the date ideally like "February 01, 2000"
                    value = date[0] + ' ' + date[1] + ' ' + date[2];
                }
                
                if(label.includes('Genres')) {
                    // Split the genres into an array by checking spaces between each of the words
                    value = value.split(/\s{1,}/);
                }
            
                // Filter out unwanted labels like 'Domestic Opening' and 'IMDbPro'
                if (!label.includes('Domestic Opening') && !label.includes('IMDbPro')) {
                    if (label && value) {
                        sanitizedDetails[label] = value;
                    }
                }
            }

            // Revenue Summaries
            const domesticGross = $('span.money').eq(0).text().trim();
            const internationalGross = $('span.money').eq(1).text().trim();
            const worldwideGross = $('span.money').eq(2).text().trim();

            // Find how many gross boxes there are
            const grossBoxes = $('.a-bordered.a-horizontal-stripes.a-size-base-plus').length;

            // Find out what the first 'header' element is to determine what kind of performance chart we are looking at
            const firstPerformanceElement = ($('.a-bordered.a-horizontal-stripes.a-size-base-plus').eq(0).prev().text().trim());
            var performanceChartCategory;

            // Check if the first performance element is Domestic or By Release so we can assign a categoric value
            if (firstPerformanceElement == "Domestic") {
                performanceChartCategory = performanceChartCategories.Cat1;
            } else if (firstPerformanceElement == "By Release") {
                performanceChartCategory = performanceChartCategories.Cat2;
            }

            // Gross Breakdown
            var globalGrossDataByCountry = [];

            // Iterate over the gross boxes and extract the data
            for (let i = 0; i < grossBoxes; i++) {
                // Grab the title first, if its domestic we want to process it differently
                const grossTitle = $('.a-bordered.a-horizontal-stripes.a-size-base-plus').eq(i).prev().text().trim();

                //console.log(grossTitle);
                if (performanceChartCategory == performanceChartCategories.Cat2) {

                    var sanitizedGrossData = [];
                
                    // Select all rows 
                    const rows = $('.a-bordered.a-horizontal-stripes.a-size-base-plus tr');
                
                    // Iterate over each row
                    for (let i = 0; i < rows.length; i++) {
                        const cells = $(rows[i]).find('td');

                        if (cells.length > 2) {
                            var country = $(cells[0]).text().trim();
                            country = country === "Domestic" ? domesticCountryDefault : country;
                            const countryGross = $(cells[2]).text().trim();
                
                            // Check if country is valid and we'll only push if there is a gross value attached to it
                            if (country && countryGross[0] === '$') {
                                sanitizedGrossData.push({ country, countryGross });
                            }
                        }
                    }

                    globalGrossDataByCountry = sanitizedGrossData;
                };
                
                // If the title is recent or not quite cult-classic they will only have 1 round of box office performance
                if (performanceChartCategory == performanceChartCategories.Cat1) {

                    var sanitizedGrossData = [];
                
                    if (grossTitle == "Domestic") {
                        // Use the static country name for domestic
                        sanitizedGrossData.push({ country: domesticCountryDefault, grossData: [domesticGross] });
                    } else {

                        const gross = $('.a-bordered.a-horizontal-stripes.a-size-base-plus').eq(i);
                        var grossData = [];
                
                        // Iterate over the gross data and extract the text
                        for (let j = 0; j < gross.find('td').length; j++) { 
                            grossData.push($(gross.find('td')[j]).text());
                        }
                
                        // Go through the list of data and take only the gross and name of the country
                        for (let k = 0; k < grossData.length; k++) { 
                           
                            // We only want to extract the country name which occurs every 4th element
                            if (k % 4 == 0) {
                                const country = grossData[k].trim();
                                // Total gross is always (?) the 3rd element after the name
                                const countryGross = grossData[k + 3].trim();
                                sanitizedGrossData.push({ country, countryGross });
                            }
                        }
                    };
                
                    globalGrossDataByCountry = (globalGrossDataByCountry || []).concat(sanitizedGrossData);
                }
                
            };
            

            // Assign extracted data to the movieData object
            movieData.title = title || 'Title not found';
            movieData.summary = summary || 'Summary not found';
            // Going to assign any missing data as -1 for now - might be better to assign as null in the future
            movieData.domesticGross = domesticGross || "-1";
            movieData.internationalGross = internationalGross || "-1";
            movieData.worldwideGross = worldwideGross || "-1";
            movieData.globalGrossDataByCountry = globalGrossDataByCountry;
            movieData.movieDetails = sanitizedDetails;
            movieData.globalGrossDataCategory = performanceChartCategory;

            return movieData;

        } catch (err) {
            console.error('Error fetching box office breakdown: ', err);
            throw err;
        }
    }
};


module.exports = BOM_API;