import SpryJS from './spry.mts';

declare global {
    interface Window {
        SpryJS: any;
    }
}

//!
//! SpryJS Global Variable
window.SpryJS = SpryJS;

if (document.currentScript) {
    const src = document.currentScript.getAttribute('src');
    const defer = document.currentScript.hasAttribute('defer');
    if (src) {
        const urlParams = new URL(src, window.location.href);
        const load = urlParams.searchParams.get('load');
        if (load) {
            if (!defer || (defer && (document.readyState === 'complete' || document.readyState === 'interactive'))) {
                window.SpryJS.load();
            } else if (defer) {
                document.addEventListener('DOMContentLoaded', window.SpryJS.load);
            }
        }
    }
}