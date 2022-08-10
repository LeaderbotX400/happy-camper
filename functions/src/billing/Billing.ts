import * as functions from "firebase-functions";

import { disableBilling } from "./BillingAPI";

import { BillingPubSubResponse, BillingLimiterParams } from "./ts";

/**
 * Creates a PubSub functions that listen to a topic
 * registered in a GCP budget.
 * @param disableProjectAmount value that when reached, causes
 * the billing to be disabled.
 */
export default function createBillingPubSub({
  disableProjectAmount,
  topicId,
}: BillingLimiterParams) {
  return functions.pubsub
    .topic(topicId)
    .onPublish(async (message: functions.pubsub.Message) => {
      let data!: BillingPubSubResponse;

      try {
        data = message.json;
      } catch (error) {
        console.error("PubSub message was not a JSON", error);
      }

      data &&
        console.info(
          `Successfully received PubSub Billing for ${data.budgetDisplayName}`
        );

      if (data.costAmount >= disableProjectAmount) {
        console.log(`Trying to disable billing...: cost ${data.costAmount}`);
        await disableBilling();
      }

      return null;
    });
}
