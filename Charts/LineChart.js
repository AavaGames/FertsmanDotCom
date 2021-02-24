/**
 * Creates a Line Chart using the Chart.js library
 * @param {String} chartName Chart ID name to be called by html <canvas>
 * @param {String} link The link/URL to the JSON
 * @param {Number} rightAxis Rest syntax for all columns put on the right axis, count from 1.
 *                           leave EMPTY if no right axis is desired.
 */
function SetupLineChart(ChartBuiltCallback, chartName, loadingSymbolName, sortedData, allItemsOnToolTip = false, ...rightAxis) {

    var loadingSymbol = document.getElementById(loadingSymbolName);
    loadingSymbol.className = globalLoadingSymbolClass;

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
            data: data[i],
            fill: false,
            yAxisID: axis,
            borderWidth: 3,
            borderColor: lineOptions.GetColor(i - 1),
            pointHoverRadius: 0,
        }
    }

    // End of chart specific Line / Dataset Formatting

    var tooltipOption;
    var hoverOption;
    if (allItemsOnToolTip)
    {
        // nearest, point or index - index shows all
        tooltipOption = {
            mode: 'index',
            intersect: false,
        };
        hoverOption = {
            mode: 'nearest',
            intersect: true
        };
    }
    else
    {
        tooltipOption = {
            mode: 'nearest',
            intersect: false,
        };
        hoverOption = {
            mode: 'nearest',
            intersect: false
        };
    }

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
            elements: {
                point: {
                    radius: 0
                },
            },
            legend: {
                display: false
            },
            tooltips: tooltipOption,
            hover: hoverOption,
            isMobileBrowser: DetectMobileBrowser(),
            hoverSwitchingLocked: false,
            previousActiveElement: -1,
            onClick: function onClick ()
            {
                if (!this.options.isMobileBrowser)
                    this.options.hoverSwitchingLocked = !this.options.hoverSwitchingLocked;
            },
            onHover: function onHover (event, activeElements) {
                if (allItemsOnToolTip || this.options.hoverSwitchingLocked || !activeElements || !activeElements.length) return;

                let activeIndex = activeElements[0]._datasetIndex;

                if (this.options.previousActiveElement != activeIndex)
                {
                    for (let i = 0; i < this.data.datasets.length; i++)
                    {
                        if (i == activeIndex && this.data.datasets[i].borderWidth == 3)
                        {
                            this.data.datasets[i].borderWidth = 5;
                            this.data.datasets[i].borderColor = 'rgba(0, 0, 0, 1)';
                        }
                        else if (this.data.datasets[i].borderWidth == 5)
                        {
                            this.data.datasets[i].borderWidth = 3;
                            this.data.datasets[i].borderColor = lineOptions.GetColor(i - 1);
                        }
                    }

                    if (activeIndex !== 0)
                    {
                        let activeSet = this.data.datasets[activeIndex];
                        this.data.datasets.splice(activeIndex, 1);
                        this.data.datasets.splice(0, 0, activeSet);
                    }

                    this.options.previousActiveElement = 0;
                    this.update();
                }
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: false,
                    },
                    gridLines: {
                        borderDash: [2, 2]
                    },
                    ticks: {
                        autoSkip: true,                               
                        autoSkipPadding: 10,
                        //maxTicksLimit: 3,
                        maxRotation: 45
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
        }
    });

    ChartBuiltCallback(chart);
}