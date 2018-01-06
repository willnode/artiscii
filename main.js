var canvas = $('#canvas').get(0);

var height, width, font, _headback, _seldown, _drgdown, _drwshot, _freeze;

var ctx = canvas.getContext('2d');

ctx.textBaseline = "top";

var size = new Point(30, 20), selection = new Rect(0, 0, 1, 1), cursor = new Point(0, 0);

var data = fill(''), undostack = [], palette = '';

resizeFont(11);

$('#resize-ok').on('click', () => {
    resizeCell({ x: ~~$('#resize-x').val(), y: ~~$('#resize-y').val() })
})

$('#canvas').on('mousedown', (e) => {

    if (e.which !== 1) return;

    var ms = getMousePos(e);

    var h = head();

    _seldown = new Rect(Math.floor(ms.x / width) * width, Math.floor(ms.y / height) * height);

    if (h === Tool.Dragdrop)
        _drgdown = selection.clone();
    else if (h === Tool.Line || h === Tool.Rectangle || h === Tool.Circle)
        _drwshot = text();
    else if (e.ctrlKey) {
        head(Tool.Dragdrop);
        _headback = Tool.Select;
        showcursor("sizeall");
    } else
        sels(new Rect(_seldown.x / width, _seldown.y / height, 1, 1));

}).on('mousemove', (e) => {

    if (e.which !== 1) return;

    var ms = getMousePos(e);

    switch (head())
    {
        case Tool.Select:
            Selection = flexible(new Rect(_seldown.x / width, _seldown.y / height,
                (ms.x - _seldown.x) / width, (ms.y - _seldown.y) / height));
            break;
        case Tool.Freetype:
            break;
        case Tool.Dragdrop:
            var sel = Selection;
            sel.Location = new Point((ms.x - _seldown.x + _drgdown.x * width) / width, (ms.y - _seldown.y + _drgdown.y * height) / height);
            Selection = sel;
            break;
        case Tool.Brush:
            Selection = new Rect(ms.x / width, ms.y / height, 1, 1);
            CharacterAt(Selection.Location, palette == '\0' ? ' ' : palette);
            break;
        case Tool.Line:
        case Tool.Rectangle:
        case Tool.Circle:
            Selection = Flexible(new Rect(_seldown.x, _seldown.y,
                    (ms.x / width - _seldown.x), (ms.y / height - _seldown.y)));
            Array.Copy(_drwshot, characters, characters.Length);
            switch (head())
            {
                case Tool.Line:
                    DrawLine(new Point(ms.x / width, ms.y / height), _seldown);
                    break;
                case Tool.Rectangle:
                    DrawRectangle(new Point(ms.x / width, ms.y / height), _seldown);
                    break;
                case Tool.Circle:
                    DrawEllipse(new Point(ms.x / width, ms.y / height), _seldown);
                    break;
                default:
                    break;
            }
            break;
        default:
            break;
    }
})

$(document).on('mouseup', (e) => {

    if (e.which !== 1) return;

    var ms = getMousePos(e);

    if (head() === Tool.Dragdrop) {
        _selection.Location = _drgdown;
        MoveSelected(new Point((ms.x - _seldown.x + _drgdown.x * width) / width, (ms.y - _seldown.y + _drgdown.y * height) / height));
        if (_headback == Tool.Select)
        {
            head(Tool.Select);
            showcursor('default');
        }
    }
});