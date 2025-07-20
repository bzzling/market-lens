import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { cache } from "react";
import { User } from "@/models/User";

export const getUser = cache(async (): Promise<User | null> => {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return null;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, avatar_url")
      .eq("id", authUser.id)
      .single();

    return {
      id: authUser.id,
      email: authUser.email!,
      profile: profileData || undefined,
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
});

export const requireAuth = cache(async (): Promise<User> => {
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
});
