import { errorHandler } from "../lib/error";
import { rpcUserSignup, rpcUserSignin, rpcUserRequestOTP, rpcUserResetPassword } from "../rpc/user";

export const signup = async (req, res) => {
  try {
    const result = await rpcUserSignup(req.body);

    if (result.error) {
      return errorHandler(result, res);
    }

    return res.status(200).json({ isSuccess: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

export const signin = async (req, res) => {
  try {
    const result = await rpcUserSignin(req.body);

    if (result.error) {
      return errorHandler(result, res);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

export const requestOTP = async (req, res) => {
  try {
    const result = await rpcUserRequestOTP(req.body);

    if (result.error) {
      return errorHandler(result, res);
    }

    return res.status(200).json({ isSuccess: true });
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const result = await rpcUserResetPassword(req.body);

    if (result.error) {
      return errorHandler(result, res);
    }

    return res.status(200).json({ isSuccess: true });
  } catch (error) {
    return res.status(500).json(error);
  }
};

module.exports = router;
