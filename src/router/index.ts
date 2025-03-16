import { createRouter, createWebHistory } from "vue-router";
import { supabase } from "@/composables/supabase";

const loginRoute = { name: "Login" };
const loggedInRoute = { name: "Home" };
const loginGuard = async (to: any, from: any, next: Function) => {
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    next();
  } else {
    next({ path: "/login" });
  }
};

const loggedInGuard = async (to: any, from: any, next: Function) => {
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    next(loggedInRoute);
  } else {
    next();
  }
};

const routes = [
  {
    path: "/",
    component: () => import("@/layouts/default/Default.vue"),
    children: [
      {
        path: "",
        name: "Home",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(/* webpackChunkName: "home" */ "@/views/Home.vue"),
        beforeEnter: loginGuard,
      },
      {
        path: "login",
        name: "Login",
        component: () => import("@/components/logIn.vue"),
        beforeEnter: loggedInGuard,
      },
      {
        path: "SignUpEmailNPass",
        name: "SignUpEmailNPass",
        component: () => import("@/components/formSignUp.vue"),
        beforeEnter: loggedInGuard,
      },
      {
        path: "SignInG",
        name: "SignInG",
        component: () => import("@/components/emailLogin.vue"),
        beforeEnter: loggedInGuard,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
