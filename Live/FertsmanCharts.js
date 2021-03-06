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
        let maxGrey = 205;
        var increment = 10;
        var loopAt = (maxGrey - baseGrey) / increment + 1;

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
var globalLoadingTextClass = 'lds-text';

var globalLoadingText = "fetching latest data";

var globalFailedSymbolClass = 'chart-fail';
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

// Sheet Dictionary for holding sheets from spreadsheets, for use in charts.
// SheetDictionary["spreadsheetID_sheetName"] = [dataHeaders, data];
var SheetDictionary = new Object(); 

const STOREDICTIONARY = false;

// #region  FUNCTIONS

function SetSheetDictionary(sheetKey, sortedData)
{
    SheetDictionary[sheetKey] = sortedData;

    if (STOREDICTIONARY)
    {
        if (typeof(Storage) !== "undefined")
        {
            console.log("storing sheet dic");
            window.sessionStorage.setItem('Fertsman.com-SheetDictionary', JSON.stringify(SheetDictionary));
            // chrome quota is 25mb
        }
        else
        {
            console.log("No local storage");
        }
    }
}

FertsmanInitialization();
function FertsmanInitialization()
{
    //console.log("Fertsman Charts Initializing");
    if (STOREDICTIONARY)
    {
        if (window.sessionStorage.getItem('Fertsman.com-SheetDictionary') != null)
        {
            console.log("Obtained through session storage");
            SheetDictionary = JSON.parse(window.sessionStorage.getItem('Fertsman.com-SheetDictionary'));
        }
    }
}

// Magical lambda to convert column number to letter
ColumnNumToLetter = (n) => (a = Math.floor(n / 26)) >= 0 ? ColumnNumToLetter(a - 1) + String.fromCharCode(65 + (n % 26)) : '';

function Sleep(seconds) {
    let ms = seconds * 1000;
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Seconds
const TimeTillNextAttempt = 5;
// 100s is gotten from googles user request quota
const MaxAttempts = 100 / TimeTillNextAttempt + 1;

async function WaitForData(DataObtained, sheetKey)
{
    // stopped calling for sheet
    if (SheetDictionary[sheetKey] === false)
    {
        DataObtained(false);
        return;
    }
    // has data
    else if (SheetDictionary[sheetKey] !== true && SheetDictionary[sheetKey] !== undefined)
    {
        DataObtained(true);
        return;
    }

    setTimeout(function() {
        WaitForData(DataObtained, sheetKey);
    }, 100);
}

async function IsSheetInDictionary(Done, sheetKey, spreadSheetID, sheetName)
{
    if (SheetDictionary[sheetKey])
    {
        if (SheetDictionary[sheetKey] === true)
            await WaitForData(DataObtained, sheetKey);
        else
            DataObtained(true);

        function DataObtained(obtained)
        {
            if (obtained)
                Done(true);
            else
                Done(false);
        }
    }
    else
    {    
        SheetDictionary[sheetKey] = true;

        let link;
        const startOfLink = "https://sheets.googleapis.com/v4/spreadsheets/";
        const forceColumns = "&majorDimension=COLUMNS"
        const apiKey = "&key=" + sheets_api_key;
        const linkRanges = "/values:batchGet?ranges=" + sheetName;
    
        link = startOfLink + spreadSheetID + linkRanges + forceColumns + apiKey;

        let attempts = 1;
        let success = false;

        while (attempts <= MaxAttempts)
        {
            try {
                await $.getJSON(link, json => {
                    attempts = MaxAttempts + 1;
                        
                    var sortedData = SortJSONintoHeadersAndValues(json)
                    SetSheetDictionary(sheetKey, sortedData);

                    success = true;
                    Done(true);
                });
            } 
            catch(textStatus) {
                if ((typeof textStatus !== 'undefined'))
                {
                    if (typeof textStatus.responseJSON !== 'undefined')
                    {
                        if (textStatus.responseJSON.error.code == 404)
                        {
                            console.error("Chart ERROR: Failed to obtain JSON, sheet NOT found!" + 
                            "\n\nJSON Error Message: " + textStatus.responseJSON.error.message);
                            attempts = MaxAttempts + 1;
                        }   
                        else
                        {
                            console.error("Chart ERROR: Failed to obtain JSON, make sure spreadsheet is public. Attempt " + attempts + "/" + MaxAttempts + "\n\nJSON Error Message: " + textStatus.responseJSON.error.message);
                            await Sleep(TimeTillNextAttempt);
                        }
                    }
                    else
                    {
                        console.log(textStatus);
                    }
                }
                else
                {
                    console.error("Chart ERROR: Failed to obtain JSON, make sure spreadsheet is public. Attempt " + attempts + "/" + MaxAttempts + "\n\nJSON Error Message: Failed to be caught.");
                    await Sleep(TimeTillNextAttempt);
                }
                
            };

            attempts++;
        }

        if (!success)
        {
            SheetDictionary[sheetKey] = false;
            Done(false);
        }
    }
}

function AddLoadingText(loadingSymbolName)
{
    var loadingText = document.createElement('P');
    loadingText.className = globalLoadingTextClass;
    loadingText.textContent = globalLoadingText;
    document.getElementById(loadingSymbolName).appendChild(loadingText);
}

async function GetDataWithHeaders(CallbackFunction, loadingSymbolName, spreadSheetID, sheetName, ...headers) 
{
    let sheetKey = spreadSheetID + "_" + sheetName;

    IsSheetInDictionary(Done, sheetKey, spreadSheetID, sheetName);

    function Done(isInDic)
    {
        if (isInDic !== false)
        {
            let data = GetData();

            CallbackFunction(data);
        }
        else
        {
            console.error("Chart ERROR: Failed all attempts to acquire the data, please reload the page to try again.");
            let loadingSymbol = document.getElementById(loadingSymbolName);
            $("#" + loadingSymbolName).find("." + globalLoadingTextClass).remove();
            loadingSymbol.className = globalFailedSymbolClass;
        }
    }

    function GetData()
    {
        let sheetData = SheetDictionary[sheetKey];
        let dataHeaders = [];
        let data = [];

        let firstRow = sheetData[0];
        let headerColumns = [];

        // cycle through headers, find in row, add to array, remove from array
        for (let i = 0; i < headers.length; i++) {
            let header = headers[i];

            let headerFound = false;
            for (let j = 0; j < firstRow.length; j++) {
                let value = firstRow[j];

                if (value == header) {
                    headerColumns.push(j);
                    headerFound = true;
                    break;
                }
            }

            if (!headerFound)
                console.error("ERROR: Header not found - " + header);
        }

        //push date col
        dataHeaders.push(sheetData[0][0]);
        data.push(sheetData[1][0]);

        headerColumns.forEach(e => {
            dataHeaders.push(sheetData[0][e]);
            data.push(sheetData[1][e]);
        });

        data = RemoveEmptyRowsAndValues(data);

        return [dataHeaders, data];
    }
}

// TODO
async function GetDataWithA1(CallbackFunction, loadingSymbol, spreadSheetID, sheetName, ...ranges) {

    let sheetKey = spreadSheetID + "_" + sheetName;

    let isInDic = await IsSheetInDictionary(sheetKey, spreadSheetID, sheetName);
    
    if (isInDic !== false)
    {
        console.log("getting data");

        let data = GetData();

        CallbackFunction(data);
    }
    else
    {
        console.error("is in dic is false");
        // failed everything, set loading symbol to failed
        loadingSymbol.className = globalFailedSymbolClass;
    }

    function GetData()
    {
        var sheetData = SheetDictionary[sheetKey];

        // json is sorted when its obtained
        // get A1 ranges then data returned

        // need reverse lambda

        return sheetData;
    }
}

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
        functionCallback(link);
    });
}

