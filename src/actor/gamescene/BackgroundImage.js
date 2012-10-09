/**
 * See LICENSE file.
 *
 * Play scene -- BackgroundImage
 * Displays a random cloud image on the background.
 */
(function() {

    HN.BackgroundImage= function() {
        HN.BackgroundImage.superclass.constructor.call(this);
        return this;
    };

    HN.BackgroundImage.prototype= {

        setupBehavior : function(director, bFirstTime) {

            var is_bg= Math.random()<.4;

						// Pick a random cloud background image.
            this.setBackgroundImage( director.getImage('cloud'+(is_bg ? 'b' : '')+ ((4*Math.random())>>0) ), true );
            
            var t= (30000*(is_bg?1.5:1) + 5000*Math.random()*2);
            var me= this;
            var ix0, ix1, iy0, iy1;
            var dw= director.width;
            var dh= director.height-200;

            var ih= this.backgroundImage.height;
            var iw= this.backgroundImage.width;

            if ( bFirstTime ) {
                ix0= dw*Math.random();
                iy0= dh*Math.random();
                t= (dw-ix0)/dw*t;
            } else {
                ix0= -iw-iw*Math.random();
                iy0= dh*Math.random();
            }
            ix1= dw+iw*Math.random();
            iy1= iy0 + Math.random()*30;

            this.emptyBehaviorList();
            this.addBehavior(
                    new CAAT.PathBehavior().
                            setFrameTime( this.time, t ).
                            setPath(
                                new CAAT.Path().setLinear(ix0, iy0, ix1, iy1)
                            ).
                            addListener( {
                                behaviorExpired : function(behavior, time, actor) {
                                    me.setupBehavior(director, false);
                                },
                                behaviorApplied : function(actor,time,normalizedTime,value) {
                                    
                                }
                            })
                    );

            return this;
        }
    };

    extend( HN.BackgroundImage, CAAT.Actor);
})();
