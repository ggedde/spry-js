import { loadNavigable } from './modules/navigable.ts';
import { loadScrollSpy } from './modules/scrollspy.ts';
import { loadScrollEvents } from './modules/scrollevents.ts';
import { loadSliders } from './modules/sliders.ts';
import { loadToggles } from './modules/toggles.ts';
import { setCookie, getCookie, removeCookie } from './modules/cookies.ts';
import { q } from './modules/q.ts';
//! 
//! Spry Module Exports
const SpryJS = { loadNavigable, loadSliders, loadScrollSpy, loadScrollEvents, loadToggles, setCookie, getCookie, removeCookie, q };
export { loadNavigable, loadSliders, loadScrollSpy, loadScrollEvents, loadToggles, setCookie, getCookie, removeCookie, q, SpryJS as default };