import * as THREE from "three"
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js"

const getContainer = () => {
    let container = document.getElementById("chess-root")
    if (!container) {
        container = document.createElement("div")
        container.id = "chess-root"
        document.body.prepend(container)
    }
    return container
}

const container = getContainer()
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x10131a)
scene.fog = new THREE.Fog(0x0c0f16, 18, 60)

const starsGeometry = new THREE.BufferGeometry()
const starCount = 1200
const starPositions = new Float32Array(starCount * 3)
for (let i = 0; i < starCount; i += 1) {
    const radius = 80 + Math.random() * 60
    const theta = Math.random() * Math.PI * 2
    const phi = Math.random() * Math.PI * 0.6
    const x = radius * Math.sin(phi) * Math.cos(theta)
    const y = radius * Math.cos(phi)
    const z = radius * Math.sin(phi) * Math.sin(theta)
    starPositions[i * 3] = x
    starPositions[i * 3 + 1] = y
    starPositions[i * 3 + 2] = z
}
starsGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3))
const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.2,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
})
const stars = new THREE.Points(starsGeometry, starsMaterial)
stars.material.fog = false
scene.add(stars)

const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    200
)
camera.position.set(9, 10, 12)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(container.clientWidth, container.clientHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
container.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.minDistance = 6
controls.maxDistance = 22
controls.target.set(0, 0.5, 0)
controls.enablePan = false
controls.autoRotate = true
controls.autoRotateSpeed = 0.6
controls.minPolarAngle = 0.2
controls.maxPolarAngle = Math.PI / 2

const ambient = new THREE.AmbientLight(0xffffff, 0.6)
scene.add(ambient)

const keyLight = new THREE.DirectionalLight(0xffffff, 1.2)
keyLight.position.set(8, 12, 6)
keyLight.castShadow = true
keyLight.shadow.mapSize.width = 2048
keyLight.shadow.mapSize.height = 2048
keyLight.shadow.camera.near = 0.5
keyLight.shadow.camera.far = 50
keyLight.shadow.camera.left = -12
keyLight.shadow.camera.right = 12
keyLight.shadow.camera.top = 12
keyLight.shadow.camera.bottom = -12
scene.add(keyLight)

const fillLight = new THREE.PointLight(0x8ab4ff, 0.4)
fillLight.position.set(-6, 6, -8)
scene.add(fillLight)

const boardGroup = new THREE.Group()
const squareSize = 1
const boardSize = 8
const boardHeight = 0.2
const offset = (boardSize * squareSize) / 2 - squareSize / 2
const files = "abcdefgh"
const piecesBySquare = new Map()

const lightSquare = new THREE.MeshStandardMaterial({ color: 0xf0d9b5 })
const darkSquare = new THREE.MeshStandardMaterial({ color: 0xb58863 })

const squareGeometry = new THREE.BoxGeometry(squareSize, boardHeight, squareSize)

for (let x = 0; x < boardSize; x += 1) {
    for (let z = 0; z < boardSize; z += 1) {
        const isLight = (x + z) % 2 === 0
        const square = new THREE.Mesh(
            squareGeometry,
            isLight ? lightSquare : darkSquare
        )
        square.position.set(x - offset, boardHeight / 2, z - offset)
        square.receiveShadow = true
        boardGroup.add(square)
    }
}

const baseGeometry = new THREE.BoxGeometry(8.6, 0.4, 8.6)
const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x2c2f3b })
const base = new THREE.Mesh(baseGeometry, baseMaterial)
base.position.y = -0.2
base.receiveShadow = true
boardGroup.add(base)

scene.add(boardGroup)

const createLathePiece = (points, material) => {
    const geometry = new THREE.LatheGeometry(points, 128)
    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true
    return mesh
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
const smoothstep = (edge0, edge1, x) => {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1)
    return t * t * (3 - 2 * t)
}

