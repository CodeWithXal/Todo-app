const express = require("express");
const{ userModel, todoModel } = require("./db");
const jwt = require("jsonwebtoken");
const jwt_secret = "asd123";
const bcrypt = require("bcrypt");
const { z } = require("zod");



const app = express();
app.use(express.json());


function authMiddleware(req, res, next){
    const token = req.headers.authorization;

    if(!token){
        res.status(401).json({
            message : "No Token provided"
        });
    }

    try{
        const decoded = jwt.verify(token, jwt_secret);
        req.userId = decoded.id;
        next();
    }

    catch(err){
        res.status(401).json({
            message : "Invalid Token"
        });
    }
}

async function signup(req, res){
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

     const requiredBody = z.object({
        email: z.string().min(3, "Email must be at least 3 characters")
                          .max(50, "Email must be at most 50 characters")
                          .email("Invalid email format"),
        password: z.string().min(8, "Password must be at least 8 characters")
                            .max(50, "Password must be at most 50 characters")
                            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
                            .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
        name: z.string().min(3, "Name must be at least 3 characters")
                       .max(50, "Name must be at most 50 characters")
    });


    const parsedData = requiredBody.safeParse(req.body);

    if(!parsedData.success){

        const errorMsg = parsedData.error.issues.map(issues =>({
            field: issues.path[0],
            message: issues.message
        }));

        res.status(400).json({
            message : "Incorrect Format",
            error : errorMsg
        });
        return;
    }


    // const { email, password, name} = parsedData.data;
    try{
        const hashed_password = await bcrypt.hash(password,5);
        await userModel.create({
            email : email,
            password : hashed_password,
            name : name
        });

        return res.json({
            message : "You are signed up"
        })
    }
    catch(err){
        
        return res.status(400).json({
                message : "User already exists or Database error",
                error : err.message
        });
        
    }
   
    
}

async function signin(req, res){
    const email = req.body.email;
    const password = req.body.password;
    
    const user = await userModel.findOne({
        email : email
    })

    if(!user){
        res.status(403).json({
            message : "User doesn't exists in our database "
        });
    }

    const password_match = await bcrypt.compare(password, user.password);

    // console.log(user);

    if(password_match){
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

async function post_todo(req, res){
    const title = req.body.title;
    const description = req.body.description;
    const done = req.body.done;

    try{
        await todoModel.create({
            title,
            description,
            done,
            userId : req.userId
        });
         res.json({
        message : "Todo added"
    });

    }

    catch(err){
        res.status(500).json({
            message : "Error adding Todo"
        });
    }

   
}


async function get_todos(req, res){

    try{
        const todos = await todoModel.find({userId : req.userId});

        res.json({
        todos
    });
    }

    catch(err){
        res.status(500).json({
            message : "Error fetching Todos"
        });
    }
    
}

app.post("/signup", signup);
app.post("/signin", signin);
app.post("/todo",authMiddleware, post_todo);
app.get("/todos",authMiddleware, get_todos);



app.listen(3000, () => {
  console.log("server running on : http://localhost:3000");
});
