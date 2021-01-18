function SortTeranetData(oldData) {
    // Data Structure
    // oldData[rows][columns] 
    // newData[columns][rows]
    var newData = [];

    // Transpose oldData swapping rows and columns;
    oldData = Transpose(oldData);

    // Remove second row from date column, add to newData
    var tempColumn = oldData[0];
    tempColumn.splice(1, 1);
    //tempColumn[0] = "Transaction Date";
    newData.push(tempColumn);

    var header = "";
    for (var col = 1;  col < oldData.length; col++)
    {
        // Check if header has anything, store header

        var testHeader = oldData[col][0];
        if (testHeader.length > 0)
        {
            header = testHeader;
            //console.log("Found New Header");
        }

        var header2 = oldData[col][1];
        // Add header to header2 for newData header
        var newHeader = header + "_" + header2;
        
        // Delete first row, change header name, add to newData
        var tempColumn = oldData[col];
        tempColumn.splice(0, 1);
        tempColumn[0] = newHeader;
        newData.push(tempColumn);

        //for (var row = 0; row < oldData[0].length; row++) {}
    }

    return newData;
}