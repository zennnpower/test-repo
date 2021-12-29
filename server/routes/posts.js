const express = require("express")
const router = express.Router()
const Post = require("../models/Post")
const auth = require("../middleware/auth")
const formidable = require("formidable")

// GET ALL POSTS
router.get("/", async(req, res) => {
    try {
        let posts = await Post.find({});
        return res.json(posts);
    } catch(e) {
        return res.json({e, msg: "Something went wrong... We could not retreive the list of posts!"});
    }
})

// GET 10 RECENT POSTS
router.get("/recents", async(req, res) => {
    try {
        let recentPosts = await Post.find().sort({_id:-1}).limit(10)
        return res.json(recentPosts)
    } catch(e) {
        return res.json({e, msg: "Something went wrong... We could not retreive any recent posts!"})
    }
})

// GET YOUR OWN POSTS
router.get("/myposts", auth, async (req, res) => {
    try {
        let posts = await Post.find({ author: req.user.id }).sort({_id:-1})
        return res.json(posts);
    } catch(err) {
        return res.json({msg: "No posts found!"});
    }
});

// GET SINGLE POST
router.get("/:id", async(req, res) => {
    try {
        let post = await Post.findById(req.params.id)
        return res.json(post)
    } catch(e) {
        return res.json({msg: "The post does not exist!"})
    }
})

// ADD POST
router.post("/", auth, async (req, res) => {
    const form = new formidable.IncomingForm()
    form.parse(req, (e, fields) => {
        if (fields.title.replace(" ", "").length < 1 || fields.title === "undefined") return res.json({msg: "Please give a title for your discussion!"})
        if (fields.description.replace(" ", "").length < 1 || fields.description === "undefined") return res.json({msg: "Please give a description for your discussion!"})
        if (e) return res.json({msg: "Something went wrong... The post could not be uploaded!"})

        const post = new Post(fields)
        post.save()
        return res.json({msg: "Post uploaded!", post})
    })
})

// DELETE POST
router.delete("/:id", auth, async(req, res) => {
    try {
        let post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.json({msg: "No such post exists!"});
        }

        if (post.author !== req.user.username) {
            return res.json({msg: "Hey, you're not authorised to do this!"});
        }

        await post.remove();

        return res.json({msg: "Post deleted!"});
    } catch(err) {
        return res.json({msg: "Something went wrong... The post could not be deleted!"});
    }
})

// EDIT POST
router.put("/:id", auth, async(req, res) => {
    try {
        let post = await Post.findById(req.params.id);

        if (!post) {
            return res.json({msg: "No such post exists!"});
        }

        if (post.author !== req.user.username) {
            return res.json({msg: "Hey, you're not authorised to do this!"});
        }

        const form = new formidable.IncomingForm()

        form.parse(req, async (e, fields) => {
            let updatedPost = fields

            if (updatedPost.title.replace(" ", "").length < 1) return res.json({msg: "Please give a title for your discussion!"})
            if (updatedPost.description.replace(" ", "").length < 1) return res.json({msg: "Please give a description for your discussion!"})
            if (e) return res.json({msg: "Something went wrong... The post could not be updated!"})
    
            post = await Post.findByIdAndUpdate(req.params.id, updatedPost);

            return res.json({msg: "Post updated!", post})
        })
    } catch(err) {
        return res.json({msg: "Something went wrong... The post could not be updated!"});
    }
})

module.exports = router;