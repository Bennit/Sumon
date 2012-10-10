/**
 * See LICENSE file.
 *
 * Game model -- GameModes
 * These declare the properties associated with a game mode.
 */
(function() {
    HN.GameModes= {
        classic:  {
            fixed_table_size:   true, // the table cannot grow
            rearrange_on_remove:true, // make gravity work on cubes
            rows_initial:       8, // initial board row amount
            columns_initial:    8, // initial board column amount
            rows_max:           8, // maximum row amount
            columns_max:        8, // maximum column amount
            time_policy:        -500, // how much guessing time is added each level up
            minTurnTime:        12000, // minimum time a user can take to guess
            number_policy:      [10,10,10,15,15,15,20,20,25,30,35,40,45,50], // scores associated with each number (index == number)
            name:               'classic' // name of this mode
        },
        progressive : {
            fixed_table_size:   false,
            rearrange_on_remove:true,
            rows_initial:       3,
            columns_initial:    3,
            rows_max:           8,
            columns_max:        8,
            time_policy:        0,
            number_policy:      [10,10,10,10,10,15,15,15,15,20,25,30,35,40,45,50],
            name:               'progressive'
        },
        respawn : {
            fixed_table_size:   true,
            rearrange_on_remove:true,
            respawn:            true, // spawn new cubes or not
            respawn_time:       22000, // how many milliseconds it takes spawn new cubes
            rows_initial:       8,
            columns_initial:    8,
            rows_max:           8,
            columns_max:        8,
            time_policy:        500,
            minTurnTime:        8000,
            initial_map:        [ // the map layout. 1 indicates the cube is removed, 0 indicates it is not.
                    [0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0],
                    [0,0,0,1,1,0,0,0],
                    [0,0,1,1,1,1,0,0],
                    [0,1,1,1,1,1,1,0],
                    [1,1,1,1,1,1,1,1]
            ],
            number_policy:      [10,10,10,10,10,15,15,15,15,20,25,30,35,40,45,50],
            name:               'respawn'
        }
    }
})();
