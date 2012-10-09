/**
 * See LICENSE file.
 *
 * Play scene -- GameScene
 * Displaying of the game field. This gathers all gamescene actors.
 */
(function() {
    HN.GameScene= function() {
        this.gameListener= [];
        return this;
    };

    HN.GameScene.prototype= {

        gameRows:                   15,
        gameColumns:                20,

        context:                    null,
        directorScene:              null,

        selectionPath:              null,
        bricksContainer:            null,
        brickActors:                null,
        particleContainer:          null,

        selectionStarCache:         null,
        fallingStarCache:           null,

        brickWidth:                 0,
        brickHeight:                0,
        buttonImage:                null,
        starsImage:                 null,
        numbersImage:               null,
        numbersImageSmall:          null,

        levelActor:                 null,
        chronoActor:                null,
        timer:                      null,
        scrollTimer:                null,
        scoreActor:                 null,
        respawnClock:               null,

        scoreActorEG:               null,
        levelActorEG:               null,        
        endGameActor:               null,
        endLevelActor:              null,
        endLevelMessage:            null,

        director:                   null,


        actorInitializationCount:   0,  // flag indicating how many actors have finished initializing.

        backgroundContainer:        null,

        music:                      null,
        sound:                      null,

        gameListener:               null,

        /**
         * Creates the main game Scene.
         * @param director a CAAT.Director instance.
         */
        create : function(director, gameMode ) {

            var me= this;
            var i,j;

            this.director= director;

            this.bricksImageAll= new CAAT.SpriteImage().initialize(
                    director.getImage('bricks'), 9, 10 );

            this.brickWidth=  this.bricksImageAll.singleWidth;
            this.brickHeight= this.bricksImageAll.singleHeight;

            this.buttonImage= new CAAT.SpriteImage().initialize(
                    director.getImage('buttons'), 7,3 );
            this.starsImage= new CAAT.SpriteImage().initialize(
                    director.getImage('stars'), 24,6 );
            this.numbersImage= new CAAT.SpriteImage().initialize(
                    director.getImage('numbers'), 1,10 );
            this.numbersImageSmall= new CAAT.SpriteImage().initialize(
                    director.getImage('numberssmall'), 1,10 );

            this.context= new HN.Context().
                    create( 8,8, 9 ).
                    addContextListener(this);

            this.gameRows=      this.context.rows;
            this.gameColumns=   this.context.columns;


            this.directorScene= director.createScene();
            this.directorScene.activated= function() {
                // cada vez que la escena se prepare para empezar partida, inicializar el contexto.
                //me.context.initialize();
                me.context.setGameMode(me.gameMode);
                me.prepareSound();
            };

            var dw= director.width;
            var dh= director.height;

            //////////////////////// animated background

            this.backgroundContainer= new HN.AnimatedBackground().
                    setBounds(0,0,dw,dh).
                    setBackgroundImage( director.getImage('background-1'), false ).
                    setImageTransformation( CAAT.SpriteImage.prototype.TR_FIXED_WIDTH_TO_SIZE ).
                    setInitialOffset( -director.getImage('background-1').height+dh ).
                    setData(this.directorScene, this.context);
            this.directorScene.addChild( this.backgroundContainer );
            this.context.addContextListener(this.backgroundContainer);
            

            this.brickActors= [];

            ///////////// some clouds
            for( i=0; i<4; i++ ) {
                var cl= new HN.BackgroundImage().setupBehavior(director,true);
                this.directorScene.addChild(cl);
            }

            //////////////////////// game container
            var gameContainer= new CAAT.ActorContainer();
            if ( dw>dh ) {
                gameContainer.setBounds(0,0,700,500);
            } else {
                gameContainer.setBounds(0,0,500,700);
            }
            this.directorScene.addChild( gameContainer );

            //////////////////////// Number Bricks
            this.bricksContainer= new CAAT.ActorContainer().
                    create().
                    setSize(
                        this.gameColumns*this.brickWidth,
                        this.gameRows*this.brickHeight )
                ;

            for( i=0; i<this.gameRows; i++ ) {
                this.brickActors.push([]);
                for( j=0; j<this.gameColumns; j++ ) {
                    var brick= new HN.BrickActor().
                            initialize( this.bricksImageAll, this.context.getBrick(i,j) ).
                            setLocation(-100,-100);

                    this.brickActors[i].push( brick );
                    this.bricksContainer.addChild(brick);
                }
            }

            /////////////////////// game indicators.
            var controls= new CAAT.ActorContainer();
            if ( dw>dh ) {
                controls.setSize( 180, gameContainer.height);
            } else {
                controls.setSize( dw, 210 );
            }

            ///////////////////// Guess Number
            var guess= new HN.GuessNumberActor().
                    setNumbersImage( this.numbersImage, director.getImage('target-number') );

            this.context.addContextListener(guess);
            controls.addChild(guess);

            ///////////////////// score
            this.scoreActor= new HN.ScoreActor().
                    initialize( this.numbersImageSmall, director.getImage('points') );
            controls.addChild( this.scoreActor );
            this.context.addContextListener(this.scoreActor);

            ///////////////////// chronometer
            this.chronoActor= new HN.Chrono().
                    setImages( director.getImage('time'), director.getImage('timeprogress'));

            this.context.addContextListener(this.chronoActor);
            controls.addChild(this.chronoActor);

            ///////////////////// Level indicator
	        this.levelActor= new HN.LevelActor().
                    initialize( this.numbersImageSmall, dw>dh ? director.getImage('level') : director.getImage('level-small') );

            this.context.addContextListener(this.levelActor);

	        controls.addChild(this.levelActor);

            /////////////////////// initialize button
            var restart= new CAAT.Actor();
            if ( dw>dh )    {
                restart.setAsButton( this.buttonImage.getRef(), 9,10,11,9,
                        function(button) {
                            me.context.timeUp();
                        });
            } else {
                restart.
                    setAsButton(
                        new CAAT.SpriteImage().initialize(director.getImage('boton-salir'), 1, 3),
                        0,2,0,0,
                        function(button) {
                                me.context.timeUp();
                        });
            }

            restart.contextEvent= function(event) {
                if ( event.source=='context' ) {
                    if ( event.event=='levelchange') {
                        restart.enableEvents(true);
                    } else  if ( event.event=='status') {
                        if ( event.params==HN.Context.prototype.ST_STARTGAME ) {
                            restart.enableEvents(true);
                        } else if ( event.params==HN.Context.prototype.ST_ENDGAME || event.params==HN.Context.prototype.ST_LEVEL_RESULT ) {
                            restart.enableEvents(false);
                        }
                    }
                }
            };
            this.context.addContextListener(restart);
            controls.addChild(restart);

            ////////////////////// Multiplier
            var multiplier;

                var star= director.getImage('multiplier-star');
                multiplier= new HN.MultiplierActorS().
                    setImages( this.numbersImage, director.getImage('multiplier'), star, this.directorScene);
            this.multiplier= multiplier;
            controls.addChild( multiplier );
            this.context.addContextListener(multiplier);


///// lay it all out.

            var HH=55;
            var WW=10;

            if ( dw>dh ) {
                var layoutControls= new CAAT.UI.BoxLayout().
                        setAxis( CAAT.UI.BoxLayout.AXIS.Y).
                        setHorizontalAlignment( CAAT.UI.ALIGNMENT.CENTER).
                        setVerticalAlignment( CAAT.UI.ALIGNMENT.TOP).
                        setVGap(0);

                layoutControls.doLayout( controls );
                this.multiplier.setLocation(
                    this.scoreActor.x + this.scoreActor.width - star.width*.8,
                    this.scoreActor.y - star.height*.3 );

                gameContainer.addChild(this.bricksContainer);
                gameContainer.addChild( controls );
                gameContainer.centerAt( dw/2, dh/2 );

            } else {
                guess.setLocation( WW, HH );
                this.scoreActor.setLocation( dw-this.scoreActor.width-WW, HH );
                this.chronoActor.setLocation( dw-this.chronoActor.width-WW, guess.y+guess.height-this.chronoActor.height-15 );
                this.levelActor.setLocation(
                    // espacio entre target number y score actor
                    ((this.scoreActor.x- (guess.x+guess.width)) - this.levelActor.width)/2 + (guess.x+guess.width),
                    guess.y+guess.height - this.levelActor.height - 10 );
                this.multiplier.setLocation(
                    this.scoreActor.x + this.scoreActor.width - star.width*.8,
                    this.scoreActor.y - star.height*.3 );

                gameContainer.addChild( controls );
                gameContainer.addChild(this.bricksContainer);
            }

            var layout= new CAAT.UI.BoxLayout().
                            setAxis( dw>dh ? CAAT.UI.BoxLayout.AXIS.X : CAAT.UI.BoxLayout.AXIS.Y ).
                            setVerticalAlignment( CAAT.UI.BoxLayout.ALIGNMENT.TOP ).
                            setHorizontalAlignment( CAAT.UI.BoxLayout.ALIGNMENT.CENTER).
                            setHGap(20).
                            setVGap(5).
                            setPadding( 0,0,10,0 );
            layout.doLayout( gameContainer );

            if ( dw>dh ) {
                // scale content if landscape.
                var min= Math.min( gameContainer.width, gameContainer.height );
                var scale=  Math.min(dw,dh) / min;
                gameContainer.setScale( scale, scale );
            }


            /////////////////////// particle container
            // just to accelerate events delivery
            if ( !HN.LOWQUALITY ) {
                this.particleContainer= new CAAT.ActorContainer().
                        setBounds( this.bricksContainer.x, this.bricksContainer.y, dw, dh ).
                        enableEvents(false);
                gameContainer.addChild( this.particleContainer );
                this.create_cache();
            }

            /////////////////////// initialize selection path
            /// create this one as the last actor so when gl active, no extra drawtris call needed.
            this.selectionPath= new HN.SelectionPath(director).
                    setBounds(
                        this.bricksContainer.x,
                        this.bricksContainer.y,
                        this.gameColumns*this.brickWidth,
                        this.gameRows*this.brickHeight);
            this.selectionPath.enableEvents(false);
            gameContainer.addChild(this.selectionPath);
            this.context.addContextListener(this.selectionPath);


            ////////////// respawn
            this.create_respawntimer(director);
            if ( dw>dh ) {
                this.respawnClock.setLocation(2,2);
            } else {
                this.respawnClock.setLocation(
                    this.levelActor.x + (this.levelActor.width - this.respawnClock.width)/2,
                    this.levelActor.y - this.respawnClock.height );
            }

            ////////////////////////////////////////////////
            this.create_EndGame(director);
            this.create_EndLevel(director);
            this.soundControls( director );


            ////////////////////////////////////////////////
/*
            var me= this;
            var C=20;
            var count=0;
            var fpsc=0;
            var fps= new CAAT.Actor().setBounds(0,0,120,40);
            fps.__fps=0;
            fps.paintActor= function( director, time ) {

                this.invalidate();

                CAAT.Actor.prototype.__paintActor.call(this,director,time);

                fpsc+= CAAT.FRAME_TIME;

                count++;
                if ( !(count%C) ) {
                    this.__fps= ((C*1000)/fpsc)>>0;
                    fpsc=0;
                    count=0;
                }

                this.__fps=''+this.__fps;

                var ctx= director.ctx;
                var im= me.numbersImageSmall;

                ctx.fillStyle= 'rgb(32,32,32)';
                ctx.fillRect(0,0,this.__fps.length*im.singleWidth+10, 10+im.singleHeight);

                for( var i=0; i<this.__fps.length;i++ ) {
                    var c= this.__fps.charAt(i);
                    c= parseInt(c,10);

                    if ( c>=0 && c<=9 ) {
                        im.setSpriteIndex(c);
                        im.paint( director, 0, i*im.singleWidth+5, 5 );
                    }
                }

            };

            this.directorScene.addChild( fps );
*/
            return this;
        },
        createCachedStar : function(director) {
            var iindex= (Math.random()*this.starsImage.columns)>>0;
            var actor= new CAAT.Actor();
            actor.__imageIndex= iindex;
            actor.
                setBackgroundImage( this.starsImage.getRef().setAnimationImageIndex( [iindex] ), true ).
                enableEvents(false).
                setDiscardable(true).
                setOutOfFrameTime().
                addBehavior(
                this.director.getRenderType()==='CSS' ?
                    new CAAT.AlphaBehavior().
                        setValues( 1, .1 ).
                        setId('__alpha'):
                    new CAAT.GenericBehavior().
                        setValues( 1, .1, null, null, function(value,target,actor) {
                            actor.backgroundImage.setAnimationImageIndex( [
                                actor.__imageIndex+(23-((23*value)>>0))*actor.backgroundImage.getColumns()
                            ] );
                        }).
                        setId('__alpha') );

            return actor;
        },
        create_cache: function() {
            this.selectionStarCache= [];
            this.fallingStarCache=   [];

            var i,actor,me;

            me= this;

            for( i=0; i<16*4; i++ ) {
                actor= this.createSelectionStarCache();
                actor.addListener( {
                    actorLifeCycleEvent : function(actor, event, time) {
                        if (event === 'destroyed') {
                            me.selectionStarCache.push(actor);
                        }
                    }
                });
                actor.__parent= this.particleContainer;
                this.selectionStarCache.push(actor);
            }

            for( i=0; i<384; i++ ) {
                var actor= this.createCachedStar();
                actor.addListener( {
                    actorLifeCycleEvent : function(actor, event, time) {
                        if (event === 'destroyed') {
                            me.fallingStarCache.push(actor);
                        }
                    }
                });
                actor.__parent= this.particleContainer;
                this.fallingStarCache.push(actor);
            }
        },
        createSelectionStarCache : function() {
            var actor= this.createCachedStar();

            var trb=
                new CAAT.PathBehavior().
                    setFrameTime(this.directorScene.time,0).
                    setPath(
                        new CAAT.LinearPath().
                            setInitialPosition(0,0).
                            setFinalPosition(0,0)
                    ).
                    setInterpolator(
                        new CAAT.Interpolator().createExponentialOutInterpolator(
                            2,
                            false)
                    );
            actor.__trb= trb;
            actor.addBehavior(trb);

            var ab= null;
            if ( this.director.getRenderType()==='CSS' ) {
                ab= new CAAT.AlphaBehavior().setValues( 1, .1 );
            } else {
                ab= new CAAT.GenericBehavior().
                        setValues( 1, .1, null, null, function(value,target,actor) {
                            actor.backgroundImage.setAnimationImageIndex( [
                                    actor.__imageIndex+(23-((23*value)>>0))*actor.backgroundImage.getColumns()
                                ] );
                        });
            }
            actor.__ab= ab;
            actor.addBehavior(ab);


            return actor;
        },
        create_respawntimer: function(director) {
            var clock= new HN.RespawnClockActor().create().initialize(director, this.directorScene, this.context);
            this.directorScene.addChild( clock );
            this.context.addContextListener(clock);
            this.respawnClock= clock;
            this.respawnClock.setOutOfFrameTime();
        },
        create_EndLevel : function( director ) {
            this.endLevelActor= new CAAT.ActorContainer().
                    setBackgroundImage( director.getImage('levelclear'), true);

            var me= this;
            var me_endLevel= this.endLevelActor;
            var continueButton= new CAAT.Actor().
                    setAsButton( this.buttonImage.getRef(), 12,13,14,12,
                        function(button) {
                            director.audioPlay('11');
                            me.removeGameEvent( me.endLevelActor, function() {
                                me.context.nextLevel();
                            });
                        });
            continueButton.setLocation(
                    (this.endLevelActor.width-continueButton.width)/2,
                    this.endLevelActor.height-continueButton.height-50 );


            this.endLevelMessage= new CAAT.Actor().
                    setBackgroundImage( director.getImage('msg1'), true );

            this.endLevelActor.addChild(continueButton);
            this.endLevelActor.addChild(this.endLevelMessage);
            this.endLevelActor.setOutOfFrameTime();
            this.directorScene.addChild(this.endLevelActor);
        },
        create_EndGame : function(director, go_to_menu_callback ) {
            var me= this;

            this.endGameActor= new CAAT.ActorContainer().
                    setBackgroundImage( director.getImage('background_op'), true );

            var menu= new CAAT.Actor().
                    setAsButton( this.buttonImage.getRef(), 15,16,17,15,
                        function(button) {
                            director.audioPlay('11');

                            me.endGameActor.enableEvents(false);

                            var a0;
                            var a1;

                            a0= CAAT.Actor.prototype.ANCHOR_BOTTOM;
                            a1= CAAT.Actor.prototype.ANCHOR_TOP;

                            director.easeInOut(
                                0,
                                CAAT.Scene.EASE_TRANSLATE,
                                a0,
                                1,
                                CAAT.Scene.EASE_TRANSLATE,
                                a1,
                                1000,
                                false,
                                new CAAT.Interpolator().createExponentialInOutInterpolator(3,false),
                                new CAAT.Interpolator().createExponentialInOutInterpolator(3,false) );
                        });
            var me_endGame= this.endGameActor;

            var restart= new CAAT.Actor().
                    setAsButton( this.buttonImage.getRef(), 12,13,14,12,
                        function(button) {
                            director.audioPlay('11');
                            me.removeGameEvent( me.endGameActor, function() {
                                me.prepareSceneIn(me.context.gameMode);
                                me.context.initialize();
                            })
                        });

            if ( !CocoonJS.available ) {
                var tweetImage= new CAAT.SpriteImage().initialize( director.getImage('tweet'), 1, 3 );
                var tweet= new CAAT.Actor().
                        setAsButton( tweetImage, 0,1,2,0,
                            function(button) {
                                var url = "http://twitter.com/home/?status=Wow! I just scored "+me.context.score+" points (mode "+me.context.gameMode.name+") in Sumon. Beat that! http://labs.hyperandroid.com/static/sumon/sumon.html";
                                window.open(url, 'blank', '');
                            });
            }

            var x= 45;
            //var x= (this.endGameActor.width-2*menu.width-30)/2;
            var y= this.endGameActor.height-35-menu.height;

            menu.setLocation( x, y );
            //restart.setLocation( x+menu.width+30, y );
            restart.setLocation( x+menu.width+10, y );

            this.endGameActor.addChild(menu);
            this.endGameActor.addChild(restart);

            var __buttons= [ menu, restart ];
            if ( !CocoonJS.available ) {
                tweet.setLocation( 375, this.endGameActor.height - 25 - tweetImage.height );
                this.endGameActor.addChild(tweet);
                __buttons.push( tweet );
            } else {
                CAAT.modules.LayoutUtils.row(
                    this.endGameActor,
                    __buttons,
                    {
                        padding_left:   50,
                        padding_right:  50,
                        top:            y
                    });
            }

            //////////////////////// info de partida
            this.levelActorEG= new HN.LevelActor().
                    initialize(this.numbersImageSmall, director.getImage('level'));
            this.levelActorEG.
                    setBounds(
                        (this.endGameActor.width-this.levelActorEG.width)/2,
                        265,
                        this.levelActorEG.width,
                        this.levelActorEG.height );
            this.endGameActor.addChild(this.levelActorEG);
            this.context.addContextListener(this.levelActorEG);

            ///////////////////// score
            this.scoreActorEG= new HN.ScoreActor().
                    create().
                    setBounds(
                        ((this.endGameActor.width-this.scoreActor.width)/2)|0,
                        335,
                        this.scoreActor.width,
                        this.scoreActor.height ).
                    initialize( this.numbersImageSmall, director.getImage('points') );
            this.endGameActor.addChild( this.scoreActorEG );
            this.context.addContextListener(this.scoreActorEG);

            this.endGameActor.setOutOfFrameTime();

            this.directorScene.addChild(this.endGameActor);
        },
        getBrickPosition : function(row,column) {
            return {
                x: (this.context.columns-this.context.currentColumns)/2*this.brickWidth+ column*this.brickWidth,
                y: (this.context.rows-this.context.currentRows)/2*this.brickHeight+ row*this.brickHeight
            };
        },
        uninitializeActors : function() {
            this.selectionPath.initialize();

            var i, j;
            var radius= Math.max(this.director.width,this.director.height );
            var angle=  Math.PI*2*Math.random();
            var me=     this;

            var p0= Math.random()*this.director.width;
            var p1= Math.random()*this.director.height;
            var p2= Math.random()*this.director.width;
            var p3= Math.random()*this.director.height;

            for( i=0; i<this.gameRows; i++ ) {
                for( j=0; j<this.gameColumns; j++ ) {
                    var brickActor= this.brickActors[i][j];

                    if ( brickActor.brick.removed ) {
                        continue;
                    }

                    var random= Math.random()*1000;

                    brickActor.pb.
                            emptyListenerList().
//                            setFrameTime(this.directorScene.time, 1000+random).
                            setPath(
                                new CAAT.CurvePath().
                                        setCubic(
                                            brickActor.x, brickActor.y,
                                            p0, p1,
                                            p2, p3,
                                            radius/2 + Math.cos(angle)*radius,
                                            radius/2 + Math.sin(angle)*radius
                                         )
                                ).
                            setInterpolator(
                                new CAAT.Interpolator().createExponentialInOutInterpolator(3,false) );
                    if (!HN.LOWQUALITY) {
                        brickActor.pb.
                                setFrameTime(this.directorScene.time, 1000+random );
                    } else {
                        brickActor.pb.
                                setFrameTime(this.directorScene.time + i*200, 700+random/3 );
                    }

                    if (!HN.LOWQUALITY) {
                        brickActor.sb.
                                emptyListenerList().
                                setFrameTime(this.directorScene.time , 1000+random).
                                setValues( 1, .1, 1 , .1).
                                setInterpolator(
                                    new CAAT.Interpolator().createExponentialInOutInterpolator(3,false) );
                    }
                    
                    brickActor.
                        enableEvents(false).
                        setAlpha(1).
                        resetTransform();

                }
            }

        },
        initializeActors : function() {

            this.selectionPath.initialize();

            var i, j;
            var maxt= 0;

            var context;

            var radius= Math.max(this.director.width,this.director.height );
            var angle=  Math.PI*2*Math.random();


            var p0= Math.random()*this.director.width;
            var p1= Math.random()*this.director.height;
            var p2= Math.random()*this.director.width;
            var p3= Math.random()*this.director.height;


            for( i=0; i<this.gameRows; i++ ) {
                for( j=0; j<this.gameColumns; j++ ) {
                    var brickActor= this.brickActors[i][j];

                    if ( brickActor.brick.removed ) {
                        brickActor.setOutOfFrameTime();
                    } else {

                        brickActor.
                                setFrameTime( this.directorScene.time, Number.MAX_VALUE ).
                                setAlpha(1).
                                enableEvents(true).
                                reset();

                        var random= (Math.random()*1000)>>0;
                        if ( random>maxt ) {
                            maxt= random;
                        }

                        var brickPosition= this.getBrickPosition(i,j);
                        brickActor.pb.
                                emptyListenerList().
                                setPath(
                                    new CAAT.CurvePath().
                                            setCubic(
                                                radius/2 + Math.cos(angle)*radius,
                                                radius/2 + Math.sin(angle)*radius,
                                                p0, p1, p2, p3,
                                                brickPosition.x,
                                                brickPosition.y)
                                    ).
                                setInterpolator(
                                    new CAAT.Interpolator().createExponentialInOutInterpolator(3,false) ).
                                setFrameTime(this.directorScene.time, 1000+random);
                        brickActor.sb.
                                emptyListenerList().
                                setValues( .1, 1, .1 , 1).
                                setInterpolator(
                                    new CAAT.Interpolator().createExponentialInOutInterpolator(3,false) ).
                                setFrameTime(this.directorScene.time , 1000+random);

                        brickActor.enableEvents(false);

                    }
                }
            }


            context= this.context;
            // setup a timer which fires when all the bricks have stopped flying in.
            this.directorScene.createTimer(
                this.directorScene.time,
                maxt,
                function timeout() {
                    if ( context.status==context.ST_INITIALIZING ) {
                        context.setStatus( context.ST_RUNNNING );
                    }
                }
            );

            this.actorInitializationCount=0;
        },
        contextEvent : function( event ) {

            var i, j;
            var brickActor;
            var me= this;

            if ( event.source=='context' ) {
                if ( event.event=='levelchange') {
                    this.bricksContainer.enableEvents(true);
                } else if ( event.event=='status') {
                    if ( event.params==this.context.ST_INITIALIZING ) {

                        this.director.audioPlay( 'mostrarpanel' );

                        this.initializeActors();
                    } else if ( event.params==this.context.ST_RUNNNING) {
                        for( i=0; i<this.gameRows; i++ ) {
                            for( j=0; j<this.gameColumns; j++ ) {
                                brickActor= this.brickActors[i][j].set();
                            }
                        }

                        this.cancelTimer();
                        this.enableTimer();

                    } else if ( event.params==this.context.ST_LEVEL_RESULT ) {
                        this.director.audioPlay('10');
                        this.cancelTimer();
                        var me= this;
                        // wait 1 sec
                        var timer= this.directorScene.createTimer(
                                this.directorScene.time,
                                1000,
                                function (sceneTime, time, timerTask) {
                                    me.endLevel();
                                },
                                null
                                );
                    } else if ( event.params==this.context.ST_ENDGAME ) {
                        this.director.audioPlay('01');
                        this.endGame();
                    }
                }
            } else if ( event.source==='brick' ) {
                if ( event.event==='selection' ) {   // des/marcar un elemento.
                    this.director.audioPlay( event.params.selected ? '11' : 'deseleccionar' );
                    this.brickSelectionEvent(event);
                } else if ( event.event==='selectionoverflow') {  // seleccion error.
                    this.director.audioPlay( 'sumamal' );
                    this.selectionOverflowEvent(event);
                } else if ( event.event==='selection-cleared') {
                    CAAT.setCursor('default');
                    this.director.audioPlay('12');
                    this.selectionClearedEvent(event);
                } else if ( event.event==='rearranged' ) {
                    this.rearrange( event );
                } else if ( event.event==='respawn' ) {
                    this.respawn(event);
                }

                // rebuild selection path
                this.selectionPath.setup(
                        this.context,
                        this.brickActors);
            }
        },
        respawn : function(event) {
            var respawnData= event.params;

            for( var i=0; i<respawnData.length; i++ ) {
                var row= respawnData[i].row;
                var col= respawnData[i].column;

                var brickPos= this.getBrickPosition(row,col);
                this.brickActors[row][col].respawn(brickPos.x, brickPos.y);
            }
        },
        rearrange : function(event) {

            var fromRow= event.params.fromRow;
            var toRow=   event.params.toRow;
            var column=  event.params.column;

            var tmp= this.brickActors[fromRow][column];
            this.brickActors[fromRow][column]= this.brickActors[toRow][column];
            this.brickActors[toRow][column]= tmp;

            // el actor de posicion row, column, no tiene que ser el que esperabamos
            // porque se ha reorganizado la cuadricula del modelo.
            var brickActor= this.brickActors[toRow][column];
            var brickPos= this.getBrickPosition(toRow,column);

            brickActor.rearrange( brickPos.x, brickPos.y );
        },
        brickSelectionEvent : function(event) {
            var me= this;
            var brick= event.params;
            var brickActor= this.brickActors[brick.row][brick.column];

            if ( brick.selected ) {

                if ( !HN.LOWQUALITY ) {
                    // dibujar un grupo de estrellas desde el centro del ladrillo haciendo fade-out.
                    var x0= brickActor.x+brickActor.width/2-this.starsImage.singleWidth/2;
                    var y0= brickActor.y+brickActor.height/2-this.starsImage.singleHeight/2;
                    var R= Math.sqrt( brickActor.width*brickActor.width + brickActor.height*brickActor.height )/2;
                    var N= 16;
                    var i;
                    var rad= Math.PI/N*2;
                    var T= 300;

                    for( i=0; i<N; i++ ) {
                        var x1= x0+ R*Math.cos( i*rad );
                        var y1= y0+ R*Math.sin( i*rad );

                        if ( this.selectionStarCache.length ) {
                            var actor= this.selectionStarCache.shift();
                            actor.setFrameTime(this.directorScene.time, T);
                            actor.backgroundImage.setAnimationImageIndex( [(Math.random()*6)>>0] );
                            actor.__trb.setFrameTime(this.directorScene.time, T);
                            actor.__trb.path.setInitialPosition(x0,y0).setFinalPosition(x1,y1);
                            actor.__ab.setFrameTime(this.directorScene.time, T);

                            actor.__parent.addChild(actor);
                        }
                    }
                }

                brickActor.setSelected();
            }
            else {
                brickActor.reset();
            }
        },
        selectionOverflowEvent : function(event) {
            var i,j;
            var selectedContextBricks= event.params;
            var actor;

            for( i=0; i<selectedContextBricks.length; i++ ) {
                this.brickActors[ selectedContextBricks[i].row ][ selectedContextBricks[i].column ].reset();
            }

            this.bricksContainer.enableEvents(false);

            // get all active actors on board
            var activeActors= [];
            for( i=0; i<this.gameRows; i++ ) {
                for( j=0; j<this.gameColumns; j++ ) {
                    actor= this.brickActors[i][j];
                    if ( !actor.brick.removed ) {
                        activeActors.push(actor);
                    }
                }
            }

            var me= this;

            // for each active actor, play a wrong-path.
            for( i=0; i<activeActors.length; i++ ) {
                activeActors[i].selectionOverflow();
            }

            var ttimer;
            ttimer= this.directorScene.createTimer(
                this.directorScene.time,
                HN.BrickActor.prototype.timeOverflow+100,
                function timeout(sceneTime, time, timerTask) {
                    me.bricksContainer.enableEvents(true);
                },
                function tick(sceneTime, time, timerTask) {
                });

        },
        selectionClearedEvent : function(event) {
            var selectedContextBricks= event.params;
            var i;

            for( i=0; i<selectedContextBricks.length; i++ ) {
                var actor= this.brickActors[ selectedContextBricks[i].row ][ selectedContextBricks[i].column ];
                actor.parent.setZOrder(actor,Number.MAX_VALUE);
                actor.selectionCleared(this, this.director.height);
            }

            this.timer.reset(this.directorScene.time);
        },
        showLevelInfo : function() {

        },
        prepareSceneIn : function(gameMode) {
            // setup de actores
            var i,j;

            this.gameMode= gameMode;

            if ( this.gameMode.respawn ) {
                this.respawnClock.enable(true,this.gameMode.respawn_time);
            } else {
                this.respawnClock.enable(false,this.gameMode.respawn_time);
            }
            //this.context.initialize()

            this.bricksContainer.enableEvents(true);

            // fuera de pantalla
            for( i=0; i<this.gameRows; i++ ) {
                for( j=0; j<this.gameColumns; j++ ) {
                    this.brickActors[i][j].setLocation(-100,-100);
                }
            }

            this.selectionPath.initialize();

            this.chronoActor.tick(0,0);
            this.scoreActor.reset();

            this.endGameActor.setFrameTime(-1,0);
        },
        endGame : function() {
            this.fireEvent( 'end-game', {
                score: this.context.score,
                level: this.context.level,
                gameMode: this.context.gameMode.name
            })
//            this.gardenScene.scores.addScore( this.context.score, this.context.level, this.context.gameMode.name );
            this.showGameEvent( this.endGameActor );
        },
        addGameListener : function(gameListener) {
            this.gameListener.push(gameListener);
        },
        fireEvent : function( type, data ) {
            for( var i=0, l= this.gameListener.length; i<l; i++ ) {
                this.gameListener[i].gameEvent(type, data);
            }
        },
        setDifficulty : function(level) {
            this.context.difficulty=level;
        },
        cancelTimer : function(){
            if ( this.timer!=null ) {
                this.timer.cancel();
            }
            this.timer= null;
        },
        enableTimer : function() {
            var me= this;
            
            this.timer= this.directorScene.createTimer(
                this.directorScene.time,
                this.context.turnTime,
                function timeout(sceneTime, time, timerTask) {
                    me.context.timeUp();
                },
                function tick(sceneTime, time, timerTask) {
                    me.chronoActor.tick(time, timerTask.duration);
                });

        },
        setGameMode : function(gameMode) {
            this.context.setGameMode(gameMode);
        },
        endLevel : function() {
            var level= this.context.level;
            if ( level>7 ) {
                level=7;
            }
            var image= this.director.getImage( 'msg'+level);
            if ( null!=image ) {
                this.endLevelMessage.setBackgroundImage( image, true );
                this.endLevelMessage.setLocation(
                        (this.endLevelMessage.parent.width-image.width)/2,
                        this.endLevelMessage.parent.height/2 - 25
                        );
            }
            this.showGameEvent( this.endLevelActor );
        },
        removeGameEvent : function( actor, callback ) {
            actor.enableEvents(false);
            this.uninitializeActors();

            var me= this;

            actor.emptyBehaviorList();
            actor.addBehavior(
                new CAAT.PathBehavior().
                    setFrameTime( actor.time, 2000 ).
                    setPath(
                        new CAAT.LinearPath().
                                setInitialPosition( actor.x, actor.y ).
                                setFinalPosition( actor.x, -actor.height )
                    ).
                    setInterpolator(
                        new CAAT.Interpolator().createExponentialInInterpolator(2,false)
                    ).
                    addListener(
                        {
                            behaviorExpired : function(behavior, time, actor) {
                                actor.setOutOfFrameTime();
                                callback();
                            }
                        }
                    )
            );
        },
        showGameEvent : function(actor) {
            // parar y eliminar cronometro.
            this.cancelTimer();

            // quitar contorl de mouse.
            this.bricksContainer.enableEvents(false);

            // mostrar endgameactor.

            var x= (this.directorScene.width - actor.width)/2;
            var y= (this.directorScene.height - actor.height)/2 - 100;

            var me_endGameActor= actor;
            actor.emptyBehaviorList().
                setFrameTime(this.directorScene.time, Number.MAX_VALUE).
                enableEvents(false).
                addBehavior(
                    new CAAT.PathBehavior().
                        setFrameTime( this.directorScene.time, 2000 ).
                        setPath(
                            new CAAT.LinearPath().
                                setInitialPosition( x, this.directorScene.height ).
                                setFinalPosition( x, y ) ).
                        setInterpolator(
                            new CAAT.Interpolator().createExponentialInOutInterpolator(3,false) ).
                        addListener( {
                            behaviorExpired : function(behavior, time, actor) {
                                me_endGameActor.enableEvents(true);

                                me_endGameActor.emptyBehaviorList();
                                me_endGameActor.addBehavior(
                                        new CAAT.PathBehavior().
                                            setFrameTime( time, 3000 ).
                                            setPath(
                                                new CAAT.LinearPath().
                                                        setInitialPosition( me_endGameActor.x, me_endGameActor.y ).
                                                        setFinalPosition(
                                                            me_endGameActor.x+(Math.random()<.5?1:-1)*(5+5*Math.random()),
                                                            me_endGameActor.y+(Math.random()<.5?1:-1)*(5+5*Math.random()) )
                                            ).
                                            addListener( {
                                                behaviorExpired : function(behavior, time, actor) {

                                                    if (HN.INTERSTITIAL) {
                                                        CocoonJS.AdController.showFullscreen();
                                                    }

                                                    behavior.setFrameTime( time, 3000 );
                                                    behavior.path.setFinalPosition(
                                                            me_endGameActor.x+(Math.random()<.5?1:-1)*(5+5*Math.random()),
                                                            me_endGameActor.y+(Math.random()<.5?1:-1)*(5+5*Math.random())
                                                            );
                                                },
                                                behaviorApplied : function(behavior, time, normalizedTime, actor, value) {
                                                }
                                            }).
                                            setInterpolator(
                                                new CAAT.Interpolator().createExponentialInOutInterpolator(3,true)
                                                )
                                        );

                            },
                            behaviorApplied : function(behavior, time, normalizedTime, actor, value) {
                            }
                        } )
                );

        },
        soundControls : function(director) {
            var ci= new CAAT.SpriteImage().initialize( director.getImage('sound'), 2,3 );
            var dw= director.width;
            var dh= director.height;

            var music= new CAAT.Actor().
                    setAsButton( ci.getRef(),0,1,0,0, function(button) {
                        director.audioManager.setMusicEnabled( !director.audioManager.isMusicEnabled() );
                        if ( director.audioManager.isMusicEnabled() ) {
                            button.setButtonImageIndex(0,1,0,0);
                        } else {
                            button.setButtonImageIndex(2,2,2,2);
                        }
                    }).
                    setBounds( dw-ci.singleWidth-2, 2, ci.singleWidth, ci.singleHeight );

            var sound= new CAAT.Actor().
                    setAsButton( ci.getRef(),3,4,3,3, function(button) {
                        director.audioManager.setSoundEffectsEnabled( !director.audioManager.isSoundEffectsEnabled() );
                        if ( director.audioManager.isSoundEffectsEnabled() ) {
                            button.setButtonImageIndex(3,4,3,3);
                        } else {
                            button.setButtonImageIndex(5,5,5,5);
                        }
                    });
            if ( director.width>director.height ) {
                sound.setBounds( dw-ci.singleWidth-2, 2+2+ci.singleHeight, ci.singleWidth, ci.singleHeight );
            } else {
                sound.setBounds( dw-ci.singleWidth*2-2, 2+2, ci.singleWidth, ci.singleHeight );
            }

            music.prepare= function() {
                if ( director.audioManager.isMusicEnabled() ) {
                    this.setButtonImageIndex(0,1,0,0);
                } else {
                    this.setButtonImageIndex(2,2,2,2);
                }
            }

            sound.prepare= function() {
                if ( director.audioManager.isSoundEffectsEnabled() ) {
                    this.setButtonImageIndex(3,4,3,3);
                } else {
                    this.setButtonImageIndex(5,5,5,5);
                }
            }

            this.directorScene.addChild(sound);
            this.directorScene.addChild(music);

            this.music= music;
            this.sound= sound;
        },
        prepareSound : function() {
            try {
                this.sound.prepare();
                this.music.prepare();
            }
            catch(e) {

            }
        }

    };
})();
