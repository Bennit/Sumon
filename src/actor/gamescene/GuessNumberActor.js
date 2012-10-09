/**
 * See LICENSE file.
 *
 * Play scene..
 */
(function() {
    HN.GuessNumberActor= function() {
        HN.GuessNumberActor.superclass.constructor.call(this);
        this.actors= [];
        this.setGlobalAlpha(true);

        return this;
    };

    HN.GuessNumberActor.prototype= {

        guessNumber:    0,
        numbersImage:   null,
        offsetX:        0,
        offsetY:        0,
        numbers:        null,
        tmpnumbers:     null,

        container:      null,
        actors:         null,

        setNumbersImage : function( image, bg ) {

            this.setBackgroundImage(bg);
            this.numbersImage= image;

            this.container= new CAAT.ActorContainer()
                .setBounds( 10,0,this.width,this.height);
            this.addChild( this.container );

            this.offsetX= (this.width - 2 * (image.singleWidth-30)) / 2;
            this.offsetY= 10 + (this.height - image.singleHeight) / 2;

            for( var i=0; i<2; i++ ) {
                var digit=
                    new CAAT.Actor()
                        .setBackgroundImage(image.getRef(), true)
                        .setLocation(this.offsetX,this.offsetY)
                        .setVisible(false)
                    ;
                
                this.actors.push(digit);
                this.container.addChild(digit).setGlobalAlpha(true);
            }


            return this;
        },
        contextEvent : function( event ) {
            var i;

            if ( event.source=='context' ) {
                if ( event.event=='guessnumber' ) {

                    var me= this;
                    me.guessNumber=   event.params.guessNumber;
                    me.numbers= [];

                    var snumber= me.guessNumber.toString();
                    if ( snumber.length===1 ) {
                        snumber='0'+snumber;
                    }
                    me.offsetX= 10;
                    me.offsetY= (me.height - me.numbersImage.singleHeight)/2;

                    var i;
                    for( i=0; i<snumber.length; i++ ) {
                        me.numbers[i]= parseInt(snumber.charAt(i));
                        this.actors[i].setLocation(
                                me.offsetX+i*(me.numbersImage.singleWidth-30),
                                this.actors[i].y );
                        this.actors[i].setVisible(true);
                    }



                    if ( null==me.tmpnumbers ) {

                        for( i=0; i<snumber.length; i++ ) {
                            this.actors[i].setAnimationImageIndex([this.numbers[i]]);
                        }

                        this.container.emptyBehaviorList();
                        this.container.addBehavior(
                            new CAAT.AlphaBehavior().
                                setFrameTime( this.time, 250 ).
                                setValues(0,1).
                                setId(1000)
                            );

                        me.tmpnumbers= me.numbers;

                    } else {
                        this.container.emptyBehaviorList();
                        this.container.addBehavior(
                            new CAAT.AlphaBehavior().
                                setFrameTime( this.time, 250 ).
                                setValues(1,0).
                                addListener( {
                                    behaviorExpired : function(behavior, time, actor) {

                                        if (null!=me.numbers ) {
                                            for( i=0; i<snumber.length; i++ ) {
                                                me.actors[i].setAnimationImageIndex([me.numbers[i]]);
                                            }
                                        }

                                        actor.emptyBehaviorList();
                                        actor.addBehavior(
                                            new CAAT.AlphaBehavior().
                                                setFrameTime( me.time, 250 ).
                                                setValues(0,1));

                                    },
                                    behaviorApplied : function(behavior, time, normalizedTime, actor, value) {}
                                })
                            );
                    }

                } else if ( event.event=='status') {
                    if ( event.params!=HN.Context.prototype.ST_RUNNNING ) {
                        this.numbers= null;
                        this.tmpnumbers= null;
                    }
                }
            }
        }
    };

    extend( HN.GuessNumberActor, CAAT.ActorContainer, null);

})();

