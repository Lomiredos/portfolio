// surligne le bon lien dans la nav quand on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  let current = sections[0].id;

  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 80) {
      current = section.id;
    }
  });

  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
});

// formulaire de contact — envoie via formspree sans rechargé la page
const contactForm = document.getElementById('contact-form');
const formStatus  = document.getElementById('form-status');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = contactForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Envoi…';
    formStatus.textContent = '';
    formStatus.className = 'form-status';

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        formStatus.textContent = 'Message envoyé, merci !';
        formStatus.classList.add('success');
        contactForm.reset();
      } else {
        // formspree a répondu mais ca s'est mal passé
        formStatus.textContent = 'Une erreur est survenue, réessaie.';
        formStatus.classList.add('error');
      }
    } catch {
      // pas de réseau ou formspree injoignable
      formStatus.textContent = 'Impossible d\'envoyer, vérifie ta connexion.';
      formStatus.classList.add('error');
    }

    btn.disabled = false;
    btn.textContent = 'Envoyer';
  });
}

// ── section projets ────────────────────────────────

let activeCategory = 'all';
let activeLang     = null;

// construit une carte projet a partir d'un objet json
function buildProjectCard(project) {
  const card = document.createElement('div');
  card.className = 'project-card';
  card.dataset.category = project.category;
  card.dataset.langs    = project.langs.join(' ');

  // si y'a une image on l'utilise, sinon le gradient de secour
  const imgEl = project.image
    ? `<img class="project-img" src="${project.image}" alt="${project.name}" />`
    : `<div class="project-img" style="background:${project.gradient};"></div>`;

  const tags = project.tags.map(t => `<span>${t}</span>`).join('');

  card.innerHTML = `
    ${imgEl}
    <div class="project-info">
      <h3>${project.name}</h3>
      <div class="project-tags">${tags}</div>
    </div>
  `;
  return card;
}

// charge le json et génere les cartes au demarage
async function loadProjects() {
  const grid = document.getElementById('project-grid');
  if (!grid) return;

  try {
    const res      = await fetch('projects.json');
    const projects = await res.json();

    // trie par qualité (1 = le meilleur, en haut)
    projects
      .sort((a, b) => a.quality - b.quality)
      .forEach(p => grid.appendChild(buildProjectCard(p)));

    filterProjects();
  } catch (e) {
    console.error('projects.json introuvable ou malformé', e);
  }
}

// cache les cartes qui matchent pas les filtres actifs
function filterProjects() {
  document.querySelectorAll('.project-card').forEach(card => {
    const langs     = (card.dataset.langs || '').split(' ');
    const matchCat  = activeCategory === 'all' || card.dataset.category === activeCategory;
    const matchLang = !activeLang || langs.includes(activeLang);
    card.classList.toggle('hidden', !(matchCat && matchLang));
  });
}

// boutons de catégorie (game, engine, etc.)
document.querySelectorAll('.category-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeCategory = btn.dataset.category;
    filterProjects();
  });
});

loadProjects();

// filtre par langage — marche depuis compétences et depuis projets
// les deux barres sont synchro, cliquer sur une met a jour l'autre
const langCards = document.querySelectorAll('.lang-card');

function setActiveLang(lang) {
  activeLang = lang;
  langCards.forEach(c => {
    c.classList.toggle('active', c.dataset.lang === lang);
  });
  filterProjects();
}

langCards.forEach(card => {
  card.addEventListener('click', () => {
    const isAlreadyActive = card.classList.contains('active');
    if (isAlreadyActive) {
      setActiveLang(null); // desactive si on reclique
    } else {
      setActiveLang(card.dataset.lang);
      // si on clique depuis compétences, scroll vers les projets
      document.getElementById('Projets').scrollIntoView({ behavior: 'smooth' });
    }
  });
});
