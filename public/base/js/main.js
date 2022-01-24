/*网页基础脚本*/
let main={
    debug:true,//记录开始时间
    start_time:Date.now(),//记录开始时间
    //常用方法
    parent:function (){

    },
    run_time:function (msg){
        let run_time=Date.now()-this.start_time;
        if(this.debug)console.log(msg,run_time);
        return run_time;
    },
    //快速的页面加载完成事件
    dom_load:function (){
        if(this.debug)this.run_time('事件->'+'dom_load(dom元素加载)')
        this.code_module();
        this.left_menu_module();
    },
    //页面全部加载完成事件
    load:function (){
        if(this.debug)this.run_time('事件->'+'load(整个页面加载)')
    },
    //左侧菜单
    left_menu_module:function (){
        let path_name=location.pathname;//得到路径名称
        let item_group_list=document.querySelectorAll(".main_menu>.ui_menu_item_group>.ui_menu_item_group");
        item_group_list.forEach(function (item_group){
            let link_list=item_group.querySelectorAll(".ui_menu_item_group .ui_menu_item .ui_menu_title_content a");
            link_list.forEach(function (link){
                let is_exist=link.getAttribute('href').indexOf(path_name);
                if(is_exist>=0){
                    link.parentElement.parentElement.classList.add('ui_menu_item_selected');
                }
            })
        })
    },
    //代码展示模块
    code_module:function (){
        let code_container_list = document.querySelectorAll(".code_container");
        code_container_list.forEach(function(code_container,index){
            let code_editor_list=code_container.querySelectorAll("textarea[type='code']")
            code_editor_list.forEach(function(code_editor,index){
                let mode=code_editor.getAttribute('data-mode');
                let mode_spec={};//默认
                if(mode=='text/javascript'){
                    mode_spec={
                        mode:"text/javascript",
                        //mode:"htmlmixed",
                        theme:'ttcn',
                        readOnly: false,//只读
                        tabSize: 4, // 制表符
                        indentUnit: 2, // 缩进位数
                        lineNumbers: true,//显示行数
                        ineWiseCopyCut: true,
                        viewportMargin: 1000,//每次加载1000行
                    }
                }
                if(mode=='text/html'){
                    mode_spec={
                        mode: "text/html",
                        theme:'ttcn',
                        readOnly: false,//只读
                        tabSize: 4, // 制表符
                        indentUnit: 2, // 缩进位数
                        lineNumbers: true,//显示行数
                        ineWiseCopyCut: true,
                        viewportMargin: 1000,//每次加载1000行
                    };
                }
                if(mode=='text/css'){
                    mode_spec={
                        mode: "text/css",
                        theme:'ttcn',
                        readOnly: false,//只读
                        tabSize: 4, // 制表符
                        indentUnit: 2, // 缩进位数
                        lineNumbers: true,//显示行数
                        ineWiseCopyCut: true,
                        viewportMargin: 1000,//每次加载1000行
                    };
                }
                let editor = CodeMirror.fromTextArea(code_editor, mode_spec);
                //自动计算贷款框的高度
                let code_height=editor.display.lineDiv.scrollHeight;
                if(code_height>300){
                    editor.setSize('auto','300px');
                }else{
                    editor.setSize('auto',(code_height+20)+'px');
                }
            })
        })
    }
}

//dom 加载完成
document.addEventListener( "DOMContentLoaded",function (){
    main.dom_load()
});
//页面全部加载完成
window.addEventListener( "load",function (){
    main.load()
});





