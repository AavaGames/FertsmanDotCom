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

        var sheetData = await PullDataFromSheet();
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

function PullDataFromSheet(spreadsheetID, sheetName, ...headers)
{
    var sheetData = [[]];

    return sheetData;
}
