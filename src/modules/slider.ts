//!
//! SpryJs Sliders Module

declare global {
    interface Element {
        sliderGoTo?: Function;
        sliderGetIndex?: Function;
		sliderUpdate?: Function;
        sliderCount: number;
    }

	// interface Window { [key: string]: any[] } {}
}

export type SpryJsSliderOptions = {
	items?: Element[] | string,
	classSliding?: string | string[];
	classShowing?: string | string[];
	classShowingFirst?: string | string[];
	classShowingLast?: string | string[];
	classStart?: string | string[];
	classEnd?: string | string[];
	selectorSlides?: string;
	selectorNext?: string;
	selectorPrev?: string;
	selectorPagination?: string;
	attributeClassSliding?: string;
	attributeClassShowing?: string;
	attributeClassShowingFirst?: string;
	attributeClassShowingLast?: string;
	attributeClassStart?: string;
	attributeClassEnd?: string;
	attributeSelectorSlides?: string;
	attributeSelectorNext?: string;
	attributeSelectorPrev?: string;
	attributeSelectorPagination?: string;
	attributePlay?: string;
	attributeLoop?: string;
	attributeSnap?: string;
	attributeStop?: string;
	attributeEventBeforeSlide?: string;
	attributeEventAfterSlide?: string;
};

type SpryJsSliderObject = {
	update: Function;
	destroy: Function;
};

