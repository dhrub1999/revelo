import { Package } from "@phosphor-icons/react/dist/ssr/Package";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { Wrench } from "@phosphor-icons/react/dist/ssr/Wrench";
import { Camera } from "@phosphor-icons/react/dist/ssr/Camera";
import { Truck } from "@phosphor-icons/react/dist/ssr/Truck";
import { Check } from "@phosphor-icons/react/dist/ssr/Check";

const STEPS = [
  {
    icon: Package,
    title: "We collect it",
    body: "Free pickup within Pune.",
  },
  {
    icon: MagnifyingGlass,
    title: "42-point inspection",
    body: "Battery load-tested, cycles read off the BMS, not guessed.",
  },
  {
    icon: Wrench,
    title: "We fix what fails",
    body: "Cost comes off the sale price, agreed with you first.",
  },
  {
    icon: Camera,
    title: "Photos and price",
    body: "Studio shots, price from real comps.",
  },
  {
    icon: Truck,
    title: "We sell and deliver",
    body: "You get paid within 24h of handover.",
  },
];

const REPORT_ROWS = [
  { label: "Frame & fork", result: "pass" },
  { label: "Battery load test", result: "pass" },
  { label: "Motor & controller", result: "pass" },
  { label: "Brakes", result: "pass" },
  { label: "Drivetrain wear", result: "flag" },
  { label: "Tyres & wheels", result: "pass" },
  { label: "Electrics & display", result: "pass" },
  { label: "Frame alignment", result: "pass" },
];

export function CertificationExplainer() {
  return (
    <div className="rounded-card border border-line bg-surface p-5 sm:p-6">
      <h2 className="font-heading text-h5 font-semibold tracking-tight">
        What &ldquo;certified&rdquo; buys you.
      </h2>

      <ol className="mt-5 flex flex-col gap-4">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-control bg-brand-tint text-sm font-semibold text-brand">
              {index + 1}
            </span>
            <div>
              <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
                <step.icon size={15} className="text-brand" weight="bold" />
                {step.title}
              </p>
              <p className="mt-0.5 text-sm text-muted">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6 rounded-control border border-dashed border-line p-4">
        <p className="text-sm font-semibold text-ink">The report the buyer sees</p>
        <p className="mt-1 text-xs text-muted">
          Sample — every certified listing ships with the real thing.
        </p>
        <dl className="mt-3 divide-y divide-line-subtle text-sm">
          {REPORT_ROWS.map((row) => (
            <div key={row.label} className="flex items-center justify-between py-1.5">
              <dt className="text-muted">{row.label}</dt>
              <dd
                className={
                  row.result === "pass"
                    ? "flex items-center gap-1 font-medium text-battery"
                    : "font-medium text-danger"
                }
              >
                {row.result === "pass" ? (
                  <>
                    <Check size={13} weight="bold" /> Pass
                  </>
                ) : (
                  "Noted — repaired"
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
