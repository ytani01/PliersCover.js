//
// (c) 2020 Yoichi Tanibayashi
//

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  distance(c) {
    return Math.sqrt((c.x - this.x) ** 2 + (c.y - this.y) ** 2);
  }

  rotate(rad) {
    let new_x = Math.cos(rad) * this.x - Math.sin(rad) * this.y;
    let new_y = Math.sin(rad) * this.x + Math.cos(rad) * this.y;
    this.x = new_x;
    this.y = new_y;
    return this;
  }

  mirror() {
    this.x = -this.x;
    return this;
  }
}

class Vpoint extends Point {
  constructor(x, y, rad) {
    super(x, y);
    this.rad = rad;
  }

  rotate(rad) {
    super.rotate(rad);
    this.rad += rad;
    return this;
  }

  mirror() {
    super.mirror();
    this.rad = -this.rad;
    return this;
  }
}

class SvgObj {
  MM_PX = 3.543307;

  constructor(parent) {
    this.parent = parent;
    this.type = "";
    this.svg_param = "";
  }

  draw(color, stroke_width) {
    let style = 'fill:none;';
    style = "fill:none;";
    style += `stroke:${color};`;
    style += `stroke-width:${stroke_width};`;
    style += "stroke-dasharray:none";
    
    this.svg_text = `<${this.type} style="${style}" ${this.param} />`;
    this.parent.draw(this.svg_text);
  }
}

class SvgCircle extends SvgObj {
  constructor(parent, r) {
    super(parent);
    this.type = "circle";
    this.r = r;
  }

  draw(origin, color, stroke_width) {
    let vp_origin = new Vpoint(origin[0], origin[1], origin[2]);
    this.param = `cx="${vp_origin.x}" cy="${vp_origin.y}" r="${this.r}"`;
    super.draw(color, stroke_width);
  }
}

class SvgPath extends SvgObj {
  constructor(parent, points) {
    super(parent);
    this.type = "path";
    
    this.p_points = [];
    for (let p of points) {
      this.p_points.push(new Point(p[0], p[1]));
    }
  }

  create_svg_d(vp_origin, p_points) {
    this.rotate(vp_origin.rad);

    let p0 = p_points.shift();
    let svg_d = `M ${p0.x + vp_origin.x},${p0.y + vp_origin.y}`;

    for (let p1 of p_points) {
      svg_d += ` L ${p1.x + vp_origin.x},${p1.y + vp_origin.y}`;
    }
    return svg_d;
  }

  draw(origin, color, stroke_width) {
    let vp_origin = new Vpoint(origin[0], origin[1], origin[2]);
    this.svg_d = this.create_svg_d(vp_origin, this.p_points);
    this.param = `d="${this.svg_d}"`;
    super.draw(color, stroke_width);
  }

  rotate(rad) {
    for (let p of this.p_points) {
      p.rotate(rad);
    }
    return this;
  }

  mirror() {
    for (let p of this.p_points) {
      p.mirror();
    }
    return this;
  }
}

class SvgLine extends SvgPath {
  // exactly same as SvgPath
}

class SvgPolygon extends SvgPath {
  create_svg_d(vp_origin, p_points) {
    return super.create_svg_d(vp_origin, p_points) + " Z";
  }
}

class SvgPart1Outline extends SvgPath {
  constructor(parent, w1, w2, h1, h2, bw, bl, bf) {
    super(parent, []);
    this.p_points = this.create_p_points(w1, w2, h1, h2, bw, bl);
    this.bw_bf = bw * bf;
  }

  create_p_points(w1, w2, h1, h2, bw, bl) {
    let p_points = [];
    let x0 = 0, y0 = 0;

    let x = x0 - (w2 / 2);
    let y = y0 + h1 + h2;
    p_points.push(new Point(x, y));

    y = y0 + h1;
    p_points.push(new Point(x, y));

    x = -(w1 / 2);
    y = y0;
    p_points.push(new Point(x, y));

    x = w1 / 2;
    p_points.push(new Point(x, y));

    x = w2 / 2;
    y += h1;
    p_points.push(new Point(x, y));

    y += h2;
    p_points.push(new Point(x, y));

    x = bw / 2;
    p_points.push(new Point(x, y));

    y += bl - bw / 2;
    p_points.push(new Point(x, y));

    x = -(bw / 2);
    p_points.push(new Point(x, y));

    y = y0 + h1 + h2;
    p_points.push(new Point(x, y));

    return p_points;
  }

