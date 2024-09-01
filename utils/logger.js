import fs from "fs/promises"

export function error_log(msg){
    log(msg, 'error')    
}

export function success_log(msg){
    log(msg, 'success')    
}

function log(msg, type){
    
    const date     = new Date()
    const day      = String(date.getDate()).padStart(2, '0');
    const month    = String(date.getMonth() + 1).padStart(2, '0');
    const year     = date.getFullYear();
    const hours    = String(date.getHours()).padStart(2, '0');
    const minutes  = String(date.getMinutes()).padStart(2, '0');
    const seconds  = String(date.getSeconds()).padStart(2, '0');
    const datetime = `[${day}-${month}-${year} ${hours}:${minutes}:${seconds}]`;
    
    switch (type) {

        case 'success':
                fs.appendFile('success.log', `${datetime} ${msg}\n`)
            break;

        case 'error':
                fs.appendFile('error.log', `${datetime} ${msg}\n`)
            break;
    }
    

}