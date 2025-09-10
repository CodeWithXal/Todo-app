const express = require("express");
const{ userModel, todoModel } = require("./db");
const jwt = require("jsonwebtoken");
const jwt_secret = "asd123";



const app = express();
app.use(express.json());



async function signup(req, res){
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    await userModel.create({
        email,
        password,
        name
    })

    res.json({
        message : "you are signed up"
    })
}

async function signin(req, res){
    const email = req.body.email;
    const password = req.body.password;
    
    const user = await userModel.findOne({
        email : email,
        password : password  
    })

    console.log(user);

    if(user){
        const token = jwt.sign({
            id : user._id
        }, jwt_secret);
        res.json({
            token : token 
        });
    }

    else{
        res.status(403).json({
            messsage : "email or password is incorrect"
        });
    }
}



app.post("/signup", signup);
app.post("/signin", signin);
// app.post("/todo", post_todo);
// app.get("/todos", get_todos);



app.listen(3000, () => {
  console.log("server running on : http://localhost:3000");
});
