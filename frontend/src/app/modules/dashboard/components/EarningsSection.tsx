import { useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@core/components/ui";
import { fetchEarnings, requestPayout } from "../services/earnings";

const ron = (v: number) => `${v.toLocaleString("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} RON`;

/**
 * Câștiguri: the seller's balance from paid orders after PiațăRo's fee, recent sales with their fee
 * and net, and a simulated payout (corpus decisions.md: no money moves in the demo).
 */
export function EarningsSection() {
  const queryClient = useQueryClient();
  const earnings = useQuery({ queryKey: ["me", "earnings"], queryFn: fetchEarnings });
  // One id per balance shown, so a double click or a retry is the same payout.
  const requestId = useRef<string>(crypto.randomUUID());
  const payout = useMutation({
    mutationFn: () => requestPayout(requestId.current),
    onSuccess: () => {
      requestId.current = crypto.randomUUID();
      void queryClient.invalidateQueries({ queryKey: ["me", "earnings"] });
    },
  });
  const e = earnings.data;
  if (!e) return null;
  const feePercent = (e.fee_rate * 100).toLocaleString("ro-RO");
  const lastPayout = e.payouts[0];

  return (
    <section className="space-y-5 rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="mb-1 text-lg font-bold text-on-surface">Câștiguri</h3>
          <p className="text-sm text-on-surface-variant">
            Din vânzări, după comisionul PiațăRo de {feePercent}%. Retragerile sunt simulate: nu se transferă bani.
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-on-surface">{ron(e.balance_ron)}</div>
          <div className="text-xs text-on-surface-variant">disponibil</div>
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <dt className="text-on-surface-variant">Vânzări</dt>
          <dd className="font-semibold">{ron(e.gross_ron)}</dd>
        </div>
        <div>
          <dt className="text-on-surface-variant">Comision</dt>
          <dd className="font-semibold">{ron(e.fees_ron)}</dd>
        </div>
        <div>
          <dt className="text-on-surface-variant">Retras</dt>
          <dd className="font-semibold">{ron(e.paid_out_ron)}</dd>
        </div>
      </dl>

      {e.sales.length > 0 && (
        <ul className="divide-y divide-outline-variant text-sm">
          {e.sales.slice(0, 5).map((s) => (
            <li key={s.order_id} className="flex justify-between gap-4 py-2">
              <span className="truncate">{s.title}</span>
              <span className="whitespace-nowrap text-on-surface-variant">
                {ron(s.amount_ron)} − {ron(s.fee_ron)} = <strong className="text-on-surface">{ron(s.net_ron)}</strong>
              </span>
            </li>
          ))}
        </ul>
      )}

      <Button onClick={() => payout.mutate()} loading={payout.isPending} disabled={e.balance_ron <= 0}>
        Retrage (simulat)
      </Button>
      {lastPayout && (
        <p className="text-xs text-on-surface-variant">
          Ultima retragere simulată: {ron(lastPayout.amount_ron)},{" "}
          {new Date(lastPayout.created_at.replace(" ", "T") + "Z").toLocaleDateString("ro-RO")}.
        </p>
      )}
    </section>
  );
}
