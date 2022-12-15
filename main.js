import * as GLTF from 'gltfLoader'
import * as THREE from 'three'

const FRAME_RATE = 60
const MODEL_URL = 'https://modelviewer.dev/shared-assets/models/NeilArmstrong.glb'
const FOV = 75
const ASPECT_RATIO = 2
const NEAR_PLANE = 0.1
const FAR_PLANE = 5
const ROTATE_SENSITIVITY = 0.1

let houseTexture = new THREE.TextureLoader().load("sample-texture.jpg")
houseTexture.wrapS = THREE.ClampToEdgeWrapping
houseTexture.wrapT = THREE.ClampToEdgeWrapping
houseTexture.repeat.set(1, 1)

let model
let lastPos
let isMousePressed = false
let ogTextures = []

let camera = new THREE.PerspectiveCamera(FOV, ASPECT_RATIO, NEAR_PLANE, FAR_PLANE)

let light = new THREE.DirectionalLight({color : 0x44aa88}, 1.5)
light.position.set(0, 0, 5)

let scene = new THREE.Scene()
scene.add(light)

new GLTF.GLTFLoader().load(MODEL_URL, (gltfModel)=>onModelLoad(gltfModel.scene), (xhr)=>{}, (error)=>console.log(error))

let renderer = new THREE.WebGLRenderer() 
renderer.domElement.addEventListener('mousedown', onPress)
renderer.domElement.addEventListener('mouseup', onRelease)
renderer.domElement.addEventListener('mousemove', onMove)
document.body.appendChild( renderer.domElement )

startRenderLoop(renderer, scene, camera)

function onModelLoad(gltfModel)
{
    model = gltfModel.children[0]
    for(let i=0; i<model.children.length; i++)
        ogTextures[i] = model.children[i].material.map
    model.position.set(0, -1, -2)
    scene.add(model)
}

function onPress(event)
{
    lastPos = { x: event.clientX, y: event.clientY }
    changeColor(isMousePressed = true)
}

function onRelease()
{
    changeColor(isMousePressed = false)
}

function onMove(event)
{
    if (isMousePressed)
        rotate(event)
}

function startRenderLoop(renderer, scene, camera)
{
    renderer.setSize( window.innerWidth, window.innerHeight )
    renderer.render(scene, camera)
    setTimeout(()=>startRenderLoop(renderer, scene, camera), 1000/FRAME_RATE)
}

function rotate(event)
{
    let currentPos = { x: event.clientX, y: event.clientY }
    let yaw = (currentPos.x - lastPos.x) * ROTATE_SENSITIVITY
    let pitch = (currentPos.y - lastPos.y) * ROTATE_SENSITIVITY
    model.rotation.x += pitch
    model.rotation.y += yaw
    lastPos = currentPos
}

function changeColor(change)
{
    if (change)
    {
        model.children.forEach(mesh => { 
            mesh.material.map = houseTexture
        })
    }
    else
    {
        for(let i=0; i<ogTextures.length; i++)
            model.children[i].material.map = ogTextures[i] 
    }
}