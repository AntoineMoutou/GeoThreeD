function render3DHeightmap() {

  var map = creation_matrix_perlin(128,128,50);

  if (document.getElementById("cbox1").checked) {
    surrection(map);
  }

  var matrix_water = creation_matrix_water(map);

  if (document.getElementById("cbox3").checked) {
    erosion(map,matrix_water);
    matrix_water = creation_matrix_water(map);
  }

  var container = document.getElementById("container");

  // Initialisation
  var dimX = map.length;
  var dimZ = map[0].length;
  var halfDimX = Math.round(dimX / 2);
  var halfDimZ = Math.round(dimZ / 2);
  var clock = new THREE.Clock();
  var scene = new THREE.Scene();

  // Caméra
  var camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 200000);
  camera.position.y = map[halfDimX][halfDimZ] * 10 + 1000;
  camera.position.z = 10000;

  // Terrain brut
  var geometry = new THREE.PlaneGeometry(7500, 7500, dimX - 1, dimZ - 1);
  geometry.applyMatrix(new THREE.Matrix4().makeRotationX(- Math.PI / 2));
  for (var x = 0; x < dimX; x++) {
    for (var z = 0; z < dimZ; z++) {
      geometry.vertices[x + z * dimX].y = map[x][z] * 10;
    } // for z
  } // for x

  // Texture
  var img = update_texture(dimX,dimZ,map,matrix_water);
  document.getElementById("photo").src = img.toDataURL();
  var texture = new THREE.Texture(img);
  texture.needsUpdate = true;

  //Mesh
  var mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: texture }));
  scene.add(mesh);

  // Renderer
  var renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(0xbfd1e5);
  renderer.setSize(container.clientWidth, container.clientHeight);

  // Contrôleur
  var controls = new THREE.FlyControls(camera);
  controls.movementSpeed = 2000;
  controls.rollSpeed = 0.2;

  container.innerHTML = "";
  container.appendChild(renderer.domElement);

  animate();

  function update_texture(dimX,dimZ,map,matrix_water) {
    //Update of the vertices with water effects

    if (document.getElementById("cbox2").checked) {
      var rainValue = 2;
      rain(matrix_water,rainValue);
    }

    var absorb_coeff = 0.5;
    waterflow(matrix_water, absorb_coeff);

    var max = 0;

    for (var x = 0, dimX = map.length; x < dimX; x++) {
      for (var z = 0, dimZ = map[0].length; z < dimZ; z++) {
        if (max < map[x][z]) {
          max = map[x][z];
        }
      } // for z
    } // for x

    var canvas = document.createElement("canvas");
    canvas.width = dimX;
    canvas.height = dimZ;

    var context = canvas.getContext("2d");
    context.fillStyle = "#000";
    context.fillRect(0, 0, dimX, dimZ);

    var image = context.getImageData(0, 0, canvas.width, canvas.height);
    var imageData = image.data;

    var i = 0;

    for (var z = 0, dimZ = map[0].length; z < dimZ; z++) {
      for (var x = 0, dimX = map.length; x < dimX; x++) {

        if (x == 0 || x == 1 || x == (dimX-1) || x == (dimX-2) || z == 0 || z == 1 || z == (dimZ-1) || z == (dimZ-2)) {

          imageData[i++] = 0;
          imageData[i++] = 127;
          imageData[i++] = 255;
          imageData[i++] = 255;

        }
        else {
          if (matrix_water[x][z][1] >= 4) {

            imageData[i++] = 0;
            imageData[i++] = 127;
            imageData[i++] = 255;
            imageData[i++] = 255;
          }
          else {

            if (map[x][z] < max/2) {
              imageData[i++] = 255 * (2 * map[x][z] / max);
              imageData[i++] = 255 ;
              imageData[i++] = 0;
              imageData[i++] = 255;
            }
            else {
              imageData[i++] = 255;
              imageData[i++] = 255 * (2 * (1 - map[x][z] / max));
              imageData[i++] = 0;
              imageData[i++] = 255;
            }
          }
        }
      } // for z
    } // for x

    context.putImageData(image, 0, 0);

    return canvas;

  }

  function animate() {
    //Function that updates the mesh

    var dimlist = document.getElementsByName("dimension");
    var dimension = 128;
    for (var i = 0; i < dimlist.length; i++) {
      if (dimlist[i].checked) {
        dimension = dimlist[i].value;
      }
    }

    if (dimX != dimension) {

      map = creation_matrix_perlin(dimension,dimension,50);

      if (document.getElementById("cbox1").checked) {
        surrection(map);
      }

      matrix_water = creation_matrix_water(map);

      if (document.getElementById("cbox3").checked) {
        erosion(map,matrix_water);
        matrix_water = creation_matrix_water(map);
      }

      dimX = map.length;
      dimZ = map[0].length;
      halfDimX = Math.round(dimX / 2);
      halfDimZ = Math.round(dimZ / 2);

      geometry = new THREE.PlaneGeometry(7500, 7500, dimX - 1, dimZ - 1);
      geometry.applyMatrix(new THREE.Matrix4().makeRotationX(- Math.PI / 2));
      for (var x = 0; x < dimX; x++) {
        for (var z = 0; z < dimZ; z++) {
          geometry.vertices[x + z * dimX].y = map[x][z] * 10;
        } // for z
      } // for x

      img = update_texture(dimX,dimZ,map,matrix_water);
      document.getElementById("photo").src = img.toDataURL();
      texture = new THREE.Texture(img);
      texture.needsUpdate = true;

      mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: texture }));
      scene = new THREE.Scene();
      scene.add(mesh);

      renderer = new THREE.WebGLRenderer();
      renderer.setClearColor(0xbfd1e5);
      renderer.setSize(container.clientWidth, container.clientHeight);

      container.innerHTML = "";
      container.appendChild(renderer.domElement);

    }

    else {

      if (document.getElementById("cbox1").checked) {
        surrection(map);

        matrix_water = creation_matrix_water(map);

        if (document.getElementById("cbox3").checked) {
          erosion(map,matrix_water);
          matrix_water = creation_matrix_water(map);
        }

        dimX = map.length;
        dimZ = map[0].length;
        halfDimX = Math.round(dimX / 2);
        halfDimZ = Math.round(dimZ / 2);

        geometry = new THREE.PlaneGeometry(7500, 7500, dimX - 1, dimZ - 1);
        geometry.applyMatrix(new THREE.Matrix4().makeRotationX(- Math.PI / 2));
        for (var x = 0; x < dimX; x++) {
          for (var z = 0; z < dimZ; z++) {
            geometry.vertices[x + z * dimX].y = map[x][z] * 10;
          } // for z
        } // for x
      }

      else if (document.getElementById("cbox3").checked) {
        erosion(map,matrix_water);
        matrix_water = creation_matrix_water(map);

        dimX = map.length;
        dimZ = map[0].length;
        halfDimX = Math.round(dimX / 2);
        halfDimZ = Math.round(dimZ / 2);

        geometry = new THREE.PlaneGeometry(7500, 7500, dimX - 1, dimZ - 1);
        geometry.applyMatrix(new THREE.Matrix4().makeRotationX(- Math.PI / 2));
        for (var x = 0; x < dimX; x++) {
          for (var z = 0; z < dimZ; z++) {
            geometry.vertices[x + z * dimX].y = map[x][z] * 10;
          } // for z
        } // for x
      }

      img = update_texture(dimX,dimZ,map,matrix_water);
      document.getElementById("photo").src = img.toDataURL();
      texture = new THREE.Texture(img);
      texture.needsUpdate = true;

      mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: texture }));
      scene = new THREE.Scene();
      scene.add(mesh);

      renderer = new THREE.WebGLRenderer();
      renderer.setClearColor(0xbfd1e5);
      renderer.setSize(container.clientWidth, container.clientHeight);

      container.innerHTML = "";
      container.appendChild(renderer.domElement);

    }

    setTimeout(animate,100);
    render();
  } // animate

  function render() {
    controls.update(clock.getDelta());
    renderer.render(scene, camera);
  } // render
} // draw3D

