"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
  Plus,
  CalendarIcon,
  Loader2,
  Trash2,
  Receipt,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Filter,
  Upload,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/format";
import { createClient } from "@/lib/supabase/client";
import type { Expense } from "@/lib/supabase/database.types";

const expenseSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  currency: z.string().default("KES"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  date: z.date({ required_error: "Date is required" }),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface ExpensesClientProps {
  expenses: Expense[];
}

const EXPENSE_CATEGORIES = [
  "Office Supplies",
  "Software & Tools",
  "Marketing",
  "Travel",
  "Utilities",
  "Rent",
  "Salaries",
  "Equipment",
  "Professional Services",
  "Insurance",
  "Taxes",
  "Other",
];

const categoryColors: Record<string, string> = {
  "Office Supplies": "bg-blue-100 text-blue-800",
  "Software & Tools": "bg-purple-100 text-purple-800",
  Marketing: "bg-pink-100 text-pink-800",
  Travel: "bg-green-100 text-green-800",
  Utilities: "bg-yellow-100 text-yellow-800",
  Rent: "bg-orange-100 text-orange-800",
  Salaries: "bg-red-100 text-red-800",
  Equipment: "bg-indigo-100 text-indigo-800",
  "Professional Services": "bg-teal-100 text-teal-800",
  Insurance: "bg-cyan-100 text-cyan-800",
  Taxes: "bg-gray-100 text-gray-800",
  Other: "bg-slate-100 text-slate-800",
};

export function ExpensesClient({ expenses }: ExpensesClientProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: 0,
      currency: "KES",
      category: "",
      description: "",
      date: new Date(),
    },
  });

  const filteredExpenses = useMemo(() => {
    if (categoryFilter === "all") return expenses;
    return expenses.filter((exp) => exp.category === categoryFilter);
  }, [expenses, categoryFilter]);

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const thisMonthExpenses = expenses
    .filter((exp) => {
      const expDate = new Date(exp.date);
      const now = new Date();
      return (
        expDate.getMonth() === now.getMonth() &&
        expDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, exp) => sum + exp.amount, 0);

  const expensesByCategory = useMemo(() => {
    const byCategory: Record<string, number> = {};
    expenses.forEach((exp) => {
      byCategory[exp.category] = (byCategory[exp.category] || 0) + exp.amount;
    });
    return Object.entries(byCategory)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  async function onSubmit(data: ExpenseFormValues) {
    setIsLoading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsLoading(false);
      return;
    }

    await supabase.from("expenses").insert({
      user_id: user.id,
      amount: data.amount,
      currency: data.currency,
      category: data.category,
      description: data.description || null,
      date: format(data.date, "yyyy-MM-dd"),
    });

    setIsLoading(false);
    setIsDialogOpen(false);
    form.reset();
    router.refresh();
  }

  async function handleDelete() {
    if (!deleteId) return;

    const supabase = createClient();
    await supabase.from("expenses").delete().eq("id", deleteId);

    setDeleteId(null);
    router.refresh();
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {expenses.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(thisMonthExpenses)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(), "MMMM yyyy")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Top Category
            </CardTitle>
            <Receipt className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {expensesByCategory[0]?.category || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {expensesByCategory[0]
                ? formatCurrency(expensesByCategory[0].amount)
                : "No expenses yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      {expensesByCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expensesByCategory.slice(0, 5).map((item) => (
                <div key={item.category} className="flex items-center gap-3">
                  <Badge className={categoryColors[item.category] || "bg-gray-100"}>
                    {item.category}
                  </Badge>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{
                        width: `${(item.amount / totalExpenses) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-24 text-right">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expenses List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Expenses</CardTitle>
          <div className="flex items-center gap-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Expense</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount *</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" min="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="KES">KES</SelectItem>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="EUR">EUR</SelectItem>
                                <SelectItem value="GBP">GBP</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {EXPENSE_CATEGORIES.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? format(field.value, "PPP") : "Pick a date"}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date > new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="What was this expense for?"
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Expense
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No expenses recorded yet.</p>
              <p className="text-sm">Add your first expense to start tracking.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      {format(new Date(expense.date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge className={categoryColors[expense.category] || "bg-gray-100"}>
                        {expense.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {expense.description || "-"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(expense.amount, expense.currency)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600"
                        onClick={() => setDeleteId(expense.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
