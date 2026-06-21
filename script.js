/* =========================================================
   TASKDOO — SCRIPT.JS
   Simulação de banco de dados local + SPA + busca/filtros
   Estrutura pensada para futura migração para Node.js/Express:
   - "DB" isolado em TaskdooDB (poderia virar uma chamada de API)
   - Funções de fetch (getProviders, getProviderById) são async
     mesmo sendo locais, para já espelhar o formato de uma API real.
   ========================================================= */

/* ---------------------------------------------------------
   1. BANCO DE DADOS SIMULADO
   --------------------------------------------------------- */
const CATEGORIES = [
  "Encanador", "Eletricista", "Pintor", "Pedreiro",
  "Jardineiro", "Mecânico", "Técnico de Informática", "Marceneiro"
];

// Helper para gerar avatares e fotos consistentes via picsum/avatars
const photo = (seed) => `https://i.pravatar.cc/300?img=${seed}`;
const clientPhoto = (seed) => `https://i.pravatar.cc/100?img=${seed}`;

const TaskdooDB = {
  providers: [
    {
      id: 1, name: "Carlos Mendes", city: "São Paulo, SP", photo: photo(12),
      experience: "8 anos de experiência", completedJobs: 312,
      services: [
        { name: "Encanador", rating: 4.9, reviews: 86 },
        { name: "Instalador de Chuveiro", rating: 4.8, reviews: 40 }
      ],
      prices: [
        { label: "Visita Técnica", value: 50 },
        { label: "Instalação de Chuveiro", value: 120 },
        { label: "Troca de Torneira", value: 80 },
        { label: "Serviço por Hora", value: 70 }
      ],
      contact: { phone: "(11) 98888-1234", whatsapp: "5511988881234", email: "carlos.mendes@email.com" },
      reviews: [
        { name: "Fernanda Lima", photo: clientPhoto(5), rating: 5, text: "Pontual e organizado. Resolveu o problema do encanamento rapidinho." },
        { name: "João Pereira", photo: clientPhoto(8), rating: 5, text: "Excelente profissional, super recomendo!" },
        { name: "Marcia Souza", photo: clientPhoto(20), rating: 4, text: "Bom atendimento, só achei o preço um pouco alto." }
      ]
    },
    {
      id: 2, name: "Renata Alves", city: "Rio de Janeiro, RJ", photo: photo(45),
      experience: "5 anos de experiência", completedJobs: 198,
      services: [
        { name: "Eletricista", rating: 4.7, reviews: 64 },
        { name: "Técnico de Informática", rating: 4.6, reviews: 22 }
      ],
      prices: [
        { label: "Visita Técnica", value: 60 },
        { label: "Troca de Disjuntor", value: 90 },
        { label: "Instalação de Tomada", value: 70 },
        { label: "Serviço por Hora", value: 75 }
      ],
      contact: { phone: "(21) 97777-5678", whatsapp: "5521977775678", email: "renata.alves@email.com" },
      reviews: [
        { name: "Bruno Costa", photo: clientPhoto(15), rating: 5, text: "Muito atenciosa e resolveu tudo no mesmo dia." },
        { name: "Patrícia Gomes", photo: clientPhoto(23), rating: 4.5, text: "Ótimo serviço elétrico, recomendo." }
      ]
    },
    {
      id: 3, name: "Eduardo Santos", city: "Belo Horizonte, MG", photo: photo(33),
      experience: "12 anos de experiência", completedJobs: 540,
      services: [
        { name: "Pintor", rating: 4.95, reviews: 120 }
      ],
      prices: [
        { label: "Visita Técnica", value: 0 },
        { label: "Pintura por m²", value: 25 },
        { label: "Pintura de Fachada", value: 1500 },
        { label: "Serviço por Hora", value: 65 }
      ],
      contact: { phone: "(31) 96666-3344", whatsapp: "5531966663344", email: "eduardo.santos@email.com" },
      reviews: [
        { name: "Ana Paula", photo: clientPhoto(9), rating: 5, text: "Trabalho impecável, deixou a casa novinha!" },
        { name: "Ricardo Nunes", photo: clientPhoto(11), rating: 5, text: "Caprichoso e cumpriu o prazo." }
      ]
    },
    {
      id: 4, name: "Juliana Ferreira", city: "Curitiba, PR", photo: photo(29),
      experience: "6 anos de experiência", completedJobs: 245,
      services: [
        { name: "Jardineiro", rating: 4.8, reviews: 58 }
      ],
      prices: [
        { label: "Visita Técnica", value: 40 },
        { label: "Manutenção de Jardim", value: 150 },
        { label: "Poda de Árvores", value: 200 },
        { label: "Serviço por Hora", value: 60 }
      ],
      contact: { phone: "(41) 95555-2233", whatsapp: "5541955552233", email: "juliana.ferreira@email.com" },
      reviews: [
        { name: "Tatiane Rocha", photo: clientPhoto(31), rating: 5, text: "Jardim ficou maravilhoso, super recomendo." }
      ]
    },
    {
      id: 5, name: "Marcos Oliveira", city: "Porto Alegre, RS", photo: photo(52),
      experience: "10 anos de experiência", completedJobs: 410,
      services: [
        { name: "Mecânico", rating: 4.6, reviews: 95 }
      ],
      prices: [
        { label: "Diagnóstico", value: 70 },
        { label: "Troca de Óleo", value: 90 },
        { label: "Revisão Completa", value: 350 },
        { label: "Serviço por Hora", value: 80 }
      ],
      contact: { phone: "(51) 94444-1122", whatsapp: "5551944441122", email: "marcos.oliveira@email.com" },
      reviews: [
        { name: "Diego Martins", photo: clientPhoto(40), rating: 4, text: "Bom mecânico, preço justo." },
        { name: "Camila Tavares", photo: clientPhoto(44), rating: 5, text: "Resolveu um problema que outros não conseguiram." }
      ]
    },
    {
      id: 6, name: "Beatriz Cardoso", city: "São Paulo, SP", photo: photo(47),
      experience: "4 anos de experiência", completedJobs: 130,
      services: [
        { name: "Técnico de Informática", rating: 4.85, reviews: 70 }
      ],
      prices: [
        { label: "Diagnóstico", value: 50 },
        { label: "Formatação", value: 100 },
        { label: "Remoção de Vírus", value: 90 },
        { label: "Serviço por Hora", value: 65 }
      ],
      contact: { phone: "(11) 93333-4455", whatsapp: "5511933334455", email: "beatriz.cardoso@email.com" },
      reviews: [
        { name: "Felipe Rodrigues", photo: clientPhoto(50), rating: 5, text: "Super rápida e explicou tudo que fez." }
      ]
    },
    {
      id: 7, name: "Paulo Henrique", city: "Salvador, BA", photo: photo(58),
      experience: "15 anos de experiência", completedJobs: 620,
      services: [
        { name: "Marceneiro", rating: 4.9, reviews: 140 },
        { name: "Pedreiro", rating: 4.7, reviews: 35 }
      ],
      prices: [
        { label: "Visita Técnica", value: 50 },
        { label: "Móvel Planejado (m²)", value: 300 },
        { label: "Reforma de Móvel", value: 180 },
        { label: "Serviço por Hora", value: 75 }
      ],
      contact: { phone: "(71) 92222-6677", whatsapp: "5571922226677", email: "paulo.henrique@email.com" },
      reviews: [
        { name: "Larissa Mota", photo: clientPhoto(60), rating: 5, text: "Móvel ficou perfeito, qualidade excelente." },
        { name: "Gabriel Souza", photo: clientPhoto(62), rating: 4.5, text: "Muito profissional e cuidadoso." }
      ]
    },
    {
      id: 8, name: "Camila Ribeiro", city: "Recife, PE", photo: photo(64),
      experience: "7 anos de experiência", completedJobs: 280,
      services: [
        { name: "Pintor", rating: 4.6, reviews: 50 },
        { name: "Pedreiro", rating: 4.5, reviews: 30 }
      ],
      prices: [
        { label: "Visita Técnica", value: 45 },
        { label: "Pintura por m²", value: 22 },
        { label: "Reboco/Acabamento", value: 200 },
        { label: "Serviço por Hora", value: 60 }
      ],
      contact: { phone: "(81) 91111-8899", whatsapp: "5581911118899", email: "camila.ribeiro@email.com" },
      reviews: [
        { name: "Otávio Lima", photo: clientPhoto(66), rating: 4.5, text: "Trabalho bem feito e dentro do orçamento." }
      ]
    },
    {
      id: 9, name: "Rodrigo Castro", city: "Fortaleza, CE", photo: photo(15),
      experience: "9 anos de experiência", completedJobs: 365,
      services: [
        { name: "Eletricista", rating: 4.75, reviews: 88 }
      ],
      prices: [
        { label: "Visita Técnica", value: 55 },
        { label: "Instalação de Chuveiro", value: 110 },
        { label: "Quadro de Disjuntores", value: 250 },
        { label: "Serviço por Hora", value: 70 }
      ],
      contact: { phone: "(85) 90000-3322", whatsapp: "5585900003322", email: "rodrigo.castro@email.com" },
      reviews: [
        { name: "Isabela Farias", photo: clientPhoto(70), rating: 5, text: "Atendimento rápido e seguro." }
      ]
    },
    {
      id: 10, name: "Vanessa Pinto", city: "Curitiba, PR", photo: photo(24),
      experience: "3 anos de experiência", completedJobs: 95,
      services: [
        { name: "Jardineiro", rating: 4.4, reviews: 28 }
      ],
      prices: [
        { label: "Visita Técnica", value: 35 },
        { label: "Manutenção de Jardim", value: 130 },
        { label: "Paisagismo", value: 400 },
        { label: "Serviço por Hora", value: 55 }
      ],
      contact: { phone: "(41) 98888-7766", whatsapp: "5541988887766", email: "vanessa.pinto@email.com" },
      reviews: [
        { name: "Henrique Dias", photo: clientPhoto(72), rating: 4, text: "Bom serviço, pontual." }
      ]
    },
    {
      id: 11, name: "Felipe Andrade", city: "Belo Horizonte, MG", photo: photo(38),
      experience: "11 anos de experiência", completedJobs: 480,
      services: [
        { name: "Mecânico", rating: 4.8, reviews: 110 },
        { name: "Técnico de Informática", rating: 4.3, reviews: 18 }
      ],
      prices: [
        { label: "Diagnóstico", value: 60 },
        { label: "Troca de Pastilhas", value: 150 },
        { label: "Revisão Completa", value: 380 },
        { label: "Serviço por Hora", value: 78 }
      ],
      contact: { phone: "(31) 97777-9988", whatsapp: "5531977779988", email: "felipe.andrade@email.com" },
      reviews: [
        { name: "Carlos Eduardo", photo: clientPhoto(75), rating: 5, text: "Profissional muito experiente, recomendo." }
      ]
    },
    {
      id: 12, name: "Lucas Tavares", city: "Rio de Janeiro, RJ", photo: photo(41),
      experience: "6 anos de experiência", completedJobs: 210,
      services: [
        { name: "Marceneiro", rating: 4.65, reviews: 54 },
        { name: "Pintor", rating: 4.5, reviews: 20 }
      ],
      prices: [
        { label: "Visita Técnica", value: 45 },
        { label: "Móvel Planejado (m²)", value: 280 },
        { label: "Pintura de Móveis", value: 150 },
        { label: "Serviço por Hora", value: 68 }
      ],
      contact: { phone: "(21) 96666-1199", whatsapp: "5521966661199", email: "lucas.tavares@email.com" },
      reviews: [
        { name: "Renan Souza", photo: clientPhoto(80), rating: 4.5, text: "Entregou o móvel antes do prazo, ótimo acabamento." }
      ]
    }
  ]
};

