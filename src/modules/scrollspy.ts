//!
//! SpryJs ScrollSpy Module

type SpryJsScrollSpyAnchor = {
    top: number;
    el: Element;
}

type SpryJsScrollSpyContainer = {
    el: Element;
    progress: string;
    classActive: string | string[];
    anchors: SpryJsScrollSpyAnchor[];
}

export type SpryJsScrollSpyOptions = {
    items?: Element[] | string,
    threshold?: number;
    progress?: 'active' | 'linear' | 'seen';
	classActive?: string | string[];
    selectorAnchors?: string;
    attributeAnchors?: string;
    attributeClassActive?: string;
    attributeSection?: string;
    attributeThreshold?: string;
    attributeProgress?: string;
};

export function scrollspy({
    items = '.scrollspy',
    threshold = 200,
    progress = 'active',
    classActive = 'active',
    selectorAnchors = '[href*="#"],[data-scrollspy-section]',
    attributeAnchors = 'data-scrollspy-anchors',
    attributeClassActive = 'data-scrollspy-class-active',
    attributeSection = 'data-scrollspy-section',
    attributeThreshold = 'data-scrollspy-threshold',
    attributeProgress = 'data-scrollspy-progress'
}: SpryJsScrollSpyOptions = {}): {destroy: Function, update: Function} {

    let controller: AbortController | null = null;
    let elements: Element[] | NodeListOf<Element> | null = null;
    let containers: SpryJsScrollSpyContainer[] = [];
    let resizeTimer: Timer | null = null;

    if (typeof classActive === 'string') {
        classActive = classActive.split(' ');
    }

    function runScrollEvents() {

        const y = window.scrollY;

        if (!containers) return;

        containers.forEach(container => {

            if (typeof container.classActive === 'string') {
                container.classActive = container.classActive.split(' ');
            }

            for (let a = 0; a < container.anchors.length; a++) {
                if (container.progress === 'active' || (container.progress === 'linear' && y <= container.anchors[a].top)) {
                    container.anchors[a].el.classList.remove(...container.classActive);
                }
            }

            for (let a = 0; a < container.anchors.length; a++) {
                if (y > container.anchors[a].top || (container.progress !== 'seen' && y <= container.anchors[a].top && a === (container.anchors.length - 1))) {
                    container.anchors[a].el.classList.add(...container.classActive);
                    if (container.progress === 'active') return;
                }
            }
        });
    }

    function runResizeEvents() {
        if (resizeTimer) {
            clearTimeout(resizeTimer);
        }
        resizeTimer = setTimeout(() => {
            update();
            runScrollEvents();
        }, 100);
    }

    function update() {

        containers = [];
        const scrollPosition = window.scrollY;

        elements = typeof items === 'object' ? items : document.querySelectorAll(items);
        if (elements) {
            for (let e = 0; e < elements.length; e++) {
                if (document.body.contains(elements[e])) {

                    const containerProgress = elements[e].hasAttribute(attributeProgress) ? elements[e].getAttribute(attributeProgress) : progress;
                    const containerClassActive = elements[e].hasAttribute(attributeClassActive) ? elements[e].getAttribute(attributeClassActive) : classActive;

                    let container: SpryJsScrollSpyContainer = {
                        el: elements[e],
                        progress: containerProgress || '',
                        classActive: containerClassActive || '',
                        anchors: []
                    };

                    const elementThreshold = elements[e].hasAttribute(attributeThreshold) ? elements[e].getAttribute(attributeThreshold) : threshold;
                    const containerSelectorAnchors = elements[e].hasAttribute(attributeAnchors) ? elements[e].getAttribute(attributeAnchors) : selectorAnchors;

                    if (!containerSelectorAnchors) {
                        console.error('SpryJS - Scrollspy has no selectors.')
                        return;
                    }

                    elements[e].querySelectorAll(containerSelectorAnchors).forEach(anchor => {                        

                        let section = null;

                        const dataSelector = (anchor as HTMLElement).getAttribute(attributeSection);
                        if (dataSelector) {
                            section = document.querySelector(dataSelector);
                        }

                        // Try Hash Selectors if Section not detected
                        if (!section) {
                            const href = (anchor as HTMLElement).getAttribute('href');
                            if (href) {
                                try {
                                    const url = new URL(href, window.location.href);
                                    if (url && url.hash) {
                                        const hash = url.hash.replace('#', '').trim();
                                        if (hash) {
                                            section = document.querySelector('[id="'+hash+'"], a[name="'+hash+'"]');
                                        }
                                    }
                                } catch (e) {
                                    console.error('SpryJS - Scrollspy has invalid URL ('+href+')', e);
                                }
                            }
                        }

                        // Add Anchors if found Section
                        if (section && elements && elements[e]) {
                            const sectionRect = section.getBoundingClientRect();
                            container.anchors.push({
                                top: (sectionRect.y + scrollPosition) - ( elementThreshold ? parseInt( elementThreshold.toString() ) : 0 ),
                                el: anchor,
                            });
                        }
                    });

                    container.anchors = container.anchors.reverse();
                    containers.push(container);
                }
            }
        }

        if (!controller) {
			controller = new AbortController();
		}

        if (!containers) {
            destroy();
        } else if (controller) {
            window.addEventListener('scroll', runScrollEvents, {signal: controller.signal});
            window.addEventListener('resize', runResizeEvents, {signal: controller.signal});
            runScrollEvents();
        }
    };

    function destroy() {
        if (controller) {
            controller.abort();
            controller = null;
        }
        containers = [];
    };

    update();

    return {
        destroy: destroy,
        update: update
    }
}