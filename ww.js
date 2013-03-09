// Stage
function Stage(width, height, numMonsters, stageElementID){
	this.actors=[]; // all actors on this stage (monsters, player, boxes, ...)
	this.player=null; // a special actor, the player

	// the logical width and height of the stage
	this.width=width;
	this.height=height;

	//probability distributions deciding the position (x,y) type 
	this.monsters = 0.1; // 0-0.3
	this.boxes = 0.4; // 0.3-0.6
	this.blanks = 1; // 0.6-1

	// the element containing the visual representation of the stage
	this.stageElementID=stageElementID;
	this.grid=null;

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
	var s='<table>';
	// YOUR CODE GOES HERE
	for(j=0; j < this.height; j++){
		s+='<tr>';
		for(i=0; i< this.width; i++){
			s+='<td><img src="' + this.blankImageSrc + '" id="stage_' + j + '_' + i + '"></td>';
		}
		s+='</tr>';
	}
	s+='</table>';

	// Put it in the stageElementID (innerHTML)
	document.getElementById(this.stageElementID).innerHTML = s;
	this.grid = document.getElementById(this.stageElementID).getElementsByTagName('table')[0];

	// Add the player to the center of the stage
	var row = Math.floor(this.width / 2);
	var col = Math.floor(this.height / 2);

	this.addPlayer(new Player(this, col, row));
	// Add walls around the outside of the stage, so actors can't leave the stage
	//left and right walls
	for(i=0; i < this.height; i++){
		this.addActor(new Wall(this, 0, i));
		this.addActor(new Wall(this, this.width-1, i));
	}

	//top and bottom walls
	for(i=1; i < this.width-1; i++){
		this.addActor(new Wall(this, i, 0));
		this.addActor(new Wall(this, i, this.height-1));
	}

	// Add some Boxes to the stage
	// Add in some Monsters
	for(row=1; row<this.height-1; row++){
		for(col=1; col<this.width-1;col++){
			var rand = Math.random();
			if(row == this.player.y && col == this.player.x){
				continue;
			}else if(rand <= this.monsters){
				//make a monster
				this.addActor(new Monster(this, col, row));
			}else if(rand > this.monsters && rand <= this.boxes){
				//make a box
				this.addActor(new Box(this, col, row));
			}else{
				continue;
			}
		}
	}
}
// Return the ID of a particular image, useful so we don't have to continually reconstruct IDs
Stage.prototype.getStageId=function(x,y){ 
	return "stage_" + y + "_" + x; 
}

Stage.prototype.getElement=function(id){
	return document.getElementById(id);
}

Stage.prototype.getSrc=function(actor){
	return document.getElementById(this.getStageId(actor.x, actor.y)).src;
}

Stage.prototype.addPlayer=function(player){
	this.addActor(player);
	this.player=player;
	this.setImage(player.x, player.y, this.playerImageSrc);
}

Stage.prototype.removePlayer=function(){
	this.setImage(this.player.x, this.player.y, this.blankImageSrc);
	this.removeActor(this.player);
	this.player=null;
}

Stage.prototype.addActor=function(actor){
	this.actors.push(actor);
}

Stage.prototype.removeActor=function(actor){
	// Lookup javascript array manipulation (indexOf and splice).
	//console.log("Actor (%s,%s)", actor.x, actor.y);
	var i = this.actors.indexOf(actor);
	this.setImage(actor.x, actor.y, this.blankImageSrc);
	this.actors.splice(i, 1);
	return actor;
}

// Set the src of the image at stage location (x,y) to src
Stage.prototype.setImage=function(x, y, src){
	document.getElementById(this.getStageId(x,y)).src = src;
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
	for(var i in this.actors){
		if(this.actors[i].x == x && this.actors[i].y == y){
			return this.actors[i];
		}
	}
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

	var self = this;
	//keyevent listeners for directional keys
	document.onkeydown = function(event){

		switch(event.keyCode){
			//forward
			case 87:
				console.log("Moving North...");
				self.move(self, 0, -1);
				break;
			//backward
			case 88:
				console.log("Moving South...");
				self.move(self, 0, 1);
				break;
			//right
			case 68:
				console.log("Moving East...");
				self.move(self, 1, 0);
				break;
			//left
			case 65:
				console.log("Moving West...");
				self.move(self, -1, 0);
				break;
			//north-east
			case 69:
				console.log("Nort East");
				self.move(self, 1, -1);
				break;
			//north west
			case 81:
				console.log("North West");
				self.move(self, -1, -1);
				break;
			//south east
			case 67:
				console.log("South East");
				self.move(self, 1, 1);
				break;
			//south west
			case 90:
				console.log("South West");
				self.move(self, -1, 1);
				break;
			default:
				console.log("No direction for that key: " + event.keyCode);
		}
	}
}

// What we do at each tick of the clock
Player.prototype.step=function(){ return; }

/* other asked this to move. In this case, move if possible, return whether I moved.
if there is a space available go to it, otherwise, we may need to ask a neighbour 
to move to get our work done. */
Player.prototype.move=function(other, dx, dy){

	// Where we are supposed to move. 
	var newx=other.x+dx;
	var newy=other.y+dy;

	/* Determine if another Actor is occupying (newx, newy). If so,
	this asks them to move. If they moved, then we can occupy the spot. Otherwise
	we can't move. We return true if we moved and false otherwise. */
	var next  = this.stage.getActor(newx, newy);

	if(next == null || next.move(next, dx, dy)){
		//must be an empty space
		//remove other temporarily
		this.stage.removePlayer();
		//move the player
		this.x += dx;
		this.y += dy;
		//add the player back
		this.stage.addPlayer(this);
		return true;
	}

	return false;
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

	//check the position we are about to move to to see if it is available
	var next  = this.stage.getActor(other.x+dx, other.y+dy);

	if(next == null || next.move(next, dx, dy)){
		//must be an empty space
		//remove other temporarily
		this.stage.removeActor(this);
		//move the player
		this.x += dx;
		this.y += dy;
		//add the player back
		this.stage.addActor(this);
		this.stage.setImage(this.x, this.y, this.stage.boxImageSrc);
		return true;
	}
	return false;
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
	return false;
}

// Return whether this is dead, that is, completely urrounded by non-player actors.
Monster.prototype.is_dead=function(){
	return true;
}
// End Class Monster

