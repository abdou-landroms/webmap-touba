var map = L.map("map").setView([14.865, -15.878], 11);

// Used to load and display tile layers on the map
var osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

var googleStreets = L.tileLayer(
  "http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
  {
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
    attribution: "&copy; Google Maps",
    maxZoom: 20,
  }
);

var googleSat = L.tileLayer(
  "http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
  {
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
    attribution: "&copy; Google Satellite",
    maxZoom: 20,
  }
);

var iconMosquee = L.icon({
  iconUrl: "img/icnMosquee.png",
  iconSize: [30, 30],
  popupAnchor: [0, -15],
  className: "icon-style",
});
var iconQuartier = L.icon({
  iconUrl: "img/marker_orange.png",
  iconSize: [30, 30],
  popupAnchor: [0, -15],
  className: "icon-style",
});

var mosquee = L.marker([14.8633, -15.8755], { icon: iconMosquee }).addTo(map);
mosquee.bindPopup(
  "<div class = 'popup-content'><b>Grande Mosquée de Touba</b><hr><img src='img/mosquee_touba.jpeg' width='200px'></hr></div>"
);

var quartier = L.marker([14.865, -15.878], { icon: iconQuartier }).addTo(map);
quartier.bindPopup(
  "<div class='popup-content'><b>Un quartier de Touba</b></div>"
);

var lieux = L.layerGroup([mosquee, quartier]).addTo(map);

//REMPLICCAGE UNIQUE
var monStyle = {
  color: "white",
  weight: 1,
  fillColor: "purple",
  fillOpacity: 0.4,
};

// REMPLISSAGE GRADUEE
function styleGradue(feature) {
  var valeur = Number(feature.properties.fictif);
  var remplissage = "white";

  if (valeur > 90) remplissage = "red";
  else if (valeur > 60) remplissage = "yellow";
  else remplissage = "green";

  return {
    color: "white",
    weight: 1,
    fillColor: remplissage,
    fillOpacity: 0.5,
  };
}

// REMPLISSAGE CATEGORISE

function styleCategorise(feature) {
  var statutEnquete = feature.properties.Enquete;
  var remplissage = "white";

  if (statutEnquete == "OUI") remplissage = "blue";
  else remplissage = "grey";

  return {
    fillColor: remplissage,
    color: "white",
    weight: 1,
    fillOpacity: 0.7,
  };
}
var quartiers; // Accessible globalement
var quartiers_touba = new L.layerGroup();
$.getJSON("data/quartier_touba.geojson", function (data) {
  //Ajout de la donnée
  quartiers = L.geoJson(data, {
    style: monStyle,
    onEachFeature: function (feature, layer) {
      var nom = feature.properties.QRT_VLG_HA;
      var info = feature.properties.fictif;

      layer.bindPopup(
        "<div class='popup-content'>" +
          "Quartier : <b>" +
          nom +
          "</b><hr>" +
          "Situation : <b>" +
          info +
          "</b></hr></div>"
      );
    },
  });
  quartiers_touba.addLayer(quartiers);
  quartiers_touba.addTo(map);
});

document.querySelectorAll('input[name="style"]').forEach((input) => {
  input.addEventListener("change", function () {
    if (!quartiers) return;

    if (this.value === "unique") {
      quartiers.setStyle(monStyle);
    } else if (this.value === "cat") {
      quartiers.setStyle(styleCategorise);
    } else if (this.value === "grad") {
      quartiers.setStyle(styleGradue);
    }
  });
});

function majLegende(style) {
  const container = document.getElementById("legende");
  if (!container) return;

  if (style === "unique") {
    container.innerHTML = `
      <b style = "text-decoration: underline">LEGENDE</b> </br>
      <span style="background:purple;"></span> Quartiers
    `;
  }

  if (style === "cat") {
    container.innerHTML = `
    <b style = "text-decoration: underline">LEGENDE</b> </br>
      <b>Statut de l'enquête</b><br>
      <span style="background:blue;"></span> Enquêté<br>
      <span style="background:grey;"></span> Non enquêté
    `;
  }

  if (style === "grad") {
    container.innerHTML = `
    <b style = "text-decoration: underline">LEGENDE</b> </br>
      <b>Valeur fictive</b><br>
      <span style="background:red;"></span> > 90<br>
      <span style="background:yellow;"></span> 61 - 90<br>
      <span style="background:green;"></span> ≤ 60
    `;
  }
}
document.querySelectorAll('input[name="style"]').forEach((input) => {
  input.addEventListener("change", function () {
    if (!quartiers) return;

    if (this.value === "unique") {
      quartiers.setStyle(monStyle);
      majLegende("unique");
    } else if (this.value === "cat") {
      quartiers.setStyle(styleCategorise);
      majLegende("cat");
    } else if (this.value === "grad") {
      quartiers.setStyle(styleGradue);
      majLegende("grad");
    }
  });
});
majLegende("unique");

// CONTOLEUR
//DES
//COUCHES
var baseMaps = {
  OpenStreetMap: osm,
  "Google Maps": googleStreets,
  "Google Satellite": googleSat,
};

var couches = {
  Lieux: lieux,
  Quartiers: quartiers_touba,
};
var controleur = L.control.layers(baseMaps, couches, { collapsed: false });
controleur.addTo(map);
// Vue initiale
var vueInitiale = {
  center: [14.865, -15.878],
  zoom: 11,
};
var BoutonReset = L.Control.extend({
  options: { position: "topleft" },
  onAdd: function (map) {
    var container = L.DomUtil.create("div", "leaflet-bar");
    container.innerHTML = "🔄";
    container.style.backgroundColor = "#0AAAEE";
    container.style.width = "30px";
    container.style.height = "30px";
    container.style.lineHeight = "30px";
    // container.style.borderRadius = "50%";
    container.style.textAlign = "center";
    container.style.fontSize = "20px";
    container.style.cursor = "pointer";
    container.title = "Recentrer la carte";

    container.onclick = function () {
      map.setView(vueInitiale.center, vueInitiale.zoom);
    };

    return container;
  },
});
map.addControl(new BoutonReset());

var locateControl = L.control
  .locate({
    position: "topleft",
    setView: true, //
    flyTo: true, //
    keepCurrentZoomLevel: true,
    showPopup: false,
    strings: {
      title: "Ma position",
    },
  })
  .addTo(map);
map.on("contextmenu", function (e) {
  var latlng = e.latlng;
  L.popup()
    .setLatLng(latlng)
    .setContent(
      `<b>Coordonnées (Lat,Lng)</b><br> ${latlng.lat.toFixed(
        5
      )},${latlng.lng.toFixed(5)}`
    )
    .openOn(map);
});

var printer = L.easyPrint({
  title: "📷 Exporter la carte",
  position: "topleft",
  // sizeModes: ["Current"],
  // filename: "carte_touba",
  exportOnly: true,
  hidden: true,
  hideControlContainer: true,
  elementsToHide: ["#legende"],
}).addTo(map);

document.getElementById("btn-export").addEventListener("click", function () {
  printer.printMap("CurrentSize", "Ta_carte");
});
