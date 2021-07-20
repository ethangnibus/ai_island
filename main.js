
// from https://sbcode.net/threejs/raycaster/

// =================================================
// =============== Define Constants ================

const board_width = 20;
const board_height = 20;
const cube_width = 1;

const cylinder_geometry = new THREE.CylinderGeometry(board_width * 0.8, board_width, 5, 32 );
const box_geometry = new THREE.BoxGeometry(cube_width, 3, cube_width);

const tan_mat = new THREE.MeshBasicMaterial( { color: 0xd2b48c, wireframe: false} );
const brown_mat = new THREE.MeshBasicMaterial( { color: 0xad8261, wireframe: false} );
const light_red_mat = new THREE.MeshBasicMaterial( { color: 0xe80000, wireframe: false} );
const dark_red_mat = new THREE.MeshBasicMaterial( { color: 0xc90000, wireframe: false} );
const green_mat = new THREE.MeshBasicMaterial( { color: 0x047027, wireframe: false} );
const lwall_mat = new THREE.MeshBasicMaterial( { color: 0x3d4057, wireframe: false} );
const dwall_mat = new THREE.MeshBasicMaterial( { color: 0x2d3042, wireframe: false} );
const materials = [tan_mat, brown_mat];

const CUBE_Y_DEFAULT = -3.5;
const CUBE_Y_SELECTED = CUBE_Y_DEFAULT + 0.2;
const CUBE_Y_CLICKED = CUBE_Y_DEFAULT + 1;
const CUBE_Y_CSELECTED = CUBE_Y_CLICKED + 0.2;

const mouse = new THREE.Vector2();
mouse.x = Infinity;
mouse.y = Infinity;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer(antialias = false);
const controls = new THREE.OrbitControls(camera, renderer.domElement);
const raycaster = new THREE.Raycaster();


// =================================================
// ============= Add Event Listeners ===============

document.addEventListener( 'mousemove', onDocumentMouseMove, false );
document.addEventListener( 'click', onDocumentClick, false );


// =================================================
// ============ Configure Window Size ==============

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
};


// =================================================
// ========== Configure Orbit Controls =============

controls.minDistance = board_width;
controls.maxDistance = board_width * 5;
controls.maxPolarAngle = Math.PI/2;
controls.enablePan = false;
controls.enableDamping = true;   //damping 
controls.dampingFactor = 0.10;   //damping inertia
controls.enableZoom = true;
controls.zoomSpeed = 0.25;
controls.enableRotate = true;
controls.rotateSpeed = 0.35;
controls.autoRotate = true;
controls.autoRotateSpeed = 2.0;
camera.position.set(board_width * 2, board_width / 2, board_width * 2);

camera.position.z = 5 * Math.max(board_width, board_height) / 4;


// =================================================
// ============== Initialize Board =================

let i;
let cube;
let cubes = [];
let cube_tuples = [];
let mat_index = 1;

for (i = 0; i < board_width * board_height; i += 1) {
    if (i % board_width == 0 && (board_width % 2 == 0)) {
        mat_index = 1 - mat_index;
    }
    cube = new THREE.Mesh(box_geometry, materials[mat_index]);
    cube.position.x = (i % board_width) - (board_width/2) + (cube_width / 2);
    cube.position.z = -Math.floor(i / board_width) + (board_height/2) - (cube_width / 2);
    cube.position.y = CUBE_Y_DEFAULT;

    scene.add(cube);
    cubes.push(cube);
    // cube_tuple = (default_material, isClicked)
    cube_tuple = (materials[mat_index], false);
    cube_tuples.push(cube_tuple);
    mat_index = 1 - mat_index;
}


// =================================================
// ============ Initialize Decorations =============

mountaintop = new THREE.Mesh(cylinder_geometry, green_mat);
mountaintop.position.x = 0
mountaintop.position.z = 0
mountaintop.position.y = CUBE_Y_DEFAULT - 2;
scene.add(mountaintop);


// =================================================
// =================================================


