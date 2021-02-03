// #region Chart Options

var lineOptions = {
    colors: [
        "rgba(0, 175, 181, 1)",
        "rgba(255, 119, 0, 1)",
        "rgba(163, 0, 0, 1)",
        "rgba(0, 71, 119, 1)"
    ],
    colorWhite: "rgba(255, 255, 255, 1)",
    trendLine: "rgba(0, 0, 0, 1)",
    GetColor: function(i) {
        // Loops color list automatically
        //return this.colors[LoopIndex(i, this.colors.length)];
        var baseGrey = 85;
        var increment = 10;
        var loopAt = (255 - baseGrey) / increment + 1;

        var grey = baseGrey + (increment * LoopIndex(i, loopAt));

        return `rgba(${grey}, ${grey}, ${grey}, 0.5)`
    },
    GetRandomColor: function(i) {
        return this.colors[RandomInt(this.colors.length)];
    }
}

function RandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

var globalLoadingSymbolClass = 'lds-dual-ring';
var chartDefaultColor = "rgba(0, 0, 0, 0.1)";
var chartFontFamily = "Open Sans";

var chartTitleOptions = {
    position: "top",
    fontFamily: chartFontFamily,
    fontColor: "#000000",
    fontStyle: 'bold'
};

Chart.defaults.global.defaultColor = chartDefaultColor;
Chart.defaults.global.defaultFontFamily = chartFontFamily;
// Skips null or "" points in line / radar charts
Chart.defaults.global.spanGaps = false;


// #endregion

// #region  FUNCTIONS

// Magical lambda to convert column number to letter
ColumnNumToLetter = (n) => (a = Math.floor(n / 26)) >= 0 ? ColumnNumToLetter(a - 1) + String.fromCharCode(65 + (n % 26)) : '';

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
 * @param {Function} functionCallback Function called when line chart is ready
 * @param {String} spreadSheetID The spreadsheet ID
 * @param {String} sheetName The sheet name
 * @param {Number} vectors Vectors to pull from sheet
 *                        Examples: "v12093102, vå39210901, v231090"
 */
function FormatLinkWithVectors(functionCallback, spreadSheetID, sheetName, ...vectors) {
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
        for (var i = 0; i < vectors.length; i++) {
            var vector = vectors[i];

            var vectorFound = false;
            for (var j = 0; j < firstRow.length; j++) {
                var value = firstRow[j];

                if (value == vector) {
                    vectorColumns.push(j);
                    vectorFound = true;
                    break;
                }
            }

            if (!vectorFound)
                console.error("ERROR: Vector not found - " + vector);
        }

        // Convert to A1
        var ranges = [];
        vectorColumns.forEach(e => {
            ranges.push(ColumnNumToLetter(e));
        });

        var linkRanges = "/values:batchGet?ranges=";
        if (typeof rowRanges == 'undefined') {
            console.log("Not adding rows to ranges");

            // Get Date
            linkRanges = "/values:batchGet?ranges=" + sheetName + "!A:A";
            // Get Columns
            ranges.forEach(element => {
                linkRanges = linkRanges + "&ranges=" + sheetName + "!" + element + ":" + element;
            });
        } else {
            console.log("Adding rows to ranges");
            console.log(ranges);
            // First entry format exception of date
            linkRanges += sheetName + "!A" + rowRanges[0][0] + ":A" + rowRanges[0][1];
            for (var j = 0; j < rowRanges.length; j++) {
                var date = true;
                for (var i = 0; i < ranges.length; i++) {
                    // Get Date unless exception
                    if (j != 0 & date) {
                        linkRanges += "&ranges=" + sheetName + "!A" + rowRanges[j][0] + ":A" + rowRanges[j][1];
                        date = false;
                        i--;
                    }
                    // Get Columns
                    else {
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
        functionCallback(link);
    });
}

// Add 
function AddRowRangesToVectorLink(link, ...rows)
{
    var linkRanges = "/values:batchGet?ranges=";
    if (typeof rowRanges == 'undefined') {
        console.log("Not adding rows to ranges");

        // Get Date
        linkRanges = "/values:batchGet?ranges=" + sheetName + "!A:A";
        // Get Columns
        ranges.forEach(element => {
            linkRanges = linkRanges + "&ranges=" + sheetName + "!" + element + ":" + element;
        });
    } else {
        console.log("Adding rows to ranges");
        console.log(ranges);
        // First entry format exception of date
        linkRanges += sheetName + "!A" + rowRanges[0][0] + ":A" + rowRanges[0][1];
        for (var j = 0; j < rowRanges.length; j++) {
            var date = true;
            for (var i = 0; i < ranges.length; i++) {
                // Get Date unless exception
                if (j != 0 & date) {
                    linkRanges += "&ranges=" + sheetName + "!A" + rowRanges[j][0] + ":A" + rowRanges[j][1];
                    date = false;
                    i--;
                }
                // Get Columns
                else {
                    linkRanges += "&ranges=" + sheetName + "!" + ranges[i] + rowRanges[j][0] + ":" + ranges[i] + rowRanges[j][1];
                }
                console.log(ranges[i]);
            }
        }
    }
    const forceColumns = "&majorDimension=COLUMNS";

    link = startOfLink + spreadSheetID + linkRanges + forceColumns + apiKey;
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
        } else {
            linkRanges = linkRanges + "&ranges=" + sheetName + "!" + element;
        }
    });

    link = startOfLink + spreadSheetID + linkRanges + forceColumns + apiKey;

    return link;
}

