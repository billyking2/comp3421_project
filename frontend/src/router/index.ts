import { createRouter, createWebHistory } from 'vue-router';




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

    {
        path :   '/about',
        name :   'about',
        component: () => import('../page/About.vue'),
    },

    {
        path :   '/book',
        name :   'book',
        component: () => import('../page/Book.vue'),
    },

    {
        path :   '/contact',
        name :   'contact',
        component: () => import('../page/Contact.vue'),
    },

    {
        path :   '/cart',
        name :   'cart',
        component: () => import('../page/Cart.vue'),
    }

]


const router = createRouter({
  history: createWebHistory(),
  routes,
});


export default router;