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
    //模板
    template:'<div class="ui_select">\
                    <div class="ui_select_selector">\
                        <span class="ui_select_selection_search">\
                            <!--真实数据提交区域-->\
                            <input autocomplete="off" type="text" class="ui_select_selection_search_input" role="combobox" value="123">\
                        </span>\
                    </div>\
                    <div class="ui_select_dropdown">\
                        <div style="position: relative;">\
                            <!--选择列表部分-->\
                            <div class="ui_select_list">\
                                <div class="ui_select_item">11111</div>\
                                <!--disabled 禁止选择-->\
                                <div class="ui_select_item disabled">22222</div>\
                                <div class="ui_select_item">32222</div>\
                            </div>\
                            <!--滚动条部分-->\
                            <div class="ui_select_dropdown_scrollbar">\
                                <div class="ui_select_dropdown_scrollbar_thumb"></div>\
                            </div>\
                        </div>\
                    </div>\
                </div>',
    //绑定方法
    bind: {
        //加载事件
        load:function (e){
            let select = document.querySelectorAll(e.el);
            select.forEach(function(dom){
                $(dom).css('display','none');//隐藏真实元素
                let option_list=dom.querySelectorAll('option');//得到选项列表
                //列表展示的元素
                let template=$(e.template);
                let option_html='';
                option_list.forEach(function (item){
                    option_html+='<div class="ui_select_item" data-value="'+item.value+'">'+item.text+'</div>';
                });
                template.find('.ui_select_list').html(option_html);
                $(dom).after(template);
            })

        },
        //滚动事件
        scroll_handle:function (e){
            //对select 进行绑定事件
            let select = document.querySelectorAll(e.el);
            select.forEach(function(dom){
                //滚动事件
                if (dom.addEventListener)dom.addEventListener('DOMMouseScroll', e.scroll_handle, false);
                dom.onmousewheel = e.scroll_handle;
            })
        },
        //子元素点击
        item_click:function (e){
            //对select 进行绑定事件
            let select = document.querySelectorAll(e.el);
            select.forEach(function(dom){
                //滚动事件
                if (dom.addEventListener){
                    dom.addEventListener('click',e.item_click,false)
                }else{
                    console.log('select_com','无法绑定click事件')
                }
            })
        },
    },
    //移除绑定
    remove_bind: {
        //加载
        load:function (e){

        },
        //滚动事件
        scroll_handle:function (e){
            //对select 进行绑定事件
            let select = document.querySelectorAll(e.el);
            select.forEach(function(dom){
                if (dom.addEventListener)dom.removeEventListener('DOMMouseScroll', e.scroll_handle, false);
                dom.onmousewheel = null;
            })
        },
        //子元素选择
        item_click:function (e){
            /*
            //对select 进行绑定事件
            let select = document.querySelectorAll(e.el);
            select.forEach(function(dom){
                //滚动事件
                if (dom.removeEventListener){
                    dom.removeEventListener('click',e.click,false)
                }else{
                    console.log('select_com','无法绑定click事件')
                }
            })
             */
        },
    },
    //事件列表
    methods: {
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
            let new_top=true_scroll_top*(scrollbar_box_height-scrollbar_height);
            scrollbar_thumb.css('top',new_top+'px');
            return false;
        },
        item_click:function (e){
            console.log($(e.target).text())
        },
    },
};
