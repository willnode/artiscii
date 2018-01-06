var heads = ["Select", "Freetype", "Dragdrop", "Brush", "Line", "Arrow", "Rectangle", "Circle"]

var Tool = Object.freeze({
    "Select": 0, "Freetype": 1, "Dragdrop": 2, "Brush": 3, "Line": 4, "Arrow": 5, "Rectangle": 6, "Circle": 7
})

var _hdd = $("#heads");

for (var i = 0; i < heads.length; i++) {
    _hdd.append("<input type='radio' name='tool' id='" + heads[i] + "' " + (i == 0 ? 'checked' : '') + ">");
    _hdd.append("<label for='" + heads[i] + "'>" + heads[i] + "</label>");
}

var head = function (val) {
    if (val !== undefined) {
        $("#" + heads[val]).prop("checked", true);
        curs('default');
    }
    else
        return heads.indexOf($("input[name='tool']:checked").get(0).id);
}

