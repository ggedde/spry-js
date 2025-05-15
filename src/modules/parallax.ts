//!
//! SpryJs Parallax Module

type SpryJsParallaxContainer = {
    bottom: number;
    el: Element;
    isBackground: boolean;
    isHorizontal: boolean;
    isInvert: boolean;
    offsetHeight: number;
    offsetWidth: number;
    percentHeight: number;
    percentWidth: number;
    scroller: Window | Element;
    top: number;
    totalHeight: number;
    classActive: string | null;
    minWidth: number;
    threshold: number;
}

export type SpryJsParallaxOptions = {
    items?: Element[] | string,
    delay?: number;
    minWidth?: number;
    threshold?: number;
    classActive?: string;
    scrollingElement?: Window | Element;
    attributeMinWidth?: string;
    attributeThreshold?: string;
    attributeScrollingElement?: string;
    attributeClassActive?: string;
    attributeBackground?: string;
    attributeHorizontal?: string;
    attributeInvert?: string;
    attributeDelay?: string;
}

export function parallax({
    items = '.parallax',
    delay = 300,
    minWidth = 0,
    threshold = -300,
    classActive = 'parallaxing',
    scrollingElement = window,
    attributeMinWidth = 'data-parallax-width',
    attributeThreshold = 'data-parallax-threshold',
    attributeScrollingElement = 'data-parallax-scroller',
    attributeClassActive = 'data-parallax-active',
    attributeBackground = 'data-parallax-background',
    attributeHorizontal = 'data-parallax-horizontal',
    attributeInvert = 'data-parallax-invert',
    attributeDelay = 'data-parallax-delay',
}: SpryJsParallaxOptions = {}): {update: Function, destroy: Function} {

    let windowHeight: number = window.innerHeight;
    let windowWidth: number = window.innerWidth;
    let elements: Element[] | NodeListOf<Element> | null = null;
    let controller: AbortController | null = null;
    let scrollers: (Window | Element)[] = [];
    let containers: SpryJsParallaxContainer[] = [];
    let resizeTimer: Timer | null = null;

    function updateWindowSize() {
        if (resizeTimer) {
            clearTimeout(resizeTimer);
        }
        resizeTimer = setTimeout(() => {
            windowHeight = window.innerHeight;
            windowWidth = window.innerWidth;
            update();
        }, 100);
    }

    function runScrollEvents() {

        if (!containers) return;

        for (let c = 0; c < containers.length; c++) {
            const container = containers[c];
            if (container.minWidth && windowWidth < container.minWidth) {
                continue; // Skip this container.
            }

            const scroller = container.scroller;
            const scrollPos = scroller === window ? window.scrollY : (scroller instanceof Element ? scroller.scrollTop : 0);
            const isParallaxing = scrollPos + windowHeight > (container.bottom + container.threshold) && scrollPos < (container.top - container.threshold);

            requestAnimationFrame(() => {
                container.el.classList.toggle(container.classActive ? container.classActive : classActive, isParallaxing);
            })

            if (isParallaxing) {

                let percent = ((scrollPos + windowHeight - container.bottom) / container.totalHeight) * 100;

                if (container.isInvert) percent = 100 - percent;
                if (percent > 100) percent = 100;
                if (percent < 0) percent = 0;

                // Parallax on Background Position
                if (container.isBackground) {
                    (container.el as HTMLElement).style.backgroundPosition = container.isHorizontal ? percent + '% center' : 'center ' + percent + '%';

                // Parallax on Child Position
                } else {
                    const dist = container.isHorizontal ? container.offsetWidth : container.offsetHeight;

                    if (dist < 0) {
                        (container.el as HTMLElement).style.translate = '0';
                        continue;
                    }

                    const offset = 1 - (container.isHorizontal ? container.percentWidth : container.percentHeight);
                    const p = Math.round((percent * offset) * 100) / 100;
                    const t = (container.el as HTMLElement).style.translate ? (container.el as HTMLElement).style.translate.toString().split(' ') : ['0px', '0px'];
                    if (container.isHorizontal) {
                        (container.el as HTMLElement).style.translate = '-' + p + '% ' + (t[1] ? t[1] : '0px');
                    } else {
                        (container.el as HTMLElement).style.translate = t[0] + ' -' + p + '%';
                    }
                }
            }
        }
    }

    function update() {
        destroy();
        elements = typeof items === 'object' ? items : document.querySelectorAll(items);
        containers = [];
        if (!elements) {
            return;
        }
        
        for (let e = 0; e < elements.length; e++) {
            const style = elements[e].hasAttribute(attributeBackground) ? 'background-position' : 'translate';
            const elementDelay = elements[e].hasAttribute(attributeDelay) ? elements[e].getAttribute(attributeDelay) : delay;
            const scrollElementSelector = elements[e].hasAttribute(attributeScrollingElement) ? elements[e].getAttribute(attributeScrollingElement) : null;
            const scrollElement = scrollElementSelector ? document.querySelector(scrollElementSelector) : scrollingElement;

            if (!scrollElement) {
                return;
            }

            if (!scrollers.includes(scrollElement)) {
                scrollers.push(scrollElement);
            }

            const scrollPos = scrollElement === window ? window.scrollY : (scrollElement instanceof Element ? scrollElement.scrollTop : 0);
            const rectElement = elements[e].getBoundingClientRect();
            const isBackground = elements[e].hasAttribute(attributeBackground);
            const isInvert = elements[e].hasAttribute(attributeInvert);
            const containerMinWidth = elements[e].getAttribute(attributeMinWidth);
            const containerThreshold = elements[e].getAttribute(attributeThreshold);
            const rectContainer = !isBackground && elements[e].parentElement ? (elements[e].parentElement as HTMLElement).getBoundingClientRect() : rectElement;
            const totalHeight = windowHeight + rectContainer.height;

            (elements[e] as HTMLElement).style.willChange = style;
            if (elementDelay) {
                (elements[e] as HTMLElement).style.transition = style + ' ' + elementDelay + 'ms cubic-bezier(0, 0, 0, 1)';
            }

            containers.push({
                bottom: rectContainer.top + scrollPos,
                el: elements[e],
                isBackground: isBackground,
                isHorizontal: elements[e].hasAttribute(attributeHorizontal),
                isInvert: isInvert,
                offsetHeight: rectElement.height - rectContainer.height,
                offsetWidth: rectElement.width - rectContainer.width,
                percentHeight: rectContainer.height / rectElement.height,
                percentWidth: rectContainer.width / rectElement.width,
                scroller: scrollElement,
                top: rectContainer.bottom + scrollPos,
                totalHeight: totalHeight,
                classActive: elements[e].getAttribute(attributeClassActive),
                minWidth: containerMinWidth ? parseInt(containerMinWidth) : minWidth,
                threshold: containerThreshold ? parseInt(containerThreshold) : threshold,
            });
        };

        if (!controller) {
            controller = new AbortController();
        }

        if (!containers || !controller || !scrollers) {
            destroy();
            return;
        }

        for (let s = 0; s < scrollers.length; s++) {
            scrollers[s].addEventListener('scroll', runScrollEvents, {signal: controller.signal});
            scrollers[s].addEventListener('resize', runScrollEvents, {signal: controller.signal});
        }

        // Update Window Sizes.
        window.addEventListener('resize', updateWindowSize, {signal: controller.signal});

        runScrollEvents();
    };

    function destroy() {
        if (controller) {
            controller.abort();
            controller = null;
        }

        if (elements) {
            for (let e = 0; e < elements.length; e++) {
                const elementClassActive = elements[e].getAttribute(attributeClassActive);
                const elem = elements[e];
                requestAnimationFrame(() => {
                    elem.classList.remove(elementClassActive ? elementClassActive : classActive);
                });
            };
        }

        containers = [];
    };

    update();

    return {
        update: update,
        destroy: destroy
    }
}