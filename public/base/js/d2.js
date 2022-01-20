//组件代理
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
};

//按钮组件定义
const button_com = {
    //绑定对象
    name: 'button',
    //绑定对象
    el: '',
    //绑定方法
    bind: {
        //绑定的click事件
        click:function (e){
            let btn = document.querySelectorAll(e.el);
            btn.forEach(function (dom, index, arr) {
                dom.addEventListener('click', e.click)
            })
        },
        //绑定的动画事件
        animation: function (e) {
            let btn = document.querySelectorAll(e.el);
            btn.forEach(function (dom, index, arr) {
                //注册动画开始结束处理事件
                dom.addEventListener('click', e.click_animation_start)
                dom.addEventListener('animationend', e.click_animation_end)
            })
        }
    },
    //移除绑定
    remove_bind: {
        //移除绑定click事件
        click:function (e){
            let btn = document.querySelectorAll(e.el);
            btn.forEach(function (dom, index, arr) {
                dom.removeEventListener('click', e.click)
            })
        },
        //移除绑定的动画事件
        animation: function (e) {
            let btn = document.querySelectorAll(e.el);
            btn.forEach(function (dom, index, arr) {
                dom.removeEventListener('click', e.click_animation_start)
                dom.removeEventListener('animationend', e.click_animation_end)
            })
        }
    },
    //事件列表
    methods: {
        //定义一个空事件
        click:function (){},
        //按钮点击事件
        click_animation_start: function (e) {
            let target = e.currentTarget;//得到当前元素
            if (typeof (target.attributes['ui_btn_click']) == "undefined") {
                target.setAttribute('ui_btn_click', "false")
            }
            if (target.attributes['ui_btn_click']['value'] == "true") {
                target.attributes['ui_btn_click']['value'] = "false"
            } else {
                target.attributes['ui_btn_click']['value'] = "true"
            }
        },
        //按钮动画播放结束
        click_animation_end: function (e) {
            let target = e.currentTarget;//得到当前元素
            if (typeof (target.attributes['ui_btn_click']) == "undefined") {
                target.setAttribute('ui_btn_click', "false")
            }
            target.setAttribute('ui_btn_click', "false")
        }
    },
};