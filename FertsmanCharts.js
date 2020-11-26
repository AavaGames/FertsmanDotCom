var sheets_api_key = "AIzaSyBCKARaVh3Ho0f5NEdAfvzTi5_U-UgkNLM"

'use strict';

var lineOptions = {
    colors: ["rgba(255, 255, 255, 1)",
        "rgba(0, 175, 181, 1)",
        "rgba(255, 119, 0, 1)",
        "rgba(163, 0, 0, 1)",
        "rgba(0, 71, 119, 1)",
        "rgba(239, 210, 141, 1)"]
}

var chartDefaultColor = "rgba(0, 0, 0, 0.1)";
var chartFontFamily = "Open Sans";

function FormatLink(spreadSheetID, ...ranges) {
    var link;
    const startOfLink = "https://sheets.googleapis.com/v4/spreadsheets/";
    const forceColumns = "&majorDimension=COLUMNS"
    const apiKey = "&key=" + sheets_api_key;

    var range = "";
    ranges.forEach(element => {
        if (range == "") {
            range = "/values:batchGet?ranges=" + element;
        }
        else {
            range = range + "&ranges=" + element;
        }
    });

    link = startOfLink + spreadSheetID + range + forceColumns + apiKey;

    return link;
}