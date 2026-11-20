"use client";

import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  CreditCard,
  Croissant,
  Download,
  Flower2,
  Heart,
  Images,
  Lamp,
  Leaf,
  Lock,
  Mail,
  MapPin,
  Menu,
  Palette,
  Phone,
  Scissors,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sofa,
  Sparkles,
  Stethoscope,
  Truck,
  User,
  Utensils,
  Wifi,
} from "lucide-react";
import { useState } from "react";
import { cx } from "@/components/ui";
import { Bar, FakeQr, Logo, Photo, Stars } from "./kit";

type P = { m: boolean };

/* ───────────────────────── Landing page ───────────────────────── */

const COFFEE = "#7A4A2E";

function CafeNav({ m, light }: P & { light?: boolean }) {
  return (
    <nav className={cx("flex items-center justify-between", m ? "px-5 py-4" : "px-14 py-6")}>
      <Logo icon={Coffee} name="Café Colonial" color={COFFEE} light={light} className={m ? "text-[16px]" : "text-[18px]"} />
      {m ? (
        <Menu size={24} className={light ? "text-white" : undefined} />
      ) : (
        <div className={cx("flex items-center gap-8 text-[14px] font-medium", light ? "text-white/85" : "text-[#5C4A3E]")}>
          <span>Menú</span>
          <span>Nosotros</span>
          <span>Eventos</span>
          <span>Ubicación</span>
          <span className="rounded-full px-5 py-2.5 text-white" style={{ background: COFFEE }}>
            Reservar mesa
          </span>
        </div>
      )}
    </nav>
  );
}

export function LandingMock({ m }: P) {
  return (
    <div className="min-h-full bg-[#FBF7F2] text-[#2A1C14]">
      <CafeNav m={m} />
      <section
        className={cx("grid items-center", m ? "gap-6 px-5 pt-2 pb-10" : "grid-cols-[1.05fr_1fr] gap-14 px-14 pt-6 pb-20")}
      >
        <div className="flex flex-col gap-5">
          <span className="flex w-fit items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-[#7A4A2E] shadow-sm">
            <MapPin size={13} /> Zona Colonial · Santo Domingo
          </span>
          <h1 className={cx("leading-[1.02] font-bold tracking-[-0.045em]", m ? "text-[40px]" : "text-[64px]")}>
            El café que despierta la ciudad.
          </h1>
          <p className={cx("leading-relaxed text-[#6B5848]", m ? "text-[15px]" : "text-[18px]")}>
            Granos dominicanos tostados aquí mismo, desayunos de la casa y un patio colonial para quedarte un rato más.
          </p>
          <div className={cx("flex gap-3", m && "flex-col")}>
            <span
              className="flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold text-white"
              style={{ background: COFFEE }}
            >
              Reserva tu mesa <ArrowRight size={17} />
            </span>
            <span className="flex h-12 items-center justify-center rounded-full border border-[#D9C7B5] px-6 text-[15px] font-semibold">
              Ver el menú
            </span>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <div className="flex -space-x-2">
              {(["rose", "sky", "sage", "sun"] as const).map((t) => (
                <Photo key={t} tone={t} className="size-8 rounded-full ring-2 ring-[#FBF7F2]" />
              ))}
            </div>
            <div className="flex flex-col">
              <Stars size={12} />
              <span className="text-[12px] text-[#6B5848]">+1,200 reseñas de clientes felices</span>
            </div>
          </div>
        </div>
        <div className="relative">
          <Photo
            tone="coffee"
            icon={Coffee}
            iconSize={m ? 70 : 110}
            className={cx("rounded-[28px]", m ? "h-[300px]" : "h-[470px]")}
          />
          <div
            className={cx(
              "absolute flex items-center gap-3 rounded-2xl bg-white p-3 shadow-xl",
              m ? "-bottom-5 left-4" : "-bottom-6 -left-8",
            )}
          >
            <span className="grid size-10 place-items-center rounded-xl bg-[#FBEFE3] text-[#7A4A2E]">
              <Croissant size={20} />
            </span>
            <div className="flex flex-col pr-2">
              <span className="text-[13px] font-bold">Desayuno colonial</span>
              <span className="text-[12px] text-[#8A7564]">Hasta las 12:00 m.</span>
            </div>
          </div>
          {!m && (
            <div className="absolute -top-5 -right-5 flex flex-col items-center rounded-2xl bg-[#2A1C14] px-4 py-3 text-white shadow-xl">
              <span className="text-[26px] font-bold">4.9</span>
              <Stars size={11} />
            </div>
          )}
        </div>
      </section>

      <section className={cx("grid gap-4", m ? "px-5 pt-4 pb-10" : "grid-cols-3 px-14 pb-20")}>
        {[
          { i: Coffee, t: "Granos locales", d: "Café de Jarabacoa y Barahona, tostado cada semana." },
          { i: Clock, t: "Abierto todos los días", d: "De 7:00 a. m. a 9:00 p. m., incluso feriados." },
          { i: Wifi, t: "Tu oficina aquí", d: "Wi-Fi rápido, enchufes y mesas tranquilas." },
        ].map((f) => (
          <div key={f.t} className="flex flex-col gap-3 rounded-3xl bg-white p-6 shadow-[0_10px_30px_rgb(122_74_46/0.07)]">
            <span className="grid size-11 place-items-center rounded-2xl bg-[#FBEFE3] text-[#7A4A2E]">
              <f.i size={21} />
            </span>
            <span className="text-[17px] font-bold">{f.t}</span>
            <span className="text-[14px] leading-relaxed text-[#6B5848]">{f.d}</span>
          </div>
        ))}
      </section>

      <section className={cx(m ? "px-5 pb-10" : "px-14 pb-20")}>
        <div className={cx("grid overflow-hidden rounded-[28px] bg-[#2A1C14] text-white", m ? "" : "grid-cols-2")}>
          <div className={cx("flex flex-col gap-4", m ? "p-7" : "p-12")}>
            <Stars size={16} />
            <p className={cx("leading-snug font-semibold tracking-[-0.02em]", m ? "text-[20px]" : "text-[28px]")}>
              “El mejor capuchino de la Zona Colonial. Vengo todas las mañanas antes del trabajo.”
            </p>
            <span className="text-[14px] text-white/60">María Fernández · Clienta frecuente</span>
            <span className="mt-2 flex h-12 w-fit items-center gap-2 rounded-full bg-white px-6 text-[15px] font-semibold text-[#2A1C14]">
              Reserva por WhatsApp <ArrowUpRight size={17} />
            </span>
          </div>
          <Photo tone="cream" icon={Croissant} iconSize={80} className={m ? "h-[200px]" : "min-h-[320px]"} />
        </div>
      </section>

      <footer
        className={cx(
          "flex justify-between border-t border-[#EADFD3] text-[13px] text-[#8A7564]",
          m ? "flex-col gap-3 px-5 py-8 pb-12" : "px-14 py-8",
        )}
      >
        <Logo icon={Coffee} name="Café Colonial" color={COFFEE} className="text-[15px] text-[#2A1C14]" />
        <span>Calle El Conde 105, Santo Domingo · (809) 555-0123</span>
      </footer>
    </div>
  );
}

/* ───────────────────────── Website (5 sections) ───────────────────────── */

const TEAL = "#0E7C86";

function ClinicNav({ m, active = "Inicio", pages }: P & { active?: string; pages?: string[] }) {
  const links = pages ?? ["Inicio", "Nosotros", "Servicios", "Galería", "Contacto"];
  return (
    <nav
      className={cx(
        "sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-white/90 backdrop-blur",
        m ? "px-5 py-3.5" : "px-14 py-4",
      )}
    >
      <Logo icon={Stethoscope} name="Clínica Sonrisa" color={TEAL} className={m ? "text-[16px]" : "text-[17px]"} />
      {m ? (
        <Menu size={24} />
      ) : (
        <div className="flex items-center gap-7 text-[14px] font-medium text-[#4A5560]">
          {links.map((l) => (
            <span key={l} className={cx(l === active && "text-[#0E7C86]")}>
              {l}
            </span>
          ))}
          <span className="rounded-full px-5 py-2.5 text-white" style={{ background: TEAL }}>
            Agendar cita
          </span>
        </div>
      )}
    </nav>
  );
}

