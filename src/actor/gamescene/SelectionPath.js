/**
 * See LICENSE file.
 *
 * Play scene -- SelectionPath
 * When selecting numbers to sum up to the given value, we display
 * the path between the bricks selected up to now.
 */
(function() {
    HN.SelectionPath= function(director) {
        HN.SelectionPath.superclass.constructor.call(this);

        this.coords=        [];
        this.particles=     [];
        this.fillStyle=     null;
        this.bolasImage=
                new CAAT.SpriteImage().initialize(
                    director.getImage('bolas'),1,8);
        this.director=      director;
        return this;
    };

    HN.SelectionPath.prototype= {

        coords:                 null,   // an array of 2D positions on screen.
        path:                   null,
        pathMeasure:            null,
        particles:              null,   // an array of random time to position on path.
        particlesPerSegment:    10,
        traversingPathTime:     3000,
        context:                null,
        bolasImage:             null,
        director:               null,

        /**
         *
         * @param bolas {CAAT.SpriteImage}
         */
        initialize : function() {
            this.coords=        [];
            this.path=          null;
            this.pathMeasure=   null;
        },
        setup : function( context, brickActors ) {

            var i;

            this.context= context;
            this.brickActors= brickActors;
            this.coords= [];

            // no bricks, no path
            if ( 0==context.selectedList.length ) {
                this.initialize();
                return;
            }

            var expectedParticleCount= this.particlesPerSegment*(context.selectedList.length-1);
            if ( this.particles.length> expectedParticleCount ) {
                this.particles.splice( expectedParticleCount, this.particles.length-expectedParticleCount );
            } else {
                while( this.particles.length<expectedParticleCount ) {
                    this.particles.push( (context.selectedList.length)*this.traversingPathTime + this.traversingPathTime*Math.random() );
                }
            }
        },
        setupPath : function() {
            this.coords= [];

            if ( this.context.selectedList.length ) {
                var numberWidth= this.brickActors[0][0].width;
                var numberHeight= this.brickActors[0][0].height;
                var offsetX= (this.context.columns-this.context.currentColumns)/2*numberWidth;
                var offsetY= (this.context.rows-this.context.currentRows)/2*numberHeight;

                // get selected bricks screen coords.
                for( i=0; i<this.context.selectedList.length; i++ )  {
                    var brick= this.context.selectedList[i];
                    var brickActor= this.brickActors[brick.row][brick.column];
                    this.coords.push(
                        {
                            x: brickActor.x + brickActor.width/2,// + offsetX,
                            y: brickActor.y + brickActor.height/2// + offsetY
                        });
                }

                // setup a path for the coordinates.
                this.path= new CAAT.Path();
                this.path.beginPath( this.coords[0].x, this.coords[0].y );
                for( i=1; i<this.context.selectedList.length; i++ ) {
                    this.path.addLineTo( this.coords[i].x, this.coords[i].y );
                }
                this.path.endPath();
                this.pathMeasure= new CAAT.PathBehavior().
                        setPath(this.path).
                        setFrameTime(0, this.traversingPathTime*this.context.selectedList.length).
                        setCycle(true);
            }
        },
        paint : function(director, time)    {
            if ( null!=this.context && 0!=this.context.selectedList.length ) {

                var i;
                this.setupPath();


                var ctx= director.ctx;

                ctx.beginPath();
                var i;
                for( i=0; i<this.coords.length; i++ ) {
                    ctx.lineTo( this.coords[i].x, this.coords[i].y );
                }

                ctx.strokeStyle=    '#ffff00';
                ctx.lineCap=        'round';
                ctx.lineJoin=       'round';

                for( i=2; i<=(CocoonJS.available ? 2 : 8); i+=2 ) {

                    ctx.lineWidth=  i;
                    ctx.globalAlpha= .5 - i/8/3;
                    ctx.stroke();
                }

                if ( this.pathMeasure ) {
                    var pos;
                    for(i=0; i<this.particles.length; i++) {
                        pos= this.pathMeasure.positionOnTime( (this.particles[i]+time)*(1+(i%3)*.33) );
                        this.bolasImage.setSpriteIndex(i%8);
                        this.bolasImage.paint( director, 0, pos.x-4, pos.y-4 );
                    }
                }
            }

        },
        contextEvent : function( event ) {
            /*
            if ( event.source=='brick' &&
                (event.event=='selection' || event.event=='selectionoverflow' || event.event=='selection-cleared') ) {
                this.setupPath();
            }
            */
        },
        paintActorGL : function(director,time) {

            if ( null!=this.context && this.context.selectedList.length>1 ) {
                this.setupPath();
                if ( null===this.coords || 0===this.coords.length ) {
                    return;
                }


                director.glFlush();

                var i,
                    pos=0,
                    z= 0,
                    point= new CAAT.Point(),
                    m= this.worldModelViewMatrix,
                    cc= director.coords,
                    ccthis= this.coords,
                    pa= this.particles;

                for( i=0; i<ccthis.length; i++ ) {
                    point.set(ccthis[i].x, ccthis[i].y,0);
                    m.transformCoord(point);
                    cc[pos++]= point.x;
                    cc[pos++]= point.y;
                    cc[pos++]= z;
                }
                for( i=2; i<=8; i+=2 ) {
                    director.glTextureProgram.drawPolylines(cc, ccthis.length, 1,1,0,.5 - i/8/3, i);
                }


                //
                // setup particles
                //

                pos=0;
                for(i=0; i<pa.length; i++) {
                    ppos= this.pathMeasure.positionOnTime( (pa[i]+time)*(1+(i%3)*.33) );
                    point.set(ppos.x, ppos.y,0);
                    m.transformCoord(point);
                    cc[pos++]= point.x-3;
                    cc[pos++]= point.y-3;
                    cc[pos++]= z;

                    cc[pos++]= point.x+3;
                    cc[pos++]= point.y+3;
                    cc[pos++]= z;
                }
                director.glTextureProgram.drawLines(cc, pa.length, 1,1,1,.3, 7);

            }
        }
    };

    extend( HN.SelectionPath, CAAT.Actor);
})();
