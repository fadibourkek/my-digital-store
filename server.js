const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
app.use(express.json());

// إعداد Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // أضف هذا في إعدادات Environment في Render
    pass: process.env.EMAIL_PASS  // "App Password" من Gmail
  }
});

// استقبال الدفع من Stripe
app.post('/webhook/payment', async (req, res) => {
  const event = req.body;

  if (event.type === 'checkout.session.completed') {
    const customerEmail = event.data.object.customer_details.email;
    const productName = event.data.object.metadata.book_name; // اسم الكتاب
    
    // إرسال الكتاب
    await transporter.sendMail({
      from: '"متجر 8ne" <your-email@gmail.com>',
      to: customerEmail,
      subject: `تحميل كتابك: ${productName}`,
      text: `شكراً لشرائك! يمكنك تحميل الكتاب من هنا: [رابط كتابك في Google Drive]`
    });
    console.log(`تم إرسال الكتاب إلى: ${customerEmail}`);
  }
  res.status(200).send('Success');
});

app.listen(3000, () => console.log('Store Engine Ready!'));
