d3.csv("NetflixOriginals.csv").then(function(data) {
    // Parse the data
    data.forEach(function(d) {
        d["IMDB Score"] = +d["IMDB Score"];
    });

    // Aggregate data by genre
    const genreCounts = d3.rollup(data, v => v.length, d => d.Genre);
    let genreData = Array.from(genreCounts, ([genre, count]) => ({ genre, count }));

    // Sort genres by count and take the top 5
    genreData = genreData.sort((a, b) => b.count - a.count).slice(0, 5);
    const top5Genres = genreData.map(d => d.genre);

    // Filter data to include only top 5 genres
    const filteredData = data.filter(d => top5Genres.includes(d.Genre));

    // ---------------------
    // First Visualization: Top 5 Genres Bar Chart
    // ---------------------

    const marginBar = { top: 40, right: 30, bottom: 80, left: 60 };
    const widthBar = 800 - marginBar.left - marginBar.right;
    const heightBar = 400 - marginBar.top - marginBar.bottom;

    const svgBar = d3.select("#chart")
        .append("svg")
        .attr("width", widthBar + marginBar.left + marginBar.right)
        .attr("height", heightBar + marginBar.top + marginBar.bottom)
        .append("g")
        .attr("transform", `translate(${marginBar.left},${marginBar.top})`);

    const xBar = d3.scaleBand()
        .domain(top5Genres)
        .range([0, widthBar])
        .padding(0.1);

    const yBar = d3.scaleLinear()
        .domain([0, d3.max(genreData, d => d.count)])
        .nice()
        .range([heightBar, 0]);

    // Add the x-axis
    svgBar.append("g")
        .attr("transform", `translate(0,${heightBar})`)
        .call(d3.axisBottom(xBar))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    // Add the y-axis
    svgBar.append("g")
        .call(d3.axisLeft(yBar));

    // Add the bars with interactivity
    svgBar.selectAll(".bar")
        .data(genreData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => xBar(d.genre))
        .attr("y", d => yBar(d.count))
        .attr("width", xBar.bandwidth())
        .attr("height", d => heightBar - yBar(d.count))
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
            <p><strong>Runtime:</strong> ${film.Runtime} minutes</p>
            <p><strong>Language:</strong> ${film.Language}</p>
            <p><strong>IMDB Score:</strong> ${film["IMDB Score"]}</p>
        `);
    }

    // Add functionality for the "Pick a Random Genre" button
    d3.select("#random-genre-btn").on("click", function() {
        // Select a random genre from the top 5 genres
        const randomGenre = top5Genres[Math.floor(Math.random() * top5Genres.length)];

        // Filter data to get movies in the random genre
        const filmsInGenre = data.filter(film => film.Genre === randomGenre);

        // Select a random film from the genre
        const randomFilm = filmsInGenre[Math.floor(Math.random() * filmsInGenre.length)];

        // Display the film details
        displayFilmDetails(randomFilm);
    });
}).catch(function(error) {
    console.error('Error loading or parsing data:', error);
});