// Do not count from zero for xAxis
function SetupScatterChart(chartName, link, xAxis = 1, swapYAxisData = false) 
{
    console.log("Fetching JSON from link");
    $.getJSON(link, json => {
        console.log("JSON Acquired");

        CreateScatterChart(json, chartName, xAxis, swapYAxisData);
    });
}

function CreateScatterChart(json, chartName, xAxis, swapYAxisData)
{
    console.log(json);
    const size = json.valueRanges[0].values.length;

    var data = [];
    var dataHeaders = new Array(size);

    for (var i = 0; i < size; i++) {
        data[i] = new Array();
    }

    var firstValueRange = true;

    // Iterate all VALUE RANGES
    json.valueRanges.forEach(valueRange => {

        var amountOfColumns = valueRange.values.length;

        // Iterate all VALUES arrays
        for (var column = 0; column < amountOfColumns; column++) {
            var values = valueRange.values[column];

            var amountOfRows = values.length;

            for (var row = 0; row < amountOfRows; row++) {
                var value = values[row];

                if (firstValueRange & row == 0) {
                    dataHeaders[column] = value;
                    continue;
                }

                data[column].push(value);
            }
        }
        firstValueRange = false;
    });

    const multiAxis = data.length > 2;
    console.log(data.length, multiAxis);

    // End of JSON formatting

    Chart.defaults.global.defaultColor = chartDefaultColor;

    Chart.defaults.global.defaultFontFamily = chartFontFamily;

    //Make sure if there arent the chart isnt multi then swap is disabled
    if (!multiAxis)
        swapYAxisData = false;

    var _datasets = [];

    xAxis = xAxis - 1;
    var leftYAxis = -1;
    var rightYAxis = -1;

    for (var i = 0; i < data.length; i++)
    {
        if (i == xAxis)
            continue;

        if (!swapYAxisData)
        {
            if (leftYAxis == -1)
                leftYAxis = i;
            else
                rightYAxis = i
        }
        else
        {
            if (rightYAxis == -1)
                rightYAxis = i;
            else
                leftYAxis = i
        }
    }

    var xAxisLabel = dataHeaders[xAxis];
    var leftYAxisLabel = dataHeaders[leftYAxis];
    var rightYAxisLabel;

    if (multiAxis)
        rightYAxisLabel = dataHeaders[rightYAxis];


    var pointData;
    
    if (multiAxis)
    {
        for (var i = 0; i < data[0].length; i++)
        {
            pointData[i] = [{
                x: Number(data[xAxis][i]),
                y: Number(data[1][i])
            },
            {
                x: Number(data[xAxis][i]),
                y: Number(data[2][i])
            }];
        }

        _datasets = 
        [{
            label: leftYAxisLabel,
            //For Bar Chart
            backgroundColor: lineOptions.colors[3],
            borderColor: lineOptions.colors[1],
            data: pointData[0],
            //fill: true,
            yAxisID: 'y-axis-1',
        },
        {
            label: rightYAxisLabel,
            //For Bar Chart
            backgroundColor: lineOptions.colors[3],
            borderColor: lineOptions.colors[1],
            data: pointData[1],
            //fill: true,
            yAxisID: 'y-axis-2',
        }];
    }
    else
    {
        for (var i = 0; i < data[0].length; i++)
        {
            pointData[i] = {
                x: Number(data[0][i]),
                y: Number(data[1][i])
            }
        }

        _datasets[0] = 
        {
            label: leftYAxisLabel,
            //For Bar Chart
            backgroundColor: lineOptions.colors[3],
            borderColor: lineOptions.colors[1],
            data: pointData,
            //fill: true,
            yAxisID: 'y-axis-1',
        }
    }


    // End of Line / Dataset Formatting

    // var chart = new Chart(document.getElementById(chartName), {
    //     type: 'scatter',
    //     data: {
    //         datasets: _datasets
    //     },
    //     options: {
    //         scales: {
    //             xAxes: [{
    //                 type: 'linear',
    //                 //position: 'bottom'
    //             }]
    //         }
    //     }
    // });
    var isDualAxisChart = rightAxis.length > 0;
    var chart = new Chart(document.getElementById(chartName),
    {
        type: 'scatter',
        data: {
            labels: xAxisLabel,
            datasets: _datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: false,
            },
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                    type: 'linear',
                    scaleLabel: {
                        display: true,
                        //labelString: dataHeaders[0]
                    },
                    gridLines: {
                        borderDash: [2, 2]
                    },
                    ticks: {
                        // autoSkip: true,
                        // maxTicksLimit: 10,
                        //maxRotation: 0
                    }
                }],
                yAxes: [{
                    display: true,
                    position: 'left',
                    id: 'y-axis-1',
                    scaleLabel: {
                        display: true,
                        labelString: axisLabels[0]
                    },
                    gridLines: {
                        borderDash: [2, 2]
                    }
                }]
                // {
                //     display: isDualAxisChart,
                //     position: 'right',
                //     id: 'y-axis-2',
                //     scaleLabel: {
                //         display: true,
                //         labelString: axisLabels[1]
                //     },
                //     gridLines: {
                //         display: false,
                //         borderDash: [2, 2]
                //     }
                // }]
            }
            // elements: {
            //     point: {
            //         radius: 0
            //     },
            // },
            // legend: {
            //     display: false
            // }
        }
    });

    CalculateTrendLine(chart.data.datasets[0].data);
    if (multiAxis)
        CalculateTrendLine(chart.data.datasets[1].data);
}

function CalculateTrendLine(dataPoints) 
{
    var lowestAndHighest = GetLowestAndHighestNumberInArray(dataPoints)
    var lowestX = lowestAndHighest[0];
    var highestX = lowestAndHighest[1];
    
    var regressionData = [[]];
    for (var i = 0; i < dataPoints.length; i++)
    {
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
    var r2 = result.r2.toPrecision(2);

    chart.data.datasets.push({
        label: "Equation: " + equation + "  R2 = " + r2,
        data: [startPoint, endPoint],
        showLine: true,
        pointRadius: 0,
        fill: false,
        borderColor: lineOptions.trendLine
    })
    chart.update();
}

function GetLowestAndHighestNumberInArray(array)
{
    var lowestX = array[0].x;
    var highestX = array[0].x;

    for(var i = 0; i < array.length; i++)
    {
        lowestX = lowestX > array[i].x ? array[i].x : lowestX;
        highestX = highestX < array[i].x ? array[i].x : highestX;
    }
    return [lowestX, highestX];
}