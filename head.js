var heads = ["Select", "Freetype", "Dragdrop", "Brush", "Line", "Arrow", "Rectangle", "Circle"]

var Tool = Object.freeze({
    "Select":0, "Freetype":1, "Dragdrop":2, "Brush":3, "Line":4, "Arrow":5, "Rectangle":6, "Circle":7
})

for(var i = 0; i<heads.length;i++) {
    document.write("<input type='radio' name='tool' id='", heads[i], "'>");
    document.write("<label for='", heads[i], "'>", heads[i], "</label>");
}

var head = function (val) {
    if (val !== undefined)
        $("#" + heads[val]).prop("checked", true);
    else
        return heads.indexOf($("input[name='tool']:checked").get(0).id);
}

