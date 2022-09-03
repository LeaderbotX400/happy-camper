import type { Timestamp } from "@firebase/firestore";

export type Order = {
  email: string;
  items: [
    {
      name: string;
      quantity: number;
    }
  ];
  total: number;
  completed: boolean;
  completionDate: Timestamp;
};

export type Orders = {
  [key: string]: Order;
};

export type RawData = {
  [key: string]: boolean;
};
