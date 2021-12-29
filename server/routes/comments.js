const express = require("express")
const router = express.Router()
const Post = require("../models/Post")
const Comment = require("../models/Comment")
const auth = require("../middleware/auth")
const formidable = require("formidable")

// GET THE COMMENTS OF A POST
router.get("/:id", async(req, res) => {
    try {
        let post = await Post.findById(req.params.id)
        let comments = post.comments.reverse()

        return res.json(comments)
    } catch(e) {
        return res.json({msg: "Something went wrong... We could not retrieve the comments!"})
    }
})

// GET SINGLE COMMENT
router.get("/single/:id", async(req, res) => {
    try {
        let comment = await Comment.findById(req.params.id)
        
        return res.json(comment)
    } catch(e) {
        return res.json({msg: "Something went wrong... We could not retrieve the comment!"})
    }
})

// ADD COMMENT
router.post("/:id", auth, async(req, res) => {
    try {
        let post = await Post.findById(req.params.id)
        const form = new formidable.IncomingForm()

        form.parse(req, async (e, fields) => {
            let commentData = fields

            if (commentData.description.replace(" ", "") < 1 || commentData.description === "undefined") return res.json({msg: "Please fill in the input field!"})

            const comment = new Comment(fields)
            comment.save()

            post.comments.push(comment._id)
            post.save()

            return res.json({msg: "Comment uploaded!", comment})
        })
    } catch(e) {
        return res.json({msg: "Something went wrong... The comment could not be uploaded!"})
    }
})

// DELETE COMMENT
router.delete("/:id", auth, async(req, res) => {
    try {
        let comment = await Comment.findById(req.params.id)
        
        if (!comment) {
            return res.json({msg: "No such comment exists!"})
        }

        if (comment.author !== req.user.username) {
            return res.json({msg: "Hey, you're not authorised to do this!"})
        }

        comment.deleted = true
        comment.save()

        return res.json({msg: "Comment deleted!"})
    } catch(err) {
        return res.json({msg: "Something went wrong... The comment could not be deleted!"})
    }
})

// EDIT COMMENT
router.put("/:id", auth, async(req, res) => {
    try {
        let comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.json({msg: "No such comment exists!"});
        }

        if (comment.author !== req.user.id) {
            return res.json({msg: "Hey, you're not authorised to do this!"});
        }

        const form = new formidable.IncomingForm()

        form.parse(req, async (e, fields) => {
            let updatedComment = fields

            if (updatedComment.description.replace(" ", "").length < 1 || updatedComment.description === "undefined") return res.json({msg: "Please fill in the input field!"})
            if (e) return res.json({msg: "Something went wrong... The post could not be uploaded!"})
    
            comment = await Comment.findByIdAndUpdate(req.params.id, updatedComment);

            return res.json({msg: "Comment updated!", comment})
        })
    } catch(err) {
        return res.json({msg: "Something went wrong... The comment could not be updated!"});
    }
})

module.exports = router;