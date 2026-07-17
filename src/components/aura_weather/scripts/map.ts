import maplibregl from 'maplibre-gl';
import type { GeoLocation, MapCamera } from './types';

export const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

export interface DragVelocity {
  vx: number;
  vy: number;
}

export interface MapInstance {
  map: maplibregl.Map;
  destroy: () => void;
  onMove: (callback: (camera: MapCamera) => void) => () => void;
  onMoveEnd: (callback: (camera: MapCamera) => void) => () => void;
  onDrag: (callback: (velocity: DragVelocity) => void) => () => void;
  flyTo: (location: GeoLocation, zoom?: number) => void;
  getCamera: () => MapCamera;
}

export function initMap(
  container: HTMLElement,
  initialCenter: [number, number] = [-74.0817, 4.6097],
  initialZoom: number = 5
): MapInstance {
  const map = new maplibregl.Map({
    container,
    style: MAP_STYLE,
    center: initialCenter,
    zoom: initialZoom,
    pitch: 0,
    bearing: 0,
    antialias: true,
    maxZoom: 18,
    minZoom: 2,
  });

  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

  const moveCallbacks: Array<(camera: MapCamera) => void> = [];
  const moveEndCallbacks: Array<(camera: MapCamera) => void> = [];
  const dragCallbacks: Array<(velocity: DragVelocity) => void> = [];

  let lastMouseX = 0;
  let lastMouseY = 0;
  let lastMoveTime = 0;
  let isDragging = false;

  function getCamera(): MapCamera {
    const center = map.getCenter();
    return {
      center: { lng: center.lng, lat: center.lat },
      zoom: map.getZoom(),
      bearing: map.getBearing(),
      pitch: map.getPitch(),
    };
  }

  const canvas = map.getCanvas();

  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    lastMoveTime = performance.now();
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const now = performance.now();
    const dt = now - lastMoveTime;
    if (dt < 16) return;

    const dx = e.clientX - lastMouseX;
    const dy = e.clientY - lastMouseY;

    const vx = (dx / dt) * 16;
    const vy = (dy / dt) * 16;

    dragCallbacks.forEach((cb) => cb({ vx, vy }));

    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    lastMoveTime = now;
  });

  canvas.addEventListener('mouseup', () => {
    isDragging = false;
  });

  canvas.addEventListener('mouseleave', () => {
    isDragging = false;
  });

  let touchStartX = 0;
  let touchStartY = 0;
  let touchLastTime = 0;

  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchLastTime = performance.now();
    }
  }, { passive: true });

  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length !== 1) return;

    const now = performance.now();
    const dt = now - touchLastTime;
    if (dt < 16) return;

    const dx = e.touches[0].clientX - touchStartX;
    const dy = e.touches[0].clientY - touchStartY;

    const vx = (dx / dt) * 16;
    const vy = (dy / dt) * 16;

    dragCallbacks.forEach((cb) => cb({ vx, vy }));

    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchLastTime = now;
  }, { passive: true });

  canvas.addEventListener('touchend', () => {
    touchLastTime = 0;
  }, { passive: true });

  map.on('move', () => {
    const camera = getCamera();
    moveCallbacks.forEach((cb) => cb(camera));
  });

  map.on('moveend', () => {
    const camera = getCamera();
    moveEndCallbacks.forEach((cb) => cb(camera));
  });

  return {
    map,
    destroy: () => map.remove(),
    onMove: (callback: (camera: MapCamera) => void) => {
      moveCallbacks.push(callback);
      return () => {
        const index = moveCallbacks.indexOf(callback);
        if (index > -1) moveCallbacks.splice(index, 1);
      };
    },
    onMoveEnd: (callback: (camera: MapCamera) => void) => {
      moveEndCallbacks.push(callback);
      return () => {
        const index = moveEndCallbacks.indexOf(callback);
        if (index > -1) moveEndCallbacks.splice(index, 1);
      };
    },
    onDrag: (callback: (velocity: DragVelocity) => void) => {
      dragCallbacks.push(callback);
      return () => {
        const index = dragCallbacks.indexOf(callback);
        if (index > -1) dragCallbacks.splice(index, 1);
      };
    },
    flyTo: (location: GeoLocation, zoom: number = 10) => {
      map.flyTo({
        center: [location.longitude, location.latitude],
        zoom,
        essential: true,
        duration: 2000,
        curve: 1.5,
      });
    },
    getCamera,
  };
}

export async function getUserLocation(): Promise<GeoLocation | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=es`
          );
          const data = await response.json();
          const address = data.address || {};

          resolve({
            latitude,
            longitude,
            name: address.city || address.town || address.village || address.municipality || 'Ubicación actual',
            country: address.country || '',
            admin1: address.state || '',
          });
        } catch {
          resolve({
            latitude,
            longitude,
            name: 'Mi ubicación',
            country: '',
          });
        }
      },
      () => {
        resolve(null);
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000,
      }
    );
  });
}
