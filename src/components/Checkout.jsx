"use client";
import React, { useEffect } from "react";
import useApp from "../store/useApp";
function Checkout() {
  const { stripe, setCardNumber, setStripeelements } = useApp();

  function renderCardElements(stripe) {
    var elements = stripe.elements({
      fonts: [
        {
          cssSrc: "https://fonts.googleapis.com/css?family=Roboto",
        },
      ],
      // Stripe's examples are localized to specific languages, but if
      // you wish to have Elements automatically detect your user's locale,
      // use `locale: 'auto'` instead.
      locale: window.__exampleLocale,
    });
    var elementStyles = {
      invalid: {
        color: "#E25950",

        "::placeholder": {
          color: "#FFCCA5",
        },
      },
    };

    //const card = elements.create('card');
    let cardNumberInstance = elements.create("cardNumber", {
      style: elementStyles,
      placeholder: "Card Number",
    });
    setCardNumber(cardNumberInstance);
    const cardExpiry = elements.create("cardExpiry", {
      style: elementStyles,
    });
    const cardCvc = elements.create("cardCvc", {
      style: elementStyles,
    });

    cardNumberInstance.mount("#payment_element_cardNumber");
    cardExpiry.mount("#payment_element_cardExpiry");
    cardCvc.mount("#payment_element_cardCvv");
    return {
      cardNumberInstance,
      cardExpiry,
      cardCvc,
    };
  }

  useEffect(() => {
    if (stripe) setStripeelements(renderCardElements(stripe));
  }, [stripe]);

  return (
    <div style={{ display: "flex", width: "100%" }}>
      {" "}
      <div
        style={{
          width: "10%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <img
          src={"/images/images/visa-icon.png"}
          alt="VISAcARD"
          style={{ width: "40px", margin: "10px 0px" }}
        />
        <img
          src={"/images/images/master-card-icon.png"}
          alt="VISAcARD"
          style={{ width: "40px", margin: "0px 0px" }}
        />
      </div>
      <div style={{ flexDirection: "column", width: "90%" }}>
        <div
          id="payment_element_cardNumber"
          className="stripe-field"
          style={{ display: "100%" }}
        ></div>
        <div
          id="payment_element_cardExpiry"
          className="stripe-field"
          style={{ width: "100%" }}
        ></div>
        <div
          id="payment_element_cardCvv"
          className="stripe-field"
          style={{ width: "100%" }}
        ></div>
        <div id="error-handler" role="alert"></div>
        <div
          id="success"
          style={{ display: "none", position: "relative", float: "left" }}
        >
          Success! Your token is <span id="token"></span>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
