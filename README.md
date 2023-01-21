# EventScript

Bubbly data. This is an experiment with DOM-like bubbling of data-types. For example,
similar to how a input will bubble events to its form, changes to a number
bubbles to its parent array.

```js
import { ESArray, ESNumber } from 'eventscript/nodes';

const one = new ESNumber(1);
const two = new ESNumber(2);
const three = new ESNumber(3);

const numbers = new ESArray([one, two, three]);
const length = numbers.length;

let numberCount = 0;
numbers.subscribe(() => console.log(`numberCount === ${++numberCount}`));
// numberCount === 1

let lengthCount = 0;
length.subscribe(() => console.log(`lengthCount === ${++lengthCount}`));
// lengthCount === 1

one.set(100);
// numberCount === 2
// lengthCount === 1 (nothing logged)

numbers.push(new ESNumber(4));
// lengthCount === 2
// numberCount === 3

```

## Installation
```
npm install eventscript
```