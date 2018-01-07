// functions only. No execution permitted


function IsBlank(c) {
    return c <= 0x20;
}

function getLineChar(start, end) {
    if ((start === undefined && end === undefined) || start === end) {
        return '+';
    } else if (end !== undefined)
        start = ((Math.atan2(end.y - start.y, end.x - start.x)
        * 180.0 / Math.PI + 360.0) % 360.0);

    // interpret as degree
    var deg = start;
    if (deg < 22.5)
        return '-';
    else if (deg < 67.5)
        return '\\';
    else if (deg < 112.5)
        return '|';
    else if (deg < 157.5)
        return '/';
    else if (deg < 202.5)
        return '-';
    else if (deg < 247.5)
        return '\\';
    else if (deg < 295.5)
        return '|';
    else if (deg < 337.5)
        return '/';
    else
        return '-';
}

/// Ramanujan's ellipse perimeter approx from ellipse radius
function ellipsePerimeter(a, b) {
    return Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)));
}

var fill = function (str, col, row) {
    if (col === undefined)
        col = size.x;
    if (row === undefined)
        row = size.y;

    var s = '';
    var cap = col * row;
    for (var i = 0; i < str.length; i++) {
        if (s.length >= cap)
            break;
        var c = str.charAt(i);
        if (c === '\r') continue; // imagine this don't exist
        else if (c === '\n') {
            while ((s.length % col) !== 0) {
                s += ' ';
            }
        }
        else
            s += (c.charCodeAt(0) <= 0x20 ? ' ' : c);
    }
    while (s.length < cap)
        s += ' ';
    return s;
}

var showcursor = function (cur) {
    if (cur !== undefined)
        canvas.style.cursor = cur;
    else
        return canvas.style.cursor;
}

var _pltte = $('#palette');

var pals = function (str) {
    if (str !== undefined) {
        palette = (str.length === 1) ? str.charAt(0) : '\0';
        _pltte.text(palette === '\0' ? "''" : "'" + palette + "'")
        redraw();
    }
    else
        return palette;
}

var text = function (str) {
    if (str !== undefined) {
        data = fill(str);
        redraw();
    }
    else
        return data;
}

var curs = function (point) {
    if (point !== undefined) {
        cursor = point;
        redraw();
    }
    else
        return cursor;
}

var sels = function (rect) {

    if (rect !== undefined) {
        rect.trunc();
        if (rect.w !== undefined && rect.h !== undefined) {
            selection = rect;
        } else
            // just location
            selection = new Rect((rect.x), (rect.y), selection.w, selection.h);
        redraw();
    }
    else
        return selection;
}

var charat = function (pos, val) {
    pos.trunc();
    var seek = (pos.y * size.x) + pos.x;
    if (seek > data.length)
        return '\0'
    else if (val !== undefined) {
        data = (data.substring(0, seek) + val.charAt(0) + data.substring(seek + 1));
        redraw();
    } else
        return data.charAt(seek);
}


var charsat = function (r, c) {
    r.trunc();
    if (c === undefined) {
        var s = '';
        for (var y = r.y; y < r.b; y++)
            s += data.substr(y * size.x + r.x, r.w);
        return s;
    } else {
        if (c.length != r.w * r.h)
            throw "unmatching buffer count!";

        for (var y = r.y; y < r.b; y++)
            data = data.substring(0, y * size.x + r.x) +
                c.substr((y - r.y) * r.w, r.w) +
                data.substring(y * size.x + r.r);
        redraw();
    }
}

var redraw = function () {
    if (_freeze) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#07c';
    ctx.fillRect(selection.x * width, selection.y * height,
        selection.w * width, selection.h * height);

    ctx.fillStyle = '#ef2';
    if (head() == Tool.Freetype)
        ctx.fillRect(cursor.x * width, cursor.y * height,
            width, height);

    ctx.textBaseline = "top";
    ctx.font = font;
    ctx.fillStyle = 'black';

    for (var i = 0; i < size.y; i++)
        ctx.fillText(data.substr(i * size.x, size.x), 0, (i * height));
}

var resizeCanvas = function () {
    canvas.width = size.x * width;
    canvas.height = size.y * height;
    redraw();
}

