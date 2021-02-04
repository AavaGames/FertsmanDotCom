/**
 * Creates a Donut / Doughnut Chart using the Chart.js library
 * @param {String} chartName Chart ID name to be called by html <canvas>
 * @param {String} loadingSymbolName Loading Symbol ID name to be called by html <canvas>
 * @param {String} link The link/URL to the JSON
 * @param {String} date "2019-12" Format depends on data's date format, if left blank defaults to latest date
 */
function SetupBarChart(chartName, loadingSymbolName, link, verticalBar = true, dates = "") {

    var loadingSymbol = document.getElementById(loadingSymbolName);
    loadingSymbol.className = globalLoadingSymbolClass;

    console.log("Fetching JSON from link");
    $.getJSON(link, json => {
        console.log("JSON Acquired");

        // sortedData[0] = catagories
        // sortedData[1...] = data

        var sortedData = SortJSONintoHeadersAndValues(json)

        var randomData = false;

        var dataHeaders = sortedData[0];
        var data;

        // WIP, cannot find other dates atm

        //var startingAtLatestDate = dates.length == 0;
        var startingAtLatestDate = true;

        var dataHeaders = sortedData[0];
        var data = sortedData[1];

        var newDatasets = [
            []
        ];

        var dateRows = [];

        if (startingAtLatestDate) {
            // Get latest row
            dateRows[0] = data[0].length - 1;
        } else {
            // find dates
            for (var row = 0; row < data[0].length; row++) {
                for (var i = 0; i < dates.length; i++) {
                    if (data[0][row] == dates[i]) {
                        dateRows.push(row);
                        // remove found date
                        dates.splice(i, 1);
                        continue;
                    }
                }
            }
        }

        // remove date from data
        dataHeaders.splice(0, 1);
        data.splice(0, 1);

        for (var i = 0; i < dateRows.length; i++) {
            newDatasets[i] = new Array();
            data.forEach(columnData => {
                newDatasets[i].push(columnData[dateRows[i]]);
            });
        }

        var data = [sortedData[0]]
        newDatasets.forEach(e => {
            data.push(e);
        });

        // End of JSON formatting

        var bgColors = [];
        for (var i = 0; i < data[0].length; i++) {
            bgColors[i] = lineOptions.GetColor(i);
        }
        var _borderColor = "rgba(255, 255, 255, 1)";

        var _datasets = [];
        for (var i = 1; i < data.length; i++) {
            _datasets[i - 1] = {
                // remove in multiset
                //label: data[0],
                label: "",
                borderColor: _borderColor,
                data: data[i],
                backgroundColor: bgColors,
                //fill: true
                borderWidth: 5
            }
        }

        // End of chart specific Line / Dataset Formatting

        loadingSymbol.classList.remove(globalLoadingSymbolClass);

        var barType = verticalBar ? 'bar' : 'horizontalBar'
        new Chart(document.getElementById(chartName), {
            type: barType,
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
                legend: {
                    //display: legendActive,
                    position: 'top',
                    align: 'center' // 'start'
                }
            }
        });
    });
}