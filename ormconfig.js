const dev = process.env.NODE_ENV !== 'production'
const test = process.env.NODE_ENV === 'test'

module.exports = {
  type: 'sqlite',
  database: test ? ':memory:' : process.cwd() + '/db.sqlite3',
  entities: [dev ? 'src/**/*.entity.ts' : 'dist/**/*.entity.js'],
  synchronize: true,
}
