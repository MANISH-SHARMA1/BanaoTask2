import React, { useState } from "react";
import "./Posts.scss";
import Avatar from "../avatar/Avatar";
import backgroundImg from "../../assets/background.jpg";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { FaRegComment, FaEllipsisVertical } from "react-icons/fa6";
import { useDispatch } from "react-redux";
import { likeAndUnlikePost } from "../../redux/slices/postsSlice";
import { useNavigate } from "react-router-dom";
import { axiosClient } from "../../utils/axiosClient";

function Posts({ post }) {
  const [comment, setComment] = useState("");
  const [showComment, setShowComment] = useState(false);
  const [toggleMenu, setToggleMenu] = useState(false);
  const [allComments, setAllComments] = useState([]);

  console.log("postId: ", post._id);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function handlePostLiked() {
    dispatch(
      likeAndUnlikePost({
        postId: post?._id,
      })
    );
  }

  async function handleCommentSubmit() {
    try {
      await axiosClient.post("posts/comments", {
        postId: post._id,
        text: comment,
      });
      setComment("");
    } catch (error) {
      console.log(error);
    }
  }

  async function getComments() {
    try {
      const response = await axiosClient.get(`posts/comments/${post._id}`);
      setAllComments(response.result);
    } catch (error) {
      console.log(error);
    }
  }

  async function deletePost() {
    try {
      const response = await axiosClient.delete(`posts/${post._id}`);
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  }

  async function updatePost() {
    navigate(`/updatePost/${post._id}`);
  }

  return (
    <div className="Post">
      <div className="header">
        <div
          className="heading"
          onClick={() => navigate(`/profile/${post?.owner?._id}`)}
        >
          <Avatar src={post?.owner?.avatar?.url} />
          <h4>{post.owner?.name}</h4>
        </div>
        <div className="ellipsis-container">
          <FaEllipsisVertical onClick={() => setToggleMenu(!toggleMenu)} />
          {toggleMenu && (
            <div className="menu">
              <div className="menu-option" onClick={updatePost}>
                Update
              </div>
              <div className="menu-option" onClick={deletePost}>
                Delete
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="content">
        <img src={post?.image?.url} alt={post?.caption} />
      </div>

      <div className="footer">
        <div className="like-comment">
          <div className="like" onClick={handlePostLiked}>
            {post?.isLiked ? (
              <AiFillHeart style={{ color: "red" }} className="icon" />
            ) : (
              <AiOutlineHeart className="icon" />
            )}
          </div>
          <div onClick={() => setShowComment(!showComment)}>
            <FaRegComment className="comment" onClick={getComments} />
          </div>
        </div>
        <h4>{`${post?.likesCount} likes`}</h4>
        <p className="caption">{post?.caption}</p>
        <h6 className="time-ago">{post?.timeAgo}</h6>
        {showComment && (
          <>
            {allComments.map((comment) => (
              <div key={comment._id} className="show-comment">
                <h5>{comment.author.name}</h5>
                <p>{comment.text}</p>
              </div>
            ))}
          </>
        )}
        <div className="add-comment">
          <input
            type="text"
            placeholder="Add a comment..."
            className="comment-input"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <p className="post" onClick={handleCommentSubmit}>
            Post
          </p>
        </div>
      </div>
    </div>
  );
}

export default Posts;
