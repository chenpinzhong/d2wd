<?php
namespace app\ui\controller;

use support\Request;

class Index{
    public function index(Request $request){
        return view('index/index', ['name' => 'webman']);
    }
}
