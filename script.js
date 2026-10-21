const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.primary-nav');

document.documentElement.classList.add('js');

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? '메뉴 열기' : '메뉴 닫기');
  navigation.classList.toggle('is-open', !isOpen);
});

const materialSection = document.querySelector('.material-scroll');
const materialCards = [...document.querySelectorAll('.material-card')];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const brandPhotoSection = document.querySelector('.brand-photo');
const heroSection = document.querySelector('.hero');

const photoWordmark = document.querySelector('.brand-photo-wordmark');

if (brandPhotoSection && photoWordmark) {
  let wordmarkTicking = false;
  const renderWordmark = () => {
    const top = brandPhotoSection.getBoundingClientRect().top;
    const sticky = brandPhotoSection.querySelector('.brand-photo-sticky');
    const range = Math.max(brandPhotoSection.offsetHeight - sticky.offsetHeight, 1);
    const progress = reduceMotion.matches ? 1 : Math.min(Math.max(
      (-top / range - 0.1) / 0.8, 0,
    ), 1);
    photoWordmark.style.clipPath = `inset(0 ${(1 - progress) * 100}% 0 0)`;
    wordmarkTicking = false;
  };
  const requestWordmark = () => {
    if (wordmarkTicking) return;
    wordmarkTicking = true;
    window.requestAnimationFrame(renderWordmark);
  };
  window.addEventListener('scroll', requestWordmark, { passive: true });
  window.addEventListener('resize', requestWordmark);
  window.addEventListener('load', requestWordmark, { once: true });
  reduceMotion.addEventListener('change', requestWordmark);
  renderWordmark();
}

const hoverVideo = document.querySelector('.wave-video video');
const hoverPointer = window.matchMedia('(hover: hover) and (pointer: fine)');

if (hoverVideo) {
  let resumeAfterHover = false;
  hoverVideo.addEventListener('pointerenter', () => {
    if (!hoverPointer.matches) return;
    resumeAfterHover = !hoverVideo.paused;
    hoverVideo.pause();
  });
  const resumeVideo = () => {
    if (resumeAfterHover) {
      hoverVideo.play().catch(() => {});
      resumeAfterHover = false;
    }
  };
  hoverVideo.addEventListener('pointerleave', resumeVideo);
  hoverVideo.addEventListener('pointercancel', resumeVideo);
}

const productInkCharacters = new Map();
const deferredScrollAnimations = [];
const inkTitles = [...document.querySelectorAll('#brand-intro-title, #line-intro-title, #catalog-title, .product-copy-state h2')];

inkTitles.forEach((introTitle) => {
  const isPinned = introTitle.id === 'brand-intro-title';
  const introSection = introTitle.closest('section');
  const introCopy = (isPinned
    ? [introTitle, introSection.querySelector('p')]
    : [introTitle]).filter(Boolean);
  introTitle.style.setProperty('--ink-color', getComputedStyle(introTitle).color);
  const characters = [];

  introCopy.forEach((element) => {
    element.setAttribute('aria-label', element.innerText.replace(/\s*\n\s*/g, ' '));
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach((node) => {
      const fragment = document.createDocumentFragment();
      Array.from(node.textContent).forEach((character) => {
        const span = document.createElement('span');
        span.className = 'intro-ink-char';
        span.textContent = character;
        span.setAttribute('aria-hidden', 'true');
        fragment.appendChild(span);
        if (character.trim()) characters.push(span);
      });
      node.replaceWith(fragment);
    });
  });

  if (introTitle.closest('.product-copy-state')) {
    productInkCharacters.set(introTitle.closest('.product-copy-state'), characters);
    return;
  }

  if (introTitle.id === 'catalog-title' && !reduceMotion.matches
    && window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    const ink = { progress: 0 };
    const renderCatalogInk = () => {
      characters.forEach((character, index) => {
        const fill = Math.min(Math.max(ink.progress * characters.length - index, 0), 1);
        character.style.setProperty('--ink-fill', `${fill * 100}%`);
      });
    };
    renderCatalogInk();
    // Create this pin after the product pin above it in the document.
    deferredScrollAnimations.push(() => window.gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      window.gsap.timeline({
        defaults: { ease: 'none' },
        onUpdate: renderCatalogInk,
        scrollTrigger: {
          trigger: introSection,
          start: 'top top',
          end: () => `+=${window.innerHeight * 1.5}`,
          pin: true,
          pinSpacing: true,
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      })
        .to(ink, { progress: 1, duration: 1 })
        .to(ink, { progress: 1, duration: 0.5 });
      return () => {
        ink.progress = 1;
        renderCatalogInk();
      };
    }));
    return;
  }

  let introTicking = false;
  const updateIntroInk = () => {
    const scrollRange = Math.max(introSection.offsetHeight - window.innerHeight, 1);
    const pinnedProgress = -introSection.getBoundingClientRect().top / scrollRange;
    const revealProgress = isPinned
      ? (pinnedProgress - 0.1) / 0.8
      : (window.innerHeight * 0.75 - introTitle.getBoundingClientRect().top)
        / (window.innerHeight * 0.6);
    const progress = reduceMotion.matches ? 1 : Math.min(Math.max(revealProgress, 0), 1);
    characters.forEach((character, index) => {
      const fill = Math.min(Math.max(progress * characters.length - index, 0), 1);
      character.style.setProperty('--ink-fill', `${fill * 100}%`);
    });
    introTicking = false;
  };
  const requestIntroInk = () => {
    if (introTicking) return;
    introTicking = true;
    window.requestAnimationFrame(updateIntroInk);
  };

  window.addEventListener('scroll', requestIntroInk, { passive: true });
  window.addEventListener('resize', requestIntroInk);
  window.addEventListener('load', requestIntroInk, { once: true });
  reduceMotion.addEventListener('change', requestIntroInk);
  document.fonts.ready.then(requestIntroInk);
  updateIntroInk();
});