/**
 * Overwrites any charts headers must be called after the chart is created
 * 
 * @param {Chart.js} chart The chart to adjust
 * @param  {...String} headers The headers to change to. Example: "Header 1", "Header 2"
 */
function OverwriteChartHeader(chart, showLabels, ...headers)
{
    let headerSeparator = ", ";
    let currentHeader = 0;
    
    if (chart.config.type == 'scatter')
    {
        // Hide Y axes labels
        if (!showLabels)
        {
            for (let axes = 0; axes < chart.options.scales.xAxes.length; axes++)
                chart.options.scales.xAxes[axes].scaleLabel.display = false;
        }

        if (currentHeader <= headers.length)
        {
            for (let axes = 0; axes < chart.options.scales.xAxes.length; axes++)
            {                
                let label = String(chart.options.scales.yAxes[axes].scaleLabel.labelString);
                let labels = label.split(headerSeparator);
                
                for (let i = 0; i < labels.length; i++)
                {
                    // if header is nothing, keep same label
                    if (headers[currentHeader].length != 0)
                        labels[i] = headers[currentHeader];

                    currentHeader++;

                    // break and write if no headers left
                    if (currentHeader >= headers.length)
                        break;
                }

                label = ""
                for (let i = 0; i < labels.length; i++)
                {
                    if (i != 0)
                        label += headerSeparator
                    label += labels[i];
                }

                chart.options.scales.xAxes[axes].scaleLabel.labelString = label

                // Leave the function if no more headers left
                if (currentHeader >= headers.length)
                    break;
            }
        }
    }

    if (chart.config.type == 'line' || chart.config.type == 'scatter')
    {
        // Hide Y axes labels
        if (!showLabels)
        {
            for (let axes = 0; axes < chart.options.scales.yAxes.length; axes++)
                chart.options.scales.yAxes[axes].scaleLabel.display = false;
        }
        
        if (currentHeader <= headers.length)
        {
            for (let axes = 0; axes < chart.options.scales.yAxes.length; axes++)
            {                
                let label = String(chart.options.scales.yAxes[axes].scaleLabel.labelString);
                let labels = label.split(headerSeparator);
                
                for (let i = 0; i < labels.length; i++)
                {
                    // if header is nothing, keep same label
                    if (headers[currentHeader].length != 0)                
                        labels[i] = headers[currentHeader];

                    currentHeader++;

                    // break and write if no headers left
                    if (currentHeader >= headers.length)
                        break;
                }

                label = ""
                for (let i = 0; i < labels.length; i++)
                {
                    if (i != 0)
                        label += headerSeparator
                    label += labels[i];
                }

                chart.options.scales.yAxes[axes].scaleLabel.labelString = label

                // Leave the function if no more headers left
                if (currentHeader >= headers.length)
                    break;
            }
        }
    }

    currentHeader = 0;

    // Overwrites tooltips
    if (chart.config.type == 'line' || chart.config.type == 'scatter')
    {
        for (let i = 0; i < chart.data.datasets.length; i++)
        {
            let label = chart.data.datasets[i].label;

            // if header is nothing, keep same label
            if (headers[currentHeader].length != 0)                     
                label = headers[currentHeader];

            currentHeader++;

            chart.data.datasets[i].label = label;

            // break and write if no headers left
            if (currentHeader >= headers.length)
                break;
        };
    }

    if (chart.config.type == 'bar' || chart.config.type == 'horizontalBar' || chart.config.type == 'doughnut' || chart.config.type == 'pie')
    {
        let labels = chart.data.labels;
        for (let i = 0; i < labels.length; i++)
        {
            // if header is nothing, keep same label
            if (headers[currentHeader].length != 0)                     
                labels[i] = headers[currentHeader];

            currentHeader++;

            // break and write if no headers left
            if (currentHeader >= headers.length) //TEST || currentHeader > labels.length)
                break;
        }
        chart.data.labels = labels;
    }

    chart.update();
}

