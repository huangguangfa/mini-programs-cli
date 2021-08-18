function EditEmitPlugin(options) {}

// emit阶段删除不需要的context和entry属性
EditEmitPlugin.prototype.apply = function (compiler) {
  compiler.hooks.emit.tapAsync("EditEmitPlugin", function (
    compilation,
    callback
  ) {
    let appJson = compilation.assets["app.json"];
    let oAppJson = JSON.parse(appJson.source());
    oAppJson.subPackages = oAppJson.subPackages || [];
    oAppJson.subPackages.forEach(function (item) {
      delete item.context;
      delete item.entry;
    });
    compilation.assets["app.json"] = {
      source: function () {
        return JSON.stringify(oAppJson);
      },
      size: function () {
        return JSON.stringify(oAppJson).length;
      },
    };
    callback();
  });
};

module.exports = EditEmitPlugin;
