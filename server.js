const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb'); 

const app = express();
let db;

const url = "mongodb+srv://fadmabelkhouraf_db_user:tawkkaijlkhn@cluster0.drpkeb1.mongodb.net/"; 
const dbName = "demo";

const defaultMovies = [
  { name: "Inception", year: "2010" },
  { name: "Avatar", year: "2009" },
  { name: "The Dark Knight", year: "2008" },
  { name: "Interstellar", year: "2014" },
  { name: "Titanic", year: "1997" }
];


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


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public')); 


app.get('/', async (req, res) => {
  const movies = await db.collection('movies').find().sort({ year: 1 }).toArray();
  res.render('index.ejs', { movies });
});


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
    console.log(`Added ${movieName} (${movieYear})`);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding movie');
  }
});

app.put('/movies', async (req, res) => {
  try {
    // Expecting { id, name, year } in the body
    await db.collection('movies').findOneAndUpdate(
      { _id: new ObjectId(req.body.id) },
      { $set: { name: req.body.name, year: req.body.year } }
    );
    console.log(` Updated movie with id: ${req.body.id}`);
    res.json('Movie Updated!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating movie');
  }
});


app.delete('/movies', async (req, res) => {
  try {
    // Expecting { id } in the body
    await db.collection('movies').findOneAndDelete({ _id: new ObjectId(req.body.id) });
    console.log(`Deleted movie with id: ${req.body.id}`);
    res.send('Movie deleted!');
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
