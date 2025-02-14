import SpryJS from './spry.mts';

declare global {
    interface Window {
        SpryJS: any;
    }
}

//!
//! SpryJS Global Variable

if (document.currentScript) {
    const src = document.currentScript.getAttribute('src');
    if (src) {
        const loadAndRun = () => {
            const urlParams = new URL(src, window.location.href);
            // Check Load
            const load = urlParams.searchParams.get('load');
            if (load) window.SpryJS = SpryJS('').load();
            // Check Run
            const run = urlParams.searchParams.get('run');
            const runString: any = run ? run.toString() : null;
            if (runString && window[runString] && typeof window[runString] === 'function') (window[runString] as Function)();
        }
        const defer = document.currentScript.hasAttribute('defer');
        if (!defer || (defer && (document.readyState === 'complete' || document.readyState === 'interactive'))) {
            loadAndRun();
        } else if (defer) {
            document.addEventListener('DOMContentLoaded', () => {
                loadAndRun();
            });
        }
    }
}