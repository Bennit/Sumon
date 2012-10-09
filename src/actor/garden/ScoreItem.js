(function() {

    HN.ScoreItem= function() {
        return this;
    };

    HN.ScoreItem.prototype= {
        score:  0,
        level:  0,
        mode:   '',
        date:   '',

        initialize : function(score, level, mode) {
            this.score= score;
            this.level= level;
            this.mode= mode;

            var d= new Date();
            this.date= ''+d.getFullYear()+'/'+this.pad(1+d.getMonth())+'/'+this.pad(d.getDate());
            return this;
        },
        
        pad : function( n ) {
            n= ''+n;
            if ( n.length==1 ) {
                n= '0'+n;
            }
            return n;
        }
    };

    HN.Scores= function() {
        return this;
    };

    HN.Scores.prototype= {
        maxScoreRows:   10,
        scores: null,

        initialize : function() {

            var rows= 0, i;
            if ( null!=this.scores ) {
                rows= this.scores.length;
                for( i=0; i<rows; i++ ) {
                    this.setDOM( i+'_1', this.scores[i].score);
                    this.setDOM( i+'_2', this.scores[i].level);
                    this.setDOM( i+'_3', this.scores[i].mode);
                    this.setDOM( i+'_4', this.scores[i].date);
                }
            } else {
                this.scores= [];
            }

            for( i=rows; i<10; i++ ) {
                for( var j=1; j<=4; j++ ) {
                    this.setDOM( i+'_'+j, '');
                }
            }

            return this;
        },
        setDOM : function( elem, value ) {
            var dom= document.getElementById(elem);
            if ( null!=dom ) {
                dom.innerHTML= value;
            }
            return this;
        },
        addScore : function( score, level, mode ) {
            // quitar filas hasta que entre una.
            while ( this.scores.length>=this.maxScoreRows ) {
                this.scores.splice( this.scores.length-1, 1 );
            }

            // busca donde insertar el elemento.
            var i=0;
            for( i=0; i<this.scores.length; i++ ) {
                if ( score>this.scores[i].score ) {
                    break;
                }
            }
            this.scores.splice( i, 0, new HN.ScoreItem().initialize(score, level, mode ) );

            CAAT.modules.LocalStorage.prototype.save('sumon_scores_1', this.scores);

            this.initialize();

            return this;
        },
        setData : function() {
            this.scores= CAAT.modules.LocalStorage.prototype.load('sumon_scores_1');
            return this;
        }
    };
})();
