var canvas = $('#canvas').get(0);

var height, width, font, _headback, _seldown, _drgdown, _drwshot, _freeze;

var ctx = canvas.getContext('2d');

ctx.textBaseline = "top";

var size = new Point(30, 20), selection = new Rect(0, 0, 1, 1), cursor = new Point(0, 0);

var data = fill(''), undostack = [];

resizeFont(11);

$('#resize-ok').on('click', () => {
    resizeCell({ x: ~~$('#resize-x').val(), y: ~~$('#resize-y').val() })
})

$('#canvas').on('mousedown', (e) => {

    if (e.button != 0) return;

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
        sels(new Rect(_seldown.X / width, _seldown.Y / height, 1, 1));

}).on('mousemove', (e) => {

}).on('mouseup', (e) => {

});