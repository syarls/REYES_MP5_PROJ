<template>
  <div class="background">
    <div class="playerturn">Player {{ currentPlayerIndex + 1 }}'s Turn</div>
    <div id="uno-game">
      <div class="container">
  
      </div>

      <div class="player-hand" v-for="(player, index) in players" :key="index">
        <div class="player-info">
          <div class="playercontainer">
            <div class="numberOfCards">{{ player.hand.length }}</div>
          </div>
          <h2 class="players">Player {{ index + 1 }}:</h2>
        </div>
  
        <div class="card" v-for="(card, i) in player.hand" :key="i" @click="playCard(index, i)">
          <img :src="getCardImage(card)" :alt="getCardAltText(card)" class="card-image">
        </div>
      </div>
      <div class="current-card">
        <h2>Last Card</h2>
        <div class="card-current">
          <img :src="getCardImage(currentCard)" :alt="getCardAltText(currentCard)" class="card-image">
          <img src="../assets/images/unoDeck.png" class="deck" @click="drawCard">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import sweetNotif from 'sweetalert2';
import randomCatGif from '../assets/images/random-cat.gif'
import congratulations from '../assets/images/random-cat4.gif'
import bgmusic from '../assets/audio/main-bg.mp3';
import io from 'socket.io-client';
import axios from 'axios';

export default {
  data() {
    const socket = io('ws://localhost:5174');
    const colors = ['red', 'blue', 'green', 'yellow']; 
    const values = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '+2', 'reverse', 'skipped']; 
    const currentPlayerIndex = ref(0); 
    const players = ref([]); 
    const direction = ref('normal');
    const isWildCard = Math.random() < 0.05;
    const isSwitchColor = Math.random() < 0.5; 
    
    // Define randomColor and randomValue functions
    const randomColor = () => colors[Math.floor(Math.random() * colors.length)];
    const randomValue = () => values[Math.floor(Math.random() * values.length)];

    // Initialize currentCard
    let currentCard = { color: '', value: '' };

    if (isWildCard) {
      currentCard = { color: 'black', value: isSwitchColor ? 'switchColor' : '+4' };
    } else {
      currentCard = { color: randomColor(), value: randomValue() };
    }

    socket.on('players', (data) => {
      this.players = data; 
    });

    socket.on('currentPlayerIndex', (index) => {
      console.log('Received currentPlayerIndex:', index);
      currentPlayerIndex.value = index;
    });

    socket.on('currentCard', (card) => {
      console.log('Received currentCard:', card);
      currentCard = card;
    });

    socket.on('direction', (dir) => {
      console.log('Received direction:', dir);
      direction.value = dir;
    });

    socket.on('game-state', ({ currentCard, players, direction }) => {
      console.log('Received game state:', { currentCard, players, direction });
      this.currentCard = currentCard;
      this.players = players;
      this.direction = direction;
    });

    socket.on('player-updated', (updatedPlayers) => {
  console.log('Received updated player data:', updatedPlayers);

  this.players = updatedPlayers;
});

socket.on('switchPlayer', (playerIndex) => {
  if (this.direction === 'normal') {
    this.currentPlayerIndex = (playerIndex + 1) % this.players.length;
  } else if (this.direction === 'reverse') {
    this.currentPlayerIndex = (playerIndex - 1 + this.players.length) % this.players.length;
  }
});
    return {
      colors,
      values,
      currentPlayerIndex,
      players,
      currentCard,
      direction,
      selectedColor: null,
      backgroundMusic: null,
      socket
    };
  },

  mounted() {
    axios.get('http://localhost:5174/current-card')
      .then(response => {
        this.currentCard = response.data;
      })
      .catch(error => {
        console.error('Error fetching current card:', error);
      });

    axios.get('http://localhost:5174/players')
      .then(response => {
        this.players = response.data;
      })
      .catch(error => {
        console.error('Error fetching players data:', error);
      });

    this.backgroundMusic = new Audio(bgmusic);
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = 0.10;
    this.backgroundMusic.play();

  },

  beforeUnmount() {
    this.backgroundMusic.pause();
  },

  methods: {
    playCard(playerIndex, cardIndex) {
      const player = this.players[playerIndex];
      const card = player.hand[cardIndex];
      this.socket.emit('play-card', { playerIndex, cardIndex, card });
      this.switchPlayer();
    },


drawCard() {
  const newCard = this.drawCardFromDeck(); // Generate a new card
  const player = this.players[this.currentPlayerIndex];
  player.hand.push(newCard); // Push the new card to the player's hand
  this.socket.emit('draw-card', { newCard, currentPlayerIndex: this.currentPlayerIndex });
  this.switchPlayer();
},


switchPlayer() {
  // if (this.direction === 'normal') {
  //   this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
  // } else if (this.direction === 'reverse') {
  //   this.currentPlayerIndex = (this.currentPlayerIndex - 1 + this.players.length) % this.players.length;
  // }
  this.socket.emit('switch-player', this.currentPlayerIndex);
},

addCards(numCards) {
  let nextPlayerIndex;
  if (this.direction === 'normal') {
    nextPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
  } else if (this.direction === 'reverse') {
    nextPlayerIndex = (this.currentPlayerIndex - 1 + this.players.length) % this.players.length;
  }
  for (let i = 0; i < numCards; i++) {
    const newCard = this.drawCardFromDeck();
    this.players[nextPlayerIndex].push(newCard);
  }
  this.socket.emit('add-cards', { numCards, nextPlayerIndex });
},

switchColor() {
  // You might need to specify the color here
  this.socket.emit('switch-color', { currentPlayerIndex: this.currentPlayerIndex, color: 'newColor' });
},

skipNextPlayer() {
  let nextPlayerIndex;
  if (this.direction === 'normal') {
    nextPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
  } else {
    nextPlayerIndex = (this.currentPlayerIndex - 1 + this.players.length) % this.players.length;
  }
  this.socket.emit('skip-player', nextPlayerIndex);
},

drawCardFromDeck() {
  // No need to emit this function, it's used locally
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
},

    getCardImage(card) {
      const imageUrl = `/src/assets/images/${card.color}_${card.value}.png`;
      return imageUrl;
    },

    getCardAltText(card) {
      return `${card.color} ${card.value}`;
    },
  },
};
</script>

  <style scoped>
 

