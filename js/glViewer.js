
// Matrices
var mvMatrix = 0;
var pMatrix = 0;


GlViewer = function(canvasId) {
	var triangleVertexPositionBuffer;
  var squareVertexPositionBuffer;
 

  // Background color
  this.backgroundColor = [120.0 / 255.0,
                         169.0 / 255.0,
                         100.0 / 255.0,
                         1.0];
  // Foreground color
  this.foregroundColor = [63.0 / 255.0,
                         39.0 / 255.0,
                         0.0 / 255.0,
                         1.0];

	this.initGL(canvasId);

	this.drawScene();
	}

GlViewer.prototype.initGL = function(canvasId) {
	mvMatrix = mat4.create();
	pMatrix = mat4.create();
	 var backgroundColor = this.backgroundColor;

	this.canvas = document.getElementById(canvasId);
	console.log(canvasId)
	this.gl = this.canvas.getContext("experimental-webgl");
	this.gl.viewportWidth = this.canvas.width;
	this.gl.viewportHeight = this.canvas.height;
	// Cameracontroller calls cameracontroller.js 
	this.cameraController = new CameraController(this.canvas);
	this.cameraController.xRot = -30; //-55;
	this.cameraController.yRot = 0; 
	 
	this.initShaders();
	this.initBuffers();
	
	this.gl.clearColor(backgroundColor[0], backgroundColor[1], backgroundColor[2], backgroundColor[3]);
	this.gl.enable(this.gl.DEPTH_TEST);

	mvMatrix = mat4.create();
  pMatrix = mat4.create();

	console.log(" initGL  ");
	console.log(mvMatrix);           

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

GlViewer.prototype.initShaders = function () {
	var gl = this.gl;
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

	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	this.shaderProgram = shaderProgram;
}



 GlViewer.prototype.setMatrixUniforms = function () {
	var gl = this.gl;
	
  console.log(pMatrix);

	gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, mvMatrix);
}

GlViewer.prototype.initBuffers = function () {
	var gl = this.gl;
	triangleVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
	var vertices = [
		0.0,  1.0,  0.0,
		-1.0, -1.0,  0.0,
		1.0, -1.0,  0.0
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	triangleVertexPositionBuffer.itemSize = 3;
	triangleVertexPositionBuffer.numItems = 3;

	squareVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
	vertices = [
		1.0,  1.0,  0.0,
		-1.0,  1.0,  0.0,
		1.0, -1.0,  0.0,
		-1.0, -1.0,  0.0
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	squareVertexPositionBuffer.itemSize = 3;
	squareVertexPositionBuffer.numItems = 4;
}

GlViewer.prototype.drawScene = function () {
	var gl = this.gl;
	var shaderProgram = this.shaderProgram;
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
	console.log("pMatrix: ");
	console.log(gl.viewportWidth);
	mat4.identity(mvMatrix);
	// mat4.rotate(mvMatrix, this.cameraController.xRot, 1, 0, 0);
	// mat4.rotate(mvMatrix, this.cameraController.yRot, 0, 1, 0);
	// console.log(this.cameraController);

	console.log("vMatrix: ");
	console.log(mvMatrix);
	mat4.translate(mvMatrix, [-1.5, 0.0, -10.0]);
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	this.setMatrixUniforms();
	gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);


	mat4.translate(mvMatrix, [3.0, 0.0, -5.0]);
	gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	this.setMatrixUniforms();
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
}
  
GlViewer.prototype.update = function(amplitudes) {
	// this.drawScene();
}