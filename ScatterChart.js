

function SetupScatterChart(chartName, link, ...rightAxis) 
{
    $.getJSON(link, json => {
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
        for (var i = 1; i < size; i++) {
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

        
        for (var i = 0; i < data[1].length; i++)
        {
            pointData[i] = {
                x: Number(data[1][i]),
                y: Number(data[2][i])
            }
        }

        _datasets[0] = 
        {
            label: axisLabels[0],
            //For Bar Chart
            backgroundColor: lineOptions.colors[3],
            borderColor: lineOptions.colors[1],
            data: pointData,
            //fill: true,
            //yAxisID: 'y-axis-1',
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
        //chart.render();
        CalculateTrendLine(chart);
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
    });
}

function CalculateTrendLine(chart) 
{
    var dataPoints = chart.data.datasets[0].data;

    var a, b, c, d, e, slope, yIntercept;
    var xSum = 0, ySum = 0, xySum = 0, xSquare = 0, dpsLength = dataPoints.length;
    
    var lowestX = dataPoints[0].x;
    var highestX = dataPoints[0].x;

    for(var i = 0; i < dpsLength; i++)
    {
        lowestX = lowestX > dataPoints[i].x ? dataPoints[i].x : lowestX;
        highestX = highestX < dataPoints[i].x ? dataPoints[i].x : highestX;

        xySum += (dataPoints[i].x * dataPoints[i].y)

        xSum += dataPoints[i].x;
        ySum += dataPoints[i].y;

        xSquare += Math.pow(dataPoints[i].x, 2);
    }

    a = xySum * dpsLength;
    b = xSum * ySum;
    c = dpsLength * xSquare;
    d = Math.pow(xSum, 2);
    slope = (a-b)/(c-d);
    e = slope * xSum;
    yIntercept = (ySum - e) / dpsLength;

    // var startPoint = GetTrendLinePoint(dataPoints[0], slope, yIntercept);
    // var endPoint = GetTrendLinePoint(dataPoints[dpsLength-1].x, slope, yIntercept);

    var startPoint = GetTrendLinePoint(lowestX, slope, yIntercept);
    var endPoint = GetTrendLinePoint(highestX, slope, yIntercept);

    console.log(startPoint);
    console.log(endPoint);

    chart.data.datasets.push({
        label: 'Line of Best Fit',
        data: [startPoint, endPoint],
        showLine: true,
        pointRadius: 0,
        fill: false,
        borderColor: lineOptions.trendLine
    })
    chart.update();
}

function GetTrendLinePoint(x, slope, intercept) {
    return {
        x: x, 
        y: ((slope * x) + intercept) 
    };
}