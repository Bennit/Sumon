/**
 * See LICENSE file.
 *
 * Play scene -- AnimatedBackground
 */
(function() {

    HN.AnimatedBackground= function() {
        HN.AnimatedBackground.superclass.constructor.call(this);
        return this;
    };

    HN.AnimatedBackground.prototype= {
        timer:                      null,
        context:                    null,
        scene:                      null,
        altitude:                   .05,
        altitudeMeterByIncrement:   2,
        currentAltitude:            0,
        initialOffset:              0,
        currentOffset:              0,

        setData : function(scene, gameContext) {
            this.context= gameContext;
            this.scene= scene;
            return this;
        },
        contextEvent : function( event ) {

            var me= this;

            if ( event.source=='context' ) {
                if ( event.event=='status') {
                    if ( event.params==HN.Context.prototype.ST_ENDGAME ) {
                        if ( this.timer!=null ) {
                            this.timer.cancel();
                            this.timer= null;
                            this.currentOffset= this.backgroundImage.offsetY;
                            this.addBehavior(
                                    new CAAT.GenericBehavior().
                                            setFrameTime( this.scene.time, 1000 ).
                                            setValues(this.currentOffset, this.initialOffset, null, null,
                                                function(value,target,actor) {
                                                    me.setBackgroundImageOffset(0,value);
                                                }).
                                            setInterpolator( new CAAT.Interpolator().
                                                createBounceOutInterpolator(false) )
                                    );

                            me.currentAltitude= me.initialOffset;
                        }
                    } else if ( event.params==HN.Context.prototype.ST_LEVEL_RESULT ) {
                        this.timer.cancel();
                    }
                } else if ( event.event=='levelchange') {
                    this.startTimer();
                }
            }
        },
        startTimer : function() {
            var me= this;
            if ( !this.timer ) {
                this.timer= this.scene.createTimer(
                    me.scene.time,
                    200,
                    function timeout(sceneTime, time, timerTask) {

                        me.currentAltitude+= me.altitude;
                        if ( me.currentAltitude>0 ) {
                            me.currentAltitude=0;
                        }
                        me.setBackgroundImageOffset( 0, me.currentAltitude );
                        timerTask.reset( me.scene.time );
                        me.context.incrementAltitude( me.altitudeMeterByIncrement );
                    },
                    null,
                    null );
            }
        },
        setInitialOffset : function( offset ) {
            this.setBackgroundImageOffset( 0, offset );
            this.initialOffset= offset;
            this.currentAltitude= offset;
            return this;
        },
        caer : function(time) {
            this.setBackgroundImageOffset( 0, this.currentOffset + (this.initialOffset-this.currentOffset)*time );
        }
    };

    extend( HN.AnimatedBackground, CAAT.Actor);

})();
