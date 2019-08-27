const dotenv =require('dotenv');
const env = dotenv.config();
const express= require('express');
const app = express();


const passport=require('passport');
const passportJWT=require('passport-jwt');
const JwtStrategy=passportJWT.Strategy;
const ExtractJwt =passportJWT.ExtractJwt;


var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET_OR_KEY;

const strategy=new JwtStrategy(opts,(payload,next)=>{

     const user = null;
     next(null,user);
 });


passport.use(strategy);
app.use(passport.initialize());
app.get('/',(req,res)=>{
    res.send("hello world");
})




const PORT= process.env.PORT || 7000;

app.listen(PORT,()=>{
    console.log(`App is listening to port ${PORT}`)
})