
// Give sheet name
function PullDataForSheet(sheet) {
    // inputData[rows][columns]

    // masterSheetData[columns][rows]
    // data[columns][rows]

    // Pull data from sheet_Input with Columns as major dimension
    var inputData = GetInputData(sheet);
    // Delete first / header row of all columns
    for (var i = 0; i < inputData.length; i++)
    {
        inputData[i].splice(0, 1);
    }

    // Pull first column from sheet_Data for dates
    var masterSheetDates = GetDataDates(sheet);
    // TODO if new month hasn't been added yet, add it.


    const spreadSheetIDCol = 0;
    const sheetNameCol = 1;
    const headerCol = 2;
    const funcParametersStartCol = 3;

    // Setting up for data grabbing loop
    var spreadsheetID;
    var sheetName;
    var headers = [];
    var funcParameters = [];

    // Used in FindHeadersInSheet()
    var sheetHeadersToGet = [];

    var data = [[]];

    function ResetVariables()
    {
        spreadsheetID = "";
        sheetName = "";
        headers.clear();
        funcParameters.clear();
    }

    function PullData()
    {
        // grab data from spreadsheet
        // look for headers in spreadsheet
        // once gotten add to sheet in appropriate date row
        //   when placing sheet data into proper row, transpose to [row][col]
        //   get earliest date of spreadsheet, find date in new spreadsheet, splice into that row

        sheetHeadersToGet = headers;
        var sheetData = await PullDataFromSheet();        
        // Remove excess data, only leave headers
        sheetData = FindHeadersInSheet(sheetData);
        var headerData = [[]];
        // Find headers in sheet

        // Align dates properly
        sheetData = AlignDates(masterSheetData, sheetData);

        // sheetData must be [col][row] by here

        // Add sheetData to data
        for (var i = 0; i < sheetData.length; i++)
        {
            data.push(sheetData[i]);
        }
    }

    for (var inputRow = 0; inputRow < inputData.length; inputRow++)
    {
        if (String(inputData[inputRow][spreadSheetIDCol]).length > 0)
        {
            // Found new spreadsheet ID

            spreadsheetID = String(inputData[inputRow][spreadSheetIDCol]);
        }

        if (String(inputData[inputRow][sheetNameCol]).length > 0)
        {
            // Found new sheet name

            if (String(sheetName).includes("func_"))
            {
                if (sheetName == "func_END")// || reached end of sheet)
                    break;
                
                var getFuncParameters = true;
                UseSheetFunction(sheetName, header[0], funcParameters);
            }
            else
            {

                sheetName = String(inputData[inputRow][sheetNameCol]);
            }
        }

        if (String(inputData[inputRow][headerCol]).length > 0)
        {
            // Found new header

            headers.push(String(inputData[inputRow][headerCol]));
        }

        if (getFuncParameters)
        {
            // Get the rest of function parameters
            for (var col = 0; col < inputData[inputRow].length; col++)
            {
                funcParameters.push(inputData[inputRow][col]);
            }
        }
    }

    // Write data to sheet
    WriteDataToSheet(data, sheet);
}

function GetInputData(sheetName)
{
    sheetName = sheetName + "_Input";

    var ss = SpreadsheetApp.getActive();
    var sheet = ss.getSheetByName(sheetName);

    var allRanges = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn());

    var ranges = sheetName + "!" + allRanges.getA1Notation();

    return Sheets.Spreadsheets.Values.get(ss.getId(), ranges, {
        majorDimension: 'ROWS', 
        //valueRenderOption: 'FORMATTED_VALUE',
        //dateTimeRenderOption: 'SERIAL_NUMBER',
    });
}

function GetDataDates(sheetName)
{
    sheetName = sheetName + "_Data";

    var ss = SpreadsheetApp.getActive();
    var sheet = ss.getSheetByName(sheetName);

    var allRanges = sheet.getRange(1, 1, sheet.getLastRow(), 1);

    var ranges = sheetName + "!" + allRanges.getA1Notation();

    return Sheets.Spreadsheets.Values.get(ss.getId(), ranges, {
        majorDimension: 'COLUMNS', 
        //valueRenderOption: 'FORMATTED_VALUE',
        //dateTimeRenderOption: 'SERIAL_NUMBER',
    });
}

function AlignDates(masterSheetData, data)
{

}

// Uses sheetHeadersToGet global variable to know what headers to grab
function PullDataFromSheet(spreadsheetID, sheetName)
{
    new Promise(resolve => {
        var sheetData = [[]];

        return sheetData;
    });
}

function PullDataFromSheet(spreadsheetID, sheetName) {
    // Get Spreadsheet
    var ss = SpreadsheetApp.openById(spreadsheetID);
    var sheet = ss.getSheetByName(sheetName);

    var allRanges = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn());

    var ranges = sheetName + "!" + allRanges.getA1Notation();

    return Sheets.Spreadsheets.Values.get(ss.getId(), ranges, {
        majorDimension: 'COLUMNS', 
        //valueRenderOption: 'FORMATTED_VALUE',
        //dateTimeRenderOption: 'SERIAL_NUMBER',
    });
}

function FindHeadersInSheet(data)
{
    var newData = [];

    var headerColumns = [];
    for (var i = 0; i < sheetHeadersToGet.length; i++) {
        var header = sheetHeadersToGet[i];

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
            console.log("ERROR: Header not found - " + header);
    }

    // Add all headerColumns to newData
    for (var i = 0; i < headerColumns.length; i++)
    {
        newData.push(data[headerColumns[i]]);
    }

    return newData;
}

// Writes a 2D array of data into existing sheet
function WriteDataToSheet(_data, location, startRow = 1) {
    var spreadSheetName = location + "_Data";
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