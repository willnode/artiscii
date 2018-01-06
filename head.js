var heads = ["Select", "Freetype", "Dragdrop", "Brush", "Line", "Rectangle", "Circle"]

var Tool = Object.freeze({
    "Select": 0, "Freetype": 1, "Dragdrop": 2, "Brush": 3, "Line": 4, "Rectangle": 5, "Circle": 6
})

var _hdd = $("#heads");

for (var i = 0; i < heads.length; i++) {
    _hdd.append("<input type='radio' name='tool' id='" + heads[i] + "' " + (i == 0 ? 'checked' : '') + ">");
    _hdd.append("<label for='" + heads[i] + "'>" + heads[i] + "</label>");
}

$('input[name=tool]').on('click', () => head(head()));

var head = function (val) {
    if (val !== undefined) {
        $("#" + heads[val]).prop("checked", true);
        showcursor('default');
        {
            var x = window.scrollX, y = window.scrollY;
            canvas.focus();
            window.scrollTo(x, y);
        }
        _headback = undefined;
        RecordUndo();
        redraw();
    }
    else
        return heads.indexOf($("input[name='tool']:checked").get(0).id);
}

