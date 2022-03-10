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

//选择框组件
const select_com = {
    //绑定对象
    name: 'select',
    //绑定对象
    el: '',
    //绑定方法
    bind: {
        //加载时的操作
        load:function (e){
            //对select 进行绑定事件
            let select = document.querySelectorAll(e.el);
            select.forEach(function(dom){
                e.add_scroll_handle(dom.querySelector('.ui_select_dropdown'),e.scroll_handle)
            })
        },
    },
    //移除绑定
    remove_bind: {
        //加载时的操作
        load:function (e){
            //对select 移除绑定事件
            let select = document.querySelectorAll(e.el);
            select.forEach(function(dom){
                e.remove_scroll_handle(dom.querySelector('.ui_select_dropdown'),e.scroll_handle)
            })
        },
    },
    //事件列表
    methods: {
        //添加滚动事件
        add_scroll_handle:function (obj,scroll_handle){
            if (obj.addEventListener)obj.addEventListener('DOMMouseScroll', scroll_handle, false)
            obj.onmousewheel = scroll_handle
        },
        //移除绑定事件
        remove_scroll_handle:function (obj,scroll_handle){
            if (obj.addEventListener)obj.removeEventListener('DOMMouseScroll', scroll_handle, false)
            obj.onmousewheel = null
        },
        //添加滚动事件处理
        scroll_handle:function(e){
            e.preventDefault();
            e.stopPropagation();
            let select_box=$(e.target).parents('.ui_select_dropdown');
            let select_list=select_box.find('.ui_select_list');
            let select_list_item=select_box.find('.ui_select_list .ui_select_item');
            let scrollbar_box=select_box.find('.ui_select_dropdown_scrollbar');
            let scrollbar_thumb=select_box.find('.ui_select_dropdown_scrollbar .ui_select_dropdown_scrollbar_thumb');
            let box_height=select_box.height();//容器高度
            let list_height=select_list.height();//列表高度
            let item_height=select_list_item.height();//元素高度
            let scrollbar_box_height=scrollbar_box.height();//滚动条容器高度
            let scrollbar_height=scrollbar_thumb.height();//滚动条高度
            if(e.wheelDelta<=0){
                select_box[0].scrollTop+=item_height;
            }else {
                select_box[0].scrollTop-=item_height;
            }
            let true_scroll_top=select_box[0].scrollTop/(list_height-box_height);//得到当前滚动占比
            console.log('true_scroll_top',true_scroll_top,'scrollbar_box_height',scrollbar_box_height,'scrollbar_height',scrollbar_height,'v',true_scroll_top*(scrollbar_box_height-scrollbar_height))
            let new_top=true_scroll_top*(scrollbar_box_height-scrollbar_height);
            scrollbar_thumb.css('top',new_top+'px');
            return false;
        },
    },
};
