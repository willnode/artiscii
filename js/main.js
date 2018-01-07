var canvas = $('#canvas').get(0), ctx = canvas.getContext('2d');

var height, width, font, _headback, _seldown, _drgdown, _drwshot, _dwned, _freeze;

var size = new Point(100, 30), selection = new Rect(0, 0, 1, 1), cursor = new Point(0, 0);

var data = fill(''), undostack = [], palette = '\0';

resizeFont(12);

$('#resize-ok').on('click', () => {
    resizeCell({ x: ~~$('#resize-x').val(), y: ~~$('#resize-y').val() });
    resizeFont(~~$('#resize-px').val())
})

$(canvas).on('mousedown', (e) => {

    if (e.which !== 1) return;

    var ms = getMousePos(e);

    var h = head();

    _seldown = new Point(Math.floor(ms.x / width), Math.floor(ms.y / height));

    if (h === Tool.Line || h === Tool.Rectangle || h === Tool.Circle)
        _drwshot = data;
    else if (h === Tool.Dragdrop || e.ctrlKey) {
        head(Tool.Dragdrop);
        _headback = Tool.Select;
        _drgdown = selection.clone();
        showcursor("move");
    } else if (h === Tool.Freetype) {
        if (_headback === Tool.Select && !selection.isContaining(_seldown)) {
            head(Tool.Select);
        } else
            curs(_seldown.clone());
    } else {
        sels(new Rect(_seldown.x, _seldown.y, 1, 1));
        if (h === Tool.Brush)
            charat(selection.location(), palette === '\0' ? ' ' : palette);
    }

    _dwned = true;
})

$(document).on('mousemove', (e) => {

    if (!_dwned) return;

    var ms = getMousePos(e);
    ms.x = Math.trunc(ms.x / width);
    ms.y = Math.trunc(ms.y / height);

    switch (head()) {
        case Tool.Select:
            sels(flexible(new Rect(_seldown.x, _seldown.y, ms.x - _seldown.x, ms.y - _seldown.y)));
            break;
        case Tool.Freetype:
            break;
        case Tool.Dragdrop:
            sels(new Point(ms.x - _seldown.x + _drgdown.x, ms.y - _seldown.y + _drgdown.y))
            break;
        case Tool.Brush:
            sels(new Rect(ms.x, ms.y, 1, 1));
            charat(selection.location(), palette === '\0' ? ' ' : palette);
            break;
        case Tool.Line:
        case Tool.Rectangle:
        case Tool.Circle:
            sels(flexible(new Rect(_seldown.x, _seldown.y, ms.x - _seldown.x, ms.y - _seldown.y)));

            _freeze = true;
            data = _drwshot;
            switch (head()) {
                case Tool.Line:
                    drawLine(ms, _seldown);
                    break;
                case Tool.Rectangle:
                    drawRectangle(ms, _seldown);
                    break;
                case Tool.Circle:
                    drawEllipse(ms, _seldown);
                    break;
                default:
                    break;
            }
            _freeze = false;
            redraw();
            break;
        default:
            break;
    }
})

$(document).on('mouseup', (e) => {

    if (!_dwned) return;

    _dwned = false;

    if (head() === Tool.Dragdrop) {

        var ms = getMousePos(e);
        ms.x = Math.trunc(ms.x / width);
        ms.y = Math.trunc(ms.y / height);

        sels(_drgdown);
        MoveSelected(new Point(ms.x - _seldown.x + _drgdown.x, ms.y - _seldown.y + _drgdown.y));
        if (_headback == Tool.Select) {
            head(Tool.Select);
            showcursor('default');
        }
    }
});

$(canvas).on('keydown', (e) => {
    var h = head();
    if (e.keyCode == Key.Delete && h !== Tool.Freetype) {
        clearSelected();
        e.preventDefault();
        return;
    }
    if (e.ctrlKey) {
        switch (e.keyCode) {
            case Key.A:
                sels(new Rect(0, 0, size.x, size.y));
                break;
            case Key.V:
                Paste(Clipboard.GetText(TextDataFormat.UnicodeText), e.Shift);
                break;
            case Key.C:
                Clipboard.SetText(Copy(), TextDataFormat.UnicodeText);
                break;
            case Key.Z:
                Undo();
                break;
            default:
                return;
        }
        e.preventDefault();
        return true;
    }

    {
        if (h === Tool.Select) {
            head(h = Tool.Freetype);
            _headback = Tool.Select;
            curs(selection.location());
            showcursor('text');
            RecordUndo();
        }

        if (h >= Tool.Brush) {
            if (e.key.length >= 1) {
                pals(e.key);
                e.preventDefault();
            }
        }
        else if (h == Tool.Freetype) {
            switch (e.keyCode) {
                case Key.Enter:
                    if (_headback === Tool.Select) {
                        if (isCursorFree()) {
                            gotoDown();
                            selection = new Rect(selection.x, cursor.y, 1, 1);
                            head(Tool.Select);
                        } else if (cursor.y === selection.b - 1)
                            head(Tool.Select);
                        else
                            gotoNextLine();
                    } else
                        gotoNextLine();
                    break;
                case Key.Backspace:
                    Backspace(e.shiftKey);
                    break;
                case Key.Delete:
                    Delete(!e.shiftKey);
                    break;
                case Key.Insert:
                    Insert(e.shiftKey);
                    break;
                case Key.Up:
                    gotoUp();
                    break;
                case Key.Down:
                    gotoDown();
                    break;
                case Key.Right:
                    gotoRight();
                    break;
                case Key.Left:
                    gotoLeft();
                    break;
                default:
                    if (e.key.length === 1)
                        append(e.key);
                    else
                        return;
                    break;
            }
            e.preventDefault();
        }
    }
})

//$(document).on('ready', () => {
// load from cookie
var state = localStorage.getItem(thisname);
if (state) {
    RecordUndo();
    var x = JSON.parse(state);
    // get with it data
    ApplyState(new CanvasState(x.data,
        new Rect(x.area.x, x.area.y, x.area.w, x.area.h),
        new Rect(x.selection.x, x.selection.y, x.selection.w, x.selection.h)));
}
//});

$(window).bind('beforeunload', () => {
    // save to cookie
    RecordUndo();
})