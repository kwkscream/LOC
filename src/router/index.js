import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import PlayerInfo from '@/views/PlayerInfo.vue'

const routes = [
	{path: '/', component: HomeView	},
	{path: '/player-info', component: PlayerInfo},
]

const router = createRouter	({
	history	: createWebHistory(),
	routes
});

export default router;