// Calcula avaliação geral média de um prestador (média das médias por serviço)
function getOverallRating(provider){
  const sum = provider.services.reduce((acc, s) => acc + s.rating, 0);
  return Math.round((sum / provider.services.length) * 10) / 10;
}
function getTotalReviews(provider){
  return provider.services.reduce((acc, s) => acc + s.reviews, 0);
}

/* ---------------------------------------------------------
   2. CAMADA DE "API" (hoje local, pronta para Express/REST)
   --------------------------------------------------------- */
async function apiGetProviders(){
  // Em produção: return fetch('/api/providers').then(r => r.json())
  return Promise.resolve(TaskdooDB.providers);
}
async function apiGetProviderById(id){
  // Em produção: return fetch(`/api/providers/${id}`).then(r => r.json())
  return Promise.resolve(TaskdooDB.providers.find(p => p.id === Number(id)));
}

/* ---------------------------------------------------------
   3. ESTADO GLOBAL DE FILTROS
   --------------------------------------------------------- */
const state = {
  query: "",
  category: "",
  city: "",
  minRating: 0
};

/* ---------------------------------------------------------
   4. UTILITÁRIOS DE RENDERIZAÇÃO
   --------------------------------------------------------- */
const app = document.getElementById("app");

function starsHTML(rating){
  return `<span class="star">★</span> ${rating.toFixed(1)}`;
}

