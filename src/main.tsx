  import React from "react";
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";

  // Cleanup any lingering portal elements from ChatbotButton
  // Remove any elements that look like the chatbot button
  const cleanupLingeringElements = () => {
    // Method 1: Remove by style attributes
    document.querySelectorAll('div').forEach((el: Element) => {
      const htmlEl = el as HTMLElement;
      const style = htmlEl.getAttribute('style') || '';
      const computedStyle = window.getComputedStyle(htmlEl);
      
      // Check if it has fixed positioning at bottom-right
      const isFixedAtBottomRight = computedStyle.position === 'fixed' && 
        ((style.includes('bottom') && style.includes('right')) || 
         style.includes('zIndex: 99999') ||
         computedStyle.zIndex === '99999');
      
      if (isFixedAtBottomRight) {
        // Check if it looks like chatbot button (has SVG icon or HEALWELL text)
        if (htmlEl.querySelector('svg') || htmlEl.textContent?.includes('HEALWELL') || htmlEl.querySelector('[aria-label*="Chat"]')) {
          htmlEl.remove();
          return;
        }
      }
    });
    
    // Method 2: Remove by class names that match chatbot button
    document.querySelectorAll('[class*="fixed"][class*="bottom"][class*="right"]').forEach((el: Element) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.querySelector('svg') || htmlEl.textContent?.includes('HEALWELL')) {
        htmlEl.remove();
      }
    });

    // Method 3: Remove any fixed elements at bottom-right corner with high z-index
    document.querySelectorAll('div[style*="position: fixed"]').forEach((el: Element) => {
      const htmlEl = el as HTMLElement;
      const rect = htmlEl.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Check if element is in bottom-right corner (within 100px)
      if (rect.right > viewportWidth - 100 && rect.bottom > viewportHeight - 100) {
        if (htmlEl.querySelector('svg') || htmlEl.textContent?.includes('HEALWELL')) {
          htmlEl.remove();
        }
      }
    });

    // Method 4: Remove elements with the ping animation class (chatbot button ping ring)
    document.querySelectorAll('.animate-ping, [class*="animate-ping"]').forEach((el: Element) => {
      const htmlEl = el as HTMLElement;
      const classes = htmlEl.className || '';
      if (classes.includes('animate-ping') && 
          classes.includes('bg-emerald-400') && 
          classes.includes('rounded-full')) {
        htmlEl.remove();
      }
    });

    // Method 5: Remove any element with specific ping animation classes
    document.querySelectorAll('span[class*="absolute"][class*="inset-0"][class*="rounded-full"][class*="bg-emerald-400"][class*="opacity-20"][class*="animate-ping"]').forEach((el: Element) => {
      el.remove();
    });

    // Method 6: Remove parent elements containing ping animation
    document.querySelectorAll('*').forEach((el: Element) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.querySelector('span.animate-ping, span[class*="animate-ping"]')) {
        const pingElement = htmlEl.querySelector('span.animate-ping, span[class*="animate-ping"]');
        if (pingElement) {
          const classes = pingElement.className || '';
          if (classes.includes('bg-emerald-400') && classes.includes('rounded-full')) {
            // Remove the entire parent container if it looks like chatbot button
            if (htmlEl.querySelector('svg') || htmlEl.textContent?.includes('HEALWELL')) {
              htmlEl.remove();
            } else {
              // Just remove the ping element
              pingElement.remove();
            }
          }
        }
      }
    });
  };

  const rootElement = document.getElementById("root");
  if (rootElement) {
    createRoot(rootElement).render(<App />);
  } else {
    console.error('Root element not found');
  }

  // Run cleanup AFTER React has fully initialized and rendered
  // Wait for next tick to ensure React components are mounted
  // DISABLED: This was removing the chatbot button, so cleanup is now disabled
  // requestAnimationFrame(() => {
  //   setTimeout(() => {
  //     cleanupLingeringElements();
      
  //     // Run cleanup at intervals to catch any lingering elements
  //     setTimeout(cleanupLingeringElements, 500);
  //     setTimeout(cleanupLingeringElements, 1000);
  //     setTimeout(cleanupLingeringElements, 2000);

  //     // Also run cleanup when DOM mutations occur (in case React adds elements)
  //     // But with a debounce to avoid interference with React rendering
  //     let cleanupTimeout: ReturnType<typeof setTimeout>;
  //     const observer = new MutationObserver(() => {
  //       clearTimeout(cleanupTimeout);
  //       cleanupTimeout = setTimeout(() => {
  //         cleanupLingeringElements();
  //       }, 200); // Increased debounce to avoid React interference
  //     });
      
  //     // Only observe after React has rendered
  //     setTimeout(() => {
  //       if (document.body) {
  //         observer.observe(document.body, {
  //           childList: true,
  //           subtree: true
  //         });
  //       }
  //     }, 1000);
  //   }, 100);
  // });

  