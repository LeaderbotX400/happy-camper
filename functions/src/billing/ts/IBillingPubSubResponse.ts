export default interface BillingPubSubResponse {
  budgetDisplayName: string;
  alertThresholdExceeded: number;
  costAmount: number;
  costIntervalStart: string;
  budgetAmount: number;
  budgetAmountType: string;
  currencyCode: string;
}
