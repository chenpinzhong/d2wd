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

namespace Webman;

use DTS\eBaySDK\Trading\Types\VATRateType;
use Workerman\Worker;
use Workerman\Timer;
use Workerman\Connection\TcpConnection;
use Webman\Http\Request;
use Webman\Http\Response;
use Webman\Route\Route as RouteObject;
use Webman\Exception\ExceptionHandlerInterface;
use Webman\Exception\ExceptionHandler;
use Webman\Config;
use FastRoute\Dispatcher;
use Psr\Container\ContainerInterface;
use Monolog\Logger;

/**
 * Class App
 * @package Webman
 */
class App
{

    /**
     * @var bool
     */
    protected static $_supportStaticFiles = true;

    /**
     * @var bool
     */
    protected static $_supportPHPFiles = false;

    /**
     * @var array
     */
    protected static $_callbacks = [];

    /**
     * @var Worker
     */
    protected static $_worker = null;

    /**
     * @var ContainerInterface
     */
    protected static $_container = null;

    /**
     * @var Logger
     */
    protected static $_logger = null;

    /**
     * @var string
     */
    protected static $_appPath = '';

    /**
     * @var string
     */
    protected static $_publicPath = '';

    /**
     * @var string
     */
    protected static $_configPath = '';

    /**
     * @var TcpConnection
     */
    protected static $_connection = null;

    /**
     * @var Request
     */
    protected static $_request = null;

    /**
     * @var int
     */
    protected static $_maxRequestCount = 1000000;

    /**
     * @var int
     */
    protected static $_gracefulStopTimer = null;


    protected $app='';//模块
    protected $controller='';//控制器
    protected $action='';//方法


    /**
     * App constructor.
     * @param Worker $worker
     * @param $container
     * @param $logger
     * @param $app_path
     * @param $public_path
     */
    public function __construct(Worker $worker, $container, $logger, $app_path, $public_path)
    {
        static::$_worker = $worker;
        static::$_container = $container;
        static::$_logger = $logger;
        static::$_publicPath = $public_path;
        static::$_appPath = \realpath($app_path);

        $max_requst_count = (int)Config::get('server.max_request');
        if ($max_requst_count > 0) {
            static::$_maxRequestCount = $max_requst_count;
        }
        static::$_supportStaticFiles = Config::get('static.enable', true);
        static::$_supportPHPFiles = Config::get('app.support_php_files', false);
    }

    /**
     * @param TcpConnection $connection
     * @param Request $request
     * @return null
     */
    public function onMessage(TcpConnection $connection, $request)
    {
        static $request_count = 0;
        if (++$request_count > static::$_maxRequestCount) {
            static::tryToGracefulExit();
        }

        try {
            static::$_request = $request;
            static::$_connection = $connection;

            $path = $request->path();
            $key = $request->method().$path;


            //缓存方法
            /*
            if (isset(static::$_callbacks[$key])) {
                list($callback, $request->app, $request->controller, $request->action) = static::$_callbacks[$key];
                static::send($connection, $callback($request), $request);
                return null;
            }
            */
            //得到 模块/控制器/方法
            $controller_and_action = static::parseControllerAction($path);
            $app = $controller_and_action['app'];
            $controller = $controller_and_action['controller'];
            $action = $controller_and_action['action'];
            $instance = $controller_and_action['instance'];

            if (static::findFile($connection, $path, $key, $request)) {
                return null;
            }

            if (static::findRoute($connection, $path, $key, $request)) {
                return null;
            }
            if (empty($controller_and_action['action_real']) || Route::hasDisableDefaultRoute()) {
                //如果控制器不存在 就直接访问视图文件
                if (empty($controller_and_action['action_real'])){
                    //判断视图文件是否存在
                    $view_path = $this->app === '' ? \app_path() . '/view/' : \app_path(). "/$this->app/view/";
                    $view_file=$view_path.'/'.$this->controller.'/'.$this->action.'.html';
                    if(file_exists($view_file)){
                        $callback = static::getCallback($app, $controller_and_action,true);
                        static::$_callbacks[$key] = [$callback, $app, $controller, $action];
                        static::send($connection, $callback($request), $request);
                        return null;
                    }
                }
                $callback = static::getFallback();
                $request->app = $request->controller = $request->action = '';
                static::$_callbacks[$key] = [$callback, $app, $controller, $action];
                static::send($connection, $callback($request), $request);
                return null;
            }
            $callback = static::getCallback($app, [$instance, $action]);
            static::$_callbacks[$key] = [$callback, $app, $controller, $action];
            //发送数据
            static::send($connection, $callback($request), $request);
        } catch (\Throwable $e) {
            static::send($connection, static::exceptionResponse($e, $request), $request);
        }
        return null;
    }

    /**
     * @return \Closure
     */
    protected static function getFallback() {
        // when route, controller and action not found, try to use Route::fallback
        return Route::getFallback() ?: function () {
            return new Response(404, [], \file_get_contents(static::$_publicPath . '/404.html'));
        };
    }

