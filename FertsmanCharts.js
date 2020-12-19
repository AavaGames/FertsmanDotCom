// #region Chart Options

var lineOptions = {
    colors: ["rgba(255, 255, 255, 1)",
        "rgba(0, 175, 181, 1)",
        "rgba(255, 119, 0, 1)",
        "rgba(163, 0, 0, 1)",
        "rgba(0, 71, 119, 1)",
        "rgba(239, 210, 141, 1)"],
    trendLine: "rgba(255, 150, 0, 1)",
}

var chartDefaultColor = "rgba(0, 0, 0, 0.1)";
var chartFontFamily = "Open Sans";

// #endregion

// #region  FUNCTIONS

// Magical lambda to convert column number to letter
ColumnNumToLetter = (n) => (a = Math.floor(n/26)) >= 0 ? ColumnNumToLetter(a - 1) + String.fromCharCode(65 + (n % 26)) : '';

/**
 * Formats link to pull VECTORS from specific spreadsheet and sheet.
 * 
 * Where this function is called:
 *   - REQUIRED FinishedLink(link) function, place all subsequent code in this function
 * 
 *   - var overWriteHeaders;
 *     Do not include "Date", it is already included.
 *     This variable overwrites the headers if included.
 *     Example = ["HeaderOne", "HeaderTwo"]
 * 
 *   - var rowRanges;
 *     This variable add row ranges to all vector columns
 *     Example = [
 *         [1, 1], 
 *         [32, 60],
 *         [80, 100000]
 *      ];
 * 
 * @param {String} spreadSheetID The spreadsheet ID
 * @param {String} sheetName The sheet name
 * @param {Number} vectors Vectors to pull from sheet
 *                        Examples: "v12093102, vå39210901, v231090"
 */
function FormatLinkWithVectors(spreadSheetID, sheetName, ...vectors)
{
    const startOfLink = "https://sheets.googleapis.com/v4/spreadsheets/";
    const forceRows = "&majorDimension=ROWS"
    
    const apiKey = "&key=" + sheets_api_key;

    // Pull first row
    const linkRanges = "/values:batchGet?ranges=" + sheetName + "!1:1";

    var link = startOfLink + spreadSheetID + linkRanges + forceRows + apiKey;

    var vectorColumns = [];
    var firstRow = [];

    $.getJSON(link, json => {
        firstRow = json.valueRanges[0].values[0];

        // cycle through vectors, find in row, add to array, remove from array
        for (var i = 0; i < vectors.length; i++)
        {
            var vector = vectors[i];
        
            var vectorFound = false;
            for (var j = 0; j < firstRow.length; j++)
            {
                var value = firstRow[j];

                if (value == vector)
                {
                    vectorColumns.push(j);
                    vectorFound = true;
                    break;
                }
            }

            if (!vectorFound)
                console.log("ERROR: Vector not found - " + vector);
        }

        // Convert to A1
        var ranges = [];
        vectorColumns.forEach(e => {
            ranges.push(ColumnNumToLetter(e));
        });

        var linkRanges = "/values:batchGet?ranges=";
        if (typeof rowRanges == 'undefined')
        {
            console.log("Not adding rows to ranges");

            // Get Date
            linkRanges = "/values:batchGet?ranges=" + sheetName + "!A:A";
            // Get Columns
            ranges.forEach(element => {
                linkRanges = linkRanges + "&ranges=" + sheetName + "!" + element + ":" + element;
            });
        }
        else
        {
            console.log("Adding rows to ranges");
            console.log(ranges);
            // First entry format exception of date
            linkRanges += sheetName + "!A" + rowRanges[0][0] + ":A" + rowRanges[0][1];
            for (var j = 0; j < rowRanges.length; j++)
            {
                var date = true;
                for (var i = 0; i < ranges.length; i++)
                {
                    // Get Date unless exception
                    if (j != 0 & date)
                    {
                        linkRanges += "&ranges=" + sheetName + "!A" + rowRanges[j][0] + ":A" + rowRanges[j][1];
                        date = false;
                        i--;
                    }
                    // Get Columns
                    else
                    {
                        linkRanges += "&ranges=" + sheetName + "!" + ranges[i] + rowRanges[j][0] + ":" + ranges[i] + rowRanges[j][1];
                    }
                    console.log(ranges[i]);
                }
            }
        }
        const forceColumns = "&majorDimension=COLUMNS";

        link = startOfLink + spreadSheetID + linkRanges + forceColumns + apiKey;

        console.log(link);

        //Callback function
        FinishedLink(link)
    });
}

/**
 * Formats link to pull A1 notation from specific spreadsheet and sheet.
 * @param {String} spreadSheetID The spreadsheet ID
 * @param {String} sheetName The sheet name
 * @param {Number} ranges A1 ranges to pull from sheet
 *                        Example: "A:A", "A1:D50", "MV1:ZE800"
 */
function FormatLinkWithA1(spreadSheetID, sheetName, ...ranges) {
    var link;
    const startOfLink = "https://sheets.googleapis.com/v4/spreadsheets/";
    const forceColumns = "&majorDimension=COLUMNS"
    const apiKey = "&key=" + sheets_api_key;

    var linkRanges = "";
    ranges.forEach(element => {
        if (linkRanges == "") {
            linkRanges = "/values:batchGet?ranges=" + sheetName + "!" + element;
        }
        else {
            linkRanges = linkRanges + "&ranges=" + sheetName + "!" + element;
        }
    });

    link = startOfLink + spreadSheetID + linkRanges + forceColumns + apiKey;

    return link;
}

/**
 * Sorts Google Sheets v4 API json into headers and values that can be utilized by Chart.js
 * @param {2D Array} json JSON to be sorted
 */
function SortJSONintoHeadersAndValues(json, addDate = true) {

    var dataHeaders = [];
    var data = [];

    var currentSortedColumn = -1;

    // Iterate all VALUE RANGES
    json.valueRanges.forEach(valueRange => {

        var amountOfColumns = valueRange.values.length;
        // Iterate all VALUES arrays
        for (var column = 0; column < amountOfColumns; column++) {
            var values = valueRange.values[column];

            var amountOfRows = values.length;

            var header = values[0];
            var isHeader = false;
            // it is a header if it contains the word "Date" or the first letter is "v"
            if (header.includes("Date"))
                isHeader = true;
            else if (header.charAt(0) == 'v')
                isHeader = true;

            // If header is not a number, add a new dataset
            if (isHeader)
            {
                currentSortedColumn++;
                data[currentSortedColumn] = new Array();

                dataHeaders[currentSortedColumn] = values[0];
                for (var row = 1; row < amountOfRows; row++)
                {
                    value = values[row];
                    data[currentSortedColumn].push(value);
                }
            }
            // Add to an established dataset
            else
            {
                currentSortedColumn++;
                currentSortedColumn = LoopIndex(currentSortedColumn, data.length);

                for (var row = 0; row < amountOfRows; row++) {
                    var value = values[row];
                    data[currentSortedColumn].push(value);
                }
            }
        }
    });

    // Overwrite headers if variable exists
    if (typeof overwriteHeaders !== 'undefined')
    {
        console.log("Overwriting headers " + overwriteHeaders)

        dataHeaders = [];

        if (addDate)
        {
            dataHeaders.push("Date");
        }

        overwriteHeaders.forEach(element => {
            dataHeaders.push(element);
        });
    }

    return [dataHeaders, data];
}

function LoopIndex(index, arrayLength)
{
    var looped = (index % arrayLength + arrayLength) % arrayLength;
    return looped;
}

// #endregion