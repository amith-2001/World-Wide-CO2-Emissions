const startYear = 1750;
const endYear = 2020;
const window_dims = {
    width: window.innerWidth,
    height: window.innerHeight
};
const svgWidth = window_dims.width / 2;
const svgHeight = window_dims.width / 3;

const World_map = "./data/world_data.geojson";
const emissions = "./data/emissions_processed.csv";
const yearSlider = d3.select('#yearSlider');
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
            
            container.on('wheel', (event) => {
                const cursor = d3.pointer(event);
                const [x, y] = cursor;
                
                svg.transition()
                    .duration(500)
                    .call(zoom.transform, d3.zoomIdentity
                        .scale(event.deltaY > 0 ? 0.8 : 1.2)
                        .translate(x, y)
                    );
            });

            const tooltip = d3.select("#tooltip_1");

            svg.selectAll("path")
                .data(geo_data.features)
                .enter()
                .append("path")
                .attr("d", d => geoPath_generator(d))
                .attr("fill", d => colorInterpolator(linearScale(d['properties']['emission_data'][year])))
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
                .attr("fill", d => colorInterpolator(linearScale(d['properties']['emission_data'][year])))
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

        yearSlider.on('input', () => {
            currentYear = +yearSlider.property('value');
            updateMap(currentYear);
        });

        function animateMap() {
            if (animationRunning) {
                clearInterval(interval);
                animationRunning = false;
                animateButton.text('Continue');
            } 
            else if (currentYear >= endYear) {
                currentYear = startYear;
                interval = setInterval(() => {
                    if (currentYear <= endYear) {
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
        animateButton.on('click', animateMap);

        generateMap(geojson_data, '.map', svgWidth, svgHeight, currentYear);
    });
} catch (error) {
    console.error("An error occurred:", error);
}
