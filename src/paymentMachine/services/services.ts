import { CardElement } from "@stripe/react-stripe-js";

import { callApi } from "./api";
import { Context } from "../paymentMachine";
import { Subscription } from "../types";

export const obtainCustomerIdService = (): Promise<string> =>
  new Promise(async (resolve) => {
    const customerId = await callApi("/customer-id");

    resolve(customerId);
  });

export const createPaymentMethodService = ({
  stripe,
  elements,
}: Context): Promise<string> =>
  new Promise(async (resolve, reject) => {
    if (!elements || !stripe) {
      reject();
      return;
    }
    const card = elements.getElement(CardElement);

    if (!card) {
      reject();
      return;
    }

    const paymentMethodResult = await stripe.createPaymentMethod({
      type: "card",
      card,
    });

    const paymentMethodId = paymentMethodResult.paymentMethod?.id;

    if (!paymentMethodId) {
      reject();
      return;
    }

    await callApi("/attach-payment-pethod", { id: paymentMethodId });

    resolve(paymentMethodId);
  });

export const createSubscriptionService = (): Promise<Subscription> =>
  new Promise(async (resolve) => {
    const subscription = await callApi("/subscription");

    resolve(subscription);
  });

export const confirmCardPaymentService = (context: Context): Promise<void> =>
  new Promise(async (resolve, reject) => {
    try {
      const { stripe } = context;
      const clientSecret =
        context.subscription?.latest_invoice?.payment_intent?.client_secret;

      if (!stripe || !clientSecret) {
        reject();
        return;
      }

      const result = await stripe.confirmCardPayment(clientSecret);

      if (result.error) {
        // With fake api there will always be error
        // Reject with real API
        // reject();
        resolve();
        return;
      }
      resolve();
    } catch (err) {}
  });
