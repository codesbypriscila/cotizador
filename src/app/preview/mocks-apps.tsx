"use client";

import {
  Activity,
  Archive,
  Bell,
  BellRing,
  Bike,
  Boxes,
  ChartColumn,
  Check,
  CircleCheck,
  Clock,
  Coffee,
  CreditCard,
  Database,
  FileText,
  Globe,
  HardDrive,
  Headphones,
  House,
  Images,
  Inbox,
  LayoutDashboard,
  Leaf,
  Lock,
  MessageCircle,
  Minus,
  Package,
  PackagePlus,
  Pencil,
  Pizza,
  Plus,
  Receipt,
  RefreshCw,
  Salad,
  Search,
  Send,
  Server,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Tag,
  TrendingUp,
  TriangleAlert,
  Truck,
  User,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { cx } from "@/components/ui";
import { AppShell, ChatList, type ChatMessage, ChatThread, Kpi, Logo, Photo, Pill } from "./kit";

type P = { m: boolean };

/* ───────────────────────── WhatsApp chatbot ───────────────────────── */

const BOT_MESSAGES: ChatMessage[] = [
  { from: "them", text: "Hola, ¿tienen delivery hoy? 🙂", time: "10:02" },
  {
    from: "me",
    text: "¡Hola, Juan! 👋 Soy el asistente de Café Colonial.\n¿Qué deseas hacer?\n\n1️⃣ Ver el menú\n2️⃣ Hacer un pedido\n3️⃣ Horario y ubicación",
    time: "10:02",
  },
  { from: "them", text: "2", time: "10:03" },
  { from: "me", text: "¡Perfecto! Escribe lo que quieres pedir 📝", time: "10:03" },
  { from: "them", text: "2 capuchinos y un croissant", time: "10:03" },
  {
    from: "me",
    card: (
      <div className="flex flex-col gap-1.5 rounded-lg bg-white/70 p-2.5 text-[13px]">
        <span className="font-semibold">🧾 Pedido #1043</span>
        <span className="flex justify-between gap-6">
          <span>2 × Capuchino</span>
          <span>RD$380</span>
        </span>
        <span className="flex justify-between gap-6">
          <span>1 × Croissant</span>
          <span>RD$150</span>
        </span>
        <span className="flex justify-between gap-6 border-t border-black/10 pt-1 font-semibold">
          <span>Total</span>
          <span>RD$530</span>
        </span>
      </div>
    ),
    text: "✅ Pedido confirmado. Llega en 25–30 min a tu dirección guardada.",
    time: "10:04",
  },
  { from: "them", text: "Genial, gracias 🙌", time: "10:04" },
];

export function ChatbotMock({ m }: P) {
  const thread = (
    <ChatThread
      m={m}
      title="Juan Pérez"
      subtitle="Atendido por el asistente automático"
      avatar={<Photo tone="sky" className="size-10 shrink-0 rounded-full" />}
      messages={BOT_MESSAGES}
    />
  );
  if (m) return thread;
  return (
    <div className="flex min-h-full">
      <ChatList
        title="Café Colonial"
        items={[
          { name: "Juan Pérez", last: "Genial, gracias 🙌", time: "10:04", tag: "🤖 Bot", tone: "sky", active: true },
          { name: "María Fernández", last: "Pedido #1042 confirmado", time: "9:51", tag: "🤖 Bot", tone: "rose" },
          { name: "Carlos Santana", last: "¿Abren el domingo?", time: "9:30", unread: 1, tone: "sage" },
          { name: "Ana Rodríguez", last: "Reserva para 4 personas ✅", time: "Ayer", tag: "🤖 Bot", tone: "sun" },
          { name: "Luis Peña", last: "Gracias por la info", time: "Ayer", tone: "lilac" },
        ]}
      />
      <div className="flex min-w-0 flex-1 flex-col">{thread}</div>
    </div>
  );
}

/* ───────────────────────── WhatsApp notifications ───────────────────────── */

const NOTIFS = [
  { t: "Nueva reserva 📅", b: "María P. · Corte y peinado · Sáb 14, 10:30 a. m.", time: "ahora" },
  { t: "Pago recibido 💳", b: "Pedido #1043 · RD$530 pagado con tarjeta", time: "hace 5 min" },
  { t: "Recordatorio enviado ⏰", b: "A Juan R.: “Tu cita es mañana a las 3:00 p. m.”", time: "hace 1 h" },
];

export function NotifyMock({ m }: P) {
  if (m)
    return (
      <div className="relative flex min-h-full flex-col items-center gap-4 overflow-hidden px-3 pb-12">
        <Photo tone="lilac" className="absolute inset-0" />
        <div className="absolute inset-0 bg-linear-to-b from-[#3B2A7A]/40 to-[#120C2E]/70" />
        <div className="relative flex flex-col items-center pt-4 text-white">
          <span className="text-[16px] font-semibold opacity-90">viernes, 20 de noviembre</span>
          <span className="text-[86px] leading-none font-bold tracking-[-0.03em]">9:41</span>
        </div>
        <div className="relative mt-16 flex w-full flex-col gap-2">
          {NOTIFS.map((n) => (
            <div key={n.t} className="flex gap-3 rounded-[22px] bg-white/75 p-3.5 shadow-lg backdrop-blur-xl">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#25B35A] text-white">
                <MessageCircle size={21} fill="white" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex justify-between text-[13px]">
                  <b>{n.t}</b>
                  <span className="text-black/50">{n.time}</span>
                </div>
                <span className="text-[13.5px] leading-snug text-black/80">{n.b}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  return (
    <div className="relative flex min-h-full">
      <ChatList
        title="Studio Bella"
        items={[
          { name: "María Pérez", last: "✅ Tu cita quedó confirmada", time: "10:30", tag: "Auto", tone: "rose", active: true },
          { name: "Juan Rodríguez", last: "⏰ Recordatorio: mañana 3:00 p. m.", time: "9:00", tag: "Auto", tone: "sky" },
          { name: "Laura Gómez", last: "💳 Recibimos tu pago, ¡gracias!", time: "Ayer", tag: "Auto", tone: "sun" },
        ]}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <ChatThread
          m={false}
          title="María Pérez"
          subtitle="Mensajes automáticos de Studio Bella"
          avatar={<Photo tone="rose" className="size-10 shrink-0 rounded-full" />}
          messages={[
            {
              from: "me",
              text: "✅ ¡Hola, María! Tu cita quedó confirmada:\n\n💇‍♀️ Corte y peinado\n📅 Sábado 14 de noviembre\n🕥 10:30 a. m.\n📍 Studio Bella, Naco",
              time: "10:30",
            },
            { from: "them", text: "¡Perfecto, ahí estaré! 😊", time: "10:31" },
            {
              from: "me",
              text: "⏰ Recordatorio: tu cita es mañana a las 10:30 a. m. Responde 1 para confirmar o 2 para cambiarla.",
              time: "Vie 10:30",
            },
            { from: "them", text: "1", time: "Vie 10:45" },
          ]}
        />
      </div>
      <div className="absolute bottom-5 left-4 flex w-[330px] flex-col gap-2">
        <span className="px-1 text-[11px] font-semibold tracking-[0.08em] text-[#8A8F98] uppercase">Avisos para ti</span>
        {NOTIFS.slice(0, 2).map((n) => (
          <div
            key={n.t}
            className="flex gap-3 rounded-2xl bg-white/90 p-3 shadow-[0_15px_40px_rgb(0_0_0/0.18)] ring-1 ring-black/5 backdrop-blur"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#25B35A] text-white">
              <BellRing size={17} />
            </span>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold">{n.t}</span>
              <span className="text-[12px] text-[#5B6070]">{n.b}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── Priority support ───────────────────────── */

export function SupportMock({ m }: P) {
  return (
    <div className="flex min-h-full flex-col">
      <div className="flex items-center gap-2 bg-[#EAF2FE] px-4 py-2 text-[12.5px] font-semibold text-[#2C6FD8]">
        <Zap size={14} /> Soporte prioritario · Respuesta el mismo día
      </div>
      <ChatThread
        m={m}
        header="#1F3B73"
        title="Soporte · Priscila Pérez"
        subtitle="En línea · responde en minutos"
        avatar={
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/15">
            <Headphones size={19} />
          </span>
        }
        messages={[
          { from: "them", text: "Hola, el botón de reservas no abre en mi celular 😥", time: "10:02" },
          { from: "me", text: "¡Hola! Ya lo estoy revisando 🙌 Te aviso en un momento.", time: "10:09" },
          {
            from: "me",
            card: (
              <div className="flex items-center gap-2 rounded-lg bg-white/70 p-2.5 text-[13px]">
                <CircleCheck size={18} className="shrink-0 text-[#1E8A4C]" />
                <div className="flex flex-col">
                  <b>Ticket #218 · Resuelto</b>
                  <span className="text-[12px] text-[#5B6070]">Tiempo de respuesta: 39 min</span>
                </div>
              </div>
            ),
            text: "Listo ✅ Ya funciona en todos los celulares. Lo probé en iPhone y Android.",
            time: "10:41",
          },
          { from: "them", text: "¡Qué rapidez! Mil gracias 🙏", time: "10:43" },
        ]}
      />
    </div>
  );
}

/* ───────────────────────── Inventory ───────────────────────── */

const STOCK = [
  { sku: "FER-0142", n: "Martillo de uña 16 oz", c: "Herramientas", s: 48, max: 60 },
  { sku: "FER-0311", n: 'Tornillos 1/2" (caja 100)', c: "Tornillería", s: 6, max: 80 },
  { sku: "FER-0520", n: "Pintura blanca 1 gal", c: "Pinturas", s: 0, max: 40 },
  { sku: "FER-0087", n: "Cinta métrica 5 m", c: "Medición", s: 22, max: 30 },
  { sku: "FER-0733", n: 'Llave inglesa 10"', c: "Herramientas", s: 9, max: 25 },
  { sku: "FER-0402", n: "Cemento gris 42.5 kg", c: "Construcción", s: 115, max: 150 },
];

function stockState(s: number, max: number) {
  if (s === 0) return { l: "Agotado", c: "red" as const, bar: "#D64545" };
  if (s / max < 0.3) return { l: "Stock bajo", c: "amber" as const, bar: "#F0A020" };
  return { l: "Disponible", c: "green" as const, bar: "#1E8A4C" };
}

const INV_NAV = [
  { icon: LayoutDashboard, label: "Inicio" },
  { icon: Package, label: "Productos" },
  { icon: PackagePlus, label: "Entradas" },
  { icon: Truck, label: "Salidas" },
  { icon: ChartColumn, label: "Reportes" },
  { icon: Settings, label: "Ajustes" },
];

export function InventoryMock({ m }: P) {
  return (
    <AppShell
      m={m}
      accent="#E2611B"
      active={1}
      title="Inventario"
      brand={<Logo icon={Wrench} name="Ferretería Central" color="#E2611B" className="text-[15px]" />}
      nav={INV_NAV}
      actions={
        <span className="flex h-9 items-center gap-1.5 rounded-lg bg-[#E2611B] px-3 text-[13px] font-semibold text-white">
          <Plus size={15} /> {m ? "" : "Nuevo producto"}
        </span>
      }
    >
      <div className={cx("grid gap-3", m ? "grid-cols-2" : "grid-cols-4 gap-4")}>
        <Kpi m={m} label="Productos" value="1,248" icon={Boxes} color="#2C6FD8" delta="+32 este mes" />
        <Kpi m={m} label="Valor del stock" value="RD$2.4M" icon={TrendingUp} color="#1E8A4C" delta="+4.1 %" />
        <Kpi m={m} label="Stock bajo" value="12" icon={TriangleAlert} color="#E2611B" delta="Revisar hoy" bad />
        <Kpi m={m} label="Movimientos hoy" value="86" icon={Activity} color="#6F55D6" delta="54 salidas · 32 entradas" />
      </div>
      <div className="flex items-center gap-3 rounded-2xl bg-[#FFF4E8] p-4 text-[14px] text-[#9A4A12]">
        <TriangleAlert size={20} className="shrink-0" />
        <span>
          <b>Pintura blanca 1 gal</b> está agotada y <b>Tornillos 1/2&quot;</b> tiene solo 6 cajas.
        </span>
      </div>
      {m ? (
        <div className="flex flex-col gap-2">
          {STOCK.map((p) => {
            const st = stockState(p.s, p.max);
            return (
              <div key={p.sku} className="flex flex-col gap-2 rounded-2xl bg-white p-3.5 shadow-[0_6px_20px_rgb(14_15_18/0.04)]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[14px] font-semibold">{p.n}</span>
                  <Pill color={st.c}>{st.l}</Pill>
                </div>
                <div className="flex items-center gap-3 text-[12px] text-[#8A8F98]">
                  <span>{p.sku}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F0F1F3]">
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${(p.s / p.max) * 100}%`, background: st.bar }}
                    />
                  </span>
                  <b className="text-[#0E0F12]">{p.s} uds.</b>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_6px_20px_rgb(14_15_18/0.04)]">
          <div className="grid grid-cols-[110px_1fr_140px_220px_120px] gap-4 border-b border-[#F0F1F3] px-5 py-3 text-[12px] font-semibold text-[#8A8F98] uppercase">
            <span>SKU</span>
            <span>Producto</span>
            <span>Categoría</span>
            <span>Existencia</span>
            <span>Estado</span>
          </div>
          {STOCK.map((p) => {
            const st = stockState(p.s, p.max);
            return (
              <div
                key={p.sku}
                className="grid grid-cols-[110px_1fr_140px_220px_120px] items-center gap-4 border-b border-[#F7F7F8] px-5 py-3.5 text-[14px] last:border-0"
              >
                <span className="text-[#8A8F98]">{p.sku}</span>
                <span className="font-medium">{p.n}</span>
                <span className="text-[#5B6070]">{p.c}</span>
                <span className="flex items-center gap-3">
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F0F1F3]">
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${(p.s / p.max) * 100}%`, background: st.bar }}
                    />
                  </span>
                  <b className="w-12 text-right">{p.s}</b>
                </span>
                <Pill color={st.c}>{st.l}</Pill>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

/* ───────────────────────── Custom system (POS & billing) ───────────────────────── */

const POS_ITEMS = [
  { n: "Capuchino", p: 190, t: "coffee" as const, i: Coffee },
  { n: "Latte frío", p: 220, t: "sand" as const, i: Coffee },
  { n: "Croissant", p: 150, t: "sun" as const, i: Sparkles },
  { n: "Ensalada", p: 380, t: "sage" as const, i: Salad },
  { n: "Pizza personal", p: 420, t: "rose" as const, i: Pizza },
  { n: "Jugo natural", p: 160, t: "sun" as const, i: Leaf },
  { n: "Sándwich", p: 310, t: "cream" as const, i: Store },
  { n: "Cheesecake", p: 260, t: "lilac" as const, i: Star },
];

export function CustomSystemMock({ m }: P) {
  const [cart, setCart] = useState<Record<string, number>>({ Capuchino: 2, Croissant: 1, Ensalada: 1 });
  const add = (n: string, d: number) => setCart((c) => ({ ...c, [n]: Math.max(0, (c[n] ?? 0) + d) }));
  const lines = POS_ITEMS.filter((i) => cart[i.n]);
  const subtotal = lines.reduce((s, i) => s + i.p * cart[i.n], 0);
  const tax = Math.round(subtotal * 0.18);
  const money = (n: number) => `RD$${n.toLocaleString("en-US")}`;

  const ticket = (
    <div
      className={cx(
        "flex flex-col gap-3 bg-white",
        m ? "rounded-3xl p-4 shadow-[0_6px_20px_rgb(14_15_18/0.05)]" : "h-[748px] w-[340px] shrink-0 border-l border-black/5 p-6",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[18px] font-bold">Factura #B0100004521</span>
      </div>
      <span className="flex items-center gap-2 text-[13px] text-[#8A8F98]">
        <User size={14} /> Consumidor final · Mesa 4
      </span>
      <div className="flex flex-1 flex-col gap-2.5">
        {lines.map((i) => (
          <div key={i.n} className="flex items-center gap-3">
            <Photo tone={i.t} className="size-10 rounded-lg" />
            <div className="flex flex-1 flex-col">
              <span className="text-[14px] font-medium">{i.n}</span>
              <span className="text-[12px] text-[#8A8F98]">{money(i.p)}</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-[#F4F5F7] p-1">
              <button type="button" onClick={() => add(i.n, -1)} className="grid size-6 place-items-center rounded-full bg-white">
                <Minus size={12} />
              </button>
              <span className="w-3 text-center text-[13px] font-semibold">{cart[i.n]}</span>
              <button
                type="button"
                onClick={() => add(i.n, 1)}
                className="grid size-6 place-items-center rounded-full bg-[#2C6FD8] text-white"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1.5 border-t border-dashed border-[#E1E3E7] pt-3 text-[14px] text-[#5B6070]">
        <span className="flex justify-between">
          <span>Subtotal</span>
          <span>{money(subtotal)}</span>
        </span>
        <span className="flex justify-between">
          <span>ITBIS (18 %)</span>
          <span>{money(tax)}</span>
        </span>
        <span className="flex justify-between text-[20px] font-bold text-[#0E0F12]">
          <span>Total</span>
          <span>{money(subtotal + tax)}</span>
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <span className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#F4F5F7] text-[14px] font-semibold">
          <Receipt size={16} /> Imprimir
        </span>
        <span className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#2C6FD8] text-[14px] font-semibold text-white">
          <CreditCard size={16} /> Cobrar
        </span>
      </div>
    </div>
  );

  const grid = (
    <div className={cx("grid gap-3", m ? "grid-cols-3" : "grid-cols-4")}>
      {POS_ITEMS.map((i) => (
        <button
          key={i.n}
          type="button"
          onClick={() => add(i.n, 1)}
          className="relative flex flex-col gap-2 rounded-2xl bg-white p-2.5 text-left shadow-[0_6px_20px_rgb(14_15_18/0.04)] active:scale-[0.98]"
        >
          <Photo tone={i.t} icon={i.i} iconSize={m ? 22 : 30} className={cx("rounded-xl", m ? "h-[64px]" : "h-[96px]")} />
          <span className={cx("font-semibold", m ? "text-[12px]" : "text-[14px]")}>{i.n}</span>
          <span className="text-[12px] text-[#8A8F98]">{money(i.p)}</span>
          {cart[i.n] ? (
            <span className="absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-full bg-[#2C6FD8] text-[11px] font-bold text-white">
              {cart[i.n]}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );

  const cats = (
    <div className="no-scrollbar flex gap-2 overflow-x-auto">
      {["Todo", "Bebidas", "Comidas", "Postres"].map((c, i) => (
        <span
          key={c}
          className={cx(
            "shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold",
            i === 0 ? "bg-[#0E0F12] text-white" : "bg-white text-[#5B6070]",
          )}
        >
          {c}
        </span>
      ))}
    </div>
  );

  if (m)
    return (
      <AppShell
        m
        accent="#2C6FD8"
        title="Punto de venta"
        brand="Café Colonial · Caja 1"
        nav={[
          { icon: Store, label: "Venta" },
          { icon: Receipt, label: "Facturas" },
          { icon: Users, label: "Clientes" },
          { icon: ChartColumn, label: "Reportes" },
        ]}
      >
        {cats}
        {grid}
        {ticket}
      </AppShell>
    );

  return (
    <div className="flex min-h-full bg-[#F5F6F8]">
      <aside className="flex h-[748px] w-[76px] shrink-0 flex-col items-center gap-3 bg-[#111317] py-5 text-white/50">
        <span className="mb-3 grid size-10 place-items-center rounded-xl bg-[#2C6FD8] text-white">
          <Store size={20} />
        </span>
        {[Store, Receipt, Users, ChartColumn, Settings].map((I, i) => (
          <span key={i} className={cx("grid size-11 place-items-center rounded-xl", i === 0 && "bg-white/10 text-white")}>
            <I size={20} />
          </span>
        ))}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col gap-5 p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[13px] text-[#8A8F98]">Café Colonial · Caja 1</span>
            <span className="text-[24px] font-bold tracking-[-0.03em]">Punto de venta</span>
          </div>
          <span className="flex h-10 w-[260px] items-center gap-2 rounded-xl bg-white px-3 text-[13px] text-[#8A8F98]">
            <Search size={15} /> Buscar producto o código
          </span>
        </div>
        {cats}
        {grid}
      </div>
      {ticket}
    </div>
  );
}

/* ───────────────────────── Mobile app ───────────────────────── */

export function AppMock({ m }: P) {
  const ORANGE = "#F2542D";
  const cats = [
    { i: Pizza, l: "Pizza", t: "rose" as const },
    { i: Salad, l: "Saludable", t: "sage" as const },
    { i: Coffee, l: "Café", t: "coffee" as const },
    { i: Sparkles, l: "Postres", t: "lilac" as const },
    { i: Store, l: "Súper", t: "sky" as const },
  ];
  const places = [
    { n: "Pizzería Napoli", d: "25–35 min · Envío gratis", r: "4.8", t: "rose" as const, i: Pizza },
    { n: "Verde & Co.", d: "15–25 min · RD$60 envío", r: "4.9", t: "sage" as const, i: Salad },
    { n: "Café Colonial", d: "20–30 min · RD$50 envío", r: "4.9", t: "coffee" as const, i: Coffee },
    { n: "Dulce Tentación", d: "30–40 min · Envío gratis", r: "4.7", t: "lilac" as const, i: Sparkles },
  ];
  const body = (
    <>
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[13px] text-[#8A8F98]">Entregar en</span>
          <span className="text-[15px] font-bold">Piantini, Santo Domingo ▾</span>
        </div>
        <span className="relative grid size-10 place-items-center rounded-full bg-white shadow-sm">
          <Bell size={18} />
          <span className="absolute top-2 right-2.5 size-2 rounded-full" style={{ background: ORANGE }} />
        </span>
      </div>
      <span className={cx("font-bold tracking-[-0.03em]", m ? "text-[26px]" : "text-[32px]")}>
        Hola, Ana 👋
        <br />
        <span className="text-[#8A8F98]">¿Qué se te antoja hoy?</span>
      </span>
      <span className="flex h-12 items-center gap-2 rounded-2xl bg-white px-4 text-[14px] text-[#8A8F98] shadow-sm">
        <Search size={18} /> Buscar restaurantes o platos
      </span>
      <div className="no-scrollbar flex gap-3 overflow-x-auto">
        {cats.map((c) => (
          <span key={c.l} className="flex shrink-0 flex-col items-center gap-1.5">
            <Photo tone={c.t} icon={c.i} iconSize={24} className="size-16 rounded-2xl" />
            <span className="text-[12px] font-medium">{c.l}</span>
          </span>
        ))}
      </div>
      <div className="relative overflow-hidden rounded-3xl p-5 text-white" style={{ background: ORANGE }}>
        <span className="absolute -right-6 -bottom-8 size-36 rounded-full bg-white/15" />
        <span className="text-[12px] font-bold tracking-[0.1em] uppercase opacity-90">Solo hoy</span>
        <span className="mt-1 block text-[22px] leading-tight font-bold">
          2×1 en pizzas
          <br />
          después de las 6 p. m.
        </span>
        <span className="mt-3 inline-flex rounded-full bg-white px-4 py-2 text-[13px] font-semibold" style={{ color: ORANGE }}>
          Pedir ahora
        </span>
      </div>
      <span className="text-[18px] font-bold">Populares cerca de ti</span>
      <div className={cx("grid gap-4", m ? "" : "grid-cols-2")}>
        {places.map((p) => (
          <div key={p.n} className="flex flex-col gap-2">
            <div className="relative">
              <Photo tone={p.t} icon={p.i} iconSize={40} className="h-[140px] rounded-2xl" />
              <span className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[12px] font-bold">
                <Star size={11} fill="#F5A623" className="text-[#F5A623]" /> {p.r}
              </span>
            </div>
            <span className="text-[15px] font-bold">{p.n}</span>
            <span className="flex items-center gap-1.5 text-[12px] text-[#8A8F98]">
              <Bike size={13} /> {p.d}
            </span>
          </div>
        ))}
      </div>
    </>
  );
  const nav = [
    { icon: House, label: "Inicio" },
    { icon: Search, label: "Buscar" },
    { icon: ShoppingBag, label: "Pedidos" },
    { icon: User, label: "Perfil" },
  ];
  if (m)
    return (
      <div className="flex min-h-full flex-col bg-[#F6F6F8]">
        <div className="flex flex-1 flex-col gap-4 p-5">{body}</div>
        <div className="sticky bottom-0 grid grid-cols-4 border-t border-black/5 bg-white/95 pt-2 pb-7 backdrop-blur">
          {nav.map((n, i) => (
            <span
              key={n.label}
              className="flex flex-col items-center gap-1 text-[10.5px] font-medium"
              style={{ color: i === 0 ? ORANGE : "#9DA1A8" }}
            >
              <n.icon size={22} />
              {n.label}
            </span>
          ))}
        </div>
      </div>
    );
  return (
    <div className="flex min-h-full bg-[#F6F6F8]">
      <aside className="sticky top-0 flex h-[748px] w-[220px] shrink-0 flex-col gap-1 bg-white p-5">
        <Logo icon={Bike} name="Sabor Express" color={ORANGE} className="mb-6 text-[16px]" />
        {nav.map((n, i) => (
          <span
            key={n.label}
            className={cx(
              "flex h-10 items-center gap-3 rounded-xl px-3 text-[14px] font-medium",
              i === 0 ? "text-white" : "text-[#5B6070]",
            )}
            style={i === 0 ? { background: ORANGE } : undefined}
          >
            <n.icon size={18} /> {n.label}
          </span>
        ))}
        <div className="mt-auto flex flex-col gap-2 rounded-2xl bg-[#FFF1EC] p-4 text-[12px] text-[#9A3412]">
          <b className="text-[14px]">Disponible en iOS y Android</b>
          La misma app, en tu celular y en la web.
        </div>
      </aside>
      <div className="flex max-w-[900px] flex-1 flex-col gap-5 p-8">{body}</div>
    </div>
  );
}

/* ───────────────────────── Admin dashboard ───────────────────────── */

const SALES = [42, 55, 48, 63, 58, 72, 66, 80, 74, 88, 92, 86];
const MONTHS = ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export function DashboardMock({ m }: P) {
  const chart = (
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-[0_6px_20px_rgb(14_15_18/0.04)]">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[15px] font-bold">Ventas por mes</span>
          <span className="text-[12px] text-[#8A8F98]">2026 · en miles de RD$</span>
        </div>
        <Pill color="green">+18 % vs. 2025</Pill>
      </div>
      <div className={cx("flex items-end gap-2", m ? "h-[130px]" : "h-[190px]")}>
        {SALES.map((v, i) => (
          <div key={i} className="flex h-full flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full flex-1 items-end">
              <span className="w-full rounded-t-lg" style={{ height: `${v}%`, background: i === 10 ? "#4A90F7" : "#DCE8FC" }} />
            </div>
            <span className="text-[10px] text-[#8A8F98]">{MONTHS[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
  const donut = (
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-[0_6px_20px_rgb(14_15_18/0.04)]">
      <span className="text-[15px] font-bold">Ventas por canal</span>
      <div className="flex items-center gap-5">
        <div
          className="relative size-[120px] shrink-0 rounded-full"
          style={{ background: "conic-gradient(#4A90F7 0 52%, #22C55E 52% 78%, #F5A623 78% 92%, #E1E3E7 92% 100%)" }}
        >
          <span className="absolute inset-[22px] grid place-items-center rounded-full bg-white text-[18px] font-bold">
            RD$1.2M
          </span>
        </div>
        <div className="flex flex-col gap-2 text-[13px]">
          {[
            ["#4A90F7", "Web", "52 %"],
            ["#22C55E", "WhatsApp", "26 %"],
            ["#F5A623", "Tienda", "14 %"],
            ["#E1E3E7", "Otros", "8 %"],
          ].map(([c, l, v]) => (
            <span key={l} className="flex items-center gap-2">
              <span className="size-2.5 rounded-full" style={{ background: c }} />
              {l} <b className="ml-auto pl-4">{v}</b>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
  const orders = [
    ["#1043", "Juan Pérez", "RD$530", "Pagado", "green"],
    ["#1042", "María Fernández", "RD$1,890", "En camino", "blue"],
    ["#1041", "Carlos Santana", "RD$760", "Pendiente", "amber"],
    ["#1040", "Ana Rodríguez", "RD$2,300", "Pagado", "green"],
  ] as const;
  const table = (
    <div className="flex flex-col rounded-2xl bg-white p-5 shadow-[0_6px_20px_rgb(14_15_18/0.04)]">
      <span className="mb-2 text-[15px] font-bold">Pedidos recientes</span>
      {orders.map(([id, n, a, s, c]) => (
        <div key={id} className="flex items-center gap-3 border-b border-[#F4F5F7] py-3 text-[14px] last:border-0">
          <Photo tone={c === "green" ? "sage" : c === "blue" ? "sky" : "sun"} className="size-9 rounded-full" />
          <div className="flex flex-1 flex-col">
            <span className="font-medium">{n}</span>
            <span className="text-[12px] text-[#8A8F98]">{id}</span>
          </div>
          <span className="font-semibold">{a}</span>
          <Pill color={c}>{s}</Pill>
        </div>
      ))}
    </div>
  );
  return (
    <AppShell
      m={m}
      accent="#4A90F7"
      title="Resumen"
      dark
      brand={<Logo icon={LayoutDashboard} name="Mi negocio" color="#4A90F7" className="text-[15px]" light={!m} />}
      nav={[
        { icon: House, label: "Inicio" },
        { icon: ShoppingBag, label: "Pedidos" },
        { icon: Users, label: "Clientes" },
        { icon: ChartColumn, label: "Reportes" },
        { icon: Package, label: "Productos" },
        { icon: Settings, label: "Ajustes" },
      ]}
    >
      <div className={cx("grid gap-3", m ? "grid-cols-2" : "grid-cols-4 gap-4")}>
        <Kpi m={m} label="Ventas del mes" value="RD$486K" icon={TrendingUp} color="#4A90F7" delta="+12.4 %" />
        <Kpi m={m} label="Pedidos" value="1,042" icon={ShoppingBag} color="#22C55E" delta="+86 esta semana" />
        <Kpi m={m} label="Clientes nuevos" value="214" icon={Users} color="#6F55D6" delta="+9.1 %" />
        <Kpi m={m} label="Ticket promedio" value="RD$466" icon={Receipt} color="#F5A623" delta="-2.3 %" bad />
      </div>
      <div className={cx("grid gap-4", m ? "" : "grid-cols-[1.6fr_1fr]")}>
        {chart}
        {donut}
      </div>
      {table}
    </AppShell>
  );
}

/* ───────────────────────── Content admin (CMS) ───────────────────────── */

export function CmsMock({ m }: P) {
  const [title, setTitle] = useState("El café que despierta la ciudad.");
  const [saved, setSaved] = useState(false);
  const sections = [
    { n: "Portada", d: "Título, foto y botón", i: House, on: true },
    { n: "Menú", d: "24 productos · 4 categorías", i: Coffee, on: true },
    { n: "Galería", d: "18 fotos", i: Images, on: true },
    { n: "Promoción de diciembre", d: "Banner temporal", i: Tag, on: false },
  ];
  const editor = (
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-[0_6px_20px_rgb(14_15_18/0.04)]">
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-bold">Editar portada</span>
        <Pill color="green">Publicada</Pill>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold text-[#5B6070]">Título principal</span>
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setSaved(false);
          }}
          className="h-11 rounded-xl bg-[#F4F5F7] px-3.5 text-[15px] outline-none focus:ring-2 focus:ring-[#4A90F7]/40"
        />
      </label>
      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold text-[#5B6070]">Foto de portada</span>
        <div className="flex items-center gap-3">
          <Photo tone="coffee" icon={Coffee} iconSize={22} className="h-16 w-24 rounded-xl" />
          <span className="rounded-lg bg-[#F4F5F7] px-3 py-2 text-[13px] font-semibold">Cambiar foto</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setSaved(true)}
        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#4A90F7] text-[14px] font-semibold text-white"
      >
        {saved ? (
          <>
            <Check size={16} /> Cambios publicados
          </>
        ) : (
          "Guardar y publicar"
        )}
      </button>
    </div>
  );
  const preview = (
    <div className="flex flex-col gap-3 overflow-hidden rounded-2xl bg-[#FBF7F2] p-5 shadow-[0_6px_20px_rgb(14_15_18/0.04)]">
      <span className="text-[12px] font-semibold text-[#8A8F98] uppercase">Vista en vivo</span>
      <Logo icon={Coffee} name="Café Colonial" color="#7A4A2E" className="text-[14px]" />
      <span className="text-[26px] leading-tight font-bold tracking-[-0.03em] text-[#2A1C14]">{title || "…"}</span>
      <Photo tone="coffee" icon={Coffee} className="h-[120px] rounded-xl" />
    </div>
  );
  return (
    <AppShell
      m={m}
      accent="#4A90F7"
      title="Contenido"
      brand={<Logo icon={Pencil} name="Editor de mi web" color="#4A90F7" className="text-[15px]" />}
      nav={[
        { icon: FileText, label: "Páginas" },
        { icon: Coffee, label: "Menú" },
        { icon: Images, label: "Galería" },
        { icon: Settings, label: "Ajustes" },
      ]}
    >
      <div className={cx("grid gap-4", m ? "" : "grid-cols-[1fr_1fr]")}>
        <div className="flex flex-col gap-2">
          {sections.map((s) => (
            <div key={s.n} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-[0_6px_20px_rgb(14_15_18/0.04)]">
              <span className="grid size-10 place-items-center rounded-xl bg-[#EAF2FE] text-[#2C6FD8]">
                <s.i size={18} />
              </span>
              <div className="flex flex-1 flex-col">
                <span className="text-[14px] font-semibold">{s.n}</span>
                <span className="text-[12px] text-[#8A8F98]">{s.d}</span>
              </div>
              <span className="grid size-8 place-items-center rounded-lg bg-[#F4F5F7] text-[#5B6070]">
                <Pencil size={14} />
              </span>
              <span className={cx("relative h-6 w-10 rounded-full", s.on ? "bg-[#4A90F7]" : "bg-[#E1E3E7]")}>
                <span
                  className={cx(
                    "absolute top-[3px] size-[18px] rounded-full bg-white shadow-sm",
                    s.on ? "left-[19px]" : "left-[3px]",
                  )}
                />
              </span>
            </div>
          ))}
          {!m && preview}
        </div>
        {editor}
      </div>
    </AppShell>
  );
}

/* ───────────────────────── Corporate email ───────────────────────── */

const MAILS = [
  {
    f: "Banco Popular",
    s: "Confirmación de tu préstamo PyME",
    p: "Hola, Café Colonial: tu solicitud fue aprobada…",
    t: "10:24",
    u: true,
    tone: "sky" as const,
  },
  {
    f: "Distribuidora Del Sol",
    s: "Cotización de 20 sacos de café",
    p: "Adjuntamos la cotización solicitada para…",
    t: "9:12",
    u: true,
    tone: "sun" as const,
  },
  {
    f: "María Fernández",
    s: "Evento privado el sábado",
    p: "Queremos reservar el patio para 30 personas…",
    t: "Ayer",
    tone: "rose" as const,
  },
  {
    f: "Contabilidad",
    s: "Reporte de ventas de octubre",
    p: "Te comparto el reporte del mes…",
    t: "Ayer",
    tone: "sage" as const,
  },
  {
    f: "Proveedor de leche",
    s: "Entrega del lunes",
    p: "Confirmamos la entrega a las 7:00 a. m.…",
    t: "Mié",
    tone: "cream" as const,
  },
];

export function MailMock({ m }: P) {
  const list = (
    <div className={cx("flex flex-col bg-white", !m && "w-[380px] shrink-0 border-r border-black/5")}>
      {MAILS.map((x, i) => (
        <div key={x.s} className={cx("flex gap-3 border-b border-[#F4F5F7] px-4 py-3.5", i === 0 && !m && "bg-[#EAF2FE]")}>
          <Photo tone={x.tone} className="size-10 shrink-0 rounded-full" />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <div className="flex justify-between gap-2">
              <span className={cx("truncate text-[14px]", x.u ? "font-bold" : "font-medium")}>{x.f}</span>
              <span className="shrink-0 text-[12px] text-[#8A8F98]">{x.t}</span>
            </div>
            <span className={cx("truncate text-[13px]", x.u ? "font-semibold" : "text-[#3A3D44]")}>{x.s}</span>
            <span className="truncate text-[12.5px] text-[#8A8F98]">{x.p}</span>
          </div>
        </div>
      ))}
    </div>
  );
  if (m)
    return (
      <div className="flex min-h-full flex-col bg-white">
        <div className="flex flex-col gap-3 px-5 pt-2 pb-3">
          <span className="text-[13px] font-medium text-[#2C6FD8]">hola@cafecolonial.com</span>
          <span className="text-[30px] font-bold tracking-[-0.03em]">Recibidos</span>
          <span className="flex h-10 items-center gap-2 rounded-xl bg-[#F4F5F7] px-3 text-[14px] text-[#8A8F98]">
            <Search size={16} /> Buscar
          </span>
        </div>
        {list}
        <span className="sticky bottom-8 mt-auto mr-5 ml-auto flex h-14 items-center gap-2 rounded-2xl bg-[#2C6FD8] px-5 text-[15px] font-semibold text-white shadow-xl">
          <Pencil size={17} /> Redactar
        </span>
      </div>
    );
  return (
    <div className="flex min-h-full bg-[#F5F6F8]">
      <aside className="flex h-[748px] w-[220px] shrink-0 flex-col gap-1 p-4">
        <span className="mb-4 flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2C6FD8] text-[14px] font-semibold text-white">
          <Pencil size={16} /> Redactar
        </span>
        {[
          [Inbox, "Recibidos", "12"],
          [Send, "Enviados", ""],
          [FileText, "Borradores", "2"],
          [Archive, "Archivados", ""],
        ].map(([I, l, c], i) => {
          const Ico = I as typeof Inbox;
          return (
            <span
              key={l as string}
              className={cx(
                "flex h-10 items-center gap-3 rounded-xl px-3 text-[14px] font-medium",
                i === 0 ? "bg-white text-[#2C6FD8] shadow-sm" : "text-[#5B6070]",
              )}
            >
              <Ico size={17} /> {l as string} <span className="ml-auto text-[12px]">{c as string}</span>
            </span>
          );
        })}
        <div className="mt-auto flex flex-col gap-1 rounded-xl bg-white p-3 text-[12px] text-[#5B6070]">
          <b className="text-[13px] text-[#0E0F12]">Cuentas del equipo</b>
          <span>hola@cafecolonial.com</span>
          <span>ventas@cafecolonial.com</span>
          <span>maria@cafecolonial.com</span>
        </div>
      </aside>
      {list}
      <div className="flex min-w-0 flex-1 flex-col gap-5 bg-white p-8">
        <span className="text-[22px] font-bold tracking-[-0.02em]">Confirmación de tu préstamo PyME</span>
        <div className="flex items-center gap-3">
          <Photo tone="sky" className="size-10 rounded-full" />
          <div className="flex flex-col text-[13px]">
            <b>Banco Popular</b>
            <span className="text-[#8A8F98]">
              para: <span className="text-[#2C6FD8]">hola@cafecolonial.com</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-3 text-[14px] leading-relaxed text-[#3A3D44]">
          <p>Hola, equipo de Café Colonial:</p>
          <p>Nos complace informarles que su solicitud fue aprobada. Un ejecutivo les contactará para firmar los documentos.</p>
          <p>Saludos cordiales.</p>
        </div>
        <div className="mt-2 flex items-center gap-3 border-t border-[#F0F1F3] pt-5">
          <span className="grid size-11 place-items-center rounded-xl bg-[#7A4A2E] text-white">
            <Coffee size={20} />
          </span>
          <div className="flex flex-col text-[13px]">
            <b>María Gómez · Gerente</b>
            <span className="text-[#8A8F98]">maria@cafecolonial.com · (809) 555-0123</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Logo / brand kit ───────────────────────── */

function BrandMark({ size = 80, light }: { size?: number; light?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden>
      <circle cx="40" cy="40" r="38" fill={light ? "#FBF1E4" : "#2E4A3B"} />
      <path d="M40 16c10 9 14 18 14 26a14 14 0 0 1-28 0c0-8 4-17 14-26z" fill={light ? "#2E4A3B" : "#E9C46A"} />
      <path d="M40 24v34" stroke={light ? "#FBF1E4" : "#2E4A3B"} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function BrandMock({ m }: P) {
  const palette = [
    ["#2E4A3B", "Verde monte"],
    ["#E9C46A", "Mostaza"],
    ["#FBF1E4", "Crema"],
    ["#C9673A", "Barro"],
    ["#1A1A1A", "Carbón"],
  ];
  return (
    <div className={cx("flex min-h-full flex-col gap-5 bg-[#F3EFE7] text-[#1A1A1A]", m ? "p-4 pb-12" : "p-10")}>
      <div className="flex flex-col">
        <span className="text-[13px] font-bold tracking-[0.12em] text-[#C9673A] uppercase">Kit de marca</span>
        <span className={cx("font-bold tracking-[-0.03em]", m ? "text-[26px]" : "text-[34px]")}>Finca Monte Verde</span>
      </div>
      <div className={cx("grid gap-4", m ? "" : "grid-cols-[1.3fr_1fr_1fr]")}>
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl bg-white p-8">
          <BrandMark size={m ? 96 : 120} />
          <span className="text-[26px] font-bold tracking-[-0.02em] text-[#2E4A3B]">Monte Verde</span>
          <span className="text-[11px] font-semibold tracking-[0.3em] text-[#8A8F98] uppercase">Café de altura · Jarabacoa</span>
        </div>
        <div className="grid grid-rows-2 gap-4">
          <div className="flex items-center justify-center gap-3 rounded-3xl bg-[#2E4A3B] p-6 text-[#FBF1E4]">
            <BrandMark size={52} light />
            <span className="text-[20px] font-bold">Monte Verde</span>
          </div>
          <div className="flex items-center justify-center gap-3 rounded-3xl bg-[#E9C46A] p-6 text-[#2E4A3B]">
            <BrandMark size={52} />
            <span className="text-[20px] font-bold">Monte Verde</span>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-3 rounded-3xl bg-white p-6">
          <span className="text-[13px] font-semibold text-[#8A8F98]">Tipografía</span>
          <span className="text-[72px] leading-none font-bold tracking-[-0.04em]">Aa</span>
          <div className="flex flex-col text-[13px]">
            <b>Inter · Títulos y textos</b>
            <span className="text-[#8A8F98]">ABCDEFGHIJKLMNÑOPQRSTUVWXYZ</span>
            <span className="text-[#8A8F98]">0123456789</span>
          </div>
        </div>
      </div>
      <div className={cx("grid gap-3", m ? "grid-cols-3" : "grid-cols-5")}>
        {palette.map(([c, n]) => (
          <div key={c} className="flex flex-col overflow-hidden rounded-2xl bg-white">
            <span className={cx(m ? "h-16" : "h-24")} style={{ background: c }} />
            <div className="flex flex-col p-3">
              <span className="text-[13px] font-semibold">{n}</span>
              <span className="text-[12px] text-[#8A8F98] uppercase">{c}</span>
            </div>
          </div>
        ))}
      </div>
      <div className={cx("grid gap-4", m ? "grid-cols-2" : "grid-cols-3")}>
        <div className="flex aspect-[1.7] flex-col justify-between rounded-2xl bg-[#2E4A3B] p-4 text-[#FBF1E4] shadow-lg">
          <BrandMark size={34} light />
          <div className="flex flex-col text-[11px]">
            <b className="text-[13px]">José Almonte</b>Productor · (809) 555-0170
          </div>
        </div>
        <div className="flex aspect-[1.7] items-center justify-center rounded-2xl bg-[#FBF1E4] shadow-lg">
          <BrandMark size={60} />
        </div>
        {!m && (
          <div className="relative flex aspect-[1.7] items-end overflow-hidden rounded-2xl shadow-lg">
            <Photo tone="coffee" className="absolute inset-0" />
            <span className="relative m-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-[12px] font-bold text-[#2E4A3B]">
              <BrandMark size={20} /> Bolsa 1 lb
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── Monthly maintenance ───────────────────────── */

export function MaintenanceMock({ m }: P) {
  const log = [
    ["18 nov", "Cambiamos los precios del menú de diciembre", Pencil],
    ["15 nov", "Actualización de seguridad del servidor", ShieldCheck],
    ["10 nov", "Agregamos 6 fotos nuevas a la galería", Images],
    ["03 nov", "Optimización de velocidad: −0.8 s de carga", Zap],
  ] as const;
  return (
    <div className={cx("flex min-h-full flex-col gap-5 bg-[#F5F6F8] text-[#0E0F12]", m ? "p-4 pb-12" : "p-10")}>
      <div className={cx("flex justify-between gap-4", m ? "flex-col" : "items-end")}>
        <div className="flex flex-col">
          <span className="text-[13px] font-medium text-[#8A8F98]">Reporte mensual · cafecolonial.com</span>
          <span className={cx("font-bold tracking-[-0.03em]", m ? "text-[26px]" : "text-[32px]")}>Noviembre 2026</span>
        </div>
        <span className="flex w-fit items-center gap-2 rounded-full bg-[#E9F8EF] px-4 py-2 text-[14px] font-semibold text-[#1E8A4C]">
          <CircleCheck size={17} /> Tu sitio está al día
        </span>
      </div>
      <div className={cx("grid gap-3", m ? "grid-cols-2" : "grid-cols-4 gap-4")}>
        <Kpi m={m} label="Tiempo en línea" value="99.98 %" icon={Activity} color="#1E8A4C" />
        <Kpi m={m} label="Respaldos" value="30 / 30" icon={Database} color="#4A90F7" />
        <Kpi m={m} label="Actualizaciones" value="14" icon={RefreshCw} color="#6F55D6" />
        <Kpi m={m} label="Cambios pedidos" value="5 / 5" icon={Wrench} color="#F5A623" />
      </div>
      <div className={cx("grid gap-4", m ? "" : "grid-cols-[1fr_1.4fr]")}>
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-6">
          <span className="self-start text-[15px] font-bold">Velocidad</span>
          <div
            className="relative size-[150px] rounded-full"
            style={{ background: "conic-gradient(#1E8A4C 0 96%, #EEF0F2 96% 100%)" }}
          >
            <span className="absolute inset-[14px] flex flex-col items-center justify-center rounded-full bg-white">
              <span className="text-[40px] font-bold text-[#1E8A4C]">96</span>
              <span className="text-[12px] text-[#8A8F98]">de 100</span>
            </span>
          </div>
          <span className="text-[13px] text-[#5B6070]">Carga en 1.1 s en celulares</span>
        </div>
        <div className="flex flex-col rounded-2xl bg-white p-5">
          <span className="mb-2 text-[15px] font-bold">Lo que hicimos este mes</span>
          {log.map(([d, t, I]) => (
            <div key={t} className="flex items-center gap-3 border-b border-[#F4F5F7] py-3 last:border-0">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#EAF2FE] text-[#2C6FD8]">
                <I size={16} />
              </span>
              <span className="flex-1 text-[14px]">{t}</span>
              <span className="text-[12px] text-[#8A8F98]">{d}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Managed hosting ───────────────────────── */

export function HostingMock({ m }: P) {
  const days = Array.from({ length: m ? 45 : 90 }, (_, i) => i);
  return (
    <div className={cx("flex min-h-full flex-col gap-5 bg-[#0F1115] text-white", m ? "p-4 pb-12" : "p-10")}>
      <div className={cx("flex justify-between gap-3", m ? "flex-col" : "items-center")}>
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-[#4A90F7]">
            <Server size={21} />
          </span>
          <div className="flex flex-col">
            <span className="text-[20px] font-bold">cafecolonial.com</span>
            <span className="text-[13px] text-white/50">Servidor en Miami, EE. UU. · Plan administrado</span>
          </div>
        </div>
        <span className="flex w-fit items-center gap-2 rounded-full bg-[#22C55E]/15 px-4 py-2 text-[14px] font-semibold text-[#4ADE80]">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#4ADE80] opacity-60" />
            <span className="relative inline-flex size-2.5 rounded-full bg-[#4ADE80]" />
          </span>
          En línea
        </span>
      </div>
      <div className="flex flex-col gap-3 rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10">
        <div className="flex justify-between text-[14px]">
          <b>Disponibilidad · últimos {days.length} días</b>
          <span className="text-[#4ADE80]">99.98 %</span>
        </div>
        <div className="flex h-10 gap-[3px]">
          {days.map((d) => (
            <span key={d} className="flex-1 rounded-sm" style={{ background: d === 37 ? "#F5A623" : "#22C55E" }} />
          ))}
        </div>
      </div>
      <div className={cx("grid gap-4", m ? "" : "grid-cols-3")}>
        {[
          [Lock, "Certificado SSL", "Válido hasta 20 nov 2027", "#4ADE80"],
          [Database, "Respaldos diarios", "Último: hoy 3:00 a. m.", "#60A5FA"],
          [Globe, "Dominio y DNS", "Configurado correctamente", "#C4B5FD"],
        ].map(([I, t, d, c]) => {
          const Ico = I as typeof Lock;
          return (
            <div key={t as string} className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10">
              <span className="grid size-10 place-items-center rounded-xl bg-white/5" style={{ color: c as string }}>
                <Ico size={19} />
              </span>
              <div className="flex flex-col">
                <span className="text-[14px] font-semibold">{t as string}</span>
                <span className="text-[12px] text-white/50">{d as string}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-col gap-4 rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10">
        <span className="text-[14px] font-bold">Recursos del servidor</span>
        {[
          ["Procesador", 18, "#60A5FA"],
          ["Memoria", 42, "#C4B5FD"],
          ["Almacenamiento", 27, "#4ADE80"],
        ].map(([l, v, c]) => (
          <div key={l as string} className="flex items-center gap-4 text-[13px]">
            <span className="flex w-[130px] items-center gap-2 text-white/70">
              <HardDrive size={14} /> {l as string}
            </span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
              <span className="block h-full rounded-full" style={{ width: `${v}%`, background: c as string }} />
            </span>
            <b className="w-10 text-right">{v as number} %</b>
          </div>
        ))}
      </div>
      <span className="flex items-center gap-2 text-[13px] text-white/50">
        <Clock size={14} /> Nosotros vigilamos el servidor 24/7: tú no tienes que hacer nada.
      </span>
    </div>
  );
}
