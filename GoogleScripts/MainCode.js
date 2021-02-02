// Data Importing & Sorting Program for Fertsman.com

function onOpen(e) {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu("Statistics Canada").addItem("Import CSV by table number", "ImportCsvFromUrl").addToUi();
}

function log(message) {
    SpreadsheetApp.getActive().toast(message, "⚠️ Alert");
    console.log("Alert: " + message);
}

function PromptUserForSortingMethod(promptText) {
    // Drop down menu?
    var ui = SpreadsheetApp.getUi();
    var prompt = ui.prompt(promptText);
    var response = prompt.getResponseText();
    return response;
}

function PromptUserForTable(promptText) {
    var ui = SpreadsheetApp.getUi();
    var prompt = ui.prompt(promptText);
    var response = prompt.getResponseText();
    return response;
}

function PromptUserForLocation(promptText) {
    var ui = SpreadsheetApp.getUi();
    var prompt = ui.prompt(promptText);
    var response = prompt.getResponseText();
    return response;
}

const SortingMethodEnum = Object.freeze({"Undefined":0, "StatsCan":1, "Covid":2, "Teranet":3})

// Imports a CSV file from a URL, sorts it, then imports it into the Google Sheet using API v4
function ImportCsvFromUrl(sortingMethod = SortingMethodEnum.Undefined, tableID = "", yoy = false) {
    var location;
    var url;

    if (sortingMethod == SortingMethodEnum.Undefined)
        sortingMethod = PromptUserForSortingMethod("Enter sorting method (SortingMethodEnum.?)");

    log("Using Sorting Method " + sortingMethod);
    // Form URL and location to place CSV
    switch(sortingMethod)
    {
        case SortingMethodEnum.StatsCan:
            if (tableID == "")
                tableID = PromptUserForTable("Please enter table number");
        
            location = tableID;

            url = ("https://www150.statcan.gc.ca/n1/tbl/csv/" + tableID + "-eng.zip");
            break;

        case SortingMethodEnum.Covid:
            location = "Covid";
            url = "https://health-infobase.canada.ca/src/data/covidLive/covid19-download.csv";
            break;

        case SortingMethodEnum.Teranet:
            location = "Teranet";
            url = "https://housepriceindex.ca/_data/House_Price_Index.csv";
            break;

        default:
            log("ERROR: No sorting method was specified.");
            return;
    }

    if (yoy)
        location += " - YoY";

    DoesSheetExist(location);

    log("Fetching");
    var fetched = UrlFetchApp.fetch(url);
    var csv;
    
    switch(sortingMethod)
    {
        case SortingMethodEnum.StatsCan:
            log("Unzipping");
            var unzipblob = Utilities.unzip(fetched.getBlob());
            csv = unzipblob[0].getDataAsString();
            break;

        case SortingMethodEnum.Covid:
            csv = fetched;
            break;

        case SortingMethodEnum.Teranet:
            csv = fetched;
            break;
    }

    log("Parsing");
    var contents = Utilities.parseCsv(csv);

    //contents = LimitRows(contents, 300);

    var data;

    log("Sorting");
    switch(sortingMethod)
    {
        case SortingMethodEnum.StatsCan:
            data = SafeSortStatsCanData(contents);
            break;

        case SortingMethodEnum.Covid:
            data = SortCovidData(contents);
            break;

        case SortingMethodEnum.Teranet:
            data = SortTeranetData(contents);
            break;
    }
    
    if (yoy)
        data = ConvertValuesToYoY(data);

    //log("Clearing Sheet");
    //ClearEntireSheet(location);

    log("Writing to sheet");
    WriteDataToSheet(data, location);

    log("The CSV file was successfully fetched and imported");
}

function DoesSheetExist(location)
{
    var ss = SpreadsheetApp.getActive();
    if (!ss.getSheetByName(location))
    {
        log("Couldn't find: " + location + ". Adding new sheet.");
        ss.insertSheet(location);
    }
}

// Writes a 2D array of data into existing sheet
function WriteDataToSheet(_data, location, startRow = 1) {
    var spreadSheetName = location;
    var ss = SpreadsheetApp.getActive();
    var sheet = ss.getSheetByName(spreadSheetName);
    var ranges = sheet.getRange(startRow, 1, _data[0].length, _data.length);
    var request = {
        'valueInputOption': 'USER_ENTERED',
        'data': [
            {
                'range': spreadSheetName + "!" + ranges.getA1Notation(),
                'majorDimension': 'COLUMNS',
                'values': _data
            }]
    };
    Sheets.Spreadsheets.Values.batchUpdate(request, ss.getId());
}

function ClearEntireSheet(location) {
    var spreadSheetName = location;
    var ss = SpreadsheetApp.getActive();
    var sheet = ss.getSheetByName(spreadSheetName);
    var ranges = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn());
    var request = {
        'valueInputOption': 'USER_ENTERED',
        'data': [
            {
                'range': spreadSheetName + "!" + ranges.getA1Notation(),
                'majorDimension': 'ROWS',
                'values': "userEnteredData"
            }]
    };
    Sheets.Spreadsheets.Values.batchUpdate(request, ss.getId());
}

function FillOutArray(array, fillItem) {
    var fill = (fillItem === undefined) ? "" : fillItem;

    // Get the max row length out of all rows in array.
    var initialValue = 0;
    var maxRowLen = array.reduce(function (acc, cur) {
        return Math.max(acc, cur.length);
    }, initialValue);

    // Fill shorter rows to match max with selected value.
    var filled = array.map(function (row) {
        var dif = maxRowLen - row.length;
        if (dif > 0) {
            var arizzle = [];
            for (var i = 0; i < dif; i++) { arizzle[i] = fill };
            row = row.concat(arizzle);
        }
        return row;
    })
    return filled;
}

function LimitRows(data, rows) {
    var newData = [[]];

    for (var i = 0; i < rows; i++) {
        newData[i] = data[i];
    }

    return newData;
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
