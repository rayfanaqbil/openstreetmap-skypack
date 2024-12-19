import Map from 'https://cdn.skypack.dev/ol/Map.js';
import View from 'https://cdn.skypack.dev/ol/View.js';
import TileLayer from 'https://cdn.skypack.dev/ol/layer/Tile.js';
import OSM from 'https://cdn.skypack.dev/ol/source/OSM.js';
import VectorLayer from 'https://cdn.skypack.dev/ol/layer/Vector.js';
import VectorSource from 'https://cdn.skypack.dev/ol/source/Vector.js';
import Feature from 'https://cdn.skypack.dev/ol/Feature.js';
import Point from 'https://cdn.skypack.dev/ol/geom/Point.js';
import { Icon, Style } from 'https://cdn.skypack.dev/ol/style.js';
import { fromLonLat, toLonLat } from 'https://cdn.skypack.dev/ol/proj.js';

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  view: new View({
    center: fromLonLat([107.54249456754211, -6.884723248778016]),
    zoom: 8,
  }),
});

const markerSource = new VectorSource();
const markerLayer = new VectorLayer({
  source: markerSource,
});
map.addLayer(markerLayer);

const popup = document.getElementById('popup');
const descriptionInput = document.getElementById('marker-description');
const addMarkerButton = document.getElementById('add-marker');
const cancelButton = document.getElementById('cancel');
let selectedCoordinates = null;


map.on('click', (event) => {
  const coordinates = toLonLat(event.coordinate);
  const longitude = coordinates[0].toFixed(6);
  const latitude = coordinates[1].toFixed(6);

  selectedCoordinates = event.coordinate;

  popup.querySelector('h3').textContent = `Masukkan Lokasi:
Longitude: ${longitude}
Latitude: ${latitude}`;
  popup.classList.remove('hidden');
});


addMarkerButton.addEventListener('click', () => {
  const description = descriptionInput.value.trim();
  if (description && selectedCoordinates) {
    const marker = new Feature({
      geometry: new Point(selectedCoordinates),
      description: description,
      longitude: toLonLat(selectedCoordinates)[0].toFixed(6),
      latitude: toLonLat(selectedCoordinates)[1].toFixed(6),
    });

    marker.setStyle(
      new Style({
        image: new Icon({
          src: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
          scale: 0.05,
        }),
      })
    );

    markerSource.addFeature(marker);
    popup.classList.add('hidden');
    descriptionInput.value = '';
  }
});


cancelButton.addEventListener('click', () => {
  popup.classList.add('hidden');
  descriptionInput.value = '';
});


map.on('click', (event) => {
  map.forEachFeatureAtPixel(event.pixel, (feature) => {
    const description = feature.get('description');
    const longitude = feature.get('longitude');
    const latitude = feature.get('latitude');
    if (description) {
      const infoPopup = document.createElement('div');
      infoPopup.className = 'popup';
      infoPopup.innerHTML = `
        <div class="popup-content">
          <h3>Informasi Marker:</h3>
          <p><strong>Deskripsi:</strong> ${description}</p>
          <p><strong>Longitude:</strong> ${longitude}</p>
          <p><strong>Latitude:</strong> ${latitude}</p>
          <button id="close-info">Tutup</button>
        </div>
      `;
      document.body.appendChild(infoPopup);

      infoPopup.querySelector('#close-info').addEventListener('click', () => {
        infoPopup.remove();
      });
    }
  });
});
