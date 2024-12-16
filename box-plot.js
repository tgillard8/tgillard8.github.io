// Load the CSV file
d3.csv("NetflixOriginals.csv").then(function(data) {
    // Parse the data
    data.forEach(function(d) {
        d["IMDB Score"] = +d["IMDB Score"]; // Convert IMDB Score to number
    });

    console.log("Loaded Data:", data); // Debug log to verify data loading

    // Aggregate data by genre
    const genreCounts = d3.rollup(data, v => v.length, d => d.Genre);
    let genreData = Array.from(genreCounts, ([genre, count]) => ({ genre, count }));

    // Sort genres by count and take the top 5
    genreData = genreData.sort((a, b) => b.count - a.count).slice(0, 5);

    // Filter data to include only the top 5 genres
    const topGenres = genreData.map(d => d.genre);
    const filteredData = data.filter(d => topGenres.includes(d.Genre));

    // Set up the SVG element
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#box-plot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up the scales
    const x = d3.scaleBand()
        .domain(topGenres)
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(filteredData, d => d["IMDB Score"])])
        .nice()
        .range([height, 0]);

    // Add the x-axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    // Add the y-axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // Function to compute box plot statistics
    function boxPlotStats(values) {
        values.sort(d3.ascending);
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const interQuantileRange = q3 - q1;
        const min = q1 - 1.5 * interQuantileRange;
        const max = q3 + 1.5 * interQuantileRange;
        return { q1, median, q3, interQuantileRange, min, max };
    }

    // Compute box plot statistics for each genre
    const boxPlotData = topGenres.map(genre => {
        const genreScores = filteredData.filter(d => d.Genre === genre).map(d => d["IMDB Score"]);
        const stats = boxPlotStats(genreScores);
        return { genre, ...stats };
    });

    // Draw the box plots
    svg.selectAll(".box")
        .data(boxPlotData)
        .enter().append("rect")
        .attr("class", "box")
        .attr("x", d => x(d.genre))
        .attr("y", d => y(d.q3))
        .attr("width", x.bandwidth())
        .attr("height", d => y(d.q1) - y(d.q3))
        .attr("fill", "steelblue");

    // Draw the median lines
    svg.selectAll(".median")
        .data(boxPlotData)
        .enter().append("line")
        .attr("class", "median")
        .attr("x1", d => x(d.genre))
        .attr("x2", d => x(d.genre) + x.bandwidth())
        .attr("y1", d => y(d.median))
        .attr("y2", d => y(d.median))
        .attr("stroke", "black");

    // Draw the whiskers
    svg.selectAll(".whisker")
        .data(boxPlotData)
        .enter().append("line")
        .attr("class", "whisker")
        .attr("x1", d => x(d.genre) + x.bandwidth() / 2)
        .attr("x2", d => x(d.genre) + x.bandwidth() / 2)
        .attr("y1", d => y(d.min))
        .attr("y2", d => y(d.max))
        .attr("stroke", "black");

    // Draw the min and max lines
    svg.selectAll(".min")
        .data(boxPlotData)
        .enter().append("line")
        .attr("class", "min")
        .attr("x1", d => x(d.genre))
        .attr("x2", d => x(d.genre) + x.bandwidth())
        .attr("y1", d => y(d.min))
        .attr("y2", d => y(d.min))
        .attr("stroke", "black");

    svg.selectAll(".max")
        .data(boxPlotData)
        .enter().append("line")
        .attr("class", "max")
        .attr("x1", d => x(d.genre))
        .attr("x2", d => x(d.genre) + x.bandwidth())
        .attr("y1", d => y(d.max))
        .attr("y2", d => y(d.max))
        .attr("stroke", "black");
}).catch(function(error) {
    console.error('Error loading or parsing data:', error);
});