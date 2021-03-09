'use strict';
require('module-alias/register')
const fs = require('fs');
const path = require('path');

const { config } = require('lin-mizar/lin/config');
/**
 * 初始化并获取配置
 */
function applyConfig () {
  // 获取工作目录
  const baseDir = path.resolve(__dirname, '../');
  config.init(baseDir);
  const files = fs.readdirSync(path.resolve(`${baseDir}/app/config`));

  // 加载 config 目录下的配置文件
  for (const file of files) {
    config.getConfigFromFile(`app/config/${file}`);
  }

  // 加载其它配置文件
  config.getConfigFromFile('app/extension/file/config.js');
}


const run = async () => {
  applyConfig();
  const { createApp } = require('./app');
  const app = await createApp();
  const port = config.getItem('port');
  app.listen(port, () => {
    console.log(`listening at http://localhost:${port}`);
  });
};

// 启动应用
run();
