-- Shared triggers.

create or replace function public.tg_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- Attach to every table that has an updated_at column.
do $$
declare r record;
begin
  for r in
    select table_schema, table_name
    from information_schema.columns
    where column_name = 'updated_at' and table_schema = 'public'
  loop
    execute format(
      'drop trigger if exists %I_updated_at on %I.%I',
      r.table_name, r.table_schema, r.table_name
    );
    execute format(
      'create trigger %I_updated_at before update on %I.%I for each row execute function public.tg_updated_at()',
      r.table_name, r.table_schema, r.table_name
    );
  end loop;
end $$;

-- Maintain stories.like_count / comment_count.
create or replace function public.tg_story_like_count()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    update public.stories set like_count = like_count + 1 where id = new.story_id;
  elsif tg_op = 'DELETE' then
    update public.stories set like_count = greatest(like_count - 1, 0) where id = old.story_id;
  end if;
  return null;
end $$;

drop trigger if exists story_like_count_trg on public.story_likes;
create trigger story_like_count_trg
after insert or delete on public.story_likes
for each row execute function public.tg_story_like_count();

create or replace function public.tg_story_comment_count()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    update public.stories set comment_count = comment_count + 1 where id = new.story_id;
  elsif tg_op = 'DELETE' then
    update public.stories set comment_count = greatest(comment_count - 1, 0) where id = old.story_id;
  end if;
  return null;
end $$;

drop trigger if exists story_comment_count_trg on public.story_comments;
create trigger story_comment_count_trg
after insert or delete on public.story_comments
for each row execute function public.tg_story_comment_count();
