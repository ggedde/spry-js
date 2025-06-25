import SpryJS, { type SpryJsCollection } from './spry.mts';

declare global {
    interface Window {
        spry: SpryJsCollection;
    }
}

//!
//! SpryJS Global Variable
if (document.currentScript) {
    const src = document.currentScript.getAttribute('src');
    if (src) {
        const initLoad = (loadVar: any) => {
            requestAnimationFrame(() => {
                ((window[loadVar] as unknown) as SpryJsCollection).load();
            });
        }
        const loadAndRun = () => {
            const urlParams = new URL(src, window.location.href);
            const loadParam = urlParams.searchParams.get('load');
            const loadParamString = loadParam !== null ? loadParam.toString().toLowerCase().trim() : '';
            const load = loadParam !== null && loadParamString !== 'false' && loadParamString !== '0';
            const loadVarParam = urlParams.searchParams.get('var');
            const loadVarParamString = loadVarParam !== null ? loadVarParam.toString().trim() : '';
            const loadVar: any = loadVarParamString && loadVarParamString.toLowerCase() !== 'true' && loadVarParamString.toLowerCase() !== '1' ? loadVarParamString : 'spry';
            const run = urlParams.searchParams.get('run');
            const runString: any = run ? run.toString().trim() : null;

            // Check Load
            if (loadVar && (!isNaN(loadVar) || loadVar.indexOf(' ') > 0)) {
                console.error("SpryJS Load Variable must be a valid JS variable name with no spaces. Or use `true` for default `spry` variable.");
            } else {
                (window[loadVar] as object) = SpryJS;
                if (load) {
                    if (document.readyState === 'interactive' || document.readyState === 'complete') {
                        initLoad(loadVar);
                    } else {
                        document.addEventListener('DOMContentLoaded', function() {
                            initLoad(loadVar);
                        });
                    }
                }
            }
            // Check Run
            if (runString) {
                if (!isNaN(runString) || runString.toLowerCase() === 'true' || runString.trim().indexOf(' ') > 0) {
                    console.error("SpryJS Run Function must be a valid JS function name with no spaces");
                } else if (window[runString] && typeof window[runString] === 'function') {
                    (window[runString] as Function)();
                }
            }
        }

        loadAndRun();
    }
}