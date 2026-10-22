import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../types/useUserStore'






const pages = ['About', 'Book', 'Contact', 'Cart'];

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
]

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const userId = useUserStore().userId

  console.log(userId)

  return true
})


export default router;