import _ from "lodash";
import { generateSignInToken } from "../../../lib/authenticate";
import { sendOTP } from "../../../lib/communicator";
import {
  InternalError,
  BadRequestInputError,
  ResourceNotFoundError,
  InvalidRequestSourceError,
} from "../../../lib/error";
const User = require("../models/user");

export const isUserActive = async (data) => {
  const user = await User().findActiveUser(_.get(data, "email", data.phone));
  return user ? true : false;
};

export const userSignup = async (data) => {
  try {
    // Check for user existence
    let user = await User.findOne({ email: data.email });
    if (user) throw new BadRequestInputError("User already exists", data);

    user = new User(data);
    return await user.save();
  } catch (error) {
    // Catch mongoose validation errors
    if (error.errors) {
      let errorMessages = [];
      _.forEach(error.errors, ({ properties }) => errorMessages.push(properties.message));
      const newError = new InternalError("Signup error", errorMessages || error);
      return { error: newError };
    }

    // Signup errors
    console.error(error);
    return { error };
  }
};

export const userSignin = async (data) => {
  try {
    let input = _.get(data, "email", data.phone);
    if (input) {
      // Check if user exists and activate
      let user = await User().findAndActivateUser(input);

      if (user) {
        // Authenticate user
        return await _validateCredentials(user, data);
      }

      throw new ResourceNotFoundError("User does not exist", data);
    }

    throw new BadRequestInputError("Invalid input", data);
  } catch (error) {
    console.error(error);
    return { error };
  }
};

const _validateCredentials = async (user, input) => {
  switch (input.method) {
    case "EMAIL_SIGNIN":
      return await _emailSignin(user, input);
    case "OTP_SIGNIN":
      return await _otpSignin(user, input);
    default:
      throw new InvalidRequestSourceError("Unsupported login method", data);
  }
};

const _emailSignin = async (user, input) => {
  const userID = user._id.toString();
  if (user.isResetPasswordInitiated === false) {
    // Compare password
    const passMatch = await user.comparePassword(input.password);
    if (passMatch) return { token: generateSignInToken({ id: userID, email: user.email, isActive: user.isActive }) };

    throw new BadRequestInputError("Password mismatch", input);
  }

  // Reset password has been initiated, block login until password has been reset
  throw new BadRequestInputError("Reset password initiated. Cannot sign-in", input);
};

const _otpSignin = async (user, input) => {
  const userID = user._id.toString();
  const storedOTP = await redis.getAsync(`${userID}`);
  if (!storedOTP) throw new ResourceNotFoundError("OTP has expired or no OTP generated for user", input);

  if (storedOTP === JSON.stringify(input.otp)) {
    // Remove OTP from redis
    await redis.del(`${userID}`);
    // Return JWT
    return { token: generateSignInToken({ id: userID, email: user.email, isActive: user.isActive }) };
  }

  throw new BadRequestInputError("OTP mismatch", input);
};

export const requestOTP = async (data) => {
  try {
    let user = await User().findActiveUser(_.get(data, "email", data.phone));
    if (user) {
      let promiseArray = [];

      // For reset password, set reset password flag to true
      if (data.source === "RESET_PASSWORD_OTP") {
        user.isResetPasswordInitiated = true;
        promiseArray.push(user.save());
      }

      promiseArray.push(sendOTP(user, { source: data.source }));

      return await Promise.all(promiseArray);
    }

    throw new ResourceNotFoundError("User does not exist", data);
  } catch (error) {
    console.error(error);
    return { error };
  }
};

export const resetPassword = async (data) => {
  try {
    let user = await User.findOne({ email: data.email });
    if (!user) throw new ResourceNotFoundError("User does not exist", data);
    const userID = user._id.toString();
    const storedOTP = await redis.getAsync(`${userID}`);

    if (!storedOTP) throw new ResourceNotFoundError("No OTP generated for user", data);

    if (storedOTP === data.otp.toString()) {
      await redis.delAsync(userID);
      user.password = data.newPassword;
      user.isResetPasswordInitiated = false;
      return await user.save();
    }

    throw new BadRequestInputError("OTP mismatch", data);
  } catch (error) {
    console.error(error);
    return { error };
  }
};
