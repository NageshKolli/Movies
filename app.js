const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// API 1
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

app.get("/movies/", async (request, response) => {
  const getAllMoviesQuery = `SELECT movie_name AS movieName FROM movie ORDER BY movie_id;`;
  const allMovies = await db.all(getAllMoviesQuery);
  response.send(allMovies);
});

// API 2
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const createMovieQuery = `
    INSERT INTO movie (director_id, movie_name, lead_actor)
    VALUES (${directorId}, '${movieName}', '${leadActor}');`;
  await db.run(createMovieQuery);
  response.send("Movie Successfully Added");
});

// API 3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieByIdQuery = `
    SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const movie = await db.get(getMovieByIdQuery);
  response.send(convertDbObjectToResponseObject(movie));
});

// API 4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
    UPDATE movie 
    SET director_id = ${directorId}, movie_name = '${movieName}', lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

// API 5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie WHERE movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

// API 6
app.get("/directors/", async (request, response) => {
  const getAllDirectorsQuery = `SELECT director_id AS directorId ,director_name AS directorName FROM director ORDER BY director_id;`;
  const allDirectors = await db.all(getAllDirectorsQuery);
  response.send(allDirectors);
});
//API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getAllMoviesByDirectorQuery = `SELECT movie.movie_name AS movieName
    FROM director
    INNER JOIN movie ON movie.director_id = director.director_id
    WHERE director.director_id = ${directorId};`;
  const movies = await db.all(getAllMoviesByDirectorQuery);
  response.send(movies);
});

module.exports = app;