function providerCard(p){
  const rating = getOverallRating(p);
  const reviews = getTotalReviews(p);
  return `
    <article class="card" data-id="${p.id}">
      <img class="card__photo" src="${p.photo}" alt="Foto de ${p.name}" loading="lazy">
      <div class="card__body">
        <div class="card__top">
          <div>
            <div class="card__name">${p.name}</div>
            <div class="card__city">${p.city}</div>
          </div>
          <div class="rating">${starsHTML(rating)} <span class="reviews">(${reviews})</span></div>
        </div>
        <div class="card__services">
          ${p.services.map(s => `<span class="tag">${s.name}</span>`).join("")}
        </div>
        <div class="card__footer">
          <button class="btn btn--ghost btn--sm btn--block" data-action="view-profile" data-id="${p.id}">Ver Perfil</button>
        </div>
      </div>
    </article>
  `;
}

function getUniqueCities(){
  return [...new Set(TaskdooDB.providers.map(p => p.city))].sort();
}

/* ---------------------------------------------------------
   5. FILTRAGEM
   --------------------------------------------------------- */
function applyFilters(providers){
  return providers.filter(p => {
    const matchesQuery = state.query === "" ||
      p.name.toLowerCase().includes(state.query) ||
      p.services.some(s => s.name.toLowerCase().includes(state.query)) ||
      p.city.toLowerCase().includes(state.query);

    const matchesCategory = state.category === "" ||
      p.services.some(s => s.name === state.category);

    const matchesCity = state.city === "" || p.city === state.city;

    const matchesRating = getOverallRating(p) >= state.minRating;

    return matchesQuery && matchesCategory && matchesCity && matchesRating;
  });
}

