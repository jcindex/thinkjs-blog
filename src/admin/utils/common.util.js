
//去除了o O 0三个易混淆的字母
var defaultChars = "abcdefghijklmnpqrstuvwxyz123456789ABCDEFGHIJKLMNPQRSTUVWXYZ";
var charsLen = defaultChars.length;

export default {
    getValidateCode: (count) => {
        count = count || 4;
        let str = "";
        for(let i = 0;i < count;i++) {
            let idx = parseInt(Math.random() * charsLen);
            str += defaultChars[idx];
        }
        return str;
    }
}