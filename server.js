const express = require('express');
const bodyParser = require('body-parser');
const Stripe = require('stripe');
require('dotenv').config();

const { emailService } = require('./utils');
const config = require('./config');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.json());

// Initialize Stripe
const stripe = new Stripe(config.stripeConfig.secretKey);

/**
 * ==========================================
 * ROUTES
 * ==========================================
 */

/**
 * GET / - Health check endpoint
 */
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: '8ne Store is Live & Running! 🚀',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /webhook/payment - Stripe Webhook Handler
 * Receives Stripe events and triggers email notifications
 */
app.post('/webhook/payment', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify Stripe webhook signature
    event = stripe.webhooks.constructEvent(
      req.rawBody || JSON.stringify(req.body),
      sig,
      config.stripeConfig.webhookSecret
    );
  } catch (err) {
    console.error(`❌ Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      console.log(`📦 Processing payment for session: ${session.id}`);

      const customerEmail = session.customer_details?.email || session.customer_email;
      const productName = session.metadata?.product_name || 'Your Digital Product';
      const downloadLink = session.metadata?.download_link || 'https://example.com/download';

      // Send product download email
      if (customerEmail) {
        await emailService.sendProductEmail(
          customerEmail,
          productName,
          downloadLink
        );
      }

      // Optional: Send order confirmation email
      if (session.metadata?.send_confirmation === 'true') {
        await emailService.sendOrderConfirmation(customerEmail, {
          orderId: session.id,
          amount: `${session.amount_total / 100} ${session.currency.toUpperCase()}`
        });
      }

      console.log(`✅ Webhook processed successfully for ${customerEmail}`);
    }

    // Handle payment_intent.succeeded event
    if (event.type === 'payment_intent.succeeded') {
      console.log(`✓ Payment intent succeeded: ${event.data.object.id}`);
    }

    // Handle charge.failed event
    if (event.type === 'charge.failed') {
      console.log(`⚠️ Charge failed: ${event.data.object.id}`);
    }

    res.status(200).json({ received: true, message: 'Webhook processed' });
  } catch (error) {
    console.error(`❌ Error processing webhook:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/send-email - Manual email sending endpoint (for testing)
 */
app.post('/api/send-email', async (req, res) => {
  try {
    const { email, productName, downloadLink } = req.body;

    if (!email || !productName || !downloadLink) {
      return res.status(400).json({
        error: 'Missing required fields: email, productName, downloadLink'
      });
    }

    const result = await emailService.sendProductEmail(
      email,
      productName,
      downloadLink
    );

    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      result
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      error: 'Failed to send email',
      details: error.message
    });
  }
});

/**
 * GET /api/health - API health status
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

/**
 * 404 Handler
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method
  });
});

/**
 * Error Handler
 */
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: config.nodeEnv === 'development' ? err.message : undefined
  });
});

/**
 * ==========================================
 * START SERVER
 * ==========================================
 */
const PORT = config.port;

app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║     8ne Store Engine Running           ║
  ║     Port: ${PORT}                         ║
  ║     Environment: ${config.nodeEnv}           ║
  ║     Version: 1.0.0                     ║
  ╚════════════════════════════════════════╝
  
  Available Endpoints:
  • GET  http://localhost:${PORT}/                (Health Check)
  • GET  http://localhost:${PORT}/api/health      (API Status)
  • POST http://localhost:${PORT}/webhook/payment (Stripe Webhook)
  • POST http://localhost:${PORT}/api/send-email  (Test Email)
  `);
});

module.exports = app;