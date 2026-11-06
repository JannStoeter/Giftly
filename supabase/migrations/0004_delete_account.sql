-- Wishtale: Nutzer löschen ihr Konto selbst (DSGVO Art. 17).
-- Löscht den Eintrag in auth.users. Profile, Wünsche und Geschenke folgen über "on delete cascade".
-- Reservierungen hängen an den Wünschen und verschwinden damit ebenfalls.

create or replace function public.delete_my_account()
returns boolean language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid());
begin
  if uid is null then return false; end if;
  delete from auth.users where id = uid;
  return true;
end $$;

revoke execute on function public.delete_my_account() from public, anon, authenticated;
grant execute on function public.delete_my_account() to authenticated;
