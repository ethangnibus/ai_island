
// from https://sbcode.net/threejs/raycaster/

// =================================================
// =============== Define Constants ================

const board_width = 10;
const board_height = 10;
const cube_width = 1;

let intro_text;
let intro_text_rising = false;

const cylinder_geometry = new THREE.CylinderGeometry(board_width * 0.8, board_width, 5, 32 );
const box_geometry = new THREE.BoxGeometry(cube_width, 3, cube_width);
const pole_geometry = new THREE.BoxGeometry(0.1, 100, 0.1);
const water_geometry = new THREE.SphereGeometry(board_width * 60, 20, 20);
const waves_geometry = new THREE.SphereGeometry(board_width * 60, 21, 21);
const skybox_geometry = new THREE.CylinderGeometry(board_width * 47, board_width * 47, 1000, 32 );
const pirate_geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
const treasure_geometry = new THREE.SphereGeometry(0.5, 16, 16);


const tan_mat = new THREE.MeshBasicMaterial( { color: 0xd2b48c, wireframe: false} );
const brown_mat = new THREE.MeshBasicMaterial( { color: 0xad8261, wireframe: false} );
const light_red_mat = new THREE.MeshBasicMaterial( { color: 0xe80000, wireframe: false} );
const dark_red_mat = new THREE.MeshBasicMaterial( { color: 0xc90000, wireframe: false} );
const teal_mat = new THREE.MeshBasicMaterial( { color: 0x34ebe1, wireframe: false} );
const green_mat = new THREE.MeshBasicMaterial( { color: 0x047027, wireframe: false} );
const lwall_mat = new THREE.MeshBasicMaterial( { color: 0x3d4057, wireframe: false} );
const dwall_mat = new THREE.MeshBasicMaterial( { color: 0x2d3042, wireframe: false} );
const water_mat = new THREE.MeshBasicMaterial( { color: 0x0d0233, wireframe: false} );
const waves_mat = new THREE.MeshBasicMaterial( { color: 0x041d5c, wireframe: false} );
const skybox_mat = new THREE.MeshBasicMaterial( { color: 0x360404, wireframe: false} );
const test_mat = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true} );
const materials = [tan_mat, brown_mat];

const CUBE_Y_DEFAULT = -3.5;
const CUBE_Y_SELECTED = CUBE_Y_DEFAULT + 0.2;
const CUBE_Y_CLICKED = CUBE_Y_DEFAULT + 1;
const CUBE_Y_CSELECTED = CUBE_Y_CLICKED + 0.2;
const AGENT_DEFAULT = CUBE_Y_DEFAULT + 2;
const AGENT_SELECTED = AGENT_DEFAULT + 0.2;
const AGENT_PLUCKED = AGENT_DEFAULT + 1

const mouse = new THREE.Vector2();
mouse.x = Infinity;
mouse.y = Infinity;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer(antialias = true);
const controls = new THREE.OrbitControls(camera, renderer.domElement);
const raycaster = new THREE.Raycaster();


const fontLoader = new THREE.FontLoader();
fontLoader.load("fonts/TimesNewRoman.json",function(font){ 
    const text_geometry = new THREE.TextGeometry( 'Welcome to AI Island!', {
        font: font,
        size: 1.5,
        height: 1,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.005,
        bevelSize: 0.005,
        bevelOffset: 0,
        bevelSegments: 5
    } );

    var  text = new THREE.Mesh(text_geometry , lwall_mat);

    // positioning font
    text.position.x = -9.5;
    text.position.z = -0.5;
    text.position.y = 6;
    scene.add(text);

    intro_text = text;

})


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
let gameState = [];
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
    // gamestate
    //   0 = path
    //   1 = wall
    //   2 = pirate
    //   3 = treasure
    gameState.push(0);
    // cube_tuple = (default_material, isClicked)
    cube_tuple = (materials[mat_index], false);
    cube_tuples.push(cube_tuple);
    mat_index = 1 - mat_index;
}

// Set up Pirate
// island
let pirate = new THREE.Mesh(pirate_geometry, green_mat);
pirate.position.x = -(board_width/2) + (cube_width / 2);
pirate.position.z = (board_height/2) - (cube_width / 2);
pirate.position.y = AGENT_DEFAULT;
scene.add(pirate);
gameState[0] = 2;

