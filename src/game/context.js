/**
 */
(function() {

    HN.Brick= function() {
        return this;
    };

    HN.Brick.prototype= {

        value:      0,
        color:      0,
        selected:   false,
        removed:    false,

        row:        0,
        column:     0,

        context:    null,
        delegate:   null,

        /**
         *
         * @param row
         * @param column
         * @param context the HN.Context instance
         */
        initialize : function(row, column, context) {
            this.row=       row;
            this.column=    column;
            this.selected=  false;
            this.removed=   false;
            this.color=     (Math.random()*context.getNumberColors())>>0;
            this.context=   context;

            // favorecer los numeros 3..9
            if ( Math.random()>.3 ) {
                this.value= 4 + (Math.random()*6)>>0;
            } else {
                this.value= 1 + (Math.random()*3)>>0;
            }

            if ( this.value<1 ) {
                this.value=1;
            } else if ( this.value>9 ) {
                this.value=9;
            }

            if ( null!=this.delegate ) {
                this.delegate();
            }
        },
        changeSelection : function() {
            this.selected= !this.selected;
            this.context.selectionChanged(this);
        }
    };

})();

(function() {

    HN.Context= function() {
        this.eventListener= [];
        return this;
    };

    HN.Context.prototype= {

        eventListener:  null,   // context listeners

        rows:           0,      // model size in
        columns:        0,      //  rows x columns
        numNumberColors:0,

        data:           null,   // context model. Bricks.

        guessNumber:    0,      // number to sum up with bricks.
        time:           0,      // maximum time to take to guess an adding number sequence.

        selectedList:   null,   // selected bricks.

        status:         0,      // <-- control logic -->
        level:          0,

        score:         0,      // game points.


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
         * @param rows an integer indicating game model rows.
         * @param columns an integer indicating game model columns.
         *
         * @return nothing.
         */
        create : function( rows, columns, numNumberColors  ) {
            this.rows=              rows;
            this.columns=           columns;
            this.numNumberColors=   numNumberColors;
            this.data=              [];

            var i,j;

            for( i=0; i<rows; i++ ) {
                this.data.push( [] );
                for( j=0; j<columns; j++ ) {
                    this.data[i].push( new HN.Brick() );
                }
            }

            return this;
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
            this.nextLevel();
            return this;
        },
        nextLevel : function() {

            var i,j;

            this.level++;
            this.fireEvent('context','levelchange',this.level);

            this.selectedList=  [];

            for( i=0; i<this.rows; i++ ) {
                for( j=0; j<this.columns; j++ ) {
                    this.data[i][j].initialize(i,j,this);
                }
            }

            this.setStatus( this.ST_INITIALIZING );

            if ( this.level>1 ) {
                // 1 seconds less each level.
                this.turnTime-=1000;
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

            if ( sum>this.guessNumber ) {

                brick.selected= false;
                var selected= this.selectedList.slice(0);
                for( i=0; i<this.selectedList.length; i++ ) {
                    this.selectedList[i].selected= false;
                }
                this.selectedList= [];

                // quitar marca de seleccion al ladrillo.
                this.fireEvent('brick','selectionoverflow', selected );
            } else if ( sum==this.guessNumber ) {
                this.selectedList.push(brick);
                var selected= this.selectedList.slice(0);
                for( i=0; i<this.selectedList.length; i++ ) {
                    this.selectedList[i].selected= false;
                    this.selectedList[i].removed= true;
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
            var min= 10 + (this.level-1)*diff;
            var max= min+diff;
            for( i=0; i<activeBricks.length; i++ ) {
                if ( sum+activeBricks[i].value<=max ) {
                    sum+= activeBricks[i].value;
                } else {
                    if ( sum>min ) {
                        break;
                    }
                }
            }

            this.guessNumber= sum;
            this.fireEvent( 'context','guessnumber',this );

            this.setMultipliers();
        },
        timeUp : function() {
            this.setStatus( this.ST_ENDGAME );
        },
        /**
         * establece multiplicadores de puntos en funcion de:
         *  + numero de ladridllos
         *  + distancia total entre ladrillos
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