export function WebsiteMock({ m }: P) {
  return (
    <div className="min-h-full bg-white text-[#10222A]">
      <ClinicNav m={m} />
      <section className="relative">
        <Photo tone="teal" icon={Sparkles} iconSize={m ? 60 : 90} className={m ? "h-[420px]" : "h-[480px]"} />
        <div className="absolute inset-0 bg-linear-to-r from-[#062D33]/85 via-[#062D33]/55 to-transparent" />
        <div className={cx("absolute inset-0 flex flex-col justify-center gap-5 text-white", m ? "px-5" : "max-w-[640px] px-14")}>
          <span className="w-fit rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-semibold backdrop-blur">
            Odontología familiar desde 2009
          </span>
          <h1 className={cx("leading-[1.05] font-bold tracking-[-0.04em]", m ? "text-[36px]" : "text-[56px]")}>
            Sonríe con confianza otra vez.
          </h1>
          <p className={cx("text-white/80", m ? "text-[15px]" : "text-[18px]")}>
            Limpiezas, ortodoncia e implantes con tecnología moderna y un trato humano.
          </p>
          <div className={cx("flex gap-3", m && "flex-col")}>
            <span className="flex h-12 items-center justify-center rounded-full bg-white px-6 text-[15px] font-semibold text-[#0E7C86]">
              Agenda tu cita
            </span>
            <span className="flex h-12 items-center justify-center rounded-full border border-white/40 px-6 text-[15px] font-semibold">
              Ver servicios
            </span>
          </div>
        </div>
      </section>

      <section className={cx("flex flex-col gap-8", m ? "px-5 py-12" : "px-14 py-20")}>
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-bold tracking-[0.12em] text-[#0E7C86] uppercase">Servicios</span>
          <h2 className={cx("font-bold tracking-[-0.03em]", m ? "text-[28px]" : "text-[38px]")}>
            Todo para tu sonrisa, en un solo lugar
          </h2>
        </div>
        <div className={cx("grid gap-4", m ? "" : "grid-cols-3")}>
          {[
            { t: "Limpieza dental", d: "Profunda, sin dolor y en 40 minutos.", tone: "sky" as const },
            { t: "Ortodoncia invisible", d: "Alineadores transparentes a tu medida.", tone: "teal" as const },
            { t: "Implantes", d: "Recupera tu sonrisa con resultados naturales.", tone: "lilac" as const },
          ].map((s) => (
            <div
              key={s.t}
              className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-[0_10px_30px_rgb(16_34_42/0.06)]"
            >
              <Photo tone={s.tone} icon={Sparkles} className="h-[150px]" />
              <div className="flex flex-col gap-2 p-5">
                <span className="text-[17px] font-bold">{s.t}</span>
                <span className="text-[14px] text-[#5A6B73]">{s.d}</span>
                <span className="mt-1 flex items-center gap-1 text-[14px] font-semibold text-[#0E7C86]">
                  Saber más <ChevronRight size={16} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={cx("grid items-center gap-10 bg-[#F2F8F8]", m ? "px-5 py-12" : "grid-cols-2 px-14 py-20")}>
        <Photo tone="sky" icon={User} iconSize={80} className={cx("rounded-[28px]", m ? "h-[260px]" : "h-[380px]")} />
        <div className="flex flex-col gap-4">
          <span className="text-[13px] font-bold tracking-[0.12em] text-[#0E7C86] uppercase">Nosotros</span>
          <h2 className={cx("font-bold tracking-[-0.03em]", m ? "text-[28px]" : "text-[36px]")}>
            15 años cuidando sonrisas dominicanas
          </h2>
          <p className="text-[15px] leading-relaxed text-[#5A6B73]">
            Somos un equipo de 6 especialistas. Te explicamos cada paso y te damos un plan de pago que se ajusta a ti.
          </p>
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              ["+8,000", "pacientes"],
              ["15", "años"],
              ["4.9★", "en reseñas"],
            ].map(([n, l]) => (
              <div key={l} className="flex flex-col rounded-2xl bg-white p-4">
                <span className="text-[22px] font-bold text-[#0E7C86]">{n}</span>
                <span className="text-[12px] text-[#5A6B73]">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={cx("flex flex-col gap-6", m ? "px-5 py-12" : "px-14 py-20")}>
        <h2 className={cx("font-bold tracking-[-0.03em]", m ? "text-[28px]" : "text-[36px]")}>Galería</h2>
        <div className={cx("grid gap-3", m ? "grid-cols-2" : "grid-cols-4")}>
          {(["teal", "sky", "lilac", "sage"] as const).map((t, i) => (
            <Photo
              key={t}
              tone={t}
              icon={Images}
              iconSize={28}
              className={cx("rounded-2xl", i % 3 === 0 ? "h-[200px]" : "h-[160px]")}
            />
          ))}
        </div>
      </section>

      <section className={cx(m ? "px-5 pb-12" : "px-14 pb-20")}>
        <div className={cx("grid gap-8 rounded-[28px] bg-[#10222A] text-white", m ? "p-6" : "grid-cols-2 p-12")}>
          <div className="flex flex-col gap-4">
            <h2 className={cx("font-bold tracking-[-0.03em]", m ? "text-[26px]" : "text-[34px]")}>Contáctanos</h2>
            <span className="flex items-center gap-3 text-[15px] text-white/80">
              <Phone size={18} /> (809) 555-0199
            </span>
            <span className="flex items-center gap-3 text-[15px] text-white/80">
              <Mail size={18} /> citas@clinicasonrisa.com
            </span>
            <span className="flex items-center gap-3 text-[15px] text-white/80">
              <MapPin size={18} /> Av. Abraham Lincoln 302, Piantini
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {["Tu nombre", "Tu teléfono", "¿En qué te ayudamos?"].map((f) => (
              <span key={f} className="flex h-12 items-center rounded-xl bg-white/10 px-4 text-[14px] text-white/50">
                {f}
              </span>
            ))}
            <span className="flex h-12 items-center justify-center rounded-xl bg-white text-[15px] font-semibold text-[#10222A]">
              Enviar mensaje
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ───────────────────────── Redesign (before / after) ───────────────────────── */

export function RedesignMock({ m }: P) {
  const [after, setAfter] = useState(true);
  return (
    <div className="relative min-h-full">
      {after ? <WebsiteMock m={m} /> : <OldSite m={m} />}
      <div className="pointer-events-none sticky bottom-8 z-30 -mt-12 flex justify-center">
        <div className="pointer-events-auto flex rounded-full bg-[#0E0F12]/85 p-1 text-[14px] font-semibold text-white shadow-[0_10px_30px_rgb(0_0_0/0.3)] backdrop-blur">
          {(["Antes", "Después"] as const).map((l) => {
            const on = (l === "Después") === after;
            return (
              <button
                key={l}
                type="button"
                onClick={() => setAfter(l === "Después")}
                className={cx("rounded-full px-4 py-1.5 transition-colors", on ? "bg-white text-[#0E0F12]" : "text-white/70")}
              >
                {l}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function OldSite({ m }: P) {
  return (
    <div className="min-h-full bg-[#E8E8E8] pt-6 pb-24 font-serif text-[#222]">
      <div className="mx-auto flex flex-col border border-[#999] bg-white" style={{ width: m ? "94%" : 900 }}>
        <div className="bg-linear-to-b from-[#3C78B4] to-[#1D4F84] px-4 py-5 text-center text-white">
          <span className={cx("font-bold", m ? "text-[22px]" : "text-[34px]")}>★ CLINICA DENTAL SONRISA ★</span>
          <div className="text-[13px] italic">¡¡Bienvenidos a nuestra pagina web!!</div>
        </div>
        <div className="flex flex-wrap justify-center gap-x-3 bg-[#DDD] px-2 py-1.5 text-[13px] text-[#0000EE] underline">
          <span>Inicio</span>|<span>Quienes Somos</span>|<span>Servicios</span>|<span>Fotos</span>|<span>Contacto</span>
        </div>
        <div className={cx("flex gap-4 p-4", m && "flex-col")}>
          <div className={cx("flex flex-col gap-3 text-[14px] leading-snug", m ? "" : "w-[62%]")}>
            <b className="text-[18px] text-[#1D4F84]">Nuestros Servicios:</b>
            <span>
              - Limpiezas dentales
              <br />- Extracciones
              <br />- Ortodoncia
              <br />- Y mucho mas!!!
            </span>
            <span className="text-[12px] text-[#C00]">*** Llame hoy para su cita ***</span>
            <span className="text-[13px]">Telefono: 809-555-0199 &nbsp; Fax: 809-555-0198</span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-2 border border-dashed border-[#AAA] p-3 text-center text-[12px] text-[#666]">
            <div className="grid h-[120px] w-full place-items-center bg-[#CCC]">[imagen]</div>
            Visitante #000482
          </div>
        </div>
        <div className="border-t border-[#999] bg-[#EEE] p-2 text-center text-[11px] text-[#777]">
          © 2011 Todos los derechos reservados · Mejor visto en Internet Explorer
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Online store ───────────────────────── */

const SAGE = "#3F6B4E";

const PRODUCTS = [
  { n: "Lámpara de ratán", p: "RD$3,450", t: "sand" as const, i: Lamp, tag: "Nuevo" },
  { n: "Cojín de lino", p: "RD$1,250", t: "sage" as const, i: Sofa },
  { n: "Florero de barro", p: "RD$980", t: "cream" as const, i: Flower2, tag: "-15%" },
  { n: "Set de tazas", p: "RD$1,890", t: "coffee" as const, i: Coffee },
  { n: "Planta monstera", p: "RD$1,600", t: "sage" as const, i: Leaf },
  { n: "Manta tejida", p: "RD$2,300", t: "rose" as const, i: Sofa },
  { n: "Vela de coco", p: "RD$650", t: "sun" as const, i: Sparkles },
  { n: "Bandeja de caoba", p: "RD$2,100", t: "sand" as const, i: Utensils },
];

export function StoreMock({ m }: P) {
  return (
    <div className="min-h-full bg-[#FAFAF7] text-[#1C2620]">
      <div className="bg-[#1C2620] py-2 text-center text-[12px] font-medium text-white">
        <Truck size={13} className="mr-1.5 inline" /> Envío gratis en Santo Domingo desde RD$3,000
      </div>
      <header
        className={cx(
          "sticky top-0 z-10 flex items-center gap-6 border-b border-black/5 bg-white/90 backdrop-blur",
          m ? "px-5 py-3.5" : "px-12 py-4",
        )}
      >
        {m && <Menu size={22} />}
        <Logo icon={Leaf} name="Bambú Home" color={SAGE} className="text-[17px]" />
        {!m && (
          <span className="mx-auto flex h-10 w-[380px] items-center gap-2 rounded-full bg-[#F1F2EE] px-4 text-[14px] text-[#8A9188]">
            <Search size={16} /> Buscar productos…
          </span>
        )}
        <div className={cx("flex items-center gap-4", m && "ml-auto")}>
          {!m && <Heart size={21} />}
          {!m && <User size={21} />}
          <span className="relative">
            <ShoppingBag size={22} />
            <span
              className="absolute -top-1.5 -right-2 grid size-[18px] place-items-center rounded-full text-[10px] font-bold text-white"
              style={{ background: SAGE }}
            >
              2
            </span>
          </span>
        </div>
      </header>

      <section className={cx(m ? "p-4" : "px-12 pt-8")}>
        <div className={cx("relative overflow-hidden rounded-[28px]", m ? "h-[220px]" : "h-[300px]")}>
          <Photo tone="sage" icon={Leaf} iconSize={m ? 70 : 120} className="absolute inset-0" />
          <div className="absolute inset-0 bg-linear-to-r from-black/45 to-transparent" />
          <div className={cx("absolute inset-0 flex flex-col justify-center gap-3 text-white", m ? "p-6" : "p-12")}>
            <span className="text-[12px] font-bold tracking-[0.14em] uppercase">Colección otoño</span>
            <span className={cx("leading-tight font-bold tracking-[-0.03em]", m ? "text-[28px]" : "text-[44px]")}>
              Hecho a mano,
              <br />
              hecho en RD.
            </span>
            <span className="mt-1 flex h-11 w-fit items-center gap-2 rounded-full bg-white px-5 text-[14px] font-semibold text-[#1C2620]">
              Comprar ahora <ArrowRight size={16} />
            </span>
          </div>
        </div>
      </section>

      <div className={cx("no-scrollbar flex gap-2 overflow-x-auto", m ? "px-4 pt-1" : "px-12 pt-8")}>
        {["Todo", "Sala", "Cocina", "Decoración", "Plantas", "Ofertas"].map((c, i) => (
          <span
            key={c}
            className={cx(
              "shrink-0 rounded-full px-4 py-2 text-[13px] font-medium",
              i === 0 ? "text-white" : "bg-white text-[#4A564D] ring-1 ring-black/5",
            )}
            style={i === 0 ? { background: SAGE } : undefined}
          >
            {c}
          </span>
        ))}
      </div>

      <section className={cx("grid", m ? "grid-cols-2 gap-3 p-4 pb-28" : "grid-cols-4 gap-5 px-12 py-8")}>
        {PRODUCTS.map((p) => (
          <div key={p.n} className="flex flex-col gap-2.5">
            <div className="relative">
              <Photo tone={p.t} icon={p.i} iconSize={m ? 36 : 46} className={cx("rounded-2xl", m ? "h-[160px]" : "h-[220px]")} />
              {p.tag && (
                <span className="absolute top-2.5 left-2.5 rounded-full bg-white px-2 py-0.5 text-[11px] font-bold">{p.tag}</span>
              )}
              <span className="absolute top-2.5 right-2.5 grid size-8 place-items-center rounded-full bg-white/90">
                <Heart size={15} />
              </span>
            </div>
            <div className="flex items-start justify-between gap-2 px-0.5">
              <div className="flex flex-col">
                <span className="text-[14px] font-semibold">{p.n}</span>
                <span className="text-[14px] text-[#5E6A61]">{p.p}</span>
              </div>
              {!m && (
                <span className="grid size-9 shrink-0 place-items-center rounded-full text-white" style={{ background: SAGE }}>
                  <ShoppingBag size={15} />
                </span>
              )}
            </div>
          </div>
        ))}
      </section>

      {m && (
        <div className="sticky bottom-0 px-4 pb-8">
          <div
            className="flex h-14 items-center justify-between rounded-2xl px-5 text-white shadow-xl"
            style={{ background: "#1C2620" }}
          >
            <span className="text-[14px] font-semibold">Ver carrito (2)</span>
            <span className="text-[15px] font-bold">RD$4,700</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Booking ───────────────────────── */

const ROSE = "#C2456B";

export function BookingMock({ m }: P) {
  const [day, setDay] = useState(14);
  const [slot, setSlot] = useState("10:30");
  const services = [
    { n: "Corte y peinado", d: "45 min", p: "RD$1,200" },
    { n: "Manicure gel", d: "60 min", p: "RD$900" },
    { n: "Tinte completo", d: "2 h", p: "RD$3,500" },
  ];
  const slots = ["9:00", "9:30", "10:30", "11:00", "1:00", "2:30", "3:00", "4:30"];
  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  const calendar = (
    <div className="flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-[0_10px_30px_rgb(194_69_107/0.07)]">
      <div className="flex items-center justify-between">
        <span className="text-[16px] font-bold">Noviembre 2026</span>
        <span className="flex gap-2 text-[#9A8A90]">
          <ChevronLeft size={18} />
          <ChevronRight size={18} />
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[12px] font-semibold text-[#9A8A90]">
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {[null, null, null, null, null, null, ...days].map((d, i) =>
          d ? (
            <button
              key={i}
              type="button"
              onClick={() => setDay(d)}
              className={cx(
                "grid aspect-square place-items-center rounded-full text-[13px] font-medium",
                d === day ? "text-white" : d < 10 ? "text-[#CFC3C7]" : "hover:bg-[#FBEFF3]",
              )}
              style={d === day ? { background: ROSE } : undefined}
            >
              {d}
            </button>
          ) : (
            <span key={i} />
          ),
        )}
      </div>
    </div>
  );

  const slotsBox = (
    <div className="flex flex-col gap-3">
      <span className="text-[15px] font-bold">Horarios disponibles · {day} de noviembre</span>
      <div className="grid grid-cols-4 gap-2">
        {slots.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSlot(s)}
            className={cx(
              "h-10 rounded-xl text-[13px] font-semibold",
              s === slot ? "text-white" : "bg-white ring-1 ring-[#F0DDE3]",
            )}
            style={s === slot ? { background: ROSE } : undefined}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-full bg-[#FDF7F9] text-[#2B1A21]">
      <header className={cx("flex items-center justify-between bg-white", m ? "px-5 py-3.5" : "px-12 py-4")}>
        <Logo icon={Scissors} name="Studio Bella" color={ROSE} className="text-[17px]" />
        {!m && (
          <span className="text-[14px] text-[#8E7A82]">
            ¿Ya tienes cita? <b className="text-[#C2456B]">Ver mis citas</b>
          </span>
        )}
      </header>
      <div className={cx(m ? "flex flex-col gap-5 p-5 pb-36" : "grid grid-cols-[300px_1fr_320px] gap-6 p-10")}>
        <div className="flex flex-col gap-3">
          <span className="text-[13px] font-bold tracking-[0.1em] text-[#C2456B] uppercase">Paso 1 · Servicio</span>
          <h1 className={cx("font-bold tracking-[-0.03em]", m ? "text-[26px]" : "text-[28px]")}>Reserva tu cita</h1>
          {services.map((s, i) => (
            <div
              key={s.n}
              className={cx(
                "flex items-center gap-3 rounded-2xl bg-white p-3.5",
                i === 0 ? "ring-2 ring-[#C2456B]" : "ring-1 ring-[#F0DDE3]",
              )}
            >
              <Photo tone={i === 0 ? "rose" : i === 1 ? "lilac" : "sun"} className="size-11 shrink-0 rounded-xl" />
              <div className="flex flex-1 flex-col">
                <span className="text-[14px] font-semibold">{s.n}</span>
                <span className="text-[12px] text-[#8E7A82]">
                  {s.d} · {s.p}
                </span>
              </div>
              {i === 0 && (
                <span className="grid size-5 place-items-center rounded-full text-white" style={{ background: ROSE }}>
                  <Check size={12} strokeWidth={3} />
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-5">
          {!m && <span className="text-[13px] font-bold tracking-[0.1em] text-[#C2456B] uppercase">Paso 2 · Fecha y hora</span>}
          {calendar}
          {slotsBox}
        </div>
        {!m && (
          <div className="flex flex-col gap-4 self-start rounded-3xl bg-white p-6 shadow-[0_10px_30px_rgb(194_69_107/0.08)]">
            <span className="text-[16px] font-bold">Resumen</span>
            <Photo tone="rose" icon={Scissors} className="h-[120px] rounded-2xl" />
            <div className="flex flex-col gap-2 text-[14px]">
              <span className="flex items-center gap-2">
                <Scissors size={15} className="text-[#C2456B]" /> Corte y peinado
              </span>
              <span className="flex items-center gap-2">
                <Calendar size={15} className="text-[#C2456B]" /> Sábado {day} de noviembre
              </span>
              <span className="flex items-center gap-2">
                <Clock size={15} className="text-[#C2456B]" /> {slot} a. m.
              </span>
              <span className="flex items-center gap-2">
                <User size={15} className="text-[#C2456B]" /> Con Carla (estilista)
              </span>
            </div>
            <div className="flex justify-between border-t border-[#F3E6EA] pt-3 text-[15px] font-bold">
              <span>Total</span>
              <span>RD$1,200</span>
            </div>
            <span
              className="flex h-12 items-center justify-center rounded-full text-[15px] font-semibold text-white"
              style={{ background: ROSE }}
            >
              Confirmar cita
            </span>
            <span className="text-center text-[12px] text-[#8E7A82]">Te enviamos un recordatorio por WhatsApp</span>
          </div>
        )}
      </div>
      {m && (
        <div className="sticky bottom-0 border-t border-[#F3E6EA] bg-white px-5 pt-3 pb-9">
          <div className="mb-2 flex justify-between text-[13px] text-[#8E7A82]">
            <span>
              Corte y peinado · {day} nov · {slot}
            </span>
            <b className="text-[#2B1A21]">RD$1,200</b>
          </div>
          <span
            className="flex h-12 items-center justify-center rounded-full text-[15px] font-semibold text-white"
            style={{ background: ROSE }}
          >
            Confirmar cita
          </span>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── QR menu ───────────────────────── */

const DISHES: Record<string, { n: string; d: string; p: string; t: "sun" | "coffee" | "sage" | "rose" | "cream" | "sand" }[]> = {
  Entradas: [
    { n: "Tostones con guacamole", d: "Plátano verde crujiente y aguacate de la casa", p: "RD$350", t: "sage" },
    { n: "Quipes de res", d: "Seis unidades con salsa de ajo", p: "RD$290", t: "sun" },
    { n: "Ceviche de dorado", d: "Limón, cebolla roja y cilantro", p: "RD$480", t: "cream" },
  ],
  "Platos fuertes": [
    { n: "La Bandera", d: "Arroz, habichuelas, carne guisada y ensalada", p: "RD$450", t: "coffee" },
    { n: "Mofongo de chicharrón", d: "Con caldo de pollo y ajo", p: "RD$520", t: "sand" },
    { n: "Pescado frito", d: "Con tostones y ensalada verde", p: "RD$780", t: "sun" },
  ],
  Bebidas: [
    { n: "Morir soñando", d: "Jugo de naranja y leche", p: "RD$180", t: "sun" },
    { n: "Limonada de menta", d: "Natural, sin azúcar añadida", p: "RD$150", t: "sage" },
  ],
};

export function MenuMock({ m }: P) {
  const cats = Object.keys(DISHES);
  const [cat, setCat] = useState(cats[1]);
  const list = (
    <div className="flex flex-col gap-3">
      {DISHES[cat].map((d) => (
        <div key={d.n} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_6px_20px_rgb(0_0_0/0.04)]">
          <Photo tone={d.t} icon={Utensils} iconSize={22} className="size-[74px] shrink-0 rounded-xl" />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-[15px] font-bold">{d.n}</span>
            <span className="text-[12.5px] leading-snug text-[#7A6E66]">{d.d}</span>
            <span className="text-[14px] font-bold text-[#B5481F]">{d.p}</span>
          </div>
        </div>
      ))}
    </div>
  );
  const tabs = (
    <div className="no-scrollbar flex gap-2 overflow-x-auto">
      {cats.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => setCat(c)}
          className={cx(
            "shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold",
            c === cat ? "bg-[#B5481F] text-white" : "bg-white text-[#6E625A] ring-1 ring-black/5",
          )}
        >
          {c}
        </button>
      ))}
    </div>
  );

  if (m)
    return (
      <div className="min-h-full bg-[#FBF6F1] text-[#2A1F19]">
        <div className="relative">
          <Photo tone="sun" icon={Utensils} iconSize={60} className="h-[190px]" />
          <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-4 left-5 text-white">
            <span className="text-[26px] font-bold tracking-[-0.03em]">La Terraza</span>
            <div className="flex items-center gap-2 text-[12px] text-white/85">
              <Clock size={13} /> Abierto · Cierra 11:00 p. m.
            </div>
          </div>
        </div>
        <div className="sticky top-0 z-10 bg-[#FBF6F1] px-4 pt-4 pb-3">{tabs}</div>
        <div className="px-4 pb-10">{list}</div>
      </div>
    );

  return (
    <div className="grid min-h-full grid-cols-[380px_1fr] bg-[#FBF6F1] text-[#2A1F19]">
      <div className="flex flex-col items-center justify-center gap-6 bg-[#2A1F19] p-10 text-center text-white">
        <Logo icon={Utensils} name="La Terraza" color="#B5481F" className="text-[22px]" light />
        <div className="rounded-3xl bg-white p-4 shadow-2xl">
          <FakeQr size={190} />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[20px] font-bold">Escanea y mira el menú</span>
          <span className="text-[14px] text-white/60">Apunta la cámara de tu celular al código de tu mesa</span>
        </div>
        <span className="rounded-full bg-white/10 px-4 py-2 text-[13px]">Mesa 12</span>
      </div>
      <div className="flex flex-col gap-5 p-10">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[13px] font-bold tracking-[0.12em] text-[#B5481F] uppercase">Menú digital</span>
            <h1 className="text-[36px] font-bold tracking-[-0.03em]">Comida criolla, hecha con cariño</h1>
          </div>
        </div>
        {tabs}
        <div className="grid grid-cols-2 gap-3">
          {DISHES[cat].map((d) => (
            <div key={d.n} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_6px_20px_rgb(0_0_0/0.04)]">
              <Photo tone={d.t} icon={Utensils} iconSize={22} className="size-[80px] shrink-0 rounded-xl" />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-[15px] font-bold">{d.n}</span>
                <span className="text-[12.5px] leading-snug text-[#7A6E66]">{d.d}</span>
                <span className="text-[14px] font-bold text-[#B5481F]">{d.p}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Portfolio / CV ───────────────────────── */

export function PortfolioMock({ m }: P) {
  return (
    <div className="min-h-full bg-[#F7F6F3] text-[#141414]">
      <nav className={cx("flex items-center justify-between", m ? "px-5 py-4" : "px-16 py-6")}>
        <span className="text-[18px] font-bold tracking-[-0.03em]">laura.méndez</span>
        {m ? (
          <Menu size={22} />
        ) : (
          <div className="flex items-center gap-8 text-[14px] font-medium text-[#555]">
            <span>Proyectos</span>
            <span>Experiencia</span>
            <span>Sobre mí</span>
            <span className="rounded-full bg-[#141414] px-5 py-2.5 text-white">Contáctame</span>
          </div>
        )}
      </nav>
      <section className={cx("flex", m ? "flex-col gap-6 px-5 pt-4 pb-10" : "items-center gap-14 px-16 pt-10 pb-16")}>
        <div className="flex flex-1 flex-col gap-5">
          <span className="flex w-fit items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold shadow-sm">
            <span className="size-2 rounded-full bg-[#22C55E]" /> Disponible para proyectos
          </span>
          <h1 className={cx("leading-[1.02] font-bold tracking-[-0.045em]", m ? "text-[40px]" : "text-[68px]")}>
            Diseño productos digitales que la gente <span className="text-[#6F55D6]">disfruta usar.</span>
          </h1>
          <p className={cx("text-[#666]", m ? "text-[15px]" : "text-[18px]")}>
            Diseñadora UX/UI con 6 años de experiencia en banca, salud y e-commerce.
          </p>
          <div className="flex gap-3">
            <span className="flex h-12 items-center gap-2 rounded-full bg-[#141414] px-6 text-[15px] font-semibold text-white">
              Ver proyectos
            </span>
            <span className="flex h-12 items-center gap-2 rounded-full border border-[#DDD] px-5 text-[15px] font-semibold">
              <Download size={16} /> CV
            </span>
          </div>
        </div>
        <Photo
          tone="lilac"
          icon={User}
          iconSize={m ? 70 : 100}
          className={cx("shrink-0 rounded-[36px]", m ? "h-[300px] w-full" : "h-[420px] w-[360px]")}
        />
      </section>
      <section className={cx("flex flex-col gap-6", m ? "px-5 pb-10" : "px-16 pb-16")}>
        <h2 className={cx("font-bold tracking-[-0.03em]", m ? "text-[26px]" : "text-[34px]")}>Proyectos destacados</h2>
        <div className={cx("grid gap-5", m ? "" : "grid-cols-2")}>
          {[
            { t: "App de banca móvil", c: "UX/UI · 2026", tone: "sky" as const },
            { t: "Tienda de cosméticos", c: "E-commerce · 2025", tone: "rose" as const },
            { t: "Portal de pacientes", c: "Salud · 2025", tone: "teal" as const },
            { t: "Marca para cafetería", c: "Branding · 2024", tone: "coffee" as const },
          ].map((p) => (
            <div key={p.t} className="group flex flex-col gap-3">
              <Photo tone={p.tone} icon={Palette} iconSize={44} className={cx("rounded-3xl", m ? "h-[200px]" : "h-[280px]")} />
              <div className="flex items-center justify-between px-1">
                <div className="flex flex-col">
                  <span className="text-[17px] font-bold">{p.t}</span>
                  <span className="text-[13px] text-[#888]">{p.c}</span>
                </div>
                <span className="grid size-10 place-items-center rounded-full bg-white shadow-sm">
                  <ArrowUpRight size={18} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className={cx(m ? "px-5 pb-12" : "px-16 pb-20")}>
        <div className="flex flex-col gap-1 rounded-3xl bg-white p-6">
          <span className="mb-3 text-[20px] font-bold">Experiencia</span>
          {[
            ["Diseñadora UX Senior", "Banco Popular · 2023 — hoy"],
            ["Diseñadora UI", "Agencia Pixel · 2020 — 2023"],
            ["Diseñadora gráfica", "Freelance · 2018 — 2020"],
          ].map(([r, c]) => (
            <div key={r} className="flex items-center justify-between border-b border-[#F0EFEB] py-3 last:border-0">
              <span className="text-[15px] font-semibold">{r}</span>
              <span className="text-[13px] text-[#888]">{c}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ───────────────────────── Extra pages ───────────────────────── */

export function PagesMock({ m }: P) {
  const pages = ["Inicio", "Nosotros", "Galería", "Menú", "Contacto"];
  const added = ["Nosotros", "Galería", "Menú"];
  return (
    <div className="min-h-full bg-[#FBF7F2] text-[#2A1C14]">
      <nav
        className={cx(
          "sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-white/90 backdrop-blur",
          m ? "px-5 py-3.5" : "px-14 py-4",
        )}
      >
        <Logo icon={Coffee} name="Café Colonial" color={COFFEE} className="text-[17px]" />
        {!m && (
          <div className="flex items-center gap-6 text-[14px] font-medium text-[#5C4A3E]">
            {pages.map((p) => (
              <span key={p} className={cx("relative", p === "Galería" && "text-[#7A4A2E]")}>
                {p}
                {added.includes(p) && (
                  <span className="absolute -top-3 -right-5 rounded-full bg-[#4A90F7] px-1.5 text-[9px] font-bold text-white">
                    NUEVA
                  </span>
                )}
                {p === "Galería" && <span className="absolute -bottom-[18px] left-0 h-[2px] w-full bg-[#7A4A2E]" />}
              </span>
            ))}
          </div>
        )}
        {m && <Menu size={22} />}
      </nav>
      {m && (
        <div className="flex flex-col gap-1 border-b border-black/5 bg-white px-5 py-3">
          {pages.map((p) => (
            <span
              key={p}
              className={cx(
                "flex items-center justify-between py-2 text-[15px] font-medium",
                p === "Galería" && "text-[#7A4A2E]",
              )}
            >
              {p}
              {added.includes(p) && (
                <span className="rounded-full bg-[#EAF2FE] px-2 py-0.5 text-[10px] font-bold text-[#2C6FD8]">NUEVA</span>
              )}
            </span>
          ))}
        </div>
      )}
      <section className={cx("flex flex-col gap-2", m ? "px-5 pt-8 pb-5" : "px-14 pt-14 pb-8")}>
        <span className="text-[13px] font-bold tracking-[0.12em] text-[#7A4A2E] uppercase">Galería</span>
        <h1 className={cx("font-bold tracking-[-0.04em]", m ? "text-[32px]" : "text-[48px]")}>Momentos en Café Colonial</h1>
        <p className="text-[15px] text-[#6B5848]">
          Cada página nueva tiene su propio diseño y contenido: aquí, fotos del local y del menú.
        </p>
      </section>
      <section className={cx("grid gap-3", m ? "grid-cols-2 px-5 pb-12" : "grid-cols-4 px-14 pb-16")}>
        {(["coffee", "cream", "sand", "sun", "rose", "coffee", "sage", "cream"] as const).map((t, i) => (
          <Photo
            key={i}
            tone={t}
            icon={i % 2 ? Croissant : Coffee}
            iconSize={30}
            className={cx("rounded-2xl", i % 3 === 0 ? (m ? "h-[220px]" : "h-[280px]") : m ? "h-[160px]" : "h-[200px]")}
          />
        ))}
      </section>
    </div>
  );
}

/* ───────────────────────── Multilanguage ───────────────────────── */

const TEXT = {
  es: {
    nav: ["Habitaciones", "Experiencias", "Contacto"],
    eyebrow: "Hotel boutique en Las Terrenas",
    h1: "Despierta frente al mar Caribe.",
    p: "Doce habitaciones, desayuno incluido y la playa a 20 pasos.",
    cta: "Reservar ahora",
    cards: [
      ["Suites con vista", "Balcón privado y amaneceres incluidos."],
      ["Excursiones", "Ballenas, cascadas y cayos cercanos."],
      ["Restaurante", "Pescado fresco y cocina local."],
    ],
  },
  en: {
    nav: ["Rooms", "Experiences", "Contact"],
    eyebrow: "Boutique hotel in Las Terrenas",
    h1: "Wake up facing the Caribbean Sea.",
    p: "Twelve rooms, breakfast included and the beach 20 steps away.",
    cta: "Book now",
    cards: [
      ["Ocean-view suites", "Private balcony, sunrises included."],
      ["Tours", "Whales, waterfalls and nearby islands."],
      ["Restaurant", "Fresh fish and local cuisine."],
    ],
  },
};

export function LanguageMock({ m }: P) {
  const [lang, setLang] = useState<"es" | "en">("en");
  const t = TEXT[lang];
  const toggle = (
    <div className="flex rounded-full bg-white/20 p-1 text-[12px] font-bold backdrop-blur">
      {(["es", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          className={cx("rounded-full px-3 py-1 uppercase", l === lang ? "bg-white text-[#0B4F6C]" : "text-white")}
        >
          {l}
        </button>
      ))}
    </div>
  );
  return (
    <div className="min-h-full bg-white text-[#0E2430]">
      <div className="relative">
        <Photo tone="sky" icon={Sparkles} iconSize={m ? 60 : 100} className={m ? "h-[460px]" : "h-[480px]"} />
        <div className="absolute inset-0 bg-linear-to-b from-[#0B4F6C]/60 via-[#0B4F6C]/30 to-[#0B4F6C]/70" />
        <nav
          className={cx("absolute inset-x-0 top-0 flex items-center justify-between text-white", m ? "px-5 py-4" : "px-14 py-6")}
        >
          <span className="text-[19px] font-bold tracking-[-0.02em]">Casa Brisa</span>
          <div className="flex items-center gap-7 text-[14px] font-medium">
            {!m && t.nav.map((n) => <span key={n}>{n}</span>)}
            {toggle}
          </div>
        </nav>
        <div className={cx("absolute inset-0 flex flex-col justify-end gap-4 text-white", m ? "p-5 pb-8" : "max-w-[700px] p-14")}>
          <span className="text-[13px] font-semibold tracking-[0.12em] uppercase">{t.eyebrow}</span>
          <h1 className={cx("leading-[1.03] font-bold tracking-[-0.04em]", m ? "text-[38px]" : "text-[60px]")}>{t.h1}</h1>
          <p className="text-[16px] text-white/85">{t.p}</p>
          <span className="flex h-12 w-fit items-center rounded-full bg-white px-6 text-[15px] font-semibold text-[#0B4F6C]">
            {t.cta}
          </span>
        </div>
      </div>
      <section className={cx("grid gap-4", m ? "p-5 pb-12" : "grid-cols-3 p-14")}>
        {t.cards.map(([h, d], i) => (
          <div key={i} className="flex flex-col gap-3">
            <Photo tone={(["teal", "sage", "sun"] as const)[i]} icon={Sparkles} className="h-[170px] rounded-2xl" />
            <span className="text-[17px] font-bold">{h}</span>
            <span className="text-[14px] text-[#5A6B73]">{d}</span>
          </div>
        ))}
      </section>
      <p className="pb-10 text-center text-[12px] text-[#8A9AA2]">Toca ES / EN arriba para cambiar el idioma</p>
    </div>
  );
}

/* ───────────────────────── Blog ───────────────────────── */

export function BlogMock({ m }: P) {
  const posts = [
    { t: "5 errores al elegir tu primer café de especialidad", c: "Guías", tone: "coffee" as const },
    { t: "Cómo tostamos nuestros granos de Jarabacoa", c: "Detrás de cámaras", tone: "sand" as const },
    { t: "Receta: cold brew en casa en 3 pasos", c: "Recetas", tone: "sky" as const },
    { t: "Nuevo horario de diciembre", c: "Noticias", tone: "rose" as const },
  ];
  return (
    <div className="min-h-full bg-white text-[#1D1712]">
      <CafeNav m={m} />
      <section className={cx(m ? "px-5 pb-6" : "px-14 pb-10")}>
        <span className="text-[13px] font-bold tracking-[0.12em] text-[#7A4A2E] uppercase">Blog</span>
        <h1 className={cx("font-bold tracking-[-0.04em]", m ? "text-[34px]" : "text-[50px]")}>Historias con aroma</h1>
      </section>
      <section className={cx("grid gap-6", m ? "px-5 pb-8" : "grid-cols-[1.4fr_1fr] px-14 pb-12")}>
        <div className="flex flex-col gap-4">
          <Photo tone="coffee" icon={Coffee} iconSize={70} className={cx("rounded-3xl", m ? "h-[230px]" : "h-[340px]")} />
          <span className="text-[13px] font-semibold text-[#7A4A2E]">Destacado · 4 min de lectura</span>
          <span className={cx("leading-tight font-bold tracking-[-0.03em]", m ? "text-[24px]" : "text-[32px]")}>
            Del campo a tu taza: el viaje de nuestro café
          </span>
          <span className="text-[15px] text-[#6B5848]">
            Visitamos a las familias productoras de Jarabacoa que hacen posible cada taza que servimos.
          </span>
          <div className="flex items-center gap-3">
            <Photo tone="rose" className="size-9 rounded-full" />
            <span className="text-[13px] text-[#6B5848]">
              <b className="text-[#1D1712]">Laura Méndez</b> · 18 nov 2026
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {posts.map((p) => (
            <div key={p.t} className="flex items-center gap-4 border-b border-[#F1EBE4] pb-4 last:border-0">
              <Photo tone={p.tone} className="size-[86px] shrink-0 rounded-2xl" />
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-semibold text-[#7A4A2E]">{p.c}</span>
                <span className="text-[15px] leading-snug font-bold">{p.t}</span>
                <span className="text-[12px] text-[#9A8878]">3 min</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ───────────────────────── Copywriting & product photos ───────────────────────── */

export function ContentMock({ m }: P) {
  return (
    <div className="min-h-full bg-[#FAFAF7] text-[#1C2620]">
      <header
        className={cx("flex items-center justify-between border-b border-black/5 bg-white", m ? "px-5 py-3.5" : "px-12 py-4")}
      >
        <Logo icon={Leaf} name="Bambú Home" color={SAGE} className="text-[17px]" />
        <ShoppingBag size={21} />
      </header>
      <section className={cx("grid", m ? "gap-5 p-4 pb-12" : "grid-cols-[1.1fr_1fr] gap-12 p-12")}>
        <div className="flex flex-col gap-3">
          <Photo tone="sand" icon={Lamp} iconSize={m ? 80 : 120} className={cx("rounded-3xl", m ? "h-[340px]" : "h-[480px]")} />
          <div className="grid grid-cols-4 gap-3">
            {(["sand", "cream", "sage", "coffee"] as const).map((t, i) => (
              <Photo
                key={i}
                tone={t}
                icon={Lamp}
                iconSize={20}
                className={cx("h-[78px] rounded-xl", i === 0 && "ring-2 ring-[#3F6B4E]")}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-[13px] font-semibold text-[#3F6B4E]">Iluminación · Hecho a mano</span>
          <h1 className={cx("leading-tight font-bold tracking-[-0.03em]", m ? "text-[28px]" : "text-[40px]")}>
            Lámpara colgante de ratán natural
          </h1>
          <div className="flex items-center gap-2 text-[13px] text-[#5E6A61]">
            <Stars size={14} /> 4.9 · 86 reseñas
          </div>
          <span className="text-[28px] font-bold">RD$3,450</span>
          <p className="text-[15px] leading-relaxed text-[#4A564D]">
            Tejida a mano por artesanas de Moca, esta lámpara llena tu sala de una luz cálida y tamizada. Ligera, resistente y
            perfecta sobre la mesa del comedor.
          </p>
          <ul className="flex flex-col gap-2 text-[14px]">
            {[
              "Ratán 100 % natural, acabado mate",
              "45 cm de diámetro · bombillo E27 incluido",
              "Envío en 24 h en Santo Domingo",
            ].map((b) => (
              <li key={b} className="flex items-center gap-2">
                <Check size={16} className="text-[#3F6B4E]" /> {b}
              </li>
            ))}
          </ul>
          <div className="flex gap-3 pt-2">
            <span
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full text-[15px] font-semibold text-white"
              style={{ background: SAGE }}
            >
              <ShoppingBag size={17} /> Agregar al carrito
            </span>
            <span className="grid size-12 place-items-center rounded-full ring-1 ring-black/10">
              <Heart size={18} />
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ───────────────────────── SEO & business profile ───────────────────────── */

export function SeoMock({ m }: P) {
  const profile = (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[#DADCE0] bg-white">
      <div className="grid h-[150px] grid-cols-[2fr_1fr] gap-0.5">
        <Photo tone="coffee" icon={Coffee} />
        <div className="grid grid-rows-2 gap-0.5">
          <Photo tone="cream" />
          <Photo tone="sand" />
        </div>
      </div>
      <div className="flex flex-col gap-2 p-4">
        <span className="text-[22px] font-semibold">Café Colonial</span>
        <span className="flex items-center gap-1.5 text-[13px] text-[#4D5156]">
          4.9 <Stars size={12} /> (1,214) · Cafetería · $$
        </span>
        <div className="mt-1 grid grid-cols-4 gap-2 border-y border-[#EBEBEB] py-3 text-center text-[12px] text-[#1A73E8]">
          {[
            [MapPin, "Cómo llegar"],
            [Phone, "Llamar"],
            [ArrowUpRight, "Sitio web"],
            [Heart, "Guardar"],
          ].map(([I, l]) => {
            const Ico = I as typeof MapPin;
            return (
              <span key={l as string} className="flex flex-col items-center gap-1">
                <span className="grid size-9 place-items-center rounded-full border border-[#DADCE0]">
                  <Ico size={16} />
                </span>
                {l as string}
              </span>
            );
          })}
        </div>
        <span className="text-[13px] text-[#4D5156]">
          <b>Dirección:</b> Calle El Conde 105, Zona Colonial
        </span>
        <span className="text-[13px] text-[#4D5156]">
          <b className="text-[#188038]">Abierto</b> · Cierra a las 9 p. m.
        </span>
        <span className="text-[13px] text-[#4D5156]">
          <b>Teléfono:</b> (809) 555-0123
        </span>
      </div>
      <div
        className="relative h-[120px] bg-[#E8EEE4]"
        style={{
          backgroundImage: "linear-gradient(#fff 2px, transparent 2px), linear-gradient(90deg, #fff 2px, transparent 2px)",
          backgroundSize: "38px 38px",
        }}
      >
        <MapPin
          size={34}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full fill-[#EA4335] text-[#B3261E]"
        />
      </div>
    </div>
  );
  const results = (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-1 rounded-2xl bg-[#F3F8FF] p-4 ring-2 ring-[#4A90F7]">
        <span className="mb-1 w-fit rounded-full bg-[#4A90F7] px-2 py-0.5 text-[10px] font-bold text-white">TU NEGOCIO · #1</span>
        <span className="flex items-center gap-2 text-[13px] text-[#202124]">
          <span className="grid size-6 place-items-center rounded-full bg-[#7A4A2E] text-white">
            <Coffee size={13} />
          </span>{" "}
          cafecolonial.com
        </span>
        <span className="text-[19px] text-[#1A0DAB]">Café Colonial · El mejor café de la Zona Colonial</span>
        <span className="text-[14px] text-[#4D5156]">
          Café de especialidad dominicano, desayunos y postres. Abierto todos los días de 7 a. m. a 9 p. m. Reserva tu mesa.
        </span>
        <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-[14px] text-[#1A0DAB]">
          <span>Menú</span>
          <span>Reservas</span>
          <span>Ubicación</span>
        </div>
      </div>
      {["Los 10 mejores cafés de Santo Domingo", "Cafeterías en la Zona Colonial · Guía 2026"].map((t) => (
        <div key={t} className="flex flex-col gap-1.5 opacity-70">
          <Bar w="30%" />
          <span className="text-[18px] text-[#1A0DAB]">{t}</span>
          <Bar w="95%" />
          <Bar w="70%" />
        </div>
      ))}
    </div>
  );
  return (
    <div className="min-h-full bg-white text-[#202124]">
      <div
        className={cx(
          "flex items-center gap-5 border-b border-[#EBEBEB]",
          m ? "flex-col items-stretch gap-3 px-4 pt-3 pb-3" : "px-8 py-5",
        )}
      >
        <span className="text-[22px] font-bold tracking-[-0.03em] text-[#4A90F7]">Buscador</span>
        <span
          className={cx(
            "flex h-11 items-center gap-3 rounded-full px-5 text-[15px] shadow-[0_1px_6px_rgb(32_33_36/0.28)]",
            m ? "" : "w-[620px]",
          )}
        >
          café zona colonial <Search size={18} className="ml-auto text-[#4A90F7]" />
        </span>
      </div>
      {!m && (
        <div className="flex gap-6 border-b border-[#EBEBEB] px-12 py-2.5 text-[13px] text-[#5F6368]">
          <b className="text-[#1A73E8]">Todo</b>
          <span>Mapas</span>
          <span>Imágenes</span>
          <span>Noticias</span>
        </div>
      )}
      <div className={cx(m ? "flex flex-col gap-6 p-4 pb-12" : "grid grid-cols-[1fr_380px] gap-12 px-12 py-6")}>
        {m ? (
          <>
            {profile}
            {results}
          </>
        ) : (
          <>
            {results}
            {profile}
          </>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── Domain + hosting ───────────────────────── */

export function DomainMock({ m }: P) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 bg-linear-to-b from-[#F4F8FF] to-white p-6 text-[#0E0F12]">
      <div
        className={cx(
          "flex w-full flex-col items-center gap-5 rounded-[32px] bg-white text-center shadow-[0_30px_80px_rgb(44_111_216/0.12)]",
          m ? "p-6" : "max-w-[720px] p-12",
        )}
      >
        <span className="grid size-16 place-items-center rounded-3xl bg-[#EAF2FE] text-[#2C6FD8]">
          <ShieldCheck size={32} />
        </span>
        <span className="text-[14px] font-semibold text-[#8A8F98]">Tu dirección en internet</span>
        <span className={cx("font-bold tracking-[-0.04em]", m ? "text-[30px]" : "text-[54px]")}>
          <span className="text-[#1E8A4C]">https://</span>cafecolonial.com
        </span>
        <div className={cx("grid w-full gap-3", m ? "" : "grid-cols-3")}>
          {[
            [Check, "Dominio registrado", "Hasta nov. 2027"],
            [Lock, "Candado SSL activo", "Conexión segura"],
            [ShieldCheck, "Hosting en línea", "99.9 % del tiempo"],
          ].map(([I, t, d]) => {
            const Ico = I as typeof Check;
            return (
              <div key={t as string} className="flex items-center gap-3 rounded-2xl bg-[#F5F8F6] p-4 text-left">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#1E8A4C] text-white">
                  <Ico size={17} />
                </span>
                <div className="flex flex-col">
                  <span className="text-[14px] font-semibold">{t as string}</span>
                  <span className="text-[12px] text-[#6B7079]">{d as string}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <p className="max-w-[460px] text-center text-[14px] text-[#6B7079]">
        Tus clientes escriben tu nombre en el navegador y llegan directo a tu web, con el candado de seguridad.
      </p>
    </div>
  );
}

/* ───────────────────────── Login ───────────────────────── */

export function LoginMock({ m }: P) {
  const form = (
    <div className={cx("flex w-full flex-col gap-4", !m && "max-w-[380px]")}>
      <div className="flex flex-col gap-1.5">
        <span className={cx("font-bold tracking-[-0.03em]", m ? "text-[28px]" : "text-[32px]")}>Bienvenida de nuevo</span>
        <span className="text-[15px] text-[#6B7079]">Entra para ver tus pedidos y puntos.</span>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold">Correo</span>
        <span className="flex h-12 items-center rounded-xl bg-[#F4F5F7] px-4 text-[15px]">ana@correo.com</span>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="flex justify-between text-[13px] font-semibold">
          Contraseña <span className="font-medium text-[#7A4A2E]">¿La olvidaste?</span>
        </span>
        <span className="flex h-12 items-center rounded-xl bg-[#F4F5F7] px-4 text-[18px] tracking-[0.2em]">••••••••</span>
      </label>
      <span className="flex items-center gap-2 text-[14px] text-[#3A3D44]">
        <span className="grid size-5 place-items-center rounded-md bg-[#7A4A2E] text-white">
          <Check size={13} strokeWidth={3} />
        </span>{" "}
        Recordarme
      </span>
      <span
        className="flex h-12 items-center justify-center rounded-xl text-[15px] font-semibold text-white"
        style={{ background: COFFEE }}
      >
        Iniciar sesión
      </span>
      <div className="flex items-center gap-3 text-[12px] text-[#8A8F98]">
        <span className="h-px flex-1 bg-[#ECEDF0]" /> o <span className="h-px flex-1 bg-[#ECEDF0]" />
      </div>
      <span className="flex h-12 items-center justify-center gap-2 rounded-xl text-[15px] font-semibold ring-1 ring-[#DADCE0]">
        <Mail size={17} /> Entrar con un enlace al correo
      </span>
      <span className="text-center text-[14px] text-[#6B7079]">
        ¿No tienes cuenta? <b className="text-[#7A4A2E]">Regístrate</b>
      </span>
    </div>
  );
  if (m)
    return (
      <div className="flex min-h-full flex-col gap-8 bg-white px-6 pt-6 pb-12">
        <Logo icon={Coffee} name="Café Colonial" color={COFFEE} className="text-[17px]" />
        {form}
      </div>
    );
  return (
    <div className="grid min-h-full grid-cols-2 bg-white">
      <div className="relative">
        <Photo tone="coffee" icon={Coffee} iconSize={120} className="absolute inset-0" />
        <div className="absolute inset-0 flex flex-col justify-between bg-linear-to-t from-black/60 to-transparent p-12 text-white">
          <Logo icon={Coffee} name="Café Colonial" color="#00000055" className="text-[19px]" light />
          <div className="flex flex-col gap-3">
            <span className="text-[34px] leading-tight font-bold tracking-[-0.03em]">
              Tu café favorito, ahora con recompensas.
            </span>
            <span className="text-[15px] text-white/80">Cada 10 cafés, el siguiente va por la casa.</span>
          </div>
        </div>
      </div>
      <div className="grid place-items-center p-12">{form}</div>
    </div>
  );
}

/* ───────────────────────── Online payments ───────────────────────── */

export function PaymentsMock({ m }: P) {
  const [paid, setPaid] = useState(false);
  if (paid)
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-[#F6FBF8] p-8 text-center">
        <span className="grid size-20 place-items-center rounded-full bg-[#1E8A4C] text-white shadow-[0_15px_40px_rgb(30_138_76/0.35)]">
          <Check size={40} strokeWidth={3} />
        </span>
        <span className="text-[28px] font-bold tracking-[-0.03em]">¡Pago recibido!</span>
        <span className="text-[15px] text-[#5B6070]">
          Pedido #1043 · RD$4,700
          <br />
          Te enviamos el recibo a tu correo.
        </span>
        <button type="button" onClick={() => setPaid(false)} className="mt-2 text-[14px] font-semibold text-[#2C6FD8]">
          Ver de nuevo
        </button>
      </div>
    );
  const summary = (
    <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-[0_10px_30px_rgb(14_15_18/0.06)]">
      <span className="text-[17px] font-bold">Tu pedido</span>
      {PRODUCTS.slice(0, 2).map((p) => (
        <div key={p.n} className="flex items-center gap-3">
          <Photo tone={p.t} icon={p.i} iconSize={20} className="size-14 rounded-xl" />
          <span className="flex-1 text-[14px] font-medium">{p.n}</span>
          <span className="text-[14px] font-semibold">{p.p}</span>
        </div>
      ))}
      <div className="flex flex-col gap-1.5 border-t border-[#F0F1F3] pt-3 text-[14px] text-[#5B6070]">
        <span className="flex justify-between">
          <span>Subtotal</span>
          <span>RD$4,700</span>
        </span>
        <span className="flex justify-between">
          <span>Envío</span>
          <span className="text-[#1E8A4C]">Gratis</span>
        </span>
        <span className="flex justify-between pt-1 text-[17px] font-bold text-[#0E0F12]">
          <span>Total</span>
          <span>RD$4,700</span>
        </span>
      </div>
    </div>
  );
  return (
    <div className="min-h-full bg-[#F5F6F8] text-[#0E0F12]">
      <header className={cx("flex items-center justify-between bg-white", m ? "px-5 py-3.5" : "px-12 py-4")}>
        <Logo icon={Leaf} name="Bambú Home" color={SAGE} className="text-[17px]" />
        <span className="flex items-center gap-1.5 text-[13px] font-medium text-[#1E8A4C]">
          <Lock size={14} /> Pago seguro
        </span>
      </header>
      <div className={cx(m ? "flex flex-col gap-4 p-4 pb-12" : "grid grid-cols-[1.3fr_1fr] gap-8 p-12")}>
        <div className="flex flex-col gap-5 rounded-3xl bg-white p-6 shadow-[0_10px_30px_rgb(14_15_18/0.06)]">
          <span className="text-[20px] font-bold tracking-[-0.02em]">Método de pago</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              ["Tarjeta", true],
              ["PayPal", false],
              ["Transferencia", false],
            ].map(([l, on]) => (
              <span
                key={l as string}
                className={cx(
                  "flex h-12 items-center justify-center gap-1.5 rounded-xl text-[13px] font-semibold",
                  on ? "bg-[#EAF2FE] text-[#2C6FD8] ring-2 ring-[#4A90F7]" : "ring-1 ring-[#E1E3E7]",
                )}
              >
                {on ? <CreditCard size={16} /> : null}
                {l as string}
              </span>
            ))}
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#1F2937] to-[#0E0F12] p-5 text-white">
            <span className="absolute -top-10 -right-10 size-40 rounded-full bg-white/5" />
            <div className="flex justify-between text-[12px] text-white/60">
              <span>Tarjeta de crédito o débito</span>
              <span className="font-bold text-white">VISA</span>
            </div>
            <span className="mt-6 block text-[20px] tracking-[0.15em]">•••• •••• •••• 4242</span>
            <div className="mt-3 flex justify-between text-[12px] text-white/70">
              <span>ANA RODRÍGUEZ</span>
              <span>08/29</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <span className="flex h-12 items-center rounded-xl bg-[#F4F5F7] px-4 text-[14px]">08 / 29</span>
            <span className="flex h-12 items-center rounded-xl bg-[#F4F5F7] px-4 text-[14px]">CVV •••</span>
          </div>
          <button
            type="button"
            onClick={() => setPaid(true)}
            className="flex h-13 items-center justify-center gap-2 rounded-xl bg-[#0E0F12] py-3.5 text-[15px] font-semibold text-white"
          >
            <Lock size={16} /> Pagar RD$4,700
          </button>
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold text-[#8A8F98]">
            {["Azul", "CardNet", "PayPal", "Visa", "Mastercard"].map((b) => (
              <span key={b} className="rounded-md bg-[#F4F5F7] px-2 py-1">
                {b}
              </span>
            ))}
          </div>
        </div>
        {summary}
      </div>
    </div>
  );
}
