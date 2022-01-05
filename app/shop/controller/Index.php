<?php
namespace app\shop\controller;

use support\Request;

class Index
{
    public function index(Request $request)
    {
        return response('hello webman shop');
    }

    public function view(Request $request)
    {
        return view('index/view', ['name' => 'webman']);
    }

    public function json(Request $request)
    {
        return json(['code' => 0, 'msg' => 'ok']);
    }

}