/* ---------------------------------------------------------
   6. PÁGINAS (ROTAS DA SPA)
   --------------------------------------------------------- */

// ---- HOME ----
async function renderHome(){
  app.innerHTML = `
    <section class="hero">
      <div class="container">
        <h1>Encontre o profissional <span class="accent">certo</span> para qualquer tarefa.</h1>
        <p>Pesquise, compare avaliações e entre em contato diretamente com prestadores de serviços da sua região.</p>
        <form class="hero-search" id="heroSearchForm">
          <input type="text" id="heroSearchInput" placeholder="Ex: Encanador em São Paulo">
          <button type="submit" class="btn btn--accent">Buscar</button>
        </form>
        <div class="quick-cats" id="quickCats"></div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section__head">
          <h2 id="resultsTitle">Profissionais em destaque</h2>
          <span class="count" id="resultsCount"></span>
        </div>
        <div class="filterbar">
          <select id="filterCategory"><option value="">Todas categorias</option></select>
          <select id="filterCity"><option value="">Todas cidades</option></select>
          <select id="filterRating">
            <option value="0">Qualquer avaliação</option>
            <option value="4.5">4.5 ★ ou mais</option>
            <option value="4.7">4.7 ★ ou mais</option>
            <option value="4.9">4.9 ★ ou mais</option>
          </select>
          <button class="clear-filters" id="clearFilters">Limpar filtros</button>
        </div>
        <div class="grid" id="resultsGrid"></div>
      </div>
    </section>
  `;

  // Categorias rápidas
  const quickCats = document.getElementById("quickCats");
  quickCats.innerHTML = CATEGORIES.map(c =>
    `<button class="quick-cat" data-cat="${c}">${c}</button>`
  ).join("");

  // Selects de filtro
  const filterCategory = document.getElementById("filterCategory");
  filterCategory.innerHTML += CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join("");
  const filterCity = document.getElementById("filterCity");
  filterCity.innerHTML += getUniqueCities().map(c => `<option value="${c}">${c}</option>`).join("");

  // Sincroniza selects com state atual
  filterCategory.value = state.category;
  filterCity.value = state.city;
  document.getElementById("filterRating").value = state.minRating;
  document.getElementById("heroSearchInput").value = state.query;

  await refreshResults();

  // Eventos
  document.getElementById("heroSearchForm").addEventListener("submit", e => {
    e.preventDefault();
    state.query = document.getElementById("heroSearchInput").value.trim().toLowerCase();
    refreshResults();
  });

  quickCats.addEventListener("click", e => {
    const btn = e.target.closest(".quick-cat");
    if(!btn) return;
    const cat = btn.dataset.cat;
    state.category = (state.category === cat) ? "" : cat;
    filterCategory.value = state.category;
    [...quickCats.children].forEach(c => c.classList.toggle("is-active", c.dataset.cat === state.category));
    refreshResults();
  });

  filterCategory.addEventListener("change", () => { state.category = filterCategory.value; refreshResults(); });
  filterCity.addEventListener("change", () => { state.city = filterCity.value; refreshResults(); });
  document.getElementById("filterRating").addEventListener("change", e => {
    state.minRating = parseFloat(e.target.value);
    refreshResults();
  });
  document.getElementById("clearFilters").addEventListener("click", () => {
    state.query = ""; state.category = ""; state.city = ""; state.minRating = 0;
    navigate("home");
  });

  document.getElementById("resultsGrid").addEventListener("click", e => {
    const btn = e.target.closest("[data-action='view-profile']");
    if(btn) navigate("profile", btn.dataset.id);
  });
}

