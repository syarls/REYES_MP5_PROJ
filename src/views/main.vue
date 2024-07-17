<template>
  <div :class="mainBgClass">
    <div class="container">
      <!-- <RouterLink to="/play" class="router" @click="startGameInstance">
        <div class="card red" @mouseover="changeBackgroundOne()" @mouseleave="defaultBackground()">
          <h1>Play</h1>
          <p>Easy to learn, impossible to master, Uno is the perfect game for players of all ages. In minutes, you'll be discarding, drawing, and yelling "UNO!" like a seasoned pro.</p>
        </div>
      </RouterLink> -->
      <div class="router" @click="startGameInstance">
        <div class="card red" @mouseover="changeBackgroundOne()" @mouseleave="defaultBackground()">
          <h1>Play</h1>
          <p>Easy to learn, impossible to master, Uno is the perfect game for players of all ages. In minutes, you'll be discarding, drawing, and yelling "UNO!" like a seasoned pro.</p>
        </div>
      </div>
      <RouterLink to="/cards" class="router">
        <div class="card blue" @mouseover="changeBackgroundTwo()" @mouseleave="defaultBackground()">
          <h1>Cards</h1>
          <p>They're there to guide you, test your skills, and ultimately, celebrate your victory!</p>
        </div>
      </RouterLink>
      <RouterLink to="/about" class="router">
        <div class="card green"  @mouseover="changeBackgroundThree()" @mouseleave="defaultBackground()">
          <h1>About</h1>
          <p>Ambient lighting adapts to the current color in play, immersing you in the action.</p>
        </div>
      </RouterLink>
    </div>  
  </div>
</template>

<script>
import { RouterLink } from 'vue-router';
import io from 'socket.io-client';
import bgmusic from '../assets/audio/waterfall.mp3';
import sweetNotif from 'sweetalert2';
import randomCatGif from '../assets/images/random-cat6.gif';
import axios from 'axios';

export default {
  data() {
    return {
      isConnected: false, 
      socket:  null,
      mainBgClass: "main-bg",
      connectedUsers: 0,
      sessionID: null 
    };
  },
  methods: {
    changeBackgroundOne() {
      setTimeout(() => {
        this.mainBgClass = "bg-1";
      }, 100); 
    },
    changeBackgroundTwo() {
      setTimeout(() => {
        this.mainBgClass = "bg-2";
      }, 100); 
    },
    changeBackgroundThree() {
      setTimeout(() => {
        this.mainBgClass = "bg-3";
      }, 100); 
    },
    defaultBackground() {
      setTimeout(() => {
        this.mainBgClass = "main-bg"; 
      }, 100); 
    },
    startGameInstance() {
  this.socket = io('ws://localhost:5174');

  this.socket.on('connect', () => {
    console.log('Connected to WebSocket server!');
    this.isConnected = true;
  });

  this.socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket server.');
    this.isConnected = false;
  });

  // Listen for 'connected-users' event
  this.socket.on('connected-users', (count) => {
    console.log('Updated connected users count:', count);
    this.connectedUsers = count;
   if (this.connectedUsers < 4) {
      sweetNotif.fire({
        imageUrl: `${randomCatGif}`,
        title: "Waiting for other players",
        text: `${this.connectedUsers} player/s are currently connected`,
        allowOutsideClick: false, 
        showCancelButton: true,
        showConfirmButton: false,
        cancelButtonColor: '#f44336',
      });
    } else {
      sweetNotif.close();
      console.log("Emit 'redirect-to-play' event to the server to execute for all players");
      this.socket.emit('redirect-to-play');
    }
  });

  // Listen for 'redirect-success' event only once
  this.socket.once('redirect-success', () => {
    console.log("'Received redirect-success, so it should now redirect to /play for ALL PLAYERS not one");
    this.$router.push('/play');
  });
},

    startWebSocket() {
      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server!');
        this.isConnected = true;
        console.log('Socket:', this.socket);
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server.');
        this.isConnected = false;
      });

       this.socket.on('session_id', (sessionID) => {
        this.sessionID = sessionID;
      });
    }
  },
  components: {
    RouterLink,
  },
  mounted() {
    axios.get('http://localhost:5174/connected-users')
      .then(response => {
        this.connectedUsers = response.data.connectedUsers;
      })
      .catch(error => {
        console.log('Error fetching connected users:', error);
      });

    this.backgroundMusic = new Audio(bgmusic);
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = 0.02;
    this.backgroundMusic.play();
  },
  beforeUnmount() {
    this.backgroundMusic.pause();
  },
};
</script>


<style scoped>

body {
  margin: 0;
  padding:0;
  border:0;
}


.main-bg{
  position: relative;
  background-image:url("../assets/background/bg-main.gif");
  min-height: 100vh;
  min-width: 100vw;
  background-size: cover;
  background-position: center;
  transition: opacity 0.5s ease;
}

.bg-1{
  position: relative;
  background-image:url("../assets/background/backgroundPlay.gif");
  min-height: 100vh;
  min-width: 100vw;
  background-size: cover;
  background-position: center;
  transition: opacity 0.5s ease;
}

.bg-2{
  position: relative;
  background-image:url("../assets/background/card3.gif");
  min-height: 100vh;
  min-width: 100vw;
  background-size: cover;
  background-position: center;
  transition: opacity 0.5s ease;
}

.bg-3{
  background-image: url('../assets/background/about.png');
    position: relative;
    min-height: 100vh;
    min-width: 100vw;
    background-repeat: no-repeat;
    background-size: cover;

}

.message {
  position: absolute;
  bottom: 40px; 
  left: 50%;
  transform: translateX(-50%);
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.5); 
  color: white;
  border-radius: 5px;
  cursor: pointer;
  animation: fadeInOut 3s infinite;
  opacity: 0;
  font-weight: 600; 
  font-size: x-large; 
}

@keyframes fadeInOut {
  0%, 100% { 
    opacity: 0; 
}
  50% { 
    opacity: 1; 
}
}

.container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 100vh; 
}

.card {
  height: 300px;
  width: 300px; 
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin: 20px; 
  color: white;
  text-align: center;
  
}

.red {
  background-color: red; 
}

.card.red:hover ~ .main-bg {
    background-image: url('../assets/background/backgroundPlay.gif'); 
}

.blue {
  background-color: #448AFF;
}

.green {
  background-color: #4CAF50;
}

h1{
  font-size:48px;
}

p{
  font-size: 24px;
}

.router{
    text-decoration: none;
}
.router:hover{
  margin-top: -30px;
}

.profile {
    position: absolute;
    width: 75px;
    height: 75px;
    border-radius: 50px; 
    background-color: white; 
}



</style>
