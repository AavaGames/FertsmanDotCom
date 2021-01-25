// Add Typescript ?

const SheetFunctionTypes = Object.freeze({
    "Add": 1, 
    "Subtract": 2, 
    "Total": 3, 
    "Average": 4,
    "Percent": 5,
    "Growing": 6,
    "Shrinking": 7,
    "Ratio": 8,
    "RatioPercent": 9,
    enumLength: 9
});

// Will need a YoY converter for some functions

function UseSheetFunction(funcName, header, funcParameters)
{
    funcName = String(funcName).toLowerCase();
    var funcToRun = FindFunctionToRun(funcName);

    switch (funcToRun) {
        case SheetFunctionTypes.Add:
            SheetFunctionAdd(funcParameters)
            break;

        default:
            console.log("WARNING: Could not find function " + funcName);
            break;
    }
}

function FindFunctionToRun(funcName)
{
    switch (funcName) {
        case SheetFunctionTypes.Add:
            if (funcName == "add")
                return SheetFunctionTypes.Add;
            break;

        default:
            return null;
    }
}
