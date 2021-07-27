const express = require('express');
const path=require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const {TouristSpotsSchema,reviewSchema} =require('./schemas.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const TouristSpots = require('./models/TouristSpots');
const Review = require('./models/review');

mongoose.connect('mongodb://localhost:27017/TouristHub',{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true,
    useFindAndModify:false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
	console.log("Database Connected!");
});

const app = express();

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));

const validateTouristspots = (req,res,next)=>{
    const {error} = TouristSpotsSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg,400);
    }else{
        next();
    }
}

const validateReview = (req,res,next)=>{
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg,400);
    }else{
        next();
    }
}

app.get('/',(req,res)=>{
    res.render('home')
})

app.get('/touristspots',catchAsync(async (req,res)=>{
    const spots = await TouristSpots.find({});
    res.render('touristspots/index',{spots});
}))

app.get('/touristspots/new',(req,res)=>{
    res.render('touristspots/new');
})

app.post('/touristspots',validateTouristspots,catchAsync(async (req,res,next)=>{
    const spot = new TouristSpots(req.body.touristspot);
    await spot.save();
    res.redirect(`/touristspots/${spot._id}`);
}))

app.get('/touristspots/:id',catchAsync(async (req,res)=>{
    const spot = await TouristSpots.findById(req.params.id).populate('reviews');
    res.render('touristspots/show',{spot});
}))

app.get('/touristspots/:id/edit',catchAsync(async (req,res)=>{
    const spot = await TouristSpots.findById(req.params.id)
    res.render('touristspots/edit',{spot});
}))

app.put('/touristspots/:id',validateTouristspots,catchAsync(async (req,res)=>{
    const {id}=req.params;
    const spot = await TouristSpots.findByIdAndUpdate(id,{...req.body.touristspot})
    res.redirect(`/touristspots/${spot._id}`);
}))

app.delete('/touristspots/:id',catchAsync(async (req,res)=>{
    const {id}=req.params;
    await TouristSpots.findByIdAndDelete(id)
    res.redirect(`/touristspots`);
}))

app.post('/touristspots/:id/reviews',validateReview,catchAsync(async (req,res)=>{
    const spot = await TouristSpots.findById(req.params.id)
    const review = new Review(req.body.review);
    spot.reviews.push(review);
    await review.save();
    await spot.save();
    res.redirect(`/touristspots/${spot._id}`);
}))

app.delete('/touristspots/:id/reviews/:reviewId',catchAsync(async (req,res)=>{
    const {id,reviewId}=req.params;
    await TouristSpots.findByIdAndUpdate(id,{ $pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/touristspots/${id}`);
}))

app.all('*',(req,res,next)=>{
    next(new ExpressError('Page Not Found',404))
})

app.use((err,req,res,next)=>{
    const {statusCode = 500} = err;
    if(!err.message)err.message = 'Something Went Wrong';
    res.status(statusCode).render('error',{err});
})

app.listen(3000,()=>{
    console.log('Serving on 3000')
})