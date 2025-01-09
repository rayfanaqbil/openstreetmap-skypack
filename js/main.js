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
import * as turf from 'https://cdn.skypack.dev/@turf/turf';
import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/src/sweetalert2.js";
import { addCSS } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.9/element.js";

addCSS("https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.css");

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

let selectedCoordinates = null;

map.on('click', (event) => {
  const coordinates = toLonLat(event.coordinate);
  const longitude = coordinates[0].toFixed(6);
  const latitude = coordinates[1].toFixed(6);

  selectedCoordinates = event.coordinate;

  Swal.fire({
    title: 'Masukkan Lokasi',
    html: `<strong>Longitude:</strong> ${longitude} <br><strong>Latitude:</strong> ${latitude}`,
    input: 'text',
    inputLabel: 'Deskripsi Lokasi',
    inputPlaceholder: 'Masukkan deskripsi...',
    showCancelButton: true,
    confirmButtonText: 'Tambah Marker',
    cancelButtonText: 'Batal',
  }).then((result) => {
    if (result.isConfirmed && result.value.trim()) {
      const description = result.value.trim();

      const marker = new Feature({
        geometry: new Point(selectedCoordinates),
        description: description,
        longitude: longitude,
        latitude: latitude,
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


      marker.on('click', () => {
        Swal.fire({
          title: 'Detail Lokasi',
          html: `<strong>Deskripsi:</strong> ${description} <br><strong>Longitude:</strong> ${longitude} <br><strong>Latitude:</strong> ${latitude}`,
          icon: 'info',
        });
      });

      Swal.fire({
        title: 'Marker Ditambahkan',
        text: `Lokasi: ${description} berhasil ditambahkan!`,
        icon: 'success',
      });
    }
  });
});


map.on('singleclick', (event) => {
  const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => feature);
  if (feature) {
    const description = feature.get('description');
    const longitude = feature.get('longitude');
    const latitude = feature.get('latitude');

    Swal.fire({
      title: 'Detail Lokasi',
      html: `<strong>Deskripsi:</strong> ${description} <br><strong>Longitude:</strong> ${longitude} <br><strong>Latitude:</strong> ${latitude}`,
      icon: 'info',
    });
  }
});


function addUserLocationMarker() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCoordinates = [
          position.coords.longitude,
          position.coords.latitude,
        ];
        console.log("Koordinat pengguna berhasil diperoleh:", userCoordinates);

        const userMarker = new Feature({
          geometry: new Point(fromLonLat(userCoordinates)),
        });

        userMarker.setStyle(
          new Style({
            image: new Icon({
              src: 'https://cdn-icons-png.flaticon.com/512/64/64113.png',
              scale: 0.05,
              anchor: [0.5, 1],
            }),
          })
        );

        const userLayer = new VectorLayer({
          source: new VectorSource({
            features: [userMarker],
          }),
        });

        map.addLayer(userLayer);

        map.getView().animate({
          center: fromLonLat(userCoordinates),
          zoom: 16,
        });

      
        const nearestLocation = findNearestLocation(userCoordinates, parkingLocations);
        if (nearestLocation) {
          const nearestMarker = new Feature({
            geometry: new Point(fromLonLat(nearestLocation.coordinates)),
            description: nearestLocation.name,
          });

          nearestMarker.setStyle(
            new Style({
              image: new Icon({
                src: 'https://cdn-icons-png.flaticon.com/512/854/854878.png',
                scale: 0.05,
              }),
            })
          );

          markerSource.addFeature(nearestMarker);

        
          Swal.fire({
            title: "Lokasi Parkir Terdekat",
            text: `Lokasi terdekat adalah ${nearestLocation.name}.`,
            icon: "info",
          });
        }
      },
      (error) => {
        console.error("Gagal mendapatkan lokasi pengguna:", error.message);
        Swal.fire({
          title: "Lokasi tidak tersedia",
          text: "Pastikan fitur lokasi di perangkat Anda aktif.",
          icon: "error",
        });
      }
    );
  } else {
    Swal.fire({
      title: "Geolokasi tidak didukung",
      text: "Perangkat Anda tidak mendukung geolokasi.",
      icon: "warning",
    });
  }
}

function findNearestLocation(userCoordinates, locations) {
  let nearest = null;
  let minDistance = Infinity;

  locations.forEach((location) => {
    const distance = turf.distance(
      turf.point(userCoordinates),
      turf.point(location.coordinates)
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearest = location;
    }
  });

  return nearest;
}

addUserLocationMarker();


