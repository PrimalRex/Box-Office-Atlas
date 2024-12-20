// This is the class that will be used to communicate between information about a movie and any functions
const getPixels = require("get-pixels");

// Some performance charts are different on the website so we need to identify and handle them differently
const performanceChartCategories = Object.freeze({
  // Cat 1 refers to movies that have only 1 round of box office performance and therefore a simpler DOM to read from
  Cat1: 1,
  // Cat 2 refers to movies that have multiple rounds of box office performance and therefore a more complex DOM to read from
  // they share similar table structures but need their own extraction process
  // NOTE: Cat 2 movies take ALL-TIME gross data and not their 1st round of performance
  Cat2: 2,
});

// Arbitrary information about the movie
const movieDetails = Object.freeze({
  distributor: "NULL",
  earliestReleaseDate: "NULL",
  genre: "NULL",
  mpaa: "NULL",
  runningTime: "NULL",
});

// Financial performance about the movie
const movieFinancials = Object.freeze({
  worldwideGross: "NULL",
  domesticGross: "NULL",
  internationalGross: "NULL",
  grossByCountry: [],
  category: "NULL",
});

// Movie Class
class Movie {
  ttID = "ttxxxxxxx";
  title = "NULL";
  movieSummary = "NULL";
  movieDetails = {};
  movieImgSrc = "NULL";
  movieImgColor = "#ff7700";

  constructor(ttID) {
    this.ttID = ttID;
  }

  getTtID() {
    return this.ttID;
  }

  getReleaseYear() {
    if (this.movieDetails.earliestReleaseDate !== undefined) {
      return this.movieDetails.earliestReleaseDate.split(" ")[2];
    } else {
      return "";
    }
  }

  setMovieTitle(title) {
    this.title = title;
  }

  setMovieSummary(summary) {
    this.movieSummary = summary;
  }

  // Merges the current details with the new details
  setMovieDetails(details) {
    this.movieDetails = { ...this.movieDetails, ...details };
  }

  setMovieImgSrc(movieImgSrc) {
    this.movieImgSrc = movieImgSrc;
  }

  // Merges the current financials with the new financial
  setMovieFinancials(financials) {
    this.movieFinancials = { ...this.movieFinancials, ...financials };
  }

  getMovieFinancials() {
    return this.movieFinancials;
  }

  // Manipulative functions

  // Returns the gross of the movie per country as an integer (just sanitizes the string to an string of an int)
  getCountryGrossesAsIntegers() {
    var grosses = [];
    this.getMovieFinancials().grossByCountry.forEach((country) => {
      var value = country.countryGross;
      value = value.replace(/[^0-9]/g, "");
      grosses.push(value);
    });
    return grosses;
  }

  // Returns the gross of the movie per country as an alpha value (0.3-1)
  getCountryGrossesAsAlpha() {
    //console.log(this.getMovieFinancials().grossByCountry);

    // Some old movies or obscure ones might only release domestic so our 3 country minimum for alpha is not met
    if (this.getMovieFinancials().grossByCountry.length == 0) {
      return [];
    // If we only have 1 item, domestic, we can just assume that it contributes 100%
    // In some edge cases, the box office financials for a specific title might not be available for all countries
    // That is just a limitation of the data thats available and not how this system operates
    } else if (this.getMovieFinancials().grossByCountry.length < 2) {
      return [
        {
          country: this.getMovieFinancials().grossByCountry[0].country,
          countryGross: this.getMovieFinancials().domesticGross,
          countryGrossAlpha: 1,
          countryGrossPercentage: 100,
        },
      ];
    }

    var lowestGross = parseFloat(this.getLowestGrossingCountry().gross);
    // Naming here is intentional, originally from testing, the highest grossing country would provide an incredibly high value which would
    // dwarf all other countries, so to ensure that the same feeling was produced without the extreme values, we take the second highest.
    // The dwarfism still exists on a per title case but it's generally much more consistent with non-booming box office performers
    var secondHighestGross = parseFloat(this.getSecondHighestGrossingCountry().gross);
    // Usually there is a big gap between second highest and lowest thus makes it not good to interp between, so we take the average
    var averageGross = parseFloat((lowestGross + secondHighestGross) / 2);

    var grossPercentage = 0;

    var countryGrosses = [];

    this.getMovieFinancials().grossByCountry.forEach((country) => {
      var value = parseFloat(country.countryGross.replace(/[^0-9]/g, ""));
      // Get the contribution of the country to the total gross
      grossPercentage =
        (value /
          parseFloat(
            this.getMovieFinancials().worldwideGross.replace(/[^0-9]/g, "")
          )) *
        100;
      // Round to 2 decimal places because we dont need an extreme amount of precision.
      // In some cases we may round to 3dp because the gross of the country is too insignificant
      grossPercentage =
        Math.round(grossPercentage * 100) / 100 == 0
          ? Math.round(grossPercentage * 1000) / 1000
          : Math.round(grossPercentage * 100) / 100;

      // Convert the value into a normalized alpha of 0.3-1 where 0.3 is lowestGrossing and 1 is secondHighestGrossing number
      value =
        ((value - lowestGross) / (averageGross - lowestGross)) * (1 - 0.3) +
        0.3;
      // Since the average can be lower than highest we should just clamp it to 1
      if (value > 1) {
        value = 1;
      }

      // Condition check for whether its canada or puerto rico and add them to the USA (Domestic) value since we're combining them
      if (country.country == "Canada" || country.country == "Puerto Rico") {
        countryGrosses[0].countryGross += value;
        countryGrosses[0].countryGrossPercentage += grossPercentage;
      } else {
        countryGrosses.push({
          country: country.country,
          countryGross: country.countryGross,
          countryGrossAlpha: value,
          countryGrossPercentage: grossPercentage,
        });
      }
    });
    return countryGrosses;
  }

