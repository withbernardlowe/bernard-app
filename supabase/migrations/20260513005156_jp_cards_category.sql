alter table jp_cards add column category text check (category in ('warmup', 'examples'));

update jp_cards
set category = case
  when source_section ilike '%暖身%' then 'warmup'
  else 'examples'
end;

alter table jp_cards alter column category set not null;
alter table jp_cards alter column category set default 'examples';
