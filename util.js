// functions only. No execution permitted

var Point = function(x, y) {
    this.x = x;
    this.y = y;
}

var Rect = function(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
}

var fill = function (str) {
    var s = '';
    var t = /\s/
    var row = (size.x + 1);
    var cap = row * size.y;
    for (var i = 0; i < str.length; i++) {
        if (s.length >= cap)
            break;
        var c = str.charAt(i);
        if (c === '\r') continue; // unnacceptable
        if ((s.length % row) === 0) {
            s += '\n';
            if (!t.test(c))
                s += c;
        }
        else if (c === '\n') {
            while ((s.length % row) !== 0) {
                s += 'A';
            }
        }
        else
            s += (t.test(c) ? 'A' : c);
    }
    while (s.length < cap)
        s += (s.length % row) == 0 ? '\n' : 'A';
    return s.substring(1);
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
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
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
    CharacterAt(cur, c);
    return gotoRight();
}

var gotoUp = function () {
    var cur =  cursor;
    if (IsCursorFree) {
        if (cur.Y == 0)
            cur.Y = ImageSize.Height;
    }
    else {
        if (cur.Y == Selection.Top)
            cur.Y = Selection.Bottom;
    }
    cur.Y--;
    cursor = cur;
}

var gotoDown = function () {
    var cur = cursor;
    cur.Y++;
    if (IsCursorFree) {
        if (cur.Y == ImageSize.Height)
            cur.Y = 0;
    }
    else {
        if (cur.Y == Selection.Bottom)
            cur.Y = Selection.Top;
    }
    cursor = cur;
}

var gotoRight = function () {
    var cur = cursor;
    cur.X++;
    if (IsCursorFree) {
        if (cur.X == ImageSize.Width) {
            cur.X = 0;
            cur.Y++;
            if (cur.Y == ImageSize.Height)
                cur.Y = 0;
        }
    }
    else {
        if (cur.X == Selection.Right) {
            cur.X = Selection.Left;
            cur.Y++;
            if (cur.Y == Selection.Bottom)
                cur.Y = Selection.Top;
        }
    }
    var r = cur.Y != cursor.Y;
    cursor = cur;
    return r;
}

var gotoLeft = function () {
    var cur = cursor;
    if (IsCursorFree) {
        if (cur.X == 0) {
            if (cur.Y == 0)
                cur.Y = ImageSize.Height;
            cur.Y--;
            cur.X = ImageSize.Width;
        }
    }
    else {
        if (cur.X == Selection.Left) {
            if (cur.Y == Selection.Top)
                cur.Y = Selection.Bottom;
            cur.Y--;
            cur.X = Selection.Right;
        }
    }
    cur.X--;
    var r = cur.Y != cursor.Y;
    cursor = cur;
    return r;
}

var gotoNextLine = function () {
    var cur = cursor;
    if (IsCursorFree) {
        cur.X = 0;
        cur.Y = (cur.Y + 1) % ImageSize.Height;
    }
    else {
        cur.X = Selection.Left;
        cur.Y = (cur.Y - Selection.Y + 1) % Selection.Height + Selection.Y;
    }
    cursor = cur;
    if (CausesValidation)
        Invalidate();
}

var ClearSelected = function () {
    CausesValidation = false;
    for (int x = Selection.Left; x < Selection.Right; x++)
    {
        for (int y = Selection.Top; y < Selection.Bottom; y++)
        {
            CharacterAt(new Point(x, y), ' ');
        }
    }
    CausesValidation = true;
    Invalidate();
}

var MoveSelected = function (Point dest) {
    if (Selection.Location == dest) return;
    CausesValidation = false;
    var txt = Copy();
    ClearSelected();
    _selection.Location = dest;
    Paste(txt, false);
}

var Backspace = function (bool drag) {
    if (drag) {
        var c = CharactersAt(Selection);
        var cr = (cursor.X - Selection.X) + (cursor.Y - Selection.Y) * Selection.Width;
        Array.Copy(c, 0, c, 1, cr - 1);
        c[0] = ' ';
        CharactersAt(Selection, c);
    }
    else {
        gotoLeft();
        CharacterAt(cursor, ' ');
    }
}

