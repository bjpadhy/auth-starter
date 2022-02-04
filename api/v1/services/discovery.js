const user = require("./user/index");

export const process = async (payload) => {
  const { service, data } = payload;
  try {
    switch (service) {
      case "USER":
        return await user.process(data);
      default:
        throw new Error("Service unavailable! Check payload format.");
    }
  } catch (e) {
    console.error(e);
  }
};
