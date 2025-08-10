const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail", // You can change this to your preferred email service
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASSWORD, // Your app password
      },
    });

    // Alternative configuration for other email services:
    /*
        this.transporter = nodemailer.createTransporter({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
        */
  }

  async sendVerificationEmail(userEmail, userName, verificationToken) {
    try {
      const verificationUrl = `${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/verify-email?token=${verificationToken}`;

      const mailOptions = {
        from: {
          name: "Resumind",
          address: process.env.EMAIL_USER,
        },
        to: userEmail,
        subject: "Verify Your Email Address - Resumind",
        html: this.getVerificationEmailTemplate(userName, verificationUrl),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log("Verification email sent successfully:", result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error("Error sending verification email:", error);
      return { success: false, error: error.message };
    }
  }

  async sendPasswordResetEmail(userEmail, userName, resetToken) {
    try {
      const resetUrl = `${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: {
          name: "Resumind",
          address: process.env.EMAIL_USER,
        },
        to: userEmail,
        subject: "Reset Your Password - Resumind",
        html: this.getPasswordResetEmailTemplate(userName, resetUrl),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log("Password reset email sent successfully:", result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error("Error sending password reset email:", error);
      return { success: false, error: error.message };
    }
  }

  getVerificationEmailTemplate(userName, verificationUrl) {
    return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verify Your Email</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to Resumind!</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${userName},</h2>
                        <p>Thank you for signing up for Resumind! To complete your registration and start analyzing your resumes, please verify your email address.</p>
                        
                        <p>Click the button below to verify your email:</p>
                        <a href="${verificationUrl}" class="button">Verify Email Address</a>
                        
                        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #3b82f6;">${verificationUrl}</p>
                        
                        <p><strong>This verification link will expire in 24 hours.</strong></p>
                        
                        <p>If you didn't create an account with us, please ignore this email.</p>
                        
                        <p>Best regards,<br>The Resumind Team</p>
                    </div>
                    <div class="footer">
                        <p>© 2025 Resumind. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
  }

  getPasswordResetEmailTemplate(userName, resetUrl) {
    return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Reset Your Password</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${userName},</h2>
                        <p>We received a request to reset your password for your Resumind account.</p>
                        
                        <p>Click the button below to reset your password:</p>
                        <a href="${resetUrl}" class="button">Reset Password</a>
                        
                        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #ef4444;">${resetUrl}</p>
                        
                        <p><strong>This reset link will expire in 1 hour.</strong></p>
                        
                        <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
                        
                        <p>Best regards,<br>The Resumind Team</p>
                    </div>
                    <div class="footer">
                        <p>© 2025 Resumind. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      console.log("Email service is ready to send emails");
      return true;
    } catch (error) {
      console.error("Email service configuration error:", error);
      return false;
    }
  }
}

module.exports = new EmailService();