const makePiece = (type, color) => {
    const piece = new THREE.Group()
    const material = new THREE.MeshStandardMaterial({ color })

    if (type === "pawn") {
        const profile = [
            new THREE.Vector2(0.0, 0.0),
            new THREE.Vector2(0.42, 0.0),
            new THREE.Vector2(0.46, 0.06),
            new THREE.Vector2(0.32, 0.12),
            new THREE.Vector2(0.28, 0.35),
            new THREE.Vector2(0.22, 0.5),
            new THREE.Vector2(0.18, 0.68),
            new THREE.Vector2(0.24, 0.78),
            new THREE.Vector2(0.18, 0.9),
            new THREE.Vector2(0.0, 0.9),
        ]
        piece.add(createLathePiece(profile, material))
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 32, 32), material)
        head.position.y = 1.05
        head.castShadow = true
        head.receiveShadow = true
        piece.add(head)
    } else if (type === "rook") {
        const profile = [
            new THREE.Vector2(0.0, 0.0),
            new THREE.Vector2(0.48, 0.0),
            new THREE.Vector2(0.5, 0.08),
            new THREE.Vector2(0.32, 0.16),
            new THREE.Vector2(0.28, 0.55),
            new THREE.Vector2(0.38, 0.68),
            new THREE.Vector2(0.38, 0.9),
            new THREE.Vector2(0.3, 0.9),
            new THREE.Vector2(0.3, 1.02),
            new THREE.Vector2(0.0, 1.02),
        ]
        piece.add(createLathePiece(profile, material))
        const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.12, 8), material)
        crown.position.y = 1.08
        crown.castShadow = true
        crown.receiveShadow = true
        piece.add(crown)
    } else if (type === "bishop") {
        const profile = [
            new THREE.Vector2(0.0, 0.0),
            new THREE.Vector2(0.45, 0.0),
            new THREE.Vector2(0.46, 0.08),
            new THREE.Vector2(0.3, 0.15),
            new THREE.Vector2(0.26, 0.45),
            new THREE.Vector2(0.2, 0.7),
            new THREE.Vector2(0.28, 0.95),
            new THREE.Vector2(0.18, 1.1),
            new THREE.Vector2(0.0, 1.1),
        ]
        piece.add(createLathePiece(profile, material))
        const top = new THREE.Mesh(new THREE.SphereGeometry(0.16, 32, 32), material)
        top.position.y = 1.25
        top.castShadow = true
        top.receiveShadow = true
        piece.add(top)
    } else if (type === "queen") {
        const profile = [
            new THREE.Vector2(0.0, 0.0),
            new THREE.Vector2(0.5, 0.0),
            new THREE.Vector2(0.54, 0.1),
            new THREE.Vector2(0.36, 0.18),
            new THREE.Vector2(0.32, 0.55),
            new THREE.Vector2(0.38, 0.82),
            new THREE.Vector2(0.46, 1.05),
            new THREE.Vector2(0.3, 1.2),
            new THREE.Vector2(0.0, 1.2),
        ]
        piece.add(createLathePiece(profile, material))
        const crown = new THREE.Mesh(new THREE.SphereGeometry(0.18, 32, 32), material)
        crown.position.y = 1.35
        crown.castShadow = true
        crown.receiveShadow = true
        piece.add(crown)
    } else if (type === "king") {
        const profile = [
            new THREE.Vector2(0.0, 0.0),
            new THREE.Vector2(0.52, 0.0),
            new THREE.Vector2(0.56, 0.1),
            new THREE.Vector2(0.34, 0.2),
            new THREE.Vector2(0.3, 0.6),
            new THREE.Vector2(0.36, 0.9),
            new THREE.Vector2(0.42, 1.15),
            new THREE.Vector2(0.3, 1.3),
            new THREE.Vector2(0.0, 1.3),
        ]
        piece.add(createLathePiece(profile, material))
        const crossBase = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.25, 16), material)
        crossBase.position.y = 1.45
        crossBase.castShadow = true
        crossBase.receiveShadow = true
        piece.add(crossBase)
        const crossArm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.06, 0.06), material)
        crossArm.position.y = 1.52
        crossArm.castShadow = true
        crossArm.receiveShadow = true
        piece.add(crossArm)
    } else if (type === "knight") {
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.48, 0.2, 32), material)
        base.castShadow = true
        base.receiveShadow = true
        piece.add(base)

        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.34, 0.5, 32), material)
        body.position.y = 0.35
        body.castShadow = true
        body.receiveShadow = true
        piece.add(body)

        const head = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.5, 0.22), material)
        head.position.set(0.08, 0.78, 0)
        head.rotation.z = -0.2
        head.castShadow = true
        head.receiveShadow = true
        piece.add(head)

        const snout = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.3, 16), material)
        snout.position.set(0.22, 0.8, 0)
        snout.rotation.z = Math.PI / 2
        snout.castShadow = true
        snout.receiveShadow = true
        piece.add(snout)
    }

    return piece
}