  create_svg_d(vp_origin, p_points) {
    let x1 = 0, y1 = 0;
    let x2 = 0, y2 = 0;
    let d = "";

    this.rotate(vp_origin.rad);

    for (let i=0; i < p_points.length; i++) {
      x1 = vp_origin.x + p_points[i].x;
      y1 = vp_origin.y + p_points[i].y;

      if ( i == 0 ) {
	d = `M ${x1},${y1}`;
      } else if ( i == 7 ) {
	d += ` L ${x1},${y1}`;
	x2 = x1;
	y2 = y1 + this.bw_bf;
      } else if ( i == 8 ) {
	d += ` C ${x2},${y2} ${x1},${y2} ${x1},${y1}`;
      } else {
	d += ` L ${x1},${y1}`;
      }
    }
    d += ' Z';
    return d;
  }
}

class SvgNeedleHole extends SvgPolygon {
  constructor(parent, w, h, tf) {
    super(parent, []);
    this.w = w;
    this.h = h;
    this.tf = tf;
    this.p_points = this.create_p_points();
  }

  create_p_points() {
    let p_points = [];
    p_points.push(new Point(-this.w / 2,  this.h * this.tf));
    p_points.push(new Point( this.w / 2,  this.h * (1 - this.tf)));
    p_points.push(new Point( this.w / 2, -this.h * this.tf));
    p_points.push(new Point(-this.w / 2, -this.h * (1 - this.tf)));
    return p_points;
  }
}

class Part1 {
  constructor(parent,
	      w1, w2, h1, h2, bw, bl, bf, dia1, d1, d2,
	      needle_w, needle_h, needle_tf, needle_rot) {
    this.parent = parent;
    this.w1 = w1;
    this.w2 = w2;
    this.h1 = h1;
    this.h2 = h2;
    this.bw = bw;
    this.bl = bl;
    this.bf = bf;
    this.dia1 = dia1;
    this.d1 = d1;
    this.d2 = d2;
    this.needle_w = needle_w;
    this.needle_h = needle_h;
    this.needle_tf = needle_tf;
    this.needle_rot = needle_rot;

    // 図形作成
    this.svg_outline = new SvgPart1Outline(this.parent,
					   w1, w2, h1, h2, bw, bl, bf);

    this.svg_hole = new SvgCircle(this.parent, this.dia1 / 2);
    let cx = 0;
    let cy = this.h1 + this.h2 + this.bl - this.bw / 2;
    this.p_hole_center = new Point(cx, cy);

    this.vp_needle = this.create_vp_needle();
    this.svg_needle_hole = [];
    for (let v of this.vp_needle) {
      let svg_nh = new SvgNeedleHole(this.parent,
				     this.needle_w, this.needle_h,
				     this.needle_tf);
      this.svg_needle_hole.push([svg_nh, v]);
    }
  }

  draw(origin, stroke_width) {  // origin == [x0, y0, rad0]
    let x0 = origin[0], y0 = origin[1], rad0 = origin[2];

    // アウトライン
    let x = x0, y = y0;
    this.svg_outline.draw([x, y, rad0], "#0000FF", stroke_width);

    // 留め具の穴
    this.p_hole_center.rotate(rad0);
    let cx = x0 + this.p_hole_center.x;
    let cy = y0 + this.p_hole_center.y;
    this.svg_hole.draw([cx, cy, 0], "#FF0000", stroke_width);

    // 針穴
    for (let i=0; i < this.svg_needle_hole.length; i++) {
      let svg_nh = this.svg_needle_hole[i][0];
      let v = this.svg_needle_hole[i][1];
      let origin_nh = [x0 + v.x, y0 + v.y, v.rad];
      svg_nh.draw(origin_nh, "#FF0000", stroke_width);
    }
  }

