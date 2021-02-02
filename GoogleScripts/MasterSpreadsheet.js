// Give sheet name
function PullDataForMasterSheet(sheet, cleanPull = false) {
    // inputData[rows][columns]

    // masterSheetData[columns][rows]
    // data[columns][rows]

    // pulledData[rows][columns]


    // Pull data from sheet_Input
    var inputData = [];
    inputData = GetDataFromSheet(sheet + "_Input", false);
    // Delete first / header row
    inputData.splice(0, 1);

    // Promise to wipe sheet
    // if clean pull, wipe sheet_Data and grab dates
    // if not then grab whole sheet for later

    // Pull first column from sheet_Data for dates
    var masterSheetData = GetDataFromSheet(sheet + "_Data", false);
    // TODO if new month hasn't been added yet, add it.

    var failedToPullData = false;


    const spreadSheetIDCol = 0;
    const sheetNameCol = 1;
    const headerCol = 2;
    const funcParametersStartCol = 3;

    // Setting up for data grabbing loop
    var spreadsheetID = "";
    var sheetName = "";
    var headers = [];
    var funcParameters = [];

    // Used in FindHeadersInSheet()
    var sheetHeadersToGet = [];

    var data = [];

    for (var inputRow = 0; inputRow < inputData.length; inputRow++)
    {
        if (String(inputData[inputRow][spreadSheetIDCol]).length > 0)
        {
            // Found new spreadsheet ID
            var value = String(inputData[inputRow][spreadSheetIDCol]);

            if (spreadsheetID.length > 0)
            {
              console.log("Pulling data - found new SpreadsheetID");
              // Pull data with current sheet variables, then reset all vars and continue
              PullData();
              ResetVariables(true);
            }

            spreadsheetID = String(inputData[inputRow][spreadSheetIDCol]);
        }

        if (String(inputData[inputRow][sheetNameCol]).length > 0)
        {
            // Found new sheet name
            var value = String(inputData[inputRow][sheetNameCol]);

            if (sheetName.length > 0)
            {
                console.log("Pulling data - found new Sheet Name");
                // Pull data with current sheet variables, then reset all var except spreadsheet ID and continue
                PullData();
                ResetVariables(false);
            }

            if (value.includes("func_"))
            {
                if (value == "func_END")// || reached end of sheet)
                {
                    console.log("Reached func_END, breaking out of loop");
                    break;
                }

                console.log("running function - NOT IMPLEMENTED");

                // TODO implement sheet function system
                
                //Get function header too
                //funcHeader = String(inputData[inputRow][headerCol]);
                //funcParameters = GetFuncParameters(inputRow);
                //var funcColumn = UseSheetFunction(sheetName, header[0], funcParameters);
                //data.push(funcColumn);
                //continue;
            }
            else
            {
                sheetName = String(inputData[inputRow][sheetNameCol]);
            }
        }

        if (String(inputData[inputRow][headerCol]).length > 0)
        {
            var value = String(inputData[inputRow][headerCol]);
            // Found new header

            headers.push(value);
        }
    }

    console.log("Writing to sheet");

    var tempArray = data;
    tempArray = Transpose(tempArray);
    console.log("headers = " + tempArray[0]);
    //console.log("last row = " + tempArray[tempArray.length-1])
    console.log("rows = " + data[0].length + " cols = " + data.length)

    // Write data to sheet
    WriteDataToSheet(data, sheet);

    // START of nested functions

    function ResetVariables(newSpreadsheetID)
    {
        if (newSpreadsheetID)
            spreadsheetID = "";

        sheetName = "";
        headers = [];
        funcParameters = [];

        sheetHeadersToGet = [];

        failedToPullData = false;
    }

    function PullData()
    {
        var sheetData;

        //console.log("Starting Promise");

        var promisePullData = new Promise(function(resolve, reject) {
            // returns [row][col] array
            sheetData = GetDataFromSpreadsheetID(spreadsheetID, sheetName, true);
            
            resolve(sheetData);
        });

        // grab data from spreadsheet
        // look for headers in spreadsheet
        // once gotten add to sheet in appropriate date row
        //   get earliest date of spreadsheet, find date in new spreadsheet, splice into that row

        sheetHeadersToGet = headers;

        //console.log("ID = " + spreadsheetID);
        //console.log("Name = " + sheetName);
        //console.log("First Header = " + headers[0])
        //console.log("Last Header = " + headers[headers.length - 1]);

        // promisePullData.then(
        //     // If successfully pulled data continue
        //     result => {
        //         // pulledData[col][row]
        //         console.log("Success = " + sheetData[0][1]);
        //         sheetData = result;
        //     },
        //     error => {
        //         console.log("Failed to get data from sheet " + sheetName + " with error: " + error);
        //         failedToPullData = true;
        //     }
        // );

        //console.log("Finished Promise");
        
        if (!failedToPullData)
        {
            // Removes excess data, finds headers and keeps date col
            sheetData = FindHeadersInSheet(sheetData, sheetHeadersToGet);

            // Transposing array sheetData[col][row] -> [row][col]
            sheetData = Transpose(sheetData);

            console.log("Aligning Dates");
            // Align dates properly
            sheetData = AlignDates(masterSheetData, sheetData);

            // Transposing array sheetData[row][col] -> [col][row]
            sheetData = Transpose(sheetData);

            // Remove date column
            sheetData.splice(0, 1);

            // Add sheetData to data
            for (var i = 0; i < sheetData.length; i++)
            {
                data.push(sheetData[i]);
            }

            console.log("Added to data - cols = " + data.length + " last row = " + data[data.length - 1].length);
        }
        else
        {
            // add empty rows to data
        }

        // // Add sheetData to data
        // for (var i = 0; i < sheetData.length; i++)
        // {
        //     data.push(sheetData[i]);
        // }
    }
    
    function GetFuncParameters(inputRow)
    {
        var params = []
        // Get the rest of function parameters
        for (var col = funcParametersStartCol; col < inputData[inputRow].length; col++)
        {
            var value = String(inputData[inputRow][col]);

            params.push(value);
        }

        console.log("func param [0] = " + params[0]);
        return params;
    }
}

