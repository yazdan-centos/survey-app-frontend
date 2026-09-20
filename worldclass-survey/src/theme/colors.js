// Brand color palette — sampled directly from mapnagroup.com's contact page
// (header bar, logo mark, headings). Blue was intentionally excluded, per
// design brief, since it isn't part of MAPNA's visual identity there.
//
//   PRIMARY[700] = #C4161C — the vivid red used for the logo's diagonal
//                            mark, page headings, and links.
//   PRIMARY[800] = #9E0B0F — the deep maroon used for the top utility bar
//                            and other strong solid fills.
// All other stops are generated tints/shades around those two sampled
// anchors so the full 50–950 scale stays usable across borders, hover
// states, badges, etc.
//
// CHARCOAL is the neutral gray-charcoal used for the logo's wordmark and
// works as a non-blue alternative to Tailwind's default slate/gray scales
// wherever a brand-flavored neutral is wanted.

export const PRIMARY = {
  50: '#FDEFF0',
  100: '#FBD8D9',
  200: '#F6B0B3',
  300: '#F18185',
  400: '#EB4C52',
  500: '#E62229',
  600: '#D4181E',
  700: '#C4161C',
  800: '#9E0B0F',
  900: '#7B090C',
  950: '#5F0709',
};

export const CHARCOAL = {
  50: '#F8F8F8',
  100: '#EDEEEE',
  200: '#D9D9DA',
  300: '#BDBEBF',
  400: '#959699',
  500: '#6D6E71',
  600: '#5D5E60',
  700: '#4C4D4F',
  800: '#3C3D3E',
  900: '#2C2C2D',
};

export const THEME_COLORS = {
  primary: PRIMARY,
  charcoal: CHARCOAL,
};

export default THEME_COLORS;
