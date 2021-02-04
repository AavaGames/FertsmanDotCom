function ConvertValuesToYoY(oldData) {
    log("Converting to YoY");
    // Data Structure
    // oldData[columns][rows] 
    // newData[columns][rows]
    var newData = oldData.map(function(column) {
        return column.slice();
    });
    
    var amountOfColumns = oldData.length;
    var amountOfRows = oldData[0].length;

    for (var column = 1; column < amountOfColumns; column++)
    {
        // Skip first year of data
        for (var row = 13; row < amountOfRows; row++)
        {
            var yoy;
            // Count to 12 then reset for dates
            var lastValue = Number(oldData[column][row - 12]);
            var currentValue = Number(oldData[column][row]);
            
            if (isNaN(lastValue) || isNaN(currentValue) || lastValue == 0 || currentValue == 0)
            {
                yoy = '';
            }
            else
            {
                // YoY % = (current date - same period the previous year) / same period the previous year
                yoy = (currentValue - lastValue) / lastValue;
                // rounds value
                yoy *= 100;
                yoy = yoy.toFixed(2);
                yoy = Number(yoy);
    
                if (isNaN(yoy) || !isFinite(yoy))
                {
                    yoy = '';
                }
            }
                
            newData[column][row] = yoy;
        }
        // remove first 12 data rows
        newData[column].splice(1, 12);
    }
    // remove dates first 12 rows
    newData[0].splice(1, 12);

    return newData;
}