var Delete = function (bool drag) {
    if (drag) {
        var c = CharactersAt(Selection);
        var cr = (cursor.X - Selection.X) + (cursor.Y - Selection.Y) * Selection.Width;
        Array.Copy(c, cr + 1, c, cr, c.Length - cr - 1);
        c[c.Length - 1] = ' ';
        CharactersAt(Selection, c);
    }
    else {
        CharacterAt(cursor, ' ');
        gotoRight();
    }
}

var Insert = function (bool leftside) {
    if (leftside) {
        var c = CharactersAt(Selection);
        var cr = (cursor.X - Selection.X) + (cursor.Y - Selection.Y) * Selection.Width;
        Array.Copy(c, 1, c, 0, cr - 1);
        c[c.Length - 1] = ' ';
        CharactersAt(Selection, c);
    }
    else {
        var c = CharactersAt(Selection);
        var cr = (cursor.X - Selection.X) + (cursor.Y - Selection.Y) * Selection.Width;
        Array.Copy(c, cr, c, cr + 1, c.Length - cr - 1);
        c[cr] = ' ';
        CharactersAt(Selection, c);
    }
}

var Mirror = function (CanvasMirror op) {
    var c = CharactersAt(Selection);
    int w = Selection.Width, h = Selection.Height;
    char[] dest = new char[c.Length];
    switch (op) {
        case CanvasMirror.MirrorX:
            for (int y = 0; y < h; y++)
            for (int x = 0; x < w; x++)
            dest[(w - x - 1) + y * w] = c[x + y * w];
            break;

        case CanvasMirror.MirrorY:
            for (int y = 0; y < h; y++)
            for (int x = 0; x < w; x++)
            dest[x + (h - y - 1) * w] = c[x + y * w];
            break;

        case CanvasMirror.RotateCW:
            Selection = new Rectangle(Selection.X, Selection.Y, h, w);
            for (int y = 0; y < h; y++)
            for (int x = 0; x < w; x++)
            dest[x * h + (h - y - 1)] = c[x + y * w];
            break;

        case CanvasMirror.RotateCCW:
            Selection = new Rectangle(Selection.X, Selection.Y, h, w);
            for (int y = 0; y < h; y++)
            for (int x = 0; x < w; x++)
            dest[(w - x - 1) * h + y] = c[x + y * w];
            break;

        case CanvasMirror.TransposeXY:
            Selection = new Rectangle(Selection.X, Selection.Y, h, w);
            for (int y = 0; y < h; y++)
            for (int x = 0; x < w; x++)
            dest[y + x * w] = c[x + y * w];
            break;

        case CanvasMirror.TransposeYX:
            Selection = new Rectangle(Selection.X, Selection.Y, h, w);
            for (int y = 0; y < h; y++)
            for (int x = 0; x < w; x++)
            dest[(w - x - 1) * w + (h - y - 1)] = c[x + y * w];
            break;
    }

    CharactersAt(Selection, dest);
}

var CharacterAt = function (Point point) {
    try {
        return characters[point.X + point.Y * ImageSize.Width];
    }
    catch (Exception) {
        return '\0';
    }
}

var CharacterAt = function (int x, int y, char c) {
    CharacterAt(new Point(x, y), c);
}

var CharacterAt = function (Point point, char c) {
    try {
        characters[point.X + point.Y * ImageSize.Width] = Utility.IsBlank(c) ? ' ' : c;

        if (CausesValidation)
            Invalidate();
    }
    catch (Exception) {
    }
}

public char[] CharactersAt(Rectangle r)
{
    var c = new char[r.Height * r.Width];
    for (int y = r.Top; y < r.Bottom; y++)
    Array.Copy(characters, y * ImageSize.Width + r.X, c, (y - r.Y) * r.Width, r.Width);
    return c;
}