export function slider({
	items = ".slider",
	classSliding = "sliding",
	classShowing = "showing",
	classShowingFirst = "showing-first",
	classShowingLast = "showing-last",
	classStart = "slider-start",
	classEnd = "slider-end",
	selectorSlides = ".slides",
	selectorNext = ".next",
	selectorPrev = ".prev",
	selectorPagination = ".pagination",
	attributeClassSliding = "data-slider-class-sliding",
	attributeClassShowing = "data-slider-class-showing",
	attributeClassShowingFirst = "data-slider-class-showing-first",
	attributeClassShowingLast = "data-slider-class-showing-last",
	attributeClassStart = "data-slider-class-start",
	attributeClassEnd = "data-slider-class-end",
	attributeSelectorSlides = "data-slider-selector-slides",
	attributeSelectorNext = "data-slider-selector-next",
	attributeSelectorPrev = "data-slider-selector-prev",
	attributeSelectorPagination = "data-slider-selector-pagination",
	attributePlay = "data-slider-play",
	attributeLoop = "data-slider-loop",
	attributeSnap = "data-slider-snap",
	attributeStop = "data-slider-stop",
	attributeEventBeforeSlide = "data-slider-event-before-slide",
	attributeEventAfterSlide = "data-slider-event-after-slide",
}: SpryJsSliderOptions = {}): {destroy: Function, update: Function} {

	let controller: AbortController | null = null;
	let isSelecting = false;
	let sliders: SpryJsSliderObject[] = [];

	const styleSheet = new CSSStyleSheet();
	styleSheet.replaceSync(".spryJsSliderHide { display: none !important; }");

	function createSliderObject(slider: Element): SpryJsSliderObject | null {
		
		const play = parseInt((slider.getAttribute(attributePlay) || 0).toString());
		const loop = slider.hasAttribute(attributeLoop);
		const snap = slider.hasAttribute(attributeSnap);
		const stop = slider.getAttribute(attributeStop);
		const next = slider.querySelector(slider.getAttribute(attributeSelectorNext) ?? selectorNext);
		const prev = slider.querySelector(slider.getAttribute(attributeSelectorPrev) ?? selectorPrev);
		const pagination = slider.querySelector(slider.getAttribute(attributeSelectorPagination) ?? selectorPagination);
		const slides = slider.querySelector(slider.getAttribute(attributeSelectorSlides) ?? selectorSlides);
		let   slidesCount = slides ? slides.children.length : 0;
		let   slidesShowingCount: number = 0;
		let   isSliding: boolean = false;
		let   isLoopScrollScrolling: boolean = false;
		let   toIndex: number | null = null;

		const getClassSliding = slider.getAttribute(attributeClassSliding);
		const sliderClassSliding: string[] = getClassSliding ? getClassSliding.split(' ') : (typeof classSliding === 'string' ? classSliding.split(' ') : []);

		const getClassShowing = slider.getAttribute(attributeClassShowing);
		const sliderClassShowing: string[] = getClassShowing ? getClassShowing.split(' ') : (typeof classShowing === 'string' ? classShowing.split(' ') : []);

		const getClassShowingFirst = slider.getAttribute(attributeClassShowingFirst);
		const sliderClassShowingFirst: string[] = getClassShowingFirst ? getClassShowingFirst.split(' ') : (typeof classShowingFirst === 'string' ? classShowingFirst.split(' ') : []);
		
		const getClassShowingLast = slider.getAttribute(attributeClassShowingLast);
		const sliderClassShowingLast: string[] = getClassShowingLast ? getClassShowingLast.split(' ') : (typeof classShowingLast === 'string' ? classShowingLast.split(' ') : []);

		const getClassStart = slider.getAttribute(attributeClassStart);
		const sliderClassStart: string[] = getClassStart ? getClassStart.split(' ') : (typeof classStart === 'string' ? classStart.split(' ') : []);
		
		const getClassEnd = slider.getAttribute(attributeClassEnd);
		const sliderClassEnd: string[] = getClassEnd ? getClassEnd.split(' ') : (typeof classEnd === 'string' ? classEnd.split(' ') : []);

		// Events
		const eventBeforeSlide = slider.getAttribute(attributeEventBeforeSlide);
		const eventAfterSlide = slider.getAttribute(attributeEventAfterSlide);

		let currentIndex: number;
		let scrollTimer: Timer | null = null;
		let playTimer: Timer | null = null;
		let isPaused = false;

		if (!document.body.contains(slider) || !slides || (!next && !prev && !loop && !stop && !play)) return null;

		function isVisible(): boolean {
			if (!slider || !document.body.contains(slider)) return false;
			var rect = slider.getBoundingClientRect();
			return (rect.bottom >= 0 && rect.top <= (window.innerHeight || document.documentElement.clientHeight));
		}

		function goTo(to: number | string, instant?: boolean) {
			
			if (!slides) return;
			var scrollPosition = 0, offsetSlides = loop ? slider.sliderCount : 0, width = (slides as HTMLElement).offsetWidth;
			if (snap) {
				var firstChild = slider.querySelector(selectorSlides+' > :first-child');
				if (firstChild) width = (firstChild as HTMLElement).offsetWidth;
			}

			if (to === 'next') {
				scrollPosition = (slides.scrollLeft + width);
				toIndex = currentIndex + (snap ? 1 : slidesShowingCount);
				if (toIndex > (slidesCount - 1)) {
					toIndex = loop ? 0 : (slidesCount - 1);
				}
			} else if (to === 'prev') {
				scrollPosition = (slides.scrollLeft - width);
				toIndex = currentIndex - (snap ? 1 : slidesShowingCount);
				if (toIndex < 0) {
					toIndex = loop ? (slidesCount - 1) : 0;
				}
			} else if (typeof to === 'number' && Number.isInteger(to)) {
				var child = slides.children[(to + offsetSlides)];
				if (child) {
					toIndex = to;
					scrollPosition = (child as HTMLElement).offsetLeft;
				}
			}

			playStop();
			
			slides.scrollTo({ left: scrollPosition, behavior: instant ? 'instant' : 'smooth' });
		}

		function playPause() {
			isPaused = true;
		}

		function playResume() {
			isPaused = false;
		}

		function playStop() {
			if (playTimer) {
				clearTimeout(playTimer);
				playTimer = null;
				playPause();
			}
		}

		function playStart() {
			if (play && !isPaused && document.body.contains(slider)) {
				if (playTimer) {
					clearTimeout(playTimer);
					playTimer = null;
				}
				playTimer = setTimeout(() => {
					if (isVisible() && !isPaused) {
						goTo('next');
					}
					resetPlay();
				}, play);
			}
		}

		function resetPlay() {
			playStop();
			playResume();
			playStart();
		}
		
		function goToNext() {
			goTo('next');
		}

		function goToPrev() {
			goTo('prev');
		}

		function getIndex(): number {
			if (slides) {
				const sliderLeft = slider.getBoundingClientRect().left;
				for (let c = 0; c < slides.children.length; c++) {
					var left = Math.round((slides.children[c] as HTMLElement).getBoundingClientRect().left - sliderLeft);
					if (left >= -50 && left < slides.clientWidth) {
						return (loop && slider && slider.sliderCount) ? ((c === slider.sliderCount * 2) ? 0 : c - slider.sliderCount) : c;
					}
				}
			}
			
			return 0;
		}

		function beforeSlideEvent(current: number, to: number | null) {
			const beforeSlideChanged = new CustomEvent('spryjs-slider-event-before-slide', {detail: {currentIndex: current, toIndex: to}});
			slider.dispatchEvent(beforeSlideChanged);
			if (eventBeforeSlide && (window as { [key: string]: any })[eventBeforeSlide] && typeof (window as { [key: string]: any })[eventBeforeSlide] === 'function') {
				(window as { [key: string]: any })[eventBeforeSlide](current, to);
			}
		}

		function afterSlideEvent(current: number) {
			const afterSlideChanged = new CustomEvent('spryjs-slider-event-after-slide', {detail: {currentIndex: current}});
			slider.dispatchEvent(afterSlideChanged);
			if (eventAfterSlide && (window as { [key: string]: any })[eventAfterSlide] && typeof (window as { [key: string]: any })[eventAfterSlide] === 'function') {
				(window as { [key: string]: any })[eventAfterSlide](current);
			}
		}

		function sliderScroll() {
			if (!isSliding) {
				isSliding = true;
				if (!isLoopScrollScrolling) {
					beforeSlideEvent(currentIndex, toIndex);
				}
			}
			requestAnimationFrame(() => {
				if (sliderClassSliding) slider.classList.add(...sliderClassSliding);
			});
			if (scrollTimer) clearTimeout(scrollTimer);
			playStop();
			scrollTimer = setTimeout(function () {
				if (!slider.sliderCount) return;
				currentIndex = getIndex();
				toIndex = null;
				isSliding = false;
				isLoopScrollScrolling = false;
				resetPlay();
				if (loop && slides) {
					var blockWidth = (slides.scrollWidth / 3);
					if (slides.scrollLeft < blockWidth) {
						var offset = blockWidth - slides.scrollLeft;
						isLoopScrollScrolling = true;
						slides.scrollTo({ left: (((blockWidth * 2) - offset)), behavior: 'instant' });
					}
					if (slides.scrollLeft >= (blockWidth * 2)) {
						var offset = slides.scrollLeft - (blockWidth * 2);
						isLoopScrollScrolling = true;
						slides.scrollTo({ left: blockWidth + offset, behavior: 'instant' });
					}
				}
				
				if (slidesShowingCount) {
					if (sliderClassShowingFirst && typeof sliderClassShowingFirst !== 'string') {
						preLoadImages(slider.querySelector('.'+sliderClassShowingFirst.join('.')), 'prev', slidesShowingCount);
					}
					if (sliderClassShowingLast && typeof sliderClassShowingLast !== 'string') {
						preLoadImages(slider.querySelector('.'+sliderClassShowingLast.join('.')), 'next', slidesShowingCount);
					}
				}

				if (!isLoopScrollScrolling) {
					afterSlideEvent(currentIndex);
				}

				requestAnimationFrame(() => {
					updateClasses();
				});
			}, 50);
		}

		function preLoadImages (elem: HTMLImageElement | null, type: string, total: number) {
			if (!elem) return;
			var i = 0;
			var imageSrcs = [];
			while ((elem = type === "next" ? (elem.nextSibling as HTMLImageElement) : (elem.previousSibling as HTMLImageElement))) {
				if (i >= total || !elem.nodeType || elem.nodeType === 3) continue; // text node
				var loading = elem.getAttribute("loading");
				if (elem.tagName === 'IMG' && loading && loading.toLowerCase() === 'lazy') {
					imageSrcs.push(elem.src);
				} else {
					elem.querySelectorAll('img[loading="lazy"]').forEach(img => {
						imageSrcs.push((img as HTMLImageElement).src);
					});
				}
				i++;
			}
			imageSrcs.forEach(imageSrc => {
				var newImg = new Image();
				newImg.src = imageSrc;
			});
		}

		function getShowing() {
			let showing = [];
			if (slides) {
				const sliderLeft = slider.getBoundingClientRect().left;
				for (let c = 0; c < slides.children.length; c++) {
					var left = Math.round(slides.children[c].getBoundingClientRect().left - sliderLeft);						
					if ((left >= -50 && left < slides.clientWidth)) {
						showing.push(slides.children[c]);
					}
				};
			}
			return showing;
		}

		function updateClasses() {

			if (slides) {
				const showing = getShowing();
				const emptyClasses: string[] = [];
				const allClasses = emptyClasses.concat(sliderClassShowing, sliderClassShowingFirst, sliderClassShowingLast);
				const firstClasses = emptyClasses.concat(sliderClassShowing, sliderClassShowingFirst);
				const lastClasses = emptyClasses.concat(sliderClassShowing, sliderClassShowingLast);

				slidesShowingCount = showing ? showing.length : 0;
				
				for (let c = 0; c < slides.children.length; c++) {
					slides.children[c].classList.remove(...allClasses);
				};

				for (let s = 0; s < showing.length; s++) {
					if (!s && (s+1) === showing.length) {
						showing[s].classList.add(...allClasses);
					} else if (!s) {
						showing[s].classList.add(...firstClasses);
					} else if ((s+1) === showing.length) {
						showing[s].classList.add(...lastClasses);
					} else {
						showing[s].classList.add(...sliderClassShowing);
					}
				}

				// Update Pagination Active Classes
				if (pagination && currentIndex !== undefined) {
					pagination.querySelector('.active')?.classList.remove('active');
					pagination.children[currentIndex]?.classList.add('active');
				}

				if (sliderClassSliding) {
					slider.classList.remove(...sliderClassSliding);
				}

				// Update Start and End Classes
				if (!loop) {
					slider.classList.remove(...sliderClassStart, ...sliderClassEnd);
					if (!slides.scrollLeft) {
						slider.classList.add(...sliderClassStart);
					} else if (slides.scrollLeft + (slider as HTMLElement).offsetWidth >= (slides.scrollWidth - 2)) {
						slider.classList.add(...sliderClassEnd);
					}
				}

				// Update Display Classes
				for (let c = 0; c < slides.children.length; c++) {
					var index = loop ? c + slider.sliderCount : c;
					var d = slides.children[index] ? window.getComputedStyle((slides.children[index] as HTMLElement), null).display : null;
					if (loop) {
						(slides.children[c] as HTMLElement)?.classList.toggle('spryJsSliderHide', d === 'none');
						(slides.children[(c + (slider.sliderCount * 2))] as HTMLElement)?.classList.toggle('spryJsSliderHide', d === 'none');
					}
					if (pagination && pagination.children[c] && d !== null) {
						(pagination.children[c] as HTMLElement)?.classList.toggle('spryJsSliderHide', d === 'none');
					}
				}
			}
		}

		function sliderSelectionChange() {
			if (isVisible()) {
				var selection: Selection | null | string = document.getSelection();
				if (selection) {
					selection = selection.toString();
				}
				if (isSelecting && selection) {
					playStop();
				}
				if (!isSelecting && !selection && !playTimer) {
					resetPlay();
				}
			}
		}

		function sliderSelectStart() {
			isSelecting = true;
		}

		function sliderSelectEnd() {
			isSelecting = false;
		}

		function sliderHover() {
			playStop();
		}

		function sliderMouseOut() {
			resetPlay();
		}

		function removeLoop() {
			sliderDestroy();
		}

		function sliderAddEvents() {
            if (controller) {
				if (slides) {
					slides.addEventListener('scroll', sliderScroll, {signal: controller.signal});
					if (loop) {
						// Needed for Fire Fox Reload
						window.addEventListener('beforeunload', removeLoop, {signal: controller.signal});
					}
				}
				if (next) next.addEventListener('click', goToNext, {signal: controller.signal});
				if (prev) prev.addEventListener('click', goToPrev, {signal: controller.signal});
				if (play) {
					if (stop === 'hover') {
						slider.addEventListener('mouseover', sliderHover, {signal: controller.signal});
						slider.addEventListener('mouseout', sliderMouseOut, {signal: controller.signal});
					}
					if (stop === 'action') {
						document.addEventListener('selectionchange', sliderSelectionChange, {signal: controller.signal});
						slider.addEventListener('selectstart', sliderSelectStart, {signal: controller.signal});
						slider.addEventListener('mouseup', sliderSelectEnd, {signal: controller.signal});
						const buttons = slider.querySelectorAll('a, button');
						if (buttons) {
							for (let b = 0; b < buttons.length; b++) {
								buttons[b].addEventListener('mouseover', sliderHover, {signal: controller.signal});
								buttons[b].addEventListener('mouseout', sliderMouseOut, {signal: controller.signal});
							};
						}
					}
				}
				if (slides && slider.sliderCount && pagination && pagination.childNodes.length) {
					for (let index = 0; index < pagination.childNodes.length; index++) {
						pagination.childNodes[index].addEventListener('click', () => {
							goTo(index);
							for (let c = 0; c < pagination.children.length; c++) {
								pagination.children[c].classList.remove('active');
							}
							(pagination.childNodes[index] as HTMLElement).classList.add('active');
						}, {signal: controller.signal});
					}
				}
			}
		}

		function sliderUpdate() {
			if (!slider.sliderCount) {
				currentIndex = getIndex();
				slider.sliderCount = slides ? slides.childElementCount : 0;

				if (pagination && slider.sliderCount && pagination.childNodes.length !== slider.sliderCount) {
					for (let index = 0; index < slider.sliderCount; index++) {
						let btn = document.createElement("button");
						btn.setAttribute('title', 'Go To Slide ' + (index+1));
						if (index === currentIndex) {
							requestAnimationFrame(() => {
								btn.classList.add('active');
							});
						}

						pagination.append(btn);
					}
				}

				if (loop && slides) {
					var block = slides.innerHTML.trim();
					if (block) {						
						slides.innerHTML += block + block;
						goTo(currentIndex, true);
					}
				} else if (slides) {
					requestAnimationFrame(() => {
						slider.classList.add(...sliderClassStart);
					});
				}

				updateClasses();
			}

			if (!slider.sliderGoTo) {
				slider.sliderGoTo = goTo;
			}

			if (!slider.sliderGetIndex) {
				slider.sliderGetIndex = getIndex;
			}

			if (!slider.sliderUpdate) {
				slider.sliderUpdate = function() {
					sliderDestroy();
					sliderUpdate();
				};
			}

			requestAnimationFrame(() => {
				if (styleSheet) {
					const styleSheetIndex = document.adoptedStyleSheets.indexOf(styleSheet);
					if (styleSheetIndex < 0) {
						document.adoptedStyleSheets.push(styleSheet);
					}
				}
				resetPlay();
				sliderAddEvents();
			});
		}

		function sliderDestroy() {
			playStop();
			if (loop && slider.sliderCount && slides && selectorSlides && slides.childElementCount > slider.sliderCount) {
				slider.querySelectorAll(selectorSlides + '> :nth-child(-n+'+slider.sliderCount+'), '+selectorSlides + '> :nth-child(n+'+((slider.sliderCount*2)+1)+')').forEach(slide => {
					slide.remove();
				});
			}
			slider.sliderCount = 0;

			if (pagination) {
				pagination.innerHTML = '';
			}

			if (loop && slides) {
				goTo(currentIndex ? currentIndex : 0, true);
			}

			if (slider.sliderGoTo) {
				delete slider.sliderGoTo;
			}

			if (slider.sliderGetIndex) {
				delete slider.sliderGetIndex;
			}

			if (slider.sliderUpdate) {
				delete slider.sliderUpdate;
			}

			requestAnimationFrame(() => {
				if (styleSheet) {
					const styleSheetIndex = document.adoptedStyleSheets.indexOf(styleSheet);
					if (styleSheetIndex > -1) {
						document.adoptedStyleSheets.splice(styleSheetIndex, 1);
					}
				}
			});
		}

		sliderUpdate();

		return {
			update: sliderUpdate,
			destroy: sliderDestroy,
		}
	}
	
	function update() {
		destroy();

		if (!controller) {
			controller = new AbortController();
		}
		
		const elements = typeof items === 'object' ? items : document.querySelectorAll(items);
        if (elements) {
			for (let e = 0; e < elements.length; e++) {
				const sliderObject = createSliderObject(elements[e]);
				if (sliderObject) {
					sliders.push(sliderObject);
				}
			};
		}
    };

	function destroy() {
		if (controller) {
            controller.abort();
            controller = null;
        }
		if (sliders) {
			for (let s = 0; s < sliders.length; s++) {
				sliders[s].destroy();
			}
		}
		sliders = [];
    };
	
	update();

    return {
        destroy: destroy,
        update: update
    }
}
