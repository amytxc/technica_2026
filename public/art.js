/* Clawcean art: no emoji anywhere in the UI.
   - UI icons: Pixelarticons (MIT, github.com/halfmage/pixelarticons) and Pixel Icon Library by HackerNoon
     (CC BY 4.0, pixeliconlibrary.com), downloaded through the Iconify API and stored here so the game works offline.
   - Sprites: 16×16 pixel art made for Clawcean, in the Sweetie 16 palette by GrafxKid.
     Each row is run-length encoded ("3.8r3." = 3 empty, 8 red, 3 empty) on a 14×14 grid; a dark outline is added automatically. */
"use strict";
const PALETTE = { k: "#1a1c2c", p: "#5d275d", r: "#b13e53", o: "#ef7d57", y: "#ffcd75", l: "#a7f070", g: "#38b764", t: "#257179", n: "#29366f", b: "#3b5dc9", s: "#41a6f6", c: "#73eff7", w: "#f4f4f4", e: "#94b0c2", d: "#566c86", a: "#333c57", m: "#f29fcf", z: "#8b5a3c" };

// name: [width, height, svg body]. Bodies use currentColor, so icons take the text color around them.
const ICONS = {
  "anchor": [24, 24, "<g fill=\"currentColor\"><path d=\"M10 2h4v2h-4zm0 6h4v2h-4zM8 4h2v4H8zm6 0h2v4h-2z\"/><path d=\"M11 9h2v12h-2z\"/><path d=\"M5 20h14v2H5zm-2-8h2v8H3zm16 0h2v8h-2zM5 12h2v2H5zm12 0h2v2h-2z\"/></g>"],
  "bolt": [24, 24, "<path fill=\"currentColor\" d=\"M21 10v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1H9v1H8v-2h1v-3h1v-4H3v-1h1v-1h1v-1h1v-1h1V9h1V8h1V7h1V6h1V5h1V4h1V3h1V2h1V1h1v2h-1v3h-1v4z\"/>"],
  "book-open": [24, 24, "<path fill=\"currentColor\" d=\"M2 3h9v2H2zM0 19h11v2H0zM13 3h9v2h-9zm0 16h11v2H13zM11 5h2v18h-2zM0 5h2v14H0zm22 0h2v14h-2zm-7 2h5v2h-5zm0 4h5v2h-5zm0 4h2v2h-2z\"/>"],
  "camera": [24, 24, "<path fill=\"currentColor\" d=\"M4 5h4v2H4zm4-2h8v2H8zm8 2h4v2h-4zM2 7h2v12H2zm2 12h16v2H4zM20 7h2v12h-2zM10 8h4v2h-4zm0 6h4v2h-4zm-2-4h2v4H8zm6 0h2v4h-2z\"/>"],
  "car": [24, 24, "<path fill=\"currentColor\" d=\"M4 13h6v2H4zm10 0h6v2h-6zM4 17h6v2H4zm10 0h6v2h-6zM2 15h4v2H2zm6 0h8v2H8zm10 0h4v2h-4zm4-4h2v4h-2zm-6-4h2v2h-2zM4 5h12v2H4zm-4 6h2v4H0zm12-2h10v2H12zM2 7h2v4H2zm8 0h2v2h-2z\"/>"],
  "check": [24, 24, "<path fill=\"currentColor\" d=\"M10 18H8v-2h2zm-2-2H6v-2h2zm4-2v2h-2v-2zm-6 0H4v-2h2zm8 0h-2v-2h2zm2-2h-2v-2h2zm2-2h-2V8h2zm2-2h-2V6h2z\"/>"],
  "chevron-left": [24, 24, "<path fill=\"currentColor\" d=\"M8 13v-2h2v2zm2-2V9h2v2zm0 4v-2h2v2zm2-6V7h2v2zm0 8v-2h2v2zm2-10V5h2v2zm0 12v-2h2v2z\"/>"],
  "chevron-right": [24, 24, "<path fill=\"currentColor\" d=\"M16 13v-2h-2v2zm-2-2V9h-2v2zm0 4v-2h-2v2zm-2-6V7h-2v2zm0 8v-2h-2v2zM10 7V5H8v2zm0 12v-2H8v2z\"/>"],
  "circle-question": [24, 24, "<path fill=\"currentColor\" d=\"M18 22H6v-2h12zM6 20H4v-2h2zm14 0h-2v-2h2zM4 18H2V6h2zm9 0h-2v-2h2zm9 0h-2V6h2zm-7-5h-2v2h-2v-4h4zm2-2h-2V8h2zm-8-1H7V8h2zm6-2H9V6h6zM6 6H4V4h2zm14 0h-2V4h2zm-2-2H6V2h12z\"/>"],
  "clock": [24, 24, "<path fill=\"currentColor\" d=\"M6 2h12v2H6zM2 6h2v12H2zm18 0h2v12h-2zm-2-2h2v2h-2zM4 4h2v2H4zm2 18h12v-2H6zm12-2h2v-2h-2zM4 20h2v-2H4zm7-14h2v7h-2zm2 7h2v2h-2zm2 2h2v2h-2z\"/>"],
  "close": [24, 24, "<path fill=\"currentColor\" d=\"M7 19H5v-2h2zm12 0h-2v-2h2zM9 15v2H7v-2zm8 2h-2v-2h2zm-6-2H9v-2h2zm4 0h-2v-2h2zm-2-2h-2v-2h2zm-2-2H9V9h2zm4 0h-2V9h2zM9 9H7V7h2zm8 0h-2V7h2zM7 7H5V5h2zm12 0h-2V5h2z\"/>"],
  "compass": [24, 24, "<path fill=\"currentColor\" d=\"M18 22H6v-2h12zM6 20H4v-2h2zm14 0h-2v-2h2zm-10-4h2v2h-2v1H8v-9h2zm-6 2H2V6h2zm18 0h-2V6h2zm-8-2h-2v-2h2zm2-2h-2V8h-2V6h2V5h2zm-3-1h-2v-2h2zm-1-3h-2V8h2zM6 6H4V4h2zm14 0h-2V4h2zm-2-2H6V2h12z\"/>"],
  "eye": [24, 24, "<path fill=\"currentColor\" d=\"M16 20H8v-2h8zm-8-2H4v-2h4zm12 0h-4v-2h4zM4 16H2v-2h2zm10-6h-2v2h2zh2v4h-2v2h-4v-2H8v-4h2V8h4zm8 6h-2v-2h2zM2 14H0v-4h2zm22 0h-2v-4h2zM4 10H2V8h2zm18 0h-2V8h2zM8 8H4V6h4zm12 0h-4V6h4zm-4-2H8V4h8z\"/>"],
  "finish": [24, 24, "<path fill=\"currentColor\" d=\"M22 4v12h-1v1h-2v1h-6v-1H6v-1h6v-4H6v1H5v4h1v1H5v4H3V5H2V3h1V2h2v1h1v2H5v1h1V5h7v1h6v1h-5v4h5v-1h2V6h-2V5h2V4z\"/>"],
  "fire": [24, 24, "<g fill=\"currentColor\"><path d=\"M9 2h2v4H9zM7 6h2v2H7zM5 8h2v2H5zm8 2h2v2h-2zm2-2h2v2h-2zm2 2h2v2h-2zm2 2h2v6h-2zM3 10h2v8H3zm8-4h2v4h-2zm6 12h2v2h-2zM7 20h10v2H7zm-2-2h2v2H5zm4-2h6v4H9z\"/><path d=\"M11 14h2v3h-2z\"/></g>"],
  "handshake": [24, 24, "<path fill=\"currentColor\" d=\"M6 12h1v1h5v-1h2v1h1v1h1v1h1v1h1v3h-1v-1h-1v-1h-1v-1h-1v-1h-1v1h1v1h1v1h1v1h1v1h-1v1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v1h1v1h1v1h1v1h1v1h-3v-1h-1v-1H9v-1H8v1h1v1h1v1H7v-1H6v-1H5v-1H4v-1H3v-1H2v-1H1V4h1v1h2v1h2V5h3v2H8v1H7v1H6z\"/><path fill=\"currentColor\" d=\"M23 4v11h-1v1h-1v1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-2v1h-1v1H7v-2h1V9h1V8h1V7h1V6h1V5h5v1h3V5h2V4z\"/>"],
  "heart": [24, 24, "<path fill=\"currentColor\" d=\"M13 22h-2v-2h2zm-2-2H9v-2h2zm4 0h-2v-2h2zm-6-2H7v-2h2zm8 0h-2v-2h2zM7 16H5v-2h2zm12 0h-2v-2h2zM5 14H3v-2h2zm16 0h-2v-2h2zM3 12H1V6h2zm20 0h-2V6h2zM13 8h-2V6h2zM5 6H3V4h2zm6 0H9V4h2zm4 0h-2V4h2zm6 0h-2V4h2zM9 4H5V2h4zm10 0h-4V2h4z\"/>"],
  "heart-full": [24, 24, "<path fill=\"currentColor\" d=\"M23 6v5h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-2v-1h-1v-1H9v-1H8v-1H7v-1H6v-1H5v-1H4v-1H3v-1H2v-1H1V6h1V5h1V4h1V3h6v1h1v1h2V4h1V3h6v1h1v1h1v1z\"/>"],
  "hourglass": [24, 24, "<path fill=\"currentColor\" d=\"M16 22H8v-2h8zm-8-2H6v-4h2zm10 0h-2v-4h2zm-8-4H8v-2h2zm6 0h-2v-2h2zm-6-6h4v4h-4zm0 0H8V8h2zm6 0h-2V8h2zM8 8H6V4h2zm10 0h-2V4h2zm-2-4H8V2h8z\"/>"],
  "label": [24, 24, "<path fill=\"currentColor\" d=\"M16 22h-4v-2h4zm-4-2h-2v-2h2zm6 0h-2v-2h2zm-8-2H8v-2h2zm10 0h-2v-2h2zM8 16H6v-2h2zm14 0h-2v-4h2zM6 14H4v-2h2zm-2-2H2V4h2zm16 0h-2v-2h2zm-2-2h-2V8h2zM8 8H6V6h2zm8 0h-2V6h2zm-2-2h-2V4h2zm-2-2H4V2h8z\"/>"],
  "lightbulb": [24, 24, "<path fill=\"currentColor\" d=\"M9 4h6v2H9zM7 6h2v2H7zm8 0h2v2h-2zm4-2h2v2h-2zm2-2h2v2h-2zM0 10h3v2H0zm21 0h3v2h-3zM3 4h2v2H3zM1 2h2v2H1zm6 12h2v2H7zm8 0h2v2h-2zM5 8h2v6H5zm12 0h2v6h-2zm-8 8h6v2H9zm0 4h6v2H9zm0-2h2v2H9zm4 0h2v2h-2zM11 0h2v3h-2z\"/>"],
  "map-pin": [24, 24, "<path fill=\"currentColor\" d=\"M7 2h10v2H7zM5 4h2v2H5zm14 0h-2v2h2zM7 17h2v2H7zm2 2h2v2H9zm6-2h2v2h-2zm-2 2h2v2h-2zm-2 2h2v2h-2zm-6-7h2v3H5zm12 0h2v3h-2zM3 6h2v8H3zm18 0h-2v8h2zM10 6h4v2h-4zM8 8h2v4H8zm2 4h4v2h-4zm4-4h2v4h-2z\"/>"],
  "message": [24, 24, "<path fill=\"currentColor\" d=\"M20 2H4v2h16zm0 14H6v2h14zm2-12h-2v12h2zM4 4H2v18h2zm2 14H4v2h2z\"/>"],
  "moon": [24, 24, "<path fill=\"currentColor\" d=\"M18 22H8v-2h10zM8 20H6v-2h2zm12 0h-2v-2h2zM6 18H4v-2h2zm16 0h-2v-4h-2v-2h2v-2h2zM4 16H2V6h2zm14 0h-6v-2h6zm-6-2h-2v-2h2zm-2-2H8V6h2zM6 6H4V4h2zm8-2h-2v2h-2V4H6V2h8z\"/>"],
  "paint": [24, 24, "<path fill=\"currentColor\" d=\"M20 2v10H3V2h1V1h3v3h2V1h2v5h2V1h6v1zM3 14v2h1v1h5v4h1v1h1v1h2v-1h1v-1h1v-4h4v-1h1v-2Zm8 7v-2h2v2Z\"/>"],
  "menu": [24, 24, "<path fill=\"currentColor\" d=\"M4 5h16v3H4zm0 5h16v3H4zm0 5h16v3H4z\"/>"],
  "pause": [24, 24, "<path fill=\"currentColor\" d=\"M10 20H4V4h6zm8-16v16h-6V4zm-4 2v12h2V6zM6 18h2V6H6z\"/>"],
  "play": [24, 24, "<path fill=\"currentColor\" d=\"M15 11h-2V9h2zm0 4h-2v-2h2zm-2 2h-2v-2h2zm0-8h-2V7h2zm-2-2H9V5h2zM9 21H7V3h2zm6-8h2v-2h-2zm-6 4h2v2H9z\"/>"],
  "recycle": [24, 24, "<g fill=\"currentColor\"><path d=\"M10 17h2v2h-2zm2-2h2v6h-2zm2-2h2v10h-2zm2 4h4v2h-4zm4-3h2v3h-2zm-2-2h2v2h-2zM4 8h6v2H4zm4 2h2v4H8zm-2 0h2v2H6zm-2 2h2v2H4zm-2 2h2v3H2zm2 3h4v2H4zm9-9h6v2h-6z\"/><path d=\"M17 4h2v6h-2zm-2 2h2v2h-2zm-2-3h2v3h-2zM8 3h2v3H8zm2-2h3v2h-3z\"/></g>"],
  "reload": [24, 24, "<g fill=\"currentColor\"><path d=\"M16 4h2v6h-2zm-2-2h2v2h-2zm0 2h2v8h-2zM4 8H2v5h2z\"/><path d=\"M4 6h16v2H4zm4 14H6v-6h2zm2 2H8v-2h2zm0-2H8v-8h2zm10-4h2v-5h-2z\"/><path d=\"M20 18H4v-2h16z\"/></g>"],
  "repeat": [24, 24, "<g fill=\"currentColor\"><path d=\"M17 5h2v2h-2zM5 17h2v2H5zm6-14h2v6h-2zM9 1h2v8H9zm0 8h2v2H9zm10 8H9v2h10zM5 7H3v10h2z\"/><path d=\"M13 15h-2v6h2zm2-2h-2v8h2zm0 8h-2v2h2zM5 5h10v2H5zm14 12h2V7h-2z\"/></g>"],
  "robot-face-happy": [24, 24, "<g fill=\"currentColor\"><path d=\"M4 6h16v2H4zm0 14h16v2H4zM2 8h2v12H2zm18 0h2v12h-2z\"/><path d=\"M11 4h2v4h-2zm-3 6h2v2H8zm6 0h2v2h-2zm-1-8h4v2h-4zM0 12h2v2H0zm22 0h2v2h-2zM7 14h10v2H7zm2 2h6v2H9z\"/></g>"],
  "search": [24, 24, "<path fill=\"currentColor\" d=\"M22 22h-2v-2h2zm-2-2h-2v-2h2zm-6-2H6v-2h8zm4 0h-2v-2h2zM6 16H4v-2h2zm10 0h-2v-2h2zM4 14H2V6h2zm14 0h-2V6h2zM6 6H4V4h2zm10 0h-2V4h2zm-2-2H6V2h8z\"/>"],
  "settings-cog": [24, 24, "<path fill=\"currentColor\" d=\"M4 20h3v-2h4v4h2v-4h4v2h-2v4H9v-4H7v2H2v-5h2zm18 2h-5v-2h3v-3h2zM6 11H2v2h4v4H4v-2H0V9h4V7h2zm14-2h4v6h-4v2h-2v-4h4v-2h-4V7h2zm-6 7h-4v-2h4zm-4-2H8v-4h2zm6 0h-2v-4h2zm-2-4h-4V8h4zM7 4H4v3H2V2h5zm8 0h2V2h5v5h-2V4h-3v2h-4V2h-2v4H7V4h2V0h6z\"/>"],
  "shirt": [24, 24, "<g fill=\"currentColor\"><path d=\"M4 3h6v2H4zM2 3h2v8H2zm2 6h4v2H4z\"/><path d=\"M6 9h2v10H6zm2 10h8v2H8zm8-10h2v10h-2z\"/><path d=\"M16 9h4v2h-4zm4-6h2v8h-2zm-6 0h6v2h-6zm-4 2h4v2h-4z\"/></g>"],
  "snowflake": [24, 24, "<path fill=\"currentColor\" d=\"M13 24h-2v-2h2zm-2-2H9v-2H7v2H2v-5h2v3h3v-2h2v-2h2zm4-4h2v2h-2v2h-2v-6h2zm7 4h-5v-2h3v-3h2zM4 15H2v-2h6v2H6v2H4zm18 0h-2v2h-2v-2h-2v-2h6zM2 13H0v-2h2zm22 0h-2v-2h2zM6 9h2v2H2V9h2V7h2zm14 0h2v2h-6V9h2V7h2zm-9-1H9V6H7V4h2V2h2zm4-4h2V2h5v5h-2V4h-3v2h-2v2h-2V2h2zM7 4H4v3H2V2h5zm6-2h-2V0h2z\"/>"],
  "sparkles": [24, 24, "<g fill=\"currentColor\"><path d=\"M11 1h2v4h-2zm0 22h2v-4h-2zM9 5h2v4H9zm0 14h2v-4H9zm4-14h2v4h-2zm0 14h2v-4h-2zM5 9h4v2H5zm14 0h-4v2h4zM1 11h4v2H1zm22 0h-4v2h4zM5 13h4v2H5zm14 0h-4v2h4zm0-12h2v6h-2z\"/><path d=\"M17 3h6v2h-6zM3 17h2v2H3zm-2 2h2v2H1zm2 2h2v2H3zm2-2h2v2H5z\"/></g>"],
  "star-full": [24, 24, "<path fill=\"currentColor\" d=\"M23 8v2h-1v1h-1v1h-1v1h-1v1h-1v5h1v4h-2v-1h-2v-1h-2v-1h-2v1H9v1H7v1H5v-4h1v-5H5v-1H4v-1H3v-1H2v-1H1V8h7V6h1V4h1V2h1V1h2v1h1v2h1v2h1v2z\"/>"],
  "stop-solid": [24, 24, "<path fill=\"currentColor\" d=\"M20 20H4V4h16zm-10-6h4v-4h-4z\"/>"],
  "store": [24, 24, "<path fill=\"currentColor\" d=\"M3 13h2v8H3zm2 8h14v2H5zm14-8h2v8h-2zm-9-2h4v2h-4zm4-2h4v2h-4zm4 2h4v2h-4zM6 9h4v2H6zm-4 2h4v2H2zM0 7h2v4H0zm2-2h2v2H2zm18 0h2v2h-2zm2 2h2v4h-2zM4 3h16v2H4zm6 12h4v2h-4zm-2 2h2v4H8zm6 0h2v4h-2z\"/>"],
  "sun": [24, 24, "<path fill=\"currentColor\" d=\"M13 22h-2v-3h2zm-6-3H5v-2h2zm12 0h-2v-2h2zm-4-2H9v-2h6zm-6-2H7V9h2zm8 0h-2V9h2zM5 13H2v-2h3zm17 0h-3v-2h3zm-7-4H9V7h6zM7 7H5V5h2zm12 0h-2V5h2zm-6-2h-2V2h2z\"/>"],
  "tea": [24, 24, "<path fill=\"currentColor\" d=\"M4 6h16v2H4zm0 2h2v10H4zm2 10h10v2H6zM20 8h2v4h-2zm-2 4h2v2h-2zm-2-4h2v10h-2zM7 2h2v2H7zm6 0h2v2h-2zM9 0h2v2H9zm6 0h2v2h-2zm-5 8h2v4h-2zm-2 4h6v4H8z\"/>"],
  "trash": [24, 24, "<path fill=\"currentColor\" d=\"M18 22H6v-2h12zM9 6h6V4h2v2h5v2h-2v12h-2V8H6v12H4V8H2V6h5V4h2zm6-2H9V2h6z\"/>"],
  "trophy": [24, 24, "<path fill=\"currentColor\" d=\"M16 17h-3v2h2v2H9v-2h2v-2H8v-2h8zm2-12h4v6h-2V7h-2v4h2v2h-2v2h-2V5H8v10H6v-2H4v-2h2V7H4v4H2V5h4V3h12z\"/>"],
  "volume-2": [24, 24, "<path fill=\"currentColor\" d=\"M13 22h-2v-2H9v-2h2V6H9V4h2V2h2zm-4-4H7v-2h2zm10 0h-4v-2h4zM7 10H5v4h2v2H3V8h4zm14 6h-2V8h2zm-4-2h-2v-4h2zM9 8H7V6h2zm10 0h-4V6h4z\"/>"],
  "warning-diamond": [24, 24, "<path fill=\"currentColor\" d=\"M2 10h2v2H2zm0 4h2v-2H2zm20-4h-2v2h2zm0 4h-2v-2h2zM4 8h2v2H4zm0 8h2v-2H4zm16-8h-2v2h2zm0 8h-2v-2h2zM6 6h2v2H6zm0 12h2v-2H6zM18 6h-2v2h2zm0 12h-2v-2h2zM8 4h2v2H8zm0 16h2v-2H8zm8-16h-2v2h2zm0 16h-2v-2h2zM10 2h2v2h-2zm0 20h2v-2h-2zm4-20h-2v2h2zm0 20h-2v-2h2zm-3-5h2v-2h-2zm0-4h2V7h-2z\"/>"],
  "waves": [24, 24, "<path fill=\"currentColor\" d=\"M2 18h4v-2H2zm0-6h4v-2H2zm0-6h4V4H2zm4 14h4v-2H6zm0-6h4v-2H6zm0-6h4V6H6zm4 10h4v-2h-4zm0-6h4v-2h-4zm0-6h4V4h-4zm4 14h4v-2h-4zm0-6h4v-2h-4zm0-6h4V6h-4zm4 10h4v-2h-4zm0-6h4v-2h-4zm0-6h4V4h-4z\"/>"],
  "zap": [24, 24, "<path fill=\"currentColor\" d=\"M4 13h8v6h2v2h-2v2h-2v-8H2v-4h2zm12 6h-2v-2h2zm2-2h-2v-2h2zm2-2h-2v-2h2zm-6-6h8v4h-2v-2h-8V5h-2V3h2V1h2zm-8 2H4V9h2zm2-2H6V7h2zm2-2H8V5h2z\"/>"]
};

