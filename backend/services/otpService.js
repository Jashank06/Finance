const OTP = require('../models/OTP');
const { sendEmail } = require('../config/email');
const { getOTPEmailTemplate } = require('../templates/otpEmail');

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create and send OTP
const createAndSendOTP = async (userId, email, userName, purpose = 'login') => {
  try {
    // Invalidate any existing unused OTPs for this user and purpose
    await OTP.updateMany(
      { 
        userId, 
        purpose,
        isUsed: false,
        expiresAt: { $gt: new Date() }
      },
      { isUsed: true }
    );

    // Generate new OTP
    const otp = generateOTP();
    
    // Create OTP record in database
    const otpRecord = await OTP.create({
      userId,
      email,
      otp,
      purpose,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    // Send email with beautiful template
    const emailHtml = getOTPEmailTemplate(otp, userName, purpose);
    
    await sendEmail({
      to: email,
      subject: `Your ${purpose === 'login' ? 'Login' : purpose === 'signup' ? 'Verification' : 'Password Reset'} OTP - FinanceHub`,
      html: emailHtml
    });

    console.log(`✅ OTP sent to ${email} for ${purpose}`);
    
    return {
      success: true,
      message: 'OTP sent successfully',
      otpId: otpRecord._id
    };
  } catch (error) {
    console.error('Error in createAndSendOTP:', error);
    throw new Error('Failed to send OTP. Please try again.');
  }
};

// Verify OTP
const verifyOTP = async (userId, otp, purpose = 'login') => {
  try {
    // Trim and clean the OTP input
    const cleanOTP = String(otp).trim();
    
    console.log(`🔍 Verifying OTP - UserId: ${userId}, OTP: "${cleanOTP}", Purpose: ${purpose}`);
    
    // Find the OTP
    const otpRecord = await OTP.findOne({
      userId,
      otp: cleanOTP,
      purpose,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    console.log(`📋 OTP Record found:`, otpRecord ? 'YES' : 'NO');
    
    if (!otpRecord) {
      // Debug: Check all OTPs for this user
      const allOTPs = await OTP.find({ userId, purpose }).sort({ createdAt: -1 }).limit(3);
      console.log(`❌ All recent OTPs for user:`, JSON.stringify(allOTPs.map(o => ({
        otp: o.otp,
        otpLength: o.otp.length,
        otpType: typeof o.otp,
        isUsed: o.isUsed,
        expiresAt: o.expiresAt,
        expired: o.expiresAt < new Date(),
        createdAt: o.createdAt
      })), null, 2));
      
      console.log(`❌ Input OTP: "${cleanOTP}", Length: ${cleanOTP.length}, Type: ${typeof cleanOTP}`);
      
      return {
        success: false,
        message: 'Invalid or expired OTP. Please check your email and try again.'
      };
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    console.log(`✅ OTP verified for user ${userId}`);

    return {
      success: true,
      message: 'OTP verified successfully'
    };
  } catch (error) {
    console.error('Error in verifyOTP:', error);
    throw new Error('Failed to verify OTP. Please try again.');
  }
};

// Check if user has valid OTP
const hasValidOTP = async (userId, purpose = 'login') => {
  const otpRecord = await OTP.findOne({
    userId,
    purpose,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });

  return !!otpRecord;
};

// Resend OTP (with rate limiting)
const resendOTP = async (userId, email, userName, purpose = 'login') => {
  try {
    // Check if an OTP was sent in the last 1 minute
    const recentOTP = await OTP.findOne({
      userId,
      purpose,
      createdAt: { $gt: new Date(Date.now() - 60 * 1000) } // Last 1 minute
    });

    if (recentOTP) {
      return {
        success: false,
        message: 'Please wait 1 minute before requesting a new OTP'
      };
    }

    // Send new OTP
    return await createAndSendOTP(userId, email, userName, purpose);
  } catch (error) {
    console.error('Error in resendOTP:', error);
    throw new Error('Failed to resend OTP. Please try again.');
  }
};

module.exports = {
  generateOTP,
  createAndSendOTP,
  verifyOTP,
  hasValidOTP,
  resendOTP
};