  // Although the list is already ordered and thus we can determine the lowest from the last index, there might be a case
  // where the domestic is lower than the international gross ? Not entirely sure yet but this works in both cases
  getLowestGrossingCountry() {
    var lowestGross = Number.MAX_SAFE_INTEGER;
    var lowestGrossCountry;

    const countryGrosses = this.getCountryGrossesAsIntegers();

    // Iterate through the stored gross values
    for (var i = 0; i < countryGrosses.length; i++) {
      // Convert gross values to integers for comparison (base 10 conversion)
      const currentGross = parseInt(countryGrosses[i], 10);

      if (currentGross < lowestGross) {
        lowestGross = currentGross;
        lowestGrossCountry =
          this.getMovieFinancials().grossByCountry[i].country;
        //console.log(lowestGross);
      }
    }

    return { country: lowestGrossCountry, gross: lowestGross };
  }

  getHighestGrossingCountry() {
    var highestGross = 0;
    var highestGrossCountry;

    const countryGrosses = this.getCountryGrossesAsIntegers();

    // Iterate through the stored gross values
    for (var i = 0; i < countryGrosses.length; i++) {
      // Convert gross values to integers for comparison
      const currentGross = parseInt(countryGrosses[i], 10);

      if (currentGross > highestGross) {
        highestGross = currentGross;
        highestGrossCountry =
          this.getMovieFinancials().grossByCountry[i].country;
        //console.log(highestGross);
      }
    }

    return { country: highestGrossCountry, gross: highestGross };
  }

  // Returns the second highest grossing country
  getSecondHighestGrossingCountry() {
    var secondhighestGross = 0;
    var secondhighestGrossCountry;
    const highestGross = this.getHighestGrossingCountry().gross;

    const countryGrosses = this.getCountryGrossesAsIntegers();

    // Iterate through the stored gross values
    for (var i = 0; i < countryGrosses.length; i++) {
      // Convert gross values to integers for comparison
      const currentGross = parseInt(countryGrosses[i], 10);

      if (
        currentGross > secondhighestGross &&
        secondhighestGross < highestGross
      ) {
        secondhighestGross = currentGross;
        secondhighestGrossCountry =
          this.getMovieFinancials().grossByCountry[i].country;
        //console.log(highestGross);
      }
    }

    return { country: secondhighestGrossCountry, gross: secondhighestGross };
  }

  // Analyses a portion of the movie poster and returns a dominnant color
  // In retrospect, converting it to a HEX format is completely not necessary since CSS will read the RGB version just fine
  setAveragePixelColorFromPoster = async () => {
    const getPixelsAsync = (src) => {
      return new Promise((resolve, reject) => {
        getPixels(src, (err, pixels) => {
          if (err) {
            reject("Bad image path");
          } else {
            resolve(pixels);
          }
        });
      });
    };

    try {
      const pixels = await getPixelsAsync(this.movieImgSrc);
      //console.log("got pixels", pixels.shape.slice());

      // Calculate the center area
      const centerYStart = Math.floor(pixels.shape[0] / 3);
      const centerYEnd = Math.floor((pixels.shape[0] * 2) / 3);

      // Initialize color channels
      let r = 0,
        g = 0,
        b = 0;
      let pixelsCounted = 0;

      // Loop through the center area of the image
      for (let y = centerYStart; y < centerYEnd; y++) {
        for (let x = 0; x < pixels.shape[1]; x++) {
          const index = (y * pixels.shape[1] + x) * 4;
          r += pixels.data[index];
          g += pixels.data[index + 1];
          b += pixels.data[index + 2];
          pixelsCounted += 1;
        }
      }

      // Find the channel with the largest influence - we will use this to bump the vibrancy of the final color
      var biggestValue = Math.max(r, g, b);
      // Calculate average color values
      r = Math.min(
        Math.floor(r / pixelsCounted) * (r == biggestValue ? 5 : 2),
        255
      );
      g = Math.min(
        Math.floor(g / pixelsCounted) * (g == biggestValue ? 5 : 2),
        255
      );
      b = Math.min(
        Math.floor(b / pixelsCounted) * (b == biggestValue ? 5 : 2),
        255
      );

      // Convert to hex for mapbox to read (not necessary but it's nice to have)
      const hexColor = `#${r.toString(16).padStart(2, "0")}${g
        .toString(16)
        .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
      //console.log(hexColor);

      this.movieImgColor = hexColor;
    } catch (error) {
      console.log(error);
      return;
    }
  };
}

module.exports = Movie;
module.exports.performanceChartCategories = performanceChartCategories;
module.exports.movieDetails = movieDetails;
module.exports.movieFinancials = movieFinancials;
