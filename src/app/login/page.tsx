import { LoginForm } from "./login-form";

const SUBTITLE = {
  buyer: "Buyer account. Messaging, test rides, and checkout need a login.",
  seller: "Seller account. List a bike, manage listings, and get certified.",
};

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const next = typeof searchParams.next === "string" ? searchParams.next : "/";
  const role = searchParams.role === "seller" ? "seller" : "buyer";

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="text-h4 font-semibold">Sign in</h1>
      <p className="mt-1 text-sm text-muted">{SUBTITLE[role]}</p>
      <LoginForm next={next} role={role} />
    </div>
  );
}
