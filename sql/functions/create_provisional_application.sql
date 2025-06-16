create or replace function create_provisional_application(
  p_user_id uuid,
  p_title_en text,
  p_applicant jsonb,
  p_inventor jsonb,
  p_attached_files jsonb
)
returns table(patent_id uuid, our_ref text) as $$
declare
  new_patent_id uuid;
  new_our_ref text;
begin
  insert into patents (
    user_id,
    application_type,
    status,
    title_en,
    applicant,
    inventor,
    metadata
  )
  values (
    p_user_id,
    'provisional',
    'awaiting_payment',
    p_title_en,
    p_applicant,
    p_inventor,
    jsonb_build_object('attached_files', p_attached_files)
  )
  returning id, patents.our_ref into new_patent_id, new_our_ref;

  insert into processes_patents (
    user_id,
    case_id,
    our_ref,
    step_name,
    status,
    attached_files
  )
  values (
    p_user_id,
    new_patent_id,
    new_our_ref,
    'provisional application filling',
    'awaiting_payment',
    p_attached_files
  );

  return query select new_patent_id, new_our_ref;
end;
$$ language plpgsql;
