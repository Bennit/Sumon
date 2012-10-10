/**
 * See LICENSE file.
 *
 * Game model -- Context
 * Context()
 *  - eventListener : Context listeners
 *  - gameMode : 'classic' | 'progressive' | 'respawn' 
 *  - rows : brick zone size # rows
 *  - cols : brick zone size # columns
 *  - numNumberColors :
 *  - initialRows :
 *  - initialColumns :
 *  - currentRows :
 *  - currentCols :
 *  - initialBricks : count of initial bricks
 *  - data : context model of bricks
 *  - guessNumber : number to guess with bricks
 *  - time : maximum time to make the correct sequence
 *  - selectedList : selected bricks up to this point
 *  - status : control logic (ST_STARTGAME,ST_INITIALIZING,
 *             ST_START_LEVEL,ST_RUNNING,ST_LEVEL_RESULT,ST_ENDGAME)
 *  - level : the current level
 *  - score : the current game points
 *  - turnTime : time it takes to turn the bricks ?
 *  - turnTimes : difficulty based turn times
 *  - difficulty : 0 -> 2 (easy -> hard)
 *  - brickIncrementByDifficulty: the difficulty mapped to the
 *    amount added to the number to be guessed 
 *  - meters : altitude 
 *
 *  getNumberColors() = number
 *  getLevelActiveBricks() = number
 *  getBrick(row,col) = Brick
 *
 *  create(maxRows, maxCols, numNumberColors)
 *    Called once on game startup. Initializes with given data
 *
 *  setGameMode(gameMode)
 *    Change to the given game mode and initialize.
 *  
 *  initialize() = Context
 *    Prepare the context for a game.
 *  
 *  prepareBricks()
 *    Prepare the brick data field based on the gameMode's initial
 *    brick map if it is present. Otherwise just fill it.
 *
 *  nextLevel() = Context
 *    Change the level and clean up the context.the context for a 
 *    level change. Also decreases the turnTime by 1s per level.
 *  
 *  fireEvent(source,type,params)
 *    Notify listeners of a context event from the given source with
 *    the given event type and it's parameters.
 *  
 *  addContextListener(listener) = Context
 *    Add a context listener object that implements 
 *    contextEvent(source,type,params).
 *
 *  setStatus(status)
 *    Change the context's status to the given status and fire event.
 *  
 *  selectionChanged(brick)
 *    If the brick is already selected, unselect it.
 *    If the brick is not selected, we check the guess versus the sum.
 *      - sum == guess => remove all bricks from the selected list and 
 *        rearrange bricks if gameMode requires it.
 *      - sum > guess => undo the selection, fire selectionoverflow
 *      - sum < guess => add the brick to the selection, setMultipliers
 *
 *  setGuessNumber()
 *    Pick a random value depending on the bricks in play, the
 *		difficulty and the current level.
 *
 *	timeUp()
 *		End the game since the sum hasn't been guessed within the given 
 *		time.
 *	
 *	respawn()
 *		Add a row of bricks if possible, else end the game. Let them
 *		fall into position.
 *	
 *	setMultipliers()
 *		Set the multiplier based on nr of bricks. capped to [1..5].
 *	
 *	incrementAltitude(increment)
 *		Increment the altitude by the given amount of meters.
 *	
 *	setALtitude(altitude)
 *		Set the altitude to the given amount of meters.
 *	
 */
