import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
let Schema = mongoose.Types,
  ObjectId = Schema.ObjectId;
export const UserSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
    required: true,
  },

  email: {
    type: String,
    trim: true,
    index: {
      unique: true,
      partialFilterExpression: { email: { $type: 'string' } },
    },
  },
  username: {
    type: String,
  },
  mobileOtpCode: {
    type: String,
    default: '',
  },
  emailOtpCode: {
    type: String,
    default: '',
  },
  referralId: {
    type: String,
    default: '',
  },
  referralBalance: {
    type: String,
    default: '',
  },
  twoFactorAuthenticationSecret: { type: String },
  status: {
    type: String,
    default: 'InActive',
    enum: ['Active', 'InActive'],
  },
  activeEmailStatus: {
    type: String,
    default: 'InActive',
    enum: ['Active', 'InActive'],
  },
  activeMobileStatus: {
    type: String,
    default: 'InActive',
    enum: ['Active', 'InActive'],
  },
  email2faStatus: {
    type: String,
    default: 'InActive',
    enum: ['Active', 'InActive'],
  },
  google2faStatus: {
    type: String,
    default: 'InActive',
    enum: ['Active', 'InActive'],
  },
  mobile2faStatus: {
    type: String,
    default: 'InActive',
    enum: ['Active', 'InActive'],
  },

  emailToken: {
    type: String,
    
  },
  mobileToken: {
    type: String,
    
  },
  address: [
    { type: String },
    { pincode: '' },
    { city: '' },
    { state: '' },
    { houseNO: '' },
  ],

  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    unique: true,
  },
  fullName: {
    type: String,
  },
});

// NOTE: Arrow functions are not used here as we do not want to use lexical scope for 'this'
UserSchema.pre('save', function (next) {
  let user = this as any;
  // Make sure not to rehash the password if it is already hashed
  if (!user.createdBy) user.createdBy = user._id;
  if (!user.modifiedBy) user.modifiedBy = user._id;
  if (!user.isModified('password')) return next();
  // Generate a salt and use it to hash the user's password

  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.checkPassword = function (attempt, callback) {
  let user = this;
  bcrypt.compare(attempt, user.password, (err, isMatch) => {
    if (err) return callback(err);
    callback(null, isMatch);
  });
};
UserSchema.index({ loc: '2dsphere' });

export interface User extends mongoose.Document {
  email: string;
  address: String;
  phoneNumber: String;
  fullName: String;
  password: String;
}
