(function () {
  var $, applyTransform, getTransform, makeTransformable;

  $ = jQuery;

  getTransform = function (from, to) {
    var A, H, b, h, i, k, k_i, l, lhs, m, ref, rhs;
    console.assert(from.length === (ref = to.length) && ref === 4);
    A = []; // 8x8
    for (i = k = 0; k < 4; i = ++k) {if (window.CP.shouldStopExecution(0)) break;
      A.push([from[i].x, from[i].y, 1, 0, 0, 0, -from[i].x * to[i].x, -from[i].y * to[i].x]);
      A.push([0, 0, 0, from[i].x, from[i].y, 1, -from[i].x * to[i].y, -from[i].y * to[i].y]);
    }window.CP.exitedLoop(0);
    b = []; // 8x1
    for (i = l = 0; l < 4; i = ++l) {if (window.CP.shouldStopExecution(1)) break;
      b.push(to[i].x);
      b.push(to[i].y);
    }
    // Solve A * h = b for h
    window.CP.exitedLoop(1);h = numeric.solve(A, b);
    H = [[h[0], h[1], 0, h[2]], [h[3], h[4], 0, h[5]], [0, 0, 1, 0], [h[6], h[7], 0, 1]];
    // Sanity check that H actually maps `from` to `to`
    for (i = m = 0; m < 4; i = ++m) {if (window.CP.shouldStopExecution(2)) break;
      lhs = numeric.dot(H, [from[i].x, from[i].y, 0, 1]);
      k_i = lhs[3];
      rhs = numeric.dot(k_i, [to[i].x, to[i].y, 0, 1]);
      console.assert(numeric.norm2(numeric.sub(lhs, rhs)) < 1e-9, "Not equal:", lhs, rhs);
    }window.CP.exitedLoop(2);
    return H;
  };

  applyTransform = function (element, originalPos, targetPos, callback) {
    var H, from, i, j, p, to;
    // All offsets were calculated relative to the document
    // Make them relative to (0, 0) of the element instead
    from = function () {
      var k, len, results;
      results = [];
      for (k = 0, len = originalPos.length; k < len; k++) {if (window.CP.shouldStopExecution(3)) break;
        p = originalPos[k];
        results.push({
          x: p[0] - originalPos[0][0],
          y: p[1] - originalPos[0][1] });

      }window.CP.exitedLoop(3);
      return results;
    }();
    to = function () {
      var k, len, results;
      results = [];
      for (k = 0, len = targetPos.length; k < len; k++) {if (window.CP.shouldStopExecution(4)) break;
        p = targetPos[k];
        results.push({
          x: p[0] - originalPos[0][0],
          y: p[1] - originalPos[0][1] });

      }window.CP.exitedLoop(4);
      return results;
    }();
    // Solve for the transform
    H = getTransform(from, to);

    // Apply the matrix3d as H transposed because matrix3d is column major order
    // Also need use toFixed because css doesn't allow scientific notation
    $(element).css({
      'transform': `matrix3d(${function () {
        var k, results;
        results = [];
        for (i = k = 0; k < 4; i = ++k) {if (window.CP.shouldStopExecution(5)) break;
          results.push(function () {
            var l, results1;
            results1 = [];
            for (j = l = 0; l < 4; j = ++l) {if (window.CP.shouldStopExecution(6)) break;
              results1.push(H[j][i].toFixed(20));
            }window.CP.exitedLoop(6);
            return results1;
          }());
        }window.CP.exitedLoop(5);
        return results;
      }().join(',')})`,
      'transform-origin': '0 0' });

    return typeof callback === "function" ? callback(element, H) : void 0;
  };

  makeTransformable = function (selector, callback) {
    return $(selector).each(function (i, element) {
      var controlPoints, originalPos, p, position;
      $(element).css('transform', '');

      // Add four dots to corners of `element` as control points
      controlPoints = function () {
        var k, len, ref, results;
        ref = ['left top', 'left bottom', 'right top', 'right bottom'];
        results = [];
        for (k = 0, len = ref.length; k < len; k++) {if (window.CP.shouldStopExecution(7)) break;
          position = ref[k];
          results.push($('<div>').css({
            border: '10px solid black',
            borderRadius: '10px',
            cursor: 'move',
            position: 'absolute',
            zIndex: 100000 }).
          appendTo('body').position({
            at: position,
            of: element,
            collision: 'none' }));

        }window.CP.exitedLoop(7);
        return results;
      }();
      // Record the original positions of the dots
      originalPos = function () {
        var k, len, results;
        results = [];
        for (k = 0, len = controlPoints.length; k < len; k++) {if (window.CP.shouldStopExecution(8)) break;
          p = controlPoints[k];
          results.push([p.offset().left, p.offset().top]);
        }window.CP.exitedLoop(8);
        return results;
      }();

      // Transform `element` to match the new positions of the dots whenever dragged
      $(controlPoints).draggable({
        start: () => {
          return $(element).css('pointer-events', 'none'); // makes dragging around iframes easier 
        },
        drag: () => {
          return applyTransform(element, originalPos, function () {
            var k, len, results;
            results = [];
            for (k = 0, len = controlPoints.length; k < len; k++) {if (window.CP.shouldStopExecution(9)) break;
              p = controlPoints[k];
              results.push([p.offset().left, p.offset().top]);
            }window.CP.exitedLoop(9);
            return results;
          }(), callback);
        },
        stop: () => {
          applyTransform(element, originalPos, function () {
            var k, len, results;
            results = [];
            for (k = 0, len = controlPoints.length; k < len; k++) {if (window.CP.shouldStopExecution(10)) break;
              p = controlPoints[k];
              results.push([p.offset().left, p.offset().top]);
            }window.CP.exitedLoop(10);
            return results;
          }(), callback);
          return $(element).css('pointer-events', 'auto');
        } });

      return element;
    });
  };

  makeTransformable('.box', function (element, H) {
    var i, j;
    console.log($(element).css('transform'));
    return $(element).html($('<table>').append($('<tr>').html($('<td>').text('matrix3d('))).append(function () {
      var k, results;
      results = [];
      for (i = k = 0; k < 4; i = ++k) {if (window.CP.shouldStopExecution(11)) break;
        results.push($('<tr>').append(function () {
          var l, results1;
          results1 = [];
          for (j = l = 0; l < 4; j = ++l) {if (window.CP.shouldStopExecution(12)) break;
            results1.push($('<td>').text(H[j][i] + (i === j && j === 3 ? '' : ',')));
          }window.CP.exitedLoop(12);
          return results1;
        }()));
      }window.CP.exitedLoop(11);
      return results;
    }()).append($('<tr>').html($('<td>').text(')'))));
  });

}).call(this);


//# sourceURL=coffeescript