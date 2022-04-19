      let stripe, elements, amount, clientSecret;
      //
      window.onload = function() {
          initialize();
          document
              .querySelector("#payment-form")
              .addEventListener("submit", handleSubmit);

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
          clientSecret = document.getElementById("payment-element").getAttribute("payment-intent");
          const appearance = {
              theme: 'stripe',
          };
          elements = stripe.elements({ appearance, clientSecret });

          const paymentElement = elements.create("payment");
          paymentElement.mount("#payment-element");

          //Retrieve the amount from the payment intent
          const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
          amount = paymentIntent.amount;
          console.log(amount);
      }

      //Confirm the payment intent using the information provided in the stripe elements
      async function handleSubmit(e) {
          e.preventDefault();
          //Disable button
          setLoading(true);
          const { error } = await stripe.confirmPayment({
              elements,
              confirmParams: {
                  //add return url and receipt email
                  return_url: window.location.origin + '/success',
                  receipt_email: document.querySelector("#email").value
              },
          });
          // This point will only be reached if there is an immediate error when
          // confirming the payment. Otherwise, your customer will be redirected to
          // your `return_url`.
          if (error.type === "card_error" || error.type === "validation_error") {
              showMessage(error.message);
          } else {
              showMessage("An unexpected error occured.");
          }
          //Enable button
          setLoading(false);
      }


      // ------- UI helpers -------

      function showMessage(messageText) {
          const messageContainer = document.querySelector("#payment-message");

          messageContainer.classList.remove("hidden");
          messageContainer.textContent = messageText;

          setTimeout(function() {
              messageContainer.classList.add("hidden");
              messageText.textContent = "";
          }, 4000);
      }

      // Disable submit button on 
      function setLoading(isLoading) {
          if (isLoading) {
              // Disable the button
              document.querySelector("#submit").disabled = true;
          } else {
              // Enable the button
              document.querySelector("#submit").disabled = false;
          }
      }