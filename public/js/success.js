      let stripe, amount;
      //
      window.onload = function() {
          initialize();
      };

      async function initialize() {
          //Retrieve the STRIPE_PUBLISHABLE_KEY from the server
          const response = await fetch("/env", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
          });
          const { STRIPE_PUBLISHABLE_KEY } = await response.json();
          stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
          //create stripe element and mount it to "#payment-element"
          const params = (new URL(document.location)).searchParams;
          const clientSecret = params.get("payment_intent_client_secret");
          // const clientSecret = document.getElementById("payment-Information").getAttribute("payment_intent_client_secret");

          //Retrieve the amount from the payment intent
          const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
          amount = paymentIntent.amount;
          const amountSpan = document.getElementById("amount");
          amount = amount / 100;
          amountSpan.innerHTML = amount.toFixed(2);
      }