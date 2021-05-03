function ConvertValuesToQoQ(oldData) {
    log("Converting to QoQ");
    // Data Structure
    // oldData[columns][rows] 
    // newData[columns][rows]
    var newData = oldData.map(function(column) {
        return column.slice();
    });
    
    var amountOfColumns = oldData.length;
    var amountOfRows = oldData[0].length;

    // For year / day / quarter length
    const sortingLength = 4;

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
            // subtract 1 year
            dateToFind.Subtract(1);
            dateToFind = dateToFind.GetDateString();

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
                qoq = '';
            }
            else
            {
                // QoQ % = (current date - same period the previous quarter) / same period the previous quarter
                qoq = (currentValue - lastValue) / lastValue;
                // rounds value
                qoq *= 100;
                qoq = qoq.toFixed(2);
                qoq = Number(qoq);
    
                if (isNaN(qoq) || !isFinite(qoq))
                {
                    qoq = '';
                }
            }
                
            newData[column][row] = qoq;
        }
        // remove first 4 data rows
        newData[column].splice(1, sortingLength);
    }
    // remove dates first 4 rows
    newData[0].splice(1, sortingLength);

    return newData;
}
