namespace dragonBones.phaser.util {
    /**
     * Methods for handling "skew" or "shear", used in deformation.
     *
     * Necessary because default phaser pipeline doesn't respect it; they explicitly reconstruct transformation matrices.
     * This is worrisome; 
     */
    export const Skew = {
        getSkewX(): number {
            return this._skewX || 0;
        },
        setSkewX(v: number) {
            this._skewX = v;
        },
        getSkewY(): number {
            return this._skewY || 0;
        },
        setSkewY(v: number) {
            this._skewY = v;
        },
        setSkew(sx: number, sy?: number): void {
            sy = sy === void 0 ? sx : sy;
            this._skewX = sx;
            this._skewY = sy;
        },
        getLocalTransformMatrix(tempMatrix) {
            if (tempMatrix === undefined) { tempMatrix = new TransformMatrix(); }
            // THIS IS THE PURPOSE OF THE OVERRIDE: applyITRSC vs applyITRS.
            return TransformMatrix.applyITRSC(tempMatrix, this.x, this.y, this._rotation, this._scaleX, this._scaleY, this.skewX, this.skewY);
        },
        getWorldTransformMatrix(tempMatrix, parentMatrix) {
            if (tempMatrix === undefined) { tempMatrix = new TransformMatrix(); }
            if (parentMatrix === undefined) { parentMatrix = new TransformMatrix(); }
            var parent = this.parentContainer;

            if (!parent)
            {
                return this.getLocalTransformMatrix(tempMatrix);
            }

            // THIS IS THE PURPOSE OF THE OVERRIDE: applyITRSC vs applyITRS & using getLocalTransformMatrix to dodge incompatibilities between those two methods (since we don't know if our parents are smart enough to know how to skew).
            tempMatrix = this.getLocalTransformMatrix(tempMatrix);
            while (parent)
            {
                parentMatrix = parent.getLocalTransformMatrix(parentMatrix);
                parentMatrix.multiply(tempMatrix, tempMatrix);

                parent = parent.parentContainer;
            }

            return tempMatrix;
        },
    };

    export const extendSkew = function(clazz: any): void {
        Object.defineProperty(clazz.prototype, "skewX", {
            get: Skew.getSkewX,
            set: Skew.setSkewX,
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(clazz.prototype, "skewY", {
            get: Skew.getSkewY,
            set: Skew.setSkewY,
            enumerable: true,
            configurable: true
        });
        clazz.prototype.setSkew = Skew.setSkew;
        clazz.prototype.getLocalTransformMatrix = Skew.getLocalTransformMatrix;
        clazz.prototype.getWorldTransformMatrix = Skew.getWorldTransformMatrix;
    }
}
