import { InvalidRequestSourceError, InternalError } from "./error";

/**
 * Generates random number string OTP of 6 digits
 * @author Biswaranjan Padhy
 *
 * @param {Object} length - the length of number to generate
 *
 * @returns {string} the number string
 */
const _generateOTP = () => {
  return JSON.stringify(Math.floor(100000 + Math.random() * 900000));
};

/**
 * Generates OTP and sends a text message to user
 * @author Biswaranjan Padhy
 *
 * @param {Object} user - the user object
 * @param {Object} options - extra options for OTP time binding
 *
 * @returns {string} the number string
 */
export const sendOTP = async (user, options = {}) => {
  // Resend previously generated OTP or generate new
  let OTP = await redis.getAsync(user._id.toString());
  if (!OTP) OTP = _generateOTP();

  let messageBody = `Your VacFinder OTP is ${OTP}. Do not share it with anyone.`;

  if (options.source === "SIGNIN_OTP") {
    // Expire OTP in 10 mins
    redis.setex(user._id.toString(), 600, OTP);
    messageBody = messageBody + " OTP is valid for 10 mins.";
  } else if (options.source === "RESET_PASSWORD_OTP") {
    // For reset password OTP should only expire when used.
    redis.set(user._id.toString(), OTP);
  } else {
    throw new InvalidRequestSourceError("Unsupported OTP request source", options);
  }

  // Send OTP to phone via Twilio API
  try {
    await twilio.messages.create({
      body: messageBody,
      messagingServiceSid: env.TWILIO_MESSAGE_SERVICE_SID,
      to: user.phone,
    });
    return { isSuccess: true };
  } catch (error) {
    throw new InternalError("Twilio API error", error);
  }
};
