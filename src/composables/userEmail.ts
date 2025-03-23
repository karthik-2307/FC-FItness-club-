import { supabase } from "./supabase";

 const Email = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Error fetching user:", error);
    return;
  }
  return data.user?.email || null;
};
export const fetchUserEmail=await Email();
