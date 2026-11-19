// Catalog rules shared by the public builder (browser) and the server action.

type ExtraLike = { name: string; unit: "ONCE" | "EACH" | "MONTHLY"; price: number };
type ProjectLike = { maintenancePrice: number | null } | null | undefined;

/** The monthly maintenance extra: its price depends on the project type. */
export function isMaintenance(extra: { name: string; unit: string }) {
  return extra.unit === "MONTHLY" && /^mantenimiento/i.test(extra.name.trim());
}

/** Price of an extra for the chosen project (maintenance uses the project's own monthly price). */
export function extraPrice(extra: ExtraLike, project: ProjectLike): number {
  if (isMaintenance(extra) && project?.maintenancePrice) return project.maintenancePrice;
  return extra.price;
}
