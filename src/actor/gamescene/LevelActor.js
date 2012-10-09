/**
 * See LICENSE file.
 *
 * Play scene -- LevelActor
 * Displays the Level number.
 */
(function() {
    HN.LevelActor= function() {
        HN.LevelActor.superclass.constructor.call(this);
        this.numbers= [];
        return this;
    };

    HN.LevelActor.prototype= {
        font:       null,
        numbers:    null,

        initialize : function(font, background) {
            this.font= font;

            for( var i=0; i<2; i++ ) {
                var digit= new CAAT.Actor().
                        setBackgroundImage(font.getRef(), true).
                        setVisible(false);
                this.numbers.push(digit);
                this.addChild(digit);
            }

            this.setBackgroundImage(background, true);

            return this;
        },
        contextEvent : function(event) {
            if ( event.source=='context' ) {
                if ( event.event=='levelchange') {
                    this.level=   event.params;

                    var snumber= this.level.toString();
                    var i, number;
                    var correction= this.font.singleWidth*.8;

                    for( i=0; i<snumber.length; i++ ) {
                        number= parseInt(snumber.charAt(i));
                        this.numbers[i].
                            setSpriteIndex(number).
                            setLocation(
                                (this.width - snumber.length*correction)/2 + i*correction, 24 ).
                            setVisible(true);
                    }

                    for( ;i<this.numbers.length; i++ ) {
                        this.numbers[i].setVisible(false);
                    }

                }
            }
        }
    };

    extend(HN.LevelActor, CAAT.ActorContainer);
})();
