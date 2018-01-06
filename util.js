// functions only. No execution permitted

var Point = function (x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype.clone = function () {
    return new Point(this.x, this.y);
}

var Rect = function (x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.r = x + w;
    this.b = y + h;
}

Rect.prototype.clone = function () {
    return new Rect(this.x, this.y, this.w, this.h);
}

Rect.prototype.location = function () {
    return new Point(this.x, this.y);
}

Rect.prototype.size = function () {
    return new Point(this.w, this.h);
}

var fill = function (str, col, row) {
    if (col === undefined)
        col = size.x;
    if (row === undefined)
        row = size.y;

    var s = '';
    var t = /\s/
    var cap = col * row;
    for (var i = 0; i < str.length; i++) {
        if (s.length >= cap)
            break;
        var c = str.charAt(i);
        if (c === '\r') continue; // imagine this don't exist
        else if (c === '\n') {
            while ((s.length % col) !== 0) {
                s += 'A';
            }
        }
        else
            s += (t.test(c) ? 'A' : c);
    }
    while (s.length < cap)
        s += 'A';
    return s;
}

var showcursor = function (cur) {
    if (str !== undefined)
        canvas.style.cursor = cur;
    else
        return canvas.style.cursor;
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
        selection = rect;
        redraw();
    }
    else
        return selection;
}

var charat = function (pos, val) {
    var seek = pos.y * (size.x + 1) + pos.x;
    if (val !== undefined) {
        text(data.substring(0, seek) + val + data.substring(seek + 1))
    } else
        data.charAt(seek);
}

var redraw = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = font;
    ctx.fillStyle = '#07c';
    ctx.fillRect(selection.x * width, selection.y * height,
        selection.w * width, selection.h * height);

    var lines = data.split('\n');
    ctx.fillStyle = 'black';

    for (var i = 0; i < lines.length; i++)
        ctx.fillText(lines[i], 0, (i * height));
}

var resizeCanvas = function () {
    canvas.width = size.x * width;
    canvas.height = size.y * height;
    redraw();
}

var resizeCell = function (sz) {
    size = sz;
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
        r.x += r.w - 1;
        r.w *= -1;
        r.w++;
    }
    if (r.h < 0) {
        r.y += r.h - 1;
        r.h *= -1;
        r.h++;
    }
    r.w++;
    r.h++;
    return r;
}

var paste = function (text, trim) {
    console.log(text);
}

var copy = function () {
    return '*';
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
    cursor = cur;
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
    cursor = cur;
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
    cursor = cur;
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
    cursor = cur;
    if (CausesValidation)
        Invalidate();
}

var ClearSelected = function () {
    CausesValidation = false;
    for (var x = selection.x; x < selection.r; x++) {
        for (var y = selection.y; y < selection.b; y++) {
            charat(new Point(x, y), ' ');
        }
    }
    CausesValidation = true;
    Invalidate();
}

var MoveSelected = function (dest) {
    if (selection.location() == dest) return;
    CausesValidation = false;
    var txt = Copy();
    ClearSelected();
    _selection.Location = dest;
    Paste(txt, false);
}

var Backspace = function (drag) {
    if (drag) {
        var c = charsat(selection);
        var cr = (cursor.x - selection.x) + (cursor.y - selection.y) * selection.w;
        Array.Copy(c, 0, c, 1, cr - 1);
        c[0] = ' ';
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
        Array.Copy(c, cr + 1, c, cr, c.length - cr - 1);
        c[c.length - 1] = ' ';
        charsat(selection, c);
    }
    else {
        charat(cursor, ' ');
        gotoRight();
    }
}

var Insert = function (leftside) {
    if (leftside) {
        var c = charsat(selection);
        var cr = (cursor.x - selection.x) + (cursor.y - selection.y) * selection.w;
        Array.Copy(c, 1, c, 0, cr - 1);
        c[c.length - 1] = ' ';
        charsat(selection, c);
    }
    else {
        var c = charsat(selection);
        var cr = (cursor.x - selection.x) + (cursor.y - selection.y) * selection.w;
        Array.Copy(c, cr, c, cr + 1, c.length - cr - 1);
        c[cr] = ' ';
        charsat(selection, c);
    }
}

