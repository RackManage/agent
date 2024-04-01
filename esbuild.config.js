const esbuild = require('esbuild');
const copy = require('esbuild-plugin-copy').copy;

esbuild.build({
  entryPoints: ['src/index.js'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'build/index.js',
  external: [
    "sqlite3",
  ],
  plugins: [
    copy({
      assets: [
        { from: ['src/service/io.rackmanage.rmagent.plist.tpl'], to: './' },
        { from: ['src/service/rmagent-system.service.tpl'], to: './' },
        { from: ['src/service/rmagent-user.service.tpl'], to: './' },
      ],
    }),
  ],
}).catch(() => process.exit(1));