const express = require('express');
const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Payment = require('../models/Payment');
const User = require('../models/User');
const SubscriptionPlan = require('../models/SubscriptionPlan');

const router = express.Router();

// Create Razorpay order
router.post('/create-order', async (req, res) => {
  try {
    const { planId, email, name, contact } = req.body;

    // Get plan details
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    // Create Razorpay order
    const options = {
      amount: plan.price * 100, // amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        planId: plan._id.toString(),
        planName: plan.name,
        email,
        name,
        contact
      }
    };

    const order = await razorpay.orders.create(options);

    // Create payment record (without user initially, as user may not exist yet)
    const payment = new Payment({
      subscriptionPlan: plan._id,
      amount: plan.price,
      currency: 'INR',
      razorpayOrderId: order.id,
      status: 'created',
      email,
      contact,
      metadata: { name }
    });

    // We'll link user after registration/payment verification
    const savedPayment = await payment.save();

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency
      },
      plan: {
        id: plan._id,
        name: plan.name,
        price: plan.price
      },
      paymentId: savedPayment._id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating order', 
      error: error.message 
    });
  }
});

// Verify payment and create/update user
router.post('/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userData // { name, email, password, contact }
    } = req.body;

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid payment signature' 
      });
    }

    // Find payment record
    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment record not found' 
      });
    }

    // Get plan details
    const plan = await SubscriptionPlan.findById(payment.subscriptionPlan);

    // Check if user exists
    let user = await User.findOne({ email: userData.email });

    if (user) {
      // Update existing user's subscription
      user.subscriptionPlan = plan._id;
      user.subscriptionStatus = 'active';
      
      // Set expiry based on plan period
      const expiryDate = new Date();
      if (plan.period === 'month') {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else if (plan.period === 'year') {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      } else if (plan.period === 'lifetime') {
        expiryDate.setFullYear(expiryDate.getFullYear() + 100);
      }
      user.subscriptionExpiry = expiryDate;

      await user.save();
    } else {
      // Create new user with subscription
      const expiryDate = new Date();
      if (plan.period === 'month') {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else if (plan.period === 'year') {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      } else if (plan.period === 'lifetime') {
        expiryDate.setFullYear(expiryDate.getFullYear() + 100);
      }

      user = new User({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        subscriptionPlan: plan._id,
        subscriptionStatus: 'active',
        subscriptionExpiry: expiryDate
      });

      await user.save();
    }

    // Update payment record
    payment.user = user._id;
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = 'success';
    await payment.save();

    res.json({
      success: true,
      message: 'Payment verified successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscriptionPlan: plan.name,
        subscriptionExpiry: user.subscriptionExpiry
      }
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error verifying payment', 
      error: error.message 
    });
  }
});

// Get payment details
router.get('/:paymentId', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId)
      .populate('user', 'name email')
      .populate('subscriptionPlan', 'name price period');

    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment not found' 
      });
    }

    res.json({
      success: true,
      payment
    });

  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching payment', 
      error: error.message 
    });
  }
});

// Webhook for Razorpay events
router.post('/webhook', async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature
    const shasum = crypto.createHmac('sha256', secret || '');
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest === req.headers['x-razorpay-signature']) {
      const event = req.body.event;
      const payload = req.body.payload.payment.entity;

      // Handle different events
      if (event === 'payment.captured') {
        await Payment.findOneAndUpdate(
          { razorpayPaymentId: payload.id },
          { status: 'success' }
        );
      } else if (event === 'payment.failed') {
        await Payment.findOneAndUpdate(
          { razorpayPaymentId: payload.id },
          { status: 'failed' }
        );
      }

      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
