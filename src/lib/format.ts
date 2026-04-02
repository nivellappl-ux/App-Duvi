export const formatCurrencyAOA = (value: number) =>
  new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    minimumFractionDigits: 2,
  }).format(value);

export const formatDateTimeAO = (value: string | Date) =>
  new Intl.DateTimeFormat("pt-AO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(typeof value === "string" ? new Date(value) : value);

export const formatDateAO = (value: string | Date) =>
  new Intl.DateTimeFormat("pt-AO", {
    dateStyle: "medium",
  }).format(typeof value === "string" ? new Date(value) : value);