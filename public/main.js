//psuedo code


//go to server and make it work
//make it personal and turn it to movies app
//make a movies app to display the year of release and edit or delete 
//changed it to be linked to my own database on mongo db atlas
//used google help and AI to debug


document.addEventListener('DOMContentLoaded', () => {


  document.getElementById('searchYearButton').addEventListener('click', async () => {
    const selectElement = document.getElementById('movieSelect');
    const name = selectElement.value.trim();
    const yearDisplay = document.getElementById('movieYearDisplay');

    if (!name) {
      yearDisplay.textContent = 'Please select a movie.';
      return;
    }

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

  // Use event delegation on the parent list
  document.querySelector('.movies').addEventListener('click', async (e) => {
    const target = e.target;
    const li = target.closest('li');
    if (!li) return;
    const movieId = li.dataset.id;

    if (target.closest('.trash-btn')) {
      try {
        const res = await fetch('/movies', {
          method: 'delete',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: movieId })
        });

        if (res.ok) {
          window.location.reload();
        } else {
          alert('Could not delete movie');
        }
      } catch (err) {
        console.error(err);
      }
    } else if (target.closest('.edit-btn')) {
      li.querySelector('.edit-form').style.display = 'block';
    } else if (target.classList.contains('save-edit-btn')) {
      const newName = li.querySelector('.edit-name').value.trim();
      const newYear = li.querySelector('.edit-year').value.trim();
      await handleEditSave(movieId, newName, newYear);
    } else if (target.classList.contains('cancel-edit-btn')) {
      li.querySelector('.edit-form').style.display = 'none';
    }
  });


  async function handleEditSave(id, name, year) {
    try {
      const res = await fetch('/movies', {
        method: 'put',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id, name: name, year: year })
      });

      if (res.ok) {
        window.location.reload();
      } else {
        alert('Could not update movie');
      }
    } catch (err) {
      console.error(err);
    }
  }
});
