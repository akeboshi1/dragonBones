namespace dragonBones.phaser.display {
    export class SlotMesh extends Phaser.GameObjects.Mesh {
        fakeIndices: Uint16Array;
        fakeVertices: Uint16Array;
        fakeUvs: Uint16Array;

        constructor(scene: Phaser.Scene, x: number, y: number, vertices: number[], uv: number[], colors: number[], alphas: number[], texture: string, frame?: string | integer) {
            let containsZ = null;
            let normals = null;
            super(scene, x, y, texture, frame, vertices, uv, containsZ, normals, colors, alphas);
            this.setPipeline("SkewPipeline");  // use customized pipeline
            this.hideCCW = false;
            this.setOrtho(this.width, this.height);
        }

        setTint(topLeft?: integer, topRight?: integer, bottomLeft?: integer, bottomRight?: integer) {
          // NOTHING
        }

        updateVertices() {
            // NOTHING. But maybe something? We're killing the fakeFoos and just using raw vertices "soon".
        }
    }

    util.extendSkew(SlotMesh);  // skew mixin
}
