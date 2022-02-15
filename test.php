<?php
// 当函数被定义而不是被调用的时候继承变量的值
$message = 'world';



// 父级作用域改变的值反映在函数调用中
$message = 'world';
$message_2='ccc';
// 闭包函数也可以接受常规参数
$example = function ($arg) use ($message,$message_2) {
    var_dump($arg . ' ' . $message.'-'.$message_2);
};
function ($arg) {

}
var_dump(($example));

