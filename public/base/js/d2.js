
const com={
    //代理方法
    handler:{
        get: function(target, prop, receiver) {
            //直接返回
            if(prop in target)return target[prop]
            //访问事件列表
            if('methods' in target && prop in target.methods){
                 return target.methods[prop];
            }

            return '未定义方法:'+prop;
        }
    },
    //加载组件
    load:function(load_com){
        let com=new Proxy(load_com,this.handler);
        //先执行移除绑定
        for (let fun in com.remove_bind) {
            if (typeof (com.remove_bind[fun]) == 'function') {
                com.remove_bind[fun](com);
            }
        }
        //自动绑定方法
        for (let fun in com.bind) {
            if (typeof (com.bind[fun]) == 'function') {
                com.bind[fun](com);
            }
        }
        return com;
    }
}

//按钮组件
const button_com = {
    //绑定对象
    name: 'button',
    //绑定对象
    el: '',
    //绑定方法
    bind: {
        //绑定按钮的方法
        button: function (e) {
            let btn = document.querySelectorAll(e.el);
            btn.forEach(function (dom, index, arr) {
                dom.addEventListener('click', e.d2_btn_click)
                dom.addEventListener('animationend', e.d2_btn_click_animationend)
            })
        }
    },
    //移除绑定
    remove_bind: {
        //绑定按钮的方法
        button: function (e) {
            let btn = document.querySelectorAll(e.el);
            btn.forEach(function (dom, index, arr) {
                dom.removeEventListener('click', e.d2_btn_click)
                dom.removeEventListener('animationend', e.d2_btn_click_animationend)
            })
        }
    },
    //事件列表
    methods: {
        //按钮点击事件
        d2_btn_click: function (e) {
            let target = e.currentTarget;//得到当前元素
            if (typeof (target.attributes['d2_btn_click']) == "undefined") {
                target.setAttribute('d2_btn_click', "false")
            }
            if (target.attributes['d2_btn_click']['value'] == "true") {
                target.attributes['d2_btn_click']['value'] = "false"
            } else {
                target.attributes['d2_btn_click']['value'] = "true"
            }
        },
        //按钮动画播放结束
        d2_btn_click_animationend: function (e) {
            let target = e.currentTarget;//得到当前元素
            if (typeof (target.attributes['d2_btn_click']) == "undefined") {
                target.setAttribute('d2_btn_click', "false")
            }
            target.setAttribute('d2_btn_click', "false")
        }
    },
};