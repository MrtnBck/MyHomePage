var mongoose        =      require("mongoose"),
    methodOverride  =      require("method-override"),
    express         =      require("express"),
    app             =      express(),
    bodyParser      =      require("body-parser"), //https://stackoverflow.com/questions/38306569/what-does-body-parser-do-with-express
    passport        =      require("passport"),
    LocalStrategy   =      require("passport-local"),
    /* passportLocalMonogoose = require("passport-local-mongoose"), */
    setup           =      require("./model/setup"),
    User            =      require("./model/user")

//Connect to MongoDB
mongoose.connect("mongodb://localhost/homepage", {useNewUrlParser: true, useUnifiedTopology: true});

//APP CONFIG
//nem kell a .ejs attributomot kirakni
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));

//SEEDING THE DATABASE

/* User.create ({
    username: "testuser1",
    password: "12345",
    thisSetup: [{name: "TestName4" ,quote: "Teszt Quote",}]
}, function(err, User){
    if(err){
        console.log(err);
    }else{
        console.log(User);
    }
}); */

//------------
//RESTFUL ROUTING
//------------

//PASSPORT CONGIFURATION
app.use(require("express-session")({
    secret: "sinx/cosx = tanx",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//LANDING PAGE
app.get("/", function(req, res){
    res.render("landing");
});

//INDEX ROUTE -- NOT IN USE
/* app.get("/home", isLoggedIn, function(req,res){
    //GET all Setup from MongoDB
    setup.find({}, function(err, allSetups){
        if(err){
            console.log(err);
        }else{
            res.render("index", {setup: allSetups}); //A home.ejs-t rendereli ki és az adatbázisból az összes beállítást oadadja a home.ejsnek
        }
    });
}); */

//NEW ROUTE
app.get("/new", isLoggedIn, function(req, res){
    res.render("new");
});

//CREATE ROUTE
app.post("/home", isLoggedIn, function(req, res){
    //Create a new user setup and save to mongoDB
    setup.create(req.body.setup, function(err, newlyCreated){  //Config
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
app.get("/home/:id",isLoggedIn, function(req, res){
   User.findById(req.params.id, function(err, foundUser){
       if(err){
           res.send("There was an error if you tried to reach user specific Homepage!");
           console.log(err);
       }else{
           res.render("show", {User: foundUser});
       }
   });
});

//EDIT ROUTE
app.get("/home/:id/edit",isLoggedIn, function(req, res){
    setup.findById(req.params.id, function(err, foundConfig){
        if(err){
            res.redirect("/home");
        }else{
            res.render("edit", {setup: foundConfig});
        }
    })
});

//UPDATE ROUTE
app.put("/home/:id", isLoggedIn, function(req, res){
    setup.findByIdAndUpdate(req.params.id, req.body.config, function(err, updateConfig){ //findByIdAndUpdate(id, new data, callback)
        if(err){
            res.send("There is an error!")
        }else{
            res.redirect("/home/" + req.params.id);
        }
    });
});

//DELETE ROUTE
app.delete("/home/:id", isLoggedIn, function(req,res){
    setup.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/home");
        }else{
            res.redirect("/home");
        }
    });
});

//USERID --NOT IN USE
/* app.get("/userid", function(req, res){
    User.find({}, function(err, foundUser){
        if(err){
            res.redirect("/home");
        }else{
            console.log(foundUser);
            res.render("userid", {User: foundUser});
        }
    });
}); */

/* 
User.findById("5f287b5d8cbe135ef02eeff1", function(err, foundUser){
    if(err){
        console.log(err);
    }else{
        console.log("userid: ", foundUser );
    }
});
User.find({username: "Savage"}, function(error, res){
    console.log(res);
}); */

//==========
//AUTH ROUTES
//==========

//show register form
app.get("/register", function(req,res){
    res.render("register");
});

//handle sign up logic
app.post("/register", function(req, res){
    var newUser = new User({username:req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/new");
        });
    });
});

//HANDLING LOGIN LOGIC
app.get("/login", function(req, res){
    res.render("login");
});

app.post("/login", passport.authenticate("local",
    {
        successRedirect: "/home/:id",
        failureRedirect: "/login",
    }), function(req,res){
        //Itt kell bekérnünk a username-hez tartozó Id-t
});

//LOGOUT ROUTE
app.get("/logout", function(req,res){
    req.logout("/landing");
    res.redirect("/");
});

//function

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

//SERVER START
app.listen("5500", "127.0.0.1", function(){
    console.log("The HomePageMe server has started!");
});