const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');

//Retrieving env variables
require('dotenv').config();
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;
const PORT = process.env.PORT;

const Stripe = require('stripe');
const stripe = Stripe(STRIPE_SECRET_KEY);


var app = express();
// view engine setup (Handlebars)
app.engine('hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs'
}));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }))
app.use(express.json({}));

/**
 *  Env Variable route
 */
app.post('/env', async(req, res) => {
    res.send({
        STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    });
});

/**
 * Home route
 */
app.get('/', function(req, res) {
    res.render('index');
});

/**
 * Checkout route
 */
app.get('/checkout',
    async function(req, res) {
        // Just hardcoding amounts here to avoid using a database
        const item = req.query.item;
        let title, amount, error;
        switch (item) {
            case '1':
                title = "The Art of Doing Science and Engineering"
                amount = 2300
                break;
            case '2':
                title = "The Making of Prince of Persia: Journals 1985-1993"
                amount = 2500
                break;
            case '3':
                title = "Working in Public: The Making and Maintenance of Open Source"
                amount = 2800
                break;
            default:
                // Included in layout view, feel free to assign error
                error = "No item selected"
                break;
        }
        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: "usd",
            payment_method_types: ['card']
        });
        //Dynamically adding stripe js and checkout js to the checkout handlebars
        var scripts = [{ script: 'https://js.stripe.com/v3/' }, { script: '/js/checkout.js' }];
        res.render('checkout', {
            title: title,
            amount: amount,
            paymentIntent: paymentIntent.client_secret,
            error: error,
            scripts: scripts
        });
    });

/**
 * Success route
 */
app.get('/success', function(req, res) {
    //Retrieving PI ID and amount from query parameters
    const payment_intent = req.query.payment_intent;
    var scripts = [{ script: 'https://js.stripe.com/v3/' }, { script: '/js/success.js' }];
    res.render('success', {
        payment_intent: payment_intent,
        scripts: scripts
    });
});

/**
 * Start server
 */
app.listen(PORT, () => {
    console.log('Getting served on port ' + PORT);
});