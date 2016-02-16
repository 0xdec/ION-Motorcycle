(function () {
  /*SVG.CCS = {

  };

  SVG.CCS.Rect = SVG.invent({
    create: 'rect',
    inherit: SVG.Rect,
    construct: {
      rect: function() {

      }
    }
  });*/

  // Delta transform point
  function deltaTransformPoint(matrix, x, y) {
    return {
      x: x * matrix.a + y * matrix.c + 0,
      y: x * matrix.b + y * matrix.d + 0
    };
  }

  // Add centre point to transform object
  function ensureCentre(o, target) {
    o.cx = o.cx == null ? target.bbox().cx : o.cx;
    o.cy = o.cy == null ? target.bbox().cy : o.cy;
  }


  SVG.extend(SVG.Matrix, {
    extract: function() {
      // find delta transform points
      var px    = deltaTransformPoint(this, 0, 1);
      var py    = deltaTransformPoint(this, 1, 0);
      var skewX = 180 / Math.PI * Math.atan2(px.y, px.x) - 90;

      return {
        // translation
        x:        this.e,
        y:        this.f,
        // skew
        skewX:    skewX,
        skewY:    180 / Math.PI * Math.atan2(py.y, py.x),
        // scale
        scaleX:   Math.sqrt(this.a * this.a + this.b * this.b),
        scaleY:   Math.sqrt(this.c * this.c + this.d * this.d),
        // rotation
        rotation: skewX,
        a: this.a,
        b: this.b,
        c: this.c,
        d: this.d,
        e: this.e,
        f: this.f
      };
    },
    // Translate matrix
    translate: function(x, y) {
      return new SVG.Matrix(this.native().translate(x || 0, y || 0));
    },
    // Rotate matrix
    rotate: function(r, cx, cy) {
      // convert degrees to radians
      r = SVG.utils.radians(-r)

      return this.around(cx, canvas.viewbox().height - cy, new SVG.Matrix(Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), 0, 0))
    },
    // Skew
    skew: function(x, y, cx, cy) {
      return this.around(cx, canvas.viewbox().height - cy, this.native().skewX(-x || 0).skewY(-y || 0))
    },
    // SkewX
    skewX: function(x, cx, cy) {
      return this.around(cx, canvas.viewbox().height - cy, this.native().skewX(-x || 0))
    },
    // SkewY
    skewY: function(y, cx, cy) {
      return this.around(cx, canvas.viewbox().height - cy, this.native().skewY(-y || 0))
    },
    // Transform around a center point
    around: function(cx, cy, matrix) {
      return this
        .multiply(new SVG.Matrix(1, 0, 0, 1, cx || 0, cy || 0))
        .multiply(matrix)
        .multiply(new SVG.Matrix(1, 0, 0, 1, -cx || 0, -cy || 0))
    }
  });

  SVG.extend(SVG.Element, {
    transform: function(o, relative) {
      // get target in case of the fx module, otherwise reference this
      var target = this.target || this
        , matrix

      // act as a getter
      if (typeof o !== 'object') {
        // get current matrix
        matrix = new SVG.Matrix(target).extract()

        // add parametric rotation
        if (typeof this.param === 'object') {
          matrix.rotation = this.param.rotation
          matrix.cx       = this.param.cx
          matrix.cy       = this.param.cy
        }

        return typeof o === 'string' ? matrix[o] : matrix
      }

      // get current matrix
      matrix = this instanceof SVG.FX && this.attrs.transform ?
        this.attrs.transform :
        new SVG.Matrix(target)

      // ensure relative flag
      relative = !!relative || !!o.relative

      // act on matrix
      if (o.a != null) {
        matrix = relative ?
          // relative
          matrix.multiply(new SVG.Matrix(o)) :
          // absolute
          new SVG.Matrix(o)

      // act on rotation
      } else if (o.rotation != null) {
        // ensure centre point
        ensureCentre(o, target)

        // relativize rotation value
        if (relative) {
          o.rotation += this.param && this.param.rotation != null ?
            this.param.rotation :
            matrix.extract().rotation
        }

        // store parametric values
        this.param = o

        // apply transformation
        if (this instanceof SVG.Element) {
          matrix = relative ?
            // relative
            matrix.rotate(o.rotation, o.cx, o.cy) :
            // absolute
            matrix.rotate(o.rotation - matrix.extract().rotation, o.cx, o.cy)
        }

      // act on scale
      } else if (o.scale != null || o.scaleX != null || o.scaleY != null) {
        // ensure centre point
        ensureCentre(o, target)

        // ensure scale values on both axes
        o.scaleX = o.scale != null ? o.scale : o.scaleX != null ? o.scaleX : 1
        o.scaleY = o.scale != null ? o.scale : o.scaleY != null ? o.scaleY : 1

        if (!relative) {
          // absolute; multiply inversed values
          var e = matrix.extract()
          o.scaleX = o.scaleX * 1 / e.scaleX
          o.scaleY = o.scaleY * 1 / e.scaleY
        }

        matrix = matrix.scale(o.scaleX, o.scaleY, o.cx, o.cy)

      // act on skew
      } else if (o.skewX != null || o.skewY != null) {
        // ensure centre point
        ensureCentre(o, target)

        // ensure skew values on both axes
        o.skewX = o.skewX != null ? o.skewX : 0
        o.skewY = o.skewY != null ? o.skewY : 0

        if (!relative) {
          // absolute; reset skew values
          var e = matrix.extract()
          matrix = matrix.multiply(new SVG.Matrix().skew(e.skewX, e.skewY, o.cx, o.cy).inverse())
        }

        matrix = matrix.skew(o.skewX, o.skewY, o.cx, o.cy)

      // act on flip
      } else if (o.flip) {
        matrix = matrix.flip(
          o.flip
        , o.offset == null ? target.bbox()['c' + o.flip] : o.offset
        )

      // act on translate
      } else if (o.x != null || o.y != null) {
        if (relative) {
          // relative
          matrix = matrix.translate(o.x, o.y)
        } else {
          // absolute
          if (o.x != null) matrix.e = o.x
          if (o.y != null) matrix.f = -o.y
        }
      }

      return this.attr(this instanceof SVG.Pattern ? 'patternTransform' : this instanceof SVG.Gradient ? 'gradientTransform' : 'transform', matrix)
    },
    // Set svg element attribute
    attr: function(a, v, n) {
      // act as full getter
      if (a == null) {
        // get an object of attributes
        a = {};
        v = this.node.attributes;
        for (n = v.length - 1; n >= 0; n--) {
          a[v[n].nodeName] = SVG.regex.isNumber.test(v[n].nodeValue) ?
            parseFloat(v[n].nodeValue) : v[n].nodeValue;
        }

        return a;
      } else if (typeof a == 'object') {
        // apply every attribute individually if an object is passed
        for (v in a) {
          this.attr(v, a[v]);
        }
      } else if (v === null) {
        // remove value
        this.node.removeAttribute(a);
      } else if (v == null) {
        // act as a getter if the first and only argument is not an object
        v = this.node.getAttribute(a);
        if (v == null) {
          return SVG.defaults.attrs[a];
        } else {
          if (SVG.regex.isNumber.test(v)) {
            v = parseFloat(v);
          }

          if (a == 'y' || a == 'y1' || a == 'y2' || a == 'cy') {
            //console.log(this);
            //console.log('y before: ' + v);
            v = canvas.viewbox().height - v;
            //console.log('y after: ' + v);
          }

          return v;
        }
      } else {
        // BUG FIX: some browsers will render a stroke if a color is given even though stroke width is 0
        if (a == 'stroke-width') {
          this.attr('stroke', parseFloat(v) > 0 ? this._stroke : null);
        } else if (a == 'stroke') {
          this._stroke = v;
        }

        // convert image fill and stroke to patterns
        if (a == 'fill' || a == 'stroke') {
          if (SVG.regex.isImage.test(v)) {
            v = this.doc().defs().image(v, 0, 0);
          }

          if (v instanceof SVG.Image) {
            v = this.doc().defs().pattern(0, 0, function() {
              this.add(v);
            });
          }
        }

        // ensure correct numeric values (also accepts NaN and Infinity)
        if (typeof v === 'number') {
          v = new SVG.Number(v);
        } else if (SVG.Color.isColor(v)) {
          v = new SVG.Color(v);
        } else if (Array.isArray(v)) {
          v = new SVG.Array(v);
        } else if (v instanceof SVG.Matrix && v.param) {
          this.param = v.param;
        }

        // if the passed attribute is leading...
        if (a == 'leading') {
          // ... call the leading method instead
          if (this.leading) {
            this.leading(v);
          }
        } else {
          if (a == 'y' || a == 'y1' || a == 'y2' || a == 'cy') {
            //console.log(this);
            //console.log('y before: ' + v);
            v = canvas.viewbox().height - v;
            //console.log('y after: ' + v);
          }

          // set given attribute on node
          typeof n === 'string' ?
          this.node.setAttributeNS(n, a, v.toString()) :
          this.node.setAttribute(a, v.toString())
        }

        // rebuild if required
        if (this.rebuild && (a == 'font-size' || a == 'x')) {
          this.rebuild(a, v);
        }
      }

      return this;
    },
    translate: function(x, y) {
      return this.x(x).y(y);
    }
  });

  SVG.extend(SVG.G, {
    x: function(x) {
      return x == null ?
        this.transform('x') :
        this.transform({x: x - this.x()}, true);
    },
    y: function(y) {
      return y == null ?
        this.transform('y') :
        this.transform({y: this.y() - y}, true);
    }
  });
})();
