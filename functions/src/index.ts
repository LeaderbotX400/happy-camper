import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();

interface Item {
  name: string;
  price: number;
  stock: number;
  available: boolean;
  stats: {
    totalSold: number;
  };
}

export const addItem = functions.https.onCall(async (data, context) => {
  if (context.app == undefined) {
    throw new functions.https.HttpsError("permission-denied", "Unknown origin");
  }
  if (context.auth?.token.admin !== true) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "You must be an administator to do this"
    );
  }

  console.log(data);
  const item = {
    name: data.name as string,
    price: Number(data.price),
    stock: Number(data.stock),
    stats: {
      totalSold: 0 as number,
    },
    available: data.available as boolean,
  };
  const batch = admin.firestore().batch();
  batch.update(admin.firestore().doc("data/items"), {
    items: admin.firestore.FieldValue.arrayUnion(item),
  });

  return batch.commit().catch((err) => {
    throw new functions.https.HttpsError("internal", err.message);
  });
});

export const deleteItem = functions.https.onCall(async (data, context) => {
  if (context.app == undefined) {
    throw new functions.https.HttpsError("permission-denied", "Unknown origin");
  }
  if (context.auth?.token.admin !== true) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "You must be an administator to do this"
    );
  }
  const batch = admin.firestore().batch();
  batch.update(admin.firestore().doc("data/items"), {
    items: admin.firestore.FieldValue.arrayRemove(data.item),
  });
  return batch.commit().catch((err) => {
    return err;
  });
});

export const updateItem = functions.https.onCall(async (data, context) => {
  if (context.app == undefined) {
    throw new functions.https.HttpsError("permission-denied", "Unknown origin");
  }
  if (context.auth?.token.admin !== true) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "You must be an administator to do this"
    );
  }
  const batch = admin.firestore().batch();
  batch.update(admin.firestore().doc("data/items"), {
    items: data.items,
  });
  return batch.commit().catch((err) => {
    return err;
  });
});

export const submitOrder = functions.https.onCall(async (data, context) => {
  console.log(context.auth);
  if (context.app == undefined) {
    throw new functions.https.HttpsError("permission-denied", "Unknown origin");
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
    const newOrders = user.orders;
    newOrders.push(docRef.id);
    batch.update(admin.firestore().doc(`users/${context.auth?.uid}`), {
      orders: newOrders,
    });
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

export const newUser = functions.auth.user().onCreate(async (user) => {
  const batch = admin.firestore().batch();
  batch.set(admin.firestore().doc(`users/${user.uid}`), {
    data: {
      photoURL: user.photoURL as string,
      displayName: user.displayName as string,
      email: user.email as string,
      created: admin.firestore.FieldValue.serverTimestamp(),
    },

    orders: [] as string[],

    stats: {
      totalOrders: 0 as number,
      totalSpent: 0 as number,
    },

    roles: {},
  });
  return batch.commit().catch((err) => {
    return err;
  });
});

export const toggleAdmin = functions.https.onCall(async (data, context) => {
  if (context.app == undefined) {
    throw new functions.https.HttpsError("permission-denied", "Unknown origin");
  }
  if (context.auth?.token.admin !== true) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "You must be an administator to do this"
    );
  }
  const user = await admin.auth().getUserByEmail(data.email);
  await admin
    .auth()
    .setCustomUserClaims(user.uid, {
      admin: data.admin as boolean,
    })
    .catch((err) => {
      throw new functions.https.HttpsError("internal", err.message);
    });
  const batch = admin.firestore().batch();
  batch.update(admin.firestore().doc(`users/${user.uid}`), {
    roles: {
      admin: data.admin as boolean,
    },
  });
  return batch.commit().catch((err) => {
    return err;
  });
});
