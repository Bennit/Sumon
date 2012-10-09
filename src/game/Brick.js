/**
 * See LICENSE file.
 *
 * Game model..
 */
(function() {

    HN.Brick= function() {
        return this;
    };

    HN.Brick.prototype= {

        value:      0,
        color:      0,
        selected:   false,
        removed:    false,

        row:        0,
        column:     0,

        context:    null,
        delegate:   null,

        /**
         *
         * @param row
         * @param column
         * @param context the HN.Context instance
         */
        initialize : function(row, column, context, removed) {

            removed= removed || false;

            this.row=       row;
            this.column=    column;
            this.selected=  false;
            this.removed=   removed;
            this.color=     (Math.random()*context.getNumberColors())>>0;
            this.context=   context;

            this.respawn();
        },
        changeSelection : function() {

            // prevent brick selection while bricks are flying in.
            if ( this.context.status!==this.context.ST_RUNNNING ) {
                return;
            }

            this.selected= !this.selected;
            this.context.selectionChanged(this);
        },
        respawn : function() {

            this.selected= false;

            // favorecer los numeros 3..9
            if ( Math.random()>.3 ) {
                this.value= 4 + (Math.random()*6)>>0;
            } else {
                this.value= 1 + (Math.random()*3)>>0;
            }

            if ( this.value<1 ) {
                this.value=1;
            } else if ( this.value>9 ) {
                this.value=9;
            }

            if ( null!=this.delegate ) {
                this.delegate();
            }

            return this;
        }
    };

})();
