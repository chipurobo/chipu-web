import { ImgHTMLAttributes } from 'react';

interface SmartImageProps extends ImgHTMLAttributes<HTMLImageElement> {
 /**
 * The src for the JPG/PNG fallback. The component will look for a
 * sibling `.webp` file at the same path (e.g. `/img/foo.jpg` →
 * `/img/foo.webp`) and serve that to browsers that support it.
 */
 src: string;
 /** Alt text — required for accessibility. */
 alt: string;
 /** Native pixel width of the source image (helps the browser reserve space → less CLS). */
 width?: number;
 /** Native pixel height. */
 height?: number;
 /** Defaults to "lazy" — pass "eager" for above-the-fold images. */
 loading?: 'lazy' | 'eager';
}

/**
 * Renders a `<picture>` with a WebP source + JPG/PNG fallback. Adds
 * width/height + loading="lazy" by default to reduce CLS and avoid
 * downloading off-screen images on initial paint.
 */
const SmartImage = ({
 src,
 alt,
 width,
 height,
 loading = 'lazy',
 ...rest
}: SmartImageProps) => {
 // Derive the .webp path from the source path
 const webpSrc = src.replace(/\.(jpe?g|png|JPG|JPEG|PNG)$/i, '.webp');
 const hasWebp = webpSrc !== src;

 return (
 <picture>
 {hasWebp && <source srcSet={webpSrc} type="image/webp" />}
 <img
 src={src}
 alt={alt}
 width={width}
 height={height}
 loading={loading}
 decoding="async"
 {...rest}
 />
 </picture>
 );
};

export default SmartImage;
