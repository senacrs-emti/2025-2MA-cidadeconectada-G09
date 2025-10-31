
window.addEventListener("load", () => {

    const map = L.map("map").setView([-30.0346, -51.2177], 12);
  

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://carto.com/">CARTO</a> | &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
    }).addTo(map);
  
 
    const bairros = [
      { nome: "Centro Histórico", coords: [-30.033, -51.23] },
      { nome: "Bom Fim", coords: [-30.0335, -51.21] },
      { nome: "Menino Deus", coords: [-30.05, -51.22] },
      { nome: "Moinhos de Vento", coords: [-30.025, -51.2] },
      { nome: "Tristeza", coords: [-30.11, -51.27] },
      { nome: "Restinga", coords: [-30.14, -51.22] },
    ];
  

    bairros.forEach((b) => {
      const marker = L.circleMarker(b.coords, {
        radius: 7,
        fillColor: "#1e90ff",
        color: "#fff",
        weight: 1,
        fillOpacity: 0.9,
      }).addTo(map);
      marker.bindPopup(`<b>${b.nome}</b>`);
    });
  
    // Preenche a lista
    const list = document.getElementById("dangerousList");
    bairros.forEach((b) => {
      const li = document.createElement("li");
      li.textContent = b.nome;
      li.addEventListener("click", () => {
        map.setView(b.coords, 14);
      });
      list.appendChild(li);
    });
  

    document.getElementById("searchInput").addEventListener("input", (e) => {
      const termo = e.target.value.toLowerCase();
      document.querySelectorAll("#dangerousList li").forEach((li) => {
        li.style.display = li.textContent.toLowerCase().includes(termo)
          ? "block"
          : "none";
      });
    });
  });
  