function FindHeadersInSheet(data, headersToGet)
{
    // data[col][row]

    var newData = [];
    // push date row
    newData.push(data[0]);

    var firstRow = [];
    for (var i = 0; i < data.length; i++)
    {
        firstRow.push(data[i][0]);
    }

    var headerColumns = [];
    for (var i = 0; i < headersToGet.length; i++) {
        var header = headersToGet[i];

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


function AlignDates(masterSheetData, data)
{
    // TODO implement error system when date formats do not match up


    // data[row][column]

    // iterate through data rows and find matching date and place it there
    var masterRow = 1;

    // Create an empty row at the same size of all other rows, for filling in
    var emptyRow = []
    for(var i = 0; i < data[0].length; i++)
    {
        emptyRow.push("");
    }

    //console.log("data[0] = emptyRow = " + data[0].length + " = " + emptyRow.length);

    var startLength = data.length;
    var counter = 0;

    // Start at 1 to skip headers
    for (var i = 1; i < data.length; i++)
    {
        counter ++;
        var date = String(data[i][0]);

        for (masterRow; masterRow < masterSheetData.length; masterRow++)
        {
            masterDate = String(masterSheetData[masterRow][0]);

            if (date == masterDate)
            {
                // fill before data[i] with empty spaces

                // DOUBLE CHECK THIS
                var startIndex = i;
                var endIndex = masterRow;
                var amountToAdd = endIndex - startIndex;
                if (amountToAdd <= 0)
                  break;

                console.log("i = " + i + " startIndex = " +  startIndex + " endIndex = " + masterRow + " amountToAdd = " + amountToAdd);
                
                var amountAdded = 0;

                for (var j = 0; j < amountToAdd; j++)
                {
                  amountAdded++;
                  data.splice(startIndex, 0, emptyRow);
                }
                console.log("amount added = " + amountAdded + "data length = " + data.length);
                i += amountToAdd;
                break;
            }
        }
    }

    // fill out the rest
    var startIndex = data.length;
    var endIndex = masterSheetData.length -1;
    var amountToAdd = endIndex - startIndex;
    var fillEndOfArray = true;
    if (amountToAdd <= 0)
    {
      fillEndOfArray = false;
    }
    if (fillEndOfArray)
    {
      for (var j = 0; j < amountToAdd; j++)
      {
          data.splice(startIndex, 0, emptyRow);
      }
    }


    //console.log("Shoulda have ran " +  startLength + " times and ran " + counter + " times");
    console.log("Start length = " +  startLength + " and length = " + data.length);
    console.log("Goal length = " +  masterSheetData.length + " and length = " + data.length);
    return data;
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

function GetDataFromSpreadsheetID(spreadsheetID, sheetName, majorDimensionColumns = true) {
    // Get Spreadsheet
    var ss = SpreadsheetApp.openById(spreadsheetID);
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


// Writes a 2D array of data into existing sheet
function WriteDataToSheet(data, location) {
    var spreadSheetName = location + "_Data";
    var ss = SpreadsheetApp.getActive();
    var sheet = ss.getSheetByName(spreadSheetName);
    // Start second column to not overwrite dates
    var ranges = sheet.getRange(1, 2, data[0].length, data.length);
    console.log(ranges.getA1Notation());
    var request = {
        'valueInputOption': 'USER_ENTERED',
        'data': [
            {
                'range': spreadSheetName + "!" + ranges.getA1Notation(),
                'majorDimension': 'COLUMNS',
                'values': data
            }]
    };
    Sheets.Spreadsheets.Values.batchUpdate(request, ss.getId());
}

