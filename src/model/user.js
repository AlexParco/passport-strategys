const mongoose = require('../db/mongo')
const scryptMcf = require('scrypt-mcf')

const UserSchema = new mongoose.Schema({
  username: {type: String, require: true},
  password: {type: String, require: true}
})

const UserModel = mongoose.model('user', UserSchema, 'users')

UserSchema.methods.generateHash = async function(password) {
  scryptMcf.hash(password)
  .then((hash) => {
    return hash
  }).catch((error) => {
    console.error('Error al hashear la contraseña:', error);
  });
}

UserSchema.methods.comparePassword = async function(password) {
  scryptMcf.verify(password, this.password)
  .then((match) => {
    if (match) {
      return true
    } else {
      return false
    }
  }).catch((error) => {
    console.log(error)
  })
}

module.exports = {
  UserSchema,
  UserModel,
}
