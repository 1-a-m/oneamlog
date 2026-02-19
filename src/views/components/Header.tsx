export function Header() {
  return (
    <header class="header">
      <div class="container">
        <div class="header-content">
          <a href="/" class="logo">oneamlog</a>
          <button class="nav-toggle" id="navToggle" aria-label="メニューを開く" aria-expanded="false">
            <span class="nav-toggle-bar"></span>
            <span class="nav-toggle-bar"></span>
            <span class="nav-toggle-bar"></span>
          </button>
          <nav class="nav" id="nav">
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a href="/work">Work</a>
            <a href="/blog">Blog</a>
            <a href="/times">Times</a>
            <a href="/contact">Contact</a>
          </nav>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{
        __html: `
          const toggle = document.getElementById('navToggle');
          const nav = document.getElementById('nav');
          toggle.addEventListener('click', () => {
            const isOpen = nav.classList.toggle('nav-open');
            toggle.classList.toggle('nav-toggle-open', isOpen);
            toggle.setAttribute('aria-expanded', String(isOpen));
          });
        `
      }} />
    </header>
  );
}
