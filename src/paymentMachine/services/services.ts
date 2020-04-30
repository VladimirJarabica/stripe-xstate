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
    try {
      if (!elements || !stripe) {
        reject("Stripe is not loaded yet");
        return;
      }

      const card = elements.getElement(CardElement);

      if (!card) {
        reject("Card is not valid");
        return;
      }

      const paymentMethodResult = await stripe.createPaymentMethod({
        type: "card",
        card,
      });

      const paymentMethodId = paymentMethodResult.paymentMethod?.id;

      if (!paymentMethodId) {
        reject("Cannot create payment method");
        return;
      }

      await callApi("/attach-payment-method", { id: paymentMethodId });

      resolve(paymentMethodId);
    } catch (err) {
      reject("Error creating payment method");
    }
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
        reject("Stripe is not loaded yet");
        return;
      }

      const result = await stripe.confirmCardPayment(clientSecret);

      console.log("confirm card payment result", result);

      if (result.error) {
        // With fake api there will always be error
        // Reject with real API
        // reject("Cannot confirm payment");
        resolve();
        return;
      }
      resolve();
    } catch (err) {
      reject("Error during confirming pyment");
    }
  });