let selected_cube = null;
let last_mat;
// game logic
var update = function() {
    let cameraPos = camera.position;
    controls.update();

    let vector = new THREE.Vector3(mouse.x, mouse.y, 1);
    vector.unproject(camera);
    let ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    let intersects = ray.intersectObjects(scene.children, true);

    if (intersects.length > 0 && cameraPos == camera.position) {
        // make the cursor a pointer
        $('html,body').css('cursor', 'pointer');

        if (selected_cube != null) {
            let cube_index = (selected_cube.position.x) + selected_cube.position.z * board_width;
            console.log(cube_index);
        }

        // If the selected cube is different than the last one
        if (intersects[0].object != selected_cube) {
            // revert changes to old selected_cube if it has not been clicked
            if (selected_cube != null) {
                selected_cube.material = last_mat;
                if (selected_cube.position.y == CUBE_Y_SELECTED) {
                    selected_cube.position.y = CUBE_Y_DEFAULT;
                } else if (selected_cube.position.y == CUBE_Y_CSELECTED) {
                    selected_cube.position.y = CUBE_Y_CLICKED;
                }
            }

            // store properties of new selected_cube
            selected_cube = intersects[0].object;
            last_mat = selected_cube.material;

            // make changes to new selected_cube
            if (selected_cube.geometry == box_geometry) {
                if (selected_cube.material == tan_mat || selected_cube.material == lwall_mat) {
                    selected_cube.material = light_red_mat;
                } else {
                    selected_cube.material = dark_red_mat;
                }
            }
            if (selected_cube.position.y == CUBE_Y_DEFAULT) {
                selected_cube.position.y = CUBE_Y_SELECTED;
            } else if (selected_cube.position.y == CUBE_Y_CLICKED) {
                selected_cube.position.y = CUBE_Y_CSELECTED;
            }
        }
    } else {
        // make the cursor the user default
        $('html,body').css('cursor', 'default');

        // revert changes to old selected cube
        if (selected_cube != null) {
            selected_cube.material = last_mat;
            if (selected_cube.position.y == CUBE_Y_SELECTED) {
                selected_cube.position.y = CUBE_Y_DEFAULT;
            } else if (selected_cube.position.y == CUBE_Y_CSELECTED) {
                selected_cube.position.y = CUBE_Y_CLICKED;
            }
        }

        // set selected_cube to null
        selected_cube = null;
    }
}

// ==================================================
// =============== MouseMove Event ==================

function onDocumentMouseMove ( event ) {
    event.preventDefault();
    
    mouse.x = ( event.clientX / renderer.domElement.width ) * 2 - 1;
    mouse.y = -( event.clientY / renderer.domElement.height ) * 2 + 1;

    // if (mouseDown && !mouseDragging) {
    //     mouseDragging = true;
    // }
}


// ==================================================
// ================== Click Event) ==================

function onDocumentClick( event ) {
    event.preventDefault();
    if (controls.autoRotate) {
        controls.autoRotate = false;
    }
    if (selected_cube == null) return;
    if (selected_cube.position.y == CUBE_Y_SELECTED) {
        selected_cube.position.y = CUBE_Y_CSELECTED;
        console.log(last_mat);
        if (last_mat == brown_mat) {
            last_mat = dwall_mat;
        } else if (last_mat == tan_mat) {
            last_mat = lwall_mat;
        }
    } else if (selected_cube.position.y == CUBE_Y_CSELECTED) {
        selected_cube.position.y = CUBE_Y_SELECTED;
        console.log(last_mat);
        if (last_mat == dwall_mat) {
            last_mat = brown_mat;
        } else if (last_mat == lwall_mat) {
            last_mat = tan_mat;
        }
    }
}


// ==================================================
// ===== Run Game Loop (update, render, repeat) =====

// draw scene
var render = function() {
    renderer.render(scene, camera);
};

var GameLoop = function() {
    requestAnimationFrame(GameLoop);
    update();
    render();
};

GameLoop();