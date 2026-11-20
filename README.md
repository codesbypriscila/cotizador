# Cotizador

**Cotizaciones, facturas y cobros para freelancers de desarrollo de software.**
Tus clientes arman su proyecto, ven el precio al instante en US$ o RD$ y te lo envían por WhatsApp.
Tú lo conviertes en cotización, factura y abonos desde un panel privado.

**Pruébalo:** [cotizador-priscila.vercel.app](https://cotizador-priscila.vercel.app)

[![CI](https://github.com/codesbypriscila/cotizador/actions/workflows/ci.yml/badge.svg)](https://github.com/codesbypriscila/cotizador/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-16-000?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/Neon-PostgreSQL-00E599?logo=postgresql&logoColor=white)

</div>

<p align="center">
  <img src="docs/screenshots/celular-1-proyecto.png" width="30%" alt="Elegir el tipo de proyecto" />
  &nbsp;
  <img src="docs/screenshots/celular-2-extras.png" width="30%" alt="Agregar extras con el total en vivo" />
  &nbsp;
  <img src="docs/screenshots/celular-3-propuesta.png" width="30%" alt="Datos y resumen antes de enviar por correo" />
</p>

## Qué hace

### Para tus clientes: el cotizador público (`/`)

- Eligen el tipo de proyecto (landing, página web, tienda online, sistema de reservas, menú digital con QR, portafolio, chatbot de WhatsApp, sistema de inventario, app móvil…) y marcan extras: páginas adicionales, pagos con Azul/CardNet/PayPal, correos corporativos, SEO, multiidioma, blog, logo…
- **Pagos mensuales**: el mantenimiento y el hosting administrado van siempre incluidos (cada proyecto tiene su propio precio de mantenimiento); el soporte prioritario es opcional.
- **El total se suma en vivo**, en **US$ o RD$**. Los pesos son la conversión exacta de los dólares con la tasa del día.
- Escogen el plazo (normal o urgente +20 %) y escriben su nombre, negocio, correo y WhatsApp. Todos son obligatorios y se validan: el nombre solo acepta letras.
- Con **"Enviar cotización"** sale un aviso para confirmar. Al decir que sí, la cotización llega a tu panel en estado **Pendiente** y el cliente ve que fue enviada y será revisada. Luego tú le escribes por WhatsApp.
- Va en 3 pasos (proyecto, extras, datos). En celular el total queda fijo abajo; en computadora los pasos van a la izquierda y la cotización a la derecha.

### Para ti: el panel de administración (`/admin`)

- **Inicio**: lo cobrado en el mes, lo **por cobrar** (proyectos aceptados y facturas con saldo, con la fecha más próxima), lo vencido y las propuestas nuevas.
- **Cotizaciones**: editor con partidas del catálogo o libres, descuento, ITBIS 18 %, plazo urgente, fecha de entrega y el WhatsApp y correo del cliente. Cuando la aceptan, **registras el anticipo del 30 %** antes de empezar y se crea la factura con ese abono.
- **Facturas**: estados automáticos (borrador, enviada, parcial, pagada, vencida), abonos validados que nunca pasan de lo pendiente, recordatorios por WhatsApp con vista previa y descarga en PDF.
- **Clientes**: ficha con historial y saldo. **WhatsApp** abre el chat del cliente y **Correo** abre tu app de correo con el saludo y tu firma ya escritos.
- **Catálogo**: tus servicios y precios **en dólares**, con el rango de mercado de referencia, el orden y la visibilidad. Es lo que ve el cliente en el cotizador.
- **Ajustes**: tu WhatsApp, los datos de facturación, la tasa del dólar (se actualiza sola cada 6 horas) y si quieres ver el panel **en US$ o en RD$**.

## Cómo está hecho

|            |                                                                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Server Actions, `proxy.ts`)                                                                                                     |
| Interfaz   | React 19, Tailwind CSS 4, lucide-react, fuente Inter                                                                                                    |
| Datos      | PostgreSQL en Neon con Prisma 7 (`@prisma/adapter-pg`)                                                                                                  |
| Validación | zod en el servidor y las mismas reglas en los formularios (`src/lib/validation.ts`)                                                                     |
| Login      | Una sola cuenta guardada en la base de datos (contraseña con hash scrypt) y sesión en una cookie firmada (HMAC)                                         |
| Correo     | Enlaces `mailto:` que abren la app de correo del celular o la computadora. No hace falta servidor de correo                                             |
| Moneda     | Todo se guarda en centavos de dólar. Los pesos usan la tasa de `open.er-api.com`, con respaldo en `currency-api`                                        |
| Pruebas    | Vitest (dinero, totales, mensajes, validaciones, sesión) y Playwright (flujos de cliente y admin, más una revisión responsive en 12 anchos de pantalla) |

## Correrlo en local

```bash
npm install
cp .env.example .env                       # llena las variables (ver abajo)
npx prisma dev --name cotizador            # Postgres local (o usa la URL de Neon)
npm run db:migrate
npm run db:seed                            # ajustes + catálogo de ejemplo (no borra nada)
npm run admin:set -- "tu@correo.com" "tu-contraseña"   # crea o cambia tu usuario (se guarda con hash)
npm run dev
```

| Variable         | Para qué                                                                         |
| ---------------- | -------------------------------------------------------------------------------- |
| `DATABASE_URL`   | Conexión a Postgres. En Neon, la URL con `-pooler` y `sslmode=verify-full`       |
| `DIRECT_URL`     | Conexión directa (sin `-pooler`) para las migraciones                            |
| `SESSION_SECRET` | `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"` |

El usuario del panel no va en variables: vive en la tabla `Admin` y se crea o cambia con `npm run admin:set`. Las cotizaciones del público llegan al correo de esa cuenta.

## Pruebas

```bash
npm test           # unitarias (Vitest)
npm run test:e2e   # de punta a punta (Playwright) contra una base local de prueba que se borra en cada corrida
```

Las pruebas de punta a punta nunca usan Neon: levantan su propia base con `prisma dev --name cotizador-e2e`.

## Publicar en Vercel

1. Importa el repositorio en Vercel.
2. Agrega las variables de entorno de arriba con las URLs de Neon.
3. `vercel-build` corre las migraciones y luego el build.
4. La página pública se regenera cada hora para tomar la tasa nueva, y al momento cuando guardas el catálogo o los ajustes.

## Precios de ejemplo

El catálogo inicial trae precios de freelancer que empieza en República Dominicana: Landing desde US$190, Página web desde US$375, Tienda online desde US$675, App móvil desde US$1,125, con mantenimiento desde US$11 al mes. Todos se editan en **Admin → Catálogo**.

---

Hecho por [Priscila Pérez](https://github.com/codesbypriscila), desarrolladora de software.
