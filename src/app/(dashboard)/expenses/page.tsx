import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ExpensesClient } from "@/components/expenses/ExpensesClient";

export default async function ExpensesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch expenses
  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Expenses</h1>
        <p className="text-muted-foreground">
          Track and manage your business expenses
        </p>
      </div>

      <ExpensesClient expenses={expenses || []} />
    </div>
  );
}
