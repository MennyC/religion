/*:
 * @plugindesc ChangeTitleScreenImage
 * @author Sang Hendrix: Idea, debug, the brain. ChatGPT: code, debug
 *
 * @param ImageList
 * @type struct<ImageSwitch>[]
 * @desc List of title screen images with the corresponding switch ID.
 * @default []
 *
 * @help This plugin changes the title screen image based on switches.
 *
 */

/*~struct~ImageSwitch:
 * @param switchId
 * @type switch
 * @desc The switch ID that determines if this image should be used.
 * @default 0
 *
 * @param imageName
 * @type file
 * @dir img/titles1
 * @desc The title screen image file name.
 * @default
 *
 */

(function() {
    const fs = require('fs');
    const path = require('path');
    const pluginName = "ChangeTitleScreenImage";
    const parameters = PluginManager.parameters(pluginName);
    const imageList = JSON.parse(parameters["ImageList"]).map(imageSwitch => JSON.parse(imageSwitch));
    const imageStatusFilePath = path.join(path.dirname(process.mainModule.filename), 'imageStatus.json');

    const defaultImageName = "Default";

    function readImageStatusFile() {
        if (fs.existsSync(imageStatusFilePath)) {
            const content = fs.readFileSync(imageStatusFilePath, 'utf8');
            return JSON.parse(content);
        }
        return null;
    }

    const _Scene_Title_createBackground = Scene_Title.prototype.createBackground;
    Scene_Title.prototype.createBackground = function() {
        const imageStatus = readImageStatusFile();
        const activeImage = imageStatus ? imageList.find(img => imageStatus[img.switchId]) : null;

        if (activeImage) {
            this._backgroundSprite = new Sprite();
            this._backgroundSprite.bitmap = ImageManager.loadTitle1(activeImage.imageName);
            this.addChild(this._backgroundSprite);
        } else {
            _Scene_Title_createBackground.call(this);
        }
    };

    const _Game_Switches_setValue = Game_Switches.prototype.setValue;
    Game_Switches.prototype.setValue = function(switchId, value) {
        _Game_Switches_setValue.call(this, switchId, value);

        const switchImage = imageList.find(img => img.switchId === switchId.toString());
        if (switchImage) {
            let imageStatus = readImageStatusFile() || {};

            if (value) {
                imageList.forEach(img => {
                    if (img.switchId !== switchId.toString()) {
                        imageStatus[img.switchId] = false;
                        _Game_Switches_setValue.call(this, Number(img.switchId), false);
                    }
                });
            }

            imageStatus[switchId] = value;
            fs.writeFileSync(imageStatusFilePath, JSON.stringify(imageStatus));
        }
    };

    const _Scene_Title_adjustBackground = Scene_Title.prototype.adjustBackground;
    Scene_Title.prototype.adjustBackground = function() {
        if (!fs.existsSync(imageStatusFilePath) || (this._backgroundSprite.bitmap && this._backgroundSprite.bitmap.url.endsWith(`${defaultImageName}.png`))) {
            _Scene_Title_adjustBackground.call(this);
        } else {
            this.scaleSprite(this._backgroundSprite);
        }
    };
})();
