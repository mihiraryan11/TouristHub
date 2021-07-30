const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');

router.get('/register',(req,res)=>{
    res.render('users/register');
})

router.post('/register', catchAsync(async (req,res,next)=>{
    try{
        const {email,username,password} = req.body;
        const user=new User({email,username});
        const registeredUser = await User.register(user,password);
        req.login(registeredUser,err=>{
            if(err)return next(err);
            req.flash('success','Welcome to Tourist-Hub');
            res.redirect('/touristspots'); 
        })
    }catch(e){
        req.flash('eror',e.message);
        res.redirect('register');
    } 
}))

router.get('/login',(req,res)=>{
    res.render('users/login');
})

router.post('/login',passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),(req,res)=>{
    req.flash('success','Welcome back!');
    const redirectedUrl = req.session.returnTo || '/touristspots';
    delete req.session.returnTo;
    res.redirect(redirectedUrl);
})

router.get('/logout',(req,res)=>{
    req.logout();
    req.flash('success','Goodbye!');
    res.redirect('/touristspots');
})

module.exports = router;