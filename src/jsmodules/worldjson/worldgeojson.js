const path = require("path");
const fs = require("fs");
const COUNTRY_MODULE = require("../countries");

const WORLD_GEO_JSON_MODULE = {
  // Fetch the geoJSON data from simplemaps for a country based on the country code
  // For end-users its better if they have 95-100% of the json files stored locally as fetching
  // anywhere from 30-100 json files at runtime is slow and inefficient.
  // NOTE: [The current json files cover most countries and regions for most blockbusters from the last decade]
  grabMissingGeoData: async function (countryCode) {
    //const URL = `https://simplemaps.com/static/svg/country/${countryCode.toLowerCase()}/admin1/${countryCode.toLowerCase()}.json`;
    const URL = `https://simplemaps.com/static/svg/country/${countryCode.toLowerCase()}/all/${countryCode.toLowerCase()}.json`;
    const response = await fetch(URL);
    const geoJSON = await response.text();
    return JSON.parse(geoJSON);
  },

  // Get the geoJSON data for a country based on the country code
  getGeoDatafromCountryCode: async function (countryCode) {
    var countryName = COUNTRY_MODULE.getCountryNameFromCode(countryCode);
    // Sanitize the country name to match the json file name
    countryName = countryName
      .replace(/ /g, "_")
      .replace(/\./g, "")
      .replace(/\//g, "")
      .replace(/&/g, "and")
      .toLowerCase();

    const jsonFileName = `${countryName}.json`;
    const jsonFilePath = path.join(__dirname, "countryjson", jsonFileName);
    // Check if the file exists - if not then fetch it at runtime from simplemaps
    // This is a slow but guaranteed way to deal with the issue of missing json files as it's laborious to have every json
    // file for every country stored locally.
    if (!fs.existsSync(jsonFilePath)) {
      console.log(
        `JSON not found for ${jsonFileName}... fetching from SimpleMaps`
      );
      return await this.grabMissingGeoData(countryCode);
    }
    //return jsonFilePath;
    return JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));
  },

  // Create an array of objects with the all the relevant data for each country to be used on the map
  createGeoDataInfoFromAlpha: async function (grossesAlpha) {
    var geoDataAlpha = [];
    for (var i = 0; i < grossesAlpha.length; i++) {
      //console.log(grossesAlpha[i]);
      const countryCode = COUNTRY_MODULE.getCountryCode(
        grossesAlpha[i].country
      );
      if (countryCode != "N/A") {
        var data = await this.getGeoDatafromCountryCode(countryCode);
        var coords = COUNTRY_MODULE.getCountryCoords(grossesAlpha[i].country);
        //console.log(data);

        geoDataAlpha.push({
          geoData: data,
          coords: coords,
          country: grossesAlpha[i].country.toUpperCase(),
          countryGrossAlpha: grossesAlpha[i].countryGrossAlpha,
          countryGross: grossesAlpha[i].countryGross,
          countryGrossPercentage: grossesAlpha[i].countryGrossPercentage,
        });
      }
    }
    return geoDataAlpha;
  },
};

module.exports = WORLD_GEO_JSON_MODULE;
