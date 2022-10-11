"use strict";
import {BufferAttribute, DoubleSide, Mesh, MeshBasicMaterial, MirroredRepeatWrapping} from "three";

export class CornerMesh extends Mesh {
    /**
     * Create Corner Mesh
     * @param width {number}
     * @param height {number}
     * @param depth {number}
     * @param leftTop? {{radius?: {number}, segment?: {number}}}
     * @param leftBottom? {{radius?: {number}, segment?: {number}}}
     * @param rightTop? {{radius?: {number}, segment?: {number}}}
     * @param rightBottom? {{radius?: {number}, segment?: {number}}}
     * @param material {MeshBasicMaterial,MeshPhongMaterial}
     */
    constructor({
                    width,
                    height,
                    depth,
                    angles: {
                        leftTop,
                        leftBottom,
                        rightTop,
                        rightBottom
                    },
                    material
                }) {
        super();
        this.name = this.constructor.name;
        this.setMaterial(material, width, height, depth);
        this.create(width, height, depth, leftTop, leftBottom, rightTop, rightBottom);
    }

    /**
     * Set material, texture repeat in size
     * @param material {MeshBasicMaterial,MeshPhongMaterial}
     * @param width {number}
     * @param height {number}
     * @param depth {number}
     */
    setMaterial(material, width, height, depth) {
        if (material?.map) {
            const t1 = material.map.clone();
            t1.wrapS = t1.wrapT = MirroredRepeatWrapping;
            t1.center.set(0.5, 0.5);
            const t2 = t1.clone(true);
            t2.rotation = -Math.PI / 2;
            const t3 = t2.clone(true),
                cW = width / 512,
                cH = height / 512,
                cD = depth / 512;
            t1.repeat.set(cD, cH); // LEFT, RIGHT
            t2.repeat.set(cD, cW); // TOP, BOTTOM
            t3.repeat.set(cH, cW); // BACK, FRONT


            this.material = [
                new MeshBasicMaterial({
                    map: t1, //t, b
                    side: DoubleSide, wireframe: false
                }),
                new MeshBasicMaterial({
                    map: t2, // f, b
                    side: DoubleSide, wireframe: false
                }),
                new MeshBasicMaterial({
                    map: t3, // l, r
                    side: DoubleSide, wireframe: false
                })
            ];
        } else {
            this.material = material;
        }
    }

