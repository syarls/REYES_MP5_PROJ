import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import sweetNotif from 'sweetalert2';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
  }
});

let connectedUsers = 0;
let currentCard = generateRandomCard();
let players = [];
let direction = 'normal'; 
let currentPlayerIndex = 0; 

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send(`Server is running.<br> Connected users: ${connectedUsers}`);
});

app.get('/connected-users', (req, res) => {
  res.json({ connectedUsers });
});

app.get('/current-card', (req, res) => {
  res.json(currentCard);
});

app.get('/players', (req, res) => {
  res.json(players);
});

function generateRandomCard() {
  const colors = ['red', 'blue', 'green', 'yellow'];
  const values = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '+2', 'reverse', 'skipped'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const value = values[Math.floor(Math.random() * values.length)];
  return { color, value };
}

function emitCurrentCard() {
  io.emit('currentCard', currentCard);
}

function emitPlayersData() {
  io.emit('players', players);
}

function dealCardsToPlayers() {
  const totalCards = 5; 
  players.forEach((player) => {
    player.hand = [];
    for (let i = 0; i < totalCards; i++) {
      player.hand.push(generateRandomCard()); // Push random cards to the player's hand
    }
  });
}

function emitGameState() {
  io.emit('game-state', { currentCard, direction, players });
}

function drawCard() {
  const newCard = drawCardFromDeck(); 
  players[currentPlayerIndex].hand.push(newCard);
  switchPlayer();
}

function switchPlayer() {
  if (direction === 'normal') {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  } else if (direction === 'reverse') {
    currentPlayerIndex = (currentPlayerIndex - 1 + players.length) % players.length;
  }
}

function addCards(numCards){
  let nextPlayerIndex;
  if (direction === 'normal') {
    nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
  } else if (direction === 'reverse') {
    nextPlayerIndex = (currentPlayerIndex - 1 + players.length) % players.length;
  }
  for (let i = 0; i < numCards; i++) {
    const newCard = drawCardFromDeck();
    players[nextPlayerIndex].hand.push(newCard);
  }
}

function switchColor(){
  currentCard.color = 'newColor'; // Change the color to a new color
}

function skipNextPlayer() {
  if (direction === 'normal') {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  } else {
    currentPlayerIndex = (currentPlayerIndex - 1 + players.length) % players.length; 
  }
}

function drawCardFromDeck() {
  const colors = ['red', 'blue', 'green', 'yellow'];
  const values = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '+2', 'reverse', 'skipped'];

  const isWildCard = Math.random() < 0.1; 
  const isSwitchColor = Math.random() < 0.1; 
  if (isWildCard) {
    if (isSwitchColor) {
      return { color: 'black', value: 'switchColor' };
    } else {
      return { color: 'black', value: '+4' };
    }
  }
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const randomValue = values[Math.floor(Math.random() * values.length)];
  return { color: randomColor, value: randomValue };
}

io.on('connection', (socket) => {
  if (connectedUsers < 4) {
    io.emit('connected-users', ++connectedUsers);
    console.log('A user connected');
    io.emit('user_connected', 'A user connected');
    const playerId = socket.id;
    const playerIndex = players.length; 
    players.push({ id: playerId, index: playerIndex, hand: [] }); 

    dealCardsToPlayers(); 
    emitPlayersData(); 
    socket.emit('currentCard', currentCard);

    socket.on('redirect-to-play', () => {
      console.log("Received 'redirect-to-play' event from client. Emitting 'redirect-success' event to all clients...");
      io.emit('redirect-success');
    });
    socket.on('draw-card', ({ newCard, currentPlayerIndex }) => {
      console.log(`Player ${currentPlayerIndex} drew a card:`, newCard);
      const player = players[currentPlayerIndex];
      if (player) {
        player.hand.push(newCard);
        io.emit('player-updated', players);
      }
    });

    socket.on('start-game-instance', (data) => {
      console.log('Received start game instance signal');
      io.emit('start-game-instance', data);
    });

    socket.on('switch-player', (playerIndex) => {
      console.log(`Player ${playerIndex} switched`);
        io.emit('switchPlayer', playerIndex);
    });

    socket.on('play-card', ({ playerIndex, cardIndex, card }) => {
      console.log("Received play-card event:", { playerIndex, cardIndex, card });
      if (playerIndex !== currentPlayerIndex) {
        return;
      }
      
   
      if (card.color === currentCard.color || card.value === currentCard.value || card.color === 'black') {
        console.log("Valid card played.");
    

        if (card.value === 'reverse') {
          console.log("Reverse card played.");
          direction = (direction === 'normal') ? 'reverse' : 'normal';
        } else if (card.value === 'skipped') {
          console.log("Skipped card played.");
          skipNextPlayer();
        } else if (card.value === '+2') {
          console.log("+2 card played.");
          addCards(2);
          skipNextPlayer();
        } else if (card.value === 'switchColor') {
          console.log("Switch color card played.");
          switchColor();
        } else if (card.value === '+4') {
          console.log("+4 card played.");
          switchColor();
          addCards(4);
        }
    
        // Update current card and remove it from player's hand
        currentCard = card;
        console.log("Removing card from player's hand.");
        players[playerIndex].hand.splice(cardIndex, 1);
    
        // Emit updated game state
        emitGameState();
    
        // Check if the current player has won the game
        if (players[currentPlayerIndex].hand.length === 0) {
          console.log("Player won the game:", currentPlayerIndex);
          sweetNotif.fire({
            title: "Congratulations!",
            text: `Player ${currentPlayerIndex + 1} won the game!`,
            imageUrl: `${congratulations}`,
            imageWidth: 300,
            imageHeight: 300,
            timer: 30000,
            timerProgressBar: true,
          }).then((result) => {
            if (result.dismiss === sweetNotif.DismissReason.timer) {
              // Handle redirection or any other logic here
            }
          });
        }
    
        // Check if the current player still has cards to play
        const currentPlayerHand = players[currentPlayerIndex].hand;
        const currentPlayerHasCards = currentPlayerHand.length > 0;
        if (currentPlayerHasCards && card.color !== 'black') {
          console.log("Switching to next player.");
          switchPlayer();
        }
      } else if (currentCard.color === 'black' && card.color !== 'black') {
        // Handling when the current card is a wildcard
        // but the played card is not a wildcard
        console.log("Invalid move: You can only play a card of the same color or value.");
        sweetNotif.fire({
          title: "Invalid move!",
          text: "You can only play a card of the same color or value.",
        });
      }
    });
    
    
    socket.on('disconnect', () => {
      console.log('User disconnected');
      connectedUsers--;
      io.emit('user_disconnected', 'A user disconnected');
      players = players.filter((player) => player.id !== playerId);
      emitGameState();
    });
  }
});

const PORT = process.env.PORT || 5174;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
