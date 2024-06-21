const router = require("express").Router();
const postsController = require("../controllers/postsController");
const requireUser = require("../middlewares/requireUser");

router.get("/:postId", requireUser, postsController.getPostController);
router.post("/", requireUser, postsController.createPostController);
router.post("/like", requireUser, postsController.likeAndUnlikePost);
router.post("/comments", requireUser, postsController.createCommentController);
router.get("/comments/:postId", requireUser, postsController.getCommentsByPost);
router.put("/", requireUser, postsController.updatePostController);
router.delete("/:postId", requireUser, postsController.deletePost);

module.exports = router;
