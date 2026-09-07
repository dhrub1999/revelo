"use client";

import { useMemo, useState, useTransition } from "react";
import { clsx } from "clsx";
import { X } from "@phosphor-icons/react/dist/ssr/X";
import {
  publishCertified,
  saveCertificationDraft,
  sendCertificationToSeller,
  type CertificationInput,
} from "@/lib/admin/actions";
import { computeCertifiedPayout } from "@/lib/admin/pricing";
import { formatPrice } from "@/lib/format";
import type { BikeRow, CertificationRow } from "@/lib/admin/queries";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const STAGES = [
  { value: "in_workshop", label: "In workshop" },
  { value: "photographed", label: "Photographed" },
  { value: "live", label: "Live" },
  { value: "reserved", label: "Reserved" },
  { value: "delivered", label: "Delivered" },
  { value: "paid_out", label: "Seller paid" },
];

export function ConsignWorksheet({
  bike,
  certification,
  sellerName,
}: {
  bike: BikeRow;
  certification: CertificationRow;
  sellerName: string;
}) {
  const [pending, startTransition] = useTransition();
  const [pointsPassed, setPointsPassed] = useState(certification.points_passed);
  const [pointsTotal, setPointsTotal] = useState(certification.points_total);
  const [findings, setFindings] = useState<string[]>(
    certification.findings.map((f) => f.text),
  );
  const [repairCost, setRepairCost] = useState(certification.repair_cost);
  const [sellerApproved, setSellerApproved] = useState(certification.seller_approved);
  const [listPrice, setListPrice] = useState(certification.list_price);

  const payout = useMemo(
    () => computeCertifiedPayout({ listPrice, repairCost, sellerApproved }),
    [listPrice, repairCost, sellerApproved],
  );

  function buildInput(): CertificationInput {
    return {
      certificationId: certification.id,
      bikeId: bike.id,
      pointsPassed,
      pointsTotal,
      findings: findings.filter((f) => f.trim()),
      repairCost,
      sellerApproved,
      listPrice,
    };
  }

  const stageIndex = STAGES.findIndex((s) => s.value === bike.status);

  return (
    <div className="max-w-2xl">
      <p className="text-xs text-muted">Ref #{bike.id.slice(0, 8).toUpperCase()}</p>
      <h1 className="text-h4 font-semibold tracking-tight">
        Consign · {bike.brand} {bike.model}
      </h1>
      <p className="mt-1 text-sm text-muted">{sellerName}</p>

      {/* Inspection */}
      <div className="mt-5 rounded-card border border-line bg-surface p-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">Inspection</p>
        <div className="mt-3 flex items-center gap-2">
          <Input
            type="number"
            value={pointsPassed}
            onChange={(e) => setPointsPassed(Number(e.target.value))}
            className="h-9 w-20"
          />
          <span className="text-muted">/</span>
          <Input
            type="number"
            value={pointsTotal}
            onChange={(e) => setPointsTotal(Number(e.target.value))}
            className="h-9 w-20"
          />
          <span className="font-heading text-h5 font-semibold">
            passed {pointsPassed} / {pointsTotal}
          </span>
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium">Findings</p>
          <div className="mt-2 flex flex-col gap-2">
            {findings.map((finding, index) => (
              <div key={index} className="flex items-center gap-2">
                <Textarea
                  value={finding}
                  onChange={(e) =>
                    setFindings((prev) =>
                      prev.map((f, i) => (i === index ? e.target.value : f)),
                    )
                  }
                  rows={1}
                  className="min-h-9 flex-1 resize-none py-2"
                />
                <button
                  type="button"
                  onClick={() => setFindings((prev) => prev.filter((_, i) => i !== index))}
                  className="text-muted hover:text-danger"
                  aria-label="Remove finding"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFindings((prev) => [...prev, ""])}
              className="h-8 w-fit rounded-control border-line"
            >
              + Add finding
            </Button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-control border border-line p-3">
          <div>
            <Label htmlFor="repair-cost" className="text-sm font-medium">
              Repairs ₹
            </Label>
            <Input
              id="repair-cost"
              type="number"
              value={repairCost}
              onChange={(e) => setRepairCost(Number(e.target.value))}
              className="mt-1 h-9 w-32"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="seller-approved" className="text-sm">
              Seller approved
            </Label>
            <Switch
              id="seller-approved"
              checked={sellerApproved}
              onCheckedChange={setSellerApproved}
            />
          </div>
        </div>
        {!sellerApproved && repairCost > 0 && (
          <p className="mt-2 text-xs text-danger">
            Repairs cannot proceed, and won&apos;t be deducted from payout, until the seller
            approves.
          </p>
        )}
      </div>

      {/* Battery */}
      {bike.battery_health && (
        <div className="mt-4 rounded-card border border-line bg-surface p-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted">
            Battery — load tested, not claimed
          </p>
          <p className="mt-2 font-heading text-h3 font-semibold text-battery">
            {bike.battery_health.percent}%
          </p>
        </div>
      )}

      {/* Comps */}
      <div className="mt-4 rounded-card border border-line bg-surface p-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">
          Comps · {certification.comps_sample_size} sales, {certification.comps_days} days
        </p>
        <p className="mt-2 font-heading text-h4 font-semibold">
          {formatPrice(certification.comps_range_low)} – {formatPrice(certification.comps_range_high)}
        </p>
        {bike.battery_health && bike.battery_health.percent > 90 && (
          <p className="mt-1 text-xs text-muted">battery &gt;90% adds ~₹2,400</p>
        )}
      </div>

      {/* List price + payout */}
      <div className="mt-4 rounded-card border border-line bg-surface p-4">
        <Label htmlFor="list-price" className="text-sm font-medium">
          List price — set with the owner
        </Label>
        <Input
          id="list-price"
          type="number"
          value={listPrice}
          onChange={(e) => setListPrice(Number(e.target.value))}
          className="mt-1 h-10 w-40"
        />

        <dl className="mt-4 divide-y divide-line-subtle text-sm">
          <PayoutRow label="List price" value={formatPrice(listPrice)} />
          <PayoutRow
            label="Commission (8%)"
            value={`− ${formatPrice(payout.commissionAmount)}`}
          />
          <PayoutRow
            label="Repairs"
            value={
              sellerApproved && repairCost > 0
                ? `− ${formatPrice(payout.repairDeduction)}`
                : repairCost > 0
                  ? "pending approval"
                  : "—"
            }
          />
          <PayoutRow label="Inspection fee" value="waived" />
          <PayoutRow
            label="Seller nets"
            value={formatPrice(payout.sellerPayout)}
            emphasize
          />
        </dl>
      </div>

      {/* Status pipeline */}
      <div className="mt-4 flex flex-wrap items-center gap-1 text-xs text-muted">
        {STAGES.map((stage, index) => (
          <span key={stage.value} className="flex items-center gap-1">
            <span
              className={clsx(
                "rounded-pill px-2 py-0.5",
                index === stageIndex
                  ? "bg-brand-fill font-medium text-white"
                  : index < stageIndex
                    ? "text-battery"
                    : "text-muted",
              )}
            >
              {stage.label}
            </span>
            {index < STAGES.length - 1 && <span>→</span>}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-5 flex gap-3">
        <Button
          disabled={pending}
          onClick={() => startTransition(() => publishCertified(buildInput()))}
          className="h-10 rounded-control bg-brand-fill text-white hover:bg-brand-fill-hover"
        >
          Publish certified
        </Button>
        <Button
          disabled={pending}
          variant="outline"
          onClick={() => startTransition(() => sendCertificationToSeller(buildInput()))}
          className="h-10 rounded-control border-line"
        >
          Send to seller
        </Button>
        <Button
          disabled={pending}
          variant="ghost"
          onClick={() => startTransition(() => saveCertificationDraft(buildInput()))}
          className="h-10 rounded-control text-muted"
        >
          {pending ? "Saving…" : "Save draft"}
        </Button>
      </div>
    </div>
  );
}

function PayoutRow({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex justify-between py-2">
      <dt className={emphasize ? "font-medium text-ink" : "text-muted"}>{label}</dt>
      <dd className={emphasize ? "font-heading text-h5 font-semibold" : "font-medium"}>
        {value}
      </dd>
    </div>
  );
}
