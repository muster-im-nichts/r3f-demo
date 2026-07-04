export const isNarrowScreen = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches
