
// The viewer is an Observer
function ConsoleViewer(){
    this.test = 1;
    // update viewer with the amplitudes array from model
    this.update = function( amplitudes ){
        console.log( amplitudes );
    };
}

