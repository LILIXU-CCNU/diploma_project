document.addEventListener('DOMContentLoaded', function() {
  const provider = new window.GeoSearch.OpenStreetMapProvider(); //Search Provider
  const searchControl = new window.GeoSearch.GeoSearchControl({
    provider: provider,
    style: 'bar',
    autoComplete: true,             // optional: true|false  - default true
    autoCompleteDelay: 250,
    showMarker: true,                                   // optional: true|false  - default true
    showPopup: false,                                   // optional: true|false  - default false
    marker: {                                           // optional: L.Marker    - default L.Icon.Default
      icon: new L.Icon.Default(),
      draggable: false,
    },
    popupFormat: ({ query, result }) => result.label,   // optional: function    - default returns result label
      maxMarkers: 1,                                      // optional: number      - default 1
      retainZoomLevel: false,                             // optional: true|false  - default false
      animateZoom: true,                                  // optional: true|false  - default true
      autoClose: false,                                   // optional: true|false  - default false
      searchLabel: 'Enter address',                       // optional: string      - default 'Enter address'
      keepResult: false        
    });
    
  // var map = L.map('mapid').setView([44.616687, 33.525432], 11); //Sevastopol
  // var map = L.map('mapid').setView([45.259828, 34.029639], 8); //Crimea
  var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', 
    {attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'});
  var google_satellite = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    {
      maxZoom: 20,
      subdomains:['mt0','mt1','mt2','mt3']
  });

  var map = L.map('mapid',  //map initialization
  {
    center: [45.259828, 34.029639],
    zoom: 8,
    layers: [osm, google_satellite],
    // drawControl: true
  });
  var baseMaps = { //map layers
    "Карта": osm,
    "Спутник": google_satellite
  };
  L.control.layers(baseMaps).addTo(map);

  map.addControl(searchControl); //add search
  L.control.mousePosition({ //add coordinates
    separator: ' / ',
  }).addTo(map);

  //drawing
  var drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);
  var drawControl = new L.Control.Draw({
    draw: {
      polyline: false,
      circle: false,
      polygon: {
      allowIntersection: false
    }
  },
    edit: {
      featureGroup: drawnItems,
      poly: {
        allowIntersection: false
      }
    }
  });
  map.addControl(drawControl);
  map.on(L.Draw.Event.CREATED, function(event) {
    var layer = event.layer;
    drawnItems.addLayer(layer);
    console.log('draw:created->');
    console.log(JSON.stringify(layer.toGeoJSON()));
  });

  //Slide menu 
  var left = "<p> Добро пожаловать!<br>  </p>";
  var contents = "<form action=\"\" method=\"POST\">";
  contents += "<div class=\"form-check\">";
  contents += "<label class=\"form-check-label\">Выберите спутники:</label><br>";
  contents += "<input type=\"checkbox\" name=\"landsat5\" value=\"landsat5\">Landsat 5<br>";
  contents += "<input type=\"checkbox\" name=\"landsat7\" value=\"landsat7\">Landsat 7<br>";
  contents += "<input type=\"checkbox\" name=\"landsat8\" value=\"landsat8\" checked=\"checked\">Landsat 8<br>";
  contents += "<input type=\"checkbox\" name=\"terra_modis\" value=\"terra_modis\">Terra/MODIS<br>";
  contents += "<input type=\"checkbox\" name=\"spot\" value=\"spot\">SPOT 6,7<br><br>";
  contents += "</div>";
  contents += "<div class=\"form-check\">";
  contents += "<label class=\"form-check-label mb-2 mr-sm-2\">Временной промежуток:</label><br>";
  contents += "<label class=\"form-check-label mb-2 mr-sm-2\">Начало:</label>";
  contents += "<input type=\"date\" class=\"form-control-sm mb-2 mr-sm-2\" name=\"date_begin\" required><br>";
  contents += "<label class=\"form-check-label mb-2 mr-sm-2\">Конец:</label>";
  contents += "<input type=\"date\" class=\"form-control-sm mb-2 mr-sm-2\" name=\"date_end\" required><br>";
  contents += "</div>";
  contents += "<label class=\"form-check-label mb-2 mr-sm-2 pad\">E-mail:</label><br>";
  contents += "<div class=\"form-check-inline mb-2 mr-sm-2 pad\">";
  contents += "<input type=\"email\" class=\"form-control-sm mb-2 mr-sm-2\" name=\"email\" placeholder=\"example@example.com\" required><br>";
  contents += "<input type=\"submit\" class=\"btn mb-2 mr-sm-2\" value=\"Отправить\"><br>";
  contents += "</div>";
  contents += "</form>";
          
  var slideMenu = L.control.slideMenu('', 
  {
    position: 'topleft', 
    menuposition: 'topleft', 
    width: '30%', 
    height: '400px', 
    delay: '50', 
    icon: 'fa-chevron-right'
  }).addTo(map);
  slideMenu.setContents(left + contents);
  
  var answer = CheckLayers(drawnItems);
  console.log(answer);
});

function CheckLayers(drawnItems){
  var layer_items = drawnItems.getLayers();
  if (layer_items.length == 0)
    return false;
  return true;
}