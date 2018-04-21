/*
*
*	Typpo.js
*	A JavaScript library for procedurally animating lifelike derpy typing
*	by Noah Levenson noahlevenson@gmail.com
*	
*	https://github.com/noahlevenson/typpo.js
*
*/

function Typpo(options) {
	this.self = this;
	this.q = [];
	this.onDrain = function() {
	}
	this.speed = 0;
	this.badness = 0;
	this.correctionSpeed = 30;
	this.showCursor = true;
	this.cursor = "|";
	this.blinkToggle = true;
	if (options.showCursor === false) {
		this.showCursor = false;
	} else {
		var css = document.createElement("style");
		css.type = "text/css";
		css.innerHTML = "\n.typpo-cursorBlink {\n    animation: typpoBlink 0.7s infinite;\n}\n@keyframes typpoBlink {\n    50% { opacity: 0.0; }\n    100% { opacity: 1; }\n}\n";
		css.innerHTML = css.innerHTML + "\n.typpo-cursorSolid {\n    opacity: 1;\n}";
		document.head.appendChild(css);
	}
	if (options.cursor) {
		this.cursor = options.cursor;
	}
	this.destination = document.getElementById(options.element);
	if (this.showCursor) {
		this.insertCursor(this.self);
	}
	if (options.speed) {
		if (options.speed > 100) {
			this.speed = 100;
		} else if (options.speed < 0) {
			this.speed = 0;
		} else {
			this.speed = options.speed;
		}
	}
	this.slowness = 1000 - (this.speed * 10);
	if (options.badness) {
		if (options.badness > 100) {
			this.badness = 100;
		} else if (options.badness < 0) {
			this.badness = 0;
		} else {
			this.badness = options.badness;
		}
	}
	this.probability = this.badness / 100;
	if (options.correctionSpeed) {
		if (options.correctionSpeed > 100) {
			this.correctionSpeed = 100;
		} else if (options.correctionSpeed < 0) {
			this.correctionSpeed = 0;
		} else {
			this.correctionSpeed = options.correctionSpeed;
		}
	}
	this.backspaceSlowness = 1000 - (this.correctionSpeed * 10);
	this.randomMax = 1;
	this.randomMin = 0.5;
}

Typpo.prototype.pressKey = function(c) {
	window.requestAnimationFrame(function() {
		if (this.self.showCursor) {
			this.self.removeCursor(this.self);
			this.self.destination.innerHTML = this.self.destination.innerHTML + this.c;
			this.self.insertCursor(this.self);
		} else {
			this.self.destination.innerHTML = this.self.destination.innerHTML + this.c;
		}
	}.bind({self: this.self, c: c}));
}

Typpo.prototype.write = function(s) {
	var taskIndex = this.q.length;
	this.q[taskIndex] = new Promise(function(resolve, reject) {
		var taskIndex = this.taskIndex;
		// if the queue is empty, we can execute the write task immediately
		if (this.self.q.length === 0) {
			this.self.blinkToggle = false;
			doWrite(this.self, this.s, 0);
		} else if (this.self.q.length > 0) {
			// if the queue has other tasks in it, we need to add this task to the then() 
			// method of the last task in the queue
			this.self.q[this.self.q.length - 1].then(function() {
				this.self.blinkToggle = false;
				doWrite(this.self, this.s, 0);
			}.bind({self: this.self, s: s}));
		}
		function doWrite(self, s, pos, forceCorrect) {
			if (!forceCorrect) {
				forceCorrect = false;
			}
			setTimeout(function() {
				// c is the character we're gonna type
				var c = this.s.substr(this.pos, 1);
				// let's type a randomized wrong character
				if (!this.forceCorrect && this.self.errorTable.hasOwnProperty(c) && this.self.probability > Math.random()) {
					this.self.pressKey(this.self.errorTable[c][Math.floor(Math.random() * this.self.errorTable[c].length)]);
					// now let's wait, backspace the mistake, and try again
					setTimeout(function() {
						window.requestAnimationFrame(function() {
							if (this.self.showCursor) {
								this.self.removeCursor(this.self);
								this.self.destination.innerHTML = this.self.destination.innerHTML.substr(0, this.self.destination.innerHTML.length - 1);
								this.self.insertCursor(this.self);
							} else {
								this.self.destination.innerHTML = this.self.destination.innerHTML.substr(0, this.self.destination.innerHTML.length - 1);
							}
							// note the forceCorrect bool that ensures we get it right next time
							doWrite(this.self, this.s, this.pos, true);
						}.bind({self: this.self, s: this.s, pos: this.pos}));
					}.bind({self: this.self, s: this.s, pos: this.pos}), (Math.random() * (this.self.randomMax - this.self.randomMin) + this.self.randomMin) * this.self.backspaceSlowness);
				} else {
					this.self.pressKey(c);
					this.pos += 1;
					if (this.pos <= this.s.length) {
						doWrite(this.self, this.s, this.pos);
					} else {
						if (this.self.showCursor) {
							this.self.removeCursor(this.self);
							this.self.blinkToggle = true;
							this.self.insertCursor(this.self);
						}
						resolve();	
						this.self.q.shift();
						this.self.checkComplete(this.self);
					}
				}
			}.bind({self: self, s: s, pos: pos, forceCorrect: forceCorrect}), Math.random() * self.slowness);
		}
	}.bind({self: this.self, s: s, taskIndex: taskIndex}));
}