async function refreshResults(){
  const all = await apiGetProviders();
  const filtered = applyFilters(all);
  const grid = document.getElementById("resultsGrid");
  const count = document.getElementById("resultsCount");
  const title = document.getElementById("resultsTitle");

  count.textContent = `${filtered.length} profissional${filtered.length === 1 ? "" : "is"} encontrado${filtered.length === 1 ? "" : "s"}`;
  title.textContent = (state.query || state.category || state.city || state.minRating)
    ? "Resultados da busca" : "Profissionais em destaque";

  grid.innerHTML = filtered.length
    ? filtered.map(providerCard).join("")
    : `<div class="empty-state" style="grid-column:1/-1">
         <h3>Nenhum profissional encontrado</h3>
         <p>Tente ajustar os filtros ou buscar por outro termo.</p>
       </div>`;
}

// ---- PERFIL DO PRESTADOR ----
async function renderProfile(id){
  const p = await apiGetProviderById(id);
  if(!p){
    app.innerHTML = `<div class="container section"><div class="empty-state"><h3>Profissional não encontrado</h3></div></div>`;
    return;
  }
  const overall = getOverallRating(p);
  const totalReviews = getTotalReviews(p);

  app.innerHTML = `
    <section class="profile-hero">
      <div class="container">
        <div style="width:100%">
          <a href="#" class="back-link" data-action="go-home">&larr; Voltar para a busca</a>
          <div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap">
            <img class="profile-photo" src="${p.photo}" alt="Foto de ${p.name}">
            <div class="profile-info">
              <h1>${p.name}</h1>
              <div class="profile-meta">
                <span>📍 ${p.city}</span>
                <span>🛠 ${p.experience}</span>
                <span>✅ ${p.completedJobs} serviços concluídos</span>
              </div>
              <div class="profile-rating">
                <span class="big-star">★</span>
                <span class="big-num">${overall.toFixed(1)}</span>
                <span style="color:#cfcfcf;font-size:13.5px">(${totalReviews} avaliações no total)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="profile-body">
      <div class="container profile-grid">
        <div>
          <div class="block">
            <h3>Serviços oferecidos</h3>
            <div class="service-list">
              ${p.services.map(s => `
                <div class="service-item">
                  ${s.name}
                  <span class="rating">${starsHTML(s.rating)} <span class="reviews">(${s.reviews})</span></span>
                </div>
              `).join("")}
            </div>
          </div>

          <div class="block">
            <h3>Preços médios</h3>
            <table class="price-table">
              ${p.prices.map(pr => `
                <tr><td>${pr.label}</td><td>${pr.value === 0 ? "Gratuita" : "R$ " + pr.value.toLocaleString("pt-BR")}</td></tr>
              `).join("")}
            </table>
          </div>

          <div class="block">
            <h3>Comentários (${p.reviews.length})</h3>
            ${p.reviews.map(r => `
              <div class="review">
                <img src="${r.photo}" alt="Foto de ${r.name}">
                <div>
                  <div class="review__name">${r.name}</div>
                  <div class="review__rating">${"★".repeat(Math.round(r.rating))}${"☆".repeat(5 - Math.round(r.rating))} ${r.rating.toFixed(1)}</div>
                  <div class="review__text">${r.text}</div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <aside>
          <div class="contact-card">
            <h3>Contato</h3>
            <div class="contact-row">
              <svg viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" stroke="currentColor" stroke-width="2"/></svg>
              ${p.contact.phone}
            </div>
            <div class="contact-row">
              <svg viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.38 8.38 0 0 1-1.9 5.4 8.5 8.5 0 0 1-9.9 2.6L3 21l1.5-6.2A8.5 8.5 0 0 1 12.5 3a8.38 8.38 0 0 1 5.4 1.9A8.5 8.5 0 0 1 21 11.5Z" stroke="currentColor" stroke-width="2"/></svg>
              WhatsApp disponível
            </div>
            <div class="contact-row">
              <svg viewBox="0 0 24 24" fill="none"><path d="M4 4h16v16H4V4Z" stroke="currentColor" stroke-width="2"/><path d="M4 6l8 7 8-7" stroke="currentColor" stroke-width="2"/></svg>
              ${p.contact.email}
            </div>
            <a class="btn btn--accent btn--block" target="_blank"
               href="https://wa.me/${p.contact.whatsapp}?text=${encodeURIComponent("Olá " + p.name + ", vi seu perfil no Taskdoo e gostaria de solicitar um serviço.")}">
               Entrar em Contato
            </a>
          </div>
        </aside>
      </div>
    </section>
  `;

  document.querySelector("[data-action='go-home']").addEventListener("click", e => {
    e.preventDefault();
    navigate("home");
  });
}

/* ---------------------------------------------------------
   7. ROTEADOR SPA (sem reload de página)
   --------------------------------------------------------- */
async function navigate(route, param){
  window.scrollTo({ top: 0, behavior: "instant" });
  if(route === "home") await renderHome();
  if(route === "profile") await renderProfile(param);
  history.pushState({ route, param }, "", route === "home" ? "#" : `#perfil/${param}`);
}

