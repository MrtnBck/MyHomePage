var mongoose = require("mongoose");
/* var prod     = require("productivity"); */

/* app.set("view engine", "ejs"); */

//MONGOOSE/MODEL/CONFIG
var setupSchema = new mongoose.Schema({
    name: String,
    quote: String,
});

module.exports = mongoose.model("setup", setupSchema); //ez csinálja meg a setups collectiont. s-t odarakja a fordító a végére