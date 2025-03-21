import nodemailer from "nodemailer";

export async function sendForgotPasswordEmail(
  name: string,
  email: string,
  otpCode: string
) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: "Luca Lombardi",
      to: email,
      subject: "Reset Your Password",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f8f8f8;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: #333333;
      font-size: 24px;
      text-align: center;
      margin-bottom: 20px;
    }
    p {
      font-size: 16px;
      color: #555555;
      line-height: 1.5;
      margin-bottom: 20px;
    }
    .button {
      display: inline-block;
      padding: 15px 30px;
      font-size: 16px;
      color: #ffffff;
      background-color: #7a2c2f; /* Luca Lombardi's signature color */
      text-decoration: none;
      border-radius: 50px;
      text-align: center;
      margin: 0 auto;
      display: block;
      width: 200px;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #aaaaaa;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Reset Your Password</h1>
    <p>Hi, ${name}</p>
    <p>We received a request to reset your password. If you didn't make this request, you can ignore this email.</p>
    <h1>Here is your OTP CODE ${otpCode}</h1>
    <p>If you have any questions or need further assistance, don't hesitate to contact us.</p>
    <p>Best regards,</p>
    <p>The Luca Lombardi Team</p>
  </div>

  <div class="footer">
    <p>This email was sent to ${email}. If you did not request a password reset, please ignore this message.</p>
  </div>
</body>
</html>`,
    };

    await transporter.sendMail(mailOptions);

    console.log(`Resetting Email was sent to ${email}`);
  } catch (e) {
    console.error(e);
  }
}
