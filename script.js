// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const setupScreen = document.getElementById('setup-screen');
    const gameScreen = document.getElementById('game-screen');
    const resultsScreen = document.getElementById('results-screen');
    const gameForm = document.getElementById('game-setup');
    const categorySelect = document.getElementById('category');
    const countdownDisplay = document.getElementById('countdown');
    const wordCard = document.getElementById('word-card');
    const wordDisplay = document.getElementById('word');
    const pronunciationDisplay = document.getElementById('pronunciation');
    const translationDisplay = document.getElementById('translation');
    const approvedDisplay = document.getElementById('approved');
    const rejectedDisplay = document.getElementById('rejected');
    const resultsBody = document.querySelector('#results-table tbody');
    const restartBtn = document.getElementById('restart-game');

    // Estado del juego
    let gameState = {
        players: [],
        timeLimit: 0,
        category: '',
        words: [],
        currentIndex: 0,
        correct: 0,
        wrong: 0,
        interval: null,
        timeout: false
    };

    // Categorías disponibles
    const categories = [
        'Adverbios', 'Preposiciones', 'Animales domesticos', 'Animales salvajes',
        'Partes de la casa', 'Utensilios de cocina', 'Ropa', 'Adjetivos',
        'Partes del cuerpo', 'Partes del carro', 'Partes de la bicicleta',
        'Partes de las plantas', 'Saludos comunes en Canada', 'Preguntas clásicas',
        'Pronombres', 'Oraciones', 'Conjunciones', 'Peces', 'Países', 'Verbos'
    ];

    // Inicializar categorías
    function initCategories() {
        categorySelect.innerHTML = categories
            .map(cat => `<option value="${cat}">${cat}</option>`)
            .join('');
    }
    initCategories();

    // Manejador de formulario
    gameForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        initializeGame();
        await loadWords();
        showTransition();
    });

    function initializeGame() {
        gameState = {
            ...gameState,
            players: [
                document.getElementById('player1').value,
                document.getElementById('player2').value,
                document.getElementById('player3').value,
                document.getElementById('player4').value
            ].filter(name => name.trim()),
            timeLimit: parseInt(document.getElementById('time').value),
            category: categorySelect.value,
            currentIndex: 0,
            correct: 0,
            wrong: 0
        };
    }

    async function loadWords() {
        try {
            const response = await fetch('words.json');
            const data = await response.json();
            gameState.words = data[gameState.category]
                .sort(() => Math.random() - 0.5)
                .slice(0, 10);
        } catch (error) {
            console.error('Error loading words:', error);
        }
    }

    function showTransition() {
        setupScreen.style.display = 'none';
        const transition = document.createElement('div');
        transition.className = 'transition-screen';
        transition.textContent = '🎮 ¡Listo para jugar!';
        document.body.appendChild(transition);

        setTimeout(() => {
            transition.remove();
            startGame();
        }, 5000);
    }

    function startGame() {
        gameScreen.style.display = 'block';
        startTimer();
        showNextWord();
    }

    function startTimer() {
        let timeLeft = gameState.timeLimit;
        updateTimerDisplay(timeLeft);

        gameState.interval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay(timeLeft);

            if (timeLeft <= 0) {
                handleTimeout();
            }
        }, 1000);
    }

    function updateTimerDisplay(time) {
        countdownDisplay.textContent = `⏳ Tiempo: ${time}s`;
        countdownDisplay.style.color = time <= 10 ? '#ff4444' : '#fff';
    }

    function handleTimeout() {
        clearInterval(gameState.interval);
        gameState.timeout = true;
        showTranslation();
        wordCard.classList.add('rejected');
    }

    function showNextWord() {
        resetCard();
        
        if (gameState.currentIndex < gameState.words.length) {
            const currentWord = gameState.words[gameState.currentIndex];
            wordDisplay.textContent = currentWord.word;
            pronunciationDisplay.textContent = currentWord.pronunciation;
            animateCard();
            gameState.currentIndex++;
        } else {
            endGame();
        }
    }

    function resetCard() {
        wordCard.classList.remove('rejected', 'approved');
        translationDisplay.classList.remove('show-translation');
        translationDisplay.textContent = '';
    }

    function animateCard() {
        wordCard.style.animation = 'none';
        void wordCard.offsetWidth;
        wordCard.style.animation = 'flip 0.6s ease';
    }

    // Manejador de clics en la tarjeta
    wordCard.addEventListener('click', (e) => {
        if (gameState.timeout) {
            gameState.timeout = false;
            showNextWord();
            return;
        }

        const rect = wordCard.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        
        if (clickX < rect.width / 2) {
            handleWrong();
        } else {
            handleCorrect();
        }
    });

    function handleWrong() {
        gameState.wrong++;
        rejectedDisplay.textContent = gameState.wrong;
        showTranslation();
        wordCard.classList.add('rejected');
    }

    function handleCorrect() {
        gameState.correct++;
        approvedDisplay.textContent = gameState.correct;
        showNextWord();
    }

    function showTranslation() {
        const currentWord = gameState.words[gameState.currentIndex - 1];
        translationDisplay.textContent = currentWord.translation;
        translationDisplay.classList.add('show-translation');
    }

    function endGame() {
        clearInterval(gameState.interval);
        gameScreen.style.display = 'none';
        resultsScreen.style.display = 'block';
        showResults();
    }

    function showResults() {
        resultsBody.innerHTML = gameState.players
            .map(player => `
                <tr>
                    <td>${player}</td>
                    <td>${gameState.correct}</td>
                    <td>${gameState.wrong}</td>
                </tr>
            `)
            .join('');
    }

    // Reiniciar juego
    restartBtn.addEventListener('click', () => {
        resultsScreen.style.display = 'none';
        setupScreen.style.display = 'block';
        resetGame();
    });

    function resetGame() {
        gameState = {
            ...gameState,
            players: [],
            words: [],
            currentIndex: 0,
            correct: 0,
            wrong: 0
        };
        
        gameForm.reset();
        countdownDisplay.textContent = '';
        wordDisplay.textContent = '';
        pronunciationDisplay.textContent = '';
        translationDisplay.textContent = '';
        approvedDisplay.textContent = '0';
        rejectedDisplay.textContent = '0';
    }
});
