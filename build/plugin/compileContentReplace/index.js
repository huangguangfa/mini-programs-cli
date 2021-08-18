
/** 
 * @Author: gf
 * @Desc: webpack打包后的内容替换
 * @Date: 2021-05-7
 * @param {
 *   rules：[
 *      {
 *        fileName:'xxxx.js',   打包后的文件名称后缀也需要
 *        regexp:xxxxxxxxxxx,   内容匹配的正则表达式 比如 /aaaa/g 匹配aaaa 替换成xxx
 *        replacement: 'xxxx'   替换的内容  
 *      }
 *  ]
 * }
 */

class CompileContentReplace {
    constructor( options = [] ){
        const { rules = [] } = options;
        this.rules = rules;
        this.options = options;
    }
    apply( compiler ){ 
        compiler.plugin( "emit", ( compilation, callback ) => {
            for( let i = 0; i < this.rules.length; i++ ){
                let { fileName, regexp, replacement } = this.rules[ i ];
                const asset = compilation.assets[ fileName ];
                const fileContent = asset && asset.source().replace( regexp,replacement );
                if( fileContent ){
                    compilation.assets[ fileName ] = {
                        // 返回文件内容
                        source: () => { return fileContent },
                        // 返回文件大小
                        size: () => {  return Buffer.byteLength( fileContent, 'utf8' ) }
                    };
                }
                
            }
            callback()
        })
    }
}

module.exports = CompileContentReplace;