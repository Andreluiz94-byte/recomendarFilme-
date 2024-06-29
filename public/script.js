fetch("/api-key")
  .then((response) => response.json())
  .then((data) => {
    const apiKey = data.apiKey;
    const baseURL = "https://api.themoviedb.org/3";

    document
      .getElementById("movieForm")
      .addEventListener("submit", function (event) {
        event.preventDefault();
        const genre = document.getElementById("genre").value.trim();
        if (genre !== "") {
          searchMovieByGenre(genre);
        }
      });

    document
      .getElementById("newSearchBtn")
      .addEventListener("click", function () {
        window.location.reload();
      });

    function searchMovieByGenre(genre) {
      fetch(
        `${baseURL}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(
          genre
        )}&language=pt-BR`
      )
        .then((response) => response.json())
        .then((data) => {
          const movieList = document.getElementById("movieList");
          movieList.innerHTML = "";
          if (data.results && data.results.length > 0) {
            document.getElementById("introText").style.display = "none";
            document.getElementById("Title").style.display = "none";
            data.results.forEach((movie) => {
              const movieItem = document.createElement("div");
              movieItem.classList.add("movie-item");
              const posterPath = movie.poster_path
                ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
                : "placeholder.jpg";
              movieItem.innerHTML = `
                          <img src="${posterPath}" alt="${movie.title} Poster">
                          <div>
                          <br>
                              <span class="title">  ${movie.title}</span>
                              <span>Sinopse: ${movie.overview}</span>
                              <span class="vote-average">Nota média: ${movie.vote_average}</span>
                              <div class="trailer-container" id="trailer-${movie.id}"></div>
                          </div>
                      `;

              movieList.appendChild(movieItem);
              getMovieTrailers(movie.id);
            });
            document
              .getElementById("recommendation")
              .classList.remove("hidden");
            document.getElementById("newSearchBtn").classList.remove("hidden");
            document.getElementById("movieForm").style.display = "none";
          } else {
            movieList.innerHTML = "Nenhum filme encontrado com esse nome.";
            document
              .getElementById("recommendation")
              .classList.remove("hidden");
            document.getElementById("newSearchBtn").classList.remove("hidden");
          }
        })
        .catch((error) => {
          console.error("Erro ao buscar informações do filme:", error);
          const movieList = document.getElementById("movieList");
          movieList.innerHTML = "Ocorreu um erro. Tente novamente mais tarde.";
          document.getElementById("recommendation").classList.remove("hidden");
          document.getElementById("newSearchBtn").classList.remove("hidden");
        });
    }

    function getMovieTrailers(movieId) {
      const trailerContainer = document.getElementById(`trailer-${movieId}`);

      fetch(
        `${baseURL}/movie/${movieId}/videos?api_key=${apiKey}&language=pt-BR`
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.results && data.results.length > 0) {
            let foundYouTubeTrailer = false;

            data.results.forEach((video) => {
              if (!foundYouTubeTrailer && video.site === "YouTube") {
                const trailerIframe = document.createElement("iframe");
                trailerIframe.src = `https://www.youtube.com/embed/${video.key}`;
                trailerIframe.allowFullscreen = true;
                trailerIframe.style.width = "100%";
                trailerIframe.style.height = "auto";

                trailerContainer.appendChild(trailerIframe);
                foundYouTubeTrailer = true;
              }
            });

            if (!foundYouTubeTrailer) {
              trailerContainer.innerHTML = `
                          <div class="trailer-message">
                              <p>Trailer não disponível.</p>
                          </div>
                      `;
            }
          } else {
            trailerContainer.innerHTML = `
                      <div class="trailer-message">
                          <p>Trailer não disponível</p>
                      </div>
                  `;
          }
        })
        .catch((error) => {
          console.error("Erro ao buscar trailers do filme:", error);
          trailerContainer.innerHTML = `
                  <div class="trailer-message">
                      <p>Erro ao carregar trailers.</p>
                  </div>
              `;
        });
    }
  });
