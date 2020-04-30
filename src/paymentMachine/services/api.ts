import { Subscription } from "../types";

type MockResponses = {
  "/customer-id": string;
  "/attach-payment-method": null;
  "/subscription": Subscription;
};

const MOCK_RESPONSES: MockResponses = {
  "/customer-id": "123Customer",
  "/attach-payment-method": null,
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
    if (typeof MOCK_RESPONSES[url] !== "undefined") {
      setTimeout(() => {
        resolve(MOCK_RESPONSES[url]);
      }, 1000);

      return;
    }

    reject();
  });
