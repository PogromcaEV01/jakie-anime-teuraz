// Mapowanie nastrojów na ID gatunków w Jikan API v4
const moodToGenreMap = {
    happy: [4],        // Comedy
    sad: [8, 36],      // Drama, Slice of Life (na pocieszenie)
    bored: [1, 2, 24], // Action, Adventure, Sci-Fi
    stressed: [36],    // Slice of Life (relaks)
    romantic: [22],    // Romance
    dark: [7, 14, 40]  // Mystery, Horror, Psychological
};

const moodButtons = document.querySelectorAll('.mood-btn');
const resultsContainer = document.getElementById('results');
const loader = document.getElementById('loader');

moodButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Zaznaczanie aktywnego przycisku
        moodButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const mood = button.dataset.mood;
        fetchAnimeRecommendations(mood);
    });
});

async function fetchAnimeRecommendations(mood) {
    // Wyczyść poprzednie wyniki i pokaż ładowanie
    resultsContainer.innerHTML = '';
    loader.classList.remove('hidden');

    // Pobierz powiązane gatunki dla nastroju
    const genres = moodToGenreMap[mood];
    // Wybierz jeden losowy gatunek z przypisanych do nastroju
    const selectedGenre = genres[Math.floor(Math.random() * genres.length)];

    // Budowanie zapytania do Jikan API v4
    // Pobieramy anime z danego gatunku, posortowane po ocenie, tylko bezpieczne (sfw)
    const apiUrl = `https://api.jikan.moe/v4/anime?genres=${selectedGenre}&order_by=score&sort=desc&sfw=true&limit=20`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Błąd API');
        const data = await response.json();

        // Wybierz 3 losowe anime z top 20 pobranych
        const shuffled = data.data.sort(() => 0.5 - Math.random());
        const selectedAnimes = shuffled.slice(0, 3);

        displayResults(selectedAnimes);
    } catch (error) {
        console.error("Błąd podczas pobierania danych:", error);
        resultsContainer.innerHTML = '<p>Ups! Nie udało się pobrać rekomendacji. Spróbuj ponownie za chwilę.</p>';
    } finally {
        loader.classList.add('hidden');
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

        // Bezpieczne pobieranie danych
        const title = anime.title;
        const imageUrl = anime.images.jpg.large_image_url;
        const score = anime.score ? `⭐ ${anime.score} / 10` : 'Brak oceny';
        const synopsis = anime.synopsis ? anime.synopsis : 'Brak opisu...';
        const url = anime.url;

        card.innerHTML = `
            <img src="${imageUrl}" alt="${title}" loading="lazy">
            <div class="anime-info">
                <div>
                    <h3 class="anime-title">${title}</h3>
                    <div class="anime-score">${score}</div>
                    <p class="anime-synopsis">${synopsis}</p>
                </div>
                <a href="${url}" target="_blank" rel="noopener noreferrer" class="anime-link">Sprawdź na MAL</a>
            </div>
        `;

        resultsContainer.appendChild(card);
    });
}
