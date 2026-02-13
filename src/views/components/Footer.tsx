export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer class="footer">
      <div class="container">
        <p>&copy; {currentYear} oneamlog. All rights reserved.</p>
        <p class="footer-tech">Built with Hono + Supabase + Cloudflare Workers</p>
      </div>
    </footer>
  );
}
