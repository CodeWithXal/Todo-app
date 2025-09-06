const mongoose = require("mongoose");
const schema = mongoose.Schema;
const ObjectId = mongoose.ObjectId;


mongoose.connect("mongodb://localhost:27017/todo-app")
const User = new schema({
    email: {type :String, unique : true},
    password: String,
    name: String
})

const Todo = new schema({
    title: String,
    completed: Boolean,
    userId: {type : Types.ObjectId, ref : "users" }
})

const userModel = mongoose.model('user',User);
const todoModel = mongoose.model('todo',Todo);

module.exports = {
    userModel:userModel,
    todoModel:todoModel
}