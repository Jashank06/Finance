const express = require('express');
const router = express.Router();
const { sendEmail } = require('../config/email');

// Test email functionality
router.post('/email', async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    
    const emailResult = await sendEmail({
      to: to || 'jay440470@gmail.com',
      subject: subject || 'Test Email from Family Finance App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Test Email</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #666; line-height: 1.6;">${message || 'This is a test email from Family Finance App to verify email functionality.'}</p>
          </div>
          <div style="color: #999; font-size: 12px; margin-top: 20px;">
            <p>This notification was sent from Family Finance App</p>
            <p>Test Date: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `
    });
    
    res.json({ 
      success: true, 
      message: 'Test email sent successfully',
      messageId: emailResult.messageId 
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send test email',
      details: error.message 
    });
  }
});

// Test notification with email
router.post('/notification', async (req, res) => {
  try {
    const Notification = require('../models/monitoring/Notification');
    
    const testNotification = new Notification({
      userId: '507f1f77bcf86cd799439011', // Dummy user ID for testing
      title: 'Test Notification',
      message: 'This is a test notification with email functionality',
      type: 'info',
      scheduledTime: new Date(),
      method: 'email',
      recipients: [
        {
          name: 'Test User',
          email: 'jay440470@gmail.com'
        }
      ],
      status: 'scheduled'
    });
    
    await testNotification.save();
    
    // Send email
    const emailPromises = testNotification.recipients.map(recipient => {
      return sendEmail({
        to: recipient.email,
        subject: testNotification.title,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">${testNotification.title}</h2>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #666; line-height: 1.6;">${testNotification.message}</p>
            </div>
            <div style="color: #999; font-size: 12px; margin-top: 20px;">
              <p>This notification was sent from Family Finance App</p>
              <p>Scheduled: ${new Date(testNotification.scheduledTime).toLocaleString()}</p>
            </div>
          </div>
        `
      });
    });
    
    await Promise.all(emailPromises);
    
    testNotification.status = 'sent';
    testNotification.sentAt = new Date();
    await testNotification.save();
    
    res.json({ 
      success: true, 
      message: 'Test notification sent successfully',
      notification: testNotification 
    });
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send test notification',
      details: error.message 
    });
  }
});

module.exports = router;
