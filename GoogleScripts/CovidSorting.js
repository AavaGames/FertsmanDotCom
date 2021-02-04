function SortCovidData(oldData) {
    // Data Structure
    // oldData[rows][columns] 
    // newData[columns][rows]
    
    var newData = [[]];
    var newDataHeaders = [];

    var provinceCol = -1;
    var dateCol = -1;
    var dataStartCol;

    for (var i = 0; i < oldData[0].length; i++) {
        var cell = oldData[0][i];
        if (cell == 'prname')
            provinceCol = i;
        else if (cell =='date')
            dateCol = i;

        if (provinceCol != -1 && dateCol != -1)
            break;
    }
    if (provinceCol == -1 && dateCol == -1)
        console.log("ERROR: Could not find PRNAME or DATE column in csv")
    
    //Data headers start after date
    dataStartCol = dateCol + 1;

    // End of setup 

    newData[0][0] = "Date";
    newDataHeaders[0] = "Date";

    var newColumn = 0;
    var newRow = 0;

    for (var oldRow = 1; oldRow < oldData.length; oldRow++)
    {
        // Grab prname
        var province = oldData[oldRow][provinceCol];
        // If new date insert new row and use that row
        var date = oldData[oldRow][dateCol];
        if (newData[0][newRow] != date)
        {
            newRow++;
            newData[0].push(date);
        }

        for (var oldColumn = dataStartCol; oldColumn < oldData[0].length; oldColumn++)
        {   
            var value = oldData[oldRow][oldColumn];

            // Grab header and attach province
            var header = province + "_" + oldData[0][oldColumn];

            // Find that header in newData columns
            var headerCol = -1;
            for (var i = 0; i < newDataHeaders.length; i++)
            {
                if (newDataHeaders[i] == header)
                {
                    headerCol = i;
                    break;
                }
            }

            // Didn't find header
            if (headerCol == -1)
            {
                // Adding column array for header
                newColumn++;
                
                newData[newColumn] = new Array();
                newData[newColumn][0] = header;

                newDataHeaders[newColumn] = (header);

                headerCol = newColumn;
            }

            // Add value to that column/row
            newData[headerCol][newRow] = value;
        }
    }

    // Allows sorting by header containing
    MoveColumnContainingToStart(newData, "Canada");

    return newData;
}

function MoveColumnContainingToStart(array, containing)
{
    // Move Canada columns to the start
    var containingCol = [];

    var colCount = 0;
    array.forEach(column => {
        var header = column[0];
        if (header.includes(String(containing)))
        containingCol.push(colCount);
        colCount++;
    });

    // + 1 is added because index was 1 too early
    var endIndex = containingCol[containingCol.length - 1] + 1;
    var amountToMove = containingCol.length;

    for (var i = 0; i < amountToMove; i++)
    {
        ArrayMove(array, endIndex, 1);
    }
}

function ArrayMove(arr, fromIndex, toIndex) {
    var element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
}