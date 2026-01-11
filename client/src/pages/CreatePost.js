import { useState } from "react";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
import { Navigate } from "react-router-dom";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

export default function CreatePost() {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [files, setFiles] = useState(null);
  const [redirect, setRedirect] = useState(false);

  async function createNewPost(ev) {
    ev.preventDefault();

    const content = draftToHtml(
      convertToRaw(editorState.getCurrentContent())
    );

    const data = new FormData();
    data.set("title", title);
    data.set("summary", summary);
    data.set("content", content);
    if (files?.[0]) data.set("file", files[0]);

    const response = await fetch("http://localhost:4000/post", {
      method: "POST",
      body: data,
      credentials: "include",
    });

    if (response.ok) {
      setRedirect(true);
    }
  }

  if (redirect) {
    return <Navigate to="/" />;
  }

  return (
    <form onSubmit={createNewPost} style={{ maxWidth: 800, margin: "auto" }}>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        style={{ display: "block", width: "100%", marginBottom: 10 }}
      />

      <input
        type="text"
        placeholder="Summary"
        value={summary}
        onChange={e => setSummary(e.target.value)}
        style={{ display: "block", width: "100%", marginBottom: 10 }}
      />

      <input
        type="file"
        onChange={e => setFiles(e.target.files)}
        style={{ marginBottom: 10 }}
      />

      <div style={{ border: "1px solid #ccc", minHeight: 200 }}>
        <Editor
          editorState={editorState}
          onEditorStateChange={setEditorState}
          toolbar={{
            options: ["inline", "blockType", "list", "textAlign", "history", "link"],
            inline: { options: ["bold", "italic", "underline", "strikethrough"] },
            blockType: { options: ["Normal", "H1", "H2", "H3"] },
            list: { options: ["unordered", "ordered"] },
            textAlign: { options: ["left", "center", "right", "justify"] },
            history: { options: ["undo", "redo"] },
          }}
        />
      </div>

      <button style={{ marginTop: 10 }}>Create Post</button>
    </form>
  );
}
