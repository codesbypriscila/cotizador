import type { ComponentType } from "react";
import {
  AppMock,
  BrandMock,
  ChatbotMock,
  CmsMock,
  CustomSystemMock,
  DashboardMock,
  HostingMock,
  InventoryMock,
  MailMock,
  MaintenanceMock,
  NotifyMock,
  SupportMock,
} from "./mocks-apps";
import {
  BlogMock,
  BookingMock,
  ContentMock,
  DomainMock,
  LandingMock,
  LanguageMock,
  LoginMock,
  MenuMock,
  PagesMock,
  PaymentsMock,
  PortfolioMock,
  RedesignMock,
  SeoMock,
  StoreMock,
  WebsiteMock,
} from "./mocks-sites";

// Which example to show for each catalog item. Items are matched by name, so new
// services added from the admin catalog also get a preview (a generic website if
// nothing matches).

export type PreviewDef = {
  Mock: ComponentType<{ m: boolean }>;
  /** Address shown in the Mac window's address bar. */
  url: string;
  /** Color behind the iPhone status bar, to blend with the top of the example. */
  phoneTop?: string;
  /** White status bar text (for dark tops). */
  phoneTopLight?: boolean;
};

const P = {
  landing: { Mock: LandingMock, url: "cafecolonial.com", phoneTop: "#FBF7F2" },
  website: { Mock: WebsiteMock, url: "clinicasonrisa.com" },
  redesign: { Mock: RedesignMock, url: "clinicasonrisa.com" },
  store: { Mock: StoreMock, url: "bambuhome.do", phoneTop: "#1C2620", phoneTopLight: true },
  booking: { Mock: BookingMock, url: "studiobella.do/reservar" },
  menu: { Mock: MenuMock, url: "laterraza.do/menu" },
  portfolio: { Mock: PortfolioMock, url: "lauramendez.com", phoneTop: "#F7F6F3" },
  chatbot: { Mock: ChatbotMock, url: "web.whatsapp.com", phoneTop: "#0F6E5F", phoneTopLight: true },
  notify: { Mock: NotifyMock, url: "web.whatsapp.com", phoneTop: "#9D8AE0", phoneTopLight: true },
  support: { Mock: SupportMock, url: "soporte.priscilaperez.com", phoneTop: "#EAF2FE" },
  inventory: { Mock: InventoryMock, url: "inventario.ferreteriacentral.do" },
  custom: { Mock: CustomSystemMock, url: "caja.cafecolonial.com", phoneTop: "#FFFFFF" },
  app: { Mock: AppMock, url: "app.saborexpress.do", phoneTop: "#F6F6F8" },
  dashboard: { Mock: DashboardMock, url: "admin.minegocio.com" },
  cms: { Mock: CmsMock, url: "cafecolonial.com/admin" },
  pages: { Mock: PagesMock, url: "cafecolonial.com/galeria" },
  payments: { Mock: PaymentsMock, url: "bambuhome.do/pagar" },
  login: { Mock: LoginMock, url: "cafecolonial.com/entrar" },
  domain: { Mock: DomainMock, url: "cafecolonial.com", phoneTop: "#F4F8FF" },
  mail: { Mock: MailMock, url: "correo.cafecolonial.com" },
  seo: { Mock: SeoMock, url: "buscador.com/search?q=café+zona+colonial" },
  language: { Mock: LanguageMock, url: "casabrisa.do/en", phoneTop: "#4F7FA8", phoneTopLight: true },
  blog: { Mock: BlogMock, url: "cafecolonial.com/blog", phoneTop: "#FBF7F2" },
  content: { Mock: ContentMock, url: "bambuhome.do/lampara-ratan" },
  brand: { Mock: BrandMock, url: "montever.de/marca", phoneTop: "#F3EFE7" },
  maintenance: { Mock: MaintenanceMock, url: "reportes.priscilaperez.com", phoneTop: "#F5F6F8" },
  hosting: { Mock: HostingMock, url: "panel.priscilaperez.com", phoneTop: "#0F1115", phoneTopLight: true },
} satisfies Record<string, PreviewDef>;

type Key = keyof typeof P;

// Order matters: the first rule that matches wins.
const RULES: [RegExp, Key][] = [
  [/landing/, "landing"],
  [/tienda|e-?commerce|carrito/, "store"],
  [/pago|checkout|azul|cardnet|paypal/, "payments"],
  [/reserva|cita|agenda/, "booking"],
  [/menu|\bqr\b|restaurante/, "menu"],
  [/portafolio|\bcv\b|curriculum/, "portfolio"],
  [/redisen/, "redesign"],
  [/notificacion|aviso|recordatorio/, "notify"],
  [/whatsapp|chatbot|automatizacion|\bbot\b/, "chatbot"],
  [/inventario|stock|almacen/, "inventory"],
  [/a la medida|a medida|facturacion|punto de venta|\bpos\b|\bcrm\b/, "custom"],
  [/\bapp\b|aplicacion|movil|\bios\b|android/, "app"],
  [/pagina.*adicional|paginas extra|pagina extra/, "pages"],
  [/login|inicio de sesion|usuarios|cuentas/, "login"],
  [/dominio/, "domain"],
  [/hosting|servidor/, "hosting"],
  [/correo|e-?mail/, "mail"],
  [/\bseo\b|google|buscador|posicionamiento/, "seo"],
  [/idioma|ingles|traduccion/, "language"],
  [/blog|articulo|noticias/, "blog"],
  [/redaccion|texto|foto|contenido/, "content"],
  [/logo|marca|branding|identidad/, "brand"],
  [/mantenimiento/, "maintenance"],
  [/soporte|ayuda/, "support"],
  [/panel|\badmin\b|administracion|dashboard/, "dashboard"],
  [/pagina web|sitio|web/, "website"],
];

const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function previewFor(item: { name: string; description?: string; kind: "PROJECT" | "EXTRA" }): PreviewDef {
  const name = normalize(item.name);
  let key = RULES.find(([re]) => re.test(name))?.[1];
  // Fall back to the description ("Para editar tu contenido", "Cada página extra"…).
  if (!key && item.description) key = RULES.find(([re]) => re.test(normalize(item.description!)))?.[1];
  // An admin panel sold as an extra is for editing the website's content.
  if (key === "dashboard" && item.kind === "EXTRA") key = "cms";
  return P[key ?? "website"];
}
