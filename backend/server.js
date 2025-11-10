import express from 'express';
import dotenv from 'dotenv';

import authRoutes from './src/routes/auth.route.js';
import userRoutes from './src/routes/user.routes.js';
import chatRoutes from './src/routes/chat.route.js';
import { connectDB } from './src/lib/db.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

dotenv.config({
    path:"./.env"
})

const app = express();

const  PORT = process.env.PORT || 5000;


app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}))
app.use(express.json());


app.get("/",(req,res)=>{
    res.send("Welcome to Streamify Backend");
});

app.use("/api/auth",authRoutes)
app.use("/api/users",userRoutes)
app.use("/api/chat",chatRoutes)


connectDB()
.then(()=>{
    app.listen(PORT,()=>{
        console.log(`Server listening on port: http://localhost:${PORT}`);
        
    })
})
.catch((err)=>{
    console.log(`MongoDB connection Error:- ${err}`);
    
})
