const startYear = 1750;
const endYear = 2020;
const window_dims = {
    width: window.innerWidth,
    height: window.innerHeight
};
const svgWidth = window_dims.width / 2;
const svgHeight = window_dims.width / 3;
const legendWidth = 200;
const legendHeight = 20;

const World_map = "https://rahulmanjunath.github.io/World-Wide-CO2-Emissions/D3js-Visualization/data/world_data.geojson";
const emissions = "https://rahulmanjunath.github.io/World-Wide-CO2-Emissions/D3js-Visualization/data/emissions_processed.csv";
const yearSlider = d3.select('#yearSlider');
const countryHeading = d3.select('#countryHeading');
const bar = d3.select('#chart');
const animateButton = d3.select('#animateButton');

try {
    Promise.all([
        d3.json(World_map),
        d3.csv(emissions)
    ]).then((data) => {

        let currentYear = startYear;
        const geojson_data = data[0];
        const emissions_data = data[1];

        const generateMap = (geo_data, containerName, width, height, year, margin = 30) => {
            d3.select(containerName).selectAll("svg").remove();

            const zoom = d3.zoom()
                .scaleExtent([1, 8])
                .on("zoom", zoomed);

            const container = d3.select(containerName);
            const svg = container.append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g");
            
            svg.call(zoom);
            function zoomed(event) {
                svg.attr("transform", event.transform);
            }

            const geoPath_generator = d3.geoPath()
                .projection(d3.geoMercator().fitSize([width - margin, height - margin], geo_data));

            const colorInterpolator = d3.interpolateRgbBasis(['#d73027', '#d45927', '#fc8d59', '#fee090', '#4575b4', '#3a76a6', '#e0f3f8'].reverse())
            
            const linearScale = d3.scaleLinear()
                .domain(d3.extent(geo_data.features, (d) => {
                    return d['properties']['emission_data'][year]
                }))
            
                let isDragging = false;
                let startX, startY;
                
                container.on('mousedown', (event) => {
                    isDragging = true;
                    const cursor = d3.pointer(event);
                    [startX, startY] = cursor;
                });
                
                container.on('mousemove', (event) => {
                    if (!isDragging) return;
                
                    const cursor = d3.pointer(event);
                    const [x, y] = cursor;
                
                    svg.call(zoom.transform, d3.zoomIdentity.translate(x - startX, y - startY));
                });
                
                container.on('mouseup', () => {
                    isDragging = false;
                });
                

            const maxValue = d3.max(geo_data.features, d => d['properties']['emission_data'][year]);

            const legendSvg = container.append('svg')
            .attr('id', 'legendSvg') // Add an ID to the legend SVG for easy selection
            .attr('width', legendWidth)
            .attr('height', legendHeight)
            .style('position', 'absolute')
            .style('left', '280px')
            .style('top', `${height + 260}px`);
    

            // Create a gradient for the legend
            legendSvg.append('defs')
            .append('linearGradient')
            .attr('id', 'legendGradient')
            .attr('x1', '0%')
            .attr('x2', '100%')
            .selectAll('stop')
            .data(d3.range(0, 1.1, 0.1))
            .enter().append('stop')
            .attr('offset', d => (d * 100) + '%')
            .attr('stop-color', d => colorInterpolator(linearScale(d * maxValue))); // Adjust 'maxValue' based on your data

            // Draw the rectangle for the legend
            legendSvg.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', legendWidth)
            .attr('height', legendHeight)
            .style('fill', 'url(#legendGradient)');
    
            // Add text for legend labels
            const legendLabels = ['Low', 'High']; // Modify these labels based on your data
            legendSvg.selectAll('.legendLabel')
                .data(legendLabels)
                .enter().append('text')
                .attr('class', 'legendLabel')
                .attr('x', (d, i) => i * 250)
                .attr('y', `${height + 210}px`)
                .text(d => d)
                .style('text-anchor', 'middle');

            const tooltip = d3.select("#tooltip_1");

            svg.selectAll("path")
            .data(geo_data.features.filter(d => d.properties.name !== "Antarctica"))
            .enter()
            .append("path")
            .attr("d", d => geoPath_generator(d))
            .attr("fill", d => colorInterpolator(linearScale(d['properties']['emission_data'][year])))
            .on("click", (m, d) => {
                // Dispatch a custom event when a country is clicked
                const countryName = d.properties.name;
                const countryClickEvent = new CustomEvent('countryClicked', { detail: { country: countryName } });
                document.dispatchEvent(countryClickEvent);
            })
        

                .on("mouseenter", (m, d) => {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9)
                        tooltip.html(d.properties.name + '<br>CO2 Emission(Tons):' + d.properties.emission_data[year])
                        .style("left", m.clientX + "px")
                        .style("top", m.clientY + "px");
                })
                .on("mousemove", (m, d) => {
                    tooltip.style("opacity", .9)
                })
                .on("mouseout", (m, d) => {
                    tooltip.transition()
                        .duration(400)
                        .style("opacity", 0)
                });
        }

        function updateMap(year) {
            const colorInterpolator = d3.interpolateRgbBasis(['#d73027', '#d45927', '#fc8d59', '#fee090', '#4575b4', '#3a76a6', '#e0f3f8'].reverse())

            const linearScale = d3.scaleLinear()
                .domain(d3.extent(geojson_data.features, (d) => {
                    return d['properties']['emission_data'][year]
                }))

            const tooltip = d3.select("#tooltip_1");
            
            d3.selectAll("path")
                .attr("fill", d => {
                    if (d && d.properties && d.properties.emission_data && d.properties.emission_data[year]) {
                        return colorInterpolator(linearScale(d.properties.emission_data[year]));
                    } else {
                        // Handle the case where the data or property is null
                        return '#e0f3f8';
                    }
                })
                .on("mouseenter", (m, d) => {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9)
                        tooltip.html(d.properties.name + '<br>CO2 Emission(Tons):' + d.properties.emission_data[year])
                        .style("left", m.clientX + "px")
                        .style("top", m.clientY + "px");
                })
                .on("mousemove", (m, d) => {
                    tooltip.style("opacity", .9)
                })
                .on("mouseout", (m, d) => {
                    tooltip.transition()
                        .duration(400)
                        .style("opacity", 0)
                });
        }

        // 2nd viz
        function updateBar(year,emissionData){
            const filteredData = emissionData.filter(d => +d.Year === year && +d['CO2 emission (Tons)'] !== 0);
            filteredData.sort((a, b) => b['CO2 emission (Tons)'] - a['CO2 emission (Tons)']);
            const top10Data = filteredData.slice(0, 10);

            const margin = { top: 40, right: 20, bottom: 60, left: 5 };

            bar.selectAll('*').remove();
            const chart = bar.append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);
            
            const maxCO2 = d3.max(top10Data, d => +d['CO2 emission (Tons)']);
            const numberOfValues = top10Data.length;
            const width = 400;

            let height;
            if (numberOfValues <= 2) {
                height = 50;
            } else if (numberOfValues == 3) {
                height = 100;
            } else if (numberOfValues >= 4 && numberOfValues < 6) {
                height = 250;
            } else if (numberOfValues >= 6 && numberOfValues < 9) {
                height = 350;
            } else {
                height = 350;
            }

            const x = d3.scaleLinear()
                .domain([0, maxCO2])
                .range([0, width]);
  
            const y = d3.scaleBand()
                .domain(top10Data.map(d => d.Country))
                .range([0, height])
                .padding(0.1);
  
            const color = d3.scaleOrdinal(d3.schemeCategory10);
  
            chart.selectAll('.bar')
                .data(top10Data)
                .enter().append('rect')
                .attr('class', 'bar')
                .attr('x', 0)
                .attr('y', d => y(d.Country))
                .attr('width', d => x(+d['CO2 emission (Tons)']))
                .attr('height', y.bandwidth())
                .attr('fill', d => color(d.Country));
 
            let labelCondition;
            if (year >= 1898 && year <= 1935) {
                labelCondition = 2; // Use the different label condition for the specified years
            } else {
                labelCondition = 1; // Default label condition
            }    
            
            chart.selectAll('.label')
                .data(top10Data)
                .enter().append('text')
                .attr('class', 'label')
                .attr('x', d => {
                if (top10Data.indexOf(d) < labelCondition) {
                    return x(+d['CO2 emission (Tons)']) - 5;
                } else {
                    return x(+d['CO2 emission (Tons)']) + 5;
                }
                })
                .attr('y', d => y(d.Country) + y.bandwidth() / 2)
                .attr('dy', '0.35em')
                .attr('fill', 'black')
                .style('font-size', '12px')
                .style('font-family', 'Arial')
                .attr('text-anchor', d => (top10Data.indexOf(d) < labelCondition) ? 'end' : 'start')
                .text(d => `${d.Country}: ${d['CO2 emission (Tons)']} Tons`);
  
            chart.append('g')
                .call(d3.axisLeft(y));
            
            bar.attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .style('overflow', 'auto');
        }

        yearSlider.on('input', () => {
            currentYear = +yearSlider.property('value');
            countryHeading.text(`CO2 emissions by top-10 countries in ${currentYear}`);
            updateBar(currentYear,emissions_data);
            updateMap(currentYear);
        });

        function animate() {
            if (animationRunning) {
                clearInterval(interval);
                animationRunning = false;
                animateButton.text('Continue');
            } 
            else if (currentYear >= endYear) {
                currentYear = startYear;
                interval = setInterval(() => {
                    if (currentYear <= endYear) {
                        countryHeading.text(`CO2 emissions by top-10 countries in ${currentYear}`);
                        updateBar(currentYear,emissions_data);
                        updateMap(currentYear);
                        yearSlider.property('value', currentYear);
                        currentYear++;
                    } else {
                        clearInterval(interval);
                        animationRunning = false;
                        animateButton.text('Restart');
                    }
                }, 100);
                animationRunning = true;
                animateButton.text('Stop');
            }
            else {
                interval = setInterval(() => {
                    if (currentYear <= endYear) {
                        countryHeading.text(`CO2 emissions by top-10 countries in ${currentYear}`);
                        updateBar(currentYear,emissions_data);
                        updateBar(currentYear,emissions_data);
                        updateMap(currentYear);
                        yearSlider.property('value', currentYear);
                        currentYear++;
                    } else {
                        clearInterval(interval);
                        animationRunning = false;
                        animateButton.text('Restart');
                    }
                }, 100);
                animationRunning = true;
                animateButton.text('Stop');
            }
        }
        animationRunning = false;
        animateButton.on('click', animate);

        generateMap(geojson_data, '.map', svgWidth, svgHeight, currentYear);
        updateBar(currentYear,emissions_data);
    });
} catch (error) {
    console.error("An error occurred:", error);
}
