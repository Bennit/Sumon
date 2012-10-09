/**
 * See LICENSE file.
 *
 * Game model..
 */
(function() {
    HN.GameModes= {
        classic:  {
            fixed_table_size:   true,
            rearrange_on_remove:true,
            rows_initial:       8,
            columns_initial:    8,
            rows_max:           8,
            columns_max:        8,
            time_policy:        -500,
            minTurnTime:        12000,
            number_policy:      [10,10,10,15,15,15,20,20,25,30,35,40,45,50],
            name:               'classic'
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
            respawn:            true,
            respawn_time:       22000,
            rows_initial:       8,
            columns_initial:    8,
            rows_max:           8,
            columns_max:        8,
            time_policy:        500,
            minTurnTime:        8000,
            initial_map:        [
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
