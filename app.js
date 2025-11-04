
async function loadRecipes() {
  const res = await fetch('data/recipes.json');
  const data = await res.json();
  return data.recipes || [];
}
function truncate(text, n){ return text && text.length>n ? text.slice(0,n-1)+'…' : text; }
function renderCard(r){
  return `
  <article class="card" data-slug="${r.slug}">
    <img src="${r.image}" alt="${r.alt || r.title}" loading="lazy">
    <div class="card-body">
      <div class="badge">${r.age_range || '6+ months'}</div>
      <h3>${r.title}</h3>
      <div class="meta">${(r.ingredients||[]).length} ingredients • ${r.time || '10 min'}</div>
      <p class="meta">${truncate(r.summary || '', 120)}</p>
    </div>
  </article>`;
}
function mountModal(r){
  const modal = document.querySelector('.recipe-modal');
  const img = document.querySelector('#modal-img');
  const body = document.querySelector('#modal-body');
  img.src = r.image;
  img.alt = r.alt || r.title;
  body.innerHTML = `
    <h2>${r.title}</h2>
    <p class="meta">${r.age_range || ''} ${r.allergens && r.allergens.length ? '• Allergens: '+r.allergens.join(', ') : ''}</p>
    <div class="kv">
      <div><strong>Prep time</strong></div><div>${r.time || '10 min'}</div>
      <div><strong>Texture</strong></div><div>${r.texture || 'Smooth'}</div>
      <div><strong>Storage</strong></div><div>${r.storage || 'Refrigerate 2 days or freeze 3 months'}</div>
    </div>
    <h3>Ingredients</h3>
    <ul>${(r.ingredients||[]).map(i=>`<li>${i}</li>`).join('')}</ul>
    <h3>Steps</h3>
    <ol>${(r.steps||[]).map(s=>`<li>${s}</li>`).join('')}</ol>
    ${r.video_url ? `<p><a href="${r.video_url}" target="_blank" rel="noopener">Watch video</a></p>` : ''}
    ${r.notes ? `<div class="notice"><strong>Notes:</strong> ${r.notes}</div>` : ''}
  `;
  modal.style.display = 'flex';
}
function wireCards(recipes){
  document.body.addEventListener('click', (e)=>{
    const card = e.target.closest('.card');
    if(card){
      const slug = card.getAttribute('data-slug');
      const r = recipes.find(x=>x.slug===slug);
      if(r) mountModal(r);
    }
  });
  document.querySelector('.modal-close').addEventListener('click',()=>{
    document.querySelector('.recipe-modal').style.display='none';
  });
  document.querySelector('.recipe-modal').addEventListener('click',(e)=>{
    if(e.target.classList.contains('recipe-modal')){
      e.currentTarget.style.display='none';
    }
  });
}
async function initRecipesPage(){
  const grid = document.querySelector('#recipes-grid');
  if(!grid) return;
  const recipes = await loadRecipes();

  const search = document.querySelector('#search');
  const age = document.querySelector('#age');
  function apply(){
    const q = (search.value||'').toLowerCase();
    const a = age.value;
    const filtered = recipes.filter(r=>{
      const matchQ = !q || r.title.toLowerCase().includes(q) || (r.ingredients||[]).join(' ').toLowerCase().includes(q);
      const matchA = !a || (r.age_tag === a);
      return matchQ && matchA;
    });
    grid.innerHTML = filtered.map(renderCard).join('');
  }
  search.addEventListener('input', apply);
  age.addEventListener('change', apply);

  apply();
  wireCards(recipes);
}
async function initIndexPage(){
  const grid = document.querySelector('#latest-grid');
  if(!grid) return;
  const recipes = await loadRecipes();
  const latest = recipes.slice(0,6);
  grid.innerHTML = latest.map(renderCard).join('');
  wireCards(recipes);
}
document.addEventListener('DOMContentLoaded', ()=>{
  initRecipesPage();
  initIndexPage();
});
