-- Phase 7 task integrity cleanup.
-- Run this in Supabase SQL Editor after confirming old demo/orphan task data can be removed.

delete from public.tasks
where lead_id is null
   or not exists (
       select 1
       from public.leads
       where public.leads.lead_id = public.tasks.lead_id
   );

do $$
declare
    constraint_record record;
begin
    for constraint_record in
        select constraint_name
        from information_schema.key_column_usage
        where table_schema = 'public'
          and table_name = 'tasks'
          and column_name = 'lead_id'
          and position_in_unique_constraint is not null
    loop
        execute format(
            'alter table public.tasks drop constraint if exists %I',
            constraint_record.constraint_name
        );
    end loop;
end $$;

alter table public.tasks
alter column lead_id set not null;

alter table public.tasks
add constraint tasks_lead_id_fkey
foreign key (lead_id)
references public.leads(lead_id)
on delete cascade;
