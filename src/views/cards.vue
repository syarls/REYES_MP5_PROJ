<template>
  <div class="main-bg">
    <div class="container">
    <img src="../assets/images/fontbolt.png" height="50px">
      <div class="character-list">
        <button class="prev-btn" @click="prevCard" v-show="currentIndex > 0">&#10094;</button>
        <transition-group name="card" tag="div">
          <div v-for="(card, index) in displayedCards" :key="card.name" class="character-item">
            <div class="character-image">
              <img :src="card.image" class="card-img">
            </div>
            <div class="character-info">
              <img :src="card.name" height="35px">
            </div>
          </div>
        </transition-group>
        <button class="next-btn" @click="nextCard" v-show="currentIndex < cards.length - numDisplayedCards">&#10095;</button>
      </div>
    </div>
  </div>
</template>
<script>
import cardData from '../assets/images/cards.json';

export default {
  data() {
    return {
      cards: [],
      currentIndex: 0,
      numDisplayedCards: 3,
      currentColorIndex: 0,
    };
  },
  computed: {
    displayedCards() {
      return this.cards.slice(this.currentIndex, this.currentIndex + this.numDisplayedCards);
    },
  },
  mounted() {
    this.cards = cardData.cards;
    setInterval(this.changeCardColors, 3000); 
  },
  methods: {
    nextCard() {
      if (this.currentIndex < this.cards.length - this.numDisplayedCards) {
        this.currentIndex++;
      }
    },
    prevCard() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
      }
    },
    changeCardColors() {
      const colors = ['blue', 'red', 'yellow', 'green'];
      this.currentColorIndex = (this.currentColorIndex + 1) % colors.length; 
      const currentColor = colors[this.currentColorIndex]; 
     
      this.cards.forEach(card => {
        if (card.type === 'blue') {
          card.image = card[currentColor];
        }
       
      });
    },
  },
};
</script>


<style scoped>

@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

.main-bg {
  position: relative;
  background-image: url("../assets/background/card3.gif");
  min-height: 100vh;
  min-width: 100vw;
  background-size: cover;
  background-repeat: no-repeat;
}
.container {
  max-width: auto;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}
.character-list {
  display: flex;
  justify-content: center; 
  align-items: center;
  overflow-x: auto;
  margin-top: 100px;
}
.character-item {
  padding: 20px;
  border-radius: 8px;
  display: inline-block;
  margin-right: 20px; 
}
.character-image img {
  max-width: 300px;
  max-height: 300px;
  width: 100%;
}
.character-info {
  padding: 10px;
}
.character-item h2 {
  margin-bottom: 10px;
  margin-left: 10px;
}
.character-item p {
  margin: 0;
}


h2 {
  color: black;
  font-size: 30px;
}
.prev-btn,
.next-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 48px;
  color: #000;
}
.prev-btn {
  left: 10px;
}
.next-btn {
  right: 10px;
}
.card-enter-active,
.card-leave-active {
  transition: opacity 0.5s;
}
.card-enter,
.card-leave-to {
  opacity: 0;
}

.card-img:hover{
 transform: translateY(-20px);
}
</style>
