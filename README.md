# Guest House Haven Server

This is the backend server for the Guest House Haven application. It handles email sending for booking confirmations and contact form submissions.

## Dependencies

- Node.js
- Express
- Nodemailer
- CORS
- Dotenv

## Installation

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
EMAIL_USER=your_email@gmail.com
EMAIL_APP_PASSWORD=your_app_password
PORT=5000
```

Note: For Gmail, you'll need to use an App Password rather than your regular password. You can generate one in your Google Account settings.

## Running the Server

To run the server in production mode:
```bash
npm start
```

To run the server in development mode with auto-restart:
```bash
npm run dev
```

## API Endpoints

- `POST /api/send-booking-email` - Sends booking confirmation emails
- `POST /api/send-contact-email` - Sends contact form emails

## Deployment

This server can be deployed independently to platforms like Heroku, Render, or any Node.js hosting service.