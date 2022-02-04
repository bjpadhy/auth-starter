import bcrypt from "bcrypt";
import { model, Schema } from "mongoose";

const userSchema = new Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    required: [true, "User email required"],
    index: { unique: true },
    validate: {
      validator: function (email) {
        return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
          email
        );
      },
      message: (props) => `${props.value} is not a valid email ID!`,
    },
  },
  phone: {
    type: String,
    index: { unique: true },
    validate: {
      validator: function (phone) {
        return /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/.test(phone);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
    required: [true, "User phone number required"],
  },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  isResetPasswordInitiated: { type: Boolean, default: false },
});

// hash password before saving
userSchema.pre("save", async function () {
  let user = this;

  // basic input validation
  let error = user.validateSync();
  if (error) throw new Error(error);

  // generate a 12 round salt
  const salt = await bcrypt.genSalt(12);
  // hash the password using the salt
  const hashedPassword = await bcrypt.hash(user.password, salt);

  // override the cleartext password with the hashed one and activate user
  user.password = hashedPassword;
});

// Compare input and db password hash
userSchema.methods.comparePassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

// Find active user by email or phone
userSchema.methods.findActiveUser = async function (input) {
  return await this.model("User").findOne({
    $and: [{ $or: [{ email: input }, { phone: input }] }, { isActive: true }],
  });
};

// Find user by email or phone
userSchema.methods.findByEmailOrPhone = async function (input) {
  return await this.model("User").findOne({ $or: [{ email: input }, { phone: input }] });
};

// Find user by email or phone and activate
userSchema.methods.findAndActivateUser = async function (input) {
  return await this.model("User").findOneAndUpdate({ $or: [{ email: input }, { phone: input }] }, { isActive: true });
};

module.exports = model("User", userSchema);
