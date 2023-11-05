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

Promise.all([
    d3.json(World_map),
    d3.csv(emissions)
]).then((data) => {

    let currentYear = startYear;
    const geojson_data = data[0];
    const emissions_data = data[1];
    console.log(geojson_data);

    const generateMap = (geo_data, containerName, width, height, year, margin = 30) => {
        d3.select(containerName).selectAll("svg").remove();

        const svg = d3.select(containerName).append("svg")
            .attr("width", width)
            .attr("height", height);

        const geoPath_generator = d3.geoPath()
            .projection(d3.geoMercator().fitSize([width - margin, height - margin], geo_data));

        const colorInterpolator = d3.interpolateRgbBasis(['#d73027','#fc8d59','#fee090','#e0f3f8','#91bfdb','#4575b4'].reverse())

        const logScale = d3.scaleLog()
                .domain(d3.extent(geo_data.features, (d) => {
                    return d['properties']['pop_est']
                }))
        
        
        svg.selectAll("path")
            .data(geo_data.features)
            .enter()
            .append("path")
            .attr("d", d => geoPath_generator(d))
            .attr("fill", d => colorInterpolator(logScale(d['properties']['pop_est'])));
    }

    yearSlider.on('input', () => {
        currentYear = +yearSlider.property('value');
        generateMap(geojson_data, '.map', svgWidth, svgHeight, currentYear);
    });

    generateMap(geojson_data, '.map', svgWidth, svgHeight, currentYear);
});
