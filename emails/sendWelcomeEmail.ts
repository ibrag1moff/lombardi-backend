import nodemailer from "nodemailer";

export async function sendWelcomeEmail(email: string, name: string) {
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
      subject: "Welcome to Luca Lombardi!",
      html: `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to Luca Lombardi!</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f7f7f7;
                        color: #333;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        width: 100%;
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 10px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        text-align: center;
                        padding-bottom: 20px;
                    }
                    .header img {
                        width: 150px;
                    }
                    h1 {
                        color: #4CAF50;
                        font-size: 24px;
                        margin: 0;
                    }
                    .content {
                        text-align: left;
                        line-height: 1.6;
                    }
                    .button {
                        display: inline-block;
                        background-color: #4CAF50;
                        color: #fff;
                        padding: 12px 25px;
                        font-size: 16px;
                        text-decoration: none;
                        border-radius: 5px;
                        margin-top: 20px;
                    }
                    .footer {
                        text-align: center;
                        font-size: 12px;
                        margin-top: 20px;
                        color: #888;
                    }
                    .footer a {
                        color: #4CAF50;
                        text-decoration: none;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to Luca Lombardi, ${name}!</h1>
                    </div>
                    
                    <div class="content">
                        <p>We’re excited to have you on board! Luca Lombardi is here to help you be always in fashion</p>
                        <p>Your account has been successfully created.</p>
            
                        <p>If you need any help or have any questions, feel free to reach out to our support team. We’re always here to help you.</p>
                    </div>
            
                    <div class="footer">
                        <p>Thank you for supporting us.</p>
                        <p>Have a great day!</p>
                        <p><a href=#!">Contact Support</a></p>
                    </div>
                </div>
            </body>
            </html>`,
    };

    await transporter.sendMail(mailOptions);

    console.log(`Welcome Email sent to ${email}`);
  } catch (e) {
    console.error(e);
  }
}