function surrection(map) {

  var dimX = map.length;
  var dimZ = map[0].length;
  var a1 = 0.00001;
  var a2 = 0.0000000001;
  var a3 = 0.5;

  for (var i = 0; i < map.length; i++) {
    for (var j = 0; j < map[0].length; j++) {
      if (map[i][j] != 0) {
        var r = Math.sqrt((dimX/2 - i)**2 + (dimZ/2 - j)**2);
        var mx = Math.sqrt((dimX/2)**2 + (dimZ/2)**2);
        var s = a1 * (a3*(mx-r))**3 - a2 * (r**2);
        map[i][j] += s;
      }
    }
  }
}

function waterflow(matrix_water, absorb_coeff) {
  //Function that perform the waterflow

  //Initialisation of matrix_water_updated
  var matrix_water_updated = [];

  for (var i = 0; i < matrix_water.length; i++) {
    var ligne = []
    for (var j = 0; j < matrix_water[0].length; j++) {
      ligne.push([matrix_water[i][j][0],matrix_water[i][j][1]]);
    }
    matrix_water_updated.push(ligne);
  }

  for (var i = 1; i < (matrix_water_updated.length - 1); i++) {
    for (var j = 1; j < (matrix_water_updated[0].length - 1); j++) {
      var v1 = matrix_water[i-1][j][0] + matrix_water[i-1][j][1]/10;
      var v2 = matrix_water[i][j+1][0] + matrix_water[i][j+1][1]/10;
      var v3 = matrix_water[i+1][j][0] + matrix_water[i+1][j][1]/10;
      var v4 = matrix_water[i][j-1][0] + matrix_water[i][j-1][1]/10;
      // var v5 = matrix_water[i-1][j-1][0] + matrix_water[i-1][j-1][1]/10;
      // var v6 = matrix_water[i+1][j+1][0] + matrix_water[i+1][j+1][1]/10;
      // var v7 = matrix_water[i+1][j-1][0] + matrix_water[i+1][j-1][1]/10;
      // var v8 = matrix_water[i-1][j+1][0] + matrix_water[i-1][j+1][1]/10;

      // var min = Math.min(Math.min(Math.min(v1, v2), Math.min(v3,v4)),Math.min(Math.min(v5, v6), Math.min(v7,v8)));
      var min = Math.min(Math.min(v1, v2), Math.min(v3,v4));

      if (v1 == min) {
        matrix_water_updated[i-1][j][1] += matrix_water[i][j][1] * (1 - absorb_coeff);
      }
      else if (v2 == min) {
        matrix_water_updated[i][j+1][1] += matrix_water[i][j][1] * (1 - absorb_coeff);
      }
      else if (v3 == min) {
        matrix_water_updated[i+1][j][1] += matrix_water[i][j][1] * (1 - absorb_coeff);
      }
      else if (v4 == min) {
        matrix_water_updated[i][j-1][1] += matrix_water[i][j][1] * (1 - absorb_coeff);
      }
      // else if (v5 == min) {
      //   matrix_water_updated[i-1][j-1][1] += matrix_water[i][j][1] * (1 - absorb_coeff);
      // }
      // else if (v6 == min) {
      //   matrix_water_updated[i+1][j+1][1] += matrix_water[i][j][1] * (1 - absorb_coeff);
      // }
      // else if (v7 == min) {
      //   matrix_water_updated[i+1][j-1][1] += matrix_water[i][j][1] * (1 - absorb_coeff);
      // }
      // else if (v8 == min){
      //   matrix_water_updated[i-1][j+1][1] += matrix_water[i][j][1] * (1 - absorb_coeff);
      // }
      else {
        matrix_water_updated[i][j][1] += matrix_water[i][j][1] * (1 - absorb_coeff);
      }

      matrix_water_updated[i][j][1] -= matrix_water[i][j][1];
    }
  }
  for (var i = 0; i < matrix_water.length; i++) {
    for (var j = 0; j < matrix_water[0].length; j++) {
      matrix_water[i][j][1] = matrix_water_updated[i][j][1];
    }
  }
}

