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
  if (context == null) {
    throw new functions.https.HttpsError("permission-denied", "Unknown origin");
  }

  console.log(data);
  const item = {
    name: data.name as string,
    price: data.price as number,
    stock: data.stock as number,
    stats: {
      totalSold: 0 as number,
    },
    available: data.available as boolean,
  };
  const batch = admin.firestore().batch();
  batch.update(admin.firestore().doc("data/items"), {
    items: admin.firestore.FieldValue.arrayUnion(item),
  });

  batch.update(admin.firestore().doc("data/stats"), {
    items: admin.firestore.FieldValue.arrayUnion({
      name: data.name,
      sold: 0,
    }),
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
  batch.update(admin.firestore().doc("data/stats"), {
    items: admin.firestore.FieldValue.arrayRemove({
      name: data.item.name,
      sold: 0,
    }),
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
    completed: false,
    items: data.items,
    total: data.total,
    created: admin.firestore.FieldValue.serverTimestamp(),
    email: context.auth?.token.email,
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
        item.stock -= data.items[index].quantity as number;
        item.available = (item.stock > 0) as boolean;
        item.stats.totalSold += data.items[index].quantity as number;
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
        totalSpent: user.stats.totalSpent + data.total,
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
    metadata: {
      photoURL: user.photoURL,
      displayName: user.displayName,
      email: user.email,
      created: admin.firestore.FieldValue.serverTimestamp(),
    },

    orders: [],

    stats: {
      totalOrders: 0,
      totalSpent: 0,
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
      admin: data.admin,
    })
    .catch((err) => {
      throw new functions.https.HttpsError("internal", err.message);
    });
  const batch = admin.firestore().batch();
  batch.update(admin.firestore().doc(`users/${user.uid}`), {
    roles: {
      admin: data.admin,
    },
  });
  return batch.commit().catch((err) => {
    return err;
  });
});
