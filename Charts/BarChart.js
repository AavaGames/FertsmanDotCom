/**
 * Creates a Donut / Doughnut Chart using the Chart.js library
 * @param {String} chartName Chart ID name to be called by html <canvas>
 * @param {String} loadingSymbolName Loading Symbol ID name to be called by html <canvas>
 * @param {String} link The link/URL to the JSON
 * @param {String} date "2019-12" Format depends on data's date format, if left blank defaults to latest date
 */
function SetupBarChart(ChartBuiltCallback, chartName, loadingSymbolName, sortedData, verticalBar = true, legendActive = false, dates = "") {

    var loadingSymbol = document.getElementById(loadingSymbolName);
    loadingSymbol.className = globalLoadingSymbolClass;

    // sortedData[0] = catagories
    // sortedData[1...] = data

    var randomData = false;

    // TODO find this with the data
    var latestDate = sortedData[1][0][sortedData[1][0].length - 1];

    var dataHeaders = sortedData[0];
    var data;
    if (randomData) 
    {
        data = RandomData();
    } 
    else
    {
        //var startingAtLatestDate = dates.length == 0;
        var startingAtLatestDate = true;

        var dataHeaders = sortedData[0];
        var data = sortedData[1];

        var newDatasets = [
            []
        ];

        var dateRows = [];

        if (startingAtLatestDate) {
            // TODO make sure date has values for all headers
            
            // Get latest row
            dateRows[0] = data[0].length - 1;
        } else {
            // find dates
            for (var row = 0; row < data[0].length; row++) {
                for (var i = 0; i < dates.length; i++) {
                    if (data[0][row] == dates[i]) {
                        console.log("Date Found")
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
    }

    // End of JSON formatting

    var bgColors = [];
    for (var i = 0; i < data[0].length; i++) {
        bgColors[i] = lineOptions.GetColor(i);
    }

    var _datasets = [];
    for (var i = 1; i < data.length; i++) {
        _datasets[i - 1] = {
            // remove in multiset
            //label: data[0],
            label: latestDate,
            data: data[i],
            backgroundColor: bgColors,
            //fill: true
            hoverBackgroundColor: "rgba(50, 50, 50, 1)",
            borderWidth: 1,          
            borderColor: "rgba(255, 255, 255, 1)",
            hoverBorderColor: "rgba(255, 255, 255, 0.5)",
        }
    }

    // End of chart specific Line / Dataset Formatting

    loadingSymbol.classList.remove(globalLoadingSymbolClass);

    var barType = verticalBar ? 'bar' : 'horizontalBar'
    let chart = new Chart(document.getElementById(chartName), {
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
                display: legendActive,
                position: 'top',
                align: 'center' // 'start'
            },
            scales: {
                xAxes: [{
                    display: true,
                    gridLines: {
                        borderDash: [2, 2]
                    },
                    ticks: {
                        // autoSkip: true,
                        // padding: 0,
                        // autoSkipPadding: 15,
                        callback: function(value) {
                            return AbbreviateNumber(value);
                        } 
                    }
                }],
                yAxes: [{
                    display: true,
                    gridLines: {
                        borderDash: [2, 2]
                    },
                    ticks: {
                        // autoSkip: true,
                        // padding: 0,
                        // autoSkipPadding: 15,
                        callback: function(value) {
                            return AbbreviateNumber(value);
                        } 
                    }
                }],
            },                
            plugins: {
                labels: [{
                    // hide plugin label
                    fontSize: 0
                }]
            }
        }
    });

    ChartBuiltCallback(chart);
}

function RandomData() {
    return data = [
        [
            "Wholesale trade",
            "Retail trade",
            "Transportation and warehousing",
            "Information and cultural industries",
            "Finance and insurance",
            "Real estate and rental and leasing",
            "Professional, scientific and technical services",
            "Management of companies and enterprises",
            "Administrative and support, waste mangement and remediation services",
            "Educational services",
            "Health care and social assistance",
            "Arts, entertainment and recreation",
            "Accomodation and food services",
            "Other services",
            "Public administration"
        ],
        [
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100) * - 1,
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100) * - 1,
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100)
        ],
        // [
        //     Math.floor(Math.random() * 100),
        //     Math.floor(Math.random() * 100),
        //     Math.floor(Math.random() * 100),
        //     Math.floor(Math.random() * 100),
        //     Math.floor(Math.random() * 100),
        //     Math.floor(Math.random() * 100),
        //     Math.floor(Math.random() * 100),
        //     Math.floor(Math.random() * 100),
        //     Math.floor(Math.random() * 100),
        //     Math.floor(Math.random() * 100),
        //     Math.floor(Math.random() * 100),
        //     Math.floor(Math.random() * 100),
        //     Math.floor(Math.random() * 100),
        //     Math.floor(Math.random() * 100),
        //     Math.floor(Math.random() * 100)
        // ]
    ];
}