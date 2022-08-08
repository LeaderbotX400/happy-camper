import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();

export const addItem = functions.https.onCall(async (data, context) => {
  if (context == null) {
    throw new functions.https.HttpsError("permission-denied", "Unknown origin");
  }

  console.log(data);
  const item = {
    name: data.name,
    price: data.price,
    stock: data.stock,
    stats: {
      totalSold: 0,
    },
    available: data.available,
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
  await admin.firestore().runTransaction(async (t) => {
    const doc = await t.get(admin.firestore().doc("data/items"));
    const items = doc.data()?.items;
    if (items == undefined || items.length == 0) {
      throw new functions.https.HttpsError("internal", "No items found");
    }
    const newItems = items.map((item: any) => {
      const index = data.items.findIndex((i: any) => i.name === item.name);
      if (index !== -1) {
        item.stock -= data.items[index].quantity;
        item.available = item.stock > 0;
        item.stats.totalSold += data.items[index].quantity;
      }
      return item;
    });
    batch.update(admin.firestore().doc("data/items"), {
      items: newItems,
    });
  });
  return batch.commit().catch((err) => {
    throw new functions.https.HttpsError("internal", err);
  });
});

export const newUser = functions.auth.user().onCreate(async (user) => {
  const batch = admin.firestore().batch();
  batch.set(admin.firestore().doc(`users/${user.uid}`), {
    email: user.email,
  });
  return batch.commit().catch((err) => {
    return err;
  });
});

export const makeAdmin = functions.https.onCall(async (data, context) => {
  if (context.app == undefined) {
    throw new functions.https.HttpsError("permission-denied", "Unknown origin");
  }
  if (context.auth?.token.admin !== true) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "You must be an administator to do this"
    );
  }
  return admin
    .auth()
    .getUserByEmail(data.email)
    .then((user) => {
      admin.auth().setCustomUserClaims(user.uid, { admin: true });
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