var Mirror = function (op) {
    var c = charsat(selection);
    var w = selection.w, h = selection.h;
    var dest = '';
    switch (op) {
        case CanvasMirror.MirrorX:
            for (var y = 0; y < h; y++)
                for (var x = 0; x < w; x++)
                    dest[(w - x - 1) + y * w] = c[x + y * w];
            break;

        case CanvasMirror.MirrorY:
            for (var y = 0; y < h; y++)
                for (var x = 0; x < w; x++)
                    dest[x + (h - y - 1) * w] = c[x + y * w];
            break;

        case CanvasMirror.RotateCW:
            selection = new Rectangle(selection.x, selection.y, h, w);
            for (var y = 0; y < h; y++)
                for (var x = 0; x < w; x++)
                    dest[x * h + (h - y - 1)] = c[x + y * w];
            break;

        case CanvasMirror.RotateCCW:
            selection = new Rectangle(selection.x, selection.y, h, w);
            for (var y = 0; y < h; y++)
                for (var x = 0; x < w; x++)
                    dest[(w - x - 1) * h + y] = c[x + y * w];
            break;

        case CanvasMirror.TransposeXY:
            selection = new Rectangle(selection.x, selection.y, h, w);
            for (var y = 0; y < h; y++)
                for (var x = 0; x < w; x++)
                    dest[y + x * w] = c[x + y * w];
            break;

        case CanvasMirror.TransposeYX:
            selection = new Rectangle(selection.x, selection.y, h, w);
            for (var y = 0; y < h; y++)
                for (var x = 0; x < w; x++)
                    dest[(w - x - 1) * w + (h - y - 1)] = c[x + y * w];
            break;
    }

    charsat(selection, dest);
}

var charat = function (Point point) {
    try {
        return characters[point.X + point.Y * size.x];
    }
    catch (Exception) {
        return '\0';
    }
}

var charat = function (var x, var y, char c) {
    charat(new Point(x, y), c);
}

var charat = function (Point point, char c) {
    try {
        characters[point.X + point.Y * size.x] = Utility.IsBlank(c) ? ' ' : c;

        if (CausesValidation)
            Invalidate();
    }
    catch (Exception) {
    }
}

var charsat = function (r, c) {
    if (c === undefined) {
        var c = new char[r.Height * r.Width];
        for (var y = r.y; y < r.b; y++)
            Array.Copy(characters, y * size.x + r.X, c, (y - r.Y) * r.Width, r.Width);
        return c;

    } else {
        if (c.length != r.w * r.h)
            throw "unmatching buffer count!";

        for (var y = r.y; y < r.b; y++)
            Array.Copy(c, (y - r.Y) * r.Width, characters, y * size.x + r.X, r.Width);

        redraw();
    }
}

isCursorFree = () => selection.w <= 1 && selection.h <= 1;

var RecordUndo = function () {
    RecordUndo(MakeState(true));
}

var RecordUndo = function (CanvasState state) {
    if (undostack.Count > 0 && undostack.Last.Equals(state))
        return;
    undostack.AddLast(state);
    if (undostack.Count > 20)
        undostack.RemoveFirst();
}

var Undo = function () {
    if (undostack.Count > 0) {
        var txt = Text; var sel = selection;
        ApplyState(undostack.Last.Value);
        undostack.RemoveLast();
        if (undostack.Count > 0 && Text == txt && selection == sel) {
            // do it again
            Undo();
        }
    }
    else
        SystemSounds.Beep.Play();
}

CanvasState MakeState(bool whole)
{
    return MakeState(whole ? new Rectangle(Point.Empty, ImageSize) : selection);
}

