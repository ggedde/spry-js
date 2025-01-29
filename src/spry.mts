import { loadNavigable } from './modules/navigable.ts';
import { loadScrollSpy } from './modules/scrollspy.ts';
import { loadSliders } from './modules/sliders.ts';
import { loadToggles } from './modules/toggles.ts';
import { q } from './modules/q.ts';
//! 
//! Spry Module Exports
const SpryJS = { loadNavigable, loadSliders, loadScrollSpy, loadToggles, q };
export { loadNavigable, loadSliders, loadScrollSpy, loadToggles, q, SpryJS as default };