window.addEventListener("load", () => {
  const map = L.map("map").setView([-30.0346, -51.2177], 12);

  // Camada de fundo (dark theme)
  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution:
      '&copy; <a href="https://carto.com/">CARTO</a> | &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
  }).addTo(map);

  // Lista de bairros de interesse (exemplo)
  const bairrosPerigosos = [
    "Centro Histórico",
    "Restinga",
    "Rubem Berta",
    "Lomba do Pinheiro",
    "Partenon",
    "Farroupilha",
  ];

  fetch("bairros.geojson")
    .then(res => res.json())
    .then(data => {
      const bairrosLayer = L.geoJSON(data, {
        style: (feature) => {
          const nome = feature.properties.bairro;

          // níveis de perigo (exemplo: 0 = seguro, 1 = muito perigoso)
          const niveisPerigo = {
            "Centro Histórico": 0.8,
            "Restinga": 0.9,
            "Rubem Berta": 0.7,
            "Lomba do Pinheiro": 0.6,
            "Partenon": 0.5,
            "Farroupilha": 0.3,
            "Sarandi": 0.65,
            "Bom Jesus": 0.75,
            "Vila Nova": 0.4,
            "Cavalhada": 0.35,
            "Jardim Botânico": 0.25,
            "Tristeza": 0.2,
            "Cristal": 0.45,
            "Menino Deus": 0.15,
            "Mário Quintana": 0.85,
            "Santa Tereza": 0.51,
          };

          // usa 0.1 se o bairro não estiver na lista
          const perigo = niveisPerigo[nome] || 0.1;

          // gera uma cor do verde ao vermelho conforme o nível
          const r = Math.floor(255 * perigo);
          const g = Math.floor(255 * (1 - perigo));
          const cor = `rgb(${r}, ${g}, 0)`;

          return {
            color: cor,
            weight: 2,
            fillColor: cor,
            fillOpacity: 0.25 + 0.3 * perigo,
          };
        },

        onEachFeature: (feature, layer) => {
          if (feature.properties && feature.properties.bairro) {
            const nome = feature.properties.bairro;
            const perigo = feature.properties.bairro in bairrosPerigosos ? "Perigoso" : "Seguro";
            layer.bindPopup(`<b>${nome}</b><br>Nível de perigo: ${perigo}`);
          }
        },
      }).addTo(map);

      // Ajusta visão para mostrar todos os bairros
      map.fitBounds(bairrosLayer.getBounds());

      // Lista lateral de bairros
      const list = document.getElementById("dangerousList");
      data.features.forEach(feature => {
        const li = document.createElement("li");
        li.textContent = feature.properties.bairro;

        li.addEventListener("click", () => {
          map.fitBounds(L.geoJSON(feature).getBounds());
        });

        // Destaca o texto conforme o nível
        if (bairrosPerigosos.includes(feature.properties.bairro)) {
          li.style.color = "#ff4d4d";
          li.style.fontWeight = "bold";
        }

        list.appendChild(li);
      });

      // Campo de busca
      document.getElementById("searchInput").addEventListener("input", (e) => {
        const termo = e.target.value.toLowerCase();
        document.querySelectorAll("#dangerousList li").forEach((li, index) => {
          const bairro = data.features[index].properties.bairro.toLowerCase();
          li.style.display = bairro.includes(termo) ? "block" : "none";
        });
      });
    })
    .catch(err => console.error("Erro ao carregar GeoJSON:", err));
});
