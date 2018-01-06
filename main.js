var canvas = $('#canvas').get(0);

var height, width, font, _headback, _seldown, _drgdown, _drwshot, _dwned, _freeze;

var ctx = canvas.getContext('2d');

ctx.textBaseline = "top";

var size = new Point(100, 30), selection = new Rect(0, 0, 1, 1), cursor = new Point(0, 0);

var data = fill(''), undostack = [], palette = '';

resizeFont(11);

$('#resize-ok').on('click', () => {
    resizeCell({ x: ~~$('#resize-x').val(), y: ~~$('#resize-y').val() })
})

$(canvas).on('mousedown', (e) => {

    if (e.which !== 1) return;

    var ms = getMousePos(e);

    var h = head();

    _seldown = new Rect(Math.floor(ms.x / width) * width, Math.floor(ms.y / height) * height);

    if (h === Tool.Line || h === Tool.Rectangle || h === Tool.Circle)
        _drwshot = data;
    else if (h === Tool.Dragdrop || e.ctrlKey) {
        head(Tool.Dragdrop);
        _headback = Tool.Select;
        _drgdown = selection.clone();
        showcursor("move");
    } else
        sels(new Rect(_seldown.x / width, _seldown.y / height, 1, 1));

    _dwned = true;
})

$(document).on('mousemove', (e) => {

    if (!_dwned) return;

    var ms = getMousePos(e);

    switch (head()) {
        case Tool.Select:
            sels(flexible(new Rect(_seldown.x / width, _seldown.y / height,
                (ms.x - _seldown.x) / width, (ms.y - _seldown.y) / height)));
            break;
        case Tool.Freetype:
            break;
        case Tool.Dragdrop:
            sels(new Point((ms.x - _seldown.x + _drgdown.x * width) / width,
                (ms.y - _seldown.y + _drgdown.y * height) / height))
            break;
        case Tool.Brush:
            sels(new Rect(ms.x / width, ms.y / height, 1, 1));
            charat(selection.location(), palette == '\0' ? ' ' : palette);
            break;
        case Tool.Line:
        case Tool.Rectangle:
        case Tool.Circle:
            sels(flexible(new Rect(_seldown.x, _seldown.y,
                (ms.x / width - _seldown.x), (ms.y / height - _seldown.y))));

            _freeze = true;
            data = _drwshot;
            switch (head()) {
                case Tool.Line:
                    drawLine(new Point(ms.x / width, ms.y / height), _seldown);
                    break;
                case Tool.Rectangle:
                    drawRectangle(new Point(ms.x / width, ms.y / height), _seldown);
                    break;
                case Tool.Circle:
                    drawEllipse(new Point(ms.x / width, ms.y / height), _seldown);
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

    var ms = getMousePos(e);

    if (head() === Tool.Dragdrop) {
        sels(new Point((ms.x - _seldown.x + _drgdown.x * width) / width,
            (ms.y - _seldown.y + _drgdown.y * height) / height));
        MoveSelected(new Point((ms.x - _seldown.x + _drgdown.x * width) / width, (ms.y - _seldown.y + _drgdown.y * height) / height));
        if (_headback == Tool.Select) {
            head(Tool.Select);
            showcursor('default');
        }
    }
});

$('#canvas-bucket').on('keydown', (e) => {
    if (e.keyCode == Key.Delete && head() !== Tool.Freetype) {
        ClearSelected();
    }
    if (e.ctrlKey) {
        switch (e.KeyCode) {
            case Key.A:
                sels(new Rectangle(0, 0, size.x, size.y));
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
        return false;
    }

    if (!e.altKey) {
        if (head() === Tool.Select) {
            if (e.key.Length >= 1) {
                head(Tool.Freetype);
                _headback = Tool.Select;
                showcursor('text');
                RecordUndo();
            }
        }

        if (head() == Tool.Freetype) {
            switch (e.KeyCode) {
                case Key.Enter:
                    if (ToolFallback == Tool.Select && e.Modifiers == Key.None) {
                        Tool = Tool.Select;
                        Cursor = Cursors.Default;
                    }
                    else
                        GoToNextLine();
                    break;
                case Key.Back:
                    Backspace(e.shiftKey);
                    break;
                case Key.Delete:
                    Delete(!e.shiftKey);
                    break;
                case Key.Insert:
                    Insert(e.shiftKey);
                    break;
                case Key.Up:
                    GoToUp();
                    break;
                case Key.Down:
                    GoToDown();
                    break;
                case Key.Right:
                    GoToRight();
                    break;
                case Key.Left:
                    GoToLeft();
                    break;
                default:
                    if (s.Length >= 1)
                        Append(e.key);
                    break;
            }
            e.preventDefault();
        }
    }
})