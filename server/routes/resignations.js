const express = require("express");

module.exports = (db) => {
    const router = new express.Router();

    router.post("/smc", (req, res) => {
        console.log("test2222");
        res.send({ msg: 'hi' });
    });

    router.get("/smc", (req, res) => {

        var records = db.collection('empolyee-requests').findOne({});

        db.collection("empolyee-requests").find({}).toArray(function (err, result) {
            if (err) throw err;
            console.log(result);
            res.send(result);

        });


    });

    return router;
};