// Set up Treasure
let treasure = new THREE.Mesh(treasure_geometry, green_mat);
treasure.position.x = (board_width - 1) - (board_width/2) + (cube_width / 2);;
treasure.position.z = -(board_width - 1) + (board_height/2) - (cube_width / 2);
treasure.position.y = AGENT_DEFAULT;
scene.add(treasure);
gameState[board_width * board_width - 1] = 3




// =================================================
// ============ Initialize Decorations =============

// island
let mountaintop = new THREE.Mesh(cylinder_geometry, green_mat);
mountaintop.position.x = 0;
mountaintop.position.z = 0;
mountaintop.position.y = CUBE_Y_DEFAULT - 2;
scene.add(mountaintop);

// water
let water = new THREE.Mesh(water_geometry, water_mat);
water.position.x = 0
water.position.z = 0
water.position.y = CUBE_Y_DEFAULT - board_height * 60;
water.rotation.x = 3 * Math.PI / 2;
scene.add(water);

let twater = new THREE.Mesh(waves_geometry, waves_mat);
twater.position.x = 0
twater.position.z = 0
twater.position.y = CUBE_Y_DEFAULT - board_height * 60;
twater.rotation.x = 2 * Math.PI / 2;
scene.add(twater);

// sky
skybox_mat.side = THREE.BackSide;
let sky = new THREE.Mesh(skybox_geometry, skybox_mat);
sky.position.x = 0
sky.position.z = 0
sky.position.y = CUBE_Y_DEFAULT - 2;
scene.add(sky);

// =================================================
// =============== Update Function =================

let selected = null;
let last_mat;
let time = 0;
let mode = "Editing Walls";
let pluckedObject = null;

// game logic
var update = function() {

    // Update details
    controls.update();
    twater.rotation.x = time + 0.1;
    water.rotation.x = time;
    time += 0.0005;

    // make text rise
    if (intro_text_rising) {
        intro_text.position.y += 0.1;
        
        if (intro_text.position.y > 100) {
            intro_text.geometry.dispose();
            intro_text.material.dispose();
            scene.remove(intro_text);
            intro_text_rising = false;
        }
    }

    // find intersected object
    let vector = new THREE.Vector3(mouse.x, mouse.y, 1);
    vector.unproject(camera);
    let ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    var intersects = ray.intersectObjects(scene.children, true);

    switch (mode) {
        case "Editing Walls":
            handleEditingWalls(intersects);
            break;
        case "Moving Pirate":
            handleMovingPirate(intersects);
            break;
        case "Moving Treasure":
            handleMovingTreasure(intersects);
            break;
    }
}


// =================================================
// ================= Walls Mode ====================

function handleEditingWalls(intersects) {
    if (intersects.length > 0) {
        // make the cursor a pointer if the object is interactable
        if (intersects[0].geometry == box_geometry || intersects[0].geometry == pirate_geometry || intersects[0].geometry == treasure_geometry) {
            $('html,body').css('cursor', 'pointer');
        } else {
            $('html,body').css('cursor', 'default');
        }

        if (selected != null && selected.geometry == box_geometry) {
            let cube_index = (selected.position.x + (board_width/2) - (cube_width/2)) + (selected.position.z - (board_height/2) + (cube_width/2)) * -board_width;
            console.log(cube_index);
        }

        // If the selected cube is different than the last one
        if (intersects[0].object != selected) {
            // revert changes to old selected if it has not been clicked
            if (selected != null) {
                selected.material = last_mat;
                if (selected.position.y == CUBE_Y_SELECTED) {
                    selected.position.y = CUBE_Y_DEFAULT;
                } else if (selected.position.y == CUBE_Y_CSELECTED) {
                    selected.position.y = CUBE_Y_CLICKED;
                } else if (selected.position.y == AGENT_SELECTED) {
                    selected.position.y = AGENT_DEFAULT;
                }
            }

            // store properties of new selected
            selected = intersects[0].object;
            last_mat = selected.material;

            // make changes to new selected
            if (selected.geometry == box_geometry) {
                if (selected.material == tan_mat || selected.material == lwall_mat) {
                    selected.material = light_red_mat;
                } else {
                    selected.material = dark_red_mat;
                }
            } else if (selected.geometry == pirate_geometry || selected.geometry == treasure_geometry) {
                selected.material = teal_mat;
            }
            if (selected.position.y == CUBE_Y_DEFAULT) {
                selected.position.y = CUBE_Y_SELECTED;
            } else if (selected.position.y == CUBE_Y_CLICKED) {
                selected.position.y = CUBE_Y_CSELECTED;
            } else if (selected.position.y == AGENT_DEFAULT) {
                selected.position.y = AGENT_SELECTED;
            }
        }
    } else {
        // make the cursor the user default
        $('html,body').css('cursor', 'default');

        // revert changes to old selected cube
        if (selected != null) {
            selected.material = last_mat;
            if (selected.position.y == CUBE_Y_SELECTED) {
                selected.position.y = CUBE_Y_DEFAULT;
            } else if (selected.position.y == CUBE_Y_CSELECTED) {
                selected.position.y = CUBE_Y_CLICKED;
            }
        }

        // set selected to null
        selected = null;
    }
}

