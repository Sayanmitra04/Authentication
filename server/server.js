import express from 'express';
import cors from 'cors';
import  'dotenv/config';

import cookieParser from 'cookie-parser';
import { connect } from 'mongoose';
import conneectDB from './config/mongodb.js';
import authRouter from './Routes/authRoutes.js';
import userRouter from './Routes/userRoutes.js';


const app = express();
const port = process.env.PORT || 4000;

conneectDB();

const allowedOrigins = ['http://localhost:5173'];
app.use(express.json());
app.use(cookieParser());
app.use(cors({origin:allowedOrigins,credentials: true}));

app.get('/', (req, res) => {
    res.send('Hello ');
    });
app.use('/api/auth', authRouter); 
app.use('/api/user', userRouter);   


app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
