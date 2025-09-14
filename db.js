const mongoose = require("mongoose");
const {Schema,Types} = mongoose;
const ObjectId = mongoose.ObjectId;


mongoose.connect("mongodb://localhost:27017/todo-app")
const User = new Schema({
    email: {type :String, unique : true},
    password: String,
    name: String
})

const Todo = new Schema({
    title: String,
    description : String,
    done: Boolean,
    userId: {type : Types.ObjectId, ref : "user" }
})

const userModel = mongoose.model('user',User);
const todoModel = mongoose.model('todo',Todo);

module.exports = {
    userModel:userModel,
    todoModel:todoModel
}