begin;

-- Remove enquiry tracking rows whose linked admin lead was deleted before
-- the foreign key was changed from SET NULL to CASCADE.
delete from public.property_enquiries
where lead_id is null;

alter table public.property_enquiries
drop constraint if exists property_enquiries_lead_id_fkey;

alter table public.property_enquiries
add constraint property_enquiries_lead_id_fkey
foreign key (lead_id)
references public.leads(id)
on update cascade
on delete cascade;

commit;
