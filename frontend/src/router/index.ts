import { createRouter, createWebHistory } from 'vue-router';

const pages = ['About', 'Book', 'Contact', 'shoppingCart', 'NotExit'];

const routes = [
    {
        path:   '/',
        name:   'home',
        component: () => import('../page/Home.vue'),
    },

    {
        path:   '/login',
        name:   'login',
        component: () => import('../page/Login.vue'),
    },

    ...pages.map((page) => ({
        path: `/${page.toLowerCase()}`,
        name: page.toLowerCase(),
        component: () => import(`../page/${page}.vue`),
    })),

    {
        path: '/:pathMatch(.*)*',
        redirect: '/notexit',
    }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
});



export default router;