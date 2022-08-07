import { createRouter, createWebHistory } from "vue-router";
import { auth } from "@/firebase";
import UserMenuVue from "@/components/UserMenu.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Home",
      component: () => import("../views/Home.vue"),
    },
    {
      path: "/login",
      name: "Login",
      component: () => import("../views/Login.vue"),
    },
    {
      path: "/orders",
      name: "Orders",
      component: () => import("../views/Orders.vue"),
      beforeEnter: requireAuth,
    },
    {
      path: "/admin",
      name: "Admin",
      component: () => import("../views/Admin.vue"),
      beforeEnter: requireAdmin,
    },
  ],
});

function requireAdmin(to: any, from: any, next: any) {
  auth.onAuthStateChanged((user) => {
    if (user) {
      user?.getIdTokenResult().then((idTokenResult) => {
        if (idTokenResult.claims.admin) {
          next();
        }
      });
    } else {
      next("/login");
    }
  });
}

function requireAuth(to: any, from: any, next: any) {
  auth.onAuthStateChanged((user) => {
    if (user) {
      next();
    } else {
      next("/login");
    }
  });
}

export default router;
