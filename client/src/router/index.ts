import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  {
    path: '/product/:id',
    name: 'product',
    component: () => import('../views/ProductView.vue')
  },
  {
    path: '/history',
    name: 'history',
    component: () => import('../views/HistoryView.vue')
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