const SPRITES = {
  crab: ["1.2r8.2r1.", "3r8.3r", "1r1.1r1.2w2.2w1.1r1.1r", "3r1.1w1k2.1k1w1.3r", "1.2r2.1r2.1r2.2r1.", "2.2r1.1r2.1r1.2r2.", "3.8r3.", "2.10r2.", "1.2r1o6r1o2r1.", "1.12r1.", "2.10r2.", "1.1r1.1r1.1r2.1r1.1r1.1r1.", "1r2.1r6.1r2.1r", "14."],
  jelly: ["4.6m4.", "2.10m2.", "1.2m2w8m1.", "1.1m1w10m1.", "1.12m1.", "1.3m1k4m1k3m1.", "1.5m2k5m1.", "1.12p1.", "2.1p2.1p2.1p2.1p2.", "3.1p2.1p2.1p2.1p1.", "2.1p2.1p2.1p2.1p2.", "3.1p2.1p2.1p2.1p1.", "2.1p5.1p5.", "14."],
  turtle: ["14.", "14.", "14.", "3.5g6.", "2.2g1t2g1t1g2.3l", "1.1g1t2g1t2g1t1g2l1k1l", "1.9g1y3l", "1.10y3.", "2.2l4.2l4.", "2.2l4.2l4.", "14.", "14.", "14.", "14."],
  dolphin: ["14.", "6.2b6.", "2b3.3b6.", "1.1b2.7b3.", "1.12b1.", "2.7b1w1k2b1.", "2.7b2k2b1.", "2.8c1m3b", "3.7c1k2c1.", "4.7c3.", "5.2b7.", "14.", "14.", "14."],
  coral: ["1m1w1m2.1m1w2m2.1m1w1m", "3m2.4m2.3m", "1.1o4.2o4.1o1.", "1.1o4.2o4.1o1.", "1.2o3.2o3.2o1.", "2.10o2.", "1.1o1y10o1.", "1.3o1w1k2o1w1k3o1.", "1.1o1m3o2k3o1m1o1.", "1.12o1.", "2.10o2.", "3.8o3.", "14.", "14."],
  scrub: ["14.", "3.8e3.", "3.8b3.", "3.1b6w1b3.", "3.1b1w1m1w1c1y1w1b3.", "3.1b1w1c1y1w1m1w1b3.", "3.1b1y1w1m1c1w1w1b3.", "3.1b6w1b3.", "3.8b3.", "4.6b4.", "5.4b5.", "5.4y5.", "5.4y5.", "14."],
  glitter: ["1.1y10.1y1.", "3.8p3.", "3.8p3.", "2.10w2.", "2.1w1y1w1m1w1c1w1y1w1m2.", "2.1c1w1m1w1y1w1c1w1m1w2.", "2.1w1m1w1y1w1c1w1m1w1y2.", "2.1y1w1c1w1m1w1y1w1c1w2.", "2.1w1c1w1m1w1y1w1c1w1m2.", "2.10w2.", "14.", "1y12.1y", "14.", "14."],
  toothpaste: ["14.", "14.", "14.", "14.", "1.1w1c1w1m1w8.", "1.1m1w1c1w1w8.", "1.5e8.", "1.5e8.", "1.13s", "2.12s", "14.", "14.", "14.", "14."],
  lipstick: ["6.2r6.", "5.3r6.", "5.4r5.", "5.4r5.", "4.6e4.", "4.6e4.", "4.6p4.", "4.1p1m4p4.", "4.1p1m4p4.", "4.1p1m4p4.", "4.6p4.", "4.6p4.", "14.", "14."],
  fleece: ["14.", "4.2y2.2y4.", "2.5o1k4o2.", "1.6o1k5o1.", "2o1.4o1k3o1.2o", "2o1.4o1k3o1.2o", "2o1.4o1k3o1.2o", "2o1.4o1k3o1.2o", "2o1.4o1k3o1.2o", "2y1.4o1k3o1.2y", "3.4o1k3o3.", "14.", "14.", "14."],
  scarf: ["14.", "3.8r3.", "2.2r6.2r2.", "2.2w6.2w2.", "2.2r6.2r2.", "2.10w2.", "2.10r2.", "4.2r2.2r4.", "4.2w2.2w4.", "4.2r2.2r4.", "4.1y1.1y1.2w4.", "8.2r4.", "8.1y1.1y3.", "14."],
  tanktop: ["14.", "3.2s4.2s3.", "3.2s4.2s3.", "2.3s4.3s2.", "2.4s2.4s2.", "2.10s2.", "2.10b2.", "2.10s2.", "2.10s2.", "2.10b2.", "2.10s2.", "2.10s2.", "14.", "14."],
  sock: ["14.", "3.4w7.", "3.4m7.", "3.4w7.", "3.4m7.", "3.4m7.", "3.4m7.", "3.5m6.", "3.7m4.", "3.1w8m2.", "3.6m3w2.", "4.5m3w2.", "14.", "14."],
  cup: ["9.1r4.", "8.1r5.", "7.1r6.", "3.8e3.", "2.10e2.", "3.8w3.", "3.8r3.", "3.8w3.", "3.8w3.", "4.6r4.", "4.6w4.", "4.6w4.", "5.4w5.", "14."],
  bag: ["14.", "4.6e4.", "3.1e6.1e3.", "3.1e6.1e3.", "2.10w2.", "1.12w1.", "1.12w1.", "1.4w4b4w1.", "1.4w1b2w1b4w1.", "1.4w4b4w1.", "1.12w1.", "1.12w1.", "2.10w2.", "14."],
  foam: ["14.", "14.", "14.", "2.10w2.", "1.2w1e6w1e2w1.", "1.12w1.", "14e", "1.12w1.", "1.12w1.", "2.10w2.", "14.", "2.1w3.1w2.1w4.", "5.1w8.", "14."],
  cutlery: ["3.1w1.1w1.1w2.2w2.", "3.1w1.1w1.1w2.2w2.", "3.1w1.1w1.1w2.2w2.", "3.5w2.2w2.", "4.3w3.2w2.", "5.1w4.2w2.", "5.1w4.2w2.", "5.1w5.1w2.", "4.2w4.2w2.", "4.2w4.2w2.", "4.2w4.2w2.", "4.2w4.2w2.", "4.2w4.2w2.", "14."],
  butt: ["14.", "14.", "2.1e11.", "1.1e12.", "2.1e11.", "1.1d5w6o1.", "1.1a5w1o1y2o1y1o1.", "1.1d5w6o1.", "14.", "14.", "14.", "14.", "14.", "14."],
  wipes: ["14.", "14.", "5.4w5.", "1.12c1.", "1.2c8b2c1.", "1.2c8b2c1.", "1.12c1.", "1.12c1.", "1.5c2w5c1.", "1.12c1.", "1.12c1.", "2.10c2.", "14.", "14."],
  mask: ["14.", "14.", "14.", "14.", "1.1w1.8s1.1w1.", "1w2.8s2.1w", "1w2.8c2.1w", "1w2.8s2.1w", "1.1w1.8c1.1w1.", "3.8s3.", "14.", "14.", "14.", "14."],
  teabag: ["7.1e6.", "7.1e1.4y1.", "7.1e1.4y1.", "7.1e6.", "6.2e6.", "5.1e2g1e5.", "4.1e1g2z1g1e4.", "3.1e1g1z2g1z1e4.", "2.1e2z1g2z1g1z1e3.", "2.10e2.", "14.", "14.", "14.", "14."],
  tire: ["14.", "14.", "4.1a1d1a1d1a1d4.", "2.10a2.", "1.12a1.", "1.3a6e3a1.", "4a1e4d1e4a", "4a1e1d2w1d1e4a", "4a1e4d1e4a", "1.3a6e3a1.", "1.12a1.", "2.10a2.", "4.1a1d1a1d1a1d4.", "14."],
  paint: ["4.6d4.", "3.1d6.1d3.", "2.10e2.", "2.10b2.", "2.2b1e2b1e1b1e2b2.", "2.2b2e1b5e2.", "2.1b9e2.", "2.10e2.", "2.3e4w3e2.", "2.3e4w3e2.", "2.10e2.", "2.10d2.", "14.", "14."],
  hook: ["8.3e3.", "2.3c3.1e1.1e3.", "1.1c3.1c2.3e3.", "1.1c3.1c3.1e4.", "2.3c4.1e4.", "9.1e4.", "9.1e4.", "5.1e3.1e4.", "5.1e3.1e4.", "5.1e3.1e4.", "6.3e5.", "14.", "14.", "14."],
  balloon: ["4.6e4.", "2.10e2.", "1.2e2w8e1.", "1.1e2w9e1.", "1.12e1.", "1.12e1.", "2.10e2.", "3.8e3.", "5.4e5.", "6.2e6.", "6.1m7.", "7.1m6.", "6.1m7.", "7.1m6."],
  bottle: ["5.4d5.", "6.2d6.", "5.4e5.", "4.6e4.", "3.8m3.", "3.8m3.", "3.1m6w1m3.", "3.1m1w4c1w1m3.", "3.1m6w1m3.", "3.1m1w4c1w1m3.", "3.1m6w1m3.", "3.8m3.", "4.6m4.", "14."]
};

