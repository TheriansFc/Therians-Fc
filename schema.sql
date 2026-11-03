-- Ejecuta todo este archivo una sola vez en Supabase > SQL Editor.
-- Público: lectura. Usuarios autenticados: inserción y edición. Nadie borra desde la web.
create extension if not exists pgcrypto;
create table if not exists public.noticias (id uuid primary key default gen_random_uuid(), titulo text not null, contenido text not null, fecha date not null default current_date, created_at timestamptz not null default now());
create table if not exists public.jugadores (id uuid primary key default gen_random_uuid(), nombre text not null, numero integer not null check(numero between 0 and 99), posicion text not null, goles integer not null default 0 check(goles>=0), asistencias integer not null default 0 check(asistencias>=0), valor numeric(10,2) not null default 0 check(valor>=0), created_at timestamptz not null default now());
create table if not exists public.partidos (id uuid primary key default gen_random_uuid(), rival text not null, fecha date not null, lugar text, goles_favor integer check(goles_favor>=0), goles_contra integer check(goles_contra>=0), created_at timestamptz not null default now());
create table if not exists public.historial (id bigint generated always as identity primary key, tabla text not null, registro_id uuid not null, accion text not null, actor_id uuid, actor_email text, antes jsonb, despues jsonb, fecha timestamptz not null default now());
-- RLS en las tablas de contenido
alter table public.noticias enable row level security;
alter table public.jugadores enable row level security;
alter table public.partidos enable row level security;
alter table public.historial enable row level security;
-- Políticas idempotentes para facilitar reinstalación
DO $$ DECLARE t text; BEGIN FOREACH t IN ARRAY ARRAY['noticias','jugadores','partidos'] LOOP
 execute format('drop policy if exists public_read on public.%I',t);
 execute format('drop policy if exists signed_insert on public.%I',t);
 execute format('drop policy if exists signed_update on public.%I',t);
 execute format('create policy public_read on public.%I for select to anon,authenticated using (true)',t);
 execute format('create policy signed_insert on public.%I for insert to authenticated with check (true)',t);
 execute format('create policy signed_update on public.%I for update to authenticated using (true) with check (true)',t);
 END LOOP; END $$;
drop policy if exists audit_public_read on public.historial;
create policy audit_public_read on public.historial for select to anon,authenticated using (true);
-- No se conceden permisos de escritura directa al historial.
revoke insert,update,delete on public.historial from anon,authenticated;
-- Los registros de auditoría se escriben en el servidor, no desde el navegador.
create or replace function public.registrar_cambio_tafc() returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare who uuid; who_email text;
begin
 who := auth.uid();
 who_email := auth.jwt()->>'email';
 insert into public.historial(tabla,registro_id,accion,actor_id,actor_email,antes,despues)
 values(TG_TABLE_NAME,NEW.id, TG_OP,who,who_email,case when TG_OP='UPDATE' then to_jsonb(OLD) else null end,to_jsonb(NEW));
 return NEW;
end $$;
DO $$ DECLARE t text; BEGIN FOREACH t IN ARRAY ARRAY['noticias','jugadores','partidos'] LOOP
 execute format('drop trigger if exists audit_change on public.%I',t);
 execute format('create trigger audit_change after insert or update on public.%I for each row execute function public.registrar_cambio_tafc()',t);
 END LOOP; END $$;
-- Nota de privacidad: el historial expone el correo del editor a cualquier visitante.
-- Si deseas privacidad, cambia la política de lectura del historial y muestra alias públicos.
