import { ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL, type OrderStatus, type PaymentStatus } from "@/lib/constants";
import { cn } from "@/lib/ui";

const ORDER_TONE: Record<OrderStatus, string> = {
  PENDIENTE: "bg-champagne-3 text-[#7a5b1f]",
  PAGADO: "bg-success/12 text-success",
  PREPARANDO: "bg-emerald/10 text-emerald",
  ENVIADO: "bg-[#2c5590]/10 text-[#2c5590]",
  ENTREGADO: "bg-emerald text-pearl",
  CANCELADO: "bg-stone text-muted",
};

const PAYMENT_TONE: Record<PaymentStatus, string> = {
  PENDIENTE: "bg-champagne-3 text-[#7a5b1f]",
  PAGADO: "bg-success/12 text-success",
  FALLIDO: "bg-danger/10 text-danger",
  REEMBOLSADO: "bg-stone text-muted",
};

const base = "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium";

export function OrderStatusBadge({ status }: { status: string }) {
  const s = status as OrderStatus;
  return (
    <span className={cn(base, ORDER_TONE[s] ?? "bg-stone text-muted")}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {ORDER_STATUS_LABEL[s] ?? status}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: string }) {
  const s = status as PaymentStatus;
  return <span className={cn(base, PAYMENT_TONE[s] ?? "bg-stone text-muted")}>{PAYMENT_STATUS_LABEL[s] ?? status}</span>;
}
