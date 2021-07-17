const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelper');
const TouristSpots = require('../models/TouristSpots');

mongoose.connect('mongodb://localhost:27017/TouristHub',{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
	console.log("Database Connected!");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () =>{
    await TouristSpots.deleteMany({});
    for(let i=0;i<50;i++){
        const random1467 = Math.floor(Math.random()*1467);
        const spot = new TouristSpots({
            location:`${cities[random1467].city}, ${cities[random1467].state}`,
            title: `${sample(descriptors)} ${sample(places)}`
        })
        await spot.save();
    }
}

seedDB().then(()=>{
    db.close();
});