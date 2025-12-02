window.addEventListener("load", () => {
  const map = L.map("map").setView([-30.0346, -51.2177], 12);

  map.attributionControl.addAttribution(
    '  <a href="https://www.rs.gov.br/busca?q=&orgao=145" target="_blank">Fontes</a>'
  );

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution:
      '&copy; <a href="https://carto.com/">CARTO</a> | &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
  }).addTo(map);

  let bairrosLayer = null;
  let dadosCrimesAtuais = {};
  let crimeAtualNome = "";
  let listaOriginal = []; 

  function normalizarNome(texto) {
    return texto
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function darkenColor(hex, factor = 0.35) {
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);

    const newR = Math.max(0, Math.floor(r * (1 - factor)));
    const newG = Math.max(0, Math.floor(g * (1 - factor)));
    const newB = Math.max(0, Math.floor(b * (1 - factor)));

    return (
      "#" +
      newR.toString(16).padStart(2, "0") +
      newG.toString(16).padStart(2, "0") +
      newB.toString(16).padStart(2, "0")
    );
  }

  function corPorQuantidade(qtd) {
    if (qtd === 0) return "#4cc9f0";
    if (qtd < 10) return "#76c893";
    if (qtd < 30) return "#f9c74f";
    return "#f94144";
  }

  function atualizarListaRankeada() {
    const ul = document.getElementById("dangerousList");
    ul.innerHTML = "";

    if (!crimeAtualNome) {
      listaOriginal
        .sort((a, b) => a.localeCompare(b))
        .forEach((bairro) => {
          const li = document.createElement("li");
          li.textContent = bairro;
          li.style.color = "#fff";
          li.addEventListener("click", () => focarBairro(bairro));
          ul.appendChild(li);
        });
      return;
    }

    const ranking = listaOriginal
      .map((nome) => ({
        nome,
        qtd: dadosCrimesAtuais[normalizarNome(nome)] || 0,
      }))
      .sort((a, b) => b.qtd - a.qtd);

    ranking.forEach((obj, index) => {
      const li = document.createElement("li");
      li.textContent = `${obj.nome} — ${obj.qtd}`;

      if (index < 3 && obj.qtd > 0) {
        li.style.color = "#ff4d4d";
      } else {
        li.style.color = "#fff";
      }

      li.addEventListener("click", () => focarBairro(obj.nome));
      ul.appendChild(li);
    });
  }

  function focarBairro(nome) {
    bairrosLayer.eachLayer((layer) => {
      if (layer.feature.properties.bairro === nome) {
        map.fitBounds(layer.getBounds());
      }
    });
  }

  function atualizarEstilo() {
    bairrosLayer.eachLayer((layer) => {
      const nome = normalizarNome(layer.feature.properties.bairro);
      const qtd = dadosCrimesAtuais[nome] || 0;

      let fill, borda;

      if (!crimeAtualNome) {
        fill = "#888";
        borda = "#555";
      } else {
        fill = corPorQuantidade(qtd);
        borda = darkenColor(fill, 0.25);
      }

      layer.setStyle({
        color: borda,
        weight: 1.2,
        fillColor: fill,
        fillOpacity: crimeAtualNome ? 0.32 : 0.15,
      });

      layer.unbindPopup();
      layer.bindPopup(`
        <b>${layer.feature.properties.bairro}</b><br>
        ${crimeAtualNome || "Nenhum crime selecionado"}<br>
        <b>${qtd} casos</b>
      `);
    });

    atualizarListaRankeada();
  }

  function carregarMapaInicial() {
    fetch("bairros.geojson")
      .then((r) => r.json())
      .then((data) => {
        bairrosLayer = L.geoJSON(data).addTo(map);
        map.fitBounds(bairrosLayer.getBounds());

        const ul = document.getElementById("dangerousList");

        data.features.forEach((f) => {
          const nome = f.properties.bairro;
          listaOriginal.push(nome);

          const li = document.createElement("li");
          li.textContent = nome;

          li.addEventListener("click", () => focarBairro(nome));
          ul.appendChild(li);
        });

        atualizarEstilo();
      });
  }

  carregarMapaInicial();

  document.getElementById("crimeSelect").addEventListener("change", async (e) => {
    const crime = e.target.value;

    if (!crime) {
      crimeAtualNome = "";
      dadosCrimesAtuais = {};
      atualizarEstilo();
      return;
    }

    const todosCrimes = await fetch("crimes.json").then((r) => r.json());

    const crimeNorm = normalizarNome(crime);
    crimeAtualNome = crime;

    dadosCrimesAtuais = todosCrimes[crimeNorm] || {};

    atualizarEstilo();
  });
});
//aura
