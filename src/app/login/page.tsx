import { LoginForm } from "./login-form";

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const next = typeof searchParams.next === "string" ? searchParams.next : "/";

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="text-h4 font-semibold">Sign in</h1>
      <p className="mt-1 text-sm text-muted">
        Buyer account. Messaging, test rides, and checkout need a login.
      </p>
      <LoginForm next={next} />
    </div>
  );
}
