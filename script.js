// script.js
document.addEventListener("DOMContentLoaded", () => {
  // Elementos del DOM
  const screens = {
    welcome: document.getElementById("welcome-screen"),
    setup: document.getElementById("setup-screen"),
    loading: document.getElementById("loading-screen"),
    game: document.getElementById("game-screen"),
    results: document.getElementById("results-screen"),
  };

  const gameForm = document.getElementById("game-setup");
  const playersContainer = document.querySelector(".players-container");
  const addPlayerBtn = document.getElementById("add-player");
  const removePlayerBtn = document.getElementById("remove-player");
  const countdownElement = document.getElementById("countdown");
  const wordCard = document.getElementById("word-card");
  const currentPlayerElement = document.getElementById("current-player");
  const correctCountElement = document.getElementById("correct-count");
  const wrongCountElement = document.getElementById("wrong-count");

  // Estado del juego
  let gameState = {
    players: [],
    currentPlayerIndex: 0,
    rounds: 0,
    timePerTurn: 30,
    words: [],
    currentRound: 0,
    scores: {},
    countdownInterval: null,
    isTimeout: false,
  };

  // Inicialización
  initializeCategories();
  setupPlayerControls();
  startWelcomeAnimation();

  // Animación de bienvenida
  function startWelcomeAnimation() {
    const welcomeText = "Bienvenido al reto!";
    const welcomeElement = document.getElementById("welcome-text");

    // Mostrar texto inmediatamente
    welcomeElement.textContent = welcomeText;
    welcomeElement.style.opacity = 1;

    // Verifica que el texto se muestra correctamente
    console.log("Texto de bienvenida configurado:", welcomeElement.textContent);

    // Animación de revelado
    setTimeout(() => {
      triggerConfetti();
      // Transición a la pantalla de configuración
      setTimeout(() => {
        screens.welcome.classList.remove("active");
        screens.setup.classList.add("active");
        console.log("Transición a la pantalla de configuración completada");
      }, 1000);
    }, 2000);
  }

  // Controles de jugadores
  function setupPlayerControls() {
    addPlayerBtn.addEventListener("click", addPlayerInput);
    removePlayerBtn.addEventListener("click", removePlayerInput);
  }

  function addPlayerInput() {
    const playerInputs = document.querySelectorAll(
      ".players-container .input-group"
    );
    const playerCount = playerInputs.length;

    // Máximo 6 jugadores
    if (playerCount >= 6) return; 

    const newPlayer = document.createElement("div");
    newPlayer.className = "input-group";
    newPlayer.innerHTML = `
            <label for="player${playerCount + 1}">Jugador ${
      playerCount + 1
    }:</label>
            <input type="text" id="player${playerCount + 1}">
        `;

    playersContainer.appendChild(newPlayer);
    updatePlayerButtons();
  }

  function removePlayerInput() {
    const playerInputs = document.querySelectorAll(
      ".players-container .input-group"
    );
    console.log(playerInputs)
    if (playerInputs.length > 1) {
      playerInputs[playerInputs.length - 1].remove();
      updatePlayerButtons();
    }
  }

  function updatePlayerButtons() {
    const playerCount = document.querySelectorAll(".players-container .input-group").length;
    addPlayerBtn.disabled = playerCount >= 6;
    removePlayerBtn.disabled = playerCount <= 1;
  }

  // Manejador del formulario
  gameForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    gameState.players = Array.from(
      playersContainer.querySelectorAll(".input-group input")
    )
      .map((input) => input.value.trim())
      .filter((name) => name !== "");

    gameState.timePerTurn = Math.max(
      5,
      parseInt(document.getElementById("time").value)
    );
    gameState.rounds = parseInt(document.getElementById("rounds").value);
    gameState.category = document.getElementById("category").value;

    try {
      const response = await fetch("words.json");
      const data = await response.json();
      gameState.words = data[gameState.category]
        .sort(() => Math.random() - 0.5)
        .slice(0, gameState.players.length * gameState.rounds);

      screens.setup.classList.remove("active");
      showLoadingScreen();
    } catch (error) {
      console.error("Error cargando palabras:", error);
    }
  });

  function showLoadingScreen() {
    screens.loading.classList.add("active");
    setTimeout(startGame, 5000);
  }

  // Lógica principal del juego
  function startGame() {
    gameState.scores = Object.fromEntries(
      gameState.players.map((player) => [player, { correct: 0, wrong: 0 }])
    );

    screens.loading.classList.remove("active");
    screens.game.classList.add("active");
    nextTurn();
  }

  function nextTurn() {
    resetCardState();
    updatePlayerDisplay();
    startCountdown();
    showNextWord();
  }

  function updatePlayerDisplay() {
    currentPlayerElement.textContent = `Turno de: ${
      gameState.players[gameState.currentPlayerIndex]
    }`;
    const scores =
      gameState.scores[gameState.players[gameState.currentPlayerIndex]];
    correctCountElement.textContent = scores.correct;
    wrongCountElement.textContent = scores.wrong;
  }

  function startCountdown() {
    let timeLeft = gameState.timePerTurn;
    updateCountdownDisplay(timeLeft);

    gameState.countdownInterval = setInterval(() => {
      timeLeft--;
      updateCountdownDisplay(timeLeft);

      if (timeLeft <= 0) handleTimeout();
    }, 1000);
  }

  function updateCountdownDisplay(time) {
    countdownElement.textContent = `Tiempo: ${time}s`;
    countdownElement.style.color =
      time <= 5 ? "var(--danger-color)" : "var(--text-dark)";
  }

  function handleTimeout() {
    gameState.isTimeout = true;
    clearInterval(gameState.countdownInterval);
    wordCard.classList.add("rejected");
    showTranslation();
    updateScore("wrong");
  }

  // Interacción con la tarjeta
  wordCard.addEventListener("click", handleCardClick);

  function handleCardClick(e) {
    if (gameState.isTimeout) {
      gameState.isTimeout = false;
      nextPlayer();
      return;
    }

    const rect = wordCard.getBoundingClientRect();
    const isCorrect = e.clientY - rect.top > rect.height / 2;
    if (isCorrect) {
      handleCorrectAnswer();
      triggerConfetti();
    } else {
      handleWrongAnswer();
    }

    setTimeout(nextPlayer, 1000); // Cambia de turno después de 1 segundo
  }

  function handleCorrectAnswer() {
    wordCard.classList.add("approved");
    updateScore("correct");
    setTimeout(showNextWord, 1000);
  }

  function handleWrongAnswer() {
    wordCard.classList.add("rejected");
    updateScore("wrong");
    setTimeout(nextPlayer, 2000);
  }

  function handleTimeout() {
    gameState.isTimeout = true;
    clearInterval(gameState.countdownInterval);
    wordCard.classList.add("rejected"); // Asegúrate de agregar la clase 'rejected'
    showTranslation();
    updateScore("wrong");
    setTimeout(nextPlayer, 2000); // Cambia de turno después de 2 segundos
  }

  function nextPlayer() {
    gameState.currentPlayerIndex =
      (gameState.currentPlayerIndex + 1) % gameState.players.length;
    gameState.currentRound++;

    if (gameState.currentRound >= gameState.words.length) {
      endGame();
    } else {
      resetCardState();
      updatePlayerDisplay();
      showNextWord();
      startCountdown();
    }
  }

  function updateScore(type) {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    gameState.scores[currentPlayer][type]++;
    updatePlayerDisplay();
  }

  function showTranslation() {
    const currentWord = gameState.words[gameState.currentRound];
    document.getElementById("translation").textContent =
      currentWord.translation;
    document.getElementById("translation").classList.add("show");
  }

  function resetCardState() {
    wordCard.classList.remove("approved", "rejected");
    document.getElementById("translation").classList.remove("show");
    clearInterval(gameState.countdownInterval);
  }

  function showNextWord() {
    const currentWord = gameState.words[gameState.currentRound];
    document.getElementById("word").textContent = currentWord.word;
    document.getElementById("pronunciation").textContent =
      currentWord.pronunciation;
  }

  function endGame() {
    screens.game.classList.remove("active");
    showResults();
  }

  function showResults() {
    const sortedPlayers = gameState.players.sort((a, b) => {
      return gameState.scores[b].correct - gameState.scores[a].correct;
    });

    const tbody = document.querySelector("#results-table tbody");
    tbody.innerHTML = sortedPlayers
      .map(
        (player, index) => `
        <tr>
            <td>
                ${getRankIcon(index + 1)} 
                ${player}
            </td>
            <td>${gameState.scores[player].correct}</td>
            <td>${gameState.scores[player].wrong}</td>
        </tr>
    `
      )
      .join("");

    screens.results.classList.add("active");
  }

  function getRankIcon(position) {
    switch (position) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      case 4:
        return "🐴";
      default:
        return "";
    }
  }

  // Confeti
  function triggerConfetti() {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }

  // Inicializar categorías
  function initializeCategories() {
    const categories = [
      "Adverbios",
      "Preposiciones",
      "Animales domesticos",
      "Animales salvajes",
      "Partes de la casa",
      "Utensilios de cocina",
      "Ropa",
      "Adjetivos",
      "Partes del cuerpo",
      "Partes del carro",
      "Partes de la bicicleta",
      "Partes de las plantas",
      "Saludos comunes en Canada",
      "Preguntas clásicas",
      "Pronombres",
      "Oraciones",
      "Conjunciones",
      "Peces",
      "Países",
      "Verbos",
    ];

    const categorySelect = document.getElementById("category");
    categorySelect.innerHTML = categories
      .map((cat) => `<option value="${cat}">${cat}</option>`)
      .join("");
  }

  document.getElementById("restart-game").addEventListener("click", resetGame);

  function resetGame() {
    gameState = {
      players: [],
      currentPlayerIndex: 0,
      rounds: 0,
      timePerTurn: 30,
      words: [],
      currentRound: 0,
      scores: {},
      countdownInterval: null,
      isTimeout: false,
    };

    // Oculta la pantalla de resultados y muestra la pantalla de configuración
    screens.results.classList.remove("active");
    screens.setup.classList.add("active");

    // Resetea los formularios y elementos de UI
    document.getElementById("game-setup").reset();
    playersContainer.innerHTML = `
        <div class="input-group">
            <label for="player1">Jugador 1:</label>
            <input type="text" id="player1" required>
        </div>
    `;

    updatePlayerButtons();
    initializeCategories();
  }
});

document.getElementById('play-audio').addEventListener('click', function(event) {
  event.stopPropagation(); // Detiene la propagación del evento de clic
  var word = document.getElementById('word').textContent;
  var utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'en-US'; // Configura el idioma si es necesario
  utterance.rate = 0.75; // Ajusta la velocidad del habla (1 es la velocidad normal)
  speechSynthesis.speak(utterance);
});
