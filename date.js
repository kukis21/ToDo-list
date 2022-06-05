exports.getDay = function () {
    const date = new Date();
    const options = {
        day: "numeric",
        weekday: "long",
        month: "long",
        year: "numeric"
    }
    const day = date.toLocaleDateString("en-US", options);
    return day;
}