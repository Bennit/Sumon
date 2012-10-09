
(function() {
    HN.Ovni= function(director, scene, ovnitrail, id ) {

        HN.Ovni.superclass.constructor.call(this);

        var ovniImage= new CAAT.SpriteImage().initialize( director.getImage('ovni'), 1, 2 );
        this.setBackgroundImage(ovniImage.getRef().setAnimationImageIndex([(Math.random()*2)>>0]));
        this.enableEvents(false);
        this.setId(id);

        setupBehavior(director, scene, ovnitrail, this);

        return this;
    };

    HN.Ovni.prototype= {
        animationName:  null,
        __index:        0,

        nextAnimationName : function() {
            this.animationName= this.getId()+this.__index++;
            return this.animationName;
        },

        getAnimationName : function() {
            return this.animationName;
        }
    }

    function setupBehavior(director, scene, ovnitrail, actor) {

        var smokeImage;
        smokeImage= new CAAT.SpriteImage().initialize(director.getImage('smoke'), 32,1 );

        var TT=1000;
        if ( director.glEnabled ) {
            TT=6000;
        }


        var path= new CAAT.Path().setCubic(
            Math.random() * director.width,
            Math.random() * director.height,
            Math.random() * director.width,
            Math.random() * director.height,
            Math.random() * director.width,
            Math.random() * director.height,
            Math.random() * director.width,
            Math.random() * director.height);

        var pb= new CAAT.PathBehavior().
            setPath( path ).
            setFrameTime( scene.time, 3000 + Math.random() * 3000 ).
            addListener( {
                prevTime : -1,
                smokeTime: TT,
                nextSmokeTime: 100,

                behaviorExpired : function(behaviour, time) {
                    var endCoord = behaviour.path.endCurvePosition();
                    behaviour.setPath(
                        new CAAT.Path().setCubic(
                            endCoord.x,
                            endCoord.y,
                            Math.random() * director.width,
                            Math.random() * director.height,
                            Math.random() * director.width,
                            Math.random() * director.height,
                            Math.random() * director.width,
                            Math.random() * director.height));
                    behaviour.setFrameTime(scene.time, 3000 + Math.random() * 3000);
                },

                behaviorApplied : function(behavior, time, normalizedTime, actor, value) {
                    if (-1 == this.prevTime || time - this.prevTime >= this.nextSmokeTime) {
                        //var img= director.getImage('smoke');
                        var img = smokeImage;
                        var offset0 = Math.random() * 10 * (Math.random() < .5 ? 1 : -1);
                        var offset1 = Math.random() * 10 * (Math.random() < .5 ? 1 : -1);
                        var humo =
                            new CAAT.Actor().
                                setBackgroundImage(smokeImage.getRef().setAnimationImageIndex([0])).
                                setLocation(
                                    offset0 + actor.x + actor.width / 2 - img.singleWidth / 2,
                                    offset1 + actor.y + actor.height / 2 - img.singleHeight / 2).
                                setDiscardable(true).
                                enableEvents(false).
                                setFrameTime(time, this.smokeTime).
                                addBehavior(
                                    new CAAT.ScaleBehavior().
                                        setFrameTime(time, this.smokeTime).
                                        setValues(.5, 1.5, .5, 1.5));
                                ;

                        humo.addBehavior(
                            new CAAT.GenericBehavior().
                                setFrameTime(time, this.smokeTime).
                                setValues(1, 0, null, null, function(value, target, actor) {
                                    var v= 31 - ((value * 31) >> 0);
                                    if ( v!==actor.backgroundImage.animationImageIndex[0] ) {
                                        actor.setAnimationImageIndex([v]);
                                    }
                                })
                        );

                        ovnitrail.addChild(humo);

                        this.prevTime = time;
                    }

                }
            });

        actor.addBehavior( pb );
    }

    extend( HN.Ovni, CAAT.Actor );

})();
