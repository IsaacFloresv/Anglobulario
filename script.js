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


document.addEventListener('DOMContentLoaded', () => {
    // Variables del DOM
    const setupScreen = document.getElementById('setup-screen');
    const gameScreen = document.getElementById('game-screen');
    const resultsScreen = document.getElementById('results-screen');
    const gameSetupForm = document.getElementById('game-setup');
    const categorySelect = document.getElementById('category');
    const countdownDisplay = document.getElementById('countdown');
    const wordDisplay = document.getElementById('word');
    const pronunciationDisplay = document.getElementById('pronunciation');
    const translationDisplay = document.getElementById('translation');
    const approvedDisplay = document.getElementById('approved');
    const rejectedDisplay = document.getElementById('rejected');
    const resultsTableBody = document.querySelector('#results-table tbody');
    const restartButton = document.getElementById('restart-game');
    const wordCard = document.getElementById('word-card');

    // Estado del juego
    let players = [];
    let timeLimit = 0;
    let currentCategory = '';
    let words = [];
    let currentWordIndex = 0;
    let approvedCount = 0;
    let rejectedCount = 0;
    let countdownInterval;
    let isCurrentWordHandled = false;

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
        initializeGame();
        loadWords();
    });

    // Lógica principal del juego
    function initializeGame() {
        players = [
            document.getElementById('player1').value,
            document.getElementById('player2').value,
            document.getElementById('player3').value,
            document.getElementById('player4').value
        ].filter(name => name.trim() !== '');

        timeLimit = parseInt(document.getElementById('time').value, 10);
        currentCategory = categorySelect.value;
    }

    async function loadWords() {
        try {
            const response = await fetch('words.json');
            const data = await response.json();
            words = data[currentCategory].sort(() => Math.random() - 0.5).slice(0, 10);
            startGame();
        } catch (error) {
            console.error('Error cargando palabras:', error);
        }
    }

    function startGame() {
        setupScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
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
                endGame();
            }
        }, 1000);
    }

    function updateCountdownDisplay(time) {
        countdownDisplay.textContent = `Tiempo restante: ${time} segundos`;
        countdownDisplay.style.color = time <= 10 ? '#ff4444' : '#333';
    }

    function showNextWord() {
        resetCardState();
        
        if (currentWordIndex < words.length) {
            displayCurrentWord();
            addCardAnimation();
            currentWordIndex++;
        } else {
            endGame();
        }
    }

    function resetCardState() {
        wordCard.classList.remove('rejected', 'approved', 'flip');
        translationDisplay.classList.remove('show-translation');
        translationDisplay.textContent = '';
        isCurrentWordHandled = false;
    }

    function displayCurrentWord() {
        const currentWord = words[currentWordIndex];
        wordDisplay.textContent = currentWord.word;
        pronunciationDisplay.textContent = currentWord.pronunciation;
    }

    function addCardAnimation() {
        void wordCard.offsetWidth; // Trigger reflow
        wordCard.classList.add('flip');
    }

    // Manejador de clics en la tarjeta
    wordCard.addEventListener('click', handleCardClick);

    function handleCardClick(e) {
        if (isCurrentWordHandled) {
            showNextWord();
            return;
        }

        const clickPosition = e.clientX - e.currentTarget.getBoundingClientRect().left;
        const cardWidth = e.currentTarget.offsetWidth;

        if (clickPosition < cardWidth / 2) {
            handleRejection();
        } else {
            handleApproval();
        }
    }

    function handleRejection() {
        wordCard.classList.add('rejected');
        translationDisplay.textContent = words[currentWordIndex - 1].translation;
        translationDisplay.classList.add('show-translation');
        rejectedCount++;
        rejectedDisplay.textContent = rejectedCount;
        isCurrentWordHandled = true;
    }

    function handleApproval() {
        wordCard.classList.add('approved');
        approvedCount++;
        approvedDisplay.textContent = approvedCount;
        showNextWord();
    }

    // Finalización del juego
    function endGame() {
        clearInterval(countdownInterval);
        gameScreen.classList.add('hidden');
        resultsScreen.classList.remove('hidden');
        displayResults();
    }

    function displayResults() {
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
    restartButton.addEventListener('click', () => {
        resultsScreen.classList.add('hidden');
        setupScreen.classList.remove('hidden');
        resetGame();
    });

    function resetGame() {
        players = [];
        timeLimit = 0;
        currentCategory = '';
        words = [];
        currentWordIndex = 0;
        approvedCount = 0;
        rejectedCount = 0;
        isCurrentWordHandled = false;
        
        countdownDisplay.textContent = '';
        wordDisplay.textContent = '';
        pronunciationDisplay.textContent = '';
        translationDisplay.textContent = '';
        approvedDisplay.textContent = '0';
        rejectedDisplay.textContent = '0';
    }
});
