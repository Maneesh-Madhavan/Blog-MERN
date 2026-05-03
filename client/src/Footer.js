export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">Insight.</div>
        <div className="footer-links" style={{ marginTop: "8px", fontSize: "0.9rem", color: "var(--text-tertiary)" }}>
          <span>© {new Date().getFullYear()} Insight. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
