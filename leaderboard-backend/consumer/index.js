const express = require("express");

const app = express();

app.use(express.json())

app.post("/processData", (req, res) => {
    console.log(req.body);
    res.send("Data received");
})

app.listen(5000, () => {
    console.log('Consumer running on port 5000');
    
})