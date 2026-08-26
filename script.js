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
const productReveals = [...document.querySelectorAll('.product-scene-reveal')];
const productDots = [...document.querySelectorAll('.products-pagination span')];

if (productsSection && productReveals.length && !reduceMotion.matches) {
  let productsTicking = false;
  const targetRadii = productReveals.map(() => 0);
  const currentRadii = productReveals.map(() => 0);

  const updateProducts = () => {
    const sectionTop = productsSection.getBoundingClientRect().top + window.scrollY;
    const scrollRange = Math.max(productsSection.offsetHeight - window.innerHeight, 1);
    const progress = Math.min(Math.max((window.scrollY - sectionTop) / scrollRange, 0), 1);

    productReveals.forEach((scene, index) => {
      const step = Math.min(Math.max((progress - index * 0.5) / 0.5, 0), 1);
      const eased = step * step * step * (step * (step * 6 - 15) + 10);
      targetRadii[index] = eased * 150;
    });

    const activeIndex = Math.min(Math.floor(progress * 3), 2);
    productDots.forEach((dot, index) => dot.classList.toggle('is-active', index === activeIndex));
  };

  const animateProducts = () => {
    updateProducts();
    let isSettled = true;

    productReveals.forEach((scene, index) => {
      const difference = targetRadii[index] - currentRadii[index];
      currentRadii[index] += difference * 0.09;
      if (Math.abs(difference) > 0.02) isSettled = false;
      else currentRadii[index] = targetRadii[index];
      scene.style.setProperty('--reveal-radius', `${currentRadii[index].toFixed(3)}vmax`);
    });

    if (isSettled) productsTicking = false;
    else window.requestAnimationFrame(animateProducts);
  };

  const requestProductsUpdate = () => {
    if (!productsTicking) {
      productsTicking = true;
      window.requestAnimationFrame(animateProducts);
    }
  };

  window.addEventListener('scroll', requestProductsUpdate, { passive: true });
  window.addEventListener('resize', requestProductsUpdate);
  requestProductsUpdate();
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
