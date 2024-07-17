<template>

  <div class="background" @click="toggleMenu">
    <div class="message">
      Click anywhere to Start
    </div>
  </div>
  
</template>

<script>
import { RouterLink } from 'vue-router';


export default {

methods: {
  toggleMenu() {
      this.$router.push('/main');
    },
  
},
components: {
  RouterLink,
},

};
</script>


<style scoped>

body {
  margin: 0;
  padding:0;
  border:0;
}

.background {
  position: relative;
  background-image: url('../assets/background/bg-welcome.jpeg');
  min-height: 100vh;
  min-width: 100vw;
  background-size: cover;
  background-position: center;
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

</style>