const brandKo = document.querySelector('.brand-ko');
const brandHanja = document.querySelector('.brand-hanja');
const hanjaHan = document.querySelector('.hanja-han');
const hanjaRyul = document.querySelector('.hanja-ryul');
const koInkMain = document.querySelector('.brand-ko .ink-main');
const hanInkMain = document.querySelector('.hanja-han .ink-main');
const ryulInkMain = document.querySelector('.hanja-ryul .ink-main');
const waterBlob = document.querySelector('.water-blob');
const marqueeTracks = [...document.querySelectorAll('.hero-marquee-track')];

if (heroSection && brandKo && brandHanja && hanjaHan && hanjaRyul && koInkMain && hanInkMain && ryulInkMain && waterBlob && marqueeTracks.length) {
  if (reduceMotion.matches || typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') {
    brandKo.style.opacity = '0';
    brandHanja.style.opacity = '1';
    hanjaHan.style.opacity = '1';
    hanjaHan.style.filter = 'none';
    hanjaRyul.style.opacity = '1';
    hanjaRyul.style.filter = 'none';
  } else {
    window.gsap.registerPlugin(window.ScrollTrigger);
    window.gsap.set(marqueeTracks[1], { xPercent: -22 });
    window.gsap.set(brandHanja, { opacity: 0, scale: 0.96 });
    window.gsap.set(brandKo, { '--bleed-opacity': 0.12 });
    window.gsap.set(hanjaHan, {
      x: () => -Math.min(window.innerWidth * 0.22, 320),
      y: -28,
      rotation: -3,
      opacity: 0,
      filter: 'blur(24px)',
      '--bleed-opacity': 0.34,
    });
    window.gsap.set(hanjaRyul, {
      x: () => Math.min(window.innerWidth * 0.22, 320),
      y: 32,
      rotation: 3,
      opacity: 0,
      filter: 'blur(24px)',
      '--bleed-opacity': 0.34,
    });

    window.gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: {
        trigger: heroSection,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        invalidateOnRefresh: true,
      },
    })
      .to(marqueeTracks[0], { xPercent: -22, ease: 'none', duration: 6 }, 0)
      .to(marqueeTracks[1], { xPercent: 0, ease: 'none', duration: 6 }, 0)
      .from(brandKo, {
        opacity: 0,
        filter: 'blur(14px)',
        scale: 0.94,
        '--bleed-opacity': 0.04,
        duration: 1,
      }, 0.15)
      .from(koInkMain, { backgroundPosition: '8% 22%', duration: 1 }, 0.15)
      .to(brandKo, { '--bleed-opacity': 0.22, duration: 0.75 }, 0.35)
      .to(waterBlob, { opacity: 1, scale: 1.12, duration: 1.25 }, 1.05)
      .to(brandKo, {
        opacity: 0,
        filter: 'blur(26px)',
        letterSpacing: '0.38em',
        scale: 1.1,
        '--bleed-opacity': 0.38,
        ease: 'power2.inOut',
        duration: 1.7,
      }, 1.35)
      .to(koInkMain, { backgroundPosition: '86% 72%', ease: 'power2.inOut', duration: 1.7 }, 1.35)
      .to(brandHanja, { opacity: 1, duration: 0.35 }, 2.75)
      .to(hanjaHan, {
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
        filter: 'blur(0px)',
        '--bleed-opacity': 0.2,
        ease: 'power2.inOut',
        duration: 2.15,
      }, 2.7)
      .to(hanInkMain, { backgroundPosition: '18% 28%', ease: 'power2.inOut', duration: 2.15 }, 2.7)
      .to(hanjaRyul, {
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
        filter: 'blur(0px)',
        '--bleed-opacity': 0.2,
        ease: 'power2.inOut',
        duration: 2.15,
      }, 2.92)
      .to(ryulInkMain, { backgroundPosition: '76% 62%', ease: 'power2.inOut', duration: 2.15 }, 2.92)
      .to(brandHanja, { scale: 1.03, ease: 'power2.out', duration: 0.42 }, 4.72)
      .to(brandHanja, { scale: 1, ease: 'power2.inOut', duration: 0.55 }, 5.14)
      .to(waterBlob, { opacity: 0.12, y: '12vh', scale: 1.24, duration: 1.6 }, 3.7);

    window.addEventListener('load', () => window.ScrollTrigger.refresh(), { once: true });
  }
}

