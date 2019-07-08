const dev = process.env.NODE_ENV !== 'production'

module.exports = {
  type: 'sqlite',
  database: process.cwd() + '/db.sqlite3',
  entities: [dev ? 'src/**/*.entity.ts' : 'dist/**/*.entity.js'],
  synchronize: true,
}
