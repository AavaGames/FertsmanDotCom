/**
 * Creates a Line Chart using the Chart.js library
 * @param {String} chartName Chart ID name to be called by html <canvas>
 * @param {String} link The link/URL to the JSON
 * @param {Number} rightAxis Rest syntax for all columns put on the right axis, count from 1.
 *                           leave EMPTY if no right axis is desired.
 */
function SetupLineChart(ChartBuiltCallback, chartName, loadingSymbolName, link, ...rightAxis) {

    var loadingSymbol = document.getElementById(loadingSymbolName);
    loadingSymbol.className = globalLoadingSymbolClass;

    console.log("Getting JSON");
    $.getJSON(link, json => {
        console.log("Got JSON");

        var sortedData = SortJSONintoHeadersAndValues(json)

        var dataHeaders = sortedData[0];
        var data = sortedData[1];

        // End of JSON formatting

        var _datasets = [];
        var axisLabels = ["", ""];
        for (var i = 1; i < data.length; i++) {
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
            } else {
                if (!axisLabels[0] == "")
                    axisLabels[0] = axisLabels[0] + ", ";
                axisLabels[0] = axisLabels[0] + axisLabel;
            }

            _datasets[i - 1] = {
                label: dataHeaders[i],
                //For Bar Chart
                //backgroundColor: "rgba(0, 175, 181, 1)",
                borderColor: lineOptions.GetColor(i - 1),
                data: data[i],
                fill: false,
                yAxisID: axis,
            }
        }

        // End of chart specific Line / Dataset Formatting

        loadingSymbol.classList.remove(globalLoadingSymbolClass);

        var isDualAxisChart = rightAxis.length > 0;
        let chart = new Chart(document.getElementById(chartName), {
            type: 'line',
            data: {
                labels: data[0],
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
                        scaleLabel: {
                            display: false,
                            //labelString: dataHeaders[0]
                        },
                        gridLines: {
                            borderDash: [2, 2]
                        },
                        ticks: {
                            autoSkip: true,                               
                            autoSkipPadding: 100,
                            //maxTicksLimit: 3,
                            maxRotation: 0
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
                            },
                            ticks: {
                                autoSkip: true,
                                padding: 0,
                                autoSkipPadding: 15,
                                callback: function(value) {
                                    return AbbreviateNumber(value);
                                } 
                            }
                        },
                        {
                            display: isDualAxisChart,
                            position: 'right',
                            id: 'y-axis-2',
                            scaleLabel: {
                                display: true,
                                labelString: axisLabels[1]
                            },
                            gridLines: {
                                display: false,
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
                        }
                    ]
                },
                elements: {
                    point: {
                        radius: 0
                    },
                },
                legend: {
                    display: false
                }
            }
        });
        ChartBuiltCallback(chart);

    }).fail( function(textStatus) {
        console.error("Chart ERROR: Failed to obtain JSON, make sure spreadsheet is public." + "\n\nJSON Error Message: " + textStatus.responseJSON.error.message);
    });
}