const coordsToPosition = (xIndex, zIndex) => ({
    x: xIndex - offset,
    y: boardHeight,
    z: zIndex - offset,
})

const squareFromCoords = (xIndex, zIndex) => {
    const file = files[xIndex]
    const rank = 8 - zIndex
    return `${file}${rank}`
}

const squareToCoords = (square) => {
    const file = square[0]
    const rank = Number(square[1])
    const xIndex = files.indexOf(file)
    const zIndex = 8 - rank
    return { xIndex, zIndex }
}

const placePieceRow = (zIndex, color) => {
    for (let x = 0; x < boardSize; x += 1) {
        const piece = makePiece("pawn", color)
        const pos = coordsToPosition(x, zIndex)
        piece.position.set(pos.x, pos.y, pos.z)
        scene.add(piece)
        piecesBySquare.set(squareFromCoords(x, zIndex), piece)
    }
}

const placeBackRow = (zIndex, color) => {
    const order = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"]
    order.forEach((type, x) => {
        const piece = makePiece(type, color)
        const pos = coordsToPosition(x, zIndex)
        piece.position.set(pos.x, pos.y, pos.z)
        scene.add(piece)
        piecesBySquare.set(squareFromCoords(x, zIndex), piece)
    })
}

placeBackRow(0, 0x232323)
placePieceRow(1, 0x232323)
placePieceRow(6, 0xf3f3f3)
placeBackRow(7, 0xf3f3f3)

const forestCanvas = document.createElement("canvas")
const forestCtx = forestCanvas.getContext("2d")
forestCanvas.width = 512
forestCanvas.height = 512
if (forestCtx) {
    forestCtx.fillStyle = "#0b1b0f"
    forestCtx.fillRect(0, 0, forestCanvas.width, forestCanvas.height)
    for (let i = 0; i < 2200; i += 1) {
        const x = Math.random() * forestCanvas.width
        const y = Math.random() * forestCanvas.height
        const shade = 30 + Math.floor(Math.random() * 50)
        forestCtx.fillStyle = `rgb(12, ${shade}, 18)`
        forestCtx.fillRect(x, y, 2, 2)
    }
}
const forestTexture = new THREE.CanvasTexture(forestCanvas)
forestTexture.wrapS = THREE.RepeatWrapping
forestTexture.wrapT = THREE.RepeatWrapping
forestTexture.repeat.set(6, 6)

const groundGeometry = new THREE.PlaneGeometry(60, 60)
const groundMaterial = new THREE.MeshStandardMaterial({
    map: forestTexture,
    color: 0xffffff,
    roughness: 0.95,
    transparent: true,
})
const ground = new THREE.Mesh(groundGeometry, groundMaterial)
ground.rotation.x = -Math.PI / 2
ground.position.y = -0.6
ground.receiveShadow = true
scene.add(ground)

