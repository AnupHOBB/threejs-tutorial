'use strict';

const fov = 75;
const aspect = 2;
const near = 0.1;
const far = 5;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 5;

const boxWidth = 1;
const boxHeight = 1;
const boxDepth = 1;
const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

const material = new THREE.MeshBasicMaterial({color : 0x44aa88});

const cube = new THREE.Mesh(geometry, material);

const scene = new THREE.Scene();
scene.add(cube);

const renderer = new THREE.WebGLRenderer();
document.body.appendChild( renderer.domElement );

let up = true;
let right = true;
function rotateCube()
{
    requestAnimationFrame(rotateCube);

    let deltaRotation = 0.01;
    cube.rotation.x += deltaRotation;
    cube.rotation.y += deltaRotation;
    cube.rotation.z += deltaRotation;

    let y_limit = 2.8;
    let x_limit = 6;
    let deltaPosition = 0.05;
    if (up)
    {
        if(cube.position.y > y_limit)
        {
            cube.position.y -= deltaPosition;
            up = false;
        }
        else
            cube.position.y += deltaPosition;
    }
    else
    {
        if (cube.position.y < -y_limit)
        {
            cube.position.y += deltaPosition;
            up = true;
        }
        else
            cube.position.y -= deltaPosition;
    }

    if (right)
    {
        if(cube.position.x > x_limit)
        {
            cube.position.x -= deltaPosition;
            right = false;
        }
        else
            cube.position.x += deltaPosition;
    }
    else
    {
        if (cube.position.x < -x_limit)
        {
            cube.position.x += deltaPosition;
            right = true;
        }
        else
            cube.position.x -= deltaPosition;
    }

    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.render(scene, camera);
}

rotateCube();