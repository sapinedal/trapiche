/**
 * Single source of truth for portal stacking order.
 *
 * Every portalled overlay reads from here so a popover opened *inside* a modal
 * always paints above it instead of disappearing behind the backdrop.
 */
export const Z_INDEX = {
  modal: 1100,
  /** Popovers (Select, datepickers) must outrank the modal that can contain them. */
  popover: 1200,
  toast: 1300,
} as const;
