// Stage
function Stage(width, height, numMonsters, speed, stageElementID){
	this.actors=[]; // all actors on this stage (monsters, player, boxes, ...)
	this.speed = speed;
	this.player=null; // a special actor, the player
	this.interval=null; //step interval
	this.paused=true; //paused/resume 
	this.gameStarted=false; //whether or not the player won
	this.timer = new Timer();

	// the logical width and height of the stage
	this.width=width;
	this.height=height;
	this.numMonsters=numMonsters;

	//probability of spawning a smart monster
	this.smartMonster = 0.20; //15% of the monsters will be Smart

	//probabilities for the remaining positions
	this.boxes = 0.4; // 40% chance of spawning a box 
	this.blanks = 1; // 65% chance of spawning a blank

	// the element containing the visual representation of the stage
	this.stageElementID=stageElementID;
	this.grid=null;

	// take a look at the value of these to understand why we capture them this way
	// an alternative would be to use 'new Image()'
	this.blankImageSrc=document.getElementById('blankImage').src;
	this.monsterImageSrc=document.getElementById('monsterImage').src;
	this.eliteMonsterImageSrc=document.getElementById('eliteMonsterImage').src;
	this.playerImageSrc=document.getElementById('playerImage').src;
	this.boxImageSrc=document.getElementById('boxImage').src;
	this.wallImageSrc=document.getElementById('wallImage').src;
}

// initialize an instance of the game
Stage.prototype.initialize=function(){
	this.teardown();
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

	// Add in some Monsters
	var i=this.numMonsters;
	while(i > 0){
		var randX = Math.floor(Math.random()*this.width);
		var randY = Math.floor(Math.random()*this.height);
		//check if there is already an actor there
		if(this.getActor(randX, randY) == null){
			//decide if this should be a regular monster or a SmartMonster
			var monsterType = Math.random();
			var monster = null;
			if(monsterType <= this.smartMonster){
				monster = new SmartMonster(this, randX, randY);
			}else{
				monster = new Monster(this,randX,randY);
			}
			this.addActor(monster);
			//increment
			i--;
		}
	}

	// Add some Boxes to the stage
	for(row=1; row<this.height-1; row++){
		for(col=1; col<this.width-1;col++){
			var rand = Math.random();
			var occupied = this.getActor(col, row);

			if(rand <= this.boxes && occupied == null){
				this.addActor(new Box(this, col, row));
			}
		}
	}

	//set the game to started
	this.gameStarted = true;
	this.paused = false;
}
	
