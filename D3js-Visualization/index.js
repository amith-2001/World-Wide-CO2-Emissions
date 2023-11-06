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
            console.log(typeof year);
            const svg = d3.select(containerName).append("svg")
                .attr("width", width)
                .attr("height", height);

            const geoPath_generator = d3.geoPath()
                .projection(d3.geoMercator().fitSize([width - margin, height - margin], geo_data));

            const colorInterpolator = d3.interpolateRgbBasis(['#d73027', '#fc8d59', '#fee090', '#e0f3f8', '#91bfdb', '#4575b4'].reverse())

            const linearScale = d3.scaleLinear()
                .domain(d3.extent(geo_data.features, (d) => {
                    return d['properties']['emission_data'][year]
                }))

            svg.selectAll("path")
                .data(geo_data.features)
                .enter()
                .append("path")
                .attr("d", d => geoPath_generator(d))
                .attr("fill", d => colorInterpolator(linearScale(d['properties']['emission_data'][year])));
        }

        function updateMap(year) {
            const colorInterpolator = d3.interpolateRgbBasis(['#d73027', '#fc8d59', '#fee090', '#e0f3f8', '#91bfdb', '#4575b4'].reverse())
            const linearScale = d3.scaleLinear()
                .domain(d3.extent(geojson_data.features, (d) => {
                    return d['properties']['emission_data'][year]
                }))

            d3.selectAll("path")
                .attr("fill", d => colorInterpolator(linearScale(d['properties']['emission_data'][year])));
        }

        yearSlider.on('input', () => {
            currentYear = +yearSlider.property('value');
            updateMap(currentYear);
        });

        function animateMap() {
            if (animationRunning) {
                clearInterval(interval);
                animationRunning = false;
                animateButton.text('Animate');
            } else {
                interval = setInterval(() => {
                    if (currentYear <= endYear) {
                        updateMap(currentYear);
                        yearSlider.property('value', currentYear);
                        currentYear++;
                    } else {
                        clearInterval(interval);
                        animationRunning = false;
                        animateButton.text('Animate');
                    }
                }, 100); // Change this value to adjust animation speed (in milliseconds)
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
