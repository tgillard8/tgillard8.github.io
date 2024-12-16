d3.csv("NetflixOriginals.csv").then(function(data) {
    // Group data by Genre and count the number of movies per Genre
    const genreCounts = d3.rollup(data, v => v.length, d => d.Genre);

    // Convert the grouped data into an array of objects
    const genreData = Array.from(genreCounts, ([genre, count]) => ({ genre, count }));

    console.log("Genre Data:", genreData); // Debug log to verify data grouping

    // Set up the SVG element
    const margin = { top: 40, right: 30, bottom: 80, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up the scales
    const x = d3.scaleBand()
        .domain(genreData.map(d => d.genre))
        .range([0, width])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(genreData, d => d.count)])
        .nice()
        .range([height, 0]);

    // Add the x-axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    // Add the y-axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add the bars
    svg.selectAll(".bar")
        .data(genreData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.genre))
        .attr("y", d => y(d.count))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.count))
        .attr("fill", "steelblue");

    // Add labels to the bars
    svg.selectAll(".label")
        .data(genreData)
        .enter().append("text")
        .attr("class", "label")
        .attr("x", d => x(d.genre) + x.bandwidth() / 2)
        .attr("y", d => y(d.count) - 5)
        .attr("text-anchor", "middle")
        .text(d => d.count);
}).catch(function(error) {
    console.error('Error loading or parsing data:', error);
});
