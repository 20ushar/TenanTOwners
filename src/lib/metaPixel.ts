type MetaPixelParameters = Record<string, string | number | boolean | string[]>;

type FacebookPixelFunction = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    fbq?: FacebookPixelFunction;
    _fbq?: FacebookPixelFunction;
  }
}

const pixelId = import.meta.env.VITE_META_PIXEL_ID?.trim() || '1568105821708997';
let initialized = false;
let lastPageUrl = '';

export function initializeMetaPixel() {
  if (!pixelId || typeof window === 'undefined') return false;
  if (initialized) return true;

  if (!window.fbq) {
    const fbq = function (...args: unknown[]) {
      if (fbq.callMethod) {
        fbq.callMethod(...args);
      } else {
        fbq.queue.push(args);
      }
    } as FacebookPixelFunction;

    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = '2.0';
    window.fbq = fbq;
    window._fbq = fbq;

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);
  }

  window.fbq?.('init', pixelId);
  initialized = true;
  return true;
}

export function trackPageView(pageUrl: string) {
  if (!initializeMetaPixel() || pageUrl === lastPageUrl) return;
  lastPageUrl = pageUrl;
  window.fbq?.('track', 'PageView');
}

export function trackMetaEvent(eventName: string, parameters?: MetaPixelParameters) {
  if (!initializeMetaPixel()) return;
  window.fbq?.('track', eventName, parameters);
}

export function trackMetaCustomEvent(eventName: string, parameters?: MetaPixelParameters) {
  if (!initializeMetaPixel()) return;
  window.fbq?.('trackCustom', eventName, parameters);
}
