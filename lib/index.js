import ClipperLib from 'clipper-lib';

export default function(paths, point) {
  paths = mapLowerToCapital(paths);
  point = { X: point.x, Y: point.y };

  const offsetShapes = new ClipperLib.Paths();
  const clipperOffset = new ClipperLib.ClipperOffset();
  clipperOffset.AddPaths(paths, ClipperLib.JoinType.jtSquare, ClipperLib.EndType.etOpenButt);
  clipperOffset.Execute(offsetShapes, 1.0);

  // merge shapes.
  // each shape gets a clockwise outside path and a counter-clockwize inside path
  const mergeShapes = ClipperLib.Clipper.SimplifyPolygons(offsetShapes, ClipperLib.PolyFillType.pftNonZero);

  const fillShapes = [];
  const pointInPolygonMap = createPointInPolygonMap(mergeShapes, point);

  const outLines = [];
  const holes = [];

  for (const mergeShape of mergeShapes) {
    const orientation = ClipperLib.Clipper.Orientation(mergeShape);
    const pointInPolygon = pointInPolygonMap.get(mergeShape);
    if (orientation) {
      // use clock-wise drawn shapes as holes
      holes.push(mergeShape);
    } else if (pointInPolygon) {
      // use counter clock-wise drawn shapes as outlines
      outLines.push(mergeShape);
    }
  }

  if (outLines.length === 0) {
    return []; // no shapes found
  } else if (outLines.length > 1) {
    const areaMap = createAreaMap(outLines);

    // sort small to big area
    outLines.sort((a, b) => areaMap.get(a) > areaMap.get(b));
  }

  // Loop through all outlines (small to big)
  for (const outLine of outLines) {
    // initiallize fill shape with it's outline
    const fillShape = [outLine];
    fillShapes.push(fillShape);

    // search for holes
    for (const hole of [...holes]) {
      const pointInPolygon = ClipperLib.Clipper.PointInPolygon(hole[0], outLine) > 0;
      if (pointInPolygon) {
        fillShape.push(hole);

        const index = holes.indexOf(hole);
        holes.splice(index, 1);
      }
    }
  }

  // loop through available fill shapes
  fillShapeLoop: for (const fillShape of fillShapes) {
    // loop through holes of fill shape
    for (let i = 1; i < fillShape.length; i ++) {
      const path = fillShape[i];
      const pointInPolygon = pointInPolygonMap.get(path);

      // if outline and not in polygon or if hole and in polygon
      if (pointInPolygon) {
        continue fillShapeLoop; // skip
      }
    }

    return mapCapitalToLower(fillShape);
  }

  return []; // no shapes found
}

function createAreaMap(paths) {
  const areaMap = new WeakMap();
  for (const path of paths) {
    const area = Math.abs(ClipperLib.Clipper.Area(path));
    areaMap.set(path, area);
  }
  return areaMap;
}

function createPointInPolygonMap(paths, point) {
  const pointInPolygonMap = new WeakMap();
  for (const path of paths) {
    const pointInPolygon = ClipperLib.Clipper.PointInPolygon(point, path) > 0;
    pointInPolygonMap.set(path, pointInPolygon);
  }
  return pointInPolygonMap;
}

function mapCapitalToLower(paths) {
  return paths.map((path) => path.map(({ X, Y }) => ({ x: X, y: Y })));
}

function mapLowerToCapital(paths) {
  return paths.map((path) => path.map(({ x, y }) => ({ X: x, Y: y })));
}
