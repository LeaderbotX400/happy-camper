import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();

import * as orders from "./orders";
import * as items from "./items";
import BillingLimiter from "./billing";

export { orders, items };

// eslint-disable-next-line new-cap
export const billingLimit = BillingLimiter({
  disableProjectAmount: 0.01,
  topicId: "billing",
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
      "You must be an administrator to do this"
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

export const deleteUser = functions.https.onCall(async (data, context) => {
  if (context.app == undefined) {
    throw new functions.https.HttpsError("permission-denied", "Unknown origin");
  }
  if (context.auth?.token.dev !== true && context.auth?.token.admin !== true) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "this is a dev only function"
    );
  }
  const user = await admin.auth().getUserByEmail(data.email);
  await admin.auth().deleteUser(user.uid);
  const batch = admin.firestore().batch();
  batch.delete(admin.firestore().doc(`users/${user.uid}`));
  const orders = await admin
    .firestore()
    .collection("orders")
    .where("email", "==", data.email)
    .get();
  orders.forEach((doc) => {
    batch.delete(doc.ref);
  });
  return batch.commit().catch((err) => {
    return err;
  });
});
