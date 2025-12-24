export function formatCurrency(amount: number, currency: string = "USD"): string {
  const locale = currency === "KES" ? "en-KE" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat("en-KE", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function getMonthName(date: Date): string {
  return new Intl.DateTimeFormat("en-KE", { month: "short" }).format(date);
}
