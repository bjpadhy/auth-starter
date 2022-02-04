const discovery = require("../services/discovery");

export const callService = async function (service, data) {
  let returnData = await discovery.process({
    service: service,
    data: data,
  });
  if (returnData === undefined) {
    returnData = {};
  }
  return JSON.parse(JSON.stringify(returnData));
};