//de-initialize the stage and make it ready for a new game
Stage.prototype.teardown=function(){
	this.actors=[];
	this.removePlayer();
	this.paused=true;
	this.gameStarted=false;
	//incase the game is still running for some reason
	if(this.interval){
		clearInterval(this.interval);
		this.interval=null;
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
	if(this.player instanceof Player){
		this.setImage(this.player.x, this.player.y, this.blankImageSrc);
		this.removeActor(this.player);
		this.player=null;
	}
}

Stage.prototype.addActor=function(actor){
	this.actors.unshift(actor);
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
	this.updateTimer();
	//console.log("Moving actors...");
	for(var i=0;i<this.actors.length;i++){
		this.actors[i].step();
	}
}

//Set the game to a paused state
Stage.prototype.pause=function(){
	if(!this.paused){
		console.log('Pausing game...');
		this.paused = true;
		this.timer.pause();
		clearInterval(this.interval);
		this.interval = null;
	}
}

//Set the game to an active state
Stage.prototype.resume=function(){
	if(this.paused && this.gameStarted){
		console.log("Resuming Game...");
		this.paused = false;
		this.timer.start();
		stage = this;
		this.interval = setInterval(function() {
			stage.step();
		}, 1000);
	}
}

Stage.prototype.restart=function(){
	//reinitialize the game
	this.initialize();
	this.timer.restart();
	this.updateTimer();
	console.log("Restarting Game...");
	this.paused = false;
	stage = this;
	this.interval = setInterval(function() {
		stage.step();
	}, 1000);
}

//Simulates a click such that the desired message popup 
//window displays
Stage.prototype.showModal=function(modalName){
	location.hash = modalName;
}

//update the game timer
Stage.prototype.updateTimer=function(){
	document.getElementById('timer').innerHTML = this.timer.getMinutes() + ' min ' + this.timer.getSeconds() + ' sec';
}
// End Class Stage

// Class Player
function Player(stage, x, y){
	// this's location on the stage
	this.x=x;
	this.y=y;
	this.stage=stage; // the stage that this is on
	this.stage.setImage(x,y,this.stage.playerImageSrc);
	this.keyListener(); //start listening for keyboard presses
}

// What we do at each tick of the clock
Player.prototype.step=function(){ 
	if(this.won()){
		this.stage.won = true;

		var stats = localStorage.getItem('stats');

		if(stats == null){
			stats = {'kills':0, 'deaths':0, 'totalGameTime':this.stage.timer.getSeconds(), 'killsPerSecond':(this.stage.numMonsters + 0.0)/this.stage.timer.getSeconds()};
		}else{
			stats = JSON.parse(stats);
		}

		stats.kills = parseInt(stats.kills) + parseInt(this.stage.numMonsters);
		stats.totalGameTime = parseInt(stats.totalGameTime) + parseInt(this.stage.timer.getSeconds());
		stats.killsPerSecond = parseInt(stats.kills) / parseInt(stats.totalGameTime);

		document.getElementById('kills').innerHTML = 'Kills this Round: ' + this.stage.numMonsters;
		document.getElementById('lifetime-kills').innerHTML = 'Lifetime Kills: ' + stats.kills;
		document.getElementById('lifetime-deaths').innerHTML = 'Lifetime Deaths: ' + stats.deaths;
		document.getElementById('kill-rate').innerHTML = 'Lifetime Kill Rate: ' + stats.killsPerSecond.toFixed(2) + ' kills/second';
		
		//store back the stats
		localStorage.setItem('stats', JSON.stringify(stats));

		this.stage.showModal('gameWin');
		this.stage.teardown();
		this.stage.pause();
	}
}

Player.prototype.keyListener=function(){
	var self = this;

	//keyevent listeners for directional keys
	document.onkeydown = function(event){
		//console.log("thasda: " + this.stage.paused);
		if(self.stage.paused){
			return;
		}
		var code = event.keyCode;

		if(code == 87 || code == 56){
			self.moveNorth();
		}else if(code == 88 || code == 50) {
			self.moveSouth();
		}else if(code == 68 || code == 54) {
			self.moveEast();
		}else if(code == 65 || code == 52) {
			self.moveWest();
		}else if(code == 69 || code == 57) {
			self.moveNorthEast();
		}else if(code == 81 || code == 55) {
			self.moveNorthWest();
		}else if(code == 67 || code == 51) {
			self.moveSouthEast();
		}else if(code == 90 || code == 49) {
			self.moveSouthWest();
		}
	}
}

Player.prototype.moveNorth=function(){
	if(this.stage.paused){return;}
	console.log("Moving North...");
	this.move(this, 0, -1);
}

Player.prototype.moveSouth=function(){
	if(this.stage.paused){return;}
	console.log("Moving South...");
	this.move(this, 0, 1);
}

Player.prototype.moveEast=function(){
	if(this.stage.paused){return;}
	console.log("Moving East...");
	this.move(this, 1, 0);
}

Player.prototype.moveWest=function(){
	if(this.stage.paused){return;}
	console.log("Moving West...");
	this.move(this, -1, 0);
}

Player.prototype.moveNorthEast=function(){
	if(this.stage.paused){return;}
	console.log("Nort East");
	this.move(this, 1, -1);
}

Player.prototype.moveNorthWest=function(){
	if(this.stage.paused){return;}
	console.log("North West");
	this.move(this, -1, -1);
}

Player.prototype.moveSouthEast=function(){
	if(this.stage.paused){return;}
	console.log("South East");
	this.move(this, 1, 1);
}

Player.prototype.moveSouthWest=function(){
	if(this.stage.paused){return;}
	console.log("South West");
	this.move(this, -1, 1);
}

/* other asked this to move. In this case, move if possible, return whether I moved.
if there is a space available go to it, otherwise, we may need to ask a neighbour 
to move to get our work done. */
Player.prototype.move=function(other, dx, dy){

	//if the game is in a paused state
	//do not move
	if(this.stage.paused){
		return false;
	}

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

//Return true if the player has defeated all monsters
//false otherwise
Player.prototype.won=function(){
	for(var i in this.stage.actors){
		//console.log("checking: "+ i);
		if(this.stage.actors[i] instanceof Monster){
			return false;
		}
	}
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
	//check the position we are about to move to to see if it is available
	var next  = this.stage.getActor(other.x+dx, other.y+dy);

	if(next == null || next.move(next, dx, dy)){
		//move the player
		this.x += dx;
		this.y += dy;
		//add the player back
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
	this.img = this.stage.monsterImageSrc;
	this.stage.setImage(x,y,this.img);
	this.moves=[]; //stores all possible co-ordinates (x,y) around the monster
	this.generateMoves(); //generate the moves so the monster can move
}

// What we do at each tick of the clock
Monster.prototype.step=function(){ 
	//quickly regenerate available mvoes
	this.generateMoves();

	//retrieve stats
	var stats = localStorage.getItem('stats');

	if(stats == null){
		stats = {'kills':0, 'deaths':0, 'totalGameTime':this.stage.timer.getSeconds(), 'killsPerSecond':(this.stage.numMonsters + 0.0)/this.stage.timer.getSeconds()};
	}else{
		stats = JSON.parse(stats);
	}

	// we may be dead, so we had better check if we should be removed from the stage
	// otherwise we should move
	if(this.is_dead()){
		this.stage.removeActor(this);
		stats.kills = parseInt(stats.kills) + 1;
		//store back the stats
		localStorage.setItem('stats', JSON.stringify(stats));
	}else{
		//choose one of the 8 position to move i.e. this.moves[0] through this.moves[7]
		var rand = Math.round(Math.random()*7);
		//get the actor at this location
		var move = this.stage.getActor(this.moves[rand][0], this.moves[rand][1]);

		if(move instanceof Player){

			stats.deaths = parseInt(stats.deaths) + 1;

			//store back the stats
			localStorage.setItem('stats', JSON.stringify(stats));

			this.stage.won = false;
			this.stage.removePlayer();
			console.log("You were Killed!");
			this.stage.pause();
			this.stage.teardown();
			this.stage.showModal('gameLost');
			return;
		}

		if(move == null){
			this.stage.removeActor(this);
			this.x = this.moves[rand][0];
			this.y = this.moves[rand][1];
			this.generateMoves();
			this.stage.addActor(this);
			this.stage.setImage(this.x, this.y, this.stage.monsterImageSrc);
		}
	}
}

// Move the way we wish to move. no one can push a monster around.
// return true if we moved, false otherwise
Monster.prototype.move=function(other, dx, dy){
	return false;
}

Monster.prototype.generateMoves=function(){
	this.moves=[];
	for(j=this.y-1; j<=this.y+1; j++){
		for(i=this.x-1; i<=this.x+1; i++){
			if(j==this.y && i==this.x){
				continue;
			}
			//add the move to the list
			this.moves.push([i,j]);
		}
	}
}

// Return whether this is dead, that is, completely urrounded by non-player actors.
Monster.prototype.is_dead=function(){
	var actor;
	for(var i=0; i<this.moves.length; i++){
		actor = this.stage.getActor(this.moves[i][0], this.moves[i][1]);
		//if the surrounding object is NOT a Wall or a Box, then the monster is still alive
		if(actor == null){
			return false;
		}
	}
	console.log("Killing monster at (%s, %s)", this.x, this.y);
	return true;
}
// End Class Monster

//Class SuperMonster 
function SmartMonster(stage, x, y) {
	Monster.call(this, stage, x, y);
	this.img = this.stage.eliteMonsterImageSrc;
	this.stage.setImage(x,y,this.img);
}

//inherit from the Monster class
SmartMonster.prototype = Object.create(Monster.prototype);

//override default behavior for stepping
SmartMonster.prototype.step = function(){

	//quickly regenerate available mvoes
	this.generateMoves();

	//retrieve stats
	var stats = localStorage.getItem('stats');

	if(stats == null){
		stats = {'kills':0, 'deaths':0, 'totalGameTime':this.stage.timer.getSeconds(), 'killsPerSecond':(this.stage.numMonsters + 0.0)/this.stage.timer.getSeconds()};
	}else{
		stats = JSON.parse(stats);
	}

	// we may be dead, so we had better check if we should be removed from the stage
	// otherwise we should move
	if(this.is_dead()){
		this.stage.removeActor(this);
		stats.kills = parseInt(stats.kills) + 1;
		//store back the stats
		localStorage.setItem('stats', JSON.stringify(stats));
	}else{
		//get the actor at this location
		//var move = this.stage.getActor(this.moves[rand][0], this.moves[rand][1]);
		var move = this.getClosestMove();
		//console.log("Best Move: (%s,%s), Player pos: (%s,%s)", move[0], move[1], this.stage.player.x, this.stage.player.y);
		var newPosition = this.stage.getActor(move[0], move[1]);

		//if a monster moves in the position of the player, gameover
		if(newPosition instanceof Player){

			stats.deaths = parseInt(stats.deaths) + 1;

			//store back the stats
			localStorage.setItem('stats', JSON.stringify(stats));

			this.stage.won = false;
			this.stage.removePlayer();
			console.log("You were Killed!");
			this.stage.pause();
			this.stage.teardown();
			this.stage.showModal('gameLost');
			return;
		}

		this.stage.setImage(this.x, this.y, this.stage.blankImageSrc);
		this.x = move[0];
		this.y = move[1];
		this.stage.setImage(this.x, this.y, this.img);
		
	}
}

//override generate moves to generate only valid moves
SmartMonster.prototype.generateMoves=function(){
	//reset the moves
	this.moves=[];
	//generate the coordinates around the monster
	for(j=this.y-1; j<=this.y+1; j++){
		for(i=this.x-1; i<=this.x+1; i++){
			if(j==this.y && i==this.x){
				continue;
			}else if(this.stage.getActor(i,j) == null || this.stage.getActor(i,j) instanceof Player){
				//add the move to the list
				this.moves.push([i,j]);
			}
			
		}
	}
}

//Return the closest move if there is one. If not return the 
//first available move, otherwise return null if there are no moves.
SmartMonster.prototype.getClosestMove=function(){
	var bestMove=null;
	var shortestDistance=Number.POSITIVE_INFINITY;
	for(var i=0; i<this.moves.length; i++){
		var dist = this.getEuclideanDistance(this.stage.player.x, this.stage.player.y, this.moves[i][0], this.moves[i][1]);
		if(dist < shortestDistance){
			shortestDistance = dist;
			bestMove = this.moves[i];
		}
	}
	return bestMove;
}

//Return the Euclidean distance between two points
SmartMonster.prototype.getEuclideanDistance=function(x1,y1,x2,y2){
	return Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
}

//Overide - Return true if this monster is dead, false otherwise
SmartMonster.prototype.is_dead=function(){
	return this.moves.length == 0;
}

function Timer(){
	this.seconds = 0;
	this.interval = null;
	console.log("New Timer created..");
}

Timer.prototype.start=function() {
	console.log("Starting timer...");
	var self = this;
	this.interval = setInterval(function() {
		self.seconds++;
	}, 1000);
}

Timer.prototype.pause=function(){
	console.log("Resuming timer...");
	clearInterval(this.interval);
}

Timer.prototype.restart=function(){
	this.seconds = 0;
	this.pause();
	this.start();
}

Timer.prototype.getSeconds=function(){
	return this.seconds;
}

Timer.prototype.getMinutes=function(){
	return Math.floor(this.seconds / 60);
}