//Tipo base prodotto.
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  platform: string;
  rating: number;
  image: string;
};

//Lista prodotti mock per il catalogo.
export const products: Product[] = [
  {
    id: "1",
    name: "Elden Ring - Deluxe",
    description:
      "Explore the Lands Between with a premium edition that includes the base game and bonus content.",
    price: 38.99,
    originalPrice: 59.99,
    category: "RPG",
    platform: "PC",
    rating: 4.9,
    image: "/BWA_logo.png",
  },
  {
    id: "2",
    name: "Cyber Sentinel 2077",
    description:
      "Open-world action RPG with deep customization and a neon-drenched city to explore.",
    price: 24.99,
    originalPrice: 49.99,
    category: "Action",
    platform: "PC",
    rating: 4.5,
    image: "/BWA_logo.png",
  },
  {
    id: "3",
    name: "Apex Drift Legends",
    description:
      "Competitive racing with realistic handling, custom liveries, and online tournaments.",
    price: 19.99,
    originalPrice: 39.99,
    category: "Racing",
    platform: "PC",
    rating: 4.3,
    image: "/BWA_logo.png",
  },
  {
    id: "4",
    name: "Starfall Odyssey",
    description:
      "Sci-fi adventure with tactical combat, crew management, and branching storylines.",
    price: 29.99,
    category: "Strategy",
    platform: "PC",
    rating: 4.6,
    image: "/BWA_logo.png",
  },
  {
    id: "5",
    name: "Shadow Protocol",
    description:
      "Stealth action thriller featuring tactical gadgets and high-stakes missions.",
    price: 14.99,
    originalPrice: 29.99,
    category: "Stealth",
    platform: "PC",
    rating: 4.2,
    image: "/BWA_logo.png",
  },
  {
    id: "6",
    name: "Mythic Realms Online",
    description:
      "Massive multiplayer world with raids, crafting, and seasonal events.",
    price: 9.99,
    category: "MMO",
    platform: "PC",
    rating: 4.1,
    image: "/BWA_logo.png",
  },
  {
    id: "7",
    name: "Tactics Forge",
    description:
      "Turn-based strategy with squad builds, permadeath, and endless replayability.",
    price: 17.99,
    category: "Strategy",
    platform: "PC",
    rating: 4.4,
    image: "/BWA_logo.png",
  },
  {
    id: "8",
    name: "Neon Arena",
    description:
      "Fast-paced shooter with stylized visuals, ranked ladders, and seasonal passes.",
    price: 12.49,
    category: "Shooter",
    platform: "PC",
    rating: 4.0,
    image: "/BWA_logo.png",
  },
];

//Trova un prodotto per id.
export const getProductById = (id: string) => {
  return products.find((product) => product.id === id);
};
