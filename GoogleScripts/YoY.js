function ConvertValuesToYoY(oldData) {
    // Data Structure
    // oldData[columns][rows] 
    // newData[columns][rows]
    var newData = [[]];

    // YoY % = (This Year - Last Year) / Last Year

    var lastDatesIndexs = [];
    var currentDatesIndexs = [];

    // Set Date column
    newData[0] = oldData[0];

    for (var column = 1; column < oldData[0].length; column++)
    {
        // Set Header Cell
        newData[column][0] = oldData[column][0];

        for (var row = 1; row < oldData[0][0].length; row++)
        {
            // Count to 12 then reset for dates

            // Place all last dates index's into array
            // Place all current dates index's into array
            // convert values using formula
            // when finished set currentDates = lastDates
        }
    }
    

    return newData;
}