function rain(matrix_water,rainValue) {
  //Function that fill a matrix_water with a uniform method

  for (var i = 0; i < matrix_water.length; i++) {
    for (var j = 0; j < matrix_water[0].length; j++) {
      matrix_water[i][j][1] += rainValue;
    }
  }
}

function erosion(map,matrix_water) {

  for (var i = 1; i < matrix_water.length-1; i++) {
    for (var j = 1; j < matrix_water[0].length-1; j++) {

      var v1 = matrix_water[i-1][j][0] + matrix_water[i-1][j][1]/10;
      var v2 = matrix_water[i][j+1][0] + matrix_water[i][j+1][1]/10;
      var v3 = matrix_water[i+1][j][0] + matrix_water[i+1][j][1]/10;
      var v4 = matrix_water[i][j-1][0] + matrix_water[i][j-1][1]/10;

      var max = Math.max(Math.max(v1, v2), Math.max(v3,v4));
      var min = Math.min(Math.min(v1, v2), Math.min(v3,v4));

      var slope = (max-min)/2 + 1;

      var a1 = 0.05;

      var s = a1 * matrix_water[i][j][1] ;

      map[i][j] -= s;

      if (map[i][j] < 0) {
        map[i][j] = 0;
      }
    }
  }
}

function creation_matrix_water(map) {
  //Function that create a matrix representing the squares between the vertices with an water attribute.

  var matrix_water = [];
  for (var i = 1; i < map.length; i++) {
    var line = [];
    for (var j = 1; j < map[0].length; j++) {
      if (map[i][j] == 0 || map[i-1][j] == 0 || map[i][j-1] == 0 ||map[i-1][j-1] == 0) {
        line.push([0, 0]);
      }
      else {
        line.push([(map[i][j]+map[i-1][j]+map[i][j-1]+map[i-1][j-1])/4, 0]);
      }
    }
    matrix_water.push(line);
  }
  return matrix_water;
}