if (brandPhotoSection && heroSection) {
  let headerTicking = false;

  const updateHeaderVisibility = () => {
    const isHeroVisible = heroSection.getBoundingClientRect().bottom > 0;
    const hasReachedBrandPhoto = brandPhotoSection.getBoundingClientRect().top <= window.innerHeight;
    const shouldHideHeader = !isHeroVisible && !hasReachedBrandPhoto;
    document.body.classList.toggle('before-brand-photo', shouldHideHeader);
    headerTicking = false;
  };

  const requestHeaderUpdate = () => {
    if (!headerTicking) {
      window.requestAnimationFrame(updateHeaderVisibility);
      headerTicking = true;
    }
  };

  window.addEventListener('scroll', requestHeaderUpdate, { passive: true });
  window.addEventListener('resize', requestHeaderUpdate);
  updateHeaderVisibility();
}

if (materialSection) {
  const materialObserver = new IntersectionObserver(([entry]) => {
    document.body.classList.toggle('material-active', entry.isIntersecting);
  });

  materialObserver.observe(materialSection);
}

if (materialSection && materialCards.length && !reduceMotion.matches) {
  let ticking = false;

  const updateMaterialCards = () => {
    const sectionTop = materialSection.getBoundingClientRect().top + window.scrollY;
    const scrollRange = Math.max(materialSection.offsetHeight - window.innerHeight, 1);
    const progress = Math.min(Math.max((window.scrollY - sectionTop) / scrollRange, 0), 1);
    const thresholds = [0.015, 0.35, 0.7];

    materialCards.forEach((card, index) => {
      const isActive = progress >= thresholds[index];
      card.style.setProperty('--card-offset', isActive ? '0%' : '108%');
      card.style.setProperty('--card-opacity', isActive ? '1' : '0');
      card.style.setProperty('--card-scale', isActive ? '1' : '0.985');
    });

    ticking = false;
  };

  const requestMaterialUpdate = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateMaterialCards);
      ticking = true;
    }
  };

  window.addEventListener('scroll', requestMaterialUpdate, { passive: true });
  window.addEventListener('resize', requestMaterialUpdate);
  requestMaterialUpdate();
}

const productsSection = document.querySelector('.products-scroll');
const productLayers = [...document.querySelectorAll('.product-layer')];
const productCopies = [...document.querySelectorAll('.product-copy-state')];
const productDots = [...document.querySelectorAll('.products-pagination button')];

