# 框架的说明
### 1.使用webman实现高性能 http服务
    为什么选择 webman  
        1.性能足够 webman基于wokeman(在liunx下使用epoll)所以能保证很高的并发性能
        2.方便调试 可以在windows下轻松开发,liunx 支持reload start stop 等操作
        3.webman本身已经是框架级别 不需要自行开发一些基础功能 规范更友好些
    为什么选择 webman 不选择swoole 
        1.swoole在windows下难以调试
        2.swoole的代码是c++ 如果出问题,解决成本比较高昂
        3.swoole在web的应用比较稀少
    
    优点是支持windows 下调试 
    正式环境一般都是liunx系统 

# 数据库的选择
### mysql
    mysql 优点
        1.使用成本低。MySQL是开源的，且提供免费版本，对大多数用户来说大大降低了使用成本
        2.使用容易。与其他大型数据库的设置和管理相比，其复杂程度较低，易于使用
        3.性能对于中小型项目足够
    mysql 缺点
        1.大型系统单个mysql无法支撑,集群后会增加逻辑复杂度,分库分表属于常规操作
        2.nosql问题解决不佳
### redis
    redis 优点
    1.基于内存存储数据 有点是存储读取都非常快速 每秒可以处理超过10万次读写操作
    2.支持丰富数据类型: String ,List,Set,Sorted Set,Hash
    redis 缺点
        1.内存特性断电丢数据 
        2.redis是单进程的 无法充分使用CPU多核性能



# webman 模板引擎选择
    think-template 应为比较熟悉文档是中文的方便使用
# 跨站点登陆问题 
    例如 www.d2wd.com,bbs.d2wd.com使用redis存储session来实现一站式登陆
# UI组件库打算自行开发 
    好看的ui 可以直接抄 不太懂npm+nodejs的方案 不需要那么多东西 https://ant.design
