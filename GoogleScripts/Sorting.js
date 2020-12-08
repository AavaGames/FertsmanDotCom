function SafeSortStatsCanData(oldData) {
    // Data Structure
    // oldData[rows][columns] 
    // newData[columns][rows]
    var newData = [[]];

    var dateCol = -1, vectorCol = -1, valueCol = -1;

    // Find DATE, VECTOR and VALUE column numbers
    for (var i = 0; i < oldData[0].length; i++) {
        var cell = oldData[0][i];
        if (cell.includes('REF_DATE'))
            dateCol = i;
        else if (cell.includes('VECTOR'))
            vectorCol = i;
        else if (cell.includes('VALUE'))
            valueCol = i;

        if (dateCol != -1 & vectorCol != -1 & valueCol != -1)
            break;
    }
    console.log("Date, Vector, Value columns: " + dateCol, vectorCol, valueCol);

    if (dateCol == -1 || vectorCol == -1 || valueCol == -1)
        console.log("ERROR: Could not find DATE, VECTOR or VALUE column in csv");

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

function DangerSortStatsCanData(oldData) {
    // theData[rows][columns]
    var newData = [[]];

    var dateCol = -1, vectorCol = -1, valueCol = -1;

    // Find DATE, VECTOR and VALUE column numbers
    for (var i = 0; i < oldData[0].length; i++) {
        var cell = oldData[0][i];
        if (cell.includes('REF_DATE'))
            dateCol = i;
        else if (cell.includes('VECTOR'))
            vectorCol = i;
        else if (cell.includes('VALUE'))
            valueCol = i;

        if (dateCol != -1 & vectorCol != -1 & valueCol != -1)
            break;
    }
    console.log("Date, Vector, Value columns: " + dateCol, vectorCol, valueCol);

    if (dateCol != -1 || vectorCol != -1 || valueCol != -1)
        console.log("ERROR: Could not find DATE, VECTOR or VALUE column in csv");

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
