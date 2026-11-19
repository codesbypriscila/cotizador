"use client";

import { Download, Trash } from "lucide-react";
import { useActionState, useState, useTransition } from "react";
import { ConfirmButton } from "@/components/confirm-button";
import { FieldError, FieldLabel, invalid } from "@/components/form";
import { buttonClass, cx, inputClass } from "@/components/ui";
import { useMoney } from "@/components/money";
import { formatUSD } from "@/lib/money";
import { DEPOSIT_PCT } from "@/lib/totals";
import { addPayment, deleteInvoice, deletePayment } from "../../../actions";
import { PaymentRow } from "../invoice-parts";

const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Santo_Domingo" });

export function PaymentForm({ invoiceId, pending, total }: { invoiceId: string; pending: number; total: number }) {
  const money = useMoney();
  const [state, action, isPending] = useActionState(addPayment.bind(null, invoiceId), undefined);
  // Controlled fields: a failed save keeps what was typed; a good one clears the amount.
  const [amount, setAmount] = useState("");
  const [paidAt, setPaidAt] = useState(today());
  const [method, setMethod] = useState("Transferencia");
  const [note, setNote] = useState("");
  const [lastOk, setLastOk] = useState<number | null>(null);
  const okAt = state && "ok" in state ? state.ok : null;
  if (okAt && okAt !== lastOk) {
    setLastOk(okAt);
    setAmount("");
    setNote("");
  }
  const errors: Partial<Record<"amount" | "paidAt" | "method" | "note", string>> =
    (state && "fieldErrors" in state && state.fieldErrors) || {};
  const formError = state && "error" in state ? state.error : undefined;
  const pendingText = formatUSD(pending).replace("US$", "");
  // 30 % deposit before starting the work (never more than what is still owed).
  const depositText = formatUSD(Math.min(pending, Math.round((total * DEPOSIT_PCT) / 100))).replace("US$", "");

  return (
    <form id="abono" action={action} noValidate className="card flex scroll-mt-6 flex-col gap-3 p-[18px]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[17px] font-bold">Registrar abono</h2>
        <span className="text-xs text-muted">Pendiente: {money(pending)}</span>
      </div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="abono-monto" required>
            Monto (US$)
          </FieldLabel>
          <input
            id="abono-monto"
            name="amount"
            inputMode="decimal"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))}
            placeholder={pendingText}
            aria-invalid={Boolean(errors.amount)}
            aria-describedby={errors.amount ? "abono-monto-error" : undefined}
            className={cx(inputClass, invalid(errors.amount))}
          />
          <FieldError id="abono-monto-error">{errors.amount}</FieldError>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <button
              type="button"
              onClick={() => {
                setAmount(depositText);
                setNote(`Anticipo del ${DEPOSIT_PCT}%`);
              }}
              className="w-fit text-xs font-semibold text-accent-ink"
            >
              Anticipo {DEPOSIT_PCT}%
            </button>
            <button type="button" onClick={() => setAmount(pendingText)} className="w-fit text-xs font-semibold text-accent-ink">
              Pagó todo lo pendiente
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="abono-fecha" required>
            Fecha
          </FieldLabel>
          <input
            id="abono-fecha"
            name="paidAt"
            type="date"
            required
            max={today()}
            value={paidAt}
            onChange={(e) => setPaidAt(e.target.value)}
            aria-invalid={Boolean(errors.paidAt)}
            className={cx(inputClass, invalid(errors.paidAt))}
          />
          <FieldError id="abono-fecha-error">{errors.paidAt}</FieldError>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="abono-metodo" required>
          Método
        </FieldLabel>
        <input
          id="abono-metodo"
          name="method"
          required
          maxLength={60}
          list="metodos"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          aria-invalid={Boolean(errors.method)}
          className={cx(inputClass, invalid(errors.method))}
        />
        <datalist id="metodos">
          <option value="Transferencia BHD" />
          <option value="Transferencia Popular" />
          <option value="Transferencia Banreservas" />
          <option value="Efectivo" />
          <option value="Tarjeta" />
        </datalist>
        <FieldError id="abono-metodo-error">{errors.method}</FieldError>
      </div>
      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="abono-concepto">Concepto</FieldLabel>
        <input
          id="abono-concepto"
          name="note"
          maxLength={200}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ej.: Anticipo 50%"
          className={inputClass}
        />
      </div>
      {formError && (
        <p role="alert" className="text-sm font-medium text-[#C53030]">
          {formError}
        </p>
      )}
      <button disabled={isPending} className={buttonClass("dark", "w-full")}>
        {isPending ? "Guardando…" : "Registrar abono"}
      </button>
    </form>
  );
}

export function PaymentList({
  payments,
}: {
  payments: { id: string; amount: number; paidAt: Date; method: string; note: string }[];
}) {
  const [pending, start] = useTransition();
  const money = useMoney();
  if (payments.length === 0) return <p className="text-sm text-muted">Todavía no hay abonos.</p>;
  return payments.map((p) => (
    <div key={p.id} className="group flex items-center gap-2" style={{ opacity: pending ? 0.6 : 1 }}>
      <div className="min-w-0 flex-1">
        <PaymentRow {...p} />
      </div>
      <ConfirmButton
        ariaLabel="Borrar abono"
        question={`¿Borrar ${money(p.amount)}?`}
        onConfirm={() => start(() => deletePayment(p.id))}
        className="grid size-8 place-items-center rounded-full text-[#B5B9C0] hover:bg-bg hover:text-[#C53030]"
      >
        <Trash size={16} />
      </ConfirmButton>
    </div>
  ));
}

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className={buttonClass("outline", "w-full")}>
      <Download size={18} /> Descargar PDF
    </button>
  );
}

export function DeleteInvoiceButton({ id }: { id: string }) {
  return (
    <ConfirmButton
      question="¿Borrar la factura y sus abonos?"
      onConfirm={() => deleteInvoice(id)}
      className="py-2 text-sm font-medium text-[#C53030] hover:underline"
    >
      Borrar factura
    </ConfirmButton>
  );
}
