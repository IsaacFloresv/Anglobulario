document.addEventListener('DOMContentLoaded', () => {
    const setupScreen = document.getElementById('setup-screen');
    const gameScreen = document.getElementById('game-screen');
    const resultsScreen = document.getElementById('results-screen');
    const gameSetupForm = document.getElementById('game-setup');
    const categorySelect = document.getElementById('category');
    const countdownDisplay = document.getElementById('countdown');
    const wordDisplay = document.getElementById('word');
    const pronunciationDisplay = document.getElementById('pronunciation');
    const approvedDisplay = document.getElementById('approved');
    const rejectedDisplay = document.getElementById('rejected');
    const resultsTableBody = document.querySelector('#results-table tbody');
    const restartButton = document.getElementById('restart-game');

    let players = [];
    let timeLimit = 0;
    let currentCategory = '';
    let words = [];
    let currentWordIndex = 0;
    let approvedCount = 0;
    let rejectedCount = 0;
    let countdownInterval;

    const categories = [
        'Adverbios', 'Preposiciones', 'Animales domesticos', 'Animales salvajes', 
        'Partes de la casa', 'Utensilios de cocina', 'Ropa', 'Adjetivos', 
        'Partes del cuerpo', 'Partes del carro', 'Partes de la bicicleta', 
        'Partes de las plantas', 'Saludos comunes en Canada', 'Preguntas clásicas', 
        'Pronombres', 'Oraciones', 'Conjunciones', 'Peces', 'Países', 'Verbos'
    ];

    // Llenar el select de categorías
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });

    // Manejar el envío del formulario
    gameSetupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        players = [
            document.getElementById('player1').value,
            document.getElementById('player2').value,
            document.getElementById('player3').value,
            document.getElementById('player4').value
        ].filter(name => name.trim() !== '');
        timeLimit = parseInt(document.getElementById('time').value, 10);
        currentCategory = categorySelect.value;

        // Cargar las palabras desde el archivo JSON
        fetch('words.json')
            .then(response => response.json())
            .then(data => {
                words = data[currentCategory].sort(() => Math.random() - 0.5).slice(0, 10);
                startGame();
            });
    });

    function startGame() {
        setupScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        startCountdown();
        showNextWord();
    }

    function startCountdown() {
        let timeLeft = timeLimit;
        countdownDisplay.textContent = `Tiempo restante: ${timeLeft} segundos`;
        countdownInterval = setInterval(() => {
            timeLeft--;
            countdownDisplay.textContent = `Tiempo restante: ${timeLeft} segundos`;
            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                endGame();
            }
        }, 1000);
    }

    function showNextWord() {
        if (currentWordIndex < words.length) {
            const currentWord = words[currentWordIndex];
            wordDisplay.textContent = currentWord.word;
            pronunciationDisplay.textContent = currentWord.pronunciation;
            wordDisplay.parentElement.classList.remove('flip');
            void wordDisplay.parentElement.offsetWidth; // Trigger reflow
            wordDisplay.parentElement.classList.add('flip');
            currentWordIndex++;
        } else {
            endGame();
        }
    }

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
        countdownDisplay.textContent = '';
        wordDisplay.textContent = '';
        pronunciationDisplay.textContent = '';
        approvedDisplay.textContent = '0';
        rejectedDisplay.textContent = '0';
    }

    // Manejar clics en la tarjeta de palabras
    document.getElementById('word-card').addEventListener('click', (e) => {
        const rect = e.target.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const cardWidth = rect.width;

        if (clickX > cardWidth / 2) {
            approvedCount++;
            approvedDisplay.textContent = approvedCount;
        } else {
            rejectedCount++;
            rejectedDisplay.textContent = rejectedCount;
        }

        showNextWord();
    });
});
// Variables nuevas a agregar
const translationDisplay = document.getElementById('translation');

// Modificar la función showNextWord
function showNextWord() {
  const card = document.getElementById('word-card');
  
  // Resetear estilos y traducción
  card.classList.remove('rejected', 'approved');
  translationDisplay.classList.remove('show-translation');
  translationDisplay.textContent = '';

  if (currentWordIndex < words.length) {
    const currentWord = words[currentWordIndex];
    wordDisplay.textContent = currentWord.word;
    pronunciationDisplay.textContent = currentWord.pronunciation;
    
    // Actualizar lógica de animación
    card.classList.remove('flip');
    void card.offsetWidth; // Forzar reflow
    card.classList.add('flip');
    
    currentWordIndex++;
  } else {
    endGame();
  }
}

// Modificar el event listener del click
document.getElementById('word-card').addEventListener('click', (e) => {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  const clickX = e.clientX - rect.left;

  if (clickX < rect.width / 2) { // Lado izquierdo (Rechazar)
    card.classList.add('rejected');
    translationDisplay.textContent = words[currentWordIndex - 1].translation;
    translationDisplay.classList.add('show-translation');
    rejectedCount++;
    rejectedDisplay.textContent = rejectedCount;
  } else { // Lado derecho (Aprobar)
    card.classList.add('approved');
    approvedCount++;
    approvedDisplay.textContent = approvedCount;
    showNextWord();
  }
});
