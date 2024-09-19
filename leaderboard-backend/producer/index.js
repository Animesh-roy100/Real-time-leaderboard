const express = require("express");

const app = express();

app.use(express.json());

app.post("/processData", (req, res) => {
    console.log(req.body);
    res.send("Data received");
});

app.listen(4000, () => {
    console.log('Producer running on port 4000');
})
