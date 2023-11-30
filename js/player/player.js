//两个角色
import {AcGameObject} from '../ac_game_object/base.js';

export class Player extends AcGameObject {
    constructor(root,info) {
        super();

        this.root = root;
        //2d先用矩形代替角色和技能，3d先用圆柱或球代替，实现完成后再进行动画替换
        this.id = info.id;
        //坐标
        this.x = info.x;
        this.y = info.y;
        //长宽
        this.width = info.width;
        this.height = info.height;
        this.color = info.color;

        this.direction = 1;

        //速度
        this.vx = 0;
        this.vy = 0;

        this.speedx = 400;//水平速度，每秒钟移动多少像素
        this.speedy = -1000;//跳起的初始速度,向上跳，方向为负的
        
        //重力，可以使人物下落
        this.gravity = 50;

        this.ctx = this.root.game_map.ctx;//引入地图中的ctx
        
        this.pressed_keys = this.root.game_map.controller.pressed_keys;

        this.status = 3;
        //状态机，0：idle(静止)，1：向前，2：向后，3：跳跃，4：攻击，5：被打，6:死亡
    
        //将每个状态的动作存入数组中
        this.animations = new Map();

        //计数器，渲染,表示记录多少帧
        this.frame_current_cnt = 0;

        this.hp = 100;
        this.$hp = this.root.$kof.find(`.kof-head-hp-${this.id}>div`);
        this.$hp_div = this.$hp.find('div');
    }

    start() {

    }

    update_move(){//移动
        //只有在空中才增加重力
            this.vy += this.gravity;

        this.x += this.vx * this.timedelta / 1000;//距离=速度*时间，时间单位为毫秒，需要除以1000
        this.y += this.vy * this.timedelta / 1000;

        //设置平地，停止掉落
        if(this.y > 450){
            this.y = 450;
            this.vy = 0;
            if(this.status === 3){
                this.status = 0;//到平地后变成静止状态
            }
        }

        //限制，防止跑出地图
        if(this.x < 0){
            this.x = 0;
        } else if (this.x + this.width > this.root.game_map.$canvas.width()) {
            this.x = this.root.game_map.$canvas.width() - this.width;
        }

        //两名玩家不重叠,推对方走
        let [ a,b] = this.root.players;
        if(a != this) [a,b] = [b,a]
        let r1 = {
            x1:a.x,
            y1:a.y,
            x2:a.x + a.width,
            y2:a.y + a.height,
        };
        let r2 = {
            x1:b.x,
            y1:b.y,
            x2:b.x + b.width,
            y2:b.y + b.height,
        };
        if(this.is_collision(r1,r2)){
            this.x -= this.vx * this.timedelta / 1000;//距离=速度*时间，时间单位为毫秒，需要除以1000
            this.y -= this.vy * this.timedelta / 1000;
            b.x += this.vx * this.timedelta / 1000 /2;//距离=速度*时间，时间单位为毫秒，需要除以1000
            b.y += this.vy * this.timedelta / 1000 /2;
            if(this.status === 3){
                this.status = 0;//到平地后变成静止状态
            }
        }
    }

    update_control() {
        let w,a,d,space;
        if(this.id === 0) {
            w = this.pressed_keys.has('w');
            a = this.pressed_keys.has('a');
            d = this.pressed_keys.has('d');
            space = this.pressed_keys.has(' ');
        } else {
            w = this.pressed_keys.has('ArrowUp');
            a = this.pressed_keys.has('ArrowLeft');
            d = this.pressed_keys.has('ArrowRight');
            space = this.pressed_keys.has('Enter');
        }

        if(this.status === 0 || this.status === 1){
            //攻击
            if(space) {
                this.status =4;
                this.vx = 0;
                this.frame_current_cnt = 0;
            }else if(w){//跳起
                if(d) {//向前跳
                    this.vx = this.speedx;
                } else if(a) {//向后跳
                    this.vx = -this.speedx;
                } else {
                    this.vx = 0
                }
                this.vy = this.speedy;
                this.status = 3;//状态修改为跳起
                this.frame_current_cnt = 0;
            } else if(d) {//移动
                this.vx = this.speedx;
                this.status = 1;
            } else if(a) {
                this.vx = -this.speedx;
                this.status = 1;
            } else {//没有移动
                this.vx = 0;
                this.status = 0;
            }
        }
    }
    //人物朝向
    update_direction() {
        if(this.status === 6){//倒地不换方向
            return;
        }

        let players = this.root.players;
        if (players[0] && players[1]) {
            let me = this, you = players[1 - this.id];
            if (me.x < you.x) me.direction = 1;
            else me.direction = -1;
        }
    }

