import { GuleisCCTSLocal } from './src/guleisCCTSLocal';

if (process.argv[2])
{
  new GuleisCCTSLocal(process.argv[2]).compile();
}