import ClipperLib from 'clipper-lib';

export default function(paths, point) {
  // convert lowercase x and y to capitalcase X and Y
  paths = mapLowerToCapital(paths);
  point = { X: Math.round(point.x), Y: Math.round(point.y) };

  // create path offset (an outline around all paths)
  const pathOffset = createPathOffset(paths);

  // seperate pathOffset into outlines and holes
  const { outlines, holes } = seperatePathOutlines(pathOffset);

  // no shapes found
  if (outlines.length === 0) return [];

  // merge outlines with correct holes
  const shapes = createShapes(outlines, holes);

  // find shape with collision on mouse
  const shape = findHit(shapes, point);

  // convert capitalcase X and Y to lowercase x and y
  return mapCapitalToLower(shape);
}

function createPathOffset(paths) {
  const offsetShapes = new ClipperLib.Paths();
  const clipperOffset = new ClipperLib.ClipperOffset();
  clipperOffset.AddPaths(paths, ClipperLib.JoinType.jtSquare, ClipperLib.EndType.etOpenButt);
  clipperOffset.Execute(offsetShapes, 1.0);

  // merge shapes.
  // each shape gets a clockwise outside path and a counter-clockwize inside path
  const mergeShapes = ClipperLib.Clipper.SimplifyPolygons(offsetShapes, ClipperLib.PolyFillType.pftNonZero);

  return mergeShapes;
}

function seperatePathOutlines(mergeShapes) {
  const holes = [];
  const outlines = [];
  for (const mergeShape of mergeShapes) {
    const orientation = ClipperLib.Clipper.Orientation(mergeShape);
    if (orientation) {
      // use clock-wise drawn shapes as holes
      holes.push(mergeShape);
    } else {
      // use counter clock-wise drawn shapes as outlines
      outlines.push(mergeShape);
    }
  }

  return { holes, outlines };
}

function createShapes(outlines, holes) {
  // sort outlines small to big area
  if (outlines.length > 1) {
    const areaMap = createAreaMap(outlines);

    outlines.sort((a, b) => areaMap.get(a) > areaMap.get(b));
  }

  const shapes = [];
  // Loop through all outlines (small to big)
  for (const outline of outlines) {
    // initiallize shape with it's outline
    const shape = [outline];
    shapes.push(shape);

    // search for holes
    for (const hole of [...holes]) {
      const holePoint = { X: Math.round(hole[0].X), Y: Math.round(hole[0].Y) };
      const pointInPolygon = ClipperLib.Clipper.PointInPolygon(holePoint, outline) > 0;
      if (pointInPolygon) {
        shape.push(hole);

        const index = holes.indexOf(hole);
        holes.splice(index, 1);
      }
    }
  }

  return shapes;
}

function findHit(shapes, point) {
  const pointInPolygonMap = createPointInPolygonMap(shapes.reduce((a, b) => a.concat(b)), point);
  // loop through available shapes
  for (const shape of shapes) {
    if (pointInShape(shape, pointInPolygonMap)) {
      return shape;
    }
  }

  return []; // no shapes found
}

function pointInShape(shape, pointInPolygonMap) {
  // loop through holes of shape
  for (let i = 0; i < shape.length; i ++) {
    const polygon = shape[i];
    const isHole = i > 0;
    const pointInPolygon = pointInPolygonMap.get(polygon);

    // if point is outside outline or if point is inside hole
    if ((!isHole && !pointInPolygon) || (isHole && pointInPolygon)) {
      return false;
    }
  }

  return true;
}

function createAreaMap(paths) {
  const areaMap = new WeakMap();
  for (const polygon of paths) {
    const area = Math.abs(ClipperLib.Clipper.Area(polygon));
    areaMap.set(polygon, area);
  }
  return areaMap;
}

function createPointInPolygonMap(paths, point) {
  const pointInPolygonMap = new WeakMap();
  for (const polygon of paths) {
    const pointInPolygon = ClipperLib.Clipper.PointInPolygon(point, polygon) > 0;
    pointInPolygonMap.set(polygon, pointInPolygon);
  }
  return pointInPolygonMap;
}

function mapCapitalToLower(paths) {
  return paths.map((polygon) => polygon.map(({ X, Y }) => ({ x: X, y: Y })));
}

function mapLowerToCapital(paths) {
  return paths.map((polygon) => polygon.map(({ x, y }) => ({ X: x, Y: y })));
}
