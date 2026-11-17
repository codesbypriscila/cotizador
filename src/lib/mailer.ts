import "server-only";
import nodemailer from "nodemailer";
import { getServerEnv } from "./env";

/** True when the Gmail account and its app password are configured. */
export function mailConfigured() {
  const { SMTP_USER, SMTP_PASSWORD } = getServerEnv();
  return Boolean(SMTP_USER && SMTP_PASSWORD);
}

/** Address emails are sent from, or null while Gmail is not fully configured. */
export function mailFrom() {
  return mailConfigured() ? getServerEnv().SMTP_USER || null : null;
}

/**
 * Sends an email from the admin's Gmail (SMTP with an app password).
 * Replies go back to that same Gmail.
 */
export async function sendMail(input: { to: string; subject: string; text: string; fromName: string }) {
  const { SMTP_USER, SMTP_PASSWORD } = getServerEnv();
  if (!SMTP_USER || !SMTP_PASSWORD) return { ok: false as const, error: "El envío de correos no está configurado." };
  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD.replace(/\s/g, "") },
  });
  try {
    await transport.sendMail({
      from: { name: input.fromName, address: SMTP_USER },
      to: input.to,
      replyTo: SMTP_USER,
      subject: input.subject,
      text: input.text,
    });
    return { ok: true as const };
  } catch (err) {
    console.error("sendMail failed", err);
    const auth = err instanceof Error && /auth|credentials|535/i.test(err.message);
    return {
      ok: false as const,
      error: auth
        ? "Gmail rechazó el acceso. Revisa la contraseña de aplicación en SMTP_PASSWORD."
        : "No se pudo enviar el correo. Inténtalo otra vez en un momento.",
    };
  }
}