// =================================================
// =============== Moving Pirate =================

function handleMovingPirate(intersects) {
    if (intersects.length > 0) {
        // hilight cube under pirate blue
        if (intersects[0].geometry == box_geometry) {
            $('html,body').css('cursor', 'pointer');
        } else {
            $('html,body').css('cursor', 'default');
        }

        // find new selected object
        if (intersects[0] == pluckedObject && intersects.length > 1) {
            selected = intersects[1];
        } else {
            selected = intersects[0];
        }

        // if selected object is a cube snap pirate to tile above cube
        if (selected.geometry == box_geometry) {
            // make pluckedObject's position the same as selected's
            pluckedObject.position.x = selected.position.x;
            pluckedObject.position.z = selected.position.z;

            selected.material = teal_mat;
        }
    }
}


// =================================================
// =============== Moving Treasure =================

function handleMovingTreasure(intersects) {

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

function onDocumentClick(event) {
    event.preventDefault();
    if (controls.autoRotate) {
        controls.autoRotate = false;
        intro_text_rising = true;
    }

    let cube_index = (selected.position.x + (board_width/2) - (cube_width/2)) + (selected.position.z - (board_height/2) + (cube_width/2)) * -board_width;
    switch (selected.geometry) {
        case box_geometry:
            clickCube(cube_index);
            break;
        case pirate_geometry:
            clickPirate(cube_index);
            break;
        case treasure_geometry:
            clickTreasure(cube_index);
            break;
    }
    console.log(gameState);
}


function clickCube(cube_index) {
    switch(gameState[cube_index]) {
        // Path
        case 0:
            selected.position.y = CUBE_Y_CSELECTED;
            if (last_mat == brown_mat) {
                last_mat = dwall_mat;
                gameState[cube_index] = 1;
            } else if (last_mat == tan_mat) {
                last_mat = lwall_mat;
                gameState[cube_index] = 1;
            }
            break;
        
        // Wall
        case 1:
            selected.position.y = CUBE_Y_SELECTED;
            if (last_mat == dwall_mat) {
                last_mat = brown_mat;
                gameState[cube_index] = 0;
            } else if (last_mat == lwall_mat) {
                last_mat = tan_mat;
                gameState[cube_index] = 0;
            }
            break;
        
        // Pirate
        case 2:
            console.log("You cannot construct a wall on the Pirate")
            break;
        
        // Treasure
        case 3:
            console.log("You cannot construct a wall on the Treasure")
            break;
    }
}

function clickPirate(cube_index) {
    mode = "Moving Pirate";
    console.log(mode);

    selected.position.y = AGENT_PLUCKED;
    pluckedObject = selected;
}

function clickTreasure(cube_index) {
    mode = "Moving Treasure";
    console.log(mode);

    selected.position.y = AGENT_PLUCKED;
    pluckedObject = selected;
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





function debug_grid() {
    let gridsize = 100
    for (i = -gridsize; i <= gridsize; i += 1) {
        // Set up pole
        let pole;

        if (i % 2) {
            pole = new THREE.Mesh(pole_geometry, light_red_mat);
        } else {
            pole = new THREE.Mesh(pole_geometry, dark_red_mat);
        }

        pole.position.x = i;
        pole.position.z = 0;
        pole.position.y = 0;

        scene.add(pole);
    }
}

//debug_grid()