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
    path: "/",
    name: "home",
    component: () => import("../page/Home.vue"),
  },

  {
    path: "/signin",
    name: "signin",
    component: () => import("../page/SignIn.vue"),
  },

  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../page/Dashboard.vue'),
    meta: {
      layout: 'dashboard'
    }
  },

  ...pages.map((page) => ({
    path: `/${page.toLowerCase()}`,
    name: page.toLowerCase(),
    component: () => import(`../page/${page}.vue`),
  })),

  {
    path: "/:pathMatch(.*)*",
    redirect: "/notexit",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();

  if (to.path === "/dashboard" && userStore.role !== "admin") {
    next("/home");
    return;
  }

  next();
});

export default router;
