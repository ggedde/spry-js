//!
//! SpryJs Sliders Module

declare global {
    interface Element {
        sliderGoTo?: Function;
        sliderGetIndex?: Function;
        spryJsSliderCount: number;
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
	attributeEventSlide?: string;
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
	attributeEventSlide = "data-slider-event-slide",
}: SpryJsSliderOptions = {}): {destroy: Function, update: Function} {

	let controller: AbortController | null = null;
	let isSelecting = false;
	let sliders: SpryJsSliderObject[] = [];

	function createSliderObject(slider: Element): SpryJsSliderObject | null {
		
		const play = parseInt((slider.getAttribute(attributePlay) || 0).toString());
		const loop = slider.hasAttribute(attributeLoop);
		const snap = slider.hasAttribute(attributeSnap);
		const stop = slider.getAttribute(attributeStop);
		const next = slider.querySelector(slider.getAttribute(attributeSelectorNext) ?? selectorNext);
		const prev = slider.querySelector(slider.getAttribute(attributeSelectorPrev) ?? selectorPrev);
		const pagination = slider.querySelector(slider.getAttribute(attributeSelectorPagination) ?? selectorPagination);
		const slides = slider.querySelector(slider.getAttribute(attributeSelectorSlides) ?? selectorSlides);

		let sliderClassSliding = slider.getAttribute(attributeClassSliding) ?? classSliding;
		if (sliderClassSliding && typeof sliderClassSliding === 'string') {
			sliderClassSliding = sliderClassSliding.split(' ');
		}

		let sliderClassShowing = slider.getAttribute(attributeClassShowing) ?? classShowing;
		if (sliderClassShowing && typeof sliderClassShowing === 'string') {
			sliderClassShowing = sliderClassShowing.split(' ');
		}

		let sliderClassShowingFirst = slider.getAttribute(attributeClassShowingFirst) ?? classShowingFirst;
		if (sliderClassShowingFirst && typeof sliderClassShowingFirst === 'string') {
			sliderClassShowingFirst = sliderClassShowingFirst.split(' ');
		}

		let sliderClassShowingLast = slider.getAttribute(attributeClassShowingLast) ?? classShowingLast;
		if (sliderClassShowingLast && typeof sliderClassShowingLast === 'string') {
			sliderClassShowingLast = sliderClassShowingLast.split(' ');
		}

		let sliderClassStart = slider.getAttribute(attributeClassStart) ?? classStart;
		if (sliderClassStart && typeof sliderClassStart === 'string') {
			sliderClassStart = sliderClassStart.split(' ');
		}

		let sliderClassEnd = slider.getAttribute(attributeClassEnd) ?? classEnd;
		if (sliderClassEnd && typeof sliderClassEnd === 'string') {
			sliderClassEnd = sliderClassEnd.split(' ');
		}

		// Events
		const eventSlide = slider.getAttribute(attributeEventSlide);

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
			var scrollPosition = 0, offsetSlides = loop ? slider.spryJsSliderCount : 0, width = (slides as HTMLElement).offsetWidth;
			if (snap) {
				var firstChild = slider.querySelector(selectorSlides+' > :first-child');
				if (firstChild) width = (firstChild as HTMLElement).offsetWidth;
			}

			if (to === 'next') {
				scrollPosition = (slides.scrollLeft + width);
			} else if (to === 'prev') {
				scrollPosition = (slides.scrollLeft - width);
			} else {
				var child = slides.children[(parseFloat(to.toString()) + offsetSlides)];
				if (child) {
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
						return (loop && slider && slider.spryJsSliderCount) ? ((c === slider.spryJsSliderCount * 2) ? 0 : c - slider.spryJsSliderCount) : c;
					}
				}
			}
			
			return 0;
		}

		function sliderScroll() {
			if (sliderClassSliding) slider.classList.add(...sliderClassSliding);
			slider.classList.remove(...sliderClassStart, ...sliderClassEnd);
			if (scrollTimer) clearTimeout(scrollTimer);
			playStop();
			scrollTimer = setTimeout(function () {
				if (!slider.spryJsSliderCount) return;
				if (sliderClassSliding) slider.classList.remove(...sliderClassSliding);
				resetPlay();
				let loopScroll = false;
				if (loop && slides) {
					var blockWidth = (slides.scrollWidth / 3);
					if (slides.scrollLeft < blockWidth) {
						var offset = blockWidth - slides.scrollLeft;
						slides.scrollTo({ left: (((blockWidth * 2) - offset)), behavior: 'instant' });
						loopScroll = true;
					}
					if (slides.scrollLeft >= (blockWidth * 2)) {
						var offset = slides.scrollLeft - (blockWidth * 2);
						slides.scrollTo({ left: blockWidth + offset, behavior: 'instant' });
						loopScroll = true;
					}

				} else if(slides) {
					if (!slides.scrollLeft) {
						slider.classList.add(...sliderClassStart);
					} else if (slides.scrollLeft + (slider as HTMLElement).offsetWidth >= (slides.scrollWidth - 2)) {
						slider.classList.add(...sliderClassEnd);
					}
				}

				const sliderLeft = slider.getBoundingClientRect().left;
				if (slides) {
					for (let c = 0; c < slides.children.length; c++) {
						slides.children[c].classList.remove(...sliderClassShowingFirst);
						slides.children[c].classList.remove(...sliderClassShowingLast);
						var left = Math.round(slides.children[c].getBoundingClientRect().left - sliderLeft);						
						if (sliderClassShowing) {
							if ((left >= -50 && left < slides.clientWidth)) {
								slides.children[c].classList.add(...sliderClassShowing);
							} else {
								slides.children[c].classList.remove(...sliderClassShowing);
							}
						}
					};
				}

				currentIndex = getIndex();
				var showing = sliderClassShowing && typeof sliderClassShowing !== 'string' ? slider.querySelectorAll('.'+sliderClassShowing.join('.')) : false;
				if (showing && showing.length && currentIndex !== undefined) {
					if (pagination && slides) {
						pagination.querySelectorAll('.active').forEach(active => {
							active.classList.remove('active');
						});
						if (pagination.children[currentIndex]) {
							pagination.children[currentIndex].classList.add('active');
						}
					}
					showing[0].classList.add(...sliderClassShowingFirst);
					showing[showing.length - 1].classList.add(...sliderClassShowingLast);
					var preLoadImages = function (elem: HTMLImageElement | null, type: string, total: number) {
						var i = 0;
						var imageSrcs = [];
						if (!elem) return;
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
					if (sliderClassShowingFirst && typeof sliderClassShowingFirst !== 'string') {
						preLoadImages(slider.querySelector('.'+sliderClassShowingFirst.join('.')), 'next', showing.length);
					}
					if (sliderClassShowingLast && typeof sliderClassShowingLast !== 'string') {
						preLoadImages(slider.querySelector('.'+sliderClassShowingLast.join('.')), 'prev', showing.length);
					}
				}
				if (!loopScroll) {
					const slideChanged =  new CustomEvent('spryjs-slider-event-slide', {detail: {index: currentIndex}});
					slider.dispatchEvent(slideChanged);

					if (eventSlide && (window as { [key: string]: any })[eventSlide] && typeof (window as { [key: string]: any })[eventSlide] === 'function') {
						(window as { [key: string]: any })[eventSlide](currentIndex);
					}
				}
			}, 100);
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
				if (slides && slider.spryJsSliderCount && pagination && pagination.childNodes.length) {
					for (let index = 0; index < pagination.childNodes.length; index++) {
						pagination.childNodes[index].addEventListener('click', () => {
							goTo(index);
							Array.from(pagination.children).forEach(paginate => {
								paginate.classList.remove('active');
							});
							(pagination.childNodes[index] as HTMLElement).classList.add('active');
						}, {signal: controller.signal});
					}
				}
			}
		}

		function sliderUpdate() {

			if (!slider.spryJsSliderCount) {
				currentIndex = getIndex();
				slider.spryJsSliderCount = slides ? slides.childElementCount : 0;
				if (pagination && slider.spryJsSliderCount && pagination.childNodes.length !== slider.spryJsSliderCount) {
					for (let index = 0; index < slider.spryJsSliderCount; index++) {
						let btn = document.createElement("button");
						if (index === currentIndex) btn.classList.add('active');
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
					slides.dispatchEvent(new CustomEvent('scroll'));
					slider.classList.add(...sliderClassStart);
				}
			}

			if (!slider.sliderGoTo) {
				slider.sliderGoTo = goTo;
			}

			if (!slider.sliderGetIndex) {
				slider.sliderGetIndex = getIndex;
			}

			resetPlay();
			sliderAddEvents();
		}

		function sliderDestroy() {
			playStop();
			if (loop && slider.spryJsSliderCount && slides && selectorSlides && slides.childElementCount > slider.spryJsSliderCount) {
				slider.querySelectorAll(selectorSlides + '> :nth-child(-n+'+slider.spryJsSliderCount+'), '+selectorSlides + '> :nth-child(n+'+((slider.spryJsSliderCount*2)+1)+')').forEach(slide => {
					slide.remove();
				});
			}
			slider.spryJsSliderCount = 0;

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
