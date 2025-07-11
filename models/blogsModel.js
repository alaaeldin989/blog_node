const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blogSchema = new Schema({
    title: String,
    body: String,
    date: {
        type: Date,
        default: Date.now
    },
    image: {
        type: String,
        required: false // or true if you want to make it mandatory
    }
});

const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;
