const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = mongoose.Schema(
    {
      name: { type: "String", required: true },
      email: { type: "String", unique: true, required: true },
      password: { type: "String", required: true },
      pic: {
        type: "String",
        required: true,
        default:
          "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
      },
      isAdmin: {
        type: Boolean,
        required: true,
        default: false,
      },
    },
    { timestaps: true }
  );

userSchema.methods.matchPassword = async function (enteredPassword) {
    try {
        return await bcrypt.compare(enteredPassword, this.password);
    } catch (error) {
        throw error; // Handle or log the error as needed
    }
};



userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        return next();
    } catch (err) {
        return next(err);
    }
});



const User = mongoose.model('User',userSchema)

module.exports = User;