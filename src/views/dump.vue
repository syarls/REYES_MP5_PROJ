<template>
  <div class="background">
    <div class="playerturn">Player {{ currentPlayerIndex + 1 }}'s Turn</div>
    <div id="uno-game">
      <div class="container">
        <div class="player-grid">
          <div class="player-hand" v-for="(hand, index) in players" :key="index">
            <div class="player-info">
              <div class="playercontainer">
                <div class="numberOfCards">{{ hand.length }}</div>
              </div>
              <h2 class="players">Player {{ index + 1 }}:</h2>
            </div>
            <button class="prev-button" @click="previousCards">&#10094;</button>
            <div class="card" v-for="(card, i) in hand.slice(startIndex, startIndex + cardsPerPage)" :key="i" @click="playCard(index, i)">
             <img v-if="index === currentPlayerIndex" :src="getCardImage(card)" :alt="getCardAltText(card)" class="card-image">
              <img v-else src="../assets/images/back.png" class="card-image">
            </div>
            <button class="next-button" @click="nextCards">&#10095;</button>
          </div>
        </div>
      </div>
      <div class="current-card">
        <h2>Last Card</h2>
        <div class="card-current">
          <nobr>
          <img :src="getCardImage(currentCard)" :alt="getCardAltText(currentCard)" class="card-image">
          <img src="../assets/images/unoDeck.png" class="deck" @click="drawCard"/>
          </nobr>
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

