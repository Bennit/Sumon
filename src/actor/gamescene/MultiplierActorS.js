/**
 * See LICENSE file.
 *
 * Play scene -- MultiplierActorS
 * Something with multipliers and stars
 */
(function() {
    HN.MultiplierActorS= function() {
        HN.MultiplierActorS.superclass.constructor.call(this);

        this.star=      new CAAT.Actor();
        this.container= new CAAT.ActorContainer();
        this.actorx=    new CAAT.Actor();
        this.actornum=  new CAAT.Actor();

        this.addChild(this.star);
        this.addChild(this.container);
        this.container.addChild(this.actorx);
        this.container.addChild(this.actornum);

        this.container.setGlobalAlpha(true);

        return this;
    };

    HN.MultiplierActorS.prototype= {

        actorx:     null,
        actornum:   null,
        star:       null,

        multiplier: 0,

        setImages : function( font, x, star, scene ) {

            this.scene= scene;
            this.setOutOfFrameTime();

            this.star.setBackgroundImage(star);
            var S= this.star.width/2;
            this.actorx.setBackgroundImage(x,false).
                setBounds(0, (this.star.height-S)/2, S, S).
                setImageTransformation( CAAT.SpriteImage.prototype.TR_FIXED_TO_SIZE );
            this.actornum.setBackgroundImage(font,true).
                setScale( .4,.4 ).
                setLocation( 0, -20 );

            this.setSize( this.star.width, this.star.height);
            this.container.setSize( this.star.width, this.star.height);
            this.container.setRotation( Math.PI/16 );

            this.star.setLocation( 0,0 );


            return this;
        },
        hideMultiplier : function() {
            this.multiplier=0;
            this.setOutOfFrameTime();
        },
        b1 : function(actor) {
            actor.emptyBehaviorList();
            var cb= new CAAT.ContainerBehavior().
                    setFrameTime(this.scene.time,1000).
                    setCycle(true);

            var ab= new CAAT.AlphaBehavior().
                    setFrameTime(0,1000).
                    setValues(.8,1).
                    setPingPong();

            var sb= new CAAT.ScaleBehavior().
                setFrameTime(0,1000).
                setValues(.8, 1, .8, 1).
                setPingPong();

            cb.addBehavior(ab);
            cb.addBehavior(sb);

            actor.addBehavior(cb);
        },
        b2 : function(actor) {
            var me= this;
            actor.emptyBehaviorList();
            var ab= new CAAT.AlphaBehavior().
                    setFrameTime(this.time,300).
                    setValues( this.alpha, 0 ).
                    addListener( {
                        behaviorExpired : function(behavior, time, actor) {
                            me.hideMultiplier();
                        },
                        behaviorApplied : function(actor,time,normalizedTime,value) {}
                    });
            actor.addBehavior(ab);
        },
        contextEvent : function( event ) {

            if ( event.source == 'context' ) {
                if ( event.event=='multiplier' ) {

                    if ( event.params.multiplier>1 ) {
                        this.multiplier = event.params.multiplier;
                        this.actornum.setAnimationImageIndex([this.multiplier]);
                        this.setFrameTime(0, Number.MAX_VALUE);

                        this.emptyBehaviorList();
                        this.star.addBehavior(
                            new CAAT.RotateBehavior().
                                setFrameTime(this.time,1000).
                                setValues(0, Math.PI*2 ).
                                setCycle(true));

                        this.b1(this.container);

                    } else {
                        this.emptyBehaviorList();
                        this.b2(this.container);
                    }
                } else if ( event.event=='status') {
                    if ( event.params==HN.Context.prototype.ST_ENDGAME ) {
                        this.hideMultiplier();
                    }
                }
            }
        }
    };

    extend( HN.MultiplierActorS, CAAT.ActorContainer);
})();
