fetch('/D3js-Visualization/data/world_data.geojson')
.then(response => response.json())
.then(geoData => {
    // Extract unique country names
    var countryNames = geoData.features.map(d => d.properties.name);

    // Populate the dropdown menu
    var select = document.getElementById("countrySelect");
    countryNames.forEach(function (country) {
        var option = document.createElement("option");
        option.text = country;
        select.add(option);
    });

    // Create a color scale for different countries
    var colorScale = echarts.color.scale('category10');

    // Initial country selection
    var initialCountry = select.value;

    // Call updateChart once data is loaded
    updateChart(initialCountry, geoData, colorScale);

    // Add event listener for dropdown change
    select.addEventListener("change", function () {
        var selectedCountry = this.value;
        updateChart(selectedCountry, geoData, colorScale);
    });
})
.catch(error => console.error('Error fetching GeoJSON file:', error));

function updateChart(selectedCountry, geoData, colorScale) {
// Extract emission data for the selected country
var selectedFeature = geoData.features.find(d => d.properties.name === selectedCountry);
var emissionData = selectedFeature.properties.emission_data;

// Extract years and emissions as separate arrays
var years = Object.keys(emissionData);
var emissions = Object.values(emissionData);

// Create the series data for ECharts
var seriesData = years.map(function (year, index) {
    return [year, emissions[index]];
});

// Set options
var options = {
    title: {
        text: 'Trend for ' + selectedCountry
    },
    xAxis: {
        type: 'category',
        data: years
    },
    yAxis: {
        type: 'value',
        name: 'Emissions'
    },
    series: [{
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        data: seriesData,
        lineStyle: {
            color: colorScale(selectedCountry)
        },
        emphasis: {
            focus: 'series'
        },
        markLine: {
            silent: true,
            data: [{
                yAxis: 0
            }]
        }
    }]
};

// Initialize ECharts instance
var myChart = echarts.init(document.getElementById('countrySelect'));

// Set the options to the chart
myChart.setOption(options);
}