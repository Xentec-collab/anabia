import type { Product } from "./supabase";

// Fallback catalog extracted from Stitch "Anabia Minimalist E-Commerce"
export const DEMO_PRODUCTS: Product[] = [
  {
    id: "item-1",
    name: "Linen overshirt",
    category: "clothing",
    price: 2800,
    specs: "Natural oat, size M",
    description:
      "Minimalist beige textured organic linen overshirt flat lay on unbleached limestone surface.",
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDmX3KormHYbutSbXybG6ONE4M0iDUCls7UUyBzSuvWORWzah0BAMbQCGvJykJP44EeFz_hB_blSuH-UfA0tyyVbZ2rnuSQMKaIrNP4n0pun4dxGkgEhdn-Z2Yxv2FxK1XUzKTkTSjF9_2TeRbtmtWYKNm8JItLx4jxwTL3ORa0x694jbxIfAlkPThQak95Jfq2o5Ew3WQ2ymafraYu9ocmybedPpOPNvumcyGjkdxpNm91AfK8-1xn",
  },
  {
    id: "item-2",
    name: "Clay mug set (2)",
    category: "home",
    price: 1400,
    specs: "Set of 2 unglazed stoneware mugs",
    description:
      "Pair of tactile unglazed terracotta and sandstone clay mugs sitting side by side on a raw plaster ledge.",
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAu2A0ewYASPD60d6k5kT0a6UlFeXnt2zWTnOmPSNGjd8MAAd7PonzrS_c701JT-MOKV9lHGVJThI1FvLL0FFNB_6gtq5C5XUzzuECVZtORjskqS9vkoCQDZneyWLUuKJOeDXaJfLC0hLUBEUVjTJ0ZjuOvGNF60DKKfdoDw8H4IbxolcNiChfMFdFegy_Zih01pfVc2icGDwPc2Tup7VHk6ZU2b0H31uZhuIEUGCXhgKFJSq04Pgwc",
  },
  {
    id: "item-3",
    name: "Beeswax candle",
    category: "home",
    price: 650,
    specs: "Standard 220g",
    description:
      "Handmade sculptural rolled golden beeswax pillar candle standing tall on a matte travertine surface.",
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAy0BGMO2GfrAJc0OKBbwyAFZUjYEjwAwwfCvcNUY_teM2kEbtW8Y-_LkqKodBGr3A63lPjOe0DWDi_jeVj3ecO4WFXjkLsPV-S0_tTXkn96EK6QIm5-NA8mcicnZxCakHXJFuBeJkivrjgKhkND6ekKbZShf4hf6lxpNKkLYYv7BtqlNAvZPzlbnQ_eoi-XqVriZIEtwSLA4RWE4LLxH5GWxsUZRc-_q4D8kDlpD6fvu_QTVlyxkRq",
  },
  {
    id: "item-4",
    name: "Cotton tote bag",
    category: "accessories",
    price: 480,
    specs: "Heavyweight raw canvas",
    description:
      "Heavyweight raw off-white cotton canvas tote bag draped neatly over a smooth architectural monolith.",
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBwxKffLLpm_Of7MatgA-N2aAQaH3APJaiOfxxuW85urpD6ggjY00eAxMi6bcx3iCBLSw7nI5mXsWvXMFu-v40vRoCtRCYWBhFYODmPpZW3fDBn9zZJugE4mHEAVwuQtOMggINTg8iuYxvsUeQsKSAYlHbaBZOnOL0NsN4ugFqPOZD2Xbu7jlnakYzcGxEu4W3S5xLhhZU9Nh1hGe8pawdOiG9GTPilio7gNSGsarWwRez5oWVGWMEw",
  },
  {
    id: "item-5",
    name: "Silk scrunchie set",
    category: "accessories",
    price: 390,
    specs: "Trio of mulberry silk",
    description:
      "Trio of raw mulberry silk scrunchies in muted taupe, sand, and charcoal shades clustered together on warm limestone.",
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBlsCb1F1-69VucEkF_tTDMlxQ_7re2wGPPqQVfQsMIeiK8Unfcr0hLZd8mqyS9c2vIgIXPXAda3pzbXLXQ7ONLbREasDiR6ehscCltM9wNcZ0ijQ6NZVLL3qeXlrIzpXS_6nwxhnOtpZkqa-iH0vS3aEACtxSXfcQX3YZm830lHcWAQSDF6ts86MYbifa3lR4rdBK7T3O20hAtMVkreF5idsgfHj4MzJP0RY4W3tRPVMXcLwEek8K7",
  },
  {
    id: "item-6",
    name: "Hand cream, fig",
    category: "care",
    price: 720,
    specs: "75ml matte aluminium tube",
    description:
      "Minimalist matte aluminium squeeze tube of fig hand cream placed upright against warm concrete.",
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDXxkBKhl0wflJsYqEPj4JBcADUs4O1kse5zZ4Ro0U9dshEOEvAmHHgbShdWHc3uzkmHMo_b7ku3NjGuP9vs1bfZftxwtnTFZ6cSGig9agYsouWs7BO8V7YdSQoYXgq3o9g3qnLCyi7CmbMc-a54B8bUOlO30SnA-jGg-27vrvtQpzuWZj_AzlllEzHdiQzLcYoJLaOFZNSIj0Y3t7ck9pQI3_2qvkbUaghpEVG1dWCchkw_v6D3xzX",
  },
  {
    id: "item-7",
    name: "Ceramic incense holder",
    category: "home",
    price: 950,
    specs: "Oatmeal glaze stoneware",
    description:
      "Ceramic stoneware slender incense burner with subtle speckled oatmeal glaze holding a delicate smoldering stick.",
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCzXcPijDHg31ubDqKKQ4tAoyodAbu4xb1EHWKuJggE8VlrUz5otguBlJuE1zXESPsKdevf2rwbJNwBMTzdsnKDS9Nc1sn34p4JyCnSuG5MK8iOcpZz4nNfLEIFJ0j-8arzVafVGQqP75IIIvUltWr-rJIqeKLIPJvAy7If_LkjiUrY-RwFAi3mTkOwXUWFDiBnVp3DFKDsIWZY_JohdtqchBYHf6sGQjsU-YQkmYu2JeFwbl9fjtNa",
  },
  {
    id: "item-8",
    name: "Linen midi skirt",
    category: "clothing",
    price: 3100,
    specs: "Washed oat linen, tailored waistband",
    description:
      "Flowing A-line washed oat linen midi skirt displayed hanging against a chalky lime-wash wall.",
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAC_NXGv5uyizLcobHc6zltSOmFhq4DiJi3G8FbWT0yz7mbQWxaQyt3Ujs5qIIuJdPY3UnxYOElOS8SoMiYMI4g_-Tbxa1gTRj0_GX4o4dwdBk4hIOQof01UKUTZfnu1PsU8FQnHpXxozAHS6Mbnavub_ttNsbzXNh4kbfVgpp4NCW6RJeDoJGjjKiO1UwTfEZdGdhuDpwPYFFp5H7V0C2qlN8yFCnQ5ND_xVp_fpKIgiFZCKjSqhom",
  },
  {
    id: "item-9",
    name: "Rope bath mat",
    category: "home",
    price: 1100,
    specs: "Natural unbleached cotton & hemp",
    description:
      "Thick braided natural unbleached cotton and hemp rope bath mat rolled gently on a smooth warm stone floor.",
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBPcFVSiwSUawKiC94Z6Z3fXhR7KNZHI-PNhnzN5_r3x3yT5DOvDifUBx0PwjXX0oO6wTd_WquXlbDUFtMDRjQHF7b68KS8-a-M0yJarzO41ZG4nPC7Dx-6QgVj92Hm0-saoG_Z_G_tmh01xfxlOq2DNhhyyHB2Tq7ColOfxkjz9UuMzhG4Kz-eXXUcV9e91x1KQocn33vDVNDvis0BAqnHCdk3peootYS72VRoTNkvz-WMe2EmvqhS",
  },
  {
    id: "item-10",
    name: "Brass bookmark",
    category: "accessories",
    price: 340,
    specs: "Brushed architectural brass",
    description:
      "Solid brushed brass architectural bookmark resting flat across open pages of a linen-bound art book.",
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAZ9vWmVd0GKwdyRfzcuZgsbAGLkrUa8D8vCzozioMHD1vZJYNP5zgqZFAjnSFRju_XYK5M0O3e4WUekiRfPnsSmZL1CGwamsrV_NCAvZPZZV23qKmFYZh6PUTccUSlBi22I2LMbp3HDdL9sbt5ppvXu2PfmzUP4sntSD0pU0KI9pr-ZooIeivciThtFHvjlDs0yQIX06cQqlDgnVifZUwkULk4ocmFQZFP7TspxkCFf9PgB5SnUn_8",
  },
  {
    id: "item-11",
    name: "Face cloth, organic",
    category: "care",
    price: 560,
    specs: "Waffle weave organic cotton",
    description:
      "Neatly folded waffle weave organic cotton face cloth in muted ash-beige lying atop smooth river pebble.",
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDt8Mbq7XI0h753YAcc1TyGRuOX8EmOnZqVQMcvyIFQrBVuWPZIQZYMUmhrkVDAlpUfp_pJkGmyZNzO8jD2ClM0Rm-skVN0HbLi2SuYF1uFk4Npy7mYEyzZc91BxUOqkq_rMuQ9mPYD4LD0WnWz8R-_-fIr8lf_nydsNEAYw6T_AQwvErVMor4wOAqXqi2gprlgMQtG1zE853MHrLUWyU6x1MDpdyaoo19lNNY4a9Msxhg7K5Wipn-F",
  },
  {
    id: "item-12",
    name: "Woven throw pillow",
    category: "home",
    price: 1800,
    specs: "Artisanal wool & slub linen",
    description:
      "Handwoven artisanal wool and raw slub linen throw pillow with subtle textured geometric grid pattern.",
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAmkKAD67ueAuZGKQxN7zm7s7GadDD8NP2NAUlcEyW2AE4NfwAaDzNWPks8lGzJttSUV_YqfPf-Vk-a1_xtc_SCRq5TT6t8j-ZxEymRrut8rXbB31gDYNTqTsnRKqe3zsROZpHdsWqk1rvsrV-Kkt-cjGNTkCRHG8asVAMqNPwieJP2pPfz7tCKz1-fDR0i9QG4hmbW9hDgWgSKYfMKBZCROPqI4deroAdRWGLuhmU0icS8yKL_ouSH",
  },
];
