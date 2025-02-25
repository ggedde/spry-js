import SpryJS, { type SpryJsCollection } from './spry.mts';

declare global {
    interface Window {
        SpryJS: SpryJsCollection;
    }
}

//!
//! SpryJS Global Variable

// @ts-ignore
window.SpryJS = SpryJS;

if (document.currentScript) {
    const src = document.currentScript.getAttribute('src');
    if (src) {
        const loadAndRun = () => {
            const urlParams = new URL(src, window.location.href);
            const load = urlParams.searchParams.get('load');
            const run = urlParams.searchParams.get('run');
            const loadString: any = load ? load.toString().trim() : null;
            const runString: any = run ? run.toString().trim() : null;
            // Check Load
            if (loadString) {
                if (!isNaN(loadString) || loadString.toLowerCase() === 'true') {
                    console.error("SpryJS Load Variable must be a valid JS variable name.");
                } else {
                    (window[loadString] as object) = SpryJS('').load();
                }
            }
            // Check Run
            if (runString) {
                if (!isNaN(runString) || runString.toLowerCase() === 'true') {
                    console.error("SpryJS Run Function must be a valid JS function name");
                } else if (window[runString] && typeof window[runString] === 'function') {
                    (window[runString] as Function)();
                }
            }
        }

        loadAndRun();
    }
}