/**
 * Creates a Donut / Doughnut Chart using the Chart.js library
 * @param {String} chartName Chart ID name to be called by html <canvas>
 * @param {String} link The link/URL to the JSON
 * @param {Integer} additionalDates Number of additional dates to grab
 * @param {Boolean} movingBackwards Dates grabbed moving backward or forward
 * @param {String} datesToFind "2019-12" if empty default to starting at latest
 */
function SetupDonutChart(chartName, loadingSymbolName, link, additionalDates = 0, movingBackwards = true, ...dates) {

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
        if (randomData) {
            data = RandomData();
        } else {
            console.log(sortedData);

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

            var data = [sortedData[0]]
            newDatasets.forEach(e => {
                data.push(e);
            });

        }

        console.log(data);
        // End of JSON formatting

        var bgColors = [];
        for (var i = 0; i < data[0].length; i++) {
            bgColors[i] = lineOptions.GetColor(i);
        }
        var _borderColor = "rgba(0, 0, 0, 0.3)";

        var _datasets = [];
        for (var i = 1; i < data.length; i++) {
            _datasets[i - 1] = {
                // remove in multiset
                //label: data[0],
                borderColor: _borderColor,
                data: data[i],
                backgroundColor: bgColors,
                //fill: true
            }
        }

        console.log(_datasets);

        // End of chart specific Line / Dataset Formatting

        loadingSymbol.classList.remove(globalLoadingSymbolClass);

        new Chart(document.getElementById(chartName), {
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
                    display: false,
                    position: 'top',
                    align: 'center' // 'start'
                },
                plugins: {
                    labels: {
                        // display: true,
                        render: 'label',
                        fontColor: '#000',
                        arc: true,
                        overlap: false
                        // position: 'outside'
                    }
                }
            }
        });
    });
}

// Give it multiple dates and it will search for those, OR
// Give it a starting date and then additional dates and direction

// Unused, integrated into chart function because of variables
function SortDataForDonutOrPie(sortedData, additionalDates = 0, movingBackwards = true, ...dates) {
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