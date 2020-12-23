function ConvertValuesToYoY(data) {
    // Data Structure
    // oldData[columns][rows] 
    // newData[columns][rows]
    const oldData = data;
    var newData = oldData;

    // YoY % = (This Year - Last Year) / Last Year

    var lastDatesIndexs = [];
    var currentDatesIndexs = [];

    var amountOfColumns = oldData.length;
    var amountOfRows = oldData[0].length;

    for (var column = 1; column < amountOfColumns; column++)
    {
        // Skip first year of data
        for (var row = 14; row < amountOfRows; row++)
        {
            // Count to 12 then reset for dates
            var lastValue = oldData[column][row - 12];
            var currentValue = oldData[column][row];
            var yoy = Number((currentValue - lastValue) / lastValue);
            // rounds value
            yoy = +yoy.toFixed(5);
            newData[column][row] = yoy;

            console.log(lastValue, currentValue, yoy);
        }
        break;
        // remove first 12 data rows
    }
    //console.log(newData);

    return newData;
}

