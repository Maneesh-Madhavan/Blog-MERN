import { Editor } from "react-draft-wysiwyg";
import { EditorState, ContentState, convertToRaw } from "draft-js";
import htmlToDraft from "html-to-draftjs";
import draftToHtml from "draftjs-to-html";
import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

export default function EditPost() {
  const { id } = useParams();

  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [files, setFiles] = useState(null);
  const [redirect, setRedirect] = useState(false);
  const [loading, setLoading] = useState(false); // <-- spinner state

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}post` + id, { credentials: "include" })
      .then(res => res.json())
      .then(postInfo => {
        setTitle(postInfo.title);
        setSummary(postInfo.summary);

        if (postInfo.content) {
          const blocksFromHtml = htmlToDraft(postInfo.content);
          const { contentBlocks, entityMap } = blocksFromHtml;
          const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
          setEditorState(EditorState.createWithContent(contentState));
        }
      });
  }, [id]);

  async function updatePost(ev) {
    ev.preventDefault();
    setLoading(true); // start spinner

    const content = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    const data = new FormData();
    data.set("title", title);
    data.set("summary", summary);
    data.set("content", content);
    if (files?.[0]) data.set("file", files[0]);

    const response = await fetch(`${process.env.REACT_APP_API_URL}post` + id, {
      method: "PUT",
      body: data,
      credentials: "include",
    });

    if (response.ok) {
      setRedirect(true);
    } else {
      setLoading(false); // stop spinner if error
      alert("Failed to update post");
    }
  }

  if (redirect) return <Navigate to={"/post/" + id} />;

  return (
    <form onSubmit={updatePost} style={{ maxWidth: 800, margin: "auto" }}>
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

      <button style={{ marginTop: 10 }} disabled={loading}>
        {loading ? "Updating..." : "Update Post"}
      </button>
    </form>
  );
}
