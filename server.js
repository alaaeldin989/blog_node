// to use .env file 
require("dotenv").config();

//express framwork
const express = require("express");
const app = express();
// this can get data from your Form 
app.use(express.urlencoded({ extended: true }));
//express framwork

// to use put and delete in my form because is working just post or get 
const methodOverride = require("method-override");
app.use(methodOverride("_method"));

// import my model 
const BlogModel = require("./models/blogsModel");
// defin mongoose to connect with monogoDB 
const mongoose = require("mongoose");

// =====================================================================================================>

// image added
const multer = require("multer");
const path = require("path");
const fs = require("fs");
app.use(express.static("public"));
// image added

// إعداد مكان تخزين الصورة
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads"); // يخزن الصور هنا
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // اسم الصورة الجديد
  },
});

const upload = multer({ storage: storage });

// لازم تخلي Express يقرأ ملفات static
app.use(express.static("public"));


// =====================================================================================================>

// Connect with mongoDB  
mongoose
  .connect(
    "mongodb+srv://alaamohamed122:alaa2004@cluster0.9axzpf1.mongodb.net/blogDB?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Connected Successfull");
  })
  .catch((error) => {
    console.log(`connect faild ${error}`);
  });

app.get("/", async (req, res) => {
  const allBlog = await BlogModel.find();
  res.render("home.ejs", { blogs: allBlog });
});

// Connect with mongoDB  

// =====================================================================================================>

// add blog 
app.post("/addBlog", upload.single("image"), async (req, res) => {
  const newBlog = new BlogModel({
    title: req.body.title,
    body: req.body.body,
    image: req.file ? "/uploads/" + req.file.filename : null, // مسار الصورة
    date: new Date(),
  });

  await newBlog.save();
  res.redirect("/");
});

// add blog 

// =====================================================================================================>

// show all blog api 
app.get("/allBlog", async (req, res) => {
  const allBlog = await BlogModel.find();
  res.json(allBlog);
});
// show all blog api 

// =====================================================================================================>
// delete blog 
app.delete("/deleteBlog/:id", async (req, res) => {
  try {
    const blog = await BlogModel.findById(req.params.id);
    if (!blog) return res.status(404).send("Blog not found");

    // Delete image file if exists
    if (blog.image) {
      const imagePath = path.join(
        __dirname,
        "public",
        blog.image.replace("/uploads/", "uploads/")
      );
      fs.unlink(imagePath, (err) => {
        // Ignore error if file doesn't exist
      });
    }

    await BlogModel.findByIdAndDelete(req.params.id);
    res.status(200).send("Deleted");
  } catch (error) {
    res.status(500).send("Error deleting blog");
  }
});

// delete blog 
// =====================================================================================================>

// Route to render the edit form for a blog
app.get("/editBlog/:id", async (req, res) => {
  try {
    const blog = await BlogModel.findById(req.params.id);
    if (!blog) return res.status(404).send("Blog not found");
    res.render("editBlog.ejs", { blog });
  } catch (error) {
    res.status(500).send("Error fetching blog");
  }
});

// Route to handle the update (edit) of a blog
app.put("/editBlog/:id", upload.single("image"), async (req, res) => {
  try {
    const updateData = {
      title: req.body.title,
      body: req.body.body,
    };
    if (req.file) {
      updateData.image = "/uploads/" + req.file.filename;
    }
    await BlogModel.findByIdAndUpdate(req.params.id, updateData);
    res.redirect("/");
  } catch (error) {
    res.status(500).send("Error updating blog");
  }
});



// run project in port  
app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
