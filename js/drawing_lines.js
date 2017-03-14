var renderer;
var scene;
var camera;
var mesh;
var line;

init();
create_blue_line();
render();

camera.position.z = 5;

function init() {
  //Function that initialize the scene

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 500);
  camera.position.set(0, 0, 100);
  camera.lookAt(new THREE.Vector3(0, 0, -1));

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("container").appendChild(renderer.domElement);
}

function create_blue_line() {
  //Function that creates a blue LineBasicMaterial

  var geometry = new THREE.Geometry();
  geometry.vertices.push(new THREE.Vector3(-10, 0, 0));
  geometry.vertices.push(new THREE.Vector3(0, 10, 0));
  geometry.vertices.push(new THREE.Vector3(10, 0, 0));

  var material = new THREE.LineBasicMaterial({color: 0x0000ff});

  line = new THREE.Line(geometry, material);
  scene.add(line);
}

function render() {

  renderer.render(scene, camera);
}
