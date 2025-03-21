import nodemailer from "nodemailer";

export async function sendSuccessResetPasswordEmail(
  name: string,
  email: string
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
      subject: "Your Password Was Successfully Changed!",
      html: `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Password Was Successfully Changed!</title>
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
    <h1>Your Password Was Changed</h1>
    <p>Hi, ${name}</p>
    <p>We wanted to let you know that your password has been successfully changed. If you didn't make this change, please contact us immediately.</p>
    <p>If you have any questions or need further assistance, don't hesitate to reach out to us.</p>
    <p>Best regards,</p>
    <p>The Luca Lombardi Team</p>
  </div>

  <div class="footer">
    <p>This email was sent to ${email}. If you did not request a password change, please contact us immediately.</p>
  </div>
</body>
    </html>`,
    };

    await transporter.sendMail(mailOptions);

    console.log(`Success Email was sent to ${email}`);
  } catch (e) {
    console.error(e);
  }
}
