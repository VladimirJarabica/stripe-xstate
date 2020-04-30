import React from "react";
import { useMachine } from "@xstate/react";
import {
  Elements,
  useStripe,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import paymentMachine from "./paymentMachine/paymentMachine";

const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_API_KEY as string
);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#004175",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      boxShadow: "0 0 17px 3px rgba(27, 27, 27, 0.15)",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
};

function App() {
  const stripe = useStripe();
  const elements = useElements();

  const [state, send] = useMachine(paymentMachine);

  const handleSubmit = () => {
    console.log("paying");

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    send({ type: "START", stripe, elements });
  };

  const handleReset = () => {
    send({ type: "RESET" });
  };

  return (
    <div style={{ width: 500 }}>
      <h3>Current machine state: "{state.value}"</h3>
      <CardElement options={CARD_ELEMENT_OPTIONS} />
      <button disabled={!state.matches("idle")} onClick={handleSubmit}>
        Pay
      </button>
      {state.matches("error") && <button onClick={handleReset}>Reset</button>}
    </div>
  );
}

export default () => (
  <Elements stripe={stripePromise}>
    <App />
  </Elements>
);
