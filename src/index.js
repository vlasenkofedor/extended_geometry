"use strict";

import {
    Scene,
    PerspectiveCamera,
    Color,
    WebGLRenderer,
    SpotLight,
    TextureLoader,
    DoubleSide,
    MeshBasicMaterial
} from "three";

import {OrbitControls} from "./OrbitControls";
import {CornerMesh} from "./CornerMesh";

const loadTexture = async () => new Promise(
    resolve => new TextureLoader().load('texture.jpg', resolve, undefined, console.log));
(async _ => {
    const scene = new Scene(),
        renderer = new WebGLRenderer({antialias: true}),
        camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 100000),
        texture = await loadTexture(),
        material = new MeshBasicMaterial({
            map: texture,
            side: DoubleSide,
            wireframe: false
        });
    scene.background = new Color(0xcccccc)
    camera.position.z = 9000;
    new OrbitControls(camera, renderer.domElement)
    const testMesh = new CornerMesh({
        width: 2000,
        height: 500,
        depth: 1000,
        angles: {
            leftTop: {
                radius: 400,
                segment: 90
            },
            leftBottom: {
                radius: 200,
                segment: 90
            },
            rightTop: {
                radius: 500,
                segment: 90
            },
            rightBottom: {
                radius: 120,
                segment: 90
            }
        },
        material
    });
    scene.add(testMesh);

    const sp1 = new SpotLight(0xeeeece)
    sp1.castShadow = true
    const sp2 = sp1.clone(),
        sp3 = sp1.clone(),
        sp4 = sp1.clone()
    sp1.position.set(10000, 10000, 10000)
    sp2.position.set(-10000, 10000, 10000)
    sp3.position.set(-10000, -10000, 10000)
    sp4.position.set(10000, -10000, 10000)
    scene.add(sp1, sp2, sp3, sp4)

    renderer.setClearColor(0xffffff);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animation);
    document.body.appendChild(renderer.domElement);

    function animation() {
        renderer.render(scene, camera);
    }
})();
