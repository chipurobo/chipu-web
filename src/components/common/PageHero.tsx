import { ReactNode } from 'react';

interface PageHeroProps {
 /** Eyebrow line above the title — e.g. "// programs" or "[ team ]" */
 eyebrow?: ReactNode;
 /** Main heading. Receives `.heading-display` (Press Start 2P pixel) styling. */
 title: ReactNode;
 /** Optional subtitle. Rendered in OpenDyslexic body. */
 subtitle?: ReactNode;
 /** Optional content slot (CTAs, badges, search, etc.) shown below the subtitle. */
 children?: ReactNode;
 /** Optional pretitle node (icon, image, etc.) shown above the eyebrow. */
 preTitle?: ReactNode;
}

/**
 * Editorial cream hero matching tnkr.ai's layout. Cream/warm-50 bg
 * with a faded code-bg overlay, big pixel headline, and OpenDyslexic
 * subtitle. Replaces the old `bg-gradient-to-br from-gray-900 ...` dark
 * heroes used across pages, unifying the visual language site-wide.
 */
const PageHero = ({ eyebrow, title, subtitle, children, preTitle }: PageHeroProps) => {
 return (
 <section className="relative overflow-hidden bg-warm-50 ">
 <div className="code-bg absolute inset-0 opacity-30 " aria-hidden="true" />
 <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-16 sm:pt-20 sm:pb-20 text-center">
 {preTitle && <div className="flex justify-center mb-6">{preTitle}</div>}
 {eyebrow && (
 <p className="font-pixel text-[0.55rem] sm:text-[0.65rem] tracking-[0.25em] text-terracotta-600 mb-5 uppercase">
 {eyebrow}
 </p>
 )}
 <h1 className="heading-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-6 leading-[1.2]">
 {title}
 </h1>
 {subtitle && (
 <p className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
 {subtitle}
 </p>
 )}
 {children && <div className="mt-8">{children}</div>}
 </div>
 {/* Hairline divider — tnkr-style section separator */}
 <div className="border-t border-warm-200 " aria-hidden="true" />
 </section>
 );
};

export default PageHero;
