namespace dragonBones.phaser.pipeline {
    export class SkewPipeline extends Phaser.Renderer.WebGL.Pipelines.MultiPipeline {
        private _tempMatrix1: util.TransformMatrix;
        private _tempMatrix2: util.TransformMatrix;
        private _tempMatrix3: util.TransformMatrix;

        constructor(config: any) {
            super(config);
            this._tempMatrix1 = new util.TransformMatrix();
            this._tempMatrix2 = new util.TransformMatrix();
            this._tempMatrix3 = new util.TransformMatrix();
        }

        batchSprite(sprite: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite, camera: Phaser.Cameras.Scene2D.Camera, parentTransformMatrix: Phaser.GameObjects.Components.TransformMatrix): void {
            this.manager.set(this, sprite);

            const camMatrix = this._tempMatrix1;
            const spriteMatrix = this._tempMatrix2;
            const calcMatrix = this._tempMatrix3;

            const frame = sprite.frame;
            const texture = frame.glTexture;

            let u0 = frame.u0;
            let v0 = frame.v0;
            let u1 = frame.u1;
            let v1 = frame.v1;
            let frameX = frame.x;
            let frameY = frame.y;
            let frameWidth = frame.width;
            let frameHeight = frame.height;
            let customPivot = frame.customPivot;

            let displayOriginX = sprite.displayOriginX;
            let displayOriginY = sprite.displayOriginY;

            let x = -sprite.displayOriginX + frameX;
            let y = -sprite.displayOriginY + frameY;

            if (sprite.isCropped) {
                // @ts-ignore
                const crop = sprite["_crop"];

                if (crop.flipX !== sprite.flipX || crop.flipY !== sprite.flipY)
                    frame.updateCropUVs(crop, sprite.flipX, sprite.flipY);

                u0 = crop.u0;
                v0 = crop.v0;
                u1 = crop.u1;
                v1 = crop.v1;

                frameWidth = crop.width;
                frameHeight = crop.height;

                frameX = crop.x;
                frameY = crop.y;

                x = -sprite.displayOriginX + frameX;
                y = -sprite.displayOriginY + frameY;
            }

            let flipX = 1;
            let flipY = 1;

            if (sprite.flipX) {
                if (!customPivot) {
                    x += (-frame.realWidth + (displayOriginX * 2));
                }
                flipX = -1;
                x += frameWidth;
                frameWidth *= -1;
            }

            // Auto-invert the flipY if this is coming from a GLTexture
            // TS note: WebGLTexture is a real standard object, with no fixed fields.
            // I guess TextureManager (?) imprints the flipY property onto it?
            // Anyway, this confuses TS.
            if (sprite.flipY || (frame.source.isGLTexture && (texture as any).flipY)) {
                if (!customPivot) {
                    y += (-frame.realHeight + (displayOriginY * 2));
                }

                flipY = -1;
            }


            // This override exists only for this line: in the original, this call doesn't respect skew; this one should.
            spriteMatrix.applyITRS(sprite.x, sprite.y, sprite.rotation, sprite.scaleX * flipX, sprite.scaleY * flipY, sprite["skewX"] || 0, sprite["skewY"] || 0);

            // TS note: Matrix is a private field -- not protected etc -- so this needs casting to extract.
            camMatrix.copyFrom((camera as any).matrix);

            if (parentTransformMatrix) {
                //  Multiply the camera by the parent matrix
                camMatrix.multiplyWithOffset(parentTransformMatrix, -camera.scrollX * sprite.scrollFactorX, -camera.scrollY * sprite.scrollFactorY);

                //  Undo the camera scroll
                spriteMatrix.e = sprite.x;
                spriteMatrix.f = sprite.y;

            } else {
                spriteMatrix.e -= camera.scrollX * sprite.scrollFactorX;
                spriteMatrix.f -= camera.scrollY * sprite.scrollFactorY;
            }

            //  Multiply by the Sprite matrix, store result in calcMatrix
            camMatrix.multiply(spriteMatrix, calcMatrix);

            const xw = x + frameWidth;
            const yh = y + frameHeight;
            // const roundPixels = camera.roundPixels;


            let tx0 = calcMatrix.getX(x, y);
            let ty0 = calcMatrix.getY(x, y);

            let tx1 = calcMatrix.getX(x, yh);
            let ty1 = calcMatrix.getY(x, yh);

            let tx2 = calcMatrix.getX(xw, yh);
            let ty2 = calcMatrix.getY(xw, yh);

            let tx3 = calcMatrix.getX(xw, y);
            let ty3 = calcMatrix.getY(xw, y);

            let getTint = Phaser.Renderer.WebGL.Utils.getTintAppendFloatAlpha;
            // let cameraAlpha = camera.alpha;

            // TS Note: _alphaTL etc are private on the Alpha component, so TS gets confused about their use here.
            let spriteAlpha = sprite as any;
            const tintTL = getTint(sprite.tintTopLeft, camera.alpha * spriteAlpha._alphaTL);
            const tintTR = getTint(sprite.tintTopRight, camera.alpha * spriteAlpha._alphaTR);
            const tintBL = getTint(sprite.tintBottomLeft, camera.alpha * spriteAlpha._alphaBL);
            const tintBR = getTint(sprite.tintBottomRight, camera.alpha * spriteAlpha._alphaBR);

            if (this.shouldFlush(6)) {
                this.flush();
            }

            var unit = this.setGameObject(sprite, frame);

            this.manager.preBatch(sprite);

            this.batchQuad(sprite, tx0, ty0, tx1, ty1, tx2, ty2, tx3, ty3, u0, v0, u1, v1, tintTL, tintTR, tintBL, tintBR, sprite.tintFill, texture, unit);

            this.manager.postBatch(sprite);
        }
    }
}
