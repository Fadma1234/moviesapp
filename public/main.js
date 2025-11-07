//psuedo code

//go to server and make it work
//make it personal and turn it to movies app
//changed it to be linked to my own database on mongo db atlas
//used google help and AI to debug


const movieInput = document.getElementById('movieName');
const yearDisplay = document.getElementById('movieYear');

movieInput.addEventListener('keypress', async (e) => {
  if (e.key === 'Enter') {
    const name = e.target.value.trim();
    if (!name) return;

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
  }
});

document.querySelectorAll('.edit').forEach(button => {
  button.addEventListener('click', async () => {
    const oldName = button.dataset.name;
    const oldYear = button.dataset.year;

    const newName = prompt('Enter new movie name:', oldName);
    if (!newName || newName.trim() === '') return;

    const newYear = prompt('Enter new year:', oldYear);
    if (!newYear || newYear.trim() === '') return;

    try {
      const res = await fetch('/movies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          oldName: oldName,
          name: newName.trim(), 
          year: newYear.trim() 
        })
      });

      if (res.ok) {
        window.location.reload();
      } else {
        alert('Error updating movie');
      }
    } catch (err) {
      console.error('Error editing movie:', err);
      alert('Error updating movie');
    }
  });
});

document.querySelectorAll('.delete').forEach(button => {
  button.addEventListener('click', async () => {
    const name = button.dataset.name;
    
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      const res = await fetch('/movies', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });

      if (res.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error('Error deleting movie:', err);
    }
  });
});