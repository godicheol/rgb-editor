(function() {
    'use strict';

    var exports = {};

    exports.getImageData = function(src, cb) {
        var image = new Image();
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        var imageData, imageWidth, imageHeight;
        image.onload = function() {
            imageWidth = image.width || image.naturalWidth;
            imageHeight = image.height || image.naturalHeight;
            canvas.width = imageWidth;
            canvas.height = imageHeight;
            ctx.drawImage(image, 0, 0);
            imageData = ctx.getImageData(0, 0, imageWidth, imageHeight);
            return cb(null, imageData);
        }
        image.onerror = function() {
            return cb(new Error("Load error"));
        }
        image.src = src;
    }

    exports.get = function(src, cb) {
        var getImageData = this.getImageData;
        var i, j, imageWidth, imageHeight, idx, output = [];
        var r, g, b, a;

        getImageData(src, function(err, imageData) {
            if (err) {
                return cb(err);
            }
            imageWidth = imageData.width;
            imageHeight = imageData.height;
            for (j = 0; j < imageHeight; j++) {
                for (i = 0; i < imageWidth; i += 4) {
                    idx = (j * imageWidth) + i;
                    r = imageData.data[idx];
                    g = imageData.data[idx+1];
                    b = imageData.data[idx+2];
                    a = imageData.data[idx+3];
                    output.push([r,g,b,a]);
                }
            }
            return cb(null, output);
        });
    }

    exports.edit = function(src, filter, cb) {
        var getImageData = this.getImageData;
        var i, j, imageWidth, imageHeight, res, idx;
        var r, g, b, a;

        if (typeof(filter) !== "function") {
            filter = function(r,g,b,a) {
                return [r,g,b,a];
            }
        }

        getImageData(src, function(err, imageData) {
            if (err) {
                return cb(err);
            }
            imageWidth = imageData.width;
            imageHeight = imageData.height;
            for (j = 0; j < imageHeight; j++) {
                for (i = 0; i < imageWidth; i++) {
                    idx = (j*4)*imageWidth+(i*4);
                    r = imageData.data[idx];
                    g = imageData.data[idx+1];
                    b = imageData.data[idx+2];
                    a = imageData.data[idx+3];

                    res = filter(r,g,b,a);

                    imageData.data[idx] = res[0];
                    imageData.data[idx+1] = res[1];
                    imageData.data[idx+2] = res[2];
                    imageData.data[idx+3] = res[3];
                }
            }

            return cb(null, imageData);
        });
    }

    exports.filter = function(data, filter) {
        var i, j, imageWidth, imageHeight, imageData, res, idx;
        var r, g, b, a;

        if (typeof(filter) !== "function") {
            filter = function(r,g,b,a) {
                return [r,g,b,a];
            }
        }

        imageData = new ImageData(
            new Uint8ClampedArray(data.data),
            data.width,
            data.height
        );
        
        imageWidth = imageData.width;
        imageHeight = imageData.height;
        for (j = 0; j < imageHeight; j++) {
            for (i = 0; i < imageWidth; i++) {
                idx = (j*4)*imageWidth+(i*4);
                r = imageData.data[idx];
                g = imageData.data[idx+1];
                b = imageData.data[idx+2];
                a = imageData.data[idx+3];
                res = filter(r,g,b,a);
                imageData.data[idx] = res[0];
                imageData.data[idx+1] = res[1];
                imageData.data[idx+2] = res[2];
                imageData.data[idx+3] = res[3];
            }
        }

        return imageData;
    }

    if (typeof(window.rgbEditor) === "undefined") {
        window.rgbEditor = exports;
    }
})();