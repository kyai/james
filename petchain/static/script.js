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
            pet_list: [],
            order_list: []
        },
        watch: {
            menu: function(v){
                switch(v){
                    case 'market':
                        F.get()
                        break
                    case 'pet':
                        F.pet()
                        break
                    case 'order':
                        F.order()
                        break
                }
            }
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
                    Cookie.write()
                    F.user()
                    F.gen()
                })
            },
            logout: function(){
                Cookie.clear()
                App.user = {}
            },
            menu_click: function(v){
                this.menu = v
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
            // 订单状态
            status: function(v){
                var o = {
                    '1': '已卖出',
                    '2': '已买入'
                }
                return o[v] || ''
            },
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

        ajax('/data/market/queryPetsOnSale', rdata, {
            success: function (data) {
                console.log(data)
                if(data.errorNo != '00') return console.log('request error')

                App.list = data.data.petsOnSale
                App.sale = data.data.totalCount
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

        ajax('/data/captcha/gen', rdata, {
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

        ajax('/data/txn/create', rdata, {
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

        ajax('/data/user/get', rdata, {
            success: function(data){
                console.log(data)
                if(data.errorNo != '00') return console.log('request error')

                App.user = data.data
            }
        })
    },
    // 狗窝
    pet: function(){
        var rdata = {
            'pageNo':       1,
            'pageSize':     10,
            'pageTotal':    -1,
            'requestId':    new Date().getTime(),
            'appId':        1,
            'tpl':          '',
            'timeStamp':    null,
            'nounce':       null,
            'token':        null
        }

        ajax('/data/user/pet/list', rdata, {
            success: function(d){
                console.log(d)
                if(d.errorNo != '00') return console.log('request error')
                App.pet_list = d.data.dataList
            }
        })
    },
    // 订单
    order: function(){
        var rdata = {
            'pageNo':       1,
            'pageSize':     10,
            'pageTotal':    -1,
            'requestId':    new Date().getTime(),
            'appId':        1,
            'tpl':          '',
            'timeStamp':    null,
            'nounce':       null,
            'token':        null
        }

        ajax('/data/user/order/list', rdata, {
            success: function(d){
                console.log(d)
                if(d.errorNo != '00') return console.log('request error')
                App.order_list = d.data.dataList
            }
        })
    }
}

var ajax = function(url, data, obj){
    $.ajax({
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        timeout : 5000,
        async: true,
        url: url,
        data: JSON.stringify(data),
        beforeSend: obj.before || function(){Load.start()},
        complete: obj.complete || function(){Load.close()},
        success: obj.success || function(){},
        error: obj.error || function(){}
    })
}

var Cookie = {
    // 从配置写入cookie
    write: function(){
        var cookies = $.trim(Config.cookie).split(';')
        if(!cookies.length) return
        for(var k in cookies)
            document.cookie = cookies[k]
    },
    // 注销/清空cookie
    clear: function() {
        var keys = document.cookie.match(/[^ =;]+(?=\=)/g)
        if(!keys.length) return
        for(var k in keys)
            document.cookie = keys[k] + '=0;expires=' + new Date(0).toUTCString()
    }
}

var Load = {
    start: function(){
        if(window.LL) return
        window.LL = layer.load(0,{shade:0.3})
    },
    close: function(){
        layer.close(window.LL)
        window.LL = 0
    }
}