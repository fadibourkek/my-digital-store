const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('8ne Store is Live & Running for 0$!');
});

// هذا المسار سيستقبل دفعات Stripe لاحقاً
app.post('/webhook/payment', (req, res) => {
  console.log('Payment received:', req.body);
  res.status(200).send('Webhook Received');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
