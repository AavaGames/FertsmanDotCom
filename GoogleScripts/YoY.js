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

            var foundDate = false;

            for (var i = 1; i <= sortingLength; i++)
            {
                var date = String(oldData[0][row - i]);

                if (date == dateToFind)
                {
                    foundDate = true;
                    lastValue = Number(oldData[column][row - i]);
                    break;
                }
            }

            if (!foundDate)
                console.log("did not find date");
            
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

function DateTest()
{
    let dateString = "2001-02"

    //

    var date = new FertsmanDate(dateString);

    console.log("date = " + date.date);

    date.Subtract(0, 5);

    console.log("datestring = " + date.GetDateString());

    console.log("date = " + date.date);

    date.Add(0, 12 + 5);

    console.log("datestring = " + date.GetDateString());

    console.log("date = " + date.date);
}


function FertsmanDate(dateString)
{
    // Used in applying correct format when returning new date string
    this.originalDateString = dateString;
    this.date = CreateDateFromString(dateString);

    this.GetDateString = function()
    {
        return CreateStringFromDate(this.date, this.originalDateString);
    }

    this.Subtract = function(year, month = 0, day = 0)
    {
        this.date.setFullYear(this.date.getFullYear() - year)
        this.date.setDate(this.date.getDate() - day);
        this.date.setMonth(this.date.getMonth() - month);
        return this.date;
    }
    
    this.Add = function(year, month = 0, day = 0)
    {
        this.date.setFullYear(this.date.getFullYear() + year)
        this.date.setDate(this.date.getDate() + day);
        this.date.setMonth(this.date.getMonth() + month)
        return this.date;
    }
}

function CreateDateFromString(dateString)
{
    let splitStr = String(dateString).split("-");

    let date;

    let year;
    let month;
    let day;

    if (splitStr.length == 1)
    {
        year = splitStr[0];
        //Must add month otherwise it provides dec 31, previous year
        month = "0";

        date = new Date(year, month);
    }
    else if (splitStr.length == 2)
    {
        year = splitStr[0];
        month = splitStr[1] - 1;

        date = new Date(year, month);
    }
    else if (splitStr.length == 3)
    {
        year = splitStr[0];
        month = splitStr[1] - 1;
        day = splitStr[2];

        date = new Date(year, month, day);
    }
    else           
        console.log("ERROR: Empty string")

    return date;
}

function CreateStringFromDate(date, originalDateString)
{
    let splitStr = String(originalDateString).split("-");

    let year = String(date.getFullYear());
    let month = String(date.getMonth() + 1);
    let day = String(date.getDate());

    if (month.length == 1)
        month = "0" + month;
        
    if (day.length == 1)
        day = "0" + day;

    let dateString = year;

    if (splitStr.length > 1)
        dateString += "-" + month;

    if (splitStr.length > 2)
        dateString += "-" + day;

    return dateString;
}