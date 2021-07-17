const express = require('express');
const path=require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const TouristSpots = require('./models/TouristSpots');

mongoose.connect('mongodb://localhost:27017/TouristHub',{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true
})
mongoose.set('useFindAndModify', false);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
	console.log("Database Connected!");
});

const app = express();

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));

app.get('/',(req,res)=>{
    res.render('home')
})

app.get('/touristspots',async (req,res)=>{
    const spots = await TouristSpots.find({});
    res.render('touristspots/index',{spots});
})

app.get('/touristspots/new',(req,res)=>{
    res.render('touristspots/new');
})

app.post('/touristspots',async (req,res)=>{
    const spot = new TouristSpots(req.body.touristspot);
    await spot.save();
    res.redirect(`/touristspots/${spot._id}`);
})

app.get('/touristspots/:id',async (req,res)=>{
    const spot = await TouristSpots.findById(req.params.id)
    res.render('touristspots/show',{spot});
})

app.get('/touristspots/:id/edit',async (req,res)=>{
    const spot = await TouristSpots.findById(req.params.id)
    res.render('touristspots/edit',{spot});
})

app.put('/touristspots/:id',async (req,res)=>{
    const {id}=req.params;
    const spot = await TouristSpots.findByIdAndUpdate(id,{...req.body.touristspot})
    res.redirect(`/touristspots/${spot._id}`);
})

app.delete('/touristspots/:id',async (req,res)=>{
    const {id}=req.params;
    await TouristSpots.findByIdAndDelete(id)
    res.redirect(`/touristspots`);
})


app.listen(3000,()=>{
    console.log('Serving on 3000')
})