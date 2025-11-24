window.addEventListener("load", () => {
  const map = L.map("map").setView([-30.0346, -51.2177], 12);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution:
      '&copy; <a href="https://carto.com/">CARTO</a> | &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
  }).addTo(map);

  let bairrosLayer = null;
  let dadosCrimesAtuais = null;

  // ---- NORMALIZADOR ----
  function normalizarNome(texto) {
    return texto
      .toUpperCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function corPorQuantidade(qtd) {
    if (qtd === 0) return "#3b7bff";
    if (qtd < 10) return "#32cd32";
    if (qtd < 30) return "#ffff00";
    return "#ff0000";
  }

  function atualizarEstilo() {
    if (!bairrosLayer) return;

    bairrosLayer.setStyle((feature) => {
      const nome = normalizarNome(feature.properties.bairro);
      const qtd = dadosCrimesAtuais?.[nome] || 0;

      return {
        color: "#222",
        weight: 1.5,
        fillColor: corPorQuantidade(qtd),
        fillOpacity: 0.4,
      };
    });
  }

  function carregarMapaInicial() {
    fetch("bairros.geojson")
      .then((res) => res.json())
      .then((data) => {
        bairrosLayer = L.geoJSON(data, {
          style: {
            color: "#444",
            weight: 1,
            fillColor: "#999",
            fillOpacity: 0.2,
          },

          onEachFeature: (feature, layer) => {
            const nome = feature.properties.bairro;
            layer.bindPopup(`<b>${nome}</b>`);
          },
        }).addTo(map);

        map.fitBounds(bairrosLayer.getBounds());

        // LISTA DE BAIRROS
        const list = document.getElementById("dangerousList");
        data.features.forEach((feature) => {
          const nome = feature.properties.bairro;
          const li = document.createElement("li");
          li.textContent = nome;

          li.addEventListener("click", () => {
            map.fitBounds(L.geoJSON(feature).getBounds());
          });

          list.appendChild(li);
        });

        // BUSCA
        document.getElementById("searchInput").addEventListener("input", (e) => {
          const termo = e.target.value.toLowerCase();
          document.querySelectorAll("#dangerousList li").forEach((li) => {
            li.style.display = li.textContent.toLowerCase().includes(termo)
              ? "block"
              : "none";
          });
        });
      });
  }

  carregarMapaInicial();

  // ---- SELETOR DE CRIMES ----
  document.getElementById("crimeSelect").addEventListener("change", async (e) => {
    const crime = e.target.value;

    if (!crime) {
      dadosCrimesAtuais = null;
      atualizarEstilo();
      return;
    }

    try {
      const todos = await fetch("crimes.json").then(r => r.json());

      // Normaliza chave do crime (garante SEM ACENTO)
      const crimeNormalizado = normalizarNome(crime);

      dadosCrimesAtuais = todos[crimeNormalizado] || todos[crime] || {};

      atualizarEstilo();
    } catch (err) {
      console.error("Erro ao carregar JSON:", err);
    }
  });
});
