<?php
#通用组件
namespace app\ui\controller;
use support\Request;
class common{
    public function button(Request $request){
        return view('common/button', []);
    }
    public function input(Request $request){
        return view('common/input', []);
    }
}
