interface ImageMetadata {
  default: {
    src: string;
    width: number;
    height: number;
    format: string;
  };
}

const imageModules = import.meta.glob<ImageMetadata>(
  '../assets/**/*.{png,jpg,jpeg,webp,avif}',
  { eager: true }
);

function normalizePath(path: string): string {
  let normalized = path.startsWith('/') ? path.slice(1) : path;
  normalized = normalized.replace(/\?.*$/, '').replace(/#.*$/, '');
  return normalized;
}

export function getImage(path: string): ImageMetadata['default'] | null {
  if (!path) return null;

  const normalized = normalizePath(path);
  const moduleKey = `../assets/${normalized}`;

  const mod = imageModules[moduleKey];
  if (mod) {
    return mod.default;
  }

  console.warn(`Image not found: ${path} (looked up as ${moduleKey})`);
  return null;
}

export function getImageSrc(path: string): string {
  const image = getImage(path);
  return image?.src ?? path;
}