// Manipulate charts dataset's headers
function OverwriteChartHeader(chartID, ...headers)
{

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
            // If the whole header is not a number & the first letter is not a number (it is a date), it must be a header
            if (isNaN(header) && isNaN(header[0]))
                isHeader = true;     

            // If header is not a number, add a new dataset
            if (isHeader) 
            {
                currentSortedColumn++;
                data[currentSortedColumn] = new Array();

                dataHeaders[currentSortedColumn] = values[0];
                for (var row = 1; row < amountOfRows; row++) {
                    value = values[row];
                    data[currentSortedColumn].push(value);
                }
            }
            // Add to an established dataset
            else
             {
                if (data.length == 0)
                {
                    console.error("LINK ERROR: You forgot to grab headers! (Example: \"A1:H1\")");
                }

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
    if (typeof overwriteHeaders !== 'undefined') {
        console.log("Overwriting headers " + overwriteHeaders)

        dataHeaders = [];

        if (addDate) {
            dataHeaders.push("Date");
        }

        overwriteHeaders.forEach(element => {
            dataHeaders.push(element);
        });
    }

    data = RemoveEmptyRowsAndValues(data);

    return [dataHeaders, data];
}

function RemoveEmptyRowsAndValues(data)
{
    // [col][row] -> [row][col]
    data = Transpose(data);

    // Removes empty rows
    for (var row = 0; row < data.length; row++)
    {
        var noData = true;

        for (var col = 1; col < data[0].length; col++)
        {
            var value = data[row][col];
            if (String(value).length > 0 || value == null)
            {
                noData = false;
                break;
            }
        }

        // No data in this row, remove it
        if (noData)
        {
            data.splice(row, 1);
            row--;
        }  
    }

    data = Transpose(data);

    // Removes empty values
    for (var col = 0; col < data.length; col++)
    {
        for (var row = 0; row < data[0].length; row++)
        {
            var value = data[col][row];

            if (String(value).length == 0)
                value = null;

            data[col][row] = value;
        }
    }

    return data;
}

function LoopIndex(index, arrayLength) {
    var looped = (index % arrayLength + arrayLength) % arrayLength;
    return looped;
}

function AbbreviateNumber(n) {
    var ranges = [
        { divider: 1e12, suffix: 'T' },
        { divider: 1e9, suffix: 'B' },
        { divider: 1e6, suffix: 'M' },
        { divider: 1e3, suffix: 'k' }
    ];

    for (var i = 0; i < ranges.length; i++) {
        if (Math.abs(n) >= ranges[i].divider) {
            return (n / ranges[i].divider).toString() + ranges[i].suffix;
        }
    }
    return n;
}

function DownloadChart(chartID, downloadID)
{
    /*Get image of canvas element*/
    var url_base64jp = document.getElementById(chartID).toDataURL("image/jpg");
    /*get download button (tag: <a></a>) */
    document.getElementById(downloadID).href = url_base64jp;
    /*insert chart image url to download button (tag: <a></a>) */
}

function Transpose(array) {
    var tempArray = [];
    for (var i = 0; i < array.length; ++i) 
    {
        for (var j = 0; j < array[i].length; ++j) 
        {
            // could cause a problem with sheets fill range
            if (array[i][j] === undefined) continue;

            if (tempArray[j] === undefined) tempArray[j] = [];
            tempArray[j][i] = array[i][j];
        }
    }
    return tempArray;
}

// #endregion