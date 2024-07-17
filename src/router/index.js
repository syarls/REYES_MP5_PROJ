
import { createRouter, createWebHistory } from 'vue-router'
import Main from '../views/main.vue'
// import App from '../App.vue'
import Cards from '../views/cards.vue'
import Play from '../views/play.vue'
import About from '../views/about.vue'
import Home from '../views/home.vue'
import Testing from '../views/dump.vue'

const routes = [
  { path: '', name: 'Home', component: Home },
  { path: '/main', name: 'Main', component: Main },
  { path: '/cards', name: 'Cards', component: Cards},
  { path: '/play', name: 'Play', component: Play},
  { path: '/about', name: 'About', component: About},
  { path: '/test', name: 'Testing', component: Testing}
  

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router