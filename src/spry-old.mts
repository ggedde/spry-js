import { cookie } from './modules/cookie.ts';
import { navigable } from './modules/navigable.ts';
import { observe } from './modules/observe.ts';
import { parallax } from './modules/parallax.ts';
import { scrollspy } from './modules/scrollspy.ts';
import { slider } from './modules/slider.ts';
import { toggle } from './modules/toggle.ts';
import { query } from './modules/query.ts';

function load() {
    navigable();
    observe();
    parallax();
    scrollspy();
    slider();
    toggle();
}

//! 
//! SpryJS Module Exports
const SpryJS = { cookie, navigable, observe, parallax, slider, scrollspy, toggle, query, load };
export { cookie, navigable, observe, parallax, slider, scrollspy, toggle, query, load, SpryJS as default };