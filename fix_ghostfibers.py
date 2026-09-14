import os

html_path = 'index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# I will replace the script tag injected earlier.
old_script = """  <script type="module">
    import { initGhostFibers } from './js/ghost-fibers.js';
    const container = document.querySelector('.hero');
    if (container) {
      container.style.position = 'relative';
      container.style.overflow = 'hidden';
      // We create a specific bg div because the hero might have padding that affects canvas layout
      const bg = document.createElement('div');
      bg.style.position = 'absolute';
      bg.style.top = '0';
      bg.style.left = '0';
      bg.style.width = '100%';
      bg.style.height = '100%';
      bg.style.zIndex = '0'; // Behind content
      container.insertBefore(bg, container.firstChild);
      
      // Make sure other hero children are above the canvas
      Array.from(container.children).forEach(child => {
        if (child !== bg) {
          child.style.position = 'relative';
          child.style.zIndex = '1';
        }
      });

      initGhostFibers(bg, {
        lineColor: "#a8185b",
        glowColor: "#a03480",
        speed: 0.2,
        scale: 2,
        rotation: 0,
        rotationSpeed: 0.25,
        layers: 4,
        waveAmplitude: 0.015,
        waveFrequency: 3,
        waveSpeed: 0.15,
        layerSpeed: 0.08,
        twist: 0.1,
        twistFrequency: 5,
        twistSpeed: 1.2,
        lineFrequency: 5,
        lineSpacing: 2,
        lineSharpness: 16,
        glowFalloff: 10,
        glowIntensity: 1.6,
        brightness: 2,
        blueBoost: 1.25,
        vignette: 0.8,
        grain: 0.05,
        dpr: window.devicePixelRatio || 1
      });
    }
  </script>"""

new_script = """  <script type="module">
    import { initGhostFibers } from './js/ghost-fibers.js';
    const bg = document.querySelector('.hero-bg');
    if (bg) {
      // The hero-bg is already position: absolute; inset: 0; z-index: 0;
      initGhostFibers(bg, {
        lineColor: "#a8185b",
        glowColor: "#a03480",
        speed: 0.2,
        scale: 2,
        rotation: 0,
        rotationSpeed: 0.25,
        layers: 4,
        waveAmplitude: 0.015,
        waveFrequency: 3,
        waveSpeed: 0.15,
        layerSpeed: 0.08,
        twist: 0.1,
        twistFrequency: 5,
        twistSpeed: 1.2,
        lineFrequency: 5,
        lineSpacing: 2,
        lineSharpness: 16,
        glowFalloff: 10,
        glowIntensity: 1.6,
        brightness: 2,
        blueBoost: 1.25,
        vignette: 0.8,
        grain: 0.05,
        dpr: window.devicePixelRatio || 1
      });
    }
  </script>"""

if old_script in html:
    html = html.replace(old_script, new_script)
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print("Fixed script tag in index.html")
else:
    print("Could not find the old script tag to replace.")
