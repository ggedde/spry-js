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

export function parallax({
    items = '.parallax',
    classParallaxing = 'parallaxing', // cspell:disable-line.
    parallaxBackgroundAttribute = 'data-parallax-background',
    parallaxHorizontalAttribute = 'data-parallax-horizontal',
    parallaxInvertAttribute = 'data-parallax-invert',
    threshold = -300,
    minWidth = 0,
    delay = 300,
}: SpryJsParallaxOptions = {}): {destroy: Function, update: Function} {

    let windowHeight: number = window.innerHeight;
    let windowWidth: number = window.innerWidth;
    let elements: Element[] | NodeListOf<Element> | null = null;
    let observer: IntersectionObserver | null = null;
    let eventsLoaded = false;

    function createObserver() {
        observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                entry.target.classList.toggle(classParallaxing, entry.isIntersecting); // cspell:disable-line.
            });
            runScrollEvents();
        }, {
            rootMargin: (threshold * -1).toString() + 'px'
        });
    }

    function updateWindowSize() {
        windowHeight = window.innerHeight;
        windowWidth = window.innerWidth;
    }

    function runScrollEvents() {
        if (elements && windowWidth >= minWidth) {
            for (let e = 0; e < elements.length; e++) {
                if (elements[e] && elements[e].classList.contains(classParallaxing)) { // cspell:disable-line.
                    const rectElement = elements[e].getBoundingClientRect();
                    const isBackground = elements[e].hasAttribute(parallaxBackgroundAttribute);
                    const isHorizontal = elements[e].hasAttribute(parallaxHorizontalAttribute);
                    const isInvert = elements[e].hasAttribute(parallaxInvertAttribute);
                    const rectContainer = !isBackground && elements[e].parentElement ? (elements[e].parentElement as HTMLElement).getBoundingClientRect() : rectElement;
                    const totalHeight = windowHeight + rectContainer.height;
                    const position = rectContainer.top + rectContainer.height;
                    const percent = (isInvert ? 1 - (position / totalHeight) : (position / totalHeight));

                    if (position > threshold && position < (totalHeight + (threshold * -1))) {
                        // Parallax on Background Position
                        if (isBackground) {
                            (elements[e] as HTMLElement).style.backgroundPosition = isHorizontal ? (percent * 100) + '% center' : 'center ' + (percent * 100) + '%';

                            // Parallax on Child Position
                        } else {
                            const dist = isHorizontal ? rectElement.width - rectContainer.width : rectElement.height - rectContainer.height;

                            if (dist < 0) {
                                (elements[e] as HTMLElement).style.translate = '0';
                                return;
                            }

                            const offset = 1 - (isHorizontal ? (rectContainer.width / rectElement.width) : (rectContainer.height / rectElement.height));
                            const p = Math.round(((percent * 100) * offset) * 100) / 100;
                            const t = (elements[e] as HTMLElement).style.translate ? (elements[e] as HTMLElement).style.translate.toString().split(' ') : ['0px', '0px'];
                            if (isHorizontal) {
                                (elements[e] as HTMLElement).style.translate = '-' + p + '% ' + (t[1] ? t[1] : '0px');
                            } else {
                                (elements[e] as HTMLElement).style.translate = t[0] + ' -' + p + '%';
                            }
                        }
                    }
                }
            };
        }
    }

    function destroy() {
        if (eventsLoaded) {
            window.removeEventListener('scroll', runScrollEvents);
            window.removeEventListener('resize', runScrollEvents);
            window.removeEventListener('resize', updateWindowSize);
            eventsLoaded = false;
        }

        if (elements) {
            for (let e = 0; e < elements.length; e++) {
                elements[e].classList.remove(classParallaxing); // cspell:disable-line.
                if (observer) observer.unobserve(elements[e]);
            };
        }

        if (observer) observer.disconnect();
    };

    function update() {
        if (elements) {
            let hasElements = false;
            for (let e = 0; e < elements.length; e++) {
                if (!document.body.contains(elements[e]) && observer) {
                    observer.unobserve(elements[e]);
                } else {
                    hasElements = true;
                }
            }
            if (!hasElements) {
                destroy();
            }
        }

        elements = typeof items === 'object' ? items : document.querySelectorAll(items);
        if (elements) {
            if (!observer) {
                createObserver();
            }
            if (observer) {
                for (let e = 0; e < elements.length; e++) {
                    const style = elements[e].hasAttribute(parallaxBackgroundAttribute) ? 'background-position' : 'translate';
                    (elements[e] as HTMLElement).style.willChange = style;
                    if (delay) {
                        (elements[e] as HTMLElement).style.transition = style + ' ' + delay + 'ms cubic-bezier(0, 0, 0, 1)';
                    }
                    if (observer) observer.observe(elements[e]);
                };
                
                if (!eventsLoaded) {
                    window.addEventListener('scroll', runScrollEvents);
                    window.addEventListener('resize', runScrollEvents);
                    window.addEventListener('resize', updateWindowSize);
                    eventsLoaded = true;
                }
            }
        }
    };

    update();

    return {
        destroy: destroy,
        update: update
    }
}