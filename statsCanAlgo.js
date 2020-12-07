//Statistics Canada Data Import Program for FertsmanDotCom
function onOpen(e) {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu("Statistics Canada")
        .addItem("Import CSV by table number", "importCsvFromUrl")
        //.addItem("Import CSV from drive", "importCsvFromDrive")
        .addToUi();
}

//Displays an alert as a Toast message
function displayToastAlert(message) {
    SpreadsheetApp.getActive().toast(message, "⚠️ Alert");
}

function promptUserForInput(promptText) {
    var ui = SpreadsheetApp.getUi();
    var prompt = ui.prompt(promptText);
    var response = prompt.getResponseText();
    return response;
}

//Imports a CSV file at a URL into the Google Sheet
function importCsvFromUrl() {
    //var table = 10100107;
    var table = 36100434;
    //var table = promptUserForInput("Please enter table number");
    var url = ("https://www150.statcan.gc.ca/n1/tbl/csv/" + table + "-eng.zip");

    displayToastAlert("Fetching");

    var zipblob = UrlFetchApp.fetch(url).getBlob();

    displayToastAlert("Unzipping");

    var unzipblob = Utilities.unzip(zipblob);
    var unzipstr = unzipblob[0].getDataAsString();

    displayToastAlert("Parsing");

    var contents = Utilities.parseCsv(unzipstr);

    displayToastAlert("Sorting");

    var data = SortStatsCanData(contents);

    //data = FillOutRange(data);

    //var maxLength = 25;
    //var splitData = SplitArrayIntoArrays(data, maxLength);

    //ClearSheet();

    //for (var i = 0; i < splitData.length; i++)
    // for (var i = 0; i < 4; i++)
    // {
    //     displayToastAlert("Writing part " + (i + 1) + " / " + splitData.length + " to sheet");

    //     console.log("Writing part " + (i + 1) + " / " + splitData.length + " to sheet")
    //     // Starting at row 2 bypasses a Spreadsheet Error bug
    //     WriteDataToSheet(splitData[i], 2 + (maxLength * i));

    //     console.log("Finished writing part " + (i + 1));
    // }
    // Delete empty first row

    WriteDataToSheet(data, 1);

    displayToastAlert("The CSV file was successfully imported");
}

function GetLongestLengthColumn(array)
{
    var length = array[0].length;

    for (var i = 1; i < array.length; i++)
    {
        length = length < array[i].length ? array[i].length : length;
    }

    console.log("0 length " + array[0].length + " - longest length " + length);

    return length;
}

var spreadSheetName = "ScriptTest";

//Writes a 2D array of data into existing sheet
function WriteDataToSheet(_data, startRow) {
    displayToastAlert("Writing to sheet");
    console.log("Writing to sheet");

    //var longestColumn = GetLongestLengthColumn(_data);
    var ss = SpreadsheetApp.getActive();

    // TO DO Change this to current sheet or get sheet

    var sheet = ss.getSheetByName(spreadSheetName);
    var ranges = sheet.getRange(startRow, 1, _data.length, _data[0].length)
    //ranges.setValues(_data);

    // Based on https://developers.google.com/apps-script/advanced/sheets
    var request = {
        'valueInputOption': 'USER_ENTERED',
        'data': [
        {
            'range': spreadSheetName + "!" + ranges.getA1Notation(),
            'majorDimension': 'ROWS',
            'values': _data
        }]
    };
    Sheets.Spreadsheets.Values.batchUpdate(request, SpreadsheetApp.getActiveSpreadsheet().getId());
    var sheetID = sheet.getSheetId();
    //Sheets.Spreadsheets.Values.batchUpdate(request, sheetID);
    console.log('done writing through api');
    //sheet.deleteRow(1);
}

function ClearSheet()
{
    displayToastAlert("Clearing Sheet");

    var ss = SpreadsheetApp.getActive();
    sheet = ss.getSheetByName(spreadSheetName);
    sheet.clear();
}

function FillOutRange(range, fillItem) {
    var fill = (fillItem === undefined) ? "" : fillItem;

    //Get the max row length out of all rows in range.
    var initialValue = 0;
    var maxRowLen = range.reduce(function (acc, cur) {
        return Math.max(acc, cur.length);
    }, initialValue);

    //Fill shorter rows to match max with selecte value.
    var filled = range.map(function (row) {
        var dif = maxRowLen - row.length;
        if (dif > 0) {
            var arizzle = [];
            for (var i = 0; i < dif; i++) { arizzle[i] = fill };
            row = row.concat(arizzle);
        }
        return row;
    })
    return filled;
};

function SplitArrayIntoArrays(data, maxLength) {
    var newData = new Array();
    var counter = 0;
    var arrayNum = 0;

    newData[0] = new Array();

    for (var i = 0; i < data.length; i++) {
        if (counter > maxLength)
        {
            counter = 0;
            arrayNum++;
            newData[arrayNum] = new Array();
        }

        newData[arrayNum][counter] = data[i];

        counter++;
    }
    return newData;
}

function LimitRows(data, rows) {
    var newData = [[]];

    for (var i = 0; i < rows; i++) {
        newData[i] = data[i];
    }

    return newData;
}

function SortStatsCanData(oldData) {
    // data[rows][columns]
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
    //newData[0]

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