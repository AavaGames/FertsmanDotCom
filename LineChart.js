function SetupDualAxisLineChart(chartName, link, ...rightAxis) {
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

        if (DEBUG)
        {
            console.log(dataHeaders);
            data.forEach(element => {
                console.log(element);
            });
        }

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

            _datasets[i - 1] = {
                label: dataHeaders[i],
                //For Bar Chart
                //backgroundColor: "rgba(0, 175, 181, 1)",
                borderColor: lineOptions.colors[i],
                data: data[i],
                fill: false,
                yAxisID: axis,
            }
        }

        // End of Line / Dataset Formatting

        new Chart(document.getElementById('myChart'),
            {
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
                        },
                        {
                            display: true,
                            position: 'right',
                            id: 'y-axis-2',
                            scaleLabel: {
                                display: true,
                                labelString: axisLabels[1]
                            },
                            gridLines: {
                                display: false,
                                borderDash: [2, 2]
                            }
                        }]
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
    });
}