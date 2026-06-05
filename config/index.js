require('dotenv').config();

const emailConfig = {
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
};

const stripeConfig = {
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
};

module.exports = {
  emailConfig,
  stripeConfig,
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development'
};