﻿//
var cr = {};
cr.plugins_ = {};
cr.behaviors = {};
if (typeof Object.getPrototypeOf !== "function")
{
    if (typeof "test".__proto__ === "object")
    {
        Object.getPrototypeOf = function(object) {
            return object.__proto__;
        };
    }
    else
    {
        Object.getPrototypeOf = function(object) {
            return object.constructor.prototype;
        };
    }
}
(function(){
    cr.logexport = function (msg)
    {
        if (console && console.log)
            console.log(msg);
    };
    cr.seal = function(x)
    {
        return x;
    };
    cr.freeze = function(x)
    {
        return x;
    };
    cr.is_undefined = function (x)
    {
        return typeof x === "undefined";
    };
    cr.is_number = function (x)
    {
        return typeof x === "number";
    };
    cr.is_string = function (x)
    {
        return typeof x === "string";
    };
    cr.isPOT = function (x)
    {
        return x > 0 && ((x - 1) & x) === 0;
    };
    cr.abs = function (x)
    {
        return (x < 0 ? -x : x);
    };
    cr.max = function (a, b)
    {
        return (a > b ? a : b);
    };
    cr.min = function (a, b)
    {
        return (a < b ? a : b);
    };
    cr.PI = Math.PI;
    cr.round = function (x)
    {
        return (x + 0.5) | 0;
    };
    cr.floor = function (x)
    {
        return x | 0;
    };
    function Vector2(x, y)
    {
        this.x = x;
        this.y = y;
        cr.seal(this);
    };
    Vector2.prototype.offset = function (px, py)
    {
        this.x += px;
        this.y += py;
        return this;
    };
    Vector2.prototype.mul = function (px, py)
    {
        this.x *= px;
        this.y *= py;
        return this;
    };
    cr.vector2 = Vector2;
    cr.segments_intersect = function(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y)
    {
        if (cr.max(a1x, a2x) < cr.min(b1x, b2x)
         || cr.min(a1x, a2x) > cr.max(b1x, b2x)
         || cr.max(a1y, a2y) < cr.min(b1y, b2y)
         || cr.min(a1y, a2y) > cr.max(b1y, b2y))
        {
            return false;
        }
        var dpx = b1x - a1x + b2x - a2x;
        var dpy = b1y - a1y + b2y - a2y;
        var qax = a2x - a1x;
        var qay = a2y - a1y;
        var qbx = b2x - b1x;
        var qby = b2y - b1y;
        var d = cr.abs(qay * qbx - qby * qax);
        var la = qbx * dpy - qby * dpx;
        var lb = qax * dpy - qay * dpx;
        return cr.abs(la) <= d && cr.abs(lb) <= d;
    };
    function Rect(left, top, right, bottom)
    {
        this.set(left, top, right, bottom);
        cr.seal(this);
    };
    Rect.prototype.set = function (left, top, right, bottom)
    {
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
    };
    Rect.prototype.width = function ()
    {
        return this.right - this.left;
    };
    Rect.prototype.height = function ()
    {
        return this.bottom - this.top;
    };
    Rect.prototype.offset = function (px, py)
    {
        this.left += px;
        this.top += py;
        this.right += px;
        this.bottom += py;
        return this;
    };
    Rect.prototype.intersects_rect = function (rc)
    {
        return !(rc.right < this.left || rc.bottom < this.top || rc.left > this.right || rc.top > this.bottom);
    };
    Rect.prototype.contains_pt = function (x, y)
    {
        return (x >= this.left && x <= this.right) && (y >= this.top && y <= this.bottom);
    };
    cr.rect = Rect;
    function Quad()
    {
        this.tlx = 0;
        this.tly = 0;
        this.trx = 0;
        this.try_ = 0;  // is a keyword otherwise!
        this.brx = 0;
        this.bry = 0;
        this.blx = 0;
        this.bly = 0;
        cr.seal(this);
    };
    Quad.prototype.set_from_rect = function (rc)
    {
        this.tlx = rc.left;
        this.tly = rc.top;
        this.trx = rc.right;
        this.try_ = rc.top;
        this.brx = rc.right;
        this.bry = rc.bottom;
        this.blx = rc.left;
        this.bly = rc.bottom;
    };
    Quad.prototype.set_from_rotated_rect = function (rc, a)
    {
        if (a === 0)
        {
            this.set_from_rect(rc);
        }
        else
        {
            var sin_a = Math.sin(a);
            var cos_a = Math.cos(a);
            var left_sin_a = rc.left * sin_a;
            var top_sin_a = rc.top * sin_a;
            var right_sin_a = rc.right * sin_a;
            var bottom_sin_a = rc.bottom * sin_a;
            var left_cos_a = rc.left * cos_a;
            var top_cos_a = rc.top * cos_a;
            var right_cos_a = rc.right * cos_a;
            var bottom_cos_a = rc.bottom * cos_a;
            this.tlx = left_cos_a - top_sin_a;
            this.tly = top_cos_a + left_sin_a;
            this.trx = right_cos_a - top_sin_a;
            this.try_ = top_cos_a + right_sin_a;
            this.brx = right_cos_a - bottom_sin_a;
            this.bry = bottom_cos_a + right_sin_a;
            this.blx = left_cos_a - bottom_sin_a;
            this.bly = bottom_cos_a + left_sin_a;
        }
    };
    Quad.prototype.offset = function (px, py)
    {
        this.tlx += px;
        this.tly += py;
        this.trx += px;
        this.try_ += py;
        this.brx += px;
        this.bry += py;
        this.blx += px;
        this.bly += py;
        return this;
    };
    Quad.prototype.bounding_box = function (rc)
    {
        rc.left =   cr.min(cr.min(this.tlx, this.trx),  cr.min(this.brx, this.blx));
        rc.top =    cr.min(cr.min(this.tly, this.try_), cr.min(this.bry, this.bly));
        rc.right =  cr.max(cr.max(this.tlx, this.trx),  cr.max(this.brx, this.blx));
        rc.bottom = cr.max(cr.max(this.tly, this.try_), cr.max(this.bry, this.bly));
    };
    Quad.prototype.contains_pt = function (x, y)
    {
        var v0x = this.trx - this.tlx;
        var v0y = this.try_ - this.tly;
        var v1x = this.brx - this.tlx;
        var v1y = this.bry - this.tly;
        var v2x = x - this.tlx;
        var v2y = y - this.tly;
        var dot00 = v0x * v0x + v0y * v0y
        var dot01 = v0x * v1x + v0y * v1y
        var dot02 = v0x * v2x + v0y * v2y
        var dot11 = v1x * v1x + v1y * v1y
        var dot12 = v1x * v2x + v1y * v2y
        var invDenom = 1.0 / (dot00 * dot11 - dot01 * dot01);
        var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
        var v = (dot00 * dot12 - dot01 * dot02) * invDenom;
        if ((u >= 0.0) && (v > 0.0) && (u + v < 1))
            return true;
        v0x = this.blx - this.tlx;
        v0y = this.bly - this.tly;
        var dot00 = v0x * v0x + v0y * v0y
        var dot01 = v0x * v1x + v0y * v1y
        var dot02 = v0x * v2x + v0y * v2y
        invDenom = 1.0 / (dot00 * dot11 - dot01 * dot01);
        u = (dot11 * dot02 - dot01 * dot12) * invDenom;
        v = (dot00 * dot12 - dot01 * dot02) * invDenom;
        return (u >= 0.0) && (v > 0.0) && (u + v < 1);
    };
    Quad.prototype.at = function (i, xory)
    {
        i = i % 4;
        if (i < 0)
            i += 4;
        switch (i)
        {
            case 0: return xory ? this.tlx : this.tly;
            case 1: return xory ? this.trx : this.try_;
            case 2: return xory ? this.brx : this.bry;
            case 3: return xory ? this.blx : this.bly;
            default: return xory ? this.tlx : this.tly;
        }
    };
    Quad.prototype.midX = function ()
    {
        return (this.tlx + this.trx  + this.brx + this.blx) / 4;
    };
    Quad.prototype.midY = function ()
    {
        return (this.tly + this.try_ + this.bry + this.bly) / 4;
    };
    Quad.prototype.intersects_quad = function (rhs)
    {
        var midx = rhs.midX();
        var midy = rhs.midY();
        if (this.contains_pt(midx, midy))
            return true;
        midx = this.midX();
        midy = this.midY();
        if (rhs.contains_pt(midx, midy))
            return true;
        var a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y;
        var i, j;
        for (i = 0; i < 4; i++)
        {
            for (j = 0; j < 4; j++)
            {
                a1x = this.at(i, true);
                a1y = this.at(i, false);
                a2x = this.at(i + 1, true);
                a2y = this.at(i + 1, false);
                b1x = rhs.at(j, true);
                b1y = rhs.at(j, false);
                b2x = rhs.at(j + 1, true);
                b2y = rhs.at(j + 1, false);
                if (cr.segments_intersect(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y))
                    return true;
            }
        }
        return false;
    };
    cr.quad = Quad;
    cr.RGB = function (red, green, blue)
    {
        return Math.max(Math.min(red, 255), 0)
             | (Math.max(Math.min(green, 255), 0) << 8)
             | (Math.max(Math.min(blue, 255), 0) << 16);
    };
    cr.GetRValue = function (rgb)
    {
        return rgb & 0xFF;
    };
    cr.GetGValue = function (rgb)
    {
        return (rgb & 0xFF00) >> 8;
    };
    cr.GetBValue = function (rgb)
    {
        return (rgb & 0xFF0000) >> 16;
    };
    cr.shallowCopy = function (a, b, allowOverwrite)
    {
        var attr;
        for (attr in b)
        {
            if (b.hasOwnProperty(attr))
            {
;
                a[attr] = b[attr];
            }
        }
        return a;
    };
    cr.arrayRemove = function (arr, index)
    {
        var i, len;
        index = cr.floor(index);
        if (index < 0 || index >= arr.length)
            return;                         // index out of bounds
        if (index === 0)                    // removing first item
            arr.shift();
        else if (index === arr.length - 1)  // removing last item
            arr.pop();
        else
        {
            for (i = index, len = arr.length - 1; i < len; i++)
                arr[i] = arr[i + 1];
            arr.length = len;
        }
    };
    cr.shallowAssignArray = function(dest, src)
    {
        dest.length = src.length;
        var i, len;
        for (i = 0, len = src.length; i < len; i++)
            dest[i] = src[i];
    };
    cr.arrayFindRemove = function (arr, item)
    {
        var index = arr.indexOf(item);
        if (index !== -1)
            cr.arrayRemove(arr, index);
    };
    cr.clamp = function(x, a, b)
    {
        if (x < a)
            return a;
        else if (x > b)
            return b;
        else
            return x;
    };
    cr.to_radians = function(x)
    {
        return x / (180.0 / cr.PI);
    };
    cr.to_degrees = function(x)
    {
        return x * (180.0 / cr.PI);
    };
    cr.clamp_angle_degrees = function (a)
    {
        a %= 360;       // now in (-360, 360) range
        if (a < 0)
            a += 360;   // now in [0, 360) range
        return a;
    };
    cr.clamp_angle = function (a)
    {
        a %= 2 * cr.PI;       // now in (-2pi, 2pi) range
        if (a < 0)
            a += 2 * cr.PI;   // now in [0, 2pi) range
        return a;
    };
    cr.to_clamped_degrees = function (x)
    {
        return cr.clamp_angle_degrees(cr.to_degrees(x));
    };
    cr.to_clamped_radians = function (x)
    {
        return cr.clamp_angle(cr.to_radians(x));
    };
    cr.angleTo = function(x1, y1, x2, y2)
    {
        var dx = x2 - x1;
        var dy = y2 - y1;
        return Math.atan2(dy, dx);
    };
    cr.angleDiff = function (a1, a2)
    {
        if (a1 === a2)
            return 0;
        var s1 = Math.sin(a1);
        var c1 = Math.cos(a1);
        var s2 = Math.sin(a2);
        var c2 = Math.cos(a2);
        var n = s1 * s2 + c1 * c2;
        if (n >= 1)
            return 0;
        if (n <= -1)
            return cr.PI;
        return Math.acos(n);
    };
    cr.angleRotate = function (start, end, step)
    {
        var ss = Math.sin(start);
        var cs = Math.cos(start);
        var se = Math.sin(end);
        var ce = Math.cos(end);
        if (Math.acos(ss * se + cs * ce) > step)
        {
            if (cs * se - ss * ce > 0)
                return cr.clamp_angle(start + step);
            else
                return cr.clamp_angle(start - step);
        }
        else
            return cr.clamp_angle(end);
    };
    cr.angleClockwise = function (a1, a2)
    {
        var s1 = Math.sin(a1);
        var c1 = Math.cos(a1);
        var s2 = Math.sin(a2);
        var c2 = Math.cos(a2);
        return c1 * s2 - s1 * c2 <= 0;
    };
    cr.distanceTo = function(x1, y1, x2, y2)
    {
        var dx = x2 - x1;
        var dy = y2 - y1;
        return Math.sqrt(dx*dx + dy*dy);
    };
    cr.xor = function (x, y)
    {
        return !x !== !y;
    };
    cr.lerp = function (a, b, x)
    {
        return a + (b - a) * x;
    };
    cr.wipe = function (obj)
    {
        var p;
        for (p in obj)
        {
            if (obj.hasOwnProperty(p))
                delete obj[p];
        }
    };
    cr.performance_now = function()
    {
        if (typeof window["performance"] !== "undefined")
        {
            var winperf = window["performance"];
            if (typeof winperf.now !== "undefined")
                return winperf.now();
            else if (typeof winperf["webkitNow"] !== "undefined")
                return winperf["webkitNow"]();
            else if (typeof winperf["msNow"] !== "undefined")
                return winperf["msNow"]();
        }
        return Date.now();
    };
    function ObjectSet_()
    {
        this.items = {};
        this.item_count = 0;
        this.values_cache = [];
        this.cache_valid = true;
        cr.seal(this);
    };
    ObjectSet_.prototype.contains = function (x)
    {
        return this.items.hasOwnProperty(x.toString());
    };
    ObjectSet_.prototype.add = function (x)
    {
        if (!this.contains(x))
        {
            this.items[x.toString()] = x;
            this.item_count++;
            this.cache_valid = false;
        }
        return this;
    };
    ObjectSet_.prototype.remove = function (x)
    {
        if (this.contains(x))
        {
            delete this.items[x.toString()];
            this.item_count--;
            this.cache_valid = false;
        }
        return this;
    };
    ObjectSet_.prototype.clear = function ()
    {
        cr.wipe(this.items);
        this.item_count = 0;
        this.values_cache.length = 0;
        this.cache_valid = true;
        return this;
    };
    ObjectSet_.prototype.isEmpty = function ()
    {
        return this.item_count === 0;
    };
    ObjectSet_.prototype.count = function ()
    {
        return this.item_count;
    };
    ObjectSet_.prototype.update_cache = function ()
    {
        if (this.cache_valid)
            return;
        this.values_cache.length = this.item_count;
        var p, n = 0;
        for (p in this.items)
        {
            if (this.items.hasOwnProperty(p))
                this.values_cache[n++] = this.items[p];
        }
;
        this.cache_valid = true;
    };
    ObjectSet_.prototype.values = function ()
    {
        this.update_cache();
        return this.values_cache.slice(0);
    };
    ObjectSet_.prototype.valuesRef = function ()
    {
        this.update_cache();
        return this.values_cache;
    };
    cr.ObjectSet = ObjectSet_;
    function KahanAdder_()
    {
        this.c = 0;
        this.y = 0;
        this.t = 0;
        this.sum = 0;
        cr.seal(this);
    };
    KahanAdder_.prototype.add = function (v)
    {
        this.y = v - this.c;
        this.t = this.sum + this.y;
        this.c = (this.t - this.sum) - this.y;
        this.sum = this.t;
    };
    KahanAdder_.prototype.reset = function ()
    {
        this.c = 0;
        this.y = 0;
        this.t = 0;
        this.sum = 0;
    };
    cr.KahanAdder = KahanAdder_;
    cr.regexp_escape = function(text)
    {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };
    function CollisionPoly_(pts_array_)
    {
        this.pts_cache = [];
        this.set_pts(pts_array_);
        cr.seal(this);
    };
    CollisionPoly_.prototype.set_pts = function(pts_array_)
    {
        this.pts_array = pts_array_;
        this.pts_count = pts_array_.length / 2;         // x, y, x, y... in array
        this.pts_cache.length = pts_array_.length;
        this.cache_width = -1;
        this.cache_height = -1;
        this.cache_angle = 0;
    };
    CollisionPoly_.prototype.is_empty = function()
    {
        return !this.pts_array.length;
    };
    CollisionPoly_.prototype.set_from_quad = function(q, offx, offy, w, h)
    {
        this.pts_cache.length = 8;
        this.pts_count = 4;
        var myptscache = this.pts_cache;
        myptscache[0] = q.tlx - offx;
        myptscache[1] = q.tly - offy;
        myptscache[2] = q.trx - offx;
        myptscache[3] = q.try_ - offy;
        myptscache[4] = q.brx - offx;
        myptscache[5] = q.bry - offy;
        myptscache[6] = q.blx - offx;
        myptscache[7] = q.bly - offy;
        this.cache_width = w;
        this.cache_height = h;
    };
    CollisionPoly_.prototype.set_from_poly = function (r)
    {
        this.pts_count = r.pts_count;
        cr.shallowAssignArray(this.pts_cache, r.pts_cache);
    };
    CollisionPoly_.prototype.cache_poly = function(w, h, a)
    {
        if (this.cache_width === w && this.cache_height === h && this.cache_angle === a)
            return;     // cache up-to-date
        this.cache_width = w;
        this.cache_height = h;
        this.cache_angle = a;
        var i, len, x, y;
        var sina = 0;
        var cosa = 1;
        var myptsarray = this.pts_array;
        var myptscache = this.pts_cache;
        if (a !== 0)
        {
            sina = Math.sin(a);
            cosa = Math.cos(a);
        }
        for (i = 0, len = this.pts_count; i < len; i++)
        {
            x = myptsarray[i*2] * w;
            y = myptsarray[i*2+1] * h;
            myptscache[i*2] = (x * cosa) - (y * sina);
            myptscache[i*2+1] = (y * cosa) + (x * sina);
        }
    };
    CollisionPoly_.prototype.contains_pt = function (a2x, a2y)
    {
        var myptscache = this.pts_cache;
        if (a2x === myptscache[0] && a2y === myptscache[1])
            return true;
        var a1x = -this.cache_width * 5 - 1;
        var a1y = -this.cache_height * 5 - 1;
        var a3x = this.cache_width * 5 + 1;
        var a3y = -1;
        var b1x, b1y, b2x, b2y;
        var i, len;
        var count1 = 0, count2 = 0;
        for (i = 0, len = this.pts_count; i < len; i++)
        {
            b1x = myptscache[i*2];
            b1y = myptscache[i*2+1];
            b2x = myptscache[((i+1)%len)*2];
            b2y = myptscache[((i+1)%len)*2+1];
            if (cr.segments_intersect(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y))
                count1++;
            if (cr.segments_intersect(a3x, a3y, a2x, a2y, b1x, b1y, b2x, b2y))
                count2++;
        }
        return (count1 % 2 === 1) || (count2 % 2 === 1);
    };
    CollisionPoly_.prototype.intersects_poly = function (rhs, offx, offy)
    {
        var rhspts = rhs.pts_cache;
        var mypts = this.pts_cache;
        if (this.contains_pt(rhspts[0] + offx, rhspts[1] + offy))
            return true;
        if (rhs.contains_pt(mypts[0] - offx, mypts[1] - offy))
            return true;
        var i, leni, j, lenj;
        var a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y;
        for (i = 0, leni = this.pts_count; i < leni; i++)
        {
            a1x = mypts[i*2];
            a1y = mypts[i*2+1];
            a2x = mypts[((i+1)%leni)*2];
            a2y = mypts[((i+1)%leni)*2+1];
            for (j = 0, lenj = rhs.pts_count; j < lenj; j++)
            {
                b1x = rhspts[j*2] + offx;
                b1y = rhspts[j*2+1] + offy;
                b2x = rhspts[((j+1)%lenj)*2] + offx;
                b2y = rhspts[((j+1)%lenj)*2+1] + offy;
                if (cr.segments_intersect(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y))
                    return true;
            }
        }
        return false;
    };
    cr.CollisionPoly = CollisionPoly_;
    var fxNames = [ "lighter",
                    "xor",
                    "copy",
                    "destination-over",
                    "source-in",
                    "destination-in",
                    "source-out",
                    "destination-out",
                    "source-atop",
                    "destination-atop"];
    cr.effectToCompositeOp = function(effect)
    {
        if (effect <= 0 || effect >= 11)
            return "source-over";
        return fxNames[effect - 1]; // not including "none" so offset by 1
    };
    cr.setGLBlend = function(this_, effect, gl)
    {
        if (!gl)
            return;
        this_.srcBlend = gl.ONE;
        this_.destBlend = gl.ONE_MINUS_SRC_ALPHA;
        switch (effect) {
        case 1:     // lighter (additive)
            this_.srcBlend = gl.ONE;
            this_.destBlend = gl.ONE;
            break;
        case 2:     // xor
            break;  // todo
        case 3:     // copy
            this_.srcBlend = gl.ONE;
            this_.destBlend = gl.ZERO;
            break;
        case 4:     // destination-over
            this_.srcBlend = gl.ONE_MINUS_DST_ALPHA;
            this_.destBlend = gl.ONE;
            break;
        case 5:     // source-in
            this_.srcBlend = gl.DST_ALPHA;
            this_.destBlend = gl.ZERO;
            break;
        case 6:     // destination-in
            this_.srcBlend = gl.ZERO;
            this_.destBlend = gl.SRC_ALPHA;
            break;
        case 7:     // source-out
            this_.srcBlend = gl.ONE_MINUS_DST_ALPHA;
            this_.destBlend = gl.ZERO;
            break;
        case 8:     // destination-out
            this_.srcBlend = gl.ZERO;
            this_.destBlend = gl.ONE_MINUS_SRC_ALPHA;
            break;
        case 9:     // source-atop
            this_.srcBlend = gl.DST_ALPHA;
            this_.destBlend = gl.ONE_MINUS_SRC_ALPHA;
            break;
        case 10:    // destination-atop
            this_.srcBlend = gl.ONE_MINUS_DST_ALPHA;
            this_.destBlend = gl.SRC_ALPHA;
            break;
        }
    };
    cr.round6dp = function (x)
    {
        return Math.round(x * 1000000) / 1000000;
    };
}());
;
(function()
{
    function Runtime(canvas)
    {
        if (!canvas || (!canvas.getContext && !canvas["dc"]))
            return;
        if (canvas["c2runtime"])
            return;
        else
            canvas["c2runtime"] = this;
        var self = this;
        this.isPhoneGap = (typeof window["device"] !== "undefined" && (typeof window["device"]["cordova"] !== "undefined" || typeof window["device"]["phonegap"] !== "undefined"));
        this.isDirectCanvas = !!canvas["dc"];
        this.isAppMobi = (typeof window["AppMobi"] !== "undefined" || this.isDirectCanvas);
        this.isCocoonJs = !!window["c2cocoonjs"];
        if (this.isCocoonJs)
        {
            ext["IDTK_APP"].addEventListener("onsuspended", function() {
                self.setSuspended(true);
            });
            ext["IDTK_APP"].addEventListener("onactivated", function () {
                self.setSuspended(false);
            });
        }
        this.isDomFree = this.isDirectCanvas || this.isCocoonJs;
        this.isAndroid = /android/i.test(navigator.userAgent);
        this.isIE = /msie/i.test(navigator.userAgent);
        this.isiPhone = /iphone/i.test(navigator.userAgent) || /ipod/i.test(navigator.userAgent);   // treat ipod as an iphone
        this.isiPad = /ipad/i.test(navigator.userAgent);
        this.isiOS = this.isiPhone || this.isiPad;
        this.isChrome = /chrome/i.test(navigator.userAgent) || /chromium/i.test(navigator.userAgent);
        this.isSafari = !this.isChrome && /safari/i.test(navigator.userAgent);      // Chrome includes Safari in UA
        this.isWindows = /windows/i.test(navigator.userAgent);
        this.isAwesomium = /awesomium/i.test(navigator.userAgent);
        this.isArcade = (typeof window["is_scirra_arcade"] !== "undefined");
        this.devicePixelRatio = 1;
        this.isMobile = (this.isPhoneGap || this.isAppMobi || this.isCocoonJs || this.isAndroid || this.isiOS);
        if (!this.isMobile)
            this.isMobile = /(blackberry|bb10|playbook|palm|symbian|nokia|windows\s+ce|phone|mobile|tablet)/i.test(navigator.userAgent);
        this.canvas = canvas;
        this.canvasdiv = document.getElementById("c2canvasdiv");
        this.gl = null;
        this.glwrap = null;
        this.ctx = null;
        this.canvas.oncontextmenu = function (e) { if (e.preventDefault) e.preventDefault(); return false; };
        this.canvas.onselectstart = function (e) { if (e.preventDefault) e.preventDefault(); return false; };
        if (this.isDirectCanvas)
            window["c2runtime"] = this;
        this.width = canvas.width;
        this.height = canvas.height;
        this.lastwidth = this.width;
        this.lastheight = this.height;
        this.redraw = true;
        this.isSuspended = false;
        if (!Date.now) {
          Date.now = function now() {
            return +new Date();
          };
        }
        this.plugins = [];
        this.types = {};
        this.types_by_index = [];
        this.behaviors = [];
        this.layouts = {};
        this.layouts_by_index = [];
        this.eventsheets = {};
        this.eventsheets_by_index = [];
        this.wait_for_textures = [];        // for blocking until textures loaded
        this.triggers_to_postinit = [];
        this.all_global_vars = [];
        this.deathRow = new cr.ObjectSet();
        this.isInClearDeathRow = false;
        this.isInOnDestroy = 0;                 // needs to support recursion so increments and decrements and is true if > 0
        this.isRunningEvents = false;
        this.createRow = [];
        this.dt = 0;
        this.dt1 = 0;
        this.logictime = 0;         // used to calculate CPUUtilisation
        this.cpuutilisation = 0;
        this.zeroDtCount = 0;
        this.timescale = 1.0;
        this.kahanTime = new cr.KahanAdder();
        this.last_tick_time = 0;
        this.measuring_dt = true;
        this.fps = 0;
        this.last_fps_time = 0;
        this.tickcount = 0;
        this.execcount = 0;
        this.framecount = 0;        // for fps
        this.objectcount = 0;
        this.changelayout = null;
        this.destroycallbacks = [];
        this.event_stack = [];
        this.event_stack_index = -1;
        this.localvar_stack = [[]];
        this.localvar_stack_index = 0;
        this.pushEventStack(null);
        this.loop_stack = [];
        this.loop_stack_index = -1;
        this.next_uid = 0;
        this.layout_first_tick = true;
        this.family_count = 0;
        this.suspend_events = [];
        this.raf_id = 0;
        this.timeout_id = 0;
        this.isloading = true;
        this.loadingprogress = 0;
        this.isAwesomiumFullscreen = false;
        this.stackLocalCount = 0;   // number of stack-based local vars for recursion
        this.had_a_click = false;
        this.objects_to_tick = new cr.ObjectSet();
        this.objects_to_tick2 = new cr.ObjectSet();
        this.registered_collisions = [];
        this.temp_poly = new cr.CollisionPoly([]);
        this.temp_poly2 = new cr.CollisionPoly([]);
        this.allGroups = [];                // array of all event groups
        this.activeGroups = {};             // event group activation states
        this.running_layout = null;         // currently running layout
        this.layer_canvas = null;           // for layers "render-to-texture"
        this.layer_ctx = null;
        this.layer_tex = null;
        this.layout_tex = null;
        this.is_WebGL_context_lost = false;
        this.uses_background_blending = false;  // if any shader uses background blending, so entire layout renders to texture
        this.fx_tex = [null, null];
        this.fullscreen_scaling = 0;
        this.files_subfolder = "";          // path with project files
        this.loaderlogo = null;
        this.snapshotCanvas = null;
        this.snapshotData = "";
        this.load();
        var isiOSRetina = (!this.isDomFree && this.useiOSRetina && this.isiOS);
        this.devicePixelRatio = (isiOSRetina ? (window["devicePixelRatio"] || 1) : 1);
        this.ClearDeathRow();
        var attribs;
        try {
            if (this.enableWebGL && !this.isDomFree)
            {
                attribs = { "depth": false, "antialias": !this.isMobile };
                var use_webgl = true;
                if (this.isChrome && this.isWindows)
                {
                    var tempcanvas = document.createElement("canvas");
                    var tempgl = (tempcanvas.getContext("webgl", attribs) || tempcanvas.getContext("experimental-webgl", attribs));
                    if (tempgl.getSupportedExtensions().toString() === "OES_texture_float,OES_standard_derivatives,WEBKIT_WEBGL_lose_context")
                    {
;
                        use_webgl = false;
                    }
                }
                if (use_webgl)
                    this.gl = (canvas.getContext("webgl", attribs) || canvas.getContext("experimental-webgl", attribs));
            }
        }
        catch (e) {
        }
        if (this.gl)
        {
;
            this.overlay_canvas = document.createElement("canvas");
            jQuery(this.overlay_canvas).appendTo(this.canvas.parentNode);
            this.overlay_canvas.oncontextmenu = function (e) { return false; };
            this.overlay_canvas.onselectstart = function (e) { return false; };
            this.overlay_canvas.width = canvas.width;
            this.overlay_canvas.height = canvas.height;
            this.positionOverlayCanvas();
            this.overlay_ctx = this.overlay_canvas.getContext("2d");
            this.glwrap = new cr.GLWrap(this.gl, this.isMobile);
            this.glwrap.setSize(canvas.width, canvas.height);
            this.ctx = null;
            this.canvas.addEventListener("webglcontextlost", function (ev) {
                console.log("WebGL context lost");
                ev.preventDefault();
                self.onContextLost();
                window["cr_setSuspended"](true);        // stop rendering
            }, false);
            this.canvas.addEventListener("webglcontextrestored", function (ev) {
                console.log("WebGL context restored");
                self.glwrap.initState();
                self.glwrap.setSize(self.glwrap.width, self.glwrap.height, true);
                self.layer_tex = null;
                self.layout_tex = null;
                self.fx_tex[0] = null;
                self.fx_tex[1] = null;
                self.onContextRestored();
                self.redraw = true;
                window["cr_setSuspended"](false);       // resume rendering
            }, false);
            var i, len, j, lenj, k, lenk, t, s, l, y;
            for (i = 0, len = this.types_by_index.length; i < len; i++)
            {
                t = this.types_by_index[i];
                for (j = 0, lenj = t.effect_types.length; j < lenj; j++)
                {
                    s = t.effect_types[j];
                    s.shaderindex = this.glwrap.getShaderIndex(s.id);
                    this.uses_background_blending = this.uses_background_blending || this.glwrap.programUsesDest(s.shaderindex);
                }
            }
            for (i = 0, len = this.layouts_by_index.length; i < len; i++)
            {
                l = this.layouts_by_index[i];
                for (j = 0, lenj = l.effect_types.length; j < lenj; j++)
                {
                    s = l.effect_types[j];
                    s.shaderindex = this.glwrap.getShaderIndex(s.id);
                }
                for (j = 0, lenj = l.layers.length; j < lenj; j++)
                {
                    y = l.layers[j];
                    for (k = 0, lenk = y.effect_types.length; k < lenk; k++)
                    {
                        s = y.effect_types[k];
                        s.shaderindex = this.glwrap.getShaderIndex(s.id);
                        this.uses_background_blending = this.uses_background_blending || this.glwrap.programUsesDest(s.shaderindex);
                    }
                }
            }
        }
        else
        {
            if (this.fullscreen_mode > 0 && this.isDirectCanvas)
            {
;
                this.canvas = null;
                document.oncontextmenu = function (e) { return false; };
                document.onselectstart = function (e) { return false; };
                this.ctx = AppMobi["canvas"]["getContext"]("2d");
                try {
                    this.ctx["samplingMode"] = this.linearSampling ? "smooth" : "sharp";
                    this.ctx["globalScale"] = 1;
                    this.ctx["HTML5CompatibilityMode"] = true;
                } catch(e){}
                if (this.width !== 0 && this.height !== 0)
                {
                    this.ctx.width = this.width;
                    this.ctx.height = this.height;
                }
            }
            if (!this.ctx)
            {
;
                if (this.isCocoonJs)
                {
                    attribs = { "antialias" : !!this.linearSampling };
                    this.ctx = canvas.getContext("2d", attribs);
                }
                else
                    this.ctx = canvas.getContext("2d");
                this.ctx["webkitImageSmoothingEnabled"] = this.linearSampling;
                this.ctx["mozImageSmoothingEnabled"] = this.linearSampling;
                this.ctx["msImageSmoothingEnabled"] = this.linearSampling;
                this.ctx["imageSmoothingEnabled"] = this.linearSampling;
            }
            this.overlay_canvas = null;
            this.overlay_ctx = null;
        }
        this.tickFunc = (function (self) { return function () { self.tick(); }; })(this);
        this.go();          // run loading screen
        this.extra = {};
        cr.seal(this);
    };
    var webkitRepaintFlag = false;
    Runtime.prototype["setSize"] = function (w, h)
    {
        var tryHideAddressBar = this.hideAddressBar && (this.isiPhone || this.isAndroid) && !navigator["standalone"] && !this.isDomFree && !this.isPhoneGap;
        var addressBarHeight = 0;
        if (tryHideAddressBar)
        {
            if (this.isiPhone)
                addressBarHeight = 60;
            else if (this.isAndroid)
                addressBarHeight = 56;
            h += addressBarHeight;
        }
        var offx = 0, offy = 0;
        var neww = 0, newh = 0, intscale = 0;
        var mode = this.fullscreen_mode;
        var isfullscreen = (document["mozFullScreen"] || document["webkitIsFullScreen"] || document["fullScreen"] || this.isAwesomiumFullscreen);
        if (isfullscreen && this.fullscreen_scaling > 0)
            mode = this.fullscreen_scaling;
        if (mode >= 3)
        {
            var orig_aspect = this.original_width / this.original_height;
            var cur_aspect = w / h;
            if (cur_aspect > orig_aspect)
            {
                neww = h * orig_aspect;
                if (mode === 4) // integer scaling
                {
                    intscale = neww / this.original_width;
                    if (intscale > 1)
                        intscale = Math.floor(intscale);
                    else if (intscale < 1)
                        intscale = 1 / Math.ceil(1 / intscale);
                    neww = this.original_width * intscale;
                    newh = this.original_height * intscale;
                    offx = (w - neww) / 2;
                    offy = (h - newh) / 2;
                    w = neww;
                    h = newh;
                }
                else
                {
                    offx = (w - neww) / 2;
                    w = neww;
                }
            }
            else
            {
                newh = w / orig_aspect;
                if (mode === 4) // integer scaling
                {
                    intscale = newh / this.original_height;
                    if (intscale > 1)
                        intscale = Math.floor(intscale);
                    else if (intscale < 1)
                        intscale = 1 / Math.ceil(1 / intscale);
                    neww = this.original_width * intscale;
                    newh = this.original_height * intscale;
                    offx = (w - neww) / 2;
                    offy = (h - newh) / 2;
                    w = neww;
                    h = newh;
                }
                else
                {
                    offy = (h - newh) / 2;
                    h = newh;
                }
            }
            if (isfullscreen && !this.isAwesomium)
            {
                offx = 0;
                offy = 0;
            }
            offx = Math.floor(offx);
            offy = Math.floor(offy);
            w = Math.floor(w);
            h = Math.floor(h);
        }
        else if (this.isAwesomium && this.isAwesomiumFullscreen && this.fullscreen_mode_set === 0)
        {
            offx = Math.floor((w - this.original_width) / 2);
            offy = Math.floor((h - this.original_height) / 2);
            w = this.original_width;
            h = this.original_height;
        }
        var isiOSRetina = (!this.isDomFree && this.useiOSRetina && this.isiOS);
        if (isiOSRetina && this.isiPad && this.devicePixelRatio > 1)    // don't apply to iPad 1-2
        {
            if (w >= 1024)
                w = 1023;       // 2046 retina pixels
            if (h >= 1024)
                h = 1023;
        }
        var multiplier = this.devicePixelRatio;
        this.width = w * multiplier;
        this.height = h * multiplier;
        this.redraw = true;
        if (this.canvasdiv && !this.isDomFree)
        {
            jQuery(this.canvasdiv).css({"width": w + "px",
                                        "height": h + "px",
                                        "margin-left": offx,
                                        "margin-top": offy});
            if (typeof cr_is_preview !== "undefined")
            {
                jQuery("#borderwrap").css({"width": w + "px",
                                            "height": h + "px"});
            }
        }
        if (this.canvas)
        {
            this.canvas.width = w * multiplier;
            this.canvas.height = h * multiplier;
            if (isiOSRetina)
            {
                jQuery(this.canvas).css({"width": w + "px",
                                        "height": h + "px"});
            }
        }
        if (this.overlay_canvas)
        {
            this.overlay_canvas.width = w;
            this.overlay_canvas.height = h;
        }
        if (this.glwrap)
            this.glwrap.setSize(w, h);
        if (this.isDirectCanvas)
        {
            this.ctx.width = w;
            this.ctx.height = h;
        }
        if (this.ctx)
        {
            this.ctx["webkitImageSmoothingEnabled"] = this.linearSampling;
            this.ctx["mozImageSmoothingEnabled"] = this.linearSampling;
            this.ctx["msImageSmoothingEnabled"] = this.linearSampling;
            this.ctx["imageSmoothingEnabled"] = this.linearSampling;
        }
        /*
        if (!this.isDomFree && this.canvas && /webkit/i.test(navigator.userAgent) && !this.isAwesomium)
        {
            var this_ = this;
            window.setTimeout(function () {
                if (webkitRepaintFlag)
                    return;
                webkitRepaintFlag = true;
                var n = document.createTextNode(".");
                this_.canvas.parentElement.insertBefore(n, this_.canvas);
                window.setTimeout(function () {
                    this_.canvas.parentElement.removeChild(n);
                    webkitRepaintFlag = false;
                }, 33);
            }, 33);
        }
        */
        if (tryHideAddressBar && addressBarHeight > 0)
        {
            window.setTimeout(function () {
                window.scrollTo(0, 1);
            }, 100);
        }
    };
    Runtime.prototype.onContextLost = function ()
    {
        this.is_WebGL_context_lost = true;
        var i, len, t;
        for (i = 0, len = this.types_by_index.length; i < len; i++)
        {
            t = this.types_by_index[i];
            if (t.onLostWebGLContext)
                t.onLostWebGLContext();
        }
    };
    Runtime.prototype.onContextRestored = function ()
    {
        this.is_WebGL_context_lost = false;
        var i, len, t;
        for (i = 0, len = this.types_by_index.length; i < len; i++)
        {
            t = this.types_by_index[i];
            if (t.onRestoreWebGLContext)
                t.onRestoreWebGLContext();
        }
    };
    Runtime.prototype.positionOverlayCanvas = function()
    {
        var isfullscreen = (document["mozFullScreen"] || document["webkitIsFullScreen"] || document["fullScreen"] || this.isAwesomiumFullscreen);
        var overlay_position = isfullscreen ? jQuery(this.canvas).offset() : jQuery(this.canvas).position();
        overlay_position.position = "absolute";
        jQuery(this.overlay_canvas).css(overlay_position);
    };
    var caf = window["cancelAnimationFrame"] ||
      window["mozCancelAnimationFrame"]    ||
      window["webkitCancelAnimationFrame"] ||
      window["msCancelAnimationFrame"]     ||
      window["oCancelAnimationFrame"];
    Runtime.prototype["setSuspended"] = function (s)
    {
        var i, len;
        if (s && !this.isSuspended)
        {
            this.isSuspended = true;            // next tick will be last
            if (this.raf_id !== 0)
                caf(this.raf_id);
            if (this.timeout_id !== 0)
                clearTimeout(this.timeout_id);
            for (i = 0, len = this.suspend_events.length; i < len; i++)
                this.suspend_events[i](true);
        }
        else if (!s && this.isSuspended)
        {
            this.isSuspended = false;
            this.last_tick_time = cr.performance_now(); // ensure first tick is a zero-dt one
            this.last_fps_time = cr.performance_now();  // reset FPS counter
            this.framecount = 0;
            for (i = 0, len = this.suspend_events.length; i < len; i++)
                this.suspend_events[i](false);
            this.tick();                        // kick off runtime again
        }
    };
    Runtime.prototype.addSuspendCallback = function (f)
    {
        this.suspend_events.push(f);
    };
    Runtime.prototype.load = function ()
    {
;
        var pm = cr.getProjectModel();
        this.name = pm[0];
        this.first_layout = pm[1];
        this.fullscreen_mode = pm[11];  // 0 = off, 1 = crop, 2 = scale, 3 = letterbox scale, 4 = integer letterbox scale
        this.fullscreen_mode_set = pm[11];
        if (this.isDomFree && pm[11] >= 3)
        {
            cr.logexport("[Construct 2] Letterbox scale fullscreen modes are not supported on this platform - falling back to 'Scale'");
            this.fullscreen_mode = 2;
            this.fullscreen_mode_set = 2;
        }
        this.uses_loader_layout = pm[17];
        this.loaderstyle = pm[18];
        if (this.loaderstyle === 0)
        {
            this.loaderlogo = new Image();
            this.loaderlogo.src = "logo.png";
        }
        this.system = new cr.system_object(this);
        var i, len, j, lenj, k, lenk, idstr, m, b, t, f;
        var plugin, plugin_ctor;
        for (i = 0, len = pm[2].length; i < len; i++)
        {
            m = pm[2][i];
;
            cr.add_common_aces(m);
            plugin = new m[0](this);
            plugin.singleglobal = m[1];
            plugin.is_world = m[2];
            plugin.must_predraw = m[9];
            if (plugin.onCreate)
                plugin.onCreate();  // opportunity to override default ACEs
            cr.seal(plugin);
            this.plugins.push(plugin);
        }
        pm = cr.getProjectModel();
        for (i = 0, len = pm[3].length; i < len; i++)
        {
            m = pm[3][i];
            plugin_ctor = m[1];
;
            plugin = null;
            for (j = 0, lenj = this.plugins.length; j < lenj; j++)
            {
                if (this.plugins[j] instanceof plugin_ctor)
                {
                    plugin = this.plugins[j];
                    break;
                }
            }
;
;
            var type_inst = new plugin.Type(plugin);
;
            type_inst.name = m[0];
            type_inst.is_family = m[2];
            type_inst.vars_count = m[3];
            type_inst.behs_count = m[4];
            type_inst.fx_count = m[5];
            if (type_inst.is_family)
            {
                type_inst.members = [];             // types in this family
                type_inst.family_index = this.family_count++;
                type_inst.families = null;
            }
            else
            {
                type_inst.members = null;
                type_inst.family_index = -1;
                type_inst.families = [];            // families this type belongs to
            }
            type_inst.family_var_map = null;
            type_inst.family_beh_map = null;
            type_inst.family_fx_map = null;
            type_inst.is_contained = false;
            type_inst.container = null;
            if (m[6])
            {
                type_inst.texture_file = m[6][0];
                type_inst.texture_filesize = m[6][1];
            }
            else
            {
                type_inst.texture_file = null;
                type_inst.texture_filesize = 0;
            }
            if (m[7])
            {
                type_inst.animations = m[7];
            }
            else
            {
                type_inst.animations = null;
            }
            type_inst.index = i;                                // save index in to types array in type
            type_inst.instances = [];                           // all instances of this type
            type_inst.deadCache = [];                           // destroyed instances to recycle next create
            type_inst.solstack = [new cr.selection(type_inst)]; // initialise SOL stack with one empty SOL
            type_inst.cur_sol = 0;
            type_inst.default_instance = null;
            type_inst.stale_iids = true;
            type_inst.updateIIDs = cr.type_updateIIDs;
            type_inst.getFirstPicked = cr.type_getFirstPicked;
            type_inst.getPairedInstance = cr.type_getPairedInstance;
            type_inst.getCurrentSol = cr.type_getCurrentSol;
            type_inst.pushCleanSol = cr.type_pushCleanSol;
            type_inst.pushCopySol = cr.type_pushCopySol;
            type_inst.popSol = cr.type_popSol;
            type_inst.getBehaviorByName = cr.type_getBehaviorByName;
            type_inst.getBehaviorIndexByName = cr.type_getBehaviorIndexByName;
            type_inst.getEffectIndexByName = cr.type_getEffectIndexByName;
            type_inst.applySolToContainer = cr.type_applySolToContainer;
            type_inst.extra = {};
            type_inst.toString = cr.type_toString;
            type_inst.behaviors = [];
            for (j = 0, lenj = m[8].length; j < lenj; j++)
            {
                b = m[8][j];
                var behavior_ctor = b[1];
                var behavior_plugin = null;
                for (k = 0, lenk = this.behaviors.length; k < lenk; k++)
                {
                    if (this.behaviors[k] instanceof behavior_ctor)
                    {
                        behavior_plugin = this.behaviors[k];
                        break;
                    }
                }
                if (!behavior_plugin)
                {
                    behavior_plugin = new behavior_ctor(this);
                    behavior_plugin.my_instances = new cr.ObjectSet();  // instances of this behavior
                    if (behavior_plugin.onCreate)
                        behavior_plugin.onCreate();
                    cr.seal(behavior_plugin);
                    this.behaviors.push(behavior_plugin);
                }
                var behavior_type = new behavior_plugin.Type(behavior_plugin, type_inst);
                behavior_type.name = b[0];
                behavior_type.onCreate();
                cr.seal(behavior_type);
                type_inst.behaviors.push(behavior_type);
            }
            type_inst.global = m[9];
            type_inst.isOnLoaderLayout = m[10];
            type_inst.effect_types = [];
            for (j = 0, lenj = m[11].length; j < lenj; j++)
            {
                type_inst.effect_types.push({
                    id: m[11][j][0],
                    name: m[11][j][1],
                    shaderindex: -1,
                    active: true,
                    index: j
                });
            }
            if (!this.uses_loader_layout || type_inst.is_family || type_inst.isOnLoaderLayout || !plugin.is_world)
            {
                type_inst.onCreate();
                cr.seal(type_inst);
            }
            if (type_inst.name)
                this.types[type_inst.name] = type_inst;
            this.types_by_index.push(type_inst);
            if (plugin.singleglobal)
            {
                var instance = new plugin.Instance(type_inst);
                instance.uid = this.next_uid;
                this.next_uid++;
                instance.iid = 0;
                instance.get_iid = cr.inst_get_iid;
                instance.toString = cr.inst_toString;
                instance.properties = m[12];
                instance.onCreate();
                cr.seal(instance);
                type_inst.instances.push(instance);
            }
        }
        for (i = 0, len = pm[4].length; i < len; i++)
        {
            var familydata = pm[4][i];
            var familytype = this.types_by_index[familydata[0]];
            var familymember;
            for (j = 1, lenj = familydata.length; j < lenj; j++)
            {
                familymember = this.types_by_index[familydata[j]];
                familymember.families.push(familytype);
                familytype.members.push(familymember);
            }
        }
        for (i = 0, len = pm[20].length; i < len; i++)
        {
            var containerdata = pm[20][i];
            var containertypes = [];
            for (j = 0, lenj = containerdata.length; j < lenj; j++)
                containertypes.push(this.types_by_index[containerdata[j]]);
            for (j = 0, lenj = containertypes.length; j < lenj; j++)
            {
                containertypes[j].is_contained = true;
                containertypes[j].container = containertypes;
            }
        }
        if (this.family_count > 0)
        {
            for (i = 0, len = this.types_by_index.length; i < len; i++)
            {
                t = this.types_by_index[i];
                if (t.is_family || !t.families.length)
                    continue;
                t.family_var_map = new Array(this.family_count);
                t.family_beh_map = new Array(this.family_count);
                t.family_fx_map = new Array(this.family_count);
                var all_fx = [];
                var varsum = 0;
                var behsum = 0;
                var fxsum = 0;
                for (j = 0, lenj = t.families.length; j < lenj; j++)
                {
                    f = t.families[j];
                    t.family_var_map[f.family_index] = varsum;
                    varsum += f.vars_count;
                    t.family_beh_map[f.family_index] = behsum;
                    behsum += f.behs_count;
                    t.family_fx_map[f.family_index] = fxsum;
                    fxsum += f.fx_count;
                    for (k = 0, lenk = f.effect_types.length; k < lenk; k++)
                        all_fx.push(cr.shallowCopy({}, f.effect_types[k]));
                }
                t.effect_types = all_fx.concat(t.effect_types);
                for (j = 0, lenj = t.effect_types.length; j < lenj; j++)
                    t.effect_types[j].index = j;
            }
        }
        for (i = 0, len = pm[5].length; i < len; i++)
        {
            m = pm[5][i];
            var layout = new cr.layout(this, m);
            cr.seal(layout);
            this.layouts[layout.name] = layout;
            this.layouts_by_index.push(layout);
        }
        for (i = 0, len = pm[6].length; i < len; i++)
        {
            m = pm[6][i];
            var sheet = new cr.eventsheet(this, m);
            cr.seal(sheet);
            this.eventsheets[sheet.name] = sheet;
            this.eventsheets_by_index.push(sheet);
        }
        for (i = 0, len = this.eventsheets_by_index.length; i < len; i++)
            this.eventsheets_by_index[i].postInit();
        for (i = 0, len = this.triggers_to_postinit.length; i < len; i++)
            this.triggers_to_postinit[i].postInit();
        this.triggers_to_postinit.length = 0;
        this.files_subfolder = pm[7];
        this.pixel_rounding = pm[8];
        this.original_width = pm[9];
        this.original_height = pm[10];
        this.aspect_scale = 1.0;
        this.enableWebGL = pm[12];
        this.linearSampling = pm[13];
        this.clearBackground = pm[14];
        this.versionstr = pm[15];
        var iOSretina = pm[16];
        if (iOSretina === 2)
            iOSretina = (this.isiPhone ? 1 : 0);
        this.useiOSRetina = (iOSretina !== 0);
        this.hideAddressBar = pm[19];
        this.start_time = Date.now();
    };
    Runtime.prototype.findWaitingTexture = function (src)
    {
        var i, len;
        for (i = 0, len = this.wait_for_textures.length; i < len; i++)
        {
            if (this.wait_for_textures[i].src === src)
                return this.wait_for_textures[i];
        }
        return null;
    };
    Runtime.prototype.areAllTexturesLoaded = function ()
    {
        var totalsize = 0;
        var completedsize = 0;
        var ret = true;
        var i, len;
        for (i = 0, len = this.wait_for_textures.length; i < len; i++)
        {
            var filesize = this.wait_for_textures[i].cr_filesize;
            if (!filesize || filesize <= 0)
                filesize = 50000;
            totalsize += filesize;
            if (this.wait_for_textures[i].complete || this.wait_for_textures[i]["loaded"])
                completedsize += filesize;
            else
                ret = false;    // not all textures loaded
        }
        if (totalsize == 0)
            this.progress = 0;
        else
            this.progress = (completedsize / totalsize);
        return ret;
    };
    Runtime.prototype.go = function ()
    {
        if (!this.ctx && !this.glwrap)
            return;
        var ctx = this.ctx || this.overlay_ctx;
        if (this.overlay_canvas)
            this.positionOverlayCanvas();
        this.progress = 0;
        this.last_progress = -1;
        if (this.areAllTexturesLoaded())
            this.go_textures_done();
        else
        {
            var ms_elapsed = Date.now() - this.start_time;
            if (this.loaderstyle !== 3 && ms_elapsed >= 500 && this.last_progress != this.progress)
            {
                ctx.clearRect(0, 0, this.width, this.height);
                var mx = this.width / 2;
                var my = this.height / 2;
                var haslogo = (this.loaderstyle === 0 && this.loaderlogo.complete);
                var hlw = 40;
                var hlh = 0;
                var logowidth = 80;
                if (haslogo)
                {
                    logowidth = this.loaderlogo.width;
                    hlw = logowidth / 2;
                    hlh = this.loaderlogo.height / 2;
                    ctx.drawImage(this.loaderlogo, cr.floor(mx - hlw), cr.floor(my - hlh));
                }
                if (this.loaderstyle <= 1)
                {
                    my += hlh + (haslogo ? 12 : 0);
                    mx -= hlw;
                    mx = cr.floor(mx) + 0.5;
                    my = cr.floor(my) + 0.5;
                    ctx.fillStyle = "DodgerBlue";
                    ctx.fillRect(mx, my, Math.floor(logowidth * this.progress), 6);
                    ctx.strokeStyle = "black";
                    ctx.strokeRect(mx, my, logowidth, 6);
                    ctx.strokeStyle = "white";
                    ctx.strokeRect(mx - 1, my - 1, logowidth + 2, 8);
                }
                else if (this.loaderstyle === 2)
                {
                    ctx.font = "12pt Arial";
                    ctx.fillStyle = "#999";
                    ctx.textBaseLine = "middle";
                    var percent_text = Math.round(this.progress * 100) + "%";
                    var text_dim = ctx.measureText ? ctx.measureText(percent_text) : null;
                    var text_width = text_dim ? text_dim.width : 0;
                    ctx.fillText(percent_text, mx - (text_width / 2), my);
                }
                this.last_progress = this.progress;
            }
            setTimeout((function (self) { return function () { self.go(); }; })(this), 100);
        }
    };
    Runtime.prototype.go_textures_done = function ()
    {
        if (this.overlay_canvas)
        {
            this.canvas.parentNode.removeChild(this.overlay_canvas);
            this.overlay_ctx = null;
            this.overlay_canvas = null;
        }
        this.start_time = Date.now();
        this.last_fps_time = cr.performance_now();       // for counting framerate
        var i, len, t;
        if (this.uses_loader_layout)
        {
            for (i = 0, len = this.types_by_index.length; i < len; i++)
            {
                t = this.types_by_index[i];
                if (!t.is_family && !t.isOnLoaderLayout && t.plugin.is_world)
                {
                    t.onCreate();
                    cr.seal(t);
                }
            }
        }
        else
            this.isloading = false;
        for (i = 0, len = this.layouts_by_index.length; i < len; i++)
        {
            this.layouts_by_index[i].createGlobalNonWorlds();
        }
        if (this.first_layout)
            this.layouts[this.first_layout].startRunning();
        else
            this.layouts_by_index[0].startRunning();
;
        if (!this.uses_loader_layout)
        {
            this.loadingprogress = 1;
            this.trigger(cr.system_object.prototype.cnds.OnLoadFinished, null);
        }
        this.tick();
        if (this.isDirectCanvas)
            AppMobi["webview"]["execute"]("onGameReady();");
    };
    var raf = window["requestAnimationFrame"] ||
      window["mozRequestAnimationFrame"]    ||
      window["webkitRequestAnimationFrame"] ||
      window["msRequestAnimationFrame"]     ||
      window["oRequestAnimationFrame"];
    Runtime.prototype.tick = function ()
    {
        if (this.isArcade)
        {
            var curwidth = jQuery(window).width();
            var curheight = jQuery(window).height();
            if (this.lastwidth !== curwidth || this.lastheight !== curheight)
            {
                this.lastwidth = curwidth;
                this.lastheight = curheight;
                this["setSize"](curwidth, curheight);
            }
        }
;
        var logic_start = cr.performance_now();
        if (this.isloading)
        {
            var done = this.areAllTexturesLoaded();     // updates this.progress
            this.loadingprogress = this.progress;
            if (done)
            {
                this.isloading = false;
                this.progress = 1;
                this.trigger(cr.system_object.prototype.cnds.OnLoadFinished, null);
            }
        }
        this.logic();
        if ((this.redraw || (this.isAwesomium && this.tickcount < 60)) && !this.is_WebGL_context_lost)
        {
            this.redraw = false;
            if (this.glwrap)
                this.drawGL();
            else
                this.draw();
            if (this.snapshotCanvas)
            {
                if (this.canvas && this.canvas.toDataURL)
                {
                    this.snapshotData = this.canvas.toDataURL(this.snapshotCanvas[0], this.snapshotCanvas[1]);
                    this.trigger(cr.system_object.prototype.cnds.OnCanvasSnapshot, null);
                }
                this.snapshotCanvas = null;
            }
        }
        this.tickcount++;
        this.execcount++;
        this.framecount++;
        this.logictime += cr.performance_now() - logic_start;
        if (this.isSuspended)
            return;
        if (raf)
            this.raf_id = raf(this.tickFunc, this.canvas);
        else
        {
            this.timeout_id = setTimeout(this.tickFunc, this.isMobile ? 1 : 16);
        }
    };
    Runtime.prototype.logic = function ()
    {
        var i, leni, j, lenj, k, lenk, type, binst;
        var cur_time = cr.performance_now();
        if (cur_time - this.last_fps_time >= 1000)  // every 1 second
        {
            this.last_fps_time += 1000;
            this.fps = this.framecount;
            this.framecount = 0;
            this.cpuutilisation = this.logictime;
            this.logictime = 0;
        }
        if (this.measuring_dt)
        {
            if (this.last_tick_time !== 0)
            {
                var ms_diff = cur_time - this.last_tick_time;
                if (ms_diff === 0)
                {
                    this.zeroDtCount++;
                    if (this.zeroDtCout >= 10)
                        this.measuring_dt = false;
                    this.dt1 = 1.0 / 60.0;            // 60fps assumed (0.01666...)
                }
                else
                {
                    this.dt1 = ms_diff / 1000.0; // dt measured in seconds
                    if (this.dt1 > 0.5)
                        this.dt1 = 0;
                    else if (this.dt1 > 0.1)
                        this.dt1 = 0.1;
                }
            }
            this.last_tick_time = cur_time;
        }
        this.dt = this.dt1 * this.timescale;
        this.kahanTime.add(this.dt);
        var isfullscreen = (document["mozFullScreen"] || document["webkitIsFullScreen"] || document["fullScreen"] || this.isAwesomiumFullscreen);
        if (this.fullscreen_mode >= 2 /* scale */ || (isfullscreen && this.fullscreen_scaling > 0))
        {
            var orig_aspect = this.original_width / this.original_height;
            var cur_aspect = this.width / this.height;
            if (cur_aspect > orig_aspect)
                this.aspect_scale = this.height / this.original_height;
            else
            {
                this.aspect_scale = this.width / this.original_width;
            }
            if (this.running_layout)
            {
                this.running_layout.scrollToX(this.running_layout.scrollX);
                this.running_layout.scrollToY(this.running_layout.scrollY);
            }
        }
        else
            this.aspect_scale = 1;
        this.ClearDeathRow();
        this.isInOnDestroy++;
        this.system.runWaits();     // prevent instance list changing
        this.isInOnDestroy--;
        this.ClearDeathRow();       // allow instance list changing
        this.isInOnDestroy++;
        for (i = 0, leni = this.types_by_index.length; i < leni; i++)
        {
            type = this.types_by_index[i];
            if (!type.behaviors.length)
                continue;   // type doesn't have any behaviors
            for (j = 0, lenj = type.instances.length; j < lenj; j++)
            {
                var inst = type.instances[j];
                for (k = 0, lenk = inst.behavior_insts.length; k < lenk; k++)
                {
                    inst.behavior_insts[k].tick();
                }
            }
        }
        var tickarr = this.objects_to_tick.valuesRef();
        for (i = 0, leni = tickarr.length; i < leni; i++)
            tickarr[i].tick();
        this.isInOnDestroy--;       // end preventing instance lists from being changed
        i = 0;
        while (this.changelayout && i++ < 10)
        {
;
            this.running_layout.stopRunning();
            this.changelayout.startRunning();
            for (i = 0, leni = this.types_by_index.length; i < leni; i++)
            {
                type = this.types_by_index[i];
                if (!type.global && !type.plugin.singleglobal)
                    continue;
                for (j = 0, lenj = type.instances.length; j < lenj; j++)
                {
                    var inst = type.instances[j];
                    if (inst.onLayoutChange)
                        inst.onLayoutChange();
                }
            }
            this.redraw = true;
            this.layout_first_tick = true;
            this.ClearDeathRow();
        }
        for (i = 0, leni = this.eventsheets_by_index.length; i < leni; i++)
            this.eventsheets_by_index[i].hasRun = false;
        if (this.running_layout.event_sheet)
            this.running_layout.event_sheet.run();
        this.registered_collisions.length = 0;
        this.layout_first_tick = false;
        this.isInOnDestroy++;       // prevent instance lists from being changed
        for (i = 0, leni = this.types_by_index.length; i < leni; i++)
        {
            type = this.types_by_index[i];
            if (!type.behaviors.length)
                continue;   // type doesn't have any behaviors
            for (j = 0, lenj = type.instances.length; j < lenj; j++)
            {
                var inst = type.instances[j];
                for (k = 0, lenk = inst.behavior_insts.length; k < lenk; k++)
                {
                    binst = inst.behavior_insts[k];
                    if (binst.tick2)
                        binst.tick2();
                }
            }
        }
        tickarr = this.objects_to_tick2.valuesRef();
        for (i = 0, leni = tickarr.length; i < leni; i++)
            tickarr[i].tick2();
        this.isInOnDestroy--;       // end preventing instance lists from being changed
    };
    Runtime.prototype.tickMe = function (inst)
    {
        this.objects_to_tick.add(inst);
    };
    Runtime.prototype.untickMe = function (inst)
    {
        this.objects_to_tick.remove(inst);
    };
    Runtime.prototype.tick2Me = function (inst)
    {
        this.objects_to_tick2.add(inst);
    };
    Runtime.prototype.untick2Me = function (inst)
    {
        this.objects_to_tick2.remove(inst);
    };
    Runtime.prototype.getDt = function (inst)
    {
        if (!inst || inst.my_timescale === -1.0)
            return this.dt;
        return this.dt1 * inst.my_timescale;
    };
    Runtime.prototype.draw = function ()
    {
        this.running_layout.draw(this.ctx);
        if (this.isDirectCanvas)
            this.ctx["present"]();
    };
    Runtime.prototype.drawGL = function ()
    {
        this.running_layout.drawGL(this.glwrap);
    };
    Runtime.prototype.addDestroyCallback = function (f)
    {
        if (f)
            this.destroycallbacks.push(f);
    };
    Runtime.prototype.removeDestroyCallback = function (f)
    {
        cr.arrayFindRemove(this.destroycallbacks, f);
    };
    Runtime.prototype.DestroyInstance = function (inst)
    {
        var i, len;
        if (!this.deathRow.contains(inst))
        {
            this.deathRow.add(inst);
            if (inst.is_contained)
            {
                for (i = 0, len = inst.siblings.length; i < len; i++)
                {
                    this.DestroyInstance(inst.siblings[i]);
                }
            }
            if (this.isInClearDeathRow)
                this.deathRow.values_cache.push(inst);
            this.isInOnDestroy++;       // support recursion
            this.trigger(Object.getPrototypeOf(inst.type.plugin).cnds.OnDestroyed, inst);
            this.isInOnDestroy--;
        }
    };
    Runtime.prototype.ClearDeathRow = function ()
    {
        var inst, index, type, instances, binst;
        var i, j, k, leni, lenj, lenk;
        var w, f;
        this.isInClearDeathRow = true;
        for (i = 0, leni = this.createRow.length; i < leni; i++)
        {
            inst = this.createRow[i];
            type = inst.type;
            type.instances.push(inst);
            type.stale_iids = true;
            for (j = 0, lenj = type.families.length; j < lenj; j++)
            {
                type.families[j].instances.push(inst);
                type.families[j].stale_iids = true;
            }
        }
        this.createRow.length = 0;
        var arr = this.deathRow.valuesRef();    // get array of items from set
        for (i = 0; i < arr.length; i++)        // check array length every time in case it changes
        {
            inst = arr[i];
            type = inst.type;
            instances = type.instances;
            for (j = 0, lenj = this.destroycallbacks.length; j < lenj; j++)
                this.destroycallbacks[j](inst);
            cr.arrayFindRemove(instances, inst);
            if (inst.layer)
            {
                cr.arrayRemove(inst.layer.instances, inst.get_zindex());
                inst.layer.zindices_stale = true;
            }
            for (j = 0, lenj = type.families.length; j < lenj; j++)
            {
                cr.arrayFindRemove(type.families[j].instances, inst);
                type.families[j].stale_iids = true;
            }
            if (inst.behavior_insts)
            {
                for (j = 0, lenj = inst.behavior_insts.length; j < lenj; j++)
                {
                    binst = inst.behavior_insts[j];
                    if (binst.onDestroy)
                        binst.onDestroy();
                    binst.behavior.my_instances.remove(inst);
                }
            }
            this.objects_to_tick.remove(inst);
            this.objects_to_tick2.remove(inst);
            for (j = 0, lenj = this.system.waits.length; j < lenj; j++)
            {
                w = this.system.waits[j];
                if (w.sols.hasOwnProperty(type.index))
                    cr.arrayFindRemove(w.sols[type.index], inst);
                if (!type.is_family)
                {
                    for (k = 0, lenk = type.families.length; k < lenk; k++)
                    {
                        f = type.families[k];
                        if (w.sols.hasOwnProperty(f.index))
                            cr.arrayFindRemove(w.sols[f.index], inst);
                    }
                }
            }
            if (inst.onDestroy)
                inst.onDestroy();
            this.objectcount--;
            if (type.deadCache.length < 32)
                type.deadCache.push(inst);
            type.stale_iids = true;
        }
        if (!this.deathRow.isEmpty())
            this.redraw = true;
        this.deathRow.clear();
        this.isInClearDeathRow = false;
    };
    Runtime.prototype.createInstance = function (type, layer, sx, sy)
    {
        if (type.is_family)
        {
            var i = cr.floor(Math.random() * type.members.length);
            return this.createInstance(type.members[i], layer, sx, sy);
        }
        if (!type.default_instance)
        {
            return null;
        }
        return this.createInstanceFromInit(type.default_instance, layer, false, sx, sy);
    };
    var all_behaviors = [];
    Runtime.prototype.createInstanceFromInit = function (initial_inst, layer, is_startup_instance, sx, sy, skip_siblings)
    {
        var i, len, j, lenj, p, effect_fallback, x, y;
        if (!initial_inst)
            return null;
        var type = this.types_by_index[initial_inst[1]];
;
;
        var is_world = type.plugin.is_world;
;
        if (this.isloading && is_world && !type.isOnLoaderLayout)
            return null;
        if (is_world && !this.glwrap && initial_inst[0][11] === 11)
            return null;
        if (!is_world)
            layer = null;
        var inst;
        var recycled_inst = false;
        if (type.deadCache.length)
        {
            inst = type.deadCache.pop();
            recycled_inst = true;
            type.plugin.Instance.call(inst, type);
        }
        else
            inst = new type.plugin.Instance(type);
        inst.uid = this.next_uid;
        this.next_uid++;
        inst.iid = 0;
        inst.get_iid = cr.inst_get_iid;
        type.stale_iids = true;
        var initial_vars = initial_inst[2];
        if (recycled_inst)
        {
            for (i = 0, len = initial_vars.length; i < len; i++)
                inst.instance_vars[i] = initial_vars[i];
            cr.wipe(inst.extra);
        }
        else
        {
            inst.instance_vars = initial_vars.slice(0);
            inst.extra = {};
        }
        if (is_world)
        {
            var wm = initial_inst[0];
;
            inst.x = cr.is_undefined(sx) ? wm[0] : sx;
            inst.y = cr.is_undefined(sy) ? wm[1] : sy;
            inst.z = wm[2];
            inst.width = wm[3];
            inst.height = wm[4];
            inst.depth = wm[5];
            inst.angle = wm[6];
            inst.opacity = wm[7];
            inst.hotspotX = wm[8];
            inst.hotspotY = wm[9];
            inst.blend_mode = wm[10];
            effect_fallback = wm[11];
            if (!this.glwrap && type.effect_types.length)   // no WebGL renderer and shaders used
                inst.blend_mode = effect_fallback;          // use fallback blend mode - destroy mode was handled above
            inst.compositeOp = cr.effectToCompositeOp(inst.blend_mode);
            if (this.gl)
                cr.setGLBlend(inst, inst.blend_mode, this.gl);
            if (recycled_inst)
            {
                for (i = 0, len = wm[12].length; i < len; i++)
                {
                    for (j = 0, lenj = wm[12][i].length; j < lenj; j++)
                        inst.effect_params[i][j] = wm[12][i][j];
                }
                inst.bbox.set(0, 0, 0, 0);
                inst.bquad.set_from_rect(inst.bbox);
                inst.bbox_changed_callbacks.length = 0;
            }
            else
            {
                inst.effect_params = wm[12].slice(0);
                for (i = 0, len = inst.effect_params.length; i < len; i++)
                    inst.effect_params[i] = wm[12][i].slice(0);
                inst.active_effect_types = [];
                inst.active_effect_flags = [];
                inst.active_effect_flags.length = type.effect_types.length;
                inst.bbox = new cr.rect(0, 0, 0, 0);
                inst.bquad = new cr.quad();
                inst.bbox_changed_callbacks = [];
                inst.set_bbox_changed = cr.set_bbox_changed;
                inst.add_bbox_changed_callback = cr.add_bbox_changed_callback;
                inst.contains_pt = cr.inst_contains_pt;
                inst.update_bbox = cr.update_bbox;
                inst.get_zindex = cr.inst_get_zindex;
            }
            for (i = 0, len = type.effect_types.length; i < len; i++)
                inst.active_effect_flags[i] = true;
            inst.updateActiveEffects = cr.inst_updateActiveEffects;
            inst.updateActiveEffects();
            inst.uses_shaders = !!inst.active_effect_types.length;
            inst.bbox_changed = true;
            inst.visible = true;
            inst.my_timescale = -1.0;
            inst.layer = layer;
            inst.zindex = layer.instances.length;   // will be placed at top of current layer
            if (typeof inst.collision_poly === "undefined")
                inst.collision_poly = null;
            inst.collisionsEnabled = true;
            this.redraw = true;
        }
        inst.toString = cr.inst_toString;
        var initial_props, binst;
        all_behaviors.length = 0;
        for (i = 0, len = type.families.length; i < len; i++)
        {
            all_behaviors.push.apply(all_behaviors, type.families[i].behaviors);
        }
        all_behaviors.push.apply(all_behaviors, type.behaviors);
        if (recycled_inst)
        {
            for (i = 0, len = all_behaviors.length; i < len; i++)
            {
                var btype = all_behaviors[i];
                binst = inst.behavior_insts[i];
                btype.behavior.Instance.call(binst, btype, inst);
                initial_props = initial_inst[3][i];
                for (j = 0, lenj = initial_props.length; j < lenj; j++)
                    binst.properties[j] = initial_props[j];
                binst.onCreate();
                btype.behavior.my_instances.add(inst);
            }
        }
        else
        {
            inst.behavior_insts = [];
            for (i = 0, len = all_behaviors.length; i < len; i++)
            {
                var btype = all_behaviors[i];
                var binst = new btype.behavior.Instance(btype, inst);
                binst.properties = initial_inst[3][i].slice(0);
                binst.onCreate();
                cr.seal(binst);
                inst.behavior_insts.push(binst);
                btype.behavior.my_instances.add(inst);
            }
        }
        initial_props = initial_inst[4];
        if (recycled_inst)
        {
            for (i = 0, len = initial_props.length; i < len; i++)
                inst.properties[i] = initial_props[i];
        }
        else
            inst.properties = initial_props.slice(0);
        this.createRow.push(inst);
        if (layer)
        {
;
            layer.instances.push(inst);
        }
        this.objectcount++;
        if (type.is_contained)
        {
            inst.is_contained = true;
            inst.siblings = [];         // note: should not include self
            if (!is_startup_instance && !skip_siblings) // layout links initial instances
            {
                for (i = 0, len = type.container.length; i < len; i++)
                {
                    if (type.container[i] === type)
                        continue;
                    if (!type.container[i].default_instance)
                    {
                        return null;
                    }
                    inst.siblings.push(this.createInstanceFromInit(type.container[i].default_instance, layer, false, is_world ? inst.x : sx, is_world ? inst.y : sy, true));
                }
            }
        }
        else
        {
            inst.is_contained = false;
            inst.siblings = null;
        }
        inst.onCreate();
        if (!recycled_inst)
            cr.seal(inst);
        for (i = 0, len = inst.behavior_insts.length; i < len; i++)
        {
            if (inst.behavior_insts[i].postCreate)
                inst.behavior_insts[i].postCreate();
        }
        return inst;
    };
    Runtime.prototype.getLayerByName = function (layer_name)
    {
        var i, len;
        for (i = 0, len = this.running_layout.layers.length; i < len; i++)
        {
            var layer = this.running_layout.layers[i];
            if (layer.name.toLowerCase() === layer_name.toLowerCase())
                return layer;
        }
        return null;
    };
    Runtime.prototype.getLayerByNumber = function (index)
    {
        index = cr.floor(index);
        if (index < 0)
            index = 0;
        if (index >= this.running_layout.layers.length)
            index = this.running_layout.layers.length - 1;
        return this.running_layout.layers[index];
    };
    Runtime.prototype.getLayer = function (l)
    {
        if (cr.is_number(l))
            return this.getLayerByNumber(l);
        else
            return this.getLayerByName(l.toString());
    };
    Runtime.prototype.clearSol = function (solModifiers)
    {
        var i, len;
        for (i = 0, len = solModifiers.length; i < len; i++)
        {
            solModifiers[i].getCurrentSol().select_all = true;
        }
    };
    Runtime.prototype.pushCleanSol = function (solModifiers)
    {
        var i, len;
        for (i = 0, len = solModifiers.length; i < len; i++)
        {
            solModifiers[i].pushCleanSol();
        }
    };
    Runtime.prototype.pushCopySol = function (solModifiers)
    {
        var i, len;
        for (i = 0, len = solModifiers.length; i < len; i++)
        {
            solModifiers[i].pushCopySol();
        }
    };
    Runtime.prototype.popSol = function (solModifiers)
    {
        var i, len;
        for (i = 0, len = solModifiers.length; i < len; i++)
        {
            solModifiers[i].popSol();
        }
    };
    Runtime.prototype.testAndSelectCanvasPointOverlap = function (type, ptx, pty, inverted)
    {
        var sol = type.getCurrentSol();
        var i, j, inst, len;
        var lx, ly;
        if (sol.select_all)
        {
            if (!inverted)
            {
                sol.select_all = false;
                sol.instances.length = 0;   // clear contents
            }
            for (i = 0, len = type.instances.length; i < len; i++)
            {
                inst = type.instances[i];
                inst.update_bbox();
                lx = inst.layer.canvasToLayer(ptx, pty, true);
                ly = inst.layer.canvasToLayer(ptx, pty, false);
                if (inst.contains_pt(lx, ly))
                {
                    if (inverted)
                        return false;
                    else
                        sol.instances.push(inst);
                }
            }
        }
        else
        {
            j = 0;
            for (i = 0, len = sol.instances.length; i < len; i++)
            {
                inst = sol.instances[i];
                inst.update_bbox();
                lx = inst.layer.canvasToLayer(ptx, pty, true);
                ly = inst.layer.canvasToLayer(ptx, pty, false);
                if (inst.contains_pt(lx, ly))
                {
                    if (inverted)
                        return false;
                    else
                    {
                        sol.instances[j] = sol.instances[i];
                        j++;
                    }
                }
            }
            if (!inverted)
                sol.instances.length = j;
        }
        type.applySolToContainer();
        if (inverted)
            return true;        // did not find anything overlapping
        else
            return sol.hasObjects();
    };
    Runtime.prototype.testOverlap = function (a, b)
    {
        if (!a || !b || a === b || !a.collisionsEnabled || !b.collisionsEnabled)
            return false;
        a.update_bbox();
        b.update_bbox();
        var layera = a.layer;
        var layerb = b.layer;
        var different_layers = (layera !== layerb && (layera.parallaxX !== layerb.parallaxX || layerb.parallaxY !== layerb.parallaxY || layera.scale !== layerb.scale || layera.angle !== layerb.angle || layera.zoomRate !== layerb.zoomRate));
        var i, len, x, y, haspolya, haspolyb, polya, polyb;
        if (!different_layers)  // same layers: easy check
        {
            if (!a.bbox.intersects_rect(b.bbox))
                return false;
            if (!a.bquad.intersects_quad(b.bquad))
                return false;
            haspolya = (a.collision_poly && !a.collision_poly.is_empty());
            haspolyb = (b.collision_poly && !b.collision_poly.is_empty());
            if (!haspolya && !haspolyb)
                return true;
            if (haspolya)
            {
                a.collision_poly.cache_poly(a.width, a.height, a.angle);
                polya = a.collision_poly;
            }
            else
            {
                this.temp_poly.set_from_quad(a.bquad, a.x, a.y, a.width, a.height);
                polya = this.temp_poly;
            }
            if (haspolyb)
            {
                b.collision_poly.cache_poly(b.width, b.height, b.angle);
                polyb = b.collision_poly;
            }
            else
            {
                this.temp_poly.set_from_quad(b.bquad, b.x, b.y, b.width, b.height);
                polyb = this.temp_poly;
            }
            return polya.intersects_poly(polyb, b.x - a.x, b.y - a.y);
        }
        else    // different layers: need to do full translated check
        {
            haspolya = (a.collision_poly && !a.collision_poly.is_empty());
            haspolyb = (b.collision_poly && !b.collision_poly.is_empty());
            if (haspolya)
            {
                a.collision_poly.cache_poly(a.width, a.height, a.angle);
                this.temp_poly.set_from_poly(a.collision_poly);
            }
            else
            {
                this.temp_poly.set_from_quad(a.bquad, a.x, a.y, a.width, a.height);
            }
            polya = this.temp_poly;
            if (haspolyb)
            {
                b.collision_poly.cache_poly(b.width, b.height, b.angle);
                this.temp_poly2.set_from_poly(b.collision_poly);
            }
            else
            {
                this.temp_poly2.set_from_quad(b.bquad, b.x, b.y, b.width, b.height);
            }
            polyb = this.temp_poly2;
            for (i = 0, len = polya.pts_count; i < len; i++)
            {
                x = polya.pts_cache[i*2];
                y = polya.pts_cache[i*2+1];
                polya.pts_cache[i*2] = layera.layerToCanvas(x + a.x, y + a.y, true);
                polya.pts_cache[i*2+1] = layera.layerToCanvas(x + a.x, y + a.y, false);
            }
            for (i = 0, len = polyb.pts_count; i < len; i++)
            {
                x = polyb.pts_cache[i*2];
                y = polyb.pts_cache[i*2+1];
                polyb.pts_cache[i*2] = layerb.layerToCanvas(x + b.x, y + b.y, true);
                polyb.pts_cache[i*2+1] = layerb.layerToCanvas(x + b.x, y + b.y, false);
            }
            return polya.intersects_poly(polyb, 0, 0);
        }
    };
    Runtime.prototype.testOverlapSolid = function (inst)
    {
        var solid = null;
        var i, len, s;
        if (!cr.behaviors.solid)
            return null;
        for (i = 0, len = this.behaviors.length; i < len; i++)
        {
            if (this.behaviors[i] instanceof cr.behaviors.solid)
            {
                solid = this.behaviors[i];
                break;
            }
        }
        if (!solid)
            return null;
        var solids = solid.my_instances.valuesRef();
        for (i = 0, len = solids.length; i < len; ++i)
        {
            s = solids[i];
            if (!s.extra.solidEnabled)
                continue;
            if (this.testOverlap(inst, s))
                return s;
        }
        return null;
    };
    var jumpthru_array_ret = [];
    Runtime.prototype.testOverlapJumpThru = function (inst, all)
    {
        var jumpthru = null;
        var i, len, s;
        if (!cr.behaviors.jumpthru)
            return null;
        for (i = 0, len = this.behaviors.length; i < len; i++)
        {
            if (this.behaviors[i] instanceof cr.behaviors.jumpthru)
            {
                jumpthru = this.behaviors[i];
                break;
            }
        }
        if (!jumpthru)
            return null;
        var ret = null;
        if (all)
        {
            ret = jumpthru_array_ret;
            ret.length = 0;
        }
        var jumpthrus = jumpthru.my_instances.valuesRef();
        for (i = 0, len = jumpthrus.length; i < len; ++i)
        {
            s = jumpthrus[i];
            if (!s.extra.jumpthruEnabled)
                continue;
            if (this.testOverlap(inst, s))
            {
                if (all)
                    ret.push(s);
                else
                    return s;
            }
        }
        return ret;
    };
    Runtime.prototype.pushOutSolid = function (inst, xdir, ydir, dist, include_jumpthrus, specific_jumpthru)
    {
        var push_dist = dist || 50;
        var oldx = inst.x
        var oldy = inst.y;
        var i;
        var last_overlapped = null;
        for (i = 0; i < push_dist; i++)
        {
            inst.x = (oldx + (xdir * i));
            inst.y = (oldy + (ydir * i));
            inst.set_bbox_changed();
            if (!this.testOverlap(inst, last_overlapped))
            {
                last_overlapped = this.testOverlapSolid(inst);
                if (!last_overlapped)
                {
                    if (include_jumpthrus)
                    {
                        if (specific_jumpthru)
                            last_overlapped = (this.testOverlap(inst, specific_jumpthru) ? specific_jumpthru : null);
                        else
                            last_overlapped = this.testOverlapJumpThru(inst);
                    }
                    if (!last_overlapped)
                        return true;
                }
            }
        }
        inst.x = oldx;
        inst.y = oldy;
        inst.set_bbox_changed();
        return false;
    };
    Runtime.prototype.pushOutSolidNearest = function (inst, max_dist_)
    {
        var max_dist = (cr.is_undefined(max_dist_) ? 100 : max_dist_);
        var dist = 0;
        var oldx = inst.x
        var oldy = inst.y;
        var dir = 0;
        var dx = 0, dy = 0;
        var last_overlapped = null;
        while (dist <= max_dist)
        {
            switch (dir) {
            case 0:     dx = 0; dy = -1; dist++; break;
            case 1:     dx = 1; dy = -1; break;
            case 2:     dx = 1; dy = 0; break;
            case 3:     dx = 1; dy = 1; break;
            case 4:     dx = 0; dy = 1; break;
            case 5:     dx = -1; dy = 1; break;
            case 6:     dx = -1; dy = 0; break;
            case 7:     dx = -1; dy = -1; break;
            }
            dir = (dir + 1) % 8;
            inst.x = cr.floor(oldx + (dx * dist));
            inst.y = cr.floor(oldy + (dy * dist));
            inst.set_bbox_changed();
            if (!this.testOverlap(inst, last_overlapped))
            {
                last_overlapped = this.testOverlapSolid(inst);
                if (!last_overlapped)
                    return true;
            }
        }
        inst.x = oldx;
        inst.y = oldy;
        inst.set_bbox_changed();
        return false;
    };
    Runtime.prototype.registerCollision = function (a, b)
    {
        if (!a.collisionsEnabled || !b.collisionsEnabled)
            return;
        this.registered_collisions.push([a, b]);
    };
    Runtime.prototype.checkRegisteredCollision = function (a, b)
    {
        var i, len, x;
        for (i = 0, len = this.registered_collisions.length; i < len; i++)
        {
            x = this.registered_collisions[i];
            if ((x[0] == a && x[1] == b) || (x[0] == b && x[1] == a))
                return true;
        }
        return false;
    };
    Runtime.prototype.calculateSolidBounceAngle = function(inst, startx, starty, obj)
    {
        var objx = inst.x;
        var objy = inst.y;
        var radius = cr.max(10, cr.distanceTo(startx, starty, objx, objy));
        var startangle = cr.angleTo(startx, starty, objx, objy);
        var firstsolid = obj || this.testOverlapSolid(inst);
        if (!firstsolid)
            return cr.clamp_angle(startangle + cr.PI);
        var cursolid = firstsolid;
        var i, curangle, anticlockwise_free_angle, clockwise_free_angle;
        var increment = cr.to_radians(5);   // 5 degree increments
        for (i = 1; i < 36; i++)
        {
            curangle = startangle - i * increment;
            inst.x = startx + Math.cos(curangle) * radius;
            inst.y = starty + Math.sin(curangle) * radius;
            inst.set_bbox_changed();
            if (!this.testOverlap(inst, cursolid))
            {
                cursolid = obj ? null : this.testOverlapSolid(inst);
                if (!cursolid)
                {
                    anticlockwise_free_angle = curangle;
                    break;
                }
            }
        }
        if (i === 36)
            anticlockwise_free_angle = cr.clamp_angle(startangle + cr.PI);
        var cursolid = firstsolid;
        for (i = 1; i < 36; i++)
        {
            curangle = startangle + i * increment;
            inst.x = startx + Math.cos(curangle) * radius;
            inst.y = starty + Math.sin(curangle) * radius;
            inst.set_bbox_changed();
            if (!this.testOverlap(inst, cursolid))
            {
                cursolid = obj ? null : this.testOverlapSolid(inst);
                if (!cursolid)
                {
                    clockwise_free_angle = curangle;
                    break;
                }
            }
        }
        if (i === 36)
            clockwise_free_angle = cr.clamp_angle(startangle + cr.PI);
        inst.x = objx;
        inst.y = objy;
        inst.set_bbox_changed();
        if (clockwise_free_angle === anticlockwise_free_angle)
            return clockwise_free_angle;
        var half_diff = cr.angleDiff(clockwise_free_angle, anticlockwise_free_angle) / 2;
        var normal;
        if (cr.angleClockwise(clockwise_free_angle, anticlockwise_free_angle))
        {
            normal = cr.clamp_angle(anticlockwise_free_angle + half_diff + cr.PI);
        }
        else
        {
            normal = cr.clamp_angle(clockwise_free_angle + half_diff);
        }
;
        var vx = Math.cos(startangle);
        var vy = Math.sin(startangle);
        var nx = Math.cos(normal);
        var ny = Math.sin(normal);
        var v_dot_n = vx * nx + vy * ny;
        var rx = vx - 2 * v_dot_n * nx;
        var ry = vy - 2 * v_dot_n * ny;
        return cr.angleTo(0, 0, rx, ry);
    };
    var triggerSheetStack = [];
    var triggerSheetIndex = -1;
    Runtime.prototype.trigger = function (method, inst, value /* for fast triggers */)
    {
;
        if (!this.running_layout)
            return false;
        var sheet = this.running_layout.event_sheet;
        if (!sheet)
            return false;     // no event sheet active; nothing to trigger
        triggerSheetIndex++;
        if (triggerSheetIndex === triggerSheetStack.length)
            triggerSheetStack.push(new cr.ObjectSet());
        else
            triggerSheetStack[triggerSheetIndex].clear();
        var ret = this.triggerOnSheet(method, inst, sheet, value);
        triggerSheetIndex--;
        return ret;
    };
    Runtime.prototype.triggerOnSheet = function (method, inst, sheet, value)
    {
        var alreadyTriggeredSheets = triggerSheetStack[triggerSheetIndex];
        if (alreadyTriggeredSheets.contains(sheet))
            return false;
        alreadyTriggeredSheets.add(sheet);
        var includes = sheet.includes.valuesRef();
        var ret = false;
        var i, leni, r;
        for (i = 0, leni = includes.length; i < leni; i++)
        {
            r = this.triggerOnSheet(method, inst, includes[i], value);
            ret = ret || r;
        }
        if (!inst)
        {
            r = this.triggerOnSheetForTypeName(method, inst, "system", sheet, value);
            ret = ret || r;
        }
        else
        {
            r = this.triggerOnSheetForTypeName(method, inst, inst.type.name, sheet, value);
            ret = ret || r;
            for (i = 0, leni = inst.type.families.length; i < leni; i++)
            {
                r = this.triggerOnSheetForTypeName(method, inst, inst.type.families[i].name, sheet, value);
                ret = ret || r;
            }
        }
        return ret;             // true if anything got triggered
    };
    Runtime.prototype.triggerOnSheetForTypeName = function (method, inst, type_name, sheet, value)
    {
        var i, leni;
        var ret = false, ret2 = false;
        var trig, index;
        var fasttrigger = (typeof value !== "undefined");
        var triggers = (fasttrigger ? sheet.fasttriggers : sheet.triggers);
        var obj_entry = triggers[type_name];
        if (!obj_entry)
            return ret;
        var triggers_list = null;
        for (i = 0, leni = obj_entry.length; i < leni; i++)
        {
            if (obj_entry[i].method == method)
            {
                triggers_list = obj_entry[i].evs;
                break;
            }
        }
        if (!triggers_list)
            return ret;
        var triggers_to_fire;
        if (fasttrigger)
        {
            triggers_to_fire = triggers_list[value];
        }
        else
        {
            triggers_to_fire = triggers_list;
        }
        if (!triggers_to_fire)
            return null;
        for (i = 0, leni = triggers_to_fire.length; i < leni; i++)
        {
            trig = triggers_to_fire[i][0];
            index = triggers_to_fire[i][1];
            ret2 = this.executeSingleTrigger(inst, type_name, trig, index);
            ret = ret || ret2;
        }
        return ret;
    };
    Runtime.prototype.executeSingleTrigger = function (inst, type_name, trig, index)
    {
        var i, leni;
        var ret = false;
        var current_event = this.getCurrentEventStack().current_event;
        if (current_event)
            this.pushCleanSol(current_event.solModifiersIncludingParents);
        this.pushCleanSol(trig.solModifiersIncludingParents);
        this.pushLocalVarStack();
        var event_stack = this.pushEventStack(trig);
        event_stack.current_event = trig;
        if (inst)
        {
            var sol = this.types[type_name].getCurrentSol();
            sol.select_all = false;
            sol.instances.length = 1;
            sol.instances[0] = inst;
            this.types[type_name].applySolToContainer();
        }
        var ok_to_run = true;
        if (trig.parent)
        {
            var temp_parents_arr = event_stack.temp_parents_arr;
            var cur_parent = trig.parent;
            while (cur_parent)
            {
                temp_parents_arr.push(cur_parent);
                cur_parent = cur_parent.parent;
            }
            temp_parents_arr.reverse();
            for (i = 0, leni = temp_parents_arr.length; i < leni; i++)
            {
                if (!temp_parents_arr[i].run_pretrigger())   // parent event failed
                {
                    ok_to_run = false;
                    break;
                }
            }
        }
        if (ok_to_run)
        {
            this.execcount++;
            if (trig.orblock)
                trig.run_orblocktrigger(index);
            else
                trig.run();
            ret = ret || event_stack.last_event_true;
        }
        this.popEventStack();
        this.popLocalVarStack();
        this.popSol(trig.solModifiersIncludingParents);
        if (current_event)
            this.popSol(current_event.solModifiersIncludingParents);
        if (this.isInOnDestroy === 0 && triggerSheetIndex === 0 && !this.isRunningEvents && (!this.deathRow.isEmpty() || this.createRow.length))
        {
            this.ClearDeathRow();
        }
        return ret;
    };
    Runtime.prototype.getCurrentCondition = function ()
    {
        var evinfo = this.getCurrentEventStack();
        return evinfo.current_event.conditions[evinfo.cndindex];
    };
    Runtime.prototype.getCurrentAction = function ()
    {
        var evinfo = this.getCurrentEventStack();
        return evinfo.current_event.actions[evinfo.actindex];
    };
    Runtime.prototype.pushLocalVarStack = function ()
    {
        this.localvar_stack_index++;
        if (this.localvar_stack_index >= this.localvar_stack.length)
            this.localvar_stack.push([]);
    };
    Runtime.prototype.popLocalVarStack = function ()
    {
;
        this.localvar_stack_index--;
    };
    Runtime.prototype.getCurrentLocalVarStack = function ()
    {
        return this.localvar_stack[this.localvar_stack_index];
    };
    Runtime.prototype.pushEventStack = function (cur_event)
    {
        this.event_stack_index++;
        if (this.event_stack_index >= this.event_stack.length)
            this.event_stack.push(new cr.eventStackFrame());
        var ret = this.getCurrentEventStack();
        ret.reset(cur_event);
        return ret;
    };
    Runtime.prototype.popEventStack = function ()
    {
;
        this.event_stack_index--;
    };
    Runtime.prototype.getCurrentEventStack = function ()
    {
        return this.event_stack[this.event_stack_index];
    };
    Runtime.prototype.pushLoopStack = function (name_)
    {
        this.loop_stack_index++;
        if (this.loop_stack_index >= this.loop_stack.length)
        {
            this.loop_stack.push(cr.seal({ name: name_, index: 0, stopped: false }));
        }
        var ret = this.getCurrentLoop();
        ret.name = name_;
        ret.index = 0;
        ret.stopped = false;
        return ret;
    };
    Runtime.prototype.popLoopStack = function ()
    {
;
        this.loop_stack_index--;
    };
    Runtime.prototype.getCurrentLoop = function ()
    {
        return this.loop_stack[this.loop_stack_index];
    };
    Runtime.prototype.getEventVariableByName = function (name, scope)
    {
        var i, leni, j, lenj, sheet, e;
        while (scope)
        {
            for (i = 0, leni = scope.subevents.length; i < leni; i++)
            {
                e = scope.subevents[i];
                if (e instanceof cr.eventvariable && name.toLowerCase() === e.name.toLowerCase())
                    return e;
            }
            scope = scope.parent;
        }
        for (i = 0, leni = this.eventsheets_by_index.length; i < leni; i++)
        {
            sheet = this.eventsheets_by_index[i];
            for (j = 0, lenj = sheet.events.length; j < lenj; j++)
            {
                e = sheet.events[j];
                if (e instanceof cr.eventvariable && name.toLowerCase() === e.name.toLowerCase())
                    return e;
            }
        }
        return null;
    };
    cr.runtime = Runtime;
    cr.createRuntime = function (canvasid)
    {
        return new Runtime(document.getElementById(canvasid));
    };
    cr.createDCRuntime = function (w, h)
    {
        return new Runtime({ "dc": true, "width": w, "height": h });
    };
    window["cr_createRuntime"] = cr.createRuntime;
    window["cr_createDCRuntime"] = cr.createDCRuntime;
    window["createCocoonJSRuntime"] = function ()
    {
        window["c2cocoonjs"] = true;
        var canvas = document.createElement("canvas");
        document.body.appendChild(canvas);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        var rt = new Runtime(canvas);
        window["c2runtime"] = rt;
        window.addEventListener("orientationchange", function () {
            window["c2runtime"]["setSize"](window.innerWidth, window.innerHeight);
        });
        return rt;
    };
}());
window["cr_getC2Runtime"] = function()
{
    var canvas = document.getElementById("c2canvas");
    if (canvas)
        return canvas["c2runtime"];
    else if (window["c2runtime"])
        return window["c2runtime"];
}
window["cr_sizeCanvas"] = function(w, h)
{
    if (w === 0 || h === 0)
        return;
    var runtime = window["cr_getC2Runtime"]();
    if (runtime)
        runtime["setSize"](w, h);
}
window["cr_setSuspended"] = function(s)
{
    var runtime = window["cr_getC2Runtime"]();
    if (runtime)
        runtime["setSuspended"](s);
}
;
(function()
{
    function Layout(runtime, m)
    {
        this.runtime = runtime;
        this.event_sheet = null;
        this.scrollX = (this.runtime.original_width / 2);
        this.scrollY = (this.runtime.original_height / 2);
        this.scale = 1.0;
        this.angle = 0;
        this.name = m[0];
        this.width = m[1];
        this.height = m[2];
        this.unbounded_scrolling = m[3];
        this.sheetname = m[4];
        var lm = m[5];
        var i, len;
        this.layers = [];
        for (i = 0, len = lm.length; i < len; i++)
        {
            var layer = new cr.layer(this, lm[i]);
            layer.number = i;
            cr.seal(layer);
            this.layers.push(layer);
        }
        var im = m[6];
        this.initial_nonworld = [];
        for (i = 0, len = im.length; i < len; i++)
        {
            var inst = im[i];
            var type = this.runtime.types_by_index[inst[1]];
;
            if (!type.default_instance)
                type.default_instance = inst;
            this.initial_nonworld.push(inst);
        }
        this.effect_types = [];
        this.active_effect_types = [];
        this.effect_params = [];
        for (i = 0, len = m[7].length; i < len; i++)
        {
            this.effect_types.push({
                id: m[7][i][0],
                name: m[7][i][1],
                shaderindex: -1,
                active: true,
                index: i
            });
            this.effect_params.push(m[7][i][2].slice(0));
        }
        this.updateActiveEffects();
        this.rcTex = new cr.rect(0, 0, 1, 1);
        this.rcTex2 = new cr.rect(0, 0, 1, 1);
    };
    Layout.prototype.hasOpaqueBottomLayer = function ()
    {
        var layer = this.layers[0];
        return !layer.transparent && layer.opacity === 1.0 && !layer.forceOwnTexture && layer.visible;
    };
    Layout.prototype.updateActiveEffects = function ()
    {
        this.active_effect_types.length = 0;
        var i, len, et;
        for (i = 0, len = this.effect_types.length; i < len; i++)
        {
            et = this.effect_types[i];
            if (et.active)
                this.active_effect_types.push(et);
        }
    };
    Layout.prototype.getEffectByName = function (name_)
    {
        var i, len, et;
        for (i = 0, len = this.effect_types.length; i < len; i++)
        {
            et = this.effect_types[i];
            if (et.name === name_)
                return et;
        }
        return null;
    };
    Layout.prototype.startRunning = function ()
    {
        if (this.sheetname)
        {
            this.event_sheet = this.runtime.eventsheets[this.sheetname];
;
        }
        this.runtime.running_layout = this;
        this.scrollX = (this.runtime.original_width / 2);
        this.scrollY = (this.runtime.original_height / 2);
        var i, k, len, lenk, type, type_instances, inst;
        for (i = 0, len = this.runtime.types_by_index.length; i < len; i++)
        {
            type = this.runtime.types_by_index[i];
            if (type.is_family)
                continue;       // instances are only transferred for their real type
            type_instances = type.instances;
            for (k = 0, lenk = type_instances.length; k < lenk; k++)
            {
                inst = type_instances[k];
                if (inst.layer)
                {
                    var num = inst.layer.number;
                    if (num >= this.layers.length)
                        num = this.layers.length - 1;
                    inst.layer = this.layers[num];
                    inst.layer.instances.push(inst);
                    inst.layer.zindices_stale = true;
                }
            }
        }
        var layer;
        for (i = 0, len = this.layers.length; i < len; i++)
        {
            layer = this.layers[i];
            layer.createInitialInstances();
            layer.disableAngle = true;
            var px = layer.canvasToLayer(0, 0, true);
            var py = layer.canvasToLayer(0, 0, false);
            layer.disableAngle = false;
            if (this.runtime.pixel_rounding)
            {
                px = (px + 0.5) | 0;
                py = (py + 0.5) | 0;
            }
            layer.rotateViewport(px, py, null);
        }
        for (i = 0, len = this.initial_nonworld.length; i < len; i++)
        {
            inst = this.runtime.createInstanceFromInit(this.initial_nonworld[i], null, true);
;
        }
        this.runtime.changelayout = null;
        this.runtime.ClearDeathRow();
        this.runtime.trigger(cr.system_object.prototype.cnds.OnLayoutStart, null);
        for (i = 0, len = this.runtime.types_by_index.length; i < len; i++)
        {
            type = this.runtime.types_by_index[i];
            if (type.unloadTextures)
                type.unloadTextures();
        }
/*
        if (this.runtime.glwrap)
        {
            console.log("Estimated VRAM at layout start: " + this.runtime.glwrap.textureCount() + " textures, approx. " + Math.round(this.runtime.glwrap.estimateVRAM() / 1024) + " kb");
        }
*/
    };
    Layout.prototype.createGlobalNonWorlds = function ()
    {
        var i, k, len, initial_inst, inst, type;
        for (i = 0, k = 0, len = this.initial_nonworld.length; i < len; i++)
        {
            initial_inst = this.initial_nonworld[i];
            type = this.runtime.types_by_index[initial_inst[1]];
            if (type.global)
                inst = this.runtime.createInstanceFromInit(initial_inst, null, true);
            else
            {
                this.initial_nonworld[k] = initial_inst;
                k++;
            }
        }
        this.initial_nonworld.length = k;
    };
    Layout.prototype.stopRunning = function ()
    {
;
/*
        if (this.runtime.glwrap)
        {
            console.log("Estimated VRAM at layout end: " + this.runtime.glwrap.textureCount() + " textures, approx. " + Math.round(this.runtime.glwrap.estimateVRAM() / 1024) + " kb");
        }
*/
        this.runtime.trigger(cr.system_object.prototype.cnds.OnLayoutEnd, null);
        this.runtime.system.waits.length = 0;
        var i, leni, j, lenj;
        var layer_instances, inst, type;
        for (i = 0, leni = this.layers.length; i < leni; i++)
        {
            layer_instances = this.layers[i].instances;
            for (j = 0, lenj = layer_instances.length; j < lenj; j++)
            {
                inst = layer_instances[j];
                if (!inst.type.global)
                    this.runtime.DestroyInstance(inst);
            }
            this.runtime.ClearDeathRow();
            layer_instances.length = 0;
            this.layers[i].zindices_stale = true;
        }
        for (i = 0, leni = this.runtime.types_by_index.length; i < leni; i++)
        {
            type = this.runtime.types_by_index[i];
            if (type.global || type.plugin.is_world || type.plugin.singleglobal)
                continue;
            for (j = 0, lenj = type.instances.length; j < lenj; j++)
                this.runtime.DestroyInstance(type.instances[j]);
            this.runtime.ClearDeathRow();
        }
    };
    Layout.prototype.draw = function (ctx)
    {
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        if (this.runtime.clearBackground && !this.hasOpaqueBottomLayer())
            ctx.clearRect(0, 0, this.runtime.width, this.runtime.height);
        var i, len, l;
        for (i = 0, len = this.layers.length; i < len; i++)
        {
            l = this.layers[i];
            if (l.visible && l.opacity > 0 && l.blend_mode !== 11)
                l.draw(ctx);
        }
    };
    Layout.prototype.drawGL = function (glw)
    {
        if (this.runtime.clearBackground && !this.hasOpaqueBottomLayer())
            glw.clear(0, 0, 0, 0);
        var render_to_texture = (this.active_effect_types.length > 0 || this.runtime.uses_background_blending);
        if (render_to_texture)
        {
            if (!this.runtime.layout_tex)
            {
                this.runtime.layout_tex = glw.createEmptyTexture(this.runtime.width, this.runtime.height, this.runtime.linearSampling);
            }
            if (this.runtime.layout_tex.c2width !== this.runtime.width || this.runtime.layout_tex.c2height !== this.runtime.height)
            {
                glw.deleteTexture(this.runtime.layout_tex);
                this.runtime.layout_tex = glw.createEmptyTexture(this.runtime.width, this.runtime.height, this.runtime.linearSampling);
            }
            glw.setRenderingToTexture(this.runtime.layout_tex);
        }
        var i, len;
        for (i = 0, len = this.layers.length; i < len; i++)
        {
            if (this.layers[i].visible && this.layers[i].opacity > 0)
                this.layers[i].drawGL(glw);
        }
        if (render_to_texture)
        {
            if (this.active_effect_types.length <= 1)
            {
                if (this.active_effect_types.length === 1)
                {
                    var etindex = this.active_effect_types[0].index;
                    glw.switchProgram(this.active_effect_types[0].shaderindex);
                    glw.setProgramParameters(null,                              // backTex
                                             1.0 / this.runtime.width,          // pixelWidth
                                             1.0 / this.runtime.height,         // pixelHeight
                                             0.0, 0.0,                          // destStart
                                             1.0, 1.0,                          // destEnd
                                             this.scale,                        // layerScale
                                             this.effect_params[etindex]);      // fx parameters
                    if (glw.programIsAnimated(this.active_effect_types[0].shaderindex))
                        this.runtime.redraw = true;
                }
                else
                    glw.switchProgram(0);
                glw.setRenderingToTexture(null);                // to backbuffer
                glw.setOpacity(1);
                glw.setTexture(this.runtime.layout_tex);
                glw.setAlphaBlend();
                glw.resetModelView();
                glw.updateModelView();
                var halfw = this.runtime.width / 2;
                var halfh = this.runtime.height / 2;
                glw.quad(-halfw, halfh, halfw, halfh, halfw, -halfh, -halfw, -halfh);
                glw.setTexture(null);
            }
            else
            {
                this.renderEffectChain(glw, null, null, null);
            }
        }
        glw.present();
    };
    Layout.prototype.getRenderTarget = function()
    {
        return (this.active_effect_types.length > 0 || this.runtime.uses_background_blending) ? this.runtime.layout_tex : null;
    };
    Layout.prototype.getMinLayerScale = function ()
    {
        var m = this.layers[0].getScale();
        var i, len, l;
        for (i = 1, len = this.layers.length; i < len; i++)
        {
            l = this.layers[i];
            if (l.parallaxX === 0 && l.parallaxY === 0)
                continue;
            if (l.getScale() < m)
                m = l.getScale();
        }
        return m;
    };
    Layout.prototype.scrollToX = function (x)
    {
        if (!this.unbounded_scrolling)
        {
            var widthBoundary = (this.runtime.width * (1 / this.getMinLayerScale()) / 2);
            if (x > this.width - widthBoundary)
                x = this.width - widthBoundary;
            if (x < widthBoundary)
                x = widthBoundary;
        }
        if (this.scrollX !== x)
        {
            this.scrollX = x;
            this.runtime.redraw = true;
        }
    };
    Layout.prototype.scrollToY = function (y)
    {
        if (!this.unbounded_scrolling)
        {
            var heightBoundary = (this.runtime.height * (1 / this.getMinLayerScale()) / 2);
            if (y > this.height - heightBoundary)
                y = this.height - heightBoundary;
            if (y < heightBoundary)
                y = heightBoundary;
        }
        if (this.scrollY !== y)
        {
            this.scrollY = y;
            this.runtime.redraw = true;
        }
    };
    Layout.prototype.renderEffectChain = function (glw, layer, inst, rendertarget)
    {
        var active_effect_types = inst ?
                            inst.active_effect_types :
                            layer ?
                                layer.active_effect_types :
                                this.active_effect_types;
        var layerScale = inst ? inst.layer.getScale() :
                            layer ? layer.getScale() : 1;
        var fx_tex = this.runtime.fx_tex;
        var i, len, last, temp, fx_index = 0, other_fx_index = 1;
        var y, h;
        var windowWidth = this.runtime.width;
        var windowHeight = this.runtime.height;
        var halfw = windowWidth / 2;
        var halfh = windowHeight / 2;
        var rcTex = layer ? layer.rcTex : this.rcTex;
        var rcTex2 = layer ? layer.rcTex2 : this.rcTex2;
        var screenleft = 0, clearleft = 0;
        var screentop = 0, cleartop = 0;
        var screenright = windowWidth, clearright = windowWidth;
        var screenbottom = windowHeight, clearbottom = windowHeight;
        var boxExtendHorizontal = 0;
        var boxExtendVertical = 0;
        var inst_layer_angle = inst ? inst.layer.getAngle() : 0;
        if (inst)
        {
            for (i = 0, len = active_effect_types.length; i < len; i++)
            {
                boxExtendHorizontal += glw.getProgramBoxExtendHorizontal(active_effect_types[i].shaderindex);
                boxExtendVertical += glw.getProgramBoxExtendVertical(active_effect_types[i].shaderindex);
            }
            var bbox = inst.bbox;
            screenleft = layer.layerToCanvas(bbox.left, bbox.top, true);
            screentop = layer.layerToCanvas(bbox.left, bbox.top, false);
            screenright = layer.layerToCanvas(bbox.right, bbox.bottom, true);
            screenbottom = layer.layerToCanvas(bbox.right, bbox.bottom, false);
            if (inst_layer_angle !== 0)
            {
                var screentrx = layer.layerToCanvas(bbox.right, bbox.top, true);
                var screentry = layer.layerToCanvas(bbox.right, bbox.top, false);
                var screenblx = layer.layerToCanvas(bbox.left, bbox.bottom, true);
                var screenbly = layer.layerToCanvas(bbox.left, bbox.bottom, false);
                temp = Math.min(screenleft, screenright, screentrx, screenblx);
                screenright = Math.max(screenleft, screenright, screentrx, screenblx);
                screenleft = temp;
                temp = Math.min(screentop, screenbottom, screentry, screenbly);
                screenbottom = Math.max(screentop, screenbottom, screentry, screenbly);
                screentop = temp;
            }
            screenleft -= boxExtendHorizontal;
            screentop -= boxExtendVertical;
            screenright += boxExtendHorizontal;
            screenbottom += boxExtendVertical;
            rcTex2.left = screenleft / windowWidth;
            rcTex2.top = 1 - screentop / windowHeight;
            rcTex2.right = screenright / windowWidth;
            rcTex2.bottom = 1 - screenbottom / windowHeight;
            clearleft = screenleft = Math.floor(screenleft);
            cleartop = screentop = Math.floor(screentop);
            clearright = screenright = Math.ceil(screenright);
            clearbottom = screenbottom = Math.ceil(screenbottom);
            clearleft -= boxExtendHorizontal;
            cleartop -= boxExtendVertical;
            clearright += boxExtendHorizontal;
            clearbottom += boxExtendVertical;
            if (screenleft < 0)                 screenleft = 0;
            if (screentop < 0)                  screentop = 0;
            if (screenright > windowWidth)      screenright = windowWidth;
            if (screenbottom > windowHeight)    screenbottom = windowHeight;
            if (clearleft < 0)                  clearleft = 0;
            if (cleartop < 0)                   cleartop = 0;
            if (clearright > windowWidth)       clearright = windowWidth;
            if (clearbottom > windowHeight)     clearbottom = windowHeight;
            rcTex.left = screenleft / windowWidth;
            rcTex.top = 1 - screentop / windowHeight;
            rcTex.right = screenright / windowWidth;
            rcTex.bottom = 1 - screenbottom / windowHeight;
        }
        else
        {
            rcTex.left = rcTex2.left = 0;
            rcTex.top = rcTex2.top = 0;
            rcTex.right = rcTex2.right = 1;
            rcTex.bottom = rcTex2.bottom = 1;
        }
        var pre_draw = (inst && (((inst.angle || inst_layer_angle) && glw.programUsesDest(active_effect_types[0].shaderindex)) || boxExtendHorizontal !== 0 || boxExtendVertical !== 0 || inst.opacity !== 1 || inst.type.plugin.must_predraw)) || (layer && !inst && layer.opacity !== 1);
        glw.setAlphaBlend();
        if (pre_draw)
        {
            if (!fx_tex[fx_index])
            {
                fx_tex[fx_index] = glw.createEmptyTexture(windowWidth, windowHeight, this.runtime.linearSampling);
            }
            if (fx_tex[fx_index].c2width !== windowWidth || fx_tex[fx_index].c2height !== windowHeight)
            {
                glw.deleteTexture(fx_tex[fx_index]);
                fx_tex[fx_index] = glw.createEmptyTexture(windowWidth, windowHeight, this.runtime.linearSampling);
            }
            glw.switchProgram(0);
            glw.setRenderingToTexture(fx_tex[fx_index]);
            h = clearbottom - cleartop;
            y = (windowHeight - cleartop) - h;
            glw.clearRect(clearleft, y, clearright - clearleft, h);
            if (inst)
            {
                inst.drawGL(glw);
            }
            else
            {
                glw.setTexture(this.runtime.layer_tex);
                glw.setOpacity(layer.opacity);
                glw.resetModelView();
                glw.translate(-halfw, -halfh);
                glw.updateModelView();
                glw.quadTex(screenleft, screenbottom, screenright, screenbottom, screenright, screentop, screenleft, screentop, rcTex);
            }
            rcTex2.left = rcTex2.top = 0;
            rcTex2.right = rcTex2.bottom = 1;
            if (inst)
            {
                temp = rcTex.top;
                rcTex.top = rcTex.bottom;
                rcTex.bottom = temp;
            }
            fx_index = 1;
            other_fx_index = 0;
        }
        glw.setOpacity(1);
        var last = active_effect_types.length - 1;
        var post_draw = glw.programUsesCrossSampling(active_effect_types[last].shaderindex);
        var etindex = 0;
        for (i = 0, len = active_effect_types.length; i < len; i++)
        {
            if (!fx_tex[fx_index])
            {
                fx_tex[fx_index] = glw.createEmptyTexture(windowWidth, windowHeight, this.runtime.linearSampling);
            }
            if (fx_tex[fx_index].c2width !== windowWidth || fx_tex[fx_index].c2height !== windowHeight)
            {
                glw.deleteTexture(fx_tex[fx_index]);
                fx_tex[fx_index] = glw.createEmptyTexture(windowWidth, windowHeight, this.runtime.linearSampling);
            }
            glw.switchProgram(active_effect_types[i].shaderindex);
            etindex = active_effect_types[i].index;
            if (glw.programIsAnimated(active_effect_types[i].shaderindex))
                this.runtime.redraw = true;
            if (i == 0 && !pre_draw)
            {
                glw.setRenderingToTexture(fx_tex[fx_index]);
                h = clearbottom - cleartop;
                y = (windowHeight - cleartop) - h;
                glw.clearRect(clearleft, y, clearright - clearleft, h);
                if (inst)
                {
                    glw.setProgramParameters(rendertarget,                  // backTex
                                             1.0 / inst.width,              // pixelWidth
                                             1.0 / inst.height,             // pixelHeight
                                             rcTex2.left, rcTex2.top,       // destStart
                                             rcTex2.right, rcTex2.bottom,   // destEnd
                                             layerScale,
                                             inst.effect_params[etindex]);  // fx params
                    inst.drawGL(glw);
                }
                else
                {
                    glw.setProgramParameters(rendertarget,                  // backTex
                                             1.0 / windowWidth,             // pixelWidth
                                             1.0 / windowHeight,            // pixelHeight
                                             0.0, 0.0,                      // destStart
                                             1.0, 1.0,                      // destEnd
                                             layerScale,
                                             layer ?                        // fx params
                                                layer.effect_params[etindex] :
                                                this.effect_params[etindex]);
                    glw.setTexture(layer ? this.runtime.layer_tex : this.runtime.layout_tex);
                    glw.resetModelView();
                    glw.translate(-halfw, -halfh);
                    glw.updateModelView();
                    glw.quadTex(screenleft, screenbottom, screenright, screenbottom, screenright, screentop, screenleft, screentop, rcTex);
                }
                rcTex2.left = rcTex2.top = 0;
                rcTex2.right = rcTex2.bottom = 1;
                if (inst && !post_draw)
                {
                    temp = screenbottom;
                    screenbottom = screentop;
                    screentop = temp;
                }
            }
            else
            {
                glw.setProgramParameters(rendertarget,                      // backTex
                                         1.0 / windowWidth,                 // pixelWidth
                                         1.0 / windowHeight,                // pixelHeight
                                         rcTex2.left, rcTex2.top,           // destStart
                                         rcTex2.right, rcTex2.bottom,       // destEnd
                                         layerScale,
                                         inst ?                             // fx params
                                            inst.effect_params[etindex] :
                                            layer ?
                                                layer.effect_params[etindex] :
                                                this.effect_params[etindex]);
                if (i === last && !post_draw)
                {
                    if (inst)
                        glw.setBlend(inst.srcBlend, inst.destBlend);
                    else if (layer)
                        glw.setBlend(layer.srcBlend, layer.destBlend);
                    glw.setRenderingToTexture(rendertarget);
                }
                else
                {
                    glw.setRenderingToTexture(fx_tex[fx_index]);
                    h = clearbottom - cleartop;
                    y = (windowHeight - cleartop) - h;
                    glw.clearRect(clearleft, y, clearright - clearleft, h);
                }
                glw.setTexture(fx_tex[other_fx_index]);
                glw.resetModelView();
                glw.translate(-halfw, -halfh);
                glw.updateModelView();
                glw.quadTex(screenleft, screenbottom, screenright, screenbottom, screenright, screentop, screenleft, screentop, rcTex);
                if (i === last && !post_draw)
                    glw.setTexture(null);
            }
            fx_index = (fx_index === 0 ? 1 : 0);
            other_fx_index = (fx_index === 0 ? 1 : 0);      // will be opposite to fx_index since it was just assigned
        }
        if (post_draw)
        {
            glw.switchProgram(0);
            if (inst)
                glw.setBlend(inst.srcBlend, inst.destBlend);
            else if (layer)
                glw.setBlend(layer.srcBlend, layer.destBlend);
            glw.setRenderingToTexture(rendertarget);
            glw.setTexture(fx_tex[other_fx_index]);
            glw.resetModelView();
            glw.translate(-halfw, -halfh);
            glw.updateModelView();
            if (inst && active_effect_types.length === 1 && !pre_draw)
                glw.quadTex(screenleft, screentop, screenright, screentop, screenright, screenbottom, screenleft, screenbottom, rcTex);
            else
                glw.quadTex(screenleft, screenbottom, screenright, screenbottom, screenright, screentop, screenleft, screentop, rcTex);
            glw.setTexture(null);
        }
    };
    cr.layout = Layout;
    function Layer(layout, m)
    {
        this.layout = layout;
        this.runtime = layout.runtime;
        this.instances = [];        // running instances
        this.scale = 1.0;
        this.angle = 0;
        this.disableAngle = false;
        this.tmprect = new cr.rect(0, 0, 0, 0);
        this.tmpquad = new cr.quad();
        this.viewLeft = 0;
        this.viewRight = 0;
        this.viewTop = 0;
        this.viewBottom = 0;
        this.zindices_stale = false;
        this.name = m[0];
        this.index = m[1];
        this.visible = m[2];        // initially visible
        this.background_color = m[3];
        this.transparent = m[4];
        this.parallaxX = m[5];
        this.parallaxY = m[6];
        this.opacity = m[7];
        this.forceOwnTexture = m[8];
        this.zoomRate = m[9];
        this.blend_mode = m[10];
        this.effect_fallback = m[11];
        this.compositeOp = "source-over";
        this.srcBlend = 0;
        this.destBlend = 0;
        this.render_offscreen = false;
        var im = m[12];
        var i, len;
        this.initial_instances = [];
        for (i = 0, len = im.length; i < len; i++)
        {
            var inst = im[i];
            var type = this.runtime.types_by_index[inst[1]];
;
            if (!type.default_instance)
                type.default_instance = inst;
            this.initial_instances.push(inst);
        }
        this.effect_types = [];
        this.active_effect_types = [];
        this.effect_params = [];
        for (i = 0, len = m[13].length; i < len; i++)
        {
            this.effect_types.push({
                id: m[13][i][0],
                name: m[13][i][1],
                shaderindex: -1,
                active: true,
                index: i
            });
            this.effect_params.push(m[13][i][2].slice(0));
        }
        this.updateActiveEffects();
        this.rcTex = new cr.rect(0, 0, 1, 1);
        this.rcTex2 = new cr.rect(0, 0, 1, 1);
    };
    Layer.prototype.updateActiveEffects = function ()
    {
        this.active_effect_types.length = 0;
        var i, len, et;
        for (i = 0, len = this.effect_types.length; i < len; i++)
        {
            et = this.effect_types[i];
            if (et.active)
                this.active_effect_types.push(et);
        }
    };
    Layer.prototype.getEffectByName = function (name_)
    {
        var i, len, et;
        for (i = 0, len = this.effect_types.length; i < len; i++)
        {
            et = this.effect_types[i];
            if (et.name === name_)
                return et;
        }
        return null;
    };
    var created_instances = [];
    Layer.prototype.createInitialInstances = function ()
    {
        created_instances.length = 0;
        var i, k, len, lenk, inst, t, iid, s;
        for (i = 0, k = 0, len = this.initial_instances.length; i < len; i++)
        {
            inst = this.runtime.createInstanceFromInit(this.initial_instances[i], this, true);
            created_instances.push(inst);
            if (inst && !inst.type.global)
            {
                this.initial_instances[k] = this.initial_instances[i];
                k++;
            }
        }
        this.initial_instances.length = k;
        this.runtime.ClearDeathRow();       // flushes creation row so IIDs will be correct
        for (i = 0; i < created_instances.length; i++)
        {
            inst = created_instances[i];
            if (!inst.type.is_contained)
                continue;
            iid = inst.get_iid();
            for (k = 0, lenk = inst.type.container.length; k < lenk; k++)
            {
                t = inst.type.container[k];
                if (inst.type === t)
                    continue;
                if (t.instances.length > iid)
                    inst.siblings.push(t.instances[iid]);
                else
                {
                    if (!t.default_instance)
                    {
                    }
                    else
                    {
                        s = this.runtime.createInstanceFromInit(t.default_instance, this, true, inst.x, inst.y, true);
                        this.runtime.ClearDeathRow();
                        t.updateIIDs();
                        inst.siblings.push(s);
                        created_instances.push(s);      // come back around and link up its own instances too
                    }
                }
            }
        }
        if (!this.runtime.glwrap && this.effect_types.length)   // no WebGL renderer and shaders used
            this.blend_mode = this.effect_fallback;             // use fallback blend mode
        this.compositeOp = cr.effectToCompositeOp(this.blend_mode);
        if (this.runtime.gl)
            cr.setGLBlend(this, this.blend_mode, this.runtime.gl);
    };
    Layer.prototype.updateZIndices = function ()
    {
        if (!this.zindices_stale)
            return;
        var i, len;
        for (i = 0, len = this.instances.length; i < len; i++)
        {
;
;
            this.instances[i].zindex = i;
        }
        this.zindices_stale = false;
    };
    Layer.prototype.getScale = function ()
    {
        return this.getNormalScale() * this.runtime.aspect_scale;
    };
    Layer.prototype.getNormalScale = function ()
    {
        return ((this.scale * this.layout.scale) - 1) * this.zoomRate + 1;
    };
    Layer.prototype.getAngle = function ()
    {
        if (this.disableAngle)
            return 0;
        return cr.clamp_angle(this.layout.angle + this.angle);
    };
    Layer.prototype.draw = function (ctx)
    {
        this.render_offscreen = (this.forceOwnTexture || this.opacity !== 1.0 || this.blend_mode !== 0);
        var layer_canvas = this.runtime.canvas;
        var layer_ctx = ctx;
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        if (this.render_offscreen)
        {
            if (!this.runtime.layer_canvas)
            {
                this.runtime.layer_canvas = document.createElement("canvas");
;
                layer_canvas = this.runtime.layer_canvas;
                layer_canvas.width = this.runtime.width;
                layer_canvas.height = this.runtime.height;
                this.runtime.layer_ctx = layer_canvas.getContext("2d");
;
            }
            layer_canvas = this.runtime.layer_canvas;
            layer_ctx = this.runtime.layer_ctx;
            if (layer_canvas.width !== this.runtime.width)
                layer_canvas.width = this.runtime.width;
            if (layer_canvas.height !== this.runtime.height)
                layer_canvas.height = this.runtime.height;
            if (this.transparent)
                layer_ctx.clearRect(0, 0, this.runtime.width, this.runtime.height);
        }
        if (!this.transparent)
        {
            layer_ctx.fillStyle = "rgb(" + this.background_color[0] + "," + this.background_color[1] + "," + this.background_color[2] + ")";
            layer_ctx.fillRect(0, 0, this.runtime.width, this.runtime.height);
        }
        layer_ctx.save();
        this.disableAngle = true;
        var px = this.canvasToLayer(0, 0, true);
        var py = this.canvasToLayer(0, 0, false);
        this.disableAngle = false;
        if (this.runtime.pixel_rounding)
        {
            px = (px + 0.5) | 0;
            py = (py + 0.5) | 0;
        }
        this.rotateViewport(px, py, layer_ctx);
        var myscale = this.getScale();
        layer_ctx.scale(myscale, myscale);
        layer_ctx.translate(-px, -py);
        var i, len, inst, bbox;
        for (i = 0, len = this.instances.length; i < len; i++)
        {
            inst = this.instances[i];
            if (!inst.visible || inst.width === 0 || inst.height === 0)
                continue;
            inst.update_bbox();
            bbox = inst.bbox;
            if (bbox.right < this.viewLeft || bbox.bottom < this.viewTop || bbox.left > this.viewRight || bbox.top > this.viewBottom)
                continue;
            layer_ctx.globalCompositeOperation = inst.compositeOp;
            inst.draw(layer_ctx);
        }
        layer_ctx.restore();
        if (this.render_offscreen)
        {
            ctx.globalCompositeOperation = this.compositeOp;
            ctx.globalAlpha = this.opacity;
            ctx.drawImage(layer_canvas, 0, 0);
        }
    };
    Layer.prototype.rotateViewport = function (px, py, ctx)
    {
        var myscale = this.getScale();
        this.viewLeft = px;
        this.viewTop = py;
        this.viewRight = px + (this.runtime.width * (1 / myscale));
        this.viewBottom = py + (this.runtime.height * (1 / myscale));
        var myAngle = this.getAngle();
        if (myAngle !== 0)
        {
            if (ctx)
            {
                ctx.translate(this.runtime.width / 2, this.runtime.height / 2);
                ctx.rotate(-myAngle);
                ctx.translate(this.runtime.width / -2, this.runtime.height / -2);
            }
            this.tmprect.set(this.viewLeft, this.viewTop, this.viewRight, this.viewBottom);
            this.tmprect.offset((this.viewLeft + this.viewRight) / -2, (this.viewTop + this.viewBottom) / -2);
            this.tmpquad.set_from_rotated_rect(this.tmprect, myAngle);
            this.tmpquad.bounding_box(this.tmprect);
            this.tmprect.offset((this.viewLeft + this.viewRight) / 2, (this.viewTop + this.viewBottom) / 2);
            this.viewLeft = this.tmprect.left;
            this.viewTop = this.tmprect.top;
            this.viewRight = this.tmprect.right;
            this.viewBottom = this.tmprect.bottom;
        }
    }
    Layer.prototype.drawGL = function (glw)
    {
        var windowWidth = this.runtime.width;
        var windowHeight = this.runtime.height;
        var shaderindex = 0;
        var etindex = 0;
        this.render_offscreen = (this.forceOwnTexture || this.opacity !== 1.0 || this.active_effect_types.length > 0 || this.blend_mode !== 0);
        if (this.render_offscreen)
        {
            if (!this.runtime.layer_tex)
            {
                this.runtime.layer_tex = glw.createEmptyTexture(this.runtime.width, this.runtime.height, this.runtime.linearSampling);
            }
            if (this.runtime.layer_tex.c2width !== this.runtime.width || this.runtime.layer_tex.c2height !== this.runtime.height)
            {
                glw.deleteTexture(this.runtime.layer_tex);
                this.runtime.layer_tex = glw.createEmptyTexture(this.runtime.width, this.runtime.height, this.runtime.linearSampling);
            }
            glw.setRenderingToTexture(this.runtime.layer_tex);
            if (this.transparent)
                glw.clear(0, 0, 0, 0);
        }
        if (!this.transparent)
        {
            glw.clear(this.background_color[0] / 255, this.background_color[1] / 255, this.background_color[2] / 255, 1);
        }
        this.disableAngle = true;
        var px = this.canvasToLayer(0, 0, true);
        var py = this.canvasToLayer(0, 0, false);
        this.disableAngle = false;
        if (this.runtime.pixel_rounding)
        {
            px = (px + 0.5) | 0;
            py = (py + 0.5) | 0;
        }
        this.rotateViewport(px, py, null);
        var myscale = this.getScale();
        glw.resetModelView();
        glw.scale(myscale, myscale);
        glw.rotateZ(-this.getAngle());
        glw.translate((this.viewLeft + this.viewRight) / -2, (this.viewTop + this.viewBottom) / -2);
        glw.updateModelView();
        var i, len, inst, bbox;
        for (i = 0, len = this.instances.length; i < len; i++)
        {
            inst = this.instances[i];
            if (!inst.visible || inst.width === 0 || inst.height === 0)
                continue;
            inst.update_bbox();
            bbox = inst.bbox;
            if (bbox.right < this.viewLeft || bbox.bottom < this.viewTop || bbox.left > this.viewRight || bbox.top > this.viewBottom)
                continue;
            if (inst.uses_shaders)
            {
                shaderindex = inst.active_effect_types[0].shaderindex;
                etindex = inst.active_effect_types[0].index;
                if (inst.active_effect_types.length === 1 && !glw.programUsesCrossSampling(shaderindex) &&
                    !glw.programExtendsBox(shaderindex) && ((!inst.angle && !inst.layer.getAngle()) || !glw.programUsesDest(shaderindex)) &&
                    inst.opacity === 1 && !inst.type.plugin.must_predraw)
                {
                    glw.switchProgram(shaderindex);
                    glw.setBlend(inst.srcBlend, inst.destBlend);
                    if (glw.programIsAnimated(shaderindex))
                        this.runtime.redraw = true;
                    var destStartX = 0, destStartY = 0, destEndX = 0, destEndY = 0;
                    if (glw.programUsesDest(shaderindex))
                    {
                        var bbox = inst.bbox;
                        var screenleft = this.layerToCanvas(bbox.left, bbox.top, true);
                        var screentop = this.layerToCanvas(bbox.left, bbox.top, false);
                        var screenright = this.layerToCanvas(bbox.right, bbox.bottom, true);
                        var screenbottom = this.layerToCanvas(bbox.right, bbox.bottom, false);
                        destStartX = screenleft / windowWidth;
                        destStartY = 1 - screentop / windowHeight;
                        destEndX = screenright / windowWidth;
                        destEndY = 1 - screenbottom / windowHeight;
                    }
                    glw.setProgramParameters(this.render_offscreen ? this.runtime.layer_tex : this.layout.getRenderTarget(), // backTex
                                             1.0 / inst.width,          // pixelWidth
                                             1.0 / inst.height,         // pixelHeight
                                             destStartX, destStartY,
                                             destEndX, destEndY,
                                             this.getScale(),
                                             inst.effect_params[etindex]);
                    inst.drawGL(glw);
                }
                else
                {
                    this.layout.renderEffectChain(glw, this, inst, this.render_offscreen ? this.runtime.layer_tex : this.layout.getRenderTarget());
                    glw.resetModelView();
                    glw.scale(myscale, myscale);
                    glw.rotateZ(-this.getAngle());
                    glw.translate((this.viewLeft + this.viewRight) / -2, (this.viewTop + this.viewBottom) / -2);
                    glw.updateModelView();
                }
            }
            else
            {
                glw.switchProgram(0);       // un-set any previously set shader
                glw.setBlend(inst.srcBlend, inst.destBlend);
                inst.drawGL(glw);
            }
        }
        if (this.render_offscreen)
        {
            shaderindex = this.active_effect_types.length ? this.active_effect_types[0].shaderindex : 0;
            etindex = this.active_effect_types.length ? this.active_effect_types[0].index : 0;
            if (this.active_effect_types.length === 0 || (this.active_effect_types.length === 1 &&
                !glw.programUsesCrossSampling(shaderindex) && this.opacity === 1))
            {
                if (this.active_effect_types.length === 1)
                {
                    glw.switchProgram(shaderindex);
                    glw.setProgramParameters(this.layout.getRenderTarget(),     // backTex
                                             1.0 / this.runtime.width,          // pixelWidth
                                             1.0 / this.runtime.height,         // pixelHeight
                                             0.0, 0.0,                          // destStart
                                             1.0, 1.0,                          // destEnd
                                             this.getScale(),                   // layerScale
                                             this.effect_params[etindex]);      // fx parameters
                    if (glw.programIsAnimated(shaderindex))
                        this.runtime.redraw = true;
                }
                else
                    glw.switchProgram(0);
                glw.setRenderingToTexture(this.layout.getRenderTarget());
                glw.setOpacity(this.opacity);
                glw.setTexture(this.runtime.layer_tex);
                glw.setBlend(this.srcBlend, this.destBlend);
                glw.resetModelView();
                glw.updateModelView();
                var halfw = this.runtime.width / 2;
                var halfh = this.runtime.height / 2;
                glw.quad(-halfw, halfh, halfw, halfh, halfw, -halfh, -halfw, -halfh);
                glw.setTexture(null);
            }
            else
            {
                this.layout.renderEffectChain(glw, this, null, this.layout.getRenderTarget());
            }
        }
    };
    Layer.prototype.canvasToLayer = function (ptx, pty, getx)
    {
        var isiOSRetina = (!this.runtime.isDomFree && this.runtime.useiOSRetina && this.runtime.isiOS);
        var multiplier = this.runtime.devicePixelRatio;
        if (isiOSRetina && this.runtime.fullscreen_mode > 0)
        {
            ptx *= multiplier;
            pty *= multiplier;
        }
        var ox = (this.runtime.original_width / 2);
        var oy = (this.runtime.original_height / 2);
        var x = ((this.layout.scrollX - ox) * this.parallaxX) + ox;
        var y = ((this.layout.scrollY - oy) * this.parallaxY) + oy;
        var invScale = 1 / this.getScale();
        x -= (this.runtime.width * invScale) / 2;
        y -= (this.runtime.height * invScale) / 2;
        x += ptx * invScale;
        y += pty * invScale;
        var a = this.getAngle();
        if (a !== 0)
        {
            x -= this.layout.scrollX;
            y -= this.layout.scrollY;
            var cosa = Math.cos(a);
            var sina = Math.sin(a);
            var x_temp = (x * cosa) - (y * sina);
            y = (y * cosa) + (x * sina);
            x = x_temp;
            x += this.layout.scrollX;
            y += this.layout.scrollY;
        }
        return getx ? x : y;
    };
    Layer.prototype.layerToCanvas = function (ptx, pty, getx)
    {
        var a = this.getAngle();
        if (a !== 0)
        {
            ptx -= this.layout.scrollX;
            pty -= this.layout.scrollY;
            var cosa = Math.cos(-a);
            var sina = Math.sin(-a);
            var x_temp = (ptx * cosa) - (pty * sina);
            pty = (pty * cosa) + (ptx * sina);
            ptx = x_temp;
            ptx += this.layout.scrollX;
            pty += this.layout.scrollY;
        }
        var ox = (this.runtime.original_width / 2);
        var oy = (this.runtime.original_height / 2);
        var x = ((this.layout.scrollX - ox) * this.parallaxX) + ox;
        var y = ((this.layout.scrollY - oy) * this.parallaxY) + oy;
        var invScale = 1 / this.getScale();
        x -= (this.runtime.width * invScale) / 2;
        y -= (this.runtime.height * invScale) / 2;
        x = (ptx - x) / invScale;
        y = (pty - y) / invScale;
        var isiOSRetina = (!this.runtime.isDomFree && this.runtime.useiOSRetina && this.runtime.isiOS);
        var multiplier = this.runtime.devicePixelRatio;
        if (isiOSRetina && this.runtime.fullscreen_mode > 0)
        {
            x /= multiplier;
            y /= multiplier;
        }
        return getx ? x : y;
    };
    cr.layer = Layer;
}());
;
(function()
{
    var allUniqueSolModifiers = [];
    function testSolsMatch(arr1, arr2)
    {
        var i, len = arr1.length;
        switch (len) {
        case 0:
            return true;
        case 1:
            return arr1[0] === arr2[0];
        case 2:
            return arr1[0] === arr2[0] && arr1[1] === arr2[1];
        default:
            for (i = 0; i < len; i++)
            {
                if (arr1[i] !== arr2[i])
                    return false;
            }
            return true;
        }
    };
    function solArraySorter(t1, t2)
    {
        return t1.index - t2.index;
    };
    function findMatchingSolModifier(arr)
    {
        var i, len, u, temp, subarr;
        if (arr.length === 2)
        {
            if (arr[0].index > arr[1].index)
            {
                temp = arr[0];
                arr[0] = arr[1];
                arr[1] = temp;
            }
        }
        else if (arr.length > 2)
            arr.sort(solArraySorter);       // so testSolsMatch compares in same order
        if (arr.length >= allUniqueSolModifiers.length)
            allUniqueSolModifiers.length = arr.length + 1;
        if (!allUniqueSolModifiers[arr.length])
            allUniqueSolModifiers[arr.length] = [];
        subarr = allUniqueSolModifiers[arr.length];
        for (i = 0, len = subarr.length; i < len; i++)
        {
            u = subarr[i];
            if (testSolsMatch(arr, u))
                return u;
        }
        subarr.push(arr);
        return arr;
    };
    function EventSheet(runtime, m)
    {
        this.runtime = runtime;
        this.triggers = {};
        this.fasttriggers = {};
        this.hasRun = false;
        this.includes = new cr.ObjectSet(); // all event sheets included by this sheet, at first-level indirection only
        this.name = m[0];
        var em = m[1];      // events model
        this.events = [];       // triggers won't make it to this array
        var i, len;
        for (i = 0, len = em.length; i < len; i++)
            this.init_event(em[i], null, this.events);
    };
    EventSheet.prototype.toString = function ()
    {
        return this.name;
    };
    EventSheet.prototype.init_event = function (m, parent, nontriggers)
    {
        switch (m[0]) {
        case 0: // event block
        {
            var block = new cr.eventblock(this, parent, m);
            cr.seal(block);
            if (block.orblock)
            {
                nontriggers.push(block);
                var i, len;
                for (i = 0, len = block.conditions.length; i < len; i++)
                {
                    if (block.conditions[i].trigger)
                        this.init_trigger(block, i);
                }
            }
            else
            {
                if (block.is_trigger())
                    this.init_trigger(block, 0);
                else
                    nontriggers.push(block);
            }
            break;
        }
        case 1: // variable
        {
            var v = new cr.eventvariable(this, parent, m);
            cr.seal(v);
            nontriggers.push(v);
            break;
        }
        case 2: // include
        {
            var inc = new cr.eventinclude(this, parent, m);
            cr.seal(inc);
            nontriggers.push(inc);
            break;
        }
        default:
;
        }
    };
    EventSheet.prototype.postInit = function ()
    {
        var i, len;
        for (i = 0, len = this.events.length; i < len; i++)
        {
            this.events[i].postInit(i < len - 1 && this.events[i + 1].is_else_block);
        }
    };
    EventSheet.prototype.run = function ()
    {
        this.hasRun = true;
        this.runtime.isRunningEvents = true;
        var i, len;
        for (i = 0, len = this.events.length; i < len; i++)
        {
            var ev = this.events[i];
            ev.run();
            this.runtime.clearSol(ev.solModifiers);
            if (!this.runtime.deathRow.isEmpty() || this.runtime.createRow.length)
                this.runtime.ClearDeathRow();
        }
        this.runtime.isRunningEvents = false;
    };
    EventSheet.prototype.init_trigger = function (trig, index)
    {
        if (!trig.orblock)
            this.runtime.triggers_to_postinit.push(trig);   // needs to be postInit'd later
        var i, len;
        var cnd = trig.conditions[index];
        var type_name;
        if (cnd.type)
            type_name = cnd.type.name;
        else
            type_name = "system";
        var fasttrigger = cnd.fasttrigger;
        var triggers = (fasttrigger ? this.fasttriggers : this.triggers);
        if (!triggers[type_name])
            triggers[type_name] = [];
        var obj_entry = triggers[type_name];
        var method = cnd.func;
        if (fasttrigger)
        {
            if (!cnd.parameters.length)             // no parameters
                return;
            var firstparam = cnd.parameters[0];
            if (firstparam.type !== 1 ||            // not a string param
                firstparam.expression.type !== 2)   // not a string literal node
            {
                return;
            }
            var fastevs;
            var firstvalue = firstparam.expression.value.toLowerCase();
            var i, len;
            for (i = 0, len = obj_entry.length; i < len; i++)
            {
                if (obj_entry[i].method == method)
                {
                    fastevs = obj_entry[i].evs;
                    if (!fastevs[firstvalue])
                        fastevs[firstvalue] = [[trig, index]];
                    else
                        fastevs[firstvalue].push([trig, index]);
                    return;
                }
            }
            fastevs = {};
            fastevs[firstvalue] = [[trig, index]];
            obj_entry.push({ method: method, evs: fastevs });
        }
        else
        {
            for (i = 0, len = obj_entry.length; i < len; i++)
            {
                if (obj_entry[i].method == method)
                {
                    obj_entry[i].evs.push([trig, index]);
                    return;
                }
            }
            obj_entry.push({ method: method, evs: [[trig, index]]});
        }
    };
    cr.eventsheet = EventSheet;
    function Selection(type)
    {
        this.type = type;
        this.instances = [];        // subset of picked instances
        this.else_instances = [];   // subset of unpicked instances
        this.select_all = true;
    };
    Selection.prototype.hasObjects = function ()
    {
        if (this.select_all)
            return this.type.instances.length;
        else
            return this.instances.length;
    };
    Selection.prototype.getObjects = function ()
    {
        if (this.select_all)
            return this.type.instances;
        else
            return this.instances;
    };
    /*
    Selection.prototype.ensure_picked = function (inst, skip_siblings)
    {
        var i, len;
        var orblock = inst.runtime.getCurrentEventStack().current_event.orblock;
        if (this.select_all)
        {
            this.select_all = false;
            if (orblock)
            {
                cr.shallowAssignArray(this.else_instances, inst.type.instances);
                cr.arrayFindRemove(this.else_instances, inst);
            }
            this.instances.length = 1;
            this.instances[0] = inst;
        }
        else
        {
            if (orblock)
            {
                i = this.else_instances.indexOf(inst);
                if (i !== -1)
                {
                    this.instances.push(this.else_instances[i]);
                    this.else_instances.splice(i, 1);
                }
            }
            else
            {
                if (this.instances.indexOf(inst) === -1)
                    this.instances.push(inst);
            }
        }
        if (!skip_siblings)
        {
        }
    };
    */
    Selection.prototype.pick_one = function (inst)
    {
        if (!inst)
            return;
        if (inst.runtime.getCurrentEventStack().current_event.orblock)
        {
            if (this.select_all)
            {
                this.instances.length = 0;
                cr.shallowAssignArray(this.else_instances, inst.type.instances);
                this.select_all = false;
            }
            var i = this.else_instances.indexOf(inst);
            if (i !== -1)
            {
                this.instances.push(this.else_instances[i]);
                this.else_instances.splice(i, 1);
            }
        }
        else
        {
            this.select_all = false;
            this.instances.length = 1;
            this.instances[0] = inst;
        }
    };
    cr.selection = Selection;
    function EventBlock(sheet, parent, m)
    {
        this.sheet = sheet;
        this.parent = parent;
        this.runtime = sheet.runtime;
        this.solModifiers = [];
        this.solModifiersIncludingParents = [];
        this.solWriterAfterCnds = false;    // block does not change SOL after running its conditions
        this.group = false;                 // is group of events
        this.initially_activated = false;   // if a group, is active on startup
        this.toplevelevent = false;         // is an event block parented only by a top-level group
        this.toplevelgroup = false;         // is parented only by other groups or is top-level (i.e. not in a subevent)
        this.has_else_block = false;        // is followed by else
;
        this.conditions = [];
        this.actions = [];
        this.subevents = [];
        if (m[1])
        {
            this.group_name = m[1][1].toLowerCase();
            this.group = true;
            this.initially_activated = !!m[1][0];
            this.runtime.allGroups.push(this);
            this.runtime.activeGroups[(/*this.sheet.name + "|" + */this.group_name).toLowerCase()] = this.initially_activated;
        }
        else
        {
            this.group_name = "";
            this.group = false;
            this.initially_activated = false;
        }
        this.orblock = m[2];
        var i, len;
        var cm = m[3];
        for (i = 0, len = cm.length; i < len; i++)
        {
            var cnd = new cr.condition(this, cm[i]);
            cr.seal(cnd);
            this.conditions.push(cnd);
            /*
            if (cnd.is_logical())
                this.is_logical = true;
            if (cnd.type && !cnd.type.plugin.singleglobal && this.cndReferences.indexOf(cnd.type) === -1)
                this.cndReferences.push(cnd.type);
            */
            this.addSolModifier(cnd.type);
        }
        var am = m[4];
        for (i = 0, len = am.length; i < len; i++)
        {
            var act = new cr.action(this, am[i]);
            cr.seal(act);
            this.actions.push(act);
        }
        if (m.length === 6)
        {
            var em = m[5];
            for (i = 0, len = em.length; i < len; i++)
                this.sheet.init_event(em[i], this, this.subevents);
        }
        this.is_else_block = false;
        if (this.conditions.length)
            this.is_else_block = (this.conditions[0].type == null && this.conditions[0].func == cr.system_object.prototype.cnds.Else);
    };
    EventBlock.prototype.postInit = function (hasElse/*, prevBlock_*/)
    {
        var i, len;
        var p = this.parent;
        if (this.group)
        {
            this.toplevelgroup = true;
            while (p)
            {
                if (!p.group)
                {
                    this.toplevelgroup = false;
                    break;
                }
                p = p.parent;
            }
        }
        this.toplevelevent = !this.is_trigger() && (!this.parent || (this.parent.group && this.parent.toplevelgroup));
        this.has_else_block = !!hasElse;
        this.solModifiersIncludingParents = this.solModifiers.slice(0);
        p = this.parent;
        while (p)
        {
            for (i = 0, len = p.solModifiers.length; i < len; i++)
                this.addParentSolModifier(p.solModifiers[i]);
            p = p.parent;
        }
        this.solModifiers = findMatchingSolModifier(this.solModifiers);
        this.solModifiersIncludingParents = findMatchingSolModifier(this.solModifiersIncludingParents);
        var i, len/*, s*/;
        for (i = 0, len = this.conditions.length; i < len; i++)
            this.conditions[i].postInit();
        for (i = 0, len = this.actions.length; i < len; i++)
            this.actions[i].postInit();
        for (i = 0, len = this.subevents.length; i < len; i++)
        {
            this.subevents[i].postInit(i < len - 1 && this.subevents[i + 1].is_else_block);
        }
        /*
        if (this.is_else_block && this.prev_block)
        {
            for (i = 0, len = this.prev_block.solModifiers.length; i < len; i++)
            {
                s = this.prev_block.solModifiers[i];
                if (this.solModifiers.indexOf(s) === -1)
                    this.solModifiers.push(s);
            }
        }
        */
    }
    function addSolModifierToList(type, arr)
    {
        var i, len, t;
        if (!type)
            return;
        if (arr.indexOf(type) === -1)
            arr.push(type);
        if (type.is_contained)
        {
            for (i = 0, len = type.container.length; i < len; i++)
            {
                t = type.container[i];
                if (type === t)
                    continue;       // already handled
                if (arr.indexOf(t) === -1)
                    arr.push(t);
            }
        }
    };
    EventBlock.prototype.addSolModifier = function (type)
    {
        addSolModifierToList(type, this.solModifiers);
    };
    EventBlock.prototype.addParentSolModifier = function (type)
    {
        addSolModifierToList(type, this.solModifiersIncludingParents);
    };
    EventBlock.prototype.setSolWriterAfterCnds = function ()
    {
        this.solWriterAfterCnds = true;
        if (this.parent)
            this.parent.setSolWriterAfterCnds();
    };
    EventBlock.prototype.is_trigger = function ()
    {
        if (!this.conditions.length)    // no conditions
            return false;
        else
            return this.conditions[0].trigger;
    };
    EventBlock.prototype.run = function ()
    {
        var i, len, any_true = false/*, bail = false*/;
        var evinfo = this.runtime.getCurrentEventStack();
        evinfo.current_event = this;
        if (!this.is_else_block)
            evinfo.else_branch_ran = false;
        if (this.orblock)
        {
            for (evinfo.cndindex = 0, len = this.conditions.length; evinfo.cndindex < len; evinfo.cndindex++)
            {
                if (this.conditions[evinfo.cndindex].trigger)       // skip triggers when running OR block
                    continue;
                if (this.conditions[evinfo.cndindex].run())         // make sure all conditions run and run if any were true
                    any_true = true;
            }
            evinfo.last_event_true = any_true;
            if (any_true)
                this.run_actions_and_subevents();
        }
        else
        {
            for (evinfo.cndindex = 0, len = this.conditions.length; evinfo.cndindex < len; evinfo.cndindex++)
            {
                if (!this.conditions[evinfo.cndindex].run())    // condition failed
                {
                    evinfo.last_event_true = false;
                    return;                                     // bail out now
                }
            }
            evinfo.last_event_true = true;
            this.run_actions_and_subevents();
        }
        if (evinfo.last_event_true && this.has_else_block)
            evinfo.else_branch_ran = true;
        if (this.toplevelevent && (!this.runtime.deathRow.isEmpty() || this.runtime.createRow.length))
            this.runtime.ClearDeathRow();
    };
    EventBlock.prototype.run_orblocktrigger = function (index)
    {
        var evinfo = this.runtime.getCurrentEventStack();
        evinfo.current_event = this;
        if (this.conditions[index].run())
        {
            this.run_actions_and_subevents();
        }
    };
    EventBlock.prototype.run_actions_and_subevents = function ()
    {
        var evinfo = this.runtime.getCurrentEventStack();
        var len;
        for (evinfo.actindex = 0, len = this.actions.length; evinfo.actindex < len; evinfo.actindex++)
        {
            if (this.actions[evinfo.actindex].run())
                return;
        }
        this.run_subevents();
    };
    EventBlock.prototype.resume_actions_and_subevents = function ()
    {
        var evinfo = this.runtime.getCurrentEventStack();
        var len;
        for (len = this.actions.length; evinfo.actindex < len; evinfo.actindex++)
        {
            if (this.actions[evinfo.actindex].run())
                return;
        }
        this.run_subevents();
    };
    EventBlock.prototype.run_subevents = function ()
    {
        if (!this.subevents.length)
            return;
        var i, len, subev, pushpop/*, skipped_pop = false, pop_modifiers = null*/;
        var last = this.subevents.length - 1;
        this.runtime.pushEventStack(this);
        if (this.solWriterAfterCnds)
        {
            for (i = 0, len = this.subevents.length; i < len; i++)
            {
                subev = this.subevents[i];
                pushpop = (!this.toplevelgroup || (!this.group && i < last));
                if (pushpop)
                    this.runtime.pushCopySol(subev.solModifiers);
                subev.run();
                if (pushpop)
                    this.runtime.popSol(subev.solModifiers);
                else
                    this.runtime.clearSol(subev.solModifiers);
            }
        }
        else
        {
            for (i = 0, len = this.subevents.length; i < len; i++)
            {
                this.subevents[i].run();
            }
        }
        this.runtime.popEventStack();
    };
    EventBlock.prototype.run_pretrigger = function ()
    {
        var evinfo = this.runtime.getCurrentEventStack();
        evinfo.current_event = this;
        var any_true = false;
        var i, len;
        for (evinfo.cndindex = 0, len = this.conditions.length; evinfo.cndindex < len; evinfo.cndindex++)
        {
;
            if (this.conditions[evinfo.cndindex].run())
                any_true = true;
            else if (!this.orblock)         // condition failed (let OR blocks run all conditions anyway)
                return false;               // bail out
        }
        return this.orblock ? any_true : true;
    };
    EventBlock.prototype.retrigger = function ()
    {
        this.runtime.execcount++;
        var prevcndindex = this.runtime.getCurrentEventStack().cndindex;
        var len;
        var evinfo = this.runtime.pushEventStack(this);
        if (!this.orblock)
        {
            for (evinfo.cndindex = prevcndindex + 1, len = this.conditions.length; evinfo.cndindex < len; evinfo.cndindex++)
            {
                if (!this.conditions[evinfo.cndindex].run())    // condition failed
                {
                    this.runtime.popEventStack();               // moving up level of recursion
                    return false;                               // bail out
                }
            }
        }
        this.run_actions_and_subevents();
        this.runtime.popEventStack();
        return true;        // ran an iteration
    };
    cr.eventblock = EventBlock;
    function Condition(block, m)
    {
        this.block = block;
        this.sheet = block.sheet;
        this.runtime = block.runtime;
        this.parameters = [];
        this.results = [];
        this.extra = {};        // for plugins to stow away some custom info
        this.func = m[1];
;
        this.trigger = (m[3] > 0);
        this.fasttrigger = (m[3] === 2);
        this.looping = m[4];
        this.inverted = m[5];
        this.isstatic = m[6];
        if (m[0] === -1)        // system object
        {
            this.type = null;
            this.run = this.run_system;
            this.behaviortype = null;
            this.beh_index = -1;
        }
        else
        {
            this.type = this.runtime.types_by_index[m[0]];
;
            if (this.isstatic)
                this.run = this.run_static;
            else
                this.run = this.run_object;
            if (m[2])
            {
                this.behaviortype = this.type.getBehaviorByName(m[2]);
;
                this.beh_index = this.type.getBehaviorIndexByName(m[2]);
;
            }
            else
            {
                this.behaviortype = null;
                this.beh_index = -1;
            }
            if (this.block.parent)
                this.block.parent.setSolWriterAfterCnds();
        }
        if (this.fasttrigger)
            this.run = this.run_true;
        if (m.length === 8)
        {
            var i, len;
            var em = m[7];
            for (i = 0, len = em.length; i < len; i++)
            {
                var param = new cr.parameter(this, em[i]);
                cr.seal(param);
                this.parameters.push(param);
            }
            this.results.length = em.length;
        }
    };
    Condition.prototype.postInit = function ()
    {
        var i, len;
        for (i = 0, len = this.parameters.length; i < len; i++)
            this.parameters[i].postInit();
    };
    /*
    Condition.prototype.is_logical = function ()
    {
        return !this.type || this.type.plugin.singleglobal;
    };
    */
    Condition.prototype.run_true = function ()
    {
        return true;
    };
    Condition.prototype.run_system = function ()
    {
        var i, len;
        for (i = 0, len = this.parameters.length; i < len; i++)
            this.results[i] = this.parameters[i].get();
        return cr.xor(this.func.apply(this.runtime.system, this.results), this.inverted);
    };
    Condition.prototype.run_static = function ()
    {
        var i, len;
        for (i = 0, len = this.parameters.length; i < len; i++)
            this.results[i] = this.parameters[i].get();
        var ret = this.func.apply(this.type, this.results);
        this.type.applySolToContainer();
        return ret;
    };
    Condition.prototype.run_object = function ()
    {
        var i, j, leni, lenj, ret, met, inst, s, sol2;
        var sol = this.type.getCurrentSol();
        var is_orblock = this.block.orblock && !this.trigger;       // triggers in OR blocks need to work normally
        var offset = 0;
        var is_contained = this.type.is_contained;
        if (sol.select_all) {
            sol.instances.length = 0;       // clear contents
            sol.else_instances.length = 0;
            for (i = 0, leni = this.type.instances.length; i < leni; i++)
            {
                inst = this.type.instances[i];
;
                for (j = 0, lenj = this.parameters.length; j < lenj; j++)
                    this.results[j] = this.parameters[j].get(i);        // default SOL index is current object
                if (this.beh_index > -1)
                {
                    if (this.type.is_family)
                    {
                        offset = inst.type.family_beh_map[this.type.family_index];
                    }
                    ret = this.func.apply(inst.behavior_insts[this.beh_index + offset], this.results);
                }
                else
                    ret = this.func.apply(inst, this.results);
                met = cr.xor(ret, this.inverted);
                if (met)
                    sol.instances.push(inst);
                else if (is_orblock)                    // in OR blocks, keep the instances not meeting the condition for subsequent testing
                    sol.else_instances.push(inst);
            }
            if (this.type.finish)
                this.type.finish(true);
            sol.select_all = false;
            this.type.applySolToContainer();
            return sol.hasObjects();
        }
        else {
            var k = 0;
            var arr = (is_orblock ? sol.else_instances : sol.instances);
            var any_true = false;
            for (i = 0, leni = arr.length; i < leni; i++)
            {
                inst = arr[i];
;
                for (j = 0, lenj = this.parameters.length; j < lenj; j++)
                    this.results[j] = this.parameters[j].get(i);        // default SOL index is current object
                if (this.beh_index > -1)
                {
                    if (this.type.is_family)
                    {
                        offset = inst.type.family_beh_map[this.type.family_index];
                    }
                    ret = this.func.apply(inst.behavior_insts[this.beh_index + offset], this.results);
                }
                else
                    ret = this.func.apply(inst, this.results);
                if (cr.xor(ret, this.inverted))
                {
                    any_true = true;
                    if (is_orblock)
                    {
                        sol.instances.push(inst);
                        if (is_contained)
                        {
                            for (j = 0, lenj = inst.siblings.length; j < lenj; j++)
                            {
                                s = inst.siblings[j];
                                s.type.getCurrentSol().instances.push(s);
                            }
                        }
                    }
                    else
                    {
                        arr[k] = inst;
                        if (is_contained)
                        {
                            for (j = 0, lenj = inst.siblings.length; j < lenj; j++)
                            {
                                s = inst.siblings[j];
                                s.type.getCurrentSol().instances[k] = s;
                            }
                        }
                        k++;
                    }
                }
                else
                {
                    if (is_orblock)
                    {
                        arr[k] = inst;
                        if (is_contained)
                        {
                            for (j = 0, lenj = inst.siblings.length; j < lenj; j++)
                            {
                                s = inst.siblings[j];
                                s.type.getCurrentSol().else_instances[k] = s;
                            }
                        }
                        k++;
                    }
                }
            }
            arr.length = k;
            if (is_contained)
            {
                for (i = 0, leni = this.type.container.length; i < leni; i++)
                {
                    sol2 = this.type.container[i].getCurrentSol();
                    if (is_orblock)
                        sol2.else_instances.length = k;
                    else
                        sol2.instances.length = k;
                }
            }
            var pick_in_finish = any_true;      // don't pick in finish() if we're only doing the logic test below
            if (is_orblock && !any_true)
            {
                for (i = 0, leni = sol.instances.length; i < leni; i++)
                {
                    inst = sol.instances[i];
                    for (j = 0, lenj = this.parameters.length; j < lenj; j++)
                        this.results[j] = this.parameters[j].get(i);
                    if (this.beh_index > -1)
                        ret = this.func.apply(inst.behavior_insts[this.beh_index], this.results);
                    else
                        ret = this.func.apply(inst, this.results);
                    if (cr.xor(ret, this.inverted))
                    {
                        any_true = true;
                        break;      // got our flag, don't need to test any more
                    }
                }
            }
            if (this.type.finish)
                this.type.finish(pick_in_finish || is_orblock);
            return is_orblock ? any_true : sol.hasObjects();
        }
    };
    cr.condition = Condition;
    function Action(block, m)
    {
        this.block = block;
        this.sheet = block.sheet;
        this.runtime = block.runtime;
        this.parameters = [];
        this.results = [];
        this.extra = {};        // for plugins to stow away some custom info
        this.func = m[1];
;
        if (m[0] === -1)    // system
        {
            this.type = null;
            this.run = this.run_system;
            this.behaviortype = null;
            this.beh_index = -1;
        }
        else
        {
            this.type = this.runtime.types_by_index[m[0]];
;
            this.run = this.run_object;
            if (m[2])
            {
                this.behaviortype = this.type.getBehaviorByName(m[2]);
;
                this.beh_index = this.type.getBehaviorIndexByName(m[2]);
;
            }
            else
            {
                this.behaviortype = null;
                this.beh_index = -1;
            }
        }
        if (m.length === 4)
        {
            var i, len;
            var em = m[3];
            for (i = 0, len = em.length; i < len; i++)
            {
                var param = new cr.parameter(this, em[i]);
                cr.seal(param);
                this.parameters.push(param);
            }
            this.results.length = em.length;
        }
    };
    Action.prototype.postInit = function ()
    {
        var i, len;
        for (i = 0, len = this.parameters.length; i < len; i++)
            this.parameters[i].postInit();
    };
    Action.prototype.run_system = function ()
    {
        var i, len;
        for (i = 0, len = this.parameters.length; i < len; i++)
            this.results[i] = this.parameters[i].get();
        return this.func.apply(this.runtime.system, this.results);
    };
    Action.prototype.run_object = function ()
    {
        var instances = this.type.getCurrentSol().getObjects();
        var i, j, leni, lenj, inst;
        for (i = 0, leni = instances.length; i < leni; i++)
        {
            inst = instances[i];
            for (j = 0, lenj = this.parameters.length; j < lenj; j++)
                this.results[j] = this.parameters[j].get(i);    // pass i to use as default SOL index
            if (this.beh_index > -1)
            {
                var offset = 0;
                if (this.type.is_family)
                {
                    offset = inst.type.family_beh_map[this.type.family_index];
                }
                this.func.apply(inst.behavior_insts[this.beh_index + offset], this.results);
            }
            else
                this.func.apply(inst, this.results);
        }
        return false;
    };
    cr.action = Action;
    var tempValues = [];
    var tempValuesPtr = -1;
    function Parameter(owner, m)
    {
        this.owner = owner;
        this.block = owner.block;
        this.sheet = owner.sheet;
        this.runtime = owner.runtime;
        this.type = m[0];
        this.expression = null;
        this.solindex = 0;
        this.combosel = 0;
        this.layout = null;
        this.key = 0;
        this.object = null;
        this.index = 0;
        this.varname = null;
        this.eventvar = null;
        this.fileinfo = null;
        this.subparams = null;
        this.variadicret = null;
        var i, len, param;
        switch (m[0])
        {
            case 0:     // number
            case 7:     // any
                this.expression = new cr.expNode(this, m[1]);
                this.solindex = 0;
                this.get = this.get_exp;
                break;
            case 1:     // string
                this.expression = new cr.expNode(this, m[1]);
                this.solindex = 0;
                this.get = this.get_exp_str;
                break;
            case 5:     // layer
                this.expression = new cr.expNode(this, m[1]);
                this.solindex = 0;
                this.get = this.get_layer;
                break;
            case 3:     // combo
            case 8:     // cmp
                this.combosel = m[1];
                this.get = this.get_combosel;
                break;
            case 6:     // layout
                this.layout = this.runtime.layouts[m[1]];
;
                this.get = this.get_layout;
                break;
            case 9:     // keyb
                this.key = m[1];
                this.get = this.get_key;
                break;
            case 4:     // object
                this.object = this.runtime.types_by_index[m[1]];
;
                this.get = this.get_object;
                this.block.addSolModifier(this.object);
                if (this.owner instanceof cr.action)
                    this.block.setSolWriterAfterCnds();
                else if (this.block.parent)
                    this.block.parent.setSolWriterAfterCnds();
                break;
            case 10:    // instvar
                this.index = m[1];
                if (owner.type.is_family)
                    this.get = this.get_familyvar;
                else
                    this.get = this.get_instvar;
                break;
            case 11:    // eventvar
                this.varname = m[1];
                this.eventvar = null;
                this.get = this.get_eventvar;
                break;
            case 2:     // audiofile    ["name", ismusic]
            case 12:    // fileinfo     "name"
                this.fileinfo = m[1];
                this.get = this.get_audiofile;
                break;
            case 13:    // variadic
                this.get = this.get_variadic;
                this.subparams = [];
                this.variadicret = [];
                for (i = 1, len = m.length; i < len; i++)
                {
                    param = new cr.parameter(this.owner, m[i]);
                    cr.seal(param);
                    this.subparams.push(param);
                    this.variadicret.push(0);
                }
                break;
            default:
;
        }
    };
    Parameter.prototype.postInit = function ()
    {
        var i, len;
        if (this.type === 11)       // eventvar
        {
            this.eventvar = this.runtime.getEventVariableByName(this.varname, this.block.parent);
;
        }
        else if (this.type === 13)  // variadic, postInit all sub-params
        {
            for (i = 0, len = this.subparams.length; i < len; i++)
                this.subparams[i].postInit();
        }
        if (this.expression)
            this.expression.postInit();
    };
    Parameter.prototype.pushTempValue = function ()
    {
        tempValuesPtr++;
        if (tempValues.length === tempValuesPtr)
            tempValues.push(new cr.expvalue());
        return tempValues[tempValuesPtr];
    };
    Parameter.prototype.popTempValue = function ()
    {
        tempValuesPtr--;
    };
    Parameter.prototype.get_exp = function (solindex)
    {
        this.solindex = solindex || 0;   // default SOL index to use
        var temp = this.pushTempValue();
        this.expression.get(temp);
        this.popTempValue();
        return temp.data;               // return actual JS value, not expvalue
    };
    Parameter.prototype.get_exp_str = function (solindex)
    {
        this.solindex = solindex || 0;   // default SOL index to use
        var temp = this.pushTempValue();
        this.expression.get(temp);
        this.popTempValue();
        if (cr.is_string(temp.data))
            return temp.data;
        else
            return "";
    };
    Parameter.prototype.get_object = function ()
    {
        return this.object;
    };
    Parameter.prototype.get_combosel = function ()
    {
        return this.combosel;
    };
    Parameter.prototype.get_layer = function (solindex)
    {
        this.solindex = solindex || 0;   // default SOL index to use
        var temp = this.pushTempValue();
        this.expression.get(temp);
        this.popTempValue();
        if (temp.is_number())
            return this.runtime.getLayerByNumber(temp.data);
        else
            return this.runtime.getLayerByName(temp.data);
    }
    Parameter.prototype.get_layout = function ()
    {
        return this.layout;
    };
    Parameter.prototype.get_key = function ()
    {
        return this.key;
    };
    Parameter.prototype.get_instvar = function ()
    {
        return this.index;
    };
    Parameter.prototype.get_familyvar = function (solindex)
    {
        var familytype = this.owner.type;
        var realtype = null;
        var sol = familytype.getCurrentSol();
        var objs = sol.getObjects();
        if (objs.length)
            realtype = objs[solindex % objs.length].type;
        else
        {
;
            realtype = sol.else_instances[solindex % sol.else_instances.length].type;
        }
        return this.index + realtype.family_var_map[familytype.family_index];
    };
    Parameter.prototype.get_eventvar = function ()
    {
        return this.eventvar;
    };
    Parameter.prototype.get_audiofile = function ()
    {
        return this.fileinfo;
    };
    Parameter.prototype.get_variadic = function ()
    {
        var i, len;
        for (i = 0, len = this.subparams.length; i < len; i++)
        {
            this.variadicret[i] = this.subparams[i].get();
        }
        return this.variadicret;
    };
    cr.parameter = Parameter;
    function EventVariable(sheet, parent, m)
    {
        this.sheet = sheet;
        this.parent = parent;
        this.runtime = sheet.runtime;
        this.solModifiers = [];
        this.name = m[1];
        this.vartype = m[2];
        this.initial = m[3];
        this.is_static = !!m[4];
        this.is_constant = !!m[5];
        this.data = this.initial;   // note: also stored in event stack frame for local nonstatic nonconst vars
        if (this.parent)            // local var
        {
            if (this.is_static || this.is_constant)
                this.localIndex = -1;
            else
                this.localIndex = this.runtime.stackLocalCount++;
        }
        else                        // global var
        {
            this.localIndex = -1;
            this.runtime.all_global_vars.push(this);
        }
    };
    EventVariable.prototype.postInit = function ()
    {
        this.solModifiers = findMatchingSolModifier(this.solModifiers);
    };
    EventVariable.prototype.setValue = function (x)
    {
;
        var lvs = this.runtime.getCurrentLocalVarStack();
        if (!this.parent || this.is_static || !lvs)
            this.data = x;
        else    // local nonstatic variable: use event stack to keep value at this level of recursion
        {
            if (this.localIndex >= lvs.length)
                lvs.length = this.localIndex + 1;
            lvs[this.localIndex] = x;
        }
    };
    EventVariable.prototype.getValue = function ()
    {
        var lvs = this.runtime.getCurrentLocalVarStack();
        if (!this.parent || this.is_static || !lvs)
            return this.data;
        else    // local nonstatic variable
        {
            if (this.localIndex >= lvs.length)
            {
;
                return this.initial;
            }
            if (typeof lvs[this.localIndex] === "undefined")
            {
;
                return this.initial;
            }
            return lvs[this.localIndex];
        }
    };
    EventVariable.prototype.run = function ()
    {
        if (this.parent && !this.is_static)
            this.setValue(this.initial);
    };
    cr.eventvariable = EventVariable;
    function EventInclude(sheet, parent, m)
    {
        this.sheet = sheet;
        this.parent = parent;
        this.runtime = sheet.runtime;
        this.solModifiers = [];
        this.include_sheet = null;      // determined in postInit
        this.include_sheet_name = m[1];
    };
    EventInclude.prototype.postInit = function ()
    {
        this.include_sheet = this.runtime.eventsheets[this.include_sheet_name];
;
;
        this.sheet.includes.add(this.include_sheet);
        this.solModifiers = findMatchingSolModifier(this.solModifiers);
    };
    EventInclude.prototype.run = function ()
    {
        if (this.parent)
            this.runtime.pushCleanSol(this.runtime.types_by_index);
        if (!this.include_sheet.hasRun)
            this.include_sheet.run();
        if (this.parent)
            this.runtime.popSol(this.runtime.types_by_index);
    };
    cr.eventinclude = EventInclude;
    function EventStackFrame()
    {
        this.temp_parents_arr = [];
        this.reset(null);
        cr.seal(this);
    };
    EventStackFrame.prototype.reset = function (cur_event)
    {
        this.current_event = cur_event;
        this.cndindex = 0;
        this.actindex = 0;
        this.temp_parents_arr.length = 0;
        this.last_event_true = false;
        this.else_branch_ran = false;
    };
    EventStackFrame.prototype.isModifierAfterCnds = function ()
    {
        if (this.current_event.solWriterAfterCnds)
            return true;
        if (this.cndindex < this.current_event.conditions.length - 1)
            return !!this.current_event.solModifiers.length;
        return false;
    };
    cr.eventStackFrame = EventStackFrame;
}());
(function()
{
    function ExpNode(owner_, m)
    {
        this.owner = owner_;
        this.runtime = owner_.runtime;
        this.type = m[0];
;
        this.get = [this.eval_int,
                    this.eval_float,
                    this.eval_string,
                    this.eval_unaryminus,
                    this.eval_add,
                    this.eval_subtract,
                    this.eval_multiply,
                    this.eval_divide,
                    this.eval_mod,
                    this.eval_power,
                    this.eval_and,
                    this.eval_or,
                    this.eval_equal,
                    this.eval_notequal,
                    this.eval_less,
                    this.eval_lessequal,
                    this.eval_greater,
                    this.eval_greaterequal,
                    this.eval_conditional,
                    this.eval_system_exp,
                    this.eval_object_behavior_exp,
                    this.eval_instvar_exp,
                    this.eval_object_behavior_exp,
                    this.eval_eventvar_exp][this.type];
        var paramsModel = null;
        this.value = null;
        this.first = null;
        this.second = null;
        this.third = null;
        this.func = null;
        this.results = null;
        this.parameters = null;
        this.object_type = null;
        this.beh_index = -1;
        this.instance_expr = null;
        this.varindex = -1;
        this.behavior_type = null;
        this.varname = null;
        this.eventvar = null;
        this.return_string = false;
        switch (this.type) {
        case 0:     // int
        case 1:     // float
        case 2:     // string
            this.value = m[1];
            break;
        case 3:     // unaryminus
            this.first = new cr.expNode(owner_, m[1]);
            break;
        case 18:    // conditional
            this.first = new cr.expNode(owner_, m[1]);
            this.second = new cr.expNode(owner_, m[2]);
            this.third = new cr.expNode(owner_, m[3]);
            break;
        case 19:    // system_exp
            this.func = m[1];
;
            this.results = [];
            this.parameters = [];
            if (m.length === 3)
            {
                paramsModel = m[2];
                this.results.length = paramsModel.length + 1;   // must also fit 'ret'
            }
            else
                this.results.length = 1;      // to fit 'ret'
            break;
        case 20:    // object_exp
            this.object_type = this.runtime.types_by_index[m[1]];
;
            this.beh_index = -1;
            this.func = m[2];
            this.return_string = m[3];
            if (m[4])
                this.instance_expr = new cr.expNode(owner_, m[4]);
            else
                this.instance_expr = null;
            this.results = [];
            this.parameters = [];
            if (m.length === 6)
            {
                paramsModel = m[5];
                this.results.length = paramsModel.length + 1;
            }
            else
                this.results.length = 1;    // to fit 'ret'
            break;
        case 21:        // instvar_exp
            this.object_type = this.runtime.types_by_index[m[1]];
;
            this.return_string = m[2];
            if (m[3])
                this.instance_expr = new cr.expNode(owner_, m[3]);
            else
                this.instance_expr = null;
            this.varindex = m[4];
            break;
        case 22:        // behavior_exp
            this.object_type = this.runtime.types_by_index[m[1]];
;
            this.behavior_type = this.object_type.getBehaviorByName(m[2]);
;
            this.beh_index = this.object_type.getBehaviorIndexByName(m[2]);
            this.func = m[3];
            this.return_string = m[4];
            if (m[5])
                this.instance_expr = new cr.expNode(owner_, m[5]);
            else
                this.instance_expr = null;
            this.results = [];
            this.parameters = [];
            if (m.length === 7)
            {
                paramsModel = m[6];
                this.results.length = paramsModel.length + 1;
            }
            else
                this.results.length = 1;    // to fit 'ret'
            break;
        case 23:        // eventvar_exp
            this.varname = m[1];
            this.eventvar = null;   // assigned in postInit
            break;
        }
        if (this.type >= 4 && this.type <= 17)
        {
            this.first = new cr.expNode(owner_, m[1]);
            this.second = new cr.expNode(owner_, m[2]);
        }
        if (paramsModel)
        {
            var i, len;
            for (i = 0, len = paramsModel.length; i < len; i++)
                this.parameters.push(new cr.expNode(owner_, paramsModel[i]));
        }
        cr.seal(this);
    };
    ExpNode.prototype.postInit = function ()
    {
        if (this.type === 23)   // eventvar_exp
        {
            this.eventvar = this.owner.runtime.getEventVariableByName(this.varname, this.owner.block.parent);
;
        }
        if (this.first)
            this.first.postInit();
        if (this.second)
            this.second.postInit();
        if (this.third)
            this.third.postInit();
        if (this.instance_expr)
            this.instance_expr.postInit();
        if (this.parameters)
        {
            var i, len;
            for (i = 0, len = this.parameters.length; i < len; i++)
                this.parameters[i].postInit();
        }
    };
    ExpNode.prototype.eval_system_exp = function (ret)
    {
        this.results[0] = ret;
        var temp = this.owner.pushTempValue();
        var i, len;
        for (i = 0, len = this.parameters.length; i < len; i++)
        {
            this.parameters[i].get(temp);
            this.results[i + 1] = temp.data;   // passing actual javascript value as argument instead of expvalue
        }
        this.owner.popTempValue();
        this.func.apply(this.runtime.system, this.results);
    };
    ExpNode.prototype.eval_object_behavior_exp = function (ret)
    {
        var sol = this.object_type.getCurrentSol();
        var instances = sol.getObjects();
        if (!instances.length)
        {
            if (sol.else_instances.length)
                instances = sol.else_instances;
            else
            {
                if (this.return_string)
                    ret.set_string("");
                else
                    ret.set_int(0);
                return;
            }
        }
        this.results[0] = ret;
        ret.object_class = this.object_type;        // so expression can access family type if need be
        var temp = this.owner.pushTempValue();
        var i, len;
        for (i = 0, len = this.parameters.length; i < len; i++) {
            this.parameters[i].get(temp);
            this.results[i + 1] = temp.data;   // passing actual javascript value as argument instead of expvalue
        }
        var index = this.owner.solindex;
        if (this.instance_expr) {
            this.instance_expr.get(temp);
            if (temp.is_number()) {
                index = temp.data;
                instances = this.object_type.instances;    // pick from all instances, not SOL
            }
        }
        this.owner.popTempValue();
        index %= instances.length;      // wraparound
        if (index < 0)
            index += instances.length;
        var returned_val;
        var inst = instances[index];
        if (this.beh_index > -1)
        {
            var offset = 0;
            if (this.object_type.is_family)
            {
                offset = inst.type.family_beh_map[this.object_type.family_index];
            }
            returned_val = this.func.apply(inst.behavior_insts[this.beh_index + offset], this.results);
        }
        else
            returned_val = this.func.apply(inst, this.results);
;
    };
    ExpNode.prototype.eval_instvar_exp = function (ret)
    {
        var sol = this.object_type.getCurrentSol();
        var instances = sol.getObjects();
        if (!instances.length)
        {
            if (sol.else_instances.length)
                instances = sol.else_instances;
            else
            {
                if (this.return_string)
                    ret.set_string("");
                else
                    ret.set_int(0);
                return;
            }
        }
        var index = this.owner.solindex;
        if (this.instance_expr)
        {
            var temp = this.owner.pushTempValue();
            this.instance_expr.get(temp);
            if (temp.is_number())
            {
                index = temp.data;
                var type_instances = this.object_type.instances;
                index %= type_instances.length;     // wraparound
                if (index < 0)                      // offset
                    index += type_instances.length;
                var to_ret = type_instances[index].instance_vars[this.varindex];
                if (cr.is_string(to_ret))
                    ret.set_string(to_ret);
                else
                    ret.set_float(to_ret);
                this.owner.popTempValue();
                return;         // done
            }
            this.owner.popTempValue();
        }
        index %= instances.length;      // wraparound
        if (index < 0)
            index += instances.length;
        var inst = instances[index];
        var offset = 0;
        if (this.object_type.is_family)
        {
            offset = inst.type.family_var_map[this.object_type.family_index];
        }
        var to_ret = inst.instance_vars[this.varindex + offset];
        if (cr.is_string(to_ret))
            ret.set_string(to_ret);
        else
            ret.set_float(to_ret);
    };
    ExpNode.prototype.eval_int = function (ret)
    {
        ret.type = cr.exptype.Integer;
        ret.data = this.value;
    };
    ExpNode.prototype.eval_float = function (ret)
    {
        ret.type = cr.exptype.Float;
        ret.data = this.value;
    };
    ExpNode.prototype.eval_string = function (ret)
    {
        ret.type = cr.exptype.String;
        ret.data = this.value;
    };
    ExpNode.prototype.eval_unaryminus = function (ret)
    {
        this.first.get(ret);                // retrieve operand
        if (ret.is_number())
            ret.data = -ret.data;
    };
    ExpNode.prototype.eval_add = function (ret)
    {
        this.first.get(ret);                // left operand
        var temp = this.owner.pushTempValue();
        this.second.get(temp);          // right operand
        if (ret.is_number() && temp.is_number())
        {
            ret.data += temp.data;          // both operands numbers: add
            if (temp.is_float())
                ret.make_float();
        }
        this.owner.popTempValue();
    };
    ExpNode.prototype.eval_subtract = function (ret)
    {
        this.first.get(ret);                // left operand
        var temp = this.owner.pushTempValue();
        this.second.get(temp);          // right operand
        if (ret.is_number() && temp.is_number())
        {
            ret.data -= temp.data;          // both operands numbers: subtract
            if (temp.is_float())
                ret.make_float();
        }
        this.owner.popTempValue();
    };
    ExpNode.prototype.eval_multiply = function (ret)
    {
        this.first.get(ret);                // left operand
        var temp = this.owner.pushTempValue();
        this.second.get(temp);          // right operand
        if (ret.is_number() && temp.is_number())
        {
            ret.data *= temp.data;          // both operands numbers: multiply
            if (temp.is_float())
                ret.make_float();
        }
        this.owner.popTempValue();
    };
    ExpNode.prototype.eval_divide = function (ret)
    {
        this.first.get(ret);                // left operand
        var temp = this.owner.pushTempValue();
        this.second.get(temp);          // right operand
        if (ret.is_number() && temp.is_number())
        {
            ret.data /= temp.data;          // both operands numbers: divide
            ret.make_float();
        }
        this.owner.popTempValue();
    };
    ExpNode.prototype.eval_mod = function (ret)
    {
        this.first.get(ret);                // left operand
        var temp = this.owner.pushTempValue();
        this.second.get(temp);          // right operand
        if (ret.is_number() && temp.is_number())
        {
            ret.data %= temp.data;          // both operands numbers: modulo
            if (temp.is_float())
                ret.make_float();
        }
        this.owner.popTempValue();
    };
    ExpNode.prototype.eval_power = function (ret)
    {
        this.first.get(ret);                // left operand
        var temp = this.owner.pushTempValue();
        this.second.get(temp);          // right operand
        if (ret.is_number() && temp.is_number())
        {
            ret.data = Math.pow(ret.data, temp.data);   // both operands numbers: raise to power
            if (temp.is_float())
                ret.make_float();
        }
        this.owner.popTempValue();
    };
    ExpNode.prototype.eval_and = function (ret)
    {
        this.first.get(ret);                // left operand
        var temp = this.owner.pushTempValue();
        this.second.get(temp);          // right operand
        if (ret.is_number())
        {
            if (temp.is_string())
            {
                ret.set_string(ret.data.toString() + temp.data);
            }
            else
            {
                if (ret.data && temp.data)
                    ret.set_int(1);
                else
                    ret.set_int(0);
            }
        }
        else if (ret.is_string())
        {
            if (temp.is_string())
                ret.data += temp.data;
            else
            {
                ret.data += (Math.round(temp.data * 1e10) / 1e10).toString();
            }
        }
        this.owner.popTempValue();
    };
    ExpNode.prototype.eval_or = function (ret)
    {
        this.first.get(ret);                // left operand
        var temp = this.owner.pushTempValue();
        this.second.get(temp);          // right operand
        if (ret.is_number() && temp.is_number())
        {
            if (ret.data || temp.data)
                ret.set_int(1);
            else
                ret.set_int(0);
        }
        this.owner.popTempValue();
    };
    ExpNode.prototype.eval_conditional = function (ret)
    {
        this.first.get(ret);                // condition operand
        if (ret.data)                       // is true
            this.second.get(ret);           // evaluate second operand to ret
        else
            this.third.get(ret);            // evaluate third operand to ret
    };
    ExpNode.prototype.eval_equal = function (ret)
    {
        this.first.get(ret);                // left operand
        var temp = this.owner.pushTempValue();
        this.second.get(temp);          // right operand
        ret.set_int(ret.data === temp.data ? 1 : 0);
        this.owner.popTempValue();
    };
    ExpNode.prototype.eval_notequal = function (ret)
    {
        this.first.get(ret);                // left operand
        var temp = this.owner.pushTempValue();
        this.second.get(temp);          // right operand
        ret.set_int(ret.data !== temp.data ? 1 : 0);
        this.owner.popTempValue();
    };
    ExpNode.prototype.eval_less = function (ret)
    {
        this.first.get(ret);                // left operand
        var temp = this.owner.pushTempValue();
        this.second.get(temp);          // right operand
        ret.set_int(ret.data < temp.data ? 1 : 0);
        this.owner.popTempValue();
    };
    ExpNode.prototype.eval_lessequal = function (ret)
    {
        this.first.get(ret);                // left operand
        var temp = this.owner.pushTempValue();
        this.second.get(temp);          // right operand
        ret.set_int(ret.data <= temp.data ? 1 : 0);
        this.owner.popTempValue();
    };
    ExpNode.prototype.eval_greater = function (ret)
    {
        this.first.get(ret);                // left operand
        var temp = this.owner.pushTempValue();
        this.second.get(temp);          // right operand
        ret.set_int(ret.data > temp.data ? 1 : 0);
        this.owner.popTempValue();
    };
    ExpNode.prototype.eval_greaterequal = function (ret)
    {
        this.first.get(ret);                // left operand
        var temp = this.owner.pushTempValue();
        this.second.get(temp);          // right operand
        ret.set_int(ret.data >= temp.data ? 1 : 0);
        this.owner.popTempValue();
    };
    ExpNode.prototype.eval_eventvar_exp = function (ret)
    {
        var val = this.eventvar.getValue();
        if (cr.is_number(val))
            ret.set_float(val);
        else
            ret.set_string(val);
    };
    cr.expNode = ExpNode;
    function ExpValue(type, data)
    {
        this.type = type || cr.exptype.Integer;
        this.data = data || 0;
        this.object_class = null;
;
;
;
        if (this.type == cr.exptype.Integer)
            this.data = Math.floor(this.data);
        cr.seal(this);
    };
    ExpValue.prototype.is_int = function ()
    {
        return this.type === cr.exptype.Integer;
    };
    ExpValue.prototype.is_float = function ()
    {
        return this.type === cr.exptype.Float;
    };
    ExpValue.prototype.is_number = function ()
    {
        return this.type === cr.exptype.Integer || this.type === cr.exptype.Float;
    };
    ExpValue.prototype.is_string = function ()
    {
        return this.type === cr.exptype.String;
    };
    ExpValue.prototype.make_int = function ()
    {
        if (!this.is_int())
        {
            if (this.is_float())
                this.data = Math.floor(this.data);      // truncate float
            else if (this.is_string())
                this.data = parseInt(this.data, 10);
            this.type = cr.exptype.Integer;
        }
    };
    ExpValue.prototype.make_float = function ()
    {
        if (!this.is_float())
        {
            if (this.is_string())
                this.data = parseFloat(this.data);
            this.type = cr.exptype.Float;
        }
    };
    ExpValue.prototype.make_string = function ()
    {
        if (!this.is_string())
        {
            this.data = this.data.toString();
            this.type = cr.exptype.String;
        }
    };
    ExpValue.prototype.set_int = function (val)
    {
;
        this.type = cr.exptype.Integer;
        this.data = Math.floor(val);
    };
    ExpValue.prototype.set_float = function (val)
    {
;
        this.type = cr.exptype.Float;
        this.data = val;
    };
    ExpValue.prototype.set_string = function (val)
    {
;
        this.type = cr.exptype.String;
        this.data = val;
    };
    ExpValue.prototype.set_any = function (val)
    {
        if (cr.is_number(val))
        {
            this.type = cr.exptype.Float;
            this.data = val;
        }
        else if (cr.is_string(val))
        {
            this.type = cr.exptype.String;
            this.data = val.toString();
        }
        else
        {
            this.type = cr.exptype.Integer;
            this.data = 0;
        }
    };
    cr.expvalue = ExpValue;
    cr.exptype = {
        Integer: 0,     // emulated; no native integer support in javascript
        Float: 1,
        String: 2
    };
}());
;
cr.system_object = function (runtime)
{
    this.runtime = runtime;
    this.waits = [];
};
(function ()
{
    var sysProto = cr.system_object.prototype;
    function SysCnds() {};
    SysCnds.prototype.EveryTick = function()
    {
        return true;
    };
    SysCnds.prototype.OnLayoutStart = function()
    {
        return true;
    };
    SysCnds.prototype.OnLayoutEnd = function()
    {
        return true;
    };
    SysCnds.prototype.Compare = function(x, cmp, y)
    {
        return cr.do_cmp(x, cmp, y);
    };
    SysCnds.prototype.CompareTime = function (cmp, t)
    {
        var elapsed = this.runtime.kahanTime.sum;
        if (cmp === 0)
        {
            var cnd = this.runtime.getCurrentCondition();
            if (!cnd.extra.CompareTime_executed)
            {
                if (elapsed >= t)
                {
                    cnd.extra.CompareTime_executed = true;
                    return true;
                }
            }
            return false;
        }
        return cr.do_cmp(elapsed, cmp, t);
    };
    SysCnds.prototype.LayerVisible = function (layer)
    {
        if (!layer)
            return false;
        else
            return layer.visible;
    };
    SysCnds.prototype.LayerCmpOpacity = function (layer, cmp, opacity_)
    {
        if (!layer)
            return false;
        return cr.do_cmp(layer.opacity * 100, cmp, opacity_);
    };
    SysCnds.prototype.Repeat = function (count)
    {
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
        var solModifierAfterCnds = current_frame.isModifierAfterCnds();
        var current_loop = this.runtime.pushLoopStack();
        var i;
        if (solModifierAfterCnds)
        {
            for (i = 0; i < count && !current_loop.stopped; i++)
            {
                this.runtime.pushCopySol(current_event.solModifiers);
                current_loop.index = i;
                current_event.retrigger();
                this.runtime.popSol(current_event.solModifiers);
            }
        }
        else
        {
            for (i = 0; i < count && !current_loop.stopped; i++)
            {
                current_loop.index = i;
                current_event.retrigger();
            }
        }
        this.runtime.popLoopStack();
        return false;
    };
    SysCnds.prototype.While = function (count)
    {
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
        var solModifierAfterCnds = current_frame.isModifierAfterCnds();
        var current_loop = this.runtime.pushLoopStack();
        var i;
        if (solModifierAfterCnds)
        {
            for (i = 0; !current_loop.stopped; i++)
            {
                this.runtime.pushCopySol(current_event.solModifiers);
                current_loop.index = i;
                if (!current_event.retrigger())     // one of the other conditions returned false
                    current_loop.stopped = true;    // break
                this.runtime.popSol(current_event.solModifiers);
            }
        }
        else
        {
            for (i = 0; !current_loop.stopped; i++)
            {
                current_loop.index = i;
                if (!current_event.retrigger())
                    current_loop.stopped = true;
            }
        }
        this.runtime.popLoopStack();
        return false;
    };
    SysCnds.prototype.For = function (name, start, end)
    {
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
        var solModifierAfterCnds = current_frame.isModifierAfterCnds();
        var current_loop = this.runtime.pushLoopStack(name);
        var i;
        if (solModifierAfterCnds)
        {
            for (i = start; i <= end && !current_loop.stopped; i++)  // inclusive to end
            {
                this.runtime.pushCopySol(current_event.solModifiers);
                current_loop.index = i;
                current_event.retrigger();
                this.runtime.popSol(current_event.solModifiers);
            }
        }
        else
        {
            for (i = start; i <= end && !current_loop.stopped; i++)  // inclusive to end
            {
                current_loop.index = i;
                current_event.retrigger();
            }
        }
        this.runtime.popLoopStack();
        return false;
    };
    var foreach_instancestack = [];
    var foreach_instanceptr = -1;
    SysCnds.prototype.ForEach = function (obj)
    {
        var sol = obj.getCurrentSol();
        foreach_instanceptr++;
        if (foreach_instancestack.length === foreach_instanceptr)
            foreach_instancestack.push([]);
        var instances = foreach_instancestack[foreach_instanceptr];
        cr.shallowAssignArray(instances, sol.getObjects());
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
        var solModifierAfterCnds = current_frame.isModifierAfterCnds();
        var current_loop = this.runtime.pushLoopStack();
        var i, len, j, lenj, inst, s, sol2;
        var is_contained = obj.is_contained;
        if (solModifierAfterCnds)
        {
            for (i = 0, len = instances.length; i < len && !current_loop.stopped; i++)
            {
                this.runtime.pushCopySol(current_event.solModifiers);
                inst = instances[i];
                sol = obj.getCurrentSol();
                sol.select_all = false;
                sol.instances.length = 1;
                sol.instances[0] = inst;
                if (is_contained)
                {
                    for (j = 0, lenj = inst.siblings.length; j < lenj; j++)
                    {
                        s = inst.siblings[j];
                        sol2 = s.type.getCurrentSol();
                        sol2.select_all = false;
                        sol2.instances.length = 1;
                        sol2.instances[0] = s;
                    }
                }
                current_loop.index = i;
                current_event.retrigger();
                this.runtime.popSol(current_event.solModifiers);
            }
        }
        else
        {
            sol.select_all = false;
            sol.instances.length = 1;
            for (i = 0, len = instances.length; i < len && !current_loop.stopped; i++)
            {
                inst = instances[i];
                sol.instances[0] = inst;
                if (is_contained)
                {
                    for (j = 0, lenj = inst.siblings.length; j < lenj; j++)
                    {
                        s = inst.siblings[j];
                        sol2 = s.type.getCurrentSol();
                        sol2.select_all = false;
                        sol2.instances.length = 1;
                        sol2.instances[0] = s;
                    }
                }
                current_loop.index = i;
                current_event.retrigger();
            }
        }
        this.runtime.popLoopStack();
        foreach_instanceptr--;
        return false;
    };
    function foreach_sortinstances(a, b)
    {
        var va = a.extra.c2_foreachordered_val;
        var vb = b.extra.c2_foreachordered_val;
        if (cr.is_number(va) && cr.is_number(vb))
            return va - vb;
        else
        {
            va = "" + va;
            vb = "" + vb;
            if (va < vb)
                return -1;
            else if (va > vb)
                return 1;
            else
                return 0;
        }
    };
    SysCnds.prototype.ForEachOrdered = function (obj, exp, order)
    {
        var sol = obj.getCurrentSol();
        foreach_instanceptr++;
        if (foreach_instancestack.length === foreach_instanceptr)
            foreach_instancestack.push([]);
        var instances = foreach_instancestack[foreach_instanceptr];
        cr.shallowAssignArray(instances, sol.getObjects());
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
        var current_condition = this.runtime.getCurrentCondition();
        var solModifierAfterCnds = current_frame.isModifierAfterCnds();
        var current_loop = this.runtime.pushLoopStack();
        var i, len, j, lenj, inst, s, sol2;
        for (i = 0, len = instances.length; i < len; i++)
        {
            instances[i].extra.c2_foreachordered_val = current_condition.parameters[1].get(i);
        }
        instances.sort(foreach_sortinstances);
        if (order === 1)
            instances.reverse();
        var is_contained = obj.is_contained;
        if (solModifierAfterCnds)
        {
            for (i = 0, len = instances.length; i < len && !current_loop.stopped; i++)
            {
                this.runtime.pushCopySol(current_event.solModifiers);
                inst = instances[i];
                sol = obj.getCurrentSol();
                sol.select_all = false;
                sol.instances.length = 1;
                sol.instances[0] = inst;
                if (is_contained)
                {
                    for (j = 0, lenj = inst.siblings.length; j < lenj; j++)
                    {
                        s = inst.siblings[j];
                        sol2 = s.type.getCurrentSol();
                        sol2.select_all = false;
                        sol2.instances.length = 1;
                        sol2.instances[0] = s;
                    }
                }
                current_loop.index = i;
                current_event.retrigger();
                this.runtime.popSol(current_event.solModifiers);
            }
        }
        else
        {
            sol.select_all = false;
            sol.instances.length = 1;
            for (i = 0, len = instances.length; i < len && !current_loop.stopped; i++)
            {
                inst = instances[i];
                sol.instances[0] = inst;
                if (is_contained)
                {
                    for (j = 0, lenj = inst.siblings.length; j < lenj; j++)
                    {
                        s = inst.siblings[j];
                        sol2 = s.type.getCurrentSol();
                        sol2.select_all = false;
                        sol2.instances.length = 1;
                        sol2.instances[0] = s;
                    }
                }
                current_loop.index = i;
                current_event.retrigger();
            }
        }
        this.runtime.popLoopStack();
        foreach_instanceptr--;
        return false;
    };
    SysCnds.prototype.TriggerOnce = function ()
    {
        var cndextra = this.runtime.getCurrentCondition().extra;
        if (typeof cndextra.TriggerOnce_lastTick === "undefined")
            cndextra.TriggerOnce_lastTick = -1;
        var last_tick = cndextra.TriggerOnce_lastTick;
        var cur_tick = this.runtime.tickcount;
        cndextra.TriggerOnce_lastTick = cur_tick;
        return this.runtime.layout_first_tick || last_tick !== cur_tick - 1;
    };
    SysCnds.prototype.Every = function (seconds)
    {
        var cnd = this.runtime.getCurrentCondition();
        var last_time = cnd.extra.Every_lastTime || 0;
        var cur_time = this.runtime.kahanTime.sum;
        if (cur_time >= last_time + seconds)
        {
            cnd.extra.Every_lastTime = last_time + seconds;
            if (cur_time >= cnd.extra.Every_lastTime + seconds)
                cnd.extra.Every_lastTime = cur_time;
            return true;
        }
        else
            return false;
    };
    SysCnds.prototype.PickNth = function (obj, index)
    {
        if (!obj)
            return false;
        var sol = obj.getCurrentSol();
        var instances = sol.getObjects();
        index = cr.floor(index);
        if (index < 0 || index >= instances.length)
            return false;
        var inst = instances[index];
        sol.pick_one(inst);
        obj.applySolToContainer();
        return true;
    };
    SysCnds.prototype.PickRandom = function (obj)
    {
        if (!obj)
            return false;
        var sol = obj.getCurrentSol();
        var instances = sol.getObjects();
        var index = cr.floor(Math.random() * instances.length);
        if (index >= instances.length)
            return false;
        var inst = instances[index];
        sol.pick_one(inst);
        obj.applySolToContainer();
        return true;
    };
    SysCnds.prototype.CompareVar = function (v, cmp, val)
    {
        return cr.do_cmp(v.getValue(), cmp, val);
    };
    SysCnds.prototype.IsGroupActive = function (group)
    {
        return this.runtime.activeGroups[(/*this.runtime.getCurrentCondition().sheet.name + "|" + */group).toLowerCase()];
    };
    SysCnds.prototype.IsPreview = function ()
    {
        return typeof cr_is_preview !== "undefined";
    };
    SysCnds.prototype.PickAll = function (obj)
    {
        if (!obj)
            return false;
        if (!obj.instances.length)
            return false;
        var sol = obj.getCurrentSol();
        sol.select_all = true;
        obj.applySolToContainer();
        return true;
    };
    SysCnds.prototype.IsMobile = function ()
    {
        return this.runtime.isMobile;
    };
    SysCnds.prototype.CompareBetween = function (x, a, b)
    {
        return x >= a && x <= b;
    };
    SysCnds.prototype.Else = function ()
    {
        var current_frame = this.runtime.getCurrentEventStack();
        if (current_frame.else_branch_ran)
            return false;       // another event in this else-if chain has run
        else
            return !current_frame.last_event_true;
        /*
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
        var prev_event = current_event.prev_block;
        if (!prev_event)
            return false;
        if (prev_event.is_logical)
            return !this.runtime.last_event_true;
        var i, len, j, lenj, s, sol, temp, inst, any_picked = false;
        for (i = 0, len = prev_event.cndReferences.length; i < len; i++)
        {
            s = prev_event.cndReferences[i];
            sol = s.getCurrentSol();
            if (sol.select_all || sol.instances.length === s.instances.length)
            {
                sol.select_all = false;
                sol.instances.length = 0;
            }
            else
            {
                if (sol.instances.length === 1 && sol.else_instances.length === 0 && s.instances.length >= 2)
                {
                    inst = sol.instances[0];
                    sol.instances.length = 0;
                    for (j = 0, lenj = s.instances.length; j < lenj; j++)
                    {
                        if (s.instances[j] != inst)
                            sol.instances.push(s.instances[j]);
                    }
                    any_picked = true;
                }
                else
                {
                    temp = sol.instances;
                    sol.instances = sol.else_instances;
                    sol.else_instances = temp;
                    any_picked = true;
                }
            }
        }
        return any_picked;
        */
    };
    SysCnds.prototype.OnLoadFinished = function ()
    {
        return true;
    };
    SysCnds.prototype.OnCanvasSnapshot = function ()
    {
        return true;
    };
    SysCnds.prototype.EffectsSupported = function ()
    {
        return !!this.runtime.glwrap;
    };
    sysProto.cnds = new SysCnds();
    function SysActs() {};
    SysActs.prototype.GoToLayout = function(to)
    {
        if (this.runtime.isloading)
            return;     // cannot change layout while loading on loader layout
        if (this.runtime.changelayout)
            return;     // already changing to a different layout
;
        this.runtime.changelayout = to;
    };
    SysActs.prototype.CreateObject = function (obj, layer, x, y)
    {
        if (!layer || !obj)
            return;
        var inst = this.runtime.createInstance(obj, layer, x, y);
        if (!inst)
            return;
        this.runtime.isInOnDestroy++;
        this.runtime.trigger(Object.getPrototypeOf(obj.plugin).cnds.OnCreated, inst);
        this.runtime.isInOnDestroy--;
        var sol = obj.getCurrentSol();
        sol.select_all = false;
        sol.instances.length = 1;
        sol.instances[0] = inst;
        var i, len, s;
        if (inst.is_contained)
        {
            for (i = 0, len = inst.siblings.length; i < len; i++)
            {
                s = inst.siblings[i];
                sol = s.type.getCurrentSol();
                sol.select_all = false;
                sol.instances.length = 1;
                sol.instances[0] = s;
            }
        }
    };
    SysActs.prototype.SetLayerVisible = function (layer, visible_)
    {
        if (!layer)
            return;
        if (layer.visible !== visible_)
        {
            layer.visible = visible_;
            this.runtime.redraw = true;
        }
    };
    SysActs.prototype.SetLayerOpacity = function (layer, opacity_)
    {
        if (!layer)
            return;
        opacity_ = cr.clamp(opacity_ / 100, 0, 1);
        if (layer.opacity !== opacity_)
        {
            layer.opacity = opacity_;
            this.runtime.redraw = true;
        }
    };
    SysActs.prototype.SetLayerScaleRate = function (layer, sr)
    {
        if (!layer)
            return;
        if (layer.zoomRate !== sr)
        {
            layer.zoomRate = sr;
            this.runtime.redraw = true;
        }
    };
    SysActs.prototype.SetLayoutScale = function (s)
    {
        if (!this.runtime.running_layout)
            return;
        if (this.runtime.running_layout.scale !== s)
        {
            this.runtime.running_layout.scale = s;
            this.runtime.redraw = true;
        }
    };
    SysActs.prototype.ScrollX = function(x)
    {
        this.runtime.running_layout.scrollToX(x);
    };
    SysActs.prototype.ScrollY = function(y)
    {
        this.runtime.running_layout.scrollToY(y);
    };
    SysActs.prototype.Scroll = function(x, y)
    {
        this.runtime.running_layout.scrollToX(x);
        this.runtime.running_layout.scrollToY(y);
    };
    SysActs.prototype.ScrollToObject = function(obj)
    {
        var inst = obj.getFirstPicked();
        if (inst)
        {
            this.runtime.running_layout.scrollToX(inst.x);
            this.runtime.running_layout.scrollToY(inst.y);
        }
    };
    SysActs.prototype.SetVar = function(v, x)
    {
;
        if (v.vartype === 0)
        {
            if (cr.is_number(x))
                v.setValue(x);
            else
                v.setValue(parseFloat(x));
        }
        else if (v.vartype === 1)
            v.setValue(x.toString());
    };
    SysActs.prototype.AddVar = function(v, x)
    {
;
        if (v.vartype === 0)
        {
            if (cr.is_number(x))
                v.setValue(v.getValue() + x);
            else
                v.setValue(v.getValue() + parseFloat(x));
        }
        else if (v.vartype === 1)
            v.setValue(v.getValue() + x.toString());
    };
    SysActs.prototype.SubVar = function(v, x)
    {
;
        if (v.vartype === 0)
        {
            if (cr.is_number(x))
                v.setValue(v.getValue() - x);
            else
                v.setValue(v.getValue() - parseFloat(x));
        }
    };
    SysActs.prototype.SetGroupActive = function (group, active)
    {
        var activeGroups = this.runtime.activeGroups;
        var groupkey = (/*this.runtime.getCurrentAction().sheet.name + "|" + */group).toLowerCase();
        switch (active) {
        case 0:
            activeGroups[groupkey] = false;
            break;
        case 1:
            activeGroups[groupkey] = true;
            break;
        case 2:
            activeGroups[groupkey] = !activeGroups[groupkey];
            break;
        }
    };
    SysActs.prototype.SetTimescale = function (ts_)
    {
        var ts = ts_;
        if (ts < 0)
            ts = 0;
        this.runtime.timescale = ts;
    };
    SysActs.prototype.SetObjectTimescale = function (obj, ts_)
    {
        var ts = ts_;
        if (ts < 0)
            ts = 0;
        if (!obj)
            return;
        var sol = obj.getCurrentSol();
        var instances = sol.getObjects();
        var i, len;
        for (i = 0, len = instances.length; i < len; i++)
        {
            instances[i].my_timescale = ts;
        }
    };
    SysActs.prototype.RestoreObjectTimescale = function (obj)
    {
        if (!obj)
            return false;
        var sol = obj.getCurrentSol();
        var instances = sol.getObjects();
        var i, len;
        for (i = 0, len = instances.length; i < len; i++)
        {
            instances[i].my_timescale = -1.0;
        }
    };
    SysActs.prototype.Wait = function (seconds)
    {
        if (seconds < 0)
            return;
        var i, len, s, t;
        var evinfo = this.runtime.getCurrentEventStack();
        var waitobj = {};
        waitobj.time = this.runtime.kahanTime.sum + seconds;
        waitobj.ev = evinfo.current_event;
        waitobj.actindex = evinfo.actindex + 1; // pointing at next action
        waitobj.deleteme = false;
        waitobj.sols = {};
        waitobj.solModifiers = [];
        for (i = 0, len = this.runtime.types_by_index.length; i < len; i++)
        {
            t = this.runtime.types_by_index[i];
            s = t.getCurrentSol();
            if (s.select_all && evinfo.current_event.solModifiers.indexOf(t) === -1)
                continue;
            waitobj.solModifiers.push(t);
            waitobj.sols[i.toString()] = s.instances.slice(0);
        }
        this.waits.push(waitobj);
        return true;
    };
    SysActs.prototype.SetLayerScale = function (layer, scale)
    {
        if (!layer)
            return;
        if (layer.scale === scale)
            return;
        layer.scale = scale;
        this.runtime.redraw = true;
    };
    SysActs.prototype.ResetGlobals = function ()
    {
        var i, len, g;
        for (i = 0, len = this.runtime.all_global_vars.length; i < len; i++)
        {
            g = this.runtime.all_global_vars[i];
            g.data = g.initial;
        }
    };
    SysActs.prototype.SetLayoutAngle = function (a)
    {
        a = cr.to_radians(a);
        a = cr.clamp_angle(a);
        if (this.runtime.running_layout)
        {
            if (this.runtime.running_layout.angle !== a)
            {
                this.runtime.running_layout.angle = a;
                this.runtime.redraw = true;
            }
        }
    };
    SysActs.prototype.SetLayerAngle = function (layer, a)
    {
        if (!layer)
            return;
        a = cr.to_radians(a);
        a = cr.clamp_angle(a);
        if (layer.angle === a)
            return;
        layer.angle = a;
        this.runtime.redraw = true;
    };
    SysActs.prototype.StopLoop = function ()
    {
        if (this.runtime.loop_stack_index < 0)
            return;     // no loop currently running
        this.runtime.getCurrentLoop().stopped = true;
    };
    SysActs.prototype.GoToLayoutByName = function (layoutname)
    {
        if (this.runtime.isloading)
            return;     // cannot change layout while loading on loader layout
        if (this.runtime.changelayout)
            return;     // already changing to different layout
;
        var l;
        for (l in this.runtime.layouts)
        {
            if (this.runtime.layouts.hasOwnProperty(l) && l.toLowerCase() === layoutname.toLowerCase())
            {
                this.runtime.changelayout = this.runtime.layouts[l];
                return;
            }
        }
    };
    SysActs.prototype.RestartLayout = function (layoutname)
    {
        if (this.runtime.isloading)
            return;     // cannot restart loader layouts
        if (this.runtime.changelayout)
            return;     // already changing to a different layout
;
        if (!this.runtime.running_layout)
            return;
        this.runtime.changelayout = this.runtime.running_layout;
        var i, len, g;
        for (i = 0, len = this.runtime.allGroups.length; i < len; i++)
        {
            g = this.runtime.allGroups[i];
            this.runtime.activeGroups[g.group_name.toLowerCase()] = g.initially_activated;
        }
    };
    SysActs.prototype.SnapshotCanvas = function (format_, quality_)
    {
        this.runtime.snapshotCanvas = [format_ === 0 ? "image/png" : "image/jpeg", quality_ / 100];
        this.runtime.redraw = true;     // force redraw so snapshot is always taken
    };
    SysActs.prototype.SetCanvasSize = function (w, h)
    {
        if (w <= 0 || h <= 0)
            return;
        this.runtime["setSize"](w, h);
    };
    SysActs.prototype.SetLayoutEffectEnabled = function (enable_, effectname_)
    {
        if (!this.runtime.running_layout || !this.runtime.glwrap)
            return;
        var et = this.runtime.running_layout.getEffectByName(effectname_);
        if (!et)
            return;     // effect name not found
        var enable = (enable_ === 1);
        if (et.active == enable)
            return;     // no change
        et.active = enable;
        this.runtime.running_layout.updateActiveEffects();
        this.runtime.redraw = true;
    };
    SysActs.prototype.SetLayerEffectEnabled = function (layer, enable_, effectname_)
    {
        if (!layer || !this.runtime.glwrap)
            return;
        var et = layer.getEffectByName(effectname_);
        if (!et)
            return;     // effect name not found
        var enable = (enable_ === 1);
        if (et.active == enable)
            return;     // no change
        et.active = enable;
        layer.updateActiveEffects();
        this.runtime.redraw = true;
    };
    SysActs.prototype.SetLayoutEffectParam = function (effectname_, index_, value_)
    {
        if (!this.runtime.running_layout || !this.runtime.glwrap)
            return;
        var et = this.runtime.running_layout.getEffectByName(effectname_);
        if (!et)
            return;     // effect name not found
        var params = this.runtime.running_layout.effect_params[et.index];
        index_ = Math.floor(index_);
        if (index_ < 0 || index_ >= params.length)
            return;     // effect index out of bounds
        if (this.runtime.glwrap.getProgramParameterType(et.shaderindex, index_) === 1)
            value_ /= 100.0;
        if (params[index_] === value_)
            return;     // no change
        params[index_] = value_;
        if (et.active)
            this.runtime.redraw = true;
    };
    SysActs.prototype.SetLayerEffectParam = function (layer, effectname_, index_, value_)
    {
        if (!layer || !this.runtime.glwrap)
            return;
        var et = layer.getEffectByName(effectname_);
        if (!et)
            return;     // effect name not found
        var params = layer.effect_params[et.index];
        index_ = Math.floor(index_);
        if (index_ < 0 || index_ >= params.length)
            return;     // effect index out of bounds
        if (this.runtime.glwrap.getProgramParameterType(et.shaderindex, index_) === 1)
            value_ /= 100.0;
        if (params[index_] === value_)
            return;     // no change
        params[index_] = value_;
        if (et.active)
            this.runtime.redraw = true;
    };
    sysProto.acts = new SysActs();
    function SysExps() {};
    SysExps.prototype["int"] = function(ret, x)
    {
        if (cr.is_string(x))
        {
            ret.set_int(parseInt(x, 10));
            if (isNaN(ret.data))
                ret.data = 0;
        }
        else
            ret.set_int(x);
    };
    SysExps.prototype["float"] = function(ret, x)
    {
        if (cr.is_string(x))
        {
            ret.set_float(parseFloat(x));
            if (isNaN(ret.data))
                ret.data = 0;
        }
        else
            ret.set_float(x);
    };
    SysExps.prototype.str = function(ret, x)
    {
        if (cr.is_string(x))
            ret.set_string(x);
        else
            ret.set_string(x.toString());
    };
    SysExps.prototype.len = function(ret, x)
    {
        ret.set_int(x.length || 0);
    };
    SysExps.prototype.random = function (ret, a, b)
    {
        if (b === undefined)
        {
            ret.set_float(Math.random() * a);
        }
        else
        {
            ret.set_float(Math.random() * (b - a) + a);
        }
    };
    SysExps.prototype.sqrt = function(ret, x)
    {
        ret.set_float(Math.sqrt(x));
    };
    SysExps.prototype.abs = function(ret, x)
    {
        ret.set_float(Math.abs(x));
    };
    SysExps.prototype.round = function(ret, x)
    {
        ret.set_int(Math.round(x));
    };
    SysExps.prototype.floor = function(ret, x)
    {
        ret.set_int(Math.floor(x));
    };
    SysExps.prototype.ceil = function(ret, x)
    {
        ret.set_int(Math.ceil(x));
    };
    SysExps.prototype.sin = function(ret, x)
    {
        ret.set_float(Math.sin(cr.to_radians(x)));
    };
    SysExps.prototype.cos = function(ret, x)
    {
        ret.set_float(Math.cos(cr.to_radians(x)));
    };
    SysExps.prototype.tan = function(ret, x)
    {
        ret.set_float(Math.tan(cr.to_radians(x)));
    };
    SysExps.prototype.asin = function(ret, x)
    {
        ret.set_float(cr.to_degrees(Math.asin(x)));
    };
    SysExps.prototype.acos = function(ret, x)
    {
        ret.set_float(cr.to_degrees(Math.acos(x)));
    };
    SysExps.prototype.atan = function(ret, x)
    {
        ret.set_float(cr.to_degrees(Math.atan(x)));
    };
    SysExps.prototype.exp = function(ret, x)
    {
        ret.set_float(Math.exp(x));
    };
    SysExps.prototype.ln = function(ret, x)
    {
        ret.set_float(Math.log(x));
    };
    SysExps.prototype.log10 = function(ret, x)
    {
        ret.set_float(Math.log(x) / Math.LN10);
    };
    SysExps.prototype.max = function(ret)
    {
        var max_ = arguments[1];
        var i, len;
        for (i = 2, len = arguments.length; i < len; i++)
        {
            if (max_ < arguments[i])
                max_ = arguments[i];
        }
        ret.set_float(max_);
    };
    SysExps.prototype.min = function(ret)
    {
        var min_ = arguments[1];
        var i, len;
        for (i = 2, len = arguments.length; i < len; i++)
        {
            if (min_ > arguments[i])
                min_ = arguments[i];
        }
        ret.set_float(min_);
    };
    SysExps.prototype.dt = function(ret)
    {
        ret.set_float(this.runtime.dt);
    };
    SysExps.prototype.timescale = function(ret)
    {
        ret.set_float(this.runtime.timescale);
    };
    SysExps.prototype.wallclocktime = function(ret)
    {
        ret.set_float((Date.now() - this.runtime.start_time) / 1000.0);
    };
    SysExps.prototype.time = function(ret)
    {
        ret.set_float(this.runtime.kahanTime.sum);
    };
    SysExps.prototype.tickcount = function(ret)
    {
        ret.set_int(this.runtime.tickcount);
    };
    SysExps.prototype.objectcount = function(ret)
    {
        ret.set_int(this.runtime.objectcount);
    };
    SysExps.prototype.fps = function(ret)
    {
        ret.set_int(this.runtime.fps);
    };
    SysExps.prototype.loopindex = function(ret, name_)
    {
        if (!this.runtime.loop_stack.length)
        {
            ret.set_int(0);
            return;
        }
        if (name_)
        {
            var i, len;
            for (i = 0, len = this.runtime.loop_stack.length; i < len; i++)
            {
                var loop = this.runtime.loop_stack[i];
                if (loop.name === name_)
                {
                    ret.set_int(loop.index);
                    return;
                }
            }
            ret.set_int(0);
        }
        else
        {
            ret.set_int(this.runtime.getCurrentLoop().index);
        }
    };
    SysExps.prototype.distance = function(ret, x1, y1, x2, y2)
    {
        ret.set_float(cr.distanceTo(x1, y1, x2, y2));
    };
    SysExps.prototype.angle = function(ret, x1, y1, x2, y2)
    {
        ret.set_float(cr.to_degrees(cr.angleTo(x1, y1, x2, y2)));
    };
    SysExps.prototype.scrollx = function(ret)
    {
        ret.set_float(this.runtime.running_layout.scrollX);
    };
    SysExps.prototype.scrolly = function(ret)
    {
        ret.set_float(this.runtime.running_layout.scrollY);
    };
    SysExps.prototype.newline = function(ret)
    {
        ret.set_string("\n");
    };
    SysExps.prototype.lerp = function(ret, a, b, x)
    {
        ret.set_float(cr.lerp(a, b, x));
    };
    SysExps.prototype.windowwidth = function(ret)
    {
        ret.set_int(this.runtime.width);
    };
    SysExps.prototype.windowheight = function(ret)
    {
        ret.set_int(this.runtime.height);
    };
    SysExps.prototype.uppercase = function(ret, str)
    {
        ret.set_string(cr.is_string(str) ? str.toUpperCase() : "");
    };
    SysExps.prototype.lowercase = function(ret, str)
    {
        ret.set_string(cr.is_string(str) ? str.toLowerCase() : "");
    };
    SysExps.prototype.clamp = function(ret, x, l, u)
    {
        if (x < l)
            ret.set_float(l);
        else if (x > u)
            ret.set_float(u);
        else
            ret.set_float(x);
    };
    SysExps.prototype.layerscale = function (ret, layerparam)
    {
        var layer = this.runtime.getLayer(layerparam);
        if (!layer)
            ret.set_float(0);
        else
            ret.set_float(layer.scale);
    };
    SysExps.prototype.layeropacity = function (ret, layerparam)
    {
        var layer = this.runtime.getLayer(layerparam);
        if (!layer)
            ret.set_float(0);
        else
            ret.set_float(layer.opacity * 100);
    };
    SysExps.prototype.layerscalerate = function (ret, layerparam)
    {
        var layer = this.runtime.getLayer(layerparam);
        if (!layer)
            ret.set_float(0);
        else
            ret.set_float(layer.zoomRate);
    };
    SysExps.prototype.layoutscale = function (ret)
    {
        if (this.runtime.running_layout)
            ret.set_float(this.runtime.running_layout.scale);
        else
            ret.set_float(0);
    };
    SysExps.prototype.layoutangle = function (ret)
    {
        ret.set_float(cr.to_degrees(this.runtime.running_layout.angle));
    };
    SysExps.prototype.layerangle = function (ret, layerparam)
    {
        var layer = this.runtime.getLayer(layerparam);
        if (!layer)
            ret.set_float(0);
        else
            ret.set_float(cr.to_degrees(layer.angle));
    };
    SysExps.prototype.layoutwidth = function (ret)
    {
        ret.set_int(this.runtime.running_layout.width);
    };
    SysExps.prototype.layoutheight = function (ret)
    {
        ret.set_int(this.runtime.running_layout.height);
    };
    SysExps.prototype.find = function (ret, text, searchstr)
    {
        if (cr.is_string(text) && cr.is_string(searchstr))
            ret.set_int(text.search(new RegExp(cr.regexp_escape(searchstr), "i")));
        else
            ret.set_int(-1);
    };
    SysExps.prototype.left = function (ret, text, n)
    {
        ret.set_string(cr.is_string(text) ? text.substr(0, n) : "");
    };
    SysExps.prototype.right = function (ret, text, n)
    {
        ret.set_string(cr.is_string(text) ? text.substr(text.length - n) : "");
    };
    SysExps.prototype.mid = function (ret, text, index_, length_)
    {
        ret.set_string(cr.is_string(text) ? text.substr(index_, length_) : "");
    };
    SysExps.prototype.tokenat = function (ret, text, index_, sep)
    {
        if (cr.is_string(text) && cr.is_string(sep))
        {
            var arr = text.split(sep);
            var i = cr.floor(index_);
            if (i < 0 || i >= arr.length)
                ret.set_string("");
            else
                ret.set_string(arr[i]);
        }
        else
            ret.set_string("");
    };
    SysExps.prototype.tokencount = function (ret, text, sep)
    {
        if (cr.is_string(text) && text.length)
            ret.set_int(text.split(sep).length);
        else
            ret.set_int(0);
    };
    SysExps.prototype.replace = function (ret, text, find_, replace_)
    {
        if (cr.is_string(text) && cr.is_string(find_) && cr.is_string(replace_))
            ret.set_string(text.replace(new RegExp(cr.regexp_escape(find_), "gi"), replace_));
        else
            ret.set_string(cr.is_string(text) ? text : "");
    };
    SysExps.prototype.trim = function (ret, text)
    {
        ret.set_string(cr.is_string(text) ? text.trim() : "");
    };
    SysExps.prototype.pi = function (ret)
    {
        ret.set_float(cr.PI);
    };
    SysExps.prototype.layoutname = function (ret)
    {
        if (this.runtime.running_layout)
            ret.set_string(this.runtime.running_layout.name);
        else
            ret.set_string("");
    };
    SysExps.prototype.renderer = function (ret)
    {
        ret.set_string(this.runtime.gl ? "webgl" : "canvas2d");
    };
    SysExps.prototype.anglediff = function (ret, a, b)
    {
        ret.set_float(cr.to_degrees(cr.angleDiff(cr.to_radians(a), cr.to_radians(b))));
    };
    SysExps.prototype.choose = function (ret)
    {
        var index = cr.floor(Math.random() * (arguments.length - 1));
        ret.set_any(arguments[index + 1]);
    };
    SysExps.prototype.rgb = function (ret, r, g, b)
    {
        ret.set_int(cr.RGB(r, g, b));
    };
    SysExps.prototype.projectversion = function (ret)
    {
        ret.set_string(this.runtime.versionstr);
    };
    SysExps.prototype.anglelerp = function (ret, a, b, x)
    {
        a = cr.to_radians(a);
        b = cr.to_radians(b);
        var diff = cr.angleDiff(a, b);
        if (cr.angleClockwise(b, a))
        {
            ret.set_float(cr.to_clamped_degrees(a + diff * x));
        }
        else
        {
            ret.set_float(cr.to_clamped_degrees(a - diff * x));
        }
    };
    SysExps.prototype.anglerotate = function (ret, a, b, c)
    {
        a = cr.to_radians(a);
        b = cr.to_radians(b);
        c = cr.to_radians(c);
        ret.set_float(cr.to_clamped_degrees(cr.angleRotate(a, b, c)));
    };
    SysExps.prototype.zeropad = function (ret, n, d)
    {
        var s = (n < 0 ? "-" : "");
        if (n < 0) n = -n;
        var zeroes = d - n.toString().length;
        for (var i = 0; i < zeroes; i++)
            s += "0";
        ret.set_string(s + n.toString());
    };
    SysExps.prototype.cpuutilisation = function (ret)
    {
        ret.set_float(this.runtime.cpuutilisation / 1000);
    };
    SysExps.prototype.viewportleft = function (ret, layerparam)
    {
        var layer = this.runtime.getLayer(layerparam);
        ret.set_float(layer ? layer.viewLeft : 0);
    };
    SysExps.prototype.viewporttop = function (ret, layerparam)
    {
        var layer = this.runtime.getLayer(layerparam);
        ret.set_float(layer ? layer.viewTop : 0);
    };
    SysExps.prototype.viewportright = function (ret, layerparam)
    {
        var layer = this.runtime.getLayer(layerparam);
        ret.set_float(layer ? layer.viewRight : 0);
    };
    SysExps.prototype.viewportbottom = function (ret, layerparam)
    {
        var layer = this.runtime.getLayer(layerparam);
        ret.set_float(layer ? layer.viewBottom : 0);
    };
    SysExps.prototype.loadingprogress = function (ret)
    {
        ret.set_float(this.runtime.loadingprogress);
    };
    SysExps.prototype.unlerp = function(ret, a, b, y)
    {
        ret.set_float((y - a) / (b - a));
    };
    SysExps.prototype.canvassnapshot = function (ret)
    {
        ret.set_string(this.runtime.snapshotData);
    };
    SysExps.prototype.urlencode = function (ret, s)
    {
        ret.set_string(encodeURIComponent(s));
    };
    SysExps.prototype.urldecode = function (ret, s)
    {
        ret.set_string(decodeURIComponent(s));
    };
    SysExps.prototype.canvastolayerx = function (ret, layerparam, x, y)
    {
        var layer = this.runtime.getLayer(layerparam);
        ret.set_float(layer ? layer.canvasToLayer(x, y, true) : 0);
    };
    SysExps.prototype.canvastolayery = function (ret, layerparam, x, y)
    {
        var layer = this.runtime.getLayer(layerparam);
        ret.set_float(layer ? layer.canvasToLayer(x, y, false) : 0);
    };
    SysExps.prototype.layertocanvasx = function (ret, layerparam, x, y)
    {
        var layer = this.runtime.getLayer(layerparam);
        ret.set_float(layer ? layer.layerToCanvas(x, y, true) : 0);
    };
    SysExps.prototype.layertocanvasy = function (ret, layerparam, x, y)
    {
        var layer = this.runtime.getLayer(layerparam);
        ret.set_float(layer ? layer.layerToCanvas(x, y, false) : 0);
    };
    sysProto.exps = new SysExps();
    sysProto.runWaits = function ()
    {
        var i, j, len, w, k, s;
        var evinfo = this.runtime.getCurrentEventStack();
        for (i = 0, len = this.waits.length; i < len; i++)
        {
            w = this.waits[i];
            if (w.time > this.runtime.kahanTime.sum)
                continue;
            evinfo.current_event = w.ev;
            evinfo.actindex = w.actindex;
            evinfo.cndindex = 0;
            for (k in w.sols)
            {
                if (w.sols.hasOwnProperty(k))
                {
                    s = this.runtime.types_by_index[parseInt(k, 10)].getCurrentSol();
                    s.select_all = false;
                    s.instances = w.sols[k];
                }
            }
            w.ev.resume_actions_and_subevents();
            this.runtime.clearSol(w.solModifiers);
            w.deleteme = true;
        }
        for (i = 0, j = 0, len = this.waits.length; i < len; i++)
        {
            w = this.waits[i];
            this.waits[j] = w;
            if (!w.deleteme)
                j++;
        }
        this.waits.length = j;
    };
}());
;
cr.add_common_aces = function (m)
{
    var pluginProto = m[0].prototype;
    var singleglobal_ = m[1];
    var position_aces = m[3];
    var size_aces = m[4];
    var angle_aces = m[5];
    var appearance_aces = m[6];
    var zorder_aces = m[7];
    var effects_aces = m[8];
    if (!pluginProto.cnds)
        pluginProto.cnds = {};
    if (!pluginProto.acts)
        pluginProto.acts = {};
    if (!pluginProto.exps)
        pluginProto.exps = {};
    var cnds = pluginProto.cnds;
    var acts = pluginProto.acts;
    var exps = pluginProto.exps;
    if (position_aces)
    {
        cnds.CompareX = function (cmp, x)
        {
            return cr.do_cmp(this.x, cmp, x);
        };
        cnds.CompareY = function (cmp, y)
        {
            return cr.do_cmp(this.y, cmp, y);
        };
        cnds.IsOnScreen = function ()
        {
            var layer = this.layer;
            this.update_bbox();
            var bbox = this.bbox;
            return !(bbox.right < layer.viewLeft || bbox.bottom < layer.viewTop || bbox.left > layer.viewRight || bbox.top > layer.viewBottom);
        };
        cnds.IsOutsideLayout = function ()
        {
            this.update_bbox();
            var bbox = this.bbox;
            var layout = this.runtime.running_layout;
            return (bbox.right < 0 || bbox.bottom < 0 || bbox.left > layout.width || bbox.top > layout.height);
        };
        cnds.PickDistance = function (which, x, y)
        {
            var sol = this.getCurrentSol();
            var instances = sol.getObjects();
            if (!instances.length)
                return false;
            var inst = instances[0];
            var pickme = inst;
            var dist = cr.distanceTo(inst.x, inst.y, x, y);
            var i, len, d;
            for (i = 1, len = instances.length; i < len; i++)
            {
                inst = instances[i];
                d = cr.distanceTo(inst.x, inst.y, x, y);
                if ((which === 0 && d < dist) || (which === 1 && d > dist))
                {
                    dist = d;
                    pickme = inst;
                }
            }
            sol.pick_one(pickme);
            return true;
        };
        acts.SetX = function (x)
        {
            if (this.x !== x)
            {
                this.x = x;
                this.set_bbox_changed();
            }
        };
        acts.SetY = function (y)
        {
            if (this.y !== y)
            {
                this.y = y;
                this.set_bbox_changed();
            }
        };
        acts.SetPos = function (x, y)
        {
            if (this.x !== x || this.y !== y)
            {
                this.x = x;
                this.y = y;
                this.set_bbox_changed();
            }
        };
        acts.SetPosToObject = function (obj, imgpt)
        {
            var inst = obj.getPairedInstance(this);
            if (!inst)
                return;
            var newx, newy;
            if (inst.getImagePoint)
            {
                newx = inst.getImagePoint(imgpt, true);
                newy = inst.getImagePoint(imgpt, false);
            }
            else
            {
                newx = inst.x;
                newy = inst.y;
            }
            if (this.x !== newx || this.y !== newy)
            {
                this.x = newx;
                this.y = newy;
                this.set_bbox_changed();
            }
        };
        acts.MoveForward = function (dist)
        {
            if (dist !== 0)
            {
                this.x += Math.cos(this.angle) * dist;
                this.y += Math.sin(this.angle) * dist;
                this.set_bbox_changed();
            }
        };
        acts.MoveAtAngle = function (a, dist)
        {
            if (dist !== 0)
            {
                this.x += Math.cos(cr.to_radians(a)) * dist;
                this.y += Math.sin(cr.to_radians(a)) * dist;
                this.set_bbox_changed();
            }
        };
        exps.X = function (ret)
        {
            ret.set_float(this.x);
        };
        exps.Y = function (ret)
        {
            ret.set_float(this.y);
        };
        exps.dt = function (ret)
        {
            ret.set_float(this.runtime.getDt(this));
        };
    }
    if (size_aces)
    {
        cnds.CompareWidth = function (cmp, w)
        {
            return cr.do_cmp(this.width, cmp, w);
        };
        cnds.CompareHeight = function (cmp, h)
        {
            return cr.do_cmp(this.height, cmp, h);
        };
        acts.SetWidth = function (w)
        {
            if (this.width !== w)
            {
                this.width = w;
                this.set_bbox_changed();
            }
        };
        acts.SetHeight = function (h)
        {
            if (this.height !== h)
            {
                this.height = h;
                this.set_bbox_changed();
            }
        };
        acts.SetSize = function (w, h)
        {
            if (this.width !== w || this.height !== h)
            {
                this.width = w;
                this.height = h;
                this.set_bbox_changed();
            }
        };
        exps.Width = function (ret)
        {
            ret.set_float(this.width);
        };
        exps.Height = function (ret)
        {
            ret.set_float(this.height);
        };
    }
    if (angle_aces)
    {
        cnds.AngleWithin = function (within, a)
        {
            return cr.angleDiff(this.angle, cr.to_radians(a)) <= cr.to_radians(within);
        };
        cnds.IsClockwiseFrom = function (a)
        {
            return cr.angleClockwise(this.angle, cr.to_radians(a));
        };
        cnds.IsBetweenAngles = function (a, b)
        {
            var lower = cr.to_clamped_radians(a);
            var upper = cr.to_clamped_radians(b);
            var angle = cr.clamp_angle(this.angle);
            var obtuse = (!cr.angleClockwise(upper, lower));
            if (obtuse)
                return !(!cr.angleClockwise(angle, lower) && cr.angleClockwise(angle, upper));
            else
                return cr.angleClockwise(angle, lower) && !cr.angleClockwise(angle, upper);
        };
        acts.SetAngle = function (a)
        {
            var newangle = cr.to_radians(cr.clamp_angle_degrees(a));
            if (isNaN(newangle))
                return;
            if (this.angle !== newangle)
            {
                this.angle = newangle;
                this.set_bbox_changed();
            }
        };
        acts.RotateClockwise = function (a)
        {
            if (a !== 0 && !isNaN(a))
            {
                this.angle += cr.to_radians(a);
                this.angle = cr.clamp_angle(this.angle);
                this.set_bbox_changed();
            }
        };
        acts.RotateCounterclockwise = function (a)
        {
            if (a !== 0 && !isNaN(a))
            {
                this.angle -= cr.to_radians(a);
                this.angle = cr.clamp_angle(this.angle);
                this.set_bbox_changed();
            }
        };
        acts.RotateTowardAngle = function (amt, target)
        {
            var newangle = cr.angleRotate(this.angle, cr.to_radians(target), cr.to_radians(amt));
            if (isNaN(newangle))
                return;
            if (this.angle !== newangle)
            {
                this.angle = newangle;
                this.set_bbox_changed();
            }
        };
        acts.RotateTowardPosition = function (amt, x, y)
        {
            var dx = x - this.x;
            var dy = y - this.y;
            var target = Math.atan2(dy, dx);
            var newangle = cr.angleRotate(this.angle, target, cr.to_radians(amt));
            if (isNaN(newangle))
                return;
            if (this.angle !== newangle)
            {
                this.angle = newangle;
                this.set_bbox_changed();
            }
        };
        acts.SetTowardPosition = function (x, y)
        {
            var dx = x - this.x;
            var dy = y - this.y;
            var newangle = Math.atan2(dy, dx);
            if (isNaN(newangle))
                return;
            if (this.angle !== newangle)
            {
                this.angle = newangle;
                this.set_bbox_changed();
            }
        };
        exps.Angle = function (ret)
        {
            ret.set_float(cr.to_clamped_degrees(this.angle));
        };
    }
    if (!singleglobal_)
    {
        cnds.CompareInstanceVar = function (iv, cmp, val)
        {
            return cr.do_cmp(this.instance_vars[iv], cmp, val);
        };
        cnds.IsBoolInstanceVarSet = function (iv)
        {
            return this.instance_vars[iv];
        };
        cnds.PickByUID = function (u)
        {
            return this.uid === u;
        };
        cnds.OnCreated = function ()
        {
            return true;
        };
        cnds.OnDestroyed = function ()
        {
            return true;
        };
        acts.SetInstanceVar = function (iv, val)
        {
            var myinstvars = this.instance_vars;
            if (cr.is_number(myinstvars[iv]))
            {
                if (cr.is_number(val))
                    myinstvars[iv] = val;
                else
                    myinstvars[iv] = parseFloat(val);
            }
            else if (cr.is_string(myinstvars[iv]))
            {
                if (cr.is_string(val))
                    myinstvars[iv] = val;
                else
                    myinstvars[iv] = val.toString();
            }
            else
;
        };
        acts.AddInstanceVar = function (iv, val)
        {
            var myinstvars = this.instance_vars;
            if (cr.is_number(myinstvars[iv]))
            {
                if (cr.is_number(val))
                    myinstvars[iv] += val;
                else
                    myinstvars[iv] += parseFloat(val);
            }
            else if (cr.is_string(myinstvars[iv]))
            {
                if (cr.is_string(val))
                    myinstvars[iv] += val;
                else
                    myinstvars[iv] += val.toString();
            }
            else
;
        };
        acts.SubInstanceVar = function (iv, val)
        {
            var myinstvars = this.instance_vars;
            if (cr.is_number(myinstvars[iv]))
            {
                if (cr.is_number(val))
                    myinstvars[iv] -= val;
                else
                    myinstvars[iv] -= parseFloat(val);
            }
            else
;
        };
        acts.SetBoolInstanceVar = function (iv, val)
        {
            this.instance_vars[iv] = val ? 1 : 0;
        };
        acts.ToggleBoolInstanceVar = function (iv)
        {
            this.instance_vars[iv] = 1 - this.instance_vars[iv];
        };
        acts.Destroy = function ()
        {
            this.runtime.DestroyInstance(this);
        };
        exps.Count = function (ret)
        {
            var count = ret.object_class.instances.length;
            var i, len, inst;
            for (i = 0, len = this.runtime.createRow.length; i < len; i++)
            {
                inst = this.runtime.createRow[i];
                if (ret.object_class.is_family)
                {
                    if (inst.type.families.indexOf(ret.object_class) >= 0)
                        count++;
                }
                else
                {
                    if (inst.type === ret.object_class)
                        count++;
                }
            }
            ret.set_int(count);
        };
        exps.PickedCount = function (ret)
        {
            ret.set_int(ret.object_class.getCurrentSol().getObjects().length);
        };
        exps.UID = function (ret)
        {
            ret.set_int(this.uid);
        };
        exps.IID = function (ret)
        {
            ret.set_int(this.get_iid());
        };
    }
    if (appearance_aces)
    {
        cnds.IsVisible = function ()
        {
            return this.visible;
        };
        acts.SetVisible = function (v)
        {
            if (!v !== !this.visible)
            {
                this.visible = v;
                this.runtime.redraw = true;
            }
        };
        cnds.CompareOpacity = function (cmp, x)
        {
            return cr.do_cmp(this.opacity * 100, cmp, x);
        };
        acts.SetOpacity = function (x)
        {
            var new_opacity = x / 100.0;
            if (new_opacity < 0)
                new_opacity = 0;
            else if (new_opacity > 1)
                new_opacity = 1;
            if (new_opacity !== this.opacity)
            {
                this.opacity = new_opacity;
                this.runtime.redraw = true;
            }
        };
        exps.Opacity = function (ret)
        {
            ret.set_float(this.opacity * 100.0);
        };
    }
    if (zorder_aces)
    {
        cnds.IsOnLayer = function (layer_)
        {
            if (!layer_)
                return false;
            return this.layer === layer_;
        };
        cnds.PickTopBottom = function (which_)
        {
            var sol = this.getCurrentSol();
            var instances = sol.getObjects();
            if (!instances.length)
                return false;
            var inst = instances[0];
            var pickme = inst;
            var i, len;
            for (i = 1, len = instances.length; i < len; i++)
            {
                inst = instances[i];
                if (which_ === 0)
                {
                    if (inst.layer.index > pickme.layer.index || (inst.layer.index === pickme.layer.index && inst.get_zindex() > pickme.get_zindex()))
                    {
                        pickme = inst;
                    }
                }
                else
                {
                    if (inst.layer.index < pickme.layer.index || (inst.layer.index === pickme.layer.index && inst.get_zindex() < pickme.get_zindex()))
                    {
                        pickme = inst;
                    }
                }
            }
            sol.pick_one(pickme);
            return true;
        };
        acts.MoveToTop = function ()
        {
            var zindex = this.get_zindex();
            if (zindex === this.layer.instances.length - 1)
                return;
            cr.arrayRemove(this.layer.instances, zindex);
            this.layer.instances.push(this);
            this.runtime.redraw = true;
            this.layer.zindices_stale = true;
        };
        acts.MoveToBottom = function ()
        {
            var zindex = this.get_zindex();
            if (zindex === 0)
                return;
            cr.arrayRemove(this.layer.instances, zindex);
            this.layer.instances.unshift(this);
            this.runtime.redraw = true;
            this.layer.zindices_stale = true;
        };
        acts.MoveToLayer = function (layerMove)
        {
            if (!layerMove || layerMove == this.layer)
                return;
            cr.arrayRemove(this.layer.instances, this.get_zindex());
            this.layer.zindices_stale = true;
            this.layer = layerMove;
            this.zindex = layerMove.instances.length;
            layerMove.instances.push(this);
            this.runtime.redraw = true;
        };
        exps.LayerNumber = function (ret)
        {
            ret.set_int(this.layer.number);
        };
        exps.LayerName = function (ret)
        {
            ret.set_string(this.layer.name);
        };
        exps.ZIndex = function (ret)
        {
            ret.set_int(this.get_zindex());
        };
    }
    if (effects_aces)
    {
        acts.SetEffectEnabled = function (enable_, effectname_)
        {
            if (!this.runtime.glwrap)
                return;
            var i = this.type.getEffectIndexByName(effectname_);
            if (i < 0)
                return;     // effect name not found
            var enable = (enable_ === 1);
            if (this.active_effect_flags[i] === enable)
                return;     // no change
            this.active_effect_flags[i] = enable;
            this.updateActiveEffects();
            this.runtime.redraw = true;
        };
        acts.SetEffectParam = function (effectname_, index_, value_)
        {
            if (!this.runtime.glwrap)
                return;
            var i = this.type.getEffectIndexByName(effectname_);
            if (i < 0)
                return;     // effect name not found
            var et = this.type.effect_types[i];
            var params = this.effect_params[i];
            index_ = Math.floor(index_);
            if (index_ < 0 || index_ >= params.length)
                return;     // effect index out of bounds
            if (this.runtime.glwrap.getProgramParameterType(et.shaderindex, index_) === 1)
                value_ /= 100.0;
            if (params[index_] === value_)
                return;     // no change
            params[index_] = value_;
            if (et.active)
                this.runtime.redraw = true;
        };
    }
};
cr.set_bbox_changed = function ()
{
    this.bbox_changed = true;       // will recreate next time box requested
    this.runtime.redraw = true;     // assume runtime needs to redraw
    var i, len;
    for (i = 0, len = this.bbox_changed_callbacks.length; i < len; i++)
    {
        this.bbox_changed_callbacks[i](this);
    }
};
cr.add_bbox_changed_callback = function (f)
{
    if (f)
        this.bbox_changed_callbacks.push(f);
};
cr.update_bbox = function ()
{
    if (!this.bbox_changed)
        return;                 // bounding box not changed
    this.bbox.set(this.x, this.y, this.x + this.width, this.y + this.height);
    this.bbox.offset(-this.hotspotX * this.width, -this.hotspotY * this.height);
    if (!this.angle)
    {
        this.bquad.set_from_rect(this.bbox);    // make bounding quad from box
    }
    else
    {
        this.bbox.offset(-this.x, -this.y);                         // translate to origin
        this.bquad.set_from_rotated_rect(this.bbox, this.angle);    // rotate around origin
        this.bquad.offset(this.x, this.y);                          // translate back to original position
        this.bquad.bounding_box(this.bbox);
    }
    var temp = 0;
    if (this.bbox.left > this.bbox.right)
    {
        temp = this.bbox.left;
        this.bbox.left = this.bbox.right;
        this.bbox.right = temp;
    }
    if (this.bbox.top > this.bbox.bottom)
    {
        temp = this.bbox.top;
        this.bbox.top = this.bbox.bottom;
        this.bbox.bottom = temp;
    }
    this.bbox_changed = false;  // bounding box up to date
};
cr.inst_contains_pt = function (x, y)
{
    if (!this.bbox.contains_pt(x, y))
        return false;
    if (!this.bquad.contains_pt(x, y))
        return false;
    if (this.collision_poly && !this.collision_poly.is_empty())
    {
        this.collision_poly.cache_poly(this.width, this.height, this.angle);
        return this.collision_poly.contains_pt(x - this.x, y - this.y);
    }
    else
        return true;
};
cr.inst_get_iid = function ()
{
    this.type.updateIIDs();
    return this.iid;
};
cr.inst_get_zindex = function ()
{
    this.layer.updateZIndices();
    return this.zindex;
};
cr.inst_updateActiveEffects = function ()
{
    this.active_effect_types.length = 0;
    var i, len, et, inst;
    for (i = 0, len = this.active_effect_flags.length; i < len; i++)
    {
        if (this.active_effect_flags[i])
            this.active_effect_types.push(this.type.effect_types[i]);
    }
    this.uses_shaders = !!this.active_effect_types.length;
};
cr.inst_toString = function ()
{
    return "inst:" + this.type.name + "#" + this.uid;
};
cr.type_getFirstPicked = function ()
{
    var instances = this.getCurrentSol().getObjects();
    if (instances.length)
        return instances[0];
    else
        return null;
};
cr.type_getPairedInstance = function (inst)
{
    var instances = this.getCurrentSol().getObjects();
    if (instances.length)
        return instances[inst.get_iid() % instances.length];
    else
        return null;
};
cr.type_updateIIDs = function ()
{
    if (!this.stale_iids || this.is_family)
        return;     // up to date or is family - don't want family to overwrite IIDs
    var i, len;
    for (i = 0, len = this.instances.length; i < len; i++)
        this.instances[i].iid = i;
    this.stale_iids = false;
};
cr.type_getCurrentSol = function ()
{
    return this.solstack[this.cur_sol];
};
cr.type_pushCleanSol = function ()
{
    this.cur_sol++;
    if (this.cur_sol === this.solstack.length)
        this.solstack.push(new cr.selection(this));
    else
        this.solstack[this.cur_sol].select_all = true;  // else clear next SOL
};
cr.type_pushCopySol = function ()
{
    this.cur_sol++;
    if (this.cur_sol === this.solstack.length)
        this.solstack.push(new cr.selection(this));
    var clonesol = this.solstack[this.cur_sol];
    var prevsol = this.solstack[this.cur_sol - 1];
    if (prevsol.select_all)
        clonesol.select_all = true;
    else
    {
        clonesol.select_all = false;
        cr.shallowAssignArray(clonesol.instances, prevsol.instances);
    }
};
cr.type_popSol = function ()
{
;
    this.cur_sol--;
};
cr.type_getBehaviorByName = function (behname)
{
    var i, len, j, lenj, f, index = 0;
    if (!this.is_family)
    {
        for (i = 0, len = this.families.length; i < len; i++)
        {
            f = this.families[i];
            for (j = 0, lenj = f.behaviors.length; j < lenj; j++)
            {
                if (behname === f.behaviors[j].name)
                {
                    this.extra.lastBehIndex = index;
                    return f.behaviors[j];
                }
                index++;
            }
        }
    }
    for (i = 0, len = this.behaviors.length; i < len; i++) {
        if (behname === this.behaviors[i].name)
        {
            this.extra.lastBehIndex = index;
            return this.behaviors[i];
        }
        index++;
    }
    return null;
};
cr.type_getBehaviorIndexByName = function (behname)
{
    var b = this.getBehaviorByName(behname);
    if (b)
        return this.extra.lastBehIndex;
    else
        return -1;
};
cr.type_getEffectIndexByName = function (name_)
{
    var i, len;
    for (i = 0, len = this.effect_types.length; i < len; i++)
    {
        if (this.effect_types[i].name === name_)
            return i;
    }
    return -1;
};
cr.type_applySolToContainer = function ()
{
    if (!this.is_contained || this.is_family)
        return;
    var i, len, j, lenj, t, sol, sol2;
    this.updateIIDs();
    sol = this.getCurrentSol();
    var select_all = sol.select_all;
    var es = this.runtime.getCurrentEventStack();
    var orblock = es && es.current_event && es.current_event.orblock;
    for (i = 0, len = this.container.length; i < len; i++)
    {
        t = this.container[i];
        if (t === this)
            continue;
        t.updateIIDs();
        sol2 = t.getCurrentSol();
        sol2.select_all = select_all;
        if (!select_all)
        {
            sol2.instances.length = sol.instances.length;
            sol2.else_instances.length = sol.instances.length;
            for (j = 0, lenj = sol.instances.length; j < lenj; j++)
                sol2.instances[j] = t.instances[sol.instances[j].iid];
            if (orblock)
            {
                for (j = 0, lenj = sol.else_instances.length; j < lenj; j++)
                    sol2.else_instances[j] = t.instances[sol.else_instances[j].iid];
            }
        }
    }
};
cr.type_toString = function ()
{
    return this.name;
};
cr.do_cmp = function (x, cmp, y)
{
    if (typeof x === "undefined" || typeof y === "undefined")
        return false;
    switch (cmp)
    {
        case 0:     // equal
            return x === y;
        case 1:     // not equal
            return x !== y;
        case 2:     // less
            return x < y;
        case 3:     // less/equal
            return x <= y;
        case 4:     // greater
            return x > y;
        case 5:     // greater/equal
            return x >= y;
        default:
;
            return false;
    }
};
cr.shaders = {};
;
;
cr.plugins_.Mouse = function(runtime)
{
    this.runtime = runtime;
};
(function ()
{
    var pluginProto = cr.plugins_.Mouse.prototype;
    pluginProto.Type = function(plugin)
    {
        this.plugin = plugin;
        this.runtime = plugin.runtime;
    };
    var typeProto = pluginProto.Type.prototype;
    typeProto.onCreate = function()
    {
    };
    pluginProto.Instance = function(type)
    {
        this.type = type;
        this.runtime = type.runtime;
        this.buttonMap = new Array(4);      // mouse down states
        this.mouseXcanvas = 0;              // mouse position relative to canvas
        this.mouseYcanvas = 0;
        this.triggerButton = 0;
        this.triggerType = 0;
        this.triggerDir = 0;
        this.handled = false;
    };
    var instanceProto = pluginProto.Instance.prototype;
    instanceProto.onCreate = function()
    {
        var self = this;
        if (!this.runtime.isDomFree)
        {
            jQuery(document).mousemove(
                function(info) {
                    self.onMouseMove(info);
                }
            );
            jQuery(document).mousedown(
                function(info) {
                    self.onMouseDown(info);
                }
            );
            jQuery(document).mouseup(
                function(info) {
                    self.onMouseUp(info);
                }
            );
            jQuery(document).dblclick(
                function(info) {
                    self.onDoubleClick(info);
                }
            );
            var wheelevent = function(info) {
                                self.onWheel(info);
                            };
            document.addEventListener("mousewheel", wheelevent, false);
            document.addEventListener("DOMMouseScroll", wheelevent, false);
        }
    };
    var dummyoffset = {left: 0, top: 0};
    instanceProto.onMouseMove = function(info)
    {
        var offset = this.runtime.isDomFree ? dummyoffset : jQuery(this.runtime.canvas).offset();
        this.mouseXcanvas = info.pageX - offset.left;
        this.mouseYcanvas = info.pageY - offset.top;
    };
    instanceProto.mouseInGame = function ()
    {
        if (this.runtime.fullscreen_mode > 0)
            return true;
        return this.mouseXcanvas >= 0 && this.mouseYcanvas >= 0
            && this.mouseXcanvas < this.runtime.width && this.mouseYcanvas < this.runtime.height;
    };
    instanceProto.onMouseDown = function(info)
    {
        if (!this.mouseInGame())
            return;
        if (this.runtime.had_a_click)
            info.preventDefault();
        this.buttonMap[info.which] = true;
        this.runtime.trigger(cr.plugins_.Mouse.prototype.cnds.OnAnyClick, this);
        this.triggerButton = info.which - 1;    // 1-based
        this.triggerType = 0;                   // single click
        this.runtime.trigger(cr.plugins_.Mouse.prototype.cnds.OnClick, this);
        this.runtime.trigger(cr.plugins_.Mouse.prototype.cnds.OnObjectClicked, this);
    };
    instanceProto.onMouseUp = function(info)
    {
        if (!this.buttonMap[info.which])
            return;
        if (this.runtime.had_a_click)
            info.preventDefault();
        this.runtime.had_a_click = true;
        this.buttonMap[info.which] = false;
        this.triggerButton = info.which - 1;    // 1-based
        this.runtime.trigger(cr.plugins_.Mouse.prototype.cnds.OnRelease, this);
    };
    instanceProto.onDoubleClick = function(info)
    {
        if (!this.mouseInGame())
            return;
        info.preventDefault();
        this.triggerButton = info.which - 1;    // 1-based
        this.triggerType = 1;                   // double click
        this.runtime.trigger(cr.plugins_.Mouse.prototype.cnds.OnClick, this);
        this.runtime.trigger(cr.plugins_.Mouse.prototype.cnds.OnObjectClicked, this);
    };
    instanceProto.onWheel = function (info)
    {
        var delta = info.wheelDelta ? info.wheelDelta : info.detail ? -info.detail : 0;
        if (this.runtime.isAwesomium)
            delta *= -1;
        this.triggerDir = (delta < 0 ? 0 : 1);
        this.handled = false;
        this.runtime.trigger(cr.plugins_.Mouse.prototype.cnds.OnWheel, this);
        if (this.handled)
            info.preventDefault();
    };
    function Cnds() {};
    Cnds.prototype.OnClick = function (button, type)
    {
        return button === this.triggerButton && type === this.triggerType;
    };
    Cnds.prototype.OnAnyClick = function ()
    {
        return true;
    };
    Cnds.prototype.IsButtonDown = function (button)
    {
        return this.buttonMap[button + 1];  // jQuery uses 1-based buttons for some reason
    };
    Cnds.prototype.OnRelease = function (button)
    {
        return button === this.triggerButton;
    };
    Cnds.prototype.IsOverObject = function (obj)
    {
        var cnd = this.runtime.getCurrentCondition();
        if (cr.is_undefined(cnd.extra.mouseOverInverted))
        {
            cnd.extra.mouseOverInverted = cnd.inverted;
            cnd.inverted = false;
        }
        var mx = this.mouseXcanvas;
        var my = this.mouseYcanvas;
        return this.runtime.testAndSelectCanvasPointOverlap(obj, mx, my, cnd.extra.mouseOverInverted);
    };
    Cnds.prototype.OnObjectClicked = function (button, type, obj)
    {
        if (button !== this.triggerButton || type !== this.triggerType)
            return false;   // wrong click type
        return this.runtime.testAndSelectCanvasPointOverlap(obj, this.mouseXcanvas, this.mouseYcanvas, false);
    };
    Cnds.prototype.OnWheel = function (dir)
    {
        this.handled = true;
        return dir === this.triggerDir;
    };
    pluginProto.cnds = new Cnds();
    function Acts() {};
    Acts.prototype.SetCursor = function (c)
    {
        var cursor_style = ["auto", "pointer", "text", "crosshair", "move", "help", "wait", "none"][c];
        if (this.runtime.isAwesomium)
            window["c2awesomium"]["setCursor"](c);
        if (this.runtime.canvas && this.runtime.canvas.style)
            this.runtime.canvas.style.cursor = cursor_style;
    };
    Acts.prototype.SetCursorSprite = function (obj)
    {
        if (this.runtime.isDomFree || this.runtime.isMobile || !obj)
            return;
        var inst = obj.getFirstPicked();
        if (!inst || !inst.curFrame)
            return;
        var frame = inst.curFrame;
        var datauri = frame.getDataUri();
        var cursor_style = "url(" + datauri + ") " + Math.round(frame.hotspotX * frame.width) + " " + Math.round(frame.hotspotY * frame.height) + ", auto";
        jQuery(this.runtime.canvas).css("cursor", cursor_style);
    };
    pluginProto.acts = new Acts();
    function Exps() {};
    Exps.prototype.X = function (ret, layerparam)
    {
        var layer, oldScale, oldZoomRate, oldParallaxX, oldAngle;
        if (cr.is_undefined(layerparam))
        {
            layer = this.runtime.getLayerByNumber(0);
            oldScale = layer.scale;
            oldZoomRate = layer.zoomRate;
            oldParallaxX = layer.parallaxX;
            oldAngle = layer.angle;
            layer.scale = this.runtime.running_layout.scale;
            layer.zoomRate = 1.0;
            layer.parallaxX = 1.0;
            layer.angle = this.runtime.running_layout.angle;
            ret.set_float(layer.canvasToLayer(this.mouseXcanvas, this.mouseYcanvas, true));
            layer.scale = oldScale;
            layer.zoomRate = oldZoomRate;
            layer.parallaxX = oldParallaxX;
            layer.angle = oldAngle;
        }
        else
        {
            if (cr.is_number(layerparam))
                layer = this.runtime.getLayerByNumber(layerparam);
            else
                layer = this.runtime.getLayerByName(layerparam);
            if (layer)
                ret.set_float(layer.canvasToLayer(this.mouseXcanvas, this.mouseYcanvas, true));
            else
                ret.set_float(0);
        }
    };
    Exps.prototype.Y = function (ret, layerparam)
    {
        var layer, oldScale, oldZoomRate, oldParallaxY, oldAngle;
        if (cr.is_undefined(layerparam))
        {
            layer = this.runtime.getLayerByNumber(0);
            oldScale = layer.scale;
            oldZoomRate = layer.zoomRate;
            oldParallaxY = layer.parallaxY;
            oldAngle = layer.angle;
            layer.scale = this.runtime.running_layout.scale;
            layer.zoomRate = 1.0;
            layer.parallaxY = 1.0;
            layer.angle = this.runtime.running_layout.angle;
            ret.set_float(layer.canvasToLayer(this.mouseXcanvas, this.mouseYcanvas, false));
            layer.scale = oldScale;
            layer.zoomRate = oldZoomRate;
            layer.parallaxY = oldParallaxY;
            layer.angle = oldAngle;
        }
        else
        {
            if (cr.is_number(layerparam))
                layer = this.runtime.getLayerByNumber(layerparam);
            else
                layer = this.runtime.getLayerByName(layerparam);
            if (layer)
                ret.set_float(layer.canvasToLayer(this.mouseXcanvas, this.mouseYcanvas, false));
            else
                ret.set_float(0);
        }
    };
    Exps.prototype.AbsoluteX = function (ret)
    {
        ret.set_float(this.mouseXcanvas);
    };
    Exps.prototype.AbsoluteY = function (ret)
    {
        ret.set_float(this.mouseYcanvas);
    };
    pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.Sprite = function(runtime)
{
    this.runtime = runtime;
};
(function ()
{
    var pluginProto = cr.plugins_.Sprite.prototype;
    pluginProto.Type = function(plugin)
    {
        this.plugin = plugin;
        this.runtime = plugin.runtime;
    };
    var typeProto = pluginProto.Type.prototype;
    function frame_getDataUri()
    {
        if (this.datauri.length === 0)
        {
            var tmpcanvas = document.createElement("canvas");
            tmpcanvas.width = this.width;
            tmpcanvas.height = this.height;
            var tmpctx = tmpcanvas.getContext("2d");
            if (this.spritesheeted)
            {
                tmpctx.drawImage(this.texture_img, this.offx, this.offy, this.width, this.height,
                                         0, 0, this.width, this.height);
            }
            else
            {
                tmpctx.drawImage(this.texture_img, 0, 0, this.width, this.height);
            }
            this.datauri = tmpcanvas.toDataURL("image/png");
        }
        return this.datauri;
    };
    typeProto.onCreate = function()
    {
        if (this.is_family)
            return;
        var i, leni, j, lenj;
        var anim, frame, animobj, frameobj, wt, uv;
        for (i = 0, leni = this.animations.length; i < leni; i++)
        {
            anim = this.animations[i];
            animobj = {};
            animobj.name = anim[0];
            animobj.speed = anim[1];
            animobj.loop = anim[2];
            animobj.repeatcount = anim[3];
            animobj.repeatto = anim[4];
            animobj.pingpong = anim[5];
            animobj.frames = [];
            for (j = 0, lenj = anim[6].length; j < lenj; j++)
            {
                frame = anim[6][j];
                frameobj = {};
                frameobj.texture_file = frame[0];
                frameobj.texture_filesize = frame[1];
                frameobj.offx = frame[2];
                frameobj.offy = frame[3];
                frameobj.width = frame[4];
                frameobj.height = frame[5];
                frameobj.duration = frame[6];
                frameobj.hotspotX = frame[7];
                frameobj.hotspotY = frame[8];
                frameobj.image_points = frame[9];
                frameobj.poly_pts = frame[10];
                frameobj.spritesheeted = (frameobj.width !== 0);
                frameobj.datauri = "";      // generated on demand and cached
                frameobj.getDataUri = frame_getDataUri;
                uv = {};
                uv.left = 0;
                uv.top = 0;
                uv.right = 1;
                uv.bottom = 1;
                frameobj.sheetTex = uv;
                frameobj.webGL_texture = null;
                wt = this.runtime.findWaitingTexture(frame[0]);
                if (wt)
                {
                    frameobj.texture_img = wt;
                }
                else
                {
                    frameobj.texture_img = new Image();
                    frameobj.texture_img.src = frame[0];
                    frameobj.texture_img.cr_filesize = frame[1];
                    frameobj.texture_img.c2webGL_texture = null;
                    this.runtime.wait_for_textures.push(frameobj.texture_img);
                }
                cr.seal(frameobj);
                animobj.frames.push(frameobj);
            }
            cr.seal(animobj);
            this.animations[i] = animobj;       // swap array data for object
        }
    };
    typeProto.onLostWebGLContext = function ()
    {
        if (this.is_family)
            return;
        var i, leni, j, lenj;
        var anim, frame, inst;
        for (i = 0, leni = this.animations.length; i < leni; i++)
        {
            anim = this.animations[i];
            for (j = 0, lenj = anim.frames.length; j < lenj; j++)
            {
                frame = anim.frames[j];
                frame.texture_img.c2webGL_texture = null;
                frame.webGL_texture = null;
            }
        }
    };
    typeProto.onRestoreWebGLContext = function ()
    {
        if (this.is_family || !this.instances.length)
            return;
        var i, leni, j, lenj;
        var anim, frame, inst;
        for (i = 0, leni = this.animations.length; i < leni; i++)
        {
            anim = this.animations[i];
            for (j = 0, lenj = anim.frames.length; j < lenj; j++)
            {
                frame = anim.frames[j];
                if (!frame.texture_img.c2webGL_texture)
                    frame.texture_img.c2webGL_texture = this.runtime.glwrap.loadTexture(frame.texture_img, false, this.runtime.linearSampling);
                frame.webGL_texture = frame.texture_img.c2webGL_texture;
            }
        }
        for (i = 0, leni = this.instances.length; i < leni; i++)
        {
            inst = this.instances[i];
            inst.curWebGLTexture = inst.curFrame.webGL_texture;
        }
    };
    var all_my_textures = [];
    typeProto.unloadTextures = function ()
    {
        if (this.is_family || this.instances.length)
            return;
        var isWebGL = !!this.runtime.glwrap;
        var i, leni, j, lenj, k;
        var anim, frame, inst, o;
        all_my_textures.length = 0;
        for (i = 0, leni = this.animations.length; i < leni; i++)
        {
            anim = this.animations[i];
            for (j = 0, lenj = anim.frames.length; j < lenj; j++)
            {
                frame = anim.frames[j];
                o = (isWebGL ? frame.texture_img.c2webGL_texture : frame.texture_img);
                k = all_my_textures.indexOf(o);
                if (k === -1)
                    all_my_textures.push(o);
                frame.texture_img.c2webGL_texture = null;
                frame.webGL_texture = null;
            }
        }
        for (i = 0, leni = all_my_textures.length; i < leni; i++)
        {
            o = all_my_textures[i];
            if (isWebGL)
                this.runtime.glwrap.deleteTexture(o);
            else if (o["hintUnload"])
                o["hintUnload"]();
        }
        all_my_textures.length = 0;
    };
    pluginProto.Instance = function(type)
    {
        this.type = type;
        this.runtime = type.runtime;
        this.collision_poly = new cr.CollisionPoly(this.type.animations[0].frames[0].poly_pts);
    };
    var instanceProto = pluginProto.Instance.prototype;
    instanceProto.onCreate = function()
    {
        this.visible = (this.properties[0] === 0);  // 0=visible, 1=invisible
        this.isTicking = false;
        this.inAnimTrigger = false;
        this.collisionsEnabled = (this.properties[2] !== 0);
        if (!(this.type.animations.length === 1 && this.type.animations[0].frames.length === 1) && this.type.animations[0].speed !== 0)
        {
            this.runtime.tickMe(this);
            this.isTicking = true;
        }
        this.cur_animation = this.type.animations[0];
        this.cur_frame = this.properties[1];
        if (this.cur_frame < 0)
            this.cur_frame = 0;
        if (this.cur_frame >= this.cur_animation.frames.length)
            this.cur_frame = this.cur_animation.frames.length - 1;
        if (this.cur_frame !== 0)
        {
            var curanimframe = this.cur_animation.frames[this.cur_frame];
            this.collision_poly.set_pts(curanimframe.poly_pts);
            this.hotspotX = curanimframe.hotspotX;
            this.hotspotY = curanimframe.hotspotY;
        }
        this.cur_anim_speed = this.type.animations[0].speed;
        this.frameStart = this.getNowTime();
        this.animPlaying = true;
        this.animRepeats = 0;
        this.animForwards = true;
        this.animTriggerName = "";
        this.changeAnimName = "";
        this.changeAnimFrom = 0;
        this.changeAnimFrame = -1;
        var i, leni, j, lenj;
        var anim, frame, uv, maintex;
        for (i = 0, leni = this.type.animations.length; i < leni; i++)
        {
            anim = this.type.animations[i];
            for (j = 0, lenj = anim.frames.length; j < lenj; j++)
            {
                frame = anim.frames[j];
                if (frame.texture_img["hintLoad"])
                    frame.texture_img["hintLoad"]();
                if (frame.width === 0)
                {
                    frame.width = frame.texture_img.width;
                    frame.height = frame.texture_img.height;
                }
                if (frame.spritesheeted)
                {
                    maintex = frame.texture_img;
                    uv = frame.sheetTex;
                    uv.left = frame.offx / maintex.width;
                    uv.top = frame.offy / maintex.height;
                    uv.right = (frame.offx + frame.width) / maintex.width;
                    uv.bottom = (frame.offy + frame.height) / maintex.height;
                    if (frame.offx === 0 && frame.offy === 0 && frame.width === maintex.width && frame.height === maintex.height)
                    {
                        frame.spritesheeted = false;
                    }
                }
                if (this.runtime.glwrap)
                {
                    if (!frame.texture_img.c2webGL_texture)
                    {
                        frame.texture_img.c2webGL_texture = this.runtime.glwrap.loadTexture(frame.texture_img, false, this.runtime.linearSampling);
                    }
                    frame.webGL_texture = frame.texture_img.c2webGL_texture;
                }
            }
        }
        this.curFrame = this.cur_animation.frames[this.cur_frame];
        this.curWebGLTexture = this.curFrame.webGL_texture;
    };
    instanceProto.animationFinish = function (reverse)
    {
        this.cur_frame = reverse ? 0 : this.cur_animation.frames.length - 1;
        this.animPlaying = false;
        this.animTriggerName = this.cur_animation.name;
        this.inAnimTrigger = true;
        this.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnAnyAnimFinished, this);
        this.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnAnimFinished, this);
        this.inAnimTrigger = false;
        this.animRepeats = 0;
    };
    instanceProto.getNowTime = function()
    {
        return (Date.now() - this.runtime.start_time) / 1000.0;
    };
    instanceProto.tick = function()
    {
        if (this.changeAnimName.length)
            this.doChangeAnim();
        if (this.changeAnimFrame >= 0)
            this.doChangeAnimFrame();
        var now = this.getNowTime();
        var cur_animation = this.cur_animation;
        var prev_frame = cur_animation.frames[this.cur_frame];
        var next_frame;
        var cur_frame_time = prev_frame.duration / this.cur_anim_speed;
        var cur_timescale = this.runtime.timescale;
        if (this.my_timescale !== -1.0)
            cur_timescale = this.my_timescale;
        cur_frame_time /= (cur_timescale === 0 ? 0.000000001 : cur_timescale);
        if (this.animPlaying && now >= this.frameStart + cur_frame_time)
        {
            if (this.animForwards)
            {
                this.cur_frame++;
            }
            else
            {
                this.cur_frame--;
            }
            this.frameStart += cur_frame_time;
            if (this.cur_frame >= cur_animation.frames.length)
            {
                if (cur_animation.pingpong)
                {
                    this.animForwards = false;
                    this.cur_frame = cur_animation.frames.length - 2;
                }
                else if (cur_animation.loop)
                {
                    this.cur_frame = cur_animation.repeatto;
                }
                else
                {
                    this.animRepeats++;
                    if (this.animRepeats >= cur_animation.repeatcount)
                    {
                        this.animationFinish(false);
                    }
                    else
                    {
                        this.cur_frame = cur_animation.repeatto;
                    }
                }
            }
            if (this.cur_frame < 0)
            {
                if (cur_animation.pingpong)
                {
                    this.cur_frame = 1;
                    this.animForwards = true;
                    if (!cur_animation.loop)
                    {
                        this.animRepeats++;
                        if (this.animRepeats >= cur_animation.repeatcount)
                        {
                            this.animationFinish(true);
                        }
                    }
                }
                else
                {
                    if (cur_animation.loop)
                    {
                        this.cur_frame = cur_animation.repeatto;
                    }
                    else
                    {
                        this.animRepeats++;
                        if (this.animRepeats >= cur_animation.repeatcount)
                        {
                            this.animationFinish(true);
                        }
                        else
                        {
                            this.cur_frame = cur_animation.repeatto;
                        }
                    }
                }
            }
            if (this.cur_frame < 0)
                this.cur_frame = 0;
            else if (this.cur_frame >= cur_animation.frames.length)
                this.cur_frame = cur_animation.frames.length - 1;
            if (now > this.frameStart + ((cur_animation.frames[this.cur_frame].duration / this.cur_anim_speed) / (cur_timescale === 0 ? 0.000000001 : cur_timescale)))
            {
                this.frameStart = now;
            }
            next_frame = cur_animation.frames[this.cur_frame];
            this.OnFrameChanged(prev_frame, next_frame);
            this.runtime.redraw = true;
        }
    };
    instanceProto.doChangeAnim = function ()
    {
        var prev_frame = this.cur_animation.frames[this.cur_frame];
        var i, len, a, anim = null;
        for (i = 0, len = this.type.animations.length; i < len; i++)
        {
            a = this.type.animations[i];
            if (a.name.toLowerCase() === this.changeAnimName.toLowerCase())
            {
                anim = a;
                break;
            }
        }
        this.changeAnimName = "";
        if (!anim)
            return;
        if (anim.name.toLowerCase() === this.cur_animation.name.toLowerCase() && this.animPlaying)
            return;
        this.cur_animation = anim;
        this.cur_anim_speed = anim.speed;
        if (this.cur_frame < 0)
            this.cur_frame = 0;
        if (this.cur_frame >= this.cur_animation.frames.length)
            this.cur_frame = this.cur_animation.frames.length - 1;
        if (this.changeAnimFrom === 1)
            this.cur_frame = 0;
        this.animPlaying = true;
        this.frameStart = this.getNowTime();
        this.animForwards = true;
        this.OnFrameChanged(prev_frame, this.cur_animation.frames[this.cur_frame]);
        this.runtime.redraw = true;
    };
    instanceProto.doChangeAnimFrame = function ()
    {
        var prev_frame = this.cur_animation.frames[this.cur_frame];
        var prev_frame_number = this.cur_frame;
        this.cur_frame = cr.floor(this.changeAnimFrame);
        if (this.cur_frame < 0)
            this.cur_frame = 0;
        if (this.cur_frame >= this.cur_animation.frames.length)
            this.cur_frame = this.cur_animation.frames.length - 1;
        if (prev_frame_number !== this.cur_frame)
        {
            this.OnFrameChanged(prev_frame, this.cur_animation.frames[this.cur_frame]);
            this.frameStart = this.getNowTime();
            this.runtime.redraw = true;
        }
        this.changeAnimFrame = -1;
    };
    instanceProto.OnFrameChanged = function (prev_frame, next_frame)
    {
        var oldw = prev_frame.width;
        var oldh = prev_frame.height;
        var neww = next_frame.width;
        var newh = next_frame.height;
        if (oldw != neww)
            this.width *= (neww / oldw);
        if (oldh != newh)
            this.height *= (newh / oldh);
        this.hotspotX = next_frame.hotspotX;
        this.hotspotY = next_frame.hotspotY;
        this.collision_poly.set_pts(next_frame.poly_pts);
        this.set_bbox_changed();
        this.curFrame = next_frame;
        this.curWebGLTexture = next_frame.webGL_texture;
        var i, len, b;
        for (i = 0, len = this.behavior_insts.length; i < len; i++)
        {
            b = this.behavior_insts[i];
            if (b.onSpriteFrameChanged)
                b.onSpriteFrameChanged(prev_frame, next_frame);
        }
        this.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnFrameChanged, this);
    };
    instanceProto.draw = function(ctx)
    {
        ctx.globalAlpha = this.opacity;
        var cur_frame = this.curFrame;
        var spritesheeted = cur_frame.spritesheeted;
        var cur_image = cur_frame.texture_img;
        var myx = this.x;
        var myy = this.y;
        var w = this.width;
        var h = this.height;
        if (this.angle === 0 && w >= 0 && h >= 0)
        {
            myx -= this.hotspotX * w;
            myy -= this.hotspotY * h;
            if (this.runtime.pixel_rounding)
            {
                myx = (myx + 0.5) | 0;
                myy = (myy + 0.5) | 0;
            }
            if (spritesheeted)
            {
                ctx.drawImage(cur_image, cur_frame.offx, cur_frame.offy, cur_frame.width, cur_frame.height,
                                         myx, myy, w, h);
            }
            else
            {
                ctx.drawImage(cur_image, myx, myy, w, h);
            }
        }
        else
        {
            if (this.runtime.pixel_rounding)
            {
                myx = (myx + 0.5) | 0;
                myy = (myy + 0.5) | 0;
            }
            ctx.save();
            var widthfactor = w > 0 ? 1 : -1;
            var heightfactor = h > 0 ? 1 : -1;
            ctx.translate(myx, myy);
            if (widthfactor !== 1 || heightfactor !== 1)
                ctx.scale(widthfactor, heightfactor);
            ctx.rotate(this.angle * widthfactor * heightfactor);
            var drawx = 0 - (this.hotspotX * cr.abs(w))
            var drawy = 0 - (this.hotspotY * cr.abs(h));
            if (spritesheeted)
            {
                ctx.drawImage(cur_image, cur_frame.offx, cur_frame.offy, cur_frame.width, cur_frame.height,
                                         drawx, drawy, cr.abs(w), cr.abs(h));
            }
            else
            {
                ctx.drawImage(cur_image, drawx, drawy, cr.abs(w), cr.abs(h));
            }
            ctx.restore();
        }
        /*
        ctx.strokeStyle = "#f00";
        ctx.lineWidth = 3;
        ctx.beginPath();
        this.collision_poly.cache_poly(this.width, this.height, this.angle);
        var i, len, ax, ay, bx, by;
        for (i = 0, len = this.collision_poly.pts_count; i < len; i++)
        {
            ax = this.collision_poly.pts_cache[i*2] + this.x;
            ay = this.collision_poly.pts_cache[i*2+1] + this.y;
            bx = this.collision_poly.pts_cache[((i+1)%len)*2] + this.x;
            by = this.collision_poly.pts_cache[((i+1)%len)*2+1] + this.y;
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
        }
        ctx.stroke();
        ctx.closePath();
        */
        /*
        if (this.behavior_insts.length >= 1 && this.behavior_insts[0].draw)
        {
            this.behavior_insts[0].draw(ctx);
        }
        */
    };
    instanceProto.drawGL = function(glw)
    {
        glw.setTexture(this.curWebGLTexture);
        glw.setOpacity(this.opacity);
        var cur_frame = this.curFrame;
        var q = this.bquad;
        if (this.runtime.pixel_rounding)
        {
            var ox = ((this.x + 0.5) | 0) - this.x;
            var oy = ((this.y + 0.5) | 0) - this.y;
            if (cur_frame.spritesheeted)
                glw.quadTex(q.tlx + ox, q.tly + oy, q.trx + ox, q.try_ + oy, q.brx + ox, q.bry + oy, q.blx + ox, q.bly + oy, cur_frame.sheetTex);
            else
                glw.quad(q.tlx + ox, q.tly + oy, q.trx + ox, q.try_ + oy, q.brx + ox, q.bry + oy, q.blx + ox, q.bly + oy);
        }
        else
        {
            if (cur_frame.spritesheeted)
                glw.quadTex(q.tlx, q.tly, q.trx, q.try_, q.brx, q.bry, q.blx, q.bly, cur_frame.sheetTex);
            else
                glw.quad(q.tlx, q.tly, q.trx, q.try_, q.brx, q.bry, q.blx, q.bly);
        }
    };
    instanceProto.getImagePointIndexByName = function(name_)
    {
        var cur_frame = this.curFrame;
        var i, len;
        for (i = 0, len = cur_frame.image_points.length; i < len; i++)
        {
            if (name_.toLowerCase() === cur_frame.image_points[i][0].toLowerCase())
                return i;
        }
        return -1;
    };
    instanceProto.getImagePoint = function(imgpt, getX)
    {
        var cur_frame = this.curFrame;
        var image_points = cur_frame.image_points;
        var index;
        if (cr.is_string(imgpt))
            index = this.getImagePointIndexByName(imgpt);
        else
            index = imgpt - 1;  // 0 is origin
        index = cr.floor(index);
        if (index < 0 || index >= image_points.length)
            return getX ? this.x : this.y;  // return origin
        var x = (image_points[index][1] - cur_frame.hotspotX) * this.width;
        var y = image_points[index][2];
        y = (y - cur_frame.hotspotY) * this.height;
        var cosa = Math.cos(this.angle);
        var sina = Math.sin(this.angle);
        var x_temp = (x * cosa) - (y * sina);
        y = (y * cosa) + (x * sina);
        x = x_temp;
        x += this.x;
        y += this.y;
        return getX ? x : y;
    };
    function Cnds() {};
    function collmemory_add(collmemory, a, b)
    {
        collmemory.push([a, b]);
    };
    function collmemory_remove(collmemory, a, b)
    {
        var i, j = 0, len, entry;
        for (i = 0, len = collmemory.length; i < len; i++)
        {
            entry = collmemory[i];
            if (!((entry[0] === a && entry[1] === b) || (entry[0] === b && entry[1] === a)))
            {
                collmemory[j] = collmemory[i];
                j++;
            }
        }
        collmemory.length = j;
    };
    function collmemory_removeInstance(collmemory, inst)
    {
        var i, j = 0, len, entry;
        for (i = 0, len = collmemory.length; i < len; i++)
        {
            entry = collmemory[i];
            if (entry[0] !== inst && entry[1] !== inst)
            {
                collmemory[j] = collmemory[i];
                j++;
            }
        }
        collmemory.length = j;
    };
    function collmemory_has(collmemory, a, b)
    {
        var i, len, entry;
        for (i = 0, len = collmemory.length; i < len; i++)
        {
            entry = collmemory[i];
            if ((entry[0] === a && entry[1] === b) || (entry[0] === b && entry[1] === a))
                return true;
        }
        return false;
    };
    Cnds.prototype.OnCollision = function (rtype)
    {
        if (!rtype)
            return false;
        var runtime = this.runtime;
        var cnd = runtime.getCurrentCondition();
        var ltype = cnd.type;
        if (!cnd.extra.collmemory)
        {
            cnd.extra.collmemory = [];
            runtime.addDestroyCallback((function (collmemory) {
                return function(inst) {
                    collmemory_removeInstance(collmemory, inst);
                };
            })(cnd.extra.collmemory));
        }
        var lsol = ltype.getCurrentSol();
        var rsol = rtype.getCurrentSol();
        var linstances = lsol.getObjects();
        var rinstances = rsol.getObjects();
        var l, lenl, linst, r, lenr, rinst;
        var curlsol, currsol;
        var current_event = runtime.getCurrentEventStack().current_event;
        var orblock = current_event.orblock;
        for (l = 0, lenl = linstances.length; l < lenl; l++)
        {
            linst = linstances[l];
            for (r = 0, lenr = rinstances.length; r < lenr; r++)
            {
                rinst = rinstances[r];
                if (runtime.testOverlap(linst, rinst) || runtime.checkRegisteredCollision(linst, rinst))
                {
                    if (!collmemory_has(cnd.extra.collmemory, linst, rinst))
                    {
                        collmemory_add(cnd.extra.collmemory, linst, rinst);
                        runtime.pushCopySol(current_event.solModifiers);
                        curlsol = ltype.getCurrentSol();
                        currsol = rtype.getCurrentSol();
                        curlsol.select_all = false;
                        currsol.select_all = false;
                        if (ltype === rtype)
                        {
                            curlsol.instances.length = 2;   // just use lsol, is same reference as rsol
                            curlsol.instances[0] = linst;
                            curlsol.instances[1] = rinst;
                        }
                        else
                        {
                            curlsol.instances.length = 1;
                            currsol.instances.length = 1;
                            curlsol.instances[0] = linst;
                            currsol.instances[0] = rinst;
                        }
                        current_event.retrigger();
                        runtime.popSol(current_event.solModifiers);
                    }
                }
                else
                {
                    collmemory_remove(cnd.extra.collmemory, linst, rinst);
                }
            }
        }
        return false;
    };
    var rpicktype = null;
    var rtopick = new cr.ObjectSet();
    var needscollisionfinish = false;
    function DoOverlapCondition(rtype, offx, offy)
    {
        if (!rtype)
            return false;
        var do_offset = (offx !== 0 || offy !== 0);
        var oldx, oldy, ret = false, r, lenr, rinst;
        var cnd = this.runtime.getCurrentCondition();
        var ltype = cnd.type;
        var inverted = cnd.inverted;
        var rsol = rtype.getCurrentSol();
        var orblock = this.runtime.getCurrentEventStack().current_event.orblock;
        var rinstances;
        if (rsol.select_all)
            rinstances = rsol.type.instances;
        else if (orblock)
            rinstances = rsol.else_instances;
        else
            rinstances = rsol.instances;
        rpicktype = rtype;
        needscollisionfinish = (ltype !== rtype && !inverted);
        if (do_offset)
        {
            oldx = this.x;
            oldy = this.y;
            this.x += offx;
            this.y += offy;
            this.set_bbox_changed();
        }
        for (r = 0, lenr = rinstances.length; r < lenr; r++)
        {
            rinst = rinstances[r];
            if (this.runtime.testOverlap(this, rinst))
            {
                ret = true;
                if (inverted)
                    break;
                if (ltype !== rtype)
                    rtopick.add(rinst);
            }
        }
        if (do_offset)
        {
            this.x = oldx;
            this.y = oldy;
            this.set_bbox_changed();
        }
        return ret;
    };
    typeProto.finish = function (do_pick)
    {
        if (!needscollisionfinish)
            return;
        if (do_pick)
        {
            var orblock = this.runtime.getCurrentEventStack().current_event.orblock;
            var sol = rpicktype.getCurrentSol();
            var topick = rtopick.valuesRef();
            var i, len, inst;
            if (sol.select_all)
            {
                sol.select_all = false;
                sol.instances.length = topick.length;
                for (i = 0, len = topick.length; i < len; i++)
                {
                    sol.instances[i] = topick[i];
                }
                if (orblock)
                {
                    sol.else_instances.length = 0;
                    for (i = 0, len = rpicktype.instances.length; i < len; i++)
                    {
                        inst = rpicktype.instances[i];
                        if (!rtopick.contains(inst))
                            sol.else_instances.push(inst);
                    }
                }
            }
            else
            {
                var initsize = sol.instances.length;
                sol.instances.length = initsize + topick.length;
                for (i = 0, len = topick.length; i < len; i++)
                {
                    sol.instances[initsize + i] = topick[i];
                    if (orblock)
                        cr.arrayFindRemove(sol.else_instances, topick[i]);
                }
            }
            rpicktype.applySolToContainer();
        }
        rtopick.clear();
        needscollisionfinish = false;
    };
    Cnds.prototype.IsOverlapping = function (rtype)
    {
        return DoOverlapCondition.call(this, rtype, 0, 0);
    };
    Cnds.prototype.IsOverlappingOffset = function (rtype, offx, offy)
    {
        return DoOverlapCondition.call(this, rtype, offx, offy);
    };
    Cnds.prototype.IsAnimPlaying = function (animname)
    {
        return this.cur_animation.name.toLowerCase() === animname.toLowerCase();
    };
    Cnds.prototype.CompareFrame = function (cmp, framenum)
    {
        return cr.do_cmp(this.cur_frame, cmp, framenum);
    };
    Cnds.prototype.OnAnimFinished = function (animname)
    {
        return this.animTriggerName.toLowerCase() === animname.toLowerCase();
    };
    Cnds.prototype.OnAnyAnimFinished = function ()
    {
        return true;
    };
    Cnds.prototype.OnFrameChanged = function ()
    {
        return true;
    };
    Cnds.prototype.IsMirrored = function ()
    {
        return this.width < 0;
    };
    Cnds.prototype.IsFlipped = function ()
    {
        return this.height < 0;
    };
    Cnds.prototype.OnURLLoaded = function ()
    {
        return true;
    };
    Cnds.prototype.IsCollisionEnabled = function ()
    {
        return this.collisionsEnabled;
    };
    pluginProto.cnds = new Cnds();
    function Acts() {};
    Acts.prototype.Spawn = function (obj, layer, imgpt)
    {
        if (!obj || !layer)
            return;
        var inst = this.runtime.createInstance(obj, layer, this.getImagePoint(imgpt, true), this.getImagePoint(imgpt, false));
        if (!inst)
            return;
        inst.angle = this.angle;
        inst.set_bbox_changed();
        this.runtime.isInOnDestroy++;
        this.runtime.trigger(Object.getPrototypeOf(obj.plugin).cnds.OnCreated, inst);
        this.runtime.isInOnDestroy--;
        var cur_act = this.runtime.getCurrentAction();
        var reset_sol = false;
        if (cr.is_undefined(cur_act.extra.Spawn_LastExec) || cur_act.extra.Spawn_LastExec < this.runtime.execcount)
        {
            reset_sol = true;
            cur_act.extra.Spawn_LastExec = this.runtime.execcount;
        }
        var i, len, s, sol;
        if (obj != this.type)
        {
            sol = obj.getCurrentSol();
            sol.select_all = false;
            if (reset_sol)
            {
                sol.instances.length = 1;
                sol.instances[0] = inst;
            }
            else
                sol.instances.push(inst);
            if (inst.is_contained)
            {
                for (i = 0, len = inst.siblings.length; i < len; i++)
                {
                    s = inst.siblings[i];
                    sol = s.type.getCurrentSol();
                    sol.select_all = false;
                    if (reset_sol)
                    {
                        sol.instances.length = 1;
                        sol.instances[0] = s;
                    }
                    else
                        sol.instances.push(s);
                }
            }
        }
    };
    Acts.prototype.SetEffect = function (effect)
    {
        this.compositeOp = cr.effectToCompositeOp(effect);
        cr.setGLBlend(this, effect, this.runtime.gl);
        this.runtime.redraw = true;
    };
    Acts.prototype.StopAnim = function ()
    {
        this.animPlaying = false;
    };
    Acts.prototype.StartAnim = function (from)
    {
        this.animPlaying = true;
        this.frameStart = this.getNowTime();
        if (from === 1 && this.cur_frame !== 0)
        {
            var prev_frame = this.cur_animation.frames[this.cur_frame];
            this.cur_frame = 0;
            this.OnFrameChanged(prev_frame, this.cur_animation.frames[0]);
            this.runtime.redraw = true;
        }
        if (!this.isTicking)
        {
            this.runtime.tickMe(this);
            this.isTicking = true;
        }
    };
    Acts.prototype.SetAnim = function (animname, from)
    {
        this.changeAnimName = animname;
        this.changeAnimFrom = from;
        if (!this.isTicking)
        {
            this.runtime.tickMe(this);
            this.isTicking = true;
        }
        if (!this.inAnimTrigger)
            this.doChangeAnim();
    };
    Acts.prototype.SetAnimFrame = function (framenumber)
    {
        this.changeAnimFrame = framenumber;
        if (!this.isTicking)
        {
            this.runtime.tickMe(this);
            this.isTicking = true;
        }
        if (!this.inAnimTrigger)
            this.doChangeAnimFrame();
    };
    Acts.prototype.SetAnimSpeed = function (s)
    {
        this.cur_anim_speed = cr.abs(s);
        this.animForwards = (s >= 0);
        if (!this.isTicking)
        {
            this.runtime.tickMe(this);
            this.isTicking = true;
        }
    };
    Acts.prototype.SetMirrored = function (m)
    {
        var neww = cr.abs(this.width) * (m === 0 ? -1 : 1);
        if (this.width === neww)
            return;
        this.width = neww;
        this.set_bbox_changed();
    };
    Acts.prototype.SetFlipped = function (f)
    {
        var newh = cr.abs(this.height) * (f === 0 ? -1 : 1);
        if (this.height === newh)
            return;
        this.height = newh;
        this.set_bbox_changed();
    };
    Acts.prototype.SetScale = function (s)
    {
        var cur_frame = this.curFrame;
        var mirror_factor = (this.width < 0 ? -1 : 1);
        var flip_factor = (this.height < 0 ? -1 : 1);
        var new_width = cur_frame.width * s * mirror_factor;
        var new_height = cur_frame.height * s * flip_factor;
        if (this.width !== new_width || this.height !== new_height)
        {
            this.width = new_width;
            this.height = new_height;
            this.set_bbox_changed();
        }
    };
    Acts.prototype.LoadURL = function (url_, resize_)
    {
        var img = new Image();
        var self = this;
        var curFrame_ = this.curFrame;
        img.onload = function ()
        {
            curFrame_.texture_img = img;
            curFrame_.offx = 0;
            curFrame_.offy = 0;
            curFrame_.width = img.width;
            curFrame_.height = img.height;
            curFrame_.spritesheeted = false;
            curFrame_.datauri = "";
            if (self.runtime.glwrap)
            {
                if (curFrame_.webGL_texture)
                    self.runtime.glwrap.deleteTexture(curFrame_.webGL_texture);
                curFrame_.webGL_texture = self.runtime.glwrap.loadTexture(img, false, self.runtime.linearSampling);
                if (self.curFrame === curFrame_)
                    self.curWebGLTexture = curFrame_.webGL_texture;
            }
            if (resize_ === 0)      // resize to image size
            {
                self.width = img.width;
                self.height = img.height;
                self.set_bbox_changed();
            }
            self.runtime.redraw = true;
            self.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnURLLoaded, self);
        };
        if (url_.substr(0, 5) !== "data:")
            img.crossOrigin = 'anonymous';
        img.src = url_;
    };
    Acts.prototype.SetCollisions = function (set_)
    {
        this.collisionsEnabled = (set_ !== 0);
    };
    pluginProto.acts = new Acts();
    function Exps() {};
    Exps.prototype.AnimationFrame = function (ret)
    {
        ret.set_int(this.cur_frame);
    };
    Exps.prototype.AnimationFrameCount = function (ret)
    {
        ret.set_int(this.cur_animation.frames.length);
    };
    Exps.prototype.AnimationName = function (ret)
    {
        ret.set_string(this.cur_animation.name);
    };
    Exps.prototype.AnimationSpeed = function (ret)
    {
        ret.set_float(this.cur_anim_speed);
    };
    Exps.prototype.ImagePointX = function (ret, imgpt)
    {
        ret.set_float(this.getImagePoint(imgpt, true));
    };
    Exps.prototype.ImagePointY = function (ret, imgpt)
    {
        ret.set_float(this.getImagePoint(imgpt, false));
    };
    Exps.prototype.ImagePointCount = function (ret)
    {
        ret.set_int(this.curFrame.image_points.length);
    };
    Exps.prototype.ImageWidth = function (ret)
    {
        ret.set_float(this.curFrame.width);
    };
    Exps.prototype.ImageHeight = function (ret)
    {
        ret.set_float(this.curFrame.height);
    };
    pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.Text = function(runtime)
{
    this.runtime = runtime;
};
(function ()
{
    var pluginProto = cr.plugins_.Text.prototype;
    pluginProto.onCreate = function ()
    {
        pluginProto.acts.SetWidth = function (w)
        {
            if (this.width !== w)
            {
                this.width = w;
                this.text_changed = true;   // also recalculate text wrapping
                this.set_bbox_changed();
            }
        };
    };
    pluginProto.Type = function(plugin)
    {
        this.plugin = plugin;
        this.runtime = plugin.runtime;
    };
    var typeProto = pluginProto.Type.prototype;
    typeProto.onCreate = function()
    {
    };
    typeProto.onLostWebGLContext = function ()
    {
        if (this.is_family)
            return;
        var i, len, inst;
        for (i = 0, len = this.instances.length; i < len; i++)
        {
            inst = this.instances[i];
            inst.mycanvas = null;
            inst.myctx = null;
            inst.mytex = null;
        }
    };
    pluginProto.Instance = function(type)
    {
        this.type = type;
        this.runtime = type.runtime;
        this.lines = [];        // for word wrapping
        this.text_changed = true;
    };
    var instanceProto = pluginProto.Instance.prototype;
    var requestedWebFonts = {};     // already requested web fonts have an entry here
    instanceProto.onCreate = function()
    {
        this.text = this.properties[0];
        this.visible = (this.properties[1] === 0);      // 0=visible, 1=invisible
        this.font = this.properties[2];
        this.color = this.properties[3];
        this.halign = this.properties[4];               // 0=left, 1=center, 2=right
        this.valign = this.properties[5];               // 0=top, 1=center, 2=bottom
        this.wrapbyword = (this.properties[7] === 0);   // 0=word, 1=character
        this.lastwidth = this.width;
        this.lastwrapwidth = this.width;
        this.lastheight = this.height;
        this.line_height_offset = this.properties[8];
        this.facename = "";
        this.fontstyle = "";
        var arr = this.font.split(" ");
        this.ptSize = 0;
        this.textWidth = 0;
        this.textHeight = 0;
        var i;
        for (i = 0; i < arr.length; i++)
        {
            if (arr[i].substr(arr[i].length - 2, 2) === "pt")
            {
                this.ptSize = parseInt(arr[i].substr(0, arr[i].length - 2));
                this.pxHeight = Math.ceil((this.ptSize / 72.0) * 96.0) + 4; // assume 96dpi...
                this.facename = arr[i + 1];
                if (i > 0)
                    this.fontstyle = arr[i - 1];
                break;
            }
        }
        this.mycanvas = null;
        this.myctx = null;
        this.mytex = null;
        this.need_text_redraw = false;
        this.rcTex = new cr.rect(0, 0, 1, 1);
;
    };
    instanceProto.onDestroy = function ()
    {
        this.myctx = null;
        this.mycanvas = null;
        if (this.runtime.glwrap && this.mytex)
            this.runtime.glwrap.deleteTexture(this.mytex);
        this.mytex = null;
    };
    instanceProto.updateFont = function ()
    {
        this.font = this.fontstyle + " " + this.ptSize.toString() + "pt " + this.facename;
        this.text_changed = true;
        this.runtime.redraw = true;
    };
    instanceProto.draw = function(ctx, glmode)
    {
        ctx.font = this.font;
        ctx.textBaseline = "top";
        ctx.fillStyle = this.color;
        ctx.globalAlpha = glmode ? 1 : this.opacity;
        var myscale = 1;
        if (glmode)
        {
            myscale = this.layer.getScale();
            ctx.save();
            ctx.scale(myscale, myscale);
        }
        if (this.text_changed || this.width !== this.lastwrapwidth)
        {
            this.type.plugin.WordWrap(this.text, this.lines, ctx, this.width, this.wrapbyword);
            this.text_changed = false;
            this.lastwrapwidth = this.width;
        }
        this.update_bbox();
        var penX = glmode ? 0 : this.bquad.tlx;
        var penY = glmode ? 0 : this.bquad.tly;
        if (this.runtime.pixel_rounding)
        {
            penX = (penX + 0.5) | 0;
            penY = (penY + 0.5) | 0;
        }
        if (this.angle !== 0 && !glmode)
        {
            ctx.save();
            ctx.translate(penX, penY);
            ctx.rotate(this.angle);
            penX = 0;
            penY = 0;
        }
        var endY = penY + this.height;
        var line_height = this.pxHeight;
        line_height += (this.line_height_offset * this.runtime.devicePixelRatio);
        var drawX;
        var i;
        if (this.valign === 1)      // center
            penY += Math.max(this.height / 2 - (this.lines.length * line_height) / 2, 0);
        else if (this.valign === 2) // bottom
            penY += Math.max(this.height - (this.lines.length * line_height) - 2, 0);
        for (i = 0; i < this.lines.length; i++)
        {
            drawX = penX;
            if (this.halign === 1)      // center
                drawX = penX + (this.width - this.lines[i].width) / 2;
            else if (this.halign === 2) // right
                drawX = penX + (this.width - this.lines[i].width);
            ctx.fillText(this.lines[i].text, drawX, penY);
            penY += line_height;
            if (penY >= endY - line_height)
                break;
        }
        if (this.angle !== 0 || glmode)
            ctx.restore();
    };
    instanceProto.drawGL = function(glw)
    {
        if (this.width < 1 || this.height < 1)
            return;
        var need_redraw = this.text_changed || this.need_text_redraw;
        this.need_text_redraw = false;
        var layer_scale = this.layer.getScale();
        var layer_angle = this.layer.getAngle();
        var rcTex = this.rcTex;
        var floatscaledwidth = layer_scale * this.width;
        var floatscaledheight = layer_scale * this.height;
        var scaledwidth = Math.ceil(floatscaledwidth);
        var scaledheight = Math.ceil(floatscaledheight);
        var windowWidth = this.runtime.width;
        var windowHeight = this.runtime.height;
        var halfw = windowWidth / 2;
        var halfh = windowHeight / 2;
        if (!this.myctx)
        {
            this.mycanvas = document.createElement("canvas");
            this.mycanvas.width = scaledwidth;
            this.mycanvas.height = scaledheight;
            this.lastwidth = scaledwidth;
            this.lastheight = scaledheight;
            need_redraw = true;
            this.myctx = this.mycanvas.getContext("2d");
        }
        if (scaledwidth !== this.lastwidth || scaledheight !== this.lastheight)
        {
            this.mycanvas.width = scaledwidth;
            this.mycanvas.height = scaledheight;
            if (this.mytex)
            {
                glw.deleteTexture(this.mytex);
                this.mytex = null;
            }
            need_redraw = true;
        }
        if (need_redraw)
        {
            this.myctx.clearRect(0, 0, scaledwidth, scaledheight);
            this.draw(this.myctx, true);
            if (!this.mytex)
                this.mytex = glw.createEmptyTexture(scaledwidth, scaledheight, this.runtime.linearSampling);
            glw.videoToTexture(this.mycanvas, this.mytex);
        }
        this.lastwidth = scaledwidth;
        this.lastheight = scaledheight;
        glw.setTexture(this.mytex);
        glw.setOpacity(this.opacity);
        glw.resetModelView();
        glw.translate(-halfw, -halfh);
        glw.updateModelView();
        var q = this.bquad;
        var tlx = this.layer.layerToCanvas(q.tlx, q.tly, true);
        var tly = this.layer.layerToCanvas(q.tlx, q.tly, false);
        var trx = this.layer.layerToCanvas(q.trx, q.try_, true);
        var try_ = this.layer.layerToCanvas(q.trx, q.try_, false);
        var brx = this.layer.layerToCanvas(q.brx, q.bry, true);
        var bry = this.layer.layerToCanvas(q.brx, q.bry, false);
        var blx = this.layer.layerToCanvas(q.blx, q.bly, true);
        var bly = this.layer.layerToCanvas(q.blx, q.bly, false);
        if (this.runtime.pixel_rounding || (this.angle === 0 && layer_angle === 0))
        {
            var ox = ((tlx + 0.5) | 0) - tlx;
            var oy = ((tly + 0.5) | 0) - tly
            tlx += ox;
            tly += oy;
            trx += ox;
            try_ += oy;
            brx += ox;
            bry += oy;
            blx += ox;
            bly += oy;
        }
        if (this.angle === 0 && layer_angle === 0)
        {
            trx = tlx + scaledwidth;
            try_ = tly;
            brx = trx;
            bry = tly + scaledheight;
            blx = tlx;
            bly = bry;
            rcTex.right = 1;
            rcTex.bottom = 1;
        }
        else
        {
            rcTex.right = floatscaledwidth / scaledwidth;
            rcTex.bottom = floatscaledheight / scaledheight;
        }
        glw.quadTex(tlx, tly, trx, try_, brx, bry, blx, bly, rcTex);
        glw.resetModelView();
        glw.scale(layer_scale, layer_scale);
        glw.rotateZ(-this.layer.getAngle());
        glw.translate((this.layer.viewLeft + this.layer.viewRight) / -2, (this.layer.viewTop + this.layer.viewBottom) / -2);
        glw.updateModelView();
    };
    var wordsCache = [];
    pluginProto.TokeniseWords = function (text)
    {
        wordsCache.length = 0;
        var cur_word = "";
        var ch;
        var i = 0;
        while (i < text.length)
        {
            ch = text.charAt(i);
            if (ch === "\n")
            {
                if (cur_word.length)
                {
                    wordsCache.push(cur_word);
                    cur_word = "";
                }
                wordsCache.push("\n");
                ++i;
            }
            else if (ch === " " || ch === "\t" || ch === "-")
            {
                do {
                    cur_word += text.charAt(i);
                    i++;
                }
                while (i < text.length && (text.charAt(i) === " " || text.charAt(i) === "\t"));
                wordsCache.push(cur_word);
                cur_word = "";
            }
            else if (i < text.length)
            {
                cur_word += ch;
                i++;
            }
        }
        if (cur_word.length)
            wordsCache.push(cur_word);
    };
    pluginProto.WordWrap = function (text, lines, ctx, width, wrapbyword)
    {
        if (!text || !text.length)
        {
            lines.length = 0;
            return;
        }
        if (width <= 2.0)
        {
            lines.length = 0;
            return;
        }
        if (text.length <= 100 && text.indexOf("\n") === -1)
        {
            var all_width = 0;
            all_width = ctx.measureText(text).width;
            if (all_width <= width)
            {
                if (lines.length)
                    lines.length = 1;
                else
                    lines.push({});
                lines[0].text = text;
                lines[0].width = all_width;
                return;
            }
        }
        this.WrapText(text, lines, ctx, width, wrapbyword);
    };
    pluginProto.WrapText = function (text, lines, ctx, width, wrapbyword)
    {
        var wordArray;
        if (wrapbyword)
        {
            this.TokeniseWords(text);   // writes to wordsCache
            wordArray = wordsCache;
        }
        else
            wordArray = text;
        var cur_line = "";
        var prev_line;
        var line_width;
        var i;
        var lineIndex = 0;
        var line;
        for (i = 0; i < wordArray.length; i++)
        {
            if (wordArray[i] === "\n")
            {
                if (lineIndex >= lines.length)
                    lines.push({});
                line = lines[lineIndex];
                line.text = cur_line;
                line.width = 0;
                line.width = ctx.measureText(cur_line).width;
                lineIndex++;
                cur_line = "";
                continue;
            }
            prev_line = cur_line;
            cur_line += wordArray[i];
            line_width = 0;
            line_width = ctx.measureText(cur_line).width;
            if (line_width >= width)
            {
                if (lineIndex >= lines.length)
                    lines.push({});
                line = lines[lineIndex];
                line.text = prev_line;
                line.width = 0;
                line.width = ctx.measureText(prev_line).width;
                lineIndex++;
                cur_line = wordArray[i];
                if (!wrapbyword && cur_line === " ")
                    cur_line = "";
            }
        }
        if (cur_line.length)
        {
            if (lineIndex >= lines.length)
                lines.push({});
            line = lines[lineIndex];
            line.text = cur_line;
            line.width = 0;
            line.width = ctx.measureText(cur_line).width;
            lineIndex++;
        }
        lines.length = lineIndex;
    };
    function Cnds() {};
    Cnds.prototype.CompareText = function(text_to_compare, case_sensitive)
    {
        if (case_sensitive)
            return this.text == text_to_compare;
        else
            return this.text.toLowerCase() == text_to_compare.toLowerCase();
    };
    pluginProto.cnds = new Cnds();
    function Acts() {};
    Acts.prototype.SetText = function(param)
    {
        if (cr.is_number(param) && param < 1e9)
            param = Math.round(param * 1e10) / 1e10;    // round to nearest ten billionth - hides floating point errors
        var text_to_set = param.toString();
        if (this.text !== text_to_set)
        {
            this.text = text_to_set;
            this.text_changed = true;
            this.runtime.redraw = true;
        }
    };
    Acts.prototype.AppendText = function(param)
    {
        if (cr.is_number(param))
            param = Math.round(param * 1e10) / 1e10;    // round to nearest ten billionth - hides floating point errors
        var text_to_append = param.toString();
        if (text_to_append) // not empty
        {
            this.text += text_to_append;
            this.text_changed = true;
            this.runtime.redraw = true;
        }
    };
    Acts.prototype.SetFontFace = function (face_, style_)
    {
        var newstyle = "";
        switch (style_) {
        case 1: newstyle = "bold"; break;
        case 2: newstyle = "italic"; break;
        case 3: newstyle = "bold italic"; break;
        }
        if (face_ === this.facename && newstyle === this.fontstyle)
            return;     // no change
        this.facename = face_;
        this.fontstyle = newstyle;
        this.updateFont();
    };
    Acts.prototype.SetFontSize = function (size_)
    {
        if (this.ptSize === size_)
            return;
        this.ptSize = size_;
        this.pxHeight = Math.ceil((this.ptSize / 72.0) * 96.0) + 4; // assume 96dpi...
        this.updateFont();
    };
    Acts.prototype.SetFontColor = function (rgb)
    {
        var newcolor = "rgb(" + cr.GetRValue(rgb).toString() + "," + cr.GetGValue(rgb).toString() + "," + cr.GetBValue(rgb).toString() + ")";
        if (newcolor === this.color)
            return;
        this.color = newcolor;
        this.need_text_redraw = true;
        this.runtime.redraw = true;
    };
    Acts.prototype.SetWebFont = function (familyname_, cssurl_)
    {
        if (this.runtime.isDomFree)
        {
            cr.logexport("[Construct 2] Text plugin: 'Set web font' not supported on this platform - the action has been ignored");
            return;     // DC todo
        }
        var self = this;
        var refreshFunc = (function () {
                            self.runtime.redraw = true;
                            self.text_changed = true;
                        });
        if (requestedWebFonts.hasOwnProperty(cssurl_))
        {
            var newfacename = "'" + familyname_ + "'";
            if (this.facename === newfacename)
                return; // no change
            this.facename = newfacename;
            this.updateFont();
            for (var i = 1; i < 10; i++)
            {
                setTimeout(refreshFunc, i * 100);
                setTimeout(refreshFunc, i * 1000);
            }
            return;
        }
        var wf = document.createElement("link");
        wf.href = cssurl_;
        wf.rel = "stylesheet";
        wf.type = "text/css";
        wf.onload = refreshFunc;
        document.getElementsByTagName('head')[0].appendChild(wf);
        requestedWebFonts[cssurl_] = true;
        this.facename = "'" + familyname_ + "'";
        this.updateFont();
        for (var i = 1; i < 10; i++)
        {
            setTimeout(refreshFunc, i * 100);
            setTimeout(refreshFunc, i * 1000);
        }
;
    };
    pluginProto.acts = new Acts();
    function Exps() {};
    Exps.prototype.Text = function(ret)
    {
        ret.set_string(this.text);
    };
    Exps.prototype.FaceName = function (ret)
    {
        ret.set_string(this.facename);
    };
    Exps.prototype.FaceSize = function (ret)
    {
        ret.set_int(this.ptSize);
    };
    Exps.prototype.TextWidth = function (ret)
    {
        var w = 0;
        var i, len, x;
        for (i = 0, len = this.lines.length; i < len; i++)
        {
            x = this.lines[i].width;
            if (w < x)
                w = x;
        }
        ret.set_int(w);
    };
    Exps.prototype.TextHeight = function (ret)
    {
        ret.set_int(this.lines.length * this.pxHeight);
    };
    pluginProto.exps = new Exps();
}());
cr.getProjectModel = function() { return [
    null,
    null,
    [
    [
        cr.plugins_.Mouse,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false
    ]
,   [
        cr.plugins_.Sprite,
        false,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false
    ]
,   [
        cr.plugins_.Text,
        false,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false
    ]
    ],
    [
    [
        "t0",
        cr.plugins_.Sprite,
        false,
        4,
        0,
        0,
        null,
        [
            [
            "Default",
            0,
            false,
            1,
            0,
            false,
            [
                ["images/sprite-sheet0.png", 147071, 1, 1, 133, 133, 1, 0.503759, 0.503759,[],[]],
                ["images/sprite-sheet0.png", 147071, 135, 1, 133, 133, 1, 0.503759, 0.503759,[],[]],
                ["images/sprite-sheet0.png", 147071, 269, 1, 133, 133, 1, 0.503759, 0.503759,[],[]],
                ["images/sprite-sheet0.png", 147071, 1, 135, 133, 133, 1, 0.503759, 0.503759,[],[]],
                ["images/sprite-sheet0.png", 147071, 135, 135, 133, 133, 1, 0.503759, 0.503759,[],[]],
                ["images/sprite-sheet0.png", 147071, 269, 135, 133, 133, 1, 0.503759, 0.503759,[],[]],
                ["images/sprite-sheet0.png", 147071, 1, 269, 133, 133, 1, 0.503759, 0.503759,[],[]],
                ["images/sprite-sheet0.png", 147071, 135, 269, 133, 133, 1, 0.503759, 0.503759,[],[]],
                ["images/sprite-sheet0.png", 147071, 269, 269, 133, 133, 1, 0.503759, 0.503759,[],[]]
            ]
            ]
        ],
        [
        ],
        false,
        false,
        []
    ]
,   [
        "t1",
        cr.plugins_.Mouse,
        false,
        0,
        0,
        0,
        null,
        null,
        [
        ],
        false,
        false,
        []
        ,[]
    ]
,   [
        "t2",
        cr.plugins_.Sprite,
        false,
        2,
        0,
        0,
        null,
        [
            [
            "Default",
            5,
            false,
            1,
            0,
            false,
            [
                ["images/sprite2-sheet0.png", 93, 0, 0, 32, 32, 1, 0.5, 0.5,[],[]]
            ]
            ]
        ],
        [
        ],
        false,
        false,
        []
    ]
,   [
        "t3",
        cr.plugins_.Text,
        false,
        1,
        0,
        0,
        null,
        null,
        [
        ],
        false,
        false,
        []
    ]
    ],
    [
    ],
    [
    [
        "Layout 1",
        1280,
        1024,
        false,
        "Event sheet 1",
        [
        [
            "Layer 0",
            0,
            true,
            [153, 153, 204],
            false,
            1,
            1,
            1,
            false,
            1,
            0,
            0,
            [
            [
                [133, 133, 0, 133, 133, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                2,
                [
                    0,
                    0
                ],
                [
                ],
                [
                    0,
                    0,
                    1
                ]
            ]
,           [
                [399, 133, 0, 133, 133, 0, 0, 1, 0.503759, 0.503759, 0, 0, []],
                0,
                [
                    0,
                    0,
                    0,
                    0
                ],
                [
                ],
                [
                    0,
                    0,
                    1
                ]
            ]
,           [
                [266, 133, 0, 133, 133, 0, 0, 1, 0.503759, 0.503759, 0, 0, []],
                0,
                [
                    0,
                    0,
                    0,
                    0
                ],
                [
                ],
                [
                    0,
                    1,
                    1
                ]
            ]
,           [
                [399, 266, 0, 133, 133, 0, 0, 1, 0.503759, 0.503759, 0, 0, []],
                0,
                [
                    0,
                    0,
                    0,
                    0
                ],
                [
                ],
                [
                    0,
                    3,
                    1
                ]
            ]
,           [
                [266, 266, 0, 133, 133, 0, 0, 1, 0.503759, 0.503759, 0, 0, []],
                0,
                [
                    0,
                    0,
                    0,
                    0
                ],
                [
                ],
                [
                    0,
                    4,
                    1
                ]
            ]
,           [
                [133, 266, 0, 133, 133, 0, 0, 1, 0.503759, 0.503759, 0, 0, []],
                0,
                [
                    0,
                    0,
                    0,
                    0
                ],
                [
                ],
                [
                    0,
                    5,
                    1
                ]
            ]
,           [
                [399, 399, 0, 133, 133, 0, 0, 1, 0.503759, 0.503759, 0, 0, []],
                0,
                [
                    0,
                    0,
                    0,
                    0
                ],
                [
                ],
                [
                    0,
                    6,
                    1
                ]
            ]
,           [
                [266, 399, 0, 133, 133, 0, 0, 1, 0.503759, 0.503759, 0, 0, []],
                0,
                [
                    0,
                    0,
                    0,
                    0
                ],
                [
                ],
                [
                    0,
                    7,
                    1
                ]
            ]
,           [
                [133, 399, 0, 133, 133, 0, 0, 1, 0.503759, 0.503759, 0, 0, []],
                0,
                [
                    0,
                    0,
                    0,
                    0
                ],
                [
                ],
                [
                    0,
                    8,
                    1
                ]
            ]
,           [
                [133, 0, 0, 200, 30, 0, 0, 1, 0, 0, 0, 0, []],
                3,
                [
                    0
                ],
                [
                ],
                [
                    "Text",
                    0,
                    "12pt Arial",
                    "rgb(0,0,0)",
                    0,
                    0,
                    0,
                    0,
                    0
                ]
            ]
            ],
            [           ]
        ]
        ],
        [
        ],
        []
    ]
    ],
    [
    [
        "Event sheet 1",
        [
        [
            1,
            "swapX",
            0,
            0,
false,false
        ]
,       [
            1,
            "swapY",
            0,
            0,
false,false
        ]
,       [
            0,
            null,
            false,
            [
            [
                -1,
                cr.system_object.prototype.cnds.OnLayoutStart,
                null,
                1,
                false,
                false,
                false
            ]
            ],
            [
            [
                0,
                cr.plugins_.Sprite.prototype.acts.SetInstanceVar,
                null
                ,[
                [
                    10,
                    0
                ]
,               [
                    7,
                    [
                        20,
                        0,
                        cr.plugins_.Sprite.prototype.exps.X,
                        false,
                        null
                    ]
                ]
                ]
            ]
,           [
                0,
                cr.plugins_.Sprite.prototype.acts.SetInstanceVar,
                null
                ,[
                [
                    10,
                    1
                ]
,               [
                    7,
                    [
                        20,
                        0,
                        cr.plugins_.Sprite.prototype.exps.Y,
                        false,
                        null
                    ]
                ]
                ]
            ]
            ]
            ,[
            [
                0,
                null,
                false,
                [
                [
                    -1,
                    cr.system_object.prototype.cnds.Repeat,
                    null,
                    0,
                    true,
                    false,
                    false
                    ,[
                    [
                        0,
                        [
                            0,
                            100
                        ]
                    ]
                    ]
                ]
                ],
                [
                [
                    0,
                    cr.plugins_.Sprite.prototype.acts.SetBoolInstanceVar,
                    null
                    ,[
                    [
                        10,
                        2
                    ]
,                   [
                        3,
                        0
                    ]
                    ]
                ]
                ]
                ,[
                [
                    0,
                    null,
                    false,
                    [
                    [
                        -1,
                        cr.system_object.prototype.cnds.ForEach,
                        null,
                        0,
                        true,
                        false,
                        false
                        ,[
                        [
                            4,
                            0
                        ]
                        ]
                    ]
,                   [
                        -1,
                        cr.system_object.prototype.cnds.Compare,
                        null,
                        0,
                        false,
                        false,
                        false
                        ,[
                        [
                            7,
                            [
                                19,
                                cr.system_object.prototype.exps.distance
                                ,[
[
                                    20,
                                    0,
                                    cr.plugins_.Sprite.prototype.exps.X,
                                    false,
                                    null
                                ]
,[
                                    20,
                                    0,
                                    cr.plugins_.Sprite.prototype.exps.Y,
                                    false,
                                    null
                                ]
,[
                                    20,
                                    2,
                                    cr.plugins_.Sprite.prototype.exps.X,
                                    false,
                                    null
                                ]
,[
                                    20,
                                    2,
                                    cr.plugins_.Sprite.prototype.exps.Y,
                                    false,
                                    null
                                ]
                                ]
                            ]
                        ]
,                       [
                            8,
                            0
                        ]
,                       [
                            7,
                            [
                                0,
                                133
                            ]
                        ]
                        ]
                    ]
                    ],
                    [
                    [
                        0,
                        cr.plugins_.Sprite.prototype.acts.SetBoolInstanceVar,
                        null
                        ,[
                        [
                            10,
                            2
                        ]
,                       [
                            3,
                            1
                        ]
                        ]
                    ]
                    ]
                ]
,               [
                    0,
                    null,
                    false,
                    [
                    [
                        0,
                        cr.plugins_.Sprite.prototype.cnds.IsBoolInstanceVarSet,
                        null,
                        0,
                        false,
                        false,
                        false
                        ,[
                        [
                            10,
                            2
                        ]
                        ]
                    ]
,                   [
                        -1,
                        cr.system_object.prototype.cnds.PickRandom,
                        null,
                        0,
                        false,
                        false,
                        false
                        ,[
                        [
                            4,
                            0
                        ]
                        ]
                    ]
                    ],
                    [
                    [
                        -1,
                        cr.system_object.prototype.acts.SetVar,
                        null
                        ,[
                        [
                            11,
                            "swapX"
                        ]
,                       [
                            7,
                            [
                                20,
                                0,
                                cr.plugins_.Sprite.prototype.exps.X,
                                false,
                                null
                            ]
                        ]
                        ]
                    ]
,                   [
                        -1,
                        cr.system_object.prototype.acts.SetVar,
                        null
                        ,[
                        [
                            11,
                            "swapY"
                        ]
,                       [
                            7,
                            [
                                20,
                                0,
                                cr.plugins_.Sprite.prototype.exps.Y,
                                false,
                                null
                            ]
                        ]
                        ]
                    ]
,                   [
                        0,
                        cr.plugins_.Sprite.prototype.acts.SetPosToObject,
                        null
                        ,[
                        [
                            4,
                            2
                        ]
,                       [
                            7,
                            [
                                0,
                                0
                            ]
                        ]
                        ]
                    ]
,                   [
                        2,
                        cr.plugins_.Sprite.prototype.acts.SetPos,
                        null
                        ,[
                        [
                            0,
                            [
                                23,
                                "swapX"
                            ]
                        ]
,                       [
                            0,
                            [
                                23,
                                "swapY"
                            ]
                        ]
                        ]
                    ]
                    ]
                ]
                ]
            ]
            ]
        ]
,       [
            1,
            "xoffset",
            0,
            0,
false,false
        ]
,       [
            1,
            "yoffset",
            0,
            0,
false,false
        ]
,       [
            1,
            "drag_dx",
            0,
            0,
false,false
        ]
,       [
            1,
            "drag_dy",
            0,
            0,
false,false
        ]
,       [
            0,
            null,
            false,
            [
            [
                1,
                cr.plugins_.Mouse.prototype.cnds.OnObjectClicked,
                null,
                1,
                false,
                false,
                false
                ,[
                [
                    3,
                    0
                ]
,               [
                    3,
                    0
                ]
,               [
                    4,
                    0
                ]
                ]
            ]
,           [
                -1,
                cr.system_object.prototype.cnds.Compare,
                null,
                0,
                false,
                false,
                false
                ,[
                [
                    7,
                    [
                        19,
                        cr.system_object.prototype.exps.distance
                        ,[
[
                            20,
                            0,
                            cr.plugins_.Sprite.prototype.exps.X,
                            false,
                            null
                        ]
,[
                            20,
                            0,
                            cr.plugins_.Sprite.prototype.exps.Y,
                            false,
                            null
                        ]
,[
                            20,
                            2,
                            cr.plugins_.Sprite.prototype.exps.X,
                            false,
                            null
                        ]
,[
                            20,
                            2,
                            cr.plugins_.Sprite.prototype.exps.Y,
                            false,
                            null
                        ]
                        ]
                    ]
                ]
,               [
                    8,
                    0
                ]
,               [
                    7,
                    [
                        0,
                        133
                    ]
                ]
                ]
            ]
            ],
            [
            [
                -1,
                cr.system_object.prototype.acts.SetVar,
                null
                ,[
                [
                    11,
                    "swapX"
                ]
,               [
                    7,
                    [
                        20,
                        0,
                        cr.plugins_.Sprite.prototype.exps.X,
                        false,
                        null
                    ]
                ]
                ]
            ]
,           [
                -1,
                cr.system_object.prototype.acts.SetVar,
                null
                ,[
                [
                    11,
                    "swapY"
                ]
,               [
                    7,
                    [
                        20,
                        0,
                        cr.plugins_.Sprite.prototype.exps.Y,
                        false,
                        null
                    ]
                ]
                ]
            ]
,           [
                0,
                cr.plugins_.Sprite.prototype.acts.SetBoolInstanceVar,
                null
                ,[
                [
                    10,
                    3
                ]
,               [
                    3,
                    1
                ]
                ]
            ]
,           [
                -1,
                cr.system_object.prototype.acts.SetVar,
                null
                ,[
                [
                    11,
                    "drag_dx"
                ]
,               [
                    7,
                    [
                        5,
                        [
                            20,
                            0,
                            cr.plugins_.Sprite.prototype.exps.X,
                            false,
                            null
                        ]
                        ,[
                            20,
                            2,
                            cr.plugins_.Sprite.prototype.exps.X,
                            false,
                            null
                        ]
                    ]
                ]
                ]
            ]
,           [
                -1,
                cr.system_object.prototype.acts.SetVar,
                null
                ,[
                [
                    11,
                    "drag_dy"
                ]
,               [
                    7,
                    [
                        5,
                        [
                            20,
                            0,
                            cr.plugins_.Sprite.prototype.exps.Y,
                            false,
                            null
                        ]
                        ,[
                            20,
                            2,
                            cr.plugins_.Sprite.prototype.exps.Y,
                            false,
                            null
                        ]
                    ]
                ]
                ]
            ]
,           [
                -1,
                cr.system_object.prototype.acts.SetVar,
                null
                ,[
                [
                    11,
                    "xoffset"
                ]
,               [
                    7,
                    [
                        5,
                        [
                            20,
                            1,
                            cr.plugins_.Mouse.prototype.exps.X,
                            false,
                            null
                        ]
                        ,[
                            20,
                            0,
                            cr.plugins_.Sprite.prototype.exps.X,
                            false,
                            null
                        ]
                    ]
                ]
                ]
            ]
,           [
                -1,
                cr.system_object.prototype.acts.SetVar,
                null
                ,[
                [
                    11,
                    "yoffset"
                ]
,               [
                    7,
                    [
                        5,
                        [
                            20,
                            1,
                            cr.plugins_.Mouse.prototype.exps.Y,
                            false,
                            null
                        ]
                        ,[
                            20,
                            0,
                            cr.plugins_.Sprite.prototype.exps.Y,
                            false,
                            null
                        ]
                    ]
                ]
                ]
            ]
            ]
        ]
,       [
            0,
            null,
            false,
            [
            [
                0,
                cr.plugins_.Sprite.prototype.cnds.IsBoolInstanceVarSet,
                null,
                0,
                false,
                false,
                false
                ,[
                [
                    10,
                    3
                ]
                ]
            ]
            ],
            [
            [
                0,
                cr.plugins_.Sprite.prototype.acts.SetPos,
                null
                ,[
                [
                    0,
                    [
                        4,
                        [
                            20,
                            2,
                            cr.plugins_.Sprite.prototype.exps.X,
                            false,
                            null
                        ]
                        ,[
                            19,
                            cr.system_object.prototype.exps.clamp
                            ,[
[
                                5,
                                [
                                    5,
                                    [
                                        20,
                                        1,
                                        cr.plugins_.Mouse.prototype.exps.X,
                                        false,
                                        null
                                    ]
                                    ,[
                                        20,
                                        2,
                                        cr.plugins_.Sprite.prototype.exps.X,
                                        false,
                                        null
                                    ]
                                ]
                                ,[
                                    23,
                                    "xoffset"
                                ]
                            ]
,[
                                19,
                                cr.system_object.prototype.exps.min
                                ,[
[
                                    0,
                                    0
                                ]
,[
                                    19,
                                    cr.system_object.prototype.exps["int"]
                                    ,[
[
                                        23,
                                        "drag_dx"
                                    ]
                                    ]
                                ]
                                ]
                            ]
,[
                                19,
                                cr.system_object.prototype.exps.max
                                ,[
[
                                    0,
                                    0
                                ]
,[
                                    19,
                                    cr.system_object.prototype.exps["int"]
                                    ,[
[
                                        23,
                                        "drag_dx"
                                    ]
                                    ]
                                ]
                                ]
                            ]
                            ]
                        ]
                    ]
                ]
,               [
                    0,
                    [
                        4,
                        [
                            20,
                            2,
                            cr.plugins_.Sprite.prototype.exps.Y,
                            false,
                            null
                        ]
                        ,[
                            19,
                            cr.system_object.prototype.exps.clamp
                            ,[
[
                                5,
                                [
                                    5,
                                    [
                                        20,
                                        1,
                                        cr.plugins_.Mouse.prototype.exps.Y,
                                        false,
                                        null
                                    ]
                                    ,[
                                        20,
                                        2,
                                        cr.plugins_.Sprite.prototype.exps.Y,
                                        false,
                                        null
                                    ]
                                ]
                                ,[
                                    23,
                                    "yoffset"
                                ]
                            ]
,[
                                19,
                                cr.system_object.prototype.exps.min
                                ,[
[
                                    0,
                                    0
                                ]
,[
                                    19,
                                    cr.system_object.prototype.exps["int"]
                                    ,[
[
                                        23,
                                        "drag_dy"
                                    ]
                                    ]
                                ]
                                ]
                            ]
,[
                                19,
                                cr.system_object.prototype.exps.max
                                ,[
[
                                    0,
                                    0
                                ]
,[
                                    19,
                                    cr.system_object.prototype.exps["int"]
                                    ,[
[
                                        23,
                                        "drag_dy"
                                    ]
                                    ]
                                ]
                                ]
                            ]
                            ]
                        ]
                    ]
                ]
                ]
            ]
            ]
        ]
,       [
            0,
            null,
            false,
            [
            [
                1,
                cr.plugins_.Mouse.prototype.cnds.OnRelease,
                null,
                1,
                false,
                false,
                false
                ,[
                [
                    3,
                    0
                ]
                ]
            ]
,           [
                0,
                cr.plugins_.Sprite.prototype.cnds.IsBoolInstanceVarSet,
                null,
                0,
                false,
                false,
                false
                ,[
                [
                    10,
                    3
                ]
                ]
            ]
            ],
            [
            [
                0,
                cr.plugins_.Sprite.prototype.acts.SetPos,
                null
                ,[
                [
                    0,
                    [
                        6,
                        [
                            19,
                            cr.system_object.prototype.exps.round
                            ,[
[
                                7,
                                [
                                    20,
                                    0,
                                    cr.plugins_.Sprite.prototype.exps.X,
                                    false,
                                    null
                                ]
                                ,[
                                    0,
                                    133
                                ]
                            ]
                            ]
                        ]
                        ,[
                            0,
                            133
                        ]
                    ]
                ]
,               [
                    0,
                    [
                        6,
                        [
                            19,
                            cr.system_object.prototype.exps.round
                            ,[
[
                                7,
                                [
                                    20,
                                    0,
                                    cr.plugins_.Sprite.prototype.exps.Y,
                                    false,
                                    null
                                ]
                                ,[
                                    0,
                                    133
                                ]
                            ]
                            ]
                        ]
                        ,[
                            0,
                            133
                        ]
                    ]
                ]
                ]
            ]
,           [
                0,
                cr.plugins_.Sprite.prototype.acts.SetBoolInstanceVar,
                null
                ,[
                [
                    10,
                    3
                ]
,               [
                    3,
                    0
                ]
                ]
            ]
            ]
            ,[
            [
                0,
                null,
                false,
                [
                [
                    0,
                    cr.plugins_.Sprite.prototype.cnds.CompareX,
                    null,
                    0,
                    false,
                    false,
                    false
                    ,[
                    [
                        8,
                        0
                    ]
,                   [
                        0,
                        [
                            20,
                            2,
                            cr.plugins_.Sprite.prototype.exps.X,
                            false,
                            null
                        ]
                    ]
                    ]
                ]
,               [
                    0,
                    cr.plugins_.Sprite.prototype.cnds.CompareY,
                    null,
                    0,
                    false,
                    false,
                    false
                    ,[
                    [
                        8,
                        0
                    ]
,                   [
                        0,
                        [
                            20,
                            2,
                            cr.plugins_.Sprite.prototype.exps.Y,
                            false,
                            null
                        ]
                    ]
                    ]
                ]
                ],
                [
                [
                    0,
                    cr.plugins_.Sprite.prototype.acts.SetPosToObject,
                    null
                    ,[
                    [
                        4,
                        2
                    ]
,                   [
                        7,
                        [
                            0,
                            0
                        ]
                    ]
                    ]
                ]
,               [
                    2,
                    cr.plugins_.Sprite.prototype.acts.SetPos,
                    null
                    ,[
                    [
                        0,
                        [
                            23,
                            "swapX"
                        ]
                    ]
,                   [
                        0,
                        [
                            23,
                            "swapY"
                        ]
                    ]
                    ]
                ]
                ]
            ]
            ]
        ]
,       [
            0,
            null,
            false,
            [
            [
                -1,
                cr.system_object.prototype.cnds.EveryTick,
                null,
                0,
                false,
                false,
                false
            ]
            ],
            [
            [
                3,
                cr.plugins_.Text.prototype.acts.SetInstanceVar,
                null
                ,[
                [
                    10,
                    0
                ]
,               [
                    7,
                    [
                        0,
                        0
                    ]
                ]
                ]
            ]
            ]
        ]
,       [
            0,
            null,
            false,
            [
            [
                0,
                cr.plugins_.Sprite.prototype.cnds.CompareX,
                null,
                0,
                false,
                false,
                false
                ,[
                [
                    8,
                    0
                ]
,               [
                    0,
                    [
                        21,
                        0,
                        false,
                        null
                        ,0
                    ]
                ]
                ]
            ]
,           [
                0,
                cr.plugins_.Sprite.prototype.cnds.CompareY,
                null,
                0,
                false,
                false,
                false
                ,[
                [
                    8,
                    0
                ]
,               [
                    0,
                    [
                        21,
                        0,
                        false,
                        null
                        ,1
                    ]
                ]
                ]
            ]
,           [
                -1,
                cr.system_object.prototype.cnds.ForEach,
                null,
                0,
                true,
                false,
                false
                ,[
                [
                    4,
                    0
                ]
                ]
            ]
            ],
            [
            [
                3,
                cr.plugins_.Text.prototype.acts.AddInstanceVar,
                null
                ,[
                [
                    10,
                    0
                ]
,               [
                    7,
                    [
                        0,
                        1
                    ]
                ]
                ]
            ]
            ]
        ]
,       [
            0,
            null,
            false,
            [
            [
                -1,
                cr.system_object.prototype.cnds.EveryTick,
                null,
                0,
                false,
                false,
                false
            ]
            ],
            [
            [
                3,
                cr.plugins_.Text.prototype.acts.SetText,
                null
                ,[
                [
                    7,
                    [
                        10,
                        [
                            2,
                            "Prawidlowo ułożone: "
                        ]
                        ,[
                            21,
                            3,
                            false,
                            null
                            ,0
                        ]
                    ]
                ]
                ]
            ]
            ]
        ]
        ]
    ]
    ],
    "media/",
    true,
    500,
    500,
    0,
    false,
    true,
    true,
    "1.0",
    2,
    false,
    0,
    false,
    [
    ]
];};