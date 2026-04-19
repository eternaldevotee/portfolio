create extension if not exists pgcrypto;

create table if not exists public.blog_posts (
  id text primary key,
  title text not null,
  date date not null,
  excerpt text not null default '',
  tags text[] not null default '{}'::text[],
  content_html text not null,
  cover_image_url text,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_date_idx on public.blog_posts (date desc);
create index if not exists blog_posts_deleted_idx on public.blog_posts (is_deleted);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
before update on public.blog_posts
for each row
execute function public.set_updated_at();

alter table public.blog_posts enable row level security;

drop policy if exists "blog_posts_public_select" on public.blog_posts;
create policy "blog_posts_public_select"
  on public.blog_posts
  for select
  to anon, authenticated
  using (true);

drop policy if exists "blog_posts_authenticated_insert" on public.blog_posts;
create policy "blog_posts_authenticated_insert"
  on public.blog_posts
  for insert
  to authenticated
  with check (true);

drop policy if exists "blog_posts_authenticated_update" on public.blog_posts;
create policy "blog_posts_authenticated_update"
  on public.blog_posts
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "blog_posts_authenticated_delete" on public.blog_posts;
create policy "blog_posts_authenticated_delete"
  on public.blog_posts
  for delete
  to authenticated
  using (true);

insert into public.blog_posts (id, title, date, excerpt, tags, content_html, cover_image_url)
values
(
  'welcome-blog',
  'Welcome to My Blog',
  '2026-04-05',
  'Introducing my new blog section where I will share thoughts on software engineering, technology, and my experiences.',
  array['introduction', 'blog'],
  '<p>Hello! Welcome to my blog. This is the first post in what I hope will be a series of articles about software development, best practices, and my journey as a developer.</p><p>I will be writing about topics like Spring Boot, Angular, Java, and other technologies I\'m working with. Stay tuned for more!</p>',
  null
),
(
  'welcome-blog-2',
  'Welcome to My Blog',
  '2026-04-05',
  'Introducing my new blog section where I will share thoughts on software engineering, technology, and my experiences.',
  array['introduction', 'blog'],
  '<p>Hello! Welcome to my blog. This is the first post in what I hope will be a series of articles about software development, best practices, and my journey as a developer.</p><p>I will be writing about topics like Spring Boot, Angular, Java, and other technologies I\'m working with. Stay tuned for more!</p>',
  null
)
on conflict (id) do update
set title = excluded.title,
    date = excluded.date,
    excerpt = excluded.excerpt,
    tags = excluded.tags,
    content_html = excluded.content_html,
    cover_image_url = excluded.cover_image_url,
    is_deleted = false;

insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do update
set name = excluded.name,
    public = true;

drop policy if exists "blog_images_public_read" on storage.objects;
create policy "blog_images_public_read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'blog-images');

drop policy if exists "blog_images_authenticated_insert" on storage.objects;
create policy "blog_images_authenticated_insert"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'blog-images');

drop policy if exists "blog_images_authenticated_update" on storage.objects;
create policy "blog_images_authenticated_update"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'blog-images')
  with check (bucket_id = 'blog-images');

drop policy if exists "blog_images_authenticated_delete" on storage.objects;
create policy "blog_images_authenticated_delete"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'blog-images');