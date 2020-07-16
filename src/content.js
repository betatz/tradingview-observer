function RGBToHex(rgb) {
    var regexp = /[0-9]{0,3}/g;
    var re = rgb.match(regexp);//利用正则表达式去掉多余的部分，将rgb中的数字提取
    var hexColor = "#";
    var hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
    for (var i = 0; i < re.length; i++) {
        var r = null, c = re[i], l = c;
        var hexAr = [];
        while (c > 16) {
            r = c % 16;
            c = (c / 16) >> 0;
            hexAr.push(hex[r]);
        }
        hexAr.push(hex[c]);
        if (l < 16 && l != "") {
            hexAr.push(0)
        }
        hexColor += hexAr.reverse().join('');
    }
    //alert(hexColor)
    return hexColor;
};

function allCaps(str) {
    var tab = new Array();
    var strCount = str.length;
    for (var i = 0; i < str.length; i++) {
        var c = str[i];
        if (c < 'A' || c > 'Z') {
        } else {
            // console.log(c);
            tab.push(c)
        };
    };
    //var string = tab.join(tab);
    return tab.join("")
};

function readIndicatorData() {
    var indicatorsCount = document.querySelectorAll(' div.chart-data-window > div').length;
    console.log('指标的个数', indicatorsCount);

    var tab = {};
    tab['datetime'] = document.querySelectorAll('div.chart-data-window-body>div>div.chart-data-window-item-value')[0].innerText + ' ' + document.querySelectorAll('div.chart-data-window-body>div>div.chart-data-window-item-value')[1].innerText
    tab['ex'] = document.querySelectorAll('div.chart-data-window-header>span')[1].outerText.split(",")[1]

    var b = 2;
    for (var i = 1; i < indicatorsCount; i++) {
        //取得标题
        // console.log('值', i);
        //取得标题
        var x = document.querySelectorAll('div.chart-data-window-header')[i].children[0].title;
        // tab.push({name: x});
        //取得数量
        var y = document.querySelectorAll('div.chart-data-window-body')[i].children.length;
        //console.log(y)
        //取得指标的的大写字母 缩写
        var capsStr = allCaps(x)
        for (var k = 0; k < y; k++) {
            //取出值
            //  console.log("K的值为", k);
            //console.log("i",i,"k",k)
            // console.log(b)

            var indicatorsName = document.querySelectorAll('div.chart-data-window-body>div>div.chart-data-window-item-title')[b].innerText;//指标的参数名
            var indicatorsValue = document.querySelectorAll('div.chart-data-window-body>div>div.chart-data-window-item-value')[b].innerText;//指标的参数值
            var indicatorscolor = RGBToHex(document.querySelectorAll('div.chart-data-window-body>div>div.chart-data-window-item-value')[b].children[0].style.color)
            //console.log("指标的参数名",indicatorsName,"指标的参数值",indicatorsValue);
            if (!tab[capsStr + indicatorsName]) {
                tab[capsStr + indicatorsName] = { value: indicatorsValue, name: capsStr, color: indicatorscolor };
            } else {
                tab[capsStr + indicatorsName + k] = { value: indicatorsValue, name: capsStr, color: indicatorscolor };
            };
            b++
        }
    }
    console.log(tab);
    if (ws) {
        ws.send(JSON.stringify(tab));
    }
    return tab;
    
}

function handleChartDataWindow(chartDataWindow) { 
    console.log('hello chart data');
    readIndicatorData();
 }

// set up the mutation observer
var observer = new MutationObserver(function (mutations, me) {
    // `mutations` is an array of mutations that occurred
    // `me` is the MutationObserver instance
    var chartDataWindowList = document.getElementsByClassName('chart-data-window');
    if (chartDataWindowList) {
        me.disconnect(); // stop observing
        handleChartDataWindow(chartDataWindowList);
        return;
    }
});

var ws;

function connectServer() {
    ws = new WebSocket('ws://127.0.0.1:18888/upload');
    ws.onopen = function(event) {
        console.log('Server connected!');
    };
    ws.onmessage = function(event) {
        console.log('received data');
        console.log(event.data);
    };
    ws.onclose = function(event) {
        console.log(event);
        console.log('closed');
        setTimeout(function () {
            connectServer();
        }, 3000);
    };
    ws.onerror = function(event) {
        console.log('error');
        ws.close();
    };
}

// connectServer();

// // start observing
// setTimeout(function() {
//     observer.observe(document, {
//         childList: true,
//         subtree: true
//     });
// }, 20000);

var checkDataWindow = function() {
    console.log('checking data window.');
    var dataWindowList = document.querySelectorAll('div.active > div.widgetbar-widget-datawindow');
    
    if (dataWindowList.length > 0) {
        console.log('Data window available.');
    } else {
        console.log('Data window unavailable.');
    }

    setTimeout(function () {
        checkDataWindow();
    }, 5000);
};

checkDataWindow();