window.addEventListener("popstate", e => {
  const s = e.state;
  if(!s || s.route === "home") renderHome();
  else if(s.route === "profile") renderProfile(s.param);
});

/* ---------------------------------------------------------
   8. HEADER / BUSCA GLOBAL / MODAL / FOOTER
   --------------------------------------------------------- */
document.querySelector(".logo").addEventListener("click", e => {
  e.preventDefault();
  state.query = ""; state.category = ""; state.city = ""; state.minRating = 0;
  navigate("home");
});

document.getElementById("headerSearchForm").addEventListener("submit", e => {
  e.preventDefault();
  state.query = document.getElementById("headerSearchInput").value.trim().toLowerCase();
  navigate("home");
});

function setupModal(){
  const overlay = document.getElementById("modalOverlay");
  const open = () => overlay.classList.add("is-open");
  const close = () => overlay.classList.remove("is-open");
  document.getElementById("btnLogin").addEventListener("click", () => { setTab("login"); open(); });
  document.getElementById("btnSignup").addEventListener("click", () => { setTab("signup"); open(); });
  document.getElementById("modalClose").addEventListener("click", close);
  overlay.addEventListener("click", e => { if(e.target === overlay) close(); });

  function setTab(tab){
    document.querySelectorAll(".modal__tab").forEach(t => t.classList.toggle("is-active", t.dataset.tab === tab));
  }
  document.querySelectorAll(".modal__tab").forEach(t => t.addEventListener("click", () => setTab(t.dataset.tab)));
  document.querySelector(".modal__form").addEventListener("submit", e => {
    e.preventDefault();
    close();
  });
}

function setupFooter(){
  document.getElementById("footerCategories").innerHTML =
    CATEGORIES.slice(0, 6).map(c => `<li><a href="#" data-cat="${c}">${c}</a></li>`).join("");
  document.getElementById("footerCategories").addEventListener("click", e => {
    const a = e.target.closest("a");
    if(!a) return;
    e.preventDefault();
    state.category = a.dataset.cat;
    navigate("home");
  });
}

function setupHamburger(){
  document.getElementById("hamburger").addEventListener("click", () => {
    document.getElementById("btnLogin").click();
  });
}

/* ---------------------------------------------------------
   9. INICIALIZAÇÃO
   --------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  setupModal();
  setupFooter();
  setupHamburger();
  renderHome();
  history.replaceState({ route: "home" }, "", "#");
});
