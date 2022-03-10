<?php
error_reporting(E_ALL & ~E_NOTICE);
$cc='1';
$error_handler=function($errno, $errstr ,$err_file='', $err_line='')use(&$cc){
    $cc='sssss';
    echo "出错文件: $err_file".":".'->'.$errstr.PHP_EOL;
};

set_error_handler($error_handler, E_ALL | E_STRICT);
$formula="Math.ceil((218-10)/10)*0.07+0.07";

/*
$formula=str_replace('Math.abs','abs',$formula);
$formula=str_replace('Math.ceil','ceil',$formula);
$formula=str_replace('Math.floor','floor',$formula);
$formula=str_replace('Math.round','round',$formula);
*/

//var_dump($formula);
$shipping_cost=0;
$shipping_flag=eval("\$shipping_cost = $formula;");
var_dump($cc);


exit;


