window.addEventListener("load", () => {
    const map = L.map("map").setView([-30.0346, -51.2177], 12);
  
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://carto.com/">CARTO</a> | &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
    }).addTo(map);
  
    fetch("bairros.geojson")
      .then(res => res.json())
      .then(data => {
        const bairrosLayer = L.geoJSON(data, {
          style: {
            color: "#ff4d4d",  
            weight: 2,
            fillColor: "#ff0000",
            fillOpacity: 0.1,
          },
          onEachFeature: (feature, layer) => {
            if (feature.properties && feature.properties.bairro) {
              layer.bindPopup(`<b>${feature.properties.bairro}</b>`);
            }
          },
        }).addTo(map);
  

        map.fitBounds(bairrosLayer.getBounds());
  

        const list = document.getElementById("dangerousList");
        data.features.forEach(feature => {
          const li = document.createElement("li");
          li.textContent = feature.properties.bairro;
          li.addEventListener("click", () => {
            map.fitBounds(L.geoJSON(feature).getBounds());
          });
          list.appendChild(li);
        });
  

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
  