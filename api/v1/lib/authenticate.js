import jwt from "jsonwebtoken";
import { rpcIsUserActive } from "../rpc/user";

/**
 * Middleware to authenticate user
 *
 * @author Biswaranjan Padhy
 *
 * @param {Object} req - the express request object
 * @param {Object} res - the express response object
 * @returns {function}
 *
 */
export const authenticationMiddleware = async (req, res, next) => {
  // Fetch user from JWT
  const user = await _authenticate(req);

  if (!user) {
    res.status(401).send({ errors: [{ message: "Un-Authenticated" }] });
    return next();
  }

  // Check if user has been deleted
  const isActive = await rpcIsUserActive({ email: user.email });

  if (!isActive) {
    res.status(401).send({ errors: [{ message: "User doesn't exist" }] });
    return next();
  }

  res.jwtUser = user;
  next();
};

/**
 * Verifies JWT token
 * @private
 * @author Biswaranjan Padhy
 *
 * @param {Object} req - the express request object
 *
 * @returns {Object} the decoded token
 */
const _authenticate = async (req) => {
  let token, decoded;
  if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
    token = req.headers.authorization.split(" ")[1];
  } else {
    return null;
  }
  try {
    decoded = jwt.verify(token, env.JWTSECRET);
  } catch (error) {
    console.error(error);
    return null;
  }
  return decoded;
};

/**
 * Generates JWT token on sign-in
 * @author Biswaranjan Padhy
 *
 * @param {Object} payload - the payload to be signed
 * @param {Object} options - the sign options
 * @returns {string} the signed token
 */
export const generateSignInToken = (payload, options = {}) => {
  return jwt.sign(payload, env.JWTSECRET, options);
};