var resizeCell = function (sz) {
    size = sz;
    data = fill(data);
    resizeCanvas();
}

var resizeFont = function (px) {
    height = px;
    font = height + "px Courier New, Courier, monospace";
    ctx.font = font;
    width = ctx.measureText(' ').width;
    resizeCanvas();
}

var getMousePos = function (evt) {
    var rect = canvas.getBoundingClientRect();
    return new Point(
        evt.clientX - rect.left,
        evt.clientY - rect.top
    );
}

var flexible = function (r) {
    if (r.w < 0) {
        r.x += r.w;
        r.w *= -1;
    }
    if (r.h < 0) {
        r.y += r.h;
        r.h *= -1;
    }
    r.w++;
    r.h++;
    return r;
}

var paste = function (text, trim) {
    text = text.replace("\r", "");
    if (!text) { clearSelected(); return; }

    if (isCursorFree()) {
        var sel = selection;
        var w = 0, h = 0;
        for (var i = 0; i < text.length; i++) {
            if (text[i] == '\n') {
                sel.w = Math.max(sel.w, w);
                h++;
                w = 0;
            }
            else {
                w++;
            }

        }
        sel.h = Math.min(size.y - sel.y, h + 1);
        selection = sel;
    }

    _freeze = true;
    var intrimming = trim;
    cursor = selection.location();
    for (var i = 0; i < text.length; i++) {
        if (intrimming && text.charCodeAt(i) <= 0x20)
            continue;
        intrimming = false;
        if (append(text.charAt(i))) {
            if (text[i] != '\n')
                while (i < text.length && text.charCodeAt(i) !== '\n')
                    i++;
            else
                intrimming = trim;

        }
    }
    _freeze = false;
    redraw();

}

/// <returns>Return if the cursor just moves down</returns>
var append = function (c) {
    if (c == '\n') {
        gotoNextLine();
        return true;
    }
    var cur = cursor;
    charat(cur, c);
    return gotoRight();
}

var gotoUp = function () {
    var cur = cursor;
    if (isCursorFree()) {
        if (cur.y == 0)
            cur.y = size.y;
    }
    else {
        if (cur.y == selection.y)
            cur.y = selection.b;
    }
    cur.y--;
    redraw();
}

var gotoDown = function () {
    var cur = cursor;
    cur.y++;
    if (isCursorFree()) {
        if (cur.y == size.y)
            cur.y = 0;
    }
    else {
        if (cur.y == selection.b)
            cur.y = selection.y;
    }
    redraw();
}

var gotoRight = function () {
    var cur = cursor;
    cur.x++;
    if (isCursorFree()) {
        if (cur.x == size.x) {
            cur.x = 0;
            cur.y++;
            if (cur.y == size.y)
                cur.y = 0;
        }
    }
    else {
        if (cur.x == selection.r) {
            cur.x = selection.x;
            cur.y++;
            if (cur.y == selection.b)
                cur.y = selection.y;
        }
    }
    var r = cur.y != cursor.y;
    redraw();
    return r;
}

var gotoLeft = function () {
    var cur = cursor;
    if (isCursorFree()) {
        if (cur.x == 0) {
            if (cur.y == 0)
                cur.y = size.y;
            cur.y--;
            cur.x = size.x;
        }
    }
    else {
        if (cur.x == selection.x) {
            if (cur.y == selection.y)
                cur.y = selection.b;
            cur.y--;
            cur.x = selection.r;
        }
    }
    cur.x--;
    var r = cur.y !== cursor.y;
    redraw();
    return r;
}

var gotoNextLine = function () {
    var cur = cursor;
    if (isCursorFree()) {
        cur.x = 0;
        cur.y = (cur.y + 1) % size.y;
    }
    else {
        cur.x = selection.x;
        cur.y = (cur.y - selection.y + 1) % selection.h + selection.y;
    }
    redraw();
}

var clearSelected = function () {
    charsat(selection, ' '.repeat(selection.w * selection.h));
}

var MoveSelected = function (dest) {
    if (selection.location().equals(dest)) return;

    var txt = charsat(selection);
    _freeze = true;
    clearSelected();
    sels(dest);
    _freeze = false;
    charsat(selection, txt);
}

