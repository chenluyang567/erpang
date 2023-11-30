import {GameMap} from '../js/game.map/base.js';
import {Kyo} from '../js/player/kyo.js';

//主类
class KOF {
    constructor(id) {
        // jQuery选择器(id选择器)
        this.$kof = $('#' + id);

        this.game_map = new GameMap(this);

        this.players = [//两名角色,用数组表示
            new Kyo(this,{
                id:0,
                x:200,
                y:0,
                width:120,
                height:200,
                color:'blue',
            }),
            new Kyo(this,{
                id:1,
                x:900,
                y:0,
                width:120,
                height:200,
                color:'red',
            }),
        ]
    }
}

//导出函数
export {
    KOF
}