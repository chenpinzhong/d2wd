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
            if (typeof (target.attributes['btn_click']) == "undefined") {
                target.setAttribute('btn_click', "false")
            }
            if (target.attributes['btn_click']['value'] == "true") {
                target.attributes['btn_click']['value'] = "false"
            } else {
                target.attributes['btn_click']['value'] = "true"
            }
        },
        //按钮动画播放结束
        click_animation_end: function (e) {
            let target = e.currentTarget;//得到当前元素
            if (typeof (target.attributes['btn_click']) == "undefined") {
                target.setAttribute('btn_click', "false")
            }
            target.setAttribute('btn_click', "false")
        }
    },
};

//选择框组件
const select_com = {
    //绑定对象
    name: 'select',
    //绑定对象
    el: '',
    //相关数据
    data:{
        //默认值
        default:{
            'id':'',
            'name':'',//表单的名称
            'select_value':'',//真实选择的值
            'select_text':'',//真实选择的内容
            'icon_down':true,
            'icon_search':false,
            'select_dropdown':false,//是否显示下拉菜单
            'dropdown_scrollbar':false,//滚动条是否显示
            'scrollbar_thumb_top':0,
            'px':'px',
        },
    },
    //组件模板
    template:'<div class="select" >\
                    <div class="select_selector">\
                        <span class="select_selection_search">\
                            <!--真实数据提交区域-->\
                            <input autocomplete="off" type="hidden" v-bind:name="name" v-model="select_value">\
                            <!--选择数据显示区域-->\
                            <input autocomplete="off" type="text" class="select_selection_search_input"  role="combobox" v-model="select_text">\
                        </span>\
                        <div class="select_arrow"   style="user-select: none;">\
                            <span v-show="icon_down"  role="img" aria-label="down" class="icon icon_down">\
                                <svg viewBox="64 64 896 896" focusable="false" data-icon="down" width="14px" height="14px" fill="currentColor">\
                                    <path d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3.1-12.7-6.4-12.7z"></path>\
                                </svg>\
                            </span>\
                            <span v-show="icon_search" role="img" aria-label="search" class="icon icon_search">\
                                <svg viewBox="64 64 896 896" focusable="false" data-icon="search" width="14px" height="14px" fill="currentColor">\
                                    <path d="M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0011.6 0l43.6-43.5a8.2 8.2 0 000-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4z"></path>\
                                </svg>\
                            </span>\
                        </div>\
                    </div>\
                    <transition name="fade">\
                    <div v-show="select_dropdown" class="select_dropdown">\
                        <div class="select_dropdown_box">\
                            <!--选择列表部分-->\
                            <div class="select_list">\
                                <div class="select_item">11111</div>\
                                <!--disabled 禁止选择-->\
                                <div class="select_item disabled">22222</div>\
                                <div class="select_item">32222</div>\
                            </div>\
                        </div>\
                        <!--滚动条部分-->\
                        <div v-show="dropdown_scrollbar"  class="select_dropdown_scrollbar">\
                            <div class="select_dropdown_scrollbar_thumb" v-bind:style="{top:scrollbar_thumb_top+px}"></div>\
                        </div>\
                    </div>\
                    </transition>\
                </div>',
    //绑定方法
    bind: {
        //加载组件
        load:function (e){
            let select = document.querySelectorAll(e.el);
            select.forEach(function(dom){
                //获取元素唯一ID
                let dom_id=$(dom).attr('id');
                if(typeof(dom_id)=="undefined"){
                    dom_id=e.name+'_'+e.random_string()//得到一个随机的id
                    $(dom).attr('id',dom_id)
                }
                //隐藏真实表单
                let name=$(dom).data('name');
                $(dom).css('display','none');//隐藏真实元素
                //得到选项列表
                let option_list=dom.querySelectorAll('option');
                let select_value=''
                let select_text='';
                let option_html='';
                let template=$(e.template);
                template.attr('data-id',dom_id);
                option_list.forEach(function (item){
                    //设置默认值
                    if(item.disabled==true || select_value==''){
                        select_value=item.value
                        select_text=item.text
                    }
                    option_html+='<div class="select_item" data-value="'+item.value+'">'+item.text+'</div>';
                });
                template.find('.select_list').html(option_html);
                $(dom).after(template);

                ////////////////////////////////////////////////////
                //VUE 相关的操作
                select_com.data[dom_id]=select_com.data['default'];//复制基础数据
                select_com.data[dom_id]['id'] = new Vue({
                    el: "[data-id='"+dom_id+"']",
                    data: select_com.data[dom_id],
                    watch : {
                        select_dropdown:function(val) {
                            //判断显示的搜索图标
                            if(val==true){
                                this.icon_down=false;
                                this.icon_search=true;
                            }else{
                                this.icon_down=true;
                                this.icon_search=false;
                            }
                        },
                    },
                    methods:{
                    }
                });
                select_com.data[dom_id]['dom']=dom;
                //显示的值
                select_com.data[dom_id]['name']=name;
                select_com.data[dom_id]['select_value']=select_value;
                select_com.data[dom_id]['select_text']=select_text;
                select_com.data[dom_id]['item_html']=option_html;
            })
            //监听body点击事件 方便下拉框 隐藏
            document.addEventListener('click',e.body_click,false);
        },
        //显示组件
        show:function(e){
            let select = document.querySelectorAll(e.el);
            select.forEach(function(dom){
                let dom_id=dom.id;
                let dom_scroll=document.querySelector('[data-id="'+dom_id+'"] .select_selector');
                dom_scroll.addEventListener('click', e.show_click, false);
            })
        },
        //搜索相关
        input:function(e){
            let select = document.querySelectorAll(e.el);
            select.forEach(function(dom){
                let dom_id=dom.id;
                let dom_scroll=document.querySelector('[data-id="'+dom_id+'"] .select_selector');
                dom_scroll.addEventListener('input', e.input, false);
            })
        },
        //滚动事件
        scroll_handle:function (e){
            //对select 进行绑定事件
            let select = document.querySelectorAll(e.el);
            select.forEach(function(dom){
                let dom_id=dom.id;
                let dom_scroll=document.querySelector('[data-id="'+dom_id+'"] .select_dropdown .select_dropdown_box');
                if (dom_scroll.addEventListener)dom_scroll.addEventListener('DOMMouseScroll', e.scroll_handle, false);
                dom_scroll.onmousewheel = e.scroll_handle;
                //滚动条
                let scrollbar_thumb=document.querySelector('[data-id="'+dom_id+'"] .select_dropdown .select_dropdown_scrollbar_thumb');
                // 当鼠标按下时, 添加鼠标移动监听
                scrollbar_thumb.addEventListener("mousedown", function (){
                    scrollbar_thumb.addEventListener("mousemove", e.scrollbar_onmousemove)
                })
                // 添加鼠标弹起监听 , 即鼠标不在按下
                document.addEventListener("mouseup", function (){
                    //scrollbar_thumb.removeEventListener("mousemove", e.scrollbar_onmousemove);
                })
            })
        },
        //子元素点击
        item_click:function (e){
            //对select 进行绑定事件
            let select = document.querySelectorAll(e.el);
            select.forEach(function(dom){
                let dom_id=dom.id;
                let select_item=document.querySelectorAll('[data-id="'+dom_id+'"] .select_dropdown .select_list .select_item');
                select_item.forEach(function(dom){
                    //滚动事件
                    if (dom.addEventListener)dom.addEventListener('click',e.item_click,false);
                })
            })
        },
    },
    //移除绑定
    remove_bind: {
    },
    //事件列表
    methods: {
        //获取随机字符串
        random_string:function(length=6) {
            let str = '0123456789';
            let result = '';
            for (let i = length; i > 0; --i){
                result += str[Math.floor(Math.random() * str.length)];
            }
            return result;
        },
        //是否显示下拉列表框的滚动条
        check_dropdown_scrollbar:function (select,max_height=200){
            let dom_id=$(select).data('id');
            setTimeout(function (){
                let list_height=select.find('.select_list').height();
                if(list_height>max_height){
                    select_com.data[dom_id]['dropdown_scrollbar']=true;
                }else{
                    select_com.data[dom_id]['dropdown_scrollbar']=false;
                }
            }, 10)
        },
        //显示组件
        show_click:function (e){
            e.preventDefault();
            e.stopPropagation();
            let select=$(e.target).parents('.select');
            let dom_id=select.data('id');//得到对象id
            select_com.data[dom_id]['select_dropdown']=!select_com.data[dom_id]['select_dropdown'];
            select_com.methods.check_dropdown_scrollbar(select);
        },
        //隐藏下拉菜单
        body_click:function (e){
            let select_dropdown=$(e.target).parents('.select_dropdown');
            //滚动条的点击事件不触发
            if(select_dropdown.length==0) {
                for (let dom in select_com.data) {
                    if (select_com.data[dom]['select_dropdown'] == true) select_com.data[dom]['select_dropdown'] = false;
                }
            }
        },
        //输入事件
        input:function (e){
            let $this=$(e.target);
            let select=$($this).parents('.select');
            let dom_id=select.data('id');//得到对象id
            let select_list_item=select.find('.select_list .select_item');
            let scrollbar_thumb=select.find('.select_dropdown_scrollbar .select_dropdown_scrollbar_thumb');

            //用户搜索输入时 打开菜单
            if(select_com.data[dom_id]['select_dropdown']==false)select_com.data[dom_id]['select_dropdown']=true;

            //子元素是否显示
            //用户搜索的值
            let search_value=select_com.data[dom_id]['select_text'].toLowerCase();//页面显示的值
            select_list_item.each(function(){
                if($.trim(search_value)=='') {
                    $(this).show();
                }else if($(this).text().toLowerCase().indexOf(search_value) >= 0){
                    $(this).show();
                }else {
                    $(this).hide();
                }
            });

            //控制滚动条位置
            $(select).find('.select_dropdown')[0].scrollTop=0;
            scrollbar_thumb.css('top',0+'px');
            //是否显示滚动条
            select_com.methods.check_dropdown_scrollbar(select);
        },
        //添加滚动事件处理
        scroll_handle:function(e){
            e.preventDefault();
            e.stopPropagation();

            let select=$(e.target).parents('.select');
            let dom_id=select.data('id');//得到对象id

            let select_box=$(e.target).parents('.select_dropdown');
            let list_height=select_box.find('.select_list').height();//元素列表高度
            let item_height=select_box.find('.select_list .select_item').height();//元素高度
            //真实滚动条 不可见
            let real_scrollbar=select_box.find('.select_dropdown_box')[0];//真实滚动条
            let real_scrollbar_height=select_box.find('.select_dropdown_box').height();//真实滚动高度
            //可视滚动条 可见
            let scrollbar_height=select_box.find('.select_dropdown_scrollbar').height();//滚动高度
            let show_scrollbar_thumb=select_box.find('.select_dropdown_scrollbar .select_dropdown_scrollbar_thumb');
            let scrollbar_thumb_height=show_scrollbar_thumb.height();//滚动条高度

            //计算虚拟的滚动条高度
            if(e.wheelDelta<=0){
                real_scrollbar.scrollTop+=item_height;
            }else {
                real_scrollbar.scrollTop-=item_height;
            }
            let temp_height=list_height-real_scrollbar_height;//真实可滚动高度
            let temp_height2=scrollbar_height-scrollbar_thumb_height;//ui可滚动高度
            let scroll_scale=real_scrollbar.scrollTop/temp_height;
            select_com.data[dom_id]['scrollbar_thumb_top']=temp_height2*scroll_scale
            return false;
        },
        item_click:function (e){
            let $this=$(e.target);
            let select=$($this).parents('.select');
            let dom_id=select.data('id');//得到对象id
            //真实的值
            let value=$this.data('value');
            let text=$this.text();

            select_com.data[dom_id]['select_value']=value;//真实提交的值
            select_com.data[dom_id]['select_text']=text;//页面显示的值
            //隐藏下拉框
            select_com.data[dom_id]['select_dropdown']=false;
        },
        //鼠标被移动
        scrollbar_onmousemove:function (e){
            console.log(e)
            let $this=$(e.target);
            let select=$($this).parents('.select');
            let dom_id=select.data('id');//得到对象id
            select_com.data[dom_id]['scrollbar_thumb_top']+=e.movementY;
        },
    },
};
