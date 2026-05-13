const moodToGenreMap = {
    happy: [4],        // Comedy
    sad: [8, 36],      // Drama, Slice of Life
    bored: [1, 2, 24], // Action, Adventure, Sci-Fi
    stressed: [36],    // Slice of Life
    romantic: [22],    // Romance
    dark: [7, 14, 40]  // Mystery, Horror, Psychological
};

const moodButtons = document.querySelectorAll('.mood-btn');
const resultsContainer = document.getElementById('results');
const loader = document.getElementById('loader');

// Zapobiega spamowaniu przycisków podczas ładowania
let isSearching = false;

moodButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (isSearching) return; // Zablokuj kliknięcia, gdy AI "myśli"

        moodButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const mood = button.dataset.mood;
        fetchAnimeRecommendations(mood);
    });
});

async function fetchAnimeRecommendations(mood) {
    isSearching = true;
    resultsContainer.innerHTML = '';
    loader.classList.remove('hidden');

    // Wymuszone 3 sekundy opóźnienia - symulacja "myślenia AI" i ochrona API
    await new Promise(resolve => setTimeout(resolve, 3000));

    const genres = moodToGenreMap[mood];
    const selectedGenre = genres[Math.floor(Math.random() * genres.length)];

    const apiUrl = `https://api.jikan.moe/v4/anime?genres=${selectedGenre}&order_by=score&sort=desc&sfw=true&limit=20`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Błąd API');
        const data = await response.json();

        const shuffled = data.data.sort(() => 0.5 - Math.random());
        const selectedAnimes = shuffled.slice(0, 3);

        displayResults(selectedAnimes);
    } catch (error) {
        console.error("Błąd podczas pobierania danych:", error);
        resultsContainer.innerHTML = '<p>Ups! Moje obwody spięły. Nie udało się pobrać danych. Spróbuj ponownie!</p>';
    } finally {
        loader.classList.add('hidden');
        isSearching = false; // Odblokuj możliwość wyboru
    }
}

function displayResults(animes) {
    if (animes.length === 0) {
        resultsContainer.innerHTML = '<p>Nie znaleziono anime dla tego nastroju.</p>';
        return;
    }

    animes.forEach(anime => {
        const card = document.createElement('div');
        card.classList.add('anime-card');

        const title = anime.title;
        const imageUrl = anime.images.jpg.large_image_url;
        const score = anime.score ? `⭐ ${anime.score} / 10` : 'Brak oceny';
        const synopsis = anime.synopsis ? anime.synopsis : 'Brak opisu...';
        const malUrl = anime.url;
        
        // Sprawdzamy czy API zwróciło link do trailera na YouTube
        const trailerUrl = anime.trailer && anime.trailer.url ? anime.trailer.url : null;
        
        // Generujemy kod przycisku trailera (tylko jeśli zwiastun istnieje)
        const trailerButtonHtml = trailerUrl 
            ? `<a href="${trailerUrl}" target="_blank" rel="noopener noreferrer" class="trailer-link">🎬 Trailer</a>`
            : '';

        card.innerHTML = `
            <img src="${imageUrl}" alt="${title}" loading="lazy">
            <div class="anime-info">
                <div>
                    <h3 class="anime-title">${title}</h3>
                    <div class="anime-score">${score}</div>
                    <p class="anime-synopsis">${synopsis}</p>
                </div>
                <div class="card-actions">
                    <a href="${malUrl}" target="_blank" rel="noopener noreferrer" class="anime-link">MAL</a>
                    ${trailerButtonHtml}
                </div>
            </div>
        `;

        resultsContainer.appendChild(card);
    });
}
