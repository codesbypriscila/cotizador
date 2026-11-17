import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerEnv } from "./env";
import { prisma } from "./prisma";
import { readSessionToken, SESSION_COOKIE } from "./session";

/**
 * Returns the admin email, or redirects to the login page. Use in every admin page and action.
 * The session must be signed AND belong to the current admin account, so changing the
 * email in the database closes old sessions.
 */
export async function requireAdmin(): Promise<string> {
  const { SESSION_SECRET } = getServerEnv();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const email = readSessionToken(token, SESSION_SECRET);
  if (!email) redirect("/admin/login");
  const admin = await prisma.admin.findUnique({ where: { email }, select: { email: true } });
  if (!admin) redirect("/admin/login");
  return admin.email;
}
