import Shape from 'clipper-js';

const CENTER = 'center';
const INSIDE = 'inside';
const OUTSIDE = 'outside';

export default function(paths, point, {
  lineWidth = 1.0,
  scale = 10.0,
  miterLimit = 2.0,
  fillOffset = CENTER
} = {}) {
  lineWidth *= scale / 2.0;
  // convert point to uppercase
  point = { X: point.x * scale, Y: point.y * scale };
  // instanciate new shape
  const shape = new Shape(paths, false, true);

  const shapes = shape
    // scale up for precision
    .scaleUp(scale)
    // convert lines to polygons (this gives lines width)
    .offset(offset, { jointType: 'jtMiter', endType: 'etOpenSquare', miterLimit })
    // union all overlapping paths
    .removeOverlap()
    // make all holes outlines and all outlines holes
    .reverse()
    // seperate all shapes into (these all all plausible fills)
    .seperateShapes();

  let offset;
  switch (fillOffset) {
    case CENTER:
      offset = lineWidth;
      break;
    case INSIDE:
      offset = 0;
      break;
    case OUTSIDE:
      offset = lineWidth * 2.0;
      break;
    default:
      offset = lineWidth;
      break;
  }

  for (const fill of shapes) { // loop trough all
    if (fill.pointInShape(point)) { // check if point has hit with shape

      return fill // return fill
        // offset result to account for converting to polygon
        .offset(offset, { jointType: 'jtMiter', endType: 'etClosedPolygon', miterLimit })
        // scale down to accout for scale up
        .scaleDown(scale)
        // convert uppercase points to lowercase points
        .mapToLower();
    }
  }

  // if no fill has been found return empty shape
  return [];
}
