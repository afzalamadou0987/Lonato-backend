create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  numbers_pool int not null,
  numbers_to_pick int not null,
  price_per_ticket numeric not null,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists draws (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id),
  winning_numbers jsonb,
  status text default 'scheduled',
  draw_date timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists tickets (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  game_id uuid references games(id),
  draw_id uuid references draws(id),
  selected_numbers jsonb not null,
  amount numeric not null,
  payment_method text,
  payment_ref text,
  payment_status text default 'pending',
  status text default 'en_attente',
  winnings_amount numeric default 0,
  qr_payload text,
  expo_push_token text,
  created_at timestamptz default now()
);

create index if not exists idx_tickets_user on tickets(user_id);
create index if not exists idx_tickets_draw on tickets(draw_id);