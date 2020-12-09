var sheets_api_key = "AIzaSyBCKARaVh3Ho0f5NEdAfvzTi5_U-UgkNLM";
//var sheets_api_key = "AIzaSyA83UIfNAZQ0Lm1a_cBhOtznSiNf8oWrdw";

'use strict';

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

// Magical Lambda to convert column num to letter
ColumnNumToLetter = (n) => (a=Math.floor(n/26)) >= 0 ? ColumnNumToLetter(a-1) + String.fromCharCode(65+(n%26)) : '';

// Requires FinishedLink(link) where calling this function
function FormatLinkForVectors(spreadSheetID, sheetID, ...vectors)
{
    const startOfLink = "https://sheets.googleapis.com/v4/spreadsheets/";
    const forceRows = "&majorDimension=ROWS"
    
    const apiKey = "&key=" + sheets_api_key;

    // Pull first row
    const range = "/values:batchGet?ranges=" + sheetID + "!1:1";

    var link = startOfLink + spreadSheetID + range + forceRows + apiKey;

    var vectorColumns = [];
    var firstRow = [];

    $.getJSON(link, json => {
        firstRow = json.valueRanges[0].values[0];

        // cycle through vectors, find in row, add to array, remove from array
        for (var i = 0; i < vectors.length; i++)
        {
            vector = vectors[i];
            
            var vectorFound = false;
            for (var j = 0; j < firstRow.length; j++)
            {
                value = firstRow[j];

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

        // Get Date
        var range = "/values:batchGet?ranges=" + sheetID + "!A:A";
        // Get Columns
        ranges.forEach(element => {
            range = range + "&ranges=" + sheetID + "!" + element + ":" + element;
        });
    
        const forceColumns = "&majorDimension=COLUMNS";

        link = startOfLink + spreadSheetID + range + forceColumns + apiKey;

        //Callback function
        FinishedLink(link)
    });
}

// EXAMPLE - AddRangesToVectorLink(FormatLinkForVectors(...), 1, 32, 50, 100000)
//     Formats the link to pull from row 1 to 32 then skip until 50 to 100000
function AddRangesToVectorLink(link, ...startCommaEnd)
{
    // Sort rows for use
    var rows = [[]];
    var start = true;
    var set = 0;
    var nextSet = false;
    for (var i = 0; i < startCommaEnd.length; i++)
    {
        value = startCommaEnd[i];
        if (start)
        {
            if (nextSet)
            {
                rows.push(new Array());
                set++;
            }
            rows[set][0] = value;
        }
        else
        {
            rows[set][1] = value;          
        }
        start = !start;
    }

    // Add rows to link ranges
}

// Add SHEETID and shorten ranges to "C:C", "D:E"
function FormatLinkWithRanges(spreadSheetID, ...ranges) {
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

function SortJSONintoHeadersAndValues(json) {

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

            console.log(header, isHeader);
            // If header is not a number, add a new dataset
            if (isHeader)
            {
                currentSortedColumn++;
                data[currentSortedColumn] = new Array();

                // Add to headers
                dataHeaders[currentSortedColumn] = values[0];
                // Add to values
                for (var row = 1; row < amountOfRows; row++)
                {
                    value = values[row];
                    data[currentSortedColumn].push(value);
                }
                console.log("Adding new dataset " + data.length);

            }
            // Add to an established dataset
            else
            {
                console.log("Adding new values to established dataset");
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
        console.log("Overwriting headers" + overwriteHeaders)

        dataHeaders = [];
        dataHeaders.push("Date");
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