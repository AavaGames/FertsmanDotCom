/**
 * Creates a Scatter Chart using the Chart.js library
 * @param {String} chartName Chart ID name to be called by html <canvas>
 * @param {String} link The link/URL to the JSON
 * @param {String} swapDataAxis Swaps the axis of the data
 */
function SetupScatterChart(chartName, loadingSymbolName, link, swapDataAxis = false) {
    var loadingSymbol = document.getElementById(loadingSymbolName);
    loadingSymbol.className = globalLoadingSymbolClass;

    console.log("Fetching JSON from link");
    $.getJSON(link, json => {
        console.log("JSON Acquired");

        var sortedData = SortJSONintoHeadersAndValues(json, false)

        var dataHeaders = sortedData[0];
        var data = sortedData[1];

        if (swapDataAxis) {
            var tempData = [];
            tempData[0] = data[1];
            tempData[1] = data[0];
            data = tempData;
        }

        // End of JSON formatting

        var _datasets = [];

        var axisLabels = ["", ""];
        for (var i = 0; i < data.length; i++) {
            var axis = 'y-axis-1';
            var axisLabel = dataHeaders[i]
            if (!axisLabels[0] == "")
                axisLabels[0] = axisLabels[0] + ", ";
            axisLabels[0] = axisLabels[0] + axisLabel;
        }

        var pointData = [];

        for (var i = 0; i < data[0].length; i++) {
            pointData[i] = {
                x: Number(data[0][i]),
                y: Number(data[1][i])
            }
        }

        _datasets[0] = {
            label: axisLabels[0],
            backgroundColor: lineOptions.GetColor(3),
            borderColor: lineOptions.GetColor(1),
            data: pointData,
            //fill: true,
            yAxisID: axis,
        }

        // End of Line / Dataset Formatting

        loadingSymbol.classList.remove(globalLoadingSymbolClass);

        var chart = new Chart(document.getElementById(chartName), {
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
                        ticks: {
                            callback: function(value) {
                                var ranges = [
                                    { divider: 1e12, suffix: 'T' },
                                    { divider: 1e9, suffix: 'B' },
                                    { divider: 1e6, suffix: 'M' },
                                    { divider: 1e3, suffix: 'k' }
                                ];
                                function AbbreviateNumber(n) {
                                    for (var i = 0; i < ranges.length; i++) {
                                        if (Math.abs(n) >= ranges[i].divider) {
                                            return (n / ranges[i].divider).toString() + ranges[i].suffix;
                                        }
                                    }
                                    return n;
                                }
                                return AbbreviateNumber(value);
                            } 
                        }
                    }],
                    yAxes: [{
                        ticks: {
                           callback: function(value) {
                            
                                var ranges = [
                                    { divider: 1e12, suffix: 'T' },
                                    { divider: 1e9, suffix: 'B' },
                                    { divider: 1e6, suffix: 'M' },
                                    { divider: 1e3, suffix: 'k' }
                                ];
                                function AbbreviateNumber(n) {
                                    for (var i = 0; i < ranges.length; i++) {
                                        if (Math.abs(n) >= ranges[i].divider) {
                                            return (n / ranges[i].divider).toString() + ranges[i].suffix;
                                        }
                                    }
                                    return n;
                                }
                                return AbbreviateNumber(value);
                           }
                        }
                    }]
                }
            }
        });

        CalculateTrendLine(chart);
    });
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

    chart.data.datasets.push({
        //label: "Equation: " + equation + ", R2 = " + r2,
        data: [startPoint, endPoint],
        showLine: true,
        pointRadius: 0,
        fill: false,
        borderColor: lineOptions.trendLine
    })
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