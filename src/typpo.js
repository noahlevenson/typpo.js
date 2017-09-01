/*
*
*	typpo.js
*	A JavaScript library for procedurally animating imperfect typing
*	by Noah Levenson
*	
*	https://github.com/noahlevenson/typpo.js
*
*/

function Typpo(options) {

    this.self = this;

    this.q = [];

	this.speed = 0;

	this.badness = 0;

	this.correctionSpeed = 30;

	this.showCursor = true;

	this.cursor = "|";

	if (options.showCursor && options.showCursor === false) {

		this.showCursor = false;

	}

	if (options.cursor) {

		this.cursor = options.cursor;

	}

	this.destination = document.getElementById(options.element);

	if (this.showCursor) {

		this.destination.innerHTML = this.destination.innerHTML + this.cursor;

	}

	if (options.speed) {

		if (options.speed > 100) {

			this.speed = 100;

		}

		else if (options.speed < 0) {

			this.speed = 0;

		}

		else {

			this.speed = options.speed;

		}

	}

	this.slowness = 1000 - (this.speed * 10);

	if (options.badness) {

		if (options.badness > 100) {

			this.badness = 100;

		}

		else if (options.badness < 0) {

			this.badness = 0;

		}

		else {

			this.badness = options.badness;

		}
	
	}

	this.probability = this.badness / 100;

	if (options.correctionSpeed) {

		if (options.correctionSpeed > 100) {

			this.correctionSpeed = 100;

		}

		else if (options.correctionSpeed < 0) {

			this.correctionSpeed = 0;

		}

		else {

			this.correctionSpeed = options.correctionSpeed;

		}
	
	}

	this.backspaceSlowness = 1000 - (this.correctionSpeed * 10);
	
	this.pressKey = function(c) {

        window.requestAnimationFrame(function() {

        	if (this.self.showCursor) {

        		// if we're showing the cursor, first remove the cursor
        		this.self.destination.innerHTML = this.self.destination.innerHTML.substr(0, this.self.destination.innerHTML.length - 1);

        		// then add the new character
        		this.self.destination.innerHTML = this.self.destination.innerHTML + this.c;

        		// then add the cursor back at the end
        		this.self.destination.innerHTML = this.self.destination.innerHTML + this.self.cursor;

        	}

        	else {

        		// if we're not showing the cursor, just add the new character
        		this.self.destination.innerHTML = this.self.destination.innerHTML + this.c;

        	}

        }.bind({self: this.self, c: c}));

	}

    this.write = function(s) {

    	// todo: you may never need this taskIndex, as it just stores the original q index assigned to the task
    	// which is subject to change as the tasks ahead of it are shifted out of the q array - note that we also
    	// bind it to the promise (way down below)
        var taskIndex = this.q.length;

        this.q[taskIndex] = new Promise(function(resolve, reject) {

            var taskIndex = this.taskIndex;

            // if the queue is empty, we can execute the write task immediately
            if (this.self.q.length === 0) {

                doWrite(this.self, this.s, 0);
            }

            // if the queue has other tasks in it, we need to add this task to the then() 
            // method of the last task in the queue
            else if (this.self.q.length > 0) {

                this.self.q[this.self.q.length - 1].then(function() {

                    doWrite(this.self, this.s, 0);

                }.bind({self: this.self, s: s}));
            }

            function doWrite(self, s, pos) {

                setTimeout(function() {

                    // c is the character we're gonna type
                    var c = this.s.substr(this.pos, 1);

                    // if our desired character has an entry in the error table and the randomizer hits, 
                    // let's type a randomized wrong character
                    if (this.self.errorTable.hasOwnProperty(c) && this.self.probability > Math.random()) {

                        this.self.pressKey(this.self.errorTable[c][Math.floor(Math.random() * this.self.errorTable[c].length)]);

                        // now let's wait for a duration, backspace the mistake, and recurse doWrite to
                        // try again
                        setTimeout(function() {

                            window.requestAnimationFrame(function() {

                            	// here's where we backspace the mistake
                            	if (this.self.showCursor) {

                            		// if we're showing the cursor, first delete the cursor
                            		this.self.destination.innerHTML = this.self.destination.innerHTML.substr(0, this.self.destination.innerHTML.length - 1);

                            		// then delete the mistake
                            		this.self.destination.innerHTML = this.self.destination.innerHTML.substr(0, this.self.destination.innerHTML.length - 1);

                            		// then add the cursor back in
                            		this.self.destination.innerHTML = this.self.destination.innerHTML + this.self.cursor;

                            	}

                            	else {

                            		// if we're not showing the cursor, just delete the mistake
                            		this.self.destination.innerHTML = this.self.destination.innerHTML.substr(0, this.self.destination.innerHTML.length - 1);

                            	}
                                
                            	// here's where we recurse the function to do it again
                                doWrite(this.self, this.s, this.pos);

                            }.bind({self: this.self, s: this.s, pos: this.pos}));

                        }.bind({self: this.self, s: this.s, pos: this.pos}), Math.random() * this.self.backspaceSlowness);

                    }

                    // otherwise, let's type the correct character, advance the position in our
                    // string and recurse to do it again
                    else {

                        this.self.pressKey(c);

                        this.pos += 1;

                        if (this.pos <= this.s.length) {

                            doWrite(this.self, this.s, this.pos);
                
                        }

                        // here's where we've reached the end of the string, so we resolve the promise
                        // and shift it out of the task queue
                        else {

                            resolve();
                            
                            this.self.q.shift();

                            console.log("Completed write task at index " + taskIndex + ". Task queue is now " + this.self.q.length + " items long.");
                        }

                    }

                }.bind({self: self, s: s, pos: pos}), Math.random() * self.slowness);

            
            }

        }.bind({self: this.self, s: s, taskIndex: taskIndex}));


    }

    this.writeUncorrected = function(s) {

    	// todo: you may never need this taskIndex, as it just stores the original q index assigned to the task
    	// which is subject to change as the tasks ahead of it are shifted out of the q array - note that we also
    	// bind it to the promise (way down below)
        var taskIndex = this.q.length;

        this.q[taskIndex] = new Promise(function(resolve, reject) {

            var taskIndex = this.taskIndex;

            // if the queue is empty, we can execute the write task immediately
            if (this.self.q.length === 0) {

                doWriteUncorrected(this.self, this.s, 0);
            }

            // if the queue has other tasks in it, we need to add this task to the then() 
            // method of the last task in the queue
            else if (this.self.q.length > 0) {

                this.self.q[this.self.q.length - 1].then(function() {

                    doWriteUncorrected(this.self, this.s, 0);

                }.bind({self: this.self, s: s}));
            }

            function doWriteUncorrected(self, s, pos) {

                setTimeout(function() {

                    // c is the character we're gonna type
                    var c = this.s.substr(this.pos, 1);

                    // if our desired character has an entry in the error table and the randomizer hits, 
                    // let's type a randomized wrong character
                    if (this.self.errorTable.hasOwnProperty(c) && this.self.probability > Math.random()) {

                        this.self.pressKey(this.self.errorTable[c][Math.floor(Math.random() * this.self.errorTable[c].length)]);

                    }

                    // otherwise, let's type the correct character, advance the position in our
                    // string and recurse to do it again
                    else {

                        this.self.pressKey(c);

                    }

                    // advance our position in the string
					this.pos += 1;

					// if we've got more string to type, recurse the function
                    if (this.pos <= this.s.length) {

                    	doWriteUncorrected(this.self, this.s, this.pos);
                
                    }

                    // or if we've reached the end of the string, we resolve the promise
                    // and shift it out of the task queue
                    else {

                        resolve();
                            
                        this.self.q.shift();

                        console.log("Completed writeUncorrected task at index " + taskIndex + ". Task queue is now " + this.self.q.length + " items long.");
                        
                    }

                }.bind({self: self, s: s, pos: pos}), Math.random() * self.slowness);

            }

        }.bind({self: this.self, s: s, taskIndex: taskIndex}));
        
    }

    this.enter = function(n) {

    	// todo: you may never need this taskIndex, as it just stores the original q index assigned to the task
    	// which is subject to change as the tasks ahead of it are shifted out of the q array - note that we also
    	// bind it to the promise (way down below)
        var taskIndex = this.q.length;

        this.q[taskIndex] = new Promise(function(resolve, reject) {

            var taskIndex = this.taskIndex;

            // if the queue is empty, we can execute the enter task immediately
            if (this.self.q.length === 0) {

                doEnter(this.self, this.n);
            
            }

            // if the queue has other tasks in it, we need to add this task to the then() 
            // method of the last task in the queue
            else if (this.self.q.length > 0) {

                this.self.q[this.self.q.length - 1].then(function() {

                    doEnter(this.self, this.n);

                }.bind({self: this.self, n: n}));
            
            }

            function doEnter(self, n) {

                if (n && n > 1) {

                    for (var i = 0; i < n; i += 1) {

                    	if (self.showCursor) {

                    		// if we're showing the cursor, first delete the cursor
                    		self.destination.innerHTML = self.destination.innerHTML.substr(0, self.destination.innerHTML.length - 1);

                    		// then add the line break
                    		self.destination.innerHTML = self.destination.innerHTML + "<br>";

                    		// then add the cursor back in
                    		self.destination.innerHTML = self.destination.innerHTML + self.cursor;

                    	}

                    }
        
                }

                else {

                	if (self.showCursor) {

                		// if we're showing the cursor, first delete the cursor
                		self.destination.innerHTML = self.destination.innerHTML.substr(0, self.destination.innerHTML.length - 1);

                		// then add the line break
                    	self.destination.innerHTML = self.destination.innerHTML + "<br>";

                    	// then add the cursor back in
                    	self.destination.innerHTML = self.destination.innerHTML + self.cursor;
                	}        

                }

                resolve();
                            
                self.q.shift();

                console.log("Completed enter task at index " + taskIndex + ". Task queue is now " + self.q.length + " items long.");

            }

        }.bind({self: this.self, n: n, taskIndex: taskIndex}));

    }

    this.backspaceAll = function(ttl) {

    	// todo: you may never need this taskIndex, as it just stores the original q index assigned to the task
    	// which is subject to change as the tasks ahead of it are shifted out of the q array - note that we also
    	// bind it to the promise (way down below)
        var taskIndex = this.q.length;

        this.q[taskIndex] = new Promise(function(resolve, reject) {

        	var taskIndex = this.taskIndex;

        	 // if the queue is empty, we can execute the backspaceAll task immediately
            if (this.self.q.length === 0) {

            	setTimeout(function() {

            		doBackspaceAll(this.self);

            	}.bind({self: this.self}), ttl);
                
            
            }

            // if the queue has other tasks in it, we need to add this task to the then() 
            // method of the last task in the queue
            else if (this.self.q.length > 0) {

                this.self.q[this.self.q.length - 1].then(function() {

                	setTimeout(function() {

                		doBackspaceAll(this.self);

                	}.bind({self: this.self}), ttl);

                }.bind({self: this.self}));
            
            }

            function doBackspaceAll(self) {

            	setTimeout(function() {

            		if (self.showCursor) {

            			// if we're showing the cursor, first remove the cursor
            			self.destination.innerHTML = self.destination.innerHTML.substr(0, self.destination.innerHTML.length - 1);

            			// and remove a character too
            			self.destination.innerHTML = self.destination.innerHTML.substr(0, self.destination.innerHTML.length - 1);

            			// and then add the cursor back in
            			self.destination.innerHTML = self.destination.innerHTML + self.cursor;

            		}

            		else {

            			// if we're not showing the cursor, just remove a character
            			self.destination.innerHTML = self.destination.innerHTML.substr(0, self.destination.innerHTML.length - 1);

            		}

            		// if there's more to backspace, recurse the function
            		if (self.destination.innerHTML.length > 0) {

            			doBackspaceAll(this.self);

            		}

            		// if there's no more to backspace, resolve the promise and shift 
            		// the task out of the queue
            		else {

	            		resolve();
	                            
	                	self.q.shift();

	                	console.log("Completed backspaceAll task at index " + taskIndex + ". Task queue is now " + self.q.length + " items long.");

                	}

            	}.bind({self: self}), 100);

            }

        }.bind({self: this.self, ttl: ttl, taskIndex: taskIndex}));

    }

	this.errorTable = {

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
        "+": ["=", "_"]	

	};

}


