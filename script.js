document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const screens = {
        setup: document.getElementById('setup-screen'),
        game: document.getElementById('game-screen'),
        results: document.getElementById('results-screen'),
        transition: document.getElementById('transition-screen')
    };
    
    const gameForm = document.getElementById('game-setup');
    const countdownElement = document.getElementById('countdown');
    const wordCard = document.getElementById('word-card');
    const wordElement = document.getElementById('word');
    const pronunciationElement = document.getElementById('pronunciation');
    const translationElement = document.getElementById('translation');
    const resultsBody = document.querySelector('#results-table tbody');
    const restartButton = document.getElementById('restart-game');

    // Estado del juego
    let gameState = {
        players: [],
        timeLimit: 5,
        words: [],
        currentWordIndex: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        countdownInterval: null,
        isTimeout: false
    };

    // Inicializar categorías
    function initializeCategories() {
        const categories = [
            'Adverbios', 'Preposiciones', 'Animales domesticos', 
            'Animales salvajes', 'Partes de la casa', 'Utensilios de cocina',
            'Ropa', 'Adjetivos', 'Partes del cuerpo', 'Partes del carro',
            'Partes de la bicicleta', 'Partes de las plantas', 
            'Saludos comunes en Canada', 'Preguntas clásicas', 
            'Pronombres', 'Oraciones', 'Conjunciones', 'Peces', 
            'Países', 'Verbos'
        ];
        
        const categorySelect = document.getElementById('category');
        categorySelect.innerHTML = categories.map(cat => 
            `<option value="${cat}">${cat}</option>`
        ).join('');
    }
    initializeCategories();

    // Manejador del formulario
    gameForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Obtener datos del formulario
        gameState.players = [
            document.getElementById('player1').value,
            document.getElementById('player2').value,
            document.getElementById('player3').value,
            document.getElementById('player4').value
        ].filter(name => name.trim() !== '');
        
        gameState.timeLimit = parseInt(document.getElementById('time').value) || 5;
        gameState.timeLimit = Math.max(5, gameState.timeLimit);
        
        const category = document.getElementById('category').value;

        // Cargar palabras
        try {
            const response = await fetch('words.json');
            const data = await response.json();
            gameState.words = data[category].sort(() => Math.random() - 0.5).slice(0, 10);
            showTransition();
        } catch (error) {
            console.error('Error cargando palabras:', error);
        }
    });

    // Transición
    function showTransition() {
        screens.setup.classList.remove('active');
        screens.transition.style.display = 'flex';
        
        setTimeout(() => {
            screens.transition.style.display = 'none';
            startGame();
        }, 5000);
    }

    // Iniciar juego
    function startGame() {
        resetGameState();
        screens.game.classList.add('active');
        startCountdown();
        showNextWord();
    }

    function startCountdown() {
        let timeLeft = gameState.timeLimit;
        updateCountdownDisplay(timeLeft);
        
        gameState.countdownInterval = setInterval(() => {
            timeLeft--;
            updateCountdownDisplay(timeLeft);
            
            if (timeLeft <= 0) {
                endGame(true);
            }
        }, 1000);
    }

    function updateCountdownDisplay(time) {
        countdownElement.textContent = `Tiempo restante: ${time}s`;
        countdownElement.style.color = time <= 5 ? '#ff4444' : '#fff';
    }

    // Mostrar palabras
    function showNextWord() {
        if (gameState.currentWordIndex >= gameState.words.length) {
            endGame(false);
            return;
        }
        
        const currentWord = gameState.words[gameState.currentWordIndex];
        wordElement.textContent = currentWord.word;
        pronunciationElement.textContent = currentWord.pronunciation;
        translationElement.classList.remove('show');
        
        gameState.currentWordIndex++;
    }

    // Finalizar juego
    function endGame(isTimeout) {
        clearInterval(gameState.countdownInterval);
        gameState.isTimeout = isTimeout;
        
        if (isTimeout) {
            showTranslation();
            wordCard.classList.add('timeout');
        } else {
            showResults();
        }
    }

    // Mostrar resultados
    function showResults() {
        screens.game.classList.remove('active');
        screens.results.classList.add('active');
        
        resultsBody.innerHTML = gameState.players.map(player => `
            <tr>
                <td>${player}</td>
                <td>${gameState.correctAnswers}</td>
                <td>${gameState.wrongAnswers}</td>
            </tr>
        `).join('');
    }

    // Manejador de clics
    wordCard.addEventListener('click', (e) => {
        if (gameState.isTimeout) {
            gameState.isTimeout = false;
            wordCard.classList.remove('timeout');
            showNextWord();
            return;
        }
        
        const rect = wordCard.getBoundingClientRect();
        const isRightSide = e.clientX - rect.left > rect.width / 2;
        
        if (isRightSide) {
            gameState.correctAnswers++;
            showNextWord();
        } else {
            gameState.wrongAnswers++;
            showTranslation();
            wordCard.classList.add('wrong');
        }
    });

    function showTranslation() {
        const currentWord = gameState.words[gameState.currentWordIndex - 1];
        translationElement.textContent = currentWord.translation;
        translationElement.classList.add('show');
    }

    // Reiniciar juego
    restartButton.addEventListener('click', () => {
        screens.results.classList.remove('active');
        screens.setup.classList.add('active');
        resetGameState();
    });

    function resetGameState() {
        gameState.currentWordIndex = 0;
        gameState.correctAnswers = 0;
        gameState.wrongAnswers = 0;
        gameState.isTimeout = false;
        wordCard.classList.remove('wrong', 'timeout');
        translationElement.classList.remove('show');
    }
});
