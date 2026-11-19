import { Slideshow } from './slideshow.js';

const stack = document.getElementById('album-stack');
const content = document.getElementById('album-content');
const status = document.getElementById('album-status');
const imageReady = (imageUrl) => new Promise((resolve) => {
  const image = new Image();
  image.onload = () => resolve(true);
  image.onerror = () => resolve(false);
  image.src = imageUrl;
});

function createAlbumContent(album) {
  const item = document.createElement('article');
  item.className = 'content__item';

  const title = document.createElement('h2');
  title.className = 'content__item-title';
  const words = album.title.trim().split(/\s+/);
  let splitAt = words.length;
  if (words.length > 1) {
    let smallestDifference = Infinity;
    for (let index = 1; index < words.length; index += 1) {
      const firstLine = words.slice(0, index).join(' ');
      const secondLine = words.slice(index).join(' ');
      const difference = Math.abs(firstLine.length - secondLine.length);
      if (difference < smallestDifference) {
        smallestDifference = difference;
        splitAt = index;
      }
    }
  }
  if (Math.max(
    words.slice(0, splitAt).join(' ').length,
    words.slice(splitAt).join(' ').length
  ) > 16) {
    title.classList.add('content__item-title--long');
  }

  for (const text of [words.slice(0, splitAt).join(' '), words.slice(splitAt).join(' ')]) {
    if (!text) continue;
    const mask = document.createElement('span');
    mask.className = 'oh';
    const inner = document.createElement('span');
    inner.className = 'oh__inner';
    inner.textContent = text;
    mask.appendChild(inner);
    title.appendChild(mask);
  }
  item.appendChild(title);

  const description = document.createElement('div');
  description.className = 'content__item-description';

  if (album.category) {
    const category = album.category
      .replace(/[-_]/g, ' ')
      .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
    const categoryLine = document.createElement('p');
    categoryLine.className = 'oh';
    const categoryText = document.createElement('strong');
    categoryText.className = 'oh__inner';
    categoryText.textContent = category;
    categoryLine.appendChild(categoryText);
    description.appendChild(categoryLine);
  }

  if (album.description) {
    const textLine = document.createElement('p');
    textLine.className = 'oh';
    const inner = document.createElement('span');
    inner.className = 'oh__inner';
    inner.textContent = album.description;
    textLine.appendChild(inner);
    description.appendChild(textLine);
  }

  item.appendChild(description);
  content.appendChild(item);
}

function createStackItem(album) {
  const item = document.createElement('a');
  item.className = 'stack__item';
  item.href = `/album.html?album=${encodeURIComponent(album.slug)}`;
  item.dataset.imageSrc = album.coverUrl;
  item.style.backgroundImage = `url("${album.coverUrl}")`;
  item.setAttribute('aria-label', `Open ${album.title} photo album`);
  stack.insertBefore(item, stack.lastElementChild);
}

async function loadAlbums() {
  try {
    const response = await fetch('/api/photographyWebsite?albums=1');
    if (!response.ok) throw new Error(`Album request failed: ${response.status}`);

    const albums = await response.json();
    if (!Array.isArray(albums)) throw new Error('Album response must be an array');
    if (albums.some((album) =>
      !album ||
      typeof album.slug !== 'string' ||
      typeof album.title !== 'string' ||
      typeof album.coverUrl !== 'string'
    )) {
      throw new Error('Album response contains invalid album data');
    }

    if (albums.length === 0) {
      status.textContent = 'No photo albums found.';
      return;
    }

    for (const album of albums) {
      createStackItem(album);
      createAlbumContent(album);
    }

    const imageResults = await Promise.all(
      albums.map((album) => imageReady(album.coverUrl))
    );
    const failedImages = imageResults.filter((loaded) => !loaded).length;
    if (failedImages) {
      console.error(`${failedImages} album cover image(s) could not be loaded.`);
    }

    new Slideshow(stack);
  } catch (error) {
    console.error('Unable to load photo albums:', error);
    status.textContent = 'Albums could not be loaded. Please try again later.';
  } finally {
    document.body.classList.remove('loading');
  }
}

loadAlbums();
