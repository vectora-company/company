import { redirect } from "@tanstack/react-router";
import { getSession } from "#/server/fns/auth";
import type { SessionUser } from "#/server/fns/auth";
import { getSubscription } from "#/server/fns/subscription";

export async function requireSignedInAccount(
  returnTo: string,
): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw redirect({ to: "/login", search: { redirect: returnTo } });
  }
  return session;
}

export async function requireProAccount(
  returnTo: string,
  session?: SessionUser,
): Promise<SessionUser> {
  const account = session ?? (await requireSignedInAccount(returnTo));
  if (account.role === "admin") return account;

  const subscription = await getSubscription();
  const hasPro =
    subscription?.tier === "pro" &&
    (subscription.status === "active" ||
      subscription.status === "past_due" ||
      (subscription.status === "trialing" &&
        Boolean(subscription.trial_ends_at) &&
        Date.parse(subscription.trial_ends_at!) > Date.now()));

  if (!hasPro) throw redirect({ to: "/dashboard/billing" });
  return account;
}