    //攻击函数,表示被攻击到了
    is_attack() {
        if(this.status){//倒地不再被攻击
            return;
        }
        this.status =5;
        this.frame_current_cnt = 0;

        //掉血
        this.hp = Math.max(this.hp-10,0);

        //血条长度
        //渐变
        this.$hp_div.animate({
            width:this.$hp.parent().width() * this.hp / 100
        },300);//300ms后变到

        this.$hp.animate({
            width:this.$hp.parent().width() * this.hp / 100
        },600);//300ms后变到
        // 血条长度
        // this.$hp.width(this.$hp.parent().width() * this.hp / 100);

        if(this.hp <= 0){//血量为0，倒地
            this.status = 6;
            this.frame_current_cnt = 0;
            this.vx = 0;//速度变为0
        }
    }

    //碰撞检测函数，判断两个矩形有没有交集
    is_collision(r1,r2) {
        if(Math.max(r1.x1,r2.x1) > Math.min(r1.x2,r2.x2))
            return false;
        if(Math.max(r1.y1,r2.y1) > Math.min(r1.y2,r2.y2))
            return false;
        return true;
    }

    //攻击
    update_attack() {
        if(this.status === 4 && this.frame_current_cnt === 18){//第18帧是否攻击到
            //取出人物
            let me = this,you = this.root.players[1 - this.id];
            let r1;
            if(this.direction > 0){
                r1 = {
                    x1: me.x + 120,
                    y1: me.y + 40,
                    x2: me.x + 120 + 100,
                    y2: me.y + 40 + 20,
                };
            } else {
                r1 = {
                    x1: me.x + me.width - 120 - 100,
                    y1: me.y + 40,
                    x2: me.x + me.width - 120 - 100 + 100,
                    y2: me.y + 40 + 20,
                };
            }
            let r2 = {
                x1: you.x,
                y1: you.y,
                x2: you.x + you.width,
                y2: you.y + you.height,
            };
            //判断是否攻击到
            if(this.is_collision(r1,r2)) {
                you.is_attack();
            }
            
        }

    }

    update() {//每一帧执行一次

        this.update_control();
        //先移动再渲染
        this.update_move();
        this.update_direction();

        this.update_attack();

        this.render();
    }

    render() {//渲染，画出来
        //将游戏角色画出来
        // 先用矩形代替实现动作
        // this.ctx.fillStyle = this.color;
        // this.ctx.fillRect(this.x,this.y,this.width,this.height);
        // //碰撞检测，即拳头的小方块有没有碰到人物的矩形
        // //估计拳头，手臂攻击也算
        // if(this.direction > 0){
        //     this.ctx.fillStyle = 'yellow';
        //     this.ctx.fillRect(this.x + 120,this.y + 40,100,20);
        // } else {
        //     this.ctx.fillStyle = 'yellow';
        //     //对称
        //     this.ctx.fillRect(this.x + this.width -  120 - 100,this.y + 40,100,20);
        // }
        
        let status = this.status;

        //判断前进还是后退，是否一个方向
        if(this.status === 1 && this.direction * this.vx < 0){
            status = 2;
        }

        let obj = this.animations.get(status);
        if(obj && obj.loaded) {
            if(this.direction > 0){
                let k = parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt;
                let image = obj.gif.frames[k].image;
                this.ctx.drawImage(image, this.x, this.y + obj.offset_y, image.width * obj.scale, image.height * obj.scale);
            } else {
                this.ctx.save();
                this.ctx.scale(-1, 1);
                this.ctx.translate(-this.root.game_map.$canvas.width(), 0);

                let k = parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt;
                let image = obj.gif.frames[k].image;
                this.ctx.drawImage(image, this.root.game_map.$canvas.width() - this.x - this.width, this.y + obj.offset_y, image.width * obj.scale, image.height * obj.scale);

                this.ctx.restore();
            }    
        }

        
        if(status === 4 || status === 5 || status === 6){
            //攻击动画结束停止
            if(this.frame_current_cnt == obj.frame_rate * (obj.frame_cnt - 1)){
                if(status === 6){//死亡倒地不起
                    this.frame_current_cnt -- ;
                } else {
                    this.status = 0;
                }       
            }
            
        }


        this.frame_current_cnt ++;
    }
}