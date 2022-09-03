import { createRouter, createWebHistory } from "vue-router";
import { auth } from "@/firebase";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/Home.vue"),
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/Login.vue"),
    },
    {
      path: "/orders",
      name: "orders",
      component: () => import("../views/Orders.vue"),
    },
    {
      path: "/admin",
      name: "admin",
      component: () => import("../views/Admin.vue"),
    },
  ],
});

router.beforeEach((to, from, next) => {
  const user = auth.currentUser;
  const admin = user?.getIdTokenResult().then((idTokenResult) => {
    return idTokenResult.claims.admin;
  });

  if (to.name === "admin" && !admin) {
    next({ name: "home" });
  }
  next();
});

export default router;
