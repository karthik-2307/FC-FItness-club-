import { supabase } from "./supabase";

export const fetchUserEmail = async () => {
    
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Error fetching user:", error);
      return;
    }
return data.user?.email || null;
  };