function handleChartDataWindow(chartDataWindow) { 
    console.log('hello chart data');
    alert('hello chart data');
 }

// set up the mutation observer
var observer = new MutationObserver(function (mutations, me) {
    // `mutations` is an array of mutations that occurred
    // `me` is the MutationObserver instance
    var chartDataWindowList = document.getElementsByClassName('chart-data-window');
    if (chartDataWindowList) {
        handleChartDataWindow(chartDataWindowList);
        me.disconnect(); // stop observing
        return;
    }
});

// start observing
observer.observe(document, {
    childList: true,
    subtree: true
});