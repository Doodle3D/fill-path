import Shape from 'clipper-js';

const OFFSET = 1.0;

export default function(paths, point) {
  point = { X: point.x, Y: point.y };
  const shape = new Shape(paths, false, true);

  const shapes = shape.offset(OFFSET, { joinType: 'jtSquare', endType: 'etOpenButt' })
    .removeOverlap()
    .reverse()
    .seperateShapes();

  for (const shape of shapes) {
    if (shape.pointInShape(point)) {
      return shape
        // .offset(OFFSET, { joinType: 'jtSquare', endType: 'etClosedPolygon' })
        .mapToLower();
    }
  }

  return [];
}
