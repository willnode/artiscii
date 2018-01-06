var Point = function (x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype.clone = function () {
    return new Point(this.x, this.y);
}

Point.prototype.equals = function (obj) {
    return this.x === obj.x && this.y === obj.y
}

Point.prototype.trunc = function () {
    this.x = Math.trunc(this.x);
    this.y = Math.trunc(this.y);
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

Rect.prototype.equals = function (obj) {
    return this.x === obj.x && this.y === obj.y && this.w === obj.w && this.h === obj.h;
}

Rect.prototype.isContaining = function (point) {
    return this.x >= point.x && point.x <= this.r && this.y >= point.y && point.y <= this.b;
}

Rect.prototype.trunc = function () {
    this.x = Math.trunc(this.x);
    this.y = Math.trunc(this.y);
    this.w = Math.trunc(this.w);
    this.h = Math.trunc(this.h);
    this.r = this.x + this.w;
    this.b = this.y + this.h;
}


function CanvasState(data, area, selection) {
    this.data = data;
    this.area = area;
    this.selection = selection;
    this.equals = function (other) {
        return other.data === this.data &&
            other.area === this.area &&
            other.selection === this.selection;
    }
}

var Key = Object.freeze({
    Backspace: 8,
    Tab: 9,
    Enter: 13,
    Shift: 16,
    Ctrl: 17,
    Alt: 18,
    Pause: 19,
    Caps_Lock: 20,
    Escape: 27,
    Space: 32,
    Page_Up: 33,
    Page_Down: 34,
    End: 35,
    Home: 36,
    Left: 37,
    Up: 38,
    Right: 39,
    Down: 40,
    Insert: 45,
    Delete: 46,
    Alpha0: 48,
    Alpha1: 49,
    Alpha2: 50,
    Alpha3: 51,
    Alpha4: 52,
    Alpha5: 53,
    Alpha6: 54,
    Alpha7: 55,
    Alpha8: 56,
    Alpha9: 57,
    A: 65,
    B: 66,
    C: 67,
    D: 68,
    E: 69,
    F: 70,
    G: 71,
    H: 72,
    I: 73,
    J: 74,
    K: 75,
    L: 76,
    M: 77,
    N: 78,
    O: 79,
    P: 80,
    Q: 81,
    R: 82,
    S: 83,
    T: 84,
    U: 85,
    V: 86,
    W: 87,
    X: 88,
    Y: 89,
    Z: 90,
    Left_Meta: 91,
    Right_Meta: 92,
    Select: 93,
    Numpad_0: 96,
    Numpad_1: 97,
    Numpad_2: 98,
    Numpad_3: 99,
    Numpad_4: 100,
    Numpad_5: 101,
    Numpad_6: 102,
    Numpad_7: 103,
    Numpad_8: 104,
    Numpad_9: 105,
    Multiply: 106,
    Add: 107,
    Subtract: 109,
    Decimal: 110,
    Divide: 111,
    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123,
    Num_Lock: 144,
    Scroll_Lock: 145,
    Semicolon: 186,
    Equals: 187,
    Comma: 188,
    Dash: 189,
    Period: 190,
    Forward_Slash: 191,
    Grave_Accent: 192,
    Open_Bracket: 219,
    Back_Slash: 220,
    Close_Bracket: 221,
    Single_Quote: 222
});