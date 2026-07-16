/**
 * Shared inline SVG icons (currentColor stroke).
 */
const Icons = (() => {
  const PATHS = {
    crosshair:
      'M12 2v3M12 19v3M2 12h3M19 12h3M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z',
    viewmodel:
      'M3 15l3-2h4l2 2h5l3 2v2H3v-4zM8 13V9l2-2h3',
    hud:
      'M4 4h7v7H4zm9 0h7v4h-7zm0 6h7v10h-7zM4 13h7v7H4z',
    radar:
      'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 12l7-7',
    fps:
      'M4 19V5M4 19h16M8 15l3-5 3 3 4-7',
    binds:
      'M3 7h18v10H3zm4 3h2m2 0h2m2 0h2M7 14h10',
    generator:
      'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
    commands:
      'M5 7l5 5-5 5M12 17h7',
    github:
      'M15 22v-4a4.1 4.1 0 0 0-1-2.9c3.2-.4 6.5-1.6 6.5-7.1A5.5 5.5 0 0 0 19 4.1 5.1 5.1 0 0 0 19 1s-1.2-.3-4 1.5a13.4 13.4 0 0 0-7 0C5.2.7 4 1 4 1a5.1 5.1 0 0 0 0 3.1A5.5 5.5 0 0 0 2.5 8c0 5.5 3.3 6.7 6.5 7.1a4.1 4.1 0 0 0-1 2.9v4M9 18c-4.5 1.5-4.5-2.5-6-3',
  };

  /**
   * @param {string} name
   * @param {{ className?: string }} [options]
   * @returns {SVGSVGElement | null}
   */
  function create(name, options = {}) {
    const d = PATHS[name];
    if (!d) return null;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '1em');
    svg.setAttribute('height', '1em');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add('nav-icon');
    if (options.className) svg.classList.add(options.className);

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    svg.append(path);
    return svg;
  }

  /**
   * Prefixed icon + text label for buttons/links.
   * @param {string} name
   * @param {string} label
   * @returns {DocumentFragment}
   */
  function labeled(name, label) {
    const frag = document.createDocumentFragment();
    const icon = create(name);
    if (icon) frag.append(icon);
    frag.append(document.createTextNode(label));
    return frag;
  }

  /**
   * Prepend icons to `[data-icon]` children inside a nav root.
   * @param {ParentNode | null} root
   */
  function hydrate(root) {
    if (!root) return;
    root.querySelectorAll('[data-icon]').forEach((el) => {
      if (el.querySelector('.nav-icon')) return;
      const icon = create(el.getAttribute('data-icon'));
      if (!icon) return;
      el.prepend(icon);
    });
  }

  return { PATHS, create, labeled, hydrate };
})();
