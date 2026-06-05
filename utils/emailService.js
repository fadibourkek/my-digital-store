const nodemailer = require('nodemailer');
const { emailConfig } = require('../config');

// Initialize transporter
const transporter = nodemailer.createTransport(emailConfig);

/**
 * Send email notification to customer with download link
 * @param {string} customerEmail - Customer's email address
 * @param {string} productName - Name of the purchased product
 * @param {string} downloadLink - Download link for the product
 * @returns {Promise} - Email sending promise
 */
const sendProductEmail = async (customerEmail, productName, downloadLink) => {
  try {
    const mailOptions = {
      from: `"8ne Store" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `تحميل منتجك: ${productName} | Download Your Product: ${productName}`,
      html: `
        <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
          <h2>شكراً لك! 🎉</h2>
          <p>لقد تم استقبال طلبك بنجاح</p>
          
          <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>تفاصيل منتجك:</h3>
            <p><strong>المنتج:</strong> ${productName}</p>
            <p><strong>البريد:</strong> ${customerEmail}</p>
          </div>
          
          <p>يمكنك تحميل منتجك من الرابط أدناه:</p>
          <a href="${downloadLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            📥 تحميل الآن
          </a>
          
          <hr style="margin: 30px 0;">
          
          <p style="color: #666; font-size: 12px;">
            إذا واجهت أي مشاكل في التحميل، يرجى الرد على هذا البريد.
          </p>
          <p style="color: #666; font-size: 12px;">
            © 2024 8ne Store. جميع الحقوق محفوظة.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${customerEmail}:`, info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Error sending email to ${customerEmail}:`, error);
    throw error;
  }
};

/**
 * Send confirmation email for order
 * @param {string} customerEmail - Customer's email address
 * @param {object} orderDetails - Order details object
 * @returns {Promise} - Email sending promise
 */
const sendOrderConfirmation = async (customerEmail, orderDetails) => {
  try {
    const mailOptions = {
      from: `"8ne Store" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `تأكيد طلبك #${orderDetails.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>✓ تأكيد الطلب</h2>
          <p>شكراً لك على طلبك!</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #007bff;">
            <p><strong>رقم الطلب:</strong> ${orderDetails.orderId}</p>
            <p><strong>المبلغ:</strong> ${orderDetails.amount}</p>
            <p><strong>الحالة:</strong> تم الدفع بنجاح ✓</p>
          </div>
          
          <p>سيتم إرسال رابط التحميل قريباً...</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Confirmation email sent to ${customerEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Error sending confirmation email:`, error);
    throw error;
  }
};

module.exports = {
  sendProductEmail,
  sendOrderConfirmation,
  transporter
};