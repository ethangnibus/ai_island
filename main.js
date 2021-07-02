
// from https://sbcode.net/threejs/raycaster/


var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer(antialias = false);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
};

// =================================================
// =================================================

controls = new THREE.OrbitControls(camera, renderer.domElement);

var geometry = new THREE.BoxGeometry(1, 1, 1,);
const tan_mat = new THREE.MeshBasicMaterial( { color: 0xd2b48c, wireframe: false} );
const brown_mat = new THREE.MeshBasicMaterial( { color: 0xad8261, wireframe: false} );
const red_mat = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: false} );

const board_width = 50;
const board_height = 50;
let cube;

let i;
let cubes = [];
const materials = [tan_mat, brown_mat];
let mat_index = 1;

for (i = 0; i < board_width * board_height; i += 1) {
    if (i % board_width == 0) {
        mat_index = 1 - mat_index;
    }
    cube = new THREE.Mesh(geometry, materials[mat_index]);
    cube.position.x = (i % board_width) - (board_width/2);
    cube.position.z = -Math.floor(i / board_width) + (board_height/2);
    cube.position.y = -2;

    scene.add(cube);
    cubes.push(cube);
    mat_index = 1 - mat_index;
}

// cube = cubes[47];
// cube.material = red_mat;
// cube.position.y += 1;




camera.position.z = 5 * Math.max(board_width, board_height) / 4;

// game logic
// var update = function() {
//     var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
//     vector.unproject(camera);
//     var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

//     var intersects = ray.intersectObjects(eventCubesList.children, true);
//     if (intersects.length > 0) {

//         $('html,body').css('cursor', 'pointer');
//         if (intersects[0].object != INTERSECTED) {                       

//             if (highlightedTile) {
                
//             }
//                 unhighlightTile(highlightedTile);

//             INTERSECTED = intersects[0].object;
//             var timestamp = INTERSECTED.userData;

//             var selectedRow = getSelectedRow(timestamp);
//             highlightedRow = selectedRow;
//             highlightRow(selectedRow);

//         }
//         else {
//             if (INTERSECTED) {
//                 if (highlightedRow) {
//                     var timestamp = INTERSECTED.userData;
//                     var row = getSelectedRow(timestamp);
//                     unhighlightRow(row);
//                 }
//                 highlightedRow = null;

//             }


//             INTERSECTED = null;
//         }
//     }
//     else
//     {
//             $('html,body').css('cursor', 'default');
//     }

// };

// draw scene
var render = function() {
    renderer.render(scene, camera);
    // update();
};

function onDocumentMouseMove ( event ) {

    event.preventDefault();
    
    mouse.x = ( event.clientX / renderer.domElement.width ) * 2 - 1;
    mouse.y = -( event.clientY / renderer.domElement.height ) * 2 + 1;
    
    render();
}

// run game loop (update, render, repeat)
var GameLoop = function() {
    requestAnimationFrame(GameLoop);
    // update();
    render();
};

GameLoop();