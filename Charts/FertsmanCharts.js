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
 * Formats link to pull A1 notation from specific spreadsheet and sheet.
 * 
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

/**
 * Formats link to pull HEADERS from specific spreadsheet and sheet.
 * 
 * Where this function is called:
 *   - REQUIRED callback function(link), place all subsequent code in this function
 * 
 * @param {Function} functionCallback Function called when line chart is ready
 * @param {String} spreadSheetID The spreadsheet ID
 * @param {String} sheetName The sheet name
 * @param {Number} headers Headers to pull from sheet
 *                        Examples: "v12093102, vå39210901, v231090"
 */
function FormatLinkWithHeaders(functionCallback, spreadSheetID, sheetName, ...headers) {
    const startOfLink = "https://sheets.googleapis.com/v4/spreadsheets/";
    const forceRows = "&majorDimension=ROWS"

    const apiKey = "&key=" + sheets_api_key;

    // Pull first row
    const linkRanges = "/values:batchGet?ranges=" + sheetName + "!1:1";

    var link = startOfLink + spreadSheetID + linkRanges + forceRows + apiKey;

    var headerColumns = [];
    var firstRow = [];

    $.getJSON(link, json => {
        firstRow = json.valueRanges[0].values[0];

        // cycle through headers, find in row, add to array, remove from array
        for (var i = 0; i < headers.length; i++) {
            var header = headers[i];

            var headerFound = false;
            for (var j = 0; j < firstRow.length; j++) {
                var value = firstRow[j];

                if (value == header) {
                    headerColumns.push(j);
                    headerFound = true;
                    break;
                }
            }

            if (!headerFound)
                console.error("ERROR: Header not found - " + header);
        }

        // Convert to A1
        var ranges = [];
        headerColumns.forEach(e => {
            ranges.push(ColumnNumToLetter(e));
        });

        var linkRanges = "/values:batchGet?ranges=";
        // Get Date
        linkRanges = "/values:batchGet?ranges=" + sheetName + "!A:A";
        // Get Columns
        ranges.forEach(element => {
            linkRanges = linkRanges + "&ranges=" + sheetName + "!" + element + ":" + element;
        });

        const forceColumns = "&majorDimension=COLUMNS";

        link = startOfLink + spreadSheetID + linkRanges + forceColumns + apiKey;

        //Callback function
        functionCallback(link);
    }).fail( function(textStatus) {
        console.error("Chart ERROR: Failed to obtain JSON, make sure spreadsheet is public." + "\n\nJSON Error Message: " + textStatus.responseJSON.error.message);
    });
}

/**
 * Overwrites any charts headers must be called after the chart is created
 * 
 * @param {Chart.js} chart The chart to adjust
 * @param  {...String} headers The headers to change to. Example: "Header 1", "Header 2"
 */



// Line = chart.options.scales.yAxes[axes].scaleLabel.labelString

// Scatter = chart.options.scales.yAxes[axes].scaleLabel.labelString
//          chart.options.scales.xAxes[axes].scaleLabel.labelString

// Donut = charts.data.labels
// Bar = charts.data.labels
// TODO add functionality for scatter & bar & donut 
function OverwriteChartHeader(chart, ...headers)
{
    var currentHeader = 0;

    // Hide Y axes labels
    if (headers.length == 0)
    {
        for (var axes = 0; axes < chart.options.scales.yAxes.length; axes++)
        {
            chart.options.scales.yAxes[axes].scaleLabel.display = false;
        }
    }
    else
    {
        for (var axes = 0; axes < chart.options.scales.yAxes.length; axes++)
        {
            chart.options.scales.yAxes[axes].scaleLabel.display = true;
            
            const separator = ", ";
            // var label = String(chart.data.datasets[set].label);
    
            var label = String(chart.options.scales.yAxes[axes].scaleLabel.labelString);
    
            var labels = label.split(", ");
            
            for (var i = 0; i < labels.length; i++)
            {
                labels[i] = headers[currentHeader];
                currentHeader++;
    
                // break and write if no headers left
                if (currentHeader >= headers.length)
                    break;
            }
    
            label = ""
            for (var i = 0; i < labels.length; i++)
            {
                if (i != 0)
                    label += ", "
                label += labels[i];
            }

            chart.options.scales.yAxes[axes].scaleLabel.labelString = label
    
            // Leave the function if no more headers left
            if (currentHeader >= headers.length)
                break;
        }
    }

    chart.update();
}

/**
 * Sorts Google Sheets v4 API json into headers and values that can be utilized by Chart.js
 * @param {2D Array} json JSON to be sorted
 * @param {Boolean} addDate keeps date in headers & values
 */
function SortJSONintoHeadersAndValues(json, addDate = true)
{
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
                    console.error("LINK ERROR: You forgot to grab headers! (Example: \"A1:H1\")");

                currentSortedColumn++;
                currentSortedColumn = LoopIndex(currentSortedColumn, data.length);
                
                for (var row = 0; row < amountOfRows; row++) {
                    var value = values[row];
                    data[currentSortedColumn].push(value);
                }
            }
        }
    });

    if (!addDate && String(dataHeaders[0]).toLowerCase().includes("date"))
    {
        dataHeaders.splice(0,1);
        data.splice(0,1);
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

            // Has only date, breaks out and deletes row
            if (data[row].length == 1)
                break;

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

/**
 * 
 * @param {String} startDate Must follow data format. (Example: "2013-01", "2020-06-05")
 * @param {*} endDate Must follow data format. (Example: "2013", "2020-12-25")
 */
function SetDateRangeToChart(chart, startDate, endDate = "")
{
    let dates = chart.data.labels;
    let startRow = -1;
    let endRow = -1;

    // Starts at the end of dates and moves back
    for (let i = dates.length - 1; i > -1; i--)
    {
        let date = dates[i];

        if (date == startDate)
        {
            startRow = i;
            break;
        }
    }

    if (endDate != "")
    {
        for (let i = dates.length - 1; i > -1; i--)
        {
            let date = dates[i];

            if (date == endDate)
            {
                endRow = i;
                break;
            }
        }
    }

    let datasets = chart.data.datasets;

    // remove all rows before 
    // start at end row and remove all rows after that
    if (startRow != -1)
    {
        let amountToRemoveFromFront = startRow;
        dates.splice(0, amountToRemoveFromFront);

        datasets.forEach(set => {
            set.data.splice(0, amountToRemoveFromFront);
        });
    }
    else
        console.error("Chart ERROR: Failed to find start row");

    if (endRow != -1)
    {
        let amountToRemoveFromBack = dates.length - endRow;
        dates.splice(endRow + 1, amountToRemoveFromBack);

        datasets.forEach(set => {
            set.data.splice(endRow + 1, amountToRemoveFromBack);
        });
    }

    console.log(dates[0]);
    console.log(dates[dates.length - 1])

    chart.update();
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

function DownloadChart(chartID, downloadID)
{
    /*Get image of canvas element*/
    var url_base64jp = document.getElementById(chartID).toDataURL("image/jpg");
    /*get download button (tag: <a></a>) */
    document.getElementById(downloadID).href = url_base64jp;
    /*insert chart image url to download button (tag: <a></a>) */

    /*Get image of canvas element*/
    var url_base64jp = document.getElementById(chartID).toDataURL("image/jpg");
    /*get download button (tag: <a></a>) */
    var a =  document.getElementById(downloadID);
    /*insert chart image url to download button (tag: <a></a>) */
    a.href = url_base64jp;
    a.download = downloadName;
}

// #endregion