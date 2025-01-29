import SpryJS from './spry.mts';

declare global {
    interface Window {
        SpryJS: any;
    }
}

//!
//! SpryJS Global Variable
window.SpryJS = SpryJS;