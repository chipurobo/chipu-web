import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { supabase } from '../lib/supabase';
import type { PublicMakerSpace } from '../lib/database.types';

// =============================================================
// Public ChipuRobo maker-spaces map.
//
// • Pulls from the public.public_maker_spaces view via the anon key
//   (no login required).
// • Renders a Leaflet/OpenStreetMap map centred on Kenya.
// • Each maker space is a marker with a popup naming the school + county.
//
// Leaflet ships its marker icons as image files but bundlers like Vite
// don't rewrite the default URLs that point inside the package. The
// import + mergeOptions block below tells Leaflet exactly where to find
// the icons after bundling.
// =============================================================

import markerIcon       from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x     from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow     from 'leaflet/dist/images/marker-shadow.png';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:        markerIcon,
  iconRetinaUrl:  markerIcon2x,
  shadowUrl:      markerShadow,
});

// Roughly geographic centre of Kenya — Nyandarua-ish — with a zoom that
// fits the whole country on a typical viewport.
const KENYA_CENTER: [number, number] = [-0.5, 37.5];
const KENYA_ZOOM = 6;

export function MakerSpacesMap() {
  const [spaces, setSpaces] = useState<PublicMakerSpace[] | null>(null);
  const [err, setErr]       = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('public_maker_spaces')
        .select('id, name, county, latitude, longitude');
      if (cancelled) return;
      if (error) setErr(error.message);
      else setSpaces((data ?? []) as PublicMakerSpace[]);
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="w-full">
      <div className="mb-3 flex items-baseline justify-between gap-3 flex-wrap">
        <h2 className="m-0">Maker spaces across Kenya</h2>
        <span className="text-xs text-gray-500">
          {spaces ? `${spaces.length} on the map` : '…'}
        </span>
      </div>

      {err && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-3">
          Couldn't load maker spaces: {err}
        </div>
      )}

      <div className="rounded-lg overflow-hidden border border-warm-200 shadow-sm">
        <MapContainer
          center={KENYA_CENTER}
          zoom={KENYA_ZOOM}
          scrollWheelZoom={false}
          style={{ height: '480px', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {spaces?.map((s) => (
            <Marker key={s.id} position={[s.latitude, s.longitude]}>
              <Popup>
                <strong>{s.name}</strong>
                {s.county && <><br /><span className="text-gray-600">{s.county}</span></>}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {spaces && spaces.length === 0 && !err && (
        <p className="mt-3 text-sm text-gray-500 italic">
          No maker spaces on the map yet — ChipuRobo will add them as schools come online.
        </p>
      )}
    </div>
  );
}
