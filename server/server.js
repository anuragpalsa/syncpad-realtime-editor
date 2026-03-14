const express = require("express");
const app = express();

app.get("/", (req , res ) => {
    res.send("sync pad server running ");
});

app.listen(8080 , ()=>{
    console.log("server is running on port 8080")
});
