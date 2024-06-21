import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { axiosClient } from "../../utils/axiosClient";
import "./UpdatePost.scss";

function UpdatePost() {
  const [img, setImg] = useState("");
  const [caption, setCaption] = useState("");
  const params = useParams();

  useEffect(async () => {
    const response = await axiosClient.get(`posts/${params.postId}`);
    console.log("response: ", response.result);
    setCaption(response?.result?.caption);
    setImg(response?.result?.image.url);
  }, []);

  async function handlePostUpdate(e) {
    e.preventDefault();
    const response = await axiosClient.put("posts/", {
      postId: params.postId,
      caption,
    });
  }
  return (
    <div className="updatePost">
      <div className="post-container">
        <div className="img-container">
          <img className="post-img" src={img} alt="post-img" />
        </div>
        <div className="bottom-part">
          <input
            value={caption}
            type="text"
            className="captionInput"
            placeholder="What's on your mind?"
            onChange={(e) => setCaption(e.target.value)}
          />
          <button className="post-btn btn-primary" onClick={handlePostUpdate}>
            Update
          </button>
        </div>
      </div>
    </div>
  );
}

export default UpdatePost;
