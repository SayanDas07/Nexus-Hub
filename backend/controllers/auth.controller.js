import { User } from '../models/user.model.js';
import { Room } from '../models/room.model.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/generateToken.js';
import { generateInviteCode } from '../utils/generateInviteCode.js';
import nodemailer from 'nodemailer';

export const registerAdmin = async (req, res) => {
  try {
    const { email, password, securityQuestion, securityAnswer } = req.body;

    if (!email || !password || !securityQuestion || !securityAnswer) {
      return res.status(400).json({ message: 'All fields are required', success: false });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists', success: false });

    const hashedPassword = await bcrypt.hash(password, 10);
    const lowerCaseSecurityAnswer = securityAnswer.toLowerCase();
    const hashedAnswer = await bcrypt.hash(lowerCaseSecurityAnswer, 10);
    const username = `user_${Math.random().toString(36).substr(2, 6)}`;

    const newUser = await User.create({
      email,
      password: hashedPassword,
      username,
      role: 'admin',
      securityQuestion,
      securityAnswer: hashedAnswer,
    });

    const room = await Room.create({
      admin: newUser._id
    });

    newUser.room = room._id;
    await newUser.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    try {

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Welcome to Nexus-Hub - Admin Account Created',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #333;">Welcome to Nexus-Hub, ${email}!</h2>
            <p>Your admin account has been created for Nexus-Hub successfully.</p>
            <p><strong>Account Details:</strong></p>
            <ul>
              <li><strong>Username:</strong> ${username}</li>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>PassWord:</strong> ${password}</li>
            </ul>
            <p>You can log in using the following link:</p>
            <p><a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Login to Your Account</a></p>
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <p>Thank you,<br>The Nexus-Hub Team</p>
          </div>
        `
      };

      const emailResponse = await transporter.sendMail(mailOptions);

    } catch (emailError) {
      console.error('Failed to send email:', emailError);

    }

    res.cookie('token', generateToken(newUser._id), {
      httpOnly: true, secure: true, maxAge: 86400000,
      sameSite: 'Strict'
    });

    res.status(201).json({ user: newUser, token: generateToken(newUser._id), message: 'Admin registered successfully. Check Your Email', success: true });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration', success: false });
  }
};

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found', success: false });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials', success: false });

  if (user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.', success: false });
  }
  // res.cookie('token', generateToken(user._id), {
  //   httpOnly: true, secure: true, maxAge: 86400000,
  //   sameSite: 'Strict'
  // });

  res.cookie('token', generateToken(user._id), {
    httpOnly: true, secure: true, maxAge: 86400000,
    sameSite: 'None'
  });

  //console.log(user);
  res.json({ user, token: generateToken(user._id), success: true, message: 'Admin Logged in successfully' });
};

export const logout = (req, res) => {
  try {
    res.cookie('token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 0 // Immediately expire the cookie
    });

    res.json({
      message: 'Logged out successfully.',
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed', error: error.message, success: false });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found', success: false });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect old password', success: false });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully', success: true });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Internal server error', success: false });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found', success: false });

    res.json({ user, success: true, message: 'User details fetched successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error. Please Try again...', success: false, error: error.message });
  }
};

export const getAllUserCountFromRoomId = async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      return res.status(400).json({ message: 'Room ID is required' });
    }

    const room = await Room.findById(roomId).populate('admin members');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const totalUsersLength = room.admin.length + room.members.length;


    res.status(200).json({ totalUsersLength });
  } catch (error) {
    console.error('Error fetching user count:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getUserbyEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne(email).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found', success: false });

    res.json({ user, success: true });



  }
  catch (error) {
    res.status(500).json({ message: 'Server error. Please Try again...', success: false, error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  const { email, securityQuestion, securityAnswer } = req.body;

  if (!email || !securityQuestion || !securityAnswer) {
    return res.status(400).json({
      message: 'Email, security question, and answer are required.',
      success: false
    });
  }

  try {
    const user = await User.findOne({ email, securityQuestion, role: 'admin' });

    if (!user) {
      return res.status(404).json({
        message: 'No user found with the provided details.',
        success: false
      });
    }

    const lowerCaseSecurityAnswer = securityAnswer.toLowerCase();
    const isAnswerValid = await bcrypt.compare(lowerCaseSecurityAnswer, user.securityAnswer);

    if (!isAnswerValid) {
      return res.status(401).json({
        message: 'Incorrect security answer.',
        success: false
      });
    }

    // Generate a new temporary password
    const tempPassword = Math.random().toString(36).substr(2, 8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Update user's password
    user.password = hashedPassword;
    await user.save();

    // Send email with the new password
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Nexus-Hub - Password Reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333;">Password Reset Successful</h2>
          <p>Hello,</p>
          <p>Your password for Nexus-Hub has been reset based on your security question verification.</p>
          <p><strong>Your New Temporary Password:</strong> <span style="font-size: 18px; color: #4CAF50; font-weight: bold;">${tempPassword}</span></p>
          <p>Please log in and change your password as soon as possible.</p>
          <p><a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Login to Your Account</a></p>
          <p>If you did not request this change, please contact us immediately.</p>
          <p>Thank you,<br>The Nexus-Hub Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: 'A new password has been sent to your email.'
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({
      message: 'An error occurred while resetting the password.',
      success: false
    });
  }
};