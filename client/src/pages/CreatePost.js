import { useState } from "react";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
import { Navigate } from "react-router-dom";
import { useToast } from "../Toast";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

export default function CreatePost() {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [files, setFiles] = useState(null);
  const [preview, setPreview] = useState(null);
  const [redirect, setRedirect] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  function handleFileChange(e) {
    const file = e.target.files[0];
    setFiles(e.target.files);
    if (file) setPreview(URL.createObjectURL(file));
  }

  async function createNewPost(e) {
    e.preventDefault();
    setLoading(true);

    const content = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    const data = new FormData();
    data.set("title", title);
    data.set("summary", summary);
    data.set("content", content);
    if (files?.[0]) data.set("file", files[0]);

    try {
      const baseUrl = process.env.REACT_APP_API_URL.replace(/\/$/, "");
      const response = await fetch(`${baseUrl}/post`, {
        method: "POST",
        body: data,
        credentials: "include",
      });

      if (response.ok) {
        addToast("Post published successfully!", "success");
        setRedirect(true);
      } else {
        addToast("Failed to create post", "error");
      }
    } catch {
      addToast("Network error. Please try again.", "error");
    }
    setLoading(false);
  }

  if (redirect) return <Navigate to="/" />;

  return (
    <div className="container editor-page">
      <form className="editor-form fade-in" onSubmit={createNewPost}>
      <h1>Create Post</h1>

      <label>Title</label>
      <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Post title" required />

      <label>Summary</label>
      <input type="text" value={summary} onChange={e => setSummary(e.target.value)} placeholder="Short summary" required />

      <label>Cover Image</label>
      <input type="file" accept="image/*" onChange={handleFileChange} />

      {preview && (
        <div className="preview-wrapper">
          <div className="preview-card">
            <h4>Preview</h4>
            <div className="post preview-post">
              <div className="image"><img src={preview} alt="preview" /></div>
              <div className="texts">
                <h2>{title || "Post title"}</h2>
                <p className="summary">{summary || "Post summary will appear here"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <label>Content</label>
      <div className="editor-box">
        <Editor
          editorState={editorState}
          onEditorStateChange={setEditorState}
          editorStyle={{ minHeight: 200, padding: 10 }}
          toolbar={{ options: ["inline", "blockType", "list", "textAlign", "history", "link"] }}
        />
      </div>

      <button disabled={loading}>{loading ? "Publishing…" : "Publish Post"}</button>
      </form>
    </div>
  );
}
