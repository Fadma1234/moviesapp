//psuedo code
//make thumb down working but first read the code and understand it
//initialize a variable for thumbdown
//create an array for thumbdown
//go to server and make it work
//after alot of debugging with Justin we made it work
//it wasn't working because of the 0 after using the index of thumbup from arr which is 2 it worked
//make it personal and turn it to movies app
//changed it to be linked to my own database on mongo db atlas
//used google help and AI to debug



document.getElementById('movieName').addEventListener('blur', async (e) => {
  const name = e.target.value.trim();
  if (!name) return;

  const yearDisplay = document.getElementById('movieYear');
  yearDisplay.textContent = 'Searching...';

  try {
    const res = await fetch(`/movies/${encodeURIComponent(name)}`);
    if (res.ok) {
      const movie = await res.json();
      yearDisplay.textContent = `${movie.name} was released in ${movie.year}`;
    } else {
      yearDisplay.textContent = 'Movie not found in database.';
    }
  } catch (err) {
    console.error(err);
    yearDisplay.textContent = 'Error fetching movie info.';
  }
});
