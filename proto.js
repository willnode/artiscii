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


function CanvasState(data, area, selection) {
    this.data = data;
    this.area = area;
    this.selection = selection;
    this.equals = function (obj) {
        return other.data === this.data &&
            other.area === this.area &&
            other.selection === this.selection;
    }
}
