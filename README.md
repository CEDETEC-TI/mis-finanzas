# Mis Finanzas

Herramienta **personal** de Guillermo Bassi para controlar ingresos, gastos y ahorro — no es un producto de CEDETEC ni una pieza de demo del portfolio, aunque el repo vive en la organización CEDETEC-TI. Pensada para que Guillermo la use y, si quiere, sume a otras personas de confianza — cada una ve solo lo suyo.

## Contenido

Sitio estático de un solo archivo (`index.html`, sin dependencias de build), con [Supabase](https://supabase.com) como backend:

- **Login** con email y contraseña. No hay registro público: las cuentas las crea el admin (Guillermo) desde un panel dentro de la app.
- **Patrimonio total** (ingresos − gastos), **disponible** (patrimonio − ahorrado) y **ahorrado acumulado**, siempre visibles arriba.
- Resumen de **ingresos y gastos del mes en curso**.
- Alta de movimientos (ingreso / gasto / ahorro) con monto, fecha, categoría (con sugerencias que aprenden de lo ya cargado) y nota opcional.
- **Gastos del mes por categoría**, en barras.
- Lista de movimientos recientes, con borrado (pide confirmar).
- Cambio de contraseña propio, sin depender de nadie.
- **Panel de administración** (solo visible para el admin): crea el acceso de una persona nueva con su email, con una contraseña inicial que después puede cambiar.
- Sincronización en tiempo real vía Supabase Realtime: un movimiento cargado desde el celular aparece también en la computadora sin recargar la página.

## Backend (Supabase)

Una sola tabla, `transactions`, con Row Level Security: cada fila solo la puede leer o escribir el usuario dueño (`user_id = auth.uid()`). La clave pública (`anon`/`publishable`) que usa el sitio es segura de exponer — la protección real la da RLS, no el secreto de la clave. Probado explícitamente: sin sesión iniciada, la lectura devuelve vacío y la escritura es rechazada por la base.

El registro público está deshabilitado a nivel del proyecto (`disable_signup`). La única forma de crear una cuenta es la Edge Function `supabase/functions/create-user`, que verifica server-side que quien llama es el usuario admin (un id fijo) antes de usar la service role para crear la cuenta nueva — un usuario común que intente llamarla directo recibe 403.

## Deploy

Al ser HTML estático, se publica directo en GitHub Pages apuntando a la raíz del repo.
