/**
 * See LICENSE file.
 *
 * Play scene -- MultiPlierActor
 * Displays when there is a score multiplier active.
 */
(function() {
    HN.MultiplierActor= function() {
        HN.MultiplierActor.superclass.constructor.call(this);

        this.actorx=    new CAAT.Actor().setVisible(false);
        this.actornum=  new CAAT.Actor();

        this.addChild(this.actorx);
        this.addChild(this.actornum);

        return this;
    };

    HN.MultiplierActor.prototype= {

        actorx:     null,
        actornum:   null,

        multiplier: 0,

        setImages : function( font, x ) {

            this.actorx.setBackgroundImage(x,true);
            this.actornum.setBackgroundImage(font,true).setVisible(false);

            var xoffset= (this.width-x.width-font.singleWidth)/2 + 10;

            this.actorx.setLocation( xoffset, this.height-x.height+5 );
            this.actornum.setLocation( xoffset+x.width, 0 );

            return this;
        },
        hideMultiplier : function() {
            this.multiplier=0;
            this.actornum.setVisible(false);
            this.setVisible(false);
        },
        b1 : function(actor) {
            actor.emptyBehaviorList();
            var cb= new CAAT.ContainerBehavior().
                    setFrameTime(this.time,1000).
                    setCycle(true);

            var ab= new CAAT.AlphaBehavior().
                    setFrameTime(0,1000).
                    setValues(.6,.8).
                    setPingPong();

            cb.addBehavior(ab);

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
                        this.actornum.setVisible(true).setAnimationImageIndex([this.multiplier]);
                        this.actorx.setVisible(true);

                        this.emptyBehaviorList();
                        this.addBehavior(
                            new CAAT.ScaleBehavior().
                                setFrameTime(this.time,1000).
                                setValues(.9, 1.1, .9, 1.1 ).
                                setPingPong().
                                setCycle(true));

                        this.b1(this.actorx);
                        this.b1(this.actornum);

                        this.setVisible(true);
                    } else {
                        this.emptyBehaviorList();
                        this.b2(this.actorx);
                        this.b2(this.actornum);
                    }
                } else if ( event.event=='status') {
                    if ( event.params==HN.Context.prototype.ST_ENDGAME ) {
                        this.hideMultiplier();
                    }
                }
            }
        }
    };

    extend( HN.MultiplierActor, CAAT.ActorContainer);
})();
