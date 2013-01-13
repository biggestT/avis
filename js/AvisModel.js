

// Constructor for the model which outputs an array 
// with amplitudes for different frequencies at a given timeinterval
// it also autoplays the specified audiotrack to be visualised
//--------------------------------------------------------------

AvisModel = function( resolution, nBands, audioContext ) {
  this.init(resolution, nBands, audioContext);
}

AvisModel.prototype.init = function( resolution, nBands, audioContext ) {
  
  this.amplitudes = new Array();
  this.observers = new ObserverList();
  this.bands = nBands;
  this.resolution = resolution;
  this.updateRate = 50; // in milliseconds
  this.smoothing = 0.45;
  this.audioContext = audioContext;
  this.amplitudes = new Array();
  // Create the spectral analyzer
  this.analyser = this.audioContext.createAnalyser();
  this.analyser.fftSize = this.resolution;
  this.data = new Uint8Array(this.analyser.frequencyBinCount);

}

AvisModel.prototype.getAnalyser = function() {
  return this.analyser;
}

AvisModel.prototype.enable = function() {
  var that = this;
  if (!this.intervalId) {
    this.intervalId = window.setInterval(
        function() { that.notify(); }, this.updateRate);
  }
  return this;
}

AvisModel.prototype.disable = function() {
  if (this.intervalId) {
    window.clearInterval(this.intervalId);
    this.intervalId = undefined;
  }
  return this;
}

 // Functions for AvisModel that enables it to work as a subject
// in the observerpattern:
//--------------------------------------------------------------
AvisModel.prototype.addObserver = function( observer ){
  this.observers.Add( observer );
};  

AvisModel.prototype.removeObserver = function( observer ){
  this.observers.RemoveAt( this.observers.IndexOf( observer, 0 ) );
};  

AvisModel.prototype.notify = function(){
  var observerCount = this.observers.Count();
  data = this.data;
  this.analyser.smoothingTimeConstant = this.smoothing;
  this.analyser.getByteFrequencyData(data);
  var length = data.length;
  // Break the samples up into bins
  var binSize = Math.floor( length / this.bands );
  for (var i=0; i < this.bands; ++i) {
    var sum = 0
    for (var j=0; j < binSize; ++j) {
      sum += data[(i * binSize) + j];
    }
    // add the average amplitude to the output array
    this.amplitudes[i] = sum / binSize;
  }
  
  // place the current frequencydata in the array data
  for(var i=0; i < observerCount; i++){
    this.observers.Get(i).update( this.amplitudes );
  }
};





