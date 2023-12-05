document.addEventListener('DOMContentLoaded', function() {
    fetch("/D3js-Visualization/data/world_data.geojson")
        .then((response) => response.json())
        .then((geoData) => {
        // Extract unique country names
            var countryNames = geoData.features.map((d) => d.properties.name);

        // Check if the select element exists in the HTML
            var select = document.getElementById("countrySelect");

            if (select) {
            // Populate the dropdown menu
                countryNames.forEach(function (country) {
                    var option = document.createElement("option");
                    option.text = country;
                    select.add(option);
                });

        // Set initial country selection to Fiji
                var initialCountry = "Fiji";
                select.value = initialCountry;

                // Call updateChart once data is loaded
                updateChart(initialCountry, geoData);

                // Add event listener for dropdown change
                select.addEventListener("change", function () {
                    var selectedCountry = this.value;
                    updateChart(selectedCountry, geoData);
                });

                document.addEventListener('countryClicked', function(event) {
                    const selectedCountry = event.detail.country;
                    select.value = selectedCountry;
                    updateChart(selectedCountry, geoData); // Call the function to update the chart with the selected country
                });
            }
            else {
                console.error("Dropdown element with ID 'countrySelect' not found.");
            }   
        })
    .catch((error) => console.error("Error fetching GeoJSON file:", error));
}); 

function updateChart(selectedCountry, geoData) {
  // Extract emission data for the selected country
    var selectedFeature = geoData.features.find(
        (d) => d.properties.name === selectedCountry
    );
    var emissionData = selectedFeature.properties.emission_data;

    // Extract years and emissions as separate arrays
    var years = Object.keys(emissionData);
    var emissions = Object.values(emissionData);

    // Create the series data for ECharts
    var seriesData = years.map(function (year, index) {
        return {
        value: [year, emissions[index]],
        emphasis: { label: { show: true } },
        };
    });

    function formatYAxisLabel(value) {
        if (Math.abs(value) >= 1e9) {
        return (value / 1e9).toFixed(1) + "B";
        } else if (Math.abs(value) >= 1e6) {
        return (value / 1e6).toFixed(1) + "M";
        } else if (Math.abs(value) >= 1e3) {
        return (value / 1e3).toFixed(1) + "K";
        } else {
        return value.toString();
        }
    }

  // Set options
    var options = {
        title: {
        text: "Trend for " + selectedCountry,
        },
        xAxis: {
        type: "category",
        data: years,
        name: "Year",
        axisTick: {
            alignWithLabel: true,

            setInterval: 30,
        },
        axisLabel: {
            rotate: 90,
        },
        },
        yAxis: {
        type: "value",
        name: "Emissions (Tons)",
        },
        tooltip: {
        trigger: "axis",
        axisPointer: {
            type: "cross",
        },
        formatter: function (params) {
            var tooltip = "Year: " + params[0].name + "<br/>"; // Year

            // Iterate over each data point in the tooltip
            params.forEach(function (item) {
            tooltip +=
                "CO2 emitted (tons): " + formatYAxisLabel(item.value) + "<br/>";
            });

            return tooltip;
        },
        },
        series: [
        {
            type: "line",
            smooth: true,
            symbol: "circle",
            symbolSize: 8,
            data: seriesData,
            lineStyle: {
            color: "red", // Set the line color to red
            },
            emphasis: {
            focus: "series",
            },
            markLine: {
            silent: true,
            data: [
                {
                yAxis: 0,
                },
            ],
            },
        },
        ],
    };

    // Initialize ECharts instance
    var myChart = echarts.init(document.getElementById("echartsContainer"));

    // Set the options to the chart
    myChart.setOption(options);
}
