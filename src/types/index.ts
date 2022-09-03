import type { User } from "@firebase/auth";

export type Item = {
  id: string;
  name: string;
  price: number;
  stock: number;
  available: boolean;
  stats: {
    totalSold: number;
  };
};

// create a type that extends the Item type

export type UserPlus = User & {
  data: {
    displayName: string;
    email: string;
    photoURL: string;
  };
  stats: {
    totalOrders: number;
    totalSpent: number;
  };
  roles: {
    admin: boolean;
    dev: boolean;
  };
};
