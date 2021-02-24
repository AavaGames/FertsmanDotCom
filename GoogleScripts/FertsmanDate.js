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

/*
*   Only checks and converts date formats that have words
*/
function CheckAndConvertDateFormat(data)
{
    let dateSeparator = "-";
    let monthIndex = -1;

    let correctFormat = true;
    let testDate = data[0][1].split(dateSeparator);
    for (let i = 0; i < testDate.length; i++)
    {
        let value = testDate[i];
        if (isNaN(value))
        {
            monthIndex = i;
            correctFormat = false;
            break;
        }
    }
    // if in the correct format already, skip conversion
    if (correctFormat)
        return data;
    else
        log("Converting Date Format");

    let dateColumn = data[0];

    let months = [
        ["Jan", "01"],
        ["Feb", "02"],
        ["Mar", "03"],
        ["Apr", "04"],
        ["May", "05"],
        ["Jun", "06"],
        ["Jul", "07"],
        ["Aug", "08"],
        ["Sep", "09"],
        ["Oct", "10"],
        ["Nov", "11"],
        ["Dec", "12"],
    ];

    for (let i = 1; i < dateColumn.length; i++)
    {
        let day = "";
        let month = "";
        let year = "";

        let date = dateColumn[i].split(dateSeparator);

        let value = date[monthIndex];
        for (let month = 0; month < months.length; month++)
        {
            if (String(value).includes(months[month][0]))
            {
                value = months[month][1];
                date[monthIndex] = value;
                break;
            }
        }

        month = date[monthIndex];

        for (let j = 0; j < date.length; j++)
        {
            if (j == monthIndex) continue;

            if (date[j].length == 4)
                year = date[j];
            else
                day = date[j];
        }
        
        let newDate = year + dateSeparator + month;
        
        if (day != "")
            newDate += dateSeparator + day;

        dateColumn[i] = newDate;
    }

    data[0] = dateColumn;

    return data;
}
