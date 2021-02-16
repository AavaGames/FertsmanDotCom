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

function ImportStatsCan(tableID = "", nominalMethod = "")
{
    ImportCsvFromUrl(SortingMethodEnum.StatsCan, tableID, nominalMethod);
}

function ImportCovid(nominalMethod = "")
{
    ImportCsvFromUrl(SortingMethodEnum.Covid, "", nominalMethod);
}

function ImportTeranet(nominalMethod = "")
{
    ImportCsvFromUrl(SortingMethodEnum.Teranet, "", nominalMethod);
}

const SortingMethodEnum = Object.freeze({"Undefined":0, "StatsCan":1, "Covid":2, "Teranet":3})

// Nominal Method can = "YoY", "WoW", "QoQ"

// Imports a CSV file from a URL, sorts it, then imports it into the Google Sheet using API v4
function ImportCsvFromUrl(sortingMethod = SortingMethodEnum.Undefined, tableID = "", nominalMethod = "") 
 {
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

    switch(nominalMethod)
    {
      case "YoY":
        location += " - YoY";
        break;
      case "WoW":
        location += " - WoW";
        break;
      case "QoQ":
        location += " - QoQ";
        break;
    }

    //DoesSheetExist(location);

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
    

    switch(nominalMethod)
    {
      case "YoY":
        data = ConvertValuesToYoY(data);
        break;
      case "WoW":
        data = ConvertValuesToWoW(data);
        break;
      case "QoQ":
        data = ConvertValuesToWoW(data);
        break;
    }

    const MAXCOLUMNS = 5000;
    // amount of sheets = total COLUMN / max sheet COLUMNS rounded to the next int (2.3 -> 3)
    var amountOfSheets = Math.trunc((data.length / MAXCOLUMNS) + 1);
    console.log("Amount of Sheets " + MAXCOLUMNS);

    var startCol = 1;
    for (var i = 1; i <= amountOfSheets; i++)
    {
        var sheetName = location;
        if (amountOfSheets > 1)
            sheetName += " - " + String(i);

        DoesSheetExist(sheetName);

        var sheetData = [];
        // Add date column
        sheetData.push(data[0]);

        // date + 1 - 4999
        // date + 5000 - 9999
        // date + 10000 - 14998
        var endCol = startCol + MAXCOLUMNS - 1;
        for (var j = startCol; j < endCol; j++)
        {
            sheetData.push(data[j]);
        }

        console.log("sheet length " + sheetData.length + " - startCol " + startCol + " - endCol " + endCol);

        startCol = endCol;
        //log("Clearing Sheet");
        //ClearEntireSheet(location);

        log("Writing to sheet " + i);
        WriteDataToSheet(sheetData, sheetName);
        //SetDateFormat(sheetData, sheetName);
    }
    
    log("The CSV file was successfully fetched and imported");
}

// Only works for single sheets
function ConvertSheetToNominal(sheetName, nominalMethod = "")
{
    let data;
    log("Grabbing sheet");
    data = GetDataFromSheet(sheetName, true);

    log("Converting to nominal");
    switch(nominalMethod)
    {
        case "YoY":
            data = ConvertValuesToYoY(data);
            break;
        case "WoW":
            data = ConvertValuesToWoW(data);
            break;
        case "QoQ":
            data = ConvertValuesToWoW(data);
            break;
        default:
            console.error("No nominal method found, make sure you use a viable options (YoY, QoQ, WoW)");
            return;
    }
    sheetName += " - " + nominalMethod;
    DoesSheetExist(sheetName);

    log("Writing to sheet");
    WriteDataToSheet(data, sheetName);

    log("The sheet was successfully converted");
}

function SetDateFormat(sheetData, sheetName)
{
    // Needs to be done before reaching nominal conversion. Needs to be done by hand rather than by sheet formatting
    // or if this date needs to be formatted then the YoY will use the other function
    
    let dateColumn = sheetData[0];
    let aDate = dateColumn[1];

    // convert values to correct format (2020-01 or 2020-01-31)

    // If its a number
    if (!isNaN(String(aDate).replace("-", "")))
    {
        console.log(aDate);
        console.log(String(aDate).replace("-", ""));
        console.log(isNaN(String(aDate).replace("-", "")));

        log("Date format correct, no changes needed");
        return;
    }
    else
    {
        log("Changing date format");

        var ss = SpreadsheetApp.getActive();
        var sheet = ss.getSheetByName(sheetName);

        // if date has 3 parts, its in day format
        var isDayFormat = aDate.split("-").length > 2;

        if (isDayFormat)
        {
            // CANT use this because date is not a number

            sheet.getRange(sheet.getLastRow(), 1).setNumberFormat('yyyy-MM-dd');
        }
        else
        {
            sheet.getRange(sheet.getLastRow(), 1).setNumberFormat('yyyy-MM');
        }
    }
}

function DoesSheetExist(location)
{
    var ss = SpreadsheetApp.getActive();
    if (!ss.getSheetByName(location))
    {
        log("Couldn't find: " + location + ". Adding new sheet.");
        // Template sheet
        var sheetTemplate = ss.getSheetByName("Template");
        if (!sheetTemplate)
        {
            log("ERROR: Please add Template sheet");
            return;
        }
        ss.insertSheet(location, {template: sheetTemplate});
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

function GetDataFromSheet(sheetName, majorDimensionColumns = true)
{
    var ss = SpreadsheetApp.getActive();
    var sheet = ss.getSheetByName(sheetName);

    var allRanges = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn());

    var ranges = sheetName + "!" + allRanges.getA1Notation();

    var dimension = majorDimensionColumns ? 'COLUMNS' : 'ROWS';

    var response = Sheets.Spreadsheets.Values.get(ss.getId(), ranges, {
        majorDimension: dimension, 
        //valueRenderOption: 'FORMATTED_VALUE',
        //dateTimeRenderOption: 'SERIAL_NUMBER',
    });

    return response.values;
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

