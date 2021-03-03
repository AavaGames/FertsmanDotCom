/**
 * Creates a Donut / Doughnut Chart using the Chart.js library
 * @param {String} chartName Chart ID name to be called by html <canvas>
 * @param {String} link The link/URL to the JSON
 * @param {Boolean} legendActive Shows the legend or not
 * @param {Integer} additionalDates Number of additional dates to grab
 * @param {Boolean} movingBackwards Dates grabbed moving backward or forward
 * @param {String} datesToFind "2019-12" if empty default to starting at latest
 */
function SetupDonutChart(ChartBuiltCallback, chartName, loadingSymbolName, sortedData, legendActive = false, additionalDates = 0, movingBackwards = true, ...dates) {

    var loadingSymbol = document.getElementById(loadingSymbolName);
    loadingSymbol.className = globalLoadingSymbolClass;

    // sortedData[0] = catagories
    // sortedData[1...] = data
    
    var randomData = false;

    var dataHeaders = sortedData[0];
    var data;
    if (randomData) {
        data = RandomData();
    } else {
        var startingAtLatestDate = dates.length == 0;
        var searchingForAdditionalDates = additionalDates > 0;

        var dataHeaders = sortedData[0];
        var data = sortedData[1];

        var newDatasets = [
            []
        ];

        var dateRows = [];

        if (startingAtLatestDate) {
            // Get latest row
            dateRows[0] = data[0].length - 1;
            //console.log("Latest Date " + data[0][data[0].length - 1]);
        } 
        else 
        {
            // WIP, cannot find other dates atm

            //console.log("Finding Date");

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
            //console.log(dateRows.length, dateRows);
        }

        // remove date from data
        dataHeaders.splice(0, 1);
        data.splice(0, 1);

        //console.log(dateRows);

        // data.forEach (columnData => {
        //     newDatasets[i].push(columnData[dateRows[i]]); 
        // });
        for (var i = 0; i < dateRows.length; i++) {
            if (dateRows.length == 1 && searchingForAdditionalDates) {
                // move back / forward through the data and add it
            }
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
            data: data[i],
            backgroundColor: bgColors,
            //fill: true
            borderWidth: 5,
            borderColor: "rgba(255, 255, 255, 1)",
            hoverBackgroundColor: "rgba(50, 50, 50, 1)",
            hoverBorderColor: "rgba(255, 255, 255, 0.5)",
        }
    }

    // End of chart specific Line / Dataset Formatting
    
    $("#" + loadingSymbolName).find('.lds-text').remove();
    loadingSymbol.classList.remove(globalLoadingSymbolClass);

    let chart = new Chart(document.getElementById(chartName), {
        type: 'doughnut',
        data: {
            labels: data[0],
            datasets: _datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutoutPercentage: 35,
            animation: {
                animateScale: true,
                animateRotate: true
            },
            title: {
                display: false,
            },
            legend: {
                display: legendActive,
                position: 'top',
                align: 'center' // 'start'
            },
            plugins: {
                labels: [{
                    render: 'percentage',
                    fontColor: "rgba(255, 255, 255, 1)",
                    fontStyle: 'bolder',
                    position: 'border',
                    outsidePadding: 2,    
                    arc: false,
                    overlap: true, 
                    textMargin: 6
                }]
            }
        }
    });

    ChartBuiltCallback(chart);
}

// Give it multiple dates and it will search for those, OR
// Give it a starting date and then additional dates and direction

// Unused, integrated into chart function because of variables
function SortDataForDonutOrPie(sortedData, additionalDates = 0, movingBackwards = true, ...dates) {

    var startingAtLatestDate = dates.length == 0;
    var searchingForAdditionalDates = additionalDates > 0;

    var dataHeaders = sortedData[0];
    var data = sortedData[1];

    var newDatasets = [[]];

    var dateRows = [];

    if (startingAtLatestDate) {
        // Get latest row
        dateRows[0] = data[0].length - 1;
        console.log("Latest Date " + data[0][data[0].length - 1]);
    } else {
        console.log("Finding Date");
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
        console.log(dateRows.length, dateRows);
    }

    // remove date from data
    dataHeaders.splice(0, 1);
    data.splice(0, 1);

    console.log(dateRows);

    // data.forEach (columnData => {
    //     newDatasets[i].push(columnData[dateRows[i]]); 
    // });
    for (var i = 0; i < dateRows.length; i++) {
        if (dateRows.length == 1 && searchingForAdditionalDates) {
            // move back / forward through the data and add it
        }
        newDatasets[i] = new Array();
        data.forEach(columnData => {
            newDatasets[i].push(columnData[dateRows[i]]);
        });
    }

    return [dataHeaders, newDatasets];
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
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100)
        ],
        [
            "Wwpakdpoak",
            "Wwpakdpoak",
            "dpo",
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
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100)
        ]
    ];
}