var Backspace = function (drag) {
    if (drag) {
        var c = charsat(selection);
        var cr = (cursor.x - selection.x) + (cursor.y - selection.y) * selection.w;
        c = ' ' + c.substr(0, cr - 1);
        charsat(selection, c);
    }
    else {
        gotoLeft();
        charat(cursor, ' ');
    }
}

var Delete = function (drag) {
    if (drag) {
        var c = charsat(selection);
        var cr = (cursor.x - selection.x) + (cursor.y - selection.y) * selection.w;
        c = c.substr(0, cr) + c.substr(cr + 1, c.length - cr - 1) + ' ';
        charsat(selection, c);
    } else {
        charat(cursor, ' ');
        gotoRight();
    }
}

var Insert = function (leftside) {
    if (leftside) {
        var c = charsat(selection);
        var cr = (cursor.x - selection.x) + (cursor.y - selection.y) * selection.w;
        Array.copy(c, 1, c, 0, cr - 1);
        c[c.length - 1] = ' ';
        charsat(selection, c);
    }
    else {
        var c = charsat(selection);
        var cr = (cursor.x - selection.x) + (cursor.y - selection.y) * selection.w;
        Array.copy(c, cr, c, cr + 1, c.length - cr - 1);
        c[cr] = ' ';
        charsat(selection, c);
    }
}

// var Mirror = function (op) {
//     var c = charsat(selection);
//     var w = selection.w, h = selection.h;
//     var dest = '';
//     switch (op) {
//         case CanvasMirror.MirrorX:
//             for (var y = 0; y < h; y++)
//                 for (var x = 0; x < w; x++)
//                     dest[(w - x - 1) + y * w] = c[x + y * w];
//             break;

//         case CanvasMirror.MirrorY:
//             for (var y = 0; y < h; y++)
//                 for (var x = 0; x < w; x++)
//                     dest[x + (h - y - 1) * w] = c[x + y * w];
//             break;

//         case CanvasMirror.RotateCW:
//             selection = new Rectangle(selection.x, selection.y, h, w);
//             for (var y = 0; y < h; y++)
//                 for (var x = 0; x < w; x++)
//                     dest[x * h + (h - y - 1)] = c[x + y * w];
//             break;

//         case CanvasMirror.RotateCCW:
//             selection = new Rectangle(selection.x, selection.y, h, w);
//             for (var y = 0; y < h; y++)
//                 for (var x = 0; x < w; x++)
//                     dest[(w - x - 1) * h + y] = c[x + y * w];
//             break;

//         case CanvasMirror.TransposeXY:
//             selection = new Rectangle(selection.x, selection.y, h, w);
//             for (var y = 0; y < h; y++)
//                 for (var x = 0; x < w; x++)
//                     dest[y + x * w] = c[x + y * w];
//             break;

//         case CanvasMirror.TransposeYX:
//             selection = new Rectangle(selection.x, selection.y, h, w);
//             for (var y = 0; y < h; y++)
//                 for (var x = 0; x < w; x++)
//                     dest[(w - x - 1) * w + (h - y - 1)] = c[x + y * w];
//             break;
//     }

//     charsat(selection, dest);
// }

var isCursorFree = () => selection.w <= 1 && selection.h <= 1;

var RecordUndo = function (state) {
    if (state === undefined)
        state = makeState(true);

    if (undostack.length > 0 && undostack[undostack.length - 1].equals(state))
        return;

    undostack.push(state);
    if (undostack.length > 20)
        undostack.shift();

    // save to localstorage
    localStorage.setItem(thisname, JSON.stringify(state));
}

var Undo = function () {
    if (undostack.length > 0) {
        var txt = data; var sel = selection;
        ApplyState(undostack.pop());
        if (undostack.length > 0 && data == txt && selection.equals(sel)) {
            // do it again
            Undo();
        }
    }
    //else
    //  SystemSounds.Beep.Play();
}

function makeState(area) {
    if (area === true)
        area = new Rect(0, 0, size.x, size.y);
    else if (area === false)
        area = selection;

    return new CanvasState(charsat(area), area.clone(), selection.clone());
}

function ApplyState(state) {
    _freeze = true;
    charsat(state.area, state.data);
    _freeze = false;
    sels(state.selection);
}

