
// Matrices
var model = 0;
var view = 0;
var projection = 0;

var modelStack = [];

function degToRad(degrees) {
        return degrees * Math.PI / 180;
}

function pushMatrix(stack, matrix) {
	var copy = mat4.create();
	mat4.set(matrix, copy);
	stack.push(copy);
	return stack;
}

function popMatrix(stack) {
	var matrix;
	if (stack.length == 0) {
	  throw "Invalid popMatrix!";
	}
	matrix = stack.pop();
	return matrix;
}



function getShader(gl, id) {
	var shaderScript = document.getElementById(id);

	if (!shaderScript) {
		return null;
	}

	var str = "";
	var k = shaderScript.firstChild;
	while (k) {
		if (k.nodeType == 3) {
		  str += k.textContent;
		}
		k = k.nextSibling;
	}

	var shader;
	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.log(gl.getShaderInfoLog(shader));
	return null;
	}

	return shader;
}

function initShaders (gl) {
	console.log(gl);
	var fragmentShader = getShader(gl, "shader-fs");
	var vertexShader = getShader(gl, "shader-vs");

	var shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
	  console.log("Could not initialise shaders");
	}

	gl.useProgram(shaderProgram);

	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	shaderProgram.projection = gl.getUniformLocation(shaderProgram, "projection");
	shaderProgram.model = gl.getUniformLocation(shaderProgram, "model");
	shaderProgram.view = gl.getUniformLocation(shaderProgram, "view");
	return shaderProgram;
}



 function setMatrixUniforms (gl, shaderProgram) {

	gl.uniformMatrix4fv(shaderProgram.projection, false, projection);
	gl.uniformMatrix4fv(shaderProgram.model, false, model);
	gl.uniformMatrix4fv(shaderProgram.view, false, view);

}

function initBuffers (gl) {
	squareVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
  vertices = [
       0.0,  0.0,  0.0,
       1.0,  1.0,  0.0,
       1.0,  1.0,  0.0,
       2.0,  7.0,  0.0,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  squareVertexPositionBuffer.itemSize = 3;
  squareVertexPositionBuffer.numItems = 4;
}

GlViewer = function(canvasId) {
	var triangleVertexPositionBuffer;

  this.backgroundColor = [0.0, 0.0, 0.0, 1.0];
  this.foregroundColor = [1.0, 1.0, 1.0, 1.0];

	this.initGL(canvasId);
	console.log(" Gl created ");
}

GlViewer.prototype.initGL = function(canvasId) {
	model = mat4.create();
	view = mat4.create();
	projection = mat4.create();
	
	var backgroundColor = this.backgroundColor;

	this.canvas = document.getElementById(canvasId);

	this.gl = this.canvas.getContext("experimental-webgl");
	this.gl.viewportWidth = this.canvas.width;
	this.gl.viewportHeight = this.canvas.height;

	// Cameracontroller calls cameracontroller.js 
	this.cameraController = new CameraController(this.canvas);
	this.cameraController.xRot = -30; //-55;
	this.cameraController.yRot = 0; 
	 
	this.shaderProgram = initShaders(this.gl);
	initBuffers(this.gl, this.shaderProgram);
	
	this.gl.clearColor(backgroundColor[0], backgroundColor[1], backgroundColor[2], backgroundColor[3]);
	this.gl.enable(this.gl.DEPTH_TEST);

	model = mat4.create();
  projection = mat4.create();

	console.log(" initGL  ");
	// console.log(model);           

}


GlViewer.prototype.drawScene = function () {
	var gl = this.gl;
	var shaderProgram = this.shaderProgram;
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Set up the model, view and projection matrices
  // mat4.identity(projection);
  mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, projection);

  mat4.identity(view);
  

  // Add in camera controller's rotation
  mat4.identity(model);
  mat4.translate(model, [-2.0, 0.0, -50.0]);
  
  mat4.rotate(model, this.cameraController.xRot, [1, 0, 0]);
  mat4.rotate(model, this.cameraController.yRot, [0, 1, 0]);

	// pushMatrix(modelStack, model);

		gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    setMatrixUniforms(gl, shaderProgram);
    gl.drawArrays(gl.LINES, 0, squareVertexPositionBuffer.numItems);

	// model = popMatrix(modelStack);
	
}

var lastTime = 0;

GlViewer.prototype.animate = function () {
  var timeNow = new Date().getTime();
  if (lastTime != 0) {
    var elapsed = timeNow - lastTime;

    this.rTri += (90 * elapsed) / 1000.0;
    this.rSquare += (75 * elapsed) / 1000.0;
  }
	lastTime = timeNow;
}


  
GlViewer.prototype.update = function(amplitudes) {
	// this.drawScene();
}