const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: config => {
    config.module.rule('').test(/\.fbx$/)
        .use('file-loader')
  }
})
