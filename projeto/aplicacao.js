window.addEventListener("load", () => {
  const map = L.map("map").setView([-30.0346, -51.2177], 12);

  
  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution:
      '&copy; <a href="https://carto.com/">CARTO</a> | &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
  }).addTo(map);

  
  const bairrosPerigosos = [
    "Centro Histórico",
    "Restinga",
    "Rubem Berta",
    "Lomba do Pinheiro",
    "Partenon",
  ];

  
  fetch("bairros.geojson")
    .then(res => res.json())
    .then(data => {
      const bairrosLayer = L.geoJSON(data, {
        style: (feature) => {
          const nome = feature.properties.bairro;
          // Se estiver na lista, pinta de vermelho
          if (bairrosPerigosos.includes(nome)) {
            return {
              color: "#ff4d4d",
              weight: 2.5,
              fillColor: "#ff0000",
              fillOpacity: 0.15,
            };
          }
          // Caso contrário, cor padrão
          return {
            color: "#555",
            weight: 1.2,
            fillColor: "#999",
            fillOpacity: 0.05,
          };
        },
        onEachFeature: (feature, layer) => {
          if (feature.properties && feature.properties.bairro) {
            layer.bindPopup(`<b>${feature.properties.bairro}</b>`);
          }
        },
      }).addTo(map);

      // Ajusta a visão para caber todos os bairros
      map.fitBounds(bairrosLayer.getBounds());

      // Lista os bairros na sidebar
      const list = document.getElementById("dangerousList");
      data.features.forEach(feature => {
        const li = document.createElement("li");
        li.textContent = feature.properties.bairro;

        li.addEventListener("click", () => {
          map.fitBounds(L.geoJSON(feature).getBounds());
        });

        // Destaca o texto se o bairro for perigoso
        if (bairrosPerigosos.includes(feature.properties.bairro)) {
          li.style.color = "#ff4d4d";
          li.style.fontWeight = "bold";
        }

        list.appendChild(li);
      });

      // Filtro de busca
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
//aura
