import { ref, computed } from "vue";
import type { Ref } from "vue";
import { defineStore } from "pinia";
import { supabase } from "@/composables/supabase";
import router from "@/router";

import type { UserSession } from "@/types/userType";

export const useUserStore = defineStore("user", () => {
  const session: Ref<UserSession | null> = ref(null);

  const login = async (email: string, callback?: Function): Promise<void> => {
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      if (typeof callback === "function") callback();
    } catch (err: any) {
      console.error("Login error:", err.message);
      throw new Error("Login failed");
    }
  };
const loginWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + "/auth/callback",
    },
  });

  if (error) {
    console.error("Google Login error:", error.message);
    return error.message;
  }

  return data;
};

  const emailAndPasswordLogin = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return error.message; // Return error message instead of throwing

      setUserSession(data.user);
      return true; // No error
    } catch (err: any) {
      console.error("Login error:", err.message);
      return false;
    }
  };

  const emailAndPasswordSignUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) throw error;

      if (data) {
        await emailAndPasswordLogin(email, password);
      }
    } catch (err: any) {
      console.error("Signup error:", err.message);
      throw new Error("SignUp failed");
    }
  };

  const logout = async (callback?: Function): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      session.value = null; // Clear session on logout
      router.push("/login");
      if (typeof callback === "function") callback();
    } catch (err: any) {
      console.error("Logout error:", err.message);
      throw new Error("Logout failed");
    }
  };

  const insertProfile = async (
    session: UserSession | any,
  ): Promise<boolean> => {
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: session.user.id,
        email_address: session.user.email,
        updated_at: new Date(),
      });

      if (error) throw error;

      return true;
    } catch (err: any) {
      console.error(err.message);
      return false;
    }
  };

  const setUserSession = (data: any): void => {
    session.value = data;
  };

  const userIsLoggedIn = computed(() => {
    if (session.value?.expires_at) {
      const expiresAt = new Date(0).setUTCSeconds(session.value.expires_at);
      return Date.now() < expiresAt;
    }
    return false;
  });

  return {
    session,
    login,
    emailAndPasswordLogin,
    emailAndPasswordSignUp,
    logout,
    setUserSession,
    userIsLoggedIn,
    insertProfile,
    loginWithGoogle,
  };
});
