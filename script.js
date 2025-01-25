document.addEventListener('DOMContentLoaded', () => {
    // Variables del DOM
    const setupScreen = document.getElementById('setup-screen');
    const gameScreen = document.getElementById('game-screen');
    const resultsScreen = document.getElementById('results-screen');
    const gameSetupForm = document.getElementById('game-setup');
    const categorySelect = document.getElementById('category');
    const countdownDisplay = document.getElementById('countdown');
    const wordCard = document.getElementById('word-card');
    const wordDisplay = document.getElementById('word');
    const pronunciationDisplay = document.getElementById('pronunciation');
    const translationDisplay = document.getElementById('translation');
    const approvedDisplay = document.getElementById('approved');
    const rejectedDisplay = document.getElementById('rejected');
    const resultsTableBody = document.querySelector('#results-table tbody');
    const restartButton = document.getElementById('restart-game');

    // Estado del juego
    let players = [];
    let timeLimit = 0;
    let currentCategory = '';
    let words = [];
    let currentWordIndex = 0;
    let approvedCount = 0;
    let rejectedCount = 0;
    let countdownInterval;
    let isTimeout = false;

    // Categorías disponibles
    const categories = [
        'Adverbios', 'Preposiciones', 'Animales domesticos', 'Animales salvajes',
        'Partes de la casa', 'Utensilios de cocina', 'Ropa', 'Adjetivos',
        'Partes del cuerpo', 'Partes del carro', 'Partes de la bicicleta',
        'Partes de las plantas', 'Saludos comunes en Canada', 'Preguntas clásicas',
        'Pronombres', 'Oraciones', 'Conjunciones', 'Peces', 'Países', 'Verbos'
    ];

    // Inicializar categorías
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });

    // Manejador de inicio del juego
    gameSetupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        initializeGameState();
        loadGameData();
    });

    function initializeGameState() {
        players = [
            document.getElementById('player1').value,
            document.getElementById('player2').value,
            document.getElementById('player3').value,
            document.getElementById('player4').value
        ].filter(name => name.trim() !== '');

        timeLimit = parseInt(document.getElementById('time').value, 10);
        currentCategory = categorySelect.value;
    }

    async function loadGameData() {
        try {
            const response = await fetch('words.json');
            const data = await response.json();
            words = data[currentCategory].sort(() => Math.random() - 0.5).slice(0, 10);
            showTransitionScreen();
        } catch (error) {
            console.error('Error loading game data:', error);
        }
    }

    function showTransitionScreen() {
        setupScreen.classList.add('hidden');
        const transitionDiv = document.createElement('div');
        transitionDiv.className = 'transition-screen';
        transitionDiv.textContent = 'Listo para Jugar!!!!';
        document.body.appendChild(transitionDiv);

        setTimeout(() => {
            transitionDiv.remove();
            startGameFlow();
        }, 5000);
    }

    function startGameFlow() {
        gameScreen.classList.remove('hidden');
        initializeGameSession();
    }

    function initializeGameSession() {
        startCountdown();
        showNextWord();
    }

    function startCountdown() {
        let timeLeft = timeLimit;
        updateCountdownDisplay(timeLeft);

        countdownInterval = setInterval(() => {
            timeLeft--;
            updateCountdownDisplay(timeLeft);
            
            if (timeLeft <= 0) {
                handleTimeExpiration();
            }
        }, 1000);
    }

    function updateCountdownDisplay(time) {
        countdownDisplay.textContent = `Tiempo restante: ${time} segundos`;
        countdownDisplay.style.color = time <= 10 ? '#ff4444' : '#333';
    }

    function handleTimeExpiration() {
        clearInterval(countdownInterval);
        isTimeout = true;
        showTranslationForCurrentWord();
        wordCard.classList.add('rejected');
    }

    function showNextWord() {
        resetCardState();
        
        if (currentWordIndex < words.length) {
            displayCurrentWord();
            applyCardAnimation();
            currentWordIndex++;
        } else {
            endGameSession();
        }
    }

    function resetCardState() {
        wordCard.classList.remove('rejected', 'approved', 'flip');
        translationDisplay.classList.remove('show-translation');
        translationDisplay.textContent = '';
    }

    function displayCurrentWord() {
        const currentWord = words[currentWordIndex];
        wordDisplay.textContent = currentWord.word;
        pronunciationDisplay.textContent = currentWord.pronunciation;
    }

    function applyCardAnimation() {
        void wordCard.offsetWidth; // Trigger reflow
        wordCard.classList.add('flip');
    }

    // Manejador de interacción con la tarjeta
    wordCard.addEventListener('click', handleCardInteraction);

    function handleCardInteraction(e) {
        if (isTimeout) {
            handleTimeoutInteraction();
            return;
        }

        const clickPosition = e.clientX - wordCard.getBoundingClientRect().left;
        const cardWidth = wordCard.offsetWidth;

        if (clickPosition < cardWidth / 2) {
            handleIncorrectAnswer();
        } else {
            handleCorrectAnswer();
        }
    }

    function handleTimeoutInteraction() {
        isTimeout = false;
        wordCard.classList.remove('rejected');
        showNextWord();
    }

    function handleIncorrectAnswer() {
        wordCard.classList.add('rejected');
        showTranslationForCurrentWord();
        rejectedCount++;
        rejectedDisplay.textContent = rejectedCount;
    }

    function handleCorrectAnswer() {
        wordCard.classList.add('approved');
        approvedCount++;
        approvedDisplay.textContent = approvedCount;
        showNextWord();
    }

    function showTranslationForCurrentWord() {
        translationDisplay.textContent = words[currentWordIndex - 1].translation;
        translationDisplay.classList.add('show-translation');
    }

    function endGameSession() {
        clearInterval(countdownInterval);
        gameScreen.classList.add('hidden');
        resultsScreen.classList.remove('hidden');
        displayFinalResults();
    }

    function displayFinalResults() {
        resultsTableBody.innerHTML = '';
        players.forEach(player => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${player}</td>
                <td>${approvedCount}</td>
                <td>${rejectedCount}</td>
            `;
            resultsTableBody.appendChild(row);
        });
    }

    // Reinicio del juego
    restartButton.addEventListener('click', resetGameState);

    function resetGameState() {
        resultsScreen.classList.add('hidden');
        setupScreen.classList.remove('hidden');
        
        // Resetear todas las variables de estado
        players = [];
        timeLimit = 0;
        currentCategory = '';
        words = [];
        currentWordIndex = 0;
        approvedCount = 0;
        rejectedCount = 0;
        isTimeout = false;
        
        // Resetear elementos del DOM
        countdownDisplay.textContent = '';
        wordDisplay.textContent = '';
        pronunciationDisplay.textContent = '';
        translationDisplay.textContent = '';
        approvedDisplay.textContent = '0';
        rejectedDisplay.textContent = '0';
    }
});
