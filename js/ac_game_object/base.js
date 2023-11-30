// 每一帧刷新一下

let AC_GAME_OBJECTS = [];

class AcGameObject {
    constructor() {
        AC_GAME_OBJECTS.push(this);

        this.timedelta = 0;//当前帧距离上一帧的时间间隔

        this.has_call_start = false;//有没有执行过初始化
    }

    start() { //初始化，初始执行一次.只执行一次

    }

    update() { //每一帧执行一次(除了第一帧以外)

    }

    destroy() {//删除当前对象
        for(let i in AC_GAME_OBJECTS){
            if(AC_GAME_OBJECTS[i] === this){
                AC_GAME_OBJECTS.splice(i,1);
                break;
            }
        }
    }
}
//requestAnimationFrame(func)实现动画，该函数为递归
let last_timestamp;//计算时间间隔，记录上一个执行时间

let AC_GAME_OBJECTS_FRAME = (timestamp) => {
    for(let obj of AC_GAME_OBJECTS){
        if(!obj.has_call_start){//判断是否执行过start函数
            obj.start();
            obj.has_call_start = true;
        }else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp;
    requestAnimationFrame(AC_GAME_OBJECTS_FRAME);//递归
}

requestAnimationFrame(AC_GAME_OBJECTS_FRAME);//每一帧都执行下去

export {
    AcGameObject
}