/**
 * Changes data range depending on dates provided, works with LINE & SCATTER charts
 * 
 * @param {String} startDate Must follow data format. (Example: "2013-01", "2020-06-05")
 * @param {*} endDate Must follow data format. (Example: "2013", "2020-12-25")
 */
function SetDateRangeToChart(chart, startDate, endDate = "")
{
    let dates = chart.data.labels;
    let startRow = -1;
    let endRow = -1;

    let datasets = chart.data.datasets;

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
    else if (startDate != "")
        console.error("Chart ERROR: Failed to find start date - " + startDate 
            + "\n    Date format = " + dates[0]);

            
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

    if (endRow != -1)
    {
        let amountToRemoveFromBack = dates.length - endRow;
        dates.splice(endRow + 1, amountToRemoveFromBack);

        datasets.forEach(set => {
            set.data.splice(endRow + 1, amountToRemoveFromBack);
        });
    }
    else if (endDate != "")
        console.error("Chart ERROR: Failed to find end date - " + endDate);

    if (chart.config.type == "scatter")
        CalculateTrendLine(chart)
        
    chart.update();
}

/**
 * Sorts Google Sheets v4 API json into headers and values that can be utilized by Chart.js
 * @param {2D Array} json JSON to be sorted
 * @param {Boolean} addDate keeps date in headers & values
 */

 // TODO Destroy parts of this function, as its unnecessary
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
    for (let row = 0; row < data.length; row++)
    {
        let noData = true;

        for (let col = 1; col < data[0].length; col++)
        {
            let value = data[row][col];

            // Has only date, breaks out and deletes row
            if (data[row].length == 1)
                break;

            if (value == null)
                continue;

            if (String(value).length > 0)// || value == null)
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

    // [row][col] -> [col][row]

    data = Transpose(data);

    // Removes empty values
    for (let col = 1; col < data.length; col++)
    {
        for (let row = 0; row < data[0].length; row++)
        {                
            let value = data[col][row];

            if (String(value).length == 0 || value == undefined)
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

function Transpose(array) {
    var tempArray = [];
    for (var i = 0; i < array.length; ++i) 
    {
        for (var j = 0; j < array[i].length; ++j) 
        {
            if (tempArray[j] === undefined) tempArray[j] = [];
            tempArray[j][i] = array[i][j];
        }
    }
    return tempArray;
}

function DownloadChart(event, downloadID, downloadTitle = "")
{
    event.preventDefault();

    let downloadDiv =  document.getElementById(downloadID);
    // Five parents out is the whole container  
    let containerParentDiv = downloadDiv.parentNode.parentNode.parentNode.parentNode.parentNode;
    console.log(downloadTitle);
    let title = "FertsmanCharts-" + downloadTitle;
    // Remove whitespace
    title = title.replace(/\s/g, "");
    title += ".jpg";

    html2canvas(containerParentDiv).then(function(canvas) {
        let url_base64jpg = canvas.toDataURL();
        
        var a = document.createElement('A');
        a.href = url_base64jpg;
        a.download = title;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
}

// Detects mobile / tablet browser
function DetectMobileBrowser()
{
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};

// #endregion

