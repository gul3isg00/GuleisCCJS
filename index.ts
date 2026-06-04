import { GuleisCCJS } from './src/compiler';

if (process.argv[2]) {
  new GuleisCCJS(process.argv[2]).compile();
}