import Shape from 'clipper-js';

const CENTER = 'center';
const INSIDE = 'inside';
const OUTSIDE = 'outside';

export default function(paths, point, {
  lineWidth = 1.0,
  precision = 0.1,
  miterLimit = 5.0,
  fillOffset = CENTER
} = {}) {
  // calculate linewith
  lineWidth /= precision * 2.0;
  // convert point to uppercase
  point = { X: point.x / precision, Y: point.y / precision };

  // create clipper shape
  const shape = new Shape(paths, false, true, true, true)
    // scale up for precision
    .scaleDown(precision)
    // convert lines to polygons (this gives lines width)
    .offset(lineWidth, { jointType: 'jtMiter', endType: 'etOpenSquare', miterLimit })
    // union all overlapping paths
    .removeOverlap()
    // make all holes outlines and all outlines holes
    .reverse()
    // seperate all shapes into (these all all plausible fills)
    .seperateShapes()
    // find shape with hit
    .find(fill => fill.pointInShape(point));

  // if no fill has been found return empty shape
  if (!shape) return [];

  // determine what offset should be used when returning shape
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

  return shape
    // offset result to account for converting to polygon
    .offset(offset, { jointType: 'jtMiter', endType: 'etClosedPolygon', miterLimit })
    // scale down to accout for scale up
    .scaleUp(precision)
    // convert uppercase points to lowercase points
    .mapToLower();
}
