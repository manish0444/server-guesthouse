import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8080'] // Vite default ports
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD // Use app password, not regular password
  }
});

// Validate environment variables
if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
  console.error('Error: Email configuration not found. Please set EMAIL_USER and EMAIL_APP_PASSWORD in .env file');
  process.exit(1);
}

// API endpoint for sending booking confirmation emails
app.post('/api/send-booking-email', async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      checkInDate,
      checkOutDate,
      guests,
      roomName,
      roomPrice,
      includeBreakfast,
      includeDinner,
      advancePaid,
      qrImage,
      proofImage
    } = req.body;

    // Create attachments array
    const attachments = [];

    // Add QR image if provided
    if (qrImage) {
      attachments.push({
        filename: 'qr-code.png',
        content: Buffer.from(qrImage.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''), 'base64'),
        cid: 'qrCode' // For embedding in HTML
      });
    }

    // Add proof image if provided
    if (proofImage) {
      attachments.push({
        filename: 'payment-proof.png',
        content: Buffer.from(proofImage.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''), 'base64'),
        cid: 'paymentProof' // For embedding in HTML
      });
    }

    // Create email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email, // Send to the customer
      cc: process.env.EMAIL_USER, // Also send a copy to the guest house
      subject: `Booking Confirmation - ${roomName}`,
      html: `
        <h2>Booking Confirmation</h2>
        <p><strong>Guest Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Check-in Date:</strong> ${checkInDate}</p>
        <p><strong>Check-out Date:</strong> ${checkOutDate}</p>
        <p><strong>Number of Guests:</strong> ${guests}</p>
        <p><strong>Room Type:</strong> ${roomName}</p>
        <p><strong>Room Price:</strong> Rs. ${roomPrice}</p>
        <p><strong>Breakfast Included:</strong> ${includeBreakfast ? 'Yes' : 'No'}</p>
        <p><strong>Dinner Included:</strong> ${includeDinner ? 'Yes' : 'No'}</p>
        <p><strong>Advance Paid:</strong> ${advancePaid ? 'Yes' : 'No'}</p>
        
        ${qrImage ? '<h3>QR Code:</h3><img src="cid:qrCode" alt="QR Code" style="max-width: 200px;" />' : ''}
        ${proofImage ? '<h3>Payment Proof:</h3><img src="cid:paymentProof" alt="Payment Proof" style="max-width: 300px;" />' : ''}
        
        <p>Thank you for choosing Krishendra Guest House!</p>
      `,
      attachments
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Booking email sent successfully' });
  } catch (error) {
    console.error('Error sending booking email:', error);
    res.status(500).json({ error: 'Failed to send booking email' });
  }
});

// API endpoint for sending contact form emails
app.post('/api/send-contact-email', async (req, res) => {
  try {
    const {
      name,
      email,
      checkin,
      checkout,
      guests,
      message
    } = req.body;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to guest house
      replyTo: email, // So we can reply to the customer
      subject: `Contact Form Message from ${name}`,
      html: `
        <h2>Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Preferred Check-in:</strong> ${checkin || 'Not specified'}</p>
        <p><strong>Preferred Check-out:</strong> ${checkout || 'Not specified'}</p>
        <p><strong>Number of Guests:</strong> ${guests || 'Not specified'}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Contact email sent successfully' });
  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500).json({ error: 'Failed to send contact email' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});