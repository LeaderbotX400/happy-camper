/* eslint-disable indent */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const addItem = functions.https.onCall(async (data, context) => {
  if (context.app == undefined) {
    throw new functions.https.HttpsError("permission-denied", "Unknown origin");
  }
  if (context.auth?.token.admin !== true) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "You must be an administrator to do this"
    );
  }

  console.log(data);
  const item = {
    name: data.name as string,
    price: Number(data.price) as number,
    stock: Number(data.stock) as number,
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
      "You must be an administrator to do this"
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
      "You must be an administrator to do this"
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
