const path = require('path');
const fs = require('fs');
const COUNTRY_MODULE = require("../countries");

const WORLD_GEO_JSON_MODULE = {
    getGeoDatafromCountryCode : function(countryCode) {
        var countryName = COUNTRY_MODULE.getCountryNameFromCode(countryCode);
        // Sanitize the country name to match the json file name
        countryName = countryName.replace(/ /g, "_").replace(/\./g, "").replace(/\//g, "").replace(/&/g, "and").toLowerCase();

        const jsonFileName = `${countryName}.json`;
        const jsonFilePath = path.join(__dirname, 'countryjson', jsonFileName);
        //return jsonFilePath;
        return JSON.parse(fs.readFileSync(jsonFilePath,"utf8"));
    },

    setGeoDataToGrossesAlpha : function(grossesAlpha){
        var geoDataAlpha = [];
        for (var i = 0; i < grossesAlpha.length; i++) {
            //console.log(grossesAlpha[i]);
            const countryCode = COUNTRY_MODULE.getCountryCode(grossesAlpha[i].country);
            if (countryCode != "N/A") {
                var data = (this.getGeoDatafromCountryCode(countryCode));
                //console.log(data);
    
                geoDataAlpha.push({geoData : data, countryGross : grossesAlpha[i].countryGross});
            }
        };
        return geoDataAlpha;
    }
}

module.exports = WORLD_GEO_JSON_MODULE;