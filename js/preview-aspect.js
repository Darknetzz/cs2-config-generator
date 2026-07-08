/**
 * Preview canvas aspect ratio options.
 */
const PreviewAspect = (() => {
  const OPTIONS = [
    { id: '1:1', label: '1:1', widthRatio: 1, heightRatio: 1 },
    { id: '4:3', label: '4:3', widthRatio: 4, heightRatio: 3 },
  ];

  const DEFAULT_ID = '1:1';
  const byId = new Map(OPTIONS.map((option) => [option.id, option]));

  function isValidId(id) {
    return byId.has(id);
  }

  function getById(id) {
    return byId.get(id) ?? byId.get(DEFAULT_ID);
  }

  /** Pixel dimensions with the longer side capped at baseSize. */
  function getDimensions(baseSize, id) {
    const { widthRatio, heightRatio } = getById(id);
    if (widthRatio >= heightRatio) {
      const width = baseSize;
      return { width, height: Math.round(baseSize * heightRatio / widthRatio) };
    }
    const height = baseSize;
    return { width: Math.round(baseSize * widthRatio / heightRatio), height };
  }

  return { OPTIONS, DEFAULT_ID, isValidId, getById, getDimensions };
})();
