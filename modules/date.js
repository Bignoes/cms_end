module.exports.date = function getCurrentTime() {
    var current = new Date()
    var time = []
    time[0] = current.getFullYear()
    time[1] = current.getMonth() + 1
    time[2] = current.getDate()

    var current_time = time.join('-')

    current_time += ' ' + current.getHours() + ':' + current.getMinutes() + ':' + current.getSeconds()

    return current_time
}