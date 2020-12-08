//Statistics Canada Data Import Program for FertsmanDotCom
function onOpen(e) {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu("Statistics Canada").addItem("Import CSV by table number", "ImportCsvFromUrl").addToUi();
}

//Displays an alert as a Toast message
function log(message) {
    SpreadsheetApp.getActive().toast(message, "⚠️ Alert");
    console.log(message);
}

//Prompts user for table
function PromptUserForTable(promptText) {
    var ui = SpreadsheetApp.getUi();
    var prompt = ui.prompt(promptText);
    var response = prompt.getResponseText();
    return response;
}

//Promprts user for location
function PromptUserForLocation(promptText) {
    var ui = SpreadsheetApp.getUi();
    var prompt = ui.prompt(promptText);
    var response = prompt.getResponseText();
    return response;
}

//Imports a CSV file at a URL into the Google Sheet
function ImportCsvFromUrl(prompt = true, tableID = "") {
    var table;

    if (prompt)
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

    //contents = LimitRows(contents, 80);

    log("Sorting");
    var data = SafeSortStatsCanData(contents);
  
    //data = FillOutArray(data);

    var location = table;
    
    //log("Clearing Sheet");
    //ClearEntireSheet(location);
    log("Writing to sheet");
    WriteDataToSheet(data, location);

    log("The CSV file was successfully fetched and imported");
}

//Writes a 2D array of data into existing sheet
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

    //Get the max row length out of all rows in array.
    var initialValue = 0;
    var maxRowLen = array.reduce(function (acc, cur) {
        return Math.max(acc, cur.length);
    }, initialValue);

    //Fill shorter rows to match max with selected value.
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

function GetMaxRowLength(array) {
    
}

function LimitRows(data, rows) {
    var newData = [[]];

    for (var i = 0; i < rows; i++) {
        newData[i] = data[i];
    }

    return newData;
}

function SortStatsCanData(oldData) {
    // theData[rows][columns]
    var newData = [[]];

    var dateCol = -1, vectorCol = -1, valueCol = -1;

    // Find DATE, VECTOR and VALUE column numbers
    for (var i = 0; i < oldData[0].length; i++) {
        var cell = oldData[0][i];
        if (cell.includes("REF_DATE"))
            dateCol = i;
        else if (cell == 'VECTOR')
            vectorCol = i;
        else if (cell == 'VALUE')
            valueCol = i;

        if (dateCol != -1 & vectorCol != -1 & valueCol != -1)
            break;
    }
    console.log(dateCol, vectorCol, valueCol);

    newData[0] = new Array();
    newData[1] = new Array();
    newData[0][0] = "Date";
    newData[1][0] = oldData[1][dateCol];

    var firstVectorID = oldData[1][vectorCol];
    var skipFirstVectorHit = true

    var loopNumber;
    var applyingVectorHeaders = true;

    //iterate through rows
    var amountOfOldRows = oldData.length;

    // i = 1 to skip headers

    console.log("firstVector " + firstVectorID);

    var loopTimes = 0;

    var newColumn = 0;
    var newRow = 1;
    for (var oldRow = 1; oldRow < amountOfOldRows; oldRow++) {
        var vector = oldData[oldRow][vectorCol];

        if (applyingVectorHeaders) {
            if (vector == firstVectorID) {
                if (skipFirstVectorHit)
                    skipFirstVectorHit = false;
                else {
                    //KEEP AN EYE ON THIS NUMBER
                    //loopNumber = counter;

                    console.log("started looping at oldRow " + oldRow + " cell is " + vector);
                    //insert new date
                    //start only adding values
                    applyingVectorHeaders = false;
                }
            }
            if (applyingVectorHeaders) {
                newData[0].push(oldData[oldRow][vectorCol]);
                newData[1].push(oldData[oldRow][valueCol]);
                // newData[0][oldRow] = oldData[oldRow][vectorCol]
                // newData[1][oldRow] = oldData[oldRow][valueCol]
            }
        }
        if (!applyingVectorHeaders) {
            //if (oldRow % loopNumber == 0)
            if (vector == firstVectorID) {
                //move to next row and reset column
                newColumn = 1;
                newRow++;

                loopTimes++
                //insert date
                newData[newRow] = new Array();
                newData[newRow][0] = oldData[oldRow][dateCol];

                // ADDING DUPLICATE
                //newData[0].push("dup  " + oldData[oldRow][vectorCol]);
                //break;
                //console.log("loop vector " + oldData[oldRow][vectorCol]);
            }

            // insert value into newData

            newData[newRow].push(oldData[oldRow][valueCol]);

            newColumn++;
        }
    }
    console.log("END rows " + newData.length + " - columns " + newData[0].length + "- loopedTimes " + loopTimes);
    //console.log("first vector " + oldData[1][vectorCol]);

    return newData;
}


function SafeSortStatsCanData(oldData) {
    // Data Structure
    // oldData[rows][columns] 
    // newData[columns][rows]
    var newData = [[]];

    var dateCol = -1, vectorCol = -1, valueCol = -1;

    // Find DATE, VECTOR and VALUE column numbers
    for (var i = 0; i < oldData[0].length; i++) {
        var cell = oldData[0][i];
        if (cell.includes("REF_DATE"))
            dateCol = i;
        else if (cell == 'VECTOR')
            vectorCol = i;
        else if (cell == 'VALUE')
            valueCol = i;

        if (dateCol != -1 & vectorCol != -1 & valueCol != -1)
            break;
    }
    console.log(dateCol, vectorCol, valueCol);

    newData[0][0] = "Date";
    newData[0][1] = oldData[1][dateCol];

    //iterate through rows
    var amountOfOldRows = oldData.length;

    var newColumn = 0;
    var newRow = 1;

    console.log("Total Rows in unsorted CSV - " + amountOfOldRows);
    // i = 1 to skip headers
    for (var oldRow = 1; oldRow < amountOfOldRows; oldRow++) {
        var date = oldData[oldRow][dateCol];
        var vector = oldData[oldRow][vectorCol];
        var value = oldData[oldRow][valueCol];

        //compare date to latest newData date, if it fails, add date and move to next row
        if (date != newData[0][newRow])
        {
            newRow++;
            newData[0][newRow] = date;
        }

        var vectorFound = false;
        var newVectorCol = -1;
        //find vector in newData
        for (var i = 0; i < newData.length; i++)
        {
            if (vector == newData[i][0])
            {
                vectorFound = true;
                newVectorCol = i;
                break;
            }
        }

        if (vectorFound)
        {
            //insert value into proper column
            //MIGHT BE ERROR, and need to push
            newData[newVectorCol][newRow] = value;
        }
        else
        {
            //add new vector column
            //place header at row[0]
            //place value at current col/row
            newData.push(new Array());
            newColumn++;
            newData[newColumn][0] = vector;
            newData[newColumn][newRow] = value;
        }
    }
    console.log("END columns " + newData.length + " - row " + newData[0].length);

    return newData;
}