Typpo.prototype.writeUncorrected = function(s) {
	var taskIndex = this.q.length;
	this.q[taskIndex] = new Promise(function(resolve, reject) {
		var taskIndex = this.taskIndex;
		// if the queue is empty, we can execute the write task immediately
		if (this.self.q.length === 0) {
			this.self.blinkToggle = false;
			doWriteUncorrected(this.self, this.s, 0);
		} else if (this.self.q.length > 0) {
			// if the queue has other tasks in it, we need to add this task to the then() 
			// method of the last task in the queue
			this.self.q[this.self.q.length - 1].then(function() {
				// new: set the cursor on solid
				this.self.blinkToggle = false;
				doWriteUncorrected(this.self, this.s, 0);
			}.bind({self: this.self, s: s}));
		}

		function doWriteUncorrected(self, s, pos) {
			setTimeout(function() {
				// c is the character we're gonna type
				var c = this.s.substr(this.pos, 1);
				// let's type a randomized wrong character
				if (this.self.errorTable.hasOwnProperty(c) && this.self.probability > Math.random()) {
					this.self.pressKey(this.self.errorTable[c][Math.floor(Math.random() * this.self.errorTable[c].length)]);
				} else {
					this.self.pressKey(c);
				}
				this.pos += 1;
				if (this.pos <= this.s.length) {
					doWriteUncorrected(this.self, this.s, this.pos);
				} else {
					if (this.self.showCursor) {
						this.self.removeCursor(this.self);
						this.self.blinkToggle = true;
						this.self.insertCursor(this.self);
					}
					resolve();	
					this.self.q.shift();
					this.self.checkComplete(this.self);
				}
			}.bind({self: self, s: s, pos: pos}), Math.random() * self.slowness);
		}
	}.bind({self: this.self, s: s, taskIndex: taskIndex}));
}

Typpo.prototype.enter = function(n) {
	var taskIndex = this.q.length;
	if (!n) {
		var n = 1;
	}
	this.q[taskIndex] = new Promise(function(resolve, reject) {
		var taskIndex = this.taskIndex;
		// if the queue is empty, we can execute the enter task immediately
		if (this.self.q.length === 0) {
			// new: set the cursor on solid
			this.self.blinkToggle = false;
			doEnter(this.self, this.n);
		} else if (this.self.q.length > 0) {
			// if the queue has other tasks in it, we need to add this task to the then() 
			// method of the last task in the queue
			this.self.q[this.self.q.length - 1].then(function() {
				this.self.blinkToggle = false;
				doEnter(this.self, this.n);
			}.bind({self: this.self, n: n}));
		}

		function doEnter(self, n, i) {
			if (!i) {
				var i = 0;
			}
			setTimeout(function() {
				if (this.self.showCursor) {
						this.self.removeCursor(this.self);
						this.self.destination.innerHTML = this.self.destination.innerHTML + "<br>";
						this.self.insertCursor(this.self);
				} else {
					this.self.destination.innerHTML = this.self.destination.innerHTML + "<br>";
				}
				this.i += 1;
				if (this.i < this.n) {
					doEnter(this.self, this.n, this.i);
				} else {
					if (this.self.showCursor) {
						self.removeCursor(self);
						self.blinkToggle = true;
						self.insertCursor(self);
					}
					resolve();			
					self.q.shift();
					self.checkComplete(self);
				}
			}.bind({self: self, n: n, i: i}), Math.random() * self.slowness);
		}
	}.bind({self: this.self, n: n, taskIndex: taskIndex}));
}

