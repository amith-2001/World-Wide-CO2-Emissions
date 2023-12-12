document.addEventListener('DOMContentLoaded', function () {
    fetch("https://rahulmanjunath.github.io/World-Wide-CO2-Emissions/D3js-Visualization/data/world_data.geojson")
        .then((response) => response.json())
        .then((geoData) => {
            // Extract emission data for each country
            var countries = [];
            var emissionData = [];
            geoData.features.forEach(function (feature) {
                var countryName = feature.properties.name;
                var cumulativeEmissions = 0;
                var cumulativeEmissionsData = [];

                for (var year = 1750; year <= 2020; year++) {
                    var yearStr = year.toString();
                    var yearlyEmission = feature.properties.emission_data[yearStr] || 0;
                    cumulativeEmissions += yearlyEmission;
                    cumulativeEmissionsData.push(cumulativeEmissions);
                }

                countries.push({ name: countryName, totalEmissions: cumulativeEmissions });
                emissionData.push(cumulativeEmissionsData);
            });

            // Sort countries based on total emissions
            countries.sort(function (a, b) {
                return b.totalEmissions - a.totalEmissions;
            });

            // Select top 10 countries
            var top10Countries = countries.slice(0, 20);

            // Initialize ECharts instance
            var myChart = echarts.init(document.getElementById('countryEmissionsChart'));

            // Set up the option
            var option = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: {
                    data: ['Cumulative CO2 Emissions']
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: top10Countries.map(function (d) { return d.name; }),
                    axisLabel: {
                        rotate: -45,
                        interval: 0
                    }
                },
                yAxis: {
                    type: 'value'
                },
                series: [{
                    name: 'Cumulative CO2 Emissions',
                    type: 'bar',
                    data: top10Countries.map(function (country) {
                        return country.totalEmissions;
                    }),
                    itemStyle: {
                        color: 'steelblue'
                    }
                }]
            };

            // Set option to the chart
            myChart.setOption(option);

            // Initialize jQuery UI slider for selecting the year
            $("#yearSlide").slider({
                range: true,
                min: 1750,
                max: 2020,
                values: [1750, 2020],
                slide: function (event, ui) {
                    // Filter data based on selected year range
                    var filteredData = geoData.features.map(function (feature) {
                        var cumulativeEmissions = 0;
                        var cumulativeEmissionsData = [];

                        for (var year = ui.values[0]; year <= ui.values[1]; year++) {
                            var yearStr = year.toString();
                            var yearlyEmission = feature.properties.emission_data[yearStr] || 0;
                            cumulativeEmissions += yearlyEmission;
                            cumulativeEmissionsData.push(cumulativeEmissions);
                        }

                        return { name: feature.properties.name, totalEmissions: cumulativeEmissions };
                    });

                    // Sort and select top 10 countries based on total emissions
                    filteredData.sort(function (a, b) {
                        return b.totalEmissions - a.totalEmissions;
                    });

                    var top10FilteredCountries = filteredData.slice(0, 20);

                    // Update chart data
                    myChart.setOption({
                        xAxis: {
                            data: top10FilteredCountries.map(function (d) { return d.name; }),
                        },
                        series: [{
                            data: top10FilteredCountries.map(function (country) {
                                return country.totalEmissions;
                            }),
                        }]
                    });

                    // Update selected year range text
                    $("#selectedYearRange").text("Selected Year Range: " + ui.values[0] + " - " + ui.values[1]);
                }
            });

            // Initial text for selected year range
            $("#selectedYearRange").text("Selected Year Range: " + $("#yearSlider").slider("values", 0) + " - " + $("#yearSlider").slider("values", 1));
        })
        .catch(function (error) {
            console.log(error);
        });
});