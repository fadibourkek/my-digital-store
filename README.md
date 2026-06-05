# 8ne Digital Store

A modern **Node.js + Express** digital product store with integrated **Stripe payment processing** and **automated email notifications** via Nodemailer.

## 🚀 Features

- ✅ Express.js server with RESTful API endpoints
- ✅ Stripe webhook integration for payment processing
- ✅ Automated email notifications with Nodemailer
- ✅ Environment-based configuration
- ✅ Professional email templates (Arabic & English)
- ✅ Error handling and logging
- ✅ Health check endpoints

## 📁 Project Structure

```
my-digital-store/
├── config/
│   └── index.js                 # Configuration management
├── utils/
│   ├── index.js                 # Utility exports
│   └── emailService.js          # Email automation logic
├── server.js                    # Main application file
├── package.json                 # Dependencies
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
└── README.md                    # This file
```

## 📦 Dependencies

- **express** - Web server framework
- **nodemailer** - Email service
- **dotenv** - Environment variable management
- **body-parser** - Request body parsing
- **stripe** - Payment processing
- **nodemon** (dev) - Auto-reload during development

## 🔧 Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/fadibourkek/my-digital-store.git
cd my-digital-store
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your credentials
nano .env  # or use your preferred editor
```

### 4. Configure Gmail (for Nodemailer)
1. Enable 2-Step Verification in your Google Account
2. Visit: https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer"
4. Copy the 16-character password
5. Add to `.env`:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

### 5. Configure Stripe
1. Get your keys from: https://dashboard.stripe.com/apikeys
2. Add to `.env`:
   ```
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### 6. Start the server
```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

## 📡 API Endpoints

### 1. Health Check
```http
GET http://localhost:3000/
```
**Response:**
```json
{
  "status": "success",
  "message": "8ne Store is Live & Running! 🚀",
  "version": "1.0.0"
}
```

### 2. API Health Status
```http
GET http://localhost:3000/api/health
```

### 3. Stripe Webhook (Payment Processing)
```http
POST http://localhost:3000/webhook/payment
```
**Headers:**
```
stripe-signature: <signature>
```
**Payload:** Stripe event object

### 4. Manual Email Test
```http
POST http://localhost:3000/api/send-email
```
**Body:**
```json
{
  "email": "customer@example.com",
  "productName": "My eBook",
  "downloadLink": "https://example.com/download/ebook.pdf"
}
```

## 🔐 Environment Variables

| Variable | Description | Example |
|----------|-------------|----------|
| `NODE_ENV` | Environment mode | `development` \| `production` |
| `PORT` | Server port | `3000` |
| `EMAIL_USER` | Gmail address | `store@gmail.com` |
| `EMAIL_PASS` | Gmail app password | `xxxx xxxx xxxx xxxx` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe public key | `pk_test_...` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature secret | `whsec_...` |

## 🚀 Deployment (Render.com)

### 1. Push to GitHub
```bash
git push origin main
```

### 2. Connect to Render
- Go to https://render.com
- Create new Web Service
- Connect your GitHub repository
- Set build command: `npm install`
- Set start command: `npm start`

### 3. Add Environment Variables in Render Dashboard
```
NODE_ENV=production
PORT=3000
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4. Stripe Webhook Configuration
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-render-app.onrender.com/webhook/payment`
3. Select events: `checkout.session.completed`, `payment_intent.succeeded`
4. Copy the signing secret to `STRIPE_WEBHOOK_SECRET`

## 📧 Email Features

### Supported Emails
- ✉️ Product download notification
- ✉️ Order confirmation
- ✉️ Payment receipt

### Email Templates
All templates are bilingual (Arabic & English) with professional styling.

## 🛠️ Development

### Run with auto-reload
```bash
npm run dev
```

### Testing webhooks locally
Use ngrok to expose your local server:
```bash
ngrok http 3000
```

Then use the ngrok URL as your Stripe webhook endpoint.

## 📝 Example Webhook Payload

```json
{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_test_123456",
      "customer_email": "customer@example.com",
      "customer_details": {
        "email": "customer@example.com"
      },
      "amount_total": 5000,
      "currency": "usd",
      "metadata": {
        "product_name": "My Digital Product",
        "download_link": "https://example.com/download/product.zip",
        "send_confirmation": "true"
      }
    }
  }
}
```

## 📚 Useful Resources

- [Express.js Documentation](https://expressjs.com/)
- [Nodemailer Guide](https://nodemailer.com/)
- [Stripe Documentation](https://stripe.com/docs)
- [Render.com Deployment](https://render.com/docs)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)

## 🐛 Troubleshooting

### Email not sending
- ✓ Check Gmail 2-Step Verification is enabled
- ✓ Verify app password in `.env`
- ✓ Allow "Less secure apps" if needed
- ✓ Check email logs in console

### Stripe webhook not working
- ✓ Verify webhook secret in `.env`
- ✓ Check request headers include `stripe-signature`
- ✓ Use ngrok for local testing

### Port already in use
```bash
# Kill process on port 3000
# Linux/Mac:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## 📄 License

MIT License - feel free to use this project for commercial purposes.

## 👨‍💻 Author

**Fadi Bourkek**
- GitHub: [@fadibourkek](https://github.com/fadibourkek)

---

**Made with ❤️ for digital entrepreneurs**