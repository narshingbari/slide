var m3D = function() {
    var e = 2;
    var t = [],
        n, r, i, s, o, u = "images/",
        a = "images/thumb/",
        f = {
            x: 0,
            y: 0,
            z: -650,
            s: 0,
            fov: 500
        },
        l = 0,
        c = 0;
    f.setTarget = function(e, t, n) {
        if (Math.abs(t - e) > .1) {
            f.s = 1;
            f.p = 0;
            f.d = t - e;
            if (n) {
                f.d *= 2;
                f.p = 9
            }
        }
    };
    f.tween = function(e) {
        if (f.s != 0) {
            f.p += f.s;
            f[e] += f.d * f.p * .01;
            if (f.p == 10) f.s = -1;
            else if (f.p == 0) f.s = 0
        }
        return f.s
    };
    var h = function(o, l, c, h, p) {
        if (l) {
            this.url = l.url;
            this.title = l.title;
            this.color = l.color;
            this.isLoaded = false;
            if (document.createElement("canvas").getContext) {
                this.srcImg = new Image;
                this.srcImg.src = u + l.src;
                this.img = document.createElement("canvas");
                this.canvas = true;
                r.appendChild(this.img)
            } else {
                this.img = document.createElement("img");
                this.img.src = u + l.src;
                r.appendChild(this.img)
            }

            function v(e, t) {
                return Math.floor(Math.random() * (t - e + 1)) + e
            }

            function m() {
                var e = t.length;
                var n = v(0, t.length);
                l.src = u + "photo" + n + ".jpg";
                if (f.s) return;
                try {
                    if (t[n].canvas == true) {
                        f.tz = t[n].z - f.fov;
                        f.tx = t[n].x;
                        f.ty = t[n].y;
                        t[n].img.className = "button selected";
                        d(false);
                        s = t[n]
                    } else {}
                } catch (r) {}
            }
            var g = setInterval(m, 6e3);
            this.but = document.createElement("div");
            this.Img = document.createElement("Img");
            this.but.className = "button";
            this.Img.src = a + l.src;
            this.but.appendChild(this.Img);
            i.appendChild(this.but);
            this.but.diapo = this;
            this.Img.style.left = Math.round(this.but.offsetWidth * 1.2 * (o % e)) + "px";
            this.Img.style.top = Math.round(this.but.offsetHeight * 1.2 * Math.floor(o / e)) + "px";
            this.Img.style.zIndex = "50";
            this.but.onclick = this.img.onclick;
            n = this.img;
            this.img.diapo = this;
            this.zi = 25e3
        } else {
            this.img = document.createElement("div");
            this.isLoaded = true;
            this.img.className = "fog";
            r.appendChild(this.img);
            this.w = 300;
            this.h = 300;
            this.zi = 15e3
        }
        this.x = c;
        this.y = h;
        this.z = p;
        this.css = this.img.style
    };
    h.prototype.anim = function() {
        if (this.isLoaded) {
            var e = this.x - f.x;
            var t = this.y - f.y;
            var n = this.z - f.z;
            if (n < 20) n += 5e3;
            var r = f.fov / n;
            var i = this.w * r;
            var s = this.h * r;
            this.css.left = Math.round(l + e * r - i * .5) + "px";
            this.css.top = Math.round(c + t * r - s * .5) + "px";
            this.css.width = Math.round(i) + "px";
            this.css.height = Math.round(s) + "px";
            this.css.zIndex = this.zi - Math.round(n)
        } else {
            this.isLoaded = this.loading()
        }
    };
    h.prototype.loading = function() {
        if (this.canvas && this.srcImg.complete || this.img.complete) {
            if (this.canvas) {
                this.w = this.srcImg.width;
                this.h = this.srcImg.height;
                this.img.width = this.w;
                this.img.height = this.h;
                var e = this.img.getContext("2d");
                e.drawImage(this.srcImg, 0, 0, this.w, this.h)
            } else {
                this.w = this.img.width;
                this.h = this.img.height
            }
            this.but.className += " loaded";
            return true
        }
        return false
    };
    var p = function() {
        l = r.offsetWidth * .5;
        c = r.offsetHeight * .5
    };
    var d = function(e) {
        var n = 0,
            r;
        while (r = t[n++]) {
            if (r.but) {
                r.css.msInterpolationMode = e ? "bicubic" : "nearest-neighbor";
                r.css.imageRendering = e ? "optimizeQuality" : "optimizeSpeed"
            }
        }
    };
    var v = function(e) {
        r = document.getElementById("screen");
        i = document.getElementById("bar");
        o = document.getElementById("urlInfo");
        p();
        var n = 0,
            s, u = e.length;
        while (s = e[n++]) {
            var a = 1e3 * (n % 4 - 1.5);
            var f = Math.round(Math.random() * 4e3) - 2e3;
            var l = n * (5e3 / u);
            t.push(new h(n - 1, s, a, f, l));
            var c = t.length - 1;
            for (var d = 0; d < 3; d++) {
                var a = Math.round(Math.random() * 4e3) - 2e3;
                var f = Math.round(Math.random() * 4e3) - 2e3;
                t.push(new h(c, null, a, f, l + 100))
            }
        }
        m()
    };
    var m = function() {
        if (f.tx) {
            if (!f.s) f.setTarget(f.x, f.tx);
            var e = f.tween("x");
            if (!e) f.tx = 0
        } else if (f.ty) {
            if (!f.s) f.setTarget(f.y, f.ty);
            var e = f.tween("y");
            if (!e) f.ty = 0
        } else if (f.tz) {
            if (!f.s) f.setTarget(f.z, f.tz);
            var e = f.tween("z");
            if (!e) {
                f.tz = 0;
                d(true);
                if (s.url) {
                    s.img.style.cursor = "pointer";
                    s.urlActive = true;
                    s.img.className = "href";
                    o.diapo = s;
                    o.onclick = s.img.onclick;
                    o.innerHTML = s.title || s.url;
                    o.style.visibility = "visible";
                    o.style.color = s.color || "#fff";
                    o.style.top = Math.round(s.img.offsetTop + s.img.offsetHeight - o.offsetHeight - 5) + "px";
                    o.style.left = Math.round(s.img.offsetLeft + s.img.offsetWidth - o.offsetWidth - 5) + "px"
                } else {}
            }
        }
        var n = 0,
            r;
        while (r = t[n++]) r.anim();
        setTimeout(m, 32)
    };
    return {
        init: v
    }
}()