  create_vp_needle() {
    let rad1 = Math.atan((this.w2 - this.w1) / (2 * this.h1));
    let rad1a = (Math.PI - rad1) / 2;
    let a1 = this.d1 / Math.tan(rad1a);

    let rad2 = (Math.PI / 2) - rad1;
    let rad2a = (Math.PI - rad2) / 2;
    let a2 = this.d1 / Math.tan(rad2a);

    let vp1 = [];
    for (let i=0; i < 6; i++) {
      let nx = this.svg_outline.p_points[i].x;
      let ny = this.svg_outline.p_points[i].y;
      if (i == 0) {
	nx += this.d1;
	ny -= this.d1 * 1.5;
	vp1.push(new Vpoint(nx, ny, 0));
      }
      if (i == 1) {
	nx += this.d1;
	ny += a1;
	vp1.push(new Vpoint(nx, ny, rad1));
      }
      if (i == 2) {
	nx += a2;
	ny += this.d1;
	vp1.push(new Vpoint(nx, ny, Math.PI / 2));
      }
      if (i == 3) {
	nx -= a2;
	ny += this.d1;
	vp1.push(new Vpoint(nx, ny, (Math.PI / 2) + rad2));
      }
      if (i == 4) {
	nx -= this.d1;
	ny += a1;
	vp1.push(new Vpoint(nx, ny, Math.PI));
      }
      if (i == 5) {
	nx -= this.d1;
	ny -= this.d1 * 1.5;
	vp1.push(new Vpoint(nx, ny, Math.PI));
      }
      if (i > 5) {
	break;
      }
    } // for

    // 補完する点を生成
    let vp2 = [];
    for (let i=0; i < vp1.length - 1; i++) {
      let d = vp1[i].distance(vp1[i+1]);
      let n = Math.abs(Math.round(d / this.d2));
      vp2 = vp2.concat(this.split_vp(vp1[i], vp1[i+1], n));
    } // for

    vp2.unshift(vp1[0]);
    return vp2;
  }

  split_vp(v1, v2, n) {
    if (n == 0) {
      return v1;
    }

    let dx = (v2.x - v1.x) / n;
    let dy = (v2.y - v1.y) / n;

    let v = [];
    for (let i=0; i < n; i++) {
      v.push(new Vpoint(v1.x + dx * (i + 1),
			v1.y + dy * (i + 1),
			v1.rad));
    }

    if (this.needle_rot) {
      v.slice(-1)[0].rad = (v1.rad + v2.rad) / 2;
    }

    return v;
  }
}

class Part2 {
  constructor(parent, part1, dia2a, dia2) {
    this.parent = parent;
    this.part1 = part1;
    this.dia2a = dia2a;
    this.dia2 = dia2;

    // アウトライン
    //   ``Part1``の``svg_outline.p_points``をミラーして利用
    this.points_outline = [];
    for (let i=0; i < 6; i++) {
      let pp = this.part1.svg_outline.p_points[i];
      pp.mirror();
      this.points_outline.push([pp.x, pp.y]);
    }
    this.svg_outline = new SvgPolygon(parent, this.points_outline);

    // 留め具の穴
    this.svg_hole = new SvgCircle(parent, this.dia2 / 2);
    let cx = 0;
    let cy = this.part1.h1 + this.part1.h2 - this.dia2a / 2 - this.part1.d1;
    this.p_hole_center = new Point(cx, cy);

    // 針穴
    //   ``Part1``の``vp_needle``をミラーして利用
    this.svg_needle_hole = [];
    for (let i=0; i < this.part1.vp_needle.length; i++) {
      let v = this.part1.vp_needle[i];
      v.mirror();
      // ``SvgNeedleHole``もミラーする
      let svg_nh = new SvgNeedleHole(this.parent,
				     this.part1.needle_w,
				     this.part1.needle_h,
				     this.part1.needle_tf);
      svg_nh.mirror();
      this.svg_needle_hole.push([svg_nh, v]);
    }
  }

