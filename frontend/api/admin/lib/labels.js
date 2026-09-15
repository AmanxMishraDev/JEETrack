const COACHING_LABELS = {
  pw_online: 'PW Online', allen_online: 'Allen Online', unacademy: 'Unacademy',
  vedantu: 'Vedantu', aakash_online: 'Aakash Digital', motion_online: 'Motion Online',
  other_online: 'Other (Online)', pw_vidyapeeth: 'PW Vidyapeeth', allen: 'Allen',
  aakash: 'Aakash', fiitjee: 'FIITJEE', resonance: 'Resonance', vibrant: 'Vibrant Academy',
  motion: 'Motion', narayana: 'Narayana', sri_chaitanya: 'Sri Chaitanya',
  other_offline: 'Other (Offline)', self: 'Self Study',
};
export function coachingLabel(id) {
  if (!id) return 'Not Set';
  return COACHING_LABELS[id] || id;
}

const CLASS_LABELS = { '11': 'Class 11', '12': 'Class 12', dropper: 'Dropper', other: 'Other' };
export function classLabel(id) {
  if (!id) return 'Not Set';
  return CLASS_LABELS[id] || id;
}

const SOURCE_LABELS = {
  reddit: 'Reddit', google: 'Google Search', youtube: 'YouTube',
  instagram: 'Instagram', friend: 'Friend / Word of Mouth', other: 'Somewhere Else',
};
export function sourceLabel(id) {
  if (!id) return 'Not Set';
  return SOURCE_LABELS[id] || id;
}
