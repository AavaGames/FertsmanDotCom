function SetupScatterChart(chartName, link, ...rightAxis) 
{
    console.log("Fetching JSON from link");
    $.getJSON(link, json => {
        console.log("JSON Acquired");

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

        // End of JSON formatting

        Chart.defaults.global.defaultColor = chartDefaultColor;

        Chart.defaults.global.defaultFontFamily = chartFontFamily;

        var _datasets = [];

        var axisLabels = ["", ""];
        for (var i = 0; i < size; i++) {
            var isRightAxis = false;

            var axis = 'y-axis-1';
            for (var j = 0; j < rightAxis.length; j++) {
                if (rightAxis[j] == i + 1) {
                    axis = 'y-axis-2'
                    isRightAxis = true;
                    break;
                }
            }

            var axisLabel = dataHeaders[i]
            if (isRightAxis) {
                if (!axisLabels[1] == "")
                    axisLabels[1] = axisLabels[1] + ", ";
                axisLabels[1] = axisLabels[1] + axisLabel;
            }
            else {
                if (!axisLabels[0] == "")
                    axisLabels[0] = axisLabels[0] + ", ";
                axisLabels[0] = axisLabels[0] + axisLabel;
            }

            // _datasets[i - 1] = {
            //     label: dataHeaders[i],
            //     //For Bar Chart
            //     //backgroundColor: "rgba(0, 175, 181, 1)",
            //     borderColor: lineOptions.colors[i],
            //     data: data[i],
            //     fill: false,
            //     yAxisID: axis,
            // }
        }

        var pointData = [];
        
        for (var i = 0; i < data[0].length; i++)
        {
            pointData[i] = {
                x: Number(data[0][i]),
                y: Number(data[1][i])
            }
            // {
            //     x: Number(data[0][i]),
            //     y: Number(data[2][i])
            // }]
        }

        _datasets[0] = 
        {
            label: axisLabels[0],
            //For Bar Chart
            backgroundColor: lineOptions.colors[3],
            borderColor: lineOptions.colors[1],
            data: pointData,
            //fill: true,
            yAxisID: axis,
        }

        // End of Line / Dataset Formatting

        //console.log(_datasets);

        var chart = new Chart(document.getElementById(chartName), {
            type: 'scatter',
            data: {
                datasets: _datasets
            },
            options: {
                scales: {
                    xAxes: [{
                        type: 'linear',
                        position: 'bottom'
                    }]
                }
            }
        });
        // var isDualAxisChart = rightAxis.length > 0;
        // new Chart(document.getElementById(chartName),
        //     {
        //         type: 'scatter',
        //         data: {
        //             //labels: data[0],
        //             datasets: _datasets
        //         },
        //         options: {
        //             responsive: true,
        //             maintainAspectRatio: false,
        //             title: {
        //                 display: false,
        //             },
        //             tooltips: {
        //                 mode: 'index',
        //                 intersect: false,
        //             },
        //             hover: {
        //                 mode: 'nearest',
        //                 intersect: true
        //             },
        //             scales: {
        //                 xAxes: [{
        //                     display: true,
        //                     type: 'linear',
        //                     scaleLabel: {
        //                         display: true,
        //                         //labelString: dataHeaders[0]
        //                     },
        //                     gridLines: {
        //                         borderDash: [2, 2]
        //                     },
        //                     ticks: {
        //                         // autoSkip: true,
        //                         // maxTicksLimit: 10,
        //                         //maxRotation: 0
        //                     }
        //                 }],
        //                 yAxes: [{
        //                     display: true,
        //                     position: 'left',
        //                     id: 'y-axis-1',
        //                     scaleLabel: {
        //                         display: true,
        //                         labelString: axisLabels[0]
        //                     },
        //                     gridLines: {
        //                         borderDash: [2, 2]
        //                     }
        //                 },
        //                 {
        //                     display: isDualAxisChart,
        //                     position: 'right',
        //                     id: 'y-axis-2',
        //                     scaleLabel: {
        //                         display: true,
        //                         labelString: axisLabels[1]
        //                     },
        //                     gridLines: {
        //                         display: false,
        //                         borderDash: [2, 2]
        //                     }
        //                 }]
        //             },
        //             elements: {
        //                 point: {
        //                     radius: 0
        //                 },
        //             },
        //             legend: {
        //                 display: false
        //             }
        //        }
        //     });
        
        CalculateTrendLine(chart);
    });
}

function CalculateTrendLine(chart) 
{
    var dataPoints = chart.data.datasets[0].data;

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
    console.log(equation);
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