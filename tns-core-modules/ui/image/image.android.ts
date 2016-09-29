﻿import imageCommon = require("./image-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import * as enumsModule from "ui/enums";
import style = require("ui/styling/style");
import view = require("ui/core/view");

global.moduleMerge(imageCommon, exports);

var enums: typeof enumsModule;
function ensureEnums() {
    if (!enums) {
        enums = require("ui/enums");
    }
}

function onStretchPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var image = <Image>data.object;
    if (!image.android) {
        return;
    }

    ensureEnums();

    switch (data.newValue) {
        case enums.Stretch.aspectFit:
            image.android.setScaleType(android.widget.ImageView.ScaleType.FIT_CENTER);
            break;
        case enums.Stretch.aspectFill:
            image.android.setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
            break;
        case enums.Stretch.fill:
            image.android.setScaleType(android.widget.ImageView.ScaleType.FIT_XY);
            break;
        case enums.Stretch.none:
        default:
            image.android.setScaleType(android.widget.ImageView.ScaleType.MATRIX);
            break;
    }
}

function onImageSourcePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var image = <Image>data.object;
    if (!image.android) {
        return;
    }

    image._setNativeImage(data.newValue);
}

// register the setNativeValue callback
(<proxy.PropertyMetadata>imageCommon.Image.imageSourceProperty.metadata).onSetNativeValue = onImageSourcePropertyChanged;
(<proxy.PropertyMetadata>imageCommon.Image.stretchProperty.metadata).onSetNativeValue = onStretchPropertyChanged;

export class Image extends imageCommon.Image {
    private _android: org.nativescript.widgets.ImageView;

    get android(): org.nativescript.widgets.ImageView {
        return this._android;
    }

    public _createUI() {
        this._android = new org.nativescript.widgets.ImageView(this._context);
    }

    public _setNativeImage(nativeImage: any) {
        let rotation = (nativeImage && nativeImage.rotationAngle) ? nativeImage.rotationAngle : 0 ;
        if (rotation > 0) {
             this.android.setRotationAngle(rotation);
        }
        this.android.setImageBitmap(nativeImage.android);
    }
}

export class ImageStyler implements style.Styler {
    // tint color
    private static setTintColorProperty(view: view.View, newValue: any) {
        var imageView = <org.nativescript.widgets.ImageView>view._nativeView;
        imageView.setColorFilter(newValue);
    }

    private static resetTintColorProperty(view: view.View, nativeValue: number) {
        var imageView = <org.nativescript.widgets.ImageView>view._nativeView;
        imageView.clearColorFilter();
    }

    public static registerHandlers() {
        style.registerHandler(style.tintColorProperty, new style.StylePropertyChangedHandler(
            ImageStyler.setTintColorProperty,
            ImageStyler.resetTintColorProperty), "Image");
    }
}

ImageStyler.registerHandlers();
