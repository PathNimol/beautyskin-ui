'use client';

import { useEffect } from 'react';

/** Observe scroll-in animations; re-scan when new `.scroll-animate` nodes mount (e.g. filters). */
export default function ScrollAnimationInit() {
  useEffect(() => {
    const observed = new WeakSet<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
          observed.delete(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -5% 0px' }
    );

    const observeOne = (el: Element) => {
      if (!el.classList.contains('scroll-animate') || el.classList.contains('in-view') || observed.has(el)) {
        return;
      }
      observed.add(el);
      observer.observe(el);
    };

    const watch = (root: Element | Document) => {
      if (root instanceof Document) {
        root.querySelectorAll('.scroll-animate:not(.in-view)').forEach((el) => observeOne(el));
        return;
      }
      observeOne(root);
      root.querySelectorAll('.scroll-animate:not(.in-view)').forEach((el) => observeOne(el));
    };

    watch(document);

    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) watch(node);
        });
      }
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}
