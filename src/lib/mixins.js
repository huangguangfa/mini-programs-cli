if (!Object.entries) {
  Object.entries = function(obj) {
    var ownProps = Object.keys(obj),
      i = ownProps.length,
      resArray = new Array(i); // preallocate the Array
    while (i--) resArray[i] = [ownProps[i], obj[ownProps[i]]];

    return resArray;
  };
}

const nativePage = Page
  Page = options => {
    const mixins = options.mixins
    if (Array.isArray(mixins)) {
      Reflect.deleteProperty(options, 'mixins')
      
      options = merge(mixins, options);             //重新定义options
      merge(mixins, options)
    }
    nativePage(options)
  }

  // 原生Page属性
  const properties = ['data', 'onLoad', 'onReady', 'onShow', 'onHide', 'onUnload', 'onPullDownRefresh', 'onReachBottom', 'onShareAppMessage', 'onPageScroll', 'onTabItemTap']

  // 合并mixins属性到Page的options中
  function merge(mixins, options) {
    mixins.reverse().forEach(mixin => {
      if (Object.prototype.toString.call(mixin).slice(8, -1) === 'Object') {
        for (let [key, value] of Object.entries(mixin)) {
          if (key === 'data') {
            options.data = Object.assign({}, value, options.data)
          } else if (properties.indexOf(key) > -1) {
            let native = options[key]
            options[key] = function (...args) {
              value.call(this, ...args)
              return native && native.call(this, ...args)
            }
          } else {
            options = Object.assign({}, mixin, options)
          }
        }
      }
    })
    return options;
  }