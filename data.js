// Load the CSV file
d3.csv("NetflixOriginals.csv").then(function(data) {
    // Parse the data
    data.forEach(function(d) {
        d["IMDB Score"] = +d["IMDB Score"]; // Convert IMDB Score to number
        d.Premiere = +d.Premiere; // Convert Premiere to number
    });

    console.log("Loaded Data:", data); // Debug log to verify data loading

    // Set up the SVG element
    const margin = {top: 20, right: 30, bottom: 40, left: 40};
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up the scales
    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.Premiere))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d["IMDB Score"])])
        .nice()
        .range([height, 0]);

    // Add the x-axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    // Add the y-axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add the scatter plot points
    svg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => x(d.Premiere))
        .attr("cy", d => y(d["IMDB Score"]))
        .attr("r", 3)
        .attr("fill", "steelblue");
}).catch(function(error) {
    console.error('Error loading or parsing data:', error);
});