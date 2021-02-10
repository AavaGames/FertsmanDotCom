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

    // For year / day / quarter length
    const sortingLength = 12;

    for (var column = 1; column < amountOfColumns; column++)
    {
        // Skips header + first year of data
        for (var row = sortingLength + 1; row < amountOfRows; row++)
        {
            var yoy;

            var currentValue = Number(oldData[column][row]);

            // Yearly and Quarterly can use months to search
            // "2001-01" look for "2000-01"
            // "2001-04" look for "2000-04"
            // WoW must use day to search -7 days
            // "2001-02-04" look for "2001-01-28"

            var currentDate = String(oldData[0][row])

            var dateToFind = new FertsmanDate(currentDate);
            dateToFind.Subtract(0, sortingLength);
            dateToFind = dateToFind.GetDateString();

            // SUBTRACT 12 MONTHS
            //dateToFind.Subtract(0, sortingLength);

            var lastValue = 0;

            for (var i = 1; i <= sortingLength; i++)
            {
                var date = String(oldData[0][row - i]);

                if (date == dateToFind)
                {
                    lastValue = Number(oldData[column][row - i]);
                    break;
                }
            }
            
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
