import { createRouter, createWebHistory } from "vue-router";
import { supabase } from "@/composables/supabase";
import path from "path";

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
          import(/* webpackChunkName: "home" */ "@/views/baseLayOut.vue"),
        beforeEnter: loginGuard,
      },
      {
        path: "login",
        name: "Login",
        component: () => import("@/components/Authentication/logIn.vue"),
        beforeEnter: loggedInGuard,
      },
      {
        path: "SignUpEmailNPass",
        name: "SignUpEmailNPass",
        component: () => import("@/components/Authentication/formSignup.vue"),
        beforeEnter: loggedInGuard,
      },
      {
        path: "SignInG",
        name: "SignInG",
        component: () => import("@/components/Authentication/emailLogin.vue"),
        beforeEnter: loggedInGuard,
      },
      {
        path: "CheckIn",
        name: "CheckIn",
        component: () => import("@/components/WorkOuts/workoutCheckIn.vue"),
        beforeEnter: loginGuard,
      },
      {
        path: "heatmap",
        name: "heatmap",
        component: () => import("@/components/WorkOuts/Heatmap.vue"),
        beforeEnter: loginGuard,
      },
      {
        path: "auth/callback",
        name: "AuthCallback",
        beforeEnter(to, from, next) {
          next('https://fc2307.netlify.app/'); // replace with actual route or external URL
        }
      },
      {
        path:'newuser',
        name:'newuser',
        component:()=>import('@/components/Authentication/newUserName.vue')
      },
      {
        path:'myWorkouts',
        name:'myWorkouts',
        component:()=>import('@/components/WorkOuts/myWorkouts.vue')
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
