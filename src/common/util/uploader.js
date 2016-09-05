import fs from 'fs';
import path from "path";
import moment from "moment";
import request from "request";

import commonUtil from "./common.util";

export default class Uploader {

    constructor(thinkjs, fileField, config, type = 'upload') {
        this.thinkjs = thinkjs;
        this.fileField = fileField;
        this.config = think.extend({}, {
            maxSize: 2 * 1024 * 1024,   //默认大小为2MB
            savePath: think.RESOURCE_PATH
                + think.sep + "upload" + think.sep,
            oriName: 'default_original_name',
            ext: "default",
            name: "",
            fileName: "",
            pathFormat: 'YYMMDDHHmmss'
        }, config);
        this.type = type;
        if(type ===  'remote') {
            this.saveRemote();
        } else if(type === 'base64') {
            this.upBase64();
        } else {
            this.upFile();
        }
        this.stateMap = {
            "SUCCESS_FILE_MOVE": "文件保存成功",
            "EMPTY_FILE": "上传文件为空",
            "ERROR_TMP_FILE": "临时文件错误",
            "ERROR_TMP_FILE_NOT_FOUND": "找不到临时文件",
            "ERROR_SIZE_EXCEED": "文件大小超出网站限制",
            "ERROR_TYPE_NOT_ALLOWED": "文件类型不允许",
            "ERROR_CREATE_DIR": "目录创建失败",
            "ERROR_DIR_NOT_WRITEABLE": "目录没有写权限",
            "ERROR_FILE_MOVE": "文件保存时出错",
            "ERROR_FILE_NOT_FOUND": "找不到上传文件",
            "ERROR_WRITE_CONTENT": "写入文件内容错误",
            "ERROR_UNKNOWN": "未知错误",
            "ERROR_DEAD_LINK": "链接不可用",
            "ERROR_HTTP_LINK": "链接不是http链接",
            "ERROR_HTTP_CONTENTTYPE": "链接contentType不正确"
        };
        this.stateMap['ERROR_TYPE_NOT_ALLOWED'] = iconv('unicode', 'utf-8', this.stateMap['ERROR_TYPE_NOT_ALLOWED']);
    }
    saveRemote() {
        let imgUrl = commonUtil.htmlspecialchars(this.fileField);
        imgUrl = imgUrl.replace("&amp;", "&", imgUrl);

        //http 开头验证
        if(imgUrl.indexOf("http") !== 0) {
            this.stateInfo = this.getStateInfo("ERROR_HTTP_LINK");
            return;
        }

        request(imgUrl, function(err, res, body) {
            if(err || (res.statusCode !== 200
                && res.statusCode !== 304)) {
                this.stateInfo = this.getStateInfo("ERROR_DEAD_LINK");
                return;
            }
            let fileName = imgUrl.substr(imgUrl.lastIndexOf(think.sep) + 1);
            let fileType = fileName.substr(fileName.lastIndexOf(".") + 1);
            if(this.config.allowFiles.indexOf(fileType) === -1) {
                this.stateInfo = this.getStateInfo("ERROR_HTTP_CONTENTTYPE");
                return;
            }
            let matches = imgUrl.match(/[\/]([^\/]*)[\.]?[^\.\/]*$/);
            this.oriName = matches ? matches[1] : "";
            this.fileSize = body.length;
            this.fileType = this.getFileExt() || fileType;
            this.fullName = this.getFullName();
            this.filePath =this.getFilePath();
            this.fileName = this.getFileName();
            let dirname = path.dirname(this.filePath);
            //检查文件大小是否超出限制
            if(!this.checkSize()) {
                this.stateInfo = this.getStateInfo("ERROR_SIZE_EXCEED");
                return;
            }
            //检查是否不允许的文件格式
            if(!this.checkType()) {
                this.stateInfo = this.getStateInfo("ERROR_TYPE_NOT_ALLOWED");
                return;
            }

            //创建目录失败
            if(!fs.existsSync($dirname) && !think.mkdir(dirname)) {
                this.stateInfo = this.getStateInfo("ERROR_CREATE_DIR");
                return;
            } else if (!think.isWritable($dirname)) {
                this.stateInfo = this.getStateInfo("ERROR_DIR_NOT_WRITEABLE");
                return;
            }

            //移动文件
            if(!fs.existsSync(this.config.saveDir)) {
                think.mkdir(this.config.saveDir);
            }
            try {
                fs.writeFileSync(this.config.saveDir + this.fullName, imgBuf);
            } catch(e) {
                this.stateInfo = this.getStateInfo("ERROR_FILE_MOVE");
                return;
            }
            this.stateInfo = this.getStateInfo("SUCCESS_FILE_MOVE");
        })
    }
    upBase64() {
        let base64Data = thinkjs.post(this.fileField);
        let imgBuf = new Buffer(base64Data, 'base64');
        this.oriName = this.config.oriName;
        this.fileSize = imgBuf.length;
        this.fileType = this.getFileExt();
        this.fullName = this.getFullName();
        this.filePath = this.getFilePath();
        
        let dirname = path.dirname(this.filePath);
        //检查文件大小是否超出限制
        if(!this.checkSize()) {
            this.stateInfo = this.getStateInfo("ERROR_SIZE_EXCEED");
            return;
        }
        //检查是否不允许的文件格式
        if(!this.checkType()) {
            this.stateInfo = this.getStateInfo("ERROR_TYPE_NOT_ALLOWED");
            return;
        }

        //创建目录失败
        if(!fs.existsSync($dirname) && !think.mkdir(dirname)) {
            this.stateInfo = this.getStateInfo("ERROR_CREATE_DIR");
            return;
        } else if (!think.isWritable($dirname)) {
            this.stateInfo = this.getStateInfo("ERROR_DIR_NOT_WRITEABLE");
            return;
        }

        //移动文件
        if(!fs.existsSync(this.config.saveDir)) {
            think.mkdir(this.config.saveDir);
        }
        try {
            fs.writeFileSync(this.config.saveDir + this.fullName, imgBuf);
        } catch(e) {
            this.stateInfo = this.getStateInfo("ERROR_FILE_MOVE");
            return;
        }
        this.stateInfo = this.getStateInfo("SUCCESS_FILE_MOVE");
    }
    upFile() {
        let file = this.file = this.thinkjs.file(this.fileField);
        if(!file) {
            this.stateInfo = this.getStateInfo("ERROR_FILE_NOT_FOUND");
            return;
        }
        //文件错误时处理,未测试过是否正常使用
        if(!this.file.originalFilename) {
            this.stateInfo = this.getStateInfo("EMPTY_FILE");
            return;
        } else if(!fs.existsSync(file.path)) {
            this.stateInfo = this.getStateInfo("ERROR_TMP_FILE_NOT_FOUND");
            return;
        }
        /*
        else if (!is_uploaded_file($file['tmp_name'])) {
            this.stateInfo = this.getStateInfo("ERROR_TMPFILE");
            return;
        }
        */

        this.oriName = file.originalFilename;
        this.fileSize = file.size;
        this.fileType = this.getFileExt();
        this.fullName = this.getFullName();
        this.filePath = this.getFilePath();
        
        let dirname = path.dirname(this.filePath);
        //检查文件大小是否超出限制
        if(!this.checkSize()) {
            this.stateInfo = this.getStateInfo("ERROR_SIZE_EXCEED");
            return;
        }
        //检查是否不允许的文件格式
        if(!this.checkType()) {
            this.stateInfo = this.getStateInfo("ERROR_TYPE_NOT_ALLOWED");
            return;
        }

        //创建目录失败
        if(!fs.existsSync($dirname) && !think.mkdir(dirname)) {
            this.stateInfo = this.getStateInfo("ERROR_CREATE_DIR");
            return;
        } else if (!think.isWritable($dirname)) {
            this.stateInfo = this.getStateInfo("ERROR_DIR_NOT_WRITEABLE");
            return;
        }

        //移动文件
        let buf = fs.readFileSync(this.file.path);
        if(!fs.existsSync(this.config.saveDir)) {
            think.mkdir(this.config.saveDir);
        }
        try {
            fs.writeFileSync(this.config.saveDir + this.fullName, buf);
        } catch(e) {
            this.stateInfo = this.getStateInfo("ERROR_FILE_MOVE");
            return;
        }
        this.stateInfo = this.getStateInfo("SUCCESS_FILE_MOVE");
    }

