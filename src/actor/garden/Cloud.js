/**
 * See LICENSE file.
 *
 * Menu Scene.
 */
(function() {

    HN.Cloud= function() {
        HN.Cloud.superclass.constructor.call(this);
        return this;
    };

    HN.Cloud.prototype= {
        scene:      null,

        setScene : function(scene) {
            this.scene= scene;
            return this;
        },
        setupBehavior : function(director) {

            this.setBackgroundImage( director.getImage('cloudb'+ ((4*Math.random())>>0) ) );

            var me= this;
            var ix0, ix1, iy0, iy1;
            var from= Math.random();
            var dw= director.width;
            var dh= director.height;

            var ih= this.backgroundImage.height;
            var iw= this.backgroundImage.width;

            var t= 40000 + 5000*Math.random()*4;

            ix0= -iw + -iw*2*Math.random();
            iy0= dh*Math.random()/2;
            ix1= dw;
            iy1= iy0 + 50*Math.random()/2;

            var me= this;

            var pb= new CAAT.PathBehavior().
                setPath( new CAAT.Path().setLinear(ix0, iy0, ix1, iy1 ) );

            this.emptyBehaviorList();
            this.addBehavior(
                pb.
                    setFrameTime( this.scene.time, t ).
                    addListener( {
                        behaviorExpired : function(behavior, time, actor) {

                            ix0= -iw + -iw*2*Math.random();
                            iy0= dh*Math.random()/2;
                            ix1= dw;
                            iy1= iy0 + 50*Math.random()/2;
                            t= 40000 + 5000*Math.random()*4;

                            behavior.path.setLinear( ix0, iy0, ix1, iy1 );
                            behavior.setTimeOffset(0).setFrameTime( me.scene.time, t );
                        }
                    }).
                    setTimeOffset( Math.random() ) );

            return this;
        }
    }

    extend( HN.Cloud, CAAT.Actor );

})();

