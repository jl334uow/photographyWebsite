const gallery = document.getElementById('album-items-wrapper');
const status = document.getElementById('album-status');

async function loadAlbums() {
  const query = new URLSearchParams({ albums: '1' });
  const category = gallery.dataset.category;
  if (category) query.set('category', category);

  try {
    const response = await fetch(`/api/photographyWebsite?${query}`);
    if (!response.ok) throw new Error(`Album request failed: ${response.status}`);
    const albums = await response.json();

    for (const album of albums) {
      const link = document.createElement('a');
      link.className = 'album-item';
      link.href = `/album.html?album=${encodeURIComponent(album.slug)}`;
      link.setAttribute('aria-label', `View ${album.title} photo album`);

      const image = document.createElement('img');
      image.src = album.coverUrl;
      image.alt = `${album.title} album cover`;
      image.loading = 'lazy';

      const title = document.createElement('h3');
      title.textContent = album.title;
      link.append(image, title);
      gallery.appendChild(link);
    }

    status.textContent = albums.length ? '' : 'No photo albums found.';
  } catch (error) {
    console.error('Unable to load albums:', error);
    status.textContent = 'Albums could not be loaded.';
  }
}

loadAlbums();