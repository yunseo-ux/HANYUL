const ingredientButtons = [...document.querySelectorAll('[data-ingredient]')];
const heroImage = document.querySelector('#ingredient-hero-image');
const detailImage = document.querySelector('#ingredient-detail-image');
const productList = document.querySelector('#ingredient-product-list');
const bySlug = new Map(ingredientData.map(ingredient => [ingredient.slug, ingredient]));
let selectedIngredient;
const hero = document.querySelector('.ingredients-hero');
const heroImages = new Map(ingredientData.map(ingredient => {
  const image = ingredient.slug === ingredientData[0].slug ? heroImage : heroImage.cloneNode();
  if (image !== heroImage) {
    image.removeAttribute('id');
    heroImage.parentElement.append(image);
  }
  return [ingredient.slug, image];
}));
const progress = document.createElement('div');
progress.className = 'ingredients-progress';
progress.setAttribute('aria-hidden', 'true');
const progressFill = document.createElement('span');
progress.append(progressFill);
hero.append(progress);
const slideDuration = 5000;
let elapsed = 0;
let previousTime = null;
let heroVisible = false;

const setImage = (element, image, alt = '', fitFrame = false) => {
  element.src = image.src;
  element.alt = alt;
  element.removeAttribute('style');
  Object.assign(element.style, fitFrame ? {
    position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
    objectFit: 'cover', objectPosition: 'center',
  } : image.style);
};

const addLines = (element, text) => {
  const lines = text.split('\n');
  element.replaceChildren();
  lines.forEach((line, index) => {
    if (index) element.append(document.createElement('br'), document.createTextNode(' '));
    element.append(document.createTextNode(line));
  });
};

const renderIngredient = (slug, updateHistory = false) => {
  const ingredient = bySlug.get(slug) || ingredientData[0];
  selectedIngredient = ingredient;
  heroImages.forEach((image, imageSlug) => {
    image.classList.toggle('is-active', imageSlug === ingredient.slug);
  });
  setImage(detailImage, ingredient.detail, ingredient.name, true);
  const name = document.querySelector('#ingredient-name');
  name.textContent = ingredient.name;
  name.style.color = ingredient.nameColor;
  addLines(document.querySelector('#ingredient-title'), ingredient.title);
  document.querySelector('#ingredient-paragraphs').replaceChildren(...ingredient.paragraphs.map(text => {
    const paragraph = document.createElement('p');
    addLines(paragraph, text);
    return paragraph;
  }));
  productList.replaceChildren(...ingredient.products.map(product => {
    const card = document.createElement('article');
    card.className = 'ingredient-product';
    const imageFrame = document.createElement('div');
    imageFrame.className = 'ingredient-product-image';
    const image = document.createElement('img');
    setImage(image, product.image, product.name);
    imageFrame.append(image);
    if (product.badges.length) {
      const badges = document.createElement('div');
      badges.className = 'ingredient-product-badges';
      product.badges.forEach(text => {
        const badge = document.createElement('span');
        badge.textContent = text;
        badges.append(badge);
      });
      imageFrame.append(badges);
    }
    const cart = document.createElement('button');
    cart.type = 'button';
    cart.className = 'ingredient-cart';
    cart.textContent = '장바구니 담기';
    cart.disabled = true;
    cart.setAttribute('aria-disabled', 'true');
    const title = document.createElement('h3');
    title.textContent = product.name;
    card.append(imageFrame, cart, title);
    return card;
  }));
  ingredientButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.ingredient === ingredient.slug)));
  document.querySelector('#ingredient-products-title').textContent = `${ingredient.name} 관련 상품`;
  document.querySelector('#ingredient-status').textContent = `${ingredient.name} 원료 소개, 관련 상품 ${ingredient.products.length}개`;
  document.title = `${ingredient.name} — 한율의 원료 | 한율`;
  if (updateHistory) {
    const url = new URL(location.href);
    url.searchParams.set('ingredient', ingredient.slug);
    history.pushState({ ingredient: ingredient.slug }, '', url);
  }
};

heroImages.forEach((image, slug) => setImage(image, bySlug.get(slug).hero, '', true));
const selectIngredient = (slug, updateHistory = false) => {
  const index = Math.max(0, ingredientData.findIndex(ingredient => ingredient.slug === slug));
  elapsed = 0;
  previousTime = null;
  renderIngredient(ingredientData[index].slug, updateHistory);
  progressFill.style.width = '0%';
};
ingredientButtons.forEach(button => {
  button.addEventListener('click', () => selectIngredient(button.dataset.ingredient, true));
});
new IntersectionObserver(entries => {
  heroVisible = entries[0].intersectionRatio >= .5;
  previousTime = null;
}, { threshold: [0, .5, 1] }).observe(hero);
document.addEventListener('visibilitychange', () => { previousTime = null; });
const advanceIngredients = time => {
  if (heroVisible && !document.hidden) {
    if (previousTime !== null) elapsed += time - previousTime;
    previousTime = time;
    if (elapsed >= slideDuration) {
      const index = ingredientData.indexOf(selectedIngredient);
      const steps = Math.floor(elapsed / slideDuration);
      elapsed %= slideDuration;
      renderIngredient(ingredientData[(index + steps) % ingredientData.length].slug);
    }
    progressFill.style.width = `${elapsed / slideDuration * 100}%`;
  } else previousTime = null;
  requestAnimationFrame(advanceIngredients);
};
window.addEventListener('popstate', () => selectIngredient(new URLSearchParams(location.search).get('ingredient')));
selectIngredient(new URLSearchParams(location.search).get('ingredient'));
requestAnimationFrame(advanceIngredients);
