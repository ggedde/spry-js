//!
//! SpryJs ScrollSpy Module

type SpryJsScrollSpyAnchorAction = {
    activeClasses: string[];
    el: Element;
    replaceHash: string;
    scrollDifference: number;
}

type SpryJsScrollSpyAnchor = {
    top: number;
    el: Element;
    replaceHash: string;
}

type SpryJsScrollSpyContainer = {
    el: Element;
    progress: string;
    classActive: string | string[];
    anchors: SpryJsScrollSpyAnchor[];
    scroller: Window | Element;
}

export type SpryJsScrollSpyOptions = {
    items?: Element[] | string,
    threshold?: number;
    progress?: 'active' | 'linear' | 'seen';
    replaceHistoryState?: boolean;
	classActive?: string | string[];
    selectorAnchors?: string;
    scrollingElement?: Window | Element;
    attributeReplaceHistoryState?: string;
    attributeScrollingElement?: string;
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
    scrollingElement = window,
    replaceHistoryState = false,
    selectorAnchors = '[href*="#"],[data-scrollspy-section]',
    attributeReplaceHistoryState = 'data-scrollspy-replace',
    attributeScrollingElement = 'data-scrollspy-scroller',
    attributeAnchors = 'data-scrollspy-anchors',
    attributeClassActive = 'data-scrollspy-active',
    attributeSection = 'data-scrollspy-section',
    attributeThreshold = 'data-scrollspy-threshold',
    attributeProgress = 'data-scrollspy-progress'
}: SpryJsScrollSpyOptions = {}): {destroy: Function, update: Function} {

    let controller: AbortController | null = null;
    let elements: Element[] | NodeListOf<Element> | null = null;
    let containers: SpryJsScrollSpyContainer[] = [];
    let scrollers: (Window | Element)[] = [];
    let resizeTimer: Timer | null = null;
    let currentHash: string = '';

    if (typeof classActive === 'string') {
        classActive = classActive.split(' ');
    }

    function runScrollEvents() {

        if (!containers) return;

        let activeAnchors: SpryJsScrollSpyAnchorAction[] = [];
        let inactiveAnchors: SpryJsScrollSpyAnchorAction[] = [];
        let replaceCurrentHash = '';
        let replaceCurrentHashDiff = 0;

        for (let c = 0; c < containers.length; c++) {

            const scroller = containers[c].scroller;
            const seen = containers[c].progress === 'seen';
            const first = containers[c].anchors.length - 1;
            const scrollPos = scroller === window ? window.scrollY : (scroller instanceof Element ? scroller.scrollTop : null);
            let activeClasses = containers[c].classActive;
            let mainActiveAnchor = null;

            if (scrollPos === null) {
                return;
            }

            if (typeof activeClasses === 'string') {
                activeClasses = activeClasses.split(' ');
            }

            for (let a = 0; a < containers[c].anchors.length; a++) {

                const anchor: SpryJsScrollSpyAnchorAction = {
                    el: containers[c].anchors[a].el,
                    activeClasses: activeClasses,
                    replaceHash: containers[c].anchors[a].replaceHash,
                    scrollDifference: scrollPos - containers[c].anchors[a].top
                };

                if (scrollPos > containers[c].anchors[a].top) {
                    if (!mainActiveAnchor || containers[c].progress === 'linear') {
                        activeAnchors.push(anchor);
                        mainActiveAnchor = containers[c].anchors[a].el;
                    } else if (!seen) {
                        inactiveAnchors.push(anchor);
                    }
                } else if (!seen && a !== first) {
                    inactiveAnchors.push(anchor);
                }
            }
        };

        requestAnimationFrame(() => {
            
            for (let a = 0; a < activeAnchors.length; a++) {
                activeAnchors[a].el.classList.add(...activeAnchors[a].activeClasses);
                if (activeAnchors[a].replaceHash && (!replaceCurrentHashDiff || activeAnchors[a].scrollDifference < replaceCurrentHashDiff)) {
                    replaceCurrentHash = activeAnchors[a].replaceHash;
                    replaceCurrentHashDiff = activeAnchors[a].scrollDifference;
                }
            }
    
            for (let a = 0; a < inactiveAnchors.length; a++) {
                inactiveAnchors[a].el.classList.remove(...inactiveAnchors[a].activeClasses);
            }

            if (replaceCurrentHash && replaceCurrentHash !== currentHash && (!window.location.hash || window.location.hash.indexOf("#"+replaceCurrentHash) < 0)) {
                history.replaceState(undefined, '', "#"+replaceCurrentHash);
            }
        });
    }

    function runResizeEvents() {
        if (resizeTimer) {
            clearTimeout(resizeTimer);
        }
        resizeTimer = setTimeout(() => {
            update();
        }, 100);
    }

    function update() {

        scrollers = [];
        containers = [];

        elements = typeof items === 'object' ? items : document.querySelectorAll(items);
        if (elements) {
            for (let e = 0; e < elements.length; e++) {
                if (document.body.contains(elements[e])) {

                    const containerProgress = elements[e].hasAttribute(attributeProgress) ? elements[e].getAttribute(attributeProgress) : progress;
                    const containerClassActive = elements[e].hasAttribute(attributeClassActive) ? elements[e].getAttribute(attributeClassActive) : classActive;
                    const scrollElementSelector = elements[e].hasAttribute(attributeScrollingElement) ? elements[e].getAttribute(attributeScrollingElement) : null;
                    const scrollElement = scrollElementSelector ? document.querySelector(scrollElementSelector) : scrollingElement;
                    const containerReplaceState = elements[e].hasAttribute(attributeReplaceHistoryState) ? elements[e].getAttribute(attributeReplaceHistoryState) : replaceHistoryState;                    

                    if (!scrollElement) {
                        return; 
                    }

                    if (!scrollers.includes(scrollElement)) {
                        scrollers.push(scrollElement);
                    }

                    let container: SpryJsScrollSpyContainer = {
                        el: elements[e],
                        progress: containerProgress || '',
                        classActive: containerClassActive || '',
                        anchors: [],
                        scroller: scrollElement,
                    };

                    const scrollPos = scrollElement === window ? window.scrollY : (scrollElement instanceof Element ? scrollElement.scrollTop : null);
                    const elementThreshold = elements[e].hasAttribute(attributeThreshold) ? elements[e].getAttribute(attributeThreshold) : threshold;
                    const containerSelectorAnchors = elements[e].hasAttribute(attributeAnchors) ? elements[e].getAttribute(attributeAnchors) : selectorAnchors;

                    if (!containerSelectorAnchors) {
                        console.error('SpryJS - Scrollspy has no selectors.')
                        return;
                    }

                    elements[e].querySelectorAll(containerSelectorAnchors).forEach(anchor => {                        

                        let section = null;
                        let hash = '';

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
                                        hash = url.hash.replace('#', '').trim();
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
                        if (section && elements && elements[e] && scrollPos !== null) {
                            const sectionRect = section.getBoundingClientRect();
                            container.anchors.push({
                                top: (sectionRect.y + scrollPos) - ( elementThreshold ? parseInt( elementThreshold.toString() ) : 0 ),
                                el: anchor,
                                replaceHash: (containerReplaceState === '' || (containerReplaceState && [1, '1', 'true', 'TRUE', 'True', true].includes(containerReplaceState))) ? hash : ''
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
        } else if (controller && scrollers.length) {
            scrollers.forEach(scroller => {
                if (controller) {
                    scroller.addEventListener('scroll', runScrollEvents, {signal: controller.signal});
                    scroller.addEventListener('resize', runResizeEvents, {signal: controller.signal});
                }
            });
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