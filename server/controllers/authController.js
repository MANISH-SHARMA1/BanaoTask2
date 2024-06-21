const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { error, success } = require("../utils/responseWrapper");

const crypto = require("crypto");
const nodemailer = require("nodemailer");

const forgetPasswordController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.send(error(400, "Email is required."));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.send(error(404, "User not found."));
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const resetUrl = `http://localhost:3000/auth/resetPassword/${resetToken}`;

    const message = `You requested a password reset. Please make a PUT request to: \n\n ${resetUrl}`;

    const transporter = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "e470ac0128ee3b",
        pass: "e33931bbc5f7fc",
      },
    });

    const mailOptions = {
      to: user.email,
      subject: "Password Reset Token",
      text: message,
    };

    await transporter.sendMail(mailOptions);
    // We can send a success message as "Email Sent" but for now I'm sending resetToken
    res.send(success(200, resetToken));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const resetPasswordController = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.send(error(400, "Token is required"));
    }

    if (!password) {
      return res.send(error(400, "Password is required"));
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.send(error(400, "Invalid or expired token."));
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.send(success(200, "Password reset successful."));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const signupController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.send(error(400, "All fields are required."));
    }

    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return res.send(success(409, "User is already registered."));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.send(success(201, "User created successfull."));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.send(error(400, "All fields are required."));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.send(error(404, "User is not registered."));
    }

    const matched = await bcrypt.compare(password, user.password);

    if (!matched) {
      return res.send(error(403, "Incorrect password."));
    }

    const accessToken = generateAccessToken({
      _id: user._id,
    });

    const refreshToken = generateRefreshToken({
      _id: user._id,
    });

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return res.send(success(201, { accessToken }));
  } catch (e) {
    console.log("error from login", e);
    return res.send(error(401, e));
  }
};

// THIS API WILL CHECK THE REFRESH TOKEN VALIDITY AND GENERATE A NEW ACCESS TOKEN
const refreshAccessTokenController = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies.jwt) {
    return res.send(error(401, "Refresh token in cookie is required."));
  }

  const refreshToken = cookies.jwt;

  try {
    const decoded = jwt.verify(
      refreshToken,
      "process.env.REFRESH_TOKEN_PRIVATE_KEY"
    );

    const _id = decoded._id;
    const accessToken = generateAccessToken({ _id });

    return res.send(success(201, { accessToken }));
  } catch (e) {
    return res.send(error(401, "Invalid refresh token."));
  }
};

const logoutController = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
    });
    return res.send(success(200, "User Logged Out."));
  } catch (e) {
    res.send(error(500, e.message));
  }
};

// internal functions
const generateAccessToken = (data) => {
  try {
    const token = jwt.sign(data, "process.env.ACCESS_TOKEN_PRIVATE_KEY", {
      expiresIn: "1d",
    });
    console.log(token);
    return token;
  } catch (error) {
    console.log("Errorr: ", error);
  }
};

const generateRefreshToken = (data) => {
  try {
    const token = jwt.sign(data, "process.env.REFRESH_TOKEN_PRIVATE_KEY", {
      expiresIn: "1y",
    });
    console.log(token);
    return token;
  } catch (error) {
    console.log("Errorr: ", error);
  }
};

module.exports = {
  signupController,
  loginController,
  refreshAccessTokenController,
  logoutController,
  forgetPasswordController,
  resetPasswordController,
};
