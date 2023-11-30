//读取键盘输入
export class Controller {
    constructor($canvas) {
        this.$canvas = $canvas;

        this.pressed_keys = new Set();
        this.start();
    }

    start() {
        let outer = this;
        this.$canvas.keydown(function(e){//按下添加
            outer.pressed_keys.add(e.key);
            console.log(e.key);
        });

        this.$canvas.keyup(function(e){//按起删除
            outer.pressed_keys.delete(e.key);
        });
    }
} 