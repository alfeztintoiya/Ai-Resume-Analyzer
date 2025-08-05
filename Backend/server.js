const express = require("express");
const cookieParser = require("cookie-parser")
const cloudinary = require('cloudinary').v2;
const supabase = require('./utils/supabaseClient');
require('dotenv').config();

const app = express();
const PORT = 5003;

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY,       
  api_secret: process.env.CLOUDINARY_API_SECRET, 
  secure: true, 
});

//Routes Import
const auth = require("./routes/auth");

app.use(express.json());
app.use(cookieParser());


app.get("/",async (req, res) => {
    const {data, error} = await supabase.from('users').select('*');

    if(error){
        return res.status(500).json({ error: error.message });
    }
    
    res.json(data);
});


app.use("/api/v1/auth", auth);

app.listen(PORT, () => {
  console.log(`Server listening at ${PORT}....`);
});
