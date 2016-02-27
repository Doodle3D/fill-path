import Shape from 'clipper-js';

export default function(paths, point, offset = 1.0) {
  // convert point to uppercase
  point = { X: point.x, Y: point.y };
  // instanciate new shape
  const shape = new Shape(paths, false, true);

  const shapes = shape
    // convert lines to polygons (this gives lines width)
    .offset(offset, { joinType: 'jtSquare', endType: 'etOpenButt' })
    // union all overlapping paths
    .removeOverlap()
    // make all holes outlines and all outlines holes
    .reverse()
    // seperate all shapes into (these all all plausible fills)
    .seperateShapes();

  for (const fill of shapes) { // loop trough all
    if (fill.pointInShape(point)) { // check if point has hit with shape
      return fill // return fill
        // offset result to account for converting to polygon
        // .offset(offset, { joinType: 'jtSquare', endType: 'etClosedPolygon' })
        // convert uppercase points to lowercase points
        .mapToLower();
    }
  }

  // if no fill has been found return empty shape
  return [];
}
