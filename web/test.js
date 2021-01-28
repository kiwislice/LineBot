

var date = new Date();
var today = new Date(date.getFullYear(), date.getMonth() + 1, 0);
var lastWeekDay = today.getDate() - (today.getDay() == 0 ? 7 : today.getDay() - 1);
console.log(`date=${date}`);
console.log(`today=${today}`);
console.log(`today.getDate()=${today.getDate()}`);
console.log(`today.getDay()=${today.getDay()}`);
console.log(`lastWeekDay=${lastWeekDay}`);

if (lastWeekDay <= date.getDate()) {
    console.log('aaaaaa');
}

function getLastWorkWeekMonday(week) {
    // today.getDate() - today.getDay() + 1;
    var lastWeekDay = 31 - week + 1;
    // var lastWeekDay = 31 - (week == 0 ? 6 : week - 1);
    return lastWeekDay;
}


for (var i = 0; i < 7; i++) {
    var lastWeekDay = getLastWorkWeekMonday(i);
    console.log(`31日星期${i}時，lastWeekDay=${lastWeekDay}`);
}
