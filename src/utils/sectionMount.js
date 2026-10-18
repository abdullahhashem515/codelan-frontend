// Below-fold sections mount on approach (see components/DeferredSection).
// Anchor navigation has to bypass that: scrolling while the sections in
// between are still placeholders would aim at an offset that stops being
// correct as soon as they grow. Firing this first mounts them all, so the
// scroll runs against final heights.
//
// Lives outside the component file so that file only exports components and
// Fast Refresh keeps working.
export const MOUNT_ALL_SECTIONS = 'codelanco:mount-all-sections';

export const mountAllSections = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(MOUNT_ALL_SECTIONS));
};
