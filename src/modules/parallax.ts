//!
//! SpryJs Parallax Module

type SpryJsParallaxOptions = {
    classParallax: string;
    classParallaxing: string; // cspell:disable-line.
    classParallaxBackground: string;
    classParallaxHorizontal: string;
    threshold: number;
    minWidth: number;
    delay: number;
}

export function loadParallax(userOptions?: SpryJsParallaxOptions) {

    const defaults = {
        classParallax: 'parallax',
        classParallaxing: 'parallaxing', // cspell:disable-line.
        classParallaxBackground: 'parallax-background',
        classParallaxHorizontal: 'parallax-horizontal',
        threshold: -300,
        minWidth: 0,
        delay: 300,
    }

    let options: SpryJsParallaxOptions = defaults;
    let windowHeight: number = 0;
    let windowWidth: number = 0;
    let parallaxBPElements: HTMLElement[] = [];
    let parallaxElements: HTMLElement[] = [];

    options = { ...defaults, ...userOptions };

    windowHeight = window.innerHeight;
    windowWidth = window.innerWidth;
    parallaxElements = Array.from(document.querySelectorAll('.' + options.classParallax) as NodeListOf<HTMLElement>);
    parallaxBPElements = Array.from(document.querySelectorAll('.' + options.classParallaxBackground) as NodeListOf<HTMLElement>);

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            entry.target.classList.toggle(options.classParallaxing, entry.isIntersecting); // cspell:disable-line.
        });
    }, {
        rootMargin: (options.threshold * -1).toString() + 'px'
    });

    parallaxBPElements.forEach(parallaxElement => {
        parallaxElement.style.willChange = 'background-position';
        if (options.delay) {
            parallaxElement.style.transition = 'background-position ' + options.delay + 'ms cubic-bezier(0, 0, 0, 1)';
        }
        observer.observe(parallaxElement);
    });

    parallaxElements.forEach(parallaxElement => {
        parallaxElement.style.willChange = 'translate';
        if (options.delay) {
            parallaxElement.style.transition = 'translate ' + options.delay + 'ms cubic-bezier(0, 0, 0, 1)';
        }
        observer.observe(parallaxElement);
    });

    const updateWindowSize = function () {
        windowHeight = window.innerHeight;
        windowWidth = window.innerWidth;
    }

    const runScrollEvents = function () {

        if (windowWidth >= options.minWidth) {

            parallaxBPElements.forEach(elem => {
                if (elem && elem.classList.contains(options.classParallaxing)) { // cspell:disable-line.
                    const rect = elem.getBoundingClientRect();
                    const horizontal = elem.classList.contains(options.classParallaxHorizontal);
                    const totalHeight = windowHeight + rect.height;
                    const pos = rect.top + rect.height;
                    if (pos > options.threshold && pos < (totalHeight + (options.threshold * -1))) {
                        elem.style.backgroundPosition = horizontal ? ((pos / totalHeight) * 100) + '% center' : 'center ' + ((pos / totalHeight) * 100) + '%';
                    }
                }
            });

            parallaxElements.forEach(elem => {
                if (elem && elem.classList.contains(options.classParallaxing) && elem.parentElement) { // cspell:disable-line.
                    const rect = elem.getBoundingClientRect();
                    const rectParent = elem.parentElement.getBoundingClientRect();
                    const horizontal = elem.classList.contains(options.classParallaxHorizontal);
                    const dist = horizontal ? rect.width - rectParent.width : rect.height - rectParent.height;
                    const offset = 1 - (horizontal ? (rectParent.width / rect.width) : (rectParent.height / rect.height));

                    if (dist < 0) {
                        elem.style.translate = '0';
                        return;
                    }

                    var totalHeight = windowHeight + rectParent.height;
                    var pos = rectParent.top + rectParent.height;

                    if (pos > options.threshold && pos < (totalHeight + (options.threshold * -1))) {
                        const p = Math.round((((pos / totalHeight) * 100) * offset) * 100) / 100;
                        const t = elem.style.translate ? elem.style.translate.toString().split(' ') : ['0px', '0px'];
                        if (horizontal) {
                            elem.style.translate = '-' + p + '% ' + (t[1] ? t[1] : '0px');
                        } else {
                            elem.style.translate = t[0] + ' -' + p + '%';
                        }
                    }
                }
            });
        }
    }

    if (parallaxBPElements.length || parallaxElements.length) {
        window.addEventListener('scroll', runScrollEvents);
        window.addEventListener('resize', runScrollEvents);
        window.addEventListener('resize', updateWindowSize);
        runScrollEvents();
    }
}