//!
//! SpryJs Parallax Module

export type SpryJsParallaxOptions = {
    items?: Element[] | string,
    classActive?: string;
    attributeBackground?: string;
    attributeHorizontal?: string;
    attributeInvert?: string;
    attributeDelay?: string;
    threshold?: number;
    minWidth?: number;
    delay?: number;
}

export function parallax({
    items = '.parallax',
    classActive = 'parallaxing',
    attributeBackground = 'data-parallax-background',
    attributeHorizontal = 'data-parallax-horizontal',
    attributeInvert = 'data-parallax-invert',
    attributeDelay = 'data-parallax-delay',
    threshold = -300,
    minWidth = 0,
    delay = 300,
}: SpryJsParallaxOptions = {}): {update: Function, destroy: Function} {

    let windowHeight: number = window.innerHeight;
    let windowWidth: number = window.innerWidth;
    let elements: Element[] | NodeListOf<Element> | null = null;
    let observer: IntersectionObserver | null = null;
    let controller: AbortController | null = null;

    function createObserver() {
        observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                entry.target.classList.toggle(classActive, entry.isIntersecting);
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
                if (elements[e] && elements[e].classList.contains(classActive)) {
                    const rectElement = elements[e].getBoundingClientRect();
                    const isBackground = elements[e].hasAttribute(attributeBackground);
                    const isHorizontal = elements[e].hasAttribute(attributeHorizontal);
                    const isInvert = elements[e].hasAttribute(attributeInvert);
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

    function update() {
        destroy();
        elements = typeof items === 'object' ? items : document.querySelectorAll(items);
        if (elements) {
            if (!observer) {
                createObserver();
            }
            if (observer) {
                for (let e = 0; e < elements.length; e++) {
                    const style = elements[e].hasAttribute(attributeBackground) ? 'background-position' : 'translate';
                    const elementDelay = elements[e].hasAttribute(attributeDelay) ? elements[e].getAttribute(attributeDelay) : delay;
                    (elements[e] as HTMLElement).style.willChange = style;
                    if (elementDelay) {
                        (elements[e] as HTMLElement).style.transition = style + ' ' + elementDelay + 'ms cubic-bezier(0, 0, 0, 1)';
                    }
                    if (observer) observer.observe(elements[e]);
                };

                if (!controller) {
                    controller = new AbortController();
                }
                
                if (controller) {
                    window.addEventListener('scroll', runScrollEvents, {signal: controller.signal});
                    window.addEventListener('resize', runScrollEvents, {signal: controller.signal});
                    window.addEventListener('resize', updateWindowSize, {signal: controller.signal});
                }
            }
        }
    };

    function destroy() {
        if (controller) {
            controller.abort();
            controller = null;
        }

        if (elements) {
            for (let e = 0; e < elements.length; e++) {
                elements[e].classList.remove(classActive);
            };
        }

        if (observer) {
            observer.disconnect();
            observer = null;
        }
    };

    update();

    return {
        update: update,
        destroy: destroy
    }
}