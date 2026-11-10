import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "../store/useUserStore";

const pages = [
  "About",
  "Book",
  "Contact",
  "shoppingCart",
  "SignUp",
  "Profile",
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

        {
          path: 'book/:id',
          name: 'book-detail',
          component: () =>
            import('../views/Book_store/BookDetail.vue'),
        },

        ...pages.map((page) => ({
          path: page.toLowerCase(),
          name: page.toLowerCase(),
          component: () =>
            import(`../views/Book_store/${page}.vue`),
        })),
        {
          path: 'orders',
          name: 'orders',
          component: () =>
            import('../views/Book_store/MyOrder.vue'),
        },
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
      path: '/notexit',
      name: 'notexit',
      component: () => import('../views/NotExit.vue')
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

router.beforeEach((to) => {
  const userStore = useUserStore();

  if (to.path === "/signin" && userStore.role === "admin") {
    return "/dashboard";
  }

  if (to.path === "/dashboard" && userStore.role !== "admin") {
    return "/";
  }

  if (["/profile", "/orders"].includes(to.path) && !userStore.userId) {
    return { path: "/signin", query: { redirect: to.fullPath } };
  }
});

export default router;
