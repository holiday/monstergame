// Stage
function Stage(width, height, stageElementID){
	this.actors=[]; // all actors on this stage (monsters, player, boxes, ...)
	this.player=null; // a special actor, the player

	// the logical width and height of the stage
	this.width=width;
	this.height=height;

	// the element containing the visual representation of the stage
	this.stageElementID=stageElementID;

	// take a look at the value of these to understand why we capture them this way
	// an alternative would be to use 'new Image()'
	this.blankImageSrc=document.getElementById('blankImage').src;
	this.monsterImageSrc=document.getElementById('monsterImage').src;
	this.playerImageSrc=document.getElementById('playerImage').src;
	this.boxImageSrc=document.getElementById('boxImage').src;
	this.wallImageSrc=document.getElementById('wallImage').src;
}

// initialize an instance of the game
Stage.prototype.initialize=function(){
	// Create a table of blank images, give each image an ID so we can reference it later
	var s='<table id="gameGrid">';
	// YOUR CODE GOES HERE
	for(j=0; j < this.height; j++){
		s+='<tr id="' + 'row_' + j + '">';
		for(i=0; i< this.width; i++){
			s+='<td id="' + 'col_' + i + '"><img src="' + this.blankImageSrc + '"></td>';
		}
		s+='</tr>';
	}
	s+='</table>';

	// Put it in the stageElementID (innerHTML)
	document.getElementById(this.stageElementID).innerHTML = s;
	this.grid = document.getElementById("gameGrid");

	// Add the player to the center of the stage
	var row = Math.floor(this.width / 2);
	var col = Math.floor(this.height / 2);

	this.grid.rows[row].cells[col].innerHTML = '<img src="' + this.playerImageSrc + '">';
	// Add walls around the outside of the stage, so actors can't leave the stage
	//left and right walls
	for(i=0; i < this.height; i++){
		this.grid.rows[i].cells[0].innerHTML = '<img src="' + this.wallImageSrc + '" width="24" height="24">';
		this.grid.rows[i].cells[this.width-1].innerHTML = '<img src="' + this.wallImageSrc + '" width="24" height="24">';
	}

	//top and bottom walls
	for(i=1; i < this.width-1; i++){
		this.grid.rows[0].cells[i].innerHTML = '<img src="' + this.wallImageSrc + '" width="24" height="24">';
		this.grid.rows[this.height-1].cells[i].innerHTML = '<img src="' + this.wallImageSrc + '" width="24" height="24">';
	}
	// Add some Boxes to the stage
	
	// Add in some Monsters

}
// Return the ID of a particular image, useful so we don't have to continually reconstruct IDs
Stage.prototype.getStageId=function(x,y){ return ""; }

Stage.prototype.addPlayer=function(player){
	this.addActor(player);
	this.player=player;
}

Stage.prototype.removePlayer=function(){
	this.removeActor(this.player);
	this.player=null;
}

Stage.prototype.addActor=function(actor){
	this.actors.push(actor);
}

Stage.prototype.removeActor=function(actor){
	// Lookup javascript array manipulation (indexOf and splice).
}

// Set the src of the image at stage location (x,y) to src
Stage.prototype.setImage=function(x, y, src){

}

// Take one step in the animation of the game.  
// Do this by asking each of the actors to take a single step. Each actor should
// have a step function.
Stage.prototype.step=function(){
	for(var i=0;i<this.actors.length;i++){
		this.actors[i].step();
	}
}

// return the first actor at coordinates (x,y) return null if there is no such actor
Stage.prototype.getActor=function(x, y){
	return null;
}
// End Class Stage

// Class Player
function Player(stage, x, y){
	// this's location on the stage
	this.x=x;
	this.y=y;
	this.stage=stage; // the stage that this is on
	this.stage.setImage(x,y,this.stage.playerImageSrc);
}

// What we do at each tick of the clock
Player.prototype.step=function(){ return; }

/* other asked this to move. In this case, move if possible, return whether I moved.
if there is a space available go to it, otherwise, we may need to ask a neighbour 
to move to get our work done. */
Player.prototype.move=function(other, dx, dy){

	// Where we are supposed to move. 
	var newx=this.x+dx;
	var newy=this.y+dy;

	/* Determine if another Actor is occupying (newx, newy). If so,
	this asks them to move. If they moved, then we can occupy the spot. Otherwise
	we can't move. We return true if we moved and false otherwise. */

	// We move both logically, and on the screen (change the images in the table)

	return true;
}
// End Class Player

// Class Wall (COMPLETE AS IS!)
function Wall(stage, x, y){
	// this's location on the stage
	this.x=x;
	this.y=y;
	this.stage=stage; // the stage that this is on
	this.stage.setImage(x,y,this.stage.wallImageSrc);
}

// What we do at each tick of the clock
Wall.prototype.step=function(){ return; }

// No one can push me around!
Wall.prototype.move=function(other, dx, dy){
	return false;
}
// End Class Wall

// Class Box
function Box(stage, x, y){
	// this's location on the stage
	this.x=x;
	this.y=y;
	this.stage=stage; // the stage that this is on
	this.stage.setImage(x,y,this.stage.boxImageSrc);
}

// What we do at each tick of the clock
Box.prototype.step=function(){ return; }

// If the Player or another Box asked us to me, we try. 
// return true if we moved, false otherwise.
Box.prototype.move=function(other, dx, dy){
	// See http://stackoverflow.com/questions/1249531/how-to-get-a-javascript-objects-class
	return true;
}
// End Class Box


// Class Monster
function Monster(stage, x, y){
	// this's location on the stage
	this.x=x;
	this.y=y;
	this.dx=-1;
	this.dy=-1;
	this.stage=stage; // the stage that this is on
	this.stage.setImage(x,y,this.stage.monsterImageSrc);
}

// What we do at each tick of the clock
Monster.prototype.step=function(){ 
	// we may be dead, so we had better check if we should be removed from the stage
	// otherwise we should move
}

// Move the way we wish to move. no one can push a monster around.
// return true if we moved, false otherwise
Monster.prototype.move=function(other, dx, dy){
	if(!(other===this))return false;
	var newx=this.x+dx;
	var newy=this.y+dy;

	return true;
}

// Return whether this is dead, that is, completely urrounded by non-player actors.
Monster.prototype.is_dead=function(){
	return true;
}
// End Class Monster

