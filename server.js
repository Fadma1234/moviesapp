const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();
let db;
const url = "mongodb+srv://fadmabelkhouraf_db_user:tawkkaijlkhn@cluster0.drpkeb1.mongodb.net/";
const dbName = "demo";

// --- Default movie list to preload (if DB empty) ---
const defaultMovies = [
  { name: "Inception", year: "2010" },
  { name: "Avatar", year: "2009" },
  { name: "The Dark Knight", year: "2008" },
  { name: "Interstellar", year: "2014" },
  { name: "Titanic", year: "1997" }
];

// --- CONNECT TO DB ---
MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async client => {
    db = client.db(dbName);
    console.log("Connected to MongoDB");

    // Check if collection empty → preload
    const count = await db.collection('movies').countDocuments();
    if (count === 0) {
      await db.collection('movies').insertMany(defaultMovies);
      console.log("Default movies added to database");
    }

    app.listen(3000, () => console.log("Server running on http://localhost:3000"));
  })
  .catch(console.error);

// --- SETUP MIDDLEWARE ---
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// --- ROUTES ---

// 1️⃣ Home route: show all movies
app.get('/', async (req, res) => {
  const movies = await db.collection('movies').find().sort({ year: 1 }).toArray();
  res.render('index.ejs', { movies });
});

// 2️⃣ Search by movie name (return JSON year)
app.get('/movies/:name', async (req, res) => {
  const movieName = req.params.name.trim();

  try {
    const movie = await db.collection('movies').findOne({ name: new RegExp(`^${movieName}$`, 'i') });
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.json({ name: movie.name, year: movie.year });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


app.post('/movies', async (req, res) => {
  const movieName = req.body.name.trim();
  const movieYear = req.body.year?.trim() || "Unknown";

  try {
    const existing = await db.collection('movies').findOne({ name: movieName });
    if (existing) return res.redirect('/');

    await db.collection('movies').insertOne({
      name: movieName,
      year: movieYear,
      thumbUp: 0,
      thumbDown: 0
    });
    console.log(`🎬 Added ${movieName} (${movieYear})`);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding movie');
  }
});

// Like / Dislike
app.put('/movies', (req, res) => {
  const updateField = req.body.thumbUp !== undefined
    ? { thumbUp: req.body.thumbUp + 1 }
    : { thumbDown: req.body.thumbDown + 1 };

  db.collection('movies')
    .findOneAndUpdate({ name: req.body.name }, { $set: updateField }, { upsert: true, returnDocument: 'after' })
    .then(result => res.json(result))
    .catch(err => res.status(500).send(err));
});

//Delete
app.delete('/movies', (req, res) => {
  db.collection('movies')
    .findOneAndDelete({ name: req.body.name })
    .then(() => res.send('Movie deleted!'))
    .catch(err => res.status(500).send(err));
});
