import { callService } from "../lib/serviceCaller";

export const rpcIsUserActive = async (data) => {
  return await callService("USER", {
    operation: "IS_ACTIVE_CHECK",
    data,
  });
};

export const rpcUserSignup = async (data) => {
  return await callService("USER", {
    operation: "SIGNUP",
    data,
  });
};

export const rpcUserSignin = async (data) => {
  return await callService("USER", {
    operation: "SIGNIN",
    data,
  });
};

export const rpcUserRequestOTP = async (data) => {
  return await callService("USER", {
    operation: "REQUEST_OTP",
    data,
  });
};

export const rpcUserResetPassword = async (data) => {
  return await callService("USER", {
    operation: "RESET_PASSWORD",
    data,
  });
};