Typpo.prototype.backspaceAll = function(ttl) {
	var taskIndex = this.q.length;
	this.q[taskIndex] = new Promise(function(resolve, reject) {
		var taskIndex = this.taskIndex;
		// if the queue is empty, we can execute the backspaceAll task immediately
		if (this.self.q.length === 0) {
			setTimeout(function() {
				this.self.blinkToggle = false;
				doBackspaceAll(this.self);
			}.bind({self: this.self}), ttl);
		} else if (this.self.q.length > 0) {
			// if the queue has other tasks in it, we need to add this task to the then() 
			// method of the last task in the queue
			this.self.q[this.self.q.length - 1].then(function() {
				setTimeout(function() {
					this.self.blinkToggle = false;
					doBackspaceAll(this.self);
				}.bind({self: this.self}), ttl);
			}.bind({self: this.self}));
		}

		function doBackspaceAll(self) {
			setTimeout(function() {
				if (self.showCursor) {
					self.removeCursor(self);
					self.destination.innerHTML = self.destination.innerHTML.substr(0, self.destination.innerHTML.length - 1);
					self.insertCursor(self);
				} else {
					self.destination.innerHTML = self.destination.innerHTML.substr(0, self.destination.innerHTML.length - 1);
				}
				if(self.showCursor && self.destination.innerHTML.length > (self.cursor.length + 39)) {
					doBackspaceAll(this.self);
				} else if (!self.showCursor && self.destination.innerHTML.length > 0) {
					doBackspaceAll(this.self);
				} else {
					if (this.self.showCursor) {
						this.self.removeCursor(this.self);
						this.self.blinkToggle = true;
						this.self.insertCursor(this.self);
					}
					resolve();		
					self.q.shift();
					self.checkComplete(self);
				}
			}.bind({self: self}), 100);
		}
	}.bind({self: this.self, ttl: ttl, taskIndex: taskIndex}));
}

Typpo.prototype.pause = function(t) {
	var taskIndex = this.q.length;
	this.q[taskIndex] = new Promise(function(resolve, reject) {
		var taskIndex = this.taskIndex;
		// if the queue is empty, we can execute the pause task immediately
		if (this.self.q.length === 0) {
				doPause(this.self, this.t);
		} else if (this.self.q.length > 0) {
			// if the queue has other tasks in it, we need to add this task to the then() 
			// method of the last task in the queue
			this.self.q[this.self.q.length - 1].then(function() {
				doPause(this.self, this.t);
			}.bind({self: this.self, t: this.t}));
		}

		function doPause(self, t) {
			setTimeout(function() {
				resolve();
				self.q.shift();
				self.checkComplete(self);
			}, t);
		}
	}.bind({self: this.self, t: t, taskIndex: taskIndex}));
}

Typpo.prototype.insertCursor = function(self) {
	if (self.blinkToggle) {
		self.destination.innerHTML = self.destination.innerHTML + "<span class=\"typpo-cursorBlink\">" + self.cursor + "</span>";
	} else {
		self.destination.innerHTML = self.destination.innerHTML + "<span class=\"typpo-cursorSolid\">" + self.cursor + "</span>";
	}
}

Typpo.prototype.removeCursor = function(self) {
	self.destination.innerHTML = self.destination.innerHTML.substr(0, self.destination.innerHTML.length - (self.cursor.length + 39));
}

