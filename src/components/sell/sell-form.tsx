"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { clsx } from "clsx";
import { SealCheck } from "@phosphor-icons/react/dist/ssr/SealCheck";
import { Tag } from "@phosphor-icons/react/dist/ssr/Tag";
import { Check } from "@phosphor-icons/react/dist/ssr/Check";
import { X } from "@phosphor-icons/react/dist/ssr/X";
import { Plus } from "@phosphor-icons/react/dist/ssr/Plus";
import { createSellSubmission, uploadSellPhoto } from "@/lib/sell/actions";
import { computeSelfNet, SELF_LISTING_FEE } from "@/lib/sell/pricing";
import { computeCertifiedPayout } from "@/lib/admin/pricing";
import { getComps, COMPS_WINDOW_DAYS } from "@/lib/comps";
import { formatPrice } from "@/lib/format";
import { BIKE_TYPES } from "@/lib/bikes/types";
import type { BikeType } from "@/lib/supabase/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MAX_PHOTOS = 6;

function labelFor(type: string) {
  return BIKE_TYPES.find((t) => t.value === type)?.label ?? type;
}

export function SellForm() {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [km, setKm] = useState(0);
  const [type, setType] = useState<BikeType>("city");

  const comp = useMemo(() => getComps(brand, model), [brand, model]);

  const [priceInput, setPriceInput] = useState<number | null>(null);
  const compMidpoint = comp ? Math.round((comp.low + comp.high) / 2 / 100) * 100 : 0;
  // Anchors both net-payout lines below. Defaults to the comp midpoint until
  // the seller overrides it, matching the reference wireframe (the same
  // price feeds both the self and certify cards' "you keep ₹X" figures).
  const price = priceInput ?? compMidpoint;

  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<"self" | "certify" | null>(null);

  const selfNet = computeSelfNet(price);
  const certifyPayout = useMemo(
    () => computeCertifiedPayout({ listPrice: price, repairCost: 0, sellerApproved: false }),
    [price],
  );

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    const remaining = MAX_PHOTOS - photos.length;
    const toUpload = Array.from(files).slice(0, Math.max(remaining, 0));

    for (const file of toUpload) {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadSellPhoto(formData);
      if ("url" in result) setPhotos((prev) => [...prev, result.url]);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function submit(path: "self" | "certify") {
    setError(null);
    startTransition(async () => {
      const result = await createSellSubmission({
        brand,
        model,
        year,
        km,
        type,
        path,
        askingPrice: path === "self" ? price : undefined,
        photos: path === "self" ? photos : undefined,
      });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setSubmitted(path);
    });
  }

  if (submitted) {
    return (
      <div className="rounded-card border border-brand/30 bg-brand-tint p-6 text-center">
        <SealCheck size={28} weight="fill" className="mx-auto text-brand" />
        <h2 className="mt-3 font-heading text-h5 font-semibold text-ink">
          {submitted === "self" ? "Listing submitted" : "Inspection requested"}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {submitted === "self"
            ? "We'll review your listing and it'll go live within a few hours."
            : "We'll be in touch to schedule a free pickup and inspection."}
        </p>
        <Button
          render={<Link href="/seller" />}
          nativeButton={false}
          className="mt-4 h-10 rounded-control bg-brand-fill text-white hover:bg-brand-fill-hover"
        >
          Go to your listings
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Field label="Brand">
          <Input value={brand} onChange={(e) => setBrand(e.target.value)} className="h-10" placeholder="EMotorad" />
        </Field>
        <Field label="Model">
          <Input value={model} onChange={(e) => setModel(e.target.value)} className="h-10" placeholder="T-Rex+" />
        </Field>
        <Field label="Year">
          <Input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="h-10"
          />
        </Field>
        <Field label="Km ridden">
          <Input type="number" value={km} onChange={(e) => setKm(Number(e.target.value))} className="h-10" />
        </Field>
        <div className="col-span-2 sm:col-span-4">
          <Field label="Type">
            <Select value={type} onValueChange={(next) => next && setType(next as BikeType)}>
              <SelectTrigger className="h-10 w-full bg-surface sm:w-48">
                <SelectValue>{(current: string) => labelFor(current)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {BIKE_TYPES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </div>

      {/* Comps panel — suppressed entirely when there's no real comp data */}
      {comp && (
        <div className="mt-5 rounded-card border border-line bg-surface p-4">
          <p className="text-sm font-medium text-muted">Bikes like yours sold for</p>
          <p className="mt-1 font-heading text-h4 font-semibold tracking-tight text-ink">
            {formatPrice(comp.low)} – {formatPrice(comp.high)}
          </p>
          <p className="mt-1 text-xs text-muted">
            based on {comp.sampleSize} sales in Pune, last {COMPS_WINDOW_DAYS} days
          </p>
        </div>
      )}

      <div className="mt-5 max-w-xs">
        <Field label="Your asking price ₹">
          <Input
            type="number"
            value={price}
            onChange={(e) => setPriceInput(Number(e.target.value))}
            className="h-10"
          />
        </Field>
        <p className="mt-1 text-xs text-muted">Feeds both payouts below — set it however you like.</p>
      </div>

      {error && (
        <p className="mt-4 rounded-control bg-danger-bg px-3 py-2 text-sm text-danger">{error}</p>
      )}

      {/* The fork */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {/* Certified — heavier border, first on mobile */}
        <div className="order-first flex flex-col rounded-card border-2 border-brand bg-surface p-5 sm:order-none">
          <span className="inline-flex w-fit items-center gap-1 rounded-pill bg-brand-tint px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-brand">
            <SealCheck size={13} weight="fill" />
            Certify &amp; consign
          </span>
          <p className="mt-3 font-heading text-h4 font-semibold tracking-tight">8% when it sells</p>
          <p className="text-sm text-muted">free inspection · nothing upfront</p>

          <ul className="mt-4 flex flex-col gap-1.5 text-sm text-ink">
            {[
              "We inspect and test the battery",
              "We shoot it properly",
              "We price it and talk to buyers",
              "We deliver it and warranty it",
              "You keep the bike till it sells",
            ].map((line) => (
              <li key={line} className="flex items-start gap-1.5">
                <Check size={14} weight="bold" className="mt-0.5 shrink-0 text-brand" />
                {line}
              </li>
            ))}
          </ul>

          <div className="mt-4 border-t border-line-subtle pt-3">
            <p className="text-sm">
              You keep <span className="font-semibold text-ink">{formatPrice(certifyPayout.sellerPayout)}</span> of{" "}
              {formatPrice(price)} — and certified bikes sell 2× faster
            </p>
          </div>

          <Button
            disabled={pending || !brand.trim() || !model.trim()}
            onClick={() => submit("certify")}
            className="mt-4 h-11 rounded-control bg-brand-fill text-white hover:bg-brand-fill-hover"
          >
            {pending ? "Please wait…" : "Book a free inspection"}
          </Button>
        </div>

        {/* Self */}
        <div className="flex flex-col rounded-card border border-line bg-surface p-5">
          <span className="inline-flex w-fit items-center gap-1 rounded-pill border border-self px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-self">
            <Tag size={13} weight="fill" />
            List it yourself
          </span>
          <p className="mt-3 font-heading text-h4 font-semibold tracking-tight">
            {formatPrice(SELF_LISTING_FEE)}
          </p>
          <p className="text-sm text-muted">one-time listing fee</p>

          <ul className="mt-4 flex flex-col gap-1.5 text-sm text-ink">
            {[
              "Your photos, your price",
              "You answer buyers",
              "You handle the handover",
              "Live in 10 minutes",
            ].map((line) => (
              <li key={line} className="flex items-start gap-1.5">
                <Check size={14} weight="bold" className="mt-0.5 shrink-0 text-muted" />
                {line}
              </li>
            ))}
          </ul>

          {/* Photos — collected here since there's no seller dashboard step before this */}
          <div className="mt-4">
            <p className="text-xs font-medium text-muted">
              Photos ({photos.length}/{MAX_PHOTOS})
            </p>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {photos.map((photo, index) => (
                <div key={photo + index} className="group relative aspect-square overflow-hidden rounded-control bg-line">
                  <Image src={photo} alt="" fill sizes="80px" className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== index))}
                    className="absolute inset-0 flex items-center justify-center bg-ink/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Remove photo"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex aspect-square flex-col items-center justify-center gap-0.5 rounded-control border border-dashed border-line text-muted hover:border-brand hover:text-brand"
                >
                  <Plus size={16} />
                  <span className="text-[9px]">{uploading ? "…" : "Add"}</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => handleFiles(event.target.files)}
            />
          </div>

          <div className="mt-4 border-t border-line-subtle pt-3">
            <p className="text-sm">
              You keep <span className="font-semibold text-ink">{formatPrice(selfNet)}</span> of {formatPrice(price)}
            </p>
          </div>

          <Button
            disabled={pending || !brand.trim() || !model.trim() || price <= 0}
            variant="outline"
            onClick={() => submit("self")}
            className={clsx("mt-4 h-11 rounded-control border-line text-ink hover:border-brand hover:text-brand")}
          >
            {pending ? "Please wait…" : "List it myself"}
          </Button>
        </div>
      </div>

      <p className="mt-5 text-xs text-muted">
        Either way the bike stays yours until a buyer pays. Withdraw a certified listing after
        inspection and the ₹1,499 inspection fee applies.
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-muted">{label}</Label>
      {children}
    </div>
  );
}
