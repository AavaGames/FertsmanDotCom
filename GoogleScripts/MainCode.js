// Statistics Canada Data Import Program for FertsmanDotCom

function onOpen(e) {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu("Statistics Canada").addItem("Import CSV by table number", "ImportCsvFromUrl").addToUi();
}

function log(message) {
    SpreadsheetApp.getActive().toast(message, "⚠️ Alert");
    console.log("Alert: " + message);
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

// Imports a CSV file from a URL, sorts it, then imports it into the Google Sheet using API v4
function ImportCsvFromUrl(tableID = "", yoy = false) {
    var table;

    if (tableID == "")
        table = PromptUserForTable("Please enter table number");
    else
        table = tableID;

    var url = ("https://www150.statcan.gc.ca/n1/tbl/csv/" + table + "-eng.zip");

    log("Fetching");
    var zipblob = UrlFetchApp.fetch(url).getBlob();

    log("Unzipping");
    var unzipblob = Utilities.unzip(zipblob);
    var unzipstr = unzipblob[0].getDataAsString();

    log("Parsing");
    var contents = Utilities.parseCsv(unzipstr);

    //contents = LimitRows(contents, 300);

    log("Sorting");
    var data = SafeSortStatsCanData(contents);
    
    if (yoy)
        data = ConvertValuesToYoY(data);

    var location = table;
    if (yoy)
        location += " - YoY";

    //console.log(data);

    //log("Clearing Sheet");
    //ClearEntireSheet(location);

    log("Writing to sheet");
    WriteDataToSheet(data, location);

    log("The CSV file was successfully fetched and imported");
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
    Sheets.Spreadsheets.Values.batchUpdate(request, SpreadsheetApp.getActiveSpreadsheet().getId());
}

function ClearEntireSheet(location) {
    var spreadSheetName = location;
    var request = {
        'valueInputOption': 'USER_ENTERED',
        'data': [
            {
                'range': spreadSheetName,
                'majorDimension': 'ROWS',
            }]
    };
    Sheets.Spreadsheets.Values.batchUpdate(request, SpreadsheetApp.getActiveSpreadsheet().getId());

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
    Sheets.Spreadsheets.Values.batchUpdate(request, SpreadsheetApp.getActiveSpreadsheet().getId());
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

function GetMaxRowLength(array) {
    
}
