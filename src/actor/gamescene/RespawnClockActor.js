/**
 * See LICENSE file.
 *
 * Play scene -- RespawnClockActor
 * Displays the clock for new bricks to spawn in the
 * 'respawn' game mode.
 */
(function() {
    HN.RespawnClockActor= function() {
        HN.RespawnClockActor.superclass.constructor.call(this);
        this.ticks= [];
        return this;
    };

    HN.RespawnClockActor.prototype= {

        ticks:          null,
        respawnTime:    10000,
        scene:          null,
        context:        null,
        arrow:          null,
        enabled:        false,

        initialize: function(director, scene, context) {
            this.scene= scene;
            this.context= context;

            var itick= director.getImage('rclock-tick');
            var itickci;
            itickci= new CAAT.SpriteImage().initialize( itick, 16, 1 );
            var ibg= director.getImage('rclock-bg');
            var iarrow= director.getImage('rclock-arrow');
            var me= this;

            this.setSize(64,64);

            var bg= new CAAT.Actor().
                    setBackgroundImage( ibg, true ).
                    setLocation((this.width-ibg.width)/2, (this.height-ibg.height)/2);
            this.addChild(bg);

            var NTicks= 12;
            for( var i=0; i<NTicks; i++ ) {
                var tick= new CAAT.Actor().
                        setBackgroundImage( itickci.getRef(), true ).
                        setLocation(
                            this.width/2  + 29*Math.cos( -Math.PI/2 + i*2*Math.PI/NTicks ) - itick.width/2,
                            this.height/2 + 29*Math.sin( -Math.PI/2 + i*2*Math.PI/NTicks ) - itick.width/2
                            );

                this.addChild(tick);

                this.ticks.push(tick);

                var cb= new CAAT.ContainerBehavior().
                    setOutOfFrameTime().
                    addBehavior(
                        new CAAT.ScaleBehavior().
                            setFrameTime( i*this.respawnTime/NTicks, 300 ).
                            setValues( 1,3, 1,3 )
                    );
                    cb.addBehavior(
                        new CAAT.GenericBehavior().
                            setFrameTime( i*this.respawnTime/NTicks, 300 ).
                            setValues( 1, 0, null, null, function(value, target, actor ) {
                                actor.setAnimationImageIndex( [15-((value*15)>>0)] );
                            })
                    );
                tick.addBehavior(cb);
            }

            var flecha= new CAAT.Actor().setBackgroundImage(iarrow, true);
            flecha.setLocation(
                    (this.width-flecha.width)/2, this.height/2-23-.5
                    );
            this.addChild(flecha);

            flecha.addBehavior(
                    new CAAT.RotateBehavior().
                            setOutOfFrameTime().
                            setValues(0, 2*Math.PI, .50, (23/flecha.height*100)/100 ).
                            addListener({
                                behaviorExpired : function(behavior, time, actor) {
                                    me.resetTimer();
                                    me.context.respawn();

                                },
                                behaviorApplied : function(behavior, time, normalizedTime, actor, value) {}
                            })
                    );

            this.arrow= flecha;

            return this;
        },
        resetTimer : function() {
            var NTicks= this.ticks.length;
            for( var i=0; i<NTicks; i++ ) {
                this.ticks[i].resetTransform().setAnimationImageIndex([0]);
                this.ticks[i].behaviorList[0].setFrameTime(this.scene.time, this.respawnTime);
                this.ticks[i].behaviorList[0].behaviors[0].setFrameTime( i*this.respawnTime/NTicks, 300 );
                this.ticks[i].behaviorList[0].behaviors[1].setFrameTime( i*this.respawnTime/NTicks, 300 );
            }

            this.arrow.behaviorList[0].setFrameTime(this.scene.time, this.respawnTime);
        },
        stopTimer : function() {
            for( var i=0; i<this.ticks.length; i++ ) {
                this.ticks[i].resetTransform();
                this.ticks[i].behaviorList[0].setOutOfFrameTime();
            }
            this.arrow.behaviorList[0].setOutOfFrameTime();
        },
        contextEvent : function( event ) {
            if ( !this.enabled ) {
                return;
            }

            if ( event.event=='status') {
                if ( event.params==HN.Context.prototype.ST_RUNNNING ) {
                    this.resetTimer();
                } else {
                    this.stopTimer();
                }
            }
        },
        enable : function( enabled, respawnTime ) {
            this.respawnTime= respawnTime;
            this.enabled= enabled;
            if ( enabled ) {
                this.setFrameTime(0,Number.MAX_VALUE);
            } else {
                this.setOutOfFrameTime();
            }
        }
    };

    extend(HN.RespawnClockActor, CAAT.ActorContainer);
})();
