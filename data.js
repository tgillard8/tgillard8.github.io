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
    // Bar Chart Visualization
    // ---------------------

    const margin = { top: 40, right: 30, bottom: 80, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
        .domain(top5Genres)
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(genreData, d => d.count)])
        .nice()
        .range([height, 0]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .call(d3.axisLeft(y));

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
            displayRandomFilm(d.genre);
        });

    // Function to display a random film for a given genre
    function displayRandomFilm(selectedGenre) {
        const filmsInGenre = data.filter(film => film.Genre === selectedGenre);
        if (filmsInGenre.length === 0) {
            d3.select("#film-details").html(`<p>No films found for genre: ${selectedGenre}</p>`);
            return;
        }
        const randomFilm = filmsInGenre[Math.floor(Math.random() * filmsInGenre.length)];
        d3.select("#film-details").html(`
            <h3>Random Film in ${selectedGenre}</h3>
            <p><strong>Title:</strong> ${randomFilm.Title}</p>
            <p><strong>Premiere:</strong> ${randomFilm.Premiere}</p>
            <p><strong>Runtime:</strong> ${randomFilm.Runtime} minutes</p>
            <p><strong>Language:</strong> ${randomFilm.Language}</p>
            <p><strong>IMDB Score:</strong> ${randomFilm["IMDB Score"]}</p>
        `);
    }

    // Function to select a random genre and display a random film
    d3.select("#random-genre-btn").on("click", function() {
        const randomGenre = top5Genres[Math.floor(Math.random() * top5Genres.length)];
        displayRandomFilm(randomGenre);
    });

}).catch(function(error) {
    console.error('Error loading or parsing data:', error);
});