if (productsSection && productLayers.length && !reduceMotion.matches) {
  const productsSticky = productsSection.querySelector('.products-sticky');

  if (typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined' && productsSticky) {
    window.gsap.registerPlugin(window.ScrollTrigger);

    const setCopyState = (activeIndex, progress) => {
      productCopies.forEach((copy, index) => {
        const isActive = index === activeIndex;
        window.gsap.set(copy, { opacity: isActive ? 1 : 0, visibility: isActive ? 'visible' : 'hidden', y: 0 });
        copy.setAttribute('aria-hidden', String(!isActive));
        const ranges = [[0, 0.1], [0.26, 0.42], [0.74, 0.9]];
        const [start, end] = ranges[index] || [0, 1];
        const fillProgress = Math.min(Math.max((progress - start) / (end - start), 0), 1);
        const characters = productInkCharacters.get(copy) || [];
        characters.forEach((character, characterIndex) => {
          const fill = Math.min(Math.max(fillProgress * characters.length - characterIndex, 0), 1);
          character.style.setProperty('--ink-fill', `${fill * 100}%`);
        });
      });
      productDots.forEach((dot, index) => {
        const isActive = index === activeIndex;
        dot.classList.toggle('is-active', isActive);
        if (isActive) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
    };

    const hideAllProductLayers = () => {
      productLayers.forEach((layer) => {
        layer.classList.remove('is-active');
          window.gsap.set(layer, { zIndex: 0, opacity: 0, visibility: 'hidden', filter: 'blur(0px)', '--sweep-angle': '0deg' });
      });
    };

    const renderProductState = (progress) => {
      let currentIndex = 0;
      let nextIndex = null;
      let transitionProgress = 0;

      if (progress < 0.1) {
        currentIndex = 0;
      } else if (progress < 0.42) {
        currentIndex = 0;
        nextIndex = 1;
        transitionProgress = (progress - 0.1) / 0.32;
      } else if (progress < 0.58) {
        currentIndex = 1;
      } else if (progress < 0.9) {
        currentIndex = 1;
        nextIndex = 2;
        transitionProgress = (progress - 0.58) / 0.32;
      } else {
        currentIndex = 2;
      }

      hideAllProductLayers();

      const currentLayer = productLayers[currentIndex];
      currentLayer.classList.add('is-active');
      window.gsap.set(currentLayer, { zIndex: 1, opacity: 1, visibility: 'visible' });

      let copyIndex = currentIndex;
      if (nextIndex !== null) {
        const revealProgress = Math.min(Math.max(transitionProgress, 0), 1);
        const easedProgress = revealProgress * revealProgress * (3 - 2 * revealProgress);
        const outgoingOpacity = 1 - easedProgress;
        const nextLayer = productLayers[nextIndex];
        window.gsap.set(currentLayer, {
          opacity: outgoingOpacity,
          visibility: outgoingOpacity > 0 ? 'visible' : 'hidden',
          filter: `blur(${(easedProgress * 12).toFixed(2)}px)`,
        });

        if (revealProgress > 0) {
          window.gsap.set(nextLayer, {
            zIndex: 2,
            opacity: 1,
            visibility: 'visible',
            '--sweep-angle': `${(easedProgress * 90).toFixed(3)}deg`,
          });
        }

        if (revealProgress >= 0.5) copyIndex = nextIndex;
      }

      setCopyState(copyIndex, progress);
    };

    const productProgress = { value: 0 };
    renderProductState(0);

    window.gsap.to(productProgress, {
      value: 1,
      ease: 'none',
      onUpdate: () => renderProductState(productProgress.value),
      scrollTrigger: {
        trigger: productsSection,
          refreshPriority: 1,
        start: 'top top',
        end: () => `+=${window.innerHeight * 2}`,
        pin: true,
        pinSpacing: true,
        scrub: 1.5,
        snap: {
          snapTo: [0, 0.42, 0.58, 0.9, 1],
          duration: { min: 0.25, max: 0.55 },
          delay: 0.08,
          ease: 'power2.inOut',
        },
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
  }
}

const storyRevealSection = document.querySelector('.story-reveal');
const storyRevealCopy = document.querySelector('.story-reveal-copy');

if (storyRevealSection && storyRevealCopy && !reduceMotion.matches) {
  let storyTicking = false;

  const updateStoryReveal = () => {
    const sectionTop = storyRevealSection.getBoundingClientRect().top + window.scrollY;
    const start = sectionTop - window.innerHeight * 0.35;
    const range = window.innerHeight * 1.75;
    const progress = Math.min(Math.max((window.scrollY - start) / range, 0), 1);
    const leftProgress = Math.min(progress / 0.58, 1);
    const rightProgress = Math.min(Math.max((progress - 0.5) / 0.5, 0), 1);
    const leftEased = leftProgress * leftProgress * (3 - 2 * leftProgress);
    const rightEased = rightProgress * rightProgress * (3 - 2 * rightProgress);

    storyRevealCopy.style.setProperty('--story-left-mask', `${((1 - leftEased) * 100).toFixed(3)}%`);
    storyRevealCopy.style.setProperty('--story-left-opacity', leftEased.toFixed(3));
    storyRevealCopy.style.setProperty('--story-right-mask', `${((1 - rightEased) * 100).toFixed(3)}%`);
    storyRevealCopy.style.setProperty('--story-right-opacity', rightEased.toFixed(3));
    storyTicking = false;
  };

  const requestStoryReveal = () => {
    if (!storyTicking) {
      window.requestAnimationFrame(updateStoryReveal);
      storyTicking = true;
    }
  };

  window.addEventListener('scroll', requestStoryReveal, { passive: true });
  window.addEventListener('resize', requestStoryReveal);
  requestStoryReveal();
}

const catalogTrack = document.querySelector('.catalog-track');
const catalogPrev = document.querySelector('.catalog-prev');
const catalogNext = document.querySelector('.catalog-next');

if (catalogTrack && catalogPrev && catalogNext) {
  const getCatalogStep = () => {
    const firstCard = catalogTrack.querySelector('.catalog-card');
    const gap = Number.parseFloat(getComputedStyle(catalogTrack).columnGap) || 0;
    return firstCard ? firstCard.getBoundingClientRect().width + gap : 0;
  };

  const updateCatalogControls = () => {
    const maxScroll = catalogTrack.scrollWidth - catalogTrack.clientWidth;
    catalogPrev.disabled = catalogTrack.scrollLeft <= 2;
    catalogNext.disabled = catalogTrack.scrollLeft >= maxScroll - 2;
  };

  catalogPrev.addEventListener('click', () => {
    catalogTrack.scrollBy({ left: -getCatalogStep(), behavior: 'smooth' });
  });

  catalogNext.addEventListener('click', () => {
    catalogTrack.scrollBy({ left: getCatalogStep(), behavior: 'smooth' });
  });

  let isCatalogDragging = false;
  let catalogDragStartX = 0;
  let catalogDragStartScroll = 0;

  catalogTrack.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    isCatalogDragging = true;
    catalogDragStartX = event.clientX;
    catalogDragStartScroll = catalogTrack.scrollLeft;
    catalogTrack.classList.add('is-dragging');
    catalogTrack.setPointerCapture(event.pointerId);
  });

  catalogTrack.addEventListener('pointermove', (event) => {
    if (!isCatalogDragging) return;
    const dragDistance = event.clientX - catalogDragStartX;
    catalogTrack.scrollLeft = catalogDragStartScroll - dragDistance;
  });

  const finishCatalogDrag = (event) => {
    if (!isCatalogDragging) return;
    isCatalogDragging = false;
    catalogTrack.classList.remove('is-dragging');
    if (catalogTrack.hasPointerCapture(event.pointerId)) {
      catalogTrack.releasePointerCapture(event.pointerId);
    }

    const step = getCatalogStep();
    if (step) {
      const target = Math.round(catalogTrack.scrollLeft / step) * step;
      catalogTrack.scrollTo({ left: target, behavior: 'smooth' });
    }
  };

  catalogTrack.addEventListener('pointerup', finishCatalogDrag);
  catalogTrack.addEventListener('pointercancel', finishCatalogDrag);

  catalogTrack.addEventListener('scroll', updateCatalogControls, { passive: true });
  window.addEventListener('resize', updateCatalogControls);
  updateCatalogControls();
}

// Initialize pins in page order so later sections include earlier pin spacing.
deferredScrollAnimations.forEach((initialize) => initialize());

if (window.ScrollTrigger) {
  const refreshScrollLayout = () => {
    window.ScrollTrigger.sort();
    window.ScrollTrigger.refresh();
    window.dispatchEvent(new Event('scroll'));
  };
  refreshScrollLayout();
  document.fonts.ready.then(refreshScrollLayout);
}
