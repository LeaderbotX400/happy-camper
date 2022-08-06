import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();

export const addItem = functions.https.onCall(async (data, context) => {
  if (context == null) {
    throw new functions.https.HttpsError("permission-denied", "Unknown origin");
  }

  const item = {
    name: data.name,
    price: data.price,
    avalible: data.avalible,
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
    throw new functions.https.HttpsError("internal", err);
  });
});

export const submitOrder = functions.https.onCall(async (data, context) => {
  if (context.app == undefined) {
    throw new functions.https.HttpsError("permission-denied", "Unknown origin");
  }

  const batch = admin.firestore().batch();
  batch.set(admin.firestore().doc(`orders/${data.uid}`), {
    email: data.email,
    items: data.items,
    total: data.total,
    time: admin.firestore.Timestamp.now(),
  });
  return batch.commit().catch((err) => {
    return err;
  });
});