/* Inline SVG icon. Decorative by default; pass a label when the icon is the only content of a control. */
function icon(name, cls = "", label = "") {
  const ic = ICONS[name]; if (!ic) return "";
  const a11y = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"';
  return `<svg class="ic ${cls}" viewBox="0 0 ${ic[0]} ${ic[1]}" ${a11y} focusable="false">${ic[2]}</svg>`;
}

const spriteCache = {};
function spriteCanvas(name) {
  if (spriteCache[name]) return spriteCache[name];
  const rows = SPRITES[name] || [];
  const grid = Array.from({ length: 16 }, () => Array(16).fill("."));
  rows.forEach((row, y) => {
    let x = 0;
    for (const [, n, ch] of row.matchAll(/(\d*)(\D)/g)) for (let i = 0; i < (+n || 1); i++, x++) if (x < 14 && ch !== ".") grid[y + 1][x + 1] = ch;
  });
  const filled = (x, y) => grid[y] && grid[y][x] && grid[y][x] !== "." && grid[y][x] !== "k";
  const cv = document.createElement("canvas"); cv.width = cv.height = 16;
  const cx = cv.getContext("2d");
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    let ch = grid[y][x];
    if (ch === "." && (filled(x + 1, y) || filled(x - 1, y) || filled(x, y + 1) || filled(x, y - 1))) ch = "k";
    if (ch !== ".") { cx.fillStyle = PALETTE[ch]; cx.fillRect(x, y, 1, 1); }
  }
  return (spriteCache[name] = cv);
}
const spriteUrls = {};
function spriteURL(name) { return spriteUrls[name] || (spriteUrls[name] = spriteCanvas(name).toDataURL()); }
function sprite(name, cls = "", alt = "") {
  return `<img class="spr ${cls}" src="${spriteURL(name)}" alt="${alt}"${alt ? "" : ' aria-hidden="true"'} draggable="false">`;
}
/* "s:crab" → sprite, "i:trash" → icon */
function art(ref, cls = "") { const [kind, name] = ref.split(":"); return kind === "s" ? sprite(name, cls) : icon(name, cls); }