#uno-game {
  display: flex;
  flex-direction: column;
  align-items: center;
}

h2{
  color:white;
}

.player-hand {
  margin-bottom: 20px;
  
}

.card, .card-current{
  width: 140px;
  height: 210px;
  border-radius: 5px;
  margin: -15px;
  display: inline-block;
  position: relative;
  cursor: pointer;
}

.current-card {
  margin-bottom: 20px;
}

.current-card .card {
  width: 120px;
  height: 180px;
}

/* .card-current {
  width: 140px;
  height: 210px;
  border-radius: 5px;
  margin: -15px;
  display: inline-block;
  position: relative;
  cursor: pointer;
} */



.playerturn {
  position:relative;
  background-image: linear-gradient(1deg, #4F58FD, #149BF3 99%);
  width: auto;
  height:auto;
  font-size: 24px;
  font-weight: bold;
  color: white;
}

  .card:hover {
    transform: translateY(-15px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.0);
  }

  .player-hand {
    margin: 0 10px;
  } 
  .card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
  .card-image:hover{
    transform:scale(1.05)
  }

 .background{
  background-image: url('../assets/background/backgroundPlay.gif') ;
  position: relative;
  min-height: 100vh;
  min-width: 100vw;
  background-size: cover;
  background-position: center;
} 

.deck{
  width: 200px;
  height: 200px;
}
.deck:hover{
transform:scale(1.05)
}
.player-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.numberOfCards {
  color: #F8DB23;
  background-size: cover;
  padding: 0.25em 0.5em;
  margin-left: 1em;
  margin-top: 30px;
  font-size: 26px;
  font-weight: bold;
  border-radius: 30px;
  height: 15px;
  width: 5px;
  text-align: center;
  line-height: 20px;
  background-color: red;
  text-indent: -0.15em;
  text-shadow: 
    -1px -1px 0 #000,  
     1px -1px 0 #000,
    -1px  1px 0 #000,
     1px  1px 0 #000;
     
}

.playercontainer{
  position:relative;
  background-image: url('../assets/characters/default-avatar.png');
  background-size: cover;
  height: 50px;
  width:50px;
  border-radius: 5px;
}

.players{
  margin-left: 15px;
  font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
}



</style>