var octaeder = (function () {

    function createVertexData(depth = 1) {
        var vertices = [];
        var indicesLines = [];
        var indicesTris = [];
        var normals = [];

        const initialVertices = [
            [1, 0, 0], [-1, 0, 0],
            [0, 1, 0], [0, -1, 0],
            [0, 0, 1], [0, 0, -1]
        ];
        const initialFaces = [
            [0, 2, 4], [2, 1, 4], [1, 3, 4], [3, 0, 4],
            [2, 0, 5], [1, 2, 5], [3, 1, 5], [0, 3, 5]
        ];

        vertices = initialVertices.map(normalize);
        normals = [...vertices]; // Kopiere initiale Vertices als Normals, da sie gleich sind.

        let faces = initialFaces.map(face => face.slice());

        this.recursionDepth = depth;
        faces = subdivide(vertices, normals, faces, this.recursionDepth);

        vertices = vertices.flat();
		for (let i = 0; i < vertices.length; i += 3) {
			vertices[i] += 2
		}
        normals = normals.flat();

        faces.forEach(face => {
            indicesTris.push(...face);
            indicesLines.push(face[0], face[1], face[1], face[2], face[2], face[0]);
        });

        this.vertices = new Float32Array(vertices);
        this.normals = new Float32Array(normals);
        this.indicesLines = new Uint16Array(indicesLines);
        this.indicesTris = new Uint16Array(indicesTris);
    }

    function normalize(v) {
        const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        return [v[0] / length, v[1] / length, v[2] / length];
    }

    function midpoint(v1, v2) {
        return normalize([
            (v1[0] + v2[0]) / 2,
            (v1[1] + v2[1]) / 2,
            (v1[2] + v2[2]) / 2
        ]);
    }

    function subdivide(vertices, normals, faces, depth) {
        if (depth === 0) return faces;

        const newFaces = [];
        const midpoints = {};

        faces.forEach(face => {
            const [v1, v2, v3] = face.map(i => vertices[i]);

            const m1 = midpoints[`${face[0]}-${face[1]}`] || midpoint(v1, v2);
            const m2 = midpoints[`${face[1]}-${face[2]}`] || midpoint(v2, v3);
            const m3 = midpoints[`${face[2]}-${face[0]}`] || midpoint(v3, v1);

            vertices.push(m1, m2, m3);
            normals.push(m1, m2, m3);

            const i1 = vertices.length - 3;
            const i2 = vertices.length - 2;
            const i3 = vertices.length - 1;

            midpoints[`${face[0]}-${face[1]}`] = m1;
            midpoints[`${face[1]}-${face[2]}`] = m2;
            midpoints[`${face[2]}-${face[0]}`] = m3;

            newFaces.push([face[0], i1, i3], [i1, face[1], i2], [i3, i2, face[2]], [i1, i2, i3]);
        });

        return subdivide(vertices, normals, newFaces, depth - 1);
    }

    return {
        createVertexData: createVertexData
    };

})();
