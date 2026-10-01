(() => {
  try {
    const mode = localStorage.getItem('mui-mode') || 'system';
    const dark = localStorage.getItem('mui-color-scheme-dark') || 'dark';
    const light = localStorage.getItem('mui-color-scheme-light') || 'light';
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const scheme = mode === 'dark' || (mode === 'system' && systemDark) ? dark : light;
    const root = document.documentElement;
    root.removeAttribute(`data-${light}`);
    root.removeAttribute(`data-${dark}`);
    root.setAttribute(`data-${scheme}`, '');
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', scheme === dark ? '#101216' : '#F1F2F4');
    }
  } catch {}
})();