CanvasState MakeState(Rectangle area)
{
    var sel = selection;
    _selection = area;
    var r = new CanvasState()
    {
        data = Copy(),
            area = area,
            selection = sel,
    };
    _selection = sel;
    return r;
}

void ApplyState(CanvasState state)
{
    _selection = state.area;
    Paste(state.data, false);
    selection = state.selection;
}

var DrawLine = function (Point A, Point B) {
    if (A == B) {
        charat(A, ToolArt == '\0' ? Utility.GetLineChar() : ToolArt);
        return;
    }
    Point m, n;
    var D = new Point(A.X - B.X, A.Y - B.Y);
    var L = (var) Math.Sqrt(D.X * D.X + D.Y * D.Y) + 1;
    for (var i = 0; i <= L;) {
        m = new Point(A.X + ((B.X - A.X) * i) / L, A.Y + ((B.Y - A.Y) * i) / L);
        do {
            i++;
            n = new Point(A.X + ((B.X - A.X) * i) / L, A.Y + ((B.Y - A.Y) * i) / L);
        } while (m == n); // avoid duplicate write

        charat(m, ToolArt == '\0' ? Utility.GetLineChar(m, n) : ToolArt);
    }
}

var DrawRectangle = function (Point A, Point B) {
    if (A == B) {
        charat(A, ToolArt == '\0' ? Utility.GetLineChar() : ToolArt);
        return;
    }

    DrawLine(new Point(A.X, A.Y), new Point(B.X, A.Y));
    DrawLine(new Point(A.X, B.Y), new Point(B.X, B.Y));
    DrawLine(new Point(A.X, A.Y), new Point(A.X, B.Y));
    DrawLine(new Point(B.X, A.Y), new Point(B.X, B.Y));
    var c = ToolArt == '\0' ? Utility.GetLineChar() : ToolArt;

    charat(A, c);
    charat(B, c);
    charat(new Point(A.X, B.Y), c);
    charat(new Point(B.X, A.Y), c);
}

var DrawEllipse = function (Point A, Point B) {
    if (A == B) {
        charat(A, ToolArt == '\0' ? Utility.GetLineChar() : ToolArt);
        return;
    }

    var a = (A.X - B.X) / 2, b = (A.Y - B.Y) / 2, xc = (B.X), yc = (B.Y);

    if (a < 0) {
        xc += a * 2;
        a = Math.Abs(a);
    }

    if (b < 0) {
        yc += b * 2;
        b = Math.Abs(b);
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

    Action incX = delegate() { x++; dxt += d2xt; t += dxt; };
    Action incY = delegate() { y--; dyt += d2yt; t += dyt; };

    while (y >= 0 && x <= a) {
        var character = ToolArt == '\0' ? Utility.GetLineChar() : ToolArt;
        charat(xc + x, yc + y, character);

        if (x != 0 || y != 0) {
            charat(xc - x, yc - y, character);
        }

        if (x != 0 && y != 0) {
            charat(xc + x, yc - y, character);
            charat(xc - x, yc + y, character);
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


    //var D = new Point(A.X - B.X, A.Y - B.Y);
    //var C = new Point((A.X + B.X) / 2, (A.Y + B.Y) / 2);
    //var L = Utility.EllipsePerimeter(D.X, D.Y);
    //Point m, n;
    //for (var i = 0; i <= L;)
    //{
    //    m = new Point(C.X + (var)(Math.Cos(i / L * 2 * Math.PI) * D.X / 2), C.Y + (var)(Math.Sin(i / L * 2 * Math.PI) * D.Y / 2));
    //    do
    //    {
    //        i++;
    //        n = new Point(C.X + (var)(Math.Cos(i / L * 2 * Math.PI) * D.X / 2), C.Y + (var)(Math.Sin(i / L * 2 * Math.PI) * D.Y / 2));
    //    } while (m == n && i <= L); // avoid duplicate write

    //    charat(m, ToolArt == '\0' ? Utility.GetLineChar(m, n) : ToolArt);
    //}
}

}
