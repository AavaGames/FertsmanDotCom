/**
 * Creates a Scatter Chart using the Chart.js library
 * @param {String} chartName Chart ID name to be called by html <canvas>
 * @param {String} link The link/URL to the JSON
 * @param {String} swapDataAxis Swaps the axis of the data
 */
function SetupScatterChart(ChartBuiltCallback, chartName, loadingSymbolName, sortedData, swapDataAxis = false) {
    var loadingSymbol = document.getElementById(loadingSymbolName);
    loadingSymbol.className = globalLoadingSymbolClass;

    var dataHeaders = sortedData[0];
    var data = sortedData[1];

    // needs to remove date from dataset, but keep it for adjustments
    dataHeaders.splice(0,1);
    data.splice(0,1);
    
    if (swapDataAxis) {
        let tempData = [];
        tempData[0] = data[1];
        tempData[1] = data[0];            
        data = tempData;

        let tempHeader = dataHeaders[0]
        dataHeaders[0] = dataHeaders[1];
        dataHeaders[1] = tempHeader;
    }

    // End of JSON formatting

    var _datasets = [];

    // var axisLabels = ["", ""];
    // for (var i = 0; i < data.length; i++) {
    //     var axis = 'y-axis-1';
    //     var axisLabel = dataHeaders[i]
    //     if (!axisLabels[0] == "")
    //         axisLabels[0] = axisLabels[0] + ", ";
    //     axisLabels[0] = axisLabels[0] + axisLabel;
    // }

    var pointData = [];

    for (var i = 0; i < data[0].length; i++) {
        pointData[i] = {
            x: Number(data[0][i]),
            y: Number(data[1][i])
        }
    }

    _datasets[0] = {
        //label: axisLabels[0],
        backgroundColor: lineOptions.GetColor(0),
        //borderColor: lineOptions.GetRandomColor(),
        data: pointData,
        //fill: true,
        //yAxisID: axis,
    }

    // End of Line / Dataset Formatting

    loadingSymbol.classList.remove(globalLoadingSymbolClass);

    let chart = new Chart(document.getElementById(chartName), {
        type: 'scatter',
        data: {
            datasets: _datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    type: 'linear',
                    position: 'bottom'
                }]
            },
            title: {
                display: false,
            },
            legend: {
                display: false
            },
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: dataHeaders[0]
                    },
                    gridLines: {
                        borderDash: [2, 2]
                    },
                    ticks: {
                        autoSkip: true,
                        padding: 0,
                        autoSkipPadding: 15,
                        callback: function(value) {
                            return AbbreviateNumber(value);
                        } 
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: dataHeaders[1]
                    },
                    gridLines: {
                        borderDash: [2, 2]
                    },
                    ticks: {
                        autoSkip: true,
                        padding: 0,
                        autoSkipPadding: 15,
                        callback: function(value) {
                            return AbbreviateNumber(value);
                        }
                    }
                }]
            }
        }
    });

    CalculateTrendLine(chart);

    ChartBuiltCallback(chart);
    // }).fail( function(textStatus) {
    //     console.error("Chart ERROR: Failed to obtain JSON, make sure spreadsheet is public." + "\n\nJSON Error Message: " + textStatus.responseJSON.error.message);
    //     loadingSymbol.className = globalFailedSymbolClass;
    // });
}

function CalculateTrendLine(chart) {
    var dataPoints = chart.data.datasets[0].data;

    var lowestAndHighest = GetLowestAndHighestNumberInArray(dataPoints)
    var lowestX = lowestAndHighest[0];
    var highestX = lowestAndHighest[1];

    var regressionData = [
        []
    ];
    for (var i = 0; i < dataPoints.length; i++) {
        regressionData[i] = [dataPoints[i].x, dataPoints[i].y]
    }

    var result = regression.linear(regressionData);

    var point = result.predict(lowestX);
    var startPoint = {
        x: point[0],
        y: point[1]
    }

    point = result.predict(highestX);
    var endPoint = {
        x: point[0],
        y: point[1]
    }

    var equation = result.string;
    var r2 = String(result.r2.toPrecision(2));
    // Place line of best fit in front of scatter points
    var tempData = chart.data.datasets[0];
    chart.data.datasets[0] = ({
        //label: "Equation: " + equation + ", R2 = " + r2,
        data: [startPoint, endPoint],
        showLine: true,
        pointRadius: 0,
        fill: false,
        borderColor: lineOptions.trendLine
    });
    chart.data.datasets.push(tempData);
    chart.options.title = {
        display: true,
        text: "Equation: " + equation + ", R2 = " + r2,
        fontStyle: 'bolder',
        fontSize: 12
    }
    chart.update();
}

function GetLowestAndHighestNumberInArray(array) {
    var lowestX = array[0].x;
    var highestX = array[0].x;

    for (var i = 0; i < array.length; i++) {
        lowestX = lowestX > array[i].x ? array[i].x : lowestX;
        highestX = highestX < array[i].x ? array[i].x : highestX;
    }
    return [lowestX, highestX];
}