/**
 * See LICENSE file.
 *
 * Play scene -- BrickActor
 * Displays a Brick with a number in it. This actor is clickable.
 */
(function() {
    HN.BrickActor= function() {
        HN.BrickActor.superclass.constructor.call(this);

        this.sb= new CAAT.ScaleBehavior().
            setFrameTime(-1,0).
            setValues(1,1);
        this.addBehavior(this.sb);

        this.rb= new CAAT.RotateBehavior().
                setFrameTime(-1,0).
                setValues(0,0)
        this.addBehavior(this.rb);

        this.pb= new CAAT.PathBehavior().
                setFrameTime(-1,0)
        this.addBehavior(this.pb);

        this.ab= new CAAT.AlphaBehavior().
                setFrameTime(-1,0).
                setValues(1)
        this.addBehavior(this.ab);

        return this;
    };

    HN.BrickActor.status= {
        REGULAR:    0,      // en tablero.
        FALLING:    1,      // cayendo. (rearrange)
        CLEARED:    2       // eliminado, no disponible (cayendo y eliminado)
    }

    HN.BrickActor.prototype= {

        timeOver:       250,
        timeSelection:  1000,
        timeRespawn:    1500,
        timeRearrange:  1500,
        timeOverflow:   200,
        timeCleared:    800,

        brick:          null,

        status:         0,  // 0: regular state, 1: falling, 2: cleared.

        ab:             null,
        sb:             null,
        rb:             null,
        pb:             null,

        /**
         *
         * @param numberImage
         * @param brick a HN.Brick instance.
         */
        initialize : function( numberImage, brick ) {

            var tw= numberImage.singleWidth;
            var th= numberImage.singleHeight;
            this.setSize(tw,th);

            this.setBackgroundImage(numberImage.getRef(),true);

            this.brick= brick;

            var me= this;
            brick.delegate =  function() {
                me.setSpriteIndex( me.brick.value + numberImage.columns*me.brick.color );
            }

            return this;
        },

        /**
         * Make initialize animation.
         * @param brickPosition
         */
            /*
        initializeForPlay: function( brickPosition, animationStartTime, animationDuration ) {

            var brickActor= this;

            brickActor.
                setLocation( brickPosition.x, brickPosition.y ).
                setScale( .01, .01 );

            brickActor.sb.
                setValues( .01,1, .01, 1).
                setInterpolator(
                    new CAAT.Interpolator().createElasticOutInterpolator(1.1, 0.1, false) ).
                setFrameTime(animationStartTime, animationDuration );

        },
*/
        setStatus : function(st) {
            this.status= st;
            return this;
        },
        mouseEnter : function(mouseEvent) {

            if ( this.brick.selected ) {
                return;
            }

            this.parent.setZOrder( this, Number.MAX_VALUE );

            this.sb.setFrameTime( this.time, this.timeOver ).
                    setValues( 1, 1.2, 1, 1.2 ).
                    setPingPong();

            if ( !CocoonJS.available ) {
                CAAT.setCursor('pointer');
            }
        },
        mouseExit : function(mouseEvent) {
            if ( !CocoonJS.available ) {
                CAAT.setCursor('default');
            }
        },
        mouseDown : function(mouseEvent) {
            this.brick.changeSelection();
        },
        toString : function() {
            return 'HN.Brick '+this.brick.row+','+this.brick.column;
        },
        /**
         * brick deselected.
         */
        reset : function() {

            this.resetAlpha().
                    resetRotate().
                    resetScale().
                    resetTransform();
            this.alpha=1;
            return this;
        },
        resetBehavior : function(b,p1,p2) {
            b.emptyListenerList();
            b.setCycle(false);
            b.setInterpolator( new CAAT.Interpolator().createLinearInterpolator() );
            b.setFrameTime(-1,0);
            if ( p1&& p2 ) {
                b.setValues(p1,p2);
            }
        },
        resetAlpha: function() {
            this.resetBehavior(this.ab,1,1);
            return this;
        },
        resetScale: function() {
            this.resetBehavior(this.sb,1,1);
            return this;
        },
        resetRotate: function() {
            this.resetBehavior(this.rb,0,2*Math.PI);
            return this;
        },
        resetPath : function() {
            this.resetBehavior(this.pb);
            return this;
        },
        resetBehaviors : function() {
            this.resetAlpha();
            this.resetScale();
            this.resetRotate();
            this.resetPath();
            return this;
        },
        /**
         * brick selected.
         */
        setSelected : function() {

            this.sb.
                    setValues( 1, .65, 1, .65 ).
                    setFrameTime( this.time, this.timeSelection ).
                    setPingPong().
                    setCycle(true);

            this.ab.
                    setValues( .75, .25 ).
                    setFrameTime( this.time, this.timeSelection ).
                    setPingPong().
                    setCycle(true);

        },
        /**
         * game just started.
         */
        set: function() {
            this.status= HN.BrickActor.status.REGULAR;
            this.enableEvents(true);
            this.reset();
        },
        /**
         * actors entering game upon respawn timeout.
         * @param x
         * @param y
         */
        respawn: function(x,y) {
            this.
                reset().
                enableEvents(true).
                setFrameTime(this.time,Number.MAX_VALUE).
                resetTransform().
                setAlpha(1).
                setStatus(HN.BrickActor.status.FALLING)
                ;

            this.pb.
                emptyListenerList().
                setFrameTime(this.time, this.timeRespawn+this.brick.row*50).
                setPath( new CAAT.LinearPath().
                    setInitialPosition(x, -this.height-((Math.random()*100)>>0) ).
                    setFinalPosition(x, y)).
                setInterpolator(
                    new CAAT.Interpolator().createBounceOutInterpolator()
                ).
                addListener(
                    {
                        behaviorApplied : function() {
                        },
                        // re-enable events on actor after moving to rearrange position.
                        behaviorExpired : function(behavior, time, actor) {
                            actor.setStatus(HN.BrickActor.status.REGULAR);
                        }
                    }
                );

        },
        /**
         * brick's been rearranged, i.e. moved position in context.
         * @param x
         * @param y
         */
        rearrange: function(x,y) {
            if ( this.status===HN.BrickActor.status.CLEARED ) {
                return;
            }

            this.setStatus(HN.BrickActor.status.FALLING);
            this.pb.
                emptyListenerList().
                setFrameTime(this.time + this.brick.column*50, this.timeRearrange).
                setPath( new CAAT.LinearPath().
                    setInitialPosition(this.x, this.y).
                    setFinalPosition(x, y)).
                setInterpolator(
                    new CAAT.Interpolator().createBounceOutInterpolator()
                ).
                addListener({
                    behaviorApplied : function() {
                    },
                    // re-enable events on actor after moving to rearrange position.
                    behaviorExpired : function(behavior, time, actor) {
                        actor.setStatus(HN.BrickActor.status.REGULAR);
                    }
                });
        },
        /**
         * selection excedes suggested number.
         * @param callback
         */
        selectionOverflow : function() {
            // ladrillos que estn cayendo, no hacen el path de error.
            //if ( !this.falling ) {
            if ( this.status===HN.BrickActor.status.REGULAR ) {
                var signo= Math.random()<.5 ? 1: -1;

                this.pb.
                        emptyListenerList().
                        setFrameTime(this.time, this.timeOverflow).
                        setPath(
                            new CAAT.Path().
                                    beginPath(this.x,this.y).
                                    addLineTo(this.x + signo*(5+5*Math.random()),this.y).
                                    addLineTo(this.x - signo*(5+5*Math.random()),this.y).
                                    endPath() ).
                        setPingPong();
            }

        },
        /**
         * this brick belongs to valid selection which sums up the suggested number.
         * @param scene
         * @param maxHeight
         */
        selectionCleared : function(scene, maxHeight) {

            this.setStatus(HN.BrickActor.status.CLEARED);

            var signo= Math.random()<.5 ? 1 : -1;
            var offset= 50+Math.random()*30;
            var actor= this;

            this.enableEvents(false).setScale( 1.5, 1.5 );

            this.pb.
                emptyListenerList().
                setFrameTime( this.time, this.timeCleared ).
                setPath(
                    new CAAT.Path().
                        beginPath( this.x, this.y ).
                        addQuadricTo(
                            this.x+offset*signo,   this.y-300,
                            this.x+offset*signo*2, this.y+maxHeight+20).
                        endPath() );

            if ( !HN.LOWQUALITY ) {
                this.pb.addListener( {
                    behaviorExpired : function(behavior, time, actor) {
                        actor.setExpired(true);
                    },
                    behaviorApplied : function(behavior, time, normalizedTime, actor, value) {

                        for( var i=0; i< (CocoonJS.available ? 1 : 3); i++ ) {
                            var offset0= Math.random()*10*(Math.random()<.5?1:-1);
                            var offset1= Math.random()*10*(Math.random()<.5?1:-1);

                            if ( scene.fallingStarCache.length>0 ) {
                                var actor2= scene.fallingStarCache.shift();
                                // check for no parent, that is, no active actor.
                                if ( !actor2.domParent ) {
                                    actor2.
                                        setAnimationImageIndex( [(Math.random()*6)>>0] ).
                                        setFrameTime(actor.time, 400).
                                        setLocation(
                                            offset0+actor.x+actor.width/2,
                                            offset1+actor.y);
                                    actor2.__parent.addChild(actor2);

                                    actor2.getBehavior( '__alpha' ).setFrameTime( actor.time, 400 );
                                }
                            }
                        }
                    }
                });
            }
            
            this.pb.setInterpolator( new CAAT.Interpolator().createLinearInterpolator(false,false) );

            this.rb.
                setFrameTime( this.time, this.timeCleared ).
                setValues( 0, (Math.PI + Math.random()*Math.PI*2)*(Math.random()<.5?1:-1) );

            this.ab.
                setFrameTime( this.time, this.timeCleared ).
                setValues( 1, .25 );
        }
    };

    extend( HN.BrickActor, CAAT.Actor);
})();