    /**
     * @param \Throwable $e
     * @param $request
     * @return string|Response
     */
    protected static function exceptionResponse(\Throwable $e, $request)
    {
        try {
            $app = $request->app ?: '';
            $exception_config = Config::get('exception');
            $default_exception = $exception_config[''] ?? ExceptionHandler::class;
            $exception_handler_class = $exception_config[$app] ?? $default_exception;

            /** @var ExceptionHandlerInterface $exception_handler */
            $exception_handler = static::$_container->make($exception_handler_class, [
                'logger' => static::$_logger,
                'debug' => Config::get('app.debug')
            ]);
            $exception_handler->report($e);
            $response = $exception_handler->render($request, $e);
            return $response;
        } catch (\Throwable $e) {
            return Config::get('app.debug') ? (string)$e : $e->getMessage();
        }
    }

    /**
     * @param $app
     * @param $call
     * @param bool $is_view
     * @param null $args
     * @param bool $with_global_middleware
     * @param null $route
     * @return \Closure|mixed
     */
    protected static function getCallback($app, $call,$is_view=false, $args = null, $with_global_middleware = true, $route = null)
    {
        $args = $args === null ? null : \array_values($args);
        $middleware = Middleware::getMiddleware($app, $with_global_middleware);
        $middleware = $route ? \array_merge($route->getMiddleware(), $middleware) : $middleware;
        if ($middleware) {
            $callback = array_reduce($middleware, function ($carry, $pipe) {
                return function ($request) use ($carry, $pipe) {
                    return $pipe($request, $carry);
                };
            }, function ($request) use ($call, $args,$is_view) {
                //如果是视图文件 就提前返回
                if($is_view){
                    $request->app=$call['app'];
                    $request->controller=$call['controller'];
                    $request->action=$call['action'];
                    return view($call['controller'].'/'.$call['action']);
                }

                try {
                    if ($args === null) {
                        $response = $call($request);
                    } else {
                        $response = $call($request, ...$args);
                    }
                } catch (\Throwable $e) {
                    return static::exceptionResponse($e, $request);
                }
                if (\is_scalar($response) || null === $response) {
                    $response = new Response(200, [], $response);
                }
                return $response;
            });
        } else {
            if ($args === null) {
                $callback = $call;
            } else {
                $callback = function ($request) use ($call, $args) {
                    return $call($request, ...$args);
                };
            }
        }
        return $callback;
    }

    /**
     * @return ContainerInterface
     */
    public static function container()
    {
        return static::$_container;
    }

    /**
     * @return Request
     */
    public static function request()
    {
        return static::$_request;
    }

    /**
     * @return TcpConnection
     */
    public static function connection()
    {
        return static::$_connection;
    }

    /**
     * @return Worker
     */
    public static function worker()
    {
        return static::$_worker;
    }

    /**
     * @param $connection
     * @param $path
     * @param $key
     * @param Request $request
     * @return bool
     */
    protected static function findRoute($connection, $path, $key, Request $request)
    {
        $ret = Route::dispatch($request->method(), $path);
        if ($ret[0] === Dispatcher::FOUND) {
            $ret[0] = 'route';
            $callback = $ret[1]['callback'];
            $route = $ret[1]['route'];
            $app = $controller = $action = '';
            $args = !empty($ret[2]) ? $ret[2] : null;
            if (\is_array($callback) && isset($callback[0]) && $controller = \get_class($callback[0])) {
                $app = static::getAppByController($controller);
                $action = static::getRealMethod($controller, $callback[1]) ?? '';
            }
            $callback = static::getCallback($app, $callback, $args, true, $route);
            static::$_callbacks[$key] = [$callback, $app, $controller ? $controller : '', $action];
            list($callback, $request->app, $request->controller, $request->action) = static::$_callbacks[$key];
            static::send($connection, $callback($request), $request);
            if (\count(static::$_callbacks) > 1024) {
                static::clearCache();
            }
            return true;
        }
        return false;
    }


    /**
     * @param $connection
     * @param $path
     * @param $key
     * @param $request
     * @return bool
     */
    protected static function findFile($connection, $path, $key, $request)
    {
        $public_dir = static::$_publicPath;
        $file = \realpath("$public_dir/$path");
        if (false === $file || false === \is_file($file)) {
            return false;
        }

        // Security check
        if (strpos($file, $public_dir) !== 0) {
            static::send($connection, new Response(400), $request);
            return true;
        }
        if (\pathinfo($file, PATHINFO_EXTENSION) === 'php') {
            if (!static::$_supportPHPFiles) {
                return false;
            }
            static::$_callbacks[$key] = [function ($request) use ($file) {
                return static::execPhpFile($file);
            }, '', '', ''];
            list($callback, $request->app, $request->controller, $request->action) = static::$_callbacks[$key];
            static::send($connection, static::execPhpFile($file), $request);
            return true;
        }

        if (!static::$_supportStaticFiles) {
            return false;
        }

        static::$_callbacks[$key] = [static::getCallback('__static__', function ($request) use ($file) {
            \clearstatcache(true, $file);
            if (!\is_file($file)) {
                $callback = static::getFallback();
                return $callback($request);
            }
            return (new Response())->file($file);
        }, null, false), '', '', ''];
        list($callback, $request->app, $request->controller, $request->action) = static::$_callbacks[$key];
        static::send($connection, $callback($request), $request);
        return true;
    }

