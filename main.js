var canvas = $('#canvas').get(0);

var height, width, font, _headback, _seldown, _drgdown, _drwshot, _freeze;

var ctx = canvas.getContext('2d');

ctx.textBaseline = "top";

var size = { x: 30, y: 20 }

var selection = { x: 0, y: 0, w: 1, h: 1 }

var data = fill('');

resizeFont(11);

$('#resize-ok').on('click', () => {
    resizeCell({ x: ~~$('#resize-x').val(), y: ~~$('#resize-y').val() })
})

$('#canvas').on('mousedown', (e) => {

    if (e.button != 0) return;

    var ms = getMousePos(e);

    var h = head();

    _seldown = { x: Math.floor(ms.x / width) * width, y: Math.floor(ms.y / height) * height };

    if (h === Tool.Dragdrop)
        _drgdown = { x: selection.x, y: selection.y };
    else if (h === Tool.Line || h === Tool.Rectangle || h === Tool.Circle)
        _drwshot = text();
    else if (e.ctrlKey) {
        head(Tool.Dragdrop);
        _headback = Tool.Select;
        cursor("sizeall");
    } else
        sels({ x: _seldown.X / width, y: _seldown.Y / height, w: 1, h: 1 });

}).on('mousemove', (e) => {

}).on('mouseup', (e) => {

});