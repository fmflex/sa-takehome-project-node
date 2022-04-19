
# Take home project

This is a simple e-commerce application that a customer can use to:

* Select a book to purchase.

* Checkout and purchase the item using Stripe Elements.

* Display a confirmation of purchase to the user with the total amount of the charge and Stripe Payment Intent ID (beginning with pi_).

  

## Application overview

This demo is written in Javascript (Node.js) with the [Express framework](https://expressjs.com/) and is using the [Bootstrap](https://getbootstrap.com/docs/4.6/getting-started/introduction/) CSS framework.

To simplify this project, we're also not using any database here, either. Instead `app.js` includes a simple switch statement to read the GET params for `item`.

  
  

## Getting Started

1. To get started, clone the repository and run `npm install` to install dependencies:

	```
	git clone https://github.com/mattmitchell6/sa-takehome-project-node && cd sa-takehome-project-node
	npm install
	```


2. Rename `sample.env` to `.env` and populate with your Stripe account's test API keys and prefered port number.

	```
	STRIPE_SECRET_KEY=<sk_test_YOUR_KEY>
	STRIPE_PUBLISHABLE_KEY=<pk_test_YOUR_KEY>
	PORT=3000
	```

  

3. Then run the application locally:

	```
	npm start
	```

  

4. Navigate to [http://localhost:port](http://localhost:port) to view the index page.

  

## Workflow

1. The application is first accessed from the `index.hbs` handlebar where the user can select the book to purchase.

2. Once the user selects a book, they will be pointed to the `checkout.hbs` handlebar with the selected book item id passed as query parameter.

3. The checkout route defined in `app.js` performs the below actions when rendering the checkout page:

	1. Use the item id to retrieve the book title and price.

	2. Create the Stripe PaymentIntent using Stripe : [stripe.paymentIntents.create](https://stripe.com/docs/api/payment_intents/create) API with the parameters:

		```
		amount: bookprice,
		currency: usd,
		payment_method_types:['card']
		```

	3. Dynamically adds the required js scripts: `https://js.stripe.com/v3/` and `checkout.js`

	4. Render the checkout page with the following parameter passed in the response: `title, amount, paymentIntents.client_secret, error, scripts`

4. When the user browser renders the `checkout.hbs` handlebar the book title and price will be displayed and the `checkout.js` script will:

	1. Initialize and retrieve various required items/information once the window is loaded. (DOM generated)

		1. `STRIPE_PUBLISHABLE_KEY`: retrieve from the server via a post call.

		2. request and create Stripe `elements` using Stripe : [stripe.elements](https://stripe.com/docs/js/elements_object/create) API with the parameters:

			```
			appearance: {theme: 'stripe',},
			clientSecret: stored in the `payment-element` div as an attribute
			```

		3. Mount the stripe elements to the `payment-element` div.

	2. Attach a function to the button handling the payment confirmation

		1. The confirmation is done using Stripe [stripe.confirmPayment](https://stripe.com/docs/js/payment_intents/confirm_payment) API with the parameter:

			```
			return_url: return url pointing the success page
			receipt_email: retrieved from the email form
			```

		2. If the payment is successful the user will be redirected to the `success.hbs` handlebar otherwise an error will be displayed.

5. The `success.hbs` handlebar will display:

	1. Dynamically adds the required js scripts: `https://js.stripe.com/v3/` and `success.js` in success route defined in `app.js`

	2. The Payment_intent id and the payment_intent_client_secret are provided by Stripe as query parameter when [stripe.confirmPayment](https://stripe.com/docs/js/payment_intents/confirm_payment) API call redirects to the `return_url`.

	3. Retrieve the amount from the `paymentIntent` using Stripe API [stripe.retrievePaymentIntent](https://stripe.com/docs/js/payment_intents/retrieve_payment_intent) with the payment_intent_client_secret as parameter.

	4. The Amount value is added in the `amount` span.

## Documentation

* [Online payments - Quickstart](https://stripe.com/docs/payments/quickstart) provides most of the information and examples necessary to complete this assignment.

* Specific Stripe API documentation

	1. [stripe.paymentIntents.create](https://stripe.com/docs/api/payment_intents/create)

	2. [stripe.elements](https://stripe.com/docs/js/elements_object/create)

	3. [stripe.confirmPayment](https://stripe.com/docs/js/payment_intents/confirm_payment)

	4. [stripe.retrievePaymentIntent](https://stripe.com/docs/js/payment_intents/retrieve_payment_intent)

* [Express JS documentation](https://expressjs.com/en/api.html)

* [W3Schools JS Reference](https://www.w3schools.com/jsref/)

  

My biggest challenges were related to NodeJS and the Express Framework as I haven't used Javascript for quite some time. Otherwise adding the requested feature to the boilerplate applications was straight forward.

  

## Improvements

* Create a proper product database to easily add/remove additional books, manage stock, ...

	* The product database can easily be integrated with Stripe [Product objects](https://stripe.com/docs/api/products) to get sales/marketing data from the Stripe dashboard and reports.
* Add a Shopping Card feature to allow the purchase of multiple books at the same time.
* Allow users to create an account to keep track of their past purchase and delivery.
		This would also allow the vendor to collect customer data for future use. 
		The user database can also be integrated with  Stripe [Customers Object](https://stripe.com/docs/api/customers). When a payment is done without a customer object, Stripe will register the payment under a [guest customer](https://support.stripe.com/questions/guest-customer-faq) creating Stripe Customer objects and linking them the payments will ease the reconciliation process in case of dispute.
* Create an additional backend application to keep track of the successful payment by registering to [Stripe Webhooks](https://stripe.com/docs/webhooks)  for `charge.succeeded` events to improve the supply chain process.
* Add additional payment methods, so far only cards has been added, adding other channel e.g. e-wallet, local payment network could increase the customer conversion rate.