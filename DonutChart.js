/**
 * Creates a Donut / Doughnut Chart using the Chart.js library
 * @param {String} chartName Chart ID name to be called by html <canvas>
 * @param {String} link The link/URL to the JSON
 * 
 * 
 * 
 * @param {String} dates = -1 (Month, Year) defaults to lastest
 * 
 *    Choose months and dates or choose latest and go back a number
 * 
 */
function SetupDonutChart(chartName, link) 
{
    console.log("Fetching JSON from link");
    $.getJSON(link, json => {
        console.log("JSON Acquired");

        //var sortedData = SortJSONintoHeadersAndValues(json)
        var dataHeaders = []
        //var dataHeaders = sortedData[0];
        var data = [[
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
        ],[
            "7.73",
            "7.73",
            "5.09",
            "4.67",
            "10.2",
            "19.14",
            "8.64",
            "0.62",
            "3.35",
            "7.53",
            "9.87",
            "0.61",
            "2.38",
            "2.46",
            "9.99"
        ],[
            "7.73",
            "7.73",
            "5.09",
            "4.67",
            "10.2",
            "19.14",
            "8.64",
            "0.62",
            "3.35",
            "7.53",
            "9.87",
            "0.61",
            "2.38",
            "2.46",
            "9.99"
        ]];
        // var data = sortedData[1];

        console.log(data);

        // data [0] = catagories
        // data [1...] = data

        // End of JSON formatting

        Chart.defaults.global.defaultColor = chartDefaultColor;
        Chart.defaults.global.defaultFontFamily = chartFontFamily;
        
        var bgColors = [];
        for (var i = 0; i < data[0].length; i++) {
            bgColors[i] = lineOptions.GetColor(i);
        }
        var _borderColor = "rgba(0, 0, 0, 0.3)";

        var _datasets = [];
        for (var i = 1; i < data.length; i++)
        {
            _datasets[i - 1] = {
                label: dataHeaders[i],
                borderColor: _borderColor,
                data: data[i],
                backgroundColor: bgColors,
                //fill: true
            }
        }

        console.log(_datasets);

        // End of chart specific Line / Dataset Formatting

        new Chart(document.getElementById(chartName), 
        {
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
                labels: {
                    display: true,
                },
				legend: {
                    position: 'top',
                    align: 'center'// 'start'
                },
            }
        });
    });
}