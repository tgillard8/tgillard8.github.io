d3.csv("NetflixOriginals.csv").then(function(data) {
    // Parse the data
    data.forEach(function(d) {
        d.Premiere = d.Premiere; // Keep Premiere as string for display purposes
    });

    console.log("Loaded Data:", data); // Debug log to verify data loading

    // Aggregate data by genre
    const genreCounts = d3.rollup(data, v => v.length, d => d.Genre);
    let genreData = Array.from(genreCounts, ([genre, count]) => ({ genre, count }));

    // Sort genres by count and take the top 5
    genreData = genreData.sort((a, b) => b.count - a.count).slice(0, 5);

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
        .padding(0.1);

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

    // Add the bars with interactivity
    svg.selectAll(".bar")
        .data(genreData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.genre))
        .attr("y", d => y(d.count))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.count))
        .attr("fill", "steelblue")
        .on("click", function(event, d) {
            // Filter data to get movies in the clicked genre
            const filmsInGenre = data.filter(film => film.Genre === d.genre);

            // Select a random film from the genre
            const randomFilm = filmsInGenre[Math.floor(Math.random() * filmsInGenre.length)];

            // Display the film details
            displayFilmDetails(randomFilm);
        });

    // Function to display film details
    function displayFilmDetails(film) {
        d3.select("#film-details").html(`
            <h3>Sample Film Details</h3>
            <p><strong>Title:</strong> ${film.Title}</p>
            <p><strong>Genre:</strong> ${film.Genre}</p>
            <p><strong>Premiere:</strong> ${film.Premiere}</p>
            <p><strong>Runtime:</strong> ${film.Runtime} minutes</p>
            <p><strong>Language:</strong> ${film.Language}</p>
            <p><strong>IMDB Score:</strong> ${film["IMDB Score"]}</p>
        `);
    }
}).catch(function(error) {
    console.error('Error loading or parsing data:', error);
});
