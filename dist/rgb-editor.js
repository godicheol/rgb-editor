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
            return cb(null, imageData, {
                width: imageWidth,
                height: imageHeight,
            });
        }
        image.onerror = function() {
            return cb(new Error("Load error"));
        }
        image.src = src;
    }

    exports.copyImageData = function(imageData) {
        var dataArray = new Uint8ClampedArray(imageData.data);
        return new ImageData(
            dataArray,
            imageData.width,
            imageData.height
        );
    }

    exports.edit = function(src, filter, cb) {
        var getImageData = this.getImageData;
        var setFilter = this.setFilter;
        if (typeof(filter) !== "function") {
            filter = function(r,g,b,a) {
                return [r,g,b,a];
            }
        }
        getImageData(src, function(err, imageData) {
            if (err) {
                return cb(err);
            }
            setFilter(imageData, filter);
            return cb(null, imageData);
        });
    }

    exports.setFilter = function(imageData, filter) {
        var i, j, xlen, ylen, imageData, res, idx;
        var r, g, b, a;

        if (typeof(filter) !== "function") {
            filter = function(r,g,b,a,x,y) {
                return [r,g,b,a];
            }
        }

        xlen = imageData.width;
        ylen = imageData.height;
        for (j = 0; j < ylen; j++) {
            for (i = 0; i < xlen; i++) {
                idx = (j*xlen*4)+(i*4);
                r = imageData.data[idx];
                g = imageData.data[idx+1];
                b = imageData.data[idx+2];
                a = imageData.data[idx+3];
                res = filter(r,g,b,a,i,j);
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