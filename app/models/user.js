const mongoose = require('mongoose'),
	Schema = mongoose.Schema;

//simple user model
module.exports = mongoose.model('User', new Schema({ 
	
	name: String, 
	password: String, 
	admin: Boolean 
}));