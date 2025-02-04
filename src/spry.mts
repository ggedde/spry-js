import { cookie } from './modules/cookies.ts';
import { loadNavigable } from './modules/navigable.ts';
import { loadObserver } from './modules/observer.ts';
import { loadParallax } from './modules/parallax.ts';
import { loadScrollEvents } from './modules/scrollevents.ts';
import { loadScrollSpy } from './modules/scrollspy.ts';
import { loadSliders } from './modules/sliders.ts';
import { loadToggles } from './modules/toggles.ts';
import { query } from './modules/query.ts';

function load() {
    loadNavigable();
    loadObserver();
    loadParallax();
    loadScrollSpy();
    loadSliders();
    loadToggles();
}

//! 
//! Spry Module Exports
const SpryJS = { cookie, loadNavigable, loadObserver, loadParallax, loadSliders, loadScrollSpy, loadScrollEvents, loadToggles, query, load };
export { cookie, loadNavigable, loadObserver, loadParallax, loadSliders, loadScrollSpy, loadScrollEvents, loadToggles, query, load, SpryJS as default };