//!
//! SpryJs Visible Module

type SpryJsScrollEventsOptions = {
    classWatch: string;
    classSeen: string;
    classSeenDelayed: string;
    classParallax: string;
    classParallaxBackgroundPosition: string;
    minWidth: number;
    seenDelay: number;
    parallaxDelay: number;
    threshold: number;
}

function runScrollEvents() {

    if (windowWidth >= options.minWidth) {

        parallaxBPElements.forEach(elem => {
            const rect = elem.getBoundingClientRect();
            const horizontal = elem.classList.contains('scroll-horizontal');
            const totalHeight = windowHeight + rect.height;
            const pos = rect.top + rect.height;
            if (pos > 0 && pos < totalHeight) {
                elem.style.backgroundPosition = horizontal ? ((pos / totalHeight) * 100) + '% center' : 'center ' + ((pos / totalHeight) * 100) + '%';
            }
        });

        parallaxElements.forEach(elem => {
            if (elem && elem.parentElement) {
                const rect = elem.getBoundingClientRect();
                const rectParent = elem.parentElement.getBoundingClientRect();
                const horizontal = elem.classList.contains('scroll-horizontal');
                const dist = horizontal ? rect.width - rectParent.width : rect.height - rectParent.height;
                const offset = 1 - (horizontal ? (rectParent.width / rect.width) : (rectParent.height / rect.height));

                if (dist < 0) {
                    elem.style.translate = '0';
                    return;
                }
                
                var totalSize = windowHeight + rectParent.height;
                var pos = rectParent.top + rectParent.height;
                if (pos > 0 && pos < totalSize) {
                    const p = Math.round((((pos / totalSize) * 100) * offset)  * 100) / 100;
                    const t = elem.style.translate ? elem.style.translate.toString().split(' ') : ['0px', '0px'];
                    if (horizontal) {
                        elem.style.translate = '-' + p + '% ' + (t[1] ? t[1] : '0px');
                    } else {
                        elem.style.translate = t[0] + ' -' + p + '%';
                    }
                }
            }
        });
       
        watchElements.forEach((elem, index) => {
            const rect = elem.getBoundingClientRect();
            if (!elem.classList.contains('scroll-seen') && options && (windowHeight - rect.top) > options.threshold && (windowHeight - rect.top) < (windowHeight + rect.height)) {
                elem.classList.add('scroll-seen');
                if (options && options.seenDelay) {
                    setTimeout(() => {
                        elem.classList.add('scroll-seen-delayed');
                    }, (index * options.seenDelay));
                }
            }
        });

    }
}

const defaults = {
    classWatch: 'scroll-watch',
    classSeen: 'scroll-seen',
    classSeenDelayed: 'scroll-seen-delayed',
    classParallax: 'scroll-parallax',
    classParallaxBackgroundPosition: 'scroll-parallax-background-position',
    minWidth: 0,
    seenDelay: 100,
    parallaxDelay: 300,
    threshold: 80,
}

let options: SpryJsScrollEventsOptions = defaults;
let windowHeight: number = 0;
let windowWidth: number = 0;
let parallaxBPElements: HTMLElement[] = [];
let parallaxElements: HTMLElement[] = [];
let watchElements: HTMLElement[] = [];

function updateWindowWidth() {
    windowHeight = window.innerHeight;
    windowWidth = window.innerWidth;
}

export function loadScrollEvents(userOptions?: SpryJsScrollEventsOptions) {

    options = {...defaults, ...userOptions};

    windowHeight       = window.innerHeight;
    windowWidth        = window.innerWidth;
    watchElements      = Array.from(document.querySelectorAll('.'+options.classWatch));
    parallaxElements   = Array.from(document.querySelectorAll('.'+options.classParallax));
    parallaxBPElements = Array.from(document.querySelectorAll('.'+options.classParallaxBackgroundPosition));

    parallaxBPElements.forEach(parallaxElement => {
        parallaxElement.style.willChange = 'background-position';
        if (options.parallaxDelay) {
            parallaxElement.style.transition = 'background-position '+options.parallaxDelay+'ms cubic-bezier(0, 0, 0, 1)';
        }
    });

    parallaxElements.forEach(parallaxElement => {
        parallaxElement.style.willChange = 'translate';
        if (options.parallaxDelay) {
            parallaxElement.style.transition = 'translate '+options.parallaxDelay+'ms cubic-bezier(0, 0, 0, 1)';
        }
    });

    if (parallaxBPElements.length || parallaxElements.length || watchElements.length) {
        window.addEventListener('scroll', runScrollEvents);
        window.addEventListener('resize', runScrollEvents);
        window.addEventListener('resize', updateWindowWidth);
        runScrollEvents();
    }
}