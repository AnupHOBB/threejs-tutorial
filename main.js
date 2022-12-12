import * as GLTF from 'gltfLoader'
import * as THREE from 'three'

const modelUrl = 'https://modelviewer.dev/shared-assets/models/NeilArmstrong.glb'
const loader = new GLTF.GLTFLoader()
loader.load(modelUrl, (gltfModel)=>onModelLoad(gltfModel.scene), (xhr)=>{}, (error)=>console.log(error))

let model
let canvas
let isMousePressed = false
let lastPos
let first = true

let renderer
let scene
let camera

function onModelLoad(gltfModel)
{
    const fov = 75
    const aspect = 2
    const near = 0.1
    const far = 5
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far)

    model = gltfModel.children[0]
    model.position.set(0, -1, -2)

    const light = new THREE.DirectionalLight({color : 0x44aa88}, 1.5)
    light.position.set(0, 0, 5)

    scene = new THREE.Scene()
    scene.add(model)
    scene.add(light)

    renderer = new THREE.WebGLRenderer()
    canvas = renderer.domElement
    canvas.addEventListener('mousedown', onDrag)
    canvas.addEventListener('mouseup', onRelease)
    canvas.addEventListener('mousemove', onMove)
    document.body.appendChild( renderer.domElement )

    document.querySelector("body").onresize = () => renderer.setSize(window.innerWidth, window.innerHeight)

    renderer.setSize( window.innerWidth, window.innerHeight )
    renderer.render(scene, camera)
}

function onDrag(event)
{
    isMousePressed = true
}

function onRelease()
{
    isMousePressed = false
    first = true
}

function onMove(event)
{
    if (isMousePressed)
    {
        if (first) 
        {
            lastPos = { x: event.clientX, y: event.clientY }
            first = false
        }
        rotate(event)
        renderer.render(scene, camera)
    }
}

function rotate(event)
{
    let currentPos = { x: event.clientX, y: event.clientY }
    let yaw = currentPos.x - lastPos.x
    yaw *= 0.1
    model.rotation.y += yaw
    lastPos = currentPos
}