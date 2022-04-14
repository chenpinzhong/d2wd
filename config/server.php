<?php
/**
 * This file is part of webman.
 *
 * Licensed under The MIT License
 * For full copyright and license information, please see the MIT-LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @author    walkor<walkor@workerman.net>
 * @copyright walkor<walkor@workerman.net>
 * @link      http://www.workerman.net/
 * @license   http://www.opensource.org/licenses/mit-license.php MIT License
 */

return [
    'listen'               => 'http://0.0.0.0:19730',//监听端口
    'transport'            => 'tcp',
    'context'              => [],
    'name'                 => 'd2wd',
    'count'                => cpu_count() * 2,
    'user'                 => '',
    'group'                => '',
    'pid_file'             => runtime_path() . '/d2wd.pid',//pid文件
    'stdout_file'          => runtime_path() . '/logs/stdout.log',//标准文件
    'log_file'             => runtime_path() . '/logs/d2wd.log',//日志文件
    'max_request'          => 1000000,//最大请求次数
    'max_package_size'     => 200*1024*1024,//最大包大小
];
