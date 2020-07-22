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

var prevTimeText = {date: '', time: ''};
var startTime;



const uploadData = function(data, timeout) {

};

const parseIndicators = function() {
    const indicatorsCount = document.querySelectorAll(' div.chart-data-window > div').length;
    const indicatorData = [];

    var index = 2;
    for (var i = 1; i < indicatorsCount; i++) {
        const title = document.querySelectorAll('div.chart-data-window-header')[i].children[0].title;
        const params = [];

        const bodyCount = document.querySelectorAll('div.chart-data-window-body')[i].children.length;
        for (var j = 0; j < bodyCount; j++) {
            var paramName = document.querySelectorAll('div.chart-data-window-body>div>div.chart-data-window-item-title')[index].innerText;//指标的参数名
            var paramValue = document.querySelectorAll('div.chart-data-window-body>div>div.chart-data-window-item-value')[index].innerText;//指标的参数值
            var paramColor = RGBToHex(document.querySelectorAll('div.chart-data-window-body>div>div.chart-data-window-item-value')[index].children[0].style.color)
            
            params.push({name: paramName, value: paramValue, color: paramColor});

            index += 1;
        }
        indicatorData.push({name: title, params: params});
    }

    return indicatorData;
};

const parseDateTime = function() {
    const titleList = document.querySelectorAll('div.chart-data-window-body>div>div.chart-data-window-item-title');
    const itemList = document.querySelectorAll('div.chart-data-window-body>div>div.chart-data-window-item-value');
    var dateText = null;
    var timeText = '';
    if (titleList.length > 0 && itemList.length > 0) {
        if (titleList.item(0).innerText.toLowerCase() === 'date') {
            dateText = itemList.item(0).innerText;
        }
    }

    if (titleList.length > 1 && itemList.length > 1) {
        if (titleList.item(1).innerText.toLowerCase() === 'time') {
            timeText = itemList.item(1).innerText;
        }
    }

    if (dateText) {
        return {date: dateText, time: timeText};
    }

    return null;
};

const parseInterval = function(intervalStr) {
    var times = 1000 * 60;
    intervalStr = intervalStr.toLowerCase();
    var numStr = intervalStr;
    var endPos = intervalStr.length;
    if (intervalStr.lastIndexOf('h') != -1) {
        endPos = intervalStr.lastIndexOf('h');
        times = 1000 * 60 * 60;
    } else if (intervalStr.lastIndexOf('d') != -1) {
        endPos = intervalStr.lastIndexOf('d');
        times = 1000 * 60 * 60 * 24;
    } else if (intervalStr.lastIndexOf('w') != -1) {
        endPos = intervalStr.lastIndexOf('w');
        times = 1000 * 60 * 60 * 24 * 7;
    } else if (intervalStr.lastIndexOf('m') != -1) {
        endPos = intervalStr.lastIndexOf('m');
        times = 1000 * 60 * 60 * 24 * 7 * 30;
    }

    numStr = intervalStr.substring(0, endPos);
    const num = parseInt(numStr);
    if (!isNaN(num)) {
        return num * times;
    } else {
        return NaN;
    }
};

const parseBaseInfo = function() {
    const headerList = document.querySelectorAll('div.chart-data-window-header>span');
    if (headerList.length > 1) {
        const title = headerList.item(1).innerText;
        const titleList = title.split(', ');
        if (titleList.length === 3) {
            const interval = parseInterval(titleList[1]);
            if (!isNaN(interval)) {
                return { symbol: titleList[0], exchange: titleList[2], interval: interval };
            }
        }
    }

    return null;
}


const checkDataThenUpload = function() {
    console.log('Checking data');
    var interval = 1000;

    var dataWindowList = document.querySelectorAll('div.active > div.widgetbar-widget-datawindow div.chart-data-window>div');
    if (dataWindowList.length > 0) {
        const baseInfo = parseBaseInfo();
        console.log(baseInfo);

        const dateTime = parseDateTime();
        console.log(dateTime);
        
        const indicators = parseIndicators();
        console.log(indicators);
    } else {
        interval = 3000;
    }

    setTimeout(function() {
        checkDataThenUpload();
    }, interval);
}

const startCheck = function() {
    setTimeout(function() {
        startTime = new Date().getTime();
        checkDataThenUpload();
    }, 1000 * 10)
};

startCheck();