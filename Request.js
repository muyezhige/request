// http://www.travisup.com/post/index/28

var Request = {
    // 生成时间戳
    now : function(){
        return (new Date()).getTime();
    },
    // 数据转化成url
    parseData : function(data){
        var str = "";
        if(typeof data === "string"){
            str = data;
        }else{
            // json格式
            for(var key in data){
                str += "&" + key + "=" + encodeURIComponent(data[key]);
            }
        }
        // 加时间戳，防止缓存
        str += "&_time=" + this.now();
        str = str.substr(1);
        return str;
    },
    // 创建XHR实例。
    createXhr: function(){
        var xhrhttp = null;
        if(window.XMLHttpRequest){
            xhrhttp = new XMLHttpRequest();
        }else{
            xhrhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        return xhrhttp;
    },
    // 异步请求
    ajax: function(opt){
        var opts = opt || {},
            url = opts.url || "",
            type = (opts.type || "get").toLowerCase(),
            async = opts.async || true,
            params = this.parseData(opts.data),
            sendstr = null;

        if(type == "get"){
            url = url + "?=" + params;
        }else{
            sendstr = params;
        }

        var xhr = this.createXhr();
        xhr.open(type, url, async);
        // 监听状态改变并触发事件。
        xhr.onreadystatechange = function(){
            // 当请求状态readyState 等于 4 且服务器http状态码为 200 时，表示响应已就绪：
            if(xhr.readyState == 4){
                if(xhr.status == 200){
                    opts.success && opts.success(xhr.responseText);
                }else{
                    opts.error && opts.error(xhr.status);
                }
            }
        };
        // POST需要设置请求头部
        if(type == "post"){
            xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded"); 
        }
        // get请求，sendstr = null;
        xhr.send(sendstr);
    },
    // 删除节点
    removeElement: function(ele){
        var parent = ele.parentNode;
        if(parent && parent.nodeType == 1){
            parent.removeChild(ele);
        }
    },
    // 跨域jsonp请求
    jsonp: function (url, data, funs){
        var backname;

        url += (url.indexOf("?") == -1 ? "?" : "&") + this.parseData(data);

        var match = url.match(/callback=(\w+)/);

        if(match && match[1]){
            backname = match[1];
        }else{
            //如果未定义函数名,则随机成一个函数名
            backname = "jsonp_" + this.now();

            // 传入callback
            url += "&callback=" + backname;
        }

        var script = document.createElement("script");
            script.type = "text/javascript";
            script.src = url;

        // 远程回调函数，设置成全局可调用。
        window[backname] = function(data){
            // 执行后销毁，
            window[backname] = undefined;
            // 删除生成的script标签，防止污染DOM
            Request.removeElement(script);
            // 执行回调。
            funs(data);
        };
        // 在head里面插入script元素
        document.head.appendChild(script);
    }
};

// 执行请求
Request.ajax({
    url: familyRankUrl,
    type: "post",
    data: {
        page_no: 1,
        pageRows: 15,
        type: "best"
    },
    async: true,
    success: function(res){
    },
    error: function(ex){
    }
});

// 跨域请求
Request.jsonp(urlConfig.platformUrl, {callback: "jsonp_call_back"}, function(res){
    console.log(res);
});
