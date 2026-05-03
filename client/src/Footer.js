import { MdFavorite } from "react-icons/md";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">InsightBlog</div>
        <div style={{ fontSize: ".82rem" }}>
          Crafted with <MdFavorite style={{ verticalAlign: "middle", fontSize: "14px" }} /> for writers & thinkers
        </div>
        <div className="footer-links">
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
