/**
 * See LICENSE file.
 *
 * Game model -- Brick
 */
(function() {

    HN.Brick= function() {
        return this;
    };

    HN.Brick.prototype= {

        value:      0, // The number the brick represents
        color:      0, // The color of the brick
        selected:   false, // Whether it is selected
        removed:    false, // Whether it is removed from the field

        row:        0, // The row coordinate on the field
        column:     0, // The column coordinate on the field

        context:    null, // The context using this brick.
        delegate:   null, // Function called when respawning a brick.

        /**
         * Initialize a brick for the given location and context.
         * @param row
         * @param column
         * @param context the HN.Context instance
				 * @param removed Wether the brick is removed or not.
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

				/**
				 * Mark the brick as selected or unselected.
				 */
        changeSelection : function() {

            // prevent brick selection while bricks are flying in.
            if ( this.context.status!==this.context.ST_RUNNNING ) {
                return;
            }

            this.selected= !this.selected;
            this.context.selectionChanged(this);
        },

				/**
				 * Reset the brick's fields and choose a random value between 1..9.
				 */
        respawn : function() {

            this.selected= false;

            // More odds for 3..9 than 1..2.
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