export default {
  data() {
    const colors = ['red', 'blue', 'green', 'yellow']; 
    const values = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '+2', 'reverse', 'skipped']; 
    const currentPlayerIndex = ref(0); 
    const direction = ref('normal')
    const isWildCard = Math.random() < 0.05;
    const isSwitchColor = Math.random() < 0.5; 

    if (isWildCard) {
      if (isSwitchColor) {
        this.currentCard = { colors: 'black', values: 'switchColor' };
      } else {
        this.currentCard = { colors: 'black', values: '+4' };
      }
    }
    
    const randomColor = () => colors[Math.floor(Math.random() * colors.length)];
    const randomValue = () => values[Math.floor(Math.random() * values.length)];  

    const players = Array.from({ length: 4 }, () => 
      Array.from({ length: 5 }, () => ({ color: randomColor(), value: randomValue() }))
    );

    const currentCard = { color: randomColor(), value: randomValue() };

    return {
      colors,
      values,
      currentPlayerIndex,
      players,
      currentCard,
      direction,
      selectedColor: null,
      backgroundMusic: null,
      cardsPerPage: 5,
      startIndex: 0
    };
  },

  mounted(){
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
      if (playerIndex !== this.currentPlayerIndex) {
        return;
      }

      const card = this.players[playerIndex][cardIndex];
      console.log(card);
      if (card.color === this.currentCard.color || card.value === this.currentCard.value || card.color === 'black') {
        if (card.value === 'reverse') {
          this.direction = (this.direction === 'normal') ? 'reverse' : 'normal';
        }
        else if(card.value === 'skipped'){
          this.skipNextPlayer();
        }
        else if(card.value === '+2'){
          this.addCards(2);
        }
        else if(card.value === 'switchColor'){
          this.switchColor();
        }
        else if(card.value === '+4'){
          this.switchColor();
          this.addCards(4);
        }
        this.currentCard = card;
        this.players[playerIndex].splice(cardIndex, 1);

        if (this.players[this.currentPlayerIndex].length === 0) {
          sweetNotif.fire({
            title: "Congratulations!",
            text: `Player ${this.currentPlayerIndex + 1} won the game!`,
            imageUrl: `${congratulations}`,
            imageWidth: 300,
            imageHeight: 300,
            timer: 30000,
            timerProgressBar: true,
          }).then((result) => {
            if (result.dismiss === sweetNotif.DismissReason.timer) {
              this.$router.push('/main');
            }
          });
        }

        const currentPlayerHand = this.players[this.currentPlayerIndex];
        const currentPlayerHasCards = currentPlayerHand.length > 0;
        if (currentPlayerHasCards && card.color !== 'black') {
          this.switchPlayer();
        }
      } else if (this.currentCard.color === 'black' && card.color !== 'black') {
        if (card.value === 'reverse') {
          this.direction = (this.direction === 'normal') ? 'reverse' : 'normal';
        }
        else if(card.value === 'skipped'){
          this.skipNextPlayer();
        }
        else if(card.value === '+2'){
          this.addCards(2);
        }
        else if(card.value === 'switchColor'){
          this.switchColor();
        }
        else if(card.value === '+4'){
          this.switchColor();
          this.addCards(4);
        }
        this.currentCard = card;
        this.players[playerIndex].splice(cardIndex, 1);

        if (this.players[this.currentPlayerIndex].length === 0) {
          sweetNotif.fire({
            title: "Congratulations!",
            text: `Player ${this.currentPlayerIndex + 1} won the game!`,
            imageUrl: `${congratulations}`,
            imageWidth: 300,
            imageHeight: 300,
            timer: 30000,
            timerProgressBar: true,
          }).then((result) => {
            if (result.dismiss === sweetNotif.DismissReason.timer) {
              this.$router.push('/');
            }
          });
        }

        const currentPlayerHand = this.players[this.currentPlayerIndex];
        const currentPlayerHasCards = currentPlayerHand.length > 0;
        if (currentPlayerHasCards) {
          this.switchPlayer();
        }
      } else {
        sweetNotif.fire({
          title: "Invalid move!",
          text: "You can only play a card of the same color or value.",
          imageUrl: `${randomCatGif}`,
          imageWidth: 300,
          imageHeight: 250,
        });
      }
    },

    drawCard() {
      const newCard = this.drawCardFromDeck(); 
      this.players[this.currentPlayerIndex].push(newCard);
      this.switchPlayer();
    },

    switchPlayer() {
      if (this.direction === 'normal') {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
      } else if (this.direction === 'reverse') {
        this.currentPlayerIndex = (this.currentPlayerIndex - 1 + this.players.length) % this.players.length;
      }
    },

    addCards(numCards){
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
    },

    switchColor(){
      this.currentPlayerIndex = this.currentPlayerIndex;
    },

    skipNextPlayer() {
      let nextPlayerIndex;
      if (this.direction === 'normal') {
        nextPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
      } else {
        nextPlayerIndex = (this.currentPlayerIndex - 1 + this.players.length) % this.players.length;
      }

      this.currentPlayerIndex = nextPlayerIndex;
    },

    drawCardFromDeck() {
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
    previousCards() {
  const currentPlayerHand = this.players[this.currentPlayerIndex];
  
  
  if (this.startIndex >= 0) {
    this.startIndex -= this.cardsPerPage;
    if (this.startIndex < 0) {
      this.startIndex = 0;
    }
  }
},

nextCards() {
  const currentPlayerHand = this.players[this.currentPlayerIndex];
  const maxIndex = Math.max(currentPlayerHand.length - this.cardsPerPage, 0);
  if (this.startIndex + this.cardsPerPage < currentPlayerHand.length) {
    this.startIndex += this.cardsPerPage;
    if (this.startIndex > maxIndex) {
      this.startIndex = maxIndex;
    }
  }
}
  }
};

    </script>
  <style scoped>
  #uno-game {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .container {
    margin-top: 50px;
  }

  .player-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    row-gap: 50px; 
  column-gap: 170px;
  }

  h2 {
    color: white;
  }

  .player-hand {
    margin-bottom: 20px;
  }

  .card,
  .card-current {
    width: 130px;
    height: 190px;
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

  .playerturn {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: auto;
    font-size: 24px;
    font-weight: bold;
    color: white;
    z-index: 100;
    background-image: linear-gradient(1deg, #4F58FD, #149BF3 99%);
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

  .card-image:hover {
    transform: scale(1.05);
  }

  .background {
    background-image: url('../assets/background/backgroundPlay.gif');
    position: relative;
    min-height: 100vh;
    min-width: 100vw;
    background-size: cover;
    background-position: center;
  }

  .deck {
    width: 200px;
    height: 200px;
  }

  .deck:hover {
    transform: scale(1.05);
  }

  .player-info {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }

  .numberOfCards {
    color: #f8db23;
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
    text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
  }

  .playercontainer {
    position: relative;
    background-image: url('../assets/characters/default-avatar.png');
    background-size: cover;
    height: 50px;
    width: 50px;
    border-radius: 5px;
  }

  .players {
    margin-left: 15px;
    font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
  }

  .prev-button {
  position: absolute;
  top: 40%;
  left: 30px;
  transform: translateY(-50%);
}

.next-button {
  position: absolute;
  top: 40%;
  right: 30px;
  transform: translateY(-50%);
  
  
}



.next-button, .prev-button{
  align-items: center;
  background-image: linear-gradient(1deg, #4F58FD, #149BF3 99%);
  border: 0;
  border-radius: 10px;
  box-sizing: border-box;
  color: #fff;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  font-family: "Codec cold",sans-serif;
  font-size: 16px;
  font-weight: 700;
  height: 54px;
  justify-content: center;
  letter-spacing: .4px;
  line-height: 1;
  max-width: 100%;
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 3px;
  text-decoration: none;
  text-transform: uppercase;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

</style>