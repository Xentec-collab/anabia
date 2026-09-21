-- ==============================================================================
-- Anabia Minimalist E-Commerce - Database Schema & Seed Data
-- ==============================================================================

-- 1. Create products table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price integer not null, -- stored in paise, e.g. 280000 = ₹2,800.00
  category text not null check (category in ('clothing', 'accessories', 'home', 'care')),
  image_url text,
  stock integer default 10,
  specs text,
  description text,
  created_at timestamptz default now()
);

-- 2. Enable Row Level Security (RLS)
alter table public.products enable row level security;

-- 3. Allow public read access to products
create policy "Allow public read access to products"
  on public.products
  for select
  using (true);

-- 4. Seed all 12 Anabia products
insert into public.products (name, price, category, image_url, stock, specs, description)
values
  (
    'Linen overshirt',
    280000,
    'clothing',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDmX3KormHYbutSbXybG6ONE4M0iDUCls7UUyBzSuvWORWzah0BAMbQCGvJykJP44EeFz_hB_blSuH-UfA0tyyVbZ2rnuSQMKaIrNP4n0pun4dxGkgEhdn-Z2Yxv2FxK1XUzKTkTSjF9_2TeRbtmtWYKNm8JItLx4jxwTL3ORa0x694jbxIfAlkPThQak95Jfq2o5Ew3WQ2ymafraYu9ocmybedPpOPNvumcyGjkdxpNm91AfK8-1xn',
    10,
    'Natural oat, size M',
    'Minimalist beige textured organic linen overshirt flat lay on unbleached limestone surface, soft diffuse daylight, gentle folds, archival studio photography in muted natural earth tones, quiet luxury editorial style.'
  ),
  (
    'Clay mug set (2)',
    140000,
    'home',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAu2A0ewYASPD60d6k5kT0a6UlFeXnt2zWTnOmPSNGjd8MAAd7PonzrS_c701JT-MOKV9lHGVJThI1FvLL0FFNB_6gtq5C5XUzzuECVZtORjskqS9vkoCQDZneyWLUuKJOeDXaJfLC0hLUBEUVjTJ0ZjuOvGNF60DKKfdoDw8H4IbxolcNiChfMFdFegy_Zih01pfVc2icGDwPc2Tup7VHk6ZU2b0H31uZhuIEUGCXhgKFJSq04Pgwc',
    10,
    'Set of 2 unglazed stoneware mugs',
    'Pair of tactile unglazed terracotta and sandstone clay mugs sitting side by side on a raw plaster ledge, gentle overhead morning shadow, warm neutral beige palette, serene artisanal pottery still life.'
  ),
  (
    'Beeswax candle',
    65000,
    'home',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAy0BGMO2GfrAJc0OKBbwyAFZUjYEjwAwwfCvcNUY_teM2kEbtW8Y-_LkqKodBGr3A63lPjOe0DWDi_jeVj3ecO4WFXjkLsPV-S0_tTXkn96EK6QIm5-NA8mcicnZxCakHXJFuBeJkivrjgKhkND6ekKbZShf4hf6lxpNKkLYYv7BtqlNAvZPzlbnQ_eoi-XqVriZIEtwSLA4RWE4LLxH5GWxsUZRc-_q4D8kDlpD6fvu_QTVlyxkRq',
    10,
    'Standard 220g',
    'Handmade sculptural rolled golden beeswax pillar candle standing tall on a matte travertine surface, soft ambient natural illumination, subtle geometric ridges, minimal refined interior catalog.'
  ),
  (
    'Cotton tote bag',
    48000,
    'accessories',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBwxKffLLpm_Of7MatgA-N2aAQaH3APJaiOfxxuW85urpD6ggjY00eAxMi6bcx3iCBLSw7nI5mXsWvXMFu-v40vRoCtRCYWBhFYODmPpZW3fDBn9zZJugE4mHEAVwuQtOMggINTg8iuYxvsUeQsKSAYlHbaBZOnOL0NsN4ugFqPOZD2Xbu7jlnakYzcGxEu4W3S5xLhhZU9Nh1hGe8pawdOiG9GTPilio7gNSGsarWwRez5oWVGWMEw',
    10,
    'Heavyweight raw canvas',
    'Heavyweight raw off-white cotton canvas tote bag draped neatly over a smooth architectural monolith, sharp linear design, exposed clean stitching, neutral Japanese minimalist studio aesthetic.'
  ),
  (
    'Silk scrunchie set',
    39000,
    'accessories',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBlsCb1F1-69VucEkF_tTDMlxQ_7re2wGPPqQVfQsMIeiK8Unfcr0hLZd8mqyS9c2vIgIXPXAda3pzbXLXQ7ONLbREasDiR6ehscCltM9wNcZ0ijQ6NZVLL3qeXlrIzpXS_6nwxhnOtpZkqa-iH0vS3aEACtxSXfcQX3YZm830lHcWAQSDF6ts86MYbifa3lR4rdBK7T3O20hAtMVkreF5idsgfHj4MzJP0RY4W3tRPVMXcLwEek8K7',
    10,
    'Trio of mulberry silk',
    'Trio of raw mulberry silk scrunchies in muted taupe, sand, and charcoal shades clustered together on warm limestone, soft directional light, delicate fabric texture, editorial catalog photography.'
  ),
  (
    'Hand cream, fig',
    72000,
    'care',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDXxkBKhl0wflJsYqEPj4JBcADUs4O1kse5zZ4Ro0U9dshEOEvAmHHgbShdWHc3uzkmHMo_b7ku3NjGuP9vs1bfZftxwtnTFZ6cSGig9agYsouWs7BO8V7YdSQoYXgq3o9g3qnLCyi7CmbMc-a54B8bUOlO30SnA-jGg-27vrvtQpzuWZj_AzlllEzHdiQzLcYoJLaOFZNSIj0Y3t7ck9pQI3_2qvkbUaghpEVG1dWCchkw_v6D3xzX',
    10,
    '75ml matte aluminium tube',
    'Minimalist matte aluminium squeeze tube of fig hand cream placed upright against warm concrete, clean black typographic label, soft side lighting, editorial apothecary stillness.'
  ),
  (
    'Ceramic incense holder',
    95000,
    'home',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCzXcPijDHg31ubDqKKQ4tAoyodAbu4xb1EHWKuJggE8VlrUz5otguBlJuE1zXESPsKdevf2rwbJNwBMTzdsnKDS9Nc1sn34p4JyCnSuG5MK8iOcpZz4nNfLEIFJ0j-8arzVafVGQqP75IIIvUltWr-rJIqeKLIPJvAy7If_LkjiUrY-RwFAi3mTkOwXUWFDiBnVp3DFKDsIWZY_JohdtqchBYHf6sGQjsU-YQkmYu2JeFwbl9fjtNa',
    10,
    'Oatmeal glaze stoneware',
    'Ceramic stoneware slender incense burner with subtle speckled oatmeal glaze holding a delicate smoldering stick, faint whisper of smoke curling upwards, muted warm grey background.'
  ),
  (
    'Linen midi skirt',
    310000,
    'clothing',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAC_NXGv5uyizLcobHc6zltSOmFhq4DiJi3G8FbWT0yz7mbQWxaQyt3Ujs5qIIuJdPY3UnxYOElOS8SoMiYMI4g_-Tbxa1gTRj0_GX4o4dwdBk4hIOQof01UKUTZfnu1PsU8FQnHpXxozAHS6Mbnavub_ttNsbzXNh4kbfVgpp4NCW6RJeDoJGjjKiO1UwTfEZdGdhuDpwPYFFp5H7V0C2qlN8yFCnQ5ND_xVp_fpKIgiFZCKjSqhom',
    10,
    'Washed oat linen, tailored waistband',
    'Flowing A-line washed oat linen midi skirt displayed hanging against a chalky lime-wash wall, subtle natural wrinkles, soft architectural shadow, refined understated fashion composition.'
  ),
  (
    'Rope bath mat',
    110000,
    'home',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBPcFVSiwSUawKiC94Z6Z3fXhR7KNZHI-PNhnzN5_r3x3yT5DOvDifUBx0PwjXX0oO6wTd_WquXlbDUFtMDRjQHF7b68KS8-a-M0yJarzO41ZG4nPC7Dx-6QgVj92Hm0-saoG_Z_G_tmh01xfxlOq2DNhhyyHB2Tq7ColOfxkjz9UuMzhG4Kz-eXXUcV9e91x1KQocn33vDVNDvis0BAqnHCdk3peootYS72VRoTNkvz-WMe2EmvqhS',
    10,
    'Natural unbleached cotton & hemp',
    'Thick braided natural unbleached cotton and hemp rope bath mat rolled gently on a smooth warm stone floor, tactile coarse texture, quiet neutral bathroom scene, soft raking sunlight.'
  ),
  (
    'Brass bookmark',
    34000,
    'accessories',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAZ9vWmVd0GKwdyRfzcuZgsbAGLkrUa8D8vCzozioMHD1vZJYNP5zgqZFAjnSFRju_XYK5M0O3e4WUekiRfPnsSmZL1CGwamsrV_NCAvZPZZV23qKmFYZh6PUTccUSlBi22I2LMbp3HDdL9sbt5ppvXu2PfmzUP4sntSD0pU0KI9pr-ZooIeivciThtFHvjlDs0yQIX06cQqlDgnVifZUwkULk4ocmFQZFP7TspxkCFf9PgB5SnUn_8',
    10,
    'Brushed architectural brass',
    'Solid brushed brass architectural bookmark resting flat across open pages of a linen-bound art book, warm golden metallic sheen, stark minimalist geometric silhouette, crisp studio lighting.'
  ),
  (
    'Face cloth, organic',
    56000,
    'care',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDt8Mbq7XI0h753YAcc1TyGRuOX8EmOnZqVQMcvyIFQrBVuWPZIQZYMUmhrkVDAlpUfp_pJkGmyZNzO8jD2ClM0Rm-skVN0HbLi2SuYF1uFk4Npy7mYEyzZc91BxUOqkq_rMuQ9mPYD4LD0WnWz8R-_-fIr8lf_nydsNEAYw6T_AQwvErVMor4wOAqXqi2gprlgMQtG1zE853MHrLUWyU6x1MDpdyaoo19lNNY4a9Msxhg7K5Wipn-F',
    10,
    'Waffle weave organic cotton',
    'Neatly folded waffle weave organic cotton face cloth in muted ash-beige lying atop smooth river pebble, soft overhead light, pure serene spa texture, minimalist botanical wellness.'
  ),
  (
    'Woven throw pillow',
    180000,
    'home',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAmkKAD67ueAuZGKQxN7zm7s7GadDD8NP2NAUlcEyW2AE4NfwAaDzNWPks8lGzJttSUV_YqfPf-Vk-a1_xtc_SCRq5TT6t8j-ZxEymRrut8rXbB31gDYNTqTsnRKqe3zsROZpHdsWqk1rvsrV-Kkt-cjGNTkCRHG8asVAMqNPwieJP2pPfz7tCKz1-fDR0i9QG4hmbW9hDgWgSKYfMKBZCROPqI4deroAdRWGLuhmU0icS8yKL_ouSH',
    10,
    'Artisanal wool & slub linen',
    'Handwoven artisanal wool and raw slub linen throw pillow with subtle textured geometric grid pattern resting against warm timber paneling, cozy quiet luxury atmosphere, natural daylight.'
  )
on conflict do nothing;

-- ==============================================================================
-- 5. Contact form inquiries table
-- ==============================================================================

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamptz default now()
);

alter table public.inquiries enable row level security;

create policy "Allow public insert on inquiries"
  on public.inquiries
  for insert
  with check (true);

-- ==============================================================================
-- 6. Orders table (wholesale order notifications)
-- ==============================================================================

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  company_name text,
  phone text not null,
  email text,
  city text,
  notes text,
  items jsonb not null,
  subtotal integer not null,
  status text default 'new',
  created_at timestamptz default now()
);

alter table public.orders enable row level security;

create policy "Allow public insert on orders"
  on public.orders
  for insert
  with check (true);
