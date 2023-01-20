import * as THREE from 'three'
import { GLTFLoader } from 'gltfLoader'
import { Vector3 } from 'three'

const FRAME_RATE = 60
const MODEL_URL = 'https://modelviewer.dev/shared-assets/models/NeilArmstrong.glb'
const FOV = 75
const ASPECT_RATIO = 2
const NEAR_PLANE = 0.1
const FAR_PLANE = 5
const ROTATE_SENSITIVITY = 0.1

let axis = new Vector3(0, -1, 0)
axis.applyAxisAngle(new Vector3(0, 0, -1), toRadians(20))

let lastPos
let isMousePressed = false
let dblclickCount = 0

let texture = new THREE.TextureLoader().load("sample-texture.jpg")
texture.wrapS = THREE.ClampToEdgeWrapping
texture.wrapT = THREE.ClampToEdgeWrapping
texture.repeat.set(1, 1)

let model
let ogTextures = []
let camera = new THREE.PerspectiveCamera(FOV, ASPECT_RATIO, NEAR_PLANE, FAR_PLANE)
camera.rotation.order = "YXZ"

let light = new THREE.DirectionalLight({color : 0x44aa88}, 1.5)
light.position.set(0, 0, 5)

let scene = new THREE.Scene()
scene.add(light)

new GLTFLoader().load(MODEL_URL, (gltfModel)=>onModelLoad(gltfModel.scene), (xhr)=>{}, (error)=>console.log(error))

let renderer = new THREE.WebGLRenderer() 
renderer.domElement.addEventListener('mousedown', onPress)
renderer.domElement.addEventListener('mouseup', onRelease)
renderer.domElement.addEventListener('mousemove', onMove)
renderer.domElement.addEventListener('dblclick', onDoubleClick)
document.body.appendChild( renderer.domElement )

const targetLocation = new THREE.Vector3(0, 0, -2)

runRenderLoop(renderer, scene, camera)

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

function onDoubleClick()
{
    if (dblclickCount == 0)
    {
        orbitAroundTarget(camera, targetLocation)
        //moveToTarget(camera, { x:-2, y:2, z:-2 }, model.position)
    }
    else
        resetCamera()
    dblclickCount++
    if (dblclickCount == 2)
        dblclickCount = 0
}

function runRenderLoop(renderer, scene, camera)
{
    renderer.setSize( window.innerWidth, window.innerHeight )
    renderer.render(scene, camera)
    setTimeout(()=>runRenderLoop(renderer, scene, camera), 1000/FRAME_RATE)
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
        model.children.forEach(mesh => { mesh.material.map = texture })
    else
    {
        for(let i=0; i<ogTextures.length; i++)
            model.children[i].material.map = ogTextures[i] 
    }
}

function moveToTarget(object3D, targetPosition, lookAtPosition)
{ 
    if (!isVector3Equal(object3D.position, targetPosition))
    {   
        let vector2OldPos = subtractVectors(object3D.position, lookAtPosition)
        if (!isFloatEqual(object3D.position.x, targetPosition.x)) 
            object3D.position.x += (targetPosition.x < object3D.position.x)? -0.01 : 0.01 
        if (!isFloatEqual(object3D.position.y, targetPosition.y)) 
            object3D.position.y += (targetPosition.y < object3D.position.y)? -0.01 : 0.01 
        if (!isFloatEqual(object3D.position.z, targetPosition.z)) 
            object3D.position.z += (targetPosition.z < object3D.position.z)? -0.01 : 0.01 
        let vector2NewPos = subtractVectors(object3D.position, lookAtPosition)
        let xiter = angleInRadians(new Vector3(0, vector2OldPos.y, vector2OldPos.z), new Vector3(0, vector2NewPos.y, vector2NewPos.z))
        let yiter = angleInRadians(new Vector3(vector2OldPos.x, 0, vector2OldPos.z), new Vector3(vector2NewPos.x, 0, vector2NewPos.z))
        object3D.rotation.x -= xiter
        object3D.rotation.y -= yiter
        setTimeout(() => moveToTarget(object3D, targetPosition, lookAtPosition), 1000/FRAME_RATE)
    }
}

function orbitAroundTarget(object3D, lookAtPosition)
{
    let vector2OldPos = subtractVectors(object3D.position, lookAtPosition)
    let vector2NewPos = new Vector3(vector2OldPos.x, vector2OldPos.y, vector2OldPos.z)
    vector2NewPos.applyAxisAngle(axis, toRadians(1))
    let offset = subtractVectors(vector2NewPos, vector2OldPos)
    let newPosition = addVectors(object3D.position, offset)
    object3D.position.set(newPosition.x, newPosition.y, newPosition.z)
    object3D.lookAt(lookAtPosition)
    setTimeout(() => orbitAroundTarget(object3D, lookAtPosition), 1000/FRAME_RATE)
}

function addVectors(v1, v2)
{
    return new Vector3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z)
}

function subtractVectors(v1, v2)
{
    return new Vector3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z)
}

function normalize(v)
{
    let len = length(v)
    return new Vector3(v.x/len, v.y/len, v.z/len)
}

function length(v)
{
    return Math.sqrt((v.x * v.x)+(v.y * v.y)+(v.z * v.z))
}

function angleInRadians(v1, v2)
{
    let v1_normal = normalize(v1)
    let v2_normal = normalize(v2)
    let cosine = (v1_normal.x * v2_normal.x) + (v1_normal.y * v2_normal.y) + (v1_normal.z * v2_normal.z)
    return Math.acos(cosine)
}

function cross(v1, v2)
{
    return normalize(new Vector3(v1.y * v2.z - v1.z * v2.y, v1.z * v2.x - v1.x * v2.z, v1.x * v2.y - v1.y * v2.x))
}

function resetCamera()
{
    camera.position.set(0, 0, 0)
    camera.rotation.set(toRadians(0), toRadians(0), toRadians(0))
}

function toRadians(degrees)
{
    return (degrees * 22) / (7 * 180)
}

function toDegrees(radians)
{
    return (radians * 7 * 180)/22
}

function isVector3Equal(v1, v2)
{
    return isFloatEqual(v1.x, v2.x) && isFloatEqual(v1.y, v2.y) && isFloatEqual(v1.z, v2.z)
}

function isFloatEqual(f1, f2)
{
    let diff = (f1 > f2) ? f1 - f2 : f2 - f1
    return diff < 0.00001
}