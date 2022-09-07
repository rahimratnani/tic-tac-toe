const Gameboard = (function () {
  let gameArr = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  const resetGameArr = () => {
    gameArr = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  };
  const getLocations = () => gameArr;
  const setLocations = (index, marker) => {
    gameArr.splice(index, 1, marker);
  };

  return {
    resetGameArr,
    getLocations,
    setLocations,
  };
})();

const Gameplay = (function (doc) {
  /* ===== Internal functions ===== */

  const showElement = (element, value) => {
    if (!value) {
      element.style.display = 'block';
      return;
    }
    element.style.display = value;
  };

  const hideElement = (element) => {
    element.style.display = 'none';
  };

  const startGame = () => {
    Gameboard.resetGameArr();
    isGameOver = false;
    notify.textContent = '';
    hideElement(replayBtn);
    player1.setTurn(true);
    player2.setTurn(false);
    displayTurn();
    render();
  };

  const render = () => {
    let locs = Gameboard.getLocations();
    for (let i = 0; i < tiles.length; i++) {
      if (typeof locs[i] === 'number') {
        tiles[i].textContent = '';
      } else {
        tiles[i].textContent = locs[i];
      }
    }
  };

  const updateText = (element, text) => {
    element.textContent = text;
  };

  const gameMode = (e) => {
    if (e.target.tagName === 'BUTTON' && e.target.hasAttribute('data-choice')) {
      if (e.target.getAttribute('data-choice') === 'player') {
        showElement(popupBackground);
      } else if (e.target.getAttribute('data-choice') === 'ai') {
        updateText(popupBackground.querySelector('.name-2'), 'AI name:');
        showElement(popupBackground);
        gameModeAI = true;
      }
    }
  };

  const validateNames = (element) => {
    if (element.value !== '') {
      return true;
    }
  };

  const createPlayer = (name, marker, turn) => {
    const getName = () => name;
    const getMarker = () => marker;
    const getTurn = () => turn;
    const setTurn = (value) => {
      turn = value;
    };

    return {
      getName,
      getMarker,
      getTurn,
      setTurn,
    };
  };

  const getCurrentMarker = () => {
    if (player1.getTurn()) {
      return player1.getMarker();
    } else {
      return player2.getMarker();
    }
  };

  const shiftTurn = () => {
    if (player1.getTurn()) {
      player1.setTurn(false);
      player2.setTurn(true);
    } else {
      player2.setTurn(false);
      player1.setTurn(true);
    }
  };

  const displayTurn = () => {
    if (!isGameOver && !gameModeAI) {
      if (player1.getTurn()) {
        notify.textContent = `${player1.getName()}'s Turn`;
      } else {
        notify.textContent = `${player2.getName()}'s Turn`;
      }
    }
  };

  const checkForMatch = (gameArr) => {
    const winCombos = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 4, 8],
      [6, 4, 2],
      [2, 5, 8],
      [1, 4, 7],
      [0, 3, 6],
    ];

    let winner = '';

    for (let i = 0; i < winCombos.length; i++) {
      let one = '';
      let two = '';
      let three = '';

      for (let j = 0; j < gameArr.length; j++) {
        if (j === winCombos[i][0]) {
          one = gameArr[j];
        } else if (j === winCombos[i][1]) {
          two = gameArr[j];
        } else if (j === winCombos[i][2]) {
          three = gameArr[j];
        } else {
          continue;
        }
      }

      if (one === two && one === three && typeof one !== 'number') {
        winner = one;
        break;
      } else {
        continue;
      }
    }

    return winner;
  };

  const checkForDraw = () => {
    let gameArr = Gameboard.getLocations();
    return gameArr.every((loc) => typeof loc !== 'number');
  };

  const getWinner = (winner) => {
    if (player1.getMarker() === winner) {
      return player1.getName();
    } else if (player2.getMarker() === winner) {
      return player2.getName();
    }
  };

  // Normal Mode
  const handleNormalMode = (e) => {
    if (e.target.textContent === '' && !isGameOver) {
      Gameboard.setLocations(
        Number(e.target.getAttribute('data-tile')),
        getCurrentMarker()
      );
      render();
      let winner = checkForMatch(Gameboard.getLocations());

      if (!winner && checkForDraw()) {
        notify.textContent = `It's a Draw`;
        isGameOver = true;
        showElement(replayBtn);
      } else if (winner) {
        notify.textContent = `The winner is ${getWinner(winner)}`;
        isGameOver = true;
        showElement(replayBtn);
      }
      shiftTurn();
      displayTurn();
    }
  };
  // ========================================== //

  const emptyPlaces = (gameArr) => {
    // returns array of empty places
    return gameArr.filter((item) => typeof item === 'number');
  };

  const minimax = (newBoard, player) => {
    let availSpots = emptyPlaces(newBoard);

    if (checkForMatch(newBoard) === player1.getMarker()) {
      return { score: -10 };
    } else if (checkForMatch(newBoard) === player2.getMarker()) {
      return { score: 10 };
    } else if (availSpots.length === 0) {
      return { score: 0 };
    }

    let moves = [];
    for (let i = 0; i < availSpots.length; i++) {
      let move = {};
      move.index = newBoard[availSpots[i]];
      newBoard[availSpots[i]] = player;

      if (player === player2.getMarker()) {
        move.score = minimax(newBoard, player1.getMarker()).score;
      } else {
        move.score = minimax(newBoard, player2.getMarker()).score;
      }

      newBoard[availSpots[i]] = move.index;

      if (
        (player === player2.getMarker() && move.score === 10) ||
        (player === player1.getMarker() && move.score === -10)
      ) {
        return move;
      } else {
        moves.push(move);
      }
    }

    let bestMove, bestScore;
    if (player === player2.getMarker()) {
      bestScore = -1000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score > bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    } else {
      bestScore = 1000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score < bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    }

    return moves[bestMove];
  };

  const getAIMove = () => {
    let result = minimax(Gameboard.getLocations(), player2.getMarker()).index;
    return result;
  };

  // AI Mode
  const handleAIMode = (e) => {
    if (e.target.textContent === '' && !isGameOver) {
      // player's move
      Gameboard.setLocations(
        Number(e.target.getAttribute('data-tile')),
        getCurrentMarker()
      );

      render();
      let winner = checkForMatch(Gameboard.getLocations());

      if (!winner && checkForDraw()) {
        notify.textContent = `It's a Draw`;
        isGameOver = true;
        showElement(replayBtn);
      } else if (winner) {
        notify.textContent = `The winner is ${getWinner(winner)}`;
        isGameOver = true;
        showElement(replayBtn);
      }

      shiftTurn();

      // AI's move
      if (!isGameOver) {
        Gameboard.setLocations(getAIMove(), getCurrentMarker());
        render();

        winner = checkForMatch(Gameboard.getLocations());
        if (!winner && checkForDraw()) {
          notify.textContent = `It's a Draw`;
          isGameOver = true;
          showElement(replayBtn);
        } else if (winner) {
          notify.textContent = `The winner is ${getWinner(winner)}`;
          isGameOver = true;
          showElement(replayBtn);
        }

        shiftTurn();
      }
    }
  };

  // ============================================== //

  /* ===== Cached DOM ===== */
  const playerChoice = doc.querySelector('.player-choice');
  const popupBackground = doc.querySelector('.popup-background');
  const submitBtn = doc.querySelector('.btn');
  const name1 = doc.querySelector('#player-1-name');
  const name2 = doc.querySelector('#player-2-name');
  const alertDiv = doc.querySelector('.alert');
  const notify = alertDiv.querySelector('h2');
  const gameboard = doc.querySelector('.gameboard');
  const tiles = Array.from(gameboard.querySelectorAll('div'));
  const replayBtn = doc.querySelector('.replay button');

  /* ===== Variables ===== */
  let gameModeAI = false;
  let isGameOver = false;

  // Player objects
  let player1;
  let player2;

  /* ===== Event listeners ===== */

  // Select game mode
  playerChoice.addEventListener('click', gameMode);

  // Submit names and create players
  submitBtn.addEventListener('click', () => {
    name1.classList.remove('highlight');
    name2.classList.remove('highlight');

    if (!validateNames(name1)) {
      name1.classList.add('highlight');
    } else if (!validateNames(name2)) {
      name2.classList.add('highlight');
    } else {
      // create players
      player1 = createPlayer(name1.value, 'O', true); // human
      player2 = createPlayer(name2.value, 'X', false); // AI

      // reset form values
      name1.value = '';
      name2.value = '';

      hideElement(popupBackground);
      hideElement(playerChoice);
      showElement(gameboard, 'grid');
      showElement(alertDiv);
      displayTurn();
    }
  });

  // dynamically add event listeners
  submitBtn.addEventListener('click', () => {
    tiles.forEach((tile) => {
      if (!gameModeAI) {
        tile.addEventListener('click', handleNormalMode);
      } else {
        tile.addEventListener('click', handleAIMode);
      }
    });
  });

  // Replay button
  replayBtn.addEventListener('click', startGame);
})(document);
