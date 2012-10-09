(function() {

    HN.GardenScene= function() {
        if ( CAAT.browser!=='iOS' ) {
            this.scores= new HN.Scores().setData().initialize();
        }
        return this;
    };

    HN.GardenScene.prototype= {

        gameScene:      null,
        directorScene:  null,
        director:       null,
        buttonImage:    null,
        scores:         null,

        music:          null,
        sound:          null,

        createClouds : function() {

            for(var i=0; i<5; i++ ) {
                var cl= new HN.Cloud().
                        setId('cloud'+i).
                        setScene( this.directorScene ).
                        setupBehavior(this.director);
                this.directorScene.addChild(cl);
            }
        },

        createModeButtons : function() {

            var me= this;

            var m= [];
            m.push(new CAAT.SpriteImage().initialize( me.director.getImage('mode-classic'), 1,3 ));
            m.push(new CAAT.SpriteImage().initialize( me.director.getImage('mode-progressive'), 1,3 ));
            m.push(new CAAT.SpriteImage().initialize( me.director.getImage('mode-respawn'), 1,3 ));

            var modes= [ HN.GameModes.classic, HN.GameModes.progressive, HN.GameModes.respawn ];

            var i,w= 0;
            for( i=0; i<m.length; i++ ) {
                w= Math.max(w,m[i].singleWidth);
            }

            var margin= 20;
            w+=margin;
            var dw= (me.director.width-w*m.length)/2 + margin/2;

            function createb(index) {
                var text= new CAAT.SpriteImage().
                        initialize( me.director.getImage('mode-text'), 1,3 ).
                        setAnimationImageIndex([index]);

                var c= new CAAT.ActorContainer().create().setBounds(
                    dw + w*index,
                    me.director.width>me.director.height ? me.director.height/2- 10 : me.director.height/2-100,
                    Math.max( m[index].singleWidth, text.singleWidth),
                    m[index].singleWidth+text.singleHeight );

                var b= new CAAT.Actor().
                        setAsButton(m[index], 0,1,2,0, function() {
                            me.director.audioPlay('11');
                            me.startGame(me.director,0,modes[index]);
                        }).
                        setBounds(
                            (c.width-m[index].singleWidth)/2,
                            0,
                            m[index].singleWidth,
                            m[index].singleHeight );

                var t = new CAAT.Actor().
                        setBackgroundImage(text).
                        setBounds(
                            (c.width - text.singleWidth) / 2,
                            b.height,
                            text.singleWidth,
                            text.singleHeight);

                c.addChild(b);
                c.addChild(t);

                return c;
            }

            this.directorScene.addChild( createb(0) );
            this.directorScene.addChild( createb(1) );
            this.directorScene.addChild( createb(2) );
        },

        createHowtoButton : function( info_howto_ci ) {
            var director= this.director;

            var ihw= info_howto_ci.singleWidth;
            var ihh= info_howto_ci.singleHeight;

            var me= this;

            var _howto= new CAAT.Actor().
                setBackgroundImage(director.getImage('howto'), false ).
                setImageTransformation( CAAT.SpriteImage.prototype.TR_FIXED_TO_SIZE).
                setSize( HN.director.width, HN.director.height).
                setOutOfFrameTime().
                setAlpha(.9);

            var pbOut= new CAAT.PathBehavior().
                setValues( new CAAT.Path().setLinear( _howto.x,0,700,0 ) ).
                setInterpolator(new CAAT.Interpolator().createBounceOutInterpolator(false) ).
                addListener( {
                    behaviorExpired : function(behavior, time, actor) {
                        _howto.setOutOfFrameTime();
                    }
                });

            var pbIn= new CAAT.PathBehavior().
                setValues(new CAAT.Path().setLinear( 700,0,0,0 )).
                setInterpolator( new CAAT.Interpolator().createBounceOutInterpolator(false) );



            _howto.mouseClick= function( e ) {
                _howto.emptyBehaviorList().
                    setFrameTime( me.directorScene.time, Number.MAX_VALUE ).
                    addBehavior( pbOut.setFrameTime( me.directorScene.time, 1000 ) );

            };

            var howto= new CAAT.Actor().
                setAsButton(info_howto_ci.getRef(), 3,4,5,3,
                    function() {
                        director.audioPlay('11');
                        _howto.emptyBehaviorList().
                            setFrameTime( me.directorScene.time, Number.MAX_VALUE ).
                            addBehavior( pbIn.setFrameTime( me.directorScene.time, 1000 ) );

                    }).
                setBounds( 10, director.height-10-ihh-ihh-5, ihw, ihh );

            return {
                howto: howto,
                howtod:_howto
            };
        },

        createInfoButton : function( info_howto_ci ) {

            var director= this.director;

            var ihw= info_howto_ci.singleWidth;
            var ihh= info_howto_ci.singleHeight;

            var me= this;

            // cartel entrante.
            var _info= new CAAT.Actor().
                setBackgroundImage( director.getImage('info'), false ).
                setSize( HN.director.width, HN.director.height).
                setImageTransformation( CAAT.SpriteImage.prototype.TR_FIXED_TO_SIZE).
                setOutOfFrameTime().
                setAlpha(.9);

            var pbOut= new CAAT.PathBehavior().
                setValues( new CAAT.Path().setLinear( _info.x,0,-700,0 ) ).
                setInterpolator(new CAAT.Interpolator().createBounceOutInterpolator(false) ).
                addListener( {
                    behaviorExpired : function(behavior, time, actor) {
                        _info.setOutOfFrameTime();
                    }
                });

            var pbIn= new CAAT.PathBehavior().
                setFrameTime( me.directorScene.time, 1000 ).
                setValues( new CAAT.Path().setLinear( -700,0,0,0 ) ).
                setInterpolator( new CAAT.Interpolator().createBounceOutInterpolator(false) );


            _info.mouseClick= function( e ) {
                _info.emptyBehaviorList().
                    setFrameTime( me.directorScene.time, Number.MAX_VALUE ).
                    addBehavior(pbOut.setFrameTime( me.directorScene.time, 1000 ));
            };

            // boton info
            var info= new CAAT.Actor().
                setAsButton(info_howto_ci.getRef(), 0,1,2,0,
                    function(button) {

                        director.audioPlay('11');
                        _info.emptyBehaviorList().
                            setFrameTime( me.directorScene.time, Number.MAX_VALUE ).
                            addBehavior( pbIn.setFrameTime( me.directorScene.time, 1000 ) );

                    }).
                setBounds( 10, this.director.height-10-ihh, ihw, ihh );

            return {
                info:info,
                infod:_info
            };
        },

        /**
         * Creates the main game Scene.
         * @param director a CAAT.Director instance.
         */
        create : function(director, gardenSize) {

            director.audioLoop('music'); 

            this.director= director;
            this.directorScene= director.createScene();


            var dw= director.width;
            var dh= director.height;
            var me= this;

            this.directorScene.activated= function() {
                me.prepareSound();
            };

            var imgb= director.getImage('background-2');

            /*
             * Para ver toda la textura de pagina
            var ciimgb= new CAAT.SpriteImage().initialize( imgb,1,1 );
            ciimgb.xyCache[0][0]= 0;
            ciimgb.xyCache[0][1]= 0;
            ciimgb.xyCache[0][2]= 1;
            ciimgb.xyCache[0][3]= 1;
            */

            this.directorScene.addChild(
                new CAAT.Actor().
                        setBounds(0,0,dw,dh).
                        setBackgroundImage(imgb,false).
                        setImageTransformation( CAAT.SpriteImage.prototype.TR_FIXED_TO_SIZE )
            );

            ///////////// some clouds
            this.createClouds();

            ///////////// some ovnis
            var ovnitrail= new CAAT.ActorContainer().create().setBounds(0,0,dw,dh);
            this.directorScene.addChild(ovnitrail);

            for (var i = 0; i < 2; i++) {
                this.directorScene.addChild( new HN.Ovni( director, this.directorScene, ovnitrail, 'ovni'+i ) );
            }

            ////////////// garden
            if ( gardenSize>0 ) {
                // fondo. jardin.
                this.directorScene.addChild(
                        new HN.Garden().
                                create().
                                setBounds(0,0,dw,dh).
                                initialize( director.ctx, gardenSize, dh*.5 )
                        );
            }

            //////////// scores
            this.buttonImage= new CAAT.SpriteImage().initialize(
                    director.getImage('buttons'), 7,3 );

            var bw=         this.buttonImage.singleWidth;
            var bh=         this.buttonImage.singleHeight;
            var numButtons= 4;
            var yGap=       10;

            var scores= null;
            if (false && CAAT.browser!=='iOS') {
                scores=new CAAT.Actor().
                    setAsButton( this.buttonImage.getRef(), 18,19,20,18, function() {
                        director.audioPlay('11');
                    }).
                    setBounds( dw-bw-10, dh-bh-10, bw, bh );
            }

            ////////////// sound controls
            this.soundControls(director);

            ////////////// level buttons
            this.createModeButtons();

            if ( false && CAAT.browser!=='iOS' ) {
                this.directorScene.addChild(scores);
            }


            ////////////// Sumon logo
            var logoi= director.getImage('logo');
            var logo= new CAAT.Actor().
                    setBackgroundImage(logoi).
                    enableEvents(false);
            logo.setLocation( (dw - logo.width)/2, -10 );

            if ( director.width<director.height ) {
                logo.
                    setBackgroundImage(logoi, false).
                    setSize( logoi.width*.8, logoi.height*.8 ).
                    setImageTransformation( CAAT.SpriteImage.prototype.TR_FIXED_TO_SIZE).
                    setLocation( (dw - logoi.width *.8)/2, -10 );
            }

            this.directorScene.addChild(logo);

            var madeWith= new CAAT.Actor();
            var madeWithCI= new CAAT.SpriteImage().initialize(director.getImage('madewith'),1,3);
            if ( CAAT.browser!=='iOS' ) {
                    madeWith.setAsButton( madeWithCI, 0,1,2,0,
                        function(button) {
                            window.open('http://labs.hyperandroid.com/static/caat', 'Hyperandroid');

                        });
            } else {
                madeWith.setBackgroundImage(madeWithCI, true);

            }
            madeWith.setLocation( dw-( director.width>director.height ? 100 : madeWithCI.singleWidth), 0 );
            this.directorScene.addChild(madeWith);


            ///////// info & howto
            var info_howto_ci=  new CAAT.SpriteImage().initialize( director.getImage('info_howto'), 2, 3 );
            var info=          this.createInfoButton(info_howto_ci);
            var howto=           this.createHowtoButton(info_howto_ci);

            this.directorScene.addChild(howto.howto);
            this.directorScene.addChild(info.info);
            this.directorScene.addChild(howto.howtod);
            this.directorScene.addChild(info.infod);

            if ( director.width<director.height ) {
                CAAT.modules.LayoutUtils.row(
                    this.directorScene,
                    [info.info,howto.howto],
                    {
                        padding_left:   195,
                        padding_right:  195,
                        top:            director.height/2+100
                    });
            }

            return this;
        },
        soundControls : function(director) {
            var ci= new CAAT.SpriteImage().initialize( director.getImage('sound'), 2,3 );
            var dw= director.width;
            var dh= director.height;

            var music= new CAAT.Actor().
                    setAsButton( ci.getRef(),0,1,0,0, function(button) {
                        director.setMusicEnabled( !director.audioManager.isMusicEnabled() );
                        if ( director.isMusicEnabled() ) {
                            button.setButtonImageIndex(0,1,0,0);
                        } else {
                            button.setButtonImageIndex(2,2,2,2);
                        }

                    }).
                    setBounds( dw-ci.singleWidth-2, 2, ci.singleWidth, ci.singleHeight );


            var sound= new CAAT.Actor().
                    setAsButton( ci.getRef(),3,4,3,3, function(button) {
                        director.setSoundEffectsEnabled( !director.audioManager.isSoundEffectsEnabled() );
                        if ( director.isSoundEffectsEnabled() ) {
                                button.setButtonImageIndex(3,4,3,3);
                        } else {
                            button.setButtonImageIndex(5,5,5,5);
                        }
                    }).
                    setBounds( dw-ci.singleWidth-2, 2+2+ci.singleHeight, ci.singleWidth, ci.singleHeight );


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

            if ( director.width<director.height ) {
                CAAT.modules.LayoutUtils.row(
                    this.directorScene,
                    [
                        music,
                        sound
                    ],
                    {
                        padding_left:   195,
                        padding_right:  195,
                        top:            director.height/2+150
                    });
            }


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
        },
        startGame : function(director,level,gameMode) {
            //director.switchToNextScene(1000,false,true);
            this.gameScene.setDifficulty(level);

            this.gameScene.prepareSceneIn(gameMode);
            director.easeInOut(
                    1,
                    CAAT.Scene.EASE_TRANSLATE,
                    CAAT.Actor.prototype.ANCHOR_TOP,
                    0,
                    CAAT.Scene.EASE_TRANSLATE,
                    CAAT.Actor.prototype.ANCHOR_BOTTOM,
                    1000,
                    false,
                    new CAAT.Interpolator().createExponentialInOutInterpolator(3,false),
                    new CAAT.Interpolator().createExponentialInOutInterpolator(3,false) );
        },
        /**
         * gameScene listener.
         * @param type {string}
         * @param data {object}
         */
        gameEvent : function( type, data ) {
            if ( CAAT.browser!=='iOS' ) {
                this.scores.addScore( data.score, data.level, data.gameMode );
            }
        }
    };
})();