    /**
     * Create geometry
     * @param width {number}
     * @param height {number}
     * @param depth {number}
     * @param leftTop  {{radius?: {number}, segment?: {number}}}
     * @param leftBottom  {{radius?: {number}, segment?: {number}}}
     * @param rightTop  {{radius?: {number}, segment?: {number}}}
     * @param rightBottom  {{radius?: {number}, segment?: {number}}}
     */
    create(width, height, depth,
           leftTop = {radius: 0, segment: 0},
           leftBottom = {radius: 0, segment: 0},
           rightTop = {radius: 0, segment: 0},
           rightBottom = {radius: 0, segment: 0}) {
        const w2 = width / 2, h2 = height / 2, d2 = depth / 2, lRt = leftTop.radius, lRb = leftBottom.radius,
            rRt = rightTop.radius, rRb = rightBottom.radius, maxRl = Math.max(lRb, lRt), maxRr = Math.max(rRb, rRt),
            a = maxRl - w2, b = w2 - maxRr, c = w2 - rRt, d = lRt - w2, e = lRb - w2, f = w2 - rRb,
            g = lRt - d2, h = d2 - rRb, j = d2 - lRb, k = rRt - d2,
            ltW = leftTop.radius / width, ltD = leftTop.radius / depth,
            lbW = leftBottom.radius / width, rtD = rightTop.radius / depth,
            lbD = leftBottom.radius / depth, lbD1 = 1 - lbD,
            rtW = rightTop.radius / width, rtW1 = 1 - rtW,
            rbW = rightBottom.radius / width, rbW1 = 1 - rbW,
            rbD = rightBottom.radius / depth, rbD1 = 1 - rbD,
            mLW = maxRl / width, mRW = maxRr / width, mRW1 = 1 - mRW,
            pos1 = [], uvs1 = [],
            pos2 = [
                a, h2, d2, b, h2, d2, b, h2, -d2,      // center
                a, h2, d2, b, h2, -d2, a, h2, -d2,     // top
                a, -h2, d2, b, -h2, d2, b, -h2, -d2,   // center
                a, -h2, d2, b, -h2, -d2, a, -h2, -d2,  // bottom
            ],
            uvs2 = [
                mLW, 1, mRW1, 1, mRW1, 0,   // top
                mLW, 1, mRW1, 0, mLW, 0,
                mLW, 1, mRW1, 1, mRW1, 0,   // bottom
                mLW, 1, mRW1, 0, mLW, 0
            ],
            pos3 = [
                d, -h2, -d2, c, -h2, -d2, c, h2, -d2,  // back face
                d, -h2, -d2, c, h2, -d2, d, h2, -d2,   //
                e, -h2, d2, f, -h2, d2, f, h2, d2,     // front face
                e, -h2, d2, f, h2, d2, e, h2, d2,      //
            ],
            uvs3 = [
                ltW, 1, rtW1, 1, rtW1, 0, // back
                ltW, 1, rtW1, 0, ltW, 0, // face
                lbW, 1, rbW1, 1, rbW1, 0, //face
                lbW, 1, rbW1, 0, lbW, 0, // front
            ];
        let data;
        if (maxRl === 0) { // Not left angles
            pos1.push(
                -w2, -h2, -d2, -w2, -h2, d2, -w2, h2, d2, // left
                -w2, -h2, -d2, -w2, h2, d2, -w2, h2, -d2, //face
            );
            uvs1.push(
                0, 1, 1, 1, 1, 0,
                0, 1, 1, 0, 0, 0
            );
        } else {
            if (lRt) {
                data = this._rounded({
                    h2,
                    width,
                    depth,
                    quarter: 2,
                    center: {x: d, y: g},
                    radius: leftTop.radius,
                    segment: leftTop.segment
                });
                pos2.push(...data.pos2);
                uvs2.push(...data.uvs2);
                pos3.push(...data.pos3);
                uvs3.push(...data.uvs3);
            }
            if (lRb) {
                data = this._rounded({
                    h2,
                    width,
                    depth,
                    quarter: 1,
                    center: {x: e, y: j},
                    radius: leftBottom.radius,
                    segment: leftBottom.segment
                });
                pos2.push(...data.pos2);
                uvs2.push(...data.uvs2);
                pos3.push(...data.pos3);
                uvs3.push(...data.uvs3);
            }
            if (lRt && lRb) {
                if (lRt > lRb) { // bottom square
                    pos2.push(
                        d, h2, d2, e, h2, d2, e, h2, j,
                        d, h2, d2, e, h2, j, d, h2, j,
                        d, -h2, d2, e, -h2, d2, e, -h2, j,
                        d, -h2, d2, e, -h2, j, d, -h2, j,
                    );
                    uvs2.push(
                        ltW, 1, lbW, 1, lbW, lbD1,
                        ltW, 1, lbW, lbD1, ltW, lbD1,
                        ltW, 1, lbW, 1, lbW, lbD1,
                        ltW, 1, lbW, lbD1, ltW, lbD1,
                    );
                } else if (lRt < lRb) { // top square
                    pos2.push(
                        d, h2, g, e, h2, g, e, h2, -d2,
                        d, h2, g, e, h2, -d2, d, h2, -d2,
                        d, -h2, g, e, -h2, g, e, -h2, -d2,
                        d, -h2, g, e, -h2, -d2, d, -h2, -d2,
                    );
                    uvs2.push(
                        ltW, ltD, lbW, ltD, lbW, 0,
                        ltW, ltD, lbW, 0, ltW, 0,
                        ltW, ltD, lbW, ltD, lbW, 0,
                        ltW, ltD, lbW, 0, ltW, 0,
                    );
                }
            }
            pos1.push(
                -w2, -h2, g, -w2, -h2, j, -w2, h2, j, // lateral
                -w2, -h2, g, -w2, h2, j, -w2, h2, g,  // plane
            );
            uvs1.push(
                ltD, 1, lbD1, 1, lbD1, 0,
                ltD, 1, lbD1, 0, ltD, 0,
            );
            pos2.push(
                -w2, h2, j, a, h2, j, a, h2, g,       // left
                -w2, h2, j, a, h2, g, -w2, h2, g,     // face top
                -w2, -h2, j, a, -h2, j, a, -h2, g,    // left
                -w2, -h2, j, a, -h2, g, -w2, -h2, g,  // face bottom
            );
            uvs2.push(
                0, lbD1, mLW, lbD1, mLW, ltD,
                0, lbD1, mLW, ltD, 0, ltD,
                0, lbD1, mLW, lbD1, mLW, ltD,
                0, lbD1, mLW, ltD, 0, ltD,
            );
        }

        if (maxRr === 0) { // Not right angles
            pos1.push(
                w2, -h2, d2, w2, -h2, -d2, w2, h2, -d2, // right
                w2, -h2, d2, w2, h2, -d2, w2, h2, d2,   //face
            );
            uvs1.push(
                1, 1, 0, 1, 0, 0,
                1, 1, 0, 0, 1, 0
            );
        } else {
            if (rRt) {
                data = this._rounded({
                    h2,
                    width,
                    depth,
                    quarter: 3,
                    center: {x: c, y: k},
                    radius: rightTop.radius,
                    segment: rightTop.segment
                });
                pos2.push(...data.pos2);
                uvs2.push(...data.uvs2);
                pos3.push(...data.pos3);
                uvs3.push(...data.uvs3);
            }
            if (rRb) {
                data = this._rounded({
                    h2,
                    width,
                    depth,
                    quarter: 0,
                    center: {x: f, y: h},
                    radius: rightBottom.radius,
                    segment: rightBottom.segment
                });
                pos2.push(...data.pos2);
                uvs2.push(...data.uvs2);
                pos3.push(...data.pos3);
                uvs3.push(...data.uvs3);
            }
            if (rRt && rRb) {
                if (rRt > rRb) {
                    pos2.push(
                        c, h2, d2, f, h2, d2, f, h2, h,
                        c, h2, d2, f, h2, h, c, h2, h,
                        c, -h2, d2, f, -h2, d2, f, -h2, h,
                        c, -h2, d2, f, -h2, h, c, -h2, h,
                    );
                    uvs2.push(
                        rtW1, 1, rbW1, 1, rbW1, rbD1,
                        rtW1, 1, rbW1, rbD1, rtW1, rbD1,
                        rtW1, 1, rbW1, 1, rbW1, rbD1,
                        rtW1, 1, rbW1, rbD1, rtW1, rbD1,
                    );
                } else if (rRt < rRb) {
                    pos2.push(
                        f, h2, k, c, h2, k, c, h2, -d2,
                        f, h2, k, c, h2, -d2, f, h2, -d2,
                        f, -h2, k, c, -h2, k, c, -h2, -d2,
                        f, -h2, k, c, -h2, -d2, f, -h2, -d2,
                    );
                    uvs2.push(
                        rbW1, rtD, rtW1, rtD, rtW1, 0,
                        rbW1, rtD, rtW1, 0, rbW1, 0,
                        rbW1, rtD, rtW1, rtD, rtW1, 0,
                        rbW1, rtD, rtW1, 0, rbW1, 0,
                    );
                }
            }

            pos1.push(
                w2, -h2, h, w2, -h2, k, w2, h2, k, // lateral
                w2, -h2, h, w2, h2, k, w2, h2, h,  // plane
            );
            uvs1.push(
                rbD1, 1, rtD, 1, rtD, 0,
                rbD1, 1, rtD, 0, rbD1, 0,
            );
            pos2.push(
                b, h2, h, w2, h2, h, w2, h2, k,   // right
                b, h2, h, w2, h2, k, b, h2, k,    // face top
                b, -h2, h, w2, -h2, h, w2, -h2, k, // right
                b, -h2, h, w2, -h2, k, b, -h2, k,  // face bottom
            )
            uvs2.push(
                mRW1, rbD1, 1, rbD1, 1, rtD,
                mRW1, rbD1, 1, rtD, mRW1, rtD,
                mRW1, rbD1, 1, rbD1, 1, rtD,
                mRW1, rbD1, 1, rtD, mRW1, rtD,
            );
        }

        this.geometry.setAttribute('position', new BufferAttribute(
            new Float32Array([...pos1, ...pos2, ...pos3]), 3));
        this.geometry.setAttribute('uv', new BufferAttribute(
            new Float32Array([...uvs1, ...uvs2, ...uvs3]), 2));

        this.geometry.addGroup(0, uvs1.length / 2, 0); // LEFT, RIGHT
        this.geometry.addGroup(uvs1.length / 2, uvs2.length / 2, 1); // TOP, BOTTOM
        this.geometry.addGroup((uvs1.length + uvs2.length) / 2, uvs3.length, 2); // BACK, FRONT
        this.geometry.computeVertexNormals();
    }

