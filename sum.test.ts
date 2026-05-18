import { sum } from "./sum";
import { expect, test} from '@jest/globals';
test('add one with two',()=>{
    expect(sum(1,2)).toBe(3)
})