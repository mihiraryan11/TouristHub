const express = require('express');
const router = express.Router({mergeParams:true});

const TouristSpots = require('../models/TouristSpots');
const Review = require('../models/review');
const {validateReview,isLoggedIn,isReviewAuthor} = require('../middleware');

const catchAsync = require('../utils/catchAsync');

router.post('/',isLoggedIn,validateReview,catchAsync(async (req,res)=>{
    const spot = await TouristSpots.findById(req.params.id)
    const review = new Review(req.body.review);
    review.author = req.user._id;
    spot.reviews.push(review);
    await review.save();
    await spot.save();
    req.flash('success','Created new review');
    res.redirect(`/touristspots/${spot._id}`);
}))

router.delete('/:reviewId',isLoggedIn,isReviewAuthor,catchAsync(async (req,res)=>{
    const {id,reviewId}=req.params;
    await TouristSpots.findByIdAndUpdate(id,{ $pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Successfully deleted review');
    res.redirect(`/touristspots/${id}`);
}))

module.exports = router;