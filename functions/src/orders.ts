import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

interface Item {
  name: string;
  price: number;
  stock: number;
  available: boolean;
  stats: {
    totalSold: number;
  };
}

export const submit = functions.https.onCall(async (data, context) => {
  console.log(context.auth);
  if (context.app == undefined) {
    throw new functions.https.HttpsError("permission-denied", "Unknown origin");
  }

  // only allow logged in users to submit orders
  if (context.auth == undefined) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "You must be logged in to do this"
    );
  }
  const docRef = admin.firestore().collection("orders").doc();
  const batch = admin.firestore().batch();
  batch.set(docRef, {
    completed: false as boolean,
    items: data.items,
    total: data.total as number,
    created: admin.firestore.FieldValue.serverTimestamp(),
    email: context.auth?.token.email as string,
  });

  // update item stats
  await admin.firestore().runTransaction(async (t) => {
    const doc = await t.get(admin.firestore().doc("data/items"));
    const items = doc.data()?.items;
    if (items == undefined || items.length == 0) {
      throw new functions.https.HttpsError("internal", "No items found");
    }
    const newItems = items.map((item: Item) => {
      const index = data.items.findIndex((i: Item) => i.name === item.name);
      if (index !== -1) {
        item.stock -= Number(data.items[index].quantity);
        item.available = (item.stock > 0) as boolean;
        item.stats.totalSold += Number(data.items[index].quantity);
      }
      return item;
    });
    batch.update(admin.firestore().doc("data/items"), {
      items: newItems,
    });
  });

  // update user stats
  await admin.firestore().runTransaction(async (t) => {
    const doc = await t.get(
      admin.firestore().doc(`users/${context.auth?.uid}`)
    );
    const user = doc.data();
    if (user == undefined) {
      throw new functions.https.HttpsError("internal", "No user found");
    }
    batch.update(admin.firestore().doc(`users/${context.auth?.uid}`), {
      stats: {
        totalOrders: admin.firestore.FieldValue.increment(1),
        totalSpent: Number(user.stats.totalSpent + data.total),
      },
    });
  });

  return batch.commit().catch((err) => {
    throw new functions.https.HttpsError("internal", err);
  });
});

export const complete = functions.https.onCall(async (data, context) => {
  if (context.app == undefined) {
    throw new functions.https.HttpsError("permission-denied", "Unknown origin");
  }
  if (context.auth == undefined) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "You must be logged in to do this"
    );
  }
  if (context.auth?.token.admin !== true) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "You must be an administrator to do this"
    );
  }
  if (data.id == undefined || data.id == "") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "You must provide an order id"
    );
  }
  const batch = admin.firestore().batch();
  batch.update(admin.firestore().doc(`orders/${data.id}`), {
    completed: true,
    completionDate: admin.firestore.FieldValue.serverTimestamp(),
  });
  return batch.commit().catch((err) => {
    return err;
  });
});