  draw(origin, stroke_width) {
    let x0 = origin[0], y0 = origin[1], rad0 = origin[2];

    // アウトライン
    this.svg_outline.draw([x0, y0, rad0], "#0000FF", stroke_width);

    // 留め具の穴
    this.p_hole_center.rotate(rad0);
    let cx = x0 + this.p_hole_center.x;
    let cy = y0 + this.p_hole_center.y;
    this.svg_hole.draw([cx, cy, 0], "#FF0000", stroke_width);

    // 針穴
    for (let i=0; i < this.svg_needle_hole.length; i++) {
      let svg_nh = this.svg_needle_hole[i][0];
      let v = this.svg_needle_hole[i][1];
      let origin_nh = [x0 + v.x, y0 + v.y, v.rad];
      svg_nh.draw(origin_nh, "#FF0000", stroke_width);
    }
  }
}

class SvgCanvas {
  WIDTH_RATE = 0.6

  constructor(id, w, h) {
    this.id = id;

    this.width = window.innerWidth * this.WIDTH_RATE;
    this.table_width = this.width * 0.88;

    console.log(`screen: ${window.innerWidth}, ${window.innerHeight}`);
    console.log(`width=${this.width}, table_width=${this.table_width}`);

    this.header = '<svg xmlns="http://www.w3.org/2000/svg"';
    this.header += ' version="1.1"';
    this.header += ` width="${w}mm" height="${h}mm"`;
    this.header += ` viewBox="0 0 ${w} ${h}">\n`;

    this.footer = '</svg>';

    this.objs = "";

    this.svg_text = this.header + this.footer;
  }

  draw(obj) {
    this.objs += obj + '\n';
  }

  display() {
    this.svg_text = this.header + this.objs + this.footer;
    document.getElementById(this.id).innerHTML = this.svg_text;

    return this.svg_text;
  }
}

function gen_svg(id_canvas, id_download) {
  const OFFSET_X = 10;
  const OFFSET_Y = 10;
  const STROKE_WIDTH = 0.2;

  //
  // parameters
  //
  let opt_list = ["w1", "w2", "h1", "h2", "bw", "bl",
		  "dia1a", "dia1", "dia2a", "dia2",
		  "d1", "d2", "bf",
		  "needle_w", "needle_h", "needle_tf"];
  let opt = {};
  for (let k of opt_list) {
    opt[k] = parseFloat(document.getElementById(k).value);
  }
  opt.needle_rot = document.getElementById("needle_rot").checked;

  //
  // make objects and draw them
  //
  let x0 = OFFSET_X;
  let y0 = OFFSET_Y;
  
  //
  // draw canvas
  //
  let canvas_width = x0 + opt.w2 + x0 + opt.w2 + x0;
  let canvas_height = y0 + opt.h1 + opt.h2 + opt.bl + y0;
  let canvas = new SvgCanvas("canvas", canvas_width, canvas_height);

  //
  // draw part1
  //
  x0 += opt.w2 / 2;
  let part1 = new Part1(canvas,
			opt.w1, opt.w2, opt.h1, opt.h2,
			opt.bw, opt.bl, opt.bf,
			opt.dia1, opt.d1, opt.d2,
			opt.needle_w, opt.needle_h, opt.needle_tf,
			opt.needle_rot);
  part1.draw([x0, y0, 0], STROKE_WIDTH);

  //
  // draw part2
  //
  x0 += opt.w2 + 10;
  let part2 = new Part2(canvas, part1, opt.dia2a, opt.dia2);
  part2.draw([x0, y0, 0], STROKE_WIDTH);

  //
  // display and generate SVG text
  //
  let svg_text = canvas.display();

  //
  // update download link
  //
  let blob = new Blob([ svg_text ], {"type": "text/plain"});
  document.getElementById(id_download).href = window.URL.createObjectURL(blob);

  return svg_text;
}

window.addEventListener('DOMContentLoaded', function() {
  let svg_text = gen_svg("canvas", "download_link");
});

// タイマーを設定した方がいい。
window.addEventListener('resize', function() {
  let svg_text = gen_svg("canvas", "download_link");
});
