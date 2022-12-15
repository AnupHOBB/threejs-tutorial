import * as GLTF from 'gltfLoader'
import * as THREE from 'three'

const FRAME_RATE = 60
const MODEL_URL = 'https://modelviewer.dev/shared-assets/models/NeilArmstrong.glb'

let houseTexture = new THREE.TextureLoader().load("sample-texture.jpg")
let model
let lastPos
let first = true
let isMousePressed = false
let ogTextures = []

new GLTF.GLTFLoader().load(MODEL_URL, (gltfModel)=>onModelLoad(gltfModel.scene), (xhr)=>{}, (error)=>console.log(error))

function onModelLoad(gltfModel)
{
    const fov = 75
    const aspect = 2
    const near = 0.1
    const far = 5
    let camera = new THREE.PerspectiveCamera(fov, aspect, near, far)

    model = gltfModel.children[0]
    for(let i=0; i<model.children.length; i++)
        ogTextures[i] = model.children[i].material.map
    model.position.set(0, -1, -2)

    const light = new THREE.DirectionalLight({color : 0x44aa88}, 1.5)
    light.position.set(0, 0, 5)

    let scene = new THREE.Scene()
    scene.add(model)
    scene.add(light)

    let renderer = new THREE.WebGLRenderer()
    let canvas = renderer.domElement
    canvas.addEventListener('mousedown', onDrag)
    canvas.addEventListener('mouseup', onRelease)
    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('dblclick', changeColor)
    document.body.appendChild( renderer.domElement )

    document.querySelector("body").onresize = () => renderer.setSize(window.innerWidth, window.innerHeight)

    renderer.setSize( window.innerWidth, window.innerHeight )
    renderLoop(renderer, scene, camera)
}

function renderLoop(renderer, scene, camera)
{
    renderer.render(scene, camera)
    setTimeout(()=>renderLoop(renderer, scene, camera), 1000/FRAME_RATE)
}

function onDrag()
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
    }
    changeColor(isMousePressed)
}

function rotate(event)
{
    let currentPos = { x: event.clientX, y: event.clientY }
    let yaw = currentPos.x - lastPos.x
    yaw *= 0.1
    let pitch = currentPos.y - lastPos.y
    pitch *= 0.1
    model.rotation.x += pitch
    model.rotation.y += yaw
    lastPos = currentPos
}


function changeColor(change)
{
    if (change)
    {
        houseTexture.wrapS = THREE.ClampToEdgeWrapping
        houseTexture.wrapT = THREE.ClampToEdgeWrapping
        houseTexture.repeat.set(1, 1)
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

