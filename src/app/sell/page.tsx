import { SellForm } from "@/components/sell/sell-form";
import { CertificationExplainer } from "@/components/sell/certification-explainer";

export const metadata = {
  title: "Sell your bike — Revélo",
};

export default function SellPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-heading text-h3 font-semibold tracking-tight">What&apos;s it worth?</h1>
      <p className="mt-1 text-muted">Four fields, then pick how much work you want to do.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <SellForm />
        <div className="lg:sticky lg:top-24 lg:self-start">
          <CertificationExplainer />
        </div>
      </div>
    </div>
  );
}
