// Emails open in the phone's or computer's own mail app (mailto:), with the
// message already written. No mail server is needed.

export function mailtoLink(to: string, { subject = "", body = "" }: { subject?: string; body?: string } = {}): string {
  const params = [
    subject && `subject=${encodeURIComponent(subject)}`,
    body && `body=${encodeURIComponent(body.replace(/\r?\n/g, "\r\n"))}`,
  ].filter(Boolean);
  return `mailto:${encodeURIComponent(to.trim()).replace(/%40/g, "@")}${params.length ? `?${params.join("&")}` : ""}`;
}
