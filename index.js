const dotenv =require('dotenv');
const env = dotenv.config();
const express= require('express');
const app = express();
const parser=require('body-parser');
const jwt=require('jsonwebtoken');

const knex=require('knex');
const knexDb=knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      database: 'jwt_test',
      user:     'postgres',
      password: 'root'
    }
});

const bookshelf=require('bookshelf');
const securePassword=require('bookshelf-secure-password');
const db=bookshelf(knexDb);
db.plugin(securePassword);


const User=db.Model.extend({
    tableName:'login_user',
    hasSecuredPassword: true
})

const passport=require('passport');
const passportJWT=require('passport-jwt');
const JwtStrategy=passportJWT.Strategy;
const ExtractJwt =passportJWT.ExtractJwt;


var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET_OR_KEY;

const strategy=new JwtStrategy(opts,(payload,next)=>{
     
     const user = User.forge({id:payload.id}).fetch().then(res=>{
         next(null,res)
     });
     next(null,user);
 });

passport.use(strategy);
app.use(passport.initialize());
app.use(express.json());
app.use(parser.urlencoded({
    extended:false
}));
app.use(parser.json());
// Apis Here

app.get('/',(req,res)=>{
    res.send("hello world");
})

app.post('/seedUser',(req,res)=>{

    if(!req.body.email || !req.body.password){
        return res.status(401).send('no fields');
    }
    const user =new User({
        email :req.body.email,
        password_digest:req.body.password
    })
    user.save().then(()=>{
        res.send('ok');
    })
});

app.post('/getToken',(req,res)=>{
    if(!req.body.email || !req.body.password){
        return res.status(401).send('no fields');
    }
    User.forge({email:req.body.email}).fetch().then(result=>{
        if(!result){
            return res.status(400).send('user not found');
            
        }
        // result.authenticate(req.body.password)
        // .then(user=>{
        //     const payload ={id: user.id}
        //     const token =jwt.sign(payload,process.env.SECRET_OR_KEY);
        //     res.send(token);
        // }).catch(err=>{
        //     return res.status(401).send({err})
        // });


        return User.forge({ email: req.body.email })
        .fetch()
        .then(function (user) {
          return user.authenticate(req.body.password)
        })
    });
});


app.get('/protected',passport.authenticate('jwt',{session:false}),(req,res)=>{
    res.send(`i'm protected  ${res}`)
})


const PORT= process.env.PORT || 7000;

app.listen(PORT,()=>{
    console.log(`App is listening to port ${PORT}`)
})