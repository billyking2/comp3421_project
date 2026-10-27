import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "../store/useUserStore";

const pages = [
  "About",
  "Book",
  "Contact",
  "shoppingCart",
  "NotExit",
  "SignUp",
];

const routes = [
 {
      path: '/',
      component: () =>
        import('../layout/DefaultLayout.vue'),

      children: [
        {
          path: '',
          name: 'home',
          component: () =>
            import('../views/Book_store/Home.vue'),
        },

        {
          path: 'signin',
          name: 'signin',
          component: () =>
            import('../views/Book_store/SignIn.vue'),
        },

        ...pages.map((page) => ({
          path: page.toLowerCase(),
          name: page.toLowerCase(),
          component: () =>
            import(`../views/Book_store/${page}.vue`),
        })),
      ],
    },

    {
      path: '/dashboard',
      component: () =>
        import('../layout/DashboardLayout.vue'),

      children: [
        {
          path: '',
          name: 'dashboard',
          component: () =>
            import('../views/Dashboard/Dashboard.vue'),
        },
      ],
    },

    {
      path: '/:pathMatch(.*)*',
      redirect: '/notexit',
    },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();

  if (to.path === "/signin" && userStore.role === "admin") {
    next("/dashboard");
    return;
  }

  if (to.path === "/dashboard" && userStore.role !== "admin") {
    next("/");
    return;
  }

  next();
});

export default router;