    /**
     * Create round
     * @param quarter {number} 0 - right bottom , 1 - left bottom, 2 - left top, 3 - right top
     * @param segment {number} segments
     * @param h2 {number}
     * @param width {number}
     * @param depth {number}
     * @param radius {number}
     * @param center {{x:{number}, y:{number}}}
     * @returns {{uvs2: *[], uvs3: *[], pos2: *[], pos3: *[]}}
     * @private
     */
    _rounded({
                 quarter,
                 segment = 90,
                 h2,
                 width,
                 depth,
                 radius,
                 center = {x: 0, y: 0},
             }) {
        const pos2 = [], pos3 = [], uvs2 = [], uvs3 = [], PI2 = Math.PI /2,
            cA = PI2 / segment,
            cx = radius / width,
            cy = radius / depth;
        let angle = PI2 * quarter, x1, y1, rX, rY, u1, v1;

        switch (quarter) {
            case 0: // right bottom
                x1 = center.x + radius;
                y1 = center.y;
                rX = 1 - cx;
                rY = 1 - cy;
                u1 = 1;
                v1 = 1 - cy;
                break;
            case 1: // left bottom
                x1 = center.x;
                y1 = center.y + radius;
                rX = cx;
                rY = 1 - cy;
                u1 = cx;
                v1 = 1;
                break;
            case 2: // left top
                x1 = center.x - radius;
                y1 = center.y;
                rX = cx;
                rY = cy;
                u1 = 0;
                v1 = cy;
                break;
            case 3: // right top
                x1 = center.x;
                y1 = center.y - radius;
                rX = 1 - cx;
                rY = cy;
                u1 = 1 - cx;
                v1 = 0;
                break;
        }
        for (let i = 0; i < segment; i++) {
            angle += cA;
            const cosA = Math.cos(angle),
                sinA = Math.sin(angle),
                x2 = center.x + radius * cosA,
                y2 = center.y + radius * sinA,
                u2 = rX + cx * cosA,
                v2 = rY + cy * sinA;
            pos2.push( // top and bottom angle
                x1, h2, y1, center.x, h2, center.y, x2, h2, y2,
                x1, -h2, y1, center.x, -h2, center.y, x2, -h2, y2
            );
            uvs2.push( // top and bottom angle
                u1, v1, rX, rY, u2, v2,
                u1, v1, rX, rY, u2, v2,
            );
            pos3.push( // face angle
                x1, -h2, y1, x2, -h2, y2, x2, h2, y2,
                x1, -h2, y1, x2, h2, y2, x1, h2, y1
            );
            uvs3.push( // face angle
                u1, 1, u2, 1, u2, 0,
                u1, 1, u2, 0, u1, 0
            );
            x1 = x2;
            y1 = y2;
            u1 = u2;
            v1 = v2;
        }
        return {pos2, uvs2, pos3, uvs3};
    }
}