(function() {

    HN.Context= function() {
        this.eventListener= [];
        return this;
    };

    HN.Context.prototype= {

        eventListener:  null,   // context listeners

        gameMode:       null,

        rows:           0,      // model size in
        columns:        0,      //  rows x columns
        numNumberColors:0,
        initialRows:    0,
        initialColumns: 0,
        currentRows:    0,
        currentColumns: 0,

        /**
         * Active initial number of bricks in the level.
         * You can specify a map of active bricks through the gamemode.
         * All the bricks don't have to match initialRows * initialColumns,
         * we don't need to count because the game progresses the brick
         * entrance flying animation until all bricks have arrived.
         */
        initialBricks:  0,

        data:           null,   // context model. Bricks.

        guessNumber:    0,      // number to sum up with bricks.
        time:           0,      // maximum time to take to guess an adding number sequence.

        selectedList:   null,   // selected bricks.

        status:         0,      // <-- control logic -->
        level:          0,

        score:          0,      // game points.


        turnTime:       15000,

        turnTimes:      [20000, 15000, 10000],
        difficulty:     0,    // 0: easy, 1: hard, 2: hardcore.

        brickIncrementByDifficulty: [5,10],

        meters:         0,

        ST_STARTGAME:       5,
        ST_INITIALIZING:    0,
        ST_START_LEVEL:     2,
        ST_RUNNNING:        1,
        ST_LEVEL_RESULT:    3,
        ST_ENDGAME:         4,


        /**
         * Called once on game startup.
         *
         * @return nothing.
         */
        create : function( maxR, maxC, numNumberColors  ) {
            this.rows=              maxR;
            this.columns=           maxC;
            this.numNumberColors=   numNumberColors;
            this.data=              [];

            var i,j;

            for( i=0; i<this.rows; i++ ) {
                this.data.push( [] );
                for( j=0; j<this.columns; j++ ) {
                    this.data[i].push( new HN.Brick() );
                }
            }

            return this;
        },
        setGameMode : function( gameMode) {
            if ( gameMode!=this.gameMode ) {
                this.gameMode=          gameMode;
                this.initialRows=       gameMode.rows_initial;
                this.initialColumns=    gameMode.columns_initial;
            }

            this.initialize();
        },
        getNumberColors : function()  {
            return this.numNumberColors;
        },
        initialize : function() {

            this.setStatus( this.ST_STARTGAME );
            this.turnTime= this.turnTimes[this.difficulty];
            this.score=0;
            this.level=0;
            this.setAltitude(0);
            this.currentRows= this.initialRows;
            this.currentColumns= this.initialColumns;
            this.nextLevel();
            return this;
        },
        getLevelActiveBricks : function() {
            return this.initialBricks;
        },
        prepareBricks : function() {

            var i,j;

            for( i=0; i<this.rows; i++ ) {
                for( j=0; j<this.columns; j++ ) {
                    this.data[i][j].initialize(i,j,this,true);
                }
            }

            if ( this.gameMode.initial_map ) {
                var im= this.gameMode.initial_map;

                this.initialBricks=0;
                for( i=0; i<this.currentRows; i++ ) {
                    for( j=0; j<this.currentColumns; j++ ) {

                        var removed= true;
                        if ( im.length<i ) {
                            removed= false;
                        } else {
                            if ( im[i].length<j ) {
                                removed= false;
                            } else {
                                removed= im[i][j]==0;
                            }
                        }

                        this.data[i][j].initialize(i,j,this,removed);

                        if (!removed) {
                            this.initialBricks++;
                        }
                    }
                }

            } else {
                this.initialBricks= this.currentRows*this.currentColumns;

                for( i=0; i<this.currentRows; i++ ) {
                    for( j=0; j<this.currentColumns; j++ ) {
                        this.data[i][j].initialize(i,j,this,false);
                    }
                }
            }
        },
        nextLevel : function() {

            this.level++;
            this.fireEvent('context','levelchange',this.level);

            this.selectedList=  [];

            // not fixed size.
            // add one column/row alternatively until reaching rows/columsn size.
            if ( !this.gameMode.fixed_table_size ) {
                if ( this.level>1 && (this.currentRows<this.rows || this.currentColumns<this.columns )) {
                    if ( this.currentRows==this.currentColumns ) {
                        this.currentColumns++;
                    } else {
                        this.currentRows++;
                    }
                }
            }

            this.prepareBricks();

            this.setStatus( this.ST_INITIALIZING );

            // EDIT : turntime is a builtin difficulty! after advice
            //        to change this back or use gameMode.minTurnTime
            if ( this.level>1 ) {
                // 1 seconds less each level.
                this.turnTime-= this.gameMode.time_policy;
                if ( this.gameMode.minTurnTime ) {
                    if ( this.turnTime<this.gameMode.minTurnTime ) {
                        this.turnTime= this.gameMode.minTurnTime;
                    }
                }
            }

            return this;
        },
        /**
         * Notify listeners of a context event
         * @param sSource event source object
         * @param sEvent an string indicating the event type
         * @param params an object with event parameters. Each event type will have its own parameter set.
         */
        fireEvent : function( sSource, sEvent, params ) {
            var i;
            for( i=0; i<this.eventListener.length; i++ ) {
                this.eventListener[i].contextEvent( {
                    source: sSource,
                    event:  sEvent,
                    params: params
                });
            }
        },
        addContextListener : function( listener ) {
            this.eventListener.push(listener);
            return this;
        },
        getBrick : function( row, column ) {
            return this.data[row][column];
        },
        setStatus : function( status ) {
            this.status= status;
            this.fireEvent( 'context', 'status', this.status );

            if ( this.status==this.ST_RUNNNING ) {
                this.setGuessNumber();
            }
        },
        selectionChanged : function(brick) {

            // si ya estaba en la lista de seleccionados, quitarlo.
            var i,j;
            for( i=0; i<this.selectedList.length; i++ ) {
                // esta en la lista.
                // eliminar y salir del metodo
                if ( this.selectedList[i]==brick ) {
                    this.selectedList.splice( i, 1 );
                    this.fireEvent('brick','selection',brick);
                    return;
                }
            }

            // chequear que la suma de los elementos seleccionados es igual al numero magico.
            var sum=0;
            for( i=0; i<this.selectedList.length; i++ ) {
                sum+= this.selectedList[i].value;
            }

            sum+= brick.value;

            var selected;

            if ( sum>this.guessNumber ) {

                brick.selected= false;
                selected= this.selectedList.slice(0);
                for( i=0; i<this.selectedList.length; i++ ) {
                    this.selectedList[i].selected= false;
                }
                this.selectedList= [];

                // quitar marca de seleccion al ladrillo.
                this.fireEvent('brick','selectionoverflow', selected );
            } else if ( sum==this.guessNumber ) {
                this.selectedList.push(brick);
                selected= this.selectedList.slice(0);
                for( i=0; i<this.selectedList.length; i++ ) {
                    this.selectedList[i].selected= false;
                    this.selectedList[i].removed= true;
                }

                // rearrange bricks if needed
                if ( this.gameMode.rearrange_on_remove ) {
                    for( i=0; i<this.selectedList.length; i++ ) {
                        var r= this.selectedList[i].row;
                        var c= this.selectedList[i].column;

                        // bajar todos los elementos de columna una posicion.
                        for( var row= r; row>0; row-- ) {
                            var move= this.data[row-1][c];
                            var to=   this.data[row][c];

                            var tmp= move;
                            this.data[row-1][c]= this.data[row][c];
                            this.data[row][c]= tmp;

                            // cambiar row del brick. la columna es la misma
                            tmp= move.row;
                            move.row= to.row;
                            to.row= tmp;

                            this.fireEvent(
                                    'brick',
                                    'rearranged',
                                    {
                                        fromRow :   move.row-1,
                                        toRow:      move.row,
                                        column:     c
                                    });
                        }
                    }
                }

                this.selectedList= [];

                this.fireEvent('brick','selection-cleared', selected );

                this.score+= this.multiplier * ((selected.length+1)*(this.difficulty==0?10:20))*selected.length;

                this.fireEvent('context','score',this);

                for( i=0; i<this.rows; i++ ) {
                    for( j=0; j<this.columns; j++ ) {
                        if ( !this.data[i][j].removed ) {
                            this.setGuessNumber();
                            return;
                        }
                    }
                }

                this.setStatus( this.ST_LEVEL_RESULT );
                
            } else {
                // todavia podemos sumar numeros.
                this.selectedList.push(brick);
                this.fireEvent('brick','selection',brick);
                this.setMultipliers();
            }
        },
        setGuessNumber : function() {

            // first get all available board numbers.
            var activeBricks= [];
            var i,j;
            for( i=0; i<this.rows; i++ ) {
                for( j=0; j<this.columns; j++ ) {
                    if ( !this.data[i][j].removed ) {
                        activeBricks.push(this.data[i][j]);
                    }
                }
            }

            // scramble elements.
            if ( activeBricks.length>1 ) {
                for( i=0; i<activeBricks.length; i++ ) {
                    var rpos0=              (Math.random()*activeBricks.length)>>0;
                    var tmp=                activeBricks[i];

                    activeBricks[i]=        activeBricks[rpos0];
                    activeBricks[rpos0]=    tmp;
                }
            }

            /**
             * tenemos que estar seguros que el numero ofrecido al player debe estar entre:
             * 10-15 15-20 20-25 ... (facil)
             * 10-20 20-30 30-40 ... (dificil)
             */
            var sum=0;
            var diff= this.brickIncrementByDifficulty[this.difficulty];
            //var min= 10 + (this.level-1)*diff;
            var index__= this.level-1;
            if ( index__>=this.gameMode.number_policy.length ) {
                index__= this.gameMode.number_policy.length-1;
            }
            var min= this.gameMode.number_policy[index__];
            var max= min+diff;
            var brickCount=0;

            if ( activeBricks.length==1 ) {
                sum= activeBricks[0].value;
            } else if ( activeBricks.length==2 ) {
                sum= activeBricks[0].value+activeBricks[1].value;
            } else {
                for( i=0; i<activeBricks.length; i++ ) {
                    if ( sum+activeBricks[i].value<=max ) {
                        sum+= activeBricks[i].value;
                        brickCount++;
                    } else {
                        if ( sum>min ) {
                            break;
                        }
                    }
                }

                if ( brickCount==1 ) {
                    sum= activeBricks[0].value+activeBricks[1].value;
                }
            }
            this.guessNumber= sum;
            this.fireEvent( 'context','guessnumber',this );

            this.setMultipliers();
        },
        timeUp : function() {
            this.setStatus( this.ST_ENDGAME );
        },
        respawn : function() {
            // Check that we can still get new elements
            var cabenMas= true; // fit more ?
            var i,j;
            for( i=0; i<this.currentColumns; i++ ) {
                // A column is full. Don't follow.
                if ( !this.data[0][i].removed ) {
                    cabenMas= false;
                    break;
                }
            }

						// no more new elements since a column is full.
            if (!cabenMas) {
                this.setStatus( this.ST_ENDGAME );
                return;
            }

            var respawnData= [];
            // Insert a new row of numbers
            for( j=0; j<this.currentColumns; j++ ) {
                // Find the row where the number falls
                for( i=0; i<this.currentRows; i++ ) {
                    if ( !this.data[i][j].removed ) {
                        break;
                    }
                }

                // I is the row with the last valid element
                i--;
                this.data[i][j].removed= false;
                this.data[i][j].selected= false;
                this.data[i][j].respawn();

                respawnData.push( {
                    row:    i,
                    column: j
                } );
            }

            this.fireEvent('brick','respawn',respawnData);

        },
        /**
				 * Multipliers set points according to:
				 *	+ number of bricks
				 *	+ total distance between bricks
         */
        setMultipliers : function() {

            if ( this.selectedList && this.selectedList.length>0 ) {
                var x0= this.selectedList[0].column;
                var y0= this.selectedList[0].row;
                var d=  0;
                var i;

                for( i=1; i<this.selectedList.length; i++ ) {
                    var x1= this.selectedList[i].column;
                    var y1= this.selectedList[i].row;

                    d+= Math.sqrt( (x1-x0)*(x1-x0) + (y1-y0)*(y1-y0) );

                    x0= x1;
                    y0= y1;
                }

                d= d>>0;
                d= 1+ (d/10)>>0;
                if ( d<1 ) {
                    d=1;
                } else if ( d>5 ) {
                    d=5;
                }

                this.multiplier= d;
            } else {
                this.multiplier= 0;
            }

            this.fireEvent('context','multiplier',this);
        },
        incrementAltitude : function( increment ) {
            this.setAltitude( this.meters+increment );
        },
        setAltitude : function( altitude ) {
            this.meters= altitude;
            this.fireEvent( 'context','altitude',this.meters);
        }
    };
})();
