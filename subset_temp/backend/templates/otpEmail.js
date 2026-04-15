const getOTPEmailTemplate = (otp, userName, purpose = 'login') => {
  const purposeText = {
    'login': 'Login Verification',
    'signup': 'Account Verification',
    'password-reset': 'Password Reset'
  };

  const purposeMessage = {
    'login': 'You are attempting to log in to your account.',
    'signup': 'Welcome! Please verify your email to complete registration.',
    'password-reset': 'You requested to reset your password.'
  };

  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>${purposeText[purpose]} - OTP</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f7; padding: 40px 20px;">
        <tr>
            <td align="center">
                <!-- Main Container -->
                <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #1a1a1a; padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0 0 10px 0; font-size: 32px; font-weight: 800; color: #ffffff; letter-spacing: -1px;">FinanceHub</h1>
                            <p style="margin: 0; font-size: 14px; color: #b0b0b0;">Your Trusted Financial Partner</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            
                            <!-- Greeting -->
                            <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #1a1a1a;">Hello ${userName || 'User'}! 👋</h2>
                            
                            <!-- Message -->
                            <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #333333;">
                                ${purposeMessage[purpose]} To continue, please use the verification code below:
                            </p>
                            
                            <!-- OTP Box -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 32px 0;">
                                <tr>
                                    <td style="background-color: #f8f9fa; border: 2px solid #1a1a1a; border-radius: 12px; padding: 32px; text-align: center;">
                                        <p style="margin: 0 0 16px 0; font-size: 13px; font-weight: 600; color: #666666; text-transform: uppercase; letter-spacing: 1.5px;">YOUR VERIFICATION CODE</p>
                                        <h1 style="margin: 16px 0; font-size: 48px; font-weight: 800; letter-spacing: 12px; color: #1a1a1a; font-family: 'Courier New', monospace;">${otp}</h1>
                                        <p style="margin: 16px 0 0 0; font-size: 14px; color: #666666;">⏱️ Valid for 10 minutes</p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Warning Box -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0;">
                                <tr>
                                    <td style="background-color: #fff3f0; border: 1px solid #ff6b6b; border-radius: 12px; padding: 20px;">
                                        <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 700; color: #d63031;">⚠️ Security Alert</p>
                                        <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #333333;">
                                            Never share this OTP with anyone. Our team will never ask for your verification code.
                                            If you didn't request this code, please ignore this email or contact support immediately.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Divider -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0;">
                                <tr>
                                    <td style="border-bottom: 1px solid #e0e0e0;"></td>
                                </tr>
                            </table>
                            
                            <!-- Info Box -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0;">
                                <tr>
                                    <td style="background-color: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 12px; padding: 20px;">
                                        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #333333;">
                                            <strong style="color: #1a1a1a;">🔒 Security Tips:</strong><br/><br/>
                                            • This OTP is valid for 10 minutes only<br/>
                                            • Each OTP can be used only once<br/>
                                            • Don't share your OTP over phone, email, or SMS<br/>
                                            • Always verify you're on our official website
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                            <p style="margin: 0 0 16px 0; font-size: 13px; line-height: 1.6; color: #666666;">
                                This is an automated email. Please do not reply to this message.<br/>
                                For support, please contact us through our official channels.
                            </p>
                            
                            <!-- Divider -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 16px 0;">
                                <tr>
                                    <td style="border-bottom: 1px solid #e0e0e0;"></td>
                                </tr>
                            </table>
                            
                            <p style="margin: 16px 0; font-size: 13px; color: #1a1a1a;">
                                <a href="#" style="color: #1a1a1a; text-decoration: none; font-weight: 500; margin: 0 10px;">Help Center</a>
                                <span style="color: #e0e0e0;">|</span>
                                <a href="#" style="color: #1a1a1a; text-decoration: none; font-weight: 500; margin: 0 10px;">Privacy Policy</a>
                                <span style="color: #e0e0e0;">|</span>
                                <a href="#" style="color: #1a1a1a; text-decoration: none; font-weight: 500; margin: 0 10px;">Terms of Service</a>
                            </p>
                            
                            <p style="margin: 16px 0 0 0; font-size: 13px; color: #666666;">
                                © 2024 FinanceHub. All rights reserved.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
};

module.exports = { getOTPEmailTemplate };
