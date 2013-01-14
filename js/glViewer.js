var TYPE_MIRROR = 0;
var TYPE_STRETCH = 1;

// Matrices
var model = 0;
var view = 0;
var projection = 0;

var mMatrixStack = [];

function degToRad(degrees) {
        return degrees * Math.PI / 180;
}

function mPushMatrix() {
        var copy = mat4.create();
        mat4.set(model, copy);
        mMatrixStack.push(copy);
}

function mPopMatrix() {
    if (mMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    model = mMatrixStack.pop();
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

 shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
 gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

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

function initBuffers (gl, vertices, colors) {
	lineVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, lineVertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  lineVertexPositionBuffer.itemSize = 3;
  lineVertexPositionBuffer.numItems = vertices.length/3;

  lineVertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, lineVertexColorBuffer);
 
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  lineVertexColorBuffer.itemSize = 4;
  lineVertexColorBuffer.numItems = vertices.length/3;
}

GlViewer = function(canvasId, bands, length) {
	var lineVertexPositionBuffer;
	var lineVertexColorBuffer;


  this.backgroundColor = [0.0, 0.0, 0.0, 1.0];
  this.type = TYPE_MIRROR;
  this.bandSpace = 0.4;
  this.timeSpace = 0.4;
  if (this.type == TYPE_STRETCH) {
  	this.timeSpace = this.timeSpace*2;
  }
  
  // initialize 2 dimensional spectogram 
  this.bands = bands;
  this.spectogram = new Array();
  for (var i=0; i<length; i++) {
  	this.spectogram[i] = new Array();
  	for (var j=0; j<bands; j++) {
  		this.spectogram[i][j] = 0;
  	}
  }
  console.log(this.spectogram);

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
	// initBuffers(this.gl, this.shaderProgram);
	
	this.gl.clearColor(backgroundColor[0], backgroundColor[1], backgroundColor[2], backgroundColor[3]);
	this.gl.enable(this.gl.DEPTH_TEST);

	model = mat4.create();
  projection = mat4.create();         

}

GlViewer.prototype.drawLines = function (gl, shaderProgram, mirrorZ, mirrorX) {
		for (var i=0; i<this.bands; i++) {
				var vertices = new Array();
				var colors = new Array();

				for (var j=0; j<this.spectogram.length; j++) {
					vertices = vertices.concat([mirrorX*j*this.timeSpace, this.spectogram[j][i]/255*Math.pow(this.spectogram[j][i]/100, 2), 0]);

					var intensity = (this.spectogram[j][i]/255+0.05);
					// if (this.type == TYPE_STRETCH) {
						// intensity = intensity*(1-1/(this.spectogram.length/2)*(Math.abs(this.spectogram.length/2-j)));
					// }
					// else {
						intensity = intensity*2*(1/(this.spectogram.length/2)*(this.spectogram.length/2-j));
					// }
					colors = colors.concat([intensity, intensity, intensity, 1.0]);
				}
		
				initBuffers(gl, vertices, colors);
				mPushMatrix();
	    		mat4.translate(model, [0.0, 0.0, mirrorZ*i*this.bandSpace]);
					gl.bindBuffer(gl.ARRAY_BUFFER, lineVertexPositionBuffer);
	    		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, lineVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	    		gl.bindBuffer(gl.ARRAY_BUFFER, lineVertexColorBuffer);
    			gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, lineVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

	    		setMatrixUniforms(gl, shaderProgram);
	    		gl.drawArrays(gl.LINE_STRIP, 0, lineVertexPositionBuffer.numItems);
	    	mPopMatrix();
		}
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
  
  
  mat4.identity(model);

  if (this.type == TYPE_STRETCH) {
  	mat4.translate(model, [-10.0, 0.0, 0.0]);

  }
  mat4.translate(model, [0.0, 0.0, -15.0]);

  // mat4.translate(model, [this.timeSpace*this.spectogram.length, 0.0, this.bandSpace*this.bands]);
		  mat4.rotate(model, this.cameraController.xRot*0.2, [1, 0, 0]);
		  mat4.rotate(model, this.cameraController.yRot*0.2, [0, 1, 0]);
	  // mat4.translate(model, [-this.timeSpace*this.spectogram.length, 0.0, -this.bandSpace*this.bands]);
  

  // Add in camera controller's rotation
  	
	  this.drawLines(gl, shaderProgram, 1.0, 1.0);
	  	
		  	mat4.rotate(model, degToRad(180), [0, 1, 0]);
		  	if (this.type == TYPE_MIRROR) {
		  	this.drawLines(gl, shaderProgram, -1.0, 1.0);
		  }
		  else {
		  	this.drawLines(gl, shaderProgram, 1.0, -1.0);
		  }
	  
	
}
GlViewer.prototype.update = function(amplitudes) {
	var thisAmplitude = amplitudes.slice(0);
	this.spectogram.unshift(thisAmplitude);
	this.spectogram.pop();
}