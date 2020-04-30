import { createMachine, Machine, assign } from "xstate";
import { Stripe, StripeElements } from "@stripe/stripe-js";
import { Subscription } from "./types";
import {
  obtainCustomerIdService,
  createPaymentMethodService,
  createSubscriptionService,
  confirmCardPaymentService,
} from "./services/services";

export interface Context {
  stripe?: Stripe;
  elements?: StripeElements;
  paymentMethodId?: string | null;
  customerId?: string;
  subscription?: Subscription;
  loadingText?: string;
}

type Event =
  | {
      type: "START";
      stripe: Stripe;
      elements: StripeElements;
    }
  | { type: "RESET" };

interface Schema {
  states: {
    idle: {};
    error: {};
    obtainCustomerId: {};
    createPaymentMethod: {};
    createSubscription: {};
    checkSubscriptionStatus: {};
    confirmCardPayment: {};
    paymentSuccess: {};
  };
}

const paymentMachine = Machine<Context, Schema, Event>(
  {
    id: "paymentMachine",
    initial: "idle",
    context: {},
    states: {
      idle: {
        on: { START: { target: "obtainCustomerId", actions: "initialize" } },
      },
      error: {
        on: { RESET: "idle" },
      },
      obtainCustomerId: {
        invoke: {
          src: obtainCustomerIdService,
          onDone: {
            target: "createPaymentMethod",
            actions: assign({ customerId: (_, event) => event.data }),
          },
          onError: "error",
        },
      },
      createPaymentMethod: {
        invoke: {
          src: createPaymentMethodService,
          onDone: {
            target: "createSubscription",
            actions: assign({ paymentMethodId: (_, event) => event.data }),
          },
          onError: "error",
        },
      },
      createSubscription: {
        invoke: {
          src: createSubscriptionService,
          onDone: {
            target: "checkSubscriptionStatus",
            actions: assign({ subscription: (_, event) => event.data }),
          },
          onError: "error",
        },
      },
      checkSubscriptionStatus: {
        on: {
          "": [
            { target: "paymentSuccess", cond: "isTrialSubscription" },
            { target: "error", cond: "isSubscriptionInvalid" },
            {
              target: "confirmCardPayment",
              cond: "subscriptionRequiresAction",
            },
            { target: "paymentSuccess" },
          ],
        },
      },
      confirmCardPayment: {
        invoke: {
          src: confirmCardPaymentService,
          onDone: "paymentSuccess",
          onError: "error",
        },
      },
      paymentSuccess: {
        type: "final",
      },
    },
  },
  {
    actions: {
      initialize: assign({
        stripe: (_, event) =>
          event.type === "START" ? event.stripe : undefined,
        elements: (_, event) =>
          event.type === "START" ? event.elements : undefined,
      }),
    },
    guards: {
      isTrialSubscription: (context: Context) =>
        context.subscription?.status === "trialing" || false,
      // TODO: check
      isSubscriptionInvalid: (context: Context) =>
        !(context.subscription?.latest_invoice.payment_intent.status || false),
      subscriptionRequiresAction: (context: Context) =>
        context.subscription?.latest_invoice.payment_intent.status ===
        "requires_action",
    },
  }
);

export default paymentMachine;