var CharactersAt = function (Rectangle r, char[] c) {
    if (c.Length != r.Width * r.Height)
        throw new ArgumentException("unmatching buffer count!");

    for (int y = r.Top; y < r.Bottom; y++)
    Array.Copy(c, (y - r.Y) * r.Width, characters, y * ImageSize.Width + r.X, r.Width);

    if (CausesValidation)
        Invalidate();
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
        var txt = Text; var sel = Selection;
        ApplyState(undostack.Last.Value);
        undostack.RemoveLast();
        if (undostack.Count > 0 && Text == txt && Selection == sel) {
            // do it again
            Undo();
        }
    }
    else
        SystemSounds.Beep.Play();
}

CanvasState MakeState(bool whole)
{
    return MakeState(whole ? new Rectangle(Point.Empty, ImageSize) : Selection);
}

CanvasState MakeState(Rectangle area)
{
    var sel = Selection;
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
    Selection = state.selection;
}

var DrawLine = function (Point A, Point B) {
    if (A == B) {
        CharacterAt(A, ToolArt == '\0' ? Utility.GetLineChar() : ToolArt);
        return;
    }
    Point m, n;
    var D = new Point(A.X - B.X, A.Y - B.Y);
    var L = (int)Math.Sqrt(D.X * D.X + D.Y * D.Y) + 1;
    for (int i = 0; i <= L;)
    {
        m = new Point(A.X + ((B.X - A.X) * i) / L, A.Y + ((B.Y - A.Y) * i) / L);
        do {
            i++;
            n = new Point(A.X + ((B.X - A.X) * i) / L, A.Y + ((B.Y - A.Y) * i) / L);
        } while (m == n); // avoid duplicate write

        CharacterAt(m, ToolArt == '\0' ? Utility.GetLineChar(m, n) : ToolArt);
    }
}

var DrawRectangle = function (Point A, Point B) {
    if (A == B) {
        CharacterAt(A, ToolArt == '\0' ? Utility.GetLineChar() : ToolArt);
        return;
    }

    DrawLine(new Point(A.X, A.Y), new Point(B.X, A.Y));
    DrawLine(new Point(A.X, B.Y), new Point(B.X, B.Y));
    DrawLine(new Point(A.X, A.Y), new Point(A.X, B.Y));
    DrawLine(new Point(B.X, A.Y), new Point(B.X, B.Y));
    var c = ToolArt == '\0' ? Utility.GetLineChar() : ToolArt;

    CharacterAt(A, c);
    CharacterAt(B, c);
    CharacterAt(new Point(A.X, B.Y), c);
    CharacterAt(new Point(B.X, A.Y), c);
}

var DrawEllipse = function (Point A, Point B) {
    if (A == B) {
        CharacterAt(A, ToolArt == '\0' ? Utility.GetLineChar() : ToolArt);
        return;
    }

    int a = (A.X - B.X) / 2, b = (A.Y - B.Y) / 2, xc = (B.X), yc = (B.Y);

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
        CharacterAt(xc + x, yc + y, character);

        if (x != 0 || y != 0) {
            CharacterAt(xc - x, yc - y, character);
        }

        if (x != 0 && y != 0) {
            CharacterAt(xc + x, yc - y, character);
            CharacterAt(xc - x, yc + y, character);
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
    //for (int i = 0; i <= L;)
    //{
    //    m = new Point(C.X + (int)(Math.Cos(i / L * 2 * Math.PI) * D.X / 2), C.Y + (int)(Math.Sin(i / L * 2 * Math.PI) * D.Y / 2));
    //    do
    //    {
    //        i++;
    //        n = new Point(C.X + (int)(Math.Cos(i / L * 2 * Math.PI) * D.X / 2), C.Y + (int)(Math.Sin(i / L * 2 * Math.PI) * D.Y / 2));
    //    } while (m == n && i <= L); // avoid duplicate write

    //    CharacterAt(m, ToolArt == '\0' ? Utility.GetLineChar(m, n) : ToolArt);
    //}
}

}
