import { Subscription } from "../types";

type MockResponses = {
  "/customer-id": string;
  "/attach-payment-pethod": null;
  "/subscription": Subscription;
};

const MOCK_RESPONSES: MockResponses = {
  "/customer-id": "123Customer",
  "/attach-payment-pethod": null,
  "/subscription": {
    latest_invoice: {
      payment_intent: {
        client_secret: "321secret",
        status: "requires_capture",
      },
    },
    status: "trialing",
  },
};

export const callApi = <T extends keyof MockResponses>(
  url: T,
  body?: any
): Promise<MockResponses[T]> =>
  new Promise((resolve, reject) => {
    if (MOCK_RESPONSES[url]) {
      setTimeout(() => {
        resolve(MOCK_RESPONSES[url]);
      }, 1000);

      return;
    }

    reject();
  });
