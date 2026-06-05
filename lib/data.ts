export type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: "bebidas" | "snacks" | "otros";
};

export type Room = {
  id: string;
  number: string;
  guestName?: string;
  status: "occupied" | "vacant" | "cleaning";
};

export type Consumption = {
  id: string;
  roomId: string;
  productId: string;
  quantity: number;
  date: string;
};

export const products: Product[] = [
  {
    id: "p1",
    name: "Agua Mineral 500ml",
    price: 45,
    stock: 120,
    category: "bebidas",
  },
  {
    id: "p2",
    name: "Refresco Cola 355ml",
    price: 55,
    stock: 85,
    category: "bebidas",
  },
  {
    id: "p3",
    name: "Cerveza Clara 355ml",
    price: 80,
    stock: 60,
    category: "bebidas",
  },
  {
    id: "p4",
    name: "Papas Fritas 50g",
    price: 65,
    stock: 40,
    category: "snacks",
  },
  {
    id: "p5",
    name: "Chocolate con Almendras",
    price: 90,
    stock: 35,
    category: "snacks",
  },
  {
    id: "p6",
    name: "Kit de Afeitar",
    price: 120,
    stock: 15,
    category: "otros",
  },
];

export const rooms: Room[] = [
  { id: "r1", number: "Studio 1", guestName: "Juan Pérez", status: "occupied" },
  { id: "r2", number: "Studio 2", status: "vacant" },
  {
    id: "r3",
    number: "Studio 3",
    guestName: "María García",
    status: "occupied",
  },
  { id: "r4", number: "Loft 1", guestName: "Carlos López", status: "occupied" },
  { id: "r5", number: "Loft 2", status: "cleaning" },
  { id: "r6", number: "Loft 3", status: "vacant" },
  { id: "r7", number: "Loft 4", status: "vacant" },
  { id: "r8", number: "Loft 5", status: "occupied", guestName: "Ana Martínez" },
  { id: "r9", number: "Premiere 1", status: "vacant" },
  {
    id: "r10",
    number: "Premiere 2",
    status: "occupied",
    guestName: "Roberto Gómez",
  },
  { id: "r11", number: "Premiere 3", status: "cleaning" },
  { id: "r12", number: "Premiere 4", status: "vacant" },
  {
    id: "r13",
    number: "Premiere 5",
    status: "occupied",
    guestName: "Laura Torres",
  },
  { id: "r14", number: "Premiere 6", status: "vacant" },
  { id: "r15", number: "Premiere 7", status: "vacant" },
  {
    id: "r16",
    number: "Premiere 8",
    status: "occupied",
    guestName: "Luis Sánchez",
  },
  { id: "r17", number: "Familiar 1", status: "vacant" },
  { id: "r18", number: "Familiar 2", status: "cleaning" },
  {
    id: "r19",
    number: "Grand Family 1",
    status: "occupied",
    guestName: "Familia Ruiz",
  },
  { id: "r20", number: "Grand Family 2", status: "vacant" },
];

export const recentConsumptions: Consumption[] = [
  {
    id: "c1",
    roomId: "r1",
    productId: "p1",
    quantity: 2,
    date: new Date().toISOString(),
  },
  {
    id: "c2",
    roomId: "r3",
    productId: "p4",
    quantity: 1,
    date: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "c3",
    roomId: "r4",
    productId: "p3",
    quantity: 3,
    date: new Date(Date.now() - 7200000).toISOString(),
  },
];