Typpo.prototype.checkComplete = function(self) {
	if (self.q.length === 0) {
		self.onDrain();
	}
}

Typpo.prototype.errorTable = {
		"1": ["`", "2", "q"],
		"2": ["1", "3", "q", "w"],
		"3": ["2", "4", "w", "e"],
		"4": ["3", "5", "e", "r"],
		"5": ["4", "6", "r", "t"],
		"6": ["5", "7", "t", "y"],
		"7": ["6", "8", "y", "u"],
		"8": ["7", "9", "i", "u"],
		"9": ["8", "0", "o", "i"],
		"0": ["9", "-", "o", "p"],
		a: ["s", "z", "q"],
		b: ["v", "g", "n"],
		c: ["x", "d", "v"],
		d: ["s", "f", "c", "e"],
		e: ["w", "r", "d"],
		f: ["d", "g", "v", "r"],
		g: ["f", "h", "t", "b"],
		h: ["g", "j", "y", "n"],
		i: ["o", "u", "k"],
		j: ["h", "k", "u", "m"],
		k: ["l", "j", "i", ","],
		l: ["k", ";", "o", "."],
		m: ["n", ",", "j"],
		n: ["b", "m", "h"],
		o: ["i", "p", "l"],
		p: ["o", "[", ";"],
		q: ["w", "a"],
		r: ["e", "t", "f"],
		s: ["a", "d", "w", "x"],
		t: ["r", "y", "g"],
		u: ["y", "i", "j"],
		v: ["c", "b", "f"],
		w: ["q", "e", "s"],
		x: ["z", "c", "s"],
		y: ["t", "u", "h"],
		z: ["x", "a"],
		A: ["s", "z", "q", "a"],
		B: ["v", "n", "g", "b"],
		C: ["x", "v", "d", "c"],
		D: ["s", "f", "c", "e", "d"],
		E: ["w", "r", "d", "e"],
		F: ["d", "g", "r", "v", "f"],
		G: ["f", "h", "t", "b", "g"],
		H: ["g", "j", "y", "n", "h"],
		I: ["u", "o", "k", "i"],
		J: ["h", "k", "u", "m", "j"],
		K: ["j", "l", "i", ",", "k"],
		L: ["k", ";", "o", ".", "l"],
		M: ["m", ",", "j", "m"],
		N: ["b", "m", "h", "n"],
		O: ["i", "p", "l", "o"],
		P: ["o", "[", ";", "p"],
		Q: ["a", "s", "w", "q"],
		R: ["e", "t", "f", "r"],
		S: ["a", "d", "w", "x", "s"],
		T: ["r", "y", "g", "t"],
		U: ["y", "i", "j", "u"],
		V: ["c", "b", "f", "v"],
		W: ["e", "q", "s", "w"],
		X: ["z", "c", "s", "x"],
		Y: ["t", "u", "h", "y"],
		Z: ["x", "s", "a", "z"],
		"!": ["1", "@", "~"],
		"@": ["2", "!", "#"],
		"#": ["3", "@", "$"],
		"$": ["4", "#", "%"],
		"%": ["5", "$", "^"],
		"^": ["6", "%", "&"],
		"&": ["7", "^", "*"],
		"*": ["8,", "&", "("],
		"(": ["9", "*", ")"],
		")": ["0", "(", "_"],
		"_": ["-", ")", "+"],
		"+": ["=", "_"],
		"=": ["-", "[", "]"],
		"[": ["p", "'", "]"],
		"]": ["[", "'"],
		";": ["p", "l", "'", "."],
		"'": [";", "[", "]"],
		",": ["k", "l", "m", "."],
		".": [",", "/", "l", ";"],
		"/": [".", ";", "'"],
		"{": ["P", "\"", "}", "["],
		"}": ["{", "\"", "]"],
		":": ["P", "L", "\"", ">", ";"],
		"\"": [":", "{", "}"],
		"<": ["K", "L", "M", ">", ","],
		">": ["<", "?", "L", ";", "."],
		"?": [">", ":", "/"]
};