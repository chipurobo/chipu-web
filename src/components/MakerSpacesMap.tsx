import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { supabase } from '../lib/supabase';
import type { PublicSchoolPin } from '../lib/database.types';

// =============================================================
// Public ChipuRobo schools / maker-spaces map.
//
// • Pulls pins from the get_public_schools_map() RPC via the anon key
//   (no login required). The RPC returns every school that has
//   coordinates set, plus an is_maker_space flag.
// • Renders a Leaflet/OpenStreetMap map centred on Kenya.
// • Two marker colours: terracotta for maker spaces, teal for the
//   rest. Popup gives the school name, county, and a tag.
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

// Tinted SVG marker so we can colour-code maker spaces vs other schools
// without dragging in extra image assets.
function coloredIcon(hex: string): L.DivIcon {
  return L.divIcon({
    className: 'chipurobo-map-pin',
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
      <path fill="${hex}" stroke="#1f2937" stroke-width="1.5"
        d="M14 1 C 6.8 1 1 6.8 1 14 c 0 9 13 25 13 25 s 13 -16 13 -25 C 27 6.8 21.2 1 14 1 z"/>
      <circle cx="14" cy="14" r="5" fill="#fff"/>
    </svg>`,
    iconSize: [28, 40],
    iconAnchor: [14, 38],
    popupAnchor: [0, -32],
  });
}

const ICON_MAKER  = coloredIcon('#dc6b4a'); // terracotta-500-ish
const ICON_SCHOOL = coloredIcon('#0d9488'); // teal-600

// Roughly geographic centre of Kenya with a zoom that fits the whole
// country on a typical viewport.
const KENYA_CENTER: [number, number] = [-0.5, 37.5];
const KENYA_ZOOM = 6;

export function MakerSpacesMap() {
  const [pins, setPins] = useState<PublicSchoolPin[] | null>(null);
  const [err, setErr]   = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // SECURITY DEFINER RPC (anon-callable): redacted pins only — it
      // replaced the public_schools_map view flagged by the Security
      // Advisor. Same columns, same rows.
      const { data, error } = await supabase.rpc('get_public_schools_map');
      if (cancelled) return;
      if (error) setErr(error.message);
      else setPins((data ?? []) as PublicSchoolPin[]);
    })();
    return () => { cancelled = true; };
  }, []);

  const counts = useMemo(() => ({
    total:  pins?.length ?? 0,
    makers: pins?.filter((p) => p.is_maker_space).length ?? 0,
  }), [pins]);

  return (
    <div className="w-full">
      <div className="mb-3 flex items-baseline justify-between gap-3 flex-wrap">
        <h2 className="m-0">Schools on the map</h2>
        <span className="text-xs text-gray-500">
          {pins
            ? `${counts.total} total · ${counts.makers} maker space${counts.makers === 1 ? '' : 's'}`
            : '…'}
        </span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-3 text-xs text-gray-700">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: '#dc6b4a' }} />
          Maker space
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: '#0d9488' }} />
          School
        </span>
      </div>

      {err && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-3">
          Couldn't load the map: {err}
        </div>
      )}

      {/* Responsive height: 60vh on phones (with sensible floor + ceiling)
          so the map breathes without eating the whole screen. */}
      <div
        className="rounded-lg overflow-hidden border border-warm-200 shadow-sm"
        style={{ height: 'min(70vh, 560px)' }}
      >
        <MapContainer
          center={KENYA_CENTER}
          zoom={KENYA_ZOOM}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%', minHeight: '320px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {pins?.map((p) => (
            <Marker
              key={p.id}
              position={[p.latitude, p.longitude]}
              icon={p.is_maker_space ? ICON_MAKER : ICON_SCHOOL}
            >
              <Popup>
                <strong>{p.name}</strong>
                {p.county && <><br /><span className="text-gray-600">{p.county}</span></>}
                <br />
                <span className={p.is_maker_space ? 'text-terracotta-600' : 'text-teal-700'}>
                  {p.is_maker_space ? 'Maker space' : 'School'}
                </span>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {pins && pins.length === 0 && !err && (
        <p className="mt-3 text-sm text-gray-500 italic">
          No schools on the map yet — they'll appear here as soon as one has coordinates set.
        </p>
      )}
    </div>
  );
}
