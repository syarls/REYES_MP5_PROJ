<template>
    <div class="background">
        
        <div class="information">
            <h1>About UNO</h1>
            <p>The game was originally developed in 1971 by Merle Robbins in Reading, Ohio, a suburb of Cincinnati. When his family and friends began to play more and more, he spent $8,000 to have 5,000 copies of the game made. He sold it from his barbershop at first, and local businesses began to sell it as well. Robbins later sold the rights to Uno to a group of friends headed by Robert Tezak, a funeral parlor owner in Joliet, Illinois, for $50,000 plus royalties of 10 cents per game. Tezak formed International Games, Inc., to market Uno, with offices behind his funeral parlor. The games were produced by Lewis Saltzman of Saltzman Printers in Maywood, Illinois.
In 1992, International Games became part of the Mattel family of companies.</p>
          <p>The aim of the game is to be the first player to score 500 points, achieved (usually over several rounds of play) by being the first to play all of one's own cards and scoring points for the cards still held by the other players.

The 2018 edition of the game consists of 112 cards: 25 in each of four color suits (red, yellow, green, blue), each suit consisting of one zero, two each of 1 through 9, and two each of the action cards "Skip", "Draw Two", and "Reverse". The deck also contains four "Wild" cards, four "Wild Draw Four", one "Wild Shuffle Hands" and three "Wild Customizable". Sets manufactured prior to 2018 do not contain these last two types of Wild cards, for a total of 108 cards in the deck.</p> 
        </div>
    </div>
</template>

<style scoped>
.background {
    background-image: url('../assets/background/about.png');
    position: relative;
    min-height: 100vh;
    min-width: 100vw;
    background-repeat: no-repeat;
    background-size: cover;
}

.information {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: white; 
    max-width: 80%; 
    padding: 20px; 
    background-color: rgba(0, 0, 0, 0.6);
    border-radius: 10px;
    font-size: 20px;
    
}

.information h1 {
    margin-bottom: 20px; 
}

p{
    text-align: justify;
}
</style>
