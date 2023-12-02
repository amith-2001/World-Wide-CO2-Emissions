// Load GeoJSON data
fetch('/D3js-Visualization/data/world_data.geojson')
    .then(response => response.json())
    .then(geoData => {
        // Extract unique country names
        var countryNames = geoData.features.map(d => d.properties.name);

        // Populate the dropdown menu
        var select = d3.select("#countrySelect")
            .selectAll("option")
            .data(countryNames)
            .enter()
            .append("option")
            .text(d => d);

        // Create a color scale for different countries
        var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        // Initial country selection
        var initialCountry = d3.select("#countrySelect").property("value");

        // Call updateChart once data is loaded
        updateChart(initialCountry, geoData, colorScale);

        // Add event listener for dropdown change
        select.on("change", function () {
            var selectedCountry = d3.select(this).property("value");
            updateChart(selectedCountry, geoData, colorScale);

            // Automatically click the submit button
            d3.select("#submitButton").dispatch("click");
        });

        // Add event listener for submit button click
        d3.select("#submitButton").on("click", function () {
            var selectedCountry = d3.select("#countrySelect").property("value");
            updateChart(selectedCountry, geoData, colorScale);
        });
    })
    .catch(error => console.error('Error fetching GeoJSON file:', error));

function updateChart(selectedCountry, geoData, colorScale) {
    // Remove existing chart from the outer container
    d3.select(".viz_container .eachCountry").selectAll("*").remove();

    // Create the container for the selected country
    var containerId = selectedCountry.replace(/\s+/g, "_").toLowerCase();
    d3.select(".viz_container .eachCountry")
        .append("div")
        .attr("class", "eachCountry")
        .attr("id", containerId)
        .append("h3")
        .text("Trend for " + selectedCountry);

    // Extract emission data for the selected country
    var selectedFeature = geoData.features.find(d => d.properties.name === selectedCountry);
    var emissionData = selectedFeature.properties.emission_data;

    // Extract years and emissions as separate arrays
    var years = Object.keys(emissionData);
    var emissions = Object.values(emissionData);

    // Create the SVG container for the selected country
    var svg = d3.select("#" + containerId)
        .append("svg")
        .attr("width", 800)
        .attr("height", 600);

    // Set the margins and dimensions
    var margin = { top: 20, right: 20, bottom: 50, left: 50 };
    var width = 800 - margin.left - margin.right;
    var height = 600 - margin.top - margin.bottom;

    // Create the scales
    var xScale = d3.scaleLinear()
        .domain([d3.min(years), d3.max(years)])
        .range([margin.left, width + margin.left]);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(emissions)])
        .range([height, 0]);

    // Create the axes
    var xAxis = d3.axisBottom(xScale)
        .tickValues(d3.range(d3.min(years), d3.max(years), 10)) // Specify tick values every 10 years
        .tickFormat(d3.format("d")); // Format tick values as integers

    var yAxis = d3.axisLeft(yScale);

    // Draw the x-axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    // Draw the y-axis
    svg.append("g")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(yAxis);

    // Draw the line with a unique color for each country
    var line = d3.line()
        .x((d, i) => xScale(years[i]))
        .y(d => yScale(d));

    // Create a tooltip element
    var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltio_viz3")
    .style("opacity", 0);


    svg.append("path")
        .datum(emissions)
        .attr("fill", "none")
        .attr("stroke", colorScale(selectedCountry))
        .attr("stroke-width", 2)
        .attr("d", line)
        .on("mouseover", function (event, d) {
            // Show the tooltip on mouseover
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(selectedCountry + "<br/>" + "Year: " + years[event])
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            // Hide the tooltip on mouseout
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
}
