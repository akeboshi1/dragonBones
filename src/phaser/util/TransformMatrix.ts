namespace dragonBones.phaser.util {
    export class TransformMatrix extends Phaser.GameObjects.Components.TransformMatrix {
        decomposedMatrix: any;  // Override the `object` from phaser.

        constructor(a?: number, b?: number, c?: number, d?: number, tx?: number, ty?: number) {
            super(a, b, c, d, tx, ty);
            this.decomposedMatrix.skewX = this.skewX;
            this.decomposedMatrix.skewY = this.skewY;
        }

        // Override phaser's decomposition to also track skew.
        decomposeMatrix(): any {
            let decomposedMatrix = this.decomposeMatrix();
            decomposedMatrix.skewX = this.skewX;
            decomposedMatrix.skewY = this.skewY;
            return decomposedMatrix;
        }

        static applyITRSC(tempMatrix:Phaser.GameObjects.Components.TransformMatrix, x: number, y: number, rotation: number, scaleX: number, scaleY: number, skewX: number, skewY: number): Phaser.GameObjects.Components.TransformMatrix {
            tempMatrix.a = Math.cos(rotation - skewY) * scaleX;
            tempMatrix.b = Math.sin(rotation - skewY) * scaleX;
            tempMatrix.c = -Math.sin(rotation + skewX) * scaleY;
            tempMatrix.d = Math.cos(rotation + skewX) * scaleY;

            tempMatrix.tx = x;
            tempMatrix.ty = y;

            return tempMatrix;            
        }

        // Provide additional parameters for skew to phaser's applyITRS (as new call, due to changed signature).
        applyITRSC(x: number, y: number, rotation: number, scaleX: number, scaleY: number, skewX: number, skewY: number): this {
            this.a = Math.cos(rotation - skewY) * scaleX;
            this.b = Math.sin(rotation - skewY) * scaleX;
            this.c = -Math.sin(rotation + skewX) * scaleY;
            this.d = Math.cos(rotation + skewX) * scaleY;

            this.tx = x;
            this.ty = y;

            return this;
        }

        // Read the skew parameter out.
        get skewX(): number {
            return -Math.atan2(-this.c, this.d);
        }

        // Read the skew parameter out.
        get skewY(): number {
            return Math.atan2(this.b, this.a);
        }

        // Set the skew parameters (by analogy with `rotate`, etc).
        skew(sx: number, sy: number) {
            this.applyITRSC(this.tx, this.ty, this.rotation, this.scaleX, this.scaleY, sx, sy);
            return this;
        }
    }
}
