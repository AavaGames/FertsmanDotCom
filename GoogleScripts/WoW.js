function updateCovid()
{
    ImportCovid("WoW");
}

function ConvertValuesToWoW(oldData) {

    log("Converting to WoW");
    // Data Structure
    // oldData[columns][rows] 
    // newData[columns][rows]
    var newData = oldData.map(function(column) {
        return column.slice();
    });
    
    var amountOfColumns = oldData.length;
    var amountOfRows = oldData[0].length;

    const sortingLength = 7;

    for (var column = 1; column < amountOfColumns; column++)
    {
        // Skip first week of data
        for (var row = sortingLength + 1; row < amountOfRows; row++)
        {
            var wow;

            var currentValue = Number(oldData[column][row]);

            // Yearly and Quarterly can use months to search
            // "2001-01" look for "2000-01"
            // "2001-04" look for "2000-04"
            // WoW must use day to search -7 days
            // "2001-02-04" look for "2001-01-28"

            var currentDate = String(oldData[0][row])
            var dateToFind = new FertsmanDate(currentDate);
            dateToFind.Subtract(0, 0, sortingLength);
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
                wow = '';
            }
            else
            {
                // WoW % = (current date - same period the previous week) / same period the previous week
                wow = (currentValue - lastValue) / lastValue;
                // rounds value
                wow *= 100;
                wow = wow.toFixed(2);
                wow = Number(wow);
    
                if (isNaN(wow) || !isFinite(wow))
                {
                    wow = '';
                }
            }
                
            newData[column][row] = wow;
        }
        // remove first 7 data rows
        newData[column].splice(1, 7);
    }
    // remove dates first 7 rows
    newData[0].splice(1, 7);

    return newData;
}