const makeMountains = ({ width, depth, segments, height, color, y, z }) => {
    const geometry = new THREE.PlaneGeometry(width, depth, segments, segments)
    const positions = geometry.attributes.position
    for (let i = 0; i < positions.count; i += 1) {
        const vy = Math.random() * height
        positions.setZ(i, vy)
    }
    geometry.computeVertexNormals()
    const material = new THREE.MeshStandardMaterial({
        color,
        flatShading: true,
        roughness: 0.75,
        metalness: 0.1,
        transparent: true,
        opacity: 1,
    })
    material.fog = false
    const mesh = new THREE.Mesh(geometry, material)
    mesh.rotation.x = -Math.PI / 2
    mesh.position.y = y
    mesh.position.z = z
    return mesh
}

const mountainBase = {
    width: 180,
    depth: 60,
    segments: 44,
    height: 10,
    color: 0x2c3a52,
    y: -3.2,
}

const mountainsNorth = makeMountains({ ...mountainBase, z: -52 })
const mountainsSouth = makeMountains({ ...mountainBase, z: 52 })
const mountainsEast = makeMountains({ ...mountainBase, z: 0 })
const mountainsWest = makeMountains({ ...mountainBase, z: 0 })

mountainsSouth.rotation.z = Math.PI
mountainsEast.rotation.z = Math.PI / 2
mountainsWest.rotation.z = -Math.PI / 2
mountainsEast.position.x = 52
mountainsWest.position.x = -52

mountainsSouth.material.opacity = 0.7
mountainsWest.material.opacity = 0.7
mountainsSouth.material.fog = true
mountainsWest.material.fog = true

const mountainMeshes = [mountainsNorth, mountainsSouth, mountainsEast, mountainsWest]
mountainMeshes.forEach((mesh) => scene.add(mesh))

const campfires = []

const onResize = () => {
    const width = container.clientWidth
    const height = container.clientHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
}

window.addEventListener("resize", onResize)

const activeMoves = new Set()
const movePiece = (from, to) => {
    const piece = piecesBySquare.get(from)
    if (!piece) {
        return
    }

    const { xIndex, zIndex } = squareToCoords(to)
    const endPos = coordsToPosition(xIndex, zIndex)
    const startPos = piece.position.clone()

    piece.userData.move = {
        startPos,
        endPos,
        startTime: performance.now(),
        duration: 800,
    }

    piecesBySquare.delete(from)
    piecesBySquare.set(to, piece)
    activeMoves.add(piece)
}

const openingMoves = [
    { from: "e2", to: "e4" },
    { from: "e7", to: "e5" },
    { from: "g1", to: "f3" },
    { from: "b8", to: "c6" },
    { from: "f1", to: "b5" },
    { from: "a7", to: "a6" },
]

const reversedMoves = [...openingMoves]
    .reverse()
    .map(({ from, to }) => ({ from: to, to: from }))

const moveSequence = openingMoves.concat(reversedMoves)
let moveIndex = 0
let movementEnabled = true

setInterval(() => {
    if (!movementEnabled) {
        return
    }
    const move = moveSequence[moveIndex]
    if (move) {
        movePiece(move.from, move.to)
    }
    moveIndex = (moveIndex + 1) % moveSequence.length
}, 5000)

const animate = () => {
    controls.update()
    const viewDir = new THREE.Vector3()
    camera.getWorldDirection(viewDir)
    const lookUp = clamp(viewDir.y, 0, 1)
    const fadeOut = smoothstep(0.35, 0.75, lookUp)
    const sceneOpacity = 1 - fadeOut
    ground.material.opacity = sceneOpacity
    mountainMeshes.forEach((mesh) => {
        mesh.material.opacity = sceneOpacity
    })

    const now = performance.now()
    activeMoves.forEach((piece) => {
        const move = piece.userData.move
        if (!move) {
            activeMoves.delete(piece)
            return
        }
        const t = Math.min((now - move.startTime) / move.duration, 1)
        piece.position.x = THREE.MathUtils.lerp(move.startPos.x, move.endPos.x, t)
        piece.position.y = THREE.MathUtils.lerp(move.startPos.y, move.endPos.y, t)
        piece.position.z = THREE.MathUtils.lerp(move.startPos.z, move.endPos.z, t)
        if (t >= 1) {
            piece.userData.move = null
            activeMoves.delete(piece)
        }
    })
    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}

animate()
