//!
//! SpryJs Parallax Module

export type SpryJsParallaxOptions = {
    items?: Element[] | string,
    classParallax?: string;
    classParallaxing?: string; // cspell:disable-line.
    parallaxBackgroundAttribute?: string;
    parallaxHorizontalAttribute?: string;
    parallaxInvertAttribute?: string;
    threshold?: number;
    minWidth?: number;
    delay?: number;
}

export const SpryJsParallaxDefaults: SpryJsParallaxOptions = {
    items: '.parallax',
    classParallax: 'parallax',
    classParallaxing: 'parallaxing', // cspell:disable-line.
    parallaxBackgroundAttribute: 'data-parallax-background',
    parallaxHorizontalAttribute: 'data-parallax-horizontal',
    parallaxInvertAttribute: 'data-parallax-invert',
    threshold: -300,
    minWidth: 0,
    delay: 300,
}

declare global {
    interface Element {
        spryJsParallaxLoaded: boolean;
    }
    interface Window {
        spryJsParallaxWindowLoaded: boolean;
    }
}

export function parallax(userOptions?: SpryJsParallaxOptions) {
    
    const options = { ...SpryJsParallaxDefaults, ...userOptions };

    let windowHeight: number = window.innerHeight;
    let windowWidth: number  = window.innerWidth;

    const elements = typeof options.items === 'object' ? options.items : options.items ? document.querySelectorAll(options.items) : [];

    if (!elements) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (options.classParallaxing) entry.target.classList.toggle(options.classParallaxing, entry.isIntersecting); // cspell:disable-line.
        });
        runScrollEvents();
    }, {
        rootMargin: ((options.threshold ?? 0) * -1).toString() + 'px'
    });

    elements.forEach(element => {
        if (!element.spryJsParallaxLoaded) {
            const style = options.parallaxBackgroundAttribute && element.hasAttribute(options.parallaxBackgroundAttribute) ? 'background-position' : 'translate';
            (element as HTMLElement).style.willChange = style;
            if (options.delay) {
                (element as HTMLElement).style.transition = style + ' ' + options.delay + 'ms cubic-bezier(0, 0, 0, 1)';
            }
            element.spryJsParallaxLoaded = true;
            observer.observe(element);
        }
    });

    const updateWindowSize = function () {
        windowHeight = window.innerHeight;
        windowWidth = window.innerWidth;
    }

    const runScrollEvents = function () {
        if (windowWidth >= (options.minWidth ?? 0)) {
            elements.forEach(element => {
                if (element && options.classParallaxing && element.classList.contains(options.classParallaxing)) { // cspell:disable-line.
                    const rectElement   = element.getBoundingClientRect();
                    const isBackground  = options.parallaxBackgroundAttribute && element.hasAttribute(options.parallaxBackgroundAttribute);
                    const isHorizontal  = options.parallaxHorizontalAttribute && element.hasAttribute(options.parallaxHorizontalAttribute);
                    const isInvert      = options.parallaxInvertAttribute && element.hasAttribute(options.parallaxInvertAttribute);
                    const rectContainer = (!isBackground && element.parentElement) ? element.parentElement.getBoundingClientRect() : rectElement;
                    const totalHeight   = windowHeight + rectContainer.height;
                    const position      = rectContainer.top + rectContainer.height;
                    const percent       = (isInvert ? 1 - (position / totalHeight) : (position / totalHeight));

                    if (position > (options.threshold ?? 0) && position < (totalHeight + ((options.threshold ?? 0) * -1))) {
                        // Parallax on Background Position
                        if (isBackground) {
                            (element as HTMLElement).style.backgroundPosition = isHorizontal ? (percent * 100) + '% center' : 'center ' + (percent * 100) + '%';
                        
                        // Parallax on Child Position
                        } else {
                            const dist = isHorizontal ? rectElement.width - rectContainer.width : rectElement.height - rectContainer.height;

                            if (dist < 0) {
                                (element as HTMLElement).style.translate = '0';
                                return;
                            }

                            const offset = 1 - (isHorizontal ? (rectContainer.width / rectElement.width) : (rectContainer.height / rectElement.height));
                            const p = Math.round(((percent * 100) * offset) * 100) / 100;
                            const t = (element as HTMLElement).style.translate ? (element as HTMLElement).style.translate.toString().split(' ') : ['0px', '0px'];
                            if (isHorizontal) {
                                (element as HTMLElement).style.translate = '-' + p + '% ' + (t[1] ? t[1] : '0px');
                            } else {
                                (element as HTMLElement).style.translate = t[0] + ' -' + p + '%';
                            }
                        }
                    }
                }
            });
        }
    }

    if (!window.spryJsParallaxWindowLoaded) {
        window.spryJsParallaxWindowLoaded = true;
        window.addEventListener('scroll', runScrollEvents);
        window.addEventListener('resize', runScrollEvents);
        window.addEventListener('resize', updateWindowSize);
    }   
}