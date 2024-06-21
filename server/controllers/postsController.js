const User = require("../models/User");
const Comment = require("../models/comment");
const Post = require("../models/posts");
const { mapPostOutput } = require("../utils/Utils");
const { success, error } = require("../utils/responseWrapper");
const cloudinary = require("cloudinary").v2;

const getPostController = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      res.send(error(400, "id is required"));
    }

    const post = await Post.findById(postId);
    res.send(success(200, post));
  } catch (error) {
    console.log(error);
  }
};

const createPostController = async (req, res) => {
  try {
    const { caption, postImg } = req.body;

    if (!caption || !postImg) {
      return res.send(error(400, "Caption and postImg are required."));
    }

    const cloudImg = await cloudinary.uploader.upload(postImg, {
      folder: "postImg",
    });
    const owner = req._id;

    const user = await User.findById(req._id);

    const post = await Post.create({
      owner,
      caption,
      image: {
        publicId: cloudImg.public_id,
        url: cloudImg.url,
      },
    });

    user.posts.push(post._id);
    await user.save();

    return res.json(success(200, { post }));
  } catch (e) {
    res.send(error(500, e));
  }
};

const likeAndUnlikePost = async (req, res) => {
  try {
    const { postId } = req.body;
    const curUserId = req._id;
    const post = await Post.findById(postId).populate("owner");
    if (!post) {
      return res.send(error(404, "Post not found."));
    }

    if (post.likes.includes(curUserId)) {
      const index = post.likes.indexOf(curUserId);
      post.likes.splice(index, 1);
    } else {
      post.likes.push(curUserId);
    }
    await post.save();
    return res.send(success(200, { post: mapPostOutput(post, req._id) }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const createCommentController = async (req, res) => {
  try {
    const { postId, text } = req.body;
    const author = req._id;

    if (!text || !postId) {
      return res.send(error(400, "Text and postId are required"));
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.send(error(404, "Post not found."));
    }

    const comment = await Comment.create({
      text,
      author,
      postId,
    });

    post.comments.push(comment._id);
    await post.save();

    res.send(success(201, "Commented"));
  } catch (e) {
    res.send(error(400, e));
  }
};

const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      return res.send(error(404, "Provide post Id"));
    }
    const post = await Post.findById(postId).populate({
      path: "comments",
      populate: {
        path: "author",
        select: "name email",
      },
    });

    if (!post) {
      return res.send(error(404, "Post not found"));
    }

    res.send(success(200, post.comments));
  } catch (e) {
    res.send(error(400, e));
  }
};

const updatePostController = async (req, res) => {
  try {
    const { postId, caption } = req.body;
    const curUserId = req._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.send(error(404, "Post not found"));
    }

    if (post.owner.toString() !== curUserId) {
      return res.send(error(403, "Only owners can update their posts."));
    }

    if (caption) {
      post.caption = caption;
    }

    await post.save();

    return res.send(success(200, { post }));
  } catch (e) {
    res.send(error(500, e.message));
  }
};

const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const curUserId = req._id;

    console.log("postId: ", postId);

    const post = await Post.findById(postId);
    const curUser = await User.findById(curUserId);
    if (!post) {
      return res.send(error(404, "Post not found"));
    }

    if (post.owner.toString() !== curUserId) {
      return res.send(error(403, "Only owners can update their posts."));
    }

    const index = curUser.posts.indexOf(postId);
    curUser.posts.splice(index, 1);
    await curUser.save();
    await post.deleteOne();

    return res.send(success(200, "post deleted successfully"));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

module.exports = {
  getPostController,
  createPostController,
  likeAndUnlikePost,
  createCommentController,
  getCommentsByPost,
  updatePostController,
  deletePost,
};
