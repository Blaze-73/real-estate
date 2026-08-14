import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import formatPrice from '../../utils/formatPrice';

const ASILAH = [35.462792, -6.035159];

const PropertiesMap = ({ properties = [], activeId = null, onHover, onSelect, priceMode = 'night', nights = 0 }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef(new Map());
  const activeRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const markers = markersRef.current;
    const map = L.map(containerRef.current, {
      center: ASILAH,
      zoom: 12,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markers.clear();
      activeRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const markers = markersRef.current;
    markers.forEach((m) => map.removeLayer(m));
    markers.clear();
    activeRef.current = null;

    const bounds = L.latLngBounds();

    properties.forEach((p) => {
      const lat = Number(p.latitude);
      const lng = Number(p.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const key = String(p.slug || p.id);
      const label = p.title || key;
      const price =
        priceMode === 'total' && nights >= 1
          ? (() => {
              const rate =
                nights >= 28 && Number(p.monthly_price) > 0
                  ? Number(p.monthly_price) / 30.4375
                  : Number(p.nightly_price) > 0
                    ? Number(p.nightly_price)
                    : Number(p.price);
              return rate * nights + Number(p.cleaning_fee || 0);
            })()
          : Number(p.nightly_price) > 0
            ? Number(p.nightly_price)
            : Number(p.price);

      const marker = L.marker([lat, lng], {
        title: label,
        keyboard: true,
        icon: L.divIcon({
          className: 'pm-wrap',
          html: `<button type="button" class="pm-pin" aria-label="${String(label).replaceAll('"', '&quot;')}">${formatPrice(price)}</button>`,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        }),
      });

      marker.on('mouseover', () => onHover?.(key));
      marker.on('mouseout', () => onHover?.(null));
      marker.on('click', () => onSelect?.(key));

      marker.addTo(map);
      markers.set(key, marker);
      bounds.extend([lat, lng]);
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
    } else {
      map.setView(ASILAH, 12);
    }
  }, [properties, priceMode, nights, onHover, onSelect]);

  useEffect(() => {
    const prev = activeRef.current;
    if (prev === activeId) return;

    const apply = (key) => {
      const el = markersRef.current.get(key)?.getElement();
      if (el) el.classList.toggle('is-active', key === activeId);
    };

    if (prev) apply(prev);
    if (activeId) apply(activeId);
    activeRef.current = activeId;
  }, [activeId]);

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label="Properties map"
      className="isolate z-0 h-full w-full"
    />
  );
};

export default PropertiesMap;