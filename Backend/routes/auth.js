const express = require('express');
const router = express.Router();

router.post("/callback",(req,res)=>{
    res.end("Hello from backend");
});

router.get("/me",(req,res)=>{
    res.end("Hello from backend");
});

module.exports = router;