var drawLine = function (A, B) {
    if (A.equals(B)) {
        charat(A, palette == '\0' ? getLineChar() : palette);
        return;
    }
    var m = new Point(0, 0), n = new Point(0, 0);
    var D = new Point(A.x - B.x, A.y - B.y);
    var L = Math.trunc(Math.sqrt(D.x * D.x + D.y * D.y)) + 1;
    for (var i = 0; i <= L;) {
        m.x = A.x + ((B.x - A.x) * i) / L;
        m.y = A.y + ((B.y - A.y) * i) / L;
        do {
            i++;
            n.x = A.x + ((B.x - A.x) * i) / L;
            n.y = A.y + ((B.y - A.y) * i) / L;
        } while (m.equals(n)); // avoid duplicate write

        charat(m, palette == '\0' ? getLineChar(m, n) : palette);
    }
}

var drawRectangle = function (A, B) {
    if (A.equals(B)) {
        charat(A, palette == '\0' ? getLineChar() : palette);
        return;
    }

    drawLine(new Point(A.x, A.y), new Point(B.x, A.y));
    drawLine(new Point(A.x, B.y), new Point(B.x, B.y));
    drawLine(new Point(A.x, A.y), new Point(A.x, B.y));
    drawLine(new Point(B.x, A.y), new Point(B.x, B.y));

    var c = palette == '\0' ? getLineChar() : palette;

    charat(A, c);
    charat(B, c);
    charat(new Point(A.x, B.y), c);
    charat(new Point(B.x, A.y), c);
}

var drawEllipse = function (A, B) {
    if (A.equals(B)) {
        charat(A, palette == '\0' ? getLineChar() : palette);
        return;
    }

    var a = (A.x - B.x) / 2, b = (A.y - B.y) / 2, xc = (B.x), yc = (B.y);

    if (a < 0) {
        xc += a * 2;
        a = Math.abs(a);
    }

    if (b < 0) {
        yc += b * 2;
        b = Math.abs(b);
    }

    xc += a;
    yc += b;

    var x = 0;
    var y = b;

    var a2 = a * a;
    var b2 = b * b;

    var crit1 = -(a2 / 4 + a % 2 + b2);
    var crit2 = -(b2 / 4 + b % 2 + a2);
    var crit3 = -(b2 / 4 + b % 2);

    var t = -a2 * y;
    var dxt = 2 * b2 * x;
    var dyt = -2 * a2 * y;

    var d2xt = 2 * b2;
    var d2yt = 2 * a2;

    var incX = () => { x++; dxt += d2xt; t += dxt; };
    var incY = () => { y--; dyt += d2yt; t += dyt; };

    while (y >= 0 && x <= a) {
        var character = palette === '\0' ? getLineChar() : palette;
        charat(new Point(xc + x, yc + y), character);

        if (x != 0 || y != 0) {
            charat(new Point(xc - x, yc - y), character);
        }

        if (x != 0 && y != 0) {
            charat(new Point(xc + x, yc - y), character);
            charat(new Point(xc - x, yc + y), character);
        }

        if (t + b2 * x <= crit1 || t + a2 * y <= crit3) {
            incX();
        }
        else if (t - a2 * y > crit2) {
            incY();
        }
        else {
            incX();
            incY();
        }
    }


    var D = new Point(A.x - B.x, A.y - B.y);
    var C = new Point((A.x + B.x) / 2, (A.y + B.y) / 2);
    var L = ellipsePerimeter(D.x, D.y);
    var m, n;
    for (var i = 0; i <= L;) {
        m = new Point(C.x + Math.trunc(Math.cos(i / L * 2 * Math.PI) * D.x / 2), C.y + Math.trunc(Math.sin(i / L * 2 * Math.PI) * D.y / 2));
        do {
            i++;
            n = new Point(C.x + Math.trunc(Math.cos(i / L * 2 * Math.PI) * D.x / 2), C.y + Math.trunc(Math.sin(i / L * 2 * Math.PI) * D.y / 2));
        } while (m == n && i <= L); // avoid duplicate write

        charat(m, palette == '\0' ? getLineChar(m, n) : palette);
    }
}


