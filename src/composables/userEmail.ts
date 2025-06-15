import { supabase } from "./supabase";

const Email = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }
  return data.user?.email || null;
};

export const fetchUserEmail = async () => {
  return await Email();
};
