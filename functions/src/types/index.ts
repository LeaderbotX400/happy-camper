export type Item = {
  name: string;
  price: number;
  stock: number;
  available: boolean;
  stats: {
    totalSold: number;
  };
}
