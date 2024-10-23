// This is the class that will be used to communicate between information about a movie and any functions

// Some performance charts are different on the website so we need to identify and handle them differently
const performanceChartCategories = Object.freeze({
    // Cat 1 refers to movies that have only 1 round of box office performance and therefore a simple DOM to read from
    Cat1: 1,
    // Cat 2 refers to movies that have multiple rounds of box office performance and therefore a more complex DOM to read from
    // they share similar table structures but need their own extraction process
    // NOTE: Cat 2 movies take ALL-TIME gross data and not their 1st round of performance
    Cat2: 2
});

// Arbitrary information about the movie
const movieDetails = Object.freeze({
    distributor: 'NULL',
    earliestReleaseDate: 'NULL',
    genre: [],
    mpaa: 'NULL',
    runningTime: 'NULL'
});

// Financial performance about the movie
const movieFinancials = Object.freeze({
    worldwideGross: 'NULL',
    domesticGross: 'NULL',
    internationalGross: 'NULL',
    grossByCountry: [],
    category: 'NULL'
});

// Movie Class
class Movie {
    ttID = 'ttxxxxxxx';
    title = 'NULL';
    movieSummary = 'NULL';
    movieDetails = {};
    movieImgSrc = 'NULL';

    constructor(ttID) {
        this.ttID = ttID;
    }
    
    setMovieTitle(title) {
        this.title = title;
    }

    getMovieTitle() {
        return this.title;
    }

    setMovieSummary(summary) {
        this.movieSummary = summary;
    }

    getMovieSummary() {
        return this.movieSummary;
    }

    // Merges the current details with the new details
    setMovieDetails(details) {
        this.movieDetails = { ...this.movieDetails, ...details };
    }

    getmovieDetails() {
        return this.movieDetails;
    }

    setMovieImgSrc(movieImgSrc) {
        this.movieImgSrc = movieImgSrc;
    }

    getMovieImgSrc() {
        return this.movieImgSrc;
    }

    // Merges the current financials with the new financial
    setMovieFinancials(financials) {
        this.movieFinancials = { ...this.movieFinancials, ...financials };
    }

    getMovieFinancials() {
        return this.movieFinancials;
    }
}

module.exports = Movie;
module.exports.performanceChartCategories = performanceChartCategories;
module.exports.movieDetails = movieDetails;
module.exports.movieFinancials = movieFinancials;