    getFileExt() {
        if(!this.file) return this.config.ext;
        let oName = this.file.originalFilename;
        let idx = oName.lastIndexOf(".");
        let ext = idx >= 0 ? oName.substr(idx + 1) : '';
        return (ext || this.config.ext).toLowerCase();
    }

    getFullName() {
        if(!this.file) {
            let oriName = this.config.oriName;
            oriName = oriName.substr(0, oriName.lastIndexOf("."));
            oriName = oriName.replace(/[\|\?\"\<\>\/\*\\\\]+/, "");
            let date = moment().format("YYYY-YY-MM-DD-hh:mm-ss").split("-");
            let format = this.config.pathFormat;
            format = format.replace("{yyyy}", date[0])
                .replace("{yy}", date[1])
                .replace("{mm}", date[2])
                .replace("{dd}", date[3])
                .replace("{hh}", date[4])
                .replace("{ii}", date[5])
                .replace("{ss}", date[6])
                .replace("{time}", Date.now())
                .replace("{filename}", oriName);
            let randNum = Math.random() * 10000000000 + "" + Math.random() * 10000000000;
            let matches;
            if((matches = format.match(/\{rand\:([\d]*)\}/i))) {
                format = format.replace(/\{rand\:[\d]*\}/i, randNum.substr(0, matches[1]));
            }
            return format + "." + this.getFileExt();
        };
        let path = this.file.path;
        let fullName = path.substr(path.lastIndexOf(think.sep) + 1);
        return !think.isEmpty(fullName) ? fullName : "";
    }

    getFilePath() {
        return !this.file ? null : this.file.path;
    }

    getFileName() {
        return this.file ? this.fullName.substr(0, fullName.lastIndexOf(".")) : this.config.fileName;
    }

    getStateInfo(str) {
        return this.stateMap[str] || this.stateMap['ERROR_UNKNOWN'];
    }

    checkSize() {
        return this.fileSize <= this.config.maxSize;
    }

    checkType() {
        if(!this.config.allowFiles) return true;
        let type = Object.prototype.toString.call(this.config.allowFiles)
                    .split(' ')[1].replace("]", "");
        if(type === 'Array') {
            return this.config.allowFiles
                    .indexOf(this.getFileExt()) != -1;
        } else if(type === "String") {
            return this.config.allowFiles.split(",")
                    .indexOf(this.getFileExt()) != -1;
        } else {
            return false;
        }
    }
    /**
     * 上传错误检查
     * @param $errCode
     * @return string
     */
    getStateInfo(errCode)
    {
        return !this.stateMap[errCode] ? this.stateMap["ERROR_UNKNOWN"] : this.stateMap[errCode];
    }

    /**
     * 获取当前上传成功文件的各项信息
     * @return array
     */
    getFileInfo() {
        return {
            "state": this.stateInfo,
            "url": this.fullName,
            "title": this.fileName,
            "original": this.oriName,
            "type": this.fileType,
            "size": this.fileSize
        };
    }
}