const express = require('express');
const router = express.Router();
const {TouristSpotsSchema} =require('../schemas.js');
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn} = require('../middleware');
const ExpressError = require('../utils/ExpressError');
const TouristSpots = require('../models/TouristSpots');

const validateTouristspots = (req,res,next)=>{
    const {error} = TouristSpotsSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg,400);
    }else{
        next();
    }
}

router.get('/',catchAsync(async (req,res)=>{
    const spots = await TouristSpots.find({});
    res.render('touristspots/index',{spots});
}))

router.get('/new',isLoggedIn,(req,res)=>{
    res.render('touristspots/new');
})

router.post('/',isLoggedIn,validateTouristspots,catchAsync(async (req,res,next)=>{
    const spot = new TouristSpots(req.body.touristspot);
    await spot.save();
    req.flash('success','Successfully made new tourist-spot!')
    res.redirect(`/touristspots/${spot._id}`);
}))

router.get('/:id',catchAsync(async (req,res)=>{
    const spot = await TouristSpots.findById(req.params.id).populate('reviews');
    if(!spot){
        req.flash('error','Cannot find that tourist-spot')
        return res.redirect('/touristspots');
    }
    res.render('touristspots/show',{spot});
}))

router.get('/:id/edit',isLoggedIn,catchAsync(async (req,res)=>{
    const spot = await TouristSpots.findById(req.params.id);
    if(!spot){
        req.flash('error','Cannot find that tourist-spot')
        return res.redirect('/touristspots');
    }
    res.render('touristspots/edit',{spot});
}))

router.put('/:id',isLoggedIn,validateTouristspots,catchAsync(async (req,res)=>{
    const {id}=req.params;
    const spot = await TouristSpots.findByIdAndUpdate(id,{...req.body.touristspot})
    req.flash('success','Successfully Updated');
    res.redirect(`/touristspots/${spot._id}`);
}))

router.delete('/:id',isLoggedIn,catchAsync(async (req,res)=>{
    const {id}=req.params;
    await TouristSpots.findByIdAndDelete(id)
    req.flash('success','Successfully deleted tourist-spot');
    res.redirect(`/touristspots`);
}))

module.exports = router;