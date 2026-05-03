import { Editor } from "react-draft-wysiwyg";
import { EditorState, ContentState, convertToRaw } from "draft-js";
import htmlToDraft from "html-to-draftjs";
import draftToHtml from "draftjs-to-html";
import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useToast } from "../Toast";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

export default function EditPost() {
  const { id } = useParams();
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [files, setFiles] = useState(null);
  const [preview, setPreview] = useState(null);
  const [redirect, setRedirect] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const baseUrl = process.env.REACT_APP_API_URL.replace(/\/$/, "");
    fetch(`${baseUrl}/post/${id}`, { credentials: "include" })
      .then(res => res.json())
      .then(post => {
        setTitle(post.title);
        setSummary(post.summary);
        setPreview(post.cover);
        if (post.content) {
          const blocks = htmlToDraft(post.content);
          const contentState = ContentState.createFromBlockArray(blocks.contentBlocks, blocks.entityMap);
          setEditorState(EditorState.createWithContent(contentState));
        }
      });
  }, [id]);

  function handleFileChange(e) {
    const file = e.target.files[0];
    setFiles(e.target.files);
    if (file) setPreview(URL.createObjectURL(file));
  }

  async function updatePost(e) {
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
      const response = await fetch(`${baseUrl}/post/${id}`, {
        method: "PUT",
        body: data,
        credentials: "include",
      });

      if (response.ok) {
        addToast("Post updated successfully!", "success");
        setRedirect(true);
      } else {
        addToast("Failed to update post", "error");
      }
    } catch {
      addToast("Network error. Please try again.", "error");
    }
    setLoading(false);
  }

  if (redirect) return <Navigate to={`/post/${id}`} />;

  return (
    <div className="container editor-page">
      <form className="editor-form fade-in" onSubmit={updatePost}>
      <h1>Edit Post</h1>

      <label>Title</label>
      <input value={title} onChange={e => setTitle(e.target.value)} />

      <label>Summary</label>
      <input value={summary} onChange={e => setSummary(e.target.value)} />

      <label>Cover Image</label>
      <input type="file" accept="image/*" onChange={handleFileChange} />

      {preview && (
        <div className="preview-wrapper">
          <div className="preview-card">
            <h4>Preview</h4>
            <div className="post preview-post">
              <div className="image"><img src={preview} alt="preview" /></div>
              <div className="texts">
                <h2>{title}</h2>
                <p className="summary">{summary}</p>
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
        />
      </div>

      <button disabled={loading}>{loading ? "Updating…" : "Update Post"}</button>
      </form>
    </div>
  );
}