function creation_matrix_hardness(map) {
  //Function that create a matrix representing the squares between the vertices with an hardness attribute.

  var matrix_hardness = [];
  for (var i = 1; i < map.length; i++) {
    var line = [];
    for (var j = 1; j < map[0].length; j++) {
      if (map[i][j] == 0 || map[i-1][j] == 0 || map[i][j-1] == 0 ||map[i-1][j-1] == 0) {
        line.push([0, 0]);
      }
      else {
        line.push([(map[i][j]+map[i-1][j]+map[i][j-1]+map[i-1][j-1])/4, 0]);
      }
    }
    matrix_hardness.push(line);
  }
  return matrix_hardness;
}

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

  var matrixforest = [];

  for (var i = 0; i < m; i++) {
    var line = [];
    for (var j = 0; j < n; j++) {
      var a = (matrix[i][j] - minimum) / (maximum - minimum) * 200 * coeff_map(i,j,m,n);
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

function bij_coeff(k,o) {
  var c;
  if (o % 2 == 0) {
    if (k < o / 2) {
      c = k / (o / 2 - 1);
    }
    else {
      c = (o - k - 1) / (o / 2 - 1);
    }
  }
  else {
    if (k < o / 2) {
      c = k / ((o + 1) / 2 - 1);
    }
    else {
      c = (o - k - 1) / ((o + 1) / 2 - 1);
    }
  }
  return c;
}

function coeff_map(i, j, m, n) {
  var a = bij_coeff(i, m);
  var b = bij_coeff(j, n);
  var s = Math.min(a,b);

  return s;
}

render3DHeightmap();