    /**
     * @param TcpConnection $connection
     * @param $response
     * @param Request $request
     */
    protected static function send(TcpConnection $connection, $response, Request $request)
    {
        $keep_alive = $request->header('connection');
        if (($keep_alive === null && $request->protocolVersion() === '1.1')
            || $keep_alive === 'keep-alive' || $keep_alive === 'Keep-Alive'
        ) {
            $connection->send($response);
            return;
        }
        $connection->close($response);
    }

    /**
     * @param $path
     * @return array|bool
     */
    protected function parseControllerAction($path)
    {
        //模块/控制器/方法
        $explode = \explode('/', $path);
        $this->app = $this->controller = $this->action = 'index';
        if (!empty($explode[1]))$this->app = $explode[1];
        if (!empty($explode[2]))$this->controller = $explode[2];
        if (!empty($explode[3]))$this->action = $explode[3];

        $controller_class = "app\\$this->app\\controller\\$this->controller";
        $action_real='';
        $instance='';
        if (static::loadController($controller_class) && \is_callable([$instance = static::$_container->get($controller_class), $this->action])) {
            $controller_class = \get_class($instance);
            $action_real=static::getRealMethod($controller_class, $this->action);
            $instance=static::$_container->get($controller_class);
        }
        return [
            'app'               => $this->app,
            'controller'        => $this->controller,
            'action'            => $this->action,
            'controller_class'  => $controller_class,
            'action_real'       => $action_real,
            'instance'          => $instance,
        ];
    }

    /**
     * @param $controller_class
     * @return bool
     */
    protected static function loadController($controller_class)
    {
        static $controller_files = [];
        if (empty($controller_files)) {
            $app_path = static::$_appPath;
            $dir_iterator = new \RecursiveDirectoryIterator($app_path);
            $iterator = new \RecursiveIteratorIterator($dir_iterator);
            $app_base_path_length = \strrpos($app_path, DIRECTORY_SEPARATOR) + 1;
            foreach ($iterator as $spl_file) {
                $file = (string)$spl_file;
                if (\is_dir($file) || false === \strpos($file, '/controller/') || $spl_file->getExtension() !== 'php') {
                    continue;
                }
                $controller_files[$file] = \str_replace(DIRECTORY_SEPARATOR, "\\", \strtolower(\substr(\substr($file, $app_base_path_length), 0, -4)));
            }
        }

        if (\class_exists($controller_class)) {
            return true;
        }

        $controller_class = \strtolower($controller_class);
        if ($controller_class[0] === "\\") {
            $controller_class = \substr($controller_class, 1);
        }
        foreach ($controller_files as $real_path => $class_name) {
            if ($class_name === $controller_class) {
                require_once $real_path;
                if (\class_exists($controller_class, false)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * @param $controller_calss
     * @return string
     */
    protected static function getAppByController($controller_calss)
    {
        if ($controller_calss[0] === '\\') {
            $controller_calss = \substr($controller_calss, 1);
        }
        $tmp = \explode('\\', $controller_calss, 3);
        if (!isset($tmp[1])) {
            return '';
        }
        return $tmp[1] === 'controller' ? '' : $tmp[1];
    }

    /**
     * @param $file
     * @return string
     */
    public static function execPhpFile($file)
    {
        \ob_start();
        // Try to include php file.
        try {
            include $file;
        } catch (\Exception $e) {
            echo $e;
        }
        return \ob_get_clean();
    }

    /**
     * Clear cache.
     */
    public static function clearCache()
    {
        static::$_callbacks = [];
    }

    /**
     * @param $class
     * @param $method
     * @return string
     */
    protected static function getRealMethod($class, $method)
    {

        $method = \strtolower($method);
        $methods = \get_class_methods($class);
        $included_files = get_included_files();
        foreach ($methods as $candidate) {
            if (\strtolower($candidate) === $method) {
                return $candidate;
            }
        }
        return $method;
    }

    /**
     * @return void
     */
    protected static function tryToGracefulExit()
    {
        if (static::$_gracefulStopTimer === null) {
            static::$_gracefulStopTimer = Timer::add(rand(1, 10), function () {
                if (\count(static::$_worker->connections) === 0) {
                    Worker::stopAll();
                }
            });
        }
    }
}
