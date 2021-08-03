const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const app = express();
const port = process.env.PORT || 3000;

require("./utils/db");
const Tanaman = require("./model/tanaman");

// View engine setup
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// konfigurasi flash
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: {
      expires: new Date(Date.now() + 60 * 60000),
    },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

let sess;

app.get("/", function (req, res) {
  sess = req.session;
  if (sess.loggedin) {
    return res.redirect("/dashboard");
  }
  res.render("login", {
    belumLogin: req.flash("msg"),
    out: req.flash("out"),
  });
});

app.get("/dashboard", async (req, res) => {
  sess = req.session;
  const tanamans = await Tanaman.find();
  if (sess.loggedin || req.query.add || req.query.hapus || req.query.ubah) {
    sess.loggedin = true;
    res.render("dashboard", {
      tanamans,
      msg: req.flash("msg"),
    });
  } else {
    req.flash("msg", "Anda harus login terlebih dahulu!");
    res.redirect("/");
  }
});

app.post("/dashboard", (req, res) => {
  sess = req.session;
  Tanaman.insertMany(req.body, (error, result) => {
    req.flash("msg", "Data berhasil ditambah!");
    res.redirect("/dashboard?add=true");
  });
});

app.get("/hapus/:kode", async (req, res) => {
  const tanaman = await Tanaman.findOne({ kode: req.params.kode });
  if (!tanaman) {
    res.status(404);
    res.send("<h1>404</h4>");
  } else {
    Tanaman.deleteOne({ _id: tanaman._id }).then((result) => {
      req.flash("msg", "Data berhasil dihapus!");
      res.redirect("/dashboard?hapus=true");
    });
  }
});

app.get("/ubah/:kode", async (req, res) => {
  const tanaman = await Tanaman.findOne({ kode: req.params.kode });
  console.log(tanaman);
  res.render("ubah-tanaman", {
    tanaman,
  });
});

app.post("/ubah/update", (req, res) => {
  Tanaman.updateOne(
    { _id: req.body._id },
    {
      $set: {
        kode: req.body.kode,
        nama: req.body.nama,
        keterangan: req.body.keterangan,
      },
    }
  ).then((result) => {
    req.flash("msg", "Data berhasil diubah!");
    res.redirect("/dashboard?ubah=true");
  });
});

app.post("/", (req, res) => {
  sess = req.session;
  const username = req.body.username;
  const password = req.body.password;

  if (username === "taufik") {
    if (password === "hidayat") {
      sess.username = username;
      sess.password = password;
      sess.loggedin = true;
      res.redirect("/dashboard");
    } else {
      req.flash("msg", "Password salah!");
      res.render("login", {
        msg: req.flash("msg"),
      });
    }
  } else {
    console.log("Username salah");
    req.flash("msg", "Username salah!");
    res.render("login", {
      msg: req.flash("msg"),
    });
  }
});

app.get("/add", (req, res) => {
  sess = req.session;
  sess.loggedin = true;
  res.render("add-tanaman");
});

app.get("/logout", (req, res) => {
  res.redirect("/");
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
  });
});

app.use("/", (req, res) => {
  res.status(404);
  res.send("<h1>404</h1>");
});

app.listen(port, function (err) {
  if (err) console.log(err);
  console.log("Server listening on PORT", port);
});
