export const getPointsText = (points: number) => {
  const absoluteValue = points < 0 ? -points : points
  if (absoluteValue < 1000) return String(points);
  if (absoluteValue < 1000000) {
    const decimal = String(points / 10 ** 3)
    return decimal.slice(0, decimal.indexOf('.') + 2) + 'k'
  }
  if (points > 0) return '>1M'
  return '<-1M'
}
