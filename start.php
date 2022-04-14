<?php
require_once __DIR__ . '/vendor/autoload.php';

use Workerman\Worker;//底层socket框架
use Workerman\Protocols\Http;//http服务
use Workerman\Connection\TcpConnection;//tcp连接服务
use Webman\App;
use Webman\Config;
use Webman\Route;
use Webman\Middleware;
use Dotenv\Dotenv;
use support\Request;
use support\Log;
use support\Container;
//设置错误级别 方便查看错误
ini_set('display_errors', 'on');
error_reporting(E_ALL);

if (class_exists('Dotenv\Dotenv') && file_exists(base_path().'/.env')) {
    if (method_exists('Dotenv\Dotenv', 'createUnsafeImmutable')) {
        Dotenv::createUnsafeImmutable(base_path())->load();
    } else {
        Dotenv::createMutable(base_path())->load();
    }
}

//加载路由,控制器 排除['route', 'container']
Config::load(config_path(), ['route', 'container']);
//设置时区
if ($timezone = config('app.default_timezone')) {
    date_default_timezone_set($timezone);
}
//主机重新加载时
Worker::$onMasterReload = function (){
    //缓存机制
    if (function_exists('opcache_get_status') && $status = opcache_get_status()) {
        if (isset($status['scripts']) && $scripts = $status['scripts']) {
            foreach (array_keys($scripts) as $file) {
                opcache_invalidate($file, true);
            }
        }
    }
};

$config                               = config('server');
Worker::$pidFile                      = $config['pid_file'];
Worker::$stdoutFile                   = $config['stdout_file'];
Worker::$logFile                      = $config['log_file'];
TcpConnection::$defaultMaxPackageSize = $config['max_package_size'] ?? 10*1024*1024;

$worker = new Worker($config['listen'], $config['context']);

//绑定变量到工作环境中
$property_map = ['name','count','user','group','reusePort','transport',];
foreach ($property_map as $property) {
    if (isset($config[$property])) {
        $worker->$property = $config[$property];
    }
}
#启动服务
$worker->onWorkerStart = function ($worker) {
    require_once base_path() . '/support/bootstrap.php';
    $app = new App($worker, Container::instance(), Log::channel('default'), app_path(), public_path());
    //路由规则
    Route::load(config_path() . '/route.php');
    //加载中间件
    Middleware::load( config('middleware', []));
    //加载静态中间件
    Middleware::load(['__static__' => config('static.middleware', [])]);
    //http请求处理类
    Http::requestClass(Request::class);
    $worker->onMessage = [$app, 'onMessage'];
};

// Windows does not support custom processes.
if (\DIRECTORY_SEPARATOR === '/') {
    foreach (config('process', []) as $process_name => $config) {
        $worker = new Worker($config['listen'] ?? null, $config['context'] ?? []);
        //绑定变量到工作环境中
        $property_map = ['count','user','group','reloadable','reusePort','transport','protocol',];
        $worker->name = $process_name;
        foreach ($property_map as $property) {
            if (isset($config[$property])) {
                $worker->$property = $config[$property];
            }
        }

        $worker->onWorkerStart = function ($worker) use ($config) {
            require_once base_path() . '/support/bootstrap.php';
            foreach ($config['services'] ?? [] as $server) {
                if (!class_exists($server['handler'])) {
                    echo "process error: class {$server['handler']} not exists\r\n";
                    continue;
                }
                $listen = new Worker($server['listen'] ?? null, $server['context'] ?? []);
                if (isset($server['listen'])) {
                    echo "listen: {$server['listen']}\n";
                }
                $instance = Container::make($server['handler'], $server['constructor'] ?? []);
                worker_bind($listen, $instance);
                $listen->listen();
            }

            if (isset($config['handler'])) {
                if (!class_exists($config['handler'])) {
                    echo "process error: class {$config['handler']} not exists\r\n";
                    return;
                }
                $instance = Container::make($config['handler'], $config['constructor'] ?? []);
                worker_bind($worker, $instance);
            }

        };
    }
}
//运行服务
Worker::runAll();
