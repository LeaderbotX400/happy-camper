import { google } from "googleapis";
import { GoogleAuth } from "google-auth-library";

const PROJECT_ID = process.env.GCLOUD_PROJECT;
const PROJECT_NAME = `projects/${PROJECT_ID}`;

const apiBilling = google.cloudbilling("v1").projects;

export async function disableBilling() {
  setCredentialsForBilling();

  if (PROJECT_NAME) {
    const { data } = await getBillingInfo();

    if (data.billingEnabled) {
      await apiBilling.updateBillingInfo({
        name: PROJECT_NAME,
        requestBody: { billingAccountName: "" },
      });

      console.warn(`Billing disabled for project: ${PROJECT_NAME}!`);
    } else {
      console.info("Billing already disabled");
    }
  }
}

async function getBillingInfo() {
  const billingInfo = await apiBilling.getBillingInfo({
    name: PROJECT_NAME,
  });

  return billingInfo;
}

function setCredentialsForBilling() {
  const client = new GoogleAuth({
    scopes: [
      "https://www.googleapis.com/auth/cloud-billing",
      "https://www.googleapis.com/auth/cloud-platform",
    ],
  });

  google.options({
    auth: client,
  });
}
