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
    var table = 36100434;
    //var table = promptUserForInput("Please enter table number");
    var url = ("https://www150.statcan.gc.ca/n1/tbl/csv/" + table + "-eng.zip");
    var zipblob = UrlFetchApp.fetch(url).getBlob();

    var unzipblob = Utilities.unzip(zipblob);
    var unzipstr = unzipblob[0].getDataAsString();

    var contents = Utilities.parseCsv(unzipstr);

    displayToastAlert("parsed");

    var data = EliminateExcessData(contents);

    displayToastAlert("organized data");

    //data = LimitRows(data, 20);

    //displayToastAlert("data sorted");

    // 1 date column
    // 862 catagories columns

    // 1 header row
    // 276 months rows

    var maxLength = 25;

    var splitData = SplitArrayIntoArrays(data, maxLength);

    console.log("data total rows " + data.length);
    console.log("split data arrays " + splitData.length);

    // for (var i = 0; i < splitData.length; i++)
    // {
    //     console.log(splitData[i][0][0]);
    // }

    for (var i = 0; i < splitData.length; i++)
    {
        writeDataToSheet(splitData[i], maxLength * (i + 1));
        displayToastAlert("written to sheet");
    }

    displayToastAlert("The CSV file was successfully imported.");
}

//Writes a 2D array of data into existing sheet
function writeDataToSheet(_data, startRow) {
    var ss = SpreadsheetApp.getActive();

    //Change this to current sheet or get sheet

    sheet = ss.getSheetByName('STATISTICS CANADA TEST');

    sheet.getRange(startRow, 1, (startRow * _data.length), _data[0].length).setValues(_data);
}

function SplitArrayIntoArrays(data, maxLength) {
    var newData = new Array();
    var counter = 0;
    var arrayNum = 0;

    newData[0] = new Array();

    for (var i = 0; i < data.length; i++) {
        if (counter > maxLength)
        {
            console.log()
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

function EliminateExcessData(oldData) {
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