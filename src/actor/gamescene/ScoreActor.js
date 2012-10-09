/**
 * See LICENSE file.
 *
 * Play scene -- ScoreActor
 * Displays the Score.
 */
(function() {
    HN.ScoreActor= function() {
        HN.ScoreActor.superclass.constructor.call(this);
        return this;
    };

    HN.ScoreActor.prototype= {

        numDigits:      6,

        incrementScore: 0,
        maxScore:       0,
        minScore:       0,
        currentScore:   0,

        numbers:        null,

        startTime:      0,
        interpolator:   null,
        scoreDuration:  2000,

        font:           null,

        FONT_CORRECTION:    .6,


        reset : function() {
            this.currentScore= 0;
            this.maxScore= 0;
            this.minScore= 0;
            this.currentScore=0;
            this.setScore();
        },
        initialize : function(font, background) {

            var i;

            this.font= font;
            this.interpolator= new CAAT.Interpolator().createExponentialInOutInterpolator(2,false);
            this.setBackgroundImage(background, true);

            for( i=0; i<this.numDigits; i++ ) {
                var actor= new CAAT.Actor().
                        setBackgroundImage(font.getRef(), true).
                        setLocation(
                            (((this.width-this.numDigits*this.font.singleWidth*this.FONT_CORRECTION)/2)>>0) +
                                (i*this.font.singleWidth*this.FONT_CORRECTION) - 5,
                            12
                        ).
                        setScale( this.FONT_CORRECTION, this.FONT_CORRECTION );

                this.addChild(actor);
            }

            return this;
        },
        contextEvent : function( event ) {
            if ( event.source=='context' ) {
                if ( event.event=='score' ) {
                    this.maxScore= event.params.score;
                    this.minScore= this.currentScore;
                    this.incrementScore= this.maxScore- this.minScore;
                    this.startTime= this.time;
                } else if ( event.event=='status') {
                    if ( event.params==HN.Context.prototype.ST_STARTGAME ) {
                        this.reset();
                    }
                }
            }
        },
        setScore: function(director) {
            this.currentScore>>=0;
            var str= ''+this.currentScore;
            while( str.length<6 ) {
                str='0'+str;
            }

            this.numbers= [];
            var i=0;
            for( i=0; i<str.length; i++ ) {
                this.numbers[i]= parseInt(str.charAt(i));
                this.childrenList[i].setAnimationImageIndex([this.numbers[i]]);
            }
        },
        animate : function(director, time) {
            if ( time>= this.startTime && time<this.startTime+this.scoreDuration ) {
                this.currentScore=
                        this.minScore +
                            this.incrementScore *
                            this.interpolator.getPosition( (time-this.startTime)/this.scoreDuration ).y;
                this.setScore(director);
                
            } else {
                if ( this.currentScore!=this.maxScore ) {
                    this.currentScore= this.maxScore;
                    this.setScore(director);
                }
            }

            return HN.ScoreActor.superclass.animate.call(this,director,time);
        }
    };

    extend( HN.ScoreActor, CAAT.ActorContainer);
})();

