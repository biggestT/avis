
// All the viewers are Observers
function ConsoleViewer(){
    // update viewer with the amplitudes array from model
    this.update = function( amplitudes ){
        //console.log( amplitudes );
    };
}


function FlatViewer( canvasId ){
    this.canvas = document.getElementById(canvasId);
  	this.width = this.canvas.width;
  	this.height = this.canvas.height;
  	this.barWidth = 1;
  	this.context = this.canvas.getContext('2d');
  	
    

    // update viewer with the amplitudes array from model
    this.update = function( amplitudes ){
    	// clear before plotting new data 
        this.context.clearRect(0, 0, this.width, this.height);
        var barSpacing = this.width / amplitudes.length;
 
        // draw the bars but skip the first two for cosmetic reasons
        for ( var i = 2; i < amplitudes.length; ++i ) {
        	var scaledAmplitude = ( amplitudes[i] / 256 ) * this.height; 
	        this.context.fillRect( i * ( barSpacing + this.barWidth ), this.height,
	        this.barWidth, -scaledAmplitude);
        };
    };
    FlatViewer.prototype.getCanvasContext = function() {
  		return this.context;
	}
}

function CircleViewer( canvasId ){
    this.canvas = document.getElementById(canvasId);
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.context = this.canvas.getContext('2d');
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
  
    // update viewer with the amplitudes array from model
    this.update = function( amplitudes ){
      // clear before plotting new data 
      this.context.clearRect(0, 0, this.width, this.height);
       
      // find the current average amplitude of the bottom half frequencies
      var sum = 0;
      for ( var i = 0; i < amplitudes.length / 4; ++i ) {
        sum += amplitudes[i];
      };
      var amplitudeAverage = sum / amplitudes.length / 4;
      var scaledAmplitudeRadius = Math.pow( ( amplitudeAverage / 256  * this.height / 2 ), 2);

      this.context.beginPath();
      this.context.arc( this.centerX, this.centerY, scaledAmplitudeRadius, 0, 2 * Math.PI, false);
      this.context.fill();

    };

    CircleViewer.prototype.getCanvasContext = function() {
      return this.context;
  }
}
