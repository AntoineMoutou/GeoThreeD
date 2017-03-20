function render3DHeightmap(map, container) {
  // Initialisation
  var dimX = map.length;
  var dimZ = map[0].length;
  var halfDimX = Math.round(dimX / 2);
  var halfDimZ = Math.round(dimZ / 2);
  var clock = new THREE.Clock();
  var scene = new THREE.Scene();

  // Caméra
  var camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 1, 20000);
  camera.position.y = map[halfDimX][halfDimZ] * 10 + 500;


  // Terrain brut
  var geometry = new THREE.PlaneGeometry(7500, 7500, dimX - 1, dimZ - 1);
  geometry.applyMatrix(new THREE.Matrix4().makeRotationX(- Math.PI / 2));
  for (var x = 0; x < dimX; x++) {
    for (var z = 0; z < dimZ; z++) {
      geometry.vertices[x + z * dimX].y = map[x][z] * 10;
    } // for z
  } // for x

  // Texture
  var texture = new THREE.TextureLoader().load( "img/rock.jpg" );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set( 4, 4 );

  var mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: texture }));
  scene.add(mesh);

  // Renderer
  var renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(0xbfd1e5);
  renderer.setSize(container.clientWidth, container.clientHeight);

  // Contrôleur
  var controls = new THREE.FirstPersonControls(camera);
  controls.movementSpeed = 500;
  controls.lookSpeed = 0.1;

  container.innerHTML = "";
  container.appendChild(renderer.domElement);

  animate();

  function animate() {
    requestAnimationFrame(animate);
    render();
  } // animate

  function render() {
    controls.update(clock.getDelta());
    renderer.render(scene, camera);
  } // render
} // draw3D

function creation_matrix_perlin(m,n,res) {
  //Method that permits to create a field matrix using the method of Perlin.

  var matrix = [];
  var permtemp = definition_perlin();
  var minimum = 100000000;
  var maximum = -1;

  for (var i = 0; i < m; i++) {
    var line = [];
    for (var j = 0; j < n; j++) {
      tempval = get2dperlin(i,j,res,permtemp);
      line.push(tempval);
      if (tempval < minimum) {
        minimum = tempval;
      }
      if (tempval > maximum) {
        maximum = tempval;
      }
    }
    matrix.push(line);
  }

  //matrix=np.array(matrix)

  //var limland = -0.20;
  //var limforest = 0.05;
  var matrixforest = [];

  for (var i = 0; i < m; i++) {
    var line = [];
    for (var j = 0; j < n; j++) {
      var a = (matrix[i][j] - minimum) / (maximum - minimum) * 100;
      line.push(a);
    }
    matrixforest.push(line);
  }
  return(matrixforest);
}

function definition_perlin() {
  //Methode that permits to create a matrix of random permutation.

  var perm = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,
     142,8,99,37,240,21,10,23,190, 6,148,247,120,234,75,0,26,197,62,94,252,219,
     203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168, 68,175,
     74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,
     105,92,41,55,46,245,40,244,102,143,54, 65,25,63,161,1,216,80,73,209,76,132,
     187,208, 89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,
     64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,
     47,16,58,17,182,189,28,42,223,183,170,213,119,248,152, 2,44,154,163, 70,221,
     153,101,155,167, 43,172,9,129,22,39,253, 19,98,108,110,79,113,224,232,178,185,
     112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,
     235,249,14,239,107,49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,
     127, 4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,
     156,180];

  for (var i = 0; i < 50; i++) {
    perm = permutation(perm,i,getRandomInt(0, perm.length));
  }
  return perm;
}

function permutation(list_of_element,i,j) {
  //Method that permits to exchange 2 elements in a list and to return this modificated list.

  var a = list_of_element[i];
  var b = list_of_element[j];
  list_of_element[j] = a;
  list_of_element[i] = b;

  return list_of_element;
}

function get2dperlin(x,y,res,perm) {
  //Method that permits to create an element in a random coherent matrix.

  var unit = 1/Math.sqrt(2);
  var gradient2 = [[unit,unit],[-unit,unit],[unit,-unit],[-unit,-unit],[1,0],[-1,0],[0,1],[0,-1]];

  var permtable=[];

  for (var i = 0; i < 511; i++) {
    permtable.push(perm[i & 255]);
  }

  //Adapter pour la résolution
  x = x/res;
  y = y/res;

  //On récupère les positions de la grille associée à (x,y)
  var x0 = Math.trunc(x);
  var y0 = Math.trunc(y);

  // On fait un masquage, ii et jj sont compris entre 0 et 255
  var ii = Math.trunc(x0 & 255);
  var jj = Math.trunc(y0 & 255);

  // Le modulo (%) 8 limite les valeurs de grad1 et grad4 entre 0 et 7
  var gi0 = perm[(ii + perm[jj])%256] % 8;
  var gi1 = perm[(ii + 1 + perm[jj])%256] % 8;
  var gi2 = perm[(ii + perm[jj + 1])%256] % 8;
  var gi3 = perm[(ii + 1 + perm[jj + 1])%256] % 8;

  var tempX = x - x0;
  var tempY = y - y0;

  var s = gradient2[gi0][0] * tempX + gradient2[gi0][1] * tempY;

  tempX = x - (x0 + 1);
  tempY = y - y0;

  var t = gradient2[gi1][0] * tempX + gradient2[gi1][1] * tempY;

  tempX = x - x0;
  tempY = y - (y0+1);

  var u = gradient2[gi2][0] * tempX + gradient2[gi2][1] * tempY;

  tempX = x - (x0 + 1);
  tempY = y - (y0 + 1);

  var v = gradient2[gi3][0] * tempX + gradient2[gi3][1] * tempY;

  //Lissage
  var tmp = x - x0;

  var Cx = 3 * tmp * tmp - 2 * tmp * tmp * tmp;

  var Li1 = s + Cx * (t - s);
  var Li2 = u + Cx * (v - u);

  tmp = y - y0;

  var Cy = 3 * tmp * tmp - 2 * tmp * tmp * tmp;

  var a = Li1 + Cy * (Li2 - Li1);

  return (a)
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

var map = creation_matrix_perlin(200,200,25);
var container = document.getElementById("container")
render3DHeightmap(map, container);
