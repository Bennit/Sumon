/**
 * See LICENSE file.
 *
 * Play scene -- Chrono
 * Display the time left to reach the target.
 */
(function() {
    HN.Chrono= function() {
        HN.Chrono.superclass.constructor.call(this);

        this.actorventana= new CAAT.Actor();
        this.actorcrono= new CAAT.Actor().setLocation(14,18);
        this.addChild( this.actorcrono );
        this.addChild( this.actorventana );

        return this;
    };

    HN.Chrono.prototype= {

        maxTime:    0,
        elapsedTime:0,

        actorventana:   null,
        actorcrono:     null,

        progressHole:  160,

        setImages : function( background, progress ){
            this.actorventana.setBackgroundImage(background, true);
            this.actorcrono.setBackgroundImage(progress, true);

            this.setSize( this.actorventana.width, this.actorventana.height );
            this.actorcrono.setImageTransformation( CAAT.SpriteImage.prototype.TR_FIXED_TO_SIZE );
            return this;
        },
        animate : function(director, time) {
            var size=
                    this.maxTime!=0 ?
                            this.elapsedTime/this.maxTime * this.progressHole :
                            0;
            // make sure this actor is marked as dirty by calling setSize and not .width=new_size.
            this.actorcrono.setSize( this.progressHole-size, this.actorcrono.height );

            return HN.Chrono.superclass.animate.call(this,director,time);
        },
        tick : function( iElapsedTime, maxTime ) {
            this.maxTime= maxTime;
            this.elapsedTime= iElapsedTime;
        },
        contextEvent : function(event) {
            if ( event.source=='context' && event.event=='status') {
                if ( event.params==HN.Context.prototype.ST_ENDGAME ) {
                    this.maxTime=0;
                    this.elapsedTime= 1000;
                }
            }
        }
    };

    extend( HN.Chrono, CAAT.ActorContainer);
})();
