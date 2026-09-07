"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { X } from "@phosphor-icons/react/dist/ssr/X";
import { Plus } from "@phosphor-icons/react/dist/ssr/Plus";
import {
  updateMyBike,
  markBikeSold,
  uploadMyBikePhoto,
  type SellerBikeInput,
} from "@/lib/seller/actions";
import type { BikeRow, ServiceSlotRow } from "@/lib/seller/queries";
import type { BikeType } from "@/lib/supabase/types";
import { BIKE_TYPES } from "@/lib/bikes/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CertifyUpsellDialog } from "@/components/seller/certify-upsell-dialog";

const MAX_PHOTOS = 9;

function labelFor(type: string) {
  return BIKE_TYPES.find((t) => t.value === type)?.label ?? type;
}

export function SellerBikeForm({ bike, slots }: { bike: BikeRow; slots: ServiceSlotRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [upsellOpen, setUpsellOpen] = useState(false);

  const [brand, setBrand] = useState(bike.brand);
  const [model, setModel] = useState(bike.model);
  const [price, setPrice] = useState(bike.price);
  const [year, setYear] = useState(bike.year);
  const [km, setKm] = useState(bike.km);
  const [type, setType] = useState<BikeType>(bike.type);
  const [frameSize, setFrameSize] = useState(bike.frame_size ?? "");
  const [riderHeightRange, setRiderHeightRange] = useState(bike.rider_height_range ?? "");
  const [rangeKm, setRangeKm] = useState<string>(bike.range_km?.toString() ?? "");
  const [motorSpec, setMotorSpec] = useState(bike.motor_spec ?? "");
  const [servicedNote, setServicedNote] = useState(bike.serviced_note ?? "");
  const [photos, setPhotos] = useState<string[]>(bike.photos);
  const [conditionNotes, setConditionNotes] = useState<string[]>(
    bike.condition_notes.map((n) => n.text),
  );
  const [batteryTested, setBatteryTested] = useState(!!bike.battery_health);
  const [batteryPercent, setBatteryPercent] = useState(bike.battery_health?.percent ?? 90);
  const [batteryCycles, setBatteryCycles] = useState(bike.battery_health?.cycles ?? 100);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    const remaining = MAX_PHOTOS - photos.length;
    const toUpload = Array.from(files).slice(0, Math.max(remaining, 0));

    for (const file of toUpload) {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadMyBikePhoto(formData);
      if ("url" in result) setPhotos((prev) => [...prev, result.url]);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function movePhoto(index: number, direction: -1 | 1) {
    setPhotos((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  function addConditionNote() {
    setConditionNotes((prev) => [...prev, ""]);
  }

  function updateConditionNote(index: number, text: string) {
    setConditionNotes((prev) => prev.map((note, i) => (i === index ? text : note)));
  }

  function removeConditionNote(index: number) {
    setConditionNotes((prev) => prev.filter((_, i) => i !== index));
  }

  function buildInput(): SellerBikeInput {
    return {
      id: bike.id,
      brand,
      model,
      price,
      year,
      km,
      type,
      frameSize,
      riderHeightRange,
      rangeKm: rangeKm ? Number(rangeKm) : null,
      motorSpec,
      servicedNote,
      photos,
      conditionNotes: conditionNotes.filter((n) => n.trim()),
      batteryTested,
      batteryPercent,
      batteryCycles,
    };
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updateMyBike(buildInput());
      if (result.showCertifyUpsell) {
        setUpsellOpen(true);
      } else {
        router.push("/seller");
      }
    });
  }

  const isSelfListedLive = bike.listing_type === "self" && bike.status === "live";

  return (
    <div className="max-w-2xl rounded-card border border-line bg-surface p-5">
      <h1 className="text-h5 font-semibold">
        Edit · {bike.brand} {bike.model}
      </h1>

      {/* Photos */}
      <div className="mt-4">
        <p className="text-sm font-medium text-ink">Photos</p>
        <div className="mt-2 rounded-control border border-dashed border-line p-4">
          <p className="text-xs text-muted">
            {photos.length} of {MAX_PHOTOS} — first photo is the cover
          </p>
          <div className="mt-3 grid grid-cols-6 gap-2">
            {photos.map((photo, index) => (
              <div
                key={photo + index}
                className="group relative aspect-square overflow-hidden rounded-control bg-line"
              >
                <Image src={photo} alt="" fill sizes="120px" className="object-cover" />
                {index === 0 && (
                  <span className="absolute left-1 top-1 rounded-pill bg-ink/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    Cover
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-ink/70 px-1 py-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => movePhoto(index, -1)}
                    disabled={index === 0}
                    className="text-white disabled:opacity-30"
                    aria-label="Move earlier"
                  >
                    <ArrowLeft size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="text-white"
                    aria-label="Remove photo"
                  >
                    <X size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => movePhoto(index, 1)}
                    disabled={index === photos.length - 1}
                    className="text-white disabled:opacity-30"
                    aria-label="Move later"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-control border border-dashed border-line text-muted hover:border-brand hover:text-brand"
              >
                <Plus size={18} />
                <span className="text-[10px]">{uploading ? "Uploading…" : "Add"}</span>
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
      </div>

      {/* Core fields */}
      <div className="mt-5 grid grid-cols-2 gap-4">
        <Field label="Brand">
          <Input value={brand} onChange={(e) => setBrand(e.target.value)} className="h-10" />
        </Field>
        <Field label="Model">
          <Input value={model} onChange={(e) => setModel(e.target.value)} className="h-10" />
        </Field>
        <Field label="Price ₹">
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="h-10"
          />
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
          <Input
            type="number"
            value={km}
            onChange={(e) => setKm(Number(e.target.value))}
            className="h-10"
          />
        </Field>
        <Field label="Type">
          <Select value={type} onValueChange={(next) => next && setType(next as BikeType)}>
            <SelectTrigger className="h-10 w-full bg-surface">
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
        <Field label="Frame size">
          <Input
            value={frameSize}
            onChange={(e) => setFrameSize(e.target.value)}
            placeholder={'e.g. M (18")'}
            className="h-10"
          />
        </Field>
        <Field label="Rider height range">
          <Input
            value={riderHeightRange}
            onChange={(e) => setRiderHeightRange(e.target.value)}
            placeholder={"e.g. 5'6\"–5'11\""}
            className="h-10"
          />
        </Field>
        <Field label="Range (km/charge)">
          <Input
            type="number"
            value={rangeKm}
            onChange={(e) => setRangeKm(e.target.value)}
            className="h-10"
          />
        </Field>
        <Field label="Motor spec">
          <Input
            value={motorSpec}
            onChange={(e) => setMotorSpec(e.target.value)}
            placeholder="e.g. 250W rear hub"
            className="h-10"
          />
        </Field>
        <div className="col-span-2">
          <Field label="Serviced note">
            <Input
              value={servicedNote}
              onChange={(e) => setServicedNote(e.target.value)}
              placeholder="e.g. Full tune-up, new brake pads"
              className="h-10"
            />
          </Field>
        </div>
      </div>

      {/* Battery */}
      <div className="mt-5 rounded-control border border-line p-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="battery-tested" className="text-sm font-medium">
            Battery tested
          </Label>
          <Switch id="battery-tested" checked={batteryTested} onCheckedChange={setBatteryTested} />
        </div>
        {batteryTested ? (
          <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-4">
            <Slider
              value={[batteryPercent]}
              onValueChange={(v) => setBatteryPercent(Array.isArray(v) ? v[0] : v)}
              min={0}
              max={100}
              step={1}
            />
            <span className="w-14 text-right font-heading text-h5 font-semibold text-battery">
              {batteryPercent}%
            </span>
            <div className="col-span-2 flex items-center gap-2">
              <Label htmlFor="battery-cycles" className="text-xs text-muted">
                Cycles
              </Label>
              <Input
                id="battery-cycles"
                type="number"
                value={batteryCycles}
                onChange={(e) => setBatteryCycles(Number(e.target.value))}
                className="h-8 w-24"
              />
            </div>
          </div>
        ) : (
          <p className="mt-2 text-xs text-muted">
            Left untested — the battery panel and filter won&apos;t show for this bike.
          </p>
        )}
      </div>

      {/* Condition notes */}
      <div className="mt-5">
        <p className="text-sm font-medium text-ink">Condition notes</p>
        <div className="mt-2 flex flex-col gap-2">
          {conditionNotes.map((note, index) => (
            <div key={index} className="flex items-center gap-2">
              <Textarea
                value={note}
                onChange={(e) => updateConditionNote(index, e.target.value)}
                rows={1}
                className="min-h-9 flex-1 resize-none py-2"
              />
              <button
                type="button"
                onClick={() => removeConditionNote(index)}
                className="text-muted hover:text-danger"
                aria-label="Remove note"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addConditionNote}
            className="h-8 w-fit rounded-control border-line"
          >
            + Add note
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
        <div className="flex gap-2">
          <Button
            disabled={pending}
            onClick={handleSave}
            className="h-10 rounded-control bg-brand-fill text-white hover:bg-brand-fill-hover"
          >
            {pending ? "Saving…" : "Save changes"}
          </Button>
          {isSelfListedLive && (
            <Button
              disabled={pending}
              variant="outline"
              onClick={() => startTransition(() => markBikeSold(bike.id))}
              className="h-10 rounded-control border-line"
            >
              Mark as sold
            </Button>
          )}
        </div>
      </div>

      <CertifyUpsellDialog
        open={upsellOpen}
        onOpenChange={setUpsellOpen}
        bikeId={bike.id}
        slots={slots}
      />
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
