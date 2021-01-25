// Give sheet name
function PullDataForSheet(sheet) {
    // Pull data from sheet_Input with Columns as major dimension
    // Delete first / header row of all columns
    var inputData = [[]];

    // Pull first column from sheet_Data for dates, if new month hasn't been added yet, add it.
    var masterSheetDates = [];

    var spreadsheetID;
    var sheetName;
    var headers = [];
    var funcParameters = [];

    var sheetHeadersToGet = [];

    var data = [[]];

    while (true)
    {
        // Move down first column until a spreadsheetID is gotten,
        // then move to the second column for sheet name,
        // then go to third column for header name(s)
        // continue until bumping into another spreadsheetID or sheet name
        
        if (String(sheetName).includes("func_"))
        {
            if (sheetName == "func_END")// || reached end of sheet)
                break;

            UseSheetFunction(sheetName, header[0], funcParameters);
        }

        // grab data from spreadsheet
        // look for headers in spreadsheet
        // once gotten add to sheet in appropriate date row
        //   get earliest date of spreadsheet, find date in new spreadsheet, splice into that row

        sheetHeadersToGet; // ADD SHEET HEADERS HERE 
        var sheetData = await PullDataFromSheet();        
        // Remove excess data, only leave headers
        sheetData = FindHeadersInSheet(sheetData);
        var headerData = [[]];
        // Find headers in sheet

        // Find proper date index
        var dateIndex;
        // Add headerData to data in proper date position
        for (var i = 0; i < headerData.length; i++)
        {
            data.push(new Array());
            // in last data column
            data.splice(dateIndex, 0, headerData[i]);
        }
    }

    // Write data to sheet
    WriteDataToSheet(data, sheet + "_Data");
}

async function f2() {
    const thenable = {
        then: function(resolve, _reject) {
            
            resolve('resolved!')
        }
    };
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

    var lastRow = sheet.getLastRow();
    var lastColumn = sheet.getLastColumn();

    var allRanges = sheet.getRange(1, 1, lastRow, lastColumn);

    var params = {
        spreadsheetId: spreadsheetID,
        ranges: allRanges,
        // True if grid data should be returned.
        // This parameter is ignored if a field mask was set in the request.
        includeGridData: false,
    };
    //Sheets.Spreadsheets.Values.get(request, SpreadsheetApp.getActiveSpreadsheet().getId());
    return Sheets.Spreadsheets.Values.get(params);
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
