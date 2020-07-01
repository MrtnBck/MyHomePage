var mongoose        =      require("mongoose"),
    methodOverride  =      require("method-override"),
    express         =      require("express"),
    app             =      express(),
    bodyParser      =      require("body-parser") //https://stackoverflow.com/questions/38306569/what-does-body-parser-do-with-express

//Connect to MongoDB
mongoose.connect("mongodb://localhost/homepage", {useNewUrlParser: true, useUnifiedTopology: true});

//APP CONFIG
//nem kell a .ejs attributomot kirakni
app.set("view engine", "ejs");
/* app.use(express.static("public")); */
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));

//MONGOOSE/MODEL/CONFIG
var setupSchema = new mongoose.Schema({
    name: String,
    quote: String
});

var setup = mongoose.model("setup", setupSchema); //ez csinálja meg a setups collectiont. s-t odarakja a fordító a végére

/* setup.create({
	name: "Martin",
	quote: "Eccpecc"
}, function(err, setup){
	if(err){
		console.log(err);
	}else{
		console.log(setup);
    }
}); */


//------------
//RESTFUL ROUTING
//------------

//INDEX ROUTE I.
app.get("/", function(req, res){
    setup.find({}, function(err, allSetups){
        if(err){
            console.log(err);
        }else{
            res.render("index", {setup: allSetups}); //Az index.ejs-t rendereli ki és az adatbázisból az összes adatot  oadadja az index.ejs-nek a setup modellből
        }
    });
});

//INDEX ROUTE II.
app.get("/home", function(req,res){
    //GET all Setup from MongoDB
    setup.find({}, function(err, allSetups){
        if(err){
            console.log(err);
        }else{
            res.render("index", {setup: allSetups}); //A home.ejs-t rendereli ki és az adatbázisból az összes beállítást oadadja a home.ejsnek
        }
    });
});

//NEW ROUTE
app.get("/home/new", function(req, res){
    res.render("new");
});

//CREATE ROUTE
app.post("/home", function(req, res){
    //Create a new user setup and save to mongoDB
    setup.create(req.body.config, function(err, newlyCreated){
        if(err){
            console.log(err);
        }else{
            //redirect back to the homepage
            //console.log(newlyCreated);
            res.redirect("/home");
        }
    });
});

//SHOW ROUTE
app.get("/home/:id", function(req, res){
   setup.findById(req.params.id, function(err, foundConfig){
       if(err){
           res.redirect("/home");
       }else{
           res.render("show", {setup: foundConfig});
       }
   });
});


//EDIT ROUTE
app.get("/home/:id/edit", function(req, res){
    setup.findById(req.params.id, function(err, foundConfig){
        if(err){
            res.redirect("/home");
        }else{
            res.render("edit", {setup: foundConfig});
        }
    })
});

//UPDATE ROUTE
app.put("/home/:id", function(req, res){
    setup.findByIdAndUpdate(req.params.id, req.body.config, function(err, updateConfig){ //findByIdAndUpdate(id, new data, callback)
        if(err){
            res.redirect("/index");
        }else{
            res.redirect("/home/" + req.params.id);
        }
    });
});

//DELETE ROUTE
app.delete("/home/:id", function(req,res){
    setup.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/home");
        }else{
            res.redirect("/home");
        }
    });
});

app.listen("5500", "127.0.0.1", function(){
    console.log("The HomePageMe server has started!");
});