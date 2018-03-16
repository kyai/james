$(function(){
    App = new Vue({
        el: '#app',
        data: {
            list: [],
            sale: 0,
            vimg: '',
            seed: '',
            vipt: '',
            sort_name: ['RAREDEGREE','AMOUNT','CREATETIME'],
            sort_type: 'CREATETIME',
            sort_mode: 'DESC',
            // menu
            menu_list: ['market','pet','order'],
            menu: 'market',
            // user
            user: {},
            pets: []
        },
        methods: {
            login: function(){
                layer.prompt({
                    formType: 2,
                    value: '',
                    maxlength: 1000,
                    title: '请输入Baidu.com登录后的cookie',
                    area: ['300px', '100px']
                }, function(val, index){
                    Config.cookie = val
                    layer.close(index)
                    F.writeCookie()
                    F.user()
                    F.gen()
                })
            },
            logout: function(){
                F.clearCookie()
                App.user = {}
            },
            sort_click: function(v){
                if(v == this.sort_type){
                    this.sort_mode = this.sort_mode == 'ASC' ? 'DESC' : 'ASC'
                }else{
                    this.sort_mode = 'DESC'
                    this.sort_type = v
                }
                F.get()
            }
        },
        filters: {
            raredegree: function(v){
                var o = {
                    '0': '普通',
                    '1': '稀有',
                    '2': '卓越',
                    '3': '史诗',
                    '4': '神话',
                    '5': '传说'
                }
                return o[v] || ''
            },
            generation: function(v){},
            menu: function(v){
                var o = {
                    'market':   '集市',
                    'pet':      '狗窝',
                    'order':    '订单'
                }
                return o[v] || ''
            },
            sortname: function(v){
                var o = {
                    'RAREDEGREE': '稀有度',
                    'AMOUNT':     '价格',
                    'CREATETIME': '时间'
                }
                return o[v] || ''
            }
        }
    })

    Config = {}

    $.ajaxSetup({
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        timeout : 5000,
        async: true
    })

    // F.writeCookie()

    F.gen()
    F.get()
    F.user()
})

var F = {
    // 获取数据
    get: function(){
        var rdata = {
            'pageNo':           1,
            'pageSize':         20,
            'querySortType':    App.sort_type + '_' + App.sort_mode,
            'petIds':           [],
            'lastAmount':       null,
            'lastRareDegree':   null,
            'requestId':        new Date().getTime(),
            'appId':            1,
            'tpl':              '',
            'timeStamp':        null,
            'nounce':           null,
            'token':            null
        }

        $.ajax({
            type: 'POST',
            url: '/data/market/queryPetsOnSale',
            contentType: 'application/json',
            data: JSON.stringify(rdata),
            dataType: 'json',
            beforeSend:function(request){
                // request.setRequestHeader("Authorization", token)
                Load.start()
            },
            success: function (data) {
                console.log(data)
                if(data.errorNo != '00') return console.log('request error')

                App.list = data.data.petsOnSale
                App.sale = data.data.totalCount
            },
            complete: function(){
                Load.close()
            }
        })
    },
    // 验证码
    gen: function(){
        var rdata = {
            'requestId':    new Date().getTime(),
            'appId':        1,
            'tpl':          '',
            'timeStamp':    null,
            'nounce':       null,
            'token':        null
        }

        $.ajax({
            type: 'POST',
            url: '/data/captcha/gen',
            contentType: 'application/json',
            data: JSON.stringify(rdata),
            dataType: 'json',
            beforeSend:function(request){
                // request.setRequestHeader("Authorization", token)
            },
            success: function (data) {
                console.log(data)
                if(data.errorNo != '00') return console.log('request error')

                App.vimg = data.data.img
                App.seed = data.data.seed
                App.vipt = ''
            }
        })
    },
    // 购买
    buy: function(v){
        var rdata = {
            'petId':        v.petId,
            'amount':       v.amount,
            'seed':         App.seed,
            'captcha':      App.vipt,
            'validCode':    v.validCode,
            'requestId':    new Date().getTime(),
            'appId':        1,
            'tpl':          '',
            'timeStamp':    null,
            'nounce':       null,
            'token':        null
        }

        $.ajax({
            type: 'POST',
            url: '/data/txn/create',
            contentType: 'application/json',
            data: JSON.stringify(rdata),
            dataType: 'json',
            beforeSend:function(request){
                // request.setRequestHeader("Authorization", token)
            },
            success: function (data) {
                console.log(data)
                // if(data.errorNo != '00') return console.log('request error')
                layer.msg(data.errorMsg)
            },
            complete: function(){
                F.gen()
            }
        })
    },
    // 从配置写入cookie
    writeCookie: function(){
        var cookies = $.trim(Config.cookie).split(';')
        if(!cookies.length) return
        for(var k in cookies)
            document.cookie = cookies[k]
    },
    // 注销/清空cookie
    clearCookie: function() {
        var keys = document.cookie.match(/[^ =;]+(?=\=)/g)
        if(!keys.length) return
        for(var k in keys)
            document.cookie = keys[k] + '=0;expires=' + new Date(0).toUTCString()
    },
    // 账户信息
    user: function(){
        var rdata = {
            'requestId':    new Date().getTime(),
            'appId':        1,
            'tpl':          '',
            'timeStamp':    null,
            'nounce':       null,
            'token':        null
        }

        $.ajax({
            url: '/data/user/get',
            data: JSON.stringify(rdata),
            success: function (data) {
                console.log(data)
                if(data.errorNo != '00') return console.log('request error')

                App.user = data.data
            }
        })
    },
    // 我的狗狗
    pets: function(){}
}

var Load = {
    start: function(){
        layer.load(0,{shade:0.3})
    },
    close: function(){
        layer.closeAll('loading')
    }
}