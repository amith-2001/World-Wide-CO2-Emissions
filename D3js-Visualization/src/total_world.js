document.addEventListener('DOMContentLoaded', function () {
    // Fetch the CSV file
    fetch('https://rahulmanjunath.github.io/World-Wide-CO2-Emissions/D3js-Visualization/data/emissions_processed.csv')
        .then(response => response.text())
        .then(csvData => {
            // Parse CSV data and extract relevant information
            var lines = csvData.split('\n');
            var years = [];
            var totalEmissions = [];

            for (var i = 1; i < lines.length; i++) {
                var values = lines[i].split(',');
                years.push(values[1]);
                totalEmissions.push(parseFloat(values[3]));
            }

            // Initialize ECharts instance
            var myChart = echarts.init(document.getElementById('worldEmissionsChart'));


            // Format y-axis labels with abbreviations (K, M, B)
            function formatYAxisLabel(value) {
                if (Math.abs(value) >= 1e9) {
                    return (value / 1e9).toFixed(1) + 'B';
                } else if (Math.abs(value) >= 1e6) {
                    return (value / 1e6).toFixed(1) + 'M';
                } else if (Math.abs(value) >= 1e3) {
                    return (value / 1e3).toFixed(1) + 'K';
                } else {
                    return value.toString();
                }
            }

            // Set options
            var options = {
                title: {
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross'
                    },
                    formatter: function (params) {
                        var tooltip = 'Year: ' + params[0].name + '<br/>'; // Year
            
                        // Iterate over each data point in the tooltip
                        params.forEach(function (item) {
                            tooltip += 'CO2 emitted (tons): ' + formatYAxisLabel(item.value) + '<br/>';
                        });
            
                        return tooltip;
                    }
                },
                xAxis: {
                    type: 'category',
                    data: years,
                    name: 'Year',
                    axisTick: {
                        alignWithLabel: true,
                        
                        setInterval: 30
                    },
                    axisLabel: {
                        rotate: 90  
                    }
                },
                yAxis: {
                    type: 'value',
                    name: 'Total Emission (Tons)',
                    axisLabel: {
                        formatter: formatYAxisLabel
                    }
                },
                series: [{
                    data: totalEmissions,
                    type: 'line',
                    smooth: true
                }]
            };

            // Set the options to the chart
            myChart.setOption(options);
        })
        .catch(error => console.error('Error fetching CSV file:', error));
});
