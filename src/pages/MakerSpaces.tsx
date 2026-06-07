import { MakerSpacesMap } from '../components/MakerSpacesMap';

/**
 * /maker-spaces
 *
 * Public-facing map. Marker source is the public.public_schools_map view —
 * every school whose admin has set coordinates appears, with a colour-coded
 * distinction between maker spaces (terracotta) and other code-club
 * schools (teal). Anonymous visitors can browse.
 */
const MakerSpaces = () => {
  return (
    <div className="bg-warm-50">
      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest text-teal-700 mb-2">
            Network
          </p>
          <h1 className="mb-4">Maker spaces &amp; schools</h1>
          <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto">
            Every dot on the map is a school in the ChipuRobo network. The terracotta dots
            are maker spaces — schools that fabricate robots, braille devices and
            accessibility hardware for the rest of the network. Tap a marker for details.
          </p>
        </div>
      </section>

      {/* Map */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-6xl mx-auto">
          <MakerSpacesMap />
        </div>
      </section>
    </div>
  );
};

export default MakerSpaces;
