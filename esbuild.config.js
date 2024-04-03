const esbuild = require('esbuild');
const copy = require('esbuild-plugin-copy').copy;

esbuild.build({
  banner: {js: '/* Rack Manage CLI */'},
  bundle: true,
  entryPoints: ['src/index.js'],
  minify: true,
  platform: 'node',
  target: 'node18',
  treeShaking: true,
  outfile: 'build/index.js',
  external: [
    "sqlite3",
    "keytar"
  ],
  plugins: [
    copy({
      assets: [
        { from: ['src/service/macos/io.rackmanage.rmagent.plist.tpl'], to: './' },
        { from: ['src/service/linux/rmagent-system.service.tpl'], to: './' },
        { from: ['src/service/linux/rmagent-user.service.tpl'], to: './' },
        { from: ['src/service/windows/rmservice.xml'], to: './' },
        { from: ['src/service/windows/rmservice.exe'], to: './'}
      ],
    }),
  ],
}).catch(() => process.exit(1));