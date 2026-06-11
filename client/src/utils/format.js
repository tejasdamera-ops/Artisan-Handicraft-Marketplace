export const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);

export const orderStatusClass = (status) => {
  const map = {
    Placed: "bg-blue-50 text-blue-700",
    Packed: "bg-amber-50 text-amber-700",
    Shipped: "bg-purple-50 text-purple-700",
    Delivered: "bg-emerald-50 text-emerald-700",
    Cancelled: "bg-red-50 text-red-700"
  };
  return map[status] || "bg-stone-100 text-stone-700";
};
