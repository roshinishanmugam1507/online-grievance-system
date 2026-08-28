import $ from 'jquery';

/**
 * jQuery utility functions for smooth scrolling, modal triggers, and animations
 * strictly conforming to React best practices (no conflicting state mutations).
 */
export const smoothScrollTo = (targetSelector, duration = 400) => {
  try {
    const $target = $(targetSelector);
    if ($target.length) {
      $('html, body').animate(
        {
          scrollTop: $target.offset().top - 80
        },
        duration
      );
    }
  } catch (e) {
    console.warn("jQuery smoothScroll error:", e);
  }
};

export const flashElementHighlight = (selector, color = '#fef08a') => {
  try {
    const $el = $(selector);
    if ($el.length) {
      const origBg = $el.css('backgroundColor');
      $el.css('backgroundColor', color);
      setTimeout(() => {
        $el.css('backgroundColor', origBg);
      }, 1200);
    }
  } catch (e) {
    console.warn("jQuery highlight error:", e);
  }
};
