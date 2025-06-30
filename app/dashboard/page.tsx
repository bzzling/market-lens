import { createClient } from "@/lib/utils/supabase/server";
import DashboardCards from "@/components/ui/dashboard/cards";
import Greeting from "@/components/ui/dashboard/greeting";
import PortfolioChart from "@/components/ui/dashboard/portfolio-chart";
import PortfolioHoldings from "@/components/ui/dashboard/portfolio-holdings";

async function getUser() {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) return "Unknown Infiltrator";

    // Get user info from users table
    const { data: userData, error } = await supabase
      .from("users")
      .select("display_name, first_name, last_name")
      .eq("auth_user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return "Unknown Infiltrator";
    }

    const firstName = userData?.first_name || "";
    const lastName = userData?.last_name || "";
    return firstName && lastName ? `${firstName} ${lastName}` : firstName || "Unknown Infiltrator";
  } catch (error) {
    console.error("Error fetching user:", error);
    return "Unknown Infiltrator";
  }
}

export default async function Page() {
  const name = await getUser();

  return (
    <main className="flex-1">
      <div className="flex items-center justify-between space-y-2">
        <Greeting name={name} />
      </div>
      <div className="space-y-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4 grid grid-cols-1 gap-4">
            <DashboardCards />
          </div>
          <div className="lg:col-span-8">
            <PortfolioChart />
          </div>
        </div>
        <div className="grid gap-4">
          <PortfolioHoldings />
        </div>
      </div>
    </main>
  );
}
