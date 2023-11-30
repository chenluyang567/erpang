// 地图
import {AcGameObject} from '../ac_game_object/base.js';
import {Controller} from '../controller/base.js';
//定义地图，继承自AcGameObject
class GameMap extends AcGameObject {
    constructor(root) {
        super();

        this.root = root;
        //tabindex=0使canvas可以聚焦
        this.$canvas = $('<canvas width="1280" height="720" tabindex=0></canvas>');
        //将canvas取出来
        this.ctx = this.$canvas[0].getContext('2d');//canvas中的对象
        this.root.$kof.append(this.$canvas);//将$canvas添加样式
        this.$canvas.focus();//将$canvas聚焦，使键盘可以输入字符
    
        this.controller = new Controller(this.$canvas);

        //血条和计时器
        this.root.$kof.append(`<div class="kof-head">
        <div class="kof-head-hp-0"><div><div></div></div></div>
        <div class="kof-head-timer">60</div>
        <div class="kof-head-hp-1"><div><div></div></div></div>
        </div>`)

        //计时
        this.time_left = 60000;//单位：ms毫秒
        this.$timer = this.root.$kof.find(".kof-head-timer");
    }

    start() { //初始化，初始执行一次.只执行一次

    }

    update() { //每一帧执行一次(除了第一帧以外),地图每一帧清空一次
        this.time_left -= this.timedelta;
        if(this.time_left < 0) {
            this.time_left = 0;

            //时间结束，平局情况
            let [a,b] = this.root.players;
            if(a.status !==6 && b.status !==6){
                a.status = b.status = 6;
                a.frame_current_cnt = b.frame_current_cnt = 0;
                a.vx = b.vx =0;//清空速度
            }
        }
        this.$timer.text(parseInt(this.time_left / 1000));

        this.render();
    }

    render() {
        //每一帧刷新一下
        this.ctx.clearRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);//清空canvas
        // console.log(this.ctx.canvas.width);//测试
        // this.ctx.fillStyle = 'black';
        // this.ctx.fillRect(0,0,this.$canvas.width(),this.$canvas.height());//先将背景染成黑色
    }

}

//导出函数